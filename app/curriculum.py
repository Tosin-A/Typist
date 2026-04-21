from dataclasses import asdict, dataclass
from datetime import datetime

from app.storage import DATA_FILE, _write_json, load_data


@dataclass
class Lesson:
    id: str
    track: str          # "general" | "developer" | "code"
    number: int
    title: str
    description: str
    mode: str
    floor_wpm: int
    target_multiplier: float
    min_accuracy: int
    estimated_minutes: int
    content_params: dict


# ── Curriculum ────────────────────────────────────────────────
CURRICULUM: list[Lesson] = [
    # ─── GENERAL TRACK (20 lessons) ──────────────────────────
    Lesson("general_1",  "general", 1,  "Home Row Heroes",
           "Master the 8 home row keys — the foundation of touch typing",
           "common", 15, 0.75, 78, 2,
           {"session_length": "short"}),
    Lesson("general_2",  "general", 2,  "Left Hand Focus",
           "Build muscle memory with Q W E R T A S D F G V B",
           "common", 18, 0.78, 79, 2,
           {"session_length": "short"}),
    Lesson("general_3",  "general", 3,  "Right Hand Focus",
           "Train your right hand: Y U I O P H J K L N M",
           "common", 18, 0.78, 79, 2,
           {"session_length": "short"}),
    Lesson("general_4",  "general", 4,  "Common Short Words",
           "The 100 most common English words at a steady pace",
           "common", 20, 0.80, 80, 3,
           {"session_length": "short"}),
    Lesson("general_5",  "general", 5,  "First Sentences",
           "String words into flowing sentences for the first time",
           "sentences", 22, 0.82, 80, 3,
           {"session_length": "short"}),
    Lesson("general_6",  "general", 6,  "Speed Burst I",
           "Push your pace — medium-length words at a higher tempo",
           "common", 28, 0.84, 81, 3,
           {"session_length": "medium"}),
    Lesson("general_7",  "general", 7,  "Punctuation Entry",
           "Add commas, periods, and apostrophes to your flow",
           "sentences", 28, 0.84, 81, 3,
           {"session_length": "medium"}),
    Lesson("general_8",  "general", 8,  "Extended Vocabulary",
           "Longer, more varied words — keep your rhythm steady",
           "common", 32, 0.86, 82, 3,
           {"session_length": "medium"}),
    Lesson("general_9",  "general", 9,  "Sentence Flow",
           "Multi-sentence passages — don't lose pace between words",
           "sentences", 35, 0.87, 82, 4,
           {"session_length": "medium"}),
    Lesson("general_10", "general", 10, "Speed Burst II",
           "Hold your pace from start to finish through a longer session",
           "sentences", 38, 0.88, 82, 4,
           {"session_length": "medium"}),
    Lesson("general_11", "general", 11, "Capital Letters",
           "Proper names and capitals — train your Shift key with confidence",
           "sentences", 40, 0.88, 83, 4,
           {"session_length": "medium"}),
    Lesson("general_12", "general", 12, "Number Row",
           "Digits mixed naturally into text — no looking down",
           "common", 40, 0.88, 83, 4,
           {"session_length": "medium"}),
    Lesson("general_13", "general", 13, "Long-Form I",
           "Extended passages — maintain accuracy under fatigue",
           "sentences", 45, 0.89, 83, 5,
           {"session_length": "long"}),
    Lesson("general_14", "general", 14, "Speed Test Prep",
           "A 60-second simulation — practice pacing under the clock",
           "sentences", 48, 0.89, 84, 4,
           {"session_length": "medium"}),
    Lesson("general_15", "general", 15, "Accuracy Under Pressure",
           "Longer text with a higher accuracy bar — precision over speed",
           "sentences", 45, 0.89, 90, 5,
           {"session_length": "long"}),
    Lesson("general_16", "general", 16, "Speed Burst III",
           "Your fastest session yet — push your personal ceiling",
           "common", 50, 0.91, 84, 4,
           {"session_length": "medium"}),
    Lesson("general_17", "general", 17, "Complex Punctuation",
           "Dashes, quotes, colons, semicolons — master the full set",
           "sentences", 52, 0.91, 85, 4,
           {"session_length": "medium"}),
    Lesson("general_18", "general", 18, "Long-Form II",
           "Sustained typing over a long passage — build true endurance",
           "sentences", 55, 0.92, 85, 6,
           {"session_length": "long"}),
    Lesson("general_19", "general", 19, "Mixed Challenge",
           "Words, sentences, and punctuation all at once — no patterns",
           "sentences", 58, 0.93, 86, 5,
           {"session_length": "long"}),
    Lesson("general_20", "general", 20, "General Mastery",
           "The final test — prove you own it",
           "sentences", 60, 0.95, 87, 5,
           {"session_length": "long"}),

    # ─── DEVELOPER TRACK (15 lessons) ────────────────────────
    Lesson("developer_1",  "developer", 1,  "Symbols & Brackets",
           "{ } [ ] ( ) < > — the characters developers live in",
           "programming", 25, 0.80, 79, 3,
           {"session_length": "short"}),
    Lesson("developer_2",  "developer", 2,  "Snake & Camel Case",
           "variable_names and camelCaseNames — train those underscores",
           "programming", 28, 0.82, 80, 3,
           {"session_length": "short"}),
    Lesson("developer_3",  "developer", 3,  "Operators",
           "=> === !== >= <= && || — every operator pattern",
           "programming", 28, 0.82, 80, 3,
           {"session_length": "short"}),
    Lesson("developer_4",  "developer", 4,  "Function Signatures",
           "def, function, return — the skeleton of all code",
           "programming", 30, 0.83, 81, 3,
           {"session_length": "medium"}),
    Lesson("developer_5",  "developer", 5,  "Comments & Strings",
           "// # /* */ and quoted strings — text embedded in code",
           "programming", 30, 0.83, 81, 3,
           {"session_length": "medium"}),
    Lesson("developer_6",  "developer", 6,  "Python Basics",
           "Real Python: lists, loops, functions — type what you'll write",
           "programming", 32, 0.84, 82, 4,
           {"session_length": "medium"}),
    Lesson("developer_7",  "developer", 7,  "JavaScript Basics",
           "const/let, arrow functions, template literals",
           "programming", 32, 0.84, 82, 4,
           {"session_length": "medium"}),
    Lesson("developer_8",  "developer", 8,  "Git & Terminal",
           "git add, commit, push, pull — your daily terminal workflow",
           "programming", 30, 0.84, 82, 3,
           {"session_length": "medium"}),
    Lesson("developer_9",  "developer", 9,  "Code Speed I",
           "Mixed snippets — hold pace through real syntax",
           "programming", 35, 0.86, 82, 4,
           {"session_length": "medium"}),
    Lesson("developer_10", "developer", 10, "Indentation & Structure",
           "Multi-line code with consistent indentation — think in blocks",
           "programming", 35, 0.86, 82, 4,
           {"session_length": "medium"}),
    Lesson("developer_11", "developer", 11, "Class Definitions",
           "class, extends, self, this — OOP patterns across languages",
           "programming", 38, 0.87, 83, 4,
           {"session_length": "medium"}),
    Lesson("developer_12", "developer", 12, "Async Patterns",
           "async/await, Promises, callbacks — non-blocking code at speed",
           "programming", 38, 0.87, 83, 4,
           {"session_length": "medium"}),
    Lesson("developer_13", "developer", 13, "Code Endurance",
           "Longer snippets — type through complexity without slowing",
           "programming", 40, 0.88, 84, 5,
           {"session_length": "long"}),
    Lesson("developer_14", "developer", 14, "Mixed Languages",
           "Python, JavaScript, and Bash back to back",
           "programming", 42, 0.89, 84, 5,
           {"session_length": "long"}),
    Lesson("developer_15", "developer", 15, "Developer Mastery",
           "Final challenge — code at speed, no hesitation",
           "programming", 45, 0.91, 85, 5,
           {"session_length": "long"}),

    # ─── CODE TRACK (10 lessons — add-on) ────────────────────
    Lesson("code_python_1", "code", 1,  "Python: Variables & Types",
           "int, str, list, dict — Python's core building blocks",
           "programming", 22, 0.79, 79, 3,
           {"session_length": "short"}),
    Lesson("code_python_2", "code", 2,  "Python: Control Flow",
           "if/elif/else, for, while — how Python makes decisions",
           "programming", 25, 0.80, 80, 3,
           {"session_length": "short"}),
    Lesson("code_python_3", "code", 3,  "Python: Functions",
           "def, return, *args, **kwargs, lambda expressions",
           "programming", 28, 0.81, 80, 3,
           {"session_length": "medium"}),
    Lesson("code_python_4", "code", 4,  "Python: Real Snippets",
           "Actual code from popular Python libraries",
           "programming", 30, 0.83, 81, 4,
           {"session_length": "medium"}),
    Lesson("code_js_1",     "code", 5,  "JavaScript: Core Syntax",
           "const, let, =>, {} — modern JS foundations",
           "programming", 22, 0.79, 79, 3,
           {"session_length": "short"}),
    Lesson("code_js_2",     "code", 6,  "JavaScript: Functions",
           "Arrow functions, callbacks, destructuring assignments",
           "programming", 25, 0.80, 80, 3,
           {"session_length": "medium"}),
    Lesson("code_js_3",     "code", 7,  "JavaScript: Async",
           "Promise, async/await, fetch — async JS patterns",
           "programming", 28, 0.81, 80, 4,
           {"session_length": "medium"}),
    Lesson("code_js_4",     "code", 8,  "JavaScript: Real Snippets",
           "React hooks, utility functions, real-world JS",
           "programming", 30, 0.83, 81, 4,
           {"session_length": "medium"}),
    Lesson("code_terminal_1", "code", 9,  "Terminal: Navigation",
           "cd, ls, pwd, mkdir, cp, mv — file system fluency",
           "programming", 20, 0.78, 79, 3,
           {"session_length": "short"}),
    Lesson("code_terminal_2", "code", 10, "Terminal: Git Workflow",
           "git add, commit, push, pull, branch, merge, rebase",
           "programming", 22, 0.80, 80, 3,
           {"session_length": "medium"}),
]

