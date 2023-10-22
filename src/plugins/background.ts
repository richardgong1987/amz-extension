import {Utils} from "src/utils/utils";

const connPorts = new Map<number | string | undefined, chrome.runtime.Port>;

function openWindow(message: { list: { url: string }[] }) {
  message.list.forEach(value => {
      chrome.tabs.query({url: "https://page.auctions.yahoo.co.jp/jp/auction/*"}, function (tabs) {
        if (!tabs.some(tab => tab.url == value.url)) {
          chrome.tabs.create({url: value.url})
        }
      });
    }
  );
}

function updateItemByMsg(message: { id: string }) {
  if (message.id) {
    const newVar = connPorts.get(message.id);
    if (newVar?.sender?.tab) {
      reloadTab(newVar.sender.tab);
    }
  }

}

chrome.runtime.onConnect.addListener(async function (port) {
  if (port.name.startsWith("GHJ-port")) {
    // Add the port to the list of connected ports
    const orderId = port.name.split("-").pop();
    if (orderId == "auction_closeTab") {
      try {
        // @ts-ignore
        return await chrome.tabs.remove(port.sender?.tab?.id)
      } catch (e) {
      }
    }
    if (connPorts.has(orderId)) {
      try {
        // @ts-ignore
        return await chrome.tabs.remove(port.sender?.tab?.id)
      } catch (e) {
      }
    }
    connPorts.set(orderId, port);
    port.onMessage.addListener((message) => {
      if (message.action === "startRefresh") {
        main();
      } else if (message.action == "stopRefresh") {
        clearMain();
      } else if (message.action == "auction_timeLeft") {
        // @ts-ignore
        port.mydata = message;
        activeUPComingAuction();
      } else if (message.action == "auction_closeTab") {
        removeTabByMsg(port, message);
      }  else if (message.action == "auction_reloadTab") {
        // @ts-ignore
        reloadTab(port.sender?.tab);
      } else if (message.action == "auction_updateItem") {
        updateItemByMsg(message);
      } else if (message.action == "open_pages") {
        openWindow(message);
      }
    });
    // Handle disconnections
    port.onDisconnect.addListener(function () {
      connPorts.delete(port.name.split("-").pop())
      activeUPComingAuction();
    });
  }
});

function postMessageCenter(port: chrome.runtime.Port, message: any) {
  try {
    port?.postMessage(message);
  } catch (e) {

  }
}

function broadcastMessage(message: any) {
  console.log("*****connPorts:", connPorts);
  connPorts.forEach(function (port) {
    if (isAuctionPage(port.sender?.url)) {
      postMessageCenter(port, message);
    }
  });
}

function broadcastMessageRandom(message: any) {
  connPorts.forEach(function (port) {
    if (isAuctionPage(port.sender?.url)) {
      setTimeout(() => {
        postMessageCenter(port, message);
      }, Utils.range(1, 8));
    }
  });
}

const SETUP_START = "setup_start"
const doAuction = {action: "do_auction"};
const docheckObject = {action: "call_checkObject"};
let mainDoAuctionSet = 0;
let mainDocheckObjectSet = 0;

Utils.STORE_GET_ITEM(SETUP_START).then(isStart => {
  if (isStart === true) {
    main()
  }
});

async function main() {
  await clearMain();
  broadcastMessage(doAuction);
  mainDoAuctionSet = setInterval(function () {
    broadcastMessage(doAuction);
  }, 1000);
  mainDocheckObjectSet = setInterval(function () {
    broadcastMessageRandom(docheckObject)
  }, 2 * 60 * 1000);
  await Utils.STORE_SET_ITEM(SETUP_START, true);
  AUCTIONS_TABS_ALL(tab => reloadTab(tab))
}

async function clearMain() {
  await Utils.STORE_SET_ITEM(SETUP_START, false);
  clearInterval(mainDoAuctionSet)
  clearInterval(mainDocheckObjectSet);
}

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

function removeTabByMsg(port: chrome.runtime.Port, message: { msg: string, action: string }) {
  if (message.msg != "donot_close") {
    const tab = port.sender?.tab as chrome.tabs.Tab;
    console.log(`*****msg:${message.msg}, 10秒后关闭, ${tab.title},${tab.url}`);
    removeTabTimeOut(tab);
  }
}

function removeTabTimeOut(tab: chrome.tabs.Tab) {
  setTimeout(() => {
    try {
      if (tab?.id != null) {
        chrome.tabs.remove(tab.id)
      }
      setTimeout(() => {
        broadcastMessageRandom(docheckObject)
      }, 20);
    } catch (e) {
    }
  }, 8 * 1000);
}


function activeUPComingAuction() {
  Utils.STORE_GET_ITEM(SETUP_START).then(isStart => isStart === true && doUpCommingTab());
}

function doUpCommingTab() {
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
