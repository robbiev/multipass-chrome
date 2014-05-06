This is an unofficial Chrome extension for 1Password for use on Linux. It uses a native binary (written in Go) to do the interfacing with your 1Password files (using https://developer.chrome.com/extensions/messaging#native-messaging). Only the "agile keychain" format is currently supported. Works for me using 1Password 4.

# download the release package
# unpack the contents to where you want the binary to live (I use $HOME/bin)
# run `sudo install.sh`, this copies a metadata file into a Chrome directory to give the extension access to the binary
# currently you need to put your 1Password files in a Dropbox location so that the following directory structure exists: `$HOME/Dropbox/1password/1Password.agilekeychain/data/default`
# install the extension in Chrome
# Ctrl+M to bring up the popup
