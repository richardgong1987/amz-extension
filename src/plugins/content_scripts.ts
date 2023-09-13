import {
  GbOrdersEntity,
  GbReceivestoreEntity,
  IData,
  IphoneOptions,
  phoneCaptionMap,
  phoneColorsMap,
  phoneVersionMap
} from "src/common/constant";
import {Utils} from "src/utils/utils";


export class JqGet {

  async doUpdateData() {
    await Utils.doUpdateData();
    console.log("****doUpdateData:", Utils.data);
  }

  async init() {
    let data = await Utils.storeGetAll() as IData;
    Utils.data = Object.assign(Utils.data, data);
    console.log("*********** isStart:", (Utils.data && Utils.data.isStart), Utils.data);
    Utils.websocketInit().on("notifyScriptPart", (data) => {
      this.doUpdateData();
    });

    if (!Utils.data.isStart) {
      return;
    }

    if (Utils.isServiceTemporarilyUnavailable()) {
      return Utils.refreshByServiceTemporarilyUnavailable();
    }

    if (Utils.isJapanIphoneHomePage()) {
      this.firstPageBuy();
    } else if (Utils.isPageIphone14Pro()) {
      this.secondPageChooseOptions();
    } else if (Utils.isPageIphone14Pro2Option()) {
      this.secondPageChooseOptions2Option();
    } else if (Utils.isPageProductPurchaseOption()) {
      this.doPageProductPurchaseOption();
    } else if (Utils.isPageFulfillmentinit()) {
      if (Utils.data.isDelivery) {
        return this.doPageFulfillmentinitDelivery();
      }
      this.doPageFulfillmentinit();
    } else if (Utils.isPageFulfillment()) {
      this.doPageFulfillment();
    } else if (Utils.isPageShopBag()) {
      this.doShopBag();
    } else if (Utils.isPageSessionExpired()) {
      this.doSessionExpired();
    } else if (Utils.isPagePickupContactInit()) {
      this.doPagePickupContactInit();
    } else if (Utils.isShippinginit()) {
      this.doPageShippinginit();
    } else if (Utils.isPageBillingInit()) {
      this.doPageBillingInit();
    } else if (Utils.isPageMessageGeneric()) {
      this.doPageMessageGeneric();
    } else if (Utils.isPageReview()) {
      this.doPageReview();
    } else if (Utils.isPageShopSignIn()) {
      this.doPageShopSignIn();
    } else if (Utils.isPageThankyou()) {
      this.doPageThankYou();
    } else if (Utils.isOrderNotProcessed()) {
      setTimeout(() => {
        this.rsCheckoutContinueButtonBottom();
      }, 6 * 1000)
    } else if (Utils.isPageBilling()) {
      setTimeout(() => {
        this.rsCheckoutContinueButtonBottom();
      }, 6 * 1000)
    }

  }

  firstPageBuy() {
    Utils.click(document.querySelector("#ac-localnav > div > div.ac-ln-content > div.ac-ln-menu > div.ac-ln-actions > div.ac-ln-action.ac-ln-action-button > a"));
  }

  async secondPageChooseOptions() {
    //(1). モデル。 あなたにぴったりなモデルは？
    Utils.click(document.querySelector(`div.rc-dimension-selector-group.rf-bfe-product-dimension-group.form-selector-group > div:nth-child(${Utils.data.iphoneOptions.phoneVersion}) label`));
    //(2).仕上げ。 好きなカラーを選びましょう。色 - ディープパープル
    Utils.click(document.querySelector(`.rf-bfe-right-rail-step.rf-bfe-dimension.rf-bfe-dimension-dimensioncolor > div > ul > li:nth-child(${Utils.data.iphoneOptions.phoneColors}) > label > img`));
    //(3).ストレージ。 必要な容量は？
    // Utils.click(document.querySelector(".rf-bfe-dimension-dimensioncapacity .form-selector-group label"));
    Utils.click(document.querySelector(`.rf-bfe-dimension-dimensioncapacity .form-selector:nth-child(${Utils.data.iphoneOptions.phoneCaption}) label`));
    //(4).Apple Trade In。新しいiPhoneが4,000円～100,000円割引に脚注*。
    Utils.click(document.querySelector("#noTradeIn_label"));
    await Utils.wait(5, 6);
    this.secondPageChooseOptions2Option();
    await Utils.wait();
    Utils.refreshByDelay();
  }

