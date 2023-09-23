import {Biz} from "src/utils/biz";
import {Utils} from "src/utils/utils";

export class JqGet {
  async init() {
    this.productInformation = Biz.getProductInformation() as { [p: string]: string }
    console.log(JSON.stringify(this.productInformation));
    await this.main();
  }

  productInformation: { [x: string]: string; } = {}
  orderDetail: { [x: string]: any; } = {}
  endDateTime: Date = new Date();
  callbackID: number = 0;

  async main() {
    const productInformation = this.productInformation;
    if (!productInformation) {
      this.otherPage();
      return console.log("****productInformation is not exit:", productInformation);
    }

    const endTime = productInformation["終了日時"]
    if (Utils.isBidExpired(endTime)) {
      return console.log("****endTime終了日時:", endTime);
    }

    const orderDetail = this.orderDetail = await Biz.orderDetail(productInformation["オークションID"]);
    if (!orderDetail || orderDetail.status != 0) {
      return console.log("****orderDetail is failure:", orderDetail);
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

  private autoBidExtension() {
    this.notAutoBidExtension();
    this.callbackID = window.setTimeout(this.init.bind(this), 10);
  }

  private notAutoBidExtension() {
    if (Utils.isTimeToBid(new Date(), this.endDateTime)) {
      window.clearTimeout(this.callbackID);
      //1. bid
      Biz.bid();
      //2. can not upper the limit price
      if (!Biz.isGoodPrice(this.orderDetail["limitPrice"])) {
        return console.log("****can not upper limitPrice:", this.orderDetail["limitPrice"]);
      }
      //3. 確認する
      Utils.clickWithSelector(".js-validator-submit")

      return true;
    }
    this.callbackID = window.setTimeout(this.notAutoBidExtension.bind(this), 10);
  }

  otherPage() {
    Biz.agreeBid();
    Biz.searchPage();
  }
}

const jqGet = new JqGet();
jqGet.init();




