/**
 * ============================================
 * CODE FORGE - Languages Manager
 * ============================================
 */

const LanguagesManager = {
    currentFilter: { category: 'all', difficulty: 'all', search: '' },
    
    // Render languages grid
    renderLanguages(filters = {}) {
        const grid = document.getElementById('languages-grid');
        if (!grid) return;
        
        this.currentFilter = { ...this.currentFilter, ...filters };
        
        let languages = [...DATA.languages];
        
        // Apply search filter
        if (this.currentFilter.search) {
            const searchLower = this.currentFilter.search.toLowerCase();
            languages = languages.filter(l => 
                l.name.toLowerCase().includes(searchLower) ||
                l.fullName.toLowerCase().includes(searchLower) ||
                l.description.toLowerCase().includes(searchLower) ||
                l.category.toLowerCase().includes(searchLower) ||
                l.tags.some(t => t.toLowerCase().includes(searchLower))
            );
        }
        
        // Apply category filter
        if (this.currentFilter.category !== 'all') {
            languages = languages.filter(l => l.category === this.currentFilter.category);
        }
        
        // Apply difficulty filter
        if (this.currentFilter.difficulty !== 'all') {
            languages = languages.filter(l => l.difficulty === this.currentFilter.difficulty);
        }
        
        // Sort alphabetically
        languages.sort((a, b) => a.name.localeCompare(b.name));
        
        if (languages.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-search"></i>
                    <h3>No languages found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = languages.map(lang => this.createLanguageCard(lang)).join('');
        
        // Bind card events
        grid.querySelectorAll('.language-card').forEach(card => {
            card.querySelector('.btn-primary')?.addEventListener('click', (e) => {
                e.stopPropagation();
                LearnManager.openCourse(card.dataset.lang);
            });
            
            card.addEventListener('click', () => {
                LearnManager.openCourse(card.dataset.lang);
            });
        });
    },
    
    // Create language card HTML
    createLanguageCard(lang) {
        const difficultyClass = `difficulty-${lang.difficulty}`;
        return `
            <div class="language-card" data-lang="${lang.id}">
                <div class="language-card-header">
                    <div class="language-icon" style="background: ${lang.gradient}; ${lang.textColor ? `color: ${lang.textColor}` : ''}">
                        <i class="${lang.icon}"></i>
                    </div>
                    <div class="language-info">
                        <h3>${lang.name}</h3>
                        <span class="language-category">${lang.category}</span>
                    </div>
                </div>
                <p class="language-desc">${lang.description}</p>
                <div class="language-tags">
                    <span class="tag ${difficultyClass}">${lang.difficulty}</span>
                    ${lang.tags.slice(0, 2).map(t => `<span class="tag">${t}</span>`).join('')}
                </div>
                <div class="language-actions">
                    <button class="btn btn-primary btn-sm">
                        <i class="fas fa-book-open"></i> Learn
                    </button>
                    <button class="btn btn-outline btn-sm" data-page="playground" onclick="event.stopPropagation(); navigateTo('playground');">
                        <i class="fas fa-code"></i> Practice
                    </button>
                </div>
            </div>
        `;
    },
    
    // Initialize bindings
    init() {
        const searchInput = document.getElementById('language-search');
        const categorySelect = document.getElementById('category-filter');
        const difficultySelect = document.getElementById('difficulty-filter');
        
        // Search input
        searchInput?.addEventListener('input', debounce((e) => {
            this.renderLanguages({ search: e.target.value });
        }, 300));
        
        // Category select
        categorySelect?.addEventListener('change', (e) => {
            this.renderLanguages({ category: e.target.value });
        });
        
        // Difficulty select
        difficultySelect?.addEventListener('change', (e) => {
            this.renderLanguages({ difficulty: e.target.value });
        });
        
        // Initial render
        this.renderLanguages();
    }
};

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Expose globally
window.LanguagesManager = LanguagesManager;

document.addEventListener('DOMContentLoaded', () => {
    LanguagesManager.init();
});