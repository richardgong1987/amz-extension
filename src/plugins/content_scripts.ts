const port = chrome.runtime.connect({name: "GHJ-port"})
port.onMessage.addListener((msg) => {
  if (msg.action == "data") {

  }
});




