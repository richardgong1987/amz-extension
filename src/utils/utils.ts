import {io, Socket} from "socket.io-client";
import {
  defaultData,
  GbPaymentmethodsEntity,
  IData,
  phoneCaptionMap,
  phoneColorsMap,
  phoneVersionMap
} from "src/common/constant";
import {wsHost} from "src/config/config";
import {AESUtil} from "src/utils/aesutil";

export class Utils {
  static storeNameList = {
    "Apple 京都": "600-8006",
    "Apple 心斎橋": "542-0086",
    "Apple 名古屋栄": "460-0008",
    "Apple 銀座": "104-0061",
    "Apple 丸の内": "100-0005",
    "Apple 新宿": "160-0022",
    "Apple 渋谷": "150-0041",
    "Apple 表参道": "150-0001",
    "Apple 川崎": "810-0001"
  }
  static statePostCode = {
    "京都府": "600-8006",
    "大阪府": "542-0086",
    "愛知県": "460-0008",
    "東京都": "104-0061",
    "神奈川県": "212-0013",
    "福岡県": "810-0001"
  }

  static getStatePostCode(state: string) {
    // @ts-ignore
    return this.statePostCode[state];
  }

  static isIphoneAvaible() {
    // return this.appleOfficeStore();
    return this.applefranchiseStore();
  }

  static applefranchiseStore() {
    const $form = $(".rt-storelocator-store-group .form-selector");
    for (let i = 0; i < $form.length; i++) {
      const htmlElements = $form.eq(i);
      if (!htmlElements.find(".form-selector-input").is(":disabled")) {
        console.log("******applefranchiseStore:", htmlElements);
        return htmlElements;
      }
    }

    return false;

  }

  static appleOfficeStore() {
    let $form = $(".form-selector-title");
    for (let i = 0; i < $form.length; i++) {
      const storeEle = $form.eq(i);
      // @ts-ignore
      if (this.storeNameList[storeEle.text()]) {
        let htmlElements = storeEle.parents(".form-selector");
        if (!htmlElements.find(".form-selector-input").is(":disabled")) {
          console.log("******htmlElements:", htmlElements);
          return htmlElements;
        }
      }

    }
    return false;
  }

  static playSound() {
    try {
      // let audio = new Audio();
      // audio.src = chrome.runtime.getURL("assets/AirHorn.mp3");
      // audio.play();
    } catch (e) {
      console.log("If cann't play sound set Sound: allow")
      console.log("chrome://settings/content/siteDetails?site=https%3A%2F%2Fwww.apple.com")
      console.log("set Sound: allow");
    }
  }

  static async refresh() {
    setTimeout(() => {
      !this.isPageShopSignIn() && location.reload();
    }, this.range(6, 15));
  }

  static async refreshWithCustom(start = 6, end = 15) {
    setTimeout(() => {
      !this.isPageShopSignIn() && location.reload();
    }, this.range(start, end));
  }

  static async refreshMins() {
    setTimeout(() => {
      !this.isPageShopSignIn() && location.reload();
    }, this.range(60, 3 * 60));
  }

  static refreshByServiceTemporarilyUnavailable() {
    this.isServiceTemporarilyUnavailable() && this.refresh();
  }

  static isServiceTemporarilyUnavailable() {
    let s = $("title").text() + "";
    return /Service Temporarily Unavailable/i.test(s);
  }

  static refreshImmediately() {
    location.reload();
  }

  static refreshByDelay() {
    setTimeout(() => {
      location.reload();
    }, this.range(6, 10));
  }

  static range(start: number, end: number, tag = "next time") {
    const nextTime = (Math.floor(Math.random() * (end - start)) + start) * 1000;
    console.log(`*************** ${tag}:${nextTime}`);
    return nextTime;
  }

  static isJapanIphoneHomePage() {
    return location.pathname === "/jp/iphone-14-pro/" && location.search == "";
  }

  static isPageIphone14Pro() {
    return location.pathname === "/jp/shop/buy-iphone/iphone-14-pro" && location.search === "";
  }

  static isPageThankyou() {
    return location.pathname == "/jp/shop/checkout/thankyou";
  }

  static isPageIphone14Pro2Option() {
    return /^(\/jp\/shop\/buy-iphone\/iphone-14-pro)\/[\s\S]{10,}/.test(location.pathname) && location.search === "";
  }


  static isPageShopBag() {
    return location.pathname === "/jp/shop/bag" && location.search === "";
  }

