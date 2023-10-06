import {Biz} from "src/utils/biz";
import {Utils} from "src/utils/utils";

export class JqGet {
  pInfo: { [x: string]: string | number; } = {}
  orderDetail: { [x: string]: any; } = {}

  async main() {
    const productInformation = this.pInfo = Biz.getProductInformation() as { [p: string]: string }
    console.log("****all  store:", await Utils.STORE_GET_ALL());
    if (!productInformation) {
      Biz.otherPage();
      return console.log("****productInformation is not exit:", productInformation);
    }
    let infoId = productInformation["オークションID"];
    const orderDetail = this.orderDetail = await Biz.orderDetail(infoId);
    if (!orderDetail || orderDetail.status != 1) {
      if (!orderDetail) {
        Biz.showAddJobButton(productInformation);
      }
      ;
      await Utils.STORE_DELETE_ITEM(infoId)
      return console.log("****orderDetail is failure:", orderDetail);
    }
    this.pInfo["limitPrice"] = orderDetail.limitPrice
    this.pInfo["url"] = orderDetail.url
    this.pInfo["status"] = orderDetail.status
    this.pInfo["orderId"] = orderDetail.orderId

    if (Biz.ifSuccess(this.pInfo)) {

      return console.log("****this order already success:", orderDetail);
    }
    let old = await Utils.STORE_GET_ITEM(orderDetail.orderId);
    if (timeLeft != -10) {
      this.pInfo["timeLeft"] = +timeLeft;
    }

    await Utils.STORE_SET_ITEM(orderDetail.orderId, Object.assign(old, this.pInfo));
    if (Number($(".Price__value").text().split("円").shift()?.replace(/,/g, "")) >= orderDetail.limitPrice) {
      Biz.overPrice(this.orderDetail["orderId"])
      return alert("main已超出最高价,30秒后关页面")
    }
    return Biz.updateProdctAjax({
      orderId: orderDetail.orderId,
      updateTime: Utils.formatDateStr(productInformation["終了日時"])
    })
  }

  offerBid(day: number, hour: number, min: number, sec: number) {
    //  check if the time is correct
    const othersBidCount = Number($(".Count .Count__link .Count__detail").text().slice(0, -1))
    if (othersBidCount > 1) {
      if (!(day == 0 && hour == 0 && min == 0 && sec <= 5)) {
        return;
      }
    } else {
      if (!(day == 0 && hour == 0 && min == 0 && sec <= 3)) {
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
    if (Number($(".Price__value").text().split("円").shift()?.replace(/,/g, "")) >= this.orderDetail.limitPrice) {
      Biz.overPrice(this.orderDetail["orderId"])

      return alert("offerBid已超出最高价,30秒后关页面")
    }

    console.log("******开始抢了:");
    //1. bid
    Biz.bid();
    //2. can not upper the limit price
    if (!Biz.isGoodPrice(this.orderDetail["limitPrice"])) {
      Biz.overPrice(this.orderDetail["orderId"])

      return alert("offerBid已超出最高价,30秒后关闭页面");
    }
    setTimeout(function () {
      Utils.clickWithSelector(".js-validator-submit");
    }, 1);
    //3. 確認する
  }
}

let auctionId = location.pathname.split("/").pop() as string;
let timeLeft = -10;
let isFirstPaint = true
let timeSinceLast = 0;
let outputString = "";
try {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "do_auction") {
      timePaint();
    }
    sendResponse(true);
  });
} catch (e) {
  console.log("******content_script e:", e);
}

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
        chrome.runtime.sendMessage({action: "auction_timeLeft", timeLeft: +timeLeft, url: location.href});
        Biz.updateProdctAjax({
          orderId: auctionId,
          timeLeft: +timeLeft
        })
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

function timePaint() {
  if (outputString == "オークション - 終了") {
    return Utils.STORE_DELETE_ITEM(auctionId);
  }
  let isTitleFinish = $(".ClosedHeader__tag").text() == "このオークションは終了しています";
  if (!Utils.isAuctionUrl(location.pathname) || isTitleFinish) {
    if (isTitleFinish) {
      Utils.STORE_DELETE_ITEM(auctionId)
    }
  }

  if (timeLeft > 300 && timeSinceLast >= 60 * 3) {
    return window.location.reload();
  }

  if (isFirstPaint || timeLeft == -1 || (timeLeft < 300 && timeSinceLast >= 60)) {

    if ((timeLeft < 75 && timeSinceLast >= 60)) {
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
    outputString = "オークション - 終了";
    Utils.STORE_DELETE_ITEM(auctionId);
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

    if (outputString != "オークション - 終了") {
      myInstance.offerBid(day, hour, min, sec);
    }
  }
  console.log("****残り時間:", outputString)
}



