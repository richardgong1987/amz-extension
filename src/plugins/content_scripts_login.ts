import {IData} from "src/common/constant";
import {Utils} from "src/utils/utils";


export class Login {

  async init() {
    console.info("******* apple auto login already");
    let data = await Utils.storeGetAll() as IData;
  }
}

let login = new Login();
login.init();

