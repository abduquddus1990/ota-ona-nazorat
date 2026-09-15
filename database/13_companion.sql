-- ============================================================================
-- BO'RI HAMROH
--
-- Bolaning ilovaga qaytib kelishi uchun hissiy sabab. Bo'ri bolaning
-- odatlariga qarab o'sadi: fokus seansi, maktabga o'z vaqtida yetish va uy
-- vazifasi tajriba (XP) beradi. Bir necha kun e'tiborsiz qolsa — uxlab
-- qoladi va ketma-ketlik uziladi.
--
-- XP ham, ketma-ketlik ham SERVERDA hisoblanadi: bola brauzerdan o'ziga
-- daraja yozib ololmaydi.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.child_companion (
    family_code TEXT NOT NULL,
    child_id TEXT NOT NULL,
    -- Bolaning bo'risiga qo'ygan ismi.
    name TEXT NOT NULL DEFAULT 'Qalqon',
    xp INTEGER NOT NULL DEFAULT 0,
    -- Ketma-ket faol kunlar soni.
    streak_days INTEGER NOT NULL DEFAULT 0,
    -- Eng uzun ketma-ketlik — uzilib ketsa ham yutuq esda qoladi.
    best_streak INTEGER NOT NULL DEFAULT 0,
    -- Oxirgi XP olingan kun (YYYY-MM-DD). Ketma-ketlikni shu bo'yicha sanaymiz.
    last_active_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (family_code, child_id)
);

ALTER TABLE public.child_companion ENABLE ROW LEVEL SECURITY;
