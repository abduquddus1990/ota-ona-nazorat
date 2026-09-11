-- ============================================================================
-- PARENT REGISTRATION REQUESTS
--
-- WHY: the Mini App's onboarding form already collects the full family
--   picture (family name, father, mother, phone, child, grade, usernames)
--   and POSTs it to ota-ona-bot as "parent_registration_request". The bot
--   read only two of those fields, sent a Telegram notice, and stored
--   nothing — so every submitted family was lost the moment the request
--   finished.
--
--   Worse, the Telegram notice itself never arrived: ADMIN_CHAT_IDS was an
--   empty in-memory Set that only filled when the admin happened to message
--   the bot, and a serverless isolate drops that memory within minutes.
--   Two real family registrations were lost this way.
--
--   This table makes the request itself durable. Telegram delivery is now
--   only a convenience: even if it fails, the row is here, and admin_notified
--   / notify_error record exactly what happened.
--
-- One row per family_code: re-submitting the form updates the same row
-- rather than piling up duplicates.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.parent_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_code TEXT NOT NULL UNIQUE,
    family_name TEXT,
    parent_name TEXT,
    parent_username TEXT,
    parent_phone TEXT,
    parent_telegram_id BIGINT,
    mother_name TEXT,
    mother_username TEXT,
    child_name TEXT,
    child_grade INTEGER,
    child_username TEXT,
    -- pending | approved | rejected
    status TEXT NOT NULL DEFAULT 'pending',
    -- Telegram orqali adminga yetkazildimi (xabar yo'qolganini keyin
    -- aniqlash uchun; bazadagi yozuv baribir saqlanadi).
    admin_notified BOOLEAN NOT NULL DEFAULT FALSE,
    notify_error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- Admin paneli "kutilayotgan so'rovlar"ni shu bo'yicha oladi.
CREATE INDEX IF NOT EXISTS idx_parent_registrations_status
    ON public.parent_registrations(status, created_at DESC);

-- Oylik o'sish statistikasi uchun (nechta oila qaysi oyda qo'shildi).
CREATE INDEX IF NOT EXISTS idx_parent_registrations_created
    ON public.parent_registrations(created_at DESC);

-- Boshqa jadvallar kabi: faqat service_role tegadi, anon/authenticated
-- kalitlar uchun hech qanday siyosat berilmaydi.
ALTER TABLE public.parent_registrations ENABLE ROW LEVEL SECURITY;
