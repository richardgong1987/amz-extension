import {Utils} from "src/utils/utils";


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

async function cleanupMap(tabs: chrome.tabs.Tab[]) {
    let auctionObj = await Utils.STORE_GET_ALL();
    setTimeoutMap.forEach((value, id) => {
        if (!auctionObj[id]) {
            setTimeoutMap.delete(id);
        }
    })
}

function refreshTab(tabs: chrome.tabs.Tab[]) {
    cleanupMap(tabs)
    for (const tab of tabs) {
        if (tab.id && !tab.active && isinAuction(tab)) {
            customRefreshPoint(tab)
        }
    }

}

function myClearTimeOut(tab: chrome.tabs.Tab) {
    let newVar = setTimeoutMap.get(getAuctionIdByTab(tab));
    if (newVar) {
        clearTimeout(newVar.setTimeOutSet)
    }
}

interface IRefreshInfo {
    waiting: boolean,
    tabId: string,
    setTimeOutTime: number,
    setTimeOutSet: any,
    auctionId: string,
    timeLeft: number
}

const setTimeoutMap = new Map<string, IRefreshInfo>()

function getAuctionIdByTab(tab: chrome.tabs.Tab) {
    return tab.url?.split("/").pop() as string
}

async function customRefreshPoint(tab: chrome.tabs.Tab) {
    let auctionObj = await Utils.STORE_GET_ALL();
    const auctionId = getAuctionIdByTab(tab);
    let auctionItem = auctionObj[auctionId];
    console.log("*****setTimeoutMap:", setTimeoutMap);
    if (auctionItem) {
        let refreshInfo = setTimeoutMap.get(auctionId) || {
            auctionId: auctionId,
            setTimeOutSet: undefined,
            setTimeOutTime: 0,
            tabId: tab.id + "",
            timeLeft: auctionItem["timeLeft"] as number,
            waiting: false
        };
        if (!refreshInfo.waiting && refreshInfo.timeLeft > 0) {
            refreshInfo.waiting = true;
            refreshInfo.setTimeOutTime = (refreshInfo.timeLeft % 300) / 5
            refreshInfo.setTimeOutSet = setTimeout(() => {
                refreshInfo.waiting = false;
                setTimeoutMap.set(auctionId, refreshInfo)
                console.log("*****setTimeoutMap2222:", setTimeoutMap);
                reloadTab(tab);
            }, refreshInfo.setTimeOutTime * 1000);
            setTimeoutMap.set(auctionId, refreshInfo)
        }
    }
}

function reloadTab(tab: chrome.tabs.Tab) {
    if (tab.id) {
        chrome.tabs.reload(tab.id);
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("****message:", message)
    if (message.action === "startRefresh") {
        clearAllInterval();
        startAllInterval();
    } else {
        clearAllInterval();
    }
});

const REFRESH_TIME = 3 * 1000;
const UPCOMMING_TIME = 5 * 1000;
let refreshInterval: any;
let upCommingInterval: any;
startAllInterval();

function refreshInactiveTabs() {
    getAllTabs(refreshTab);
}

function activeUpComingTabs() {
    getAllTabs(activateTheUpComingTab);
}

function startAllInterval() {
    refreshInterval = setInterval(refreshInactiveTabs, REFRESH_TIME);
    upCommingInterval = setInterval(activeUpComingTabs, UPCOMMING_TIME);
}

function clearAllInterval() {
    setTimeoutMap.clear();
    clearInterval(refreshInterval);
    clearInterval(upCommingInterval);
}
