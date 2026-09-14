-- ============================================================================
-- O'SISH VA USHLAB QOLISH FUNKSIYALARI
--
-- 1) TAKLIF DASTURI. Ota-ona o'z havolasi orqali boshqa oilani chaqiradi.
--    Mukofot (har ikkalasiga +14 kun Pro) faqat chaqirilgan oila ADMIN
--    TOMONIDAN TASDIQLANGANDA beriladi — aks holda soxta ro'yxatlar bilan
--    cheksiz Pro yig'ish mumkin bo'lardi.
--
-- 2) KUNLIK XULOSA. Bot har kuni kechqurun ota-onaga qisqa hisobot yuboradi.
--    digest_sent_at bir kunda ikki marta yuborilishining oldini oladi
--    (cron qayta ishga tushsa yoki bir necha marta chaqirilsa).
-- ============================================================================

ALTER TABLE public.parent_registrations
    ADD COLUMN IF NOT EXISTS referred_by_family_code TEXT,
    ADD COLUMN IF NOT EXISTS referral_rewarded_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS digest_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS digest_sent_at TIMESTAMPTZ;

-- Kim kimni chaqirgani bo'yicha qidiruv (mukofot berishda ishlatiladi).
CREATE INDEX IF NOT EXISTS idx_parent_registrations_referrer
    ON public.parent_registrations(referred_by_family_code)
    WHERE referred_by_family_code IS NOT NULL;

-- Kunlik xulosa uchun: tasdiqlangan va bugun hali xabar olmagan oilalar.
CREATE INDEX IF NOT EXISTS idx_parent_registrations_digest
    ON public.parent_registrations(status, digest_sent_at)
    WHERE digest_enabled = TRUE;
