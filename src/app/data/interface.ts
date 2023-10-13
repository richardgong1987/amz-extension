export interface IBidItem {
  orderId: string;
  info?: string;
  timeLeft?: number;
  limitPrice?: number;
  updateTime?: string;
  remark?: string;
  url?: string;
  status?: number;
}

export const IBidList: IBidItem[] = [
  {
    "updateTime": "2023-10-10 22:23:00",
    "remark": "オークション - 終了",
    "orderId": "l1109191433",
    "limitPrice": 203000,
    "timeLeft": 0,
    "url": "https://page.auctions.yahoo.co.jp/jp/auction/l1109191433",
    "info": "https://auctions.c.yimg.jp/images.auctions.yahoo.co.jp/image/dr000/auc0410/users/b266515093da9dd9345cd15036936d9fc32165fe/i-img1200x900-1696583456tdqezz897490.jpg",
    "status": 5
  },
  {

    "updateTime": "2023-10-10 22:04:00",
    "remark": "用户名:slzm3471,价格:12,679円",
    "orderId": "w1107774984",
    "limitPrice": 13680,
    "timeLeft": 0,
    "url": "https://page.auctions.yahoo.co.jp/jp/auction/w1107774984",
    "info": "https://auctions.c.yimg.jp/images.auctions.yahoo.co.jp/image/dr000/auc0409/users/2caf52e53f8f7295db7d8b393a689941d5febd11/i-img600x600-1695725964d5kefo493593.jpg",
    "status": 2
  },
  {
    "updateTime": "2023-10-10 21:14:00",
    "remark": "用户名:slzm3471,价格:60,000円",
    "orderId": "w1107062997",
    "limitPrice": 66000,
    "timeLeft": 0,
    "url": "https://page.auctions.yahoo.co.jp/jp/auction/w1107062997",
    "info": "https://auctions.c.yimg.jp/images.auctions.yahoo.co.jp/image/dr000/auc0409/users/09b7236679df4dca58265c064a8026db5042e098/i-img900x1200-1695203600qypy4o265953.jpg",
    "status": 2
  }
]

export const StatusDict = [
  {
    "dictLabel": "初期化",
    "dictValue": "0",
    "listClass": "info",
  },
  {
    "dictLabel": "入札中",
    "dictValue": "1",
    "listClass": "warning",
  },
  {
    "dictLabel": "成功",
    "dictValue": "2",
    "listClass": "success",
  },
  {
    "dictLabel": "高すぎる",
    "dictValue": "3",
    "listClass": "danger",
  },
  {
    "dictLabel": "期限切れ",
    "dictValue": "4",
    "listClass": "danger",
  },
  {
    "dictLabel": "終了",
    "dictValue": "5",
    "listClass": "primary",
  }
]
