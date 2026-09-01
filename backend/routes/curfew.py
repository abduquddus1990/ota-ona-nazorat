"""22:00 ekran limi â€” qaysi ilovalar yopiladi."""
from __future__ import annotations

from datetime import datetime, time


from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

try:
    raise ImportError("local-demo")
except ImportError:
    def get_current_user():
        return {"sub": "demo-parent"}

from datetime import timezone, timedelta
TZ = timezone(timedelta(hours=5))
router = APIRouter(prefix="/api/v1/curfew", tags=["curfew"])

DEFAULT_BLOCKED = [
    "com.google.android.youtube",
    "com.instagram.android",
    "com.zhiliaoapp.musically",
    "com.ss.android.ugc.trill",
    "com.android.vending",
]

ALWAYS_ALLOWED = [
    "com.android.dialer",
    "com.google.android.dialer",
    "com.android.mms",
    "com.google.android.apps.messaging",
    "com.android.settings",
    "org.telegram.messenger",  # ota-ona bilan aloqa; xohlasangiz olib tashlang
]


class CurfewPolicy(BaseModel):
    child_id: str
    enabled: bool = True
    start: str = "22:00"
    end: str = "06:30"
    blocked_packages: list[str] = Field(default_factory=lambda: list(DEFAULT_BLOCKED))
    allowed_packages: list[str] = Field(default_factory=lambda: list(ALWAYS_ALLOWED))


POLICIES: dict[str, CurfewPolicy] = {}


def _t(value: str) -> time:
    h, m = value.split(":")
    return time(int(h), int(m))


def is_curfew_active(policy: CurfewPolicy, now: datetime | None = None) -> bool:
    now = now or datetime.now(TZ)
    start, end = _t(policy.start), _t(policy.end)
    current = now.timetz().replace(tzinfo=None) if False else now.time()
    if start <= end:
        return start <= current < end
    return current >= start or current < end


@router.put("/policy")
async def save_policy(dto: CurfewPolicy, user: dict = Depends(get_current_user)):
    POLICIES[dto.child_id] = dto
    return {"ok": True, "policy": dto.model_dump()}


@router.get("/policy/{child_id}")
async def get_policy(child_id: str, user: dict = Depends(get_current_user)):
    policy = POLICIES.get(child_id) or CurfewPolicy(child_id=child_id)
    return {
        "policy": policy.model_dump(),
        "active_now": is_curfew_active(policy),
        "server_time": datetime.now(TZ).isoformat(),
    }


class EnforceRequest(BaseModel):
    child_id: str
    foreground_package: str


@router.post("/enforce")
async def enforce(dto: EnforceRequest, user: dict = Depends(get_current_user)):
    """Android xizmati har 15-30s chaqiradi."""
    policy = POLICIES.get(dto.child_id) or CurfewPolicy(child_id=dto.child_id)
    active = policy.enabled and is_curfew_active(policy)
    pkg = dto.foreground_package
    if pkg in policy.allowed_packages:
        block = False
    else:
        block = active and (not policy.blocked_packages or pkg in policy.blocked_packages)
    return {
        "block": block,
        "active": active,
        "reason": "curfew" if block else "ok",
        "message_uz": "Ekran vaqti tugadi. Ertaga ertalab ochiladi." if block else "",
    }
