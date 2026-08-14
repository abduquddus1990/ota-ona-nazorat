from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routes.telemetry import router as telemetry_router
from routes.parent_dashboard import router as parent_router
from routes.emaktab_sync import router as emaktab_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url=None if settings.ENVIRONMENT == "production" else "/docs",
    redoc_url=None
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

# 2. CORS Sozlamalari (Faqat Telegram Mini App va ishonchli domenlar)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# 3. Routerlarni ulash
app.include_router(telemetry_router)
app.include_router(parent_router)
app.include_router(emaktab_router)

# 4. Free-Tier Liveness / Keepalive Endpoint (Hibernation'ga yo'l qo'ymaslik)
@app.get("/healthz", tags=["Health"])
async def healthz():
    return {
        "status": "healthy",
        "service": "Parental Guard AI Engine",
        "zero_trust": "enforced"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
