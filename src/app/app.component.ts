import {Component, OnInit} from "@angular/core";
import {Utils} from "src/utils/utils";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {

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

  startRefresh() {
    this.port.postMessage({action: "startRefresh"});
  }

  stopRefresh() {
    this.port.postMessage({action: "stopRefresh"});
  }
}
