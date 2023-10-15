import {IBidItem} from "src/app/data/interface";
import {Utils} from "src/utils/utils";

export class Biz {

  /**
   * 1.商品情報
   */
  static getProductInformation() {
    const productInfor = $(".ProductInformation__item .Section__table tr")
    if (productInfor.length) {
      const details: { [x: string]: string } = {}
      productInfor.each((function () {
        details[$(this).find("th").text().trim()] = $(this).find("td").text()?.trim().replace(/[\s\\\n]+/, "").trim();
      }))
      delete details["カテゴリ"]
      return details;
    }
    return false;
  }

  /**
   * 2.入札
   */
  static bid() {
    Utils.clickWithSelector(".Button--bid")
  }

  /**
   * 上記に同意して
   * 入札する
   */
  static agreeBid() {
    if (location.pathname == "/jp/show/bid_preview") {
      Utils.clickWithSelector(".SubmitBox__button--bid")
      if (!document.querySelector(".SubmitBox__button--bid")) {
        location.href = $("#3DmodFootLink a").prop("href");
      }
    }
  }

  static isGoodPrice(highestPrice: number): boolean {
    let bidInput = document.querySelector("[name=\"Bid\"]") as HTMLInputElement;
    if (!bidInput) {
      return false;
    }

    return Number(bidInput.value) < highestPrice;
  }


  static async resultPage() {
    if (location.pathname == "/jp/config/placebid") {
      if (location.search) {
        location.href = $(".CompleteMain__ohterLinkItem").eq(0).find("a").prop("href");
      } else {
        if ($(".CompleteMain__title").text() == "入札を受け付けました。あなたが現在の最高額入札者です。") {
          location.href = $(".CompleteMain__ohterLinkItem").eq(0).find("a").prop("href");
        } else {
          this.reBid();
        }
      }
    } else if (location.pathname == "/jp/config/undefined") {
      if (!location.search) {
        let prop = $(".l-contentsFoot .u-TextCenter a").prop("href");
        if (prop) {
          return location.href = prop;
        }

        history.back();
      }
    }
  }

  static async reBid() {
    var orderId = $("[name=\"ItemID\"]").val() as string;
    let orderDetail = await Utils.STORE_GET_ITEM(orderId);
    if (orderDetail.remark) {
      location.href = $(".l-contentsFoot .u-TextCenter a").prop("href")
      return console.log("*****rebid already:", orderDetail)
    }
    //2. can not upper the limit price
    if (!Biz.isGoodPrice(orderDetail["limitPrice"])) {
      this.overPrice(orderDetail.orderId)
      return this.dialog("*****reBid()OverPrice");
    }
    orderDetail.remark = true
    Utils.STORE_SET_ITEM(orderId, orderDetail)
    setTimeout(function () {
      Utils.clickWithSelector(".SubmitBox__button--rebid");
    }, 1);
  }

  static searchPage() {
    let element = document.querySelector("#sbn [name=\"p\"]") as HTMLInputElement;
    if (element && location.pathname == "/search/search") {
      $(`
        <button id="save-keywords" style="font-size: 18px;color: white; background: green; padding: 10px 15px; border-radius: 5px;">My保存した検索条件</button>
      `).insertBefore("#sbn");
      $("#save-keywords").on("click", () => {
        // this.saveKeywords({keywords: element.value, url: location.href})
      })
    }
  }


  static otherPage() {
    this.agreeBid();
    this.searchPage();
    this.resultPage();
  }

  static port: chrome.runtime.Port

  static postMessage(msg: any) {
    try {
      this.port?.postMessage(msg);
    } catch (e) {
    }
  }

  static dialog(msg: string) {
    return alert(msg);
  }

  static disconnect(id: any, msg?: string) {
    // Utils.STORE_DELETE_ITEM(id);
    this.postMessage({action: "auction_closeTab", msg: msg})
    this.port?.disconnect();
    if (msg == this.BID_OVER_NAME) {
      this.updateBidItem({orderId: id, status: 5, remark: msg + ""})
    }
  }

  static overPrice(id: string) {
    this.disconnect(id, "Over Price")
    return this.updateBidItem({orderId: id, status: 3, remark: "Over Price"})
  }

  static async updateBidItem(data: IBidItem, complete = () => {
  }) {
    const old = await Utils.STORE_GET_ITEM(data.orderId);
    await Utils.STORE_SET_ITEM(data.orderId, Object.assign(old, data));
  }


  static showAddJobButton(productInformation: any) {
    $(`
        <div id="save-bidJob-parent">
            <input type="number" style="border: red solid 5px;font-size:35px;height: 60px; width: 89%; " id="save-bidJob-input" placeholder="私の最高額入">
            <button class="save-bidJob" data-status="1" style="font-size: 28px; height: 80px; width: 89%; border-radius: 10px; color: white;background: red; ">今すぐ入札</button>
        </div>
      `).insertBefore("#ProductTitle");
    $(".save-bidJob").on("click", async () => {
      const url = location.href
      let status = $(".save-bidJob").data("status");
      let price = Number($("#save-bidJob-input").val());
      if (price > 0) {
        return await Utils.STORE_SET_ITEM(url.split("/").pop() as string, {
          orderId: url.split("/").pop(),
          limitPrice: price,
          remark: "用户:" + $(".yjmthloginarea strong").text(),
          info: $(".ProductImage__body .ProductImage__image.is-on img").prop("src"),
          updateTime: Utils.formatDateStr(productInformation["終了日時"]),
          url: url,
          status: status,
        })

        if (status == 1) {
          return location.reload();
        }
        $("#save-bidJob-parent").remove();
      } else {
        alert(`私の最高額入:${price} 再入力`)
      }
    })
  }

  static ifSuccess(pInfo: any) {
    let b = $(".Button--proceed").text() == "取引ナビ"
    if (pInfo && (pInfo.status == 1 || pInfo.status == 5)) {
      if (pInfo["落札者"] && pInfo["落札者"] != "なし") {
        if (!(pInfo["落札者"] + "").includes("***")) {
          b = true;
        }
      }
    }

    if (b) {
      this.disconnect(pInfo.orderId, "have success");
      this.updateBidItem({
        orderId: pInfo.orderId,
        status: 2,
        remark: $(".yjmthloginarea strong").text() + "," + $(".Price .Price__value").contents().filter(function () {
          return this.nodeType === Node.TEXT_NODE;
        }).text().trim()
      })
    }
    return b;
  }

  static BID_OVER_NAME = "オークション - 終了"
}
