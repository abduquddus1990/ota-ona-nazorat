// Avtomatik xavfsizlik tekshiruvi — jonli serverga "hujumchi" sifatida
// kirishga urinadi va HAR BIRI rad etilishini kutadi.
//
// Nega kerak: 2026-10-07 dagi tekshiruv topgan teshiklar (`/admin`, `%` bilan
// kirish, himoyasiz jadval) kodda bir paytlar yopiq bo'lib, keyingi
// o'zgarishlarda qaytadan ochilib qolgan edi. Bu skript har kuni va har
// merge'dan keyin ishlaydi (.github/workflows/security-check.yml) — teshik
// qaytsa, GitHub darhol qizil belgi va xat yuboradi.
//
// Faqat RUXSATSIZ so'rovlar yuboriladi: hech qanday hisobga kirilmaydi,
// hech kimning ma'lumoti o'qilmaydi.
//
// Ishga tushirish:  node tools/security_check.mjs
// Ixtiyoriy:        SUPABASE_ACCESS_TOKEN — bazadagi har bir jadvalda RLS
//                   yoqilganini ham tekshiradi.

import { execSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

const FN = "https://wfrclcwjeeqeqchmdhzw.supabase.co/functions/v1/ota-ona-bot";
const PROJECT_REF = "wfrclcwjeeqeqchmdhzw";
const ORIGIN = "https://abduquddus1990.github.io";

const natijalar = [];
function tekshir(ok, nomi, tafsilot) {
  natijalar.push(ok);
  console.log(`${ok ? "✅" : "❌"} ${nomi}${ok || tafsilot === undefined ? "" : "\n     → " + String(tafsilot).slice(0, 300)}`);
}

async function post(body, headers = {}) {
  const r = await fetch(FN, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN, ...headers },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* matn */ }
  return { status: r.status, json, text, headers: r.headers };
}

// ---------------------------------------------------------------- server
console.log("— Server (ota-ona-bot)");

const tirik = await fetch(FN);
tekshir(tirik.status === 200, "Funksiya ishlayapti", tirik.status);

// Telegram webhook maxfiy tokensiz — soxta "tugma bosildi" yuborib bo'lmasligi kerak.
let r = await post({ update_id: 1, callback_query: { id: "x", from: { id: 1 }, message: { chat: { id: 1 } }, data: "admin_approve_123456" } });
tekshir(r.status === 403, "Webhook maxfiy tokensiz rad etiladi", `${r.status} ${r.text}`);
r = await post({ update_id: 1, message: { chat: { id: 1 }, from: { id: 1 }, text: "/admin" } }, { "x-telegram-bot-api-secret-token": "soxta" });
tekshir(r.status === 403, "Webhook noto'g'ri token bilan rad etiladi", `${r.status} ${r.text}`);

// Hisob ma'lumotisiz yopiq bo'lishi kerak bo'lgan amallar.
const yopiq = [
  "list_devices", "revoke_device", "security_overview", "revoke_session", "revoke_other_sessions",
  "set_password", "coparent_list", "coparent_invite_start", "link_telegram_start",
  "create_device_pair_code", "radar_status", "parent_registration_request", "delete_account",
];
for (const type of yopiq) {
  r = await post({ type });
  tekshir(r.status === 401, `«${type}» kirishsiz rad etiladi`, `${r.status} ${r.text}`);
}

// Soxta Telegram imzosi.
const soxtaInit = new URLSearchParams({
  auth_date: String(Math.floor(Date.now() / 1000)),
  user: JSON.stringify({ id: 777000, first_name: "Hujumchi" }),
  hash: "0".repeat(64),
}).toString();
r = await post({ type: "list_devices", initData: soxtaInit });
tekshir(r.status === 401, "Soxta Telegram imzosi rad etiladi", `${r.status} ${r.text}`);

// Soxta seans va qurilma kalitlari.
r = await post({ type: "security_overview", sessionToken: "a".repeat(64) });
tekshir(r.status === 401, "Soxta seans kaliti rad etiladi", `${r.status} ${r.text}`);
r = await post({ type: "list_devices", deviceToken: "b".repeat(64) });
tekshir(r.status === 401, "Soxta qurilma kaliti rad etiladi", `${r.status} ${r.text}`);

// Parol bilan kirish: "%" va boshqa joker belgilar istalgan hisobni ochmasligi kerak.
for (const username of ["%", "a%", "_____", "*", "' or '1'='1"]) {
  r = await post({ type: "web_login", username, password: "123456" });
  tekshir(r.status === 401 || r.status === 429, `Login «${username}» bilan kirib bo'lmaydi`, `${r.status} ${r.text}`);
  tekshir(!(r.json && r.json.sessionToken), `Login «${username}» seans bermaydi`, r.text);
}

