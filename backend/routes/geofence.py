"""Maktab/uy geozona va kechikish ogohlantirishi.

Supabase'ga yozadi (geofence_zones, location_pings, geofence_alerts),
Telegram Mini App initData orqali autentifikatsiya qilinadi
(backend/security/telegram_auth.py — bu Qalqon AI'ning haqiqiy auth
mexanizmi, chunki foydalanuvchilar Supabase Auth orqali emas, Telegram
orqali kirishadi).
"""
from __future__ import annotations

import math
from datetime import datetime, time, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from config import settings
from security.telegram_auth import require_family_access
from supabase import create_client, Client

supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

TZ = timezone(timedelta(hours=5))
router = APIRouter(prefix="/api/v1/geo", tags=["geofence"])


class GeoPoint(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)


class ZoneUpsert(BaseModel):
    family_code: str
    child_id: str
    name: str  # uy | maktab | custom
    center: GeoPoint
    radius_m: int = Field(150, ge=40, le=800)
    arrive_by: Optional[str] = None  # "08:00"
    leave_after: Optional[str] = None  # "16:30"
    weekdays: list[int] = Field(default_factory=lambda: [0, 1, 2, 3, 4])  # Mon=0


class LocationPing(BaseModel):
    family_code: str
    child_id: str
    point: GeoPoint
    accuracy_m: Optional[float] = None
    recorded_at: Optional[datetime] = None


def haversine_m(a: GeoPoint, b: GeoPoint) -> float:
    r = 6371000.0
    p1, p2 = math.radians(a.lat), math.radians(b.lat)
    dphi = math.radians(b.lat - a.lat)
    dl = math.radians(b.lng - a.lng)
    h = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


def parse_hhmm(value: str) -> time:
    h, m = value.split(":")
    return time(int(h), int(m))


@router.post("/zones")
async def upsert_zone(dto: ZoneUpsert, auth: dict = Depends(require_family_access)):
    row = {
        "family_code": dto.family_code,
        "child_id": dto.child_id,
        "name": dto.name,
        "center_lat": dto.center.lat,
        "center_lng": dto.center.lng,
        "radius_m": dto.radius_m,
        "arrive_by": dto.arrive_by,
        "leave_after": dto.leave_after,
        "weekdays": dto.weekdays,
        "updated_at": datetime.now(TZ).isoformat(),
    }
    try:
        supabase.table("geofence_zones").upsert(
            row, on_conflict="family_code,child_id,name"
        ).execute()
        zones = (
            supabase.table("geofence_zones")
            .select("*")
            .eq("family_code", dto.family_code)
            .eq("child_id", dto.child_id)
            .execute()
        )
        return {"ok": True, "zones": zones.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Zonani saqlashda xatolik: {e}")


@router.post("/ping")
async def ingest_ping(dto: LocationPing, auth: dict = Depends(require_family_access)):
    now = dto.recorded_at or datetime.now(TZ)
    if now.tzinfo is None:
        now = now.replace(tzinfo=TZ)

    try:
        supabase.table("location_pings").insert({
            "family_code": dto.family_code,
            "child_id": dto.child_id,
            "lat": dto.point.lat,
            "lng": dto.point.lng,
            "accuracy_m": dto.accuracy_m,
            "recorded_at": now.isoformat(),
        }).execute()

        zones_resp = (
            supabase.table("geofence_zones")
            .select("*")
            .eq("family_code", dto.family_code)
            .eq("child_id", dto.child_id)
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lokatsiyani saqlashda xatolik: {e}")

    fired = []
    for zone in zones_resp.data or []:
        zone_point = GeoPoint(lat=zone["center_lat"], lng=zone["center_lng"])
        dist = haversine_m(dto.point, zone_point)
        inside = dist <= zone["radius_m"]
        weekday = now.weekday()
        arrive_by = zone.get("arrive_by")
        weekdays = zone.get("weekdays") or [0, 1, 2, 3, 4]
        if arrive_by and weekday in weekdays:
            deadline = datetime.combine(now.date(), parse_hhmm(arrive_by), TZ)
            grace = 5  # daqiqa
            if now >= deadline and not inside:
                minutes_late = int((now - deadline).total_seconds() // 60)
                if minutes_late >= grace:
                    alert = {
                        "family_code": dto.family_code,
                        "child_id": dto.child_id,
                        "zone_name": zone["name"],
                        "alert_type": "late_arrival",
                        "minutes_late": minutes_late,
                        "distance_m": int(dist),
                        "message": (
                            f"Farzand {zone['name']} zonasiga "
                            f"{minutes_late} daqiqa kechikmoqda "
                            f"(~{int(dist)} m uzoqda)."
                        ),
                    }
                    try:
                        supabase.table("geofence_alerts").insert(alert).execute()
                    except Exception:
                        pass  # alert yozilmasa ham ping saqlangani muhim
                    fired.append(alert)
    return {"ok": True, "alerts": fired}


@router.get("/last/{family_code}/{child_id}")
async def last_location(family_code: str, child_id: str, auth: dict = Depends(require_family_access)):
    """So'rov bo'yicha farzandning oxirgi ma'lum joylashuvi (Lokatsiya v1)."""
    resp = (
        supabase.table("location_pings")
        .select("*")
        .eq("family_code", family_code)
        .eq("child_id", child_id)
        .order("recorded_at", desc=True)
        .limit(1)
        .execute()
    )
    if not resp.data:
        raise HTTPException(status_code=404, detail="Hali lokatsiya kelmagan")
    return {"ok": True, "location": resp.data[0]}


@router.get("/alerts/{family_code}/{child_id}")
async def list_alerts(family_code: str, child_id: str, auth: dict = Depends(require_family_access)):
    resp = (
        supabase.table("geofence_alerts")
        .select("*")
        .eq("family_code", family_code)
        .eq("child_id", child_id)
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    return {"alerts": resp.data}
