import {AfterViewInit, Component, OnInit} from "@angular/core";
import {IBidItem, StatusDict} from "src/app/data/interface";
import {Utils} from "src/utils/utils";


@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, AfterViewInit {
  dataSource: IBidItem[] = [];

  async ngAfterViewInit() {

  }

  storeString = "";
  port = chrome.runtime.connect({name: "GHJ-port"});

  async ngOnInit() {
    this.dataSource = [];
    const list = await Utils.STORE_GET_ALL();
    this.dataSource = Object.keys(list).map(key => list[key]) as IBidItem[];

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
      Utils.STORE_DELETE_ITEM(item.orderId).then(()=>this.ngOnInit());
    }
  }
}