// Tasodifiy kodlar.
r = await post({ type: "device_pair", pairCode: "ZZZZZZZZ" });
tekshir(r.status === 403 || r.status === 429, "Tasodifiy qurilma kodi rad etiladi", `${r.status} ${r.text}`);
r = await post({ type: "parent_pair", code: "ZZZZZZZZ" });
tekshir(r.status === 403 || r.status === 429, "Tasodifiy ilova kodi rad etiladi", `${r.status} ${r.text}`);
r = await post({ type: "app_login_poll", token: "c".repeat(64) });
tekshir(r.json && r.json.status === "expired" && !r.json.sessionToken, "Tasodifiy kirish so'rovi seans bermaydi", r.text);

// Ichki (cron) chaqiruvlar maxfiy sarlavhasiz.
for (const type of ["cron_daily_digest", "cron_live_reminder", "cron_evening_check"]) {
  r = await post({ type });
  tekshir(r.status === 403, `«${type}» tashqaridan chaqirilmaydi`, `${r.status} ${r.text}`);
}

// CORS: Mini App javobni o'qiy olishi kerak (aks holda hamma narsa "Failed to fetch").
r = await post({ type: "list_devices" });
tekshir(!!r.headers.get("access-control-allow-origin"), "CORS sarlavhasi bor (xato javobda ham)", [...r.headers].join("; "));

// Xato javoblari ichki tafsilot (stack, SQL) chiqarmasligi kerak.
const buzuq = await fetch(FN, { method: "POST", headers: { "content-type": "application/json", origin: ORIGIN }, body: "{buzuq json" });
r = { status: buzuq.status, text: await buzuq.text() };
tekshir(!/at\s+\S+\s+\(|stack|postgres|PGRST|relation\s+"/i.test(r.text), "Buzuq so'rovga javobda ichki tafsilot yo'q", r.text);

// ------------------------------------------------------------------ baza
const PAT = process.env.SUPABASE_ACCESS_TOKEN || "";
if (PAT) {
  console.log("\n— Baza");
  const q = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: { authorization: `Bearer ${PAT}`, "content-type": "application/json" },
    body: JSON.stringify({
      query: "select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace " +
        "where n.nspname = 'public' and c.relkind in ('r','p') and not c.relrowsecurity order by 1",
    }),
  });
  if (q.ok) {
    const rows = await q.json();
    tekshir(Array.isArray(rows) && rows.length === 0, "Barcha jadvallarda RLS yoqilgan",
      "himoyasiz: " + (Array.isArray(rows) ? rows.map((x) => x.relname).join(", ") : JSON.stringify(rows)));
  } else {
    tekshir(false, "Bazani tekshirib bo'lmadi (SUPABASE_ACCESS_TOKEN?)", `${q.status} ${await q.text()}`);
  }
} else {
  console.log("\n— Baza: SUPABASE_ACCESS_TOKEN yo'q, RLS tekshiruvi o'tkazib yuborildi");
}

// ---------------------------------------------------------- repo sirlari
// Repo OCHIQ: bu yerga tushgan token yoki kalit butun dunyoga ochiq.
console.log("\n— Repodagi sirlar");
const SIRLAR = [
  [/sbp_(?:v0_)?[0-9a-f]{40}/, "Supabase shaxsiy tokeni"],
  [/\b\d{8,10}:AA[0-9A-Za-z_-]{33}\b/, "Telegram bot tokeni"],
  [/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]*c2VydmljZV9yb2xl/, "Supabase service_role kaliti"],
  [/sb_secret_[0-9A-Za-z_-]{20,}/, "Supabase maxfiy kaliti"],
  [/AIza[0-9A-Za-z_-]{35}/, "Google API kaliti"],
  [/-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/, "Shaxsiy kalit (PEM)"],
  [/"private_key"\s*:\s*"-----BEGIN/, "Service account JSON"],
];
// Faqat Git'dagi fayllar: .env kabi mahalliy fayllar .gitignore tufayli
// GitHub'ga chiqmaydi, ularni bu yerda sanash yolg'on signal beradi.
const fayllar = execSync("git ls-files -z", { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
  .split("\0").filter(Boolean);
const topildi = [];
for (const yol of fayllar) {
  if (/\.(png|jpe?g|webp|gif|mp4|mp3|ogg|wav|pdf|zip|apk|aab|jar|keystore|jks|ttf|woff2?)$/i.test(yol)) continue;
  let matn;
  try {
    if (statSync(yol).size > 2_000_000) continue;
    matn = readFileSync(yol, "utf8");
  } catch { continue; }
  for (const [re, tur] of SIRLAR) if (re.test(matn)) topildi.push(`${yol}: ${tur}`);
}
tekshir(topildi.length === 0, "Repoda token yoki maxfiy kalit yo'q", topildi.join("\n     → "));

const yiqildi = natijalar.filter((x) => !x).length;
console.log(`\n${natijalar.length - yiqildi}/${natijalar.length} tekshiruv o'tdi`);
process.exit(yiqildi ? 1 : 0);
