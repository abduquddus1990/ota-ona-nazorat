-- ============================================================================
-- DEVICE CREDENTIALS  (Android ilovasi uchun haqiqiy sir)
--
-- MUAMMO: Android hozir o'zini X-Family-Code + X-Child-Id bilan tanitadi.
--   Ikkalasi ham SIR EMAS:
--     * oila kodi ota-onaning Telegram ID'sidan formula bilan chiqadi
--       (app.js: (userId*31 + 7919) % 900000 + 100000),
--     * child_id esa o'sha koddan va qurilma modelidan quriladi
--       ("android_<kod>_<model>", model qisqa ro'yxatdan).
--   Ya'ni ota-onaning Telegram ID'sini bilgan odam ikkalasini ham hisoblab,
--   soxta telemetriya yuborishi va farzand ma'lumotini o'qishi mumkin.
--
-- YECHIM: qurilma oila kodi bilan emas, TOKEN bilan tanitiladi.
--   1) Ota-ona Mini App'da "Qurilma qo'shish" bosadi -> server bir martalik,
--      qisqa muddatli tasodifiy pair_code beradi (device_pair_codes).
--   2) Android shu kodni device_tokens'dagi uzoq muddatli tokenga
--      almashtiradi va kod darhol kuydiriladi (used_at).
--   3) Keyingi barcha so'rovlarda faqat token ishlatiladi.
--
--   Server tokenning O'ZINI saqlamaydi — faqat SHA-256 hash'ini. Baza sizib
--   chiqsa ham tokenlarni tiklab bo'lmaydi.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.device_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Tokenning sha256 hash'i (hex). Token hech qachon saqlanmaydi.
    token_hash TEXT NOT NULL UNIQUE,
    family_code TEXT NOT NULL,
    child_id TEXT NOT NULL,
    device_label TEXT,
    device_model TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_device_tokens_lookup
    ON public.device_tokens(token_hash) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_device_tokens_family
    ON public.device_tokens(family_code) WHERE is_active = TRUE;

-- Bir martalik juftlash kodlari. Qisqa muddatli va bir marta ishlatiladi.
CREATE TABLE IF NOT EXISTS public.device_pair_codes (
    code TEXT PRIMARY KEY,
    family_code TEXT NOT NULL,
    child_name TEXT,
    created_by_telegram_id BIGINT,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_device_pair_codes_open
    ON public.device_pair_codes(family_code) WHERE used_at IS NULL;

-- Oilaga qo'shilish urinishlarini cheklash uchun (6 xonali kodni
-- taxmin qilishga qarshi). Kalit: IP yoki Telegram ID.
CREATE TABLE IF NOT EXISTS public.join_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_key TEXT NOT NULL,
    family_code TEXT,
    succeeded BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_join_attempts_recent
    ON public.join_attempts(actor_key, created_at DESC);

ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_pair_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.join_attempts ENABLE ROW LEVEL SECURITY;
