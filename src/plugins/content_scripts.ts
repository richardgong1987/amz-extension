import {IData,} from "src/common/constant";
import {Biz} from "src/utils/biz";
import {Utils} from "src/utils/utils";


export class JqGet {
  async init() {
    let data = await Utils.storeGetAll() as IData;
    Utils.data = Object.assign(Utils.data, data);
    // Utils.websocketInit();
    console.log(JSON.stringify(Biz.getProductInformation()));
    Biz.bid();
  }
}

let jqGet = new JqGet();
jqGet.init();





