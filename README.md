# Typist — Daily Typing Practice

**A lightweight, offline-first desktop app for short daily typing practice.**  
Designed to feel like a frictionless morning habit: open your laptop, type for a minute or two, then move on—while tracking speed, accuracy, and improvement over time.

---

## Overview

Typist is a **native-feeling window** (pywebview) wrapped around a **minimal web UI** (HTML + CSS + vanilla JavaScript). There is **no server**, **no account**, and **no network**. Session data lives in plain JSON on disk so the app stays fast, private, and easy to maintain.

**Goals**

- **Default session under ~2 minutes** — short enough to run every day without guilt.
- **Automatic launch** — optional macOS LaunchAgent / Windows `Run` registry entry so practice opens at login.
- **Progress you can see** — WPM trend chart, streaks, and optional analytics on which keys trip you up.
- **Adaptive difficulty** — difficulty tier follows a rolling average of recent performance; sessions can also **inject weak characters** into generated text so practice targets weak spots.

---

## Problem & Solution

| Problem | Approach |
|--------|----------|
| Typing tutors are heavy, web-only, or full of ads | Single-purpose desktop app; runs offline; no browser tab clutter |
| Hard to build a daily habit | Streaks, short sessions, optional startup launch, skip shortcuts |
| Progress feels invisible | Local history + 30-day WPM chart + optional per-key error stats |
| One size doesn’t fit all | Multiple modes, custom text, case/punctuation/session length settings |

---

## Features

### Core experience

- **Clean minimal UI** with **dark** and **light** themes.
- **Live metrics** while typing: **WPM**, **accuracy %**, **elapsed time**.
- **Mistake highlighting** — incorrect characters are highlighted in real time.
- **Auto-focus** — the typing field is ready as soon as the window opens.
- **Skip** — **Escape** or “Skip” to exit without a long flow when you’re busy.

### Practice modes

- **Real sentences** — curated quotes / sentence-style passages.
- **Common words** — high-frequency English words.
- **Programming syntax** — short snippets (JS/Python-style lines).
- **Custom text** — paste your own material (passages, notes, docs).
- **Adaptive drill** (API) — heavier emphasis on characters you’ve mistyped recently.
- **Speed test** (API) — longer passage for a **60-second** speed measurement (no character adaptation).

### Progress & motivation

- **30-day WPM chart** — smooth canvas-based line chart (no charting library).
- **Daily streak** — consecutive days with a completed session.
- **Quote of the day** — deterministic per calendar day so it’s stable but fresh each day.
- **Sound feedback** (optional) — keystroke / error / completion tones via **Web Audio API** (no audio files).

### Intelligence & personalization

- **Adaptive difficulty** — Beginner / Intermediate / Advanced from a **rolling 7-day average WPM**.
- **Problem-character awareness** — recent sessions store **per-key error counts**; normal sessions can **mix those characters** into generated text (except programming mode, to preserve syntax).
- **Analytics API** — aggregate key-error stats and accuracy history for dashboards or future UI.

### System integration

- **`setup_autostart.py`** — registers **macOS** LaunchAgent (`~/Library/LaunchAgents/`) or **Windows** `HKCU\...\Run\`; prefers `.venv` Python when present.
- **`run.sh`** — launches the app with the project virtual environment.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| **Shell / runtime** | Python 3.10+ |
| **Desktop host** | [pywebview](https://pywebview.flowrl.com/) — native window + WebKit/Edge/CEF backend |
| **UI** | **Vanilla** HTML, CSS, JavaScript (no React/Vue; minimal bundle, instant load) |
| **Graphics** | HTML5 Canvas for charts |
| **Audio** | Web Audio API (oscillators; no external assets) |
| **Persistence** | JSON files under `~/.typist/` |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  main.py                                                 │
│  pywebview.create_window( js_api=Api )                   │
└──────────────────────────┬──────────────────────────────┘
                           │
         ┌─────────────────▼─────────────────┐
         │  app/api.py — Api class              │
         │  JSON in/out over JS bridge          │
         └─────────────────┬─────────────────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    ▼                      ▼                      ▼
app/content.py      app/difficulty.py      app/storage.py
text generation     tier from rolling WPM   sessions, streak,
+ adaptation        + labels                  settings, JSON
```

- **Frontend** (`ui/`) calls `window.pywebview.api.*` methods; responses are JSON strings.
- **Backend** (`app/`) keeps generation logic and file I/O on the Python side so the same rules apply to CLI or future packaging.

---

## Repository Layout

```
.
├── main.py                 # Entry: window + pywebview.start()
├── run.sh                  # Run with project .venv (chmod +x)
├── setup_autostart.py      # Register / unregister login startup
├── requirements.txt
├── app/
│   ├── api.py              # JS-exposed API (sessions, dashboard, analytics)
│   ├── content.py          # Text generation + modes + adaptation hooks
│   ├── difficulty.py     # Adaptive tier from recent WPM
│   └── storage.py          # ~/.typist/data.json, settings.json
├── ui/
│   ├── index.html
│   ├── styles.css
│   └── app.js              # Typing engine, charts, routing, sound
└── assets/words/
    ├── common.txt
    ├── programming.txt
    └── quotes.txt
```

---

## Setup

### 1. Clone and install

```bash
cd /path/to/typist
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Run

```bash
python main.py
# or
./run.sh
```

### 3. Debug mode (optional)

```bash
python main.py --debug
```

### 4. Auto-launch at login (optional, run once)

```bash
python setup_autostart.py
```

Remove:

```bash
python setup_autostart.py --remove
```

**Note:** macOS LaunchAgents point at a specific Python path and `main.py`. If you move the project folder, re-run `setup_autostart.py` from the new location.

---

## Data & Privacy

All data is **local** under `~/.typist/`:

| File | Purpose |
|------|---------|
| `data.json` | Session history, streaks, per-session key error stats |
| `settings.json` | Mode, theme, sound, autostart preference, custom text, etc. |

There is **no login**, **no cloud sync**, and **no telemetry** in this README’s scope.

---

## API Surface (Python → JS)

The `Api` class exposes methods consumed by the frontend (e.g. `get_dashboard`, `start_session`, `finish_session`, `get_settings`, `update_settings`). Additional methods such as `start_adaptive_session`, `start_speed_test`, and `get_analytics` support richer flows and future UI.

---

## Requirements

- **Python** 3.10+
- **pywebview** ≥ 4.4 (see `requirements.txt`)
- **macOS** or **Windows** (Linux generally works with pywebview + GTK/WebKit; autostart script is tailored for macOS/Windows)

---

## Portfolio Use

This project demonstrates:

- **Desktop app packaging** without Electron’s full stack weight.
- **Python ↔ JavaScript bridge** design for a thin native shell + rich UI.
- **Offline-first** persistence and **privacy-by-default** design.
- **Product thinking**: streaks, short sessions, skip paths, and adaptive difficulty.
- **Performance-conscious UI**: no SPA framework, canvas charts, synthesized audio.

---

## Possible Extensions

- PyInstaller / briefcase bundle for a double-click `.app` / `.exe`
- Optional sync to iCloud/Dropbox (user-owned)
- More languages and keyboard layouts
- Export history as CSV

---

## License

Specify your license here (e.g. MIT) if you publish the repo publicly.
