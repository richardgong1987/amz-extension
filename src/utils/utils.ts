export class Utils {

  openUrl(url: string) {
    window.location.href = url;
  }


  static range(start: number, end: number, tag = "next time") {
    const nextTime = (Math.floor(Math.random() * (end - start)) + start) * 1000;
    console.log(`*************** ${tag}:${nextTime}`);
    return nextTime;
  }


  static click(ele: HTMLElement | null) {
    if (ele) {
      return ele.click();
    }
    console.trace("****[ele] not exsit:", ele);
  }

  static clickWithSelector(name: string) {
    let ele = document.querySelector(name) as HTMLElement;
    if (ele) {
      return ele.click();
    }
    console.trace(`****failure click [${name}] not exsit:`);
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


  static async storeGetAll() {
    return await chrome?.storage?.local?.get();
  }
  static async storeClear() {
    return await chrome?.storage?.local?.clear();
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

  static isBidExpired(dateStr: string) {
    const from = new Date();
    const to = this.dateParse(dateStr);
    return from >= to;
  }

  static dateParse(dateStr: string): Date {
    return new Date(dateStr.replace(/\（[\S\s]+?\）/g, " "))
  }

  static isTimeToBid(start: Date, end: Date): boolean {
    let from = new Date(start);
    let to = new Date(end);
    to.setSeconds(to.getSeconds() - 2);
    return from >= to;
  }

  static async storeSet(val: { [x: string]: any }) {
    let newVar: any = await this.storeGetAll() || {};
    Object.assign(newVar, val);
    return await chrome.storage?.local?.set(newVar);
  }
  static async storeGet(key: string) {
    let newVar: any = await this.storeGetAll();
    if (newVar) {
      return newVar[key];
    }
    return null;
  }
}



