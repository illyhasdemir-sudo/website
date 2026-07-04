#!/bin/bash
# Extrahiert exakt N gleichverteilte WebP-Frames aus einem fertigen Video.
# Usage: extract-frames.sh <input.mp4> <outdir> <WxH> [count=150]
set -euo pipefail
FF="/Users/hasdemir-illy1/Documents/Claude Projekte/_vendor/bin/ffmpeg"
FP="/Users/hasdemir-illy1/Documents/Claude Projekte/_vendor/bin/ffprobe"
IN="$1"; OUT="$2"; SIZE="$3"; COUNT="${4:-150}"
W="${SIZE%x*}"; H="${SIZE#*x}"
mkdir -p "$OUT"

TOTAL=$("$FP" -v error -select_streams v:0 -count_packets -show_entries stream=nb_read_packets -of csv=p=0 "$IN")
# COUNT Frames GLEICHVERTEILT ueber die volle Laenge (inkl. Ende), cover-croppen
"$FF" -y -hide_banner -loglevel error -i "$IN" \
  -vf "select='gt(floor((n+1)*${COUNT}/${TOTAL})\\,floor(n*${COUNT}/${TOTAL}))',scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}" \
  -vsync vfr -frames:v "$COUNT" -c:v libwebp -quality 82 "${OUT}/f_%04d.webp"

GOT=$(ls "$OUT"/f_*.webp | wc -l | tr -d ' ')
echo "OK: ${GOT} Frames aus ${TOTAL} (Ziel ${COUNT}) -> ${OUT}"
[ "$GOT" -eq "$COUNT" ] || { echo "WARNUNG: Anzahl weicht ab"; exit 1; }
