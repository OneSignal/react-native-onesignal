#!/bin/bash
set -e

serials=$(adb devices | awk '/\tdevice$/{print $1}')

if [ -z "$serials" ]; then
  echo "No Android devices connected. Start an emulator and try again."
  exit 1
fi

labels=()
devices=()
while IFS= read -r serial; do
  avd=$(adb -s "$serial" emu avd name 2>/dev/null | head -1 | tr -d '\r')
  label="${avd:-$serial} ($serial)"
  labels+=("$label")
  devices+=("$serial")
done <<< "$serials"

if [ ${#devices[@]} -eq 1 ]; then
  selected="${devices[0]}"
  echo "Using device: ${labels[0]}"
else
  echo "Select a device:"
  for i in "${!labels[@]}"; do
    echo "  $((i+1))) ${labels[$i]}"
  done
  printf "Choice [1]: "
  read -r choice
  choice=${choice:-1}
  idx=$((choice - 1))
  if [ "$idx" -lt 0 ] || [ "$idx" -ge ${#devices[@]} ]; then
    echo "Invalid choice."
    exit 1
  fi
  selected="${devices[$idx]}"
fi

cd "$(dirname "$0")/demo"
ANDROID_SERIAL="$selected" bunx react-native run-android --deviceId "$selected"
