// Saves options to chrome.storage
function save_options() {
  var color = document.getElementById('keychain').value
  chrome.storage.sync.set({
    keychain: keychain
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
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    keychain: '~/Dropbox/1password/1Password.agilekeychain/data/default'
  }, function(items) {
    document.getElementById('keychain').value = items.keychain
  });
}

document.addEventListener('DOMContentLoaded', restore_options)
document.getElementById('save').addEventListener('click', save_options);
