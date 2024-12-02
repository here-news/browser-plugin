// background.js
// Listen for extension install
chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({ text: "" }); // Start with no badge text
});

// Fetch news for the given URL
function fetchAndCacheNews(url, title, content) {
    return new Promise((resolve, reject) => {
        const query = encodeURIComponent(`${title}`.substring(0, 120));
        const apiUrl = `https://api.here.news/searchnews?q=${query}`;

        chrome.action.setBadgeText({ text: "⚡" }); // Indicate loading 

        fetch(apiUrl)
            .then((res) => res.json())
            .then((newsList) => {
                console.log("Fetched news data:", newsList); // debug
                const relevantNews = newsList.filter((item) => item.score > 0.92);
                const count = relevantNews.length;

                // Update badge & title
                chrome.action.setBadgeText({ text: count > 0 ? "★" : "" });  
                chrome.action.setTitle({ title: `${count} related news articles` });

                // Cache the results
                chrome.storage.local.get("newsCache", (data) => {
                    const newsCache = data.newsCache || {};
                    newsCache[url] = newsList;

                    chrome.storage.local.set({
                        newsCache,
                        newsData: relevantNews,
                        lastUpdated: new Date().toISOString(),
                    });

                    resolve(relevantNews); // Resolve with the filtered news
                });
            })
            .catch((err) => {
                console.error("Error fetching news:", err);
                chrome.action.setBadgeText({ text: "" }); // Clear badge on error
                reject(err); // Reject with the error
            });
    });
}

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "refreshNews") {
        console.log("Refreshing news data...");         // debug
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (activeTab && activeTab.url) {
                chrome.tabs.sendMessage(activeTab.id, { action: "fetchPageContext" }, (response) => {
                    if (response) {
                        const { title, content } = response;
                        fetchAndCacheNews(activeTab.url, title, content)
                            .then(() => sendResponse({ status: "success" }))
                            .catch((err) => sendResponse({ status: "error", message: err.message }));
                    }
                });
            }
        });

        return true; // Keep the message channel open for async response
    }
});


// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        chrome.storage.local.get("newsCache", (data) => {
            const newsCache = data.newsCache || {};
            const cachedNews = newsCache[tab.url];

            if (cachedNews) {
                const count = cachedNews.filter((item) => item.score > 0.92).length;
                chrome.action.setBadgeText({ text: count > 0 ? "★" : "" });  
                chrome.action.setTitle({ title: `${count} related news articles` });
                chrome.storage.local.set({ newsData: cachedNews });
            } else {
                // Fetch fresh news
                chrome.tabs.sendMessage(tabId, { action: "fetchPageContext" }, (response) => {
                    if (response) {
                        const { title, content } = response;
                        fetchAndCacheNews(tab.url, title, content).catch(console.error);
                    }
                });
            }
        });
    }
});


// Listen for tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url) {
            chrome.storage.local.get("newsCache", (data) => {
                const newsCache = data.newsCache || {};
                const cachedNews = newsCache[tab.url];

                if (cachedNews) {
                    const count = cachedNews.filter((item) => item.score > 0.92).length;
                    chrome.action.setBadgeText({ text: count > 0 ? "★" : "" });
                    chrome.action.setTitle({ title: `${count} related news articles` });
                    chrome.storage.local.set({ newsData: cachedNews });
                } else {
                    chrome.action.setBadgeText({ text: "" }); // Clear badge if no cached data
                }
            });
        }
    });
});
