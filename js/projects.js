/**
 * ============================================
 * CODE FORGE - Projects Manager
 * ============================================
 */

const ProjectsManager = {
    currentProject: null,
    currentFile: null,
    projectFiles: {},
    
    // Render projects grid
    renderProjects(filters = {}) {
        const grid = document.getElementById('projects-grid');
        if (!grid) return;
        
        let projects = [...DATA.projects];
        
        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            projects = projects.filter(p =>
                p.title.toLowerCase().includes(searchLower) ||
                p.description.toLowerCase().includes(searchLower) ||
                p.technologies.some(t => t.toLowerCase().includes(searchLower))
            );
        }
        
        // Apply category filter
        if (filters.category && filters.category !== 'all') {
            projects = projects.filter(p => p.category === filters.category);
        }
        
        // Apply difficulty filter
        if (filters.difficulty && filters.difficulty !== 'all') {
            projects = projects.filter(p => p.difficulty === filters.difficulty);
        }
        
        // Sort by difficulty
        const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
        projects.sort((a, b) => (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0));
        
        if (projects.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-folder-open"></i>
                    <h3>No projects found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = projects.map(project => this.createProjectCard(project)).join('');
        
        // Bind events
        grid.querySelectorAll('.project-card').forEach(card => {
            card.querySelector('.btn-primary')?.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openWorkspace(card.dataset.project);
            });
            
            card.addEventListener('click', () => {
                this.openWorkspace(card.dataset.project);
            });
        });
    },
    
    // Create project card HTML
    createProjectCard(project) {
        const difficultyClass = `tag-${project.difficulty}`;
        return `
            <div class="project-card" data-project="${project.id}">
                <div class="project-card-preview" style="background: ${project.gradient};">
                    <i class="fas ${project.icon}"></i>
                </div>
                <div class="project-card-body">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                        <span class="tag ${difficultyClass}">${project.difficulty}</span>
                        <span style="font-size: 12px; color: var(--text-muted);">
                            <i class="fas fa-clock"></i> ${project.estimatedTime}
                        </span>
                    </div>
                    <h3 class="project-card-title">${project.title}</h3>
                    <p class="project-card-desc">${project.description}</p>
                    <div class="project-tags">
                        ${project.technologies.map(t => `<span class="tag">${t}</span>`).join('')}
                    </div>
                    <div class="project-card-footer">
                        <span style="font-size: 12px; color: var(--text-muted);">
                            ${project.features.length} features
                        </span>
                        <button class="btn btn-primary btn-sm">
                            <i class="fas fa-play"></i> Start
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Open project workspace
    openWorkspace(projectId) {
        const project = DATA.projects.find(p => p.id === projectId);
        if (!project) {
            showToast('error', 'Error', CONFIG.ERRORS.PROJECT_LOAD_FAILED);
            return;
        }
        
        this.currentProject = project;
        
        // Update workspace UI
        document.getElementById('workspace-project-title').textContent = project.title;
        
        // Initialize files
        this.initializeFiles(project);
        
        // Render file tree
        this.renderFileTree();
        
        // Open first file
        if (project.files.length > 0) {
            this.openFile(project.files[0].name);
        }
        
        // Navigate to workspace page
        navigateTo('project-workspace');
    },
    
    // Initialize project files with starter code or empty
    initializeFiles(project) {
        this.projectFiles = {};
        
        project.files.forEach(file => {
            const starterCode = project.starterCode?.[file.name] || 
                                 this.getDefaultStarterCode(file.type, file.name);
            this.projectFiles[file.name] = {
                type: file.type,
                content: starterCode,
                modified: false
            };
        });
    },
    
    // Get default starter code based on file type
    getDefaultStarterCode(type, filename) {
        switch(type) {
            case 'html':
                return `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>${filename}</title>\n</head>\n<body>\n    \n</body>\n</html>`;
                
            case 'css':
                return `/* Styles for ${filename} */\n\nbody {\n    font-family: sans-serif;\n    margin: 0;\n    padding: 20px;\n}\n`;
                
            case 'javascript':
                return `// JavaScript for ${filename}\n\nconsole.log('${filename} loaded');\n`;
                
            default:
                return '';
        }
    },
    
    // Render file tree in sidebar
    renderFileTree() {
        const treeEl = document.getElementById('file-tree');
        if (!treeEl || !this.currentProject) return;
        
        treeEl.innerHTML = this.currentProject.files.map(file => {
            const iconClass = this.getFileIcon(file.type);
            const isActive = this.currentFile === file.name ? 'active' : '';
            return `<li class="${isActive}" data-file="${file.name}">
                <i class="${iconClass}"></i> ${file.name}
            </li>`;
        }).join('');
        
        // Bind click events
        treeEl.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', () => {
                this.openFile(li.dataset.file);
            });
        });
    },
    
    // Get file icon by type
    getFileIcon(type) {
        const icons = {
            html: 'fab fa-html5',
            css: 'fab fa-css3-alt',
            javascript: 'fab fa-js-square',
            json: 'fas fa-code',
            md: 'fab fa-markdown'
        };
        return icons[type] || 'fas fa-file-code';
    },
    
    // Open a specific file
    openFile(filename) {
        this.currentFile = filename;
        const fileData = this.projectFiles[filename];
        if (!fileData) return;
        
        // Update editor content
        const editor = document.getElementById('workspace-editor');
        if (editor) {
            editor.value = fileData.content;
        }
        
        // Update tabs
        this.renderTabs();
        
        // Update file tree active state
        document.querySelectorAll('#file-tree li').forEach(li => {
            li.classList.toggle('active', li.dataset.file === filename);
        });
        
        // Update preview for HTML files
        if (fileData.type === 'html') {
            this.updatePreview();
        }
    },
    
    // Render open file tabs
    renderTabs() {
        const tabsEl = document.getElementById('workspace-tabs');
        if (!tabsEl) return;
        
        tabsEl.innerHTML = Object.keys(this.projectFiles).map(filename => {
            const fileData = this.projectFiles[filename];
            const isActive = this.currentFile === filename ? 'active' : '';
            const iconClass = this.getFileIcon(fileData.type);
            const modifiedMarker = fileData.modified ? '<span class="modified-dot"></span>' : '';
            
            return `<button class="panel-tab ${isActive}" data-tab-file="${filename}">
                <i class="${iconClass}"></i> ${filename}${modifiedMarker}
            </button>`;
        }).join('');
        
        // Bind tab clicks
        tabsEl.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.openFile(btn.dataset.tabFile);
            });
        });
    },
    
    // Update preview iframe
    updatePreview() {
        const previewFrame = document.getElementById('workspace-preview');
        if (!previewFrame || !this.currentProject) return;
        
        // Combine HTML, CSS, and JS files
        const htmlContent = this.projectFiles['index.html']?.content || '';
        const cssContent = this.projectFiles['styles.css']?.content || '';
        const jsContent = this.projectFiles['script.js']?.content || '';
        
        // Inject CSS and JS into HTML
        let fullContent = htmlContent;
        
        // Insert CSS before </head>
        if (cssContent && fullContent.includes('</head>')) {
            fullContent = fullContent.replace(
                '</head>',
                `<style>${cssContent}</style></head>`
            );
        }
        
        // Insert JS before </body>
        if (jsContent && fullContent.includes('</body>')) {
            fullContent = fullContent.replace(
                '</body>',
                `<script>${jsContent}</script></body>`
            );
        }
        
        try {
            const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
            doc.open();
            doc.write(fullContent);
            doc.close();
        } catch(e) {
            console.error('Preview error:', e);
        }
    },
    
    // Save current file changes
    saveCurrentFile() {
        if (!this.currentFile) return false;
        
        const editor = document.getElementById('workspace-editor');
        const fileData = this.projectFiles[this.currentFile];
        
        if (editor && fileData) {
            fileData.content = editor.value;
            fileData.modified = true;
            this.renderTabs();
            this.updatePreview();
            
            showToast('success', 'Saved', `"${this.currentFile}" saved successfully`);
            return true;
        }
        
        return false;
    },
    
    // Reset current project to starter code
    resetProject() {
        if (!this.currentProject) return;
        
        if (!confirm('Reset all files to starter code? Your changes will be lost.')) {
            return;
        }
        
        this.initializeFiles(this.currentProject);
        this.renderFileTree();
        
        if (this.currentFile) {
            this.openFile(this.currentFile);
        }
        
        showToast('info', 'Reset', 'Project has been reset to starter code');
    },
    
    // Save project to localStorage
    saveProject() {
        if (!this.currentProject || !AuthManager.isLoggedIn()) {
            showToast('warning', 'Login Required', 'Please login to save your progress.');
            navigateTo('auth');
            return;
        }
        
        // Collect all current file contents
        const editor = document.getElementById('workspace-editor');
        if (editor && this.currentFile) {
            this.projectFiles[this.currentFile].content = editor.value;
        }
        
        // Save to localStorage (in production, use backend API)
        try {
            const savedProjects = JSON.parse(localStorage.getItem(CONFIG.APP.PROJECTS_STORAGE_KEY) || '{}');
            savedProjects[this.currentProject.id] = {
                ...this.currentProject,
                files: this.projectFiles,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem(CONFIG.APP.PROJECTS_STORAGE_KEY, JSON.stringify(savedProjects));
            
            showToast('success', 'Project Saved', `"${this.currentProject.title}" has been saved!`);
        } catch(e) {
            showToast('error', 'Save Failed', e.message);
        }
    },
    
    // Bind event listeners
    init() {
        // Search input
        const searchInput = document.getElementById('project-search');
        searchInput?.addEventListener('input', debounce((e) => {
            this.renderProjects({ search: e.target.value });
        }, 300));
        
        // Category filter
        document.getElementById('project-category-filter')?.addEventListener('change', (e) => {
            this.renderProjects({ category: e.target.value });
        });
        
        // Difficulty filter
        document.getElementById('project-difficulty-filter')?.addEventListener('change', (e) => {
            this.renderProjects({ difficulty: e.target.value });
        });
        
        // Workspace buttons
        document.getElementById('workspace-reset-btn')?.addEventListener('click', () => {
            this.resetProject();
        });
        
        document.getElementById('workspace-save-btn')?.addEventListener('click', () => {
            this.saveProject();
        });
        
        // Editor change detection
        const editor = document.getElementById('workspace-editor');
        editor?.addEventListener('input', debounce(() => {
            if (this.currentFile) {
                this.projectFiles[this.currentFile].modified = true;
                // Auto-update preview for certain file types
                const fileType = this.projectFiles[this.currentFile]?.type;
                if (fileType === 'html' || fileType === 'css') {
                    this.updatePreview();
                }
            }
        }, 500));
        
        // Keyboard shortcut - Ctrl+S to save
        editor?.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveProject();
            }
            
            // Tab key support
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                e.target.value = e.target.value.substring(0, start) + '    ' + e.target.value.substring(end);
                e.target.selectionStart = e.target.selectionEnd = start + 4;
            }
        });
        
        // Initial render
        this.renderProjects();
    }
};

// Expose globally
window.ProjectsManager = ProjectsManager;

document.addEventListener('DOMContentLoaded', () => {
    ProjectsManager.init();
});