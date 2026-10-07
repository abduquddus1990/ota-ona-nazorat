-- parent_pair_codes jadvalida RLS yoqilmagan edi (xavfsizlik tekshiruvi,
-- 2026-10-07). Bu jadvalda ilovaga kirish kodlari, Telegramni bog'lash
-- kodlari va onani oilaga qo'shish havolalari turadi. RLS'siz Supabase'ning
-- ochiq (anon) kaliti bilan amaldagi kodlarni o'qib, begona hisobga kirish
-- yoki o'zini "ona" qilib qo'shish mumkin bo'lardi.
--
-- Siyosat qo'shilmaydi: jadvalga faqat Edge Function (service role) kiradi,
-- service role esa RLS'dan o'tadi. Siyosatsiz RLS = anon/authenticated uchun
-- to'liq yopiq.
alter table public.parent_pair_codes enable row level security;
