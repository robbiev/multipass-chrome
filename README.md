This is an unofficial [Chrome extension](https://chrome.google.com/webstore/detail/multipass/nogdingclealjiajkpbleapgdaakkpfl) for 1Password for use on Linux. It uses a native binary (written in Go) to do the interfacing with your 1Password files (using [native messaging](https://developer.chrome.com/extensions/messaging#native-messaging)). Only the "agile keychain" format is currently supported. Works for me using 1Password 4.

 1. download the release package
 1. unpack the contents to where you want the binary to live (I use `$HOME/bin`)
 1. run `sudo ./install.sh`, this copies a metadata file into a Chrome directory to give the extension access to the binary
 1. currently you need to put your 1Password files in a Dropbox location so that the following directory structure exists: `$HOME/Dropbox/1password/1Password.agilekeychain/data/default`
 1. install the extension in Chrome
 1. Ctrl+M to bring up the popup
