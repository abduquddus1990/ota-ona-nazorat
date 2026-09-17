-- ============================================================================
-- DARSLIK MASHQLARI
--
-- Nima uchun kerak: fokus seansidan keyingi 3 ta savol shu paytgacha bolaning
-- sinfiga mos UMUMIY savollar edi — u bugun nima o'qigani bilan bog'liq emas.
-- AI esa "39-40-mashq" deganda mashq matnini bilmagani uchun javobni o'zi
-- to'qib chiqarardi.
--
-- Endi darslik matni shu jadvalda: savollar ham, AI yordami ham AYNAN o'sha
-- mashq matnidan chiqadi. PDF saqlanmaydi — faqat ajratib olingan matn.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.textbook_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade SMALLINT NOT NULL,
    subject TEXT NOT NULL,
    number INTEGER NOT NULL,
    page INTEGER,
    topic TEXT,
    body TEXT NOT NULL,
    -- Qaysi nashrdan olingani: manba va yil.
    source TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (grade, subject, number)
);

CREATE INDEX IF NOT EXISTS idx_textbook_lookup ON public.textbook_exercises(grade, subject, number);

ALTER TABLE public.textbook_exercises ENABLE ROW LEVEL SECURITY;

-- Uy vazifasi qaysi mashqlardan iborat ekani (masalan "39,40").
ALTER TABLE public.homework_items
    ADD COLUMN IF NOT EXISTS exercises TEXT;
