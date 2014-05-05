console.log('multipass started')

chrome.commands.onCommand.addListener(function(command) {
  console.log('command:', command);
});

// var port = chrome.runtime.connectNative('org.garbagecollected.multipass');

// port.onMessage.addListener(function(msg) {
//   console.log("Received" + msg.Success);
//   toClipboard(msg.text)
// });

// port.onDisconnect.addListener(function() {
//   console.log("Disconnected, reloading extension");
//   //chrome.runtime.reload()
// });

function login(password, callback) {
  chrome.runtime.sendNativeMessage('org.garbagecollected.multipass', { Action: "login", Payload: { Password: password } }, callback);
}

var toClipboard = function(str) {
  var sandbox = document.getElementById('sandbox')
  sandbox.value = str
  sandbox.select()
  document.execCommand('copy');
  sandbox.value = ''
}
