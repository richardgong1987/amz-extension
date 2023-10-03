import {Utils} from "src/utils/utils";

function getAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      refreshTab(tab)
    }
  })
}

function isinAuction(tab: chrome.tabs.Tab) {
  if (tab.id) {
    let locat = new URL(tab.url as string);
    return /^\/jp\/auction\/[a-z][0-9]{10}$/.test(locat.pathname)
  }
  return false;
}

function activateTab(tab: chrome.tabs.Tab) {
  if (tab.id) {
    chrome.tabs.update(tab.id, {active: true});
  }
}

function refreshTab(tab: chrome.tabs.Tab) {
  if (tab.id != null && !tab.active && isinAuction(tab)) {
    chrome.tabs.reload(tab.id);
  }
}

let refreshInterval: any

function refreshInactiveTabs() {
  getAllTabs();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("****message:", message)
  if (message.action === "startRefresh") {
    // Start refreshing tabs every 5 seconds
    refreshInterval = setInterval(refreshInactiveTabs, 5000);
  } else if (message.action === "stopRefresh") {
    // Stop the refreshing
    clearInterval(refreshInterval);
  }
});
