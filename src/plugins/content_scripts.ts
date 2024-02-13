const port = chrome.runtime.connect({name: "GHJ-port"})
port.onMessage.addListener((msg) => {
  if (msg.action == "data") {

  }
});

setTimeout(() => {
  const msg = {
    action: "appendData",
    data: {
      pathname: location.pathname,
    }
  }
  port.postMessage(msg);
}, 2000);


