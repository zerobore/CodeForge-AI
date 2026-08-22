/**
 * ============================================
 * CODE FORGE - Navigation Manager
 * ============================================
 */

const Navigation = {
    currentPage: 'home',
    previousPage: null,
    
    init() {
        this.bindEvents();
        this.handleInitialRoute();
        
        // Update navigation on auth changes
        document.addEventListener('authChanged', () => {
            // Re-render current page to update any user-specific content
            if (typeof window.renderPage === 'function') {
                window.renderPage(this.currentPage);
            }
        });
    },
    
    // Handle initial URL hash
    handleInitialRoute() {
        const hash = window.location.hash.slice(1) || 'home';
        this.navigateTo(hash, false);
    },
    
    // Navigate to a page
    navigateTo(pageId, updateHash = true) {
        // Validate page exists
        const pageEl = document.getElementById(`page-${pageId}`);
        if (!pageEl) {
            console.warn(`Page not found: ${pageId}`);
            pageId = 'home';
        }
        
        this.previousPage = this.currentPage;
        this.currentPage = pageId;
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        // Show target page
        pageEl.classList.add('active');
        
        // Update nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageId);
        });
        
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageId);
        });
        
        // Update URL hash (without triggering scroll)
        if (updateHash) {
            history.pushState(null, '', `#${pageId}`);
        }
        
        // Close mobile menu
        this.closeMobileMenu();
        
        // Close all dropdowns
        closeAllDropdowns();
        ThemeManager.closeDropdown();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'instant' });
        
        // Trigger page-specific initialization
        this.initPage(pageId);
        
        return true;
    },
    
    // Initialize specific page content
    initPage(pageId) {
        switch(pageId) {
            case 'learn':
                LearnManager?.renderCourses();
                break;
            case 'languages':
                LanguagesManager?.renderLanguages();
                break;
            case 'playground':
                PlaygroundManager?.init();
                break;
            case 'projects':
                ProjectsManager?.renderProjects();
                break;
            case 'ai-assistant':
                AIAssistantManager?.init();
                break;
            case 'dashboard':
                DashboardManager?.renderDashboard();
                break;
            case 'vip':
                VIPManager?.init();
                break;
            case 'account':
                AccountManager?.init();
                break;
            case 'auth':
                AuthFormManager?.init();
                break;
            case 'admin':
                AdminManager?.init();
                break;
        }
    },
    
    // Open learning detail page
    openLearningDetail(courseId) {
        LearningManager?.openCourse(courseId);
    },
    
    // Open project workspace
    openProjectWorkspace(projectId) {
        ProjectsManager?.openWorkspace(projectId);
    },
    
    // Close mobile menu
    closeMobileMenu() {
        const menuBtn = document.getElementById('mobile-menu-btn');
        const mobileNav = document.getElementById('mobile-nav');
        if (menuBtn && mobileNav) {
            menuBtn.classList.remove('active');
            mobileNav.classList.remove('show');
        }
    },
    
    // Toggle mobile menu
    toggleMobileMenu() {
        const menuBtn = document.getElementById('mobile-menu-btn');
        const mobileNav = document.getElementById('mobile-nav');
        if (menuBtn && mobileNav) {
            menuBtn.classList.toggle('active');
            mobileNav.classList.toggle('show');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = mobileNav.classList.contains('show') ? 'hidden' : '';
        }
    },
    
    // Bind event listeners
    bindEvents() {
        // Navigation links with data-page attribute
        document.addEventListener('click', (e) => {
            // Check for data-page on clicked element or parent
            const link = e.target.closest('[data-page]');
            if (link) {
                e.preventDefault();
                const page = link.dataset.page;
                
                // Handle special navigation types
                if (page.startsWith('project:')) {
                    this.openProjectWorkspace(page.split(':')[1]);
                } else {
                    this.navigateTo(page);
                }
            }
            
            // Handle back-to-learn button
            if (e.target.closest('.back-to-learn')) {
                e.preventDefault();
                this.navigateTo('learn');
            }
            
            // Handle project start buttons
            const startProjectBtn = e.target.closest('[data-project]');
            if (startProjectBtn) {
                e.preventDefault();
                const projectId = startProjectBtn.dataset.project;
                this.openProjectWorkspace(projectId);
            }
            
            // Handle tech card clicks
            const techCard = e.target.closest('.tech-card');
            if (techCard) {
                e.preventDefault();
                const courseId = techCard.dataset.tech;
                if (courseId) {
                    this.openLearningDetail(courseId);
                }
            }
            
            // Handle learn card clicks
            const learnCard = e.target.closest('.learn-card');
            if (learnCard) {
                e.preventDefault();
                const courseId = learnCard.dataset.course;
                if (courseId) {
                    this.openLearningDetail(courseId);
                }
            }
        });
        
        // Mobile menu toggle
        document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
            this.toggleMobileMenu();
        });
        
        // Account dropdown toggle
        document.getElementById('account-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.querySelector('#account-dropdown .dropdown-menu');
            const dropdownWrapper = document.getElementById('account-dropdown');
            dropdown?.classList.toggle('show');
            dropdownWrapper?.classList.toggle('open');
        });
        
        // Close account dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.account-dropdown')) {
                document.querySelector('#account-dropdown .dropdown-menu')?.classList.remove('show');
                document.getElementById('account-dropdown')?.classList.remove('open');
            }
        });
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            const hash = window.location.hash.slice(1) || 'home';
            this.navigateTo(hash, false);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape to close menus/dropdowns
            if (e.key === 'Escape') {
                this.closeMobileMenu();
                ThemeManager.closeDropdown();
                closeAllDropdowns();
                
                // Close modals
                document.querySelectorAll('.modal-overlay').forEach(modal => {
                    modal.style.display = 'none';
                });
            }
        });
        
        // Logo click - go home
        document.querySelector('.logo-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateTo('home');
        });
    }
};

// Global navigateTo function for use from other modules
function navigateTo(pageId) {
    return Navigation.navigateTo(pageId);
}

// Expose globally
window.navigateTo = navigateTo;

// Make renderPage available
window.Navigation = Navigation;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Navigation.init();
});