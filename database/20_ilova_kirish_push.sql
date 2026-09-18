-- ============================================================================
-- ANDROID ILOVAGA KIRISH VA PUSH BILDIRISHNOMALAR
--
-- Kirish: ota-ona ilovada "Telegram bilan kirish"ni bosadi. Ilova botni
-- ochadi, bot "Kirishni tasdiqlayman" tugmasini ko'rsatadi, ota-ona bossa
-- ilova o'zi kirib oladi. Parol yozish ham, kod ko'chirish ham yo'q.
--
-- Nega username bilan kirish YO'Q: username — oddiy matn, uni istalgan
-- odam yozishi mumkin. Kirish esa isbot talab qiladi: Telegram imzosi,
-- parol yoki bir martalik qurilma kodi.
--
-- Push: bot xabari o'rniga telefonga to'g'ridan-to'g'ri bildirishnoma.
-- Bola telefonida Telegram bo'lmasligi ham mumkin — push u yerda ham
-- ishlaydi.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.app_login_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Ilova o'zida saqlaydigan maxfiy kalit (holatni shu bo'yicha so'raydi).
    token_hash TEXT NOT NULL UNIQUE,
    -- Telegram havolasida ko'rinadigan qisqa kod: ?start=app_<code>
    code TEXT NOT NULL UNIQUE,
    device_label TEXT,
    status TEXT NOT NULL DEFAULT 'pending',   -- pending | approved | rejected
    approved_by BIGINT,
    family_code TEXT,
    -- Tasdiqlangach shu yerga yoziladi va ilova bir marta olib ketadi.
    session_token TEXT,
    taken_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_app_login_code ON public.app_login_requests(code) WHERE status = 'pending';

-- Har bir telefon uchun bitta push manzili.
CREATE TABLE IF NOT EXISTS public.push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_code TEXT NOT NULL,
    -- parent_<telegram id> yoki tg_<id> / android_<id> (farzand)
    subject_id TEXT NOT NULL,
    role TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    platform TEXT NOT NULL DEFAULT 'android',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_tokens_subject ON public.push_tokens(family_code, subject_id);

ALTER TABLE public.app_login_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
