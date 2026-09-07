"""Telegram Mini App initData tekshiruvi + oddiy rate limit."""
from __future__ import annotations

import hashlib
import hmac
import os
import time
from collections import defaultdict, deque
from typing import Deque, Dict, Optional
from urllib.parse import parse_qsl

from fastapi import Header, HTTPException, Request, status


def _bot_token() -> str:
    token = (os.getenv("BOT_TOKEN") or os.getenv("MAIN_BOT_TOKEN") or "").strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="BOT_TOKEN / MAIN_BOT_TOKEN topilmadi",
        )
    return token


def validate_telegram_init_data(init_data: str, max_age_sec: int = 86400) -> dict:
    if not init_data or not init_data.strip():
        raise HTTPException(status_code=401, detail="Telegram initData yo'q")

    pairs = dict(parse_qsl(init_data, keep_blank_values=True))
    received_hash = pairs.pop("hash", None)
    if not received_hash:
        raise HTTPException(status_code=401, detail="initData hash yo'q")

    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(pairs.items()))
    secret_key = hmac.new(b"WebAppData", _bot_token().encode(), hashlib.sha256).digest()
    calc = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(calc, received_hash):
        raise HTTPException(status_code=401, detail="initData yaroqsiz")

    auth_date = pairs.get("auth_date")
    if auth_date:
        try:
            if int(time.time()) - int(auth_date) > max_age_sec:
                raise HTTPException(status_code=401, detail="initData muddati o'tgan")
        except ValueError as exc:
            raise HTTPException(status_code=401, detail="auth_date yaroqsiz") from exc

    return pairs


# key -> timestamps
_RATE: Dict[str, Deque[float]] = defaultdict(deque)
_RATE_LIMIT = int(os.getenv("TUTOR_RATE_LIMIT", "20"))
_RATE_WINDOW = int(os.getenv("TUTOR_RATE_WINDOW_SEC", "60"))


def check_rate_limit(key: str) -> None:
    now = time.time()
    q = _RATE[key]
    while q and now - q[0] > _RATE_WINDOW:
        q.popleft()
    if len(q) >= _RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Juda ko'p so'rov. Biroz kuting.")
    q.append(now)


async def require_tutor_auth(
    request: Request,
    x_telegram_init_data: Optional[str] = Header(default=None, alias="X-Telegram-Init-Data"),
    authorization: Optional[str] = Header(default=None),
) -> dict:
    """Mini App: X-Telegram-Init-Data. Ixtiyoriy: Bearer Supabase JWT."""
    client = request.client.host if request.client else "unknown"

    if x_telegram_init_data:
        data = validate_telegram_init_data(x_telegram_init_data)
        check_rate_limit(f"tg:{client}:{data.get('user', '')[:64]}")
        return {"auth": "telegram", "init": data, "client": client}

    # Dev bypass faqat aniq flag bilan
    if os.getenv("TUTOR_AUTH_OPTIONAL", "").lower() in ("1", "true", "yes"):
        check_rate_limit(f"dev:{client}")
        return {"auth": "optional", "client": client}

    if authorization:
        # Mavjud JWT middleware bilan moslashish (lazy import)
        from security.auth_middleware import get_current_user

        user = get_current_user(authorization)
        check_rate_limit(f"jwt:{client}:{user.get('sub', 'x')}")
        return {"auth": "jwt", "user": user, "client": client}

    raise HTTPException(status_code=401, detail="Telegram initData yoki Bearer token kerak")
