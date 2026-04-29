#!/usr/bin/env bash
set -euo pipefail

# Invoked from a demo dir (e.g. examples/demo/) via `vp run setup`.
# ORIGINAL_DIR captures that dir so we can return to it after building
# the SDK; SDK_ROOT is two levels up (the SDK package itself).
ORIGINAL_DIR=$(pwd)
SDK_ROOT="$(cd ../../ && pwd)"
STAMP_FILE="$SDK_ROOT/.rn-sdk-source.stamp"
TGZ_FILE="$SDK_ROOT/react-native-onesignal.tgz"
INSTALLED_DIR="$ORIGINAL_DIR/node_modules/react-native-onesignal"

# Content hash of every input that can affect the published tarball.
# We deliberately hash file contents (shasum each file, then shasum the
# combined list) instead of using `find -newer`, because mtimes get
# bumped by routine git operations (checkout, branch switch, rebase)
# even when the source is identical — that caused needless rebuilds.
src_hash=$(find "$SDK_ROOT/src" "$SDK_ROOT/ios" "$SDK_ROOT/android" \
                "$SDK_ROOT/package.json" "$SDK_ROOT/tsconfig.json" \
                "$SDK_ROOT"/*.podspec \
           -type f 2>/dev/null \
           | sort \
           | xargs shasum 2>/dev/null \
           | shasum \
           | awk '{print $1}')

# Skip the whole rebuild when:
#   - the demo already has the SDK installed,
#   - the cached tarball is still on disk, and
#   - the source hash matches the last successful build.
# FORCE_SETUP=1 bypasses the cache when something feels off.
if [ "${FORCE_SETUP:-0}" != "1" ] \
   && [ -d "$INSTALLED_DIR" ] \
   && [ -f "$STAMP_FILE" ] \
   && [ -f "$TGZ_FILE" ] \
   && [ "$(cat "$STAMP_FILE")" = "$src_hash" ]; then
  echo "SDK source unchanged, skipping rebuild. Set FORCE_SETUP=1 to override."
  exit 0
fi

cd "$SDK_ROOT"
vp run build

# `bun pm pack` honors package.json's "files" field (so the tarball matches
# what would actually be published). The version suffix in the filename
# is unstable, so we normalize to react-native-onesignal.tgz for a
# deterministic path that package.json + the extract step can reference.
rm -f react-native-onesignal*.tgz
vp pm pack
mv react-native-onesignal-*.tgz react-native-onesignal.tgz

cd "$ORIGINAL_DIR"

# Always go through bun add so bun.lock's integrity hash for the tarball
# stays in sync with the freshly-built tarball on disk. A previous version
# of this script had a "hot path" that just untarred over node_modules
# directly, which was faster but left a stale sha512 in bun.lock — any
# subsequent `bun install` that re-resolved this entry (e.g. when the
# lockfile was touched by another dep) would fail with IntegrityCheckFailed.
#
# `bun remove` first because bun verifies the existing integrity hash
# before replacing the entry; without removing, a stale hash from a prior
# build causes `bun add` itself to fail. The relative `file:../../...`
# path is intentional — an absolute path would leak this machine's
# layout into the lockfile.
echo "Registering tarball with bun (refreshes bun.lock integrity hash)..."
vp remove react-native-onesignal 2>/dev/null || true
vp add file:../../react-native-onesignal.tgz

# Record the hash only after a successful build/install so that an
# interrupted run forces a full retry next time.
echo "$src_hash" > "$STAMP_FILE"
