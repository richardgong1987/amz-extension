import {IData,} from "src/common/constant";
import {Biz} from "src/utils/biz";
import {Utils} from "src/utils/utils";

export class JqGet {
  async init() {
    let data = await Utils.storeGetAll() as IData;
    Utils.data = Object.assign(Utils.data, data);
    // Utils.websocketInit();
    console.log(JSON.stringify(Biz.getProductInformation()));
    // Biz.bid();
  }

  endDateTime: Date = new Date();
  callbackID: number = 0;

  main() {
    const productInformation = Biz.getProductInformation();
    if (!productInformation) {
      return;
    }

    const endTime = productInformation["終了日時"]
    if (Utils.isBidExpired(endTime)) {
      return;
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

  }

  private notAutoBidExtension() {
    if (Utils.isTimeToBid(new Date(), this.endDateTime)) {
      window.cancelAnimationFrame(this.callbackID);
      //1. bid
      Biz.bid();
      //2.
      if (!Biz.isGoodPrice(1000)) {
        return false;
      }
      return window.cancelAnimationFrame(this.callbackID);
    }
    this.callbackID = window.requestAnimationFrame(this.notAutoBidExtension.bind(this));
  }
}

const jqGet = new JqGet();
jqGet.init();




