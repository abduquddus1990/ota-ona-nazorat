from fastapi import APIRouter, Depends, HTTPException, status, Query
from config import settings
from security.auth_middleware import get_current_user
from supabase import create_client, Client

router = APIRouter(prefix="/api/v1/parent", tags=["Parent Dashboard"])
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

@router.get("/children")
async def get_linked_children(user: dict = Depends(get_current_user)):
    """
    Ota-onaga biriktirilgan barcha farzandlar ro'yxatini olish.
    """
    parent_id = user.get("sub")
    
    links = supabase.table("family_links")\
        .select("child_id, is_active, created_at, profiles!family_links_child_id_fkey(full_name, email)")\
        .eq("parent_id", parent_id)\
        .eq("is_active", True)\
        .execute()
    
    return {"children": links.data}

@router.get("/analytics")
async def get_child_analytics(
    child_id: str = Query(..., description="Farzandning UUID identifikatori"),
    user: dict = Depends(get_current_user)
):
    """
    Muayyan farzandning so'nggi 24 soatlik xavfsizlik va ekranni tahlil qilish ma'lumotlari.
    """
    parent_id = user.get("sub")

    # 1. Zero-Trust Access Check: Bu ota-ona ushbu bolaga haqiqatan ham biriktirilganmi?
    link_check = supabase.table("family_links").select("id")\
        .eq("parent_id", parent_id)\
        .eq("child_id", child_id)\
        .eq("is_active", True)\
        .execute()

    if not link_check.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Kirish taqiqlangan: Bu profil sizning oilaviy hisobingizga tegishli emas."
        )

    # 2. Telemetriya loglarini olish
    logs = supabase.table("telemetry_logs").select(
        "id, app_package_name, category, screen_time_seconds, anonymized_summary, risk_rating, latitude, longitude, created_at"
    ).eq("child_id", child_id).order("created_at", desc=True).limit(30).execute()

    # 3. Umumiy ekran vaqtini hisoblash
    total_screen_seconds = sum(item.get("screen_time_seconds", 0) for item in logs.data)
    total_screen_hours = round(total_screen_seconds / 3600, 1)

    return {
        "child_id": child_id,
        "total_screen_hours": total_screen_hours,
        "logs_count": len(logs.data),
        "activities": logs.data
    }
