export interface IBidItem {
  checked?: any;
  orderId: string;
  info?: string;
  timeLeft?: number;
  limitPrice?: number;
  updateTime?: string;
  remark?: string;
  url?: string;
  status?: number | string;
}

export interface IkeyWords {
  keywords: string,
  url: string
}

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
