let working = false;

function checkForUrl() {
    if (working) {
        console.log("Already working...");
        return;
    }
    console.log("Checking for URL...");
    working = true;

    fetch("http://127.0.0.1:8282/toughurl")
        .then(response => response.json())
        .then(data => {
            let url = data.url;
            // For testing: let url = `https://www.axios.com/chinese-service-center-africa`;
            // for testing: let url = `https://www.science.org/content/article/spain-wants-change-how-it-evaluates-scientists-and-end-dictatorship-papers`;
            chrome.tabs.create({ url: url }, (tab) => {
                setTimeout(() => {
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['content.js']
                    });
                }, 5000); // Delay to ensure the page loads
            });
        
        })
        .catch(error => {
            console.error('Error fetching URL:', error);
            working = false;
        });
}

async function getChatGPTToken() {
    const response = await fetch("https://chat.openai.com/api/auth/session");
    if (response.status === 403) {
        throw new Error("Access Denied: Cloudflare issue");
    }
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.accessToken) {
        throw new Error("Unauthorized: No access token received");
    }
    return data.accessToken;
}

function generateUUID() {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);

    arr[6] = (arr[6] & 0x0f) | 0x40; // Version 4 UUID
    arr[8] = (arr[8] & 0x3f) | 0x80; // Variant 10x

    return Array.from(arr, (byte) => {
        const value = byte.toString(16);
        return value.length === 1 ? '0' + value : value;
    }).join('').match(/.{1,4}/g).join('-');
}

async function getArkoseToken() {
    const response1 = await fetch("https://bda.aigpt-summary.com/api/bda");
    const key = await response1.text();

    const response2 = await fetch("https://tcr9i.chat.openai.com/fc/gt2/public_key/35536E1E-65B4-4D96-9D97-6ADB7EFF8147", {
        headers: {
            accept: "*/*",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            pragma: "no-cache",
            "sec-ch-ua": '"Chromium";v="118", "Microsoft Edge";v="118", "Not=A?Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "none"
        },
        referrerPolicy: "strict-origin-when-cross-origin",
        body: key,
        method: "POST",
        mode: "cors",
        credentials: "include"
    });

    if (!response2.ok) {
        throw new Error(`HTTP error! Status: ${response2.status}`);
    }

    const data = await response2.json();
    return data.token;
}

async function callChatGPTService(content, token, arkoseToken) {
    const payload = {
        action: "next",
        messages: [{ id: generateUUID(), role: "user", content: { content_type: "text", parts: [content] } }],
        arkose_token: arkoseToken,
        model: "text-davinci-002-render", //"gpt-3.5-turbo",
        parent_message_id: generateUUID()
    };

    const chatGPTEndpoint = "https://chat.openai.com/backend-api/conversation";

    console.log(JSON.stringify(payload));
    const response = await fetch(chatGPTEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
}

async function processContentWithChatGPT(content) {
    const token = await getChatGPTToken();
    const arkoseToken = await getArkoseToken();
    try {
        const response = await callChatGPTService(content, token, arkoseToken);
        console.log("ChatGPT Response:", response);
    } catch (error) {
        console.error("Error in processing content with ChatGPT:", error);
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "jobDone") {
        console.log(message.content);
        prompt = "Please summarize the current economy"; // + message.content + "\n\n";
        processContentWithChatGPT(prompt).then(summary => {
            // Send the summary back to the content script or popup
            console.log(summary);
            chrome.runtime.sendMessage({ action: "displaySummary", summary: summary });
        });

        setTimeout(() => {
            chrome.tabs.get(sender.tab.id, tab => {
                if (chrome.runtime.lastError) {
                    console.log("The tab may have been closed");
                } else {
                    chrome.tabs.remove(sender.tab.id);
                }
            });
            working = false;
        }, 2000);
    }
});

setInterval(checkForUrl, 200000);
