-- =========================================================================
-- schema.sql (Intizom Antigravity Kengaytirilgan Versiya)
-- Yagona darcha xizmati — suhbat tahlil tizimi uchun Supabase (PostgreSQL) sxemasi
-- =========================================================================

create extension if not exists "uuid-ossp";

-- -------------------------------------------------------------------------
-- 1) EMPLOYEES — darchada ishlaydigan (kuzatiladigan) xodimlar
-- -------------------------------------------------------------------------
create table if not exists employees (
    id                  uuid primary key default uuid_generate_v4(),
    full_name           text not null,
    position            text,
    department          text,
    workstation_number  text,
    microphone_id       text unique,
    salary              numeric(12, 2),

    -- Ixtiyoriy maydonlar:
    employee_number     text,
    hired_at            date,
    photo_url           text,

    -- Operator self-review kirish huquqi uchun (TZ 3.9-band).
    telegram_id         bigint unique,

    is_active           boolean not null default true,
    created_at          timestamptz not null default now()
);

comment on table employees is 'Yagona darcha xizmati xodimlari — kuzatiladigan/tahlil qilinadigan shaxslar';
comment on column employees.microphone_id is 'Har bir mikrofon statik ravishda bitta xodimga biriktirilgan (TZ 4.3)';
comment on column employees.telegram_id is 'Operator o''z-o''zini baholash uchun ixtiyoriy bot kirish huquqi (TZ 3.9)';

-- -------------------------------------------------------------------------
-- 2) BOT_USERS — botga kirish huquqi bo'lgan boshqaruvchi shaxslar
-- -------------------------------------------------------------------------
create table if not exists bot_users (
    id                  uuid primary key default uuid_generate_v4(),
    telegram_id         bigint not null unique,
    full_name           text not null,
    role                text not null check (role in ('manager', 'deputy', 'hr', 'admin')),
    language            text not null default 'uz' check (language in ('uz', 'ru')),
    is_active           boolean not null default true,
    created_at          timestamptz not null default now()
);

comment on table bot_users is 'Rahbar/o''rinbosar/HR/admin — botni boshqaruvchi shaxslar (TZ 2-bo''lim)';

-- -------------------------------------------------------------------------
-- 3) CONVERSATIONS
-- -------------------------------------------------------------------------
create table if not exists conversations (
    id                  uuid primary key default uuid_generate_v4(),
    employee_id         uuid not null references employees(id) on delete cascade,
    audio_file_path     text,
    audio_storage_path  text,
    audio_duration_sec  integer,
    language            text default 'uz',
    transcript          text not null,
    created_at          timestamptz not null default now()
);

comment on table conversations is 'Suhbat transkripsiyalari va audio yo''llari';

create index if not exists idx_conversations_employee_id on conversations(employee_id);
create index if not exists idx_conversations_created_at on conversations(created_at desc);

-- -------------------------------------------------------------------------
-- 4) ANALYTICS
-- -------------------------------------------------------------------------
create table if not exists analytics (
    id                  uuid primary key default uuid_generate_v4(),
    conversation_id     uuid not null unique references conversations(id) on delete cascade,
    total_score         integer not null check (total_score between 0 and 100),
    criteria_scores     jsonb not null default '{}'::jsonb,
    errors              jsonb not null default '[]'::jsonb,
    strengths           jsonb not null default '[]'::jsonb,
    summary             text,
    warning             text,
    reviewed_by_manager boolean not null default false,
    created_at          timestamptz not null default now()
);

comment on table analytics is 'Gemini AI tomonidan chiqarilgan baho va tahlil natijalari';

create index if not exists idx_analytics_conversation_id on analytics(conversation_id);
create index if not exists idx_analytics_total_score on analytics(total_score);

-- -------------------------------------------------------------------------
-- 5) BONUSES — TZ 4.1: ikki komponentli KPI (Sifat × Hajm)
-- -------------------------------------------------------------------------
create table if not exists bonuses (
    id                  uuid primary key default uuid_generate_v4(),
    employee_id         uuid not null references employees(id) on delete cascade,
    period_month        date not null,
    conversations_count integer not null,
    monthly_norm        integer not null,
    quality_coef        numeric(5, 4) not null,
    volume_coef         numeric(5, 4) not null,
    bonus_max_percent   numeric(5, 4) not null,
    salary_at_calc      numeric(12, 2) not null,
    bonus_amount        numeric(12, 2) not null,
    calculated_at        timestamptz not null default now(),

    unique (employee_id, period_month)
);

