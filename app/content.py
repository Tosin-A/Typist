import os
import random
import re
from pathlib import Path

_ASSETS = Path(__file__).parent.parent / "assets" / "words"

LENGTH_TARGETS: dict[str, dict[str, int]] = {
    "short":  {"beginner": 80,  "intermediate": 120, "advanced": 180},
    "medium": {"beginner": 200, "intermediate": 300, "advanced": 420},
    "long":   {"beginner": 350, "intermediate": 500, "advanced": 650},
}


def _load_file(name: str) -> list[str]:
    path = _ASSETS / name
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        lines = [ln.strip() for ln in f if ln.strip()]
    return lines


def _all_words() -> list[str]:
    lines = _load_file("common.txt")
    words: list[str] = []
    for line in lines:
        words.extend(line.split())
    return list(set(words))


def _all_quotes() -> list[str]:
    return _load_file("quotes.txt")


def _all_code_snippets() -> list[str]:
    return _load_file("programming.txt")


def _apply_case(text: str, case_mode: str) -> str:
    if case_mode == "lower":
        return text.lower()
    if case_mode == "upper":
        return text.upper()
    return text  # "sentence" — keep as generated


def _apply_punctuation(text: str, include: bool) -> str:
    if include:
        return text
    # Strip punctuation but preserve apostrophes in contractions
    cleaned = re.sub(r"[^\w\s']", "", text)
    return re.sub(r"\s+", " ", cleaned).strip()


def _build_problem_pool(words: list[str], problem_chars: list[str], mix_ratio: float = 0.38) -> list[str]:
    """
    Return a word pool with problem-character words weighted higher.
    mix_ratio = approximate fraction of selected words that should contain a problem char.
    """
    if not problem_chars:
        return words
    ps = {c.lower() for c in problem_chars if c}
    priority = [w for w in words if any(c in w.lower() for c in ps)]
    other = [w for w in words if w not in set(priority)]
    if not priority:
        return words
    # Calculate multiplier so priority words appear at the right ratio
    if other:
        weight = max(1, round((mix_ratio / max(0.01, 1.0 - mix_ratio)) * len(other) / len(priority)))
    else:
        weight = 1
    return priority * weight + other


def generate_common_words(
    difficulty: str,
    target_chars: int = 300,
    problem_chars: list[str] | None = None,
    mix_ratio: float = 0.38,
) -> str:
    words = _all_words()
    if difficulty == "beginner":
        words = [w for w in words if len(w) <= 5] or words
    elif difficulty == "advanced":
        words = [w for w in words if len(w) >= 6] or words

    pool = _build_problem_pool(words, problem_chars or [], mix_ratio)
    random.shuffle(pool)
    result: list[str] = []
    count = 0
    for word in pool * 6:
        if count >= target_chars:
            break
        result.append(word)
        count += len(word) + 1
    return " ".join(result)


def generate_sentences(
    difficulty: str,
    target_chars: int = 300,
    problem_chars: list[str] | None = None,
) -> str:
    quotes = _all_quotes()
    if not quotes:
        return generate_common_words(difficulty, target_chars, problem_chars)

    random.shuffle(quotes)
    result: list[str] = []
    count = 0
    for q in quotes * 5:
        if count >= target_chars:
            break
        result.append(q)
        count += len(q) + 1
    text = ". ".join(result[:3]) + "."

    # Append a small block of problem-char words so every sentence session
    # also drills the user's weak keys naturally
    if problem_chars:
        bonus = generate_common_words(
            difficulty,
            max(60, target_chars // 5),
            problem_chars,
            mix_ratio=0.65,
        )
        text = text + " " + bonus
    return text


def generate_programming(difficulty: str, target_chars: int = 300) -> str:
    snippets = _all_code_snippets()
    if not snippets:
        return generate_common_words(difficulty, target_chars)

    random.shuffle(snippets)
    result: list[str] = []
    count = 0
    for s in snippets * 3:
        if count >= target_chars:
            break
        result.append(s)
        count += len(s) + 1
    return "\n".join(result[:4])


def generate_adaptive_text(
    problem_chars: list[str],
    difficulty: str,
    target_chars: int = 300,
) -> str:
    """Intense drill: ~75% of words contain one of the problem characters."""
    words = _all_words()
    if not words:
        return generate_common_words(difficulty, target_chars)

    pool = _build_problem_pool(words, problem_chars, mix_ratio=0.75)
    random.shuffle(pool)
    result: list[str] = []
    count = 0
    for word in pool * 6:
        if count >= target_chars:
            break
        result.append(word)
        count += len(word) + 1
    return " ".join(result)


def get_quote_of_the_day() -> str:
    quotes = _all_quotes()
    if not quotes:
        return "type your way to a better tomorrow"
    import hashlib
    from datetime import date
    seed = int(hashlib.md5(str(date.today()).encode()).hexdigest(), 16) % len(quotes)
    return quotes[seed]


def generate_text(
    mode: str,
    difficulty: str,
    custom_text: str = "",
    problem_chars: list[str] | None = None,
    case_mode: str = "sentence",
    punctuation: bool = True,
    session_length: str = "medium",
) -> dict:
    target_chars = (
        LENGTH_TARGETS.get(session_length, LENGTH_TARGETS["medium"]).get(difficulty, 300)
    )

    if mode == "custom" and custom_text.strip():
        text = custom_text.strip()
    elif mode == "common":
        text = generate_common_words(difficulty, target_chars, problem_chars)
    elif mode == "programming":
        # Programming snippets aren't morphed by problem chars — syntax matters
        text = generate_programming(difficulty, target_chars)
    elif mode == "adaptive":
        text = generate_adaptive_text(problem_chars or [], difficulty, target_chars)
    else:
        # "sentences" — default, auto-weaves problem chars at the end
        text = generate_sentences(difficulty, target_chars, problem_chars)

    # Apply transforms in order: punctuation first, then case
    if not punctuation:
        text = _apply_punctuation(text, False)
    text = _apply_case(text, case_mode)

    return {
        "text": text,
        "mode": mode,
        "difficulty": difficulty,
        "char_count": len(text),
        "word_count": len(text.split()),
    }
