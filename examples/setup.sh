#!/usr/bin/env bash
set -euo pipefail

# Invoked from a demo dir (e.g. examples/demo/) via `vp run setup`.
# ORIGINAL_DIR captures that dir so we can return to it after building
# the SDK; SDK_ROOT is two levels up (the SDK package itself).
ORIGINAL_DIR=$(pwd)
SDK_ROOT="$(cd ../../ && pwd)"
STAMP_FILE="$SDK_ROOT/.rn-sdk-source.stamp"
DEMO_ENV_STAMP_FILE="$ORIGINAL_DIR/.rn-demo-env.stamp"
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

demo_env_hash=$(
  {
    for file in "$ORIGINAL_DIR/.env" "$ORIGINAL_DIR/babel.config.js"; do
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
  rm -rf "${TMPDIR:-/tmp}"/metro-* "${TMPDIR:-/tmp}"/haste-map-* "$ORIGINAL_DIR/node_modules/.cache/metro" 2>/dev/null || true
  metro_pids=$(lsof -ti tcp:8081 2>/dev/null || true)
  for pid in $metro_pids; do
    args=$(ps -p "$pid" -o args= 2>/dev/null || true)
    case "$args" in
      *react-native*|*metro*)
        echo "Stopping Metro so @env values are reloaded..."
        kill "$pid" 2>/dev/null || true
        ;;
    esac
  done
  echo "$demo_env_hash" > "$DEMO_ENV_STAMP_FILE"
fi

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

# --- Package-manager shim --------------------------------------------------
# `vp` (vite-plus) is the intended toolchain and wraps bun under the hood, but
# some installed vite-plus versions only ship `vp install` and lack the
# `vp pm pack`, `vp add`, and `vp remove` subcommands this script needs. Probe
# once and fall back to bun directly when they're unavailable. The repo pins
# bun via package.json's "packageManager" field, so bun is a faithful
# substitute and keeps bun.lock's integrity hashes in sync just as `vp` would.
if vp pm pack --help >/dev/null 2>&1; then
  pm_pack()   { vp pm pack; }
  pm_add()    { vp add "$@"; }
  pm_remove() { vp remove "$@"; }
else
  echo "vite-plus is missing 'vp pm'/'vp add'/'vp remove'; falling back to bun."
  pm_pack()   { bun pm pack; }
  pm_add()    { bun add "$@"; }
  pm_remove() { bun remove "$@"; }
fi

cd "$SDK_ROOT"
# NODE_PATH points the build at the SDK's own typescript. When vite-plus is
# installed globally, its internal tsc helper resolves `require('typescript')`
# from vite-plus's own node_modules and otherwise fails to find the compiler.
NODE_PATH="$SDK_ROOT/node_modules" vp run build

# `pm_pack` (vp pm pack / bun pm pack) honors package.json's "files" field
# (so the tarball matches what would actually be published). The version
# suffix in the filename is unstable, so we normalize to
# react-native-onesignal.tgz for a deterministic path that package.json +
# the extract step can reference.
rm -f react-native-onesignal*.tgz
pm_pack
mv react-native-onesignal-*.tgz react-native-onesignal.tgz

cd "$ORIGINAL_DIR"

# Always go through the package manager (vp/bun) so bun.lock's integrity hash
# for the tarball stays in sync with the freshly-built tarball on disk. A
# previous version of this script had a "hot path" that just untarred
# over node_modules directly, which was faster but left a stale sha512
# in bun.lock — any subsequent install that re-resolved this entry
# (e.g. when the lockfile was touched by another dep) would fail with
# IntegrityCheckFailed.
#
# Remove first because bun verifies the existing integrity hash before
# replacing the entry; without removing, a stale hash from a prior build
# causes the add itself to fail. The relative `file:../../...` path is
# intentional — an absolute path would leak this machine's layout into the
# lockfile.
echo "Registering tarball with the package manager (refreshes bun.lock integrity hash)..."
pm_remove react-native-onesignal 2>/dev/null || true
pm_add file:../../react-native-onesignal.tgz

# Record the hash only after a successful build/install so that an
# interrupted run forces a full retry next time.
echo "$src_hash" > "$STAMP_FILE"