  doGnBag() {
    Utils.click(document.querySelector("#ac-gn-bag > div > a"));
    setTimeout(() => {
      Utils.click(document.querySelector("#ac-gn-bagview-content > a"));
    }, Utils.range(2, 3));
  }

  async secondPageChooseOptions2Option() {
    if (Utils.data.isGrabRole) {
      return this.pickupQuote();
    }

    if ((+$("#ac-gn-bag > div > span > span.ac-gn-bag-badge-number").text()) >= 1) {
      this.doGnBag();
      return;
    }
    await Utils.wait(5, 8);
    Utils.click(document.getElementById("applecareplus_58_noapplecare_label"));
    let element = document.querySelector("[name=\"add-to-cart\"]");
    if (element) {
      Utils.click(element as HTMLElement);
    } else {
      let element = document.querySelector("div.rf-bfe-summary-button-box-fullWidth > div > form");
      if (element) {
        Utils.click(element as HTMLElement);
      }
    }
  }

  doPageProductPurchaseOption() {
    // Utils.submit(document.querySelector("div.rf-summary-header-right > div > form"));
    Utils.click(document.querySelector(".rf-summary-header-right > div > form > button"));
  }

  async doPageFulfillmentinit() {
    Utils.click(document.querySelector(".rs-fulfillment-options > fieldset > div > div:nth-child(2) > label"));
    /**
     * 1.prepare data
     */
    {
      let lastTime = await Utils.storeGet(Utils.LAST_TIME);
      if (!lastTime) {
        await Utils.storeSet({[Utils.LAST_TIME]: Date.now() + ""})
      }
    }
    let lastTime = await Utils.storeGet(Utils.LAST_TIME);
    let isWillTimeOut = Utils.dateDiffMinutes(new Date(), new Date(+lastTime)) > 28;
    /**
     * 2. in case timeout
     */
    if (isWillTimeOut) {
      await Utils.storeSet({[Utils.LAST_TIME]: Date.now() + "", removeBag: true});
      Utils.doUpdateData();
      this.checkoutRefreshBacktoOrderList();
    } else {
      /**
       * 3. continue refresh
       */
      this.checkoutRefreshAction();
    }
  }


  async checkoutRefreshBacktoOrderList() {
    Utils.click(document.querySelector("#ac-gn-bag > div > a"));
    Utils.click(document.querySelector(".rs-leavingsecurecheckout-button"));
  }

  async doShopBag() {
    await Utils.wait(5, 8);
    if (Utils.data.iphoneOptions.num > 1) {
      let element = document.querySelector(".rs-quantity-selector .form-dropdown-select") as HTMLSelectElement;
      Utils.fireSelectChange(element, 1);
    }
    await Utils.wait();
    Utils.click(document.querySelector("#shoppingCart\\.actions\\.checkout"));
  }

  doSessionExpired() {
    this.doGnBag();
  }

  grabnowData(pickupShop: JQuery) {
    // this.socket.emit("grab-now", Utils.data.iphoneOptions);
    try {
      let metrics = JSON.parse($("#metrics").text());
      let name = pickupShop.find("label .form-selector-title").text();
      const grabData: GbReceivestoreEntity = {
        name,
        productsString: metrics.data.properties.productsString,
        remark: Utils.data.remark + "->" + window.navigator.userAgent
      };
    } catch (e) {

    }


  }

  async checkoutRefreshAction() {
    try {

      if (!document.querySelector(".rs-fulfillment-grouplabel")) {
        await Utils.wait(2, 3);
        Utils.input(document.querySelector("#checkout\\.fulfillment\\.pickupTab\\.pickup\\.storeLocator\\.searchInput"), Utils.data.MyAddress.nearbypostcode);
        Utils.click(document.querySelector("#checkout\\.fulfillment\\.pickupTab\\.pickup\\.storeLocator\\.search"));
      }

      let pickupShop: any = Utils.isIphoneAvaible();
      if (pickupShop) {
        this.checkoutRefreshActionFillForm(pickupShop);
        this.grabnowData(pickupShop);
      }

      pickupShop && Utils.playSound();
      if (!pickupShop) {
        this.endPickupShop();
      }

    } finally {
      Utils.refreshWithCustom(9 * 60, 9 * 60);
    }
  }

  endPickupShop() {
    return Utils.refresh();
  }

