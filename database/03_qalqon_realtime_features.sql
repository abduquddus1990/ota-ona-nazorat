-- ============================================================================
-- PROJECT: QALQON AI
-- LAYER: REAL-TIME FAMILY FEATURES (pairing, location, curfew, homework)
-- WHY A SEPARATE MIGRATION FROM 01_supabase_schema_and_rls.sql:
--   01_supabase_schema_and_rls.sql keys everything off Supabase Auth
--   (auth.users -> profiles.id -> family_links UUIDs). This product is
--   Telegram-native: parents and children never sign up through Supabase
--   Auth, they only ever have a Telegram id and a 6-digit family_code.
--   Forcing every write through auth.users would require provisioning a
--   real Supabase Auth account per Telegram user for no real benefit.
--   These tables key identity off family_code (the pairing secret the
--   whole product already uses everywhere: bot, Mini App, Android app)
--   and child_id (the child's Telegram numeric id as text), and are only
--   ever written through the backend's service_role key after the
--   backend has verified a genuine Telegram Mini App initData signature
--   (see backend/security/telegram_auth.py) or the bot's own webhook.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PAIRINGS: the actual source of truth for "this child device/Telegram
--    account belongs to this family". Written by supabase/functions/ota-ona-bot
--    on child_paired_event and by the Android app's server-bind call.
CREATE TABLE IF NOT EXISTS public.child_pairings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_code TEXT NOT NULL,
    child_id TEXT NOT NULL,               -- Telegram user id, or Android install id when no Telegram id yet
    child_name TEXT,
    device_label TEXT,
    source TEXT NOT NULL DEFAULT 'telegram_miniapp', -- 'telegram_miniapp' | 'android_parental_guard'
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    paired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (family_code, child_id)
);
CREATE INDEX IF NOT EXISTS idx_child_pairings_family ON public.child_pairings(family_code) WHERE is_active = TRUE;

-- 2. GEOFENCE ZONES (uy / maktab / boshqa)
CREATE TABLE IF NOT EXISTS public.geofence_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_code TEXT NOT NULL,
    child_id TEXT NOT NULL,
    name TEXT NOT NULL,
    center_lat DOUBLE PRECISION NOT NULL,
    center_lng DOUBLE PRECISION NOT NULL,
    radius_m INTEGER NOT NULL DEFAULT 150,
    arrive_by TEXT,      -- "08:00"
    leave_after TEXT,    -- "16:30"
    weekdays INTEGER[] NOT NULL DEFAULT '{0,1,2,3,4}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (family_code, child_id, name)
);

-- 3. LOCATION PINGS (so'nggi mobil-internet/GPS joylashuv tarixi)
CREATE TABLE IF NOT EXISTS public.location_pings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_code TEXT NOT NULL,
    child_id TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    accuracy_m DOUBLE PRECISION,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_location_pings_lookup ON public.location_pings(family_code, child_id, recorded_at DESC);

-- 4. GEOFENCE ALERTS (kechikish va h.k. tarixi)
CREATE TABLE IF NOT EXISTS public.geofence_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_code TEXT NOT NULL,
    child_id TEXT NOT NULL,
    zone_name TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    minutes_late INTEGER,
    distance_m INTEGER,
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_geofence_alerts_lookup ON public.geofence_alerts(family_code, child_id, created_at DESC);

-- 5. CURFEW POLICY (komendant soati / bloklanadigan ilovalar)
CREATE TABLE IF NOT EXISTS public.curfew_policies (
    family_code TEXT NOT NULL,
    child_id TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    blocked_apps TEXT[] NOT NULL DEFAULT '{}',
    allowed_apps TEXT[] NOT NULL DEFAULT '{}',
    start_time TEXT NOT NULL DEFAULT '22:00',
    end_time TEXT NOT NULL DEFAULT '06:30',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (family_code, child_id)
);

-- 6. DEVICE TELEMETRY (ekran vaqti, ilova nomi, shifrlangan xom ma'lumot).
--    01_supabase_schema_and_rls.sql'dagi telemetry_logs UUID (Supabase Auth)
--    kalitiga bog'langan edi va hech qachon yozilmagan (auth.users hech
--    qachon yaratilmagan, chunki foydalanuvchilar faqat Telegram orqali
--    kiradi). Shu sabab family_code/child_id (TEXT) bilan qayta qurilgan.
CREATE TABLE IF NOT EXISTS public.device_telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_code TEXT NOT NULL,
    child_id TEXT NOT NULL,
    app_package_name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    screen_time_seconds INTEGER NOT NULL DEFAULT 0,
    anonymized_summary TEXT,
    risk_rating TEXT NOT NULL DEFAULT 'safe',
    encrypted_payload TEXT NOT NULL,
    iv TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_device_telemetry_lookup ON public.device_telemetry(family_code, child_id, created_at DESC);

-- 7. HOMEWORK ITEMS
CREATE TABLE IF NOT EXISTS public.homework_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_code TEXT NOT NULL,
    child_id TEXT NOT NULL,
    grade INTEGER NOT NULL,
    subject TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    done BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    done_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_homework_lookup ON public.homework_items(family_code, child_id, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- These tables are never written or read via the Supabase anon/authenticated
-- key from a client directly — only the backend's service_role key touches
-- them (service_role bypasses RLS by design). Enabling RLS with no grants
-- for anon/authenticated simply guarantees a client that somehow obtained
-- the anon key cannot read or write these tables directly through PostgREST.
-- ============================================================================
ALTER TABLE public.child_pairings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_pings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geofence_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curfew_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework_items ENABLE ROW LEVEL SECURITY;
