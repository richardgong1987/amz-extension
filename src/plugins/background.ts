import {Utils} from "src/utils/utils";

const setTimeoutMap = new Map<string, any>()


function getAllTabs(complete = function (tabs: chrome.tabs.Tab[]) {
}) {
    chrome.tabs.query({}, complete)
}

async function activateTheUpComingTab(tabs: chrome.tabs.Tab[]) {
    console.log("***Tabs:", tabs);
    let id = await getUpcommingInfo();
    if (id) {
        activateTab(searchTabByUrl(id, tabs) as chrome.tabs.Tab)
    }
}

function searchTabByUrl(id: string, tabs: chrome.tabs.Tab[]) {
    for (const tab of tabs) {
        if (tab.id && isinAuction(tab)) {
            let locate = getURL(tab);
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
    }, Utils.range(1, 10));
    // @ts-ignore
    setTimeoutMap.set(tab.id, st)

}


function refreshInactiveTabs() {
    getAllTabs(refreshTab);
}

function activeUpComingTabs() {
    getAllTabs(activateTheUpComingTab);
}


function isinAuction(tab: chrome.tabs.Tab) {
    if (tab.id) {
        getURL(tab);
        let locate = getURL(tab);
        return /^\/jp\/auction\/[a-z][0-9]{10}$/.test(locate.pathname)
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

const REFRESH_TIME = 2 * 60 * 1000;
const UPCOMMING_TIME = 3 * 1000;
let refreshInterval = setInterval(refreshInactiveTabs, REFRESH_TIME);
let upCommingInterval = setInterval(activeUpComingTabs, UPCOMMING_TIME);
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("****message:", message)
    if (message.action === "startRefresh") {
        clearInterval(refreshInterval);
        clearInterval(upCommingInterval);
        refreshInterval = setInterval(refreshInactiveTabs, REFRESH_TIME);
        upCommingInterval = setInterval(activeUpComingTabs, UPCOMMING_TIME);
    } else {
        clearInterval(refreshInterval);
        clearInterval(upCommingInterval);
    }
});
