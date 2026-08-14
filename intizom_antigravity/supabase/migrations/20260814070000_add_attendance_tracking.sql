-- =========================================================================
-- 20260814070000_add_attendance_tracking.sql
-- TZ 21/22-bo'lim: ichki suhbatlar logi (kontentsiz) va davomat/mikrofon
-- holati nazorati (recorder.py heartbeat -> bot.py _sync_work_sessions()).
-- =========================================================================

create table if not exists work_sessions (
    id                  uuid primary key default gen_random_uuid(),
    employee_id         uuid references employees(id) on delete cascade,
    microphone_id       text not null,
    session_start       timestamptz not null,
    last_heartbeat       timestamptz not null,
    session_end          timestamptz,           -- heartbeat to'xtaganda avtomatik to'ldiriladi
    ended_gracefully     boolean not null default false,
    created_at           timestamptz not null default now(),

    unique (employee_id, session_start)
);

comment on table work_sessions is 'recorder.py qachon ishga tushgani/to''xtagani — davomat va mikrofon holatini kuzatish uchun (TZ 22-bo''lim)';
comment on column work_sessions.ended_gracefully is 'true = dastur to''g''ri to''xtatildi (Ctrl+C/Windows to''xtatdi), false = heartbeat kutilmaganda uzildi (masalan kompyuter o''chib qoldi)';

create index if not exists idx_work_sessions_employee_id on work_sessions(employee_id);
create index if not exists idx_work_sessions_session_start on work_sessions(session_start desc);
create index if not exists idx_work_sessions_active on work_sessions(microphone_id) where session_end is null;

create table if not exists internal_chats_log (
    id                  uuid primary key default gen_random_uuid(),
    employee_id         uuid references employees(id) on delete cascade,
    detected_at         timestamptz not null default now(),
    duration_sec        integer
    -- MUHIM: transkripsiya matni ATAYLAB bu yerga yozilmaydi (maxfiylik, TZ 21.3-band)
);

comment on table internal_chats_log is 'Xodimlar orasidagi (mijozsiz) suhbatlar aniqlangani haqida YENGIL log — matn saqlanmaydi, faqat statistik hisob uchun (TZ 21-bo''lim)';

create index if not exists idx_internal_chats_employee_id on internal_chats_log(employee_id);

alter table work_sessions enable row level security;
alter table internal_chats_log enable row level security;

-- Bugungi davomat (TZ 22-bo'lim, dashboard "Davomat" bo'limi uchun)
create or replace view today_attendance as
select
    e.id as employee_id,
    e.full_name,
    e.microphone_id,
    ws.session_start,
    ws.last_heartbeat,
    ws.session_end,
    (ws.session_end is null and ws.last_heartbeat > now() - interval '10 minutes') as is_online,
    coalesce(
        extract(epoch from (coalesce(ws.session_end, ws.last_heartbeat) - ws.session_start)) / 60,
        0
    )::int as active_minutes,
    (select coalesce(sum(audio_duration_sec), 0) / 60
     from conversations c
     where c.employee_id = e.id and c.created_at::date = current_date
    )::int as recorded_minutes
from employees e
left join lateral (
    select * from work_sessions ws2
    where ws2.employee_id = e.id and ws2.session_start::date = current_date
    order by ws2.session_start desc
    limit 1
) ws on true
where e.is_active = true;

comment on view today_attendance is 'Bugungi kun uchun har bir xodimning mikrofon holati, faol vaqti va yozilgan daqiqalari (TZ 22-bo''lim, dashboard)';
