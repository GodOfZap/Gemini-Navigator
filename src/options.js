// Ensure browser API works in both Chrome and Firefox
if (typeof browser === 'undefined') {
    var browser = chrome;
}

// Options script for Gemini Navigator settings
class GeminiOptions {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadSettings();
    }

    initializeElements() {
        this.settingsForm = document.getElementById('settingsForm');
        this.apiKeyInput = document.getElementById('apiKey');
        this.modelSelect = document.getElementById('model');
        this.maxTokensSelect = document.getElementById('maxTokens');
        this.statusMessage = document.getElementById('statusMessage');
        this.testConnection = document.getElementById('testConnection');
        this.testResult = document.getElementById('testResult');
        this.resetButton = document.getElementById('resetButton');
    }

    attachEventListeners() {
        if (!this.settingsForm) return; // Prevent crash if DOM not ready

        this.settingsForm.addEventListener('submit', (e) => this.saveSettings(e));
        this.testConnection.addEventListener('click', () => this.testApiConnection());
        this.resetButton.addEventListener('click', () => this.resetToDefaults());

        // Auto-store on change
        this.apiKeyInput.addEventListener('change', () => this.autoStoreSettings());
        this.apiKeyInput.addEventListener('blur', () => this.autoStoreSettings());
        this.apiKeyInput.addEventListener('paste', () => this.autoStoreSettings());
        this.modelSelect.addEventListener('change', () => this.autoStoreSettings());
        this.maxTokensSelect.addEventListener('change', () => this.autoStoreSettings());
    }

    async loadSettings() {
        try {
            const response = await browser.runtime.sendMessage({ action: "getApiKey" });
            if (response?.apiKey) this.apiKeyInput.value = response.apiKey;
            if (response?.model) this.modelSelect.value = response.model;
            if (response?.maxTokens) this.maxTokensSelect.value = response.maxTokens;
        } catch (error) {
            console.error('Settings load error:', error);
            this.showStatus('Error loading settings', 'error');
        }
    }

    async autoStoreSettings() {
        const apiKey = this.apiKeyInput.value.trim();
        const model = this.modelSelect.value;
        const maxTokens = parseInt(this.maxTokensSelect.value);
        if (!apiKey && !model && !maxTokens) return;

        try {
            await browser.runtime.sendMessage({
                action: "saveSettings",
                apiKey,
                model,
                maxTokens
            });
            this.showStatus('Settings stored automatically ✅', 'success');
            setTimeout(() => this.hideStatus(), 2000);
        } catch (error) {
            console.error('Auto store error:', error);
            this.showStatus('Error storing settings', 'error');
        }
    }

    async saveSettings(event) {
        event.preventDefault();
        const apiKey = this.apiKeyInput.value.trim();
        if (!apiKey) {
            this.showStatus('Please enter your Gemini API key', 'error');
            return;
        }

        try {
            await browser.runtime.sendMessage({
                action: "saveSettings",
                apiKey,
                model: this.modelSelect.value,
                maxTokens: parseInt(this.maxTokensSelect.value)
            });
            this.showStatus('Settings saved successfully!', 'success');
            setTimeout(() => this.hideStatus(), 3000);
        } catch (error) {
            console.error('Save settings error:', error);
            this.showStatus('Error saving settings', 'error');
        }
    }

    async testApiConnection() {
        const apiKey = this.apiKeyInput.value.trim();
        if (!apiKey) {
            this.testResult.textContent = 'Please enter your API key first';
            this.testResult.style.color = '#ff4444';
            return;
        }

        this.testConnection.disabled = true;
        this.testConnection.textContent = 'Testing...';
        this.testResult.textContent = '';

        try {
            const response = await browser.runtime.sendMessage({
                action: "queryGemini",
                prompt: "Hello! Please respond with just 'OK' to confirm the connection is working."
            });

            if (response.success) {
                this.testResult.textContent = '✓ Connection successful! API key is valid.';
                this.testResult.style.color = '#00ff00';
            } else {
                this.testResult.textContent = `✗ Connection failed: ${response.error}`;
                this.testResult.style.color = '#ff4444';
            }
        } catch (error) {
            console.error('Connection test error:', error);
            this.testResult.textContent = `✗ Connection failed: ${error.message}`;
            this.testResult.style.color = '#ff4444';
        }

        this.testConnection.disabled = false;
        this.testConnection.textContent = 'Test Gemini Connection';
    }

    resetToDefaults() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            this.apiKeyInput.value = '';
            this.modelSelect.value = 'gemini-2.5-flash';
            this.maxTokensSelect.value = '16384';
            this.testResult.textContent = '';
            this.hideStatus();
        }
    }

    showStatus(message, type) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message status-${type}`;
        this.statusMessage.classList.remove('hidden');
    }

    hideStatus() {
        this.statusMessage.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GeminiOptions();
});
