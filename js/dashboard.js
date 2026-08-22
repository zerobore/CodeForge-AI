/**
 * ============================================
 * CODE FORGE - Dashboard Manager
 * ============================================
 */

const DashboardManager = {
    // Render dashboard content
    renderDashboard() {
        // Check if user is logged in
        if (!AuthManager.isLoggedIn()) {
            this.showGuestDashboard();
            return;
        }
        
        this.renderUserDashboard();
    },
    
    // Show guest dashboard (not logged in)
    showGuestDashboard() {
        const dashUsername = document.getElementById('dash-username');
        const dashboardContent = document.querySelector('#page-dashboard .container');
        
        if (dashUsername) dashUsername.textContent = 'Guest';
        
        // Replace main content with login prompt
        document.querySelector('.dashboard-welcome')?.remove();
        
        const container = document.querySelector('#page-dashboard .container');
        if (container && !document.getElementById('login-prompt')) {
            container.innerHTML = `
                <div id="login-prompt" style="text-align: center; padding: 80px 20px;">
                    <i class="fas fa-user-circle" style="font-size: 64px; color: var(--text-muted); margin-bottom: 20px;"></i>
                    <h2>Welcome to Code Forge</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 30px; max-width: 400px; margin-left: auto; margin-right: auto;">
                        Sign in to access your personalized dashboard with learning progress, 
                        saved projects, and more.
                    </p>
                    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                        <button class="btn btn-primary btn-lg" onclick="navigateTo('auth')">
                            <i class="fas fa-sign-in-alt"></i> Login / Sign Up
                        </button>
                        <button class="btn btn-outline btn-lg" onclick="navigateTo('learn')">
                            <i class="fas fa-book-open"></i> Browse Courses
                        </button>
                        <button class="btn btn-accent btn-lg" onclick="navigateTo('ai-assistant')">
                            <i class="fas fa-robot"></i> Try AI Assistant
                        </button>
                    </div>
                    
                    <div style="margin-top: 40px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; text-align: left; max-width: 800px; margin: 40px auto 0;">
                        <div class="stat-card">
                            <div class="stat-icon stat-blue"><i class="fas fa-book-reader"></i></div>
                            <div class="stat-info">
                                <span class="stat-value">15+</span>
                                <span class="stat-label">Courses Available</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon stat-green"><i class="fas fa-project-diagram"></i></div>
                            <div class="stat-info">
                                <span class="stat-value">50+</span>
                                <span class="stat-label">Projects to Build</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon stat-purple"><i class="fas fa-robot"></i></div>
                            <div class="stat-info">
                                <span class="stat-value">3</span>
                                <span class="stat-label">AI Assistants</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon stat-orange"><i class="fas fa-code"></i></div>
                            <div class="stat-info">
                                <span class="stat-value">Free</span>
                                <span class="stat-label">Playground Access</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    
    // Render logged-in user dashboard
    renderUserDashboard() {
        // Update user name
        const dashUsername = document.getElementById('dash-username');
        if (dashUsername) dashUsername.textContent = AuthManager.getDisplayName();
        
        // Remove guest prompt if present
        document.getElementById('login-prompt')?.remove();
        
        // Ensure dashboard structure exists
        this.ensureDashboardStructure();
        
        // Load and display stats
        this.loadStats();
        
        // Load recent activity
        this.loadRecentActivity();
        
        // Load progress overview
        this.loadProgressOverview();
    },
    
    // Ensure dashboard has proper structure for logged-in users
    ensureDashboardStructure() {
        const pageEl = document.getElementById('page-dashboard');
        
        // Check if we need to restore proper layout
        if (!pageEl.querySelector('.dashboard-welcome')) {
            pageEl.querySelector('.container')?.insertAdjacentHTML('afterbegin', `
                <div class="dashboard-welcome">
                    <div class="welcome-text">
                        <h1>Welcome back, <span id="dash-username">User</span>! 👋</h1>
                        <p>Continue your coding journey where you left off.</p>
                    </div>
                    <div class="user-plan-badge" id="dash-plan-badge">
                        <i class="fas fa-user"></i> Free Plan
                    </div>
                </div>
                
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <div class="stat-icon stat-blue"><i class="fas fa-book-reader"></i></div>
                        <div class="stat-info">
                            <span class="stat-value" id="stat-lessons">0</span>
                            <span class="stat-label">Lessons Completed</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon stat-green"><i class="fas fa-project-diagram"></i></div>
                        <div class="stat-info">
                            <span class="stat-value" id="stat-projects">0</span>
                            <span class="stat-label">Projects Started</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon stat-purple"><i class="fas fa-robot"></i></div>
                        <div class="stat-info">
                            <span class="stat-value" id="stat-ai-chats">0</span>
                            <span class="stat-label">AI Conversations</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon stat-orange"><i class="fas fa-fire"></i></div>
                        <div class="stat-info">
                            <span class="stat-value" id="stat-streak">0</span>
                            <span class="stat-label">Day Streak</span>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-grid">
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3><i class="fas fa-clock"></i> Continue Learning</h3>
                        </div>
                        <div class="card-body" id="continue-learning">
                            <div class="empty-state">
                                <i class="fas fa-book-open"></i>
                                <p>No recent lessons</p>
                                <button class="btn btn-primary" data-page="learn">Browse Courses</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card">
                        <div class="card-header">
                            <h3><i class="fas fa-folder-open"></i> Recent Projects</h3>
                        </div>
                        <div class="card-body" id="recent-projects">
                            <div class="empty-state">
                                <i class="fas fa-code-branch"></i>
                                <p>No projects yet</p>
                                <button class="btn btn-primary" data-page="projects">Explore Projects</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card dashboard-full">
                        <div class="card-header">
                            <h3><i class="fas fa-chart-line"></i> Learning Progress</h3>
                        </div>
                        <div class="card-body">
                            <div class="progress-overview" id="progress-overview">
                                <div class="empty-state">
                                    <i class="fas fa-chart-bar"></i>
                                    <p>Start a course to see your progress</p>
                                    <button class="btn btn-primary" data-page="learn">Start Learning</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `);
            
            // Update username again after DOM update
            setTimeout(() => {
                const el = document.getElementById('dash-username');
                if (el) el.textContent = AuthManager.getDisplayName();
            }, 0);
        }
    },
    
    // Load user statistics
    loadStats() {
        try {
            const progress = JSON.parse(localStorage.getItem(CONFIG.APP.PROGRESS_STORAGE_KEY) || '{}');
            const completedLessons = Object.keys(progress.completedLessons || {}).length;
            const projectsData = JSON.parse(localStorage.getItem(CONFIG.APP.PROJECTS_STORAGE_KEY) || '{}');
            const projectCount = Object.keys(projectsData).length;
            
            // AI conversations are tracked by the assistant (no more random values)
            const aiUsage = JSON.parse(localStorage.getItem(CONFIG.APP.AI_USAGE_KEY) || '{}');
            
            const stats = {
                lessons: completedLessons,
                projects: Math.max(projectCount, 0),
                aiChats: aiUsage.conversations || 0,
                streak: this.calculateStreak()
            };
            
            // Animate numbers
            this.animateStat('stat-lessons', stats.lessons);
            this.animateStat('stat-projects', stats.projects);
            this.animateStat('stat-ai-chats', stats.aiChats);
            this.animateStat('stat-streak', stats.streak);
            
        } catch(e) {
            console.error('Error loading stats:', e);
        }
    },
    
    // Animate stat number
    animateStat(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        let current = 0;
        const increment = targetValue / 20;
        const interval = setInterval(() => {
            current += increment;
            if (current >= targetValue) {
                current = targetValue;
                clearInterval(interval);
            }
            element.textContent = Math.floor(current);
        }, 50);
    },
    
    // Calculate learning streak (simplified)
    calculateStreak() {
        try {
            const progress = JSON.parse(localStorage.getItem(CONFIG.APP.PROGRESS_STORAGE_KEY) || '{}');
            const lastActivity = progress.lastActivity;
            
            if (!lastActivity) return 0;
            
            const now = new Date();
            const lastDate = new Date(lastActivity);
            const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
            
            return diffDays <= 1 ? (diffDays === 1 ? 1 : 1) : 0;
        } catch { return 0; }
    },
    
    // Load recent learning activity
    loadRecentActivity() {
        const continueLearningEl = document.getElementById('continue-learning');
        if (!continueLearningEl) return;
        
        try {
            const progress = JSON.parse(localStorage.getItem(CONFIG.APP.PROGRESS_STORAGE_KEY) || '{}');
            const completedLessons = progress.completedLessons || {};
            const lastCompleted = Object.keys(completedLessons).pop();
            
            if (lastCompleted) {
                // Show next lesson or continue info
                continueLearningEl.innerHTML = `
                    <div style="text-align: center; padding: 10px;">
                        <i class="fas fa-play-circle" style="font-size: 32px; color: var(--accent-primary); margin-bottom: 8px;"></i>
                        <p style="color: var(--text-secondary);">
                            You recently viewed: <strong>${lastCompleted.replace(/-/g, ' ')}</strong>
                        </p>
                        <button class="btn btn-sm btn-primary" onclick="navigateTo('learn')">Continue Learning</button>
                    </div>
                `;
            }
        } catch {}
        
        // Load recent projects
        this.loadRecentProjects();
    },
    
    // Load recent projects
    loadRecentProjects() {
        const recentProjectsEl = document.getElementById('recent-projects');
        if (!recentProjectsEl) return;
        
        try {
            const savedProjects = JSON.parse(localStorage.getItem(CONFIG.APP.PROJECTS_STORAGE_KEY) || '{}');
            const projectIds = Object.keys(savedProjects);
            
            if (projectIds.length > 0) {
                recentProjectsEl.innerHTML = projectIds.slice(0, 5).map(id => {
                    const proj = savedProjects[id];
                    const icon = DATA.projects.find(p => p.id === id)?.icon || 'fa-folder';
                    return `
                        <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-hover); border-radius: 8px; margin-bottom: 8px; cursor: pointer;" onclick='ProjectsManager.openWorkspace("${id}")'>
                            <i class="fas ${icon}" style="color: var(--accent-primary); font-size: 18px;"></i>
                            <div>
                                <strong>${proj.title || id}</strong>
                                <small style="display: block; color: var(--text-muted);">${new Date(proj.lastSaved).toLocaleDateString()}</small>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        } catch {}
    },
    
    // Load progress overview
    loadProgressOverview() {
        const progressOverviewEl = document.getElementById('progress-overview');
        if (!progressOverviewEl) return;
        
        try {
            const progress = JSON.parse(localStorage.getItem(CONFIG.APP.PROGRESS_STORAGE_KEY) || '{}');
            const completedLessons = Object.keys(progress.completedLessons || {});
            
            if (completedLessons.length > 0) {
                // Calculate total lessons across all courses
                let totalLessons = 0;
                Object.values(DATA.courses).forEach(course => {
                    if (course.levels) {
                        Object.values(course.levels).forEach(lessons => {
                            totalLessons += lessons.length;
                        });
                    }
                });
                
                const percentage = totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
                
                progressOverviewEl.innerHTML = `
                    <div style="max-width: 500px; margin: 0 auto;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <strong>Overall Progress</strong>
                            <span style="color: var(--accent-primary);">${percentage}%</span>
                        </div>
                        <div class="progress-bar-container" style="height: 12px;">
                            <div class="progress-bar" style="width: ${percentage}%; height: 100%;"></div>
                        </div>
                        <p style="text-align: center; color: var(--text-secondary); margin-top: 16px;">
                            ${completedLessons.length} of ~${totalLessons} lessons completed
                        </p>
                        
                        <div style="margin-top: 24px; display: grid; gap: 16px;">
                            ${this.generateProgressBars()}
                        </div>
                    </div>
                `;
            }
        } catch {}
    },
    
    // Generate per-course progress bars
    generateProgressBars() {
        try {
            const progress = JSON.parse(localStorage.getItem(CONFIG.APP.PROGRESS_STORAGE_KEY) || '{}');
            const completedSet = new Set(Object.keys(progress.completedLessons || {}));
            
            const bars = [];
            
            Object.entries(DATA.courses).slice(0, 4).forEach(([courseId, course]) => {
                if (!course.levels) return;
                
                let total = 0;
                let completed = 0;
                
                Object.values(course.levels).forEach(lessons => {
                    total += lessons.length;
                    lessons.forEach(lesson => {
                        if (completedSet.has(lesson.id)) completed++;
                    });
                });
                
                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                const lang = DATA.languages.find(l => l.id === courseId);
                
                bars.push(`
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                            <span>${lang?.name || course.title}</span>
                            <span style="color: var(--accent-primary);">${pct}%</span>
                        </div>
                        <div class="progress-bar-container" style="height: 6px;">
                            <div class="progress-bar" style="width: ${pct}%; height: 100%;"></div>
                        </div>
                    </div>
                `);
            });
            
            return bars.join('');
        } catch { return ''; }
    },
    
    // Initialize bindings
    init() {
        // This will be called when navigating to dashboard page
        // Main logic handled in renderDashboard()
    }
};