  async checkoutRefreshActionFillForm(pickupShop: JQuery) {
    // await Utils.wait();
    //1. choose shop 受け取るストアを選択してください
    let htmlLabelElement = pickupShop && pickupShop.find("label")[0];
    if (htmlLabelElement) {
      await this.officeIphonProcess(htmlLabelElement);
      await Utils.wait(1, 2);
      console.log("// 4. 受け取りの詳細に進む" + new Date());
      this.rsCheckoutContinueButtonBottom();
      console.log("// doPagePickupContactInit" + new Date());
      await Utils.wait(2, 2);
      this.doPagePickupContactInit();
    }

  }

  async officeIphonProcess(htmlLabelElement: any) {
    Utils.click(htmlLabelElement);
    //2. choose ご注文のiPhone SEを受け取る日付を選択してください
    await Utils.wait(2, 2);
    console.log("//2. choose ご注文のiPhone SEを受け取る日付を選択してください" + new Date());
    Utils.click($(".rt-storelocator-store-multipleavailability > div > div > div > fieldset > ul > li:last > div > label")[0]);
    await Utils.wait(2, 2);
    console.log("// @ts-ignore 3. 次に、土, 10月 1のチェックイン時間を選択してください。" + new Date());
    // @ts-ignore 3. 次に、土, 10月 1のチェックイン時間を選択してください。
    const selectFormElement: HTMLSelectElement = document.querySelector("#checkout\\.fulfillment\\.pickupTab\\.pickup\\.timeSlot\\.dateTimeSlots\\.timeSlotValue");
    if (selectFormElement) {
      Utils.fireSelectChange(selectFormElement, Math.floor(selectFormElement.options.length - 1));
    }

  }

  rsCheckoutContinueButtonBottom() {
    let checkout = document.querySelector("#shoppingCart\\.actions\\.checkout") as HTMLElement;
    if (checkout) {
      Utils.click(checkout);
    }
    Utils.click(document.querySelector("#rs-checkout-continue-button-bottom"));
  }


  async doPagePickupContactInit() {
    if (Utils.data.isGuestMode) {

      await Utils.wait();
      // 1. お客様以外の方が受け取る
      Utils.click(document.querySelector(`[for="pickupOptionButtonGroup0"]`));
      await Utils.wait();
      // 1.姓
      Utils.input(document.querySelector("#checkout\\.pickupContact\\.selfPickupContact\\.selfContact\\.address\\.lastName"), Utils.data.MyAddress.lastName);
      // 2. 名
      Utils.input(document.querySelector("#checkout\\.pickupContact\\.selfPickupContact\\.selfContact\\.address\\.firstName"), Utils.data.MyAddress.firstName);
      // 3. メールアドレス email
      Utils.input(document.querySelector("#checkout\\.pickupContact\\.selfPickupContact\\.selfContact\\.address\\.emailAddress"), Utils.data.MyAddress.email);


      await Utils.wait();
      // 4. 携帯電話番号はありません。
      Utils.click(document.querySelector("#checkout\\.pickupContact\\.selfPickupContact\\.selfContact\\.address\\.isDaytimePhoneSelected_label"));

      await Utils.wait();
      // 5. 市外局番
      Utils.input(document.querySelector("#checkout\\.pickupContact\\.selfPickupContact\\.selfContact\\.address\\.daytimePhoneAreaCode"), Utils.data.MyAddress.daytimePhoneAreaCode);
      // 6.電話番号
      Utils.input(document.querySelector("#checkout\\.pickupContact\\.selfPickupContact\\.selfContact\\.address\\.daytimePhone"), Utils.data.MyAddress.daytimePhone);

      await Utils.wait();
      this.rsCheckoutContinueButtonBottom();

      await Utils.wait();
      this.doPageBillingInit();

    }
  }

