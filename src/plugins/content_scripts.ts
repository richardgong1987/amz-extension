// @ts-ignore
const port = chrome.runtime.connect({name: "amz-port"})
port.onMessage.addListener((msg) => {
  if (msg.action == "data") {

  }
});

function getPricelist() {
  const msg = {
    action: "amz-data",
    data: ""
  }
  // @ts-ignore
  const inputCode = $(`script:contains('ImageBlockATF')`).text();
  const start = inputCode.indexOf('var data =');
  const end = inputCode.indexOf('tableOfContentsIconImage');
  msg.data =inputCode.slice(start + 10, end - 2) + '}';
  port.postMessage(msg);
}
getPricelist();




