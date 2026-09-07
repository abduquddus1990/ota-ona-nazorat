# Qalqon AI P0/P1 patch

## Fayllar
- backend/ai_engine.py — hardcoded Gemini kalit olib tashlandi, IndentationError tuzatildi
- backend/security/telegram_auth.py — YANGI: initData verify + rate limit
- backend/routes/vision_tutor.py — auth Depends, /vision + /chat, 8MB limit
- backend/prompts/repetitor_pro.txt — vision/text-only (fake RAG yo'q)
- backend/render.yaml — GEMINI_*, BOT_TOKEN, rate limit
- telegram_miniapp/app.js — initData header, /chat, subject, XSS escape
- telegram_miniapp/index.html — fan select
- supabase/functions/ota-ona-bot/index.ts — hardcoded BOT_TOKEN fallback olib tashlandi

## Deploy oldidan (QIYMATLARNI CHATGA YOZMA)
1. AI Studio: eski Gemini kalitni revoke + yangi kalit
2. Render env: GEMINI_API_KEY, GEMINI_MODEL=gemini-2.5-flash, BOT_TOKEN (yoki MAIN_BOT_TOKEN)
3. BotFather: agar bot token sizib chiqqan bo'lsa — regenerate, Supabase secrets yangila
4. Supabase function ota-ona-bot redeploy
5. TUTOR_AUTH_OPTIONAL qo'yma (production)

## Test
- Mini App ichidan (Telegram) rasm + matn
- Brauzerdan to'g'ridan so'rov 401 bo'lishi kerak (initData yo'q)
