// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    const saveButton = document.getElementById('save');
    const apiKeyInput = document.getElementById('apiKey');
    const promptInput = document.getElementById('prompt');

    // Load the saved API key and prompt when the options page is opened
    chrome.storage.sync.get(['apiKey', 'prompt'], function(data) {
        apiKeyInput.value = data.apiKey || '';
        promptInput.value = data.prompt || '';
    });

    // Save the API key and prompt when the save button is clicked
    saveButton.addEventListener('click', function() {
        const apiKey = apiKeyInput.value;
        const prompt = promptInput.value;
        chrome.storage.sync.set({apiKey: apiKey, prompt: prompt}, function() {
            console.log('Settings saved');
            // You can add an alert or update the UI to indicate success
        });
    });
});
