-- 35. Bepul Supabase tarifini uzoqroqqa yetkazish (2026-10-28).
--
-- Bepul tarif: baza 500 MB, fayl ombori 1 GB, oyiga 500 000 server
-- chaqiruvi. Uchta isrof bor edi:
--   1) chat suratlari bazaning ichida (data URL, har biri 150–600 KB);
--   2) chat ro'yxati har ochilishda barcha suratlarni tortardi;
--   3) joylashuv va ekran vaqti tarixi cheksiz to'planardi.
-- Server kodi (index.ts) bu migratsiyasiz ham ishlaydi — u has_photo
-- ustuni yo'q bo'lsa eski usulga qaytadi, ombor ishlamasa suratni bazaga
-- yozadi. Ya'ni tartib muhim emas, lekin avval migratsiya yaxshiroq.

-- 1. Chat suratlari uchun YOPIQ fayl ombori. Faqat server (service role)
--    o'qiydi va yozadi; mijoz suratni chat_photo orqali oladi.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat-photos', 'chat-photos', false, 1048576, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- 2. Ro'yxat uchun yengil belgi: suratning o'zini o'qimasdan "bor/yo'q".
ALTER TABLE public.family_messages
  ADD COLUMN IF NOT EXISTS has_photo boolean GENERATED ALWAYS AS (photo IS NOT NULL) STORED;

-- 3. Eski ma'lumotni har kecha tozalash (03:00 Toshkent = 22:00 UTC).
--    Muddatlar ilovada ko'rsatiladigan eng uzun davrdan uzunroq:
--    joylashuv tarixi panelda 30 kungacha, ekran vaqti 7–30 kun.
--      location_pings     — 90 kun (Pro tarifi rejasidagi "90 kun tarix")
--      device_telemetry   — 60 kun
--      geofence_alerts    — 180 kun
--      security_events    — 365 kun (kirishlar jurnali — uzoqroq turadi)
--      join_attempts      — 30 kun (urinishlar cheklovi 1 soatga qaraydi)
--      app_login_requests, device_pair_codes — muddati o'tganiga 7 kun
--      web_sessions       — tugagan yoki uzilganiga 30 kun
DO $$
BEGIN
  PERFORM cron.unschedule('qalqon_tozalash')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'qalqon_tozalash');
  PERFORM cron.schedule('qalqon_tozalash', '0 22 * * *', $cmd$
    DELETE FROM public.location_pings     WHERE recorded_at < now() - interval '90 days';
    DELETE FROM public.device_telemetry   WHERE created_at  < now() - interval '60 days';
    DELETE FROM public.geofence_alerts    WHERE created_at  < now() - interval '180 days';
    DELETE FROM public.security_events    WHERE created_at  < now() - interval '365 days';
    DELETE FROM public.join_attempts      WHERE created_at  < now() - interval '30 days';
    DELETE FROM public.app_login_requests WHERE expires_at  < now() - interval '7 days';
    DELETE FROM public.device_pair_codes  WHERE expires_at  < now() - interval '7 days';
    DELETE FROM public.web_sessions
      WHERE (revoked_at IS NOT NULL AND revoked_at < now() - interval '30 days')
         OR expires_at < now() - interval '30 days';
  $cmd$);
END $$;
