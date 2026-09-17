-- ============================================================================
-- O'QISH SMENASI
--
-- Ko'p maktablarda ikkinchi smena bor: bola 12:30 yoki 13:00 ga keladi.
-- Ilgari "Maktab" hududiga kelish vaqti har doim 08:00 deb taklif qilinardi —
-- ikkinchi smenadagi bola ertalab maktabda bo'lmagani uchun hech qachon
-- "o'z vaqtida" ball olmasdi. Endi ota-ona farzandni qo'shayotganda smenani
-- tanlaydi va maktab hududining kelish vaqti shundan olinadi.
-- ============================================================================

ALTER TABLE public.child_invites
    ADD COLUMN IF NOT EXISTS school_shift SMALLINT,
    ADD COLUMN IF NOT EXISTS school_arrive_by TEXT;

ALTER TABLE public.child_pairings
    ADD COLUMN IF NOT EXISTS school_shift SMALLINT,
    ADD COLUMN IF NOT EXISTS school_arrive_by TEXT;
