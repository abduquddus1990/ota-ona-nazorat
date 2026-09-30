-- Google hisobi bilan kirish.
--
-- Nega kerak: hozir ota-ona faqat Telegram bot orqali ro'yxatdan o'ta oladi.
-- Bu ikki jiddiy muammoni keltirib chiqaradi:
--
--  1. Play Market tekshiruvchisi ilovaga KIRA OLMAYDI. U o'zbekcha Telegram
--     botini topib, ro'yxatdan o'tishi kerak — buni qilmaydi va ilovani
--     "ishlamaydi" deb rad etadi.
--  2. Telegramsiz ota-onalar umuman kira olmaydi.
--
-- google_sub — Google bergan o'zgarmas foydalanuvchi identifikatori. Email
-- o'zgarishi mumkin, sub esa hech qachon; shuning uchun hisob AYNAN shunga
-- bog'lanadi.
alter table parent_registrations
  add column if not exists google_sub text,
  add column if not exists parent_email text;

-- Bitta Google hisobi — bitta oila. Usiz bir odam har kirganda yangi oila
-- ochib yuborardi.
create unique index if not exists parent_registrations_google_sub_key
  on parent_registrations (google_sub)
  where google_sub is not null;

create index if not exists parent_registrations_email_idx
  on parent_registrations (lower(parent_email))
  where parent_email is not null;

-- Oila kodini band qilish jadvali Telegram ID bo'yicha ishlaydi. Google
-- orqali kirgan ota-onada Telegram ID yo'q, shuning uchun kalitni matn
-- ko'rinishida ham saqlay olishimiz kerak.
alter table family_code_overrides
  add column if not exists owner_key text;

create unique index if not exists family_code_overrides_owner_key_idx
  on family_code_overrides (owner_key)
  where owner_key is not null;

comment on column parent_registrations.google_sub is
  'Google hisobining o''zgarmas identifikatori (ID token dagi "sub").';
