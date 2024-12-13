// options.js

document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById("score-slider");
    const scoreDisplay = document.getElementById("score-display");
    const cacheSizeSelect = document.getElementById("cache-size-select");
    const saveButton = document.getElementById("save-button");
    const statusMessage = document.getElementById("status-message");

    // Define slider values and corresponding thresholds
    const thresholds = {
        1: 0.85, // Fuzzier
        2: 0.91, // Similar
        3: 0.95  // Accurate
    };

    // Load stored settings
    chrome.storage.local.get("settings", (data) => {
        const settings = data.settings || {};

        // Set score threshold
        const currentThreshold = settings.scoreThreshold || 0.91; // Default to "Similar"
        const sliderPosition = Object.keys(thresholds).find(key => thresholds[key] === currentThreshold) || 2;
        slider.value = sliderPosition;
        scoreDisplay.textContent = `${slider.value === '1' ? 'Fuzzier' : slider.value === '2' ? 'Similar' : 'Accurate'} (${thresholds[slider.value]})`;

        // Set cache size
        const currentCacheSize = settings.cacheSize || 100; // Default to 100
        cacheSizeSelect.value = currentCacheSize;
    });

    // Update display when slider is moved
    slider.addEventListener("input", () => {
        const selectedThreshold = thresholds[slider.value];
        scoreDisplay.textContent = `${slider.value === '1' ? 'Fuzzier' : slider.value === '2' ? 'Similar' : 'Accurate'} (${selectedThreshold})`;
    });

    // Save settings when the save button is clicked
    saveButton.addEventListener("click", () => {
        const selectedThreshold = thresholds[slider.value];
        const selectedCacheSize = parseInt(cacheSizeSelect.value, 10);

        chrome.storage.local.set({
            settings: { 
                scoreThreshold: selectedThreshold,
                cacheSize: selectedCacheSize
            }
        }, () => {
            statusMessage.textContent = "Settings saved successfully!";
            statusMessage.style.color = "green";

            // Clear message after a short delay
            setTimeout(() => {
                statusMessage.textContent = "";
            }, 2000);
        });
    });
});
