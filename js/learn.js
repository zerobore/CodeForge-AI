/**
 * ============================================
 * CODE FORGE - Learning Manager
 * ============================================
 */

const LearnManager = {
    currentCourse: null,
    currentLesson: null,
    activeCategory: 'all',
    
    // Render courses grid on learn page
    renderCourses(category = 'all') {
        const grid = document.getElementById('learn-grid');
        if (!grid) return;
        
        this.activeCategory = category;
        
        let languages = [...DATA.languages];
        
        // Filter by category
        if (category !== 'all') {
            switch(category) {
                case 'web':
                    languages = languages.filter(l => ['html', 'css', 'javascript', 'react'].includes(l.id));
                    break;
                case 'programming':
                    languages = languages.filter(l => 
                        !['html', 'css', 'sql', 'react', 'nodejs', 'php'].includes(l.id) && 
                        l.category !== 'database' && l.category !== 'backend'
                    );
                    break;
                case 'backend':
                    languages = languages.filter(l => l.category === 'backend');
                    break;
                case 'database':
                    languages = languages.filter(l => l.category === 'database');
                    break;
                case 'beginner':
                    languages = languages.filter(l => l.difficulty === 'beginner');
                    break;
            }
        }
        
        grid.innerHTML = languages.map(lang => this.createCourseCard(lang)).join('');
        
        // Bind card clicks
        grid.querySelectorAll('.learn-card').forEach(card => {
            card.addEventListener('click', () => {
                this.openCourse(card.dataset.course);
            });
        });
    },
    
    // Create course card HTML
    createCourseCard(lang) {
        const difficultyClass = `difficulty-${lang.difficulty}`;
        return `
            <div class="learn-card" data-course="${lang.id}">
                <div class="learn-card-header">
                    <div class="learn-icon" style="background: ${lang.gradient};">
                        <i class="${lang.icon}"></i>
                    </div>
                    <div class="learn-info">
                        <h3>${lang.name}</h3>
                        <span class="learn-difficulty ${difficultyClass}">${lang.difficulty}</span>
                    </div>
                </div>
                <p class="learn-desc">${lang.description}</p>
                <div class="learn-stats">
                    <span class="learn-stat">
                        <i class="fas fa-book-open"></i> ${lang.lessonsCount} lessons
                    </span>
                    <span class="learn-stat">
                        <i class="fas fa-clock"></i> ${lang.duration}
                    </span>
                </div>
            </div>
        `;
    },
    
    // Open a specific course
    openCourse(courseId) {
        const course = DATA.courses[courseId];
        const langData = DATA.languages.find(l => l.id === courseId);
        
        if (!course && !langData) {
            showToast('warning', 'Not Available', `Content for ${courseId} is coming soon!`);
            return;
        }
        
        this.currentCourse = courseId;
        this.currentLesson = null;
        
        // Update page title
        document.getElementById('current-course-title').textContent = 
            (course?.title || langData?.name || courseId);
        
        // Render lesson sidebar
        this.renderLessonNav(course, langData);
        
        // Show first lesson or placeholder
        if (course?.levels) {
            const firstLevel = Object.keys(course.levels)[0];
            const firstLesson = course.levels[firstLevel][0];
            this.showLesson(firstLesson.id, langData);
        } else {
            this.showPlaceholder(courseId, langData);
        }
        
        // Navigate to learning detail page
        navigateTo('learning-detail');
    },
    
    // Render lesson navigation sidebar
    renderLessonNav(course, langData) {
        const navEl = document.getElementById('lesson-nav');
        if (!navEl) return;
        
        if (!course?.levels) {
            navEl.innerHTML = `
                <div style="padding: 1rem; text-align: center; color: var(--text-tertiary);">
                    <i class="fas fa-wrench" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
                    Course content being prepared
                </div>
            `;
            return;
        }
        
        let html = '';
        let totalLessons = 0;
        let completedCount = 0;
        
        Object.entries(course.levels).forEach(([levelName, lessons]) => {
            html += `<div class="level-section" data-level="${levelName}">`;
            html += `<div class="level-title">${levelName.charAt(0).toUpperCase() + levelName.slice(1)}</div>`;
            
            lessons.forEach(lesson => {
                totalLessons++;
                const isCompleted = this.isLessonCompleted(lesson.id);
                if (isCompleted) completedCount++;
                
                html += `
                    <button class="lesson-item ${isCompleted ? 'completed' : ''}" 
                            data-lesson="${lesson.id}"
                            title="${lesson.title} (${lesson.duration})">
                        <span class="lesson-num">${isCompleted ? '<i class="fas fa-check"></i>' : totalLessons}</span>
                        <span>${lesson.title}</span>
                    </button>
                `;
            });
            
            html += '</div>';
        });
        
        navEl.innerHTML = html;
        
        // Update progress bar
        const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
        document.getElementById('course-progress-bar').style.width = `${progressPct}%`;
        document.getElementById('progress-text').textContent = `${progressPct}% Complete`;
        
        // Bind click events
        navEl.querySelectorAll('.lesson-item').forEach(item => {
            item.addEventListener('click', () => {
                const lessonId = item.dataset.lesson;
                this.showLesson(lessonId, langData);
                
                // Update active state
                navEl.querySelectorAll('.lesson-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
            });
        });
    },
    
    // Show a specific lesson
    showLesson(lessonId, langData) {
        this.currentLesson = lessonId;
        const contentArea = document.getElementById('lesson-content');
        const lessonData = DATA.lessons[lessonId];
        
        if (contentArea) {
            if (lessonData) {
                contentArea.innerHTML = lessonData.content;
            } else {
                contentArea.innerHTML = this.getLessonPlaceholder(lessonId, langData);
            }
            
            // Update lesson navigation buttons
            this.updateLessonNav(lessonId);
        }
        
        // Update sidebar active state
        const lessonItem = document.querySelector(`[data-lesson="${lessonId}"]`);
        if (lessonItem) {
            document.querySelectorAll('.lesson-item').forEach(l => l.classList.remove('active'));
            lessonItem.classList.add('active');
            lessonItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        // Mark as completed (for demo)
        this.markLessonViewed(lessonId);
    },
    
    // Get placeholder for uncreated lessons
    getLessonPlaceholder(lessonId, langData) {
        const name = langData?.name || 'This';
        return `
            <h1>${lessonId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h1>
            <div class="tip-box">
                <strong>📝 Content Coming Soon</strong>
                <p>This ${name.toLowerCase()} lesson is currently being prepared. Check back soon for comprehensive learning material!</p>
            </div>
            <h2>What You'll Learn</h2>
            <ul>
                <li>Fundamental concepts and syntax</li>
                <li>Practical examples and use cases</li>
                <li>Best practices and common patterns</li>
                <li>Hands-on exercises to reinforce learning</li>
            </ul>
            <h2>Preparation</h2>
            <p>Make sure you have completed all previous lessons in this path. You can practice your skills in the <a href="#" data-page="playground">Code Playground</a>.</p>
        `;
    },
    
    // Show placeholder when no course exists
    showPlaceholder(courseId, langData) {
        const contentArea = document.getElementById('lesson-content');
        if (!contentArea) return;
        
        const name = langData?.name || courseId;
        const icon = langData?.icon || 'fas fa-code';
        const gradient = langData?.gradient || 'var(--accent-gradient)';
        
        contentArea.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="width: 80px; height: 80px; background: ${gradient}; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 36px; color: white; margin: 0 auto 1.5rem;">
                    <i class="${icon}"></i>
                </div>
                <h1>${name}</h1>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                    Complete ${name.toLowerCase()} course is coming soon! In the meantime, you can:
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="navigateTo('playground')">
                        <i class="fas fa-terminal"></i> Practice in Playground
                    </button>
                    <button class="btn btn-accent" onclick="navigateTo('ai-assistant')">
                        <i class="fas fa-robot"></i> Ask AI Assistant
                    </button>
                </div>
            </div>
        `;
        
        // Update navigation buttons
        document.getElementById('prev-lesson-btn').disabled = true;
        document.getElementById('next-lesson-btn').disabled = true;
    },
    
    // Update prev/next lesson buttons
    updateLessonNav(currentLessonId) {
        const course = DATA.courses[this.currentCourse];
        if (!course?.levels) return;
        
        const allLessons = [];
        Object.values(course.levels).forEach(level => {
            level.forEach(lesson => allLessons.push(lesson));
        });
        
        const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
        
        const prevBtn = document.getElementById('prev-lesson-btn');
        const nextBtn = document.getElementById('next-lesson-btn');
        
        if (prevBtn) {
            prevBtn.disabled = currentIndex <= 0;
            prevBtn.onclick = () => {
                if (currentIndex > 0) {
                    this.showLesson(allLessons[currentIndex - 1].id, 
                        DATA.languages.find(l => l.id === this.currentCourse));
                }
            };
        }
        
        if (nextBtn) {
            nextBtn.disabled = currentIndex >= allLessons.length - 1;
            nextBtn.onclick = () => {
                if (currentIndex < allLessons.length - 1) {
                    this.showLesson(allLessons[currentIndex + 1].id,
                        DATA.languages.find(l => l.id === this.currentCourse));
                }
            };
        }
    },
    
    // Progress tracking helpers
    isLessonCompleted(lessonId) {
        try {
            const progress = JSON.parse(localStorage.getItem(CONFIG.APP.PROGRESS_STORAGE_KEY) || '{}');
            return !!progress.completedLessons?.[lessonId];
        } catch { return false; }
    },
    
    markLessonViewed(lessonId) {
        try {
            const progress = JSON.parse(localStorage.getItem(CONFIG.APP.PROGRESS_STORAGE_KEY) || '{}');
            if (!progress.completedLessons) progress.completedLessons = {};
            progress.completedLessons[lessonId] = true;
            localStorage.setItem(CONFIG.APP.PROGRESS_STORAGE_KEY, JSON.stringify(progress));
        } catch {}
    },
    
    // Bind category filters
    init() {
        // Category chips
        document.querySelectorAll('.category-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.renderCourses(chip.dataset.category);
            });
        });
        
        // Initial render
        this.renderCourses('all');
    }
};

// Expose globally
window.LearnManager = LearnManager;

document.addEventListener('DOMContentLoaded', () => {
    LearnManager.init();
});