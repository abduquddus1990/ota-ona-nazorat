"""Qalqon AI backend — barcha routerlar birlashtirilgan (production).

TUZATISHLAR (2026-08-31):
1) Barcha 7 router (geofence, curfew, homework, vision_tutor, telemetry,
   parent_dashboard, emaktab_sync) birlashtirildi. Avval faqat 3 tasi
   (telemetry/parent_dashboard/emaktab_sync) ulangan edi — shu sabab
   /api/v1/tutor/vision umuman ishlamasdi.
2) StaticFiles mount ("/" ga telegram_miniapp'ni ulash) OLIB TASHLANDI.
   Sabab: Mini App allaqachon GitHub Pages orqali alohida joylashtirilgan;
   bu yerda qoldirilsa, mos router topilmagan har qanday POST so'rovi
   (masalan /api/v1/tutor/vision) StaticFiles'ga tushib, 405 xato berardi.
3) Har bir router xato bo'lsa ham butun serverni yiqitmasin uchun
   xavfsiz yuklash (_include) barcha routerlar uchun qo'llanildi.
"""
from dotenv import load_dotenv
load_dotenv()

import os
import importlib
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url=None if settings.ENVIRONMENT == "production" else "/docs",
    redoc_url=None,
)

# 1. OWASP Security Headers Middleware
@app.middleware("http")
async def apply_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# 2. CORS Sozlamalari (config.py > ALLOWED_ORIGINS orqali boshqariladi)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# 3. Routerlarni xavfsiz (bittasi xato bersa ham server yiqilmaydigan) usulda ulash
def _include(modname: str) -> None:
    try:
        mod = importlib.import_module(modname)
        app.include_router(mod.router)
        print(f"OK router {modname}")
    except Exception as exc:
        print(f"SKIP router {modname}: {exc}")

_include("routes.geofence")
_include("routes.curfew")
_include("routes.homework")
_include("routes.vision_tutor")
_include("routes.telemetry")
_include("routes.parent_dashboard")
_include("routes.emaktab_sync")

# 4. Free-Tier Liveness / Keepalive Endpoint (Hibernation'ga yo'l qo'ymaslik)
@app.get("/healthz", tags=["Health"])
async def healthz():
    return {
        "status": "healthy",
        "service": "Parental Guard AI Engine",
        "zero_trust": "enforced",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), reload=True)
