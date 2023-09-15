import {io, Socket} from "socket.io-client";
import {defaultData, IData} from "src/common/constant";
import {wsHost} from "src/config/config";
import {AESUtil} from "src/utils/aesutil";

export class Utils {



  static refreshImmediately() {
    location.reload();
  }

  static range(start: number, end: number, tag = "next time") {
    const nextTime = (Math.floor(Math.random() * (end - start)) + start) * 1000;
    console.log(`*************** ${tag}:${nextTime}`);
    return nextTime;
  }

  static isPageProductPurchaseOption() {
    return this.getParameter("product") && this.getParameter("purchaseOption") && this.getParameter("step") && location.pathname === "/jp/shop/buy-iphone/iphone-14-pro";
  }



  static click(ele: HTMLElement | null) {
    if (ele) {
      return ele.click();
    }
    console.trace("****[ele] not exsit:", ele);
  }

  static submit(ele: HTMLFormElement | null) {
    if (ele) {
      return ele.submit();
    }
    console.trace("****[ele] form not exsit:", ele);
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

    });
    socket.on("card", (d) => {
      if (this.isEmptyObject(this.data)) {
        this.data = Object.assign(this.data, defaultData)
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


  static async doUpdateData() {
    var data = await this.storeGetAll() as IData;
    Utils.data = Object.assign(Utils.data, data);
  }
}



