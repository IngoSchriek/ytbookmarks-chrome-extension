chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    const queryParameters = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      videoId: urlParameters.get("v"),
    });
  }
});

chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.url && details.url.includes("youtube.com/watch")) {
    const queryParameters = details.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    chrome.tabs.sendMessage(details.tabId, {
      type: "NEW",
      videoId: urlParameters.get("v"),
    });
  }
});