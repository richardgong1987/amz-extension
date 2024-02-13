
const connPorts = new Map<number | string | undefined, chrome.runtime.Port>;


chrome.runtime.onConnect.addListener(async function (port) {
  if (port.name.startsWith("GHJ-port")) {
    connPorts.set(port.name, port);
    port.onMessage.addListener((msg) => {
    });
    // Handle disconnections
    port.onDisconnect.addListener(function () {
      connPorts.delete(port.name)
    });
  }
});
