import {Utils} from "src/utils/utils";

const connectedPorts: chrome.runtime.Port[] = [];
chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === "GHJ-port") {
    // Add the port to the list of connected ports
    connectedPorts.push(port);
    port.onMessage.addListener((message) => {
      if (message.action === "startRefresh") {
        startAllInterval();
      } else if (message.action == "stopRefresh") {
        clearAllInterval();
      } else if (message.action == "auction_timeLeft") {
        // @ts-ignore
        port.mydata = message;
        activeUPComingAuction();
      } else if (message.action == "auction_closeTab") {
        removeTabByMsg(port, message);
      }
    });
    // Handle disconnections
    port.onDisconnect.addListener(function () {
      const index = connectedPorts.indexOf(port);
      if (index !== -1) {
        connectedPorts.splice(index, 1);
        activeUPComingAuction();
      }
    });
  }
});

function postMessage(port: chrome.runtime.Port, message: any) {
  try {
    port?.postMessage(message);
  } catch (e) {

  }
}

function broadcastMessage(message: any) {
  console.log("*****connectedPorts:", connectedPorts);
  connectedPorts.forEach(function (port) {
    if (isAuctionPage(port.sender?.url)) {
      postMessage(port, message);
    }
  });
}

function broadcastMessageRandom(message: any) {
  connectedPorts.forEach(function (port) {
    if (isAuctionPage(port.sender?.url)) {
      setTimeout(() => {
        postMessage(port, message);
      }, Utils.range(1, 8));
    }
  });
}

const doAuction = {action: "do_auction"};
setInterval(function () {
  broadcastMessage(doAuction);
}, 1000);

let currentTabInfo = {
  timeLeft: Number.MAX_VALUE,
  url: "",
}
let activeTabInterval: any;

setInterval(function () {
  broadcastMessageRandom({action: "call_checkObject"})
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

function isAuctionPage(url: string | undefined) {
  try {
    let locate = new URL(url as string);
    return Utils.isAuctionUrl(locate.pathname)
  } catch (e) {
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

function removeTabByMsg(port: chrome.runtime.Port, message: { url: string, msg: number, action: string }) {
  const tab = port.sender?.tab as chrome.tabs.Tab;
  console.log(`*****${message.msg},1分钟后关闭, ${tab.title},${tab.url}`);
  removeTabTimeOut(tab);
}

function removeTabTimeOut(tab: chrome.tabs.Tab) {
  setTimeout(() => {
    try {
      if (tab?.id != null) {
        chrome.tabs.remove(tab.id)
      }
      setTimeout(() => {
        broadcastMessageRandom({action: "call_checkObject"})
      }, 20);
    } catch (e) {
    }
  }, 10 * 1000);
}


function activeUPComingAuction() {
  let minTab = connectedPorts[0]
  connectedPorts.forEach(port => {
    // @ts-ignore
    if (minTab.mydata && port.mydata && port.mydata.timeLeft < minTab.mydata.timeLeft) {
      minTab = port;
    }
  });
  if (minTab.sender?.tab) {
    activateTab(minTab.sender?.tab);
  }
}


function startAllInterval() {
  clearAllInterval();
  activeTabInterval = setInterval(() => activeUPComingAuction());
}

function clearAllInterval() {
  clearInterval(activeTabInterval);
}

chrome.runtime.onInstalled.addListener(details => details.reason === "update" && AUCTIONS_TABS_ALL(tab => reloadTab(tab)));

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
