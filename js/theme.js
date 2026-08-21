/**
 * ============================================
 * CODE FORGE - Theme Manager
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
        
        // Update body class
        document.body.classList.remove('theme-dark', 'theme-light');
        document.body.classList.add(`theme-${effectiveTheme}`);
        
        // Update header background based on theme
        const header = document.querySelector('.main-header');
        if (header) {
            if (effectiveTheme === 'light') {
                header.style.background = 'rgba(255, 255, 255, 0.9)';
            } else {
                header.style.background = 'rgba(10, 10, 15, 0.85)';
            }
        }
        
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

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
});