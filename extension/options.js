
function init() {
  chrome.extension.getBackgroundPage().getDefaultDir(restore_options)
}

// Saves options to chrome.storage
function save_options() {
  var keychain = document.getElementById('keychain').value
  var idle = document.getElementById('idle').value
  chrome.storage.local.set({
    keychain: keychain,
    idle: idle
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status')
    status.textContent = 'Options saved.'
    setTimeout(function() {
      status.textContent = ''
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options(home) {
  chrome.storage.local.get({
    keychain: home+'/Dropbox/1password/1Password.agilekeychain/data/default',
    idle: 5 * 60
  }, function(items) {
    if (chrome.runtime.lastError) {
      console.log(lastError)
    }
    document.getElementById('keychain').value = items.keychain
    document.getElementById('idle').value = items.idle
  });
}

document.addEventListener('DOMContentLoaded', init)
document.getElementById('save').addEventListener('click', save_options);
