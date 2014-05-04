console.log('multipass started')
chrome.commands.onCommand.addListener(function(command) {
  console.log('command:', command);
});
var port = chrome.runtime.connectNative('org.garbagecollected.multipass');
port.onMessage.addListener(function(msg) {
  console.log("Received" + msg.text);
  toClipboard(msg.text)
});
port.onDisconnect.addListener(function() {
  console.log("Disconnected, reloading extension");
  chrome.runtime.reload()
});
port.postMessage({ text: "Hello, my_application" });

var toClipboard = function(str) {
  var sandbox = document.getElementById('sandbox')
  sandbox.value = str
  sandbox.select()
  document.execCommand('copy');
  sandbox.value = ''
}