  async doPageBillingInitBankCard() {

    await Utils.wait();
    // 1. 一般的な支払い方法： クレジットカードまたはデビットカード
    Utils.click(document.querySelector("#checkout\\.billing\\.billingoptions\\.credit_label"));

    await Utils.wait();
    // 2. Visa Card カード情報を入力：
    // クレジット / デビットカード番号
    Utils.input(document.querySelector("#checkout\\.billing\\.billingOptions\\.selectedBillingOptions\\.creditCard\\.cardInputs\\.cardInput-0\\.cardNumber"), Utils.data.Cards.cardNumber);

    await Utils.wait();
    // 有効期限 月/年
    Utils.input(document.querySelector("#checkout\\.billing\\.billingOptions\\.selectedBillingOptions\\.creditCard\\.cardInputs\\.cardInput-0\\.expiration"), Utils.data.Cards.expiration);

    await Utils.wait();
    // CVV
    Utils.input(document.querySelector("#checkout\\.billing\\.billingOptions\\.selectedBillingOptions\\.creditCard\\.cardInputs\\.cardInput-0\\.securityCode"), Utils.data.Cards.CVV);

    /**
     * 3.請求先住所
     */
    await Utils.wait();
    Utils.input(document.querySelector("#checkout\\.billing\\.billingOptions\\.selectedBillingOptions\\.creditCard\\.billingAddress\\.address\\.lastName"), Utils.data.MyAddress.lastName);
    Utils.input(document.querySelector("#checkout\\.billing\\.billingOptions\\.selectedBillingOptions\\.creditCard\\.billingAddress\\.address\\.firstName"), Utils.data.MyAddress.firstName);
    Utils.input(document.querySelector("#checkout\\.billing\\.billingOptions\\.selectedBillingOptions\\.creditCard\\.billingAddress\\.address\\.postalCode"), Utils.data.MyAddress.postalCode);


    Utils.fireSelectChangeWithValue(document.querySelector("#checkout\\.billing\\.billingOptions\\.selectedBillingOptions\\.creditCard\\.billingAddress\\.address\\.state"), Utils.data.MyAddress.state);

    Utils.input(document.querySelector("#checkout\\.billing\\.billingOptions\\.selectedBillingOptions\\.creditCard\\.billingAddress\\.address\\.city"), Utils.data.MyAddress.city);
    Utils.input(document.querySelector("#checkout\\.billing\\.billingOptions\\.selectedBillingOptions\\.creditCard\\.billingAddress\\.address\\.street"), Utils.data.MyAddress.street);


    await Utils.wait();
    this.rsCheckoutContinueButtonBottom();

    await Utils.wait();
    this.doPageReview();
  }

  async doPageBillingInitGiftCard() {
    await Utils.wait();
    // 1.Apple Gift Cardを適用：
    Utils.click(document.querySelector("#checkout\\.billing\\.billingOptions\\.selectedBillingOptions\\.giftCard\\.giftCardInput\\.resetFields"));

    await Utils.wait();
    //2. クレジット / デビットカード番号
    Utils.input(document.querySelector("#checkout\\.billing\\.billingOptions\\.selectedBillingOptions\\.giftCard\\.giftCardInput\\.giftCard"), Utils.data.Cards.cardNumber);

    await Utils.wait();
    Utils.click(document.querySelector("#checkout\\.billing\\.billingOptions\\.selectedBillingOptions\\.giftCard\\.giftCardInput\\.applyGiftCard"));

    /**
     * 3.請求先住所
     */
    await Utils.wait();
    Utils.input(document.querySelector("#checkout\\.billing\\.billingOptions\\.selectedBillingOptions\\.giftCard\\.billingAddress\\.address\\.lastName"), Utils.data.MyAddress.lastName);
    Utils.input(document.querySelector("#checkout\\.billing\\.billingOptions\\.selectedBillingOptions\\.giftCard\\.billingAddress\\.address\\.firstName"), Utils.data.MyAddress.firstName);
    Utils.input(document.querySelector("#checkout\\.billing\\.billingOptions\\.selectedBillingOptions\\.giftCard\\.billingAddress\\.address\\.postalCode"), Utils.data.MyAddress.postalCode);
    Utils.fireSelectChangeWithValue(document.querySelector("#checkout\\.billing\\.billingOptions\\.selectedBillingOptions\\.giftCard\\.billingAddress\\.address\\.state"), Utils.data.MyAddress.state);
    Utils.input(document.querySelector("#checkout\\.billing\\.billingOptions\\.selectedBillingOptions\\.giftCard\\.billingAddress\\.address\\.city"), Utils.data.MyAddress.city);
    Utils.input(document.querySelector("#checkout\\.billing\\.billingOptions\\.selectedBillingOptions\\.giftCard\\.billingAddress\\.address\\.street"), Utils.data.MyAddress.street);

    await Utils.wait();
    this.rsCheckoutContinueButtonBottom();
    Utils.refreshByDelay();
    await Utils.wait();
    this.doPageReview();
  }