// Expose globally
window.DashboardManager = DashboardManager;

// Handle VIP subscription display on page
const VIPManager = {
    init() {
        this.updateSubscriptionStatus();
    },
    
    updateSubscriptionStatus() {
        const currentPlanName = document.getElementById('current-plan-name');
        const statusBadge = document.getElementById('subscription-status-badge');
        const renewalDate = document.getElementById('renewal-date');
        
        if (AuthManager.isVIP()) {
            currentPlanName.textContent = 'VIP Plan (₹100/month)';
            statusBadge.className = 'status-badge active';
            statusBadge.textContent = 'Active';
            
            // Calculate renewal date (demo)
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            renewalDate.textContent = nextMonth.toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        } else {
            currentPlanName.textContent = 'Free Plan';
            statusBadge.className = 'status-badge inactive';
            statusBadge.textContent = 'Inactive';
            renewalDate.textContent = 'N/A';
        }
        
        // Subscribe button handler
        document.getElementById('subscribe-btn')?.addEventListener('click', () => {
            showToast('info', 'Coming Soon', 'Payment integration is being configured. The ₹100/month VIP plan will be available soon!');
        });
    }
};

window.VIPManager = VIPManager;

// Account Manager
const AccountManager = {
    init() {
        this.bindEvents();
        this.populateAccountInfo();
    },
    
    populateAccountInfo() {
        if (AuthManager.isLoggedIn()) {
            document.getElementById('profile-name').value = AuthManager.user.name || '';
            document.getElementById('profile-email').value = AuthManager.user.email || '';
        }
        
        // Update theme preference label
        const prefLabel = document.getElementById('pref-theme-label');
        if (prefLabel) {
            const theme = ThemeManager.currentTheme.charAt(0).toUpperCase() + ThemeManager.currentTheme.slice(1);
            prefLabel.textContent = `${theme} Mode`;
        }
    },
    
    bindEvents() {
        // Account nav links
        document.querySelectorAll('.account-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.dataset.section;
                
                // Update active state
                document.querySelectorAll('.account-nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Show section
                document.querySelectorAll('.account-section').forEach(s => s.classList.remove('active'));
                document.getElementById(`section-${sectionId}`)?.classList.add('active');
            });
        });
        
        // Security form
        document.getElementById('security-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('success', 'Updated', CONFIG.SUCCESS.PASSWORD_UPDATED);
        });
        
        // Open theme modal
        document.getElementById('open-theme-modal')?.addEventListener('click', () => {
            navigateTo('account'); // Stay on account page
            ThemeManager.toggleDropdown(); // Open theme dropdown
        });
        
        // Notifications toggle
        document.getElementById('notifications-toggle')?.addEventListener('change', function() {
            showToast('success', 'Settings Saved', `Notifications ${this.checked ? 'enabled' : 'disabled'}`);
        });
    }
};

window.AccountManager = AccountManager;

// Auth Form Manager (for login/signup page)
const AuthFormManager = {
    init() {
        // Reset forms
        document.querySelectorAll('.form-error').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    }
};

window.AuthFormManager = AuthFormManager;

document.addEventListener('DOMContentLoaded', () => {
    DashboardManager.init();
});