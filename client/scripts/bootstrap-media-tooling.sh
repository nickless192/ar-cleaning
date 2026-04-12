#!/usr/bin/env bash
set -euo pipefail

echo "Checking local media tooling..."

need_cmd() {
  local cmd="$1"
  if command -v "$cmd" >/dev/null 2>&1; then
    echo "✅ $cmd found: $(command -v "$cmd")"
  else
    echo "❌ $cmd missing"
    return 1
  fi
}

missing=0
for cmd in cwebp avifenc; do
  need_cmd "$cmd" || missing=1
done

if command -v chromium >/dev/null 2>&1 || command -v google-chrome >/dev/null 2>&1 || command -v playwright >/dev/null 2>&1; then
  echo "✅ screenshot browser tooling found"
else
  echo "❌ no screenshot browser tooling found"
  missing=1
fi

if [[ "$missing" -eq 0 ]]; then
  echo "All required tools are already installed."
  exit 0
fi

cat <<'EOF'

Install suggestions:

Ubuntu/Debian:
  sudo apt-get update
  sudo apt-get install -y webp libavif-bin chromium-browser

macOS (Homebrew):
  brew install webp libavif
  brew install --cask chromium

Optional Node-based screenshot tooling:
  npm i -D playwright
  npx playwright install chromium

After install, re-run:
  npm run media:bootstrap

EOF

