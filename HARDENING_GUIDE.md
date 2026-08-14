# Kiberxavfsizlik va Hardening Qo'llanmasi (Zero-Trust Production Guide)

Ushbu qo'llanma **Shield Parental Guard** tizimining barcha komponentlarini ishlab chiqarish muhitida (Production) xavfsiz va uzluksiz ishlatish bo'yicha qat'iy yo'riqnomadir.

---

## 1. Android Endpoint Hardening (Zero-Spyware & Anti-Crash)

1. **Shaffof Bildirishnoma (Persistent Notification):**
   - Android 14 va 15 talablariga binoan, ilova orqa fonda ishlaganda doimiy bildirishnoma ko'rsatiladi (`FOREGROUND_SERVICE_TYPE_DATA_SYNC`).
   - Bu Android Vitals tizimi tomonidan ilovani "shubhali fonda yashirin faoliyat" deb tasniflashining va agressiv o'ldirilishining oldini oladi.

2. **Hardware Keystore (TEE/SE):**
   - Barcha telemetriya va ekran tahlili ma'lumotlari qurilmadan tashqariga chiqmasdan oldin apparat darajasida `AES-256-GCM` bilan shifrlanadi.
   - Qurilma xotirasida ochiq (plaintext) holatda hech qanday log qoldirilmaydi.

3. **Certificate Pinning & TLS 1.3:**
   - `network_security_config.xml` orqali faqat xavfsiz shifrlangan TLS 1.3 protokoli majburlanadi. Cleartext (HTTP) butunlay bloklangan.

---

## 2. Backend & Supabase Hardening (OWASP API Security)

1. **Row Level Security (RLS):**
   - Supabase PostgreSQL bazasida barcha 4 ta asosiy jadvalda RLS yoqilgan.
   - Ota-ona faqat `family_links` jadvalida unga tegishli bo'lgan `child_id` telemetriyasini o'qiy oladi.
   - Farzand qurilmasi boshqa foydalanuvchilar ma'lumotlarini o'qiy olmaydi yoki tahrirlay olmaydi (`Telemetry is immutable`).

2. **AI Sandboxing va PII Tozalash:**
   - Farzand qurilmasidan kelgan qidiruv matnlari sun'iy intellekt (OpenAI/Claude) API'lariga yuborilishidan oldin `ZeroTrustPIISanitizer` orqali to'liq tozalanadi (Telefon raqamlar, Karta raqamlari, JShShIR, Ismlar va Emaillar niqoblanadi).

3. **OWASP Security Headers:**
   - FastAPI serverida `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` va qat'iy `Content-Security-Policy` yoqilgan.

---

## 3. Render.com Free-Tier Uzluksiz Ishlashini Ta'minlash (Keepalive)

Render.com Free Web Service 15 daqiqa murojaat bo'lmasa uxlab qoladi (hibernation). Buning oldini olish uchun:
1. [cron-job.org](https://cron-job.org) saytida bepul hisob oching.
2. Har **10 daqiqada** serveringizning `/healthz` manziliga `GET` so'rovi yuborishni sozlang:
   ```
   GET https://your-service-name.onrender.com/healthz
   ```
3. Bu xizmatning uzluksiz, doimiy (24/7) faol turishini ta'minlaydi.
