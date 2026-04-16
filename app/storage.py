import json
import os
from datetime import date, datetime
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
