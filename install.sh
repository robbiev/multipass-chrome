#!/bin/bash
# Copyright 2013 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

set -e

DIR="$( cd "$( dirname "$0" )" && pwd )"
if [ $(uname -s) == 'Darwin' ]; then
  if [ "$(whoami)" == "root" ]; then
    TARGET_DIR="/Library/Google/Chrome/NativeMessagingHosts"
  else
    TARGET_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
  fi
else
  if [ "$(whoami)" == "root" ]; then
    TARGET_DIR="/etc/opt/chrome/native-messaging-hosts"
  else
    # Doesn't work on Chrome 33 on ubuntu
    # https://stackoverflow.com/questions/22568473/npapi-replacement-native-messaging-host-for-invoking-external-application-not
    #TARGET_DIR="$HOME/.config/google-chrome/NativeMessagingHosts"
    echo "failed: run as root (sudo ...)"
    exit 1
  fi
fi

HOST_NAME=org.garbagecollected.multipass

# Create directory to store native messaging host.
mkdir -p "$TARGET_DIR"

# Copy native messaging host manifest.
cp "$DIR/$HOST_NAME.json" "$TARGET_DIR"

# Update host path in the manifest.
HOST_PATH=$DIR/multipass
ESCAPED_HOST_PATH=${HOST_PATH////\\/}
sed -i -e "s/%replace%/$ESCAPED_HOST_PATH/" "$TARGET_DIR/$HOST_NAME.json"

# Set permissions for the manifest so that all users can read it.
chmod o+r "$TARGET_DIR/$HOST_NAME.json"

echo Native messaging host $HOST_NAME has been installed.
