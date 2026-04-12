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
RESPONSIVE_WIDTHS="${3:-}"
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

if [[ -n "$RESPONSIVE_WIDTHS" ]]; then
  echo "Generating responsive variants for widths: $RESPONSIVE_WIDTHS"
  find "$SRC_DIR" -maxdepth 1 -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | while read -r file; do
    name="$(basename "$file")"
    stem="${name%.*}"

    IFS=',' read -ra widths <<< "$RESPONSIVE_WIDTHS"
    for width in "${widths[@]}"; do
      width="$(echo "$width" | xargs)"
      [[ -z "$width" ]] && continue

      tmp_webp="$(mktemp "/tmp/${stem}-${width}-XXXXXX.webp")"
      webp_out="$OUT_DIR/${stem}-${width}.webp"
      avif_out="$OUT_DIR/${stem}-${width}.avif"

      cwebp -q 80 -m 6 -resize "$width" 0 "$file" -o "$tmp_webp" >/dev/null
      mv "$tmp_webp" "$webp_out"
      avifenc --min 24 --max 36 "$webp_out" "$avif_out" >/dev/null 2>&1

      webp_size=$(wc -c <"$webp_out")
      avif_size=$(wc -c <"$avif_out")
      echo "$name @${width}px -> webp:${webp_size}B avif:${avif_size}B"
    done
  done
fi

echo "Done."
