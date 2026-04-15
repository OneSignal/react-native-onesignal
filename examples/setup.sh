set -euo pipefail

ORIGINAL_DIR=$(pwd)
SDK_ROOT="$(cd ../../ && pwd)"
STAMP_FILE="$SDK_ROOT/.sdk-build-stamp"
TGZ_FILE="$SDK_ROOT/react-native-onesignal.tgz"

if [ "${FORCE_SETUP:-0}" != "1" ] && [ -f "$STAMP_FILE" ] && [ -f "$TGZ_FILE" ]; then
  changed=$(find "$SDK_ROOT/src" "$SDK_ROOT/ios" "$SDK_ROOT/android/src" \
    "$SDK_ROOT/android/build.gradle" "$SDK_ROOT/package.json" \
    "$SDK_ROOT/react-native-onesignal.podspec" \
    -type f -newer "$STAMP_FILE" 2>/dev/null | head -1)
  if [ -z "$changed" ]; then
    echo "SDK source unchanged, skipping rebuild. Set FORCE_SETUP=1 to override."
    exit 0
  fi
fi

cd "$SDK_ROOT"
bun run build

rm -f react-native-onesignal*.tgz
bun pm pack
mv react-native-onesignal-*.tgz react-native-onesignal.tgz

touch "$STAMP_FILE"

cd "$ORIGINAL_DIR"

bun remove react-native-onesignal
bun add file:../../react-native-onesignal.tgz

