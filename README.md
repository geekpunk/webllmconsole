
````markdown
# Web LLM Chat

```text
 __      __      _      _    _     __  __    ___ _           _   
 \ \    / /___  | |__  | |  | |   |  \/  |  / __| |_   __ _ | |_ 
  \ \/\/ // -_) | '_ \ | |__| |__ | |\/| | | (__| ' \ / _` ||  _|
   \_/\_/ \___| |_.__/ |____|____||_|  |_|  \___|_||_|\__,_| \__|
````

> **Secure, Private AI running entirely in your browser.**

*(Note: Replace `./screenshot.png` with the actual path to your image)*

**Web LLM Chat** is a modern, secure chat application that runs Large Language Models (LLMs) directly in your browser. Unlike traditional AI services, **your chat data never leaves your device**. The model runs locally using WebGPU, ensuring complete privacy and security for your conversations.  This was written and runs well on a macbook air, so any modern laptop should do.

[See Demo](https://storage.googleapis.com/webllm/index.html_)
-----

## 📋 Table of Contents

  - [Features](https://www.google.com/search?q=%23-features)
  - [Prerequisites](https://www.google.com/search?q=%23-prerequisites)
  - [Installation](https://www.google.com/search?q=%23-installation)
  - [How to Use](https://www.google.com/search?q=%23-how-to-use)
  - [Powered By](https://www.google.com/search?q=%23-powered-by)
  - [Development Story](https://www.google.com/search?q=%23-development-story)
  - [License](https://www.google.com/search?q=%23-license)
  - [Author](https://www.google.com/search?q=%23-author)

-----

## ✨ Features

  * **🔒 Privacy First:** All processing happens locally on your machine via WebGPU. Your data never touches a server.
  * **🧠 Model Selection:** Choose from variety of optimized models (e.g., Llama 3, Gemma 2) directly from the UI.
  * **🌐 Web Search Capability:** Toggle the globe icon to enable real-time information fetching from Wikipedia or Google.
  * **💾 Data Control:** Export chat history to JSON or import previous conversations. You have full ownership of your data.
  * **🎭 Custom Personas:** Set a global system prompt in Settings, or override it for specific chats to give the AI a unique personality or role.

## 💻 Prerequisites

To run this application, you need a web browser that supports **WebGPU**.

  * **Google Chrome** (Version 113 or later)
  * **Microsoft Edge**
  * **Arc Browser**
  * *Note: Ensure hardware acceleration is enabled in your browser settings.*

## 🛠 Installation

To run Web LLM Chat locally on your machine:

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/geekpunk/webllmconsole.git](https://github.com/geekpunk/webllmconsole.git)
    cd webllmconsole
    ```

2.  **Serve the directory:**
    Since this is a client-side application, you can use any static file server. For example, using Python or Node.js:

    ```bash
    npm run dev
    ```

3.  **Open in Browser:**
    Navigate to `http://localhost:8000` in your WebGPU-supported browser.

## 🚀 How to Use

1.  **Select a Model:** Use the selector in the chat header to choose a model.
      * *Tip:* The first time you select a model, it will download to your device. This may take a few moments depending on your internet speed. It is cached for future use.
2.  **Start Chatting:** Type your message and press send. The AI responds instantly, running entirely on your computer's GPU.
3.  **Web Search:** Click the **globe icon** to toggle web search for answers requiring up-to-date real-world data.
4.  **Manage Data:** Access the **Settings** menu to manage your chat history or configure system prompts.

## ⚡ Powered By

This project makes use of the incredible work done by the MLC AI team.

  * **WebLLM:** [https://webllm.mlc.ai/](https://webllm.mlc.ai/)

## 🤖 Development Story

> "This entire application was created with Google Gemini 3 & Antigravity. No code was written by a human to make this outside of prompting."

## 📄 License

This project is licensed under the **MIT Open Source License**.

## 👤 Author

**Mike Wolf**

```
```