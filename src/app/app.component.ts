import {HttpClient} from "@angular/common/http";
import {Component, OnInit} from "@angular/core";
import {IBidItem, IkeyWords, StatusDict} from "src/app/data/interface";
import {Biz} from "src/utils/biz";
import {Utils} from "src/utils/utils";
import search = chrome.history.search;


@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  dataSource: IBidItem[] = [];
  IkeyWordsList: IkeyWords[] = [];
  isStart: boolean = true;

  constructor(private http: HttpClient) {
  }

  storeString = "";
  port = chrome.runtime.connect({name: "GHJ-port-auctionsyahooextensionpopu"});

  startRefresh() {
    this.port.postMessage({action: "startRefresh"});
  }

  stopRefresh() {
    this.port.postMessage({action: "stopRefresh"});
  }

  async ngOnInit() {
    this.dataSource = [];
    this.IkeyWordsList = [];
    const tmp: IkeyWords[] = [];
    const list = await Utils.STORE_GET_ALL();
    const iBidItems = Object.keys(list).map(key => {
      if (key.startsWith("keywords")) {
        tmp.push(list[key])
      }
      if (!key.startsWith("setup") && !key.startsWith("keywords")) {
        return list[key];
      }
    }).filter(v => v) as IBidItem[];
    iBidItems.sort((a, b) => {
      // @ts-ignore
      return new Date(b.updateTime) - new Date(a.updateTime)
    })
    this.dataSource = iBidItems;
    this.IkeyWordsList = tmp;
    const api1 = await Utils.STORE_GET_ITEM(this.SETUP_SYNC_PRODUCT_KEY) as string;
    if (api1.constructor == String) {
      this.productapi = api1;
    }
    const api2 = await Utils.STORE_GET_ITEM(this.SETUP_SYNC_KEYWORD_KEY) as string;

    if (api2.constructor == String) {
      this.keywordapi = api2;
    }
    Utils.STORE_GET_ITEM("setup_start").then(isStart => this.isStart = isStart === true);

  }

  SETUP_SYNC_PRODUCT_KEY = "setup_sync_product_key"
  SETUP_SYNC_KEYWORD_KEY = "setup_sync_keyword_key"
  productapi: string = "";
  keywordapi: string = "";

  clickProductApi() {
    Utils.STORE_SET_ITEM(this.SETUP_SYNC_PRODUCT_KEY, this.productapi);
    this.http.post(this.productapi, this.dataSource, {
      headers: {
        contentType: "application/json",
      }
    }).subscribe(() => {
    });
  }

  clickKeywordApi() {
    Utils.STORE_SET_ITEM(this.SETUP_SYNC_KEYWORD_KEY, this.keywordapi);
    this.http.post(this.keywordapi, this.IkeyWordsList, {
      headers: {
        contentType: "application/json",
      }
    }).subscribe(() => {
    });
  }

  translateStatus(value: string) {
    for (let {dictValue, dictLabel, listClass} of StatusDict) {
      if (dictValue == value) {
        return {dictValue, dictLabel, listClass};
      }
    }
    return {dictValue: "", dictLabel: "", listClass: ""}
  }

  async delete(item: IBidItem) {
    if (confirm("本当に削除しますか?")) {
      Utils.STORE_DELETE_ITEM(item.orderId).then(() => this.ngOnInit());
    }
  }

  async deleteKeyWord(item: IkeyWords) {
    if (confirm("本当に削除しますか?")) {
      Utils.STORE_DELETE_ITEM("keywords" + item.keywords).then(() => this.ngOnInit());
    }
  }


  openAllLinks() {
    this.port.postMessage({action: "open_pages", list: this.dataSource.filter(value => value.status == 1)})
  }

  protected readonly StatusDict = StatusDict;
  isALL: boolean = false;

  async save(item: IBidItem) {
    await Utils.STORE_SET_ITEM(item.orderId, item)
    this.port.postMessage({action: "auction_updateItem", id: item.orderId});
    this.ngOnInit();
  }

  async deleteSelected() {
    if (confirm("本当に削除しますか?")) {
      for (let item of this.dataSource) {
        if (item.checked) {
          await Utils.STORE_DELETE_ITEM(item.orderId);
        }
      }
    }

    this.ngOnInit();
  }

  all() {
    setTimeout(() => {
      this.dataSource.forEach(data => data.checked = this.isALL)
    }, 100);
  }

  filterOption: IBidItem = {
    orderId: "",
    status: "",
  }

  async doFilter() {
    const list = await Utils.STORE_GET_ALL();
    const iBidItems = Object.keys(list).map(key => {
      let v = list[key];
      if (!key.startsWith("setup") && !key.startsWith("keywords")) {
        if (this.filterOption.orderId.trim() && (this.filterOption.status + "")) {
          if (v.orderId.includes(this.filterOption.orderId) && v.status == (this.filterOption.status + "")) {
            return v;
          }
        } else if (this.filterOption.status + "") {
          if (v.status == (this.filterOption.status + "")) {
            return v;
          }
        } else if (this.filterOption.orderId.trim()) {
          if (v.orderId.includes(this.filterOption.orderId)) {
            return v;
          }
        } else {
          return v;
        }
      }


    }).filter(v => v) as IBidItem[];
    iBidItems.sort((a, b) => {
      // @ts-ignore
      return new Date(b.updateTime) - new Date(a.updateTime)
    })
    this.dataSource = iBidItems;
  }

  reset() {
    this.filterOption.status = "";
    this.filterOption.orderId = "";
    this.ngOnInit();
  }
}
