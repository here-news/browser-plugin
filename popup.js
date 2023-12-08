chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "displaySummary") {
        document.getElementById("summary").innerText = message.summary;
    }
});

document.getElementById('summarize').addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "processContent"});
    });
});
