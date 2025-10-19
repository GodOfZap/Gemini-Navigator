// Sidebar script for Gemini Navigator
class GeminiSidebar {
    constructor() {
        this.conversationHistory = [];
        this.currentContext = null;
        this.isProcessing = false;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadConversationHistory();
        this.setupMessageListener();
    }

    initializeElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.promptInput = document.getElementById('promptInput');
        this.sendButton = document.getElementById('sendButton');
        this.clearChatBtn = document.getElementById('clearChat');
        this.contextIndicator = document.getElementById('contextIndicator');
        this.clearContextBtn = document.getElementById('clearContext');
        this.toggleSettingsBtn = document.getElementById('toggleSettings');
    }

    attachEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        this.clearContextBtn.addEventListener('click', () => this.clearContext());
        this.toggleSettingsBtn.addEventListener('click', () => this.openOptions());
    }

    setupMessageListener() {
        browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === "selectionReady" && request.text) {
                this.setContext(request.text);
                sendResponse({ success: true });
            }
            return true;
        });
    }

    setContext(text) {
        this.currentContext = text || "";
        this.contextIndicator.classList.remove('hidden');
        this.contextIndicator.querySelector('span').textContent = 
            `Context from page: "${this.currentContext.substring(0, 50)}${this.currentContext.length > 50 ? '...' : ''}"`;
        this.promptInput.focus();
    }

    clearContext() {
        this.currentContext = null;
        this.contextIndicator.classList.add('hidden');
    }

    async sendMessage() {
        const prompt = this.promptInput.value.trim();
        if (!prompt || this.isProcessing) return;

        this.isProcessing = true;
        this.sendButton.disabled = true;

        // Add user message to chat
        this.addMessage(prompt, 'user');

        // Clear input
        this.promptInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Build full prompt with context
            let fullPrompt = prompt;
            if (this.currentContext) {
                fullPrompt = `[CONTEXT]: ${this.currentContext}\n\n[QUESTION]: ${prompt}`;
            }

            // === KEY CHANGE HERE ===
            // Send to background and use `reply` & `updatedConversation`
            const response = await browser.runtime.sendMessage({
                action: "queryGemini",
                prompt: fullPrompt,
                conversationHistory: this.conversationHistory
            });

            this.hideTypingIndicator();

            if (response.success) {
                const replyText = response.reply || "[No response]";
                this.addMessage(replyText, 'assistant');

                // Update conversation history with background's updated conversation
                this.conversationHistory = response.updatedConversation || this.conversationHistory;
                this.saveConversationHistory();
            } else {
                this.addMessage(`Error: ${response.error || 'Unknown error'}`, 'assistant', true);
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage(`Error communicating with Gemini: ${error.message}`, 'assistant', true);
        }

        this.isProcessing = false;
        this.sendButton.disabled = false;
    }

    addMessage(text, role, isError = false) {
        const safeText = typeof text === 'string' ? text : String(text || '[Empty]');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message glass-card ${isError ? 'error-message' : ''}`;
        
        if (role === 'user' && this.currentContext) {
            const contextBlock = document.createElement('div');
            contextBlock.className = 'context-block';
            contextBlock.textContent = `Context: ${this.currentContext}`;
            messageDiv.appendChild(contextBlock);
            
            const questionText = document.createElement('div');
            questionText.textContent = safeText.replace(/^\[QUESTION\]:\s*/, '');
            messageDiv.appendChild(questionText);
        } else {
            const formattedText = this.formatResponse(safeText);
            messageDiv.innerHTML = formattedText;
        }

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();

        // Clear context after user message
        if (role === 'user') this.clearContext();
    }

    formatResponse(text) {
        const safeText = typeof text === 'string' ? text : String(text || '');
        return safeText
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant-message glass-card typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            Gemini is thinking
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) typingIndicator.remove();
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    clearChat() {
        this.chatMessages.innerHTML = `
            <div class="welcome-message glass-card">
                <h3>Welcome to Gemini Navigator</h3>
                <p>Start a conversation or select text on any page and use the context menu to send it here.</p>
            </div>
        `;
        this.conversationHistory = [];
        this.clearContext();
        this.saveConversationHistory();
    }

    saveConversationHistory() {
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
        }
        localStorage.setItem('geminiConversation', JSON.stringify(this.conversationHistory));
    }

    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('geminiConversation');
            if (saved) {
                this.conversationHistory = JSON.parse(saved);
                this.chatMessages.innerHTML = '';
                this.conversationHistory.forEach(msg => {
                    const text = msg?.parts?.[0]?.text || '';
                    if (msg.role === 'user' || msg.role === 'assistant') {
                        this.addMessage(text, msg.role);
                    }
                });
            }
        } catch (error) {
            console.error('Error loading conversation history:', error);
        }
    }

    openOptions() {
        browser.runtime.openOptionsPage();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GeminiSidebar();
});
