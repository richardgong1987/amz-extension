const port = chrome.runtime.connect({name: "GHJ-port"})
port.onMessage.addListener((msg) => {
  if (msg.action == "data") {

  }
});

setTimeout(() => {
  var child: { twinCatName: string | undefined; twinCatInfo: string; }[] = [];
  $(".wrap ul li a").each(function () {
    child.push({
      "twinCatName": $(this).attr("href")?.split("/").filter(v => v).pop(),
      "twinCatInfo": $(this).find(".name").text(),
    })
  });
  const msg = {
    action: "appendData",
    data: child
  }
  port.postMessage(msg);
}, 5000);


