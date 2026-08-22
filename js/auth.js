/**
 * ============================================
 * CODE FORGE - Authentication Manager
 * ============================================
 * Firebase Auth, Google OAuth, reCAPTCHA v3, Promo Codes
 * 
 * Fixes in v1.1.0:
 * - Firebase SDK loaded exactly once (no duplicate script injection)
 * - Google provider id normalized ("google.com" -> "google") so
 *   Gemini correctly unlocks for Google-signed-in users
 * - Safe handling of accounts without an email address
 * - Google sign-in falls back to redirect when popups are blocked
 * - reCAPTCHA v3 executed via grecaptcha.ready() and de-duplicated
 * - Promo codes: normalized, per-user single-use tracking, usage log
 * - Tier-based AI access: Guest=ChatGPT, Google=ChatGPT+Gemini, VIP=All
 * - Demo user registry + activity log feed the admin panel
 */

// Firebase globals (initialized once)
const firebaseConfig = CONFIG.AUTH.FIREBASE;
let firebaseApp = null;
let firebaseAuth = null;
let googleProvider = null;

/**
 * Load a script once. Returns a promise that resolves when loaded.
 * Skips requests for scripts that are already present/loaded.
 */
const ScriptLoader = {
    loaded: new Set(),
    
    load(src) {
        if (this.loaded.has(src)) return Promise.resolve();
        if (document.querySelector(`script[src="${src}"]`)) {
            this.loaded.add(src);
            return Promise.resolve();
        }
        this.loaded.add(src);
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => { this.loaded.delete(src); reject(new Error(`Failed to load ${src}`)); };
            document.head.appendChild(script);
        });
    }
};

// Initialize Firebase (idempotent - safe to call multiple times)
function initializeFirebase() {
    if (firebaseApp) return true;
    
    if (typeof firebase === 'undefined' || typeof firebase.initializeApp !== 'function') {
        console.info('[Auth] Firebase SDK not available - running in demo mode.');
        return false;
    }
    
    try {
        firebaseApp = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
        firebaseAuth = firebase.auth();
        googleProvider = new firebase.auth.GoogleAuthProvider();
        googleProvider.addScope('email');
        googleProvider.addScope('profile');
        googleProvider.addScope('openid');
        googleProvider.setCustomParameters({ prompt: 'select_account' });
        
        // Handle result of a redirect-based Google sign-in (popup blocked fallback)
        if (firebaseAuth.getRedirectResult) {
            firebaseAuth.getRedirectResult().catch((e) => {
                if (e && e.code !== 'auth/no-auth-event') {
                    console.warn('Google redirect result error:', e.message);
                }
            });
        }
        return true;
    } catch (error) {
        console.error('Firebase initialization error:', error);
        return false;
    }
}

/**
 * Execute reCAPTCHA v3 for an action.
 * Waits for grecaptcha.ready, never throws - returns null on failure
 * so the auth flow can proceed (demo mode) instead of dead-ending.
 */
function executeRecaptcha(action) {
    return new Promise((resolve) => {
        if (!CONFIG.AUTH.RECAPTCHA.CONFIGURED || typeof grecaptcha === 'undefined' || !grecaptcha.execute) {
            resolve(null);
            return;
        }
        try {
            grecaptcha.ready(async () => {
                try {
                    const token = await grecaptcha.execute(CONFIG.AUTH.RECAPTCHA.SITE_KEY, { action });
                    resolve(token);
                } catch (err) {
                    console.warn(`reCAPTCHA execute failed (${action}):`, err.message);
                    resolve(null);
                }
            });
        } catch (err) {
            console.warn(`reCAPTCHA error (${action}):`, err.message);
            resolve(null);
        }
    });
}

// Normalize Firebase provider ids to our internal ids
function normalizeProvider(firebaseUser) {
    const raw = firebaseUser.providerData && firebaseUser.providerData[0]
        ? firebaseUser.providerData[0].providerId
        : (firebaseUser.providerId || 'password');
    if (raw === 'google.com') return 'google';
    if (raw === 'password') return 'email';
    return raw;
}

const AuthManager = {
    // Current user state
    user: null,
    
    // Initialize
    init() {
        // Firebase SDK is loaded via <script> tags in index.html; only
        // fetch it dynamically if it is somehow missing (offline preview etc.)
        const needsFirebase = typeof firebase === 'undefined';
        const ready = () => {
            initializeFirebase();
            this.loadSession();
            this.bindEvents();
            this.updateUI();
            this.setupFirebaseAuthListener();
        };
        
        if (needsFirebase) {
            Promise.all([
                ScriptLoader.load('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js'),
                ScriptLoader.load('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js')
            ]).then(ready).catch(() => {
                console.warn('[Auth] Could not load Firebase SDK - demo mode only.');
                ready();
            });
        } else {
            ready();
        }
        
        // reCAPTCHA v3 is loaded once in <head>; ensure it exists (no duplicates)
        if (CONFIG.AUTH.RECAPTCHA.CONFIGURED && !document.querySelector(`script[src*="recaptcha/api.js"]`)) {
            ScriptLoader.load(`https://www.google.com/recaptcha/api.js?render=${CONFIG.AUTH.RECAPTCHA.SITE_KEY}`);
        }
    },
    
    // Setup Firebase auth state listener
    setupFirebaseAuthListener() {
        if (!firebaseAuth) return;
        
        firebaseAuth.onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
                const provider = normalizeProvider(firebaseUser);
                const email = firebaseUser.email || '';
                const userData = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || (email ? email.split('@')[0] : 'Coder'),
                    email: email || 'no-email@local',
                    avatar: firebaseUser.photoURL,
                    token: firebaseUser.refreshToken || `fb_${Date.now()}`,
                    provider: provider,
                    subscription: this.getUserSubscription(firebaseUser.uid).subscription,
                    vipActive: this.getUserSubscription(firebaseUser.uid).vipActive,
                    isAdmin: this.getUserSubscription(firebaseUser.uid).isAdmin,
                    createdAt: firebaseUser.metadata.creationTime || new Date().toISOString()
                };
                this.saveSession(userData);
                this.registerUser(userData);
                this.logActivity(provider === 'google' ? 'google-login' : 'login', `${userData.name} signed in`);
                this.updateUI();
            } else {
                // Only clear if we previously had a Firebase-backed session
                // (protects demo-mode sessions from being wiped on load)
                if (this.user && !String(this.user.token || '').startsWith('demo_token')) {
                    this.user = null;
                    localStorage.removeItem(CONFIG.AUTH.SESSION_KEY);
                    this.updateUI();
                }
            }
            this.dispatchAuthChanged();
        });
    },
    
    // ---------- Demo backend helpers (localStorage) ----------
    
    // Read subscription record for a uid (returns {subscription, vipActive, isAdmin})
    getSubRecord(uid) {
        try {
            const raw = localStorage.getItem(`codeforge_sub_${uid}`);
            if (raw) {
                const sub = JSON.parse(raw);
                return {
                    subscription: sub.subscription || 'free',
                    vipActive: sub.vipActive === true,
                    isAdmin: sub.isAdmin === true
                };
            }
        } catch (e) {
            console.warn('Error reading subscription:', e);
        }
        return { subscription: 'free', vipActive: false, isAdmin: false };
    },
    
    // Get user subscription plan name from localStorage
    getUserSubscription(uid) {
        return this.getSubRecord(uid).subscription;
    },
    
    // Check if user is VIP
    isUserVIP(uid) {
        return this.getSubRecord(uid).vipActive;
    },
    
    // Check if user is admin
    isUserAdmin(uid) {
        return this.getSubRecord(uid).isAdmin;
    },
    
    // Register/update user in the demo user registry (used by admin panel)
    registerUser(userData) {
        try {
            const registry = JSON.parse(localStorage.getItem(CONFIG.APP.USER_REGISTRY_KEY) || '{}');
            const existing = registry[userData.id] || {};
            registry[userData.id] = {
                ...existing,
                id: userData.id,
                name: userData.name,
                email: userData.email,
                provider: userData.provider,
                avatar: userData.avatar || null,
                subscription: this.getSubRecord(userData.id).subscription,
                vipActive: this.getSubRecord(userData.id).vipActive,
                isAdmin: this.getSubRecord(userData.id).isAdmin,
                createdAt: existing.createdAt || userData.createdAt || new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };
            localStorage.setItem(CONFIG.APP.USER_REGISTRY_KEY, JSON.stringify(registry));
        } catch (e) {
            console.warn('Error registering user:', e);
        }
    },
    
    // Append an event to the activity log (newest first)
    logActivity(event, detail) {
        try {
            const log = JSON.parse(localStorage.getItem(CONFIG.APP.ACTIVITY_LOG_KEY) || '[]');
            log.unshift({ time: new Date().toISOString(), event, detail });
            localStorage.setItem(CONFIG.APP.ACTIVITY_LOG_KEY, JSON.stringify(log.slice(0, CONFIG.APP.MAX_ACTIVITY_LOG)));
        } catch (e) { /* non-critical */ }
    },
    
    // Notify other modules that auth state changed
    dispatchAuthChanged() {
        document.dispatchEvent(new CustomEvent('authChanged', { detail: { user: this.user } }));
    },
    
    // ---------- Session handling ----------
    
    // Load session from storage
    loadSession() {
        try {
            const sessionData = localStorage.getItem(CONFIG.AUTH.SESSION_KEY);
            if (sessionData) {
                const session = JSON.parse(sessionData);
                if (session && session.token) {
                    if (session.expiresAt && Date.now() > session.expiresAt) {
                        this.clearSession();
                        return;
                    }
                    this.user = session;
                    this.registerUser(session);
                }
            }
        } catch (e) {
            console.warn('Error loading session:', e);
            this.clearSession();
        }
    },
    
    // Save session to storage
    saveSession(userData) {
        const sub = this.getSubRecord(userData.id);
        const session = {
            ...userData,
            subscription: userData.subscription || sub.subscription,
            vipActive: userData.vipActive !== undefined ? userData.vipActive : sub.vipActive,
            isAdmin: userData.isAdmin !== undefined ? userData.isAdmin : sub.isAdmin,
            expiresAt: Date.now() + CONFIG.AUTH.SESSION_DURATION
        };
        this.user = session;
        localStorage.setItem(CONFIG.AUTH.SESSION_KEY, JSON.stringify(session));
        
        // Persist subscription flags separately (survives session expiry)
        const subData = {
            subscription: session.subscription || 'free',
            vipActive: session.vipActive === true,
            isAdmin: session.isAdmin === true,
            activatedAt: session.vipActive ? (this.getSubRecord(userData.id).activatedAt || new Date().toISOString()) : null,
            activatedCode: session.vipActive ? (this.getSubRecord(userData.id).activatedCode || null) : null
        };
        localStorage.setItem(`codeforge_sub_${userData.id}`, JSON.stringify(subData));
    },
    
    // Clear session
    clearSession() {
        const wasLoggedIn = !!this.user;
        const name = this.user?.name;
        this.user = null;
        localStorage.removeItem(CONFIG.AUTH.SESSION_KEY);
        
        // Sign out of Firebase too (local signOut only - never call this
        // from the onAuthStateChanged(null) path to avoid loops)
        if (firebaseAuth && firebaseAuth.currentUser) {
            firebaseAuth.signOut().catch(e => console.warn('Firebase signout error:', e));
        }
        if (wasLoggedIn) {
            this.logActivity('logout', `${name || 'User'} signed out`);
        }
    },
    
    // ---------- Access checks ----------
    
    // Check if user is logged in
    isLoggedIn() {
        return this.user !== null && !!this.user.token;
    },
    
    // Check if user is VIP
    isVIP() {
        return this.isLoggedIn() &&
               (this.user.subscription === 'vip' || this.user.vipActive === true);
    },
    
    // Check if user is admin
    isAdmin() {
        return this.isLoggedIn() && this.user.isAdmin === true;
    },
    
    // Check if user authenticated with Google (Firebase normalizes to 'google')
    isGoogleAuthenticated() {
        return this.isLoggedIn() && this.user.provider === 'google';
    },
    
    /**
     * Get the current AI access tier.
     * Guest -> Guest tier (ChatGPT)
     * Email member -> Member tier (ChatGPT)
     * Google user -> Google tier (ChatGPT + Gemini)
     * VIP -> VIP tier (all); Admin -> Admin tier (all)
     */
    getAccessTier() {
        if (this.isAdmin()) return CONFIG.AI_ACCESS.TIERS.ADMIN;
        if (this.isVIP()) return CONFIG.AI_ACCESS.TIERS.VIP;
        if (this.isGoogleAuthenticated()) return CONFIG.AI_ACCESS.TIERS.GOOGLE;
        if (this.isLoggedIn()) return CONFIG.AI_ACCESS.TIERS.MEMBER;
        return CONFIG.AI_ACCESS.TIERS.GUEST;
    },
    
    // Get user display name
    getDisplayName() {
        if (!this.isLoggedIn()) return 'Guest';
        return this.user.name || 'User';
    },
    
    // ---------- Auth flows ----------
    
    // Login with email/password
    async login(email, password, recaptchaToken = null) {
        try {
            showLoading();
            
            if (!email || !password) {
                throw new Error('Please fill in all fields');
            }
            
            // reCAPTCHA best-effort: token verifies server-side in production;
            // a failed captcha must not lock users out of demo mode.
            if (!recaptchaToken) {
                console.warn('Login proceeding without reCAPTCHA token (demo mode).');
            }
            
            if (firebaseAuth) {
                await firebaseAuth.signInWithEmailAndPassword(email, password);
                // onAuthStateChanged listener completes the flow
            } else {
                // Fallback to demo mode
                await new Promise(resolve => setTimeout(resolve, 800));
                const mockUser = {
                    id: 'user_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12),
                    name: email.split('@')[0],
                    email: email,
                    avatar: null,
                    token: 'demo_token_' + Date.now(),
                    provider: 'email',
                    subscription: 'free',
                    vipActive: false,
                    isAdmin: false,
                    createdAt: new Date().toISOString()
                };
                this.saveSession(mockUser);
                this.registerUser(mockUser);
                this.logActivity('login', `${mockUser.name} signed in (demo)`);
                this.updateUI();
                this.dispatchAuthChanged();
                showToast('success', 'Login Successful', `Welcome back, ${mockUser.name}!`);
                navigateTo('dashboard');
            }
            
            hideLoading();
            return true;
        } catch (error) {
            hideLoading();
            let errorMessage = error.message || CONFIG.ERRORS.INVALID_CREDENTIALS;
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' ||
                error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials') {
                errorMessage = CONFIG.ERRORS.INVALID_CREDENTIALS;
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = CONFIG.ERRORS.EMAIL_REQUIRED;
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Too many attempts. Please try again later.';
            }
            showToast('error', 'Login Failed', errorMessage);
            return false;
        }
    },
    
    // Signup
    async signup(name, email, password, recaptchaToken = null) {
        try {
            showLoading();
            
            if (!name || !email || !password) {
                throw new Error('Please fill in all fields');
            }
            
            if (password.length < 6) {
                throw new Error(CONFIG.ERRORS.PASSWORD_MIN_LENGTH);
            }
            
            // reCAPTCHA best-effort (see login)
            if (!recaptchaToken) {
                console.warn('Signup proceeding without reCAPTCHA token (demo mode).');
            }
            
            if (firebaseAuth) {
                const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
                await userCredential.user.updateProfile({ displayName: name });
            } else {
                // Fallback to demo mode
                await new Promise(resolve => setTimeout(resolve, 800));
                const mockUser = {
                    id: 'user_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12),
                    name: name,
                    email: email,
                    avatar: null,
                    token: 'demo_token_' + Date.now(),
                    provider: 'email',
                    subscription: 'free',
                    vipActive: false,
                    isAdmin: false,
                    createdAt: new Date().toISOString()
                };
                this.saveSession(mockUser);
                this.registerUser(mockUser);
                this.logActivity('signup', `${name} created an account (demo)`);
                this.updateUI();
                this.dispatchAuthChanged();
                showToast('success', 'Account Created', `Welcome to Code Forge, ${name}!`);
                navigateTo('dashboard');
            }
            
            hideLoading();
            return true;
        } catch (error) {
            hideLoading();
            let errorMessage = error.message;
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Email address is already in use';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = CONFIG.ERRORS.EMAIL_REQUIRED;
            } else if (error.code === 'auth/weak-password') {
                errorMessage = CONFIG.ERRORS.PASSWORD_MIN_LENGTH;
            }
            showToast('error', 'Signup Failed', errorMessage);
            return false;
        }
    },
    
    // Google Sign-In (popup with redirect fallback)
    async googleSignIn() {
        try {
            showLoading();
            
            if (firebaseAuth && googleProvider) {
                try {
                    await firebaseAuth.signInWithPopup(googleProvider);
                    // onAuthStateChanged listener completes the flow
                } catch (popupError) {
                    // Fall back to full-page redirect when popup is blocked/unavailable
                    if (['auth/popup-blocked', 'auth/popup-closed-by-user', 'auth/cancelled-popup-request',
                         'auth/popup-window-disallowed', 'auth/operation-not-supported-in-this-environment'].includes(popupError.code)) {
                        showToast('info', 'Redirecting…', 'Continuing Google sign-in in a new page.');
                        await firebaseAuth.signInWithRedirect(googleProvider);
                        return true;
                    }
                    throw popupError;
                }
            } else {
                // Fallback to demo mode
                await new Promise(resolve => setTimeout(resolve, 1200));
                const mockGoogleUser = {
                    id: 'google_user_' + Date.now(),
                    name: 'Google User',
                    email: 'user@gmail.com',
                    avatar: null,
                    token: 'demo_token_' + Date.now(),
                    provider: 'google',
                    subscription: 'free',
                    vipActive: false,
                    isAdmin: false,
                    createdAt: new Date().toISOString()
                };
                this.saveSession(mockGoogleUser);
                this.registerUser(mockGoogleUser);
                this.logActivity('google-login', 'Google User signed in (demo) - Gemini unlocked');
                this.updateUI();
                this.dispatchAuthChanged();
                showToast('success', 'Google Sign-In Success', 'ChatGPT + Gemini are now unlocked!');
                if (typeof navigateTo === 'function') {
                    navigateTo('ai-assistant');
                }
            }
            
            hideLoading();
            return true;
        } catch (error) {
            hideLoading();
            let errorMessage = error.message;
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Google sign-in was cancelled';
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage = 'Popup was blocked. Please allow popups for this site.';
            } else if (error.code === 'auth/unauthorized-domain') {
                errorMessage = 'This domain is not authorized in Firebase. Add it in Firebase Console → Auth → Settings.';
            } else if (error.code === 'auth/operation-not-allowed') {
                errorMessage = 'Google sign-in is disabled. Enable it in Firebase Console → Authentication → Sign-in method.';
            }
            showToast('error', 'Authentication Failed', errorMessage);
            return false;
        }
    },
    
    // ---------- Promo codes ----------
    
    // Read promo usage map: { CODE: { count, users: [], lastUsed, disabled } }
    getPromoUsage() {
        try {
            return JSON.parse(localStorage.getItem(CONFIG.APP.PROMO_USAGE_KEY) || '{}');
        } catch (e) {
            return {};
        }
    },
    
    savePromoUsage(usage) {
        localStorage.setItem(CONFIG.APP.PROMO_USAGE_KEY, JSON.stringify(usage));
    },
    
    // Is this code disabled by an admin?
    isPromoCodeDisabled(code) {
        const usage = this.getPromoUsage();
        return !!(usage[code] && usage[code].disabled);
    },
    
    // Activate VIP with promo code (normalized; once per user per code)
    async activatePromoCode(rawCode) {
        try {
            showLoading();
            
            const promoCode = String(rawCode || '').trim().toUpperCase();
            
            if (!promoCode) {
                throw new Error(CONFIG.ERRORS.INVALID_PROMO_CODE);
            }
            
            if (!this.isLoggedIn()) {
                throw new Error('Please login first to activate promo code');
            }
            
            if (this.isVIP()) {
                showToast('info', 'Already VIP', 'You already have VIP access!');
                hideLoading();
                return false;
            }
            
            if (this.isPromoCodeDisabled(promoCode)) {
                throw new Error('This promo code has been disabled.');
            }
            
            // Valid code? (built-in list, admin code, or admin-generated codes)
            const usage = this.getPromoUsage();
            const validCodes = CONFIG.PAYMENT.PROMO_CODES;
            const adminCode = CONFIG.PAYMENT.ADMIN_PROMO_CODE;
            const isAdmin = promoCode === adminCode;
            const isValid = isAdmin || validCodes.includes(promoCode) || (usage[promoCode] && usage[promoCode].generated);
            
            if (!isValid) {
                throw new Error(CONFIG.ERRORS.INVALID_PROMO_CODE);
            }
            
            // Enforce single use per user per code
            const record = usage[promoCode] || { count: 0, users: [], generated: false };
            if (record.users && record.users.includes(this.user.id)) {
                throw new Error(CONFIG.ERRORS.CODE_ALREADY_USED);
            }
            
            // Update user session
            this.user.subscription = 'vip';
            this.user.vipActive = true;
            this.user.isAdmin = isAdmin;
            this.saveSession(this.user);
            this.registerUser(this.user);
            
            // Track redemption
            record.count = (record.count || 0) + 1;
            record.users = record.users || [];
            record.users.push(this.user.id);
            record.lastUsed = new Date().toISOString();
            usage[promoCode] = record;
            this.savePromoUsage(usage);
            
            this.logActivity(isAdmin ? 'admin-activated' : 'promo',
                `${this.user.name} activated ${isAdmin ? 'ADMIN' : 'VIP'} with code ${promoCode.slice(0, 5)}…`);
            
            this.updateUI();
            this.dispatchAuthChanged();
            
            if (isAdmin) {
                showToast('success', 'Admin Mode Activated', CONFIG.SUCCESS.ADMIN_MODE_ACTIVATED);
            } else {
                showToast('success', 'VIP Activated', CONFIG.SUCCESS.PROMO_CODE_ACTIVATED);
            }
            
            hideLoading();
            return true;
        } catch (error) {
            hideLoading();
            showToast('error', 'Activation Failed', error.message);
            return false;
        }
    },
    
    // Logout
    logout() {
        this.clearSession();
        this.updateUI();
        this.dispatchAuthChanged();
        
        if (typeof navigateTo === 'function') {
            navigateTo('home');
        }
        
        showToast('success', 'Logged Out', CONFIG.SUCCESS.LOGOUT_SUCCESS);
    },
    
    // ---------- UI updates ----------
    
    // Update UI based on auth state
    updateUI() {
        const accountName = document.getElementById('account-name');
        const dropdownUsername = document.getElementById('dropdown-username');
        const dropdownStatus = document.getElementById('dropdown-status');
        const dashboardMenu = document.getElementById('menu-dashboard');
        const loginMenuBtn = document.getElementById('login-menu-btn');
        const logoutMenuBtn = document.getElementById('logout-menu-btn');
        const dashUsername = document.getElementById('dash-username');
        const accountStatusBadge = document.getElementById('account-status-badge');
        const adminMenuBtn = document.getElementById('menu-admin');
        
        if (this.isLoggedIn()) {
            const displayName = this.getDisplayName();
            const tier = this.getAccessTier();
            
            if (accountName) accountName.textContent = displayName;
            if (dropdownUsername) dropdownUsername.textContent = displayName;
            if (dropdownStatus) {
                if (this.isAdmin()) {
                    dropdownStatus.textContent = 'Admin';
                    dropdownStatus.style.color = '#ef4444';
                } else if (this.isVIP()) {
                    dropdownStatus.textContent = 'VIP Member';
                    dropdownStatus.style.color = '#f59e0b';
                } else if (this.isGoogleAuthenticated()) {
                    dropdownStatus.textContent = 'Google Account · Gemini unlocked';
                    dropdownStatus.style.color = '#34a853';
                } else {
                    dropdownStatus.textContent = 'Logged in';
                    dropdownStatus.style.color = '';
                }
            }
            if (dashboardMenu) dashboardMenu.style.display = 'flex';
            if (loginMenuBtn) loginMenuBtn.style.display = 'none';
            if (logoutMenuBtn) logoutMenuBtn.style.display = 'flex';
            if (adminMenuBtn) adminMenuBtn.style.display = this.isAdmin() ? 'flex' : 'none';
            if (dashUsername) dashUsername.textContent = displayName;
            if (accountStatusBadge) {
                accountStatusBadge.classList.remove('vip', 'admin', 'google');
                if (this.isAdmin()) {
                    accountStatusBadge.textContent = 'Admin';
                    accountStatusBadge.classList.add('admin');
                } else if (this.isVIP()) {
                    accountStatusBadge.textContent = 'VIP Member';
                    accountStatusBadge.classList.add('vip');
                } else if (this.isGoogleAuthenticated()) {
                    accountStatusBadge.textContent = 'Google Account';
                    accountStatusBadge.classList.add('google');
                } else {
                    accountStatusBadge.textContent = 'Free User';
                }
            }
        } else {
            if (accountName) accountName.textContent = 'Guest';
            if (dropdownUsername) dropdownUsername.textContent = 'Guest User';
            if (dropdownStatus) {
                dropdownStatus.textContent = 'Not logged in';
                dropdownStatus.style.color = '';
            }
            if (dashboardMenu) dashboardMenu.style.display = 'none';
            if (adminMenuBtn) adminMenuBtn.style.display = 'none';
            if (loginMenuBtn) loginMenuBtn.style.display = 'flex';
            if (logoutMenuBtn) logoutMenuBtn.style.display = 'none';
            if (accountStatusBadge) {
                accountStatusBadge.textContent = 'Guest';
                accountStatusBadge.classList.remove('vip', 'admin', 'google');
            }
        }
        
        // Update AI provider access indicators + tier displays + admin UI
        this.updateProviderAccess();
        this.updateTierBadges();
        this.updateVIPDisplays();
        this.updateAdminUI();
    },
    
    // Update the tier badge shown on the AI assistant page
    updateTierBadges(tier) {
        tier = tier || this.getAccessTier();
        const tierNameEl = document.getElementById('ai-tier-name');
        const tierDescEl = document.getElementById('ai-tier-desc');
        if (tierNameEl) tierNameEl.textContent = tier.name;
        if (tierDescEl) tierDescEl.textContent = tier.description;
        
        const badge = document.getElementById('ai-tier-badge');
        if (badge) {
            badge.classList.remove('tier-guest', 'tier-member', 'tier-google', 'tier-vip', 'tier-admin');
            badge.classList.add(`tier-${tier.id}`);
        }
    },
    
    // Update admin-specific UI elements
    updateAdminUI() {
        const adminElements = document.querySelectorAll('.admin-only');
        const isAdmin = this.isAdmin();
        adminElements.forEach(el => {
            el.style.display = isAdmin ? '' : 'none';
        });
        document.body.classList.toggle('is-admin', isAdmin);
    },
    
    // Update AI provider access states (tier-based)
    updateProviderAccess() {
        const tier = this.getAccessTier();
        const allowed = tier.providers;
        
        const statusMap = {
            chatgpt: { el: '#provider-chatgpt .provider-status' },
            gemini: { el: '#provider-gemini .provider-status' },
            claude: { el: '#provider-claude .provider-status' }
        };
        
        Object.entries(statusMap).forEach(([providerId, { el }]) => {
            const statusEl = document.querySelector(el);
            const btn = document.getElementById(`provider-${providerId}`);
            if (!statusEl || !btn) return;
            
            const unlocked = allowed.includes(providerId);
            btn.classList.toggle('locked', !unlocked);
            btn.querySelector('.provider-lock')?.classList.toggle('hidden', unlocked);
            
            if (unlocked) {
                statusEl.className = 'provider-status available';
                statusEl.textContent = 'Available';
            } else if (providerId === 'gemini') {
                statusEl.className = 'provider-status needs-auth';
                statusEl.textContent = this.isLoggedIn() ? 'Google Sign-in / VIP' : 'Google Sign-in / VIP';
            } else if (providerId === 'claude') {
                statusEl.className = 'provider-status vip-only';
                statusEl.textContent = this.isLoggedIn() ? 'Upgrade Required' : 'VIP Only';
            }
        });
    },
    
    // Update VIP-related displays
    updateVIPDisplays() {
        const planBadge = document.getElementById('dash-plan-badge');
        const accountBadge = document.getElementById('account-status-badge');
        const currentPlanName = document.getElementById('current-plan-name');
        const subPlanName = document.getElementById('sub-plan-name');
        const subActions = document.getElementById('sub-actions');
        
        if (this.isAdmin()) {
            if (planBadge) {
                planBadge.innerHTML = '<i class="fas fa-shield-alt"></i> Admin';
                planBadge.classList.add('admin');
                planBadge.classList.remove('vip');
            }
            if (accountBadge) {
                accountBadge.textContent = 'Admin';
                accountBadge.classList.add('admin');
                accountBadge.classList.remove('vip');
            }
            if (currentPlanName) currentPlanName.textContent = 'Admin Plan (All Access)';
            if (subPlanName) subPlanName.textContent = 'Admin Plan';
            if (subActions) subActions.innerHTML = '<button class="btn btn-outline" disabled>Full Access</button>';
        } else if (this.isVIP()) {
            if (planBadge) {
                planBadge.innerHTML = '<i class="fas fa-crown"></i> VIP Member';
                planBadge.classList.add('vip');
                planBadge.classList.remove('admin');
            }
            if (accountBadge) {
                accountBadge.textContent = 'VIP Member';
                accountBadge.classList.add('vip');
                accountBadge.classList.remove('admin');
            }
            if (currentPlanName) currentPlanName.textContent = 'VIP Plan (Promo Code)';
            if (subPlanName) subPlanName.textContent = 'VIP Plan';
            if (subActions) subActions.innerHTML = '<button class="btn btn-outline" disabled>Active Subscription</button>';
        } else {
            if (planBadge) {
                planBadge.innerHTML = '<i class="fas fa-user"></i> Free Plan';
                planBadge.classList.remove('vip', 'admin');
            }
            if (accountBadge) {
                accountBadge.textContent = this.isLoggedIn() ? 'Free User' : 'Guest';
                accountBadge.classList.remove('vip', 'admin');
            }
            if (currentPlanName) currentPlanName.textContent = 'Free Plan';
            if (subPlanName) subPlanName.textContent = 'Free Plan';
            if (subActions) subActions.innerHTML = '<button class="btn btn-vip" data-page="vip">Upgrade to VIP</button>';
        }
    },
    
    // Bind event listeners
    bindEvents() {
        // Logout button
        document.querySelectorAll('#logout-menu-btn').forEach(btn => {
            btn.addEventListener('click', () => this.logout());
        });
        
        // Login menu button
        document.getElementById('login-menu-btn')?.addEventListener('click', () => {
            closeAllDropdowns();
            navigateTo('auth');
        });
        
        // Admin panel menu button
        document.getElementById('menu-admin')?.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllDropdowns();
            navigateTo('admin');
        });
        
        // Login form
        document.getElementById('login-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email')?.value?.trim();
            const password = document.getElementById('login-password')?.value;
            
            const recaptchaToken = await executeRecaptcha('login');
            this.login(email, password, recaptchaToken);
        });
        
        // Signup form
        document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name')?.value?.trim();
            const email = document.getElementById('signup-email')?.value?.trim();
            const password = document.getElementById('signup-password')?.value;
            const confirm = document.getElementById('signup-confirm')?.value;
            
            if (confirm !== undefined && password !== confirm) {
                showToast('error', 'Signup Failed', CONFIG.ERRORS.PASSWORDS_DONT_MATCH);
                return;
            }
            
            const recaptchaToken = await executeRecaptcha('signup');
            this.signup(name, email, password, recaptchaToken);
        });
        
        // Form tabs
        document.querySelectorAll('.form-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const formType = tab.dataset.form;
                
                document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
                document.getElementById(`${formType}-form`)?.classList.add('active');
            });
        });
        
        // Password toggle buttons
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.target;
                const input = document.getElementById(targetId);
                const icon = btn.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.replace('fa-eye', 'fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.replace('fa-eye-slash', 'fa-eye');
                }
            });
        });
        
        // Google sign-in buttons
        document.getElementById('google-signin-btn')?.addEventListener('click', () => {
            this.googleSignIn();
        });
        
        document.getElementById('google-signup-btn')?.addEventListener('click', () => {
            this.googleSignIn();
        });
        
        // Promo code activation
        document.getElementById('promo-code-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const promoCode = document.getElementById('promo-code-input')?.value?.trim();
            if (promoCode) {
                this.activatePromoCode(promoCode);
            }
        });
        
        // Delete account button
        document.getElementById('delete-account-btn')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                const uid = this.user?.id;
                const name = this.user?.name;
                if (uid) {
                    // Remove from demo registry
                    try {
                        const registry = JSON.parse(localStorage.getItem(CONFIG.APP.USER_REGISTRY_KEY) || '{}');
                        delete registry[uid];
                        localStorage.setItem(CONFIG.APP.USER_REGISTRY_KEY, JSON.stringify(registry));
                    } catch (e) { /* non-critical */ }
                    this.logActivity('user-deleted', `Account ${name || uid} deleted`);
                    localStorage.removeItem(`codeforge_sub_${uid}`);
                }
                this.logout();
                showToast('info', 'Account Deleted', 'Your account has been deleted.');
            }
        });
        
        // VIP & Google-auth modal handlers (upgrade prompts)
        const hideModal = (id) => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        };
        
        ['close-vip-modal', 'cancel-upgrade'].forEach(id => {
            document.getElementById(id)?.addEventListener('click', () => hideModal('vip-modal'));
        });
        document.getElementById('confirm-upgrade')?.addEventListener('click', () => {
            hideModal('vip-modal');
            navigateTo('vip');
        });
        
        ['close-google-modal', 'cancel-google-auth'].forEach(id => {
            document.getElementById(id)?.addEventListener('click', () => hideModal('google-auth-modal'));
        });
        document.getElementById('confirm-google-auth')?.addEventListener('click', () => {
            hideModal('google-auth-modal');
            this.googleSignIn();
        });
        
        // Save profile
        document.getElementById('profile-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('profile-name')?.value?.trim();
            if (name && this.user) {
                this.user.name = name;
                const done = () => {
                    this.saveSession(this.user);
                    this.registerUser(this.user);
                    this.updateUI();
                    this.dispatchAuthChanged();
                    showToast('success', 'Profile Updated', CONFIG.SUCCESS.PROFILE_UPDATED);
                };
                if (firebaseAuth && firebaseAuth.currentUser && firebaseAuth.currentUser.updateProfile) {
                    firebaseAuth.currentUser.updateProfile({ displayName: name }).then(done).catch(done);
                } else {
                    done();
                }
            }
        });
    },
    
    /**
     * Tier-based provider access:
     * Guest -> ChatGPT | Google sign-in -> ChatGPT + Gemini | VIP/Admin -> All
     */
    canUseProvider(providerId) {
        const tier = this.getAccessTier();
        return tier.providers.includes(providerId);
    }
};

// Helper functions for loading state
function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'none';
}

// Toast notification function
function showToast(type, title, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${icons[type] || 'fa-info-circle'} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.classList.add('toast-exit'); setTimeout(() => this.parentElement.remove(), 300)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

// Close all dropdowns
function closeAllDropdowns() {
    document.getElementById('account-dropdown')?.querySelector('.dropdown-menu')?.classList.remove('show');
    document.getElementById('account-dropdown')?.classList.remove('open');
}

// Expose globally
window.AuthManager = AuthManager;
window.executeRecaptcha = executeRecaptcha;
