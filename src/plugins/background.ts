import {Utils} from "src/utils/utils";

const connPorts = new Map<number, chrome.runtime.Port>;
chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === "GHJ-port") {
    // Add the port to the list of connected ports
    connPorts.set(port?.sender?.tab?.id as number, port)
    port.onMessage.addListener((message) => {
      if (message.action == "auction_timeLeft") {
        // @ts-ignore
        port.mydata = message;
        activeUPComingAuction();
      } else if (message.action == "auction_closeTab") {
        removeTabByMsg(port, message);
      }
    });
    // Handle disconnections
    port.onDisconnect.addListener(function () {
      connPorts.delete(port?.sender?.tab?.id as number)
      activeUPComingAuction();
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
  console.log("*****connPorts:", connPorts);
  connPorts.forEach(function (port) {
    if (isAuctionPage(port.sender?.url)) {
      postMessage(port, message);
    }
  });
}

function broadcastMessageRandom(message: any) {
  connPorts.forEach(function (port) {
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

function removeTabByMsg(port: chrome.runtime.Port, message: { msg: number, action: string }) {
  const tab = port.sender?.tab as chrome.tabs.Tab;
  console.log(`*****msg:${message.msg}, 10秒后关闭, ${tab.title},${tab.url}`);
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
  }, 8 * 1000);
}


function activeUPComingAuction() {
  let minTab = connPorts.values().next().value;
  connPorts.forEach(port => {
    // @ts-ignore
    if (minTab.mydata && port.mydata && port.mydata.timeLeft < minTab.mydata.timeLeft) {
      minTab = port;
    }
  });
  if (minTab?.sender?.tab) {
    activateTab(minTab.sender.tab);
  }
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
