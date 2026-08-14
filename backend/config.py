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
    
    # AI Engine Konfiguratsiyasi (OpenAI / Anthropic Claude)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

    # CORS Sozlamalari
    ALLOWED_ORIGINS: list = [
        "https://your-telegram-miniapp.vercel.app",
        "https://web.telegram.org",
        "http://localhost:3000",
        "http://localhost:5173"
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
