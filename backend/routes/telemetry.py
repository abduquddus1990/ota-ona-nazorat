from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
from config import settings
from security.telegram_auth import require_family_access
from security.pii_sanitizer import pii_sanitizer
from supabase import create_client, Client

router = APIRouter(prefix="/api/v1/telemetry", tags=["Telemetry"])
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

class TelemetryIngestRequest(BaseModel):
    family_code: str
    child_id: str
    app_package_name: str
    category: str = "General"
    screen_time_seconds: int = Field(ge=0)
    encrypted_payload: str
    iv: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    raw_query_text: Optional[str] = None

@router.post("/ingest", status_code=status.HTTP_201_CREATED)
async def ingest_telemetry(
    dto: TelemetryIngestRequest,
    auth: dict = Depends(require_family_access)
):
    child_id = dto.child_id
    if not child_id:
        raise HTTPException(status_code=401, detail="Foydalanuvchi identifikatori topilmadi.")

    anonymized_summary = None
    risk_level = "safe"

    # 1. PII Sanitization (AI'ga uzatishdan oldin tozalash)
    if dto.raw_query_text:
        clean_text, stats = pii_sanitizer.sanitize(dto.raw_query_text)
        anonymized_summary = f"Tozalangan tahlil: {clean_text[:120]}"

        # Risk qoidalarini tekshirish
        toxic_keywords = ["qimor", "suicide", "zo'ravonlik", "porn", "narkotik", "terror"]
        if any(keyword in clean_text.lower() for keyword in toxic_keywords):
            risk_level = "high"

    # 2. Supabase ma'lumotlar bazasiga yozish (device_telemetry — Telegram-native,
    # family_code/child_id TEXT kalitlar bilan; qarang: database/03_qalqon_realtime_features.sql)
    try:
        response = supabase.table("device_telemetry").insert({
            "family_code": dto.family_code,
            "child_id": child_id,
            "app_package_name": dto.app_package_name,
            "category": dto.category,
            "screen_time_seconds": dto.screen_time_seconds,
            "anonymized_summary": anonymized_summary,
            "risk_rating": risk_level,
            "encrypted_payload": dto.encrypted_payload,
            "iv": dto.iv,
            "latitude": dto.latitude,
            "longitude": dto.longitude
        }).execute()

        return {
            "status": "success",
            "log_id": response.data[0]["id"] if response.data else None,
            "risk_assessed": risk_level
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Telemetriyani saqlashda xatolik: {str(e)}"
        )
