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
      contentType: "application/json"
    });
  }

  static otherPage() {
    this.agreeBid();
    this.searchPage();
  }

  static showAddJobButton() {
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
      $.ajax({
        url: `${HOST}/api/auctions/product/product-add`,
        method: "POST",
        data: JSON.stringify({
          orderId: url.split('/').pop(),
          limitPrice: 0,
          url: url,
          status: 0,
        }),
        contentType: "application/json"
      });
    })
  }
}
