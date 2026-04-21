from app.storage import DATA_FILE, _write_json, load_data

# ── Rank thresholds (total XP → rank name) ────────────────────
RANKS = [
    (25000, "Legend"),
    (12000, "Master"),
    (5000,  "Expert"),
    (2000,  "Practitioner"),
    (500,   "Apprentice"),
    (0,     "Novice"),
]

# ── Badge definitions ─────────────────────────────────────────
BADGES = [
    {"id": "first_session",    "name": "First Keystroke",  "desc": "Complete your first session",         "icon": "⌨️"},
    {"id": "streak_3",         "name": "Three-Peat",       "desc": "3 days in a row",                     "icon": "🔥"},
    {"id": "streak_7",         "name": "Week Warrior",     "desc": "7-day streak",                        "icon": "📅"},
    {"id": "streak_30",        "name": "Habit Locked",     "desc": "30-day streak",                       "icon": "🏆"},
    {"id": "wpm_40",           "name": "Getting Fast",     "desc": "Hit 40 WPM in a session",             "icon": "⚡"},
    {"id": "wpm_60",           "name": "Speed Typist",     "desc": "Hit 60 WPM in a session",             "icon": "🚀"},
    {"id": "wpm_80",           "name": "Rapid Fire",       "desc": "Hit 80 WPM in a session",             "icon": "💨"},
    {"id": "wpm_100",          "name": "Century",          "desc": "Hit 100 WPM in a session",            "icon": "💯"},
    {"id": "perfect_accuracy", "name": "Flawless",         "desc": "100% accuracy in a session",          "icon": "✨"},
    {"id": "track_general",    "name": "Well Rounded",     "desc": "Complete the General track",          "icon": "🎓"},
    {"id": "track_developer",  "name": "Code Fingers",     "desc": "Complete the Developer track",        "icon": "💻"},
    {"id": "first_code",       "name": "Syntax Wizard",    "desc": "Type through a code drill",           "icon": "🧙"},
    {"id": "top_100",          "name": "Top 100",          "desc": "Reach top 100 on the leaderboard",    "icon": "🏅"},
    {"id": "first_friend",     "name": "Social Typist",    "desc": "Add your first friend",               "icon": "👥"},
]

BADGE_MAP = {b["id"]: b for b in BADGES}

XP_PER_LEVEL = 150


# ── Core functions ─────────────────────────────────────────────

def get_rank(total_xp: int) -> str:
    for threshold, name in RANKS:
        if total_xp >= threshold:
            return name
    return "Novice"


def get_level(total_xp: int) -> int:
    return min(100, max(1, total_xp // XP_PER_LEVEL + 1))


def get_level_progress(total_xp: int) -> dict:
    level = get_level(total_xp)
    xp_floor = (level - 1) * XP_PER_LEVEL
    xp_ceiling = level * XP_PER_LEVEL
    xp_in_level = total_xp - xp_floor
    xp_needed = xp_ceiling - xp_floor
    pct = min(100, int((xp_in_level / xp_needed) * 100))
    return {
        "level": level,
        "xp_in_level": xp_in_level,
        "xp_to_next": max(0, xp_needed - xp_in_level),
        "pct": pct,
        "total_xp": total_xp,
    }


def calculate_xp(
    wpm: int,
    accuracy: int,
    mode: str,
    is_lesson: bool = False,
    hit_target: bool = False,
) -> int:
    base = max(1, wpm) * (max(0, accuracy) / 100)
    mode_mult = {
        "lesson":     2.0,
        "speed_test": 1.3,
        "adaptive":   1.2,
        "key_drill":  1.1,
    }.get(mode, 1.0)
    target_mult = 1.5 if hit_target else 1.0
    lesson_mult = 2.0 if is_lesson else 1.0
    return max(1, int(base * mode_mult * target_mult * lesson_mult))


def check_new_badges(session: dict, data: dict) -> list[str]:
    """Return list of newly earned badge IDs given session result + full data."""
    earned = set(data.get("badges", []))
    new_badges: list[str] = []

    wpm       = session.get("wpm", 0)
    accuracy  = session.get("accuracy", 0)
    mode      = session.get("mode", "")
    streak    = data.get("streak", 0)
    sessions  = data.get("sessions", [])
    lessons   = data.get("lessons_completed", {})
    friends   = data.get("friends", [])

    def _award(badge_id: str) -> None:
        if badge_id not in earned:
            earned.add(badge_id)
            new_badges.append(badge_id)

    if len(sessions) >= 1:
        _award("first_session")
    if streak >= 3:
        _award("streak_3")
    if streak >= 7:
        _award("streak_7")
    if streak >= 30:
        _award("streak_30")
    if wpm >= 40:
        _award("wpm_40")
    if wpm >= 60:
        _award("wpm_60")
    if wpm >= 80:
        _award("wpm_80")
    if wpm >= 100:
        _award("wpm_100")
    if accuracy >= 100:
        _award("perfect_accuracy")
    if mode in ("programming", "key_drill"):
        _award("first_code")
    if len([k for k in lessons if k.startswith("general_")]) >= 20:
        _award("track_general")
    if len([k for k in lessons if k.startswith("developer_")]) >= 15:
        _award("track_developer")
    if len(friends) >= 1:
        _award("first_friend")

    return new_badges


def award_xp_and_badges(session: dict) -> dict:
    """
    Calculate XP, check badges, save everything, return the diff for the UI.
    Call this after save_session() so streak/session data is already up-to-date.
    """
    data = load_data()
    old_xp = data.get("xp", 0)
    old_level = get_level(old_xp)

    # XP
    is_lesson = bool(session.get("lesson_id"))
    hit_target = bool(session.get("hit_lesson_target"))
    xp_earned = calculate_xp(
        wpm=session.get("wpm", 0),
        accuracy=session.get("accuracy", 0),
        mode=session.get("mode", ""),
        is_lesson=is_lesson,
        hit_target=hit_target,
    )
    new_xp = old_xp + xp_earned
    data["xp"] = new_xp
    new_level = get_level(new_xp)

    # Badges
    new_badge_ids = check_new_badges(session, data)
    if new_badge_ids:
        current = set(data.get("badges", []))
        current.update(new_badge_ids)
        data["badges"] = list(current)

    _write_json(DATA_FILE, data)

    return {
        "xp_earned": xp_earned,
        "total_xp": new_xp,
        "level": new_level,
        "rank": get_rank(new_xp),
        "level_progress": get_level_progress(new_xp),
        "leveled_up": new_level > old_level,
        "new_badges": new_badge_ids,
    }


def get_gamification_state() -> dict:
    data = load_data()
    total_xp = data.get("xp", 0)
    earned_ids = set(data.get("badges", []))
    all_badges = [
        {**b, "earned": b["id"] in earned_ids}
        for b in BADGES
    ]
    return {
        "xp": total_xp,
        "level": get_level(total_xp),
        "rank": get_rank(total_xp),
        "level_progress": get_level_progress(total_xp),
        "badges": all_badges,
        "earned_count": len(earned_ids),
        "total_badges": len(BADGES),
    }
