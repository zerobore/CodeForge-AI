/**
 * ============================================
 * CODE FORGE - AI Assistant Manager
 * Supporting: ChatGPT, Gemini, and Claude
 * ============================================
 * 
 * v1.1.0:
 * - FIXED: fatal syntax error that prevented this module from loading
 * - Tier-based access control (Guest=ChatGPT, Google=+Gemini, VIP=All)
 * - Unique animated chat themes (via ChatThemeManager)
 * - Message entrance animations + animated typing indicator
 * - Robust code-block copy buttons (no more fragile inline onclick)
 * - AI usage counters that power the dashboard + admin panel
 */

const AIAssistantManager = {
    currentProvider: 'chatgpt',
    chatHistory: [],
    isGenerating: false,
    
    init() {
        this.restoreProvider();
        this.renderWelcomeMessage();
        this.bindEvents();
    },
    
    // Restore a valid provider for the current tier (e.g. after logout)
    restoreProvider() {
        const tier = (typeof AuthManager !== 'undefined') ? AuthManager.getAccessTier() : null;
        const allowed = tier ? tier.providers : ['chatgpt'];
        if (!allowed.includes(this.currentProvider)) {
            this.currentProvider = 'chatgpt';
        }
        this.selectProvider(this.currentProvider, { silent: true });
    },
    
    renderWelcomeMessage() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        const tier = (typeof AuthManager !== 'undefined') ? AuthManager.getAccessTier() : CONFIG.AI_ACCESS.TIERS.GUEST;
        const themeName = (typeof ChatThemeManager !== 'undefined') ? ChatThemeManager.getCurrentTheme().name : 'Neon Pulse';
        
        if (this.chatHistory.length === 0 && !messagesContainer.querySelector('.welcome-message')) {
            messagesContainer.innerHTML = `
                <div class="welcome-message msg-enter">
                    <div class="welcome-icon"><i class="fas fa-robot"></i></div>
                    <h3>Welcome to Code Forge AI</h3>
                    <p class="welcome-tier"><i class="fas fa-unlock-alt"></i> Access tier: <strong>${tier.name}</strong> — ${tier.description}</p>
                    <p>I'm here to help you with coding tasks. Ask me anything about:</p>
                    <ul>
                        <li>Writing or explaining code</li>
                        <li>Debugging and fixing errors</li>
                        <li>Building projects step by step</li>
                        <li>Learning programming concepts</li>
                        <li>Best practices and patterns</li>
                    </ul>
                    <p>Try one of the quick actions or type your question below!</p>
                    <p class="welcome-theme-hint"><i class="fas fa-palette"></i> Current chat theme: <strong>${themeName}</strong></p>
                </div>
            `;
        }
    },
    
    // Check access through the tier system
    checkProviderAccess(providerId) {
        if (typeof AuthManager !== 'undefined') {
            return AuthManager.canUseProvider(providerId);
        }
        return providerId === 'chatgpt';
    },
    
    // Select an AI provider (enforces access tiers)
    selectProvider(providerId, options = {}) {
        const { silent = false } = options;
        
        if (!this.checkProviderAccess(providerId)) {
            if (!silent) {
                if (providerId === 'gemini') {
                    showToast('warning', 'Google Sign-in Required', CONFIG.ERRORS.GEMINI_REQUIRES_AUTH);
                    this.promptGoogleAuth();
                } else if (providerId === 'claude') {
                    showToast('warning', 'VIP Required', CONFIG.ERRORS.CLAUDE_REQUIRES_VIP);
                    this.promptVIPUpgrade();
                }
            }
            return false;
        }
        
        this.currentProvider = providerId;
        document.querySelectorAll('.provider-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.provider === providerId);
        });
        
        const displayEl = document.getElementById('chat-provider-display');
        const providerNames = {
            chatgpt: { name: 'ChatGPT', icon: 'fa-comment-dots' },
            gemini: { name: 'Gemini', icon: 'fa-brain' },
            claude: { name: 'Claude', icon: 'fa-shield-halved' }
        };
        if (displayEl && providerNames[providerId]) {
            displayEl.innerHTML = `<i class="fas ${providerNames[providerId].icon}"></i> <span>${providerNames[providerId].name}</span>`;
        }
        return true;
    },
    
    // Open the "Google auth required" modal
    promptGoogleAuth() {
        const modal = document.getElementById('google-auth-modal');
        if (modal) {
            modal.style.display = 'flex';
        } else if (typeof navigateTo === 'function') {
            navigateTo('auth');
        }
    },
    
    // Open the VIP upgrade modal
    promptVIPUpgrade() {
        const modal = document.getElementById('vip-modal');
        if (modal) {
            modal.style.display = 'flex';
        } else if (typeof navigateTo === 'function') {
            navigateTo('vip');
        }
    },
    
    // Track AI usage (dashboard stat + admin overview)
    trackUsage(isNewConversation) {
        try {
            const usage = JSON.parse(localStorage.getItem(CONFIG.APP.AI_USAGE_KEY) || '{}');
            usage.total = (usage.total || 0) + 1;
            usage.conversations = (usage.conversations || 0) + (isNewConversation ? 1 : 0);
            usage.perProvider = usage.perProvider || {};
            usage.perProvider[this.currentProvider] = (usage.perProvider[this.currentProvider] || 0) + 1;
            usage.lastUsed = new Date().toISOString();
            localStorage.setItem(CONFIG.APP.AI_USAGE_KEY, JSON.stringify(usage));
        } catch (e) { /* non-critical */ }
    },
    
    async sendMessage() {
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        const message = input?.value.trim();
        
        if (!message || this.isGenerating) return;
        
        // Enforce tier access at send time too (defense in depth)
        if (!this.checkProviderAccess(this.currentProvider)) {
            this.selectProvider(this.currentProvider);
            return;
        }
        
        const isNewConversation = this.chatHistory.length === 0;
        
        input.value = '';
        input.style.height = 'auto';
        sendBtn.disabled = true;
        
        this.addMessage(message, 'user');
        this.hideWelcomeMessage();
        this.trackUsage(isNewConversation);
        
        this.isGenerating = true;
        this.showTypingIndicator();
        
        try {
            await this.generateResponse(message);
        } catch (error) {
            console.error('AI Error:', error);
            this.addMessage(`API Error: ${error.message || 'Please configure API keys or check your connection.'}`, 'ai', true);
        } finally {
            this.removeTypingIndicator();
            this.isGenerating = false;
            sendBtn.disabled = !input.value.trim();
        }
    },
    
    async generateResponse(userMessage) {
        const providerConfig = CONFIG[this.currentProvider.toUpperCase()];
        
        // Demo mode: when no API key is configured we still respond with
        // provider-flavoured simulated answers so every tier is usable.
        const liveMode = providerConfig && providerConfig.API_KEY && providerConfig.CONFIGURED;
        
        await new Promise(resolve => setTimeout(resolve, 900));
        
        let replyText;
        if (this.currentProvider === 'claude') {
            replyText = this.getClaudeResponse(userMessage, liveMode);
        } else if (this.currentProvider === 'gemini') {
            replyText = this.getGeminiResponse(userMessage, liveMode);
        } else {
            replyText = this.getChatGPTResponse(userMessage, liveMode);
        }
        
        this.addMessage(replyText, 'ai');
        
        if (this.chatHistory.length > CONFIG.APP.MAX_CHAT_HISTORY) {
            this.chatHistory = this.chatHistory.slice(-CONFIG.APP.MAX_CHAT_HISTORY);
        }
    },
    
    getChatGPTResponse(message, liveMode = false) {
        const lowerMsg = message.toLowerCase();
        
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
            return `Hello! 👋 I'm ChatGPT, your AI coding assistant. How can I help you with your programming today?\n\nYou can ask me to:\n• Write code in any language\n• Explain programming concepts\n• Debug errors\n• Review your code\n• Suggest improvements`;
        }
        
        if (lowerMsg.includes('explain') || lowerMsg.includes('what is')) {
            return `I'd be happy to explain! Let me break it down for you.\n\nCould you share the specific code or concept you'd like me to explain?\n\nIn the meantime, I can help with:\n• **Variables & Data Types**\n• **Functions & Scope**\n• **DOM Manipulation**\n• **Async Programming**\n• **Design Patterns**\n\nJust paste the code or describe the concept, and I'll give you a clear explanation with examples!`;
        }
        
        if (lowerMsg.includes('debug') || lowerMsg.includes('error') || lowerMsg.includes('fix')) {
            return `I can help debug your code! 🔍\n\nTo help me find the issue faster, please include:\n\n1. **The error message** you're seeing\n2. **The relevant code** causing the error\n3. **What you expected** vs **what's happening**\n\nCommon debugging steps:\n- Console.log at key points\n- Check variable types\n- Verify API responses\n- Look for typos\n- Check async timing issues\n\nShare your code and I'll help identify and fix the problem!`;
        }
        
        if (lowerMsg.includes('project idea') || lowerMsg.includes('build')) {
            return `Great question! Here are some project ideas based on skill level:\n\n### Beginner Projects 🌱\n- **To-Do List App** - Learn DOM manipulation & state management\n- **Weather Dashboard** - Practice API integration\n- **Unit Converter** - Build calculators with multiple modes\n\n### Intermediate Projects 🚀\n- **E-commerce Product Page** - Complex UI & interactions\n- **Task Manager with Categories** - CRUD operations & filtering\n- **Recipe Search App** - External APIs & data handling\n\n### Advanced Projects ⚡\n- **Real-time Chat Application** - WebSockets & databases\n- **Code Editor** - Syntax highlighting & auto-complete\n- **Portfolio CMS** - User authentication & admin panel\n\nWhich one interests you? I can guide you through building any of these!`;
        }
        
        return this.defaultResponse('ChatGPT', liveMode);
    },
    
    getGeminiResponse(message, liveMode = false) {
        return this.getChatGPTResponse(message, true) +
            `\n\n*Note from Gemini: I bring multimodal reasoning to the table — I can look at code, text, and structure together. ${liveMode ? '' : 'Live API responses unlock once a Gemini API key is configured in the backend.'}*`;
    },
    
    getClaudeResponse(message, liveMode = false) {
        return this.getChatGPTResponse(message, true) +
            `\n\n*Note from Claude: I specialise in nuanced, step-by-step technical writing and careful code review. ${liveMode ? '' : 'Live API responses unlock once an Anthropic API key is configured in the backend.'}*`;
    },
    
    defaultResponse(providerName, liveMode) {
        return `I'm your AI assistant (powered by ${providerName})!\n\n**What I can do:**\n✅ Explain programming concepts\n✅ Help design algorithms\n✅ Suggest best practices\n✅ Review code structure\n✅ Provide learning resources\n\n${liveMode
            ? 'Ask me anything to get started!'
            : `**To enable full AI responses:**\n1. Add your API keys to config.js\n2. Set CONFIGURED: true for each provider\n3. Deploy a backend server for secure API calls\n\nWhat coding question can I help you with today?`}`;
    },
    
    addMessage(content, role, isError = false) {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        
        // Store in history
        this.chatHistory.push({ role: role === 'user' ? 'user' : 'assistant', content });
        
        // Remove welcome message if present
        const welcomeMsg = container.querySelector('.welcome-message');
        if (welcomeMsg) welcomeMsg.remove();
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message${isError ? ' error-message' : ''} msg-enter`;
        
        const avatarIcon = role === 'user' ? 'fa-user' : this.getProviderIcon();
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">${this.formatMessage(content)}</div>
            </div>
        `;
        
        container.appendChild(messageDiv);
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    },
    
    getProviderIcon() {
        return {
            chatgpt: 'fa-comment-dots',
            gemini: 'fa-brain',
            claude: 'fa-shield-halved'
        }[this.currentProvider] || 'fa-robot';
    },
    
    formatMessage(content) {
        // Escape HTML first
        let formatted = String(content)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // Format code blocks (copy buttons wired via delegation - XSS safe)
        formatted = formatted.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<div class="pre-container"><button class="copy-btn" type="button"><i class="fas fa-copy"></i> Copy</button><pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre></div>`;
        });
        
        // Format inline code
        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Format bold
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Format italic
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Format line breaks
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    },
    
    hideWelcomeMessage() {
        const welcome = document.querySelector('#chat-messages .welcome-message');
        if (welcome) {
            welcome.remove();
        }
    },
    
    showTypingIndicator() {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message msg-enter';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar"><i class="fas ${this.getProviderIcon()}"></i></div>
            <div class="message-content">
                <div class="message-bubble">
                    <div class="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(typingDiv);
        container.scrollTop = container.scrollHeight;
    },
    
    removeTypingIndicator() {
        document.getElementById('typing-indicator')?.remove();
    },
    
    clearConversation() {
        this.chatHistory = [];
        
        const container = document.getElementById('chat-messages');
        if (container) {
            container.innerHTML = '';
            this.renderWelcomeMessage();
        }
        
        showToast('info', 'Cleared', 'Conversation has been cleared');
    },
    
    bindEvents() {
        // Provider selection
        document.querySelectorAll('.provider-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectProvider(btn.dataset.provider);
            });
        });
        
        // Send button
        document.getElementById('send-btn')?.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Input field
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('input', () => {
                document.getElementById('send-btn').disabled = !chatInput.value.trim();
            });
            
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            chatInput.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 150) + 'px';
            });
        }
        
        // Quick action buttons
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.dataset.prompt;
                const input = document.getElementById('chat-input');
                if (input) {
                    input.value = prompt;
                    document.getElementById('send-btn').disabled = false;
                    input.focus();
                }
            });
        });
        
        // Clear conversation button
        document.getElementById('clear-chat-btn')?.addEventListener('click', () => {
            if (this.chatHistory.length > 0) {
                if (confirm('Clear all messages from this conversation?')) {
                    this.clearConversation();
                }
            }
        });
        
        // Chat theme cycle button (in chat header)
        document.getElementById('chat-theme-btn')?.addEventListener('click', () => {
            if (typeof ChatThemeManager !== 'undefined') {
                ChatThemeManager.cycleTheme();
                showToast('info', 'Chat Theme', `Switched to <strong>${ChatThemeManager.getCurrentTheme().name}</strong>`);
            }
        });
        
        // Mobile drawer: toggle providers & themes sidebar
        document.getElementById('ai-sidebar-toggle')?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelector('.ai-wrapper')?.classList.toggle('sidebar-open');
        });
        
        // Close the drawer when tapping outside it (mobile)
        document.addEventListener('click', (e) => {
            const wrapper = document.querySelector('.ai-wrapper.sidebar-open');
            if (wrapper && !e.target.closest('.ai-sidebar') && !e.target.closest('.ai-sidebar-toggle')) {
                wrapper.classList.remove('sidebar-open');
            }
        });
        
        // Delegated copy buttons for code blocks
        document.getElementById('chat-messages')?.addEventListener('click', (e) => {
            const copyBtn = e.target.closest('.copy-btn');
            if (!copyBtn) return;
            const code = copyBtn.parentElement?.querySelector('code')?.innerText || '';
            if (typeof copyToClipboard === 'function') {
                copyToClipboard(code);
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => { copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy'; }, 2000);
            }
        });
        
        // Refresh tier UI when auth changes (e.g. VIP activated mid-session)
        document.addEventListener('authChanged', () => {
            this.restoreProvider();
            this.updateTierNotice();
        });
        
        this.updateTierNotice();
    },
    
    // Show a small notice under the header when the tier changes
    updateTierNotice() {
        if (typeof AuthManager === 'undefined') return;
        const tier = AuthManager.getAccessTier();
        const notice = document.getElementById('ai-tier-notice');
        if (!notice) return;
        
        if (tier.providers.length >= 3) {
            notice.innerHTML = `<i class="fas fa-crown"></i> ${tier.name}: all AI models unlocked`;
            notice.classList.add('all-unlocked');
        } else if (tier.providers.includes('gemini')) {
            notice.innerHTML = `<i class="fas fa-brain"></i> ${tier.name}: ChatGPT + Gemini unlocked — <a href="#" data-page="vip">go VIP for Claude</a>`;
            notice.classList.remove('all-unlocked');
        } else {
            notice.innerHTML = `<i class="fas fa-unlock-alt"></i> ${tier.name} tier: ChatGPT only — <a href="#" data-page="auth">sign in with Google</a> for Gemini, <a href="#" data-page="vip">VIP</a> for Claude`;
            notice.classList.remove('all-unlocked');
        }
    }
};

// Expose globally
window.AIAssistantManager = AIAssistantManager;

document.addEventListener('DOMContentLoaded', () => {
    AIAssistantManager.init();
});
