import {AfterViewInit, Component, OnInit} from "@angular/core";
import {IBidItem, StatusDict} from "src/app/data/interface";
import {Utils} from "src/utils/utils";


@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ["orderId", "info", "timeLeft", "limitPrice", "status", "remark", "operation"];
  dataSource:IBidItem[] = [];

  async ngAfterViewInit() {

  }

  storeString = "";
  port = chrome.runtime.connect({name: "GHJ-port"});

  async ngOnInit() {
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

  delete(item: IBidItem) {
    if (confirm("本当に削除しますか?")) {
      Utils.STORE_DELETE_ITEM(item.orderId);
      this.ngOnInit();
    }
  }

  edit(element: IBidItem) {
    console.log(element);
  }
}
