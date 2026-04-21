import json
import urllib.request

from app.version import __version__

GITHUB_REPO  = "Tosin-A/Typist"
RELEASES_URL = f"https://github.com/{GITHUB_REPO}/releases/latest"
API_URL      = f"https://api.github.com/repos/{GITHUB_REPO}/releases/latest"


def _parse_version(v: str) -> tuple[int, ...]:
    v = v.lstrip("v").strip()
    try:
        return tuple(int(x) for x in v.split("."))
    except ValueError:
        return (0,)


def check_for_update() -> dict:
    """
    Returns:
        { has_update, latest_version, current_version, releases_url }
    Never raises — network failures silently return has_update=False.
    """
    try:
        req = urllib.request.Request(API_URL, headers={"User-Agent": "Typist-App"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read())
        tag = data.get("tag_name", "")
        if not tag:
            raise ValueError("no tag_name in response")
        latest = tag.lstrip("v").strip()
        has_update = _parse_version(latest) > _parse_version(__version__)
        return {
            "has_update": has_update,
            "latest_version": latest,
            "current_version": __version__,
            "releases_url": RELEASES_URL,
        }
    except Exception:
        return {
            "has_update": False,
            "latest_version": None,
            "current_version": __version__,
            "releases_url": RELEASES_URL,
        }
