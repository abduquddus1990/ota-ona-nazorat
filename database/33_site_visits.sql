-- 33: qalqonai.uz tashriflari (sayt statistikasi) + har ertalabki hisobot.
--
-- Server: index.ts -> handleSiteVisit (site_visit), saytHisoboti,
-- cron_site_report. Cookie yo'q, IP saqlanmaydi: vid — brauzerdagi tasodifiy
-- raqam (localStorage), shaxsni aniqlamaydi. 180 kundan eskisi o'chadi.
--
-- Ishga tushirish: GitHub Actions -> "Baza SQL" -> file: 33_site_visits.sql
-- (server deploy'dan OLDIN).

CREATE TABLE IF NOT EXISTS public.site_visits (
  id          bigserial PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
  vid         text,
  path        text NOT NULL DEFAULT '/',
  event       text,
  source      text,
  device      text
);
CREATE INDEX IF NOT EXISTS idx_site_visits_created ON public.site_visits(created_at);

-- Faqat server (service_role) yozadi va o'qiydi.
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deny_all_site_visits ON public.site_visits;
CREATE POLICY deny_all_site_visits ON public.site_visits
  TO authenticated, anon USING (false) WITH CHECK (false);

-- Har kuni 08:00 Toshkent (03:00 UTC): kechagi hisobot adminga.
DO $$
BEGIN
  PERFORM cron.unschedule('qalqon_site_report')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'qalqon_site_report');
  PERFORM cron.schedule('qalqon_site_report', '0 3 * * *', $cmd$SELECT net.http_post(
    url := 'https://ytjvmmcpmpnaivtzymtq.supabase.co/functions/v1/ota-ona-bot',
    headers := jsonb_build_object('Content-Type','application/json',
      'X-Telegram-Bot-Api-Secret-Token', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'qalqon_cron_key')),
    body := jsonb_build_object('type','cron_site_report'))$cmd$);

  -- Eski yozuvlarni tozalash (har yakshanba 04:00 UTC).
  PERFORM cron.unschedule('qalqon_site_visits_cleanup')
    WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'qalqon_site_visits_cleanup');
  PERFORM cron.schedule('qalqon_site_visits_cleanup', '0 4 * * 0',
    $cmd$DELETE FROM public.site_visits WHERE created_at < now() - interval '180 days'$cmd$);
END $$;
