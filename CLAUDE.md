# Qalqon AI — agent uchun yo'riqnoma

Bu fayl har bir Claude Code sessiyasida (noutbukda ham, bulutda ham)
birinchi o'qiladi. Egasi — Quddusxon (GitHub: `abduquddus1990`). U ko'pincha
telefondan topshiriq beradi va natijani telefonda ko'radi.

## Foydalanuvchi bilan ishlash

- **Javoblar o'zbek tilida.** Sodda til, texnik jargonsiz.
- **Tezlik:** bitta funksiyani server + baza + mijoz bilan birga, ishlaydigan
  holda yetkazing. Har qadamda ruxsat so'ramang; aniq javobi bor narsani
  kod yoki jonli tizimdan o'zingiz tekshiring.
- **Qo'lda bajariladigan qadam** kerak bo'lsa, har safar: (1) aynan o'sha
  sahifaga to'g'ridan-to'g'ri havola, (2) qaysi tugma, qayerda, nima kutish
  kerak — qadamma-qadam. Tugma nomi haqiqatan borligini avval tekshiring;
  u telefonda ishlayotgan bo'lishi mumkin (Telegram Desktop'da bor narsa
  telefonda boshqacha joyda).
- **Tanlov** kerak bo'lsa, 2–4 variantni bir jumladan oqibati bilan bering
  va tavsiyangizni ayting — u o'zi tanlaydi.
