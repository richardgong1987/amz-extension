export const phoneVersionMap = {
  "pro": 1,
  "max": 2,
}

export const phoneColorsMap = {
  // 紫色:
  "ディープパープル": 1,
  // 金色:
  "ゴールド": 2,
  // 银色:
  "シルバー": 3,
  // 黑色:
  "スペースブラック": 4,
}
export const phoneCaptionMap = {
  "128": 1,
  "256": 2,
  "512": 3,
  "1T": 4
}

export interface GbPaymentmethodsEntity {
  lastname: string;
  firstname: string;
  email: string;
  emailPw: string;
  appleidpw: string;
  daytimePhoneAreaCode: string;
  daytimePhone: string;
  cardHolder: string;
  cardNumber: string;
  expiration: string;
  ccv: string;
  postalCode: string;
  state: string;
  city: string;
  street: string;
  createBy: string;
  updateBy: string;
  remark: string;
  nearbypostcode: string;
  phoneVersion: string;
  phoneColors: string;
  phoneCaption: string;
  num: number;
}


export interface IphoneOptions {
  phoneVersion: number;
  phoneColors: number;
  phoneCaption: number;
  num: number;
}

export interface BgBuytrack {
  "店铺": string,
  "页面": string,
  "浏览器": string,
  "下单开始时间": Date,
  "页面开始时间": Date,
  "跳转邮寄页面是否": string
}

export interface IData {
  isStart: boolean;
  isGuestMode: boolean;
  isGrabRole: boolean;
  remark: string;
  "isReOrder": boolean,
  removeBag: boolean;
  isDelivery: boolean;
  iphoneOptions: IphoneOptions;
  bgBuytrack: BgBuytrack;
  Cards: {
    cardNumber: string;
    expiration: string;
    CVV: string;
    emailPw: string;
    appleidpw: string;
  };
  MyAddress: {
    lastName: string;
    firstName: string;
    postalCode: string;
    nearbypostcode: string;
    email: string;
    state: string;
    city: string;
    street: string;
    daytimePhoneAreaCode: string;
    daytimePhone: string;
  }
}


export const defaultData: IData = {
  "isStart": false,
  "isGuestMode": true,
  "isGrabRole": false,
  "isReOrder": false,
  removeBag: false,
  isDelivery: true,
  "remark": "",
  bgBuytrack: {
    "店铺": "",
    "页面": location.pathname + location.search,
    "浏览器": window.navigator.userAgent,
    "下单开始时间": new Date(),
    "页面开始时间": new Date(),
    "跳转邮寄页面是否": ""
  },
  "iphoneOptions": {
    "phoneVersion": 1,
    "phoneColors": 1,
    "phoneCaption": 1,
    num: 1
  },
  "Cards": {
    "cardNumber": "",
    "expiration": "",
    "CVV": "",
    emailPw: "",
    appleidpw: "",
  },
  "MyAddress": {
    "email": "",
    "daytimePhoneAreaCode": "",
    "daytimePhone": "",
    "firstName": "",
    "lastName": "",
    "postalCode": "",
    "nearbypostcode": "",
    "state": "",
    "city": "",
    "street": ""
  }
};

export interface GbReceivestoreEntity {
  name: string;
  remark: string;
  productsString: string;
}

export interface GbOrdersEntity {
  email: string;
  emailPw: string;
  appleidpw: string;
  isbuybyappleid: string;
  address: string;
  creditCard: string;
  orderIdx: string;
  remark: string;
}
