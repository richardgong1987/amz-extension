let isstart = false;

async function start() {
  isstart = true;
}


const ports = new Map<number | string | undefined, chrome.runtime.Port>;
chrome.runtime.onConnect.addListener(async (port) => {
  if (port.name.startsWith("GHJ-port")) {
    ports.set(port.sender?.tab?.id, port);
    port.onMessage.addListener((msg) => {
      ports.set(port.name, port);
      if (msg.action === "start") {
        start();
      }
      if (msg.action === "stop") {
        stopFetch();
      }
    });
    // Handle disconnections
    port.onDisconnect.addListener(function () {
      ports.delete(port.sender?.tab?.id || port.name)
    });
  }
});

let resolveData: Function;

function fetchData(url: string) {
  return new Promise((resolve, reject) => {
    openNewTab(url);
    resolveData = resolve;
  });
}

function openNewTab(url: string) {
  chrome.tabs.create({url})
}


function stopFetch() {
  isstart = false;
}



