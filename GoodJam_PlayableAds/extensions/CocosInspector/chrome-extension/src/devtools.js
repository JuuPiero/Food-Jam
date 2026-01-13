
function connect() {
    port = chrome.runtime.connect({ name: 'cocos-inspector' });
    port.onDisconnect.addListener(() => {
        setTimeout(connect, 2000);
    });
    port.onMessage.addListener((message) => {
        chrome.devtools.inspectedWindow.eval("inspectCurrCode()")
    });
}

connect()


// chrome.devtools.panels.create()