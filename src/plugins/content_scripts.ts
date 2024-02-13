const port = chrome.runtime.connect({name: "GHJ-port"})
port.onMessage.addListener((msg) => {
  if (msg.action == "data") {

  }
});

setTimeout(() => {
  var child: any = []
  if ($(".wrap").length) {
    if ($(".wrap").length > 2) {
      $(".wrap").each(function () {
        var $wrap = $(this);
        $wrap.find("ul li a").each(function () {
          child.push({
            "twinCatName": $(this).attr("href")?.split("/").filter(v => v).pop(),
            "twinCatInfo": $wrap.find("h3").text() + $(this).find("h3").text(),
          });
        });
      });
    } else {
      $(".wrap ul li a").each(function () {
        child.push({
          "twinCatName": $(this).attr("href")?.split("/").filter(v => v).pop(),
          "twinCatInfo": $(this).text(),
        })
      });
    }

  } else if ($(".send_sp").length) {
    if ($(".send_sp li").length) {
      $(".send_sp li a").each(function () {
        child.push({
          "twinCatName": $(this).attr("href")?.split("/").filter(v => v).pop(),
          "twinCatInfo": $(this).text()
        })
      });
    } else {
      $(".send_sp").next().find("li a").each(function () {
        child.push({
          "twinCatName": $(this).attr("href")?.split("/").filter(v => v).pop(),
          "twinCatInfo": $(this).text()
        })
      });
    }
  }
  const msg = {
    action: "appendData",
    data: child
  }
  port.postMessage(msg);
}, 3000);


