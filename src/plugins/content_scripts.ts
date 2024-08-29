const port = chrome.runtime.connect({name: "amz-port"})
port.onMessage.addListener((msg) => {
  if (msg.action == "data") {

  }
});

function getPricelist() {
  let child: any = []
  let options = [] as any[];

  const msg = {
    action: "appendData",
    data: child
  }
  port.postMessage(msg);
}

setTimeout(getPricelist, 100);




