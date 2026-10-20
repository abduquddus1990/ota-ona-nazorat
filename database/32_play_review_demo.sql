-- 32: Google Play ko'rib chiquvchisi uchun NAMUNA OILA (App access).
--
-- Play ilovani tekshirishda kirish ma'lumoti so'raydi. Haqiqiy oilani
-- berib bo'lmaydi, shuning uchun bu yerda soxta oila: 2 farzand, uy va
-- maktab hududlari, bugungi yo'l, voqealar, ekran vaqti, oila chati.
--
-- Kirish: login qalqon_review, parol — faqat egasining kompyuterida
-- (qalqon-maxfiy/play-review-MAXFIY.txt). Bu yerda parolning faqat
-- PBKDF2 xeshi (120 000 marta, tasodifiy tuz) — undan parol tiklanmaydi.
-- Telegram ID yo'q: parol bilan kirish Telegram tasdig'ini so'ramaydi.
--
-- Qayta ishga tushirsa bo'ladi: oila tozalanib, vaqtlar BUGUNGA qayta
-- yoziladi (ko'rib chiqishga yuborishdan oldin shunday qiling).
-- Ishga tushirish: GitHub Actions -> "Baza SQL" -> file: 32_play_review_demo.sql

DO $$
DECLARE
  fam  constant text := '900900';
  kun  timestamptz := date_trunc('day', now() AT TIME ZONE 'Asia/Tashkent') AT TIME ZONE 'Asia/Tashkent';
  m    constant text := 'app_demo_madina';
  s    constant text := 'app_demo_sardor';
BEGIN
  -- Bu kod boshqa (haqiqiy) oilaga tegishli bo'lsa — hech narsaga tegmaymiz.
  IF EXISTS (SELECT 1 FROM public.parent_registrations
             WHERE family_code = fam AND coalesce(parent_username, '') <> 'qalqon_review') THEN
    RAISE EXCEPTION '900900 kodi boshqa oilada band — namuna oila yozilmadi';
  END IF;

  DELETE FROM public.family_messages  WHERE family_code = fam;
  DELETE FROM public.device_telemetry WHERE family_code = fam;
  DELETE FROM public.device_health    WHERE family_code = fam;
  DELETE FROM public.geofence_alerts  WHERE family_code = fam;
  DELETE FROM public.location_pings   WHERE family_code = fam;
  DELETE FROM public.geofence_zones   WHERE family_code = fam;
  DELETE FROM public.child_pairings   WHERE family_code = fam;
  DELETE FROM public.parent_registrations WHERE family_code = fam;

  INSERT INTO public.parent_registrations
    (family_code, family_name, parent_name, parent_username, parent_telegram_id,
     status, plan, password_hash, password_set_at, digest_enabled)
  VALUES
    (fam, 'Namuna oila', 'Aziz (namuna)', 'qalqon_review', NULL,
     'approved', 'free', 'pbkdf2$120000$f0284b19680123beec6116e15884391d$482389a563449dd01093ec7d40160f660fe04a98a81d17ee75f9b858790063d1', now(), false);

  INSERT INTO public.child_pairings
    (family_code, child_id, child_name, device_label, source, is_active, paired_at, last_seen_at, grade, school_shift, school_arrive_by)
  VALUES
    (fam, m, 'Madina', 'Samsung Galaxy A15', 'android_parental_guard', true, kun - interval '20 days', now() - interval '3 minutes', 5, 1, '08:00'),
    (fam, s, 'Sardor', 'Xiaomi Redmi 13',    'android_parental_guard', true, kun - interval '20 days', now() - interval '9 minutes', 8, 1, '08:00');

  INSERT INTO public.geofence_zones (family_code, child_id, name, center_lat, center_lng, radius_m, arrive_by, leave_after)
  VALUES
    (fam, m, 'Uy',         41.31120, 69.27950, 120, NULL,    NULL),
    (fam, m, 'Maktab',     41.31610, 69.28520, 150, '08:00', '13:00'),
    (fam, s, 'Uy',         41.31120, 69.27950, 120, NULL,    NULL),
    (fam, s, 'Maktab',     41.31610, 69.28520, 150, '08:00', '13:30'),
    (fam, s, 'Sport zali', 41.30880, 69.29140, 100, NULL,    NULL);

  -- Bugungi yo'l: uy -> maktab -> uy (Madina), maktab -> sport zali (Sardor).
  -- Hali kelmagan vaqtlar yozilmaydi (ertalab ishga tushirilsa ham mantiqiy).
  INSERT INTO public.location_pings (family_code, child_id, lat, lng, accuracy_m, recorded_at)
  SELECT fam, m, p.lat, p.lng, 18, kun + p.t FROM (VALUES
    (41.31120, 69.27950, interval '7 hours 30 minutes'),
    (41.31260, 69.28110, interval '7 hours 38 minutes'),
    (41.31420, 69.28300, interval '7 hours 45 minutes'),
    (41.31600, 69.28510, interval '7 hours 52 minutes'),
    (41.31605, 69.28515, interval '10 hours'),
    (41.31600, 69.28510, interval '13 hours 05 minutes'),
    (41.31400, 69.28280, interval '13 hours 15 minutes'),
    (41.31125, 69.27955, interval '13 hours 32 minutes')
  ) AS p(lat, lng, t) WHERE kun + p.t < now() - interval '5 minutes';
  INSERT INTO public.location_pings (family_code, child_id, lat, lng, accuracy_m, recorded_at)
  VALUES (fam, m, 41.31122, 69.27951, 15, now() - interval '3 minutes');

  INSERT INTO public.location_pings (family_code, child_id, lat, lng, accuracy_m, recorded_at)
  SELECT fam, s, p.lat, p.lng, 22, kun + p.t FROM (VALUES
    (41.31120, 69.27950, interval '7 hours 25 minutes'),
    (41.31610, 69.28520, interval '7 hours 49 minutes'),
    (41.31600, 69.28500, interval '13 hours 35 minutes'),
    (41.31200, 69.28800, interval '13 hours 50 minutes'),
    (41.30885, 69.29135, interval '14 hours 05 minutes')
  ) AS p(lat, lng, t) WHERE kun + p.t < now() - interval '10 minutes';
  INSERT INTO public.location_pings (family_code, child_id, lat, lng, accuracy_m, recorded_at)
  VALUES (fam, s, 41.30882, 69.29138, 20, now() - interval '9 minutes');

  INSERT INTO public.geofence_alerts (family_code, child_id, zone_name, alert_type, distance_m, message, created_at)
  SELECT fam, a.c, a.z, a.typ, 0,
         a.z || CASE WHEN a.typ = 'enter' THEN ' hududiga kirdi' ELSE ' hududidan chiqdi' END,
         kun + a.t
  FROM (VALUES
    (m, 'Uy',         'exit',  interval '7 hours 34 minutes'),
    (m, 'Maktab',     'enter', interval '7 hours 52 minutes'),
    (s, 'Maktab',     'enter', interval '7 hours 49 minutes'),
    (m, 'Maktab',     'exit',  interval '13 hours 08 minutes'),
    (m, 'Uy',         'enter', interval '13 hours 32 minutes'),
    (s, 'Maktab',     'exit',  interval '13 hours 38 minutes'),
    (s, 'Sport zali', 'enter', interval '14 hours 05 minutes')
  ) AS a(c, z, typ, t) WHERE kun + a.t < now();

  INSERT INTO public.device_health
    (family_code, child_id, location_permission, background_location, usage_permission,
     battery_unrestricted, battery_level, app_version, location_services, reported_at)
  VALUES
    (fam, m, true, true, true, true, 78, '1.0.1', true, now() - interval '3 minutes'),
    (fam, s, true, true, true, true, 54, '1.0.1', true, now() - interval '9 minutes');

  -- Ekran vaqti (bugun). Shifrlangan qism namuna oilada bo'sh.
  INSERT INTO public.device_telemetry
    (family_code, child_id, app_package_name, category, screen_time_seconds, encrypted_payload, iv, created_at)
  SELECT fam, d.c, d.pkg, d.cat, d.sec, '', '', now() - interval '20 minutes' FROM (VALUES
    (m, 'com.google.android.youtube', 'Video',     2580),
    (m, 'com.duolingo',               'Ta''lim',   1320),
    (m, 'com.shield.parentalguard',   'Ta''lim',    900),
    (s, 'com.google.android.youtube', 'Video',     3900),
    (s, 'com.supercell.brawlstars',   'O''yinlar', 2700),
    (s, 'org.telegram.messenger',     'Muloqot',   1800)
  ) AS d(c, pkg, cat, sec);

  INSERT INTO public.family_messages (family_code, author_id, author_role, author_name, body, created_at)
  VALUES
    (fam, m, 'child', 'Madina', 'Dada, maktabga yetib keldim 🙂', kun + interval '7 hours 53 minutes'),
    (fam, 'parent_0', 'parent', 'Aziz (namuna)', 'Barakalla! Darsdan keyin to''g''ri uyga kel.', kun + interval '7 hours 55 minutes'),
    (fam, s, 'child', 'Sardor', 'Darsdan keyin sport zaliga boraman', kun + interval '12 hours 40 minutes');
END $$;
