console.log('multipass started')

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

var state = (function() {
  var container = {}

  chrome.storage.local.get({
    idle: 5 * 60
  }, function(items) {
    chrome.idle.setDetectionInterval(parseInt(items.idle, 10))
  })
  chrome.idle.onStateChanged.addListener(function(s) {
    // active, idle, locked
    if (s !== 'active') {
      for (var key in container) {
        if (container.hasOwnProperty(key)) {
          var val = container[key]
          delete container[key]
          val.onExpire()
        }
      }
    }
  })

  return {
    set: function(key, value, onExpire) {
      container[key] = { 
        value: value,
        onExpire: onExpire
      }
    },
    replaceCallbacks: function(key, onExpire) {
      var candidate = container[key]
      if (candidate) {
        candidate.onExpire = onExpire
      }
    },
    get: function(key) {
      var candidate = container[key]
      if (candidate) {
        return candidate.value
      } else {
        return undefined
      }
    },
    remove: function(key) {
      delete container[key]
    }
  }
})()

function getDefaultDir(callback) {
  home(function(resp) {
    if (resp.Success) {
      callback(resp.Home+'/Dropbox/1password/1Password.agilekeychain/data/default')
    } else {
      console.error("couldn't find home dir")
    }
  })
}
