"""Uy vazifasi holati — bola bajardi, ota-ona ko'radi.

Supabase'ning homework_items jadvaliga yozadi, Telegram Mini App
initData orqali autentifikatsiya qilinadi (demo-stub emas).
"""
from __future__ import annotations

from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from config import settings
from security.telegram_auth import require_family_access
from supabase import create_client, Client

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

TZ = timezone(timedelta(hours=5))
router = APIRouter(prefix="/api/v1/homework", tags=["homework"])


class HomeworkItem(BaseModel):
    id: str | None = None
    family_code: str
    child_id: str
    grade: int = Field(..., ge=1, le=11)
    subject: str
    exercise: str  # "35-mashq"
    source: str = "ai_session"  # ai_session | parent | teacher
    status: str = "assigned"  # assigned | in_progress | done | needs_review
    summary_uz: str = ""


@router.post("/upsert")
async def upsert(item: HomeworkItem, auth: dict = Depends(require_family_access)):
    row = {
        "family_code": item.family_code,
        "child_id": item.child_id,
        "grade": item.grade,
        "subject": item.subject,
        "title": item.exercise,
        "done": item.status == "done",
    }
    try:
        if item.id:
            supabase.table("homework_items").update(row).eq("id", item.id).execute()
        else:
            resp = supabase.table("homework_items").insert(row).execute()
            item.id = resp.data[0]["id"] if resp.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Uy vazifasini saqlashda xatolik: {e}")
    return {"ok": True, "item": item.model_dump()}


@router.post("/{hw_id}/done")
async def mark_done(hw_id: str, auth: dict = Depends(require_family_access)):
    try:
        resp = (
            supabase.table("homework_items")
            .update({"done": True, "done_at": datetime.now(TZ).isoformat()})
            .eq("id", hw_id)
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Yangilashda xatolik: {e}")

    if not resp.data:
        return {"ok": False, "error": "not_found"}

    row = resp.data[0]
    return {
        "ok": True,
        "parent_event": {
            "type": "homework_done",
            "family_code": row["family_code"],
            "child_id": row["child_id"],
            "at": datetime.now(TZ).isoformat(),
            "message_uz": f"{row['grade']}-sinf {row['subject']}: {row['title']} bajarildi.",
        },
    }


@router.get("/child/{family_code}/{child_id}")
async def list_for_parent(family_code: str, child_id: str, auth: dict = Depends(require_family_access)):
    resp = (
        supabase.table("homework_items")
        .select("*")
        .eq("family_code", family_code)
        .eq("child_id", child_id)
        .order("created_at", desc=True)
        .limit(100)
        .execute()
    )
    return {"items": resp.data}
