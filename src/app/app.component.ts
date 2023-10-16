import {AfterViewInit, Component, OnInit} from "@angular/core";
import {IBidItem, StatusDict} from "src/app/data/interface";
import {Biz} from "src/utils/biz";
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
      Utils.STORE_DELETE_ITEM(item.orderId).then(() => this.ngOnInit());
    }
  }

  formatTimeLeft(timeLeft: number) {
    let outputString = "";
    if (timeLeft <= 0) {
      outputString = Biz.BID_OVER_NAME;
    } else {
      var day = Math.floor(timeLeft / 86400);
      var hour = Math.floor((timeLeft - day * 86400) / 3600);
      var min = Math.floor((timeLeft - (day * 86400) - (hour * 3600)) / 60);
      var sec = timeLeft - (day * 86400) - (hour * 3600) - (min * 60);


      if (day > 0) {
        outputString = day + "日＋" + ((hour > 0) ? hour + ":" : "") + ((min < 10) ? "0" + min : min) + ":" + ((sec < 10) ? "0" + sec : sec);
      } else {
        outputString = ((hour > 0) ? hour + ":" : "") + ((min < 10) ? "0" + min : min) + ":" + ((sec < 10) ? "0" + sec : sec);
      }
    }
    return outputString;
  }
}
