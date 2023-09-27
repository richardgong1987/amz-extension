import {HOST} from "src/environments/environment";
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
        details[$(this).find("th").text().trim()] = $(this).find("td").text()?.trim().replace(/[\s\\n]+/, "");
      }))
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
    }
  }

  static isGoodPrice(highestPrice: number): boolean {
    let bidInput = document.querySelector("[name=\"Bid\"]") as HTMLInputElement;
    if (!bidInput) {
      return false;
    }

    return Number(bidInput.value) <= highestPrice;
  }

  static async orderDetail(orderId: string) {
    return $.get(`${HOST}/api/auctions/product/${orderId}`);
  }

  static async resultPage() {
    console.log("***/jp/config/placebid", location)
    if (location.pathname == "/jp/config/placebid") {
      if (location.search) {
        location.href = $(".CompleteMain__ohterLinkItem").eq(0).find("a").prop("href");
      } else {
        this.reBid();
      }
    }
  }

  static async reBid() {
    var orderId = $('[name="ItemID"]').val() as string;
    let orderDetail = await Utils.storeGet(orderId);
    if (orderDetail.remark) {
      return console.log("*****rebid already:", orderDetail)
    }
    //2. can not upper the limit price
    if (!Biz.isGoodPrice(orderDetail["limitPrice"])) {
      Biz.updateProduct({orderId: orderDetail.orderId, status: 4, remark: "再入已超出最高价"})
      alert("再入...已超出最高价,请退出")
      return console.log("****can not upper limitPrice 222:", orderDetail["limitPrice"]);
    }
    orderDetail.remark = true
    await Utils.storeSet({[orderId]: orderDetail})
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
        this.saveKeywords({keywords: element.value, url: location.href})
      })
    }
  }

  static async saveKeywords(data: {
    keywords: string,
    url: string
  }) {
    return $.ajax({
      url: `${HOST}/api/auctions/product/save-keywords`,
      method: "POST",
      data: JSON.stringify(data),
      contentType: "application/json",
      complete: function () {
        $("#save-keywords").remove();
      },
    });
  }

  static otherPage() {
    this.agreeBid();
    this.searchPage();
    this.resultPage();
  }

  static updateProduct(data:any) {
    $.ajax({
      url: `${HOST}/api/auctions/product/product-update`,
      method: "POST",
      data: JSON.stringify(data),
      contentType: "application/json",
      complete: function () {
        $("#save-bidJob").remove();
      },
    });
  }
  static showAddJobButton(info: any) {
    $(`
        <button id="save-bidJob" style="background: linear-gradient(to bottom, #ffdb58, #ffcf40);
    border: 1px solid #d4a12d;
    color: #854d00;
    font-size: 18px;
    padding: 10px 20px;
    border-radius: 10px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    text-shadow: 0px 1px 1px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;">タスクを追加します。</button>
      `).insertBefore("#ProductTitle");
    $("#save-bidJob").on("click", () => {
      const url = location.href
      let price = prompt("私の最高額入");
      $.ajax({
        url: `${HOST}/api/auctions/product/product-add`,
        method: "POST",
        data: JSON.stringify({
          orderId: url.split("/").pop(),
          limitPrice: Number(price),
          url: url,
          status: 0,
          info: JSON.stringify(info)
        }),
        contentType: "application/json",
        complete: function () {
          $("#save-bidJob").remove();
        },
      });
    })
  }


}
