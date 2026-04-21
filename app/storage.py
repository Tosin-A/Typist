import json
import os
from datetime import date, datetime, timedelta
from typing import Any

DATA_DIR = os.path.join(os.path.expanduser("~"), ".typist")
DATA_FILE = os.path.join(DATA_DIR, "data.json")
SETTINGS_FILE = os.path.join(DATA_DIR, "settings.json")

DEFAULT_SETTINGS = {
    "mode": "sentences",
    "dark_mode": True,
    "sound_enabled": True,
    "autostart_enabled": True,
    "custom_text": "",
    "target_duration_seconds": 90,
    # new settings
    "text_case": "sentence",     # "lower" | "sentence" | "upper"
    "punctuation": True,         # include punctuation in text
    "session_length": "medium",  # "short" | "medium" | "long"
}

DEFAULT_DATA = {
    "sessions": [],
    "streak": 0,
    "last_session_date": None,
    # v2.0 additions
    "user": None,
    "xp": 0,
    "badges": [],
    "lessons_completed": {},
    "friends": [],
}


def _ensure_dir() -> None:
    os.makedirs(DATA_DIR, exist_ok=True)


def _read_json(path: str, default: dict) -> dict:
    _ensure_dir()
    if not os.path.exists(path):
        return dict(default)
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return dict(default)


def _write_json(path: str, data: dict) -> None:
    _ensure_dir()
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)


def load_settings() -> dict:
    settings = _read_json(SETTINGS_FILE, DEFAULT_SETTINGS)
    for key, value in DEFAULT_SETTINGS.items():
        settings.setdefault(key, value)
    return settings


def save_settings(settings: dict) -> None:
    current = load_settings()
    current.update(settings)
    _write_json(SETTINGS_FILE, current)


def load_data() -> dict:
    data = _read_json(DATA_FILE, DEFAULT_DATA)
    for key, value in DEFAULT_DATA.items():
        data.setdefault(key, value)
    return data


def save_session(session: dict) -> dict:
    data = load_data()
    today = str(date.today())
    session["date"] = today
    session["timestamp"] = datetime.now().isoformat()

    data["sessions"].append(session)

    last = data.get("last_session_date")
    if last is None:
        data["streak"] = 1
    else:
        try:
            last_date = date.fromisoformat(last)
            delta = (date.today() - last_date).days
            if delta == 0:
                pass
            elif delta == 1:
                data["streak"] = data.get("streak", 0) + 1
            else:
                data["streak"] = 1
        except ValueError:
            data["streak"] = 1

    data["last_session_date"] = today
    _write_json(DATA_FILE, data)
    return data


def get_progress(days: int = 30) -> list[dict]:
    data = load_data()
    sessions = data.get("sessions", [])
    today = date.today()
    result: dict[str, list[float]] = {}

    for s in sessions:
        try:
            d = date.fromisoformat(s["date"])
        except (KeyError, ValueError):
            continue
        if (today - d).days > days:
            continue
        key = str(d)
        result.setdefault(key, [])
        result[key].append(float(s.get("wpm", 0)))

    return [
        {"date": k, "wpm": round(sum(v) / len(v), 1)}
        for k, v in sorted(result.items())
    ]


def get_streak() -> int:
    data = load_data()
    last = data.get("last_session_date")
    if last is None:
        return 0
    try:
        delta = (date.today() - date.fromisoformat(last)).days
        if delta > 1:
            return 0
        return data.get("streak", 0)
    except ValueError:
        return 0


def get_last_wpm() -> float:
    data = load_data()
    sessions = data.get("sessions", [])
    if not sessions:
        return 0.0
    return float(sessions[-1].get("wpm", 0))


def get_key_error_stats(sessions: int = 30) -> dict:
    """Aggregate per-character error counts from recent sessions."""
    data = load_data()
    recent = data.get("sessions", [])[-sessions:]
    totals: dict[str, int] = {}
    for s in recent:
        for key, count in s.get("key_errors", {}).items():
            if key and len(key) == 1:
                totals[key] = totals.get(key, 0) + int(count)
    return totals


def get_accuracy_history(days: int = 30) -> list[dict]:
    """Return average accuracy per day for the last N days."""
    data = load_data()
    sessions = data.get("sessions", [])
    today = date.today()
    result: dict[str, list[float]] = {}
    for s in sessions:
        try:
            d = date.fromisoformat(s["date"])
        except (KeyError, ValueError):
            continue
        if (today - d).days > days:
            continue
        key = str(d)
        result.setdefault(key, [])
        result[key].append(float(s.get("accuracy", 100)))
    return [
        {"date": k, "accuracy": round(sum(v) / len(v), 1)}
        for k, v in sorted(result.items())
    ]


