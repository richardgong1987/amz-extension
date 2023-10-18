import {Biz} from "src/utils/biz";
import {Utils} from "src/utils/utils";


export class JqGet {
  pInfo: { [x: string]: string | number; } = {}
  orderDetail: { [x: string]: any; } = {}

  async main() {
    const productInformation = this.pInfo = Biz.getProductInformation() as { [p: string]: string }
    // console.log("****all  store:", await Utils.STORE_GET_ALL());
    if (!productInformation) {
      Biz.otherPage();
      return console.log("****productInformation is not exit:", productInformation);
    }
    let infoId = productInformation["オークションID"];
    const orderDetail = this.orderDetail = await Utils.STORE_GET_ITEM(infoId);
    if (!orderDetail || orderDetail.status != 1) {
      if (orderDetail.status === undefined) {
        Biz.showAddJobButton(productInformation);
      } else {
        if (orderDetail.status == 5) {
          this.pInfo["status"] = orderDetail.status
          Biz.ifSuccess(Object.assign(this.pInfo, orderDetail));
        }
      }
      return console.log("****orderDetail is failure:", orderDetail);
    }

    this.pInfo["limitPrice"] = orderDetail.limitPrice
    this.pInfo["status"] = orderDetail.status
    this.pInfo["orderId"] = orderDetail.orderId

    if (Biz.ifSuccess(this.pInfo)) {
      return console.log("****this order already success:", orderDetail);
    }
    this.createConnect();
    let old = await Utils.STORE_GET_ITEM(orderDetail.orderId);
    old.updateTime = Utils.formatDateStr(productInformation["終了日時"]);
    await Utils.STORE_SET_ITEM(orderDetail.orderId, Object.assign(old, this.pInfo));
    const pageData = Utils.getPageDataJSON();
    if (Number(pageData?.items?.price) > orderDetail.limitPrice) {
      Biz.overPrice(this.orderDetail["orderId"])
      return Biz.dialog("***main() OverPrice")
    }
  }

  createConnect() {
    if (Utils.isAuctionUrl(location.pathname)) {
      $(`<div id="time_left" style="font-size: 28px;color: red;"></div>`).insertBefore($("#acWrGlobalNavi"))
// Connect to the background script
      Biz.port = chrome.runtime.connect({name: "GHJ-port-" + auctionId});
// Listen for messages from the background script
      Biz.port.onMessage.addListener(function (message) {
        if (message.action === "do_auction") {
          timePaint();
        } else if (message.action === "call_checkObject") {
          checkObject();
        }
      });

    }

  }
  offerBid(day: number, hour: number, min: number, sec: number) {
    //  check if the time is correct
    const othersBidCount = Number($(".Count .Count__link .Count__detail").text().slice(0, -1))
    if (othersBidCount > 1) {
      if (!(day == 0 && hour == 0 && min == 0 && sec <= 5)) {
        return;
      }
    } else {
      if (!(day == 0 && hour == 0 && min == 0 && sec <= 4)) {
        return;
      }
    }
    // check order status
    // @ts-ignore
    if (!this.orderDetail || this.orderDetail.status != 1) {
      return;
    }
    // check currently prices
    // @ts-ignore
    if (Number($(".Price__value").text().split("円").shift()?.replace(/,/g, "")) > this.orderDetail.limitPrice) {
      Biz.overPrice(this.orderDetail["orderId"])
      return Biz.dialog("***offerBid OverPrice check currently prices")
    }
    //1. bid
    Biz.bid();
    //2. can not upper the limit price
    if (!Biz.isGoodPrice(this.orderDetail["limitPrice"])) {

      Biz.overPrice(this.orderDetail["orderId"])
      return Biz.dialog("***offerBid OverPricec an not upper the limit price")
    }
    setTimeout(function () {
      Utils.clickWithSelector(".js-validator-submit");
    }, 1);
    //3. 確認する
  }
}

