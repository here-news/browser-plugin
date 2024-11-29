// content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fetchPageContext") {
        const title = document.title;
        const content = document.body.innerText.slice(0, 200); // First 200 characters as a brief snippet
        sendResponse({ title, content });
        console.log("Sending page context to background.js", { title, content });
    }
});
