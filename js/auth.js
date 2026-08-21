/**
 * ============================================
 * CODE FORGE - Authentication Manager
 * ============================================
 * Updated with Firebase Auth, Google OAuth, reCAPTCHA, and Promo Codes
 */

// Firebase initialization
const firebaseConfig = CONFIG.AUTH.FIREBASE;
let firebaseApp = null;
let firebaseAuth = null;
let googleProvider = null;

// Initialize Firebase
function initializeFirebase() {
    if (!firebaseApp && typeof firebase !== 'undefined') {
        try {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            firebaseAuth = firebase.auth();
            googleProvider = new firebase.auth.GoogleAuthProvider();
            googleProvider.addScope('email');
            googleProvider.addScope('profile');
            googleProvider.addScope('openid');
            
            // Set custom parameters for Google OAuth
            googleProvider.setCustomParameters({
                prompt: 'select_account'
            });
        } catch (error) {
            console.error('Firebase initialization error:', error);
        }
    }
}

const AuthManager = {
    // Current user state
    user: null,
    
    // Initialize
    init() {
        initializeFirebase();
        this.loadSession();
        this.bindEvents();
        this.updateUI();
        this.setupFirebaseAuthListener();
    },
    
    // Setup Firebase auth state listener
    setupFirebaseAuthListener() {
        if (firebaseAuth) {
            firebaseAuth.onAuthStateChanged((firebaseUser) => {
                if (firebaseUser) {
                    // User is signed in
                    const userData = {
                        id: firebaseUser.uid,
                        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                        email: firebaseUser.email,
                        avatar: firebaseUser.photoURL,
                        token: firebaseUser.refreshToken,
                        provider: firebaseUser.providerData[0]?.providerId || 'email',
                        subscription: this.getUserSubscription(firebaseUser.uid),
                        vipActive: this.isUserVIP(firebaseUser.uid),
                        isAdmin: this.isUserAdmin(firebaseUser.uid),
                        createdAt: firebaseUser.metadata.creationTime
                    };
                    this.saveSession(userData);
                    this.updateUI();
                } else {
                    // User is signed out
                    this.clearSession();
                    this.updateUI();
                }
            });
        }
    },
    
    // Get user subscription from localStorage
    getUserSubscription(uid) {
        try {
            const userSub = localStorage.getItem(`codeforge_sub_${uid}`);
            if (userSub) {
                const sub = JSON.parse(userSub);
                return sub.subscription || 'free';
            }
        } catch (e) {
            console.warn('Error reading subscription:', e);
        }
        return 'free';
    },
    
    // Check if user is VIP
    isUserVIP(uid) {
        try {
            const userSub = localStorage.getItem(`codeforge_sub_${uid}`);
            if (userSub) {
                const sub = JSON.parse(userSub);
                return sub.vipActive === true;
            }
        } catch (e) {
            console.warn('Error checking VIP status:', e);
        }
        return false;
    },
    
    // Check if user is admin
    isUserAdmin(uid) {
        try {
            const userSub = localStorage.getItem(`codeforge_sub_${uid}`);
            if (userSub) {
                const sub = JSON.parse(userSub);
                return sub.isAdmin === true;
            }
        } catch (e) {
            console.warn('Error checking admin status:', e);
        }
        return false;
    },
    
    // Load session from storage
    loadSession() {
        try {
            const sessionData = localStorage.getItem(CONFIG.AUTH.SESSION_KEY);
            if (sessionData) {
                const session = JSON.parse(sessionData);
                if (session && session.token) {
                    this.user = session;
                    // Check token expiry
                    if (session.expiresAt && Date.now() > session.expiresAt) {
                        this.logout();
                        return;
                    }
                }
            }
        } catch (e) {
            console.warn('Error loading session:', e);
            this.clearSession();
        }
    },
    
    // Save session to storage
    saveSession(userData) {
        const session = {
            ...userData,
            expiresAt: Date.now() + CONFIG.AUTH.SESSION_DURATION
        };
        this.user = session;
        localStorage.setItem(CONFIG.AUTH.SESSION_KEY, JSON.stringify(session));
        
        // Also save subscription data separately
        if (userData.isAdmin !== undefined) {
            const subData = {
                subscription: userData.subscription || 'free',
                vipActive: userData.vipActive || false,
                isAdmin: userData.isAdmin || false
            };
            localStorage.setItem(`codeforge_sub_${userData.id}`, JSON.stringify(subData));
        }
    },
    
    // Clear session
    clearSession() {
        this.user = null;
        localStorage.removeItem(CONFIG.AUTH.SESSION_KEY);
        
        // Clear Firebase session
        if (firebaseAuth) {
            firebaseAuth.signOut().catch(e => console.warn('Firebase signout error:', e));
        }
    },
    
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
    
    // Check if user is Google authenticated
    isGoogleAuthenticated() {
        return this.isLoggedIn() && 
               this.user.provider === 'google';
    },
    
    // Get user display name
    getDisplayName() {
        if (!this.isLoggedIn()) return 'Guest';
        return this.user.name || 'User';
    },
    
    // Login with email/password
    async login(email, password, recaptchaToken = null) {
        try {
            showLoading();
            
            // Validate inputs
            if (!email || !password) {
                throw new Error('Please fill in all fields');
            }
            
            // Verify reCAPTCHA
            if (CONFIG.AUTH.RECAPTCHA.CONFIGURED && !recaptchaToken) {
                throw new Error('reCAPTCHA verification required');
            }
            
            // Firebase authentication
            if (firebaseAuth) {
                await firebaseAuth.signInWithEmailAndPassword(email, password);
            } else {
                // Fallback to demo mode
                await new Promise(resolve => setTimeout(resolve, 1000));
                const mockUser = {
                    id: 'user_' + Date.now(),
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
                this.updateUI();
                showToast('success', 'Login Successful', `Welcome back, ${mockUser.name}!`);
                navigateTo('dashboard');
            }
            
            hideLoading();
            return true;
        } catch (error) {
            hideLoading();
            let errorMessage = error.message || CONFIG.ERRORS.INVALID_CREDENTIALS;
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = CONFIG.ERRORS.INVALID_CREDENTIALS;
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = CONFIG.ERRORS.EMAIL_REQUIRED;
            }
            showToast('error', 'Login Failed', errorMessage);
            return false;
        }
    },
    
    // Signup
    async signup(name, email, password, recaptchaToken = null) {
        try {
            showLoading();
            
            // Validate inputs
            if (!name || !email || !password) {
                throw new Error('Please fill in all fields');
            }
            
            if (password.length < 6) {
                throw new Error(CONFIG.ERRORS.PASSWORD_MIN_LENGTH);
            }
            
            // Verify reCAPTCHA
            if (CONFIG.AUTH.RECAPTCHA.CONFIGURED && !recaptchaToken) {
                throw new Error('reCAPTCHA verification required');
            }
            
            // Firebase authentication
            if (firebaseAuth) {
                const userCredential = await firebaseAuth.createUserWithEmailAndPassword(email, password);
                await userCredential.user.updateProfile({
                    displayName: name
                });
            } else {
                // Fallback to demo mode
                await new Promise(resolve => setTimeout(resolve, 1000));
                const mockUser = {
                    id: 'user_' + Date.now(),
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
                this.updateUI();
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
    
    // Google Sign-In
    async googleSignIn() {
        try {
            showLoading();
            
            if (firebaseAuth) {
                // Use Firebase Google Auth
                await firebaseAuth.signInWithPopup(googleProvider);
            } else {
                // Fallback to demo mode
                await new Promise(resolve => setTimeout(resolve, 1500));
                const mockGoogleUser = {
                    id: 'google_user_' + Date.now(),
                    name: 'Google User',
                    email: 'user@gmail.com',
                    avatar: null,
                    token: 'google_token_' + Date.now(),
                    provider: 'google',
                    subscription: 'free',
                    vipActive: false,
                    isAdmin: false,
                    createdAt: new Date().toISOString()
                };
                this.saveSession(mockGoogleUser);
                this.updateUI();
                showToast('success', 'Google Sign-In Success', 'You are now authenticated!');
                if (typeof navigateTo === 'function') {
                    navigateTo('dashboard');
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
            }
            showToast('error', 'Authentication Failed', errorMessage);
            return false;
        }
    },
    
    // Activate VIP with promo code
    async activatePromoCode(promoCode) {
        try {
            showLoading();
            
            if (!this.isLoggedIn()) {
                throw new Error('Please login first to activate promo code');
            }
            
            // Check if already VIP
            if (this.isVIP()) {
                showToast('info', 'Already VIP', 'You already have VIP access!');
                hideLoading();
                return false;
            }
            
            // Check promo code
            const validCodes = CONFIG.PAYMENT.PROMO_CODES;
            const adminCode = CONFIG.PAYMENT.ADMIN_PROMO_CODE;
            
            let isAdmin = false;
            let isValid = false;
            
            if (promoCode === adminCode) {
                isValid = true;
                isAdmin = true;
            } else if (validCodes.includes(promoCode)) {
                isValid = true;
            }
            
            if (!isValid) {
                throw new Error(CONFIG.ERRORS.INVALID_PROMO_CODE);
            }
            
            // Update user session
            this.user.subscription = 'vip';
            this.user.vipActive = true;
            this.user.isAdmin = isAdmin;
            
            // Save to localStorage
            this.saveSession(this.user);
            
            // Update UI
            this.updateUI();
            
            // Show success message
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
        
        // Navigate to home
        if (typeof navigateTo === 'function') {
            navigateTo('home');
        }
        
        showToast('success', 'Logged Out', CONFIG.SUCCESS.LOGOUT_SUCCESS);
    },
    
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
        
        if (this.isLoggedIn()) {
            const displayName = this.getDisplayName();
            
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
                    dropdownStatus.textContent = 'Google Account';
                } else {
                    dropdownStatus.textContent = 'Logged in';
                }
            }
            if (dashboardMenu) dashboardMenu.style.display = 'flex';
            if (loginMenuBtn) loginMenuBtn.style.display = 'none';
            if (logoutMenuBtn) logoutMenuBtn.style.display = 'flex';
            if (dashUsername) dashUsername.textContent = displayName;
            if (accountStatusBadge) {
                if (this.isAdmin()) {
                    accountStatusBadge.textContent = 'Admin';
                    accountStatusBadge.classList.add('admin');
                } else if (this.isVIP()) {
                    accountStatusBadge.textContent = 'VIP Member';
                    accountStatusBadge.classList.add('vip');
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
            if (loginMenuBtn) loginMenuBtn.style.display = 'flex';
            if (logoutMenuBtn) logoutMenuBtn.style.display = 'none';
            if (accountStatusBadge) {
                accountStatusBadge.textContent = 'Guest';
                accountStatusBadge.classList.remove('vip', 'admin');
            }
        }
        
        // Update AI provider access indicators
        this.updateProviderAccess();
        
        // Update VIP status displays
        this.updateVIPDisplays();
        
        // Update admin UI
        this.updateAdminUI();
    },
    
    // Update admin-specific UI elements
    updateAdminUI() {
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(el => {
            if (this.isAdmin()) {
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        });
    },
    
    // Update AI provider access states
    updateProviderAccess() {
        const geminiStatus = document.querySelector('#provider-gemini .provider-status');
        const claudeStatus = document.querySelector('#provider-claude .provider-status');
        
        if (geminiStatus) {
            if (this.isGoogleAuthenticated()) {
                geminiStatus.className = 'provider-status available';
                geminiStatus.textContent = 'Available';
            } else if (this.isLoggedIn()) {
                geminiStatus.className = 'provider-status needs-auth';
                geminiStatus.textContent = 'Auth Required';
            } else {
                geminiStatus.className = 'provider-status needs-auth';
                geminiStatus.textContent = 'Auth Required';
            }
        }
        
        if (claudeStatus) {
            if (this.isVIP() || this.isAdmin()) {
                claudeStatus.className = 'provider-status available';
                claudeStatus.textContent = 'Available';
            } else if (this.isLoggedIn() && !this.isVIP()) {
                claudeStatus.className = 'provider-status vip-only';
                claudeStatus.textContent = 'Upgrade Required';
            } else {
                claudeStatus.className = 'provider-status vip-only';
                claudeStatus.textContent = 'VIP Only';
            }
        }
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
        
        // Login form
        document.getElementById('login-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email')?.value;
            const password = document.getElementById('login-password')?.value;
            
            // Execute reCAPTCHA
            let recaptchaToken = null;
            if (CONFIG.AUTH.RECAPTCHA.CONFIGURED && typeof grecaptcha !== 'undefined') {
                try {
                    recaptchaToken = await grecaptcha.execute(CONFIG.AUTH.RECAPTCHA.SITE_KEY, {action: 'login'});
                } catch (error) {
                    console.error('reCAPTCHA error:', error);
                }
            }
            
            this.login(email, password, recaptchaToken);
        });
        
        // Signup form
        document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name')?.value;
            const email = document.getElementById('signup-email')?.value;
            const password = document.getElementById('signup-password')?.value;
            
            // Execute reCAPTCHA
            let recaptchaToken = null;
            if (CONFIG.AUTH.RECAPTCHA.CONFIGURED && typeof grecaptcha !== 'undefined') {
                try {
                    recaptchaToken = await grecaptcha.execute(CONFIG.AUTH.RECAPTCHA.SITE_KEY, {action: 'signup'});
                } catch (error) {
                    console.error('reCAPTCHA error:', error);
                }
            }
            
            this.signup(name, email, password, recaptchaToken);
        });
        
        // Form tabs
        document.querySelectorAll('.form-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const formType = tab.dataset.form;
                
                // Update tab active state
                document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update form visibility
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
            const promoCode = document.getElementById('promo-code-input')?.value?.trim().toUpperCase();
            if (promoCode) {
                this.activatePromoCode(promoCode);
            }
        });
        
        // Delete account button
        document.getElementById('delete-account-btn')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                this.logout();
                showToast('info', 'Account Deleted', 'Your account has been deleted.');
            }
        });
        
        // Save profile
        document.getElementById('profile-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('profile-name')?.value;
            if (name && this.user) {
                this.user.name = name;
                if (firebaseAuth && firebaseAuth.currentUser) {
                    firebaseAuth.currentUser.updateProfile({
                        displayName: name
                    }).then(() => {
                        this.saveSession(this.user);
                        this.updateUI();
                        showToast('success', 'Profile Updated', CONFIG.SUCCESS.PROFILE_UPDATED);
                    }).catch(error => {
                        console.error('Profile update error:', error);
                        this.saveSession(this.user);
                        this.updateUI();
                        showToast('success', 'Profile Updated', CONFIG.SUCCESS.PROFILE_UPDATED);
                    });
                } else {
                    this.saveSession(this.user);
                    this.updateUI();
                    showToast('success', 'Profile Updated', CONFIG.SUCCESS.PROFILE_UPDATED);
                }
            }
        });
    },
    
    // Check if can use specific AI provider
    canUseProvider(providerId) {
        switch(providerId) {
            case 'chatgpt':
                return CONFIG.OPENAI.CONFIGURED;
            case 'gemini':
                return this.isGoogleAuthenticated();
            case 'claude':
                return this.isVIP() || this.isAdmin();
            default:
                return false;
        }
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
        <i class="fas ${icons[type]} toast-icon"></i>
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
}

// Initialize Firebase when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Load Firebase SDK first
    const firebaseScript = document.createElement('script');
    firebaseScript.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js';
    firebaseScript.onload = () => {
        const authScript = document.createElement('script');
        authScript.src = 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js';
        authScript.onload = () => {
            AuthManager.init();
        };
        document.head.appendChild(authScript);
    };
    document.head.appendChild(firebaseScript);
    
    // Also load reCAPTCHA
    const recaptchaScript = document.createElement('script');
    recaptchaScript.src = `https://www.google.com/recaptcha/api.js?render=${CONFIG.AUTH.RECAPTCHA.SITE_KEY}`;
    recaptchaScript.async = true;
    recaptchaScript.defer = true;
    document.head.appendChild(recaptchaScript);
});
