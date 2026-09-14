-- ============================================================================
-- TELEGRAMDAN TASHQARIDA KIRISH (login/parol)
--
-- Telegram ichida initData paroldan kuchliroq: u Telegram tomonidan
-- imzolanadi va uni soxtalashtirib bo'lmaydi. Lekin oddiy brauzerda
-- (Telegramsiz) bunday imzo yo'q — shuning uchun o'sha holat uchun alohida
-- kirish yo'li kerak: username = login, parol = parol.
--
-- PAROLNING O'ZI HECH QACHON SAQLANMAYDI. Faqat PBKDF2-HMAC-SHA256 natijasi,
-- har foydalanuvchiga alohida tasodifiy "salt" bilan. Baza sizib chiqsa ham
-- parollarni tiklab bo'lmaydi.
-- ============================================================================

ALTER TABLE public.parent_registrations
    ADD COLUMN IF NOT EXISTS password_hash TEXT,
    ADD COLUMN IF NOT EXISTS password_set_at TIMESTAMPTZ,
    -- Telefon Telegram tugmasi orqali olinadi (Telegram uni o'zi tasdiqlagan),
    -- SMS kod kerak emas. Bu maydon "raqam haqiqatan tasdiqlanganmi" degan
    -- savolga javob beradi — qo'lda yozilgan raqamdan farqlash uchun.
    ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ;

-- Username bo'yicha kirish uchun: bitta username bitta oilaga tegishli
-- bo'lishi kerak, aks holda login kimga tegishli ekani noaniq bo'lib qoladi.
CREATE UNIQUE INDEX IF NOT EXISTS idx_parent_registrations_username_unique
    ON public.parent_registrations(lower(parent_username))
    WHERE parent_username IS NOT NULL AND password_hash IS NOT NULL;

-- Brauzer seanslari. Token ham xuddi qurilma tokeni kabi: faqat hash saqlanadi.
CREATE TABLE IF NOT EXISTS public.web_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash TEXT NOT NULL UNIQUE,
    family_code TEXT NOT NULL,
    telegram_id BIGINT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_web_sessions_lookup
    ON public.web_sessions(token_hash) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_web_sessions_family
    ON public.web_sessions(family_code) WHERE revoked_at IS NULL;

ALTER TABLE public.web_sessions ENABLE ROW LEVEL SECURITY;
