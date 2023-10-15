import {LiveAnnouncer} from "@angular/cdk/a11y";
import {AfterViewInit, Component, OnInit, ViewChild} from "@angular/core";
import {MatPaginator} from "@angular/material/paginator";
import {MatTableDataSource} from "@angular/material/table";
import {IBidItem, IBidList, StatusDict} from "src/app/data/interface";
import {Utils} from "src/utils/utils";


@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ["orderId", "info", "timeLeft", "limitPrice", "status", "remark", "operation"];
  dataSource = IBidList;

  ngAfterViewInit() {
    // @ts-ignore
    this.dataSource.paginator = this.paginator;
  }

  constructor() {
  }

  async storeClear() {
    var isclear = confirm("确定要清除缓存吗?")
    if (isclear) {
      // Utils.STORE_CLEAR_ALL();
      chrome.storage.local.clear();
      this.ngOnInit();
    }
  }

  storeString = "";
  port = chrome.runtime.connect({name: "GHJ-port"});

  async ngOnInit() {
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
    }
  }

  edit(element: IBidItem) {
    console.log(element);
  }
}
