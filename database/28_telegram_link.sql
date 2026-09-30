-- Google bilan kirgan ota-onaning hisobiga Telegramni bog'lash.
--
-- Nega kerak: SOS, geo-ogohlantirishlar va kunlik xulosa ota-onaga FAQAT
-- Telegram orqali boradi. Google bilan ochilgan oilada parent_telegram_id
-- bo'sh bo'ladi, ya'ni shoshilinch xabar hech qayerga yetmaydi. Ota-ona
-- buni bilmasa, u xabar keladi deb kutadi — eng yomon holat.
--
-- Oqim: panel qisqa kod beradi, ota-ona botda havolani bosadi, bot kodni
-- ko'rib o'z Telegram ID'sini o'sha oilaga yozadi.
--
-- Kod uchun ALOHIDA jadval ochilmadi: parent_pair_codes'da kerakli hamma
-- ustun bor. Lekin o'sha jadval ilovaga kirish kodlari uchun ham
-- ishlatiladi, shuning uchun maqsad ustuni qo'shiladi va har bir oqim
-- FAQAT o'z kodini qabul qiladi. Usiz bir oqimning kodi ikkinchisida
-- ishlab ketardi.
alter table parent_pair_codes
  add column if not exists purpose text not null default 'app_login';

create index if not exists parent_pair_codes_purpose_idx
  on parent_pair_codes (purpose, expires_at);

-- Kodni web tomoni ochganda Telegram ID hali noma'lum bo'ladi.
alter table parent_pair_codes
  alter column parent_telegram_id drop not null;

comment on column parent_pair_codes.purpose is
  'app_login — bot bergan, ilovaga kirish uchun; tg_link — panel bergan, Telegramni oilaga bog''lash uchun.';
