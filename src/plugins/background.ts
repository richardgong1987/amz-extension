import {Utils} from "src/utils/utils";

const setTimeoutMap = new Map<string, any>()

function getAllTabs() {
    chrome.tabs.query({}, (tabs) => {
        refreshTab(tabs)
        activateTheUpComingTab(tabs);
    })
}

async function activateTheUpComingTab(tabs: chrome.tabs.Tab[]) {
    let id = await getUpcommingInfo();
    if (id) {
        activateTab(searchTabByUrl(id, tabs) as chrome.tabs.Tab)
    }
}

function searchTabByUrl(id: string, tabs: chrome.tabs.Tab[]) {
    for (const tab of tabs) {
        if (tab.id && isinAuction(tab)) {
            let locate = new URL(tab.url as string);
            if (locate.pathname.split("/").pop() == id) {
                return tab
            }
        }
    }
    return null
}

async function getUpcommingInfo() {
    let auctionObj = await Utils.storeGetAll();
    let minTime = Number.MAX_VALUE
    let upComingId: string = ""
    for (let id in auctionObj) {
        let v = auctionObj[id];
        if (v.timeLeft > 0 && v.timeLeft < minTime) {
            minTime = v.timeLeft
            upComingId = id
        }
    }
    return upComingId;
}

function activateTab(tab: chrome.tabs.Tab) {
    if (tab && tab.id) {
        myClearTimeOut(tab)
        chrome.tabs.update(tab.id, {active: true});
    }
}

function refreshTab(tabs: chrome.tabs.Tab[]) {
    for (const tab of tabs) {
        if (tab.id && !tab.active && isinAuction(tab)) {
            myClearTimeOut(tab);
            mysetTimeOut(tab)
        }
    }
}

function myClearTimeOut(tab: chrome.tabs.Tab) {
    clearTimeout(setTimeoutMap.get(String(tab.id)))
}

function mysetTimeOut(tab: chrome.tabs.Tab) {
    const st = setTimeout(() => {
        if (tab.id) {
            chrome.tabs.reload(tab.id);
        }
    }, Utils.range(1, 8));
    // @ts-ignore
    setTimeoutMap.set(tab.id, st)

}

let refreshInterval = setInterval(refreshInactiveTabs, 2 * 60 * 1000);

function refreshInactiveTabs() {
    getAllTabs();
}


function isinAuction(tab: chrome.tabs.Tab) {
    if (tab.id) {
        let locate = new URL(tab.url as string);
        return /^\/jp\/auction\/[a-z][0-9]{10}$/.test(locate.pathname)
    }
    return false;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("****message:", message)
    if (message.action === "startRefresh") {
        // Start refreshing tabs every 5 seconds
        clearInterval(refreshInterval);
        refreshInterval = setInterval(refreshInactiveTabs, 2 * 60 * 1000);
    } else if (message.action === "stopRefresh") {
        // Stop the refreshing
        clearInterval(refreshInterval);
    }
});
