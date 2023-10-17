import {HttpClient} from "@angular/common/http";
import {Component, OnInit} from "@angular/core";
import {IBidItem, IkeyWords, StatusDict} from "src/app/data/interface";
import {Biz} from "src/utils/biz";
import {Utils} from "src/utils/utils";


@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  dataSource: IBidItem[] = [];
  IkeyWordsList: IkeyWords[] = [];

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
    this.dataSource = Object.keys(list).map(key => {
      if (key.startsWith("keywords")) {
        tmp.push(list[key])
      }
      if (!key.startsWith("setup") && !key.startsWith("keywords")) {
        return list[key];
      }
    }).filter(v => v) as IBidItem[];
    this.IkeyWordsList = tmp;

    this.productapi = await Utils.STORE_GET_ITEM(this.SETUP_SYNC_PRODUCT_KEY)
    this.keywordapi = await Utils.STORE_GET_ITEM(this.SETUP_SYNC_KEYWORD_KEY)
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
    this.dataSource.forEach(value => {
      window.open(value.url, "_blank");
    })
  }

  protected readonly StatusDict = StatusDict;

  async save(item: IBidItem) {
    await Utils.STORE_SET_ITEM(item.orderId, item)
    this.port.postMessage({action:'auction_updateItem', id: item.orderId});
    this.ngOnInit();
  }

  async deleteSelected() {
    for (let item of this.dataSource) {
      if (item.checked) {
        await Utils.STORE_DELETE_ITEM(item.orderId);
      }
    }
    this.ngOnInit();
  }
}
