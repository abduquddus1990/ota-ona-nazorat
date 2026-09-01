"""Uy vazifasi holati â€” bola bajardi, ota-ona koâ€˜radi."""
from __future__ import annotations

from datetime import datetime


from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

try:
    raise ImportError("local-demo")
except ImportError:
    def get_current_user():
        return {"sub": "demo", "role": "student"}

from datetime import timezone, timedelta
TZ = timezone(timedelta(hours=5))
router = APIRouter(prefix="/api/v1/homework", tags=["homework"])


class HomeworkItem(BaseModel):
    id: str | None = None
    child_id: str
    grade: int = Field(..., ge=1, le=11)
    subject: str
    exercise: str  # "35-mashq"
    source: str = "ai_session"  # ai_session | parent | teacher
    status: str = "assigned"  # assigned | in_progress | done | needs_review
    summary_uz: str = ""


ITEMS: dict[str, HomeworkItem] = {}
_seq = 0


@router.post("/upsert")
async def upsert(item: HomeworkItem, user: dict = Depends(get_current_user)):
    global _seq
    if not item.id:
        _seq += 1
        item.id = f"hw_{_seq}"
    ITEMS[item.id] = item
    return {"ok": True, "item": item.model_dump()}


@router.post("/{hw_id}/done")
async def mark_done(hw_id: str, user: dict = Depends(get_current_user)):
    item = ITEMS.get(hw_id)
    if not item:
        return {"ok": False, "error": "not_found"}
    item.status = "done"
    ITEMS[hw_id] = item
    return {
        "ok": True,
        "parent_event": {
            "type": "homework_done",
            "child_id": item.child_id,
            "at": datetime.now(TZ).isoformat(),
            "message_uz": (
                f"{item.grade}-sinf {item.subject}: {item.exercise} bajarildi."
            ),
        },
    }


@router.get("/child/{child_id}")
async def list_for_parent(child_id: str, user: dict = Depends(get_current_user)):
    rows = [i.model_dump() for i in ITEMS.values() if i.child_id == child_id]
    return {"items": rows}
