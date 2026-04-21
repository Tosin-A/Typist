import random
import string
import uuid

from app.storage import DATA_FILE, _write_json, load_data


def _generate_friend_code() -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


_USER_DEFAULTS = {
    "username": None,
    "device_id": None,
    "friend_code": None,
    "onboarded": False,
    "baseline_wpm": 0,
    "supabase_id": None,
}


def get_or_create_user() -> dict:
    data = load_data()
    user = data.get("user") or {}

    changed = False
    if not user.get("device_id"):
        user["device_id"] = str(uuid.uuid4())
        changed = True
    if not user.get("friend_code"):
        user["friend_code"] = _generate_friend_code()
        changed = True

    for k, v in _USER_DEFAULTS.items():
        if k not in user:
            user[k] = v
            changed = True

    if changed:
        data["user"] = user
        _write_json(DATA_FILE, data)

    return user


def set_username(username: str) -> dict:
    username = username.strip()
    data = load_data()
    user = data.get("user") or {}
    user["username"] = username
    data["user"] = user
    _write_json(DATA_FILE, data)
    return user


def complete_onboarding(baseline_wpm: int) -> dict:
    data = load_data()
    user = data.get("user") or {}
    user["onboarded"] = True
    user["baseline_wpm"] = int(baseline_wpm)
    data["user"] = user
    _write_json(DATA_FILE, data)
    return user


def get_recommended_track(baseline_wpm: int) -> str:
    if baseline_wpm >= 50:
        return "developer"
    return "general"


def get_recommended_lesson(baseline_wpm: int) -> str:
    """Return the ID of the first uncompleted lesson appropriate for baseline."""
    from app.curriculum import CURRICULUM
    from app.storage import load_data as _ld
    completed = _ld().get("lessons_completed", {})
    for lesson in CURRICULUM:
        if lesson.track == "general" and lesson.id not in completed:
            return lesson.id
    return "general_1"
