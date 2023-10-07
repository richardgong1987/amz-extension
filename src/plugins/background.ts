import {Utils} from "src/utils/utils";


function reloadTab(tab: chrome.tabs.Tab) {
  if (tab.id) {
    chrome.tabs.reload(tab.id);
  }
}

function activateTab(tab: chrome.tabs.Tab) {
  if (tab) {
    if (tab.id) {
      chrome.tabs.update(tab.id, {active: true});
    }
  }
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

function removeTabByMsg(message: { url: string, msg: number, action: string }) {
  chrome.tabs.query({}, function (tabs: chrome.tabs.Tab[]) {
    for (const tab of tabs) {
      if (tab.url == message.url && isinAuction(tab)) {
        console.log(`*****${message.msg},1分钟后关闭, ${tab.title},${tab.url}`);
        removeTabTimeOut(tab);
        break;
      }
    }
  })
}

function removeTabTimeOut(tab: chrome.tabs.Tab) {
  setTimeout(function () {
    if (tab.id != null) {
      chrome.tabs.remove(tab.id);
    }
  }, 60 * 1000);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startRefresh") {
    startAllInterval();
  } else if (message.action == "stopRefresh") {
    clearAllInterval();
  } else if (message.action == "auction_timeLeft") {
    activeUPComingAuction(message);
  } else if (message.action == "auction_closeTab") {
    removeTabByMsg(message);
  }
});

let currentTabInfo = {
  timeLeft: Number.MAX_VALUE,
  url: "",
}

function activeUPComingAuction(message: { url: string, timeLeft: number, action: string }) {
  chrome.tabs.query({}, function (tabs: chrome.tabs.Tab[]) {
    for (const tab of tabs) {
      if (tab.url == message.url && isinAuction(tab) && message.timeLeft <= currentTabInfo.timeLeft) {
        currentTabInfo.timeLeft = message.timeLeft;
        currentTabInfo.url = message.url;
        activateTab(tab);
        break;
      }
    }
  })
}

function activeTabByCurrentTabInfo() {
  chrome.tabs.query({}, function (tabs: chrome.tabs.Tab[]) {
    for (const tab of tabs) {
      if (tab.url == currentTabInfo.url && isinAuction(tab)) {
        activateTab(tab);
        break;
      }
    }
  })
}

function callAuction() {
  chrome.tabs.query({}, function (tabs: chrome.tabs.Tab[]) {
    for (const tab of tabs) {
      if (tab.id && isinAuction(tab)) {
        try {
          chrome.tabs.sendMessage(tab.id, {action: "do_auction"}, function () {
          })
        } catch (e) {
          console.log("*****backgroud.js e:", e);
        }
      }
    }
  })
}

callAuction();
setInterval(callAuction, 1000);
let activeTabInterval: any;

function startAllInterval() {
  clearAllInterval();
  activeTabInterval = setInterval(function () {
    activeTabByCurrentTabInfo();
  }, 3000);
}

function clearAllInterval() {
  clearInterval(activeTabInterval);
}

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "update") {
    chrome.tabs.query({}, function (tabs) {
      for (const tab of tabs) {
        if (isinAuction(tab)) {
          reloadTab(tab)
        }
      }
    });
  }
});
