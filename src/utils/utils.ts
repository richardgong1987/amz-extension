export class Utils {
  static clickWithSelector(name: string) {
    let ele = document.querySelector(name) as HTMLElement;
    if (ele) {
      return ele.click();
    }
    console.trace(`****failure click [${name}] not exsit:`);
  }

  static submitWithSelector(name: string) {
    const ele = document.querySelector(name) as HTMLFormElement;
    if (ele) {
      return ele.submit();
    }
    console.trace("****failure submit:", name);
  }

  static getParameter(key: string) {
    return new URLSearchParams(location.search).get(key);
  }

  static synclocal() {
    return chrome?.storage?.local
  }

  static async storeGetAll() {
    return await this.synclocal()?.get();
  }

  static async storeClear() {
    return await this.synclocal()?.clear();
  }

  private static async storeSet(val: { [x: string]: any }) {
    let newVar: any = await this.storeGetAll() || {};
    Object.assign(newVar, val);
    return await this.synclocal()?.set(newVar);
  }

  static async storePut(key: string, value: any) {
    return this.storeSet({[key]: value})
  }

  static async storeGet(key: string) {
    let newVar: any = await this.storeGetAll();
    if (newVar) {
      return newVar[key];
    }
    return null;
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

  static formatDateStr(dateStr: string) {
    return dateStr.replace(/\（[\S\s]+?\）/g, " ").replace(/\./g, "-") + ":00"
  }

  static fireKeyboardEnter(sel: HTMLInputElement) {
    this.fireKeyboard(sel, "keydown");
  }


  static closeWindow30s() {
    setTimeout(function () {
      window.close();
    }, 30 * 1000);
  }

  static range(start: number, end: number) {
    return (Math.floor(Math.random() * (end - start)) + start) * 1000;
  }
}
