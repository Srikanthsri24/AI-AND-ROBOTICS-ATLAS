#!/bin/zsh
set -e
cd "${0:A:h}"
atlas_node="$(command -v node || true)"
if [[ -z "$atlas_node" ]]; then atlas_node="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"; fi
if [[ ! -x "$atlas_node" ]]; then echo 'Install Node.js 22 or newer, then try again.'; exit 1; fi
if lsof -iTCP:5190 -sTCP:LISTEN >/dev/null 2>&1; then open 'http://127.0.0.1:5190/'; echo 'An app is already running on port 5190.'; exit 0; fi
open 'http://127.0.0.1:5190/'
"$atlas_node" node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5190 --strictPort
