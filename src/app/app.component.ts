import {Component, OnInit} from "@angular/core";
import {Utils} from "src/utils/utils";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  title = "auctions-yahoo-extension";

  async storeClear() {
    var isclear = confirm("确定要清除缓存吗?")
    if (isclear) {
      Utils.STORE_CLEAR_ALL();
      this.ngOnInit();
    }
  }

  storeString = "";

  async ngOnInit() {
    let newVar = await Utils.STORE_GET_ALL();
    this.storeString = JSON.stringify(newVar);
  }

  startRefresh() {
    chrome.runtime.sendMessage({action: "startRefresh"});
  }

  stopRefresh() {
    chrome.runtime.sendMessage({action: "stopRefresh"});
  }
}
