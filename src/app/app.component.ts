import {Component} from "@angular/core";


@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  port = chrome.runtime.connect({name: "GHJ-port-appcomponent"})

  startFetch() {
    this.port.postMessage({action: "start"})
  }
  stopFetch() {

  }

  downloadButton() {
    this.port.postMessage({action: "downloadButton"})

  }
}