LESSON_MAP: dict[str, Lesson] = {l.id: l for l in CURRICULUM}

TRACK_LESSONS: dict[str, list[Lesson]] = {
    "general":   [l for l in CURRICULUM if l.track == "general"],
    "developer": [l for l in CURRICULUM if l.track == "developer"],
    "code":      [l for l in CURRICULUM if l.track == "code"],
}

# Tracks that require N completions from another track to unlock
TRACK_UNLOCK_REQUIREMENTS: dict[str, dict] = {
    "developer": {"track": "general", "count": 5},
    "code":      {"track": "general", "count": 10},
}


# ── Helpers ───────────────────────────────────────────────────

def get_lesson_target(lesson: Lesson, baseline_wpm: int) -> int:
    adaptive = int(baseline_wpm * lesson.target_multiplier) if baseline_wpm > 0 else 0
    return max(lesson.floor_wpm, adaptive)


def is_track_unlocked(track: str, completed: dict) -> bool:
    req = TRACK_UNLOCK_REQUIREMENTS.get(track)
    if not req:
        return True
    count = sum(1 for l in TRACK_LESSONS[req["track"]] if l.id in completed)
    return count >= req["count"]


def get_track_status(track: str, completed: dict, baseline_wpm: int) -> dict:
    lessons = TRACK_LESSONS.get(track, [])
    result = []
    prev_done = True
    for lesson in lessons:
        done = lesson.id in completed
        available = prev_done
        target = get_lesson_target(lesson, baseline_wpm)
        result.append({
            **asdict(lesson),
            "status": "completed" if done else ("available" if available else "locked"),
            "target_wpm": target,
            "completion": completed.get(lesson.id),
        })
        prev_done = done
    return {"track": track, "lessons": result}


