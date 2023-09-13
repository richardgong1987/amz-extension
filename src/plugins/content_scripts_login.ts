import {IData} from "src/common/constant";
import {Utils} from "src/utils/utils";


export class Login {

  async init() {
    console.info("******* apple auto login already");
    let data = await Utils.storeGetAll() as IData;
    console.log("******* auth:", location.href);
    if (!data.isStart) {
      return;
    }
    if (!data.isGuestMode) {
      this.doPageAuthorizeIframe(3, data);
    }
  }

  doPageAuthorizeIframe(time = 3, data: IData) {
    time >= 0 && setTimeout(() => {
      try {
        // @ts-ignore apple Id
        let account_name_text_field: HTMLInputElement = document.querySelector("#account_name_text_field");
        Utils.input(account_name_text_field, data.MyAddress.email);

        // @ts-ignore
        Utils.fireEvent(document.querySelector("#sign-in"), "click");

        // @ts-ignore
        let password_text_field: HTMLInputElement = document.querySelector("#password_text_field");
        Utils.input(password_text_field, "Pingguo12345");

        Utils.click(document.querySelector("#remember-me"));

        setTimeout(() => {
          try {
            // @ts-ignore
            Utils.fireEvent(document.querySelector("#sign-in"), "click");
          } catch (e) {

          }
        }, 3000);
      } catch (e) {
        this.doPageAuthorizeIframe(time--, data);
      }

    }, 1500);
  }
}

let login = new Login();
login.init();

