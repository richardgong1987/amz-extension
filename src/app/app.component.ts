import {Component} from "@angular/core";
import {Utils} from "src/utils/utils";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  title = "auctions-yahoo-extension";

  async storeClear() {
    var isclear = confirm("确定要清除缓存吗?")
    if (isclear) {
      Utils.storeClear();
    }
  }
}
