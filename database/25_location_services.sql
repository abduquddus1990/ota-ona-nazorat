-- Telefonning TIZIM darajasidagi joylashuv kalitini ham yozamiz.
--
-- Nega kerak: jonli holatda shunday manzara chiqdi — ilovada joylashuv
-- ruxsati bor (location_permission = true), fon ruxsati ham bor, lekin
-- telefonning o'zida "Joylashuv" butunlay o'chirilgan edi. Natijada radar
-- 16 soat davomida bitta ham yangi nuqta olmadi, panel esa hech qanday
-- muammo ko'rsatmadi: u faqat RUXSATni bilardi, KALITni emas.
--
-- Bu ikkisi boshqa-boshqa narsa. Ruxsat — ilovaga berilgan huquq; kalit —
-- butun telefon uchun. Kalit o'chiq bo'lsa, ruxsatning hech qanday ma'nosi
-- qolmaydi.
alter table device_health
  add column if not exists location_services boolean;

comment on column device_health.location_services is
  'Telefondagi umumiy "Joylashuv" sozlamasi yoqilganmi (ilova ruxsatidan alohida).';
