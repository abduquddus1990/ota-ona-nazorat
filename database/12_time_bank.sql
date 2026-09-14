-- ============================================================================
-- VAQT BANKI
--
-- G'oya: ekran vaqtini tortib olish emas — uni ISHLAB TOPISH. Bola diqqat
-- bilan dars qiladi, maktabga o'z vaqtida yetadi, uy vazifasini bajaradi va
-- shu evaziga qo'shimcha ekran vaqtiga ega bo'ladi. Ota-ona kursni bir marta
-- belgilaydi.
--
-- MUHIM: hisob SERVERDA yuritiladi. Agar balans mijozda hisoblanganda, bola
-- devtools yoki o'zgartirilgan so'rov bilan o'ziga istagancha vaqt yozib
-- olardi — ya'ni butun mexanika ma'nosini yo'qotardi.
-- ============================================================================

-- Ota-ona belgilaydigan kurs. Har farzandga alohida.
CREATE TABLE IF NOT EXISTS public.time_bank_rules (
    family_code TEXT NOT NULL,
    child_id TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    -- Bitta tugallangan fokus seansi uchun necha daqiqa.
    minutes_per_focus INTEGER NOT NULL DEFAULT 10,
    -- Maktabga belgilangan vaqtdan oldin yetib kelgani uchun (kuniga bir marta).
    minutes_per_school_ontime INTEGER NOT NULL DEFAULT 20,
    -- Bajarilgan uy vazifasi uchun.
    minutes_per_homework INTEGER NOT NULL DEFAULT 10,
    -- Kunlik shift: bir kunda bundan ko'p ishlab topib bo'lmaydi.
    daily_cap_minutes INTEGER NOT NULL DEFAULT 90,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (family_code, child_id)
);

-- Har bir yozuv: musbat — ishlab topildi, manfiy — sarflandi.
-- Balans shu jadvalning yig'indisi, alohida "balans" ustuni yo'q —
-- shunda balans bilan tarix hech qachon bir-biriga zid bo'lib qolmaydi.
CREATE TABLE IF NOT EXISTS public.time_bank_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_code TEXT NOT NULL,
    child_id TEXT NOT NULL,
    minutes INTEGER NOT NULL,
    -- focus | school_ontime | homework | parent_bonus | spend
    reason TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_time_bank_entries_balance
    ON public.time_bank_entries(family_code, child_id, created_at DESC);

-- Fokus seanslari. Boshlanish vaqti SERVERDA yoziladi va tugatishda
-- haqiqatan shuncha vaqt o'tganini tekshiramiz — aks holda bola "boshladim"
-- va darhol "tugatdim" deb cheksiz vaqt yig'ib olardi.
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_code TEXT NOT NULL,
    child_id TEXT NOT NULL,
    planned_minutes INTEGER NOT NULL DEFAULT 25,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    awarded_minutes INTEGER
);

CREATE INDEX IF NOT EXISTS idx_focus_sessions_open
    ON public.focus_sessions(family_code, child_id, started_at DESC)
    WHERE completed_at IS NULL;

ALTER TABLE public.time_bank_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_bank_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
