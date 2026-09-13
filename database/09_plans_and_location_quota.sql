-- ============================================================================
-- TARIFLAR VA LOKATSIYA KVOTASI
--
-- Qoida (mahsulot egasidan):
--   BEPUL  — 1 ta farzand, 48 soat ichida 2 ta lokatsiya so'rovi.
--   PRO    — o'sha oynadagi 3-so'rovdan boshlab, va 2-farzandning
--            har qanday so'rovidan boshlab talab qilinadi.
--
-- "2 kun" siljuvchi 48 soat sifatida hisoblanadi, taqvim kuni emas: aks
-- holda kvota yarim tunda qayta tiklanib, ketma-ket 4 ta so'rov yuborish
-- mumkin bo'lardi.
--
-- Bepul tarifda lokatsiya so'ray oladigan "yagona farzand" — oilaga ENG
-- AVVAL ulangan faol farzand (child_pairings.paired_at bo'yicha). Bu
-- barqaror: ota-ona yangi farzand qo'shgani bilan bepul slot ko'chmaydi.
-- ============================================================================

-- 1. Tarif oila darajasida saqlanadi ---------------------------------------
ALTER TABLE public.parent_registrations
    ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';
ALTER TABLE public.parent_registrations
    ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;

-- 2. Lokatsiya so'rovlari tarixi -------------------------------------------
--    Kvota shu jadvaldan hisoblanadi. Ayni paytda bu audit ham: kim, qaysi
--    farzandning joylashuvini, qachon so'raganini ko'rsatadi.
CREATE TABLE IF NOT EXISTS public.location_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_code TEXT NOT NULL,
    child_id TEXT NOT NULL,
    requested_by_telegram_id BIGINT,
    -- 'free' yoki 'pro' — so'rov paytidagi tarif (keyin tarif o'zgarsa ham
    -- tarix o'zgarmaydi).
    plan_at_request TEXT NOT NULL DEFAULT 'free',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Kvota so'rovi aynan shu indeks bo'yicha ketadi.
CREATE INDEX IF NOT EXISTS idx_location_requests_quota
    ON public.location_requests(family_code, child_id, created_at DESC);

ALTER TABLE public.location_requests ENABLE ROW LEVEL SECURITY;