let auctionId = location.pathname.split("/").pop() as string;
const reloadTime = Utils.rangeNumber(150, 260);
let timeLeft = -10;
let isFirstPaint = true
let timeSinceLast = 0;
let outputString = "";

const xmlhttp = createXMLHttp();
const myInstance = new JqGet();
myInstance.main();

timePaint();

function createXMLHttp() {
  try {
    // @ts-ignore
    return new ActiveXObject("Msxml2.XMLHTTP");
  } catch (e) {
    try {
      // @ts-ignore
      return new ActiveXObject("Microsoft.XMLHTTP");
    } catch (e) {
      try {
        return new XMLHttpRequest();
      } catch (e) {
      }
    }
  }
  return null;
}

function setPageData(xmlhttp: XMLHttpRequest) {
  try {
    //readyState complete(4) is OK
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      // @ts-ignore
      timeLeft = xmlhttp.responseText;
      try {
        Biz.postMessage({action: "auction_timeLeft", timeLeft: +timeLeft});
      } catch (e) {
      }
    }
  } catch (e) {

  }
}

function checkObject() {
  if (xmlhttp) {
    try {
      xmlhttp.abort();
      var nowTime = new Date().getTime();
      xmlhttp.onreadystatechange = function () {
        setPageData(xmlhttp)
      };
      xmlhttp.open("GET", "https://page.auctions.yahoo.co.jp/now?aID=" + auctionId + "&nowtime=" + nowTime, true);
      xmlhttp.send(null);

    } catch (e) {
      if (!isFirstPaint) {
        window.location.reload();
      }
    }

  } else {
    if (!isFirstPaint) {
      window.location.reload();
    }
  }
}


let timeLeftEle = document.getElementById("time_left");

function timePaint() {
  if (!Utils.isAuctionUrl(location.pathname)) {
    return;
  }

  if (outputString == Biz.BID_OVER_NAME) {
    return Biz.disconnect(auctionId, outputString);
  }
  if (timeLeft == 20) {
    return window.location.reload();
  }
  if (timeLeft > 300 && timeSinceLast >= 60 * 3) {
    return window.location.reload();
  }

  if (isFirstPaint || timeLeft == -1 || (timeLeft < 300 && timeSinceLast >= 60)) {

    if ((timeLeft < 75 && timeSinceLast >= reloadTime)) {
      return window.location.reload();
    }
    checkObject();
    isFirstPaint = false;
    timeSinceLast = 0;
  }

  if (timeLeft === -10) {
    return;
  }

  if (timeLeft <= 0) {
    outputString = Biz.BID_OVER_NAME;
    Biz.disconnect(auctionId, outputString);
    Biz.ifSuccess(myInstance.pInfo);
  } else {
    var day = Math.floor(timeLeft / 86400);
    var hour = Math.floor((timeLeft - day * 86400) / 3600);
    var min = Math.floor((timeLeft - (day * 86400) - (hour * 3600)) / 60);
    var sec = timeLeft - (day * 86400) - (hour * 3600) - (min * 60);


    if (day > 0) {
      outputString = day + "日＋" + ((hour > 0) ? hour + ":" : "") + ((min < 10) ? "0" + min : min) + ":" + ((sec < 10) ? "0" + sec : sec);
    } else {
      outputString = ((hour > 0) ? hour + ":" : "") + ((min < 10) ? "0" + min : min) + ":" + ((sec < 10) ? "0" + sec : sec);
    }
    timeLeft -= 1;
    timeSinceLast += 1;

    if (outputString != Biz.BID_OVER_NAME) {
      myInstance.offerBid(day, hour, min, sec);
    }
  }
  if (!timeLeftEle) {
    timeLeftEle = document.getElementById("time_left");
  }
  if (timeLeftEle) {
    timeLeftEle.innerText = "残り時間:" + outputString;
  }
  // console.log("****残り時間:", outputString);
}

