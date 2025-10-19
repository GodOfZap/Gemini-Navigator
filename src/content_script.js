// Content script for handling page interactions
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "forwardSelection" && request.text) {
    // Store the selection for the sidebar to pick up
    sessionStorage.setItem('geminiSelection', request.text);
    
    // Notify the sidebar
    browser.runtime.sendMessage({
      action: "selectionReady",
      text: request.text
    });
    
    sendResponse({ success: true });
  }
  return true;
});