  static isOrderNotProcessed() {
    return location.pathname === "/jp/shop/sorry/order_not_processed" && location.search === "";
  }

  static isPageSessionExpired(): boolean {
    return location.pathname === "/jp/shop/sorry/session_expired" && location.search === "";
  }

  static isPageShopSignIn() {
    return location.pathname == "/jp/shop/signIn" && location.search;
  }

  static isPageAuthorizeIframe() {
    return location.pathname == "/appleauth/auth/authorize/signin";
  }

  static isPageProductPurchaseOption() {
    return this.getParameter("product") && this.getParameter("purchaseOption") && this.getParameter("step") && location.pathname === "/jp/shop/buy-iphone/iphone-14-pro";
  }

  static isShippinginit() {
    return location.pathname === "/jp/shop/checkout" && this.getParameter("_s") === "Shipping-init"
  }

  static isPageFulfillmentinit() {
    return location.pathname === "/jp/shop/checkout" && this.getParameter("_s") === "Fulfillment-init"
  }

  static isPageFulfillment() {
    return location.pathname === "/jp/shop/checkout" && this.getParameter("_s") === "Fulfillment"
  }

  static isPageBilling() {
    return location.pathname === "/jp/shop/checkout" && this.getParameter("_s") === "Billing"
  }

  static isPageReview() {
    return location.pathname === "/jp/shop/checkout" && this.getParameter("_s") === "Review"
  }

  static isPageMessageGeneric() {
    return location.pathname === "/jp/shop/sorry/message_generic";
  }

  static isPagePickupContactInit() {
    return location.pathname === "/jp/shop/checkout" && this.getParameter("_s") === "PickupContact-init";
  }

  static isPageBillingInit() {
    return location.pathname === "/jp/shop/checkout" && this.getParameter("_s") === "Billing-init";
  }

  static click(ele: HTMLElement | null) {
    if (ele) {
      return ele.click();
    }
    console.trace("****[ele] not exsit:", ele);
    this.refreshByServiceTemporarilyUnavailable();
  }

  static submit(ele: HTMLFormElement | null) {
    if (ele) {
      return ele.submit();
    }
    console.trace("****[ele] form not exsit:", ele);
    this.refreshByServiceTemporarilyUnavailable();
  }

  static getParameter(key: string) {
    return new URLSearchParams(location.search).get(key);
  }


  static LAST_TIME = "lastime";

  static async storeSet(val: { [x: string]: any }) {
    return await chrome.storage?.local?.set(val);
  }

  static async storeGet(key: string) {
    let newVar: any = await this.storeGetAll();
    if (newVar) {
      return newVar[key];
    }
    return null;
  }

  static async storeGetAll() {
    return await chrome?.storage?.local?.get();
  }

  static dateDiffMinutes(dt2: Date, dt1: Date): number {
    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return Math.abs(Math.round(diff));
  }

  static fireSelectChange(sel: HTMLSelectElement, index: number) {
    sel.options.selectedIndex = index;
    // firing the event properly according to StackOverflow
    // http://stackoverflow.com/questions/2856513/how-can-i-trigger-an-onchange-event-manually
    this.fireEvent(sel, "change");
  }

  static isLogin() {
    return !document.querySelector("div.rs-fulfilment-cold-ziplabel");
  }

  static fireSelectChangeWithValue(sel: HTMLSelectElement | null, val: String) {
    if (sel) {
      const length = sel.options.length;
      for (let i = 0; i < length; i++) {
        if (sel.options[i].value == val) {
          this.fireSelectChange(sel, i);
          break;
        }
      }
    }
  }

  static fireInputChange(sel: HTMLInputElement | null, value: any) {
    this.allInputEvent(sel, value, "change");
  }

  static fireInputInputEvent(sel: HTMLInputElement | null, value: any) {
    this.allInputEvent(sel, value, "input");
  }

  static input(sel: HTMLInputElement | null, value: any) {
    this.allInputEvent(sel, value, "input");
    this.allInputEvent(sel, value, "change");
  }

  private static allInputEvent(sel: HTMLInputElement | null, value: any, type: string) {
    if (sel) {
      sel.value = value;
      return this.fireEvent(sel, type);
    }

  }

  static fireEvent(sel: HTMLElement, type: string) {
    if ("createEvent" in document) {
      const evt = new CustomEvent(type, {
        bubbles: true,
        cancelable: true
      });
      // var evt = document.createEvent("HTMLEvents");
      // evt.initEvent(type, true, true);
      sel.dispatchEvent(evt);
    } else {
      // @ts-ignore
      sel.fireEvent(`on${type}`);
    }
  }

