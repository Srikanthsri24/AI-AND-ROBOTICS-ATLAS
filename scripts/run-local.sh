#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
if ! command -v node >/dev/null 2>&1; then
  bundled="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin"
  if [ -x "$bundled/node" ]; then PATH="$bundled:$PATH"; export PATH; else echo 'Install Node.js 24 or newer first.'; exit 1; fi
fi
if [ ! -d node_modules ]; then
  if command -v npm >/dev/null 2>&1; then npm install; else echo 'Run npm install with a standard Node.js installation first.'; exit 1; fi
fi
exec node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5190
