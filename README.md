# Typist — Daily Typing Practice

**A lightweight desktop app for structured, daily typing practice.**  
Short sessions. Adaptive difficulty. XP, levels, and a global leaderboard.

---

## Download

Go to the [**Releases**](https://github.com/Tosin-A/Typist/releases) page and download the file for your platform.

| Platform | File |
|----------|------|
| macOS | `Typist.dmg` |
| Windows | `Typist.exe` |

---

## Install

### macOS

1. Open `Typist.dmg`
2. Drag **Typist** into your **Applications** folder
3. Open **Finder → Applications**, right-click **Typist** → **Open**
4. Click **Open** in the security dialog (required once — macOS flags apps not distributed through the App Store)

> After the first launch you can open Typist normally from Applications or Spotlight.

### Windows

1. Double-click `Typist.exe`
2. If Windows SmartScreen appears, click **More info** → **Run anyway**
   (this appears for unsigned apps — it's a one-time prompt)
3. Typist opens immediately — no installer needed

---

## Launch at startup (optional)

Typist can open automatically each morning so it's ready when you sit down.

### macOS

```bash
# Clone or navigate to the project folder, then:
python setup_autostart.py              # launches at 8:00 AM by default
python setup_autostart.py --time 07:30 # custom time
python setup_autostart.py --remove     # unregister
```

### Windows

```bash
python setup_autostart.py
python setup_autostart.py --remove
```

This registers a scheduled task (Task Scheduler) that opens Typist daily at the chosen time, or on first wake if the machine was asleep.

> If you move the app, re-run `setup_autostart.py` from the new location to update the path.

---

## First launch

1. **Pick a username** — used on the leaderboard (3–20 chars, letters/numbers/underscores)
2. **Baseline test** — a short 30-second typing sample to calibrate your starting difficulty
3. **Track recommendation** — Typist suggests General or Developer track based on your speed
4. You land on the **Learn** screen, ready to start Lesson 1

---

## What's inside

### Curriculum
- **General track** (20 lessons) — sentences and common words, progressing from beginner to advanced
- **Developer track** (15 lessons) — symbols, brackets, real code patterns
- **Code track** (10 lessons) — Python, JavaScript, and terminal/Git commands
- Lessons unlock in sequence; targets adapt to your baseline WPM

### Gamification
- **XP** earned every session — more for lessons, speed tests, and hitting targets
- **Levels** (1–100) and **Ranks** — Novice → Apprentice → Practitioner → Expert → Master → Legend
- **14 badges** — streaks, WPM milestones, track completion, leaderboard placement

### Practice modes
- **Sentences** — curated passages
- **Common words** — high-frequency English
- **Programming syntax** — JS/Python-style snippets
- **Custom text** — paste your own material
- **Adaptive drill** — weighted toward characters you mistype most
- **Speed test** — 60-second timed run

### Progress
- 30-day WPM trend chart
- Per-key error heatmap
- Daily streak
- Global and friends leaderboard

---

## Updates

When a new version is released, a banner appears inside the app with a download link. Click **Download update** to open the Releases page, then follow the install steps above.

---

## Run from source

For developers or if you prefer not to use the packaged app.

**Requirements:** Python 3.10+, macOS or Windows

```bash
git clone https://github.com/Tosin-A/Typist.git
cd Typist
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Debug mode (opens browser devtools):

```bash
python main.py --debug
```

---

## Data & privacy

All data is stored locally under `~/.typist/`:

| File | Contents |
|------|----------|
| `data.json` | Sessions, streaks, XP, badges, lesson progress |
| `settings.json` | Mode, theme, sound, session length, custom text |

Leaderboard scores sync to a cloud database only when you complete a session and have an internet connection. No personal data beyond your chosen username is ever transmitted.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Shell | Python 3.10+ |
| Desktop host | [pywebview](https://pywebview.flowrl.com/) — native window, no Electron |
| UI | Vanilla HTML / CSS / JavaScript |
| Charts | HTML5 Canvas |
| Audio | Web Audio API (no audio files) |
| Local storage | JSON under `~/.typist/` |
| Cloud | Supabase (leaderboard only) |

---

## License

MIT
