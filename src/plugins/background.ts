const ports = new Map<number | string | undefined, chrome.runtime.Port>;
chrome.runtime.onConnect.addListener(async function (port) {
  if (port.name.startsWith("GHJ-port")) {
    ports.set(port.name, port);
    port.onMessage.addListener((msg) => {
      ports.set(port.name, port);
      if (msg.action === "closeTab") {
        chrome.tabs.remove(port.sender?.tab?.id as number)
      } else if (msg.action === "reloadTab") {
        chrome.tabs.reload(port.sender?.tab?.id as number)
        chrome.tabs.remove(port.sender?.tab?.id as number)
      } else if (msg.action === "appendData") {
        appendData(msg);
      }
    });
    // Handle disconnections
    port.onDisconnect.addListener(function () {
      ports.delete(port.name)
    });
  }
});

function appendData(msg: any) {

}
