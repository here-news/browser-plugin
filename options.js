// options.js

document.addEventListener("DOMContentLoaded", () => {
    const slider = document.getElementById("score-slider");
    const scoreDisplay = document.getElementById("score-display");
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
        const currentThreshold = settings.scoreThreshold || 0.91; // Default to "Similar"

        // Find the slider position corresponding to the current threshold
        const sliderPosition = Object.keys(thresholds).find(key => thresholds[key] === currentThreshold) || 2;
        slider.value = sliderPosition;
        scoreDisplay.textContent = `${sliderPosition === '1' ? 'Fuzzier' : sliderPosition === '2' ? 'Similar' : 'Accurate'} (${thresholds[slider.value]})`;
    });

    // Update display when slider is moved
    slider.addEventListener("input", () => {
        const selectedThreshold = thresholds[slider.value];
        scoreDisplay.textContent = `${slider.value === '1' ? 'Fuzzier' : slider.value === '2' ? 'Similar' : 'Accurate'} (${selectedThreshold})`;
    });

    // Save settings when the save button is clicked
    saveButton.addEventListener("click", () => {
        const selectedThreshold = thresholds[slider.value];

        chrome.storage.local.set({
            settings: { scoreThreshold: selectedThreshold }
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
