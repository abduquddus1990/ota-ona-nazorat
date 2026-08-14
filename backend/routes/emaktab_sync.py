from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from config import settings
from security.auth_middleware import get_current_user
from supabase import create_client, Client
import datetime

router = APIRouter(prefix="/api/v1/emaktab", tags=["e-Maktab Sync"])
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

class SchoolSyncDTO(BaseModel):
    child_id: str
    encrypted_token: str
    attendance_summary: dict
    grades_summary: dict

@router.post("/sync")
async def sync_school_records(
    dto: SchoolSyncDTO,
    user: dict = Depends(get_current_user)
):
    """
    e-Maktab baholari va davomat ma'lumotlarini shifrlangan holatda keshga saqlash.
    """
    parent_id = user.get("sub")

    # Bog'lanishni tekshirish
    link_check = supabase.table("family_links").select("id")\
        .eq("parent_id", parent_id)\
        .eq("child_id", dto.child_id)\
        .eq("is_active", True)\
        .execute()

    if not link_check.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Faqat o'z farzandingizning e-Maktab ma'lumotlarini sinxronizatsiya qilishingiz mumkin."
        )

    # Bazaga yozish yoki yangilash
    upsert_data = {
        "child_id": dto.child_id,
        "encrypted_auth_token": dto.encrypted_token,
        "attendance_data": dto.attendance_summary,
        "grades_data": dto.grades_summary,
        "last_synced_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

    res = supabase.table("school_records").upsert(upsert_data).execute()
    return {"status": "synced", "last_synced": upsert_data["last_synced_at"]}
