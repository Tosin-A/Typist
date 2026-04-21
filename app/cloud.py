"""
Offline-first Supabase integration.
All functions return sensible defaults when offline or unconfigured.
Credentials are read from ~/.typist/cloud_config.json after setup.
"""
import json
import os

from app.storage import DATA_DIR

_CONFIG_FILE = os.path.join(DATA_DIR, "cloud_config.json")
_client = None


def _load_config() -> dict:
    try:
        with open(_CONFIG_FILE, "r") as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError):
        return {}


def save_config(url: str, anon_key: str) -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(_CONFIG_FILE, "w") as f:
        json.dump({"url": url, "anon_key": anon_key}, f)
    global _client
    _client = None  # force re-init


def _get_client():
    global _client
    if _client is not None:
        return _client
    cfg = _load_config()
    url = cfg.get("url") or os.environ.get("TYPIST_SUPABASE_URL", "")
    key = cfg.get("anon_key") or os.environ.get("TYPIST_SUPABASE_ANON_KEY", "")
    if not url or not key:
        return None
    try:
        from supabase import create_client  # type: ignore
        _client = create_client(url, key)
        return _client
    except Exception:
        return None


def is_configured() -> bool:
    return _get_client() is not None


# ── User registration ─────────────────────────────────────────

def register_user(username: str, device_id: str, friend_code: str) -> dict | None:
    client = _get_client()
    if not client:
        return None
    try:
        res = (
            client.table("users")
            .upsert(
                {"device_id": device_id, "username": username, "friend_code": friend_code},
                on_conflict="device_id",
            )
            .execute()
        )
        return res.data[0] if res.data else None
    except Exception:
        return None


def update_user_stats(user_id: str, xp: int, level: int, rank: str) -> bool:
    client = _get_client()
    if not client or not user_id:
        return False
    try:
        client.table("users").update({"xp": xp, "level": level, "rank": rank}).eq("id", user_id).execute()
        return True
    except Exception:
        return False


# ── Score sync ────────────────────────────────────────────────

def sync_score(session: dict, user_id: str) -> bool:
    client = _get_client()
    if not client or not user_id:
        return False
    try:
        client.table("scores").insert({
            "user_id": user_id,
            "wpm": int(session.get("wpm", 0)),
            "accuracy": int(session.get("accuracy", 0)),
            "mode": session.get("mode", ""),
            "session_date": session.get("date", ""),
        }).execute()
        return True
    except Exception:
        return False


# ── Leaderboard ───────────────────────────────────────────────

def get_leaderboard_global(limit: int = 50) -> list[dict]:
    client = _get_client()
    if not client:
        return []
    try:
        res = client.table("leaderboard_global").select("*").limit(limit).execute()
        return res.data or []
    except Exception:
        return []


def get_leaderboard_friends(user_id: str) -> list[dict]:
    client = _get_client()
    if not client:
        return []
    try:
        fr = client.table("friendships").select("friend_id").eq("user_id", user_id).execute()
        friend_ids = [f["friend_id"] for f in (fr.data or [])]
        friend_ids.append(user_id)
        res = client.table("leaderboard_global").select("*").in_("id", friend_ids).execute()
        return res.data or []
    except Exception:
        return []


def get_user_rank_position(user_id: str) -> int | None:
    client = _get_client()
    if not client:
        return None
    try:
        res = client.rpc("get_user_rank_position", {"uid": user_id}).execute()
        return res.data
    except Exception:
        return None


# ── Friends ───────────────────────────────────────────────────

def add_friend_by_code(friend_code: str, user_id: str) -> dict:
    client = _get_client()
    if not client:
        return {"ok": False, "error": "offline"}
    try:
        ur = client.table("users").select("id,username,rank").eq("friend_code", friend_code.upper().strip()).execute()
        if not ur.data:
            return {"ok": False, "error": "Code not found — double-check it"}
        friend = ur.data[0]
        if friend["id"] == user_id:
            return {"ok": False, "error": "That's your own friend code"}
        client.table("friendships").upsert({"user_id": user_id, "friend_id": friend["id"]}).execute()
        client.table("friendships").upsert({"user_id": friend["id"], "friend_id": user_id}).execute()
        return {"ok": True, "friend": friend}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def add_friend_by_username(username: str, user_id: str) -> dict:
    client = _get_client()
    if not client:
        return {"ok": False, "error": "offline"}
    try:
        ur = client.table("users").select("id,username,rank").ilike("username", username.strip()).execute()
        if not ur.data:
            return {"ok": False, "error": "Username not found"}
        friend = ur.data[0]
        if friend["id"] == user_id:
            return {"ok": False, "error": "That's you"}
        client.table("friendships").upsert({"user_id": user_id, "friend_id": friend["id"]}).execute()
        client.table("friendships").upsert({"user_id": friend["id"], "friend_id": user_id}).execute()
        return {"ok": True, "friend": friend}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def search_users(query: str, limit: int = 8) -> list[dict]:
    client = _get_client()
    if not client:
        return []
    try:
        res = (
            client.table("users")
            .select("id,username,rank,xp")
            .ilike("username", f"%{query.strip()}%")
            .limit(limit)
            .execute()
        )
        return res.data or []
    except Exception:
        return []
