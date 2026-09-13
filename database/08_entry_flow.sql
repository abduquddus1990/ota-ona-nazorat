-- ============================================================================
-- KIRISH OQIMI (entry flow) — qayta qurilgan
--
-- Nima o'zgardi va nega:
--
-- 1) HAR BOLAGA ALOHIDA BIR MARTALIK KOD (child_invites).
--    Ilgari barcha farzandlar bitta 6 xonali OILA kodi bilan ulanardi, va
--    o'sha kod ota-onaning Telegram ID'sidan formula bilan chiqardi
--    ((userId*31 + 7919) % 900000 + 100000) — ya'ni sir emas edi. Endi
--    ota-ona har bir farzand uchun alohida tasodifiy kod oladi; kod bir
--    marta ishlatiladi va muddati o'tadi. Bitta bolaning kodi boshqasiga
--    yaramaydi.
--
-- 2) URINISHLAR VA BAN (code_attempts, code_bans).
--    Kod noto'g'ri kiritilsa xato ko'rsatiladi; ketma-ket 3 ta xatodan
--    keyin 3 daqiqaga bloklanadi. Mantiq SERVERDA, shuning uchun Mini App,
--    Android va keyinchalik iPhone uchun bir xil ishlaydi — har bir ilovada
--    qaytadan yozilmaydi.
--
-- 3) ADMIN RO'YXATI BAZADA (app_admins).
--    Ilgari admin kodda qattiq yozilgan (ADMIN_USERNAMES) va xotiradagi
--    Set'da edi; serverless funksiya qayta ishga tushganda yo'qolardi.
--
-- Fayl qo'shimcha: barcha buyruqlar IF NOT EXISTS, qayta ishga tushirish
-- xavfsiz.
-- ============================================================================

-- 1. ADMINLAR ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_admins (
    telegram_id BIGINT PRIMARY KEY,
    username TEXT,
    label TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.app_admins (telegram_id, username, label)
VALUES (358795989, 'ai_loyihachi', 'Asosiy admin')
ON CONFLICT (telegram_id) DO NOTHING;

-- 2. FARZAND TAKLIFLARI (har bolaga alohida bir martalik kod) -------------
CREATE TABLE IF NOT EXISTS public.child_invites (
    code TEXT PRIMARY KEY,
    family_code TEXT NOT NULL,
    child_name TEXT,
    child_grade INTEGER,
    child_username TEXT,
    created_by_telegram_id BIGINT,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    used_by_telegram_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ota-ona paneli "kutilayotgan takliflar"ni shu bo'yicha oladi.
CREATE INDEX IF NOT EXISTS idx_child_invites_open
    ON public.child_invites(family_code, created_at DESC)
    WHERE used_at IS NULL;

-- 3. KOD KIRITISH URINISHLARI --------------------------------------------
CREATE TABLE IF NOT EXISTS public.code_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- "tg:<telegram_id>" yoki "ip:<address>" — kim urinayotgani.
    actor_key TEXT NOT NULL,
    succeeded BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_code_attempts_recent
    ON public.code_attempts(actor_key, created_at DESC);

-- 4. BLOKLANGANLAR (3 xatodan keyin 3 daqiqa) -----------------------------
CREATE TABLE IF NOT EXISTS public.code_bans (
    actor_key TEXT PRIMARY KEY,
    banned_until TIMESTAMPTZ NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Boshqa jadvallar kabi: faqat service_role tegadi.
ALTER TABLE public.app_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_bans ENABLE ROW LEVEL SECURITY;
