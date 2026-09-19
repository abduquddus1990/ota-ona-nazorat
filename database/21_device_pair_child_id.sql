-- Ota-ona endi telefonni MAVJUD farzandga bog'lashi mumkin (child_id orqali),
-- shunda bitta bola Telegram va Android'da bitta yozuv sifatida qoladi:
-- ballari, joylashuvi va uy vazifasi ikkiga bo'linib ketmaydi.
ALTER TABLE public.device_pair_codes
    ADD COLUMN IF NOT EXISTS child_id TEXT;
