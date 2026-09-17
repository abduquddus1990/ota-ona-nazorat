-- ============================================================================
-- DO'ST BILAN ONLINE O'YINLAR
--
-- Beshta o'yin bitta jadvalda: viktorina dueli, Poyga va Tetris "arvoh"
-- bilan, To'rtta qator, Dengiz jangi.
--
-- Bolalar xavfsizligi uchun qoidalar:
--  · Raqib faqat do'st yuborgan taklif havolasi orqali qo'shiladi —
--    notanish odam bilan tasodifiy juftlash YO'Q.
--  · Chat yo'q. Bir-birining haqiqiy ismi ham ko'rinmaydi: o'rniga bo'ri
--    ismi (child_companion.name) ishlatiladi.
--  · Ota-ona farzandi kim bilan, qaysi o'yinni o'ynaganini ko'radi.
--
-- Natijani SERVER hisoblaydi: Poyga va Tetrisda bola yuborgan son emas,
-- uning bosishlar yozuvi serverda qayta o'ynatiladi. Viktorinada vaqtni
-- server o'lchaydi, to'g'ri javob mijozga oldindan yuborilmaydi.
-- Navbatli o'yinlarda (To'rtta qator, Dengiz jangi) har bir yurish serverda
-- tekshiriladi; Dengiz jangida raqib kemalari mijozga umuman yuborilmaydi.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.game_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    -- quiz | race | tetris | connect4 | battleship
    game TEXT NOT NULL,
    -- open (do'st kutilmoqda) | active | finished | expired | cancelled
    status TEXT NOT NULL DEFAULT 'open',
    seed BIGINT NOT NULL,
    p1_family TEXT NOT NULL,
    p1_child TEXT NOT NULL,
    p1_name TEXT,
    p2_family TEXT,
    p2_child TEXT,
    p2_name TEXT,
    -- O'yin holati: savollar, taxta, kemalar, natijalar. Maxfiy qismlar
    -- (to'g'ri javob, raqib kemalari) mijozga faqat server orqali, filtrlab.
    state JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Navbatli o'yinlar uchun: p1 | p2
    turn TEXT,
    -- p1 | p2 | draw
    winner TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_game_matches_p1 ON public.game_matches(p1_child, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_matches_p2 ON public.game_matches(p2_child, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_game_matches_family ON public.game_matches(p1_family, p2_family);

ALTER TABLE public.game_matches ENABLE ROW LEVEL SECURITY;
