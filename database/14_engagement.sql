-- ============================================================================
-- BOLANI JALB QILUVCHI FUNKSIYALAR
--
-- 1) "Bugun men..." — bola ota-onasiga bir bosishda ijobiy xabar yuboradi.
--    Maqsad: "meni poylashyapti" hissini "men bilan gaplashishyapti"ga
--    aylantirish. Eng arzon, lekin ishonchga eng ko'p ta'sir qiladigan narsa.
--
-- 2) Fokus jangi — ikki bola bir kun davomida kim ko'proq diqqat bilan
--    ishlashini o'lchaydi. Real vaqtda emas, ASINXRON: ikkalasi bir vaqtda
--    onlayn bo'lishi shart emas, aks holda mexanika deyarli hech qachon
--    ishga tushmasdi.
--
-- Haftalik reyting uchun alohida jadval KERAK EMAS — u time_bank_entries
-- dan hisoblanadi. Ikkinchi manba paydo bo'lsa, u bilan reyting bir-biriga
-- zid bo'lib qolardi.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.child_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_code TEXT NOT NULL,
    child_id TEXT NOT NULL,
    -- Kayfiyat kaliti (emoji mijozda tanlanadi): great | good | tired | sad
    mood TEXT NOT NULL DEFAULT 'good',
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_child_notes_recent
    ON public.child_notes(family_code, child_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.focus_duels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Do'stga yuboriladigan qisqa kod.
    code TEXT NOT NULL UNIQUE,
    challenger_family TEXT NOT NULL,
    challenger_child TEXT NOT NULL,
    challenger_name TEXT,
    opponent_family TEXT,
    opponent_child TEXT,
    opponent_name TEXT,
    -- open (kutilmoqda) | active (ketmoqda) | finished
    status TEXT NOT NULL DEFAULT 'open',
    starts_at TIMESTAMPTZ,
    ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_focus_duels_participant
    ON public.focus_duels(challenger_child, opponent_child, status);

ALTER TABLE public.child_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_duels ENABLE ROW LEVEL SECURITY;
