/**
 * ============================================
 * CODE FORGE - Main Application Entry Point
 * ============================================
 * 
 * This file initializes all modules and handles
 * global application functionality.
 */

const App = {
    initialized: false,
    
/**
 * Initialize the application
 */
init() {
    if (this.initialized) return;
    
    // Apply saved theme immediately to prevent flash
    const savedTheme = localStorage.getItem(CONFIG.APP.THEME_STORAGE_KEY);
    if (savedTheme && ['dark', 'light', 'system'].includes(savedTheme)) {
        document.documentElement.setAttribute('data-theme', 
            savedTheme === 'system' ? 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
            savedTheme
        );
        document.body.className = `theme-${savedTheme === 'system' ? 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
            savedTheme}`;
    }
    
    console.log('%c Code Forge ', 'background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px; font-weight: bold;');
    console.log('Version:', CONFIG.APP.VERSION);
    
    // Initialize core modules in order
    this.initModules();
    
    // Setup global event handlers
    this.setupGlobalHandlers();
    
    // Perform initial navigation
    Navigation.init();
    
    this.initialized = true;
    
    console.log('✅ Application initialized successfully');
},
    
    /**
     * Initialize all modules
     */
    initModules() {
        // Theme (must be first to prevent flash)
        if (typeof ThemeManager !== 'undefined') {
            ThemeManager.init();
        }
        
        // Auth state
        if (typeof AuthManager !== 'undefined') {
            AuthManager.init();
        }
        
        console.log('📦 All modules loaded');
    },
    
    /**
     * Setup global event handlers
     */
    setupGlobalHandlers() {
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 100);
        });
        
        // Handle visibility change (tab focus/blur)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Refresh data when tab becomes visible again
                this.onVisibilityChange();
            }
        });
        
        // Handle online/offline status
        window.addEventListener('online', () => {
            showToast('success', 'Back Online', 'Your internet connection is restored.');
        });
        
        window.addEventListener('offline', () => {
            showToast('warning', 'Offline', 'You appear to be offline. Some features may not work.');
        });
        
        // Prevent accidental form submissions that aren't handled
        document.querySelectorAll('form').forEach(form => {
            if (!form.hasAttribute('data-no-prevent')) {
                form.addEventListener('submit', (e) => {
                    // Only allow forms that have proper handlers
                    const hasHandler = form.onsubmit || 
                                     form.getAttribute('id') === 'login-form' ||
                                     form.getAttribute('id') === 'signup-form' ||
                                     form.getAttribute('id') === 'profile-form' ||
                                     form.getAttribute('id') === 'security-form';
                    if (!hasHandler && !e.defaultPrevented) {
                        e.preventDefault();
                    }
                });
            }
        });
        
        // Add smooth scroll behavior for anchor links
        document.querySelectorAll('a[href^="#"]:not([data-page])').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Click handler for footer nav links
        document.querySelector('.main-footer')?.addEventListener('click', (e) => {
            const link = e.target.closest('[data-page]');
            if (link) {
                e.preventDefault();
                navigateTo(link.dataset.page);
            }
        });
    },
    
    /**
     * Handle window resize events
     */
    handleResize() {
        // Close mobile menu on larger screens
        if (window.innerWidth > 1024) {
            Navigation.closeMobileMenu();
        }
        
        // Close dropdowns
        closeAllDropdowns();
        ThemeManager.closeDropdown();
    },
    
    /**
     * Handle page visibility changes
     */
    onVisibilityChange() {
        // Could refresh data, check session, etc.
        // For now, just update auth UI state
        if (typeof AuthManager !== 'undefined') {
            AuthManager.updateUI();
        }
    },
    
    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+K - Focus search (if available)
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                const searchInput = document.querySelector('.search-input');
                if (searchInput && searchInput.offsetParent !== null) { // Visible
                    e.preventDefault();
                    searchInput.focus();
                    searchInput.select();
                }
            }
            
            // Ctrl+/ or Ctrl+? - Toggle theme
            if ((e.ctrlKey || e.metaKey) && (e.key === '/' || e.key === '?')) {
                e.preventDefault();
                if (typeof ThemeManager !== 'undefined') {
                    ThemeManager.toggle();
                }
            }
            
            // Escape - already handled in Navigation module
        });
    },
    
    /**
     * Get app information
     */
    getInfo() {
        return {
            name: CONFIG.APP.NAME,
            version: CONFIG.APP.VERSION,
            description: CONFIG.APP.DESCRIPTION,
            currentUser: AuthManager.isLoggedIn() ? {
                name: AuthManager.getDisplayName(),
                email: AuthManager.user?.email,
                plan: AuthManager.isVIP() ? 'VIP' : 'Free'
            } : null,
            currentPage: Navigation.currentPage,
            theme: ThemeManager.currentTheme
        };
    }
};

// ==========================================
// Global Utility Functions
// ==========================================

/**
 * Debounce function for performance optimization
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for rate-limiting
 */
function throttle(func, limit = 250) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Format date to relative string
 */
function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'week', seconds: 604800 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 }
    ];
    
    for (let interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
        }
    }
    
    return 'Just now';
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('success', 'Copied!', CONFIG.SUCCESS.CODE_COPIED);
        return true;
    } catch (err) {
        // Fallback method
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            showToast('success', 'Copied!', CONFIG.SUCCESS.CODE_COPIED);
            return true;
        } catch (err2) {
            showToast('error', 'Copy Failed', 'Unable to copy to clipboard.');
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

/**
 * Generate unique ID
 */
function generateId(prefix = '') {
    return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ==========================================
// Initialize Application on DOM Ready
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Also handle case where DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => App.init(), 0);
}

// Expose App globally for debugging
window.App = App;

console.log(`
%c╔══════════════════════════════════════╗
║                                        ║
║   ██████╗ ██╗   ██╗██╗███████╗██████╗ ║
║  ██╔═══██╗██║   ██║██║╚══██╔══╝██╔══██╗║
║  ██║   ██║██║   ██║██║   ██║   ██████╔╝║
║  ██║▄▄ ██║██║   ██║██║   ██║   ██╔══██╗║
║  ╚██████╔╝╚██████╔╝██║   ██║   ███████║║
║   ╚══▀▀═╝  ╚═════╝ ╚═╝   ╚═╝   ╚══════╝║
║                                        ║
║      Premium Coding Platform            ║
║           v${CONFIG.APP.VERSION}                     ║
╚══════════════════════════════════════╝`, 
'color: #6366f1; font-family: monospace; font-size: 10px; line-height: 13px;'
);