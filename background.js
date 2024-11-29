// background.js

// Listen for extension install
chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({ text: "" }); // Start with no badge text
});

// Listen for refresh news message
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "refreshNews") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (activeTab && activeTab.url) {
                chrome.tabs.sendMessage(activeTab.id, { action: "fetchPageContext" }, (response) => {
                    if (response) {
                        const { title, content } = response;
                        const query = encodeURIComponent(`${title} ${content}`);
                        const apiUrl = `https://api.here.news/searchnews?q=${query}`;

                        // Fetch fresh news
                        fetch(apiUrl)
                            .then((res) => res.json())
                            .then((newsList) => {
                                const relevantNews = newsList.filter((item) => item.score > 0.92);
                                const count = relevantNews.length;

                                // Update badge
                                chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" });

                                // Cache new data
                                chrome.storage.local.get("newsCache", (data) => {
                                    const newsCache = data.newsCache || {};
                                    newsCache[activeTab.url] = newsList;

                                    chrome.storage.local.set({
                                        newsCache,
                                        newsData: relevantNews,
                                        lastUpdated: new Date().toISOString(),
                                    });
                                });

                                sendResponse({ status: "success" });
                            })
                            .catch((err) => {
                                console.error("Error fetching news:", err);
                                sendResponse({ status: "error", message: err.message });
                            });

                        return true; // Keep the message channel open for async response
                    }
                });
            }
        });
    }
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        chrome.action.setBadgeText({ text: "" }); // Reset counter

        chrome.storage.local.get("newsCache", (data) => {
            const newsCache = data.newsCache || {};
            const cachedNews = newsCache[tab.url];

            if (cachedNews) {
                console.log("Using cached news for:", tab.url);
                const count = cachedNews.filter((item) => item.score > 0.92).length;
                chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" });

                // Save to local storage for the popup
                chrome.storage.local.set({ newsData: cachedNews });
            } else {
                // Fetch fresh news
                chrome.tabs.sendMessage(tabId, { action: "fetchPageContext" }, (response) => {
                    if (response) {
                        const { title, content } = response;

                        const query = encodeURIComponent(`${title}`);
                        const apiUrl = `https://api.here.news/searchnews?q=${query}`;

                        chrome.action.setBadgeText({ text: "⚡" }); // Indicate loading

                        fetch(apiUrl)
                            .then((res) => res.json())
                            .then((newsList) => {
                                const relevantNews = newsList.filter((item) => item.score > 0.92);
                                const count = relevantNews.length;
                                chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" });

                                // Save to cache
                                newsCache[tab.url] = newsList;
                                chrome.storage.local.set({
                                    newsCache,
                                    newsData: relevantNews,
                                    lastUpdated: new Date().toISOString(),
                                });
                            })
                            .catch((err) => {
                                console.error("Error fetching news:", err);
                                chrome.action.setBadgeText({ text: "" });
                            });
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
                    chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" });
                } else {
                    chrome.action.setBadgeText({ text: "" }); // Clear counter if no cached data
                }
            });
        }
    });
});
