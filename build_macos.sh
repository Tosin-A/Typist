#!/bin/bash
set -e

echo "▸ Building Typist.app for macOS…"

# Use the venv Python locally; fall back to system python3 in CI
if [ -f ".venv/bin/python3" ]; then
  PYTHON=".venv/bin/python3"
else
  PYTHON="python3"
fi

# Install PyInstaller into the venv if needed
$PYTHON -m pip install pyinstaller --quiet

# Clean previous build
rm -rf build dist

$PYTHON -m PyInstaller \
  --windowed \
  --name "Typist" \
  --add-data "ui:ui" \
  --add-data "assets/words:assets/words" \
  --icon "assets/icon.icns" \
  --hidden-import webview \
  --hidden-import webview.platforms.cocoa \
  --hidden-import supabase \
  --hidden-import supabase._sync.client \
  --hidden-import postgrest \
  --hidden-import gotrue \
  --hidden-import httpx \
  --noconfirm \
  main.py

echo ""
echo "▸ Signing app…"
# Strip all extended attributes (quarantine, resource forks, etc.)
xattr -cr "dist/Typist.app"
# Ad-hoc sign (no Apple Developer account needed)
codesign --force --deep --sign - "dist/Typist.app"
# Remove quarantine flag so macOS doesn't block the app on first launch
xattr -d com.apple.quarantine "dist/Typist.app" 2>/dev/null || true

echo ""
echo "▸ Creating DMG…"
hdiutil create \
  -volname "Typist" \
  -srcfolder "dist/Typist.app" \
  -ov -format UDZO \
  "dist/Typist.dmg"

echo ""
echo "✓ Done."
echo "  App  →  dist/Typist.app"
echo "  DMG  →  dist/Typist.dmg"
echo ""
echo "To install: open dist/Typist.dmg and drag Typist to /Applications"
