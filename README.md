# 🛡️ Gemini Navigator

This repository contains a **Firefox sidebar extension** for interacting with **Gemini AI**, enabling context-aware chat and integration with selected webpage content.
This is my project for Open Source Hackfest(MLH)[https://events.mlh.io/events/12808]

<div align="center">

<img src="https://img.shields.io/static/v1?label=%F0%9F%8C%9F&message=If%20Useful&style=style=flat&color=BC4E99" alt="Star Badge"/>
<a href="https://github.com/GodOfZap" ><img src="https://img.shields.io/badge/Contributions-welcome-violet.svg?style=flat&logo=git" alt="Contributions" /></a>
<a href="https://github.com/GodOfZap/gemini-navigator/pulls"><img src="https://img.shields.io/github/issues-pr/GodOfZap/gemini-navigator" alt="Pull Requests Badge"/></a>
<a href="https://github.com/GodOfZap/gemini-navigator/graphs/contributors"><img alt="GitHub contributors" src="https://img.shields.io/github/contributors/GodOfZap/gemini-navigator?color=2b9348"></a>

</div>

---

## 📝 About

Gemini Navigator allows you to interact with the **Gemini AI** directly from a Firefox sidebar. You can maintain conversation history and view formatted AI responses.  

**Planned Features / Under Development:**
- Context-aware responses from selected webpage text  
- Right-click “Send Selection to Gemini Chat” integration  
- Real-time sending via Enter key or Send button  

**Implemented Features:**
- Sidebar chat interface for Gemini AI  
- Persistent conversation history across sessions  
- Markdown-like formatting for AI responses  
- Configurable settings: API key, model, max tokens

---

## 🚀 Get Started

### Requirements

- **Firefox Browser**  
- **Gemini API Key**  

### Installation (for local testing)

1. **Clone the project:**
    ```bash
    git clone https://github.com/GodOfZap/gemini-navigator.git
    ```

2. **Load the extension in Firefox:**
    - Open Firefox and go to `about:debugging#/runtime/this-firefox`
    - Click **“Load Temporary Add-on”**
    - Select the `manifest.json` file from the project folder

3. **Using the extension:**
    - Click setting icon or go to 'about:addons' on firefox select options next to Details.
    - And add the Gemini API, modal , max token limit
    - Open the sidebar from the Firefox sidebar menu  
    - Chat with Gemini AI directly using the sidebar (other context features are coming soon for now you can chat and view your history)

---

## 🤝 Contribute

Contributions are welcome! You can fix bugs, implement planned features, or improve documentation.  

Please follow the **[CONTRIBUTING.md](CONTRIBUTING.md)** guidelines and respect the **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)**.

---

## ✨ Contributors

<!-- CONTRIBUTORS:START -->
<a href="https://github.com/GodOfZap">
  <img src="https://avatars.githubusercontent.com/u/104364679?v=4" width="60" height="60" alt="GodOfZap" style="border-radius: 50%;" />
</a>
<!-- CONTRIBUTORS:END -->

---

## 📄 License

This project is licensed under the **GPL 3.0 License**. See the [LICENSE](LICENSE) file for details.

---

## 📊 Stats 

- **Repo Size:** ![GitHub repo size](https://img.shields.io/github/repo-size/GodOfZap/gemini-navigator)
- **Stars:** ![GitHub stars](https://img.shields.io/github/stars/GodOfZap/gemini-navigator)
- **Last Update:** ![Last commit](https://img.shields.io/github/last-commit/GodOfZap/gemini-navigator)
