#!/usr/bin/env bash
set -euo pipefail

# Invoked from a demo dir (e.g. examples/demo/) via `vp run setup`.
# Resolve the SDK independently of the caller before touching generated files.
ORIGINAL_DIR=$(pwd -P)
SDK_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
case "$ORIGINAL_DIR" in
  "$SDK_ROOT/examples/demo"|"$SDK_ROOT/examples/demo-no-location") ;;
  *) echo "Run setup from examples/demo or examples/demo-no-location." >&2; exit 1 ;;
esac
STAMP_FILE="$SDK_ROOT/.rn-sdk-source.stamp"
DEMO_SDK_STAMP_FILE="$ORIGINAL_DIR/.rn-sdk-source.stamp"
DEMO_ENV_STAMP_FILE="$ORIGINAL_DIR/.rn-demo-env.stamp"
TGZ_FILE="$SDK_ROOT/react-native-onesignal.tgz"
INSTALLED_DIR="$ORIGINAL_DIR/node_modules/react-native-onesignal"

# Content hash of every input that can affect the published tarball.
# We deliberately hash file contents (shasum each file, then shasum the
# combined list) instead of using `find -newer`, because mtimes get
# bumped by routine git operations (checkout, branch switch, rebase)
# even when the source is identical — that caused needless rebuilds.
src_hash=$(find "$SDK_ROOT/src" "$SDK_ROOT/ios" "$SDK_ROOT/android/src" \
                "$SDK_ROOT/android/build.gradle" "$SDK_ROOT/android/proguard-rules.pro" \
                "$SDK_ROOT/package.json" "$SDK_ROOT/tsconfig.json" \
                "$SDK_ROOT/vite.config.ts" "$SDK_ROOT/bun.lock" \
                "$SDK_ROOT/README.md" "$SDK_ROOT/LICENSE" \
                "$SDK_ROOT"/*.podspec \
           -type f -exec shasum {} + \
           | LC_ALL=C sort \
           | shasum \
           | awk '{print $1}')

demo_env_hash=$(
  {
    for file in "$ORIGINAL_DIR/.env" "$ORIGINAL_DIR/babel.config.js" "$ORIGINAL_DIR/metro.config.js"; do
      if [ -f "$file" ]; then
        shasum "$file"
      else
        echo "missing $file"
      fi
    done
  } | shasum | awk '{print $1}'
)

if [ ! -f "$DEMO_ENV_STAMP_FILE" ] || [ "$(cat "$DEMO_ENV_STAMP_FILE")" != "$demo_env_hash" ]; then
  echo "Demo env inputs changed, clearing Metro cache..."
  # Both demo Metro configs keep their transform and file-map caches here.
  rm -rf "$ORIGINAL_DIR/node_modules/.cache/metro"
  metro_pids=$(lsof -ti tcp:8081 2>/dev/null || true)
  for pid in $metro_pids; do
    args=$(ps -p "$pid" -o args= 2>/dev/null || true)
    case "$args" in
      *react-native*|*metro*)
        metro_cwd=$(lsof -a -p "$pid" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' || true)
        if [ "$metro_cwd" = "$ORIGINAL_DIR" ]; then
          echo "Stopping this demo's Metro so @env values are reloaded..."
          kill "$pid" 2>/dev/null || true
        fi
        ;;
    esac
  done
  echo "$demo_env_hash" > "$DEMO_ENV_STAMP_FILE"
fi

# Track each demo's installation separately from the shared package build.
# FORCE_SETUP=1 bypasses the cache when something feels off.
if [ "${FORCE_SETUP:-0}" != "1" ] \
   && [ -d "$INSTALLED_DIR" ] \
   && [ -f "$STAMP_FILE" ] \
   && [ -f "$DEMO_SDK_STAMP_FILE" ] \
   && [ -f "$TGZ_FILE" ] \
   && [ "$(cat "$STAMP_FILE")" = "$src_hash" ] \
   && [ "$(cat "$DEMO_SDK_STAMP_FILE")" = "$src_hash" ]; then
  echo "SDK source unchanged, skipping rebuild. Set FORCE_SETUP=1 to override."
  exit 0
fi

if [ "${FORCE_SETUP:-0}" = "1" ] \
   || [ ! -f "$STAMP_FILE" ] \
   || [ ! -f "$TGZ_FILE" ] \
   || [ "$(cat "$STAMP_FILE")" != "$src_hash" ]; then
  cd "$SDK_ROOT"
  vp run build
  # Use the pinned package manager through Vite+ so the archive is written to
  # the deterministic filename consumed below.
  vp exec bun pm pack --filename "$TGZ_FILE"
  echo "$src_hash" > "$STAMP_FILE"
fi

cd "$ORIGINAL_DIR"

# Always go through the package manager so bun.lock's integrity hash for
# the tarball stays in sync with the freshly-built tarball on disk. A
# previous version of this script had a "hot path" that just untarred
# over node_modules directly, which was faster but left a stale sha512
# in bun.lock — any subsequent `vp install` that re-resolved this entry
# (e.g. when the lockfile was touched by another dep) would fail with
# IntegrityCheckFailed.
#
# Remove first because bun verifies the existing integrity hash before
# replacing the entry. The relative `file:../../...`
# path is intentional — an absolute path would leak this machine's
# layout into the lockfile.
echo "Registering tarball with vp (refreshes bun.lock integrity hash)..."
vp remove react-native-onesignal
vp add file:../../react-native-onesignal.tgz

# Record the hash only after a successful build/install so that an
# interrupted run forces a full retry next time.
echo "$src_hash" > "$DEMO_SDK_STAMP_FILE"
