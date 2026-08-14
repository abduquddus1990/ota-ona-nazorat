-- =========================================================================
-- 20260813150000_add_report_tables.sql
-- Kunlik va oylik hisobot "instantanesi" jadvallari. Har kuni bot.py
-- fonida ishlaydigan vazifa (daily_maintenance_loop) tomonidan avtomatik
-- to'ldiriladi. Xom `conversations`/`analytics` qatorlari o'zgarishsiz
-- qoladi — bu jadvallar faqat tezkor/tarixiy ko'rinish uchun.
-- =========================================================================

create table if not exists daily_reports (
    id                  uuid primary key default gen_random_uuid(),
    employee_id         uuid not null references employees(id) on delete cascade,
    report_date         date not null,
    conversations_count integer not null default 0,
    avg_score           numeric(5, 2),
    min_score           integer,
    max_score           integer,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now(),

    unique (employee_id, report_date)
);

comment on table daily_reports is 'Xodim bo''yicha kunlik hisobot instantanesi (har kuni 00:15da avtomatik yoziladi)';

create index if not exists idx_daily_reports_date on daily_reports(report_date desc);
create index if not exists idx_daily_reports_employee on daily_reports(employee_id);

create table if not exists monthly_reports (
    id                  uuid primary key default gen_random_uuid(),
    employee_id         uuid not null references employees(id) on delete cascade,
    period_month        date not null,          -- oyning 1-kuni
    conversations_count integer not null default 0,
    avg_score           numeric(5, 2),
    min_score           integer,
    max_score           integer,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now(),

    unique (employee_id, period_month)
);

comment on table monthly_reports is 'Xodim bo''yicha oylik hisobot instantanesi (kunlik hisobotlar asosida har kuni yangilanadi)';

create index if not exists idx_monthly_reports_period on monthly_reports(period_month desc);
create index if not exists idx_monthly_reports_employee on monthly_reports(employee_id);

alter table daily_reports enable row level security;
alter table monthly_reports enable row level security;
