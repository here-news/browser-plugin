let working = false;

function checkForUrl() {
    if (working) {
        console.log("Already working...");
        return;
    }
    console.log("Checking for URL...");
    working = true;

    fetch("https://api.here.news/topstories")
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                let url = `https://here.news/story/${data[0].uuid}`;
                // For testing: url = `https://www.chronicle.com/article/why-faculty-members-are-fleeing-florida`;

                chrome.tabs.create({ url: url }, (tab) => {
                    setTimeout(() => {
                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            files: ['content.js']
                        });
                    }, 2000); // Delay to ensure the page loads
                });
            } else {
                working = false;
            }
        })
        .catch(error => {
            console.error('Error fetching URL:', error);
            working = false;
        });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "jobDone") {
        let cleanedContent = message.content;
        chrome.runtime.sendMessage({ action: "displaySummary", summary: cleanedContent });
        console.log(cleanedContent);

        setTimeout(() => {
            chrome.tabs.remove(sender.tab.id);
            working = false;
        }, 5000);
    }
});

setInterval(checkForUrl, 3000);
