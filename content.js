// Function to insert a badge into the page
function insertBadge(value) {
    // Check if badge already exists
    if (document.getElementById("news-badge")) return;

    // Create the badge container
    const badge = document.createElement("div");
    badge.id = "news-badge";
    // Set the badge text with US cents symbol and value (e.g., ¢10)
    badge.textContent = value + "¢";
    
    // Style the badge
    Object.assign(badge.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        backgroundColor: "#007BFF",
        color: "white",
        fontSize: "20px",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "9999",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        cursor: "pointer",
    });

    // Add click handler
    badge.addEventListener("click", () => {
        // pop up a new window with the news
        window.open("https://here.news", "_blank");
    });

    // Append the badge to the document body
    document.body.appendChild(badge);
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "updateBadge" && message.value > 0) {
        // we won't display the value badge at this version
        //insertBadge(message.value);
    }
});

// content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fetchPageContext") {
        const title = document.title;
        const content = document.body.innerText.slice(0, 200); // First 200 characters as a brief snippet
        sendResponse({ title, content });
        console.log("Sending page context to background.js", { title, content });       // debug
    }
});


