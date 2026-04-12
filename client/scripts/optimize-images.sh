#!/usr/bin/env bash
set -euo pipefail

if ! command -v cwebp >/dev/null 2>&1; then
  echo "cwebp is required. Run: npm run media:bootstrap"
  exit 1
fi

if ! command -v avifenc >/dev/null 2>&1; then
  echo "avifenc is required. Run: npm run media:bootstrap"
  exit 1
fi

SRC_DIR="${1:-src/assets/img}"
OUT_DIR="${2:-src/assets/img/optimized}"
mkdir -p "$OUT_DIR"

echo "Optimizing images from $SRC_DIR into $OUT_DIR"

find "$SRC_DIR" -maxdepth 1 -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | while read -r file; do
  name="$(basename "$file")"
  stem="${name%.*}"
  webp_out="$OUT_DIR/${stem}.webp"
  avif_out="$OUT_DIR/${stem}.avif"

  cwebp -q 80 -m 6 "$file" -o "$webp_out" >/dev/null
  avifenc --min 24 --max 36 "$file" "$avif_out" >/dev/null 2>&1

  original_size=$(wc -c <"$file")
  webp_size=$(wc -c <"$webp_out")
  avif_size=$(wc -c <"$avif_out")
  echo "$name -> webp:${webp_size}B avif:${avif_size}B (original:${original_size}B)"
done

echo "Done."

