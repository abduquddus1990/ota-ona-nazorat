"""Toshkent vaqti. Windows da tzdata bo'lmasa UTC+5."""
from datetime import timezone, timedelta

try:
    from zoneinfo import ZoneInfo
    TASHKENT = ZoneInfo("Asia/Tashkent")
except Exception:
    TASHKENT = timezone(timedelta(hours=5))
