import {HOST} from "src/config/config";
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
    Utils.clickWithSelector(".SubmitBox__button--bid")
  }
  static isGoodPrice(highestPrice: number): boolean {
    let bidInput = document.querySelector("[name=\"Bid\"]") as HTMLInputElement;
    if (!bidInput) {
      return false;
    }

    return Number(bidInput.value) <= highestPrice;
  }
  static async  orderDetail(orderId:string){
    return await $.get(`${HOST}/api/auctions/product/${orderId}`);
  }
}
