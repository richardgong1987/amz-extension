import {IData,} from "src/common/constant";
import {Utils} from "src/utils/utils";


export class JqGet {

  async doUpdateData() {
    await Utils.doUpdateData();
    console.log("****doUpdateData:", Utils.data);
  }

  async init() {
    let data = await Utils.storeGetAll() as IData;
    Utils.data = Object.assign(Utils.data, data);
    Utils.websocketInit().on("notifyScriptPart", (data) => {
      this.doUpdateData();
    });
  }


  openJapan() {
      window.location.href = "https://www.apple.com/jp/iphone-14-pro/";
  }
}

let jqGet = new JqGet();
jqGet.init();





