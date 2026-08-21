/**
 * ============================================
 * CODE FORGE - Playground Manager
 * ============================================
 */

const PlaygroundManager = {
    currentLanguage: 'html-css-js',
    defaultCode: null,
    isRunning: false,
    
    // Initialize playground
    init() {
        this.loadCode();
        this.bindEvents();
        this.updateStatus('ready');
    },
    
    // Load code for selected language
    loadCode() {
        const editor = document.getElementById('code-editor');
        if (!editor) return;
        
        const template = DATA.playgroundTemplates[this.currentLanguage] || 
                         DATA.playgroundTemplates['html-css-js'];
        
        editor.value = template;
        this.defaultCode = template;
    },
    
    // Run code
    async runCode() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.updateStatus('running');
        
        const code = document.getElementById('code-editor')?.value;
        const outputEl = document.getElementById('output-area');
        const previewContainer = document.getElementById('preview-container');
        const previewFrame = document.getElementById('preview-frame');
        const outputContainer = document.getElementById('output-container');
        
        try {
            switch (this.currentLanguage) {
                case 'html-css-js':
                    this.runHTMLPreview(code);
                    break;
                    
                case 'javascript':
                    this.runJavaScript(code, outputEl);
                    break;
                    
                case 'python':
                    this.showUnsupportedMessage(outputEl, 'Python', 
                        'Python execution requires a backend service. Configure PYTHON_API_KEY to enable.');
                    break;
                    
                case 'java':
                    this.showUnsupportedMessage(outputEl, 'Java',
                        'Java compilation requires a backend service. Configure JAVA_EXECUTOR to enable.');
                    break;
                    
                default:
                    outputEl.textContent = `Unknown language: ${this.currentLanguage}`;
            }
            
            this.updateStatus('ready');
        } catch (error) {
            this.showError(error.message || error);
            this.updateStatus('error');
        }
        
        this.isRunning = false;
    },
    
    // Run HTML/CSS/JS with live preview
    runHTMLPreview(code) {
        const previewFrame = document.getElementById('preview-frame');
        const previewTabBtn = document.getElementById('preview-tab-btn');
        const outputArea = document.getElementById('output-area');
        
        if (previewFrame) {
            // Write code to iframe
            const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
            doc.open();
            doc.write(code);
            doc.close();
            
            // Switch to preview tab
            previewTabBtn?.click();
        } else {
            outputArea.textContent = 'Preview frame not available. Please refresh the page.';
        }
    },
    
    // Run JavaScript code
    runJavaScript(code, outputEl) {
        // Clear previous output
        if (outputEl) {
            outputEl.innerHTML = '';
        }
        
        // Capture console output
        const logs = [];
        const errors = [];
        const originalConsoleLog = console.log;
        const originalConsoleError = console.error;
        const originalConsoleWarn = console.warn;
        const originalConsoleInfo = console.info;
        
        console.log = (...args) => {
            logs.push({ type: 'log', content: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') });
            originalConsoleLog.apply(console, args);
        };
        
        console.error = (...args) => {
            errors.push(args.join(' '));
            originalConsoleError.apply(console, args);
        };
        
        console.warn = (...args) => {
            logs.push({ type: 'warn', content: args.join(' ') });
            originalConsoleWarn.apply(console, args);
        };
        
        console.info = (...args) => {
            logs.push({ type: 'info', content: args.join(' ') });
            originalConsoleInfo.apply(console, args);
        };
        
        try {
            // Execute the code
            const result = eval(code);
            
            // Restore console
            console.log = originalConsoleLog;
            console.error = originalConsoleError;
            console.warn = originalConsoleWarn;
            console.info = originalConsoleInfo;
            
            // Display results
            let output = '';
            
            if (logs.length > 0) {
                logs.forEach(log => {
                    switch(log.type) {
                        case 'warn': output += `⚠️ Warning: ${log.content}\n`; break;
                        case 'info': output += `ℹ️ ${log.content}\n`; break;
                        default: output += `${log.content}\n`;
                    }
                });
            }
            
            if (result !== undefined && result !== null) {
                output += `\n↳ Return value: ${typeof result === 'object' ? JSON.stringify(result, null, 2) : result}`;
            }
            
            if (errors.length > 0) {
                errors.forEach(err => output += `\n❌ Error: ${err}`);
            }
            
            if (!output.trim()) {
                output = '✅ Code executed successfully (no output)';
            }
            
            if (outputEl) {
                outputEl.textContent = output;
            }
            
        } catch (error) {
            // Restore console on error
            console.log = originalConsoleLog;
            console.error = originalConsoleError;
            console.warn = originalConsoleWarn;
            console.info = originalConsoleInfo;
            
            this.showError(error.message);
        }
    },
    
    // Show unsupported language message
    showUnsupportedMessage(outputEl, lang, message) {
        if (outputEl) {
            outputEl.innerHTML = `
⚠️ ${lang} Execution Not Available

${message}

To enable:
1. Set up your backend server
2. Configure the appropriate API key
3. Create an execution endpoint

For now, you can still write and edit ${lang} code here.
`;
        }
    },
    
    // Show error in output
    showError(message) {
        const outputEl = document.getElementById('output-area');
        if (outputEl) {
            outputEl.innerHTML = `<span style="color: var(--error-color);">❌ Error:\n${message}</span>`;
        }
    },
    
    // Reset editor
    resetEditor() {
        const editor = document.getElementById('code-editor');
        const outputEl = document.getElementById('output-area');
        
        if (editor) {
            editor.value = this.defaultCode || DATA.playgroundTemplates[this.currentLanguage];
        }
        
        if (outputEl) {
            outputEl.textContent = '// Output will appear here after running code';
        }
        
        // Clear preview
        const previewFrame = document.getElementById('preview-frame');
        if (previewFrame) {
            try {
                const doc = previewFrame.contentDocument;
                doc.body.innerHTML = '';
            } catch {}
        }
        
        showToast('info', 'Editor Reset', 'Code has been reset to starter template');
    },
    
    // Update status indicator
    updateStatus(status) {
        const dot = document.getElementById('status-dot');
        const text = document.getElementById('status-text');
        
        if (dot) {
            dot.className = 'status-dot status-' + status;
        }
        
        if (text) {
            const statusTexts = {
                ready: 'Ready',
                running: 'Running...',
                error: 'Error'
            };
            text.textContent = statusTexts[status] || status;
        }
    },
    
    // Change language
    changeLanguage(langId) {
        this.currentLanguage = langId;
        this.loadCode();
        
        // Update UI
        const previewTabBtn = document.getElementById('preview-tab-btn');
        if (langId === 'html-css-js') {
            previewTabBtn.style.display = '';
        } else {
            previewTabBtn.style.display = 'none';
        }
        
        // Switch to output tab
        document.querySelector('[data-tab="output-tab"]')?.click();
        
        // Reset output
        const outputEl = document.getElementById('output-area');
        if (outputEl) {
            outputEl.textContent = `// Ready to run ${langId.toUpperCase()} code\n// Click "Run Code" or press Ctrl+Enter`;
        }
    },
    
    // Bind event listeners
    bindEvents() {
        // Run button
        document.getElementById('run-btn')?.addEventListener('click', () => {
            this.runCode();
        });
        
        // Reset button
        document.getElementById('reset-btn')?.addEventListener('click', () => {
            this.resetEditor();
        });
        
        // Language selector
        document.getElementById('playground-language')?.addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });
        
        // Panel tabs (Output/Preview)
        document.querySelectorAll('.panel-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const parentPanel = tab.closest('.output-panel') || tab.closest('.editor-panel');
                
                // Update active state within panel
                parentPanel.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Toggle visibility
                const tabName = tab.dataset.tab;
                if (tabName === 'output-tab') {
                    document.getElementById('output-container')?.classList.remove('hidden');
                    document.getElementById('preview-container')?.classList.add('hidden');
                } else if (tabName === 'preview-tab') {
                    document.getElementById('output-container')?.classList.add('hidden');
                    document.getElementById('preview-container')?.classList.remove('hidden');
                }
            });
        });
        
        // Keyboard shortcut - Ctrl+Enter / Cmd+Enter to run
        document.getElementById('code-editor')?.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.runCode();
            }
            
            // Tab key support for indentation
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                e.target.value = e.target.value.substring(0, start) + '    ' + e.target.value.substring(end);
                e.target.selectionStart = e.target.selectionEnd = start + 4;
            }
        });
        
        // Resizer drag functionality
        this.initResizer();
    },
    
    // Initialize resizer between panels
    initResizer() {
        const resizer = document.getElementById('resizer');
        const editorPanel = document.querySelector('.editor-panel');
        const outputPanel = document.querySelector('.output-panel');
        
        if (!resizer || !editorPanel || !outputPanel) return;
        
        let isResizing = false;
        let startX = 0;
        let startWidth = 0;
        
        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = editorPanel.offsetWidth;
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            resizer.style.background = '#6366f1';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            
            const diff = e.clientX - startX;
            const newWidth = Math.max(300, Math.min(startWidth + diff, window.innerWidth - 400));
            editorPanel.style.flex = `0 0 ${newWidth}px`;
        });
        
        document.addEventListener('mouseup', () => {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            resizer.style.background = '';
        });
    }
};

// Expose globally
window.PlaygroundManager = PlaygroundManager;

document.addEventListener('DOMContentLoaded', () => {
    PlaygroundManager.init();
});