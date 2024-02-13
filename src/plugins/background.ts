const ports = new Map<number | string | undefined, chrome.runtime.Port>;


chrome.runtime.onConnect.addListener(async function (port) {
  if (port.name.startsWith("GHJ-port")) {
    ports.set(port.sender?.tab?.id, port);
    port.onMessage.addListener((msg) => {
      ports.set(port.name, port);
      if (msg.action === "start") {
        start();
      }
      if (msg.action === "closeTab") {
        chrome.tabs.remove(port.sender?.tab?.id as number)
      } else if (msg.action === "reloadTab") {
        chrome.tabs.reload(port.sender?.tab?.id as number)
        chrome.tabs.remove(port.sender?.tab?.id as number)
      } else if (msg.action === "appendData") {
        chrome.tabs.remove(port.sender?.tab?.id as number)
        resolveData(msg.data);
      }
    });
    // Handle disconnections
    port.onDisconnect.addListener(function () {
      ports.delete(port.sender?.tab?.id || port.name)
    });
  }
});

let resolveData: Function;

function fetchData(url: string) {
  return new Promise((resolve, reject) => {
    openNewTab(url);
    resolveData = resolve;
  });
}

function openNewTab(url: string) {
  chrome.tabs.create({url})
}

async function start() {
  const category = [
    {
      "twinCatName": "smartphone",
      "twinCatInfo": " スマートフォン",
      "child": [
        {
          "url": "https://k-tai-iosys.com/pricelist/smartphone/iphone/",
          "twinCatName": "iphone",
          "twinCatInfo": "iphone"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/smartphone/xperia/",
          "twinCatName": "xperia",
          "twinCatInfo": "xperia"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/smartphone/galaxy/",
          "twinCatName": "galaxy",
          "twinCatInfo": "galaxy"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/smartphone/pixel/",
          "twinCatName": "pixel",
          "twinCatInfo": "pixel"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/smartphone/rakuten/",
          "twinCatName": "rakuten",
          "twinCatInfo": "rakuten"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/smartphone/xiaomi/",
          "twinCatName": "xiaomi",
          "twinCatInfo": "xiaomi"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/smartphone/aquos/",
          "twinCatName": "aquos",
          "twinCatInfo": "aquos"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/smartphone/oppo/",
          "twinCatName": "oppo",
          "twinCatInfo": "oppo"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/smartphone/zenfone/",
          "twinCatName": "zenfone",
          "twinCatInfo": "zenfone"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/smartphone/arrows/",
          "twinCatName": "arrows",
          "twinCatInfo": "arrows"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/smartphone/huawei/",
          "twinCatName": "huawei",
          "twinCatInfo": "huawei"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/smartphone/nexus/",
          "twinCatName": "nexus",
          "twinCatInfo": "nexus"
        }
      ]
    },
    {
      "twinCatName": "tablet",
      "twinCatInfo": " タブレット",
      "child": [
        {
          "url": "https://k-tai-iosys.com/pricelist/tablet/ipad/",
          "twinCatName": "ipad",
          "twinCatInfo": "ipad"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/tablet/surface/",
          "twinCatName": "surface",
          "twinCatInfo": "surface"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/tablet/galaxytab/",
          "twinCatName": "galaxytab",
          "twinCatInfo": "galaxytab"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/tablet/dtab/",
          "twinCatName": "dtab",
          "twinCatInfo": "dtab"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/tablet/quatab/",
          "twinCatName": "quatab",
          "twinCatInfo": "quatab"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/tablet/xperia/",
          "twinCatName": "xperia",
          "twinCatInfo": "xperia"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/tablet/lenovotab/",
          "twinCatName": "lenovotab",
          "twinCatInfo": "lenovotab"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/tablet/xiaomi/",
          "twinCatName": "xiaomi",
          "twinCatInfo": "xiaomi"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/tablet/nexus/",
          "twinCatName": "nexus",
          "twinCatInfo": "nexus"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/tablet/mediapad/",
          "twinCatName": "mediapad",
          "twinCatInfo": "mediapad"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/tablet/zenpad/",
          "twinCatName": "zenpad",
          "twinCatInfo": "zenpad"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/tablet/aquospad/",
          "twinCatName": "aquospad",
          "twinCatInfo": "aquospad"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/tablet/arrows/",
          "twinCatName": "arrows",
          "twinCatInfo": "arrows"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/tablet/memopad/",
          "twinCatName": "memopad",
          "twinCatInfo": "memopad"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/tablet/iconia/",
          "twinCatName": "iconia",
          "twinCatInfo": "iconia"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/tablet/lavietab/",
          "twinCatName": "lavietab",
          "twinCatInfo": "lavietab"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/tablet/yogatablet/",
          "twinCatName": "yogatablet",
          "twinCatInfo": "yogatablet"
        }
      ]
    },
    {
      "twinCatName": "notepc",
      "twinCatInfo": " ノートパソコン",
      "child": [
        {
          "url": "https://k-tai-iosys.com/pricelist/notepc/macbook/",
          "twinCatName": "macbook",
          "twinCatInfo": "macbook"
        }
      ]
    },
    {
      "twinCatName": "wearable",
      "twinCatInfo": " スマートウォッチ",
      "child": [
        {
          "url": "https://k-tai-iosys.com/pricelist/wearable/smartwatch/applewatch/",
          "twinCatName": "smartwatch",
          "twinCatInfo": "smartwatch"
        }
      ]
    },
    {
      "twinCatName": "accessory",
      "twinCatInfo": " アクセサリー",
      "child": [
        {
          "url": "https://k-tai-iosys.com/pricelist/accessory/earphone/",
          "twinCatName": "earphone",
          "twinCatInfo": "earphone"
        },
        {
          "url": "https://k-tai-iosys.com/pricelist/accessory/apple/airpods/",
          "twinCatName": "apple",
          "twinCatInfo": "apple"
        }
      ]
    }
  ]
  let index = 0;
  for (const item of category) {
    for (let item2 of item.child) {
      const resultData = await fetchData(item2.url);
      // @ts-ignore
      item2.child = resultData;
      index++;
      console.log("*****index:", index);
    }
  }
  console.log(JSON.stringify(category));
}



