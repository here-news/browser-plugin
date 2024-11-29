document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("news-list");
    const refreshButton = document.getElementById("refresh-button");
    const timestamp = document.getElementById("last-updated");

    // Get the active tab's URL and fetch data
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];

        if (activeTab && activeTab.url) {
            // Fetch cached news or show loading message
            chrome.storage.local.get(["newsCache", "lastUpdated"], (data) => {
                const newsCache = data.newsCache || {};
                const cachedNews = newsCache[activeTab.url];
                const lastUpdated = data.lastUpdated || "N/A";

                if (cachedNews) {
                    // Render cached news
                    renderNews(cachedNews);
                    timestamp.innerText = `Last updated: ${lastUpdated}`;
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
            container.innerHTML = newsList
                .map(
                    (item) => `
                    <div class="news-item">
                        <p><b><a href="${item.canonical}" target="_blank">${item.title}</a></b> (${item.source}, ${new Date(item.pub_time).toLocaleString()})</p>
                    </div>
                `
                )
                .join("");
        }
    }
});
