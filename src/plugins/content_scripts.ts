const port = chrome.runtime.connect({name: "GHJ-port"})
port.onMessage.addListener((msg) => {
  if (msg.action == "data") {

  }
});

function getPricelist() {
  let child: any = []
  let options = [] as any[];
  let selected = $(".item_datail .selected");
  let groups = {
    "type": "0x単選項目",
    "id": "opt0x_tit",
    "val": selected.find(".title").text().trim(),
    "label": "タイトル",
    "options": options
  };

  selected.find("input").each(function (i) {
    selected.find("label")
    options.push(
      {
        "t": {
          "id": `opt${i}_t`,
          "val": $(this).attr("data-value"),
          "label": `項目_${i}`,
        },
        "p": {
          "id": `opt${i}_p`,
          "val": selected.find("label").eq(i).text(),
          "label": "単価"
        }
      });
  });
  child.push(groups);
  $(".notselected").each(function (bi) {
    let selected = $(this);
    let options = [] as any[];
    let groups = {
      "type": `${bi + 1}x単選項目`,
      "id": `opt${bi + 1}x_tit`,
      "val": selected.find(".title").text().trim(),
      "label": "タイトル",
      "options": options
    };

    selected.find("input").each(function (i) {
      selected.find("label")
      options.push({
        "t": {
          "id": `opt${i}_t`,
          "val": $(this).attr("data-value"),
          "label": `項目_${i}`,
        },
        "p": {
          "id": `opt${i}_p`,
          "val": selected.find("label").eq(i).text().trim(),
          "label": "単価"
        }
      });
    });
    child.push(groups);
  });

  const msg = {
    action: "appendData",
    data: child
  }
  port.postMessage(msg);
}

setTimeout(getPricelist, 100);




