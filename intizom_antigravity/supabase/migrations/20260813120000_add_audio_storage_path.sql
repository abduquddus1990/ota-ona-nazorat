-- TZ 4.5 yangilandi: rahbar Dashboard'dan suhbat audiosini eshitishi
-- imkoni uchun, audio fayl (mahalliy nusxadan tashqari) Supabase Storage'ga
-- ham yuklanadi. audio_file_path (mahalliy yo'l) o'zgarishsiz qoladi —
-- bu yangi ustun faqat Storage'dagi yo'lni saqlaydi.
alter table conversations
  add column if not exists audio_storage_path text;

comment on column conversations.audio_storage_path is
  'Supabase Storage (conversation-audio bucket) dagi audio fayl yo''li — Dashboard orqali eshitish uchun (TZ 4.5 yangilanishi)';
