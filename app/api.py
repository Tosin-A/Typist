import json

from app.content import (
    generate_adaptive_text,
    generate_key_drill,
    generate_text,
    get_quote_of_the_day,
)
from app.curriculum import (
    LESSON_MAP,
    check_lesson_pass,
    get_curriculum_state,
    get_next_lesson,
    save_lesson_completion,
)
from app.difficulty import get_current_difficulty, get_difficulty_info
from app.gamification import award_xp_and_badges, get_gamification_state
from app.storage import (
    DATA_FILE,
    _write_json,
    get_accuracy_history,
    get_key_error_stats,
    get_last_wpm,
    get_progress,
    get_streak,
    load_data,
    load_settings,
    save_session,
    save_settings,
)
from app.user import (
    complete_onboarding,
    get_or_create_user,
    get_recommended_track,
    set_username,
)


class Api:
    """Exposed to the JS frontend via pywebview's JS API bridge."""

    # ------------------------------------------------------------------
    # Settings
    # ------------------------------------------------------------------

    def get_settings(self) -> str:
        return json.dumps(load_settings())

    def update_settings(self, payload: str) -> str:
        try:
            data = json.loads(payload)
            save_settings(data)
            return json.dumps({"ok": True})
        except Exception as e:
            return json.dumps({"ok": False, "error": str(e)})

    # ------------------------------------------------------------------
    # User identity & onboarding
    # ------------------------------------------------------------------

    def get_user(self) -> str:
        user = get_or_create_user()
        gamification = get_gamification_state()
        return json.dumps({
            **user,
            "xp": gamification["xp"],
            "level": gamification["level"],
            "rank": gamification["rank"],
            "level_progress": gamification["level_progress"],
        })

    def set_username(self, payload: str) -> str:
        try:
            data = json.loads(payload)
            username = data.get("username", "").strip()
            if len(username) < 3:
                return json.dumps({"ok": False, "error": "Username must be at least 3 characters"})
            if len(username) > 20:
                return json.dumps({"ok": False, "error": "Username must be 20 characters or fewer"})
            if not all(c.isalnum() or c == "_" for c in username):
                return json.dumps({"ok": False, "error": "Only letters, numbers, and underscores allowed"})
            user = set_username(username)
            return json.dumps({"ok": True, "user": user})
        except Exception as e:
            return json.dumps({"ok": False, "error": str(e)})

    def complete_onboarding(self, payload: str) -> str:
        try:
            data = json.loads(payload)
            baseline_wpm = int(data.get("baseline_wpm", 0))
            user = complete_onboarding(baseline_wpm)
            recommended_track = get_recommended_track(baseline_wpm)
            # Register user with cloud if available
            try:
                from app.cloud import is_configured, register_user
                if is_configured() and user.get("username"):
                    result = register_user(
                        user["username"], user["device_id"], user["friend_code"]
                    )
                    if result and result.get("id"):
                        _update_supabase_id(result["id"])
            except Exception:
                pass
            return json.dumps({
                "ok": True,
                "user": user,
                "recommended_track": recommended_track,
            })
        except Exception as e:
            return json.dumps({"ok": False, "error": str(e)})

    # ------------------------------------------------------------------
    # Session start
    # ------------------------------------------------------------------

    def _get_problem_chars(self, n: int = 6) -> list[str]:
        key_errors = get_key_error_stats(20)
        return sorted(key_errors, key=lambda k: key_errors[k], reverse=True)[:n]

    def start_session(self) -> str:
        settings = load_settings()
        difficulty = get_current_difficulty()
        mode = settings.get("mode", "sentences")
        custom_text = settings.get("custom_text", "")
        case_mode = settings.get("text_case", "sentence")
        punctuation = settings.get("punctuation", True)
        session_length = settings.get("session_length", "medium")

        problem_chars = self._get_problem_chars()
        if mode == "programming":
            problem_chars = []

        content = generate_text(
            mode, difficulty, custom_text,
            problem_chars=problem_chars,
            case_mode=case_mode,
            punctuation=punctuation,
            session_length=session_length,
        )
        return json.dumps({
            "text": content["text"],
            "mode": content["mode"],
            "difficulty": content["difficulty"],
            "word_count": content["word_count"],
            "char_count": content["char_count"],
            "quote_of_day": get_quote_of_the_day(),
            "difficulty_info": get_difficulty_info(),
            "adapted_for": problem_chars,
        })

    def start_adaptive_session(self) -> str:
        settings = load_settings()
        difficulty = get_current_difficulty()
        problem_chars = self._get_problem_chars(8)
        content = generate_text(
            "adaptive", difficulty, "",
            problem_chars=problem_chars,
            case_mode=settings.get("text_case", "sentence"),
            punctuation=settings.get("punctuation", True),
            session_length=settings.get("session_length", "medium"),
        )
        return json.dumps({
            "text": content["text"],
            "mode": "adaptive",
            "difficulty": difficulty,
            "word_count": content["word_count"],
            "char_count": content["char_count"],
            "quote_of_day": get_quote_of_the_day(),
            "difficulty_info": get_difficulty_info(),
            "adapted_for": problem_chars,
        })

    def start_speed_test(self) -> str:
        from app.content import generate_sentences
        difficulty = get_current_difficulty()
        text = generate_sentences(difficulty, 800)
        return json.dumps({
            "text": text,
            "mode": "speed_test",
            "difficulty": difficulty,
            "word_count": len(text.split()),
            "char_count": len(text),
            "quote_of_day": get_quote_of_the_day(),
            "difficulty_info": get_difficulty_info(),
            "adapted_for": [],
            "time_limit": 60,
        })

    def start_key_drill(self, payload: str) -> str:
        try:
            data = json.loads(payload)
            keys = data.get("keys", [])
        except Exception:
            keys = []

        settings = load_settings()
        difficulty = get_current_difficulty()
        length_targets = {"short": 120, "medium": 180, "long": 250}
        target_chars = length_targets.get(settings.get("session_length", "medium"), 180)
        text = generate_key_drill(keys, difficulty, target_chars).lower()

        return json.dumps({
            "text": text,
            "mode": "key_drill",
            "difficulty": difficulty,
            "word_count": len(text.split()),
            "char_count": len(text),
            "quote_of_day": get_quote_of_the_day(),
            "difficulty_info": get_difficulty_info(),
            "adapted_for": keys,
        })

    def start_lesson(self, payload: str) -> str:
        """Start a structured lesson session."""
        try:
            data = json.loads(payload)
            lesson_id = data.get("lesson_id", "")
        except Exception:
            return json.dumps({"ok": False, "error": "invalid payload"})

        lesson = LESSON_MAP.get(lesson_id)
        if not lesson:
            return json.dumps({"ok": False, "error": f"lesson {lesson_id!r} not found"})

        settings = load_settings()
        difficulty = get_current_difficulty()
        params = lesson.content_params or {}
        session_length = params.get("session_length", settings.get("session_length", "medium"))

        content = generate_text(
            lesson.mode, difficulty, "",
            problem_chars=params.get("problem_chars"),
            case_mode=settings.get("text_case", "sentence"),
            punctuation=params.get("punctuation", settings.get("punctuation", True)),
            session_length=session_length,
        )

        user = load_data().get("user") or {}
        baseline_wpm = user.get("baseline_wpm", 0)
        from app.curriculum import get_lesson_target
        target_wpm = get_lesson_target(lesson, baseline_wpm)

        return json.dumps({
            "text": content["text"],
            "mode": lesson.mode,
            "difficulty": difficulty,
            "word_count": content["word_count"],
            "char_count": content["char_count"],
            "quote_of_day": get_quote_of_the_day(),
            "difficulty_info": get_difficulty_info(),
            "adapted_for": [],
            "lesson_id": lesson_id,
            "lesson_title": lesson.title,
            "lesson_description": lesson.description,
            "lesson_number": lesson.number,
            "lesson_track": lesson.track,
            "target_wpm": target_wpm,
            "floor_wpm": lesson.floor_wpm,
            "min_accuracy": lesson.min_accuracy,
        })

    # ------------------------------------------------------------------
    # Session end
    # ------------------------------------------------------------------

    def finish_session(self, payload: str) -> str:
        try:
            session = json.loads(payload)

            existing = load_data().get("sessions", [])
            old_best = max((float(s.get("wpm", 0)) for s in existing), default=0.0)

            data = save_session(session)
            progress = get_progress(30)
            current_wpm = float(session.get("wpm", 0))
            is_new_best = current_wpm > old_best and len(existing) > 0

            # Lesson completion check
            lesson_result = None
            lesson_id = session.get("lesson_id")
            if lesson_id:
                lesson_result = check_lesson_pass(
                    lesson_id,
                    int(session.get("wpm", 0)),        # net WPM
                    int(session.get("accuracy", 0)),
                    int(session.get("gross_wpm", session.get("wpm", 0))),
                )
                if lesson_result.get("passed"):
                    save_lesson_completion(
                        lesson_id,
                        int(session.get("wpm", 0)),
                        int(session.get("accuracy", 0)),
                    )
                    session["hit_lesson_target"] = True
                    session["lesson_id"] = lesson_id
                next_lesson = get_next_lesson(lesson_id)
            else:
                next_lesson = None

            # XP + badges (reads fresh data after save_session)
            gamification = award_xp_and_badges(session)

            # Cloud sync (non-blocking, best-effort)
            try:
                from app.cloud import is_configured, sync_score, update_user_stats
                if is_configured():
                    user = load_data().get("user") or {}
                    supabase_id = user.get("supabase_id")
                    if supabase_id:
                        sync_score(session, supabase_id)
                        update_user_stats(
                            supabase_id,
                            gamification["total_xp"],
                            gamification["level"],
                            gamification["rank"],
                        )
            except Exception:
                pass

            return json.dumps({
                "ok": True,
                "streak": data.get("streak", 0),
                "progress": progress,
                "is_new_best": is_new_best,
                "all_time_best": max(current_wpm, old_best),
                "gamification": gamification,
                "lesson_result": lesson_result,
                "next_lesson": next_lesson,
            })
        except Exception as e:
            return json.dumps({"ok": False, "error": str(e)})

    # ------------------------------------------------------------------
    # Dashboard
    # ------------------------------------------------------------------

    def get_dashboard(self) -> str:
        streak = get_streak()
        last_wpm = get_last_wpm()
        progress = get_progress(30)
        diff_info = get_difficulty_info()
        settings = load_settings()
        quote = get_quote_of_the_day()
        key_errors = get_key_error_stats(20)
        top_problem = sorted(key_errors, key=lambda k: key_errors[k], reverse=True)[:6]
        top_errors = {k: key_errors[k] for k in top_problem}
        gamification = get_gamification_state()
        user = get_or_create_user()

        return json.dumps({
            "streak": streak,
            "last_wpm": last_wpm,
            "progress": progress,
            "difficulty_info": diff_info,
            "settings": settings,
            "quote_of_day": quote,
            "top_problem_chars": top_problem,
            "top_problem_errors": top_errors,
            "gamification": gamification,
            "user": {**user, **{k: gamification[k] for k in ("xp", "level", "rank", "level_progress")}},
        })

    # ------------------------------------------------------------------
    # Analytics
    # ------------------------------------------------------------------

    def get_analytics(self) -> str:
        from app.storage import (
            get_weekly_progress, get_weekly_summary,
            get_milestones, get_progression_summary,
        )
        key_errors = get_key_error_stats(30)
        top_errors = sorted(key_errors.items(), key=lambda x: x[1], reverse=True)[:12]
        progress   = get_progress(30)
        diff_info  = get_difficulty_info()

        return json.dumps({
            "key_errors":         dict(top_errors),
            "all_key_errors":     key_errors,
            "top_problem_chars":  [k for k, _ in top_errors[:6]],
            "progress":           progress,
            "accuracy_history":   get_accuracy_history(30),
            "difficulty_info":    diff_info,
            "total_sessions":     len(load_data().get("sessions", [])),
            "weekly_progress":    get_weekly_progress(),
            "weekly_summary":     get_weekly_summary(),
            "milestones":         get_milestones(),
            "progression":        get_progression_summary(),
        })

    # ------------------------------------------------------------------
    # Curriculum
    # ------------------------------------------------------------------

    def get_curriculum(self) -> str:
        return json.dumps(get_curriculum_state())

    # ------------------------------------------------------------------
    # Gamification
    # ------------------------------------------------------------------

    def get_gamification(self) -> str:
        return json.dumps(get_gamification_state())

    # ------------------------------------------------------------------
    # Profile
    # ------------------------------------------------------------------

    def get_profile(self) -> str:
        data = load_data()
        user = get_or_create_user()
        gamification = get_gamification_state()
        progress = get_progress(30)
        key_errors = get_key_error_stats(30)
        top_errors = sorted(key_errors.items(), key=lambda x: x[1], reverse=True)[:8]
        sessions = data.get("sessions", [])
        best_wpm = max((s.get("wpm", 0) for s in sessions), default=0)
        avg_acc = (
            round(sum(s.get("accuracy", 0) for s in sessions) / len(sessions))
            if sessions else 0
        )
        curriculum = get_curriculum_state()

        return json.dumps({
            "user": {
                **user,
                "xp": gamification["xp"],
                "level": gamification["level"],
                "rank": gamification["rank"],
                "level_progress": gamification["level_progress"],
            },
            "stats": {
                "total_sessions": len(sessions),
                "best_wpm": best_wpm,
                "avg_accuracy": avg_acc,
                "streak": get_streak(),
                "lessons_completed": data.get("lessons_completed", {}),
                "total_lessons_completed": len(data.get("lessons_completed", {})),
            },
            "gamification": gamification,
            "progress": progress,
            "key_errors": dict(top_errors),
            "curriculum_summary": {
                track: {
                    "completed": info["completed_count"],
                    "total": info["total_count"],
                }
                for track, info in curriculum["tracks"].items()
            },
            "settings": load_settings(),
        })

    # ------------------------------------------------------------------
    # Leaderboard
    # ------------------------------------------------------------------

    def get_leaderboard(self, payload: str = "{}") -> str:
        try:
            params = json.loads(payload)
            filter_type = params.get("filter", "global")
            limit = int(params.get("limit", 50))
        except Exception:
            filter_type, limit = "global", 50

        from app.cloud import (
            get_leaderboard_friends,
            get_leaderboard_global,
            get_user_rank_position,
            is_configured,
        )

        user = get_or_create_user()
        supabase_id = user.get("supabase_id")
        online = is_configured()

        if not online:
            return json.dumps({
                "ok": True,
                "online": False,
                "entries": [],
                "user_rank": None,
                "message": "Connect to the internet to see the leaderboard",
            })

        entries = (
            get_leaderboard_friends(supabase_id)
            if filter_type == "friends" and supabase_id
            else get_leaderboard_global(limit)
        )

        # Add rank numbers
        for i, entry in enumerate(entries):
            entry["position"] = i + 1
            entry["is_me"] = entry.get("id") == supabase_id

        user_rank = get_user_rank_position(supabase_id) if supabase_id else None

        return json.dumps({
            "ok": True,
            "online": True,
            "entries": entries,
            "user_rank": user_rank,
            "filter": filter_type,
        })

    def add_friend(self, payload: str) -> str:
        try:
            data = json.loads(payload)
            query = data.get("query", "").strip()
            query_type = data.get("type", "code")  # "code" | "username"
        except Exception:
            return json.dumps({"ok": False, "error": "invalid payload"})

        user = get_or_create_user()
        supabase_id = user.get("supabase_id")
        if not supabase_id:
            return json.dumps({"ok": False, "error": "Complete setup to add friends"})

        from app.cloud import add_friend_by_code, add_friend_by_username
        if query_type == "username":
            result = add_friend_by_username(query, supabase_id)
        else:
            result = add_friend_by_code(query, supabase_id)

        if result.get("ok"):
            # Track locally too
            d = load_data()
            friends = d.get("friends", [])
            friend_name = result.get("friend", {}).get("username", query)
            if friend_name not in friends:
                friends.append(friend_name)
                d["friends"] = friends
                _write_json(DATA_FILE, d)

        return json.dumps(result)

    def search_users(self, payload: str) -> str:
        try:
            data = json.loads(payload)
            query = data.get("query", "").strip()
        except Exception:
            return json.dumps({"results": []})

        if len(query) < 2:
            return json.dumps({"results": []})

        from app.cloud import search_users
        results = search_users(query)
        return json.dumps({"results": results})

    # ------------------------------------------------------------------
    # Quit / window
    # ------------------------------------------------------------------

    # ------------------------------------------------------------------
    # Updates
    # ------------------------------------------------------------------

    def check_for_update(self) -> str:
        from app.updater import check_for_update
        return json.dumps(check_for_update())

    def open_releases_page(self) -> None:
        import webbrowser
        from app.updater import RELEASES_URL
        webbrowser.open(RELEASES_URL)

    # ------------------------------------------------------------------
    # Quit / window
    # ------------------------------------------------------------------

    def quit_app(self) -> None:
        import webview
        webview.windows[0].destroy()

    def minimize_app(self) -> None:
        import webview
        webview.windows[0].minimize()


# ── Internal helpers ──────────────────────────────────────────

def _update_supabase_id(supabase_id: str) -> None:
    data = load_data()
    user = data.get("user") or {}
    user["supabase_id"] = supabase_id
    data["user"] = user
    _write_json(DATA_FILE, data)