comment on table bonuses is 'Oylik bonus: bonus = oklad * BONUS_MAX_FOIZ * sifat_koef * hajm_koef (TZ 4.1, v2)';

create index if not exists idx_bonuses_employee_id on bonuses(employee_id);
create index if not exists idx_bonuses_period on bonuses(period_month);

-- -------------------------------------------------------------------------
-- 6) SELF_REVIEWS — TZ 3.9: operator o'z-o'zini baholashi
-- -------------------------------------------------------------------------
create table if not exists self_reviews (
    id                  uuid primary key default uuid_generate_v4(),
    conversation_id     uuid not null unique references conversations(id) on delete cascade,
    self_score          integer check (self_score between 0 and 100),
    self_comment        text,
    ai_score            integer,
    score_diff          integer,
    created_at          timestamptz not null default now()
);

comment on table self_reviews is 'Operatorning AI bahosini ko''rmasdan turib bergan o''z bahosi (TZ 3.9)';

create index if not exists idx_self_reviews_conversation_id on self_reviews(conversation_id);

-- -------------------------------------------------------------------------
-- 7) APPEALS (YANGI) — Xodim e'tirozlari va apellyatsiya markazi
-- -------------------------------------------------------------------------
create table if not exists appeals (
    id                  uuid primary key default uuid_generate_v4(),
    conversation_id     uuid not null references conversations(id) on delete cascade,
    employee_id         uuid not null references employees(id) on delete cascade,
    reason              text not null,
    original_score      integer not null,
    reviewed_score      integer,
    status              text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    reviewer_comment    text,
    created_at          timestamptz not null default now(),
    resolved_at         timestamptz
);

comment on table appeals is 'Xodimlarning AI baholashiga e''tirozlari va rahbar qayta ko''rib chiqishi';

-- -------------------------------------------------------------------------
-- 8) COACHING_TIPS (YANGI) — AI Murabbiy va shaxsiy tavsiyalar
-- -------------------------------------------------------------------------
create table if not exists coaching_tips (
    id                  uuid primary key default uuid_generate_v4(),
    employee_id         uuid not null references employees(id) on delete cascade,
    category            text not null,
    title               text not null,
    recommendation      text not null,
    suggested_script    text,
    created_at          timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- 9) LIVE_ALERTS (YANGI) — Real vaqtli radar bildirishnomalari
-- -------------------------------------------------------------------------
create table if not exists live_alerts (
    id                  uuid primary key default uuid_generate_v4(),
    conversation_id     uuid references conversations(id) on delete cascade,
    employee_id         uuid references employees(id) on delete cascade,
    alert_type          text not null,
    severity            text not null default 'medium' check (severity in ('low', 'medium', 'critical')),
    message             text not null,
    is_resolved         boolean not null default false,
    created_at          timestamptz not null default now()
);

-- -------------------------------------------------------------------------
-- Foydali ko'rinish (VIEW)
-- -------------------------------------------------------------------------
create or replace view employee_performance as
select
    e.id                as employee_id,
    e.full_name,
    e.position,
    e.department,
    e.microphone_id,
    count(c.id)          as total_conversations,
    round(avg(a.total_score), 1) as avg_score,
    max(c.created_at)    as last_conversation_at
from employees e
left join conversations c on c.employee_id = e.id
left join analytics a on a.conversation_id = c.id
group by e.id, e.full_name, e.position, e.department, e.microphone_id;

comment on view employee_performance is 'Har bir xodim bo''yicha umumlashtirilgan ko''rsatkichlar';

-- -------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- -------------------------------------------------------------------------
alter table employees enable row level security;
alter table conversations enable row level security;
alter table analytics enable row level security;
alter table bonuses enable row level security;
alter table bot_users enable row level security;
alter table self_reviews enable row level security;
alter table appeals enable row level security;
alter table coaching_tips enable row level security;
alter table live_alerts enable row level security;
