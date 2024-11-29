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

async function callOpenAIAPI(content) {
    const messages = [{ role: "user", content: content }];
    chrome.storage.sync.get(['apiKey'], function(data){
        apiKey = data.apiKey; 
        if (!apiKey) {
            console.error("API key not found");
            throw new Error("API key not found");
        }
    });
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                messages: messages,
                model: "gpt-3.5-turbo",
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        r = await response.json();
        result = r.choices[0].message.content;
        return result
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        throw error;
    }
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "jobDone") {
        console.log(message.content);
        chrome.storage.sync.get(['prompt'], function(data){
            prompt = data.prompt;
            if (!prompt){
                prompt = "Cleasen the content and summarize it into list of facts and opinions, including clear time and names for events:" 
            }
        }); 
        prompt = prompt + message.content;
        callOpenAIAPI(prompt).then(summary => {
            // Send the summary back to the content script or popup
            console.log(summary);
            //chrome.runtime.sendMessage({ action: "displaySummary", summary: summary });
            // will deal with the summary here
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

function updateParameters() {
    chrome.storage.sync.get(['apiKey', 'prompt'], function(data) {
        apiKey = data.apiKey || '';
        prompt = data.prompt || '';
    });
}

let apiKey = "";
let prompt = "";
updateParameters(); 
console.log(`Starting background script with(${apiKey}, ${prompt})...`);
setInterval(checkForUrl, 120000);
