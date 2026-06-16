#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
INSTALL_ROOT="${CODEX_PLUS_INSTALL_ROOT:-/Applications}"
PROFILE="${CODEX_PLUS_PROFILE:-debug}"
MODE="${1:-launcher}"

usage() {
  cat <<'USAGE'
Usage:
  scripts/dev/sync-macos-app.sh [launcher|manager|all]

Environment:
  CODEX_PLUS_PROFILE=debug|release       Cargo profile to build. Default: debug.
  CODEX_PLUS_INSTALL_ROOT=/Applications  App install root. Default: /Applications.
  CODEX_PLUS_SKIP_BUILD=1                Copy existing target binary without rebuilding.

Examples:
  scripts/dev/sync-macos-app.sh
  CODEX_PLUS_PROFILE=release scripts/dev/sync-macos-app.sh all
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "error: this script only supports macOS" >&2
  exit 1
fi

case "$PROFILE" in
  debug)
    TARGET_PROFILE="debug"
    CARGO_PROFILE_ARGS=()
    ;;
  release)
    TARGET_PROFILE="release"
    CARGO_PROFILE_ARGS=(--release)
    ;;
  *)
    echo "error: CODEX_PLUS_PROFILE must be debug or release, got: $PROFILE" >&2
    exit 1
    ;;
esac

build_launcher() {
  if [[ "${CODEX_PLUS_SKIP_BUILD:-}" == "1" ]]; then
    return
  fi
  (cd "$ROOT" && cargo build -p codex-plus-launcher "${CARGO_PROFILE_ARGS[@]}")
}

build_manager() {
  if [[ "${CODEX_PLUS_SKIP_BUILD:-}" == "1" ]]; then
    return
  fi
  (cd "$ROOT/apps/codex-plus-manager" && npm run vite:build)
  (cd "$ROOT" && cargo build -p codex-plus-manager "${CARGO_PROFILE_ARGS[@]}")
}

sync_binary() {
  local app_name="$1"
  local executable_name="$2"
  local source_binary="$3"
  local app_dir="$INSTALL_ROOT/$app_name.app"
  local target_binary="$app_dir/Contents/MacOS/$executable_name"

  if [[ ! -d "$app_dir" ]]; then
    echo "error: app bundle not found: $app_dir" >&2
    exit 1
  fi
  if [[ ! -x "$source_binary" ]]; then
    echo "error: source binary not found or not executable: $source_binary" >&2
    exit 1
  fi

  echo "sync: $source_binary -> $target_binary"
  install -m 755 "$source_binary" "$target_binary"

  echo "codesign: $app_dir"
  codesign --force --sign - "$target_binary"
  codesign --force --sign - "$app_dir"
  codesign -dv "$app_dir" >/dev/null 2>&1
}

sync_launcher() {
  build_launcher
  sync_binary \
    "Codex++" \
    "CodexPlusPlus" \
    "$ROOT/target/$TARGET_PROFILE/codex-plus-plus"
}

sync_manager() {
  build_manager
  sync_binary \
    "Codex++ 管理工具" \
    "CodexPlusPlusManager" \
    "$ROOT/target/$TARGET_PROFILE/codex-plus-plus-manager"
}

case "$MODE" in
  launcher)
    sync_launcher
    ;;
  manager)
    sync_manager
    ;;
  all)
    sync_launcher
    sync_manager
    ;;
  *)
    usage >&2
    exit 1
    ;;
esac

echo "done: synced $MODE app(s) into $INSTALL_ROOT"