def get_curriculum_state() -> dict:
    data = load_data()
    completed = data.get("lessons_completed", {})
    baseline_wpm = (data.get("user") or {}).get("baseline_wpm", 0)

    tracks = {}
    for track in ("general", "developer", "code"):
        unlocked = (track == "general") or is_track_unlocked(track, completed)
        status = get_track_status(track, completed, baseline_wpm) if unlocked else {"track": track, "lessons": []}
        tracks[track] = {
            **status,
            "unlocked": unlocked,
            "completed_count": sum(1 for l in TRACK_LESSONS[track] if l.id in completed),
            "total_count": len(TRACK_LESSONS[track]),
        }

    return {
        "tracks": tracks,
        "total_completed": len(completed),
        "baseline_wpm": baseline_wpm,
    }


def check_lesson_pass(lesson_id: str, wpm: int, accuracy: int, gross_wpm: int = 0) -> dict:
    """
    wpm is net WPM (already penalised for errors by the frontend).
    gross_wpm is the raw speed before penalty, included for display only.
    """
    data = load_data()
    baseline_wpm = (data.get("user") or {}).get("baseline_wpm", 0)
    lesson = LESSON_MAP.get(lesson_id)
    if not lesson:
        return {"passed": False, "error": "lesson not found"}
    target = get_lesson_target(lesson, baseline_wpm)
    passed = wpm >= target and accuracy >= lesson.min_accuracy
    return {
        "passed": passed,
        "lesson_id": lesson_id,
        "lesson_title": lesson.title,
        "target_wpm": target,
        "floor_wpm": lesson.floor_wpm,
        "actual_wpm": wpm,          # net WPM (what counts for passing)
        "gross_wpm": gross_wpm,     # raw speed before error penalty
        "actual_accuracy": accuracy,
        "min_accuracy": lesson.min_accuracy,
        "wpm_short": max(0, target - wpm),
        "accuracy_short": max(0, lesson.min_accuracy - accuracy),
    }


def save_lesson_completion(lesson_id: str, wpm: int, accuracy: int) -> None:
    data = load_data()
    lessons = data.get("lessons_completed", {})
    lessons[lesson_id] = {
        "wpm": wpm,
        "accuracy": accuracy,
        "completed_at": datetime.now().isoformat(),
    }
    data["lessons_completed"] = lessons
    _write_json(DATA_FILE, data)


def get_next_lesson(lesson_id: str) -> dict | None:
    lesson = LESSON_MAP.get(lesson_id)
    if not lesson:
        return None
    track_list = TRACK_LESSONS.get(lesson.track, [])
    for i, l in enumerate(track_list):
        if l.id == lesson_id and i + 1 < len(track_list):
            return asdict(track_list[i + 1])
    return None
