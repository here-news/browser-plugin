function processContent() {
    console.log("Processing page content...");
    let content = document.body.innerText; // Adjust selector as needed
    chrome.runtime.sendMessage({action: "jobDone", content: content});
}

if (document.readyState === "loading") {
    document.addEventListener('DOMContentLoaded', processContent);
} else {
    processContent(); // DOMContentLoaded has already fired
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "processContent") {
        processContent();
    }
});

