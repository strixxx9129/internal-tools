"""Shared time helpers (naive UTC keeps SQLite comparisons consistent)."""
from datetime import datetime, timezone


def utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)
