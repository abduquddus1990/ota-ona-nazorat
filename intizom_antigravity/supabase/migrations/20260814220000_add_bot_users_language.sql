-- TZ 24-bo'lim: bot menyusi va hisobotlar tili (o'zbek/rus). Har bir
-- boshqaruvchi (bot_users) o'z tilini tanlaydi — standart 'uz'.
alter table bot_users
  add column if not exists language text not null default 'uz' check (language in ('uz', 'ru'));

comment on column bot_users.language is
  'Bot menyusi va hisobotlar tili — /start ostidagi 🇺🇿/🇷🇺 tugmalari yoki Dashboard Sozlamalar orqali o''zgartiriladi (TZ 24-bo''lim)';
