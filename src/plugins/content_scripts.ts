import {Biz} from "src/utils/biz";
import {Utils} from "src/utils/utils";

export class JqGet {
  async init(fetchServer = false) {
    this.pInfo = Biz.getProductInformation() as { [p: string]: string }
    if (fetchServer) {
      console.log("****pInfo:", await Utils.storeGetAll());
    }
    await this.main(fetchServer);
  }

  pInfo: { [x: string]: string; } = {}
  orderDetail: { [x: string]: any; } = {}
  endDateTime: Date = new Date();

  async main(fetchServer: boolean) {
    const productInformation = this.pInfo;
    if (!productInformation) {
      Biz.otherPage();
      return console.log("****productInformation is not exit:", productInformation);
    }

    const endTime = productInformation["終了日時"]
    if (Utils.isBidExpired(endTime)) {
      return console.log("****endTime終了日時:" + endTime);
    }
    if (fetchServer) {
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

    // prepare data
    this.endDateTime = Utils.dateParse(endTime);
    /**
     * 1.自動延長
     */
    if (productInformation["自動延長"] == "あり") {
      this.autoBidExtension();
    } else {
      this.notAutoBidExtension();
    }
  }

  callbackID1: number = 0;
  callbackID2: number = 0;

  private autoBidExtension() {
    if (this.offerBid()) {
      return clearTimeout(this.callbackID1);
    }
    clearTimeout(this.callbackID1)
    this.callbackID1 = window.setTimeout(this.init.bind(this), 1000);
  }

  private notAutoBidExtension() {
    if (this.offerBid()) {
      return clearTimeout(this.callbackID2);
    }
    clearTimeout(this.callbackID2)
    this.callbackID2 = window.setTimeout(this.notAutoBidExtension.bind(this), 1000);
  }

  offerBid() {
    let isTime = Utils.isTimeToBid(this.endDateTime);
    if (isTime) {
      console.log("******************************************************************************************开始抢了:", isTime);
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
    return isTime;
  }
}

const OverTime = {
  day: 0,
  hour: 0,
  min: 0,
  sec: 0,
}

let timeLeft = 30;
let isFirstPaint = true
var timeSinceLast = 0;
var outputString = "";
var xmlhttp = createXMLHttp();
const jqGet = new JqGet();
jqGet.init(true);


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
  xmlhttp.open("GET", "https://page.auctions.yahoo.co.jp/now?aID=q1107988099&nowtime=" + nowTime, true);
  xmlhttp.send(null);


}

function timePaint() {
  if (!/^\/jp\/auction\/[a-z][0-9]{10}$/.test(location.pathname)) {
    return;
  }
  if (isFirstPaint || timeLeft == -1 || (timeLeft < 300 && timeSinceLast >= 60)) {
    checkObject();
    isFirstPaint = false;
    timeSinceLast = 0;
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
    OverTime.day = day
    OverTime.hour = hour
    OverTime.min = min
    OverTime.sec = sec
    timeLeft -= 1;
    timeSinceLast += 1;
  }
  console.log("****残り時間:", outputString, OverTime)
}

setInterval(timePaint, 1000);
