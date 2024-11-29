## Find Related News While You Browse the Web

Ever wanted to dive deeper into a topic you’re browsing online? This browser extension connects you to related news articles in real time, bringing you fresh, relevant, and popular insights. Powered by the HERE.news API, it not only keeps you informed but also invites you to join the conversation—share your thoughts, engage with the news, and even earn rewards for your participation.

### Key Features:
- **Instant News Discovery**: See related news articles for the topics you’re browsing without leaving the page.
- **Relevance & Popularity**: The extension curates articles based on their topical relevance and popularity.
- **Interactive Engagement**: Participate in the news ecosystem—add your opinions, share stories, and earn money.
- **Free & Easy**: Completely free to use, with seamless integration into your browsing experience.

---

## How It Works

1. **Browsing Context**: As you browse the web, the extension detects the topic on the page.
2. **HERE.news API Integration**: The detected topic is sent to the HERE.news API—a RESTful service that aggregates news articles from a variety of sources.
3. **Popup Display**: The API returns a curated list of articles, displayed in a sleek popup panel right in your browser.
4. **Engagement Options**: Users can view articles, interact with news stories, and join the HERE.news ecosystem.

---

## Technical Overview

### **Background Script**
The background script manages the extension's persistent functionality:
- Monitors messages from other scripts.
- Updates the browser toolbar icon with a notification badge indicating the number of related articles found.
- Configured in the extension manifest:
  ```json
  "background": {
      "scripts": ["background.js"]
  }
  ```

### **Content Script**
The content script handles interaction with the current web page:
- Injects code to read the DOM for topic extraction.
- Sends the extracted content to the background script for processing.
- Configured via the manifest:
  ```json
  "content_scripts": [{
      "all_frames": true,
      "js": ["content.js"],
      "matches": ["*://*/*"]
  }]
  ```
  
### **Injected Script**
This script integrates directly into the web page:
- Gains access to the full DOM and JavaScript environment.
- Sets up a global namespace (`window.__HERE_NEWS_EXTENSION__`) for cross-context communication.

### **DevTools Integration**
A custom panel in Chrome DevTools allows advanced users to:
- View API requests and responses.
- Interact with a live feed of related articles.
- Uses `chrome.devtools.inspectedWindow.eval` for seamless data retrieval and display.

---

## How to Get Started

1. Clone the repository:
   ```bash
   git clone <repo-url>
   ```
2. Navigate to Chrome’s Extensions page:
   ```
   chrome://extensions/
   ```
3. Enable **Developer Mode**.
4. Click **Load Unpacked** and select the cloned repository directory.
5. Start browsing and open DevTools to explore the "HERE.news Extension" panel.
