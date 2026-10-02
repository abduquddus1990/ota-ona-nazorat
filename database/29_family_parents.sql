-- Oilaning IKKINCHI ota-onasi (odatda ona).
--
-- Nega kerak: oila ro'yxatdan o'tgan ota-onaning Telegram ID'siga bog'langan
-- edi (parent_registrations.parent_telegram_id) va boshqa hech kim panelga
-- kira olmasdi. Ro'yxatdan o'tishda onaning faqat ismi va username'i
-- yozilardi — u na SOS, na "maktabga yetdi" xabarini olardi. Ona o'zi
-- ro'yxatdan o'tsa, butunlay BOSHQA, bo'sh oila ochilib qolardi.
--
-- Oqim: ota panelda "Onani qo'shish"ni bosadi, bot havolasi chiqadi
-- (parent_pair_codes, purpose = 'co_parent'), ona havolani bosadi va bot uning
-- Telegram ID'sini shu jadvalga yozadi. Shundan keyin familyCodeFor() onani
-- ham otaning oilasiga olib boradi.
--
-- telegram_id PRIMARY KEY: bitta Telegram hisobi faqat bitta oilada ota-ona
-- bo'la oladi — aks holda qaysi oilaning paneli ochilishi noaniq bo'lardi.
create table if not exists public.family_parents (
    telegram_id bigint primary key,
    family_code text not null,
    name text,
    role text not null default 'mother',
    added_by bigint,
    created_at timestamptz not null default now()
);

create index if not exists family_parents_family_idx
    on public.family_parents (family_code);

-- Jadvalga faqat Edge Function (service role) kiradi.
alter table public.family_parents enable row level security;

comment on column public.parent_pair_codes.purpose is
  'app_login — bot bergan, ilovaga kirish uchun; tg_link — panel bergan, Telegramni oilaga bog''lash uchun; co_parent — ikkinchi ota-onani (onani) oilaga taklif qilish uchun.';
