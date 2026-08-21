/**
 * ============================================
 * CODE FORGE - AI Assistant Manager
 * Supporting: ChatGPT, Gemini, and Claude
 * ============================================
 */

const AIAssistantManager = {
    currentProvider: 'chatgpt',
    chatHistory: [],
    isGenerating: false,
    
    init() {
        this.renderWelcomeMessage();
        this.bindEvents();
    },
    
    renderWelcomeMessage() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        if (this.chatHistory.length === 0) {
            messagesContainer.innerHTML = `
                <div class="welcome-message">
                    <div class="welcome-icon"><i class="fas fa-robot"></i></div>
                    <h3>Welcome to Code Forge AI</h3>
                    <p>I'm here to help you with coding tasks. Ask me anything about:</p>
                    <ul>
                        <li>Writing or explaining code</li>
                        <li>Debugging and fixing errors</li>
                        <li>Building projects step by step</li>
                        <li>Learning programming concepts</li>
                        <li>Best practices and patterns</li>
                    </ul>
                    <p>Try one of the quick actions or type your question below!</p>
                </div>
            `;
        }
    },
    
    checkProviderAccess(providerId) {
        if (typeof AuthManager !== 'undefined') {
            return AuthManager.canUseProvider(providerId);
        }
        return false;
    },
    
    selectProvider(providerId) {
        // Check if user can access this provider
        if (!this.checkProviderAccess(providerId)) {
            if (providerId === 'gemini') {
                showToast('warning', 'Authentication Required', CONFIG.ERRORS.GEMINI_REQUIRES_AUTH);
            } else if (providerId === 'claude') {
                showToast('warning', 'VIP Required', CONFIG.ERRORS.CLAUDE_REQUIRES_VIP);
            }
            return;
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
    },
    
    async sendMessage() {
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        const message = input?.value.trim();
        
        if (!message || this.isGenerating) return;
        
        input.value = '';
        input.style.height = 'auto';
        sendBtn.disabled = true;
        
        this.addMessage(message, 'user');
        this.hideWelcomeMessage();
        
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
        // Check if we have API keys configured
        const providerConfig = CONFIG[this.currentProvider.toUpperCase()];
        if (!providerConfig || !providerConfig.API_KEY || !providerConfig.CONFIGURED) {
            throw new Error('AI provider not configured. Please add API keys to config.js');
        }
        
        let replyText = "";
        
        try {
            // In production, this would call your backend API
            // For now, we'll use a simulated response
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Simulate AI response based on provider
            if (this.currentProvider === 'claude') {
                replyText = this.getClaudeResponse(userMessage);
            } else if (this.currentProvider === 'gemini') {
                replyText = this.getGeminiResponse(userMessage);
            } else {
                replyText = this.getChatGPTResponse(userMessage);
            }
            
            this.addMessage(replyText, 'ai');
            
            if (this.chatHistory.length > CONFIG.APP.MAX_CHAT_HISTORY) {
                this.chatHistory = this.chatHistory.slice(-CONFIG.APP.MAX_CHAT_HISTORY);
            }
        } catch (error) {
            console.error('AI Generation Error:', error);
            this.addMessage(`Error: ${error.message || 'Failed to generate response.'}`, 'ai', true);
        }
    },
    
    getChatGPTResponse(message) {
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
        
        // Default helpful response
        return `I'm your AI coding assistant! While the backend API integration is being configured, here are some ways I can help:\n\n**What I can do:**\n✅ Explain programming concepts\n✅ Help design algorithms\n✅ Suggest best practices\n✅ Review code structure\n✅ Provide learning resources\n\n**To enable full AI responses:**\n1. Add your API keys to config.js:\n   - OpenAI API Key for ChatGPT\n   - Google Gemini API Key for Gemini\n   - Anthropic API Key for Claude (requires VIP)\n\n2. Set CONFIGURED: true for each provider\n\n3. Deploy a backend server for secure API calls\n\nWhat coding question can I help you with today?`;
    },
    
    getGeminiResponse(message) {
        return this.getChatGPTResponse(message) + `\n\n*Note: Gemini provides advanced reasoning and multimodal capabilities. Full functionality requires Google authentication and backend API integration.*`;
    }
    
    getClaudeResponse(message) {
        return this.getChatGPTResponse(message) + `\n\n*Note: Claude offers exceptional coding capabilities and detailed explanations. Full functionality requires VIP subscription and backend API integration.*`;
    }
    
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
        messageDiv.className = `message ${role}-message${isError ? ' error-message' : ''}`;
        
        const avatarIcon = role === 'user' ? 'fa-user' : 'fa-robot';
        
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
    
    formatMessage(content) {
        // Escape HTML first
        let formatted = content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // Format code blocks
        formatted = formatted.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
            const copyBtn = `<button class="copy-btn" onclick="copyToClipboard('${code.trim().replace(/'/g, "\\'")}'); this.textContent='Copied!';">
                <i class="fas fa-copy"></i> Copy
            </button>`;
            return `<div class="pre-container">${copyBtn}<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre></div>`;
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
            welcome.style.display = 'none';
        }
    },
    
    showTypingIndicator() {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
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
            // Enable/disable send button based on content
            chatInput.addEventListener('input', () => {
                document.getElementById('send-btn').disabled = !chatInput.value.trim();
            });
            
            // Handle Enter to send
            chatInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            // Auto-resize textarea
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
    }
};

// Expose globally
window.AIAssistantManager = AIAssistantManager;

document.addEventListener('DOMContentLoaded', () => {
    AIAssistantManager.init();
});
