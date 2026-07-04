#!/bin/bash
# Erzeugt 150 nummerierte Platzhalter-Frames (desktop + mobil) für den Scroll-Scrub.
# Die sichtbare Frame-Nummer ist das Test-Instrument für die Scrub-Verifikation.
set -euo pipefail
FF="/Users/hasdemir-illy1/Documents/Claude Projekte/_vendor/bin/ffmpeg"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FONT="/System/Library/Fonts/Helvetica.ttc"
COUNT=150

make_variant() { # $1=size  $2=outdir  $3=fontsize
  local SIZE="$1" OUT="$2" FS="$3"
  mkdir -p "$OUT"
  "$FF" -y -hide_banner -loglevel error \
    -f lavfi -i "gradients=s=${SIZE}:c0=#0a0d10:c1=#141b21:x0=0:y0=0:x1=0:y1=${SIZE#*x}:d=6:speed=0" \
    -vf "drawtext=fontfile=${FONT}:text='%{eif\\:n+1\\:d} / ${COUNT}':fontsize=${FS}:fontcolor=0x4aa3c7:x=(w-text_w)/2:y=(h-text_h)/2,drawtext=fontfile=${FONT}:text='PLATZHALTER — ECHTES FOOTAGE FOLGT':fontsize=28:fontcolor=0x5a6672:x=(w-text_w)/2:y=h-80" \
    -frames:v ${COUNT} -c:v libwebp -quality 78 "${OUT}/f_%04d.webp"
}

make_variant "1600x900" "$ROOT/site/assets/frames/desktop" 150
make_variant "900x1200" "$ROOT/site/assets/frames/mobile" 110
echo "OK: $(ls "$ROOT/site/assets/frames/desktop" | wc -l | tr -d ' ') desktop, $(ls "$ROOT/site/assets/frames/mobile" | wc -l | tr -d ' ') mobile"
