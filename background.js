// background.js
// Listen for extension install
chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({ text: "" }); // Start with no badge text
});


// manage the cache of related news, put cache length to 100 but later from option page
function addToCache(url, newsList) {
    chrome.storage.local.get("newsCache", (data) => {
        const newsCache = data.newsCache || []; // Initialize as an empty array if not present

        // Check if the URL is already in the queue
        const existingIndex = newsCache.findIndex((entry) => entry.url === url);
        if (existingIndex !== -1) {
            // Update the existing entry
            newsCache[existingIndex] = { url, newsList, timestamp: new Date().toISOString() };
        } else {
            // Add the new entry to the end of the queue
            newsCache.push({ url, newsList, timestamp: new Date().toISOString() });

            // Enforce size limit (FIFO)
            if (newsCache.length > 100) {
                newsCache.shift(); // Remove the oldest entry
            }
        }

        // Save the updated queue back to storage
        chrome.storage.local.set({ newsCache });
    });
}


function getFromCache(url, callback) {
    chrome.storage.local.get("newsCache", (data) => {
        const newsCache = data.newsCache || [];
        const cachedEntry = newsCache.find((entry) => entry.url === url);
        callback(cachedEntry ? cachedEntry.newsList : null);
    });
}


// Fetch news for the given URL
function fetchAndCacheNews(url, title, content) {
    return new Promise((resolve, reject) => {
        const query = encodeURIComponent(`${title}`.substring(0, 120));
        const apiUrl = `https://api.here.news/searchnews?q=${query}`;

        chrome.action.setBadgeText({ text: "⚡" }); // Indicate loading 

        fetch(apiUrl)
            .then((res) => res.json())
            .then((newsList) => {
                console.log("Fetched news data:", newsList); // Debug
                const relevantNews = newsList.filter((item) => item.score > 0.92);
                const count = relevantNews.length;

                // Update badge & title
                chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" });
                chrome.action.setTitle({ title: `${count} related news articles` });

                // Add to cache using FIFO queue
                addToCache(url, newsList);

                // Send the count to the content script
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs[0]) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: "updateBadge",
                            value: count * 10, // Multiply count for demonstration
                        });
                    }
                });

                resolve(relevantNews); // Resolve with the filtered news
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


// Reusedable function to update the badge and cache
function updateTabBadge(tabId, url) {
    getFromCache(url, (cachedNews) => {
        if (cachedNews) {
            console.log("Using cached news data:", cachedNews); // Debug
            const count = cachedNews.filter((item) => item.score > 0.92).length;
            chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" });
            chrome.action.setTitle({ title: `${count} related news articles` });
            chrome.storage.local.set({ newsData: cachedNews });
        } else {
            // Fetch fresh news if not cached
            chrome.tabs.sendMessage(tabId, { action: "fetchPageContext" }, (response) => {
                if (response) {
                    const { title, content } = response;
                    fetchAndCacheNews(url, title, content).catch(console.error);
                } else {
                    chrome.action.setBadgeText({ text: "" }); // Clear badge if fetch fails
                }
            });
        }
    });
}

// Listen for tab updates and activate events
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        updateTabBadge(tabId, tab.url);
    }
});

// Listen for tab switching
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url) {
            updateTabBadge(activeInfo.tabId, tab.url);
        }
    });
});
