// Background script for Gemini Navigator
let apiKey = null;
let currentModel = 'gemini-2.0-flash-latest';
let maxTokens = 8192;

// Initialize extension
browser.runtime.onInstalled.addListener(async () => {
  // Load saved settings
  const result = await browser.storage.local.get(['apiKey', 'model', 'maxTokens']);
  apiKey = result.apiKey || null;
  currentModel = result.model || 'gemini-2.0-flash-latest';
  maxTokens = result.maxTokens || 8192;

  // Create context menu item
  browser.contextMenus.create({
    id: "send-to-gemini",
    title: "Send Selection to Gemini Chat",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "send-to-gemini" && info.selectionText) {
    browser.sidebarAction.open();
    browser.tabs.sendMessage(tab.id, {
      action: "forwardSelection",
      text: info.selectionText
    });
  }
});

// Message handler (for sidebar or content scripts)
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "getApiKey":
      sendResponse({ apiKey, model: currentModel, maxTokens });
      break;

    case "saveSettings":
      apiKey = request.apiKey;
      currentModel = request.model;
      maxTokens = request.maxTokens;
      browser.storage.local.set({
        apiKey,
        model: currentModel,
        maxTokens
      });
      sendResponse({ success: true });
      break;

    case "queryGemini":
      queryGeminiAPI(request.prompt, request.conversationHistory)
        .then(({ reply, updatedConversation }) =>
          sendResponse({ success: true, reply, updatedConversation })
        )
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // keep message channel open for async response

    default:
      sendResponse({ success: false, error: "Unknown action" });
  }
});

// Query Gemini API safely
async function queryGeminiAPI(prompt, conversationHistory = []) {
  if (!apiKey) {
    throw new Error("API Key not configured. Please set it in the options.");
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;

  // Clean up and validate conversation
  const validHistory = (conversationHistory || [])
    .filter(msg => msg && (msg.role === "user" || msg.role === "model"))
    .map(msg => ({
      role: msg.role,
      parts: Array.isArray(msg.parts) ? msg.parts : [{ text: String(msg.text || "") }]
    }));

  // Append the latest user message
  const contents = [
    ...validHistory,
    { role: "user", parts: [{ text: String(prompt) }] }
  ];

  const requestBody = {
    contents,
    generationConfig: {
      maxOutputTokens: Number(maxTokens) || 512,
      temperature: 0.7
    }
  };

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `API Error: ${res.status}`);
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const modelReply = rawText ? String(rawText) : "";

    if (!modelReply) throw new Error("No response generated from Gemini");

    // Updated conversation
    const updatedConversation = [
      ...validHistory,
      { role: "user", parts: [{ text: String(prompt) }] },
      { role: "model", parts: [{ text: modelReply }] }
    ];

    return { reply: modelReply, updatedConversation };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to query Gemini API");
  }
}
