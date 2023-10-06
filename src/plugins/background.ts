import {Utils} from "src/utils/utils";

const LASTACTIONURLKEY = "lastActionUrl";

function reloadTab(tab: chrome.tabs.Tab) {
  if (tab.id) {
    chrome.tabs.reload(tab.id);
  }
}

function activateTab(tab: chrome.tabs.Tab) {
  if (tab) {
    if (tab.id) {
      chrome.tabs.update(tab.id, {active: true});
    } else {
      activateTabByRecord();
    }
  }
}

async function activateTabByRecord() {
  let url = await Utils.STORE_GET_ITEM(LASTACTIONURLKEY);
  chrome.tabs.query({}, function (tabs: chrome.tabs.Tab[]) {
    for (const tab of tabs) {
      if (tab.url == url && isinAuction(tab)) {
        currentTabInfo.tab = tab;
        activateTab(currentTabInfo.tab);
        break;
      }
    }

  })
}

function isinAuction(tab: chrome.tabs.Tab) {
  if (tab.id) {
    let locate = getURL(tab);
    return Utils.isAuctionUrl(locate.pathname)
  }
  return false;
}

function getURL(tab: chrome.tabs.Tab) {
  try {
    return new URL(tab.url as string);
  } catch (e) {
  }
  return {
    pathname: ""
  }

}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startRefresh") {
    clearAllInterval();
    startAllInterval();
  } else if (message.action == "stopRefresh") {
    clearAllInterval();
  } else if (message.action == "auction_timeLeft") {
    activeUPComingAuction(message);
  }
});

let currentTabInfo = {
  timeLeft: Number.MAX_VALUE,
  tab: ({} as chrome.tabs.Tab),
}

function activeUPComingAuction(message: { url: string, timeLeft: number, action: string }) {
  chrome.tabs.query({}, function (tabs: chrome.tabs.Tab[]) {
    console.log("****tabs:", tabs, message);
    for (const tab of tabs) {
      if (tab.url == message.url && isinAuction(tab) && message.timeLeft <= currentTabInfo.timeLeft) {
        currentTabInfo.timeLeft = message.timeLeft;
        currentTabInfo.tab = tab;
        Utils.STORE_SET_ITEM(LASTACTIONURLKEY, message.url);
        break;
      }
    }
    activateTab(currentTabInfo.tab);
  })
}

function callAuction() {
  chrome.tabs.query({}, function (tabs: chrome.tabs.Tab[]) {
    for (const tab of tabs) {
      if (tab.id && isinAuction(tab)) {
        chrome.tabs.sendMessage(tab.id, {action: "do_auction"})
      }
    }
  })
}

callAuction();
setInterval(callAuction, 1000);
let activeTabInterval: any;

function startAllInterval() {
  activeTabInterval = setInterval(function () {
    activateTab(currentTabInfo.tab);
  }, 3000);
}

function clearAllInterval() {
  clearInterval(activeTabInterval);
}

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "update") {
    console.log("Extension has been updated.");
    // Reload all tabs to apply changes
    chrome.tabs.query({}, function (tabs) {
      for (const tab of tabs) {
        if (isinAuction(tab)) {
          refreshByRandomTime(tab)
        }
      }
    });
  }
});

function refreshByRandomTime(tab: chrome.tabs.Tab) {
  setTimeout(function () {
    reloadTab(tab)
  }, Utils.range(1, 5));
}
