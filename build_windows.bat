@echo off
echo Building Typist for Windows...

pip install pyinstaller --quiet

rmdir /s /q build dist 2>nul

pyinstaller ^
  --windowed ^
  --name "Typist" ^
  --add-data "ui;ui" ^
  --icon assets\icon.ico ^
  --hidden-import webview ^
  --hidden-import supabase ^
  main.py

echo Done. Find installer at dist\Typist\Typist.exe
