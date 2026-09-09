"""Komendant soati — qaysi ilovalar qachon yopiladi.

Supabase'ning curfew_policies jadvaliga yozadi, Telegram Mini App
initData orqali autentifikatsiya qilinadi (demo-stub emas).
"""
from __future__ import annotations

from datetime import datetime, time, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from config import settings
from security.telegram_auth import require_family_access
from supabase import create_client, Client

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

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
    family_code: str
    child_id: str
    enabled: bool = True
    start: str = "22:00"
    end: str = "06:30"
    blocked_packages: list[str] = Field(default_factory=lambda: list(DEFAULT_BLOCKED))
    allowed_packages: list[str] = Field(default_factory=lambda: list(ALWAYS_ALLOWED))


def _t(value: str) -> time:
    h, m = value.split(":")
    return time(int(h), int(m))


def is_curfew_active(start: str, end: str, now: datetime | None = None) -> bool:
    now = now or datetime.now(TZ)
    t_start, t_end = _t(start), _t(end)
    current = now.time()
    if t_start <= t_end:
        return t_start <= current < t_end
    return current >= t_start or current < t_end


def _row_to_policy(row: dict) -> CurfewPolicy:
    return CurfewPolicy(
        family_code=row["family_code"],
        child_id=row["child_id"],
        enabled=row.get("enabled", True),
        start=row.get("start_time", "22:00"),
        end=row.get("end_time", "06:30"),
        blocked_packages=row.get("blocked_apps") or list(DEFAULT_BLOCKED),
        allowed_packages=row.get("allowed_apps") or list(ALWAYS_ALLOWED),
    )


@router.put("/policy")
async def save_policy(dto: CurfewPolicy, auth: dict = Depends(require_family_access)):
    row = {
        "family_code": dto.family_code,
        "child_id": dto.child_id,
        "enabled": dto.enabled,
        "blocked_apps": dto.blocked_packages,
        "allowed_apps": dto.allowed_packages,
        "start_time": dto.start,
        "end_time": dto.end,
        "updated_at": datetime.now(TZ).isoformat(),
    }
    try:
        supabase.table("curfew_policies").upsert(
            row, on_conflict="family_code,child_id"
        ).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Qoidani saqlashda xatolik: {e}")
    return {"ok": True, "policy": dto.model_dump()}


@router.get("/policy/{family_code}/{child_id}")
async def get_policy(family_code: str, child_id: str, auth: dict = Depends(require_family_access)):
    resp = (
        supabase.table("curfew_policies")
        .select("*")
        .eq("family_code", family_code)
        .eq("child_id", child_id)
        .limit(1)
        .execute()
    )
    policy = (
        _row_to_policy(resp.data[0])
        if resp.data
        else CurfewPolicy(family_code=family_code, child_id=child_id)
    )
    return {
        "policy": policy.model_dump(),
        "active_now": policy.enabled and is_curfew_active(policy.start, policy.end),
        "server_time": datetime.now(TZ).isoformat(),
    }


class EnforceRequest(BaseModel):
    family_code: str
    child_id: str
    foreground_package: str


@router.post("/enforce")
async def enforce(dto: EnforceRequest, auth: dict = Depends(require_family_access)):
    """Android xizmati har 15-30s chaqiradi."""
    resp = (
        supabase.table("curfew_policies")
        .select("*")
        .eq("family_code", dto.family_code)
        .eq("child_id", dto.child_id)
        .limit(1)
        .execute()
    )
    policy = (
        _row_to_policy(resp.data[0])
        if resp.data
        else CurfewPolicy(family_code=dto.family_code, child_id=dto.child_id)
    )
    active = policy.enabled and is_curfew_active(policy.start, policy.end)
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
