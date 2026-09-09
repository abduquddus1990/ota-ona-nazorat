from fastapi import APIRouter, Depends, HTTPException, status, Query
from config import settings
from security.telegram_auth import require_family_access
from supabase import create_client, Client

router = APIRouter(prefix="/api/v1/parent", tags=["Parent Dashboard"])
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)


@router.get("/children")
async def get_linked_children(
    family_code: str = Query(..., description="Oilaning 6 xonali kodi"),
    auth: dict = Depends(require_family_access),
):
    """Oila kodiga ulangan barcha (faol) farzand qurilmalari ro'yxati."""
    links = (
        supabase.table("child_pairings")
        .select("child_id, child_name, device_label, source, paired_at, last_seen_at")
        .eq("family_code", family_code)
        .eq("is_active", True)
        .execute()
    )
    return {"children": links.data}


@router.get("/analytics")
async def get_child_analytics(
    family_code: str = Query(..., description="Oilaning 6 xonali kodi"),
    child_id: str = Query(..., description="Farzand identifikatori (child_pairings.child_id)"),
    auth: dict = Depends(require_family_access),
):
    """Muayyan farzandning so'nggi ekran vaqti va xavfsizlik tahlili."""
    # 1. Zero-Trust tekshiruv: bu farzand haqiqatan ham shu oilaga faol ulangan?
    link_check = (
        supabase.table("child_pairings")
        .select("id")
        .eq("family_code", family_code)
        .eq("child_id", child_id)
        .eq("is_active", True)
        .execute()
    )
    if not link_check.data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Kirish taqiqlangan: bu farzand ushbu oila kodiga ulangan emas.",
        )

    # 2. Telemetriya loglari
    logs = (
        supabase.table("device_telemetry")
        .select(
            "id, app_package_name, category, screen_time_seconds, anonymized_summary, risk_rating, latitude, longitude, created_at"
        )
        .eq("family_code", family_code)
        .eq("child_id", child_id)
        .order("created_at", desc=True)
        .limit(30)
        .execute()
    )

    total_screen_seconds = sum(item.get("screen_time_seconds", 0) for item in logs.data)
    total_screen_hours = round(total_screen_seconds / 3600, 1)

    return {
        "child_id": child_id,
        "total_screen_hours": total_screen_hours,
        "logs_count": len(logs.data),
        "activities": logs.data,
    }