  async doPageBillingInit() {
    if (Utils.data.isGuestMode) {
      return this.doPageBillingInitBankCard();
      // await Utils.randomOperator(() => {
      //   this.doPageBillingInitGiftCard();
      // });
      // return this.doPageBillingInitGiftCard();

    }

    await Utils.wait();
    // 1. 一般的な支払い方法：
    Utils.click(document.querySelector("#checkout\\.billing\\.billingoptions\\.saved_card"));
    Utils.input(document.querySelector("#checkout\\.billing\\.billingOptions\\.selectedBillingOptions\\.savedCard\\.cardInputs\\.cardInput-0\\.securityCode"), Utils.data.Cards.CVV);

    await Utils.wait();
    this.rsCheckoutContinueButtonBottom();
    this.doPageReview();

  }

  async doPageReview() {
    await Utils.wait();
    this.rsCheckoutContinueButtonBottom();
  }

  doPageMessageGeneric() {
    this.doGnBag();
  }

  async doPageShopSignIn() {
    if (Utils.data.isGuestMode) {
      await Utils.randomOperator(() => {
        Utils.click(document.querySelector("#signIn\\.guestLogin\\.guestLogin"));
      });
    }
  }

  getIphoneConfig(map: { [k: string]: number }, val: number): string {
    for (let mapKey in map) {
      if (map[mapKey] == val) {
        return mapKey;
      }
    }
    return "";
  }

  async doPageThankYou() {
    //1.ご注文番号
    await Utils.wait(2, 3);
    const orderNumber = $("#thankyou-container > div > div.rs-thankyou-headcontent > div > div > a").text();
    const {
      isGuestMode,
      MyAddress: {lastName, firstName, postalCode, state, city, street, email},
      Cards: {cardNumber, emailPw, appleidpw},
      iphoneOptions: {phoneVersion, phoneColors, phoneCaption}
    } = Utils.data;

    const order: GbOrdersEntity = {
      appleidpw,
      emailPw,
      isbuybyappleid: isGuestMode ? "1" : "0",
      "remark": `${lastName} ${firstName}-[${this.getIphoneConfig(phoneVersionMap, phoneVersion)}-${this.getIphoneConfig(phoneColorsMap, phoneColors)}-${this.getIphoneConfig(phoneCaptionMap, phoneCaption)}-${Utils.data.iphoneOptions.num}台] ; ${Utils.data.remark} `,
      "email": email,
      "address": `〒${postalCode},${state},${city},${street}`,
      "orderIdx": orderNumber,
      "creditCard": `${cardNumber}`
    };
    Utils.socket.emit("thankyou", order);
    await Utils.wait();
    // this.getCard();
    await Utils.wait();
    // this.openAppleJapan();
  }


  isMathMyModal(apiData: IphoneOptions) {
    let iphoneOptions: IphoneOptions = Utils.data.iphoneOptions;
    let k: keyof IphoneOptions;
    for (k in iphoneOptions) {
      if (iphoneOptions[k] != apiData[k]) {
        return false;
      }
    }
    return true;
  }

  async goGrabNowProccess(data: IphoneOptions) {
    if (Utils.isPageFulfillmentinit()) {
      if (this.isMathMyModal(data) && Utils.data.isStart) {
        // let pick = await this.checkoutRefreshAction();
        // if (!pick) {
        //   Utils.refreshImmediately();
        // }
      }
    }

  }

  openAppleJapan() {
    if (Utils.data.iphoneOptions.num) {
      window.location.href = "https://www.apple.com/jp/iphone-14-pro/";
    }

  }

  async doPageFulfillment() {
    await Utils.randomOperator(() => {
      this.checkoutRefreshBacktoOrderList();
    });
  }


  async doPageFulfillmentinitDelivery() {
    await Utils.wait(5, 8);
    Utils.click(document.querySelector(".rs-fulfillment-options > fieldset > div > div:nth-child(1) > label"));
    await Utils.wait(6, 8);
    if (!document.querySelector(".rs-fulfillment-delivery-label")) {
      await Utils.wait(5, 8);
      Utils.click(document.querySelector("[data-autom=\"checkout-zipcode-edit\"]"));
      await Utils.wait(2, 3);

      Utils.input(document.querySelector("#checkout\\.fulfillment\\.deliveryTab\\.delivery\\.deliveryLocation\\.address\\.deliveryWarmingSubLayout\\.postalCode"), Utils.data.MyAddress.nearbypostcode);

      await Utils.wait(1, 2);
      let element = document.querySelector("#checkout\\.fulfillment\\.deliveryTab\\.delivery\\.deliveryLocation\\.address\\.deliveryWarmingSubLayout\\.state") as HTMLSelectElement;
      Utils.fireSelectChangeWithValue(element, Utils.data.MyAddress.state);
    }

    await Utils.wait(6, 10);
    Utils.click($(".rs-fulfillment-delivery-label").parents(".form-selector-label")[0]);
    await Utils.wait(5, 8);
    this.rsCheckoutContinueButtonBottom();
    await Utils.wait(6, 10);
    this.doPageShippinginit();
  }