def get_weekly_progress() -> list[dict]:
    """Return WPM and accuracy averaged by ISO week, all-time, for the trend chart."""
    data = load_data()
    sessions = data.get("sessions", [])
    weeks: dict[str, dict] = {}
    for s in sessions:
        try:
            d = date.fromisoformat(s["date"])
        except (KeyError, ValueError):
            continue
        iso = d.isocalendar()
        key = f"{iso.year}-W{iso.week:02d}"
        week_start = (d - timedelta(days=d.weekday())).isoformat()
        if key not in weeks:
            weeks[key] = {"week": key, "week_start": week_start, "wpms": [], "accs": [], "sessions": 0}
        weeks[key]["wpms"].append(float(s.get("wpm", 0)))
        weeks[key]["accs"].append(float(s.get("accuracy", 0)))
        weeks[key]["sessions"] += 1
    return [
        {
            "week": v["week"],
            "week_start": v["week_start"],
            "wpm": round(sum(v["wpms"]) / len(v["wpms"]), 1),
            "accuracy": round(sum(v["accs"]) / len(v["accs"]), 1),
            "sessions": v["sessions"],
        }
        for v in sorted(weeks.values(), key=lambda x: x["week"])
    ]


def get_weekly_summary() -> dict:
    """Compare this week vs last week across WPM, accuracy, and session count."""
    data = load_data()
    sessions = data.get("sessions", [])
    today = date.today()
    this_monday = today - timedelta(days=today.weekday())
    last_monday = this_monday - timedelta(weeks=1)

    def _bucket(sessions, start, end):
        wpms, accs, count = [], [], 0
        for s in sessions:
            try:
                d = date.fromisoformat(s["date"])
            except (KeyError, ValueError):
                continue
            if start <= d < end:
                wpms.append(float(s.get("wpm", 0)))
                accs.append(float(s.get("accuracy", 0)))
                count += 1
        return {
            "sessions": count,
            "avg_wpm": round(sum(wpms) / len(wpms), 1) if wpms else 0,
            "avg_accuracy": round(sum(accs) / len(accs), 1) if accs else 0,
            "best_wpm": round(max(wpms), 1) if wpms else 0,
        }

    this_week = _bucket(sessions, this_monday, today + timedelta(days=1))
    last_week = _bucket(sessions, last_monday, this_monday)

    def _delta(curr, prev):
        if prev == 0:
            return None
        return round(curr - prev, 1)

    return {
        "this_week": this_week,
        "last_week": last_week,
        "wpm_delta":      _delta(this_week["avg_wpm"],      last_week["avg_wpm"]),
        "accuracy_delta": _delta(this_week["avg_accuracy"],  last_week["avg_accuracy"]),
        "sessions_delta": this_week["sessions"] - last_week["sessions"],
    }


def get_milestones() -> list[dict]:
    """Return key moments: first session, each WPM threshold first reached, best streak."""
    data = load_data()
    sessions = data.get("sessions", [])
    if not sessions:
        return []

    milestones = []
    wpm_thresholds = [20, 30, 40, 50, 60, 70, 80, 90, 100, 120]
    hit = set()

    for s in sorted(sessions, key=lambda x: x.get("date", "")):
        wpm  = float(s.get("wpm", 0))
        d    = s.get("date", "")
        if not d:
            continue

        if not hit and len(sessions) >= 1:
            milestones.append({"date": d, "type": "first_session",
                                "label": "First session", "value": int(wpm)})
            hit.add("first")

        for t in wpm_thresholds:
            key = f"wpm_{t}"
            if key not in hit and wpm >= t:
                milestones.append({"date": d, "type": "wpm_milestone",
                                    "label": f"First {t} WPM", "value": t})
                hit.add(key)

    # Best ever WPM
    if sessions:
        best = max(sessions, key=lambda x: float(x.get("wpm", 0)))
        milestones.append({"date": best.get("date", ""), "type": "best_wpm",
                            "label": "Personal best", "value": int(float(best.get("wpm", 0)))})

    return milestones


def get_progression_summary() -> dict:
    """High-level summary: baseline vs now, total improvement."""
    data = load_data()
    sessions = data.get("sessions", [])
    user     = data.get("user") or {}
    baseline = user.get("baseline_wpm", 0)

    if not sessions:
        return {"baseline_wpm": baseline, "current_wpm": 0, "best_wpm": 0,
                "improvement": 0, "total_sessions": 0, "days_active": 0}

    sorted_sessions = sorted(sessions, key=lambda x: x.get("date", ""))
    first_wpm = float(sorted_sessions[0].get("wpm", 0))
    # Use last 5 sessions avg as "current"
    recent = sorted_sessions[-5:]
    current_wpm = round(sum(float(s.get("wpm", 0)) for s in recent) / len(recent), 1)
    best_wpm = round(max(float(s.get("wpm", 0)) for s in sessions), 1)
    start = baseline if baseline > 0 else first_wpm
    improvement = round(current_wpm - start, 1)

    dates = set()
    for s in sessions:
        if s.get("date"):
            dates.add(s["date"])

    return {
        "baseline_wpm": round(start, 1),
        "first_wpm":    round(first_wpm, 1),
        "current_wpm":  current_wpm,
        "best_wpm":     best_wpm,
        "improvement":  improvement,
        "total_sessions": len(sessions),
        "days_active":    len(dates),
    }
