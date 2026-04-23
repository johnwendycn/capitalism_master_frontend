class CompassionateCapitalismChat {
    constructor() {
        this.apiUrl = '/api/chat/send';
        this.conversationHistory = [];
        this.init();
    }

    init() {
        this.createChatWidget();
        this.loadStoredHistory();
    }

    createChatWidget() {
        // Create chat container if not exists
        if (!document.querySelector('.cc-chat-widget')) {
            const chatHTML = `
                <div class="cc-chat-widget">
                    <div class="cc-chat-header">
                        <div class="cc-chat-header-content">
                            <div class="cc-chat-icon">💬</div>
                            <div>
                                <h3>Compassionate Capitalism</h3>
                                <p>Black Wall Street Economic Empowerment</p>
                            </div>
                        </div>
                        <button class="cc-chat-toggle">−</button>
                    </div>
                    <div class="cc-chat-body">
                        <div class="cc-chat-messages"></div>
                        <div class="cc-chat-input-area">
                            <textarea 
                                placeholder="Ask about Compassionate Capitalism, Black Wall Street history, business strategies, or economic empowerment..."
                                rows="2"
                            ></textarea>
                            <button class="cc-send-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', chatHTML);
            this.attachEventListeners();
        }
    }

    attachEventListeners() {
        const widget = document.querySelector('.cc-chat-widget');
        const toggleBtn = widget.querySelector('.cc-chat-toggle');
        const sendBtn = widget.querySelector('.cc-send-btn');
        const textarea = widget.querySelector('.cc-chat-input-area textarea');

        toggleBtn.addEventListener('click', () => {
            widget.classList.toggle('cc-chat-minimized');
            toggleBtn.textContent = widget.classList.contains('cc-chat-minimized') ? '+' : '−';
        });

        sendBtn.addEventListener('click', () => this.sendMessage());
        
        textarea.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    async sendMessage() {
        const textarea = document.querySelector('.cc-chat-input-area textarea');
        const message = textarea.value.trim();
        
        if (!message) return;

        // Clear input
        textarea.value = '';
        
        // Display user message
        this.displayMessage(message, 'user');
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversationHistory: this.conversationHistory
                })
            });
            
            const data = await response.json();
            
            // Remove typing indicator
            this.removeTypingIndicator();
            
            if (data.success) {
                this.displayMessage(data.reply, 'bot');
                this.saveToHistory('user', message);
                this.saveToHistory('bot', data.reply);
            } else {
                this.displayMessage(data.message || 'Unable to process your request.', 'bot');
            }
            
        } catch (error) {
            console.error('Chat error:', error);
            this.removeTypingIndicator();
            this.displayMessage(
                'Network error. Please check your connection and try again.',
                'bot'
            );
        }
    }

    displayMessage(content, sender) {
        const messagesContainer = document.querySelector('.cc-chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `cc-chat-message cc-message-${sender}`;
        
        const avatar = sender === 'user' ? '👤' : '🏢';
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="cc-message-avatar">${avatar}</div>
            <div class="cc-message-content">
                <div class="cc-message-text">${this.formatMessage(content)}</div>
                <div class="cc-message-time">${time}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Add to history
        this.addToHistory(content, sender);
    }

    formatMessage(text) {
        // Convert URLs to links
        let formatted = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        // Convert line breaks to <br>
        formatted = formatted.replace(/\n/g, '<br>');
        return formatted;
    }

    showTypingIndicator() {
        const messagesContainer = document.querySelector('.cc-chat-messages');
        const indicator = document.createElement('div');
        indicator.className = 'cc-chat-message cc-message-bot typing-indicator';
        indicator.innerHTML = `
            <div class="cc-message-avatar">🏢</div>
            <div class="cc-message-content">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(indicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    removeTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) indicator.remove();
    }

    saveToHistory(role, content) {
        this.conversationHistory.push({ role, content });
        // Keep last 20 messages
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
        }
        localStorage.setItem('chat_history', JSON.stringify(this.conversationHistory));
    }

    loadStoredHistory() {
        const stored = localStorage.getItem('chat_history');
        if (stored) {
            this.conversationHistory = JSON.parse(stored);
            this.conversationHistory.forEach(msg => {
                this.displayMessage(msg.content, msg.role);
            });
        } else {
            this.displayWelcomeMessage();
        }
    }

    displayWelcomeMessage() {
        const welcome = `Welcome to Compassionate Capitalism - Black Wall Street Economic Empowerment!

I can help you with:
• 📚 History of Black Wall Street and Greenwood District
• 💼 Business development strategies
• 📈 Investment principles in Compassionate Capitalism
• 🤝 Community economic empowerment
• 🏦 Financial literacy and wealth building
• 🌟 Black business success stories

What would you like to learn about today?`;
        
        this.displayMessage(welcome, 'bot');
        this.saveToHistory('bot', welcome);
    }
}

// Initialize chat when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.compassionateCapitalismChat = new CompassionateCapitalismChat();
});