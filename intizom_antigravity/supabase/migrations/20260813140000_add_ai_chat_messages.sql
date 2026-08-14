-- "Intizom AI" suhbat tarixini saqlash (TZ 12-bo'lim, coaching moduli).
-- Har bir rahbar (telegram_id orqali) o'z suhbat tarixiga ega bo'ladi —
-- Dashboard'ni qayta ochganda tarix yo'qolib qolmasligi uchun.
create table if not exists ai_chat_messages (
    id           uuid primary key default gen_random_uuid(),
    telegram_id  bigint not null,
    role         text not null check (role in ('user', 'assistant')),
    message      text not null,
    created_at   timestamptz not null default now()
);

comment on table ai_chat_messages is
  '"Intizom AI" bilan rahbar suhbati tarixi (TZ 12-bo''lim). Rasm/ovoz binary saqlanmaydi, faqat matn (yoki "[rasm]"/"[ovoz]" belgisi)';

create index if not exists idx_ai_chat_messages_telegram_id
  on ai_chat_messages(telegram_id, created_at);

alter table ai_chat_messages enable row level security;
