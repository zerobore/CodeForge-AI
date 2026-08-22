/**
 * ============================================
 * CODE FORGE - Theme Manager (app theme)
 * + ChatThemeManager (unique animated chat themes)
 * ============================================
 */

const ThemeManager = {
    currentTheme: 'dark',
    systemPreference: null,
    
    // Initialize theme
    init() {
        const savedTheme = localStorage.getItem(CONFIG.APP.THEME_STORAGE_KEY);
        this.systemPreference = this.getSystemPreference();
        
        if (savedTheme && ['dark', 'light', 'system'].includes(savedTheme)) {
            this.currentTheme = savedTheme;
        } else if (this.systemPreference) {
            this.currentTheme = 'system';
        } else {
            this.currentTheme = CONFIG.APP.DEFAULT_THEME;
        }
        
        this.applyTheme(this.currentTheme);
        this.bindEvents();
        this.updateIcon();
    },
    
    // Get system color scheme preference
    getSystemPreference() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },
    
    // Apply theme to document
    applyTheme(theme) {
        const effectiveTheme = theme === 'system' 
            ? this.getSystemPreference() 
            : theme;
        
        document.documentElement.setAttribute('data-theme', effectiveTheme);
        
        // Update body class (preserve other classes)
        document.body.classList.remove('theme-dark', 'theme-light');
        document.body.classList.add(`theme-${effectiveTheme}`);
        
        // Save preference
        localStorage.setItem(CONFIG.APP.THEME_STORAGE_KEY, theme);
        this.currentTheme = theme;
        this.updateIcon();
    },
    
    // Switch to a specific theme
    setTheme(theme) {
        this.applyTheme(theme);
        this.closeDropdown();
    },
    
    // Toggle through themes (for quick switch)
    toggle() {
        const order = ['dark', 'light', 'system'];
        const currentIndex = order.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % order.length;
        this.setTheme(order[nextIndex]);
    },
    
    // Update the icon in the theme button
    updateIcon() {
        const icon = document.getElementById('theme-icon');
        if (!icon) return;
        
        const effectiveTheme = this.currentTheme === 'system'
            ? this.getSystemPreference()
            : this.currentTheme;
            
        icon.className = effectiveTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    },
    
    // Open/close dropdown
    toggleDropdown() {
        const dropdown = document.getElementById('theme-dropdown');
        dropdown?.classList.toggle('show');
    },
    
    closeDropdown() {
        const dropdown = document.getElementById('theme-dropdown');
        dropdown?.classList.remove('show');
    },
    
    // Bind event listeners
    bindEvents() {
        // Theme button click
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });
        }
        
        // Theme options click
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                this.setTheme(theme);
                
                // Update active state
                document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
            });
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.theme-switcher')) {
                this.closeDropdown();
            }
        });
        
        // Listen for system preference changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (this.currentTheme === 'system') {
                this.applyTheme('system');
            }
        });
    },
    
    // Get current effective theme (resolving 'system')
    getEffectiveTheme() {
        if (this.currentTheme === 'system') {
            return this.getSystemPreference();
        }
        return this.currentTheme;
    }
};

/**
 * ============================================
 * ChatThemeManager - Unique animated chat themes
 * ============================================
 * Each theme changes the chat panel's colors, bubbles,
 * background animation, and message entrance effect.
 * VIP-only themes are marked in CONFIG.CHAT_THEMES.
 */
