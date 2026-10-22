-- 34: push manzili qaysi kirish (web_sessions) orqali ro'yxatdan o'tganini
-- saqlaymiz. Kirish uzilganda ("Bu men emasman", panelda uzish, chiqish,
-- parol almashtirish) shu manzil ham o'chiriladi — aks holda uzilgan
-- telefonga oilaning SOS xabarlari kelib turaverardi (2026-10-22).
--
-- Server (index.ts) ustun bo'lmasa ham ishlaydi; qo'llangach himoya yoqiladi.
-- Ishga tushirish: GitHub Actions -> "Baza SQL" -> file: 34_push_session.sql

ALTER TABLE public.push_tokens ADD COLUMN IF NOT EXISTS session_id uuid;
CREATE INDEX IF NOT EXISTS idx_push_tokens_session ON public.push_tokens(session_id);
