-- ============================================================================
-- OILAVIY CHAT
--
-- Faqat bitta oila a'zolari: ota-ona va shu oilaga ulangan farzandlar.
-- Begona odam qo'shila olmaydi — a'zolik child_pairings va oila kodidan
-- olinadi, mijozdan emas.
--
-- Telegram'dagi oddiy yozishmadan farqi: ilova voqealari ham shu suhbatga
-- tushadi — uy vazifasi (surati bilan), sovg'a so'rovi, "Maktabdaman",
-- joylashuv, SOS. Ota-ona uy vazifasi va sovg'ani chatning o'zida tasdiqlaydi.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.family_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_code TEXT NOT NULL,
    -- tg_<id> (farzand) yoki parent_<telegram id>
    author_id TEXT NOT NULL,
    author_role TEXT NOT NULL,          -- parent | child
    author_name TEXT,
    body TEXT,
    -- Siqilgan JPEG (data URL). Ro'yxatda yuborilmaydi — alohida so'raladi.
    photo TEXT,
    -- Ilova voqeasi: {"type":"homework","refId":"...","status":"pending",...}
    event JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Voqea holati o'zgarsa (tasdiqlandi) — mijoz yangilanishni shu orqali oladi.
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_family_messages_family ON public.family_messages(family_code, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.family_chat_reads (
    family_code TEXT NOT NULL,
    member_id TEXT NOT NULL,
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (family_code, member_id)
);

ALTER TABLE public.family_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_chat_reads ENABLE ROW LEVEL SECURITY;
