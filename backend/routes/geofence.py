"""Maktab/uy geozona va kechikish ogohlantirishi."""
from __future__ import annotations

import math
from datetime import datetime, time
from typing import Optional


from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

try:
    raise ImportError("local-demo")
except ImportError:  # standalone
    def get_current_user():
        return {"sub": "demo-parent", "role": "parent"}

from datetime import timezone, timedelta
TZ = timezone(timedelta(hours=5))
router = APIRouter(prefix="/api/v1/geo", tags=["geofence"])


class GeoPoint(BaseModel):
    lat: float = Field(..., ge=-90, le=90)
    lng: float = Field(..., ge=-180, le=180)


class ZoneUpsert(BaseModel):
    child_id: str
    name: str  # uy | maktab | custom
    center: GeoPoint
    radius_m: int = Field(150, ge=40, le=800)
    arrive_by: Optional[str] = None  # "08:00"
    leave_after: Optional[str] = None  # "16:30"
    weekdays: list[int] = Field(default_factory=lambda: [0, 1, 2, 3, 4])  # Mon=0


class LocationPing(BaseModel):
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


# Demo in-memory store. Production: school_zones + location_events jadvallari.
ZONES: dict[str, list[ZoneUpsert]] = {}
LAST_PING: dict[str, LocationPing] = {}
ALERTS: list[dict] = []


@router.post("/zones")
async def upsert_zone(dto: ZoneUpsert, user: dict = Depends(get_current_user)):
    ZONES.setdefault(dto.child_id, [])
    ZONES[dto.child_id] = [z for z in ZONES[dto.child_id] if z.name != dto.name] + [dto]
    return {"ok": True, "zones": [z.model_dump() for z in ZONES[dto.child_id]]}


@router.post("/ping")
async def ingest_ping(dto: LocationPing, user: dict = Depends(get_current_user)):
    now = dto.recorded_at or datetime.now(TZ)
    if now.tzinfo is None:
        now = now.replace(tzinfo=TZ)
    LAST_PING[dto.child_id] = dto
    fired = []
    for zone in ZONES.get(dto.child_id, []):
        dist = haversine_m(dto.point, zone.center)
        inside = dist <= zone.radius_m
        weekday = now.weekday()
        if zone.arrive_by and weekday in zone.weekdays:
            deadline = datetime.combine(now.date(), parse_hhmm(zone.arrive_by), TZ)
            grace = 5  # daqiqa
            if now >= deadline and not inside:
                minutes_late = int((now - deadline).total_seconds() // 60)
                if minutes_late >= grace:
                    alert = {
                        "type": "late_arrival",
                        "child_id": dto.child_id,
                        "zone": zone.name,
                        "minutes_late": minutes_late,
                        "distance_m": int(dist),
                        "at": now.isoformat(),
                        "message_uz": (
                            f"Farzand {zone.name} zonasiga "
                            f"{minutes_late} daqiqa kechikmoqda "
                            f"(~{int(dist)} m uzoqda)."
                        ),
                    }
                    ALERTS.append(alert)
                    fired.append(alert)
    return {"ok": True, "alerts": fired}


@router.get("/alerts/{child_id}")
async def list_alerts(child_id: str, user: dict = Depends(get_current_user)):
    return {"alerts": [a for a in ALERTS if a["child_id"] == child_id][-50:]}
