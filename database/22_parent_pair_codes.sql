-- Ota-ona uchun Android ilovaga kirishning ENG SODDA yo'li: farzand
-- allaqachon shu naqsh bilan ulanadi (device_pair_codes) — ota-ona uchun ham
-- aynan shunday, faqat natijada qurilma tokeni emas, brauzer seansi
-- (web_sessions) beriladi. Bot orqali bitta tugma bosiladi, kod chiqadi, u
-- ilovada kiritiladi — na parol, na ilovalar orasida almashish kerak.
CREATE TABLE IF NOT EXISTS public.parent_pair_codes (
    code TEXT PRIMARY KEY,
    family_code TEXT NOT NULL,
    parent_telegram_id BIGINT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parent_pair_codes_open
    ON public.parent_pair_codes(family_code) WHERE used_at IS NULL;
