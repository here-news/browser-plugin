function getFromCache(url, callback) {
    chrome.storage.local.get("newsCache", (data) => {
        const newsCache = data.newsCache || [];
        const cachedEntry = newsCache.find((entry) => entry.url === url);
        callback(cachedEntry ? cachedEntry.newsList : null);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("news-list");
    const refreshButton = document.getElementById("refresh-button");
    const timestamp = document.getElementById("last-updated");

    // Get the active tab's URL and fetch data
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];

        if (activeTab && activeTab.url) {
            // Fetch cached news or show loading message
            getFromCache(activeTab.url, (cachedNews) => {

                if (cachedNews) {
                    // Render cached news
                    renderNews(cachedNews);
                    //timestamp.innerText = `Last updated: ${lastUpdated}`;
                } else {
                    container.innerHTML = "<p>Loading related news...</p>";
                }
            });
        } else {
            container.innerHTML = "<p>No valid tab detected.</p>";
        }
    });

    refreshButton.addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "refreshNews" });
    });

    // Helper function to render news items
    function renderNews(newsList) {
        if (newsList.length === 0) {
            container.innerHTML = "<p>No related news found.</p>";
        } else {
            // choose those with high scores(>0.92)
            chrome.storage.local.get("settings", (data) => {

                const scoreThreshold = data.settings?.scoreThreshold || 0.91; // Default to "Similar"

                newsList = newsList.filter((item) => item.score > scoreThreshold);
                container.innerHTML = newsList
                    .map(
                        (item) => `
                        <div class="news-item" data-preview="${item.preview}">
                            <p><b><a href="${item.canonical}" target="_blank">${item.title}</a></b> (${item.source}, ${new Date(item.pub_time).toLocaleString()})</p>
                            <img src="${item.preview}" alt="Thumbnail" />
                        </div>
                    `
                    )
                    .join("");
                    // Add event listener to each news item for preview
                    // Add hover event listeners to show/hide thumbnails
                    const newsItems = container.querySelectorAll(".news-item");
                    newsItems.forEach((newsItem) => {
                    const thumbnail = newsItem.querySelector("img");

                    newsItem.addEventListener("mouseenter", () => {
                        if (thumbnail) thumbnail.style.display = "block";
                    });

                    newsItem.addEventListener("mouseleave", () => {
                        if (thumbnail) thumbnail.style.display = "none";
                    });
                });
            });
                
        }
    }
});
