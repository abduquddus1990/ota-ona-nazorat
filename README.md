# Shield Parental Guard & AI-Analytics (Zero-Trust Kiberxavfsizlik Tizimi)

Ushbu tizim ota-ona nazorati, ekran vaqti balansi va sun'iy intellekt tahlili uchun mo'ljallangan ishlab chiqarishga tayyor (Production-ready) to'liq dasturiy ta'minot to'plamidir.

---

## Loyiha Tuzilishi

```
D:\ (bog'langan: C:\Users\Surface\.gemini\antigravity\scratch\ota-ona-nazorat\)
├── database/
│   └── 01_supabase_schema_and_rls.sql      # Supabase PostgreSQL + RLS siyosatlari
├── android/                                 # Kotlin mijoz ilovasi
│   ├── build.gradle.kts
│   └── app/
│       ├── build.gradle.kts
│       └── src/main/
│           ├── AndroidManifest.xml
│           ├── res/xml/
│           │   ├── network_security_config.xml
│           │   └── accessibility_service_config.xml
│           └── java/com/shield/parentalguard/
│               ├── ParentalGuardApp.kt
│               ├── security/SecurityKeyStoreManager.kt
│               ├── services/PersistentGuardService.kt
│               ├── services/CompliantAccessibilityService.kt
│               ├── receivers/BootCompletedReceiver.kt
│               ├── workers/TelemetrySyncWorker.kt
│               └── network/EncryptedNetworkClient.kt
├── backend/                                 # FastAPI + PII AI Sanitizer
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── render.yaml
│   ├── config.py
│   ├── main.py
│   ├── security/
│   │   ├── pii_sanitizer.py
│   │   ├── auth_middleware.py
│   │   └── crypto_utils.py
│   └── routes/
│       ├── telemetry.py
│       ├── parent_dashboard.py
│       └── emaktab_sync.py
├── telegram_miniapp/                        # Telegram Mini App Dashboard
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── HARDENING_GUIDE.md                       # Kiberxavfsizlik qo'llanmasi
└── README.md
```

---

## O'rnatish va Ishga Tushirish

### 1. Ma'lumotlar Bazasi (Supabase)
1. Supabase SQL Editor paneliga kiring.
2. `database/01_supabase_schema_and_rls.sql` fayli tarkibini nusxalab ishga tushiring.

### 2. Backend Server (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Telegram Mini App
`telegram_miniapp` papkasidagi fayllarni Vercel, Netlify yoki Cloudflare Pages xizmatiga joylashtiring va Telegram BotFather orqali Mini App menyusiga ulang.

### 4. Android Ilovasi
`android` papkasini Android Studio muhitida oching va qurilmaga o'rnating.
