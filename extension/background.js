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
  var now = function() { return new Date().getTime() }
  // active, idle, locked
  var checkIdle = false
  chrome.idle.setDetectionInterval(15)
  chrome.idle.onStateChanged.addListener(function(s) {
    machineState = s
    if (s === 'idle') {
      checkIdle = true
      for (var key in container) {
        if (container.hasOwnProperty(key)) {
          var val = container[key]
          val.createdMillis = now()
        }
      }
    } else if (s === 'locked') {
      checkIdle = false
      for (var key in container) {
        if (container.hasOwnProperty(key)) {
          var val = container[key]
          delete container[key]
          val.onExpire()
        }
      }
    } else {
      // active
      checkIdle = false
    }
  })

  setInterval(function() {
    if (checkIdle) {
      var nowMillis = now()
      for (var key in container) {
        if (container.hasOwnProperty(key)) {
          var val = container[key]
          var timeleft = (val.createdMillis + val.expiryMillis) - nowMillis
          if (timeleft <= 0) {
            delete container[key]
            val.onExpire()
          } else {
            val.onAge(Math.round(timeleft/1000))
          }
        }
      }
    }
  }, 1000)
  return {
    set: function(key, value, expirySeconds, onAge, onExpire) {
      container[key] = { 
        value: value,
        createdMillis: now(),
        expiryMillis: expirySeconds*1000,
        onAge: onAge,
        onExpire: onExpire
      }
    },
    incrementExpiry: function(key, expirySeconds) {
      var candidate = container[key]
      if (candidate) {
        candidate.expiryMillis = candidate.expiryMillis + (expirySeconds*1000)
      }
    },
    replaceCallbacks: function(key, onAge, onExpire) {
      var candidate = container[key]
      if (candidate) {
        candidate.onAge = onAge
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