  pickupQuoteColor = 1;

  async pickupQuote() {
    await Utils.wait(5, 6);
    Utils.click(document.querySelector(".rf-pickup-quote-overlay-trigger"));

    Utils.input(document.querySelector("[name=\"search\"]"), Utils.data.MyAddress.nearbypostcode);


    document.querySelectorAll(".rf-productlocator-filter-dimensiongroup li");


    this.pickupQuoteLoop();
  }

  async pickupQuoteLoop() {

    if (this.pickupQuoteColor > 4) {
      this.pickupQuoteColor = 1;
    }

    Utils.click(document.querySelector(`.rf-productlocator-filter-dimensiongroup .colornav-item:nth-child(${this.pickupQuoteColor}) label`));
    await Utils.wait(2, 3);

    this.pickupQuoteColor++;

    Utils.click(document.querySelector(".rf-productlocator-nopickupstores-btn"));

    const $form = $(".rf-productlocator-stores .form-selector");
    for (let i = 0; i < $form.length; i++) {
      const storeEle = $form.eq(i);
      // @ts-ignore
      if (Utils.storeNameList[storeEle.text()]) {
        let pickupShop = storeEle.parents(".form-selector");
        if (!pickupShop.find(".form-selector-input").is(":disabled")) {
          console.log("******office apple store:", pickupShop);
          try {
            let metrics = $(".rf-productlocator-productinfo").text();
            let name = pickupShop.find("label .form-selector-title").text();
            Utils.playSound();
          } catch (e) {

          }
        }
      }

    }
    setTimeout(() => {
      this.pickupQuoteLoop();
    }, Utils.range(1, 2));
  }

  async doPageShippinginit() {

    // 姓
    await Utils.wait(6, 10);
    Utils.input(document.querySelector("#checkout\\.shipping\\.addressSelector\\.newAddress\\.address\\.lastName"), Utils.data.MyAddress.lastName);

    // 名
    await Utils.wait(6, 10);
    Utils.input(document.querySelector("#checkout\\.shipping\\.addressSelector\\.newAddress\\.address\\.firstName"), Utils.data.MyAddress.firstName);


    // 邮编
    await Utils.wait(6, 10);
    Utils.input(document.querySelector("#checkout\\.shipping\\.addressSelector\\.newAddress\\.address\\.postalCode"), Utils.data.MyAddress.postalCode);

    // 都道府県
    Utils.fireSelectChangeWithValue(document.querySelector("#checkout\\.shipping\\.addressSelector\\.newAddress\\.address\\.state"), Utils.data.MyAddress.state);


    Utils.input(document.querySelector("#checkout\\.shipping\\.addressSelector\\.newAddress\\.address\\.city"), Utils.data.MyAddress.city);


    Utils.input(document.querySelector("#checkout\\.shipping\\.addressSelector\\.newAddress\\.address\\.street"), Utils.data.MyAddress.street);


    /**
     * お客様の連絡先情報を教えてください。
     */

    // 3. メールアドレス email
    Utils.input(document.querySelector("#checkout\\.shipping\\.addressContactEmail\\.address\\.emailAddress"), Utils.data.MyAddress.email);


    await Utils.wait();
    // 4. 携帯電話番号はありません。
    Utils.click(document.querySelector("#checkout\\.shipping\\.addressContactPhone\\.address\\.isDaytimePhoneSelected_label"));

    await Utils.wait();
    // 5. 市外局番
    Utils.input(document.querySelector("#checkout\\.shipping\\.addressContactPhone\\.address\\.daytimePhoneAreaCode"), Utils.data.MyAddress.daytimePhoneAreaCode);
    // 6.電話番号
    Utils.input(document.querySelector("#checkout\\.shipping\\.addressContactPhone\\.address\\.daytimePhone"), Utils.data.MyAddress.daytimePhone);

    await Utils.wait();
    this.rsCheckoutContinueButtonBottom();

    await Utils.wait();
    this.doPageBillingInit();
  }
}

let jqGet = new JqGet();
jqGet.init();





