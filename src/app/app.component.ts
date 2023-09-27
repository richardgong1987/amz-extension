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
      Utils.storeClear();
      this.ngOnInit();
    }
  }

  storeString = "";

  async ngOnInit() {
    let newVar = await Utils.storeGetAll();
    this.storeString = JSON.stringify(newVar);
  }
}
