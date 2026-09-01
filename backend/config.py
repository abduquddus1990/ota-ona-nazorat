import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Shield Parental Guard Backend"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")

    # Supabase Konfiguratsiyasi
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://your-project.supabase.co")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "your-service-role-key")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "your-supabase-jwt-secret")

    # AI Engine Konfiguratsiyasi (OpenAI / Anthropic Claude — hozircha ishlatilmaydi, Gemini ishlatiladi)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

    # CORS Sozlamalari — TUZATILDI: haqiqiy Mini App va backend manzillari qo'shildi
    ALLOWED_ORIGINS: list = [
        "https://abduquddus1990.github.io",
        "https://qalqon-backend.onrender.com",
        "https://web.telegram.org",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:8000",
        "http://localhost:8000",
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
