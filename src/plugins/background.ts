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
        let tabByUrl = searchTabByUrl(id, tabs) as chrome.tabs.Tab;
        activateTab(tabByUrl);
        refreshCurrentTabWhenTriggerActived(tabByUrl);
    }
}

function refreshCurrentTabWhenTriggerActived(tab: chrome.tabs.Tab) {
    if (!tab.active) {
        setTimeout(() => {
            reloadTab(tab)
        }, 80);
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
    let auctionObj = await Utils.STORE_GET_ALL();
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
            mySetTimeOut(tab)
        }
    }
}

function myClearTimeOut(tab: chrome.tabs.Tab) {
    clearTimeout(setTimeoutMap.get(String(tab.id)))
}

function mySetTimeOut(tab: chrome.tabs.Tab) {
    const st = setTimeout(() => {
        reloadTab(tab);
    }, Utils.range(1, 10));
    // @ts-ignore
    setTimeoutMap.set(tab.id, st)
}

function reloadTab(tab: chrome.tabs.Tab) {
    if (tab.id) {
        chrome.tabs.reload(tab.id);
    }
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("****message:", message)
    if (message.action === "startRefresh") {
        clearAllInterval();
        startAllInterval();
    } else {
        clearAllInterval();
    }
});

const REFRESH_TIME =  60 * 1000;
const UPCOMMING_TIME = 10 * 1000;
let refreshInterval: any;
let upCommingInterval: any;
startAllInterval();

function startAllInterval() {
    refreshInterval = setInterval(refreshInactiveTabs, REFRESH_TIME);
    upCommingInterval = setInterval(activeUpComingTabs, UPCOMMING_TIME);
}

function clearAllInterval() {
    clearInterval(refreshInterval);
    clearInterval(upCommingInterval);
}
