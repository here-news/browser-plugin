## Browser-based scraping with Chrome extensions

For those strictly prohibited web pages, we tend to move to client side and make them into news.

### What it can do?
- [] 
- [] 


## What scripts are used?

### background script

A [background script](https://developer.chrome.com/extensions/background_pages) is used to listen for messages from other scripts. As the name indicates, this runs in the background and is always available &mdash; even if no devtools windows are open.

This is executed by setting the following properties in the extension's [manifest](https://developer.chrome.com/extensions/manifest):

```json
"background": {
    "scripts": [ "background.js" ]
}
```

All this simple background script does is change the icon displayed in the Chrome toolbar when the extension is in use.

### content script

A [content script](https://developer.chrome.com/extensions/content_scripts) is also set up through the manifest using this configuration:

```json
"content_scripts": [{
    "all_frames": true,
    "js": [ "content.js" ],
    "matches": [ "*://*/*" ]
}]
```

This script is injected by the extension into each frame of the page. It can access the DOM of the user's page, but runs in an isolated JavaScript environment.

The content script can also use `chrome.*` APIs as explained in the [extensions docs](https://developer.chrome.com/extensions/content_scripts#capabilities).

> Note: although not shown in this example, the content script could pass messages to the background script or other parts of the extension through the [`chrome.runtime.connect` API](https://developer.chrome.com/extensions/content_scripts#host-page-communication).

### injected script

The content script also injects a `<script>` tag into the users page. This injected script has access to the DOM and also the JavaScript environment of the user's page.

This script sets up a global variable (`window.__SAMPLE_EXTENSION_NAMESPACE__`) that contains functions that can be used by devtools page (explained below).

> Note: although not shown in this example, the injected script could pass messages to the content script through [`window.postMessage`](https://developer.chrome.com/extensions/content_scripts#host-page-communication).

### devtools_page

Not _technically_ a script, but this html page loads a JavaScript file that extends Chrome's devtools with a new panel.

This panel uses the [chrome.devtools.inspectedWindow.eval](https://developer.chrome.com/extensions/devtools_inspectedWindow) to call functions on the `__SAMPLE_EXTENSION_NAMESPACE__` object to retrieve data from the user's page and display it in the devtools panel.

## How do I run it?

1. clone the repo
2. navigate Chrome to chrome://extensions/
3. click "Load Unpacked"
4. select the directory where the repo is cloned
5. open Chrome devtools and click on the "Sample Extension" panel
