#!/usr/bin/env bash
# Rebuild the static JupyterLite site in lite/ from content/*.ipynb.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -x .venv/bin/jupyter ]]; then
  python3 -m venv .venv
  .venv/bin/pip install -r requirements-lite.txt
fi

.venv/bin/jupyter lite build \
  --lite-dir . \
  --output-dir lite \
  --contents content \
  --apps lab \
  --no-sourcemaps \
  --force