const ChatThemeManager = {
    currentTheme: null,
    
    init() {
        const saved = localStorage.getItem(CONFIG.CHAT_THEMES.STORAGE_KEY);
        const valid = CONFIG.CHAT_THEMES.THEMES.some(t => t.id === saved);
        this.currentTheme = valid ? saved : CONFIG.CHAT_THEMES.DEFAULT;
        
        this.applyTheme(this.currentTheme, { silent: true });
        this.renderThemePicker();
        this.bindEvents();
    },
    
    getThemes() {
        return CONFIG.CHAT_THEMES.THEMES;
    },
    
    getCurrentTheme() {
        return this.getThemes().find(t => t.id === this.currentTheme) ||
               this.getThemes().find(t => t.id === CONFIG.CHAT_THEMES.DEFAULT);
    },
    
    isThemeAllowed(theme) {
        if (!theme.vip) return true;
        if (typeof AuthManager !== 'undefined') {
            return AuthManager.isVIP() || AuthManager.isAdmin();
        }
        return false;
    },
    
    applyTheme(themeId, options = {}) {
        const { silent = false } = options;
        const theme = this.getThemes().find(t => t.id === themeId);
        
        if (!theme) {
            if (!silent && typeof showToast === 'function') {
                showToast('error', 'Theme Error', CONFIG.ERRORS.INVALID_CHAT_THEME);
            }
            return false;
        }
        
        if (!this.isThemeAllowed(theme)) {
            if (!silent && typeof showToast === 'function') {
                showToast('warning', 'VIP Theme', `"${theme.name}" is a VIP-exclusive chat theme. Activate a promo code to unlock it!`);
                if (typeof navigateTo === 'function') navigateTo('vip');
            }
            return false;
        }
        
        this.currentTheme = themeId;
        localStorage.setItem(CONFIG.CHAT_THEMES.STORAGE_KEY, themeId);
        
        // Apply on both the AI page and the messages container so
        // themes work no matter which element is the scroll parent
        const page = document.getElementById('page-ai-assistant');
        const messages = document.getElementById('chat-messages');
        [page, messages].forEach(el => el && el.setAttribute('data-chat-theme', themeId));
        
        // Update picker active state + header label
        document.querySelectorAll('.chat-theme-swatch').forEach(s => {
            s.classList.toggle('active', s.dataset.theme === themeId);
        });
        const label = document.getElementById('current-chat-theme-name');
        if (label) label.textContent = theme.name;
        
        if (!silent && typeof showToast === 'function') {
            showToast('success', 'Chat Theme', `${CONFIG.SUCCESS.CHAT_THEME_APPLIED} <strong>${theme.name}</strong>`);
        }
        return true;
    },
    
    // Cycle to the next available theme (header button)
    cycleTheme() {
        const themes = this.getThemes().filter(t => this.isThemeAllowed(t));
        const index = themes.findIndex(t => t.id === this.currentTheme);
        const next = themes[(index + 1) % themes.length];
        this.applyTheme(next.id, { silent: true });
    },
    
    // Render the swatch grid in the AI sidebar
    renderThemePicker() {
        const picker = document.getElementById('chat-theme-picker');
        if (!picker) return;
        
        picker.innerHTML = this.getThemes().map(theme => {
            const locked = !this.isThemeAllowed(theme);
            return `
                <button type="button" class="chat-theme-swatch theme-${theme.id}${theme.id === this.currentTheme ? ' active' : ''}${locked ? ' locked' : ''}"
                        data-theme="${theme.id}" title="${theme.name}${locked ? ' (VIP)' : ''}">
                    <i class="fas ${theme.icon}"></i>
                    <span>${theme.name}</span>
                    ${locked ? '<i class="fas fa-lock theme-lock-icon"></i>' : ''}
                </button>
            `;
        }).join('');
    },
    
    bindEvents() {
        // Delegated clicks on swatches (picker is re-rendered)
        document.addEventListener('click', (e) => {
            const swatch = e.target.closest('.chat-theme-swatch');
            if (swatch) {
                this.applyTheme(swatch.dataset.theme);
            }
        });
        
        // Re-render picker locks when auth changes (VIP activated, logout, etc.)
        document.addEventListener('authChanged', () => {
            this.renderThemePicker();
            // If current theme became locked (logout), fall back to default
            const theme = this.getCurrentTheme();
            if (!this.isThemeAllowed(theme)) {
                this.applyTheme(CONFIG.CHAT_THEMES.DEFAULT, { silent: true });
            }
        });
    }
};

// Expose globally
window.ThemeManager = ThemeManager;
window.ChatThemeManager = ChatThemeManager;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    ChatThemeManager.init();
});
