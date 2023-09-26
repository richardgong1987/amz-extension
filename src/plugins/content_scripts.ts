import {Biz} from "src/utils/biz";
import {Utils} from "src/utils/utils";

export class JqGet {
  async init(fetchServer = false) {
    this.pInfo = Biz.getProductInformation() as { [p: string]: string }
    if (fetchServer) {
      console.log("****pInfo:", this.pInfo);
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
      return console.log("****endTime終了日時:", endTime);
    }
    if (fetchServer) {
      const orderDetail = this.orderDetail = await Biz.orderDetail(productInformation["オークションID"]);
      if (!orderDetail || orderDetail.status != 1) {
        if (!orderDetail) {
          Biz.showAddJobButton(productInformation);
        }
        return console.log("****orderDetail is failure:", orderDetail);
      }
      this.pInfo["limitPrice"] = orderDetail.limitPrice
      // await Utils.storeSet({[orderDetail.orderId]: this.pInfo})
      // console.log("****", await Utils.storeGet(orderDetail.orderId))
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
    this.callbackID1 = window.setTimeout(this.init.bind(this), 100);
  }

  private notAutoBidExtension() {
    if (this.offerBid()) {
      return clearTimeout(this.callbackID2);
    }
    this.callbackID2 = window.setTimeout(this.notAutoBidExtension.bind(this), 100);
  }

  offerBid() {
    let isTime = Utils.isTimeToBid(new Date(), this.endDateTime);
    if (isTime) {
      console.log("**********:isTime", isTime);
      //1. bid
      Biz.bid();
      //2. can not upper the limit price
      if (!Biz.isGoodPrice(this.orderDetail["limitPrice"])) {
        return console.log("****can not upper limitPrice:", this.orderDetail["limitPrice"]);
      }
      setTimeout(function () {
        Utils.clickWithSelector(".js-validator-submit");
      }, 10);
      //3. 確認する
    }
    return isTime;
  }
}

const jqGet = new JqGet();
jqGet.init(true);