- **Dizayn takliflari** — JPEG (Playwright bilan HTML'dan render qilinadi).
- **Ilova (Mini App) ko'rinishini o'zgartirishdan OLDIN** JPEG'da ko'rsatib,
  tasdiq oling. Merge qilingan Mini App o'zgarishi darhol jonli bo'ladi
  (Telegram ham, Android ham) — foydalanuvchi uni oldindan ko'ra olmaydi.
  2026-10-05 da "Tinch tong" uslubi JPEG'siz merge bo'lib ketgani uchun
  u shuni aniq so'radi.

## Loyiha tuzilishi

| Qism | Joyi | Qayerda ishlaydi |
|---|---|---|
| Server (bot + API) | `supabase/functions/ota-ona-bot/index.ts` (bitta katta fayl) | Supabase Edge Function |
| Ma'lumotlar bazasi | `database/NN_*.sql` migratsiyalar | Supabase Postgres |
| Mini App (ota-ona va farzand paneli) | `index.html`, `app.js`, ... **va** `telegram_miniapp/` dagi nusxa | GitHub Pages: abduquddus1990.github.io/ota-ona-nazorat |
| Android ilova | `android/` — faqat kirish va ulash ekranlari native, qolgani Mini App'ni WebView'da ochadi | Google Play (ko'rib chiqilmoqda) |
| Sayt qalqonai.uz | `site/` (+ ildizdagi huquqiy hujjatlar) | `abduquddus1990/qalqon-site` reposi, GitHub Pages |

**Mini App ikki nusxada:** ildizdagi `index.html`/`app.js` va
`telegram_miniapp/` dagisi bir xil bo'lishi shart (`diff -q` bilan tekshiring).
Pages `telegram_miniapp/` ni chiqaradi. `app.js` o'zgarsa, `index.html` dagi
`app.js?v=` raqamini oshiring — aks holda Telegram eski faylni keshdan oladi.

## Deploy

- **Server:** `main` ga `supabase/functions/**` o'zgarishi tushganda
  `.github/workflows/deploy-function.yml` uni avtomatik deploy qiladi
  (GitHub sekreti `SUPABASE_ACCESS_TOKEN`). Qo'lda:
  `npx -y supabase@latest functions deploy ota-ona-bot --project-ref wfrclcwjeeqeqchmdhzw --no-verify-jwt --use-api`.
  `--no-verify-jwt` **majburiy** — Telegram webhook JWT yubormaydi.
  Supabase loyihasining nomi chalg'itadi: "xodim-intizom", lekin aynan shu.
- **Baza migratsiyasi** avtomatik emas. Yangi `database/NN_*.sql` faylni
  foydalanuvchidan aniq ruxsat olib, Supabase Management API orqali
  (`POST /v1/projects/{ref}/database/query`) qo'llang. Server kodi yangi
  jadvalga tayansa, **avval migratsiya, keyin deploy**, keyin Mini App PR'i.
- **Mini App:** `main` ga merge = GitHub Pages deploy (`deploy.yml`).
- **Sayt:** `qalqon-site` reposidagi workflow ushbu repoga qarab
  `site/build.sh` ni ishga tushiradi va chiqaradi. Huquqiy hujjatlarning
  manbasi — ildizdagi `privacy-policy.html`, `terms.html`,
  `account-deletion.html`, `about.html` (nusxa olmang, build o'zi oladi).
- Jonli tizimga chiqarish (deploy, migratsiya, ma'lumot o'qish) — faqat
  foydalanuvchi aniq ruxsat bergan bo'lsa yoki merge orqali.

## "Bajarildi" deyishdan oldin

Bu loyihada "bajarildi" xabari bir necha marta haqiqatga mos kelmagan.
- Server o'zgarishi: deploy'dan keyin Supabase loglarini tekshiring
  (`GET /v1/projects/{ref}/analytics/endpoints/logs`, ClickHouse SQL,
  jadval nomi `logs`: `select timestamp, event_message from logs ...`).
- Mini App o'zgarishi: **haqiqiy brauzerda** (Playwright) — `pageerror`,
  `console.error`, bloklangan so'rovlar. `curl` CORS'ni ko'rmaydi; bir marta
  shu sabab haftalab xato qolib ketgan. `telegram-web-app.js` ni stub bilan
  almashtiring.
- `index.ts` ichidagi mantiqni sinash: kerakli funksiyalarni fayldan kesib
  olib (`.ts` modul), soxta `db` bilan Node 24 da ishga tushirish yaxshi
  ishladi. Real ma'lumotni "replay" qilish — eng ishonchli tekshiruv.

## Git

- Har yangi branch **`main` dan**: `git checkout main && git pull` keyin
  `git checkout -b ...`. Oldingi PR branchidan ajratilsa, squash merge
  konflikt beradi.
- Foydalanuvchi PR'ni ba'zan ikki marta merge qiladi — ikkinchisi bo'sh
  commit bo'lib tushadi, zararsiz.
- Repo **ochiq (public)** — hech qachon token, parol yoki shaxsiy
  ma'lumotni kodga yozmang.

## Muhim bilimlar

- **Geozona** (`evaluateGeofences`): bino ichida aniqlik 100–200 m. Noaniq
  nuqta (100–500 m) chiqishni e'lon qilmaydi, kirishni esa ikki o'lchov yoki
  to'liq ichkaridagi xato doirasi bilan tasdiqlaydi; >500 m e'tiborsiz.
  Chiqish ikki o'lchov bilan tasdiqlanadi; >1 km sakrash darhol.
  "Oldingi nuqta" nusxa (bir xil `recorded_at`) bo'lmasligi kerak.
- **Ota-onalar:** oila asosiy ota-onaning Telegram ID'siga bog'langan;
  ikkinchi ota-ona (ona) `family_parents` jadvalida. `familyCodeFor()` va
  `familyParentIds()` — markaziy joylar; barcha xabarlar
  `notifyFamilyParents()` orqali hammaga boradi.
- **Push (FCM) sozlanmagan:** `FCM_SERVICE_ACCOUNT` sekreti yo'q, shuning
  uchun ogohlantirishlar faqat Telegram orqali boradi.
- **Domen qalqonai.uz** — ahost.uz (DNS-хостинг yoqilgan). A `@` → GitHub
  Pages'ning 4 IP'si, `www` → `abduquddus1990.github.io`, `mail` →
  `185.196.212.52` (ahost pochta yo'naltirishi), MX `@` → `mail.qalqonai.uz`.
  2026-10-05 holatiga HTTPS sertifikati hali chiqmagan (GitHub "InvalidDNSError"
  keshini kutish yoki Cloudflare).

## Dizayn qarorlari (2026-10)

- Ilova uslubi: **"Tinch tong"** — yorug', Nunito shrifti, to'q ko'k
  `#0f2a4a`, ko'k `#1d6fe0`, zangori `#22b8e6`. Bosh ekran "Madina hozir
  maktabda" kabi bitta javobdan boshlanadi: holat, xarita, bitta asosiy
  tugma, bugungi voqealar. Reklama banneri yo'q.
- Pastki panel: **suzuvchi "tabletka"**, 3 bo'lim (Asosiy · Xarita ·
  Farzand), Sozlamalar — o'ng yuqoridagi profil doirasida. Farzand paneli:
  Asosiy · O'qish · O'yinlar.
- Maskot: **3D qalqonli bo'ri** (`site/assets/qalqon-qoriqchi.webp`, fonsiz).
  Realistik va multfilm bo'rilarni aralashtirmang.
- Sayt: **"Studiya tongi"** — yorug' ko'k studiya foni, 3D burchakda
  suzuvchi ilova ekranlari, bo'ri.
- Bot: "Start" oldidan 6 soniyalik video (BotFather → Edit Description
  Picture): shahar sxemasi → nuqta maktabga yetadi → qalqon yonadi →
  "Maktabga yetdi" xabari → logotip. Hali tayyorlanmagan.

## Aloqa

Saytdagi aloqa: Telegram **@ai_loyihachi**. `support@qalqonai.uz` hali
sozlanmagan (ahost'da pochta yo'naltirish bor, foydalanuvchi keyinga qoldirgan).
