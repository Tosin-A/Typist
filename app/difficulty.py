from app.storage import load_data, get_last_wpm


THRESHOLDS = {
    "beginner": (0, 35),
    "intermediate": (35, 65),
    "advanced": (65, float("inf")),
}


def _rolling_average_wpm(sessions: int = 7) -> float:
    data = load_data()
    recent = data.get("sessions", [])[-sessions:]
    if not recent:
        return 0.0
    return sum(s.get("wpm", 0) for s in recent) / len(recent)


def get_current_difficulty() -> str:
    avg = _rolling_average_wpm()
    if avg == 0:
        return "beginner"
    for level, (low, high) in THRESHOLDS.items():
        if low <= avg < high:
            return level
    return "advanced"


def get_difficulty_info() -> dict:
    avg = _rolling_average_wpm()
    level = get_current_difficulty()
    targets = {
        "beginner": {"wpm_target": 35, "label": "Beginner"},
        "intermediate": {"wpm_target": 65, "label": "Intermediate"},
        "advanced": {"wpm_target": 90, "label": "Advanced"},
    }
    info = targets[level]
    progress_pct = 0
    low, high = THRESHOLDS[level]
    if high != float("inf") and avg > 0:
        progress_pct = min(100, int(((avg - low) / (high - low)) * 100))
    return {
        "level": level,
        "label": info["label"],
        "avg_wpm": round(avg, 1),
        "wpm_target": info["wpm_target"],
        "progress_to_next": progress_pct,
    }
