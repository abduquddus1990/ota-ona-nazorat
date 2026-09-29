-- Qurilma "sog'ligi": ota-ona xaritada eski nuqtani ko'rsa, SABABINI ham
-- bilishi kerak.
--
-- Muammo: hozir eski joylashuv va "hammasi joyida" bir xil ko'rinadi. Bola
-- uydami, telefon o'chganmi, joylashuv ruxsati olib tashlanganmi yoki
-- batareya tejash ilovani uxlatib qo'yganmi — ota-ona buni farqlay olmaydi.
-- Bu mahsulotga bo'lgan ishonchni yemiradi: ota-ona ko'rsatkichga ishonadi,
-- lekin u eskirgan bo'lishi mumkin.
--
-- Telefonning o'zi bu holatni biladi, shuning uchun har sinxronizatsiyada
-- shu yerga yozib boradi.
CREATE TABLE IF NOT EXISTS public.device_health (
    family_code TEXT NOT NULL,
    child_id TEXT NOT NULL,
    location_permission BOOLEAN,
    background_location BOOLEAN,
    usage_permission BOOLEAN,
    battery_unrestricted BOOLEAN,
    battery_level INT,
    app_version TEXT,
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (family_code, child_id)
);

ALTER TABLE public.device_health ENABLE ROW LEVEL SECURITY;
