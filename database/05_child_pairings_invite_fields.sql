-- ============================================================================
-- PARENT-INITIATED CHILD INVITES
--
-- WHY: the Mini App's "add child" form collects a name, a grade and the
--   child's Telegram username, but at that moment the child has NOT opened
--   the pairing link yet, so their Telegram numeric id is unknown. The bot
--   therefore stores the invite keyed on the username (child_id =
--   "invite_<username>") and swaps it for the real "tg_<id>" row once the
--   child consents (see reconcileInvite() in ota-ona-bot/index.ts).
--
--   03_qalqon_realtime_features.sql had no place to keep the grade or the
--   username, which is why these two columns are added here rather than
--   being edited into 03 — 03 has already been applied to production and
--   editing an applied migration hides history.
--
-- Both columns are nullable and added with IF NOT EXISTS, so this file is
-- additive and safe to re-run.
-- ============================================================================

ALTER TABLE public.child_pairings ADD COLUMN IF NOT EXISTS grade INTEGER;
ALTER TABLE public.child_pairings ADD COLUMN IF NOT EXISTS telegram_username TEXT;

-- reconcileInvite() looks an invite up by (family_code, telegram_username)
-- on every child_consent, so give that lookup an index.
CREATE INDEX IF NOT EXISTS idx_child_pairings_username
    ON public.child_pairings(family_code, telegram_username)
    WHERE telegram_username IS NOT NULL;