  private static fireKeyboard(sel: HTMLInputElement, type: string) {
    if ("createEvent" in document) {
      const evt = new KeyboardEvent(type, {
        charCode: 13,
        key: "Enter",
        which: 13,
        shiftKey: false,
        altKey: false,
        ctrlKey: false,
        code: "Enter",
        bubbles: true,
        cancelable: true
      });
      // var evt = document.createEvent("HTMLEvents");
      // evt.initEvent(type, true, true);
      sel.dispatchEvent(evt);
    } else {
      // @ts-ignore
      sel.fireEvent(`on${type}`);
    }
  }

  static fireKeyboardEnter(sel: HTMLInputElement) {
    this.fireKeyboard(sel, "keydown");
  }

  static randomOperator(callback: Function, start = 6, end = 15) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          callback();
        } catch (e) {
          console.log("****randomOperator:", e);
        }
        resolve(true);
      }, this.range(start, end));
    });
  }

  static async wait(start = 10, end = 20) {
    return await this.randomOperator(() => {
    }, start, end);
  }

  private static str = "*2@#WkdsAAkdskdsds.)lscx,x.O";
  private static aesUtil = new AESUtil();

  private static AesEncrypt(word: any) {
    return this.aesUtil.encrypt(this.str, word);
  }

  private static AesDecrypt(word: any) {
    return this.aesUtil.decrypt(this.str, word);
  }

  public static socket: Socket = Socket.prototype;

  public static data: IData = Object.assign({}, defaultData);

  static isEmptyObject(data: any): boolean {
    if (!data) {
      return true;
    }
    for (let dataKey in data) {
      return false;
    }
    return true;
  }


  static websocketInit() {
    const socket = this.socket = io(wsHost, {
      forceNew: true,
      query: {
        user: "auctions-buy",
        token: this.AesEncrypt("auctions-buy-token")
      }
    });

    socket.on("grab-now", (data) => {
      if (this.data.isGrabRole) {
        this.doAction();
      }
    });
    socket.on("card", (d: GbPaymentmethodsEntity) => {
      if (this.isEmptyObject(this.data)) {
        this.data = Object.assign(this.data, defaultData)
      }
      try {
        this.data.Cards.cardNumber = d.cardNumber;
        this.data.Cards.expiration = this.AesDecrypt(d.expiration);
        this.data.Cards.CVV = this.AesDecrypt(d.ccv);
        this.data.Cards.emailPw = d.emailPw;
        this.data.Cards.appleidpw = d.appleidpw;

        this.data.MyAddress.lastName = d.lastname;
        this.data.MyAddress.firstName = d.firstname;
        this.data.MyAddress.postalCode = d.postalCode;
        this.data.MyAddress.nearbypostcode = d.nearbypostcode;
        this.data.MyAddress.email = d.email;
        this.data.MyAddress.state = d.state;
        this.data.MyAddress.city = d.city;
        this.data.MyAddress.street = d.street;
        this.data.MyAddress.daytimePhoneAreaCode = d.daytimePhoneAreaCode;
        this.data.MyAddress.daytimePhone = d.daytimePhone;


        // @ts-ignore
        this.data.iphoneOptions.phoneVersion = phoneVersionMap[d.phoneVersion];
        // @ts-ignore
        this.data.iphoneOptions.phoneColors = phoneColorsMap[d.phoneColors];
        // @ts-ignore
        this.data.iphoneOptions.phoneCaption = phoneCaptionMap[d.phoneCaption];

        this.data.iphoneOptions.num = d.num;

      } catch (e) {
        this.data.isStart = false;
      }

      this.save();

    });

    socket.on("connect", () => {
      console.log("***Connected");
    });
    socket.on("disconnect", () => {
      console.log("***Disconnected");
    });
    return socket;
  }

  static save() {
    Utils.storeSet(this.data);
  }

  static saveAndNotice() {
    Utils.storeSet(this.data);
    this.socket.emit("notifyScriptPart")
  }

  static getCard() {
    this.socket.emit("card");
  }

  static doAction() {
    //1. if currect location in apple.com
    if (location.host.includes("apple.com")) {
      location.reload();
    }
  }

  static async doUpdateData() {
    var data = await this.storeGetAll() as IData;
    Utils.data = Object.assign(Utils.data, data);
  }
}



