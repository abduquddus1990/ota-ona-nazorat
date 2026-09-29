-- Oila kodi to'qnashuvining oldini olish.
--
-- Muammo: kod telegram_id dan hisoblanadi — (id*31+7919)%900000+100000 —
-- ya'ni jami 900 000 variant. Tug'ilgan kun paradoksiga ko'ra 1000 oilada
-- to'qnashuv ehtimoli ~43%, 2000 oilada ~89%. Oila kodi esa butun tizimda
-- ma'lumotni ajratuvchi asosiy kalit: to'qnashgan ikki oila bir-birining
-- farzandlarini, joylashuvini va chatini ko'rib qolardi.
--
-- Yechim: mavjud oilalar o'z kodida qoladi (hech qanday ko'chirish shart
-- emas), lekin yangi oilaning hisoblangan kodi allaqachon band bo'lsa,
-- unga shu jadval orqali boshqa, bo'sh kod beriladi. UNIQUE cheklovi
-- ikki oila bir kodga ega bo'lishini bazaning o'zi darajasida taqiqlaydi.
CREATE TABLE IF NOT EXISTS public.family_code_overrides (
    parent_telegram_id BIGINT PRIMARY KEY,
    family_code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.family_code_overrides ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_family_code_overrides_code
    ON public.family_code_overrides(family_code);
