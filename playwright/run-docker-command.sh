#!/usr/bin/env bash

set -euo pipefail

IMAGE_NAME="mcr.microsoft.com/playwright"
IMAGE_TAG="v1.56.1-jammy" # This version have to be synchronized with playwright version from package.json

NODE_MODULES_CACHE_DIR="$HOME/.cache/aikit-playwright-docker-node-modules"

command_exists() {
  command -v "$*" >/dev/null 2>&1
}

run_command() {
  # Allocate a TTY only when one is attached. `docker run -t` aborts with
  # "the input device is not a TTY" in CI and other non-interactive shells,
  # so the flag is added conditionally to keep the script working everywhere.
  # A plain string (not an array) is used on purpose: expanding an empty array
  # under `set -u` errors on bash < 4.4, which macOS still ships by default.
  local tty_flag=""
  if [ -t 0 ]; then
    tty_flag="-t"
  fi

  # Pass the command as separate argv entries (`"$@"`, run directly) instead of
  # joining them with `bash -c "$*"`. The latter collapses arguments on spaces
  # and drops quoting, so a multi-word value like `--grep "a b c"` would break.
  $CONTAINER_TOOL run --rm --network host -i $tty_flag -w /work \
    -v "$(pwd):/work" \
    -v "$NODE_MODULES_CACHE_DIR:/work/node_modules" \
    -e IS_DOCKER=1 \
    "$IMAGE_NAME:$IMAGE_TAG" \
    "$@"
}

if command_exists docker; then
  CONTAINER_TOOL="docker"
elif command_exists podman; then
  CONTAINER_TOOL="podman"
else
  echo "Neither Docker nor Podman is installed on the system."
  exit 1
fi

if [[ "${1:-}" = "clear-cache" ]]; then
  rm -rf "$NODE_MODULES_CACHE_DIR"
  rm -rf "./playwright/.cache"
  exit 0
fi

if [[ ! -d "$NODE_MODULES_CACHE_DIR" ]]; then
  mkdir -p "$NODE_MODULES_CACHE_DIR"
  run_command npm ci
fi

run_command "$@"
