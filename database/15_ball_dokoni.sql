-- ============================================================================
-- BALL DO'KONI
--
-- Vaqt banki endi "ekran vaqti" emas, BALL. Ball Pro'ga almashtirilmaydi:
-- Pro'ni ota-ona sotib oladi, bolaga esa o'zi his qiladigan sovg'a kerak.
--
-- Nima o'zgardi:
-- 1) Fokus seansi o'zi ball bermaydi. Taymer tugagach 3 ta savol beriladi,
--    har biriga 15 soniya — vaqtni SERVER o'lchaydi. Kamida 2 tasi to'g'ri
--    bo'lsa ball yoziladi. Aks holda bola taymerni yoqib qo'yib o'ynab
--    yurishi mumkin edi.
-- 2) Uy vazifasini ota-ona botda tasdiqlaydi.
-- 3) Ball sarflanadigan joylar: ota-ona sovg'alari, yorliqlar, bo'ri
--    buyumlari, o'yinlar, AI savollar va raqamlangan kolleksiya kartalari.
--
-- Balans hamon time_bank_entries yig'indisi: sarflash — manfiy yozuv.
-- Sarflash faqat shu fayldagi funksiyalar orqali: ular oila+bola bo'yicha
-- qulf oladi, shuning uchun ikki parallel xarid bitta ballni ikki marta
-- sarflay olmaydi.
-- ============================================================================

-- 1. Fokus tekshiruvi
ALTER TABLE public.focus_sessions
    ADD COLUMN IF NOT EXISTS check_questions JSONB,
    ADD COLUMN IF NOT EXISTS check_answers JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS check_issued_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS check_correct INTEGER,
    ADD COLUMN IF NOT EXISTS check_passed BOOLEAN;

-- 2. Uy vazifasi — ota-ona tasdig'i
ALTER TABLE public.homework_items
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS decided_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS awarded INTEGER;

-- 3. Ota-onaning sovg'alar ro'yxati (butun oila uchun)
CREATE TABLE IF NOT EXISTS public.reward_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_code TEXT NOT NULL,
    emoji TEXT NOT NULL DEFAULT '🎁',
    title TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price > 0 AND price <= 100000),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reward_items_family ON public.reward_items(family_code, active);

-- 4. Sovg'a so'rovlari (ota-ona tasdiqlaydi)
CREATE TABLE IF NOT EXISTS public.reward_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_code TEXT NOT NULL,
    child_id TEXT NOT NULL,
    item_id UUID,
    emoji TEXT,
    title TEXT NOT NULL,
    price INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',   -- pending | approved | rejected
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decided_at TIMESTAMPTZ,
    decided_by BIGINT
);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_child ON public.reward_redemptions(family_code, child_id, status);

-- 5. Raqamli buyumlar: yorliq, bo'ri buyumi, o'yin. Iste'mol qilinadiganlar
--    (AI savollar) ham shu yerga yoziladi, faqat har xarid alohida qator.
CREATE TABLE IF NOT EXISTS public.shop_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_code TEXT NOT NULL,
    child_id TEXT NOT NULL,
    item_key TEXT NOT NULL,
    price INTEGER NOT NULL,
    equipped BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_shop_purchases_child ON public.shop_purchases(family_code, child_id, item_key);

-- 6. Kolleksiya kartalari. Har kartaning butun ilova bo'yicha cheklangan
--    nusxasi bor va har nusxa raqamlangan: "#0147 / 300". Raqam takrorlanmaydi.
CREATE TABLE IF NOT EXISTS public.collectible_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_key TEXT NOT NULL,
    serial INTEGER NOT NULL,
    family_code TEXT NOT NULL,
    child_id TEXT NOT NULL,
    acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (card_key, serial)
);
CREATE INDEX IF NOT EXISTS idx_collectible_cards_child ON public.collectible_cards(family_code, child_id);

ALTER TABLE public.reward_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collectible_cards ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Balans
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.qalqon_balance(p_family TEXT, p_child TEXT)
RETURNS INTEGER LANGUAGE sql STABLE AS $$
    SELECT COALESCE(SUM(minutes), 0)::int
    FROM public.time_bank_entries
    WHERE family_code = p_family AND child_id = p_child;
$$;

-- ----------------------------------------------------------------------------
-- Ball yechish (sovg'a tasdiqlanganda). false — ball yetmaydi.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.qalqon_spend(
    p_family TEXT, p_child TEXT, p_amount INTEGER, p_reason TEXT, p_note TEXT
) RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
    IF p_amount <= 0 THEN RETURN FALSE; END IF;
    PERFORM pg_advisory_xact_lock(hashtext('qalqon_ball:' || p_family || ':' || p_child));
    IF public.qalqon_balance(p_family, p_child) < p_amount THEN
        RETURN FALSE;
    END IF;
    INSERT INTO public.time_bank_entries (family_code, child_id, minutes, reason, note)
    VALUES (p_family, p_child, -p_amount, p_reason, p_note);
    RETURN TRUE;
