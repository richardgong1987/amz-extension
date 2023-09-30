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
      Utils.closeWindow30s();
      return alert("****endTime終了日時:" + endTime);
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
    this.callbackID1 = window.setTimeout(this.init.bind(this), 200);
  }

  private notAutoBidExtension() {
    if (this.offerBid()) {
      return clearTimeout(this.callbackID2);
    }
    clearTimeout(this.callbackID2)
    this.callbackID2 = window.setTimeout(this.notAutoBidExtension.bind(this), 200);
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

const jqGet = new JqGet();
jqGet.init(true);




