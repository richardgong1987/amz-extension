import {Utils} from "src/utils/utils";

let currentTabInfo = {
  timeLeft: Number.MAX_VALUE,
  url: "",
}
let activeTabInterval: any;

callAuction();
setInterval(callAuction, 1000);

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

setInterval(function () {
  // @ts-ignore
  AUCTIONS_TABS_ALL(tab => isinAuction(tab) && chrome.tabs.sendMessage(tab.id, {action: "call_checkObject"}));
}, 2 * 60 * 1000);

function reloadTab(tab: chrome.tabs.Tab) {
  // @ts-ignore
  chrome.tabs.reload(tab.id);
}

function activateTab(tab: chrome.tabs.Tab) {
  // @ts-ignore
  chrome.tabs.update(tab.id, {active: true});
}

function isinAuction(tab: chrome.tabs.Tab) {
  let locate = getURL(tab);
  return Utils.isAuctionUrl(locate.pathname)
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
  AUCTIONS_TABS_ALL(tab => {
    if (tab.url == message.url && isinAuction(tab)) {
      console.log(`*****${message.msg},1分钟后关闭, ${tab.title},${tab.url}`);
      removeTabTimeOut(tab);
    }
  })
}

function removeTabTimeOut(tab: chrome.tabs.Tab) {
  // @ts-ignore
  setTimeout(() => chrome.tabs.remove(tab.id), 60 * 1000);
}


function activeUPComingAuction(message: { url: string, timeLeft: number, action: string }) {
  AUCTIONS_TABS_ALL(tab => {
    if (tab.url == message.url && isinAuction(tab) && message.timeLeft <= currentTabInfo.timeLeft) {
      currentTabInfo.timeLeft = message.timeLeft;
      currentTabInfo.url = message.url;
      activateTab(tab);
    }
  })
}


function startAllInterval() {
  clearAllInterval();
  activeTabInterval = setInterval(() => AUCTIONS_TABS_ALL(tab => tab.url == currentTabInfo.url && isinAuction(tab) && activateTab(tab)), 3000);
}

function clearAllInterval() {
  clearInterval(activeTabInterval);
}

function callAuction() {
  // @ts-ignore
  AUCTIONS_TABS_ALL(tab => isinAuction(tab) && chrome.tabs.sendMessage(tab.id, {action: "do_auction"}));
}

chrome.runtime.onInstalled.addListener(details => details.reason === "update" && AUCTIONS_TABS_ALL(tab => isinAuction(tab) && reloadTab(tab)));

function AUCTIONS_TABS_ALL(callback: (tab: chrome.tabs.Tab) => any) {
  chrome.tabs.query({url: "https://page.auctions.yahoo.co.jp/jp/auction/*"}, function (tabs) {
    // tabs is an array of tab objects that match the URL pattern
    tabs.forEach(function (tab) {
      if (isinAuction(tab)) {
        try {
          callback(tab)
        } catch (e) {
          console.log("*****custome e:", e);
        }
      }
    });
  });
}
