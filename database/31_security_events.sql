-- ============================================================================
-- XAVFSIZLIK — 2-BOSQICH ("professional daraja", 2026-10-08)
--
-- 1) security_events — oiladagi muhim amallar jurnali: kim, qachon, qaysi
--    usul bilan kirdi; qaysi qurilma ulandi yoki uzildi; parol qachon
--    almashdi. Ota-ona uni panelda ko'radi ("So'nggi voqealar"), va biror
--    narsa buzilganda nima bo'lganini tiklash mumkin bo'ladi.
--
-- 2) web_sessions.login_method — kirish qaysi yo'l bilan bo'lgani (parol,
--    Google, bot kodi, Telegram tasdig'i). Ota-ona "Kirishlar" ro'yxatida
--    har bir kirishni taniy olishi uchun.
--
-- 3) app_login_requests.login_method / user_agent — parol bilan kirish
--    endi Telegram'da tasdiqlanadi. So'rov shu jadvalda turadi (Android'ning
--    "Telegram bilan kirish" oqimi bilan bir xil), tasdiqlangach ochiladigan
--    seans qaysi usul va qaysi brauzerdan ekanini bilishi kerak.
--
-- Barcha jadvallarga faqat Edge Function (service role) kiradi: RLS yoqiq,
-- siyosat yo'q = ochiq (anon) kalit bilan hech narsa o'qib bo'lmaydi.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.security_events (
    id BIGSERIAL PRIMARY KEY,
    family_code TEXT NOT NULL,
    -- login | login_rejected | login_failed_many | session_revoked |
    -- sessions_revoked_all | device_paired | device_revoked | password_set |
    -- coparent_added | coparent_removed
    kind TEXT NOT NULL,
    -- Kim bajardi: 'tg:<id>', 'child:<child_id>', 'web', 'system'.
    actor TEXT,
    detail JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_events_family
    ON public.security_events(family_code, created_at DESC);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.web_sessions
    ADD COLUMN IF NOT EXISTS login_method TEXT;

ALTER TABLE public.app_login_requests
    ADD COLUMN IF NOT EXISTS login_method TEXT,
    ADD COLUMN IF NOT EXISTS user_agent TEXT;
