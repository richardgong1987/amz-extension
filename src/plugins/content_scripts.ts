const port = chrome.runtime.connect({name: "GHJ-port"})
port.onMessage.addListener((msg) => {
  if (msg.action == "data") {

  }
});

function getPricelist() {
  var child: any = []

  $(".pricelist").each(function () {
    var groups = {
      "twinCatName": $(this).find(".pricelist-title a").attr("href")?.split("/").filter(v => v).pop(),
      "pricelist-title": $(this).find(".pricelist-title").text().trim(),
      "pricelist-releasedate": $(this).find(".pricelist-releasedate").text().trim(),
      "tables": [] as any[],
    }
    $(this).find(".table tr").each(function () {
      var sprice = parseInt($(this).find(".s-price").text().replace(/,/g, ""), 10);
      groups.tables.push({
        "data-group-id": $(this).attr("data-group-id"),
        "carrer": $(this).find(".docomo").text().trim(),
        "name": $(this).find(".name").text().trim(),
        "s-price": sprice,
        "s-name": $(this).find(".s-name").clone().find(".s-price").remove().end().text().trim(),
        "a-name": $(this).find(".a-name").text(),
        "ID":$(this).find('a').attr('href')
      })
    });
    child.push(groups);
  });

  const msg = {
    action: "appendData",
    data: child
  }
  port.postMessage(msg);
}

// setTimeout(getPricelist, 2000);




