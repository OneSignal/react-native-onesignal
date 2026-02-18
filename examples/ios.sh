#!/bin/bash
set -e

booted=$(xcrun simctl list devices booted -j | python3 -c '
import json
import sys

data = json.load(sys.stdin)
devices_by_runtime = data.get("devices", {})
booted = []
for runtime_devices in devices_by_runtime.values():
    for device in runtime_devices:
        if device.get("state") == "Booted":
            name = device.get("name", "")
            udid = device.get("udid", "")
            if udid:
                booted.append((name, udid))

for name, udid in booted:
    print(f"{name}|{udid}")
')

count=0
selected=""
while IFS= read -r line; do
  [ -z "$line" ] && continue
  count=$((count + 1))
  if [ "$count" -eq 1 ]; then
    selected="$line"
  fi
done <<EOF
$booted
EOF

if [ "$count" -eq 0 ]; then
  echo "No booted iOS simulators found. Open one simulator and try again."
  exit 1
fi

if [ "$count" -gt 1 ]; then
  echo "Multiple booted iOS simulators found. Choose one:"
  options=()
  while IFS= read -r entry; do
    [ -z "$entry" ] && continue
    options+=("$entry")
  done <<EOF
$booted
EOF

  for i in "${!options[@]}"; do
    entry="${options[$i]}"
    name="${entry%%|*}"
    udid="${entry##*|}"
    echo "  $((i + 1)). $name ($udid)"
  done

  while true; do
    printf "Enter number [1-%s]: " "${#options[@]}"
    read -r choice
    if [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le "${#options[@]}" ]; then
      selected="${options[$((choice - 1))]}"
      break
    fi
    echo "Invalid selection. Try again."
  done
fi

name="${selected%%|*}"
udid="${selected##*|}"
echo "Using simulator: $name ($udid)"

bunx react-native run-ios --udid "$udid"
