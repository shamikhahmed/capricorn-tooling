#!/usr/bin/env bash
# Copy the shared gallery viewer into an app repo root.
# Usage: ./copy-into-app.sh /path/to/AppRepo
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="${1:-.}"
DEST="$(cd "$DEST" && pwd)"
cp "$SRC/screen-gallery.html" "$SRC/screen-gallery.css" "$SRC/screen-gallery.js" "$DEST/"
echo "Installed screen-gallery.{html,css,js} → $DEST"
echo "Expect gallery-manifest.json at $DEST/docs/screenshots/gallery/"
echo "View: (cd \"$DEST\" && python3 -m http.server 4173) → /screen-gallery.html"