END;
$$;

-- ----------------------------------------------------------------------------
-- Do'kondan xarid. Natija: 'ok' | 'owned' | 'no_balance'.
-- Pending sovg'a so'rovlari band qilingan ball hisoblanadi.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.qalqon_buy(
    p_family TEXT, p_child TEXT, p_item TEXT, p_price INTEGER, p_consumable BOOLEAN
) RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
    reserved INTEGER;
BEGIN
    PERFORM pg_advisory_xact_lock(hashtext('qalqon_ball:' || p_family || ':' || p_child));
    IF NOT p_consumable AND EXISTS (
        SELECT 1 FROM public.shop_purchases
        WHERE family_code = p_family AND child_id = p_child AND item_key = p_item
    ) THEN
        RETURN 'owned';
    END IF;
    SELECT COALESCE(SUM(price), 0) INTO reserved FROM public.reward_redemptions
    WHERE family_code = p_family AND child_id = p_child AND status = 'pending';
    IF public.qalqon_balance(p_family, p_child) - reserved < p_price THEN
        RETURN 'no_balance';
    END IF;
    INSERT INTO public.time_bank_entries (family_code, child_id, minutes, reason, note)
    VALUES (p_family, p_child, -p_price, 'shop', p_item);
    INSERT INTO public.shop_purchases (family_code, child_id, item_key, price)
    VALUES (p_family, p_child, p_item, p_price);
    RETURN 'ok';
END;
$$;

-- ----------------------------------------------------------------------------
-- Karta qutisi. p_candidates — server tanlagan tartibdagi kartalar:
-- [{"key":"olov","supply":300}, ...]. Birinchi nusxasi qolgan karta beriladi.
-- Natija: {"status":"ok","card_key":..,"serial":..} | {"status":"no_balance"}
--         | {"status":"sold_out"}
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.qalqon_open_box(
    p_family TEXT, p_child TEXT, p_price INTEGER, p_candidates JSONB
) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
    reserved INTEGER;
    cand JSONB;
    next_serial INTEGER;
BEGIN
    PERFORM pg_advisory_xact_lock(hashtext('qalqon_ball:' || p_family || ':' || p_child));
    SELECT COALESCE(SUM(price), 0) INTO reserved FROM public.reward_redemptions
    WHERE family_code = p_family AND child_id = p_child AND status = 'pending';
    IF public.qalqon_balance(p_family, p_child) - reserved < p_price THEN
        RETURN jsonb_build_object('status', 'no_balance');
    END IF;

    -- Raqamlar butun ilova bo'yicha yagona — shuning uchun umumiy qulf.
    PERFORM pg_advisory_xact_lock(hashtext('qalqon_cards'));
    FOR cand IN SELECT * FROM jsonb_array_elements(p_candidates) LOOP
        SELECT COALESCE(MAX(serial), 0) + 1 INTO next_serial
        FROM public.collectible_cards WHERE card_key = cand->>'key';
        IF next_serial <= (cand->>'supply')::int THEN
            INSERT INTO public.time_bank_entries (family_code, child_id, minutes, reason, note)
            VALUES (p_family, p_child, -p_price, 'shop', 'card_box');
            INSERT INTO public.collectible_cards (card_key, serial, family_code, child_id)
            VALUES (cand->>'key', next_serial, p_family, p_child);
            RETURN jsonb_build_object('status', 'ok', 'card_key', cand->>'key', 'serial', next_serial);
        END IF;
    END LOOP;
    RETURN jsonb_build_object('status', 'sold_out');
END;
$$;

REVOKE ALL ON FUNCTION public.qalqon_balance(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.qalqon_spend(TEXT, TEXT, INTEGER, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.qalqon_buy(TEXT, TEXT, TEXT, INTEGER, BOOLEAN) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.qalqon_open_box(TEXT, TEXT, INTEGER, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.qalqon_balance(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.qalqon_spend(TEXT, TEXT, INTEGER, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.qalqon_buy(TEXT, TEXT, TEXT, INTEGER, BOOLEAN) TO service_role;
GRANT EXECUTE ON FUNCTION public.qalqon_open_box(TEXT, TEXT, INTEGER, JSONB) TO service_role;

-- Ball endi Pro'ga almashtirilmaydi. Jadval tarix uchun qoladi.
