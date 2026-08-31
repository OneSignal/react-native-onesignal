#!/usr/bin/env bash
set -euo pipefail

DEMO_DIR=$(pwd -P)
SDK_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
TARBALL="$SDK_ROOT/react-native-onesignal.tgz"
INSTALL_STAMP="$DEMO_DIR/.rn-sdk-source.stamp"
INSTALLED_DIR="$DEMO_DIR/node_modules/react-native-onesignal"
ENV_STAMP="$DEMO_DIR/.rn-demo-env.stamp"

if [ -f "$DEMO_DIR/.env" ]; then
  env_hash=$(shasum "$DEMO_DIR/.env" | awk '{print $1}')
else
  env_hash=missing
fi

if [ ! -f "$ENV_STAMP" ] || [ "$(cat "$ENV_STAMP")" != "$env_hash" ]; then
  echo "Demo environment changed; restarting Metro."
  metro_pids=$(lsof -ti tcp:8081 2>/dev/null || true)
  for pid in $metro_pids; do
    metro_cwd=$(lsof -a -p "$pid" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' || true)
    if [ "$metro_cwd" = "$DEMO_DIR" ]; then
      kill "$pid" 2>/dev/null || true
    fi
  done
  echo "$env_hash" > "$ENV_STAMP"
fi

cd "$SDK_ROOT"
vp run build
rm -f react-native-onesignal-*.tgz
vp pm pack

new_tarball=(react-native-onesignal-*.tgz)
if [ -f "$TARBALL" ] && cmp -s "${new_tarball[0]}" "$TARBALL"; then
  rm "${new_tarball[0]}"
  echo "SDK package unchanged; using cached react-native-onesignal.tgz."
else
  mv "${new_tarball[0]}" "$TARBALL"
  echo "SDK package changed; refreshed react-native-onesignal.tgz."
fi

tarball_hash=$(shasum "$TARBALL" | awk '{print $1}')
if [ -d "$INSTALLED_DIR" ] \
   && [ -f "$INSTALL_STAMP" ] \
   && [ "$(cat "$INSTALL_STAMP")" = "$tarball_hash" ]; then
  echo "Demo already has this SDK package; skipping reinstall."
  exit 0
fi

cd "$DEMO_DIR"
echo "Installing updated SDK package in demo..."
vp remove react-native-onesignal 2>/dev/null || true
vp install file:../../react-native-onesignal.tgz
echo "$tarball_hash" > "$INSTALL_STAMP"
