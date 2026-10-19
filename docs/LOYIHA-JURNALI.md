# Qalqon AI — loyiha jurnali

Yangi sessiya (noutbuk yoki bulut) shu faylni `CLAUDE.md` dan keyin o'qiydi —
Quddusxonga hech narsani noldan tushuntirmaslik uchun. Har katta qadamdan keyin
yangilanadi. **Sir (token, parol, kalit) bu yerga yozilmaydi** — repo ochiq.

Suhbatlarning to'liq matni (tokenlar yashirilgan) faqat egasining kompyuterida:
`C:\Users\Surface\qalqon-maxfiy\suhbatlar\` (`export_suhbatlar.py` qayta yangilaydi).

---

## Hozirgi holat (2026-10-19)

| Qism | Holat |
|---|---|
| Server | Supabase **`qalqon-ai`** (`ytjvmmcpmpnaivtzymtq`, Frankfurt). Eski Sidney loyihasi — faqat Xodim intizom boti + yo'naltiruvchi proxy |
| Mini App | GitHub Pages, oldindan yig'ilgan Tailwind, panel ~2,4× tez ochiladi, `panel_bootstrap` |
| Android | 1.0.1 (versionCode 2). Google bilan kirish, kodsiz ota-ona kirishi, ilova ichidagi animatsiya, haqiqiy bo'ri ikonkasi |
| AI do'st | gemini-3.1-flash-lite, **vaqtincha BEPUL kalit** (Google prepay sozlanmagan); din va O'zbekiston siyosati — rad, jahon geosiyosati — faqat ilmiy |
| Play Market | Hujjatlar tayyor: `docs/play/PLAY-CONSOLE.md`. Yopiq test (12 tester × 14 kun) hali boshlanmagan |
| To'lov | YO'Q. Reja: sotuvdan keyin YaTT, Paynet; tariflar keyin hal qilinadi |
| Foydalanuvchilar | 6 oila, 3 farzand (2026-10-19) |

## Egasining qarorlari (o'zgartirishdan oldin so'rang)

- Javoblar o'zbekcha, sodda; dizayn o'zgarishi — avval JPEG.
- Farzand o'z telefonidagi kuzatuvni o'zi uza oladi (rozilik) — ota-onaga xabar boradi.
- AI do'st Pro tarifga o'tadi (tariflar keyin). Kunlik narx emas — 30 savol/kun ≈ **3 400 so'm OYIGA** (gemini-3.1-flash-lite).
- Tariflar 50 000 so'mdan oshmasin; Pro va Max taklif qilingan, qaror kutilmoqda.
- AI qoidalari: din — rad; O'zbekiston siyosati — rad; jahon geosiyosati — faqat ilmiy, betaraf.
- Ijtimoiy tarmoqlar: Telegram **@aibotqalqon**, Instagram va YouTube **@qalqon_ai**. Aloqa: **quddusxon90@gmail.com**.
- Ikonka: ilovadagi ota bo'rining yuzi, o'zgarishsiz. Multfilm ikonka rad etilgan.

## Ochiq masalalar (ustuvorlik bo'yicha)

1. **Play:** yopiq testni ochish (12 tester), GitHub'ga yuklash kaliti sekretlari, Google Cloud'da Android OAuth mijozi (SHA-1'lar `docs/play/PLAY-CONSOLE.md` da), skrinshotlar, feature graphic, ruxsat videosi.
2. **Push (Firebase) yo'q** — ogohlantirishlar faqat Telegram orqali; Telegram'siz (faqat Google) ota-ona SOS olmaydi. Firebase loyiha + `google-services.json` + `FCM_SERVICE_ACCOUNT` kerak.
3. **AI pullik kalit** — Google prepay ($50 vaqtincha band qilinadi). Bepul kalit: kunlik/daqiqalik limit, Google ma'lumotdan o'qitish uchun foydalanishi mumkin.
4. **Supabase tokeni** suhbatda ochiq yozilgan — yangisini yaratib GitHub'ga qo'yish, eskisini o'chirish.
5. **Tariflar va to'lov** — Play ichida raqamli obuna faqat **Google Play Billing**; Telegram ichida — Stars; Paynet/Click — faqat saytda, Android ilovadan havola berish taqiqlanadi.
6. Telefon ilovani fonda o'chirib qo'yadi (Xiaomi, Huawei, Samsung) — avtostart yo'riqnomasi (YouTube video + ilovada havola).
7. Supabase bepul tarifi ~80 faol farzandgacha; zaxira cheklangan.
8. Kelajak: o'z serveri O'zbekistonda (shaxsiy ma'lumotlarni lokallashtirish qonuni) — ishga tushirishdan keyin.

## Muhim texnik bilimlar

- Deploy: `main` ga merge = server (GitHub `SUPABASE_ACCESS_TOKEN`) + Mini App (Pages, Tailwind o'zi yig'iladi). Sayt `qalqon-site` reposi orqali.
- Android Play AAB: Actions → "Android Play AAB" (qo'lda). Sinov APK: har merge'dan keyin `releases/download/apk/qalqon.apk`.
- Animatsiya o'zgarsa: `python tools/sync_android_splash.py`. Tailwind: `bash tools/tailwind/build.sh`.
- Sinovlar: `deno run -A --no-check tests/security/security_test.ts` (66 ssenariy), jonli: `node tools/security_check.mjs`.
- Windows bash heredoc `\n`, `\'` larni buzadi — escape'li kodni Edit yoki .py fayl orqali yozing.
- Maxfiy fayllar (faqat egasining kompyuterida): `C:\Users\Surface\qalqon-maxfiy\` — Frankfurt baza paroli, webhook kaliti, Play yuklash kaliti.

## Xronologiya (qisqa)

- **2026-09:** Telegram bot + Mini App + Android; kirish oqimlari, joylashuv, geozonalar, xavfsizlik asoslari.
- **2026-10-02…06:** "Tinch tong" dizayni, panel animatsiyasi, ona qo'shish, xarita B uslubi, haqiqiy statistika.
- **2026-10-07…08:** pentest → xavfsizlik 1–2-bosqich (admin faqat ID, parolli kirish Telegramda tasdiqlanadi, yangi kirish/qurilma ogohlantirishlari, jurnal, avtomatik sinovlar).
- **2026-10-08:** Gemini kalitlari bloklandi (prepay) → bepul kalit + 3.1 Flash Lite.
- **2026-10-12…13:** 3-bosqich: `<` li SOS yetmasdi, ism orqali XSS, hudud tugmalari, ulash tasdig'i, apostrof.
- **2026-10-17:** ilova ichidagi animatsiya, real bo'ri ikonkasi; tezlik: Tailwind oldindan, shriftlar, rasmlar, panel_bootstrap.
- **2026-10-18:** baza Sidney → **Frankfurt** (3659 qator, mos); bot webhook bo'sh edi — tiklandi.
- **2026-10-19:** Play audit: monitoring belgisi, AI shikoyat tugmasi, maxfiylik siyosati, haqiqiy pochta, AI mavzu chegaralari, Android Google kirishi, farzandga ulash havolasi, Play hujjatlari, AAB ish oqimi; eski Sidney jadvallari o'chirildi.
