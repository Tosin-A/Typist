import json

from app.content import generate_text, generate_adaptive_text, get_quote_of_the_day
from app.difficulty import get_current_difficulty, get_difficulty_info
from app.storage import (
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
    # Session start — all sessions auto-adapt to problem chars
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

        # Auto-adapt: mix problem chars into every non-programming session
        problem_chars = self._get_problem_chars()
        if mode == "programming":
            problem_chars = []  # preserve code syntax

        content = generate_text(
            mode, difficulty, custom_text,
            problem_chars=problem_chars,
            case_mode=case_mode,
            punctuation=punctuation,
            session_length=session_length,
        )
        quote = get_quote_of_the_day()
        diff_info = get_difficulty_info()

        return json.dumps({
            "text": content["text"],
            "mode": content["mode"],
            "difficulty": content["difficulty"],
            "word_count": content["word_count"],
            "char_count": content["char_count"],
            "quote_of_day": quote,
            "difficulty_info": diff_info,
            "adapted_for": problem_chars,
        })

    def start_adaptive_session(self) -> str:
        """Intense drill: ~75% of words target problem characters."""
        settings = load_settings()
        difficulty = get_current_difficulty()
        case_mode = settings.get("text_case", "sentence")
        punctuation = settings.get("punctuation", True)
        session_length = settings.get("session_length", "medium")

        problem_chars = self._get_problem_chars(8)
        quote = get_quote_of_the_day()
        diff_info = get_difficulty_info()

        content = generate_text(
            "adaptive", difficulty, "",
            problem_chars=problem_chars,
            case_mode=case_mode,
            punctuation=punctuation,
            session_length=session_length,
        )

        return json.dumps({
            "text": content["text"],
            "mode": "adaptive",
            "difficulty": difficulty,
            "word_count": content["word_count"],
            "char_count": content["char_count"],
            "quote_of_day": quote,
            "difficulty_info": diff_info,
            "adapted_for": problem_chars,
        })

    def start_speed_test(self) -> str:
        """60-second speed test — no adaptation, pure speed measurement."""
        from app.content import generate_sentences
        difficulty = get_current_difficulty()
        text = generate_sentences(difficulty, 800)
        quote = get_quote_of_the_day()
        diff_info = get_difficulty_info()

        return json.dumps({
            "text": text,
            "mode": "speed_test",
            "difficulty": difficulty,
            "word_count": len(text.split()),
            "char_count": len(text),
            "quote_of_day": quote,
            "difficulty_info": diff_info,
            "adapted_for": [],
            "time_limit": 60,
        })

    # ------------------------------------------------------------------
    # Session end
    # ------------------------------------------------------------------

    def finish_session(self, payload: str) -> str:
        try:
            session = json.loads(payload)

            # Capture all-time best before saving so we can detect a new record
            existing = load_data().get("sessions", [])
            old_best = max((float(s.get("wpm", 0)) for s in existing), default=0.0)

            data = save_session(session)
            progress = get_progress(30)

            current_wpm = float(session.get("wpm", 0))
            is_new_best = current_wpm > old_best and len(existing) > 0

            return json.dumps({
                "ok": True,
                "streak": data.get("streak", 0),
                "progress": progress,
                "is_new_best": is_new_best,
                "all_time_best": max(current_wpm, old_best),
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

        return json.dumps({
            "streak": streak,
            "last_wpm": last_wpm,
            "progress": progress,
            "difficulty_info": diff_info,
            "settings": settings,
            "quote_of_day": quote,
            "top_problem_chars": top_problem,
            "top_problem_errors": top_errors,  # {char: count}
        })

    # ------------------------------------------------------------------
    # Analytics
    # ------------------------------------------------------------------

    def get_analytics(self) -> str:
        key_errors = get_key_error_stats(30)
        top_errors = sorted(key_errors.items(), key=lambda x: x[1], reverse=True)[:12]
        progress = get_progress(30)
        accuracy_history = get_accuracy_history(30)
        diff_info = get_difficulty_info()
        total_sessions = len(load_data().get("sessions", []))

        return json.dumps({
            "key_errors": dict(top_errors),
            "all_key_errors": key_errors,
            "top_problem_chars": [k for k, _ in top_errors[:6]],
            "progress": progress,
            "accuracy_history": accuracy_history,
            "difficulty_info": diff_info,
            "total_sessions": total_sessions,
        })

    # ------------------------------------------------------------------
    # Quit
    # ------------------------------------------------------------------

    def quit_app(self) -> None:
        import webview
        webview.windows[0].destroy()

    def minimize_app(self) -> None:
        import webview
        webview.windows[0].minimize()
