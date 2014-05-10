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
  getDefaultDir(function(defaultDir) {
    chrome.storage.local.get({
      keychain: defaultDir
    }, function(items) {
      chrome.runtime.sendNativeMessage('org.garbagecollected.multipass', { Action: "keychain", Payload: { Password: password, Location: items.keychain } }, callback);
    })
  })
}

function home(callback) {
  chrome.runtime.sendNativeMessage('org.garbagecollected.multipass', { Action: "home", Payload: { } }, callback);
}

function copy(str) {
  var sandbox = document.getElementById('sandbox')
  sandbox.value = str
  sandbox.select()
  document.execCommand('copy');
  sandbox.value = ''
}

function getDefaultDir(callback) {
  home(function(resp) {
    if (resp.Success) {
      callback(resp.Home+'/Dropbox/1password/1Password.agilekeychain/data/default')
    } else {
      console.error("couldn't find home dir")
    }
  })
}
