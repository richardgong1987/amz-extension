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
                history.back();
            }
        }
    }

    static async reBid() {
        var orderId = $("[name=\"ItemID\"]").val() as string;
        let orderDetail = await Utils.STORE_GET_ITEM(orderId);
        if (orderDetail.remark) {
            return console.log("*****rebid already:", orderDetail)
        }
        //2. can not upper the limit price
        if (!Biz.isGoodPrice(orderDetail["limitPrice"])) {
            this.overPrice(orderDetail.orderId, function () {
                $("#save-bidJob-parent").remove();
            })
            return alert("再入...已超出最高价,30秒后关页面退出")
        }
        orderDetail.remark = true
        Utils.storePut(orderId, orderDetail)
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

    static overPrice(id: string, complete = function () {
    }) {
        Utils.closeWindow30s();
        this.updateProdctAjax({orderId: id, status: 3, remark: "已超出最高价"}, complete)
        return this.deleteStoreById(id);
    }

    static async deleteStoreById(id: string) {
        let allStore = await Utils.storeGetAll();
        delete allStore[id];
        await Utils.storeClear();
        await Utils.storeSaveAll(allStore);
    }

    static updateProdctAjax(data: any, complete = function () {
    }) {
        $.ajax({
            url: `${HOST}/api/auctions/product/product-update`,
            method: "POST",
            data: JSON.stringify(data),
            contentType: "application/json",
            complete: complete,
        });
    }

    static showAddJobButton(productInformation: any) {
        $(`
        <div id="save-bidJob-parent">
            <button class="save-bidJob" data-status="1" style="font-size: 18px; border-radius: 10px; color: white;padding: 5px 10px;background: red; ">今すぐ入札</button>
        </div>
      `).insertBefore("#ProductTitle");
        $(".save-bidJob").on("click", function () {
            const url = location.href
            let status = $(this).data("status");
            let price = prompt("私の最高額入");
            $.ajax({
                url: `${HOST}/api/auctions/product/product-add`,
                method: "POST",
                data: JSON.stringify({
                    orderId: url.split("/").pop(),
                    limitPrice: Number(price),
                    updateTime: Utils.formatDateStr(productInformation["終了日時"]),
                    url: url,
                    status,
                }),
                contentType: "application/json",
                complete: function () {
                    if (status == 1) {
                        return location.reload();
                    }
                    $("#save-bidJob-parent").remove();
                },
            });
        })
    }


    static ifSuccess(orderDetail: any) {
        let b = orderDetail.status == 1 && $(".Button--proceed").text() == "取引ナビ";
        if (b) {
            $().text()
            this.updateProdctAjax({
                orderId: orderDetail.orderId,
                status: 2,
                remark: "用户名:" + $(".yjmthloginarea strong").text() + ",价格:" + $(".Price .Price__value").contents().filter(function () {
                    return this.nodeType === Node.TEXT_NODE;
                }).text().trim()
            })
        }
        return b;
    }

    static async saveAuctionLefttime(id: string, timeLeft: any) {
        let data = await Utils.STORE_GET_ITEM(id);
        if (data) {
            data.timeLeft = timeLeft;
            await Utils.storePut(id, data);
        }

    }
}
