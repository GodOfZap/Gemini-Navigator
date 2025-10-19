// Popup script for quick Gemini queries
class GeminiPopup {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.checkApiStatus();
    }

    initializeElements() {
        this.quickPrompt = document.getElementById('quickPrompt');
        this.quickSend = document.getElementById('quickSend');
        this.quickResponse = document.getElementById('quickResponse');
        this.responseContent = this.quickResponse.querySelector('.response-content');
        this.copyResponse = document.getElementById('copyResponse');
        this.openSidebar = document.getElementById('openSidebar');
        this.openOptions = document.getElementById('openOptions');
        this.viewHistory = document.getElementById('viewHistory');
    }

    attachEventListeners() {
        this.quickSend.addEventListener('click', () => this.sendQuickQuery());
        this.copyResponse.addEventListener('click', () => this.copyToClipboard());
        this.openSidebar.addEventListener('click', () => this.openChatSidebar());
        this.openOptions.addEventListener('click', () => this.openOptionsPage());
        this.viewHistory.addEventListener('click', () => this.openChatSidebar());
    }

    async checkApiStatus() {
        try {
            const response = await browser.runtime.sendMessage({ action: "getApiKey" });
            if (!response.apiKey) {
                this.quickSend.disabled = true;
                this.quickPrompt.placeholder = "Please set your API key in settings first";
            }
        } catch (error) {
            console.error('Error checking API status:', error);
        }
    }

    async sendQuickQuery() {
        const prompt = this.quickPrompt.value.trim();
        if (!prompt) return;

        this.quickSend.disabled = true;
        this.quickSend.textContent = 'Sending...';
        this.quickResponse.classList.add('hidden');

        try {
            const response = await browser.runtime.sendMessage({
                action: "queryGemini",
                prompt: prompt
            });

            if (response.success) {
                this.responseContent.textContent = response.response;
                this.quickResponse.classList.remove('hidden');
            } else {
                this.responseContent.textContent = `Error: ${response.error}`;
                this.quickResponse.classList.remove('hidden');
            }
        } catch (error) {
            this.responseContent.textContent = `Error: ${error.message}`;
            this.quickResponse.classList.remove('hidden');
        }

        this.quickSend.disabled = false;
        this.quickSend.textContent = 'Send to Gemini';
    }

    async copyToClipboard() {
        const text = this.responseContent.textContent;
        try {
            await navigator.clipboard.writeText(text);
            this.copyResponse.textContent = 'Copied!';
            setTimeout(() => {
                this.copyResponse.textContent = 'Copy Response';
            }, 2000);
        } catch (error) {
            console.error('Failed to copy text:', error);
        }
    }

    openChatSidebar() {
        browser.sidebarAction.open();
        window.close();
    }

    openOptionsPage() {
        browser.runtime.openOptionsPage();
        window.close();
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GeminiPopup();
});