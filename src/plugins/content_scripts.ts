import {Biz} from "src/utils/biz";
import {Utils} from "src/utils/utils";

export class JqGet {
  async init() {
    this.pInfo = Biz.getProductInformation() as { [p: string]: string }
    console.log("****pInfo:", await Utils.storeGetAll());
    await this.main();
  }

  pInfo: { [x: string]: string; } = {}
  orderDetail: { [x: string]: any; } = {}

  async main() {
    const productInformation = this.pInfo;
    if (!productInformation) {
      Biz.otherPage();
      return console.log("****productInformation is not exit:", productInformation);
    }

    const orderDetail = this.orderDetail = await Biz.orderDetail(productInformation["オークションID"]);
    if (!orderDetail || orderDetail.status != 1) {
      if (!orderDetail) {
        Biz.showAddJobButton();
      }
      return console.log("****orderDetail is failure:", orderDetail);
    }
    this.pInfo["limitPrice"] = orderDetail.limitPrice
    this.pInfo["url"] = orderDetail.url
    this.pInfo["status"] = orderDetail.status
    if (Biz.ifSuccess(orderDetail)) {
      return console.log("****this order already success:", orderDetail);
    }

    await Utils.storeSet({[orderDetail.orderId]: this.pInfo})
    if (Number($(".Price__value").text().split("円").shift()?.replace(/,/g, "")) >= orderDetail.limitPrice) {
      Biz.overPrice(this.orderDetail["orderId"])
      return alert("main已超出最高价,30秒后关页面")
    }
  }

  offerBid(day: number, hour: number, min: number, sec: number) {
    // 1. check order status
    // @ts-ignore
    if (!this.orderDetail || this.orderDetail.status != 1) {
      return;
    }
    // 2. check currently prices
    // @ts-ignore
    if (Number($(".Price__value").text().split("円").shift()?.replace(/,/g, "")) >= this.orderDetail.limitPrice) {
      Biz.overPrice(this.orderDetail["orderId"])
      return alert("offerBid已超出最高价,30秒后关页面")
    }
    // 3. check if the time is correct
    if (!(day == 0 && hour == 0 && min == 0 && sec <= 2)) {
      return;
    }

    console.log("******************************************************************************************开始抢了:");
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


let timeLeft = -10;
let isFirstPaint = true
let timeSinceLast = 0;
let outputString = "";
const xmlhttp = createXMLHttp();
const myInstance = new JqGet();
myInstance.init();
const setTmp = setInterval(timePaint, 1000);


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
    }
  } catch (e) {

  }
}

function checkObject() {

  xmlhttp.abort();
  var nowTime = new Date().getTime();
  xmlhttp.onreadystatechange = function () {
    setPageData(xmlhttp)
  };

  xmlhttp.open("GET", "https://page.auctions.yahoo.co.jp/now?aID=" + location.pathname.split("/").pop() + "&nowtime=" + nowTime, true);
  xmlhttp.send(null);
}

function timePaint() {
  if (!/^\/jp\/auction\/[a-z][0-9]{10}$/.test(location.pathname) || $(".ClosedHeader__tag").text() == "このオークションは終了しています") {
    return clearInterval(setTmp);
  }
  if (isFirstPaint || timeLeft == -1 || (timeLeft < 300 && timeSinceLast >= 60)) {
    checkObject();
    isFirstPaint = false;
    timeSinceLast = 0;
  }

  if (timeLeft === -10) {
    return;
  }

  if (timeLeft <= 0) {
    outputString = "オークション - 終了";
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


