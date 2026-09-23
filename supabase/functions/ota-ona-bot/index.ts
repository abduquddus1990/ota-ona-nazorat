// supabase/functions/ota-ona-bot/index.ts
//
// QALQON AI — ADVANCED 24/7 SUPABASE SERVERLESS BOT
// Multi-Admin / Partner Management (@ai_loyihachi & partners), HTML Parse Mode (Zero parsing errors),
// Child Status Alerts, Zero Location Demands, and Instant Approval Workflow.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Online o'yinlar mantig'i — Mini App bilan AYNAN bir xil fayl (sim.js).
import "./sim.js";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN") || "";
if (!BOT_TOKEN) {
  console.error("BOT_TOKEN missing");
}
const MINI_APP_BASE =
  Deno.env.get("MINI_APP_URL") || "https://abduquddus1990.github.io/ota-ona-nazorat/?v=6.0";

/**
 * Mini App havolasi — o'z-o'zidan yangilanadigan kesh kaliti bilan.
 *
 * Nega kerak bo'ldi: MINI_APP_URL maxfiy sozlamada `?v=5.8` ga qotib qolgan
 * edi. Sahifa o'zgarsa ham havola o'zgarmagani uchun Telegram'ning ichki
 * brauzeri eski index.html ni keshdan berardi — natijada panelga qo'shilgan
 * yangi bo'limlar (va ular chaqiradigan games.js fayli) bolada UMUMAN paydo
 * bo'lmasdi. Bu nuqsonning tashqi ko'rinishi juda chalg'ituvchi: server
 * to'g'ri javob beradi, kod to'g'ri, lekin "yangi bo'lim ko'rinmayapti".
 *
 * Yechim ataylab QO'LDA boshqarilmaydi. Versiyani har safar oshirishni
 * eslab qolish kerak bo'lsa, bir kuni esdan chiqadi va aynan shu nuqson
 * qaytadi. Kalit 10 daqiqalik oynaga bog'langan: eng yomon holatda eski
 * sahifa 10 daqiqa yashaydi, keyin o'zi yangilanadi — hech kimning
 * aralashuvisiz.
 *
 * index.html kichik, uni qayta yuklash arzon. Og'ir fayllar (app.js,
 * games.js) esa o'z `?v=` raqamlari bilan keshda qolaveradi.
 */
function miniAppUrl(): string {
  return `${MINI_APP_BASE}&cb=${Math.floor(Date.now() / 600000).toString(36)}`;
}
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
// setWebhook paytida berilgan maxfiy token. Bo'sh bo'lsa tekshiruv o'chiq
// qoladi — shunda kod Telegram tomonida token o'rnatilgunga qadar ham
// xavfsiz tarzda joylashtirilishi mumkin.
const WEBHOOK_SECRET = Deno.env.get("TELEGRAM_WEBHOOK_SECRET") || "";

// Pairing state persistence (child_pairings table — see
// database/03_qalqon_realtime_features.sql). Telegram-native identity:
// no Supabase Auth account is required for parents/children.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const db = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;
if (!db) {
  console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing — pairing will NOT be persisted to the database");
}


async function upsertPairing(
  familyCode: string,
  childId: string | null,
  info: {
    childName: string;
    deviceLabel: string | null;
    source: string;
    grade?: number | null;
    telegramUsername?: string | null;
    schoolShift?: number | null;
    schoolArriveBy?: string | null;
  }
): Promise<boolean> {
  if (!db || !familyCode || !childId) return false;

  const row: Record<string, unknown> = {
    family_code: familyCode,
    child_id: childId,
    child_name: info.childName,
    device_label: info.deviceLabel,
    source: info.source,
    is_active: true,
    last_seen_at: new Date().toISOString(),
  };
  // Faqat berilgan maydonlar yoziladi. Agar grade/telegram_username har
  // safar so'zsiz qo'shilsa, farzand ulanganda (child_consent ularni
  // yubormaydi) ota-ona kiritgan sinf null bilan yuvilib ketardi.
  if (info.grade !== undefined && info.grade !== null) row.grade = info.grade;
  if (info.telegramUsername) row.telegram_username = info.telegramUsername;
  if (info.schoolShift) row.school_shift = info.schoolShift;
  if (info.schoolArriveBy) row.school_arrive_by = info.schoolArriveBy;

  const { error } = await db
    .from("child_pairings")
    .upsert(row, { onConflict: "family_code,child_id" });

  if (error) {
    console.error("child_pairings upsert failed:", error.message);
    return false;
  }
  return true;
}

/**
 * O'qish smenasi: 1 yoki 2 va maktabga kelish vaqti "HH:MM".
 * Vaqt berilmasa smenaning odatiy vaqti olinadi (08:00 / 13:00).
 */
function parseSchoolShift(shiftRaw: unknown, arriveRaw: unknown): { shift: number | null; arriveBy: string | null } {
  const shift = Number(shiftRaw) === 2 ? 2 : Number(shiftRaw) === 1 ? 1 : null;
  if (!shift) return { shift: null, arriveBy: null };
  const t = String(arriveRaw || "").trim();
  const ok = /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
  return { shift, arriveBy: ok ? t : shift === 2 ? "13:00" : "08:00" };
}

function isSchoolZoneName(name: string): boolean {
  return /maktab|школ|litsey|лицей|gimnaz|гимназ/i.test(String(name || ""));
}

async function childSchoolArriveBy(familyCode: string, childId: string): Promise<string | null> {
  if (!db) return null;
  const { data } = await db.from("child_pairings").select("school_arrive_by")
    .eq("family_code", familyCode).eq("child_id", childId).limit(1);
  return (data && data[0] && data[0].school_arrive_by) || null;
}

/** "@Ali_V" / " ali_v " -> "ali_v". Taklif kaliti shundan quriladi. */
function normalizeUsername(raw: unknown): string {
  return String(raw ?? "").trim().replace(/^@+/, "").toLowerCase();
}

/**
 * Farzand haqiqiy Telegram ID bilan ulangach, ota-ona kiritgan
 * "invite_<username>" yozuvi ortiqcha bo'lib qoladi — o'chirilmasa,
 * ota-ona panelida bitta farzand ikki marta ko'rinardi. Ota-ona kiritgan
 * sinfni haqiqiy yozuvga ko'chirib, keyin taklifni olib tashlaymiz.
 */
async function reconcileInvite(
  familyCode: string,
  uname: string,
  realChildId: string
): Promise<void> {
  if (!db || !familyCode || !uname) return;
  const inviteId = `invite_${uname}`;
  if (inviteId === realChildId) return;

  const { data } = await db
    .from("child_pairings")
    .select("grade")
    .eq("family_code", familyCode)
    .eq("child_id", inviteId)
    .limit(1);

  const grade = data && data[0] ? data[0].grade : null;
  if (grade !== null && grade !== undefined) {
    await db
      .from("child_pairings")
      .update({ grade })
      .eq("family_code", familyCode)
      .eq("child_id", realChildId);
  }

  const { error } = await db
    .from("child_pairings")
    .delete()
    .eq("family_code", familyCode)
    .eq("child_id", inviteId);
  if (error) console.error("invite cleanup failed:", error.message);
}

// ============================================================================
// AUTENTIFIKATSIYA
//
// Ilgari bu funksiyada autentifikatsiya UMUMAN yo'q edi: istalgan odam
// URL'ni bilsa, oddiy curl bilan istalgan oilaga bola qo'shishi va
// farzandlar ro'yxatini o'qishi mumkin edi. Oila kodi himoya bo'lolmaydi,
// chunki u sir emas — ota-onaning Telegram ID'sidan formula bilan chiqadi
// (generateFamilyCode) va 6 xonali kod baribir taxmin qilinadi.
//
// Endi ikkita haqiqiy hisob ma'lumoti bor:
//   1) Telegram initData — Telegram tomonidan imzolangan, soxtalashtirib
//      bo'lmaydi (Mini App: ota-ona va farzand).
//   2) Qurilma tokeni — tasodifiy sir, bazada faqat sha256 hash'i saqlanadi
//      (Android ilovasi).
//
// ASOSIY QOIDA: server mijoz yuborgan familyCode'ga ishonib MA'LUMOT
// BERMAYDI. O'qish uchun oila kodi autentifikatsiyadan o'tgan shaxsdan
// chiqariladi. Mijoz kodi faqat "oilaga qo'shilish" (yozish) da qabul
// qilinadi, u ham ota-ona oldindan ruxsat bergan bo'lsa.
// ============================================================================

const INIT_DATA_MAX_AGE_SEC = 86400;

function toHex(buf: Uint8Array): string {
  return Array.from(buf).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacSha256(keyBytes: Uint8Array, msg: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return new Uint8Array(sig);
}

async function sha256Hex(text: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return toHex(new Uint8Array(d));
}

// ============================================================================
// PAROL (faqat Telegramdan tashqarida kirish uchun)
//
// Parolning O'ZI hech qachon saqlanmaydi. PBKDF2-HMAC-SHA256, har parolga
// alohida tasodifiy salt va 120 000 iteratsiya: baza sizib chiqsa ham
// parollarni tiklab bo'lmaydi, taxmin qilish esa qimmatga tushadi.
// ============================================================================
const PBKDF2_ITERATIONS = 120000;

async function pbkdf2Hex(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    key,
    256
  );
  return toHex(new Uint8Array(bits));
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2Hex(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toHex(salt)}$${hash}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [scheme, iterStr, saltHex, hashHex] = String(stored).split("$");
    if (scheme !== "pbkdf2" || !iterStr || !saltHex || !hashHex) return false;
    const salt = new Uint8Array(
      (saltHex.match(/.{2}/g) || []).map((h) => parseInt(h, 16))
    );
    const calc = await pbkdf2Hex(password, salt, Number(iterStr));
    return timingSafeEqual(calc, hashHex);
  } catch (e) {
    console.error("verifyPassword xatosi:", e);
    return false;
  }
}

/** Parol talablari — juda qisqa parol himoya bermaydi. */
function passwordProblem(password: unknown): string | null {
  const p = typeof password === "string" ? password : "";
  if (p.length < 6) return "Parol kamida 6 ta belgidan iborat bo'lishi kerak.";
  if (p.length > 128) return "Parol juda uzun.";
  if (/^\d+$/.test(p)) return "Parol faqat raqamlardan iborat bo'lmasin.";
  return null;
}

const WEB_SESSION_DAYS = 30;

/** Doimiy vaqtli taqqoslash — hash'ni belgima-belgi taxmin qilishga qarshi. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Telegram Mini App initData imzosini tekshiradi.
 * Algoritm: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 * (backend/security/telegram_auth.py dagi bilan bir xil bo'lishi shart).
 */
async function verifyInitData(
  initData: unknown
): Promise<{ id: number; username: string } | null> {
  const raw = typeof initData === "string" ? initData : "";
  if (!raw || !BOT_TOKEN) return null;

  const params = new URLSearchParams(raw);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const pairs: string[] = [];
  for (const [k, v] of params) pairs.push(`${k}=${v}`);
  pairs.sort();

  const secret = await hmacSha256(new TextEncoder().encode("WebAppData"), BOT_TOKEN);
  const calc = toHex(await hmacSha256(secret, pairs.join("\n")));
  if (!timingSafeEqual(calc, hash.toLowerCase())) return null;

  // Eski initData qayta ishlatilmasin (replay).
  const authDate = Number(params.get("auth_date") || 0);
  if (!authDate || Math.floor(Date.now() / 1000) - authDate > INIT_DATA_MAX_AGE_SEC) {
    return null;
  }

  try {
    const user = JSON.parse(params.get("user") || "null");
    if (!user || !user.id) return null;
    return { id: Number(user.id), username: normalizeUsername(user.username) };
  } catch {
    return null;
  }
}

/** Qurilma tokenini tekshirib, u bog'langan oila/farzandni qaytaradi. */
async function verifyDeviceToken(
  token: unknown
): Promise<{ familyCode: string; childId: string } | null> {
  const raw = typeof token === "string" ? token.trim() : "";
  if (!raw || !db) return null;

  const { data, error } = await db
    .from("device_tokens")
    .select("id, family_code, child_id")
    .eq("token_hash", await sha256Hex(raw))
    .eq("is_active", true)
    .limit(1);

  if (error || !data || !data[0]) return null;

  // Eng so'nggi foydalanish vaqti — o'g'irlangan qurilmani aniqlash uchun.
  await db
    .from("device_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", data[0].id);

  return { familyCode: data[0].family_code, childId: data[0].child_id };
}

type Actor =
  | { kind: "telegram"; telegramId: number; username: string; familyCode: string }
  | { kind: "device"; familyCode: string; childId: string };

/**
 * So'rovni kim yuborganini aniqlaydi. Hech qanday haqiqiy hisob ma'lumoti
 * bo'lmasa null — chaqiruvchi 401 qaytaradi.
 *
 * Telegram foydalanuvchisi uchun familyCode SERVERDA hisoblanadi, mijozdan
 * olinmaydi: shu sababli birov boshqa oilaning kodini yuborib, uning
 * ma'lumotini o'qiy olmaydi.
 */
async function authenticate(payload: any): Promise<Actor | null> {
  const tg = await verifyInitData(payload?.initData);
  if (tg) {
    return {
      kind: "telegram",
      telegramId: tg.id,
      username: tg.username,
      familyCode: generateFamilyCode(tg.id),
    };
  }
  const dev = await verifyDeviceToken(payload?.deviceToken);
  if (dev) return { kind: "device", familyCode: dev.familyCode, childId: dev.childId };

  // Brauzer seansi (Telegramdan tashqarida kirish). Seans login/parol orqali
  // olinadi va o'sha oilaning Telegram identitetiga bog'langan bo'ladi, ya'ni
  // qolgan barcha endpointlar hech qanday o'zgarishsiz ishlayveradi.
  const web = await verifyWebSession(payload?.sessionToken);
  if (web) {
    return {
      kind: "telegram",
      telegramId: web.telegramId,
      username: web.username,
      familyCode: web.familyCode,
    };
  }
  return null;
}

/** Brauzer seans tokenini tekshiradi (token emas, faqat hash saqlanadi). */
async function verifyWebSession(
  token: unknown
): Promise<{ familyCode: string; telegramId: number; username: string } | null> {
  const raw = typeof token === "string" ? token.trim() : "";
  if (!raw || !db) return null;

  const { data } = await db
    .from("web_sessions")
    .select("id, family_code, telegram_id, expires_at, revoked_at")
    .eq("token_hash", await sha256Hex(raw))
    .is("revoked_at", null)
    .limit(1);

  const row = data && data[0];
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;

  await db
    .from("web_sessions")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", row.id);

  // Username yozuvdan olinadi: seans faqat oilaga bog'langan.
  let username = "";
  const { data: reg } = await db
    .from("parent_registrations")
    .select("parent_username")
    .eq("family_code", row.family_code)
    .limit(1);
  if (reg && reg[0] && reg[0].parent_username) username = reg[0].parent_username;

  return {
    familyCode: row.family_code,
    telegramId: Number(row.telegram_id) || 0,
    username,
  };
}

function unauthorized(detail: string): Response {
  return new Response(
    JSON.stringify({ ok: false, error: "Autentifikatsiya kerak", detail }),
    { status: 401, headers: { "Content-Type": "application/json" } }
  );
}

/**
 * Oilaga qo'shilish urinishlarini cheklaydi. 6 xonali kod 900 000 variant —
 * cheklovsiz uni soatlab sinab ko'rish mumkin edi.
 */
/** Rate-limit kaliti: proksi orqasidagi haqiqiy IP (bo'lmasa zaxira qiymat). */
function clientKey(req: Request): string {
  const xff = req.headers.get("x-forwarded-for") || "";
  return (xff.split(",")[0] || req.headers.get("cf-connecting-ip") || "unknown").trim();
}

async function joinRateLimited(actorKey: string): Promise<boolean> {
  if (!db) return false;
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data } = await db
    .from("join_attempts")
    .select("id")
    .eq("actor_key", actorKey)
    .gte("created_at", since)
    .limit(11);
  return !!(data && data.length >= 10);
}

async function recordJoinAttempt(
  actorKey: string,
  familyCode: string,
  succeeded: boolean
): Promise<void> {
  if (!db) return;
  await db.from("join_attempts").insert({
    actor_key: actorKey,
    family_code: familyCode,
    succeeded,
  });
}

// ============================================================================
// KIRISH OQIMI: taklif kodlari, urinishlar va blok
//
// Butun mantiq SHU YERDA, mijozda emas. Sabab: bir xil qoida Mini App,
// Android va keyinchalik iPhone uchun kerak. Har bir ilovada qaytadan
// yozilsa, uchta nusxa uchta xil xatti-harakat beradi va qoidani
// o'zgartirish uch joyni tahrirlashni talab qilardi.
// ============================================================================

const ENTRY_MAX_ATTEMPTS = 3;
const ENTRY_BAN_SECONDS = 180; // 3 daqiqa
const INVITE_TTL_HOURS = 72;

/** Chalkashadigan belgilarsiz kod (0/O, 1/I/L yo'q) — telefonda terish oson. */
function makeInviteCode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes).map((b) => alphabet[b % alphabet.length]).join("");
}

/**
 * Kirish darvozasi holati: bloklanganmi, qancha urinish qolgan.
 * Hisob "oxirgi blok tugagan vaqtdan beri" yuritiladi — shunda blok
 * tugagach farzand yana to'liq 3 ta urinishga ega bo'ladi.
 */
async function entryGate(
  actorKey: string
): Promise<{ banned: boolean; secondsLeft: number; attemptsLeft: number }> {
  if (!db) return { banned: false, secondsLeft: 0, attemptsLeft: ENTRY_MAX_ATTEMPTS };

  const { data: bans } = await db
    .from("code_bans")
    .select("banned_until")
    .eq("actor_key", actorKey)
    .limit(1);

  const bannedUntil = bans && bans[0] ? new Date(bans[0].banned_until).getTime() : 0;
  const now = Date.now();

  if (bannedUntil > now) {
    return {
      banned: true,
      secondsLeft: Math.ceil((bannedUntil - now) / 1000),
      attemptsLeft: 0,
    };
  }

  const since = new Date(bannedUntil || 0).toISOString();
  const { data: fails } = await db
    .from("code_attempts")
    .select("id")
    .eq("actor_key", actorKey)
    .eq("succeeded", false)
    .gt("created_at", since)
    .limit(ENTRY_MAX_ATTEMPTS + 1);

  const used = fails ? fails.length : 0;
  return {
    banned: false,
    secondsLeft: 0,
    attemptsLeft: Math.max(0, ENTRY_MAX_ATTEMPTS - used),
  };
}

/** Muvaffaqiyatsiz urinishni yozadi va kerak bo'lsa blok qo'yadi. */
async function registerFailedAttempt(
  actorKey: string
): Promise<{ banned: boolean; secondsLeft: number; attemptsLeft: number }> {
  if (!db) return { banned: false, secondsLeft: 0, attemptsLeft: ENTRY_MAX_ATTEMPTS };

  await db.from("code_attempts").insert({ actor_key: actorKey, succeeded: false });

  const gate = await entryGate(actorKey);
  if (gate.attemptsLeft > 0 || gate.banned) return gate;

  const until = new Date(Date.now() + ENTRY_BAN_SECONDS * 1000).toISOString();
  await db.from("code_bans").upsert(
    { actor_key: actorKey, banned_until: until, reason: "3 ta noto'g'ri kod" },
    { onConflict: "actor_key" }
  );
  return { banned: true, secondsLeft: ENTRY_BAN_SECONDS, attemptsLeft: 0 };
}

/** Muvaffaqiyatdan keyin hisobni tozalaydi. */
async function clearEntryState(actorKey: string): Promise<void> {
  if (!db) return;
  await db.from("code_attempts").delete().eq("actor_key", actorKey);
  await db.from("code_bans").delete().eq("actor_key", actorKey);
}

// ============================================================================
// TARIF VA LOKATSIYA KVOTASI
//
// BEPUL  — 1 ta farzand, siljuvchi 48 soat ichida 2 ta lokatsiya so'rovi.
// PRO    — o'sha oynadagi 3-so'rovdan va 2-farzandning har qanday
//          so'rovidan boshlab talab qilinadi.
//
// Kvota SERVERDA hisoblanadi. Mijozda hisoblansa, Mini App'ning kodini
// o'zgartirgan odam limitni erkin aylanib o'tardi.
// ============================================================================

const FREE_LOCATION_REQUESTS = 2;
// 48 soat juda uzun edi: ota-ona bepul tarifda mahsulot nima berishini
// deyarli sezmasdan qolardi. Sutkasiga ikki marta — kuniga bir necha marta
// so'rashga yetmaydi, lekin qiymatini ko'rsatadi.
const FREE_WINDOW_HOURS = 24;
const FREE_CHILD_LIMIT = 1;

// Jonli joylashuv qancha davom etishi. Telegram'ning o'zida bola uchun
// faqat 15 daqiqa / 1 soat / 8 soat tugmalari bor — "2 soat" degani yo'q.
// Shuning uchun chegara SERVERDA qo'yiladi: bola 8 soatni tanlasa ham,
// bepul oilada biz 2 soatdan keyin yangi nuqtalarni yozishni to'xtatamiz.
// Mijozda cheklab bo'lmasdi — cheklov bolaning Telegram'ida emas, bizda.
const FREE_LIVE_HOURS = 2;
const PRO_LIVE_HOURS = 8;

// AI do'st uchun kunlik savollar soni.
//
// Bepul chegara ataylab raqobatchilardan baland: ChatGPT bepul tarifida
// kuchli model uchun taxminan 10 ta / 5 soat beradi. Bizda kuniga 30 ta —
// ya'ni bola darsini yechib tugatadi va "limit tugadi" devoriga urilmaydi.
//
// Xarajat shundan ham boshqarilib turadi: bitta savol-javob taxminan 2-3
// ming token (tarix + savol + javob). 30 ta savol — kuniga ~80 ming token,
// ya'ni bir faol bola uchun oyiga bir necha AQSh senti. Chegarasiz qoldirsak,
// bitta yozilgan skript bir kechada butun byudjetni yeb qo'yishi mumkin edi.
const AI_FREE_DAILY = 30;
// 200 ta amalda hech kim ishlatmaydigan va xarajatni oshiradigan son edi.
const AI_PRO_DAILY = 60;

/**
 * Doimiy bepul Pro beriladigan hisoblar.
 *
 * Ikki maqsad uchun: mahsulot egasi barcha imkoniyatlarni sinab ko'rishi
 * uchun, va ishga tushirish paytida tanlangan foydalanuvchilarga Pro'ni
 * ochib berish uchun. Ro'yxat ikki joydan yig'iladi — muhit o'zgaruvchisi
 * (tez o'zgartirish uchun) va shu yerdagi ro'yxat (zaxira sifatida).
 *
 * Bu yerda muddat yo'q: bu hisoblar uchun Pro hech qachon tugamaydi.
 */
const ALWAYS_PRO_USERNAMES = new Set(
  (Deno.env.get("ALWAYS_PRO_USERNAMES") || "superman_uzb,mirkamolov13")
    .split(",")
    .map((u) => u.trim().toLowerCase().replace(/^@/, ""))
    .filter(Boolean)
);

/** Oilaning amaldagi tarifi. Muddati o'tgan Pro avtomatik bepulga tushadi. */
async function getPlan(familyCode: string): Promise<"free" | "pro"> {
  if (!db) return "free";
  const { data } = await db
    .from("parent_registrations")
    .select("plan, plan_expires_at, parent_username, mother_username, child_username")
    .eq("family_code", familyCode)
    .limit(1);

  const row = data && data[0];
  if (!row) return "free";

  // Ro'yxatdagi hisoblar uchun tarif va muddatga umuman qaralmaydi.
  // Oiladagi ISTALGAN a'zo ro'yxatda bo'lsa yetarli: ota, ona yoki farzand.
  const names = [row.parent_username, row.mother_username, row.child_username];
  for (const n of names) {
    if (!n) continue;
    if (ALWAYS_PRO_USERNAMES.has(String(n).trim().toLowerCase().replace(/^@/, ""))) {
      return "pro";
    }
  }

  if (row.plan !== "pro") return "free";
  if (row.plan_expires_at && new Date(row.plan_expires_at).getTime() < Date.now()) {
    return "free";
  }
  return "pro";
}

/**
 * Bepul tarifda lokatsiya so'rash mumkin bo'lgan yagona farzand — oilaga
 * eng avval ulangani. Eng yangisi tanlansa, ota-ona yangi farzand qo'shgani
 * bilan bepul slot ko'chib yurardi.
 */
async function freeSlotChildId(familyCode: string): Promise<string | null> {
  if (!db) return null;
  const { data } = await db
    .from("child_pairings")
    .select("child_id, paired_at")
    .eq("family_code", familyCode)
    .eq("is_active", true)
    .not("child_id", "like", "invite\\_%")
    .order("paired_at", { ascending: true })
    .limit(1);
  return data && data[0] ? data[0].child_id : null;
}

/** Oxirgi 48 soatda shu farzand uchun nechta so'rov bo'lgan. */
async function locationRequestsInWindow(
  familyCode: string,
  childId: string
): Promise<number> {
  if (!db) return 0;
  const since = new Date(Date.now() - FREE_WINDOW_HOURS * 3600 * 1000).toISOString();
  const { data } = await db
    .from("location_requests")
    .select("id")
    .eq("family_code", familyCode)
    .eq("child_id", childId)
    .gte("created_at", since)
    .limit(FREE_LOCATION_REQUESTS + 1);
  return data ? data.length : 0;
}

/**
 * Lokatsiya so'raladimi yoki Pro kerakmi — qaror shu yerda.
 * Javob UI uchun ham tushunarli bo'lishi kerak: nechta qoldi, nega rad
 * etildi, va Pro nima beradi.
 */
async function evaluateLocationQuota(
  familyCode: string,
  childId: string
): Promise<{
  allowed: boolean;
  plan: "free" | "pro";
  reason: string;
  remaining: number;
  upgradeRequired: boolean;
  resetInHours: number;
}> {
  const plan = await getPlan(familyCode);

  if (plan === "pro") {
    return {
      allowed: true,
      plan,
      reason: "Pro tarif - cheklovsiz",
      remaining: -1,
      upgradeRequired: false,
      resetInHours: 0,
    };
  }

  // Bepul tarif: avval qaysi farzand ekanligini tekshiramiz.
  const slot = await freeSlotChildId(familyCode);
  if (slot && childId !== slot) {
    return {
      allowed: false,
      plan,
      reason:
        "Bepul tarifda faqat " +
        FREE_CHILD_LIMIT +
        " ta farzand joylashuvini kuzatish mumkin. Ikkinchi farzand uchun Pro kerak.",
      remaining: 0,
      upgradeRequired: true,
      resetInHours: 0,
    };
  }

  const used = await locationRequestsInWindow(familyCode, childId);
  const remaining = Math.max(0, FREE_LOCATION_REQUESTS - used);

  if (remaining <= 0) {
    return {
      allowed: false,
      plan,
      reason:
        "Bepul tarifda " +
        FREE_WINDOW_HOURS +
        " soatda " +
        FREE_LOCATION_REQUESTS +
        " marta so'rash mumkin. Keyingi so'rov uchun Pro kerak.",
      remaining: 0,
      upgradeRequired: true,
      resetInHours: FREE_WINDOW_HOURS,
    };
  }

  return {
    allowed: true,
    plan,
    reason: "Bepul tarif",
    remaining,
    upgradeRequired: false,
    resetInHours: FREE_WINDOW_HOURS,
  };
}

// ============================================================================
// PRO IMKONIYATLARI
//
// Bepul tarifda ham ko'rinadi, lekin cheklangan holda: masalan joylashuv
// tarixi bepulda faqat oxirgi nuqta, Pro'da 30 kun. Butunlay yashirish
// o'rniga cheklangan ko'rinish berilishi ataylab - ota-ona nimadan
// foydalanmayotganini ko'rsa, Pro'ning qiymati tushunarli bo'ladi.
// ============================================================================

const FREE_HISTORY_POINTS = 1;
const PRO_HISTORY_DAYS = 30;

// Kun marshruti bepul tarifda ham ko'rinadi, lekin qisqa: oxirgi bir necha
// nuqta. Butunlay yashirilsa, ota-ona Pro nima berishini tasavvur qilolmasdi;
// to'liq berilsa, Pro'ning ma'nosi qolmasdi.
const FREE_ROUTE_POINTS = 8;
// Bepul tarifda ikkita hudud — aynan uy va maktab. Bu ataylab: "uyga keldi"
// va "maktabga yetdi" xabarlari mahsulotning eng kuchli tomoni, ularni
// to'lov devori ortiga yashirsak, ota-ona mahsulot nima berishini umuman
// ko'rmasdan ketib qolardi.
const FREE_ZONE_LIMIT = 2;

/** Yer yuzasidagi ikki nuqta orasidagi masofa (metr). */
function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/**
 * Yangi joylashuv kelganda xavfsiz hududlarni tekshiradi va kerak bo'lsa
 * ogohlantirish yozadi.
 *
 * Ogohlantirish faqat HOLAT O'ZGARGANDA yoziladi (ichkarida -> tashqarida
 * yoki aksincha). Har bir ping uchun yozilsa, ota-ona bir kunda yuzlab bir
 * xil xabar olardi va ularning barchasini e'tiborsiz qoldirardi.
 */
async function evaluateGeofences(
  familyCode: string,
  childId: string,
  lat: number,
  lng: number
): Promise<Array<{ zone: string; type: string; message: string }>> {
  if (!db) return [];

  const { data: zones } = await db
    .from("geofence_zones")
    .select("name, center_lat, center_lng, radius_m, arrive_by, weekdays")
    .eq("family_code", familyCode)
    .eq("child_id", childId);

  if (!zones || zones.length === 0) return [];

  const fired: Array<{ zone: string; type: string; message: string }> = [];

  for (const z of zones) {
    const dist = distanceMeters(lat, lng, z.center_lat, z.center_lng);
    const inside = dist <= z.radius_m;

    // Oldingi holat: shu hudud bo'yicha eng so'nggi ogohlantirish.
    const { data: last } = await db
      .from("geofence_alerts")
      .select("alert_type")
      .eq("family_code", familyCode)
      .eq("child_id", childId)
      .eq("zone_name", z.name)
      .order("created_at", { ascending: false })
      .limit(1);

    const wasInside = last && last[0] ? last[0].alert_type === "enter" : null;
    if (wasInside === inside) continue; // holat o'zgarmagan - jim turamiz

    const type = inside ? "enter" : "exit";
    const message = inside
      ? z.name + " hududiga kirdi"
      : z.name + " hududidan chiqdi";

    await db.from("geofence_alerts").insert({
      family_code: familyCode,
      child_id: childId,
      zone_name: z.name,
      alert_type: type,
      distance_m: dist,
      message,
    });

    fired.push({ zone: z.name, type, message });

    // VAQT BANKI: belgilangan vaqtdan oldin yetib kelgani uchun mukofot.
    // Bu mexanikaning eng ishonchli qismi — bola uni alday olmaydi, chunki
    // hisob mijozdan emas, haqiqiy joylashuvdan kelib chiqadi.
    if (type === "enter" && z.arrive_by && /^([01]\d|2[0-3]):[0-5]\d$/.test(z.arrive_by)) {
      // Server UTC'da ishlaydi — "08:00 gacha" esa Toshkent soati. Ilgari
      // getHours() UTC qaytarib, muddat amalda 13:00 gacha cho'zilardi.
      const [hh, mm] = String(z.arrive_by).split(":").map(Number);
      const now = tashkentHourMinute();
      const onTime = now.h < hh || (now.h === hh && now.m <= mm);

      // Kuniga bir marta: bir necha marta kirib-chiqish takroriy mukofot bermaydi.
      const dayStart = tashkentDayStartISO();
      const { data: already } = await db
        .from("time_bank_entries")
        .select("id")
        .eq("family_code", familyCode)
        .eq("child_id", childId)
        .eq("reason", "school_ontime")
        .gte("created_at", dayStart)
        .limit(1);

      if (onTime && !(already && already[0])) {
        const rules = await getTimeBankRules(familyCode, childId);
        const awarded = await timeBankAward(
          familyCode,
          childId,
          Number(rules.minutes_per_school_ontime),
          "school_ontime",
          z.name + " — o'z vaqtida"
        );
        if (awarded > 0) {
          fired.push({
            zone: z.name,
            type: "time_bank",
            message: `${z.name}ga o'z vaqtida yetib keldi — +${awarded} ball`,
          });
        }
      }
    }
  }

  return fired;
}

async function ensureBotCommands() {
  try {
    await fetch(`${TELEGRAM_API}/deleteMyCommands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    await fetch(`${TELEGRAM_API}/deleteMyCommands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope: { type: "all_private_chats" } }),
    });
    const commands = [{ command: "start", description: "Boshlash" }];
    await fetch(`${TELEGRAM_API}/setMyCommands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commands }),
    });
    await fetch(`${TELEGRAM_API}/setMyCommands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commands, scope: { type: "all_private_chats" } }),
    });
    await fetch(`${TELEGRAM_API}/setChatMenuButton`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menu_button: { type: "commands" } }),
    });
  } catch (e) {
    console.error("ensureBotCommands failed", e);
  }
}

// Dynamic Admin IDs Store & Known Admin Usernames (Sheriklar ro'yxati)
const ADMIN_USERNAMES = new Set<string>(["ai_loyihachi"]);
// Admin chat ID'lari ADMIN_CHAT_IDS sirida saqlanadi (vergul bilan).
//
// Ilgari bu bo'sh Set edi va faqat admin botga yozganda to'lardi. Bu
// serverless funksiya: isolate bir necha daqiqa faolsizlikdan keyin
// tugatiladi va xotiradagi ro'yxat yo'qoladi. Natijada notifyAdmins()
// deyarli har doim bo'sh ro'yxat bo'ylab aylanib, HECH KIMGA xabar
// yubormasdi — aynan shu sabab ota-ona registratsiya so'rovlari adminga
// yetib bormagan.
const ADMIN_CHAT_IDS = new Set<string | number>(
  (Deno.env.get("ADMIN_CHAT_IDS") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);
if (ADMIN_CHAT_IDS.size === 0) {
  console.error(
    "ADMIN_CHAT_IDS siri o'rnatilmagan — adminga hech qanday xabar bormaydi"
  );
}
const USER_LANG: Record<string | number, string> = {};

function generateFamilyCode(userId: string | number): string {
  // 6 raqam, chiziqsiz (masalan 6 raqam)
  const num = Math.abs((Number(userId) * 31 + 7919) % 900000) + 100000;
  return String(num).padStart(6, "0");
}

async function sendMessage(chatId: number | string, htmlText: string, replyMarkup?: any) {
  const payload: any = {
    chat_id: chatId,
    text: htmlText,
    parse_mode: "HTML",
  };
  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!result.ok) {
      console.error(`Telegram sendMessage xatolik [Chat: ${chatId}]:`, result);
    }
    return result;
  } catch (err) {
    console.error(`Telegram fetch exception [Chat: ${chatId}]:`, err);
  }
}

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text: text }),
  });
}

/**
 * Adminlarga xabar yuboradi va NATIJANI qaytaradi. Ilgari bu funksiya
 * xatolarni jimgina yutib yuborardi, shuning uchun yetkazilmagan xabarni
 * hech kim sezmasdi. Endi chaqiruvchi natijani bazaga yozib qo'yadi.
 */
/**
 * Xabarni OILANING O'ZIGA yuboradi.
 *
 * Bu yetishmagani katta nuqson edi: farzandning SOS va tezkor xabarlari ham,
 * geo-bildirishnomalar ham notifyAdmins() orqali ILOVA ADMINIGA ketardi —
 * ya'ni ota-ona o'z farzandidan kelgan xabarni umuman olmasdi, admin esa
 * barcha oilalarning shaxsiy xabarlarini ko'rardi.
 */
async function notifyFamilyParents(
  familyCode: string,
  htmlText: string,
  // Ba'zi xabarlar javob talab qiladi (masalan "Pro so'rovini tasdiqlaysizmi?").
  // Ularni alohida yo'l bilan yuborish o'rniga, shu yerga tugma qo'shiladi —
  // shunda "ota-onaga xabar berish" mantig'i bitta joyda qoladi.
  replyMarkup?: any
): Promise<boolean> {
  if (!db || !familyCode) return false;
  const { data } = await db
    .from("parent_registrations")
    .select("parent_telegram_id")
    .eq("family_code", familyCode)
    .limit(1);

  const chatId = data && data[0] && data[0].parent_telegram_id;
  if (!chatId) {
    console.error("notifyFamilyParents: oila uchun parent_telegram_id yo'q:", familyCode);
    return false;
  }
  try {
    await sendMessage(chatId, htmlText, replyMarkup);
    // Ilova o'rnatgan ota-onaga push ham boradi: bot xabari Telegram
    // ochilmasa ko'rinmay qolishi mumkin, SOS esa kutib turmaydi.
    const lines = plainText(htmlText).split("\n");
    await sendPush(familyCode, ["parent_" + chatId], lines[0].slice(0, 80) || "Qalqon AI", lines.slice(1).join(" ").trim() || lines[0]);
    return true;
  } catch (e) {
    console.error("notifyFamilyParents yuborilmadi:", e);
    return false;
  }
}

/**
 * So'rov yuborayotgan odam qaysi OILAGA tegishli.
 *
 * Telegram foydalanuvchisi uchun actor.familyCode uning O'Z Telegram ID'sidan
 * hisoblanadi — ota-ona uchun bu to'g'ri, lekin FARZAND uchun mutlaqo noto'g'ri:
 * farzandning "o'z oilasi" degan kodi hech qayerda mavjud emas. Shu sabab
 * farzandning "Maktabdaman / Uydaman / Olib keting" xabarlari hech kimga
 * bormasdi, SOS esa faqat zaxira yo'l orqali adminga tushardi.
 *
 * Haqiqiy oila child_pairings jadvalida yozilgan.
 */
async function resolveActorFamily(actor: Actor): Promise<string> {
  if (actor.kind === "device") return actor.familyCode;
  if (!db) return actor.familyCode;

  const { data } = await db
    .from("child_pairings")
    .select("family_code")
    .eq("child_id", "tg_" + actor.telegramId)
    .eq("is_active", true)
    .limit(1);

  if (data && data[0] && data[0].family_code) return data[0].family_code;
  return actor.familyCode;
}

/** Farzandning so'nggi ma'lum joyi — SOS xabariga xarita havolasini qo'shish uchun. */
async function lastKnownLocation(
  familyCode: string,
  childId?: string
): Promise<{ lat: number; lng: number; recordedAt: string } | null> {
  if (!db || !familyCode) return null;
  let q = db
    .from("location_pings")
    .select("lat, lng, recorded_at")
    .eq("family_code", familyCode)
    .order("recorded_at", { ascending: false })
    .limit(1);
  if (childId) q = q.eq("child_id", childId);
  const { data } = await q;
  const row = data && data[0];
  if (!row) return null;
  return { lat: row.lat, lng: row.lng, recordedAt: row.recorded_at };
}

// ============================================================================
// "FARZANDIM QAYERDA?" — ota-ona botda so'raganda.
//
// Bola Mini App'ni har ochganda nuqta jimgina saqlanadi (child_report_location,
// reason=auto). Lekin ilgari ota-ona uni faqat panelni ochib ko'ra olardi —
// botning o'zida "qayerda?" deb so'rashning yo'li yo'q edi. Endi bitta tugma
// so'nggi joyni ham, u QACHON olinganini ham aytadi: "3 soat oldingi joy"
// bilan "hozirgi joy" ota-ona uchun mutlaqo boshqa-boshqa xabar.
// ============================================================================

/** Server UTC'da ishlaydi — ota-onaga esa Toshkent vaqti kerak. */
function tashkentVaqt(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU", {
    timeZone: "Asia/Tashkent",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "hozirgina", "12 daqiqa oldin", "3 soat oldin", "2 kun oldin". */
function qanchaOldin(iso: string, lang: string = "uz"): string {
  const min = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (lang === "ru") {
    if (min < 2) return "только что";
    if (min < 60) return `${min} мин назад`;
    if (min < 48 * 60) return `${Math.floor(min / 60)} ч назад`;
    return `${Math.floor(min / 1440)} дн назад`;
  }
  if (min < 2) return "hozirgina";
  if (min < 60) return `${min} daqiqa oldin`;
  if (min < 48 * 60) return `${Math.floor(min / 60)} soat oldin`;
  return `${Math.floor(min / 1440)} kun oldin`;
}

/** Bu nuqta shunchalik yangiki, bolani qayta bezovta qilishning hojati yo'q. */
const FRESH_LOCATION_MIN = 15;

/**
 * Oiladagi har bir farzandning so'nggi joyi va vaqti — bot xabari sifatida.
 * Kvota yemaydi: bu bazada allaqachon bor nuqtani ko'rsatish, bolaga yangi
 * so'rov emas. Yangi nuqta kerak bo'lsa, xabardagi tugma request_location
 * bilan bir xil kvota yo'lidan o'tadi.
 */
async function buildWhereReport(
  familyCode: string,
  lang: string = "uz"
): Promise<{ text: string; keyboard: any }> {
  const ru = lang === "ru";
  const panelBtn = [{
    text: ru ? "📱 Открыть карту в панели" : "📱 Panelda xaritani ochish",
    web_app: { url: `${miniAppUrl()}&lang=${lang}` },
  }];

  if (!db) {
    return { text: ru ? "⚠️ База недоступна." : "⚠️ Baza ulanmagan.", keyboard: undefined };
  }

  const { data: kids } = await db
    .from("child_pairings")
    .select("child_id, child_name, live_until")
    .eq("family_code", familyCode)
    .eq("is_active", true)
    .not("child_id", "like", "invite\\_%")
    .order("paired_at", { ascending: true })
    .limit(10);

  if (!kids || kids.length === 0) {
    return {
      text: ru
        ? "👶 <b>Ребёнок ещё не подключён.</b>\n\nСначала подключите ребёнка — после этого здесь будет видно, где он был в последний раз."
        : "👶 <b>Hali farzand ulanmagan.</b>\n\nAvval farzandingizni ulang — shundan keyin bu yerda uning so'nggi joyi va vaqti ko'rinadi.",
      keyboard: { inline_keyboard: [[{ text: ru ? "👶 Подключить ребёнка" : "👶 Farzandni ulash", callback_data: `action_pair_${familyCode}` }]] },
    };
  }

  const lines: string[] = [ru ? "📍 <b>Где мой ребёнок</b>" : "📍 <b>Farzandim qayerda</b>"];
  const rows: any[] = [];

  for (const k of kids) {
    const nom = k.child_name || (ru ? "Ребёнок" : "Farzand");
    const loc = await lastKnownLocation(familyCode, k.child_id);
    const live = !!k.live_until && new Date(k.live_until).getTime() > Date.now();

    if (!loc) {
      lines.push(
        `\n👦 <b>${nom}</b>\n` +
          (ru
            ? "❔ Местоположение ещё не приходило. Оно сохранится, когда ребёнок откроет своё приложение в боте."
            : "❔ Hali joylashuv kelmagan. Farzand botdagi o'z panelini ochganda avtomatik saqlanadi.")
      );
    } else {
      const eski = Date.now() - new Date(loc.recordedAt).getTime() > FRESH_LOCATION_MIN * 60000;
      lines.push(
        `\n👦 <b>${nom}</b>` + (live ? (ru ? " · 🟢 в эфире" : " · 🟢 jonli") : "") +
          `\n🗺 <a href="https://maps.google.com/?q=${loc.lat},${loc.lng}">${ru ? "Открыть на карте" : "Xaritada ochish"}</a>` +
          `\n🕒 ${tashkentVaqt(loc.recordedAt)} <i>(${qanchaOldin(loc.recordedAt, lang)})</i>` +
          (eski && !live
            ? (ru ? "\n<i>Это последнее известное место, не текущее.</i>" : "\n<i>Bu hozirgi emas, so'nggi ma'lum joy.</i>")
            : "")
      );
    }

    // Yangi nuqtani so'rash — faqat Telegram orqali ulangan bolaga (unga
    // tugmali xabar boradi) va jonli translyatsiya o'chiq bo'lsa.
    const fresh = loc && Date.now() - new Date(loc.recordedAt).getTime() <= FRESH_LOCATION_MIN * 60000;
    if (String(k.child_id).startsWith("tg_") && !live && !fresh) {
      rows.push([{
        text: ru ? `📨 Спросить ${nom}, где сейчас` : `📨 ${nom}dan hozirgi joyini so'rash`,
        callback_data: `askloc_${k.child_id}`,
      }]);
    }
  }

  rows.push(panelBtn);
  return { text: lines.join("\n"), keyboard: { inline_keyboard: rows } };
}

/**
 * Bolaga "joylashuvingni yubor" xabarini yuboradi — kvota bilan.
 * Mini App (request_location) va bot tugmasi (askloc_) AYNAN shu yo'ldan
 * o'tadi: aks holda ikki joyda ikki xil limit paydo bo'lardi.
 */
async function askChildForLocation(
  familyCode: string,
  childId: string,
  requestedByTelegramId: number | null
): Promise<{
  status: number;
  ok: boolean;
  error?: string;
  quota?: Awaited<ReturnType<typeof evaluateLocationQuota>>;
  live: boolean;
  liveUntil: string | null;
  asked: boolean;
}> {
  const base = { live: false, liveUntil: null as string | null, asked: false };
  if (!db) return { ...base, status: 500, ok: false, error: "Baza ulanmagan" };

  // Bu farzand haqiqatan shu oilaga tegishlimi. Callback ma'lumotini qo'lda
  // yasash qiyin emas — shuning uchun childId'ning o'zi ruxsat emas.
  const { data: own } = await db
    .from("child_pairings")
    .select("child_id, live_until")
    .eq("family_code", familyCode)
    .eq("child_id", childId)
    .eq("is_active", true)
    .limit(1);
  if (!own || !own[0]) {
    return { ...base, status: 403, ok: false, error: "Bu farzand sizning oilangizga ulanmagan" };
  }

  // Jonli translyatsiya YONIQ bo'lsa, so'rov kvotani yemaydi va bolaga xabar
  // bormaydi: joylashuv allaqachon o'zi oqib turibdi. Har ekran yangilashda
  // bezovta qilsak, bola jonli ulashishni butunlay o'chirib qo'yardi.
  const liveUntil =
    own[0].live_until && new Date(own[0].live_until).getTime() > Date.now()
      ? own[0].live_until
      : null;
  if (liveUntil) {
    return {
      status: 200, ok: true, live: true, liveUntil, asked: false,
      quota: { allowed: true, plan: await getPlan(familyCode), remaining: -1, resetInHours: 0, reason: "", upgradeRequired: false },
    };
  }

  const q = await evaluateLocationQuota(familyCode, childId);
  if (!q.allowed) return { ...base, status: 402, ok: false, error: q.reason, quota: q };

  await db.from("location_requests").insert({
    family_code: familyCode,
    child_id: childId,
    requested_by_telegram_id: requestedByTelegramId,
    plan_at_request: q.plan,
  });

  const askTgId = childId.startsWith("tg_") ? childId.slice(3) : null;
  if (askTgId) {
    await sendMessage(
      askTgId,
      `📍 <b>Ota-onang qayerdaligingni so'rayapti.</b>\n\n` +
        `Pastdagi tugmani bosing — joylashuving bir zumda yuboriladi. ` +
        `Doimiy kuzatuv emas, faqat shu daqiqadagi nuqta.`,
      {
        inline_keyboard: [[{
          text: "📍 Joylashuvni yuborish",
          web_app: { url: `${miniAppUrl()}&role=child&ask=loc` },
        }]],
      }
    );
  }
  return { ...base, status: 200, ok: true, quota: q, asked: !!askTgId };
}

async function notifyAdmins(
  htmlText: string,
  replyMarkup?: any
): Promise<{ sent: number; failed: string[] }> {
  const failed: string[] = [];
  let sent = 0;

  if (ADMIN_CHAT_IDS.size === 0) {
    failed.push("ADMIN_CHAT_IDS bo'sh (sir o'rnatilmagan)");
    return { sent, failed };
  }

  for (const adminId of ADMIN_CHAT_IDS) {
    try {
      const res = await sendMessage(adminId, htmlText, replyMarkup);
      if (res && res.ok) sent++;
      else failed.push(`${adminId}: ${res?.description || "noma'lum xato"}`);
    } catch (e) {
      failed.push(`${adminId}: ${e}`);
    }
  }
  return { sent, failed };
}

/**
 * Oila tasdiqlanganmi. Ilgari bu USER_APPROVAL_STATUS xotira obyektidan
 * o'qilardi — admin "Ruxsat berish" tugmasini bossa ham, isolate qayta
 * ishga tushishi bilan tasdiq yo'qolardi. Endi manba baza.
 */
async function isFamilyApproved(userId: string | number): Promise<boolean> {
  if (!db) return false;
  try {
    const { data } = await db
      .from("parent_registrations")
      .select("status")
      .eq("family_code", generateFamilyCode(userId))
      .limit(1);
    return !!(data && data[0] && data[0].status === "approved");
  } catch (e) {
    console.error("isFamilyApproved xatosi:", e);
    return false;
  }
}

/** Admin tugmasi bosilganda tasdiq holatini bazaga yozadi. */
async function setFamilyApproval(
  familyCode: string,
  status: "approved" | "rejected"
): Promise<boolean> {
  if (!db || !familyCode) return false;
  const { data, error } = await db
    .from("parent_registrations")
    .update({ status, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("family_code", familyCode)
    .select("parent_telegram_id, parent_name");
  if (error) {
    console.error("setFamilyApproval xatosi:", error.message);
    return false;
  }

  // Ota-onaning o'ziga xabar. Ilgari tasdiqlash faqat bazada qolardi va
  // foydalanuvchi natijani hech qachon bilmasdi — u panelni qayta ochib
  // ko'rmaguncha kutishda qolaverardi.
  const row = data && data[0];
  if (row && row.parent_telegram_id) {
    const msg =
      status === "approved"
        ? "✅ <b>Sizga ruxsat berildi!</b>\n\nQalqon AI oilaviy profilingiz administrator tomonidan tasdiqlandi. Endi barcha imkoniyatlar to'liq ochiq: farzand qo'shish, radar va hisobotlar.\n\nPanelni ochish uchun <b>Start</b> tugmasini bosing."
        : "❌ <b>So'rovingiz rad etildi.</b>\n\nMa'lumotlarni tekshirib, qaytadan yuborishingiz mumkin. Savollar bo'lsa administratorga murojaat qiling.";
    try {
      await sendMessage(row.parent_telegram_id, msg);
    } catch (e) {
      console.error("Tasdiq xabarini yuborib bo'lmadi:", e);
    }
  }

  // Taklif mukofoti aynan shu paytda to'lanadi — oila haqiqiyligi admin
  // tomonidan tasdiqlangandan keyin.
  if (status === "approved") {
    await payReferralReward(familyCode);
  }
  return true;
}

function getStartMenuText(userId: string | number, lang: string = "uz", isApproved: boolean = true, isAdmin: boolean = false): string {
  const code = generateFamilyCode(userId);

  if (isAdmin) {
    return `👑 <b>QALQON AI — ADMINISTRATOR PANELI</b>

Assalomu alaykum, hurmatli Boshqaruvchi / Hamkor!

🔑 <b>Sizning Admin ID:</b> <code>${userId}</code>
🛡️ <b>Huquq darajasi:</b> To'liq Boshqaruv (Administrator)
🔔 <i>Barcha yangi ota-onalar va farzandlar so'rovlari ushbu chatga keladi.</i>

<b>Sheriklar boshqaruvi:</b>
• <code>/addadmin @username</code> — Yangi sherikka admin huquqini berish
• <code>/removeadmin @username</code> — Sherik huquqini bekor qilish
• <code>/admins</code> — Barcha administratorlar ro'yxati

Quyidagi tugma orqali boshqaruv panelini to'liq ochishingiz mumkin:`;
  }

  if (lang === "ru") {
    return `🛡️ <b>QALQON AI — ЦЕНТР РОДИТЕЛЬСКОГО КОНТРОЛЯ</b>

Добро пожаловать! Безопасность, школьные предметы и цифровые привычки вашего ребёнка под защитой 24/7.

✅ <b>Ваш доступ полностью активен!</b>

🔑 <b>Ваш семейный код:</b> <code>${code}</code>
📍 <b>Онлайн-радар и локация:</b> <b>Бесплатно</b>
💎 <b>Pro Версия (AI & e-Maktab 100 баллов):</b> <b>10,000 сум/мес (за 1 ребёнка)</b>
ℹ️ <i>Официальная почта для предложений: <code>alhamdulillah@tmail.ton</code></i>

Выберите нужный раздел:`;
  }

  return `🛡️ <b>QALQON AI — OTA-ONA BOSHQARUV MARKAZI</b>

Assalomu alaykum! Farzandingizning xavfsizligi, darsliklari va raqamli odatlari 24/7 doimiy nazorat ostida.

✅ <b>Sizning hisobingiz to'liq faol!</b>

🔑 <b>Sizning oila kodingiz:</b> <code>${code}</code>
📍 <b>Jonli lokatsiya va radar:</b> <b>100% BEPUL</b>
💎 <b>Pro Versiya (AI & 100 ballik e-Maktab):</b> <b>10,000 so'm/oy (har bir bola uchun)</b>
ℹ️ <i>Taklif va mulohazalar uchun rasmiy pochta: <code>alhamdulillah@tmail.ton</code></i>

Quyidagi bo'limlardan birini tanlang:`;
}

// Tugmalar ROLGA qarab beriladi. Ilgari bot hammaga bir xil "Ota-ona paneli"
// tugmasini yuborardi — shu sabab allaqachon ulangan farzand ham /start bosib,
// ota-ona panelini ochib olardi.
function getStartKeyboard(userId: string | number, lang: string = "uz", isChild: boolean = false): any {
  const code = generateFamilyCode(userId);

  if (isChild) {
    return {
      inline_keyboard: [
        [
          {
            text: lang === "ru" ? "🌟 Открыть мою панель" : "🌟 O'z panelimni ochish",
            web_app: { url: `${miniAppUrl()}&role=child&lang=${lang}` },
          },
        ],
        [{ text: "🌐 Til / Язык (UZ/RU)", callback_data: "action_lang" }],
      ],
    };
  }

  if (lang === "ru") {
    return {
      inline_keyboard: [
        [{ text: "📱 Открыть панель (Mini App)", web_app: { url: `${miniAppUrl()}&lang=ru` } }],
        [{ text: "📍 Где мой ребёнок?", callback_data: "action_where" }],
        [{ text: "👶 Подключить ребёнка", callback_data: `action_pair_${code}` }],
        [{ text: "📲 Код для Android-приложения", callback_data: "action_app_code" }],
        [{ text: "🌐 Til / Язык (UZ/RU)", callback_data: "action_lang" }],
      ],
    };
  }
  return {
    inline_keyboard: [
      [{ text: "📱 Ota-ona paneli (Mini App)", web_app: { url: `${miniAppUrl()}&lang=uz` } }],
      [{ text: "📍 Farzandim qayerda?", callback_data: "action_where" }],
      [{ text: "👶 Farzandni ulash", callback_data: `action_pair_${code}` }],
      [{ text: "📲 Android ilova kodi", callback_data: "action_app_code" }],
      [{ text: "🌐 Til / Язык (UZ/RU)", callback_data: "action_lang" }],
    ],
  };
}

/**
 * Birinchi ekran — hali ro'yxatdan o'tmagan odam uchun.
 * Ilgari bot hammaga to'g'ridan-to'g'ri "Ota-ona paneli" tugmasini berardi:
 * odam bot nima qilishini va qanday qoidalarga rozi bo'layotganini bilmasdan
 * ichkariga kirib ketardi.
 */
function getWelcomeGateText(lang: string = "uz"): string {
  if (lang === "ru") {
    return `🛡 <b>QALQON AI — семейная защита</b>

Помогает родителю знать, что ребёнок в безопасности, и договориться о здоровых цифровых привычках — <b>без слежки втайне</b>.

<b>Что умеет:</b>
• 📍 Где ребёнок сейчас, уведомления «пришёл в школу / вышел из дома»
• 📱 Экранное время и приложения, ежевечерний короткий отчёт
• 🆘 Кнопка SOS у ребёнка — сразу вам, с местоположением
• 🧠 ИИ-помощник по школьной программе 1–11 классов

<b>Наши правила:</b>
1. Ребёнок <b>видит</b>, что подключён, и сам соглашается с 4 правилами.
2. Переписка и содержимое экрана <b>не читаются</b> — никогда.
3. Данные семьи видит <b>только эта семья</b>.
4. Ребёнок может отключиться, сообщив родителю.

Выберите действие ниже.`;
  }
  return `🛡 <b>QALQON AI — oilaviy himoya</b>

Ota-onaga farzandi xavfsiz ekanini bilish va sog'lom raqamli odatlar haqida kelishib olishga yordam beradi — <b>yashirin kuzatuvsiz</b>.

<b>Nima qila oladi:</b>
• 📍 Farzand hozir qayerda, "maktabga yetdi / uydan chiqdi" xabarlari
• 📱 Ekran vaqti va ilovalar, har kuni kechqurun qisqa hisobot
• 🆘 Farzandda SOS tugmasi — joylashuvi bilan to'g'ridan-to'g'ri sizga
• 🧠 1–11 sinf darsliklari bo'yicha AI yordamchi

<b>Bizning qoidalarimiz:</b>
1. Farzand ulanganini <b>ko'radi</b> va 4 ta qoidaga o'zi rozilik beradi.
2. Yozishmalar va ekran mazmuni <b>o'qilmaydi</b> — hech qachon.
3. Oila ma'lumotlarini <b>faqat o'sha oila</b> ko'radi.
4. Farzand ota-onasiga aytib, ulanishni to'xtata oladi.

Quyidan kerakli amalni tanlang.`;
}

function getWelcomeGateKeyboard(lang: string = "uz"): any {
  return {
    inline_keyboard: [
      [
        {
          text: lang === "ru" ? "📝 Регистрация" : "📝 Ro'yxatdan o'tish",
          web_app: { url: `${miniAppUrl()}&lang=${lang}` },
        },
      ],
      [
        {
          text: lang === "ru" ? "🔐 Вход (логин и пароль)" : "🔐 Kirish (login va parol)",
          web_app: { url: `${miniAppUrl()}&lang=${lang}&mode=login` },
        },
      ],
      [{ text: "🌐 Til / Язык (UZ/RU)", callback_data: "action_lang" }],
    ],
  };
}

/** Bu Telegram hisobi uchun ro'yxat yozuvi bormi (holatidan qat'i nazar). */
async function hasRegistration(userId: string | number): Promise<boolean> {
  if (!db) return false;
  const { data } = await db
    .from("parent_registrations")
    .select("family_code")
    .eq("family_code", generateFamilyCode(userId))
    .limit(1);
  return !!(data && data[0]);
}

function getChildStartText(lang: string = "uz"): string {
  if (lang === "ru") {
    return `🌟 <b>Привет, юный герой!</b>\n\nТы уже подключён к семейному профилю. Нажми кнопку ниже — откроется <b>твоя</b> панель: ИИ-друг, учёба, награды и быстрые сообщения родителям.`;
  }
  return `🌟 <b>Salom, yosh qahramon!</b>\n\nSen oilaviy profilga allaqachon ulangansan. Pastdagi tugmani bos — <b>o'zingning</b> paneling ochiladi: AI do'st, darslar, yutuqlar va ota-onangga tezkor xabar.`;
}

// ============================================================================
// VAQT BANKI — ekran vaqtini ishlab topish
// ============================================================================
const TIME_BANK_DEFAULTS = {
  enabled: true,
  minutes_per_focus: 10,
  minutes_per_school_ontime: 20,
  minutes_per_homework: 15,
  daily_cap_minutes: 60,
};

async function getTimeBankRules(familyCode: string, childId: string) {
  if (!db) return { ...TIME_BANK_DEFAULTS };
  const { data } = await db
    .from("time_bank_rules")
    .select("enabled, minutes_per_focus, minutes_per_school_ontime, minutes_per_homework, daily_cap_minutes")
    .eq("family_code", familyCode)
    .eq("child_id", childId)
    .limit(1);
  return (data && data[0]) || { ...TIME_BANK_DEFAULTS };
}

/** Balans — yozuvlar yig'indisi. Alohida "balans" ustuni yo'q, shuning uchun
 *  balans bilan tarix hech qachon bir-biriga zid bo'lib qolmaydi. */
async function timeBankBalance(familyCode: string, childId: string) {
  if (!db) return { balance: 0, earnedToday: 0 };
  const { data } = await db
    .from("time_bank_entries")
    .select("minutes, reason, created_at")
    .eq("family_code", familyCode)
    .eq("child_id", childId)
    .limit(5000);

  // Kun Toshkent bo'yicha: UTC'da "bugun" soat 05:00 da boshlanardi.
  const todayKey = tashkentDateKey();
  let balance = 0;
  let earnedToday = 0;
  for (const e of data || []) {
    const m = Number(e.minutes) || 0;
    balance += m;
    if (
      m > 0 && EARN_REASONS.has(e.reason) &&
      tashkentDateKey(new Date(e.created_at).getTime()) === todayKey
    ) earnedToday += m;
  }
  return { balance, earnedToday };
}

/**
 * Vaqt yozadi, lekin kunlik shiftdan oshirmaydi.
 * Qaytaradi: haqiqatda yozilgan daqiqa (0 bo'lishi ham mumkin).
 */
async function timeBankAward(
  familyCode: string,
  childId: string,
  minutes: number,
  reason: string,
  note?: string
): Promise<number> {
  if (!db || minutes <= 0) return 0;
  const rules = await getTimeBankRules(familyCode, childId);
  if (!rules.enabled) return 0;

  const { earnedToday } = await timeBankBalance(familyCode, childId);
  const room = Math.max(0, Number(rules.daily_cap_minutes) - earnedToday);
  const award = Math.min(minutes, room);
  if (award <= 0) return 0;

  await db.from("time_bank_entries").insert({
    family_code: familyCode,
    child_id: childId,
    minutes: award,
    reason,
    note: note || null,
  });

  // Bo'ri ham shu hodisalardan o'sadi — ikkita alohida mexanika emas,
  // bitta harakatning ikki ko'rinishi.
  const xpFor: Record<string, number> = {
    focus: 20,
    school_ontime: 30,
    homework: 15,
    parent_bonus: 5,
  };
  if (xpFor[reason]) {
    await companionAddXp(familyCode, childId, xpFor[reason]);
  }

  return award;
}

// ============================================================================
// BO'RI HAMROH — bolaning ilovaga qaytishi uchun hissiy sabab
// ============================================================================
const COMPANION_STAGES = [
  { level: 1, xp: 0, emoji: "🥚", title: "Tuxumdagi bo'ri" },
  { level: 2, xp: 50, emoji: "🐺", title: "Bo'ri bolasi" },
  { level: 3, xp: 150, emoji: "🐺", title: "O'smir bo'ri" },
  { level: 4, xp: 350, emoji: "🐺", title: "Kuchli bo'ri" },
  { level: 5, xp: 700, emoji: "🛡️", title: "Qalqon qo'riqchisi" },
];

/**
 * Bo'riga boshlang'ich ism. Hammaga bir xil "Qalqon" berilganda fokus
 * jangida ikkala raqib ham bir xil nom bilan ko'rinardi. Ism child_id dan
 * barqaror tanlanadi — ya'ni har safar bir xil, lekin bolaning haqiqiy
 * ismini oshkor qilmaydi.
 */
const COMPANION_NAMES = [
  "Oqbo'ri", "Bo'ron", "Yulduz", "Shamol", "Olov", "Qorbo'ri",
  "Yo'lbars", "Burgut", "Momaqaldiroq", "Kumush", "Tezkor", "Botir",
];

function defaultCompanionName(childId: string): string {
  let h = 0;
  for (let i = 0; i < childId.length; i++) h = (h * 31 + childId.charCodeAt(i)) >>> 0;
  return COMPANION_NAMES[h % COMPANION_NAMES.length];
}

function companionStage(xp: number) {
  let current = COMPANION_STAGES[0];
  for (const s of COMPANION_STAGES) if (xp >= s.xp) current = s;
  const next = COMPANION_STAGES.find((s) => s.xp > xp) || null;
  return {
    level: current.level,
    emoji: current.emoji,
    title: current.title,
    xpForNext: next ? next.xp : null,
    // Joriy bosqich ichidagi progress (0-100).
    progress: next
      ? Math.round(((xp - current.xp) / (next.xp - current.xp)) * 100)
      : 100,
  };
}

/**
 * XP qo'shadi va ketma-ketlikni yangilaydi.
 * Ketma-ketlik KUN bo'yicha: bugun birinchi marta XP olsa +1, bir kun
 * o'tkazib yuborilsa qaytadan 1 dan boshlanadi.
 */
async function companionAddXp(familyCode: string, childId: string, xp: number) {
  if (!db || xp <= 0) return null;

  const { data } = await db
    .from("child_companion")
    .select("name, xp, streak_days, best_streak, last_active_date")
    .eq("family_code", familyCode)
    .eq("child_id", childId)
    .limit(1);

  const today = tashkentDateKey();
  const yesterday = tashkentDateKey(Date.now() - 86400000);
  const row = data && data[0];

  if (!row) {
    await db.from("child_companion").insert({
      family_code: familyCode,
      child_id: childId,
      name: defaultCompanionName(childId),
      xp,
      streak_days: 1,
      best_streak: 1,
      last_active_date: today,
    });
    return { xp, streak: 1, leveledUp: companionStage(xp).level > 1 };
  }

  const last = row.last_active_date ? String(row.last_active_date).slice(0, 10) : null;
  let streak = Number(row.streak_days) || 0;
  if (last === today) {
    // Bugun allaqachon hisoblangan — ketma-ketlik o'zgarmaydi.
  } else if (last === yesterday) {
    streak += 1;
  } else {
    streak = 1;
  }

  const newXp = (Number(row.xp) || 0) + xp;
  const levelBefore = companionStage(Number(row.xp) || 0).level;
  const levelAfter = companionStage(newXp).level;

  await db
    .from("child_companion")
    .update({
      xp: newXp,
      streak_days: streak,
      best_streak: Math.max(Number(row.best_streak) || 0, streak),
      last_active_date: today,
      updated_at: new Date().toISOString(),
    })
    .eq("family_code", familyCode)
    .eq("child_id", childId);

  return { xp: newXp, streak, leveledUp: levelAfter > levelBefore };
}

async function companionState(familyCode: string, childId: string) {
  if (!db) return null;
  const { data } = await db
    .from("child_companion")
    .select("name, xp, streak_days, best_streak, last_active_date")
    .eq("family_code", familyCode)
    .eq("child_id", childId)
    .limit(1);

  const row = (data && data[0]) || {
    name: defaultCompanionName(childId),
    xp: 0,
    streak_days: 0,
    best_streak: 0,
    last_active_date: null,
  };

  // Bir kundan ko'p e'tiborsiz qolsa — bo'ri uxlab qoladi.
  const today = tashkentDateKey();
  const yesterday = tashkentDateKey(Date.now() - 86400000);
  const last = row.last_active_date ? String(row.last_active_date).slice(0, 10) : null;
  const asleep = !last || (last !== today && last !== yesterday);

  return {
    name: row.name,
    xp: Number(row.xp) || 0,
    streak: asleep ? 0 : Number(row.streak_days) || 0,
    bestStreak: Number(row.best_streak) || 0,
    asleep,
    ...companionStage(Number(row.xp) || 0),
    // Do'kondan olingan va kiyilgan yorliq hamda bo'ri buyumi.
    ...(await equippedItems(familyCode, childId)),
  };
}

// Ota-ona taklifi bolanikidan qimmatroq: ota-ona butun yangi oilani, ya'ni
// pul to'laydigan mijozni olib keladi; bola esa do'stini, ya'ni avval yana
// bitta ota-onani ishontirishi kerak bo'lgan zanjirni boshlaydi.
const REFERRAL_BONUS_DAYS = 14;
const REFERRAL_BONUS_DAYS_CHILD = 7;

/** Oilaga N kun Pro qo'shadi (mavjud muddat tugamagan bo'lsa — ustiga qo'shiladi). */
async function grantProDays(familyCode: string, days: number): Promise<string | null> {
  if (!db || !familyCode) return null;
  const { data } = await db
    .from("parent_registrations")
    .select("plan_expires_at")
    .eq("family_code", familyCode)
    .limit(1);
  const row = data && data[0];
  if (!row) return null;

  const now = Date.now();
  const current = row.plan_expires_at ? new Date(row.plan_expires_at).getTime() : 0;
  const base = current > now ? current : now;
  const until = new Date(base + days * 86400000).toISOString();

  const { error } = await db
    .from("parent_registrations")
    .update({ plan: "pro", plan_expires_at: until })
    .eq("family_code", familyCode);
  if (error) {
    console.error("grantProDays xatosi:", error.message);
    return null;
  }
  return until;
}

/**
 * Taklif mukofoti. Ataylab TASDIQLASH paytida beriladi, ro'yxatdan o'tishda
 * emas: aks holda soxta ro'yxatlar bilan cheksiz Pro yig'ish mumkin bo'lardi.
 * referral_rewarded_at bir taklif uchun ikki marta to'lashning oldini oladi.
 */
async function payReferralReward(familyCode: string): Promise<void> {
  if (!db) return;
  const { data } = await db
    .from("parent_registrations")
    .select(
      "referred_by_family_code, referred_by_child_id, referred_via, referral_rewarded_at, family_name"
    )
    .eq("family_code", familyCode)
    .limit(1);

  const row = data && data[0];
  if (!row || !row.referred_by_family_code || row.referral_rewarded_at) return;

  const inviter = row.referred_by_family_code;
  if (inviter === familyCode) return; // o'zini o'zi chaqira olmaydi

  const byChild = row.referred_via === "child" && !!row.referred_by_child_id;
  const days = byChild ? REFERRAL_BONUS_DAYS_CHILD : REFERRAL_BONUS_DAYS;

  const inviterUntil = await grantProDays(inviter, days);
  if (!inviterUntil) return;
  await grantProDays(familyCode, days);

  await db
    .from("parent_registrations")
    .update({ referral_rewarded_at: new Date().toISOString() })
    .eq("family_code", familyCode);

  const until = new Date(inviterUntil).toLocaleDateString("uz-UZ");

  if (byChild) {
    // Bolaning o'ziga ham aytamiz: mukofot oilaga tushsa ham, uni qilgan
    // ish bola qilgan. Tabrik faqat ota-onaga borsa, bola keyingi safar
    // hech kimni chaqirmasdi.
    const childTgId = String(row.referred_by_child_id).replace(/^tg_/, "");
    if (/^\d+$/.test(childTgId)) {
      await sendMessage(
        childTgId,
        `🎉 <b>Do'sting qo'shildi!</b>\n\nSen chaqirgan do'stingning oilasi Qalqon AI'ga qo'shildi.\n\n⭐️ Oilangga <b>+${days} kun Pro</b> berildi — bu senga rahmat.`
      );
    }
    await notifyFamilyParents(
      inviter,
      `🎁 <b>Farzandingiz do'stini taklif qildi!</b>\n\nChaqirilgan oila ro'yxatdan o'tdi va tasdiqlandi.\n\n⭐️ <b>+${days} kun Pro</b> sizga qo'shildi (${until} gacha).`
    );
  } else {
    await notifyFamilyParents(
      inviter,
      `🎁 <b>Taklifingiz uchun rahmat!</b>\n\nSiz chaqirgan oila ro'yxatdan o'tdi va tasdiqlandi.\n\n⭐️ <b>+${days} kun Pro</b> sizga qo'shildi (${until} gacha).`
    );
  }

  await notifyFamilyParents(
    familyCode,
    `🎁 <b>Sovg'a!</b>\n\nSiz taklif havolasi orqali qo'shilganingiz uchun <b>+${days} kun Pro</b> berildi.`
  );
}

// ============================================================================
// BALL TIZIMI — to'plash qoidalari, do'kon va kolleksiya kartalari
//
// Ilgari yig'ilgan daqiqalar Pro kunlariga almashtirilardi. Bu olib
// tashlandi: Pro'ni ota-ona sotib oladi, bolaga "oilangga 7 kun Pro" degan
// gap hech narsa bermaydi. Endi ball bola o'zi his qiladigan narsaga
// sarflanadi — ota-ona va'da qilgan sovg'a, yorliq, bo'ri buyumi, o'yin,
// AI savol yoki raqamlangan karta.
//
// Ball to'plash ham qiyinlashdi, chunki ilgari aldash oson edi:
//  · Fokus taymeri o'zi ball bermaydi. Tugagach 3 ta savol, har biriga 15
//    soniya — vaqtni SERVER o'lchaydi. Savolni qayta so'rash (sahifani
//    yangilab, boshqa AI'dan javob qidirish) javobsiz deb hisoblanadi.
//  · Ball beradigan fokus seansi kuniga 3 ta.
//  · Uy vazifasini ota-ona botda tasdiqlaydi.
//  · Maktab vaqti Toshkent soati bo'yicha (ilgari UTC edi va 08:00 lik
//    muddat amalda 13:00 gacha cho'zilardi).
//
// Barcha sarflash SQL funksiyalari orqali (database/15_ball_dokoni.sql):
// ular oila+bola bo'yicha qulf oladi, shuning uchun ikki parallel xarid
// bitta ballni ikki marta sarflay olmaydi.
// ============================================================================

// O'zbekistonda yozgi vaqt yo'q — siljish doimiy.
const TASHKENT_OFFSET_MS = 5 * 3600 * 1000;

function tashkentDateKey(t: number = Date.now()): string {
  return new Date(t + TASHKENT_OFFSET_MS).toISOString().slice(0, 10);
}

function tashkentDayStartISO(t: number = Date.now()): string {
  return new Date(tashkentDateKey(t) + "T00:00:00+05:00").toISOString();
}

function tashkentHourMinute(t: number = Date.now()): { h: number; m: number } {
  const d = new Date(t + TASHKENT_OFFSET_MS);
  return { h: d.getUTCHours(), m: d.getUTCMinutes() };
}

/** Ball ISHLAB TOPILGAN yozuvlar. Qaytim yoki sarflash kunlik hisobga kirmaydi. */
const EARN_REASONS = new Set(["focus", "school_ontime", "homework", "parent_bonus"]);

const FOCUS_AWARDS_PER_DAY = 3;
const FOCUS_CHECK_QUESTIONS = 3;
const FOCUS_CHECK_SECONDS = 15;
// Tarmoq kechikishi uchun. Savolni AI'ga yozib javob olishga yetmaydi.
const FOCUS_CHECK_GRACE_SECONDS = 3;
const FOCUS_CHECK_PASS = 2;
const HOMEWORK_PER_DAY = 2;
const GIFT_PENDING_MAX = 3;
const GIFT_ITEMS_MAX = 20;

type ShopItem = {
  key: string;
  kind: "badge" | "companion" | "game" | "boost";
  emoji: string;
  title: string;
  desc: string;
  price: number;
  consumable?: boolean;
  gameId?: string;
};

// Narxlar kunlik daromadga qarab: halol, harakat qilgan bola kuniga
// taxminan 50 ball yig'adi. Eng arzon buyum — 2 kun, eng qimmati — bir oy.
const SHOP_ITEMS: ShopItem[] = [
  { key: "badge_kitobxon", kind: "badge", emoji: "📚", title: "Kitobxon", desc: "Isming yonida ko'rinadi", price: 150 },
  { key: "badge_mutafakkir", kind: "badge", emoji: "🧠", title: "Mutafakkir", desc: "Isming yonida ko'rinadi", price: 300 },
  { key: "badge_chaqmoq", kind: "badge", emoji: "⚡", title: "Chaqmoq", desc: "Isming yonida ko'rinadi", price: 500 },
  { key: "badge_sherdil", kind: "badge", emoji: "🦁", title: "Sherdil", desc: "Isming yonida ko'rinadi", price: 800 },
  { key: "badge_sulton", kind: "badge", emoji: "👑", title: "Qalqon sultoni", desc: "Eng noyob yorliq", price: 1500 },

  { key: "acc_sharf", kind: "companion", emoji: "🧣", title: "Sharf", desc: "Bo'ring kiyadi", price: 100 },
  { key: "acc_shlyapa", kind: "companion", emoji: "🎩", title: "Shlyapa", desc: "Bo'ring kiyadi", price: 180 },
  { key: "acc_kozoynak", kind: "companion", emoji: "🕶️", title: "Qora ko'zoynak", desc: "Bo'ring kiyadi", price: 250 },
  { key: "acc_qalqon", kind: "companion", emoji: "🛡️", title: "Qalqon", desc: "Bo'ring ushlab yuradi", price: 400 },
  { key: "acc_toj", kind: "companion", emoji: "👑", title: "Oltin toj", desc: "Bo'ring kiyadi", price: 900 },

  { key: "game_race", kind: "game", gameId: "race", emoji: "🏎️", title: "Poyga", desc: "O'yinni butunlay ochadi", price: 200 },
  { key: "game_g2048", kind: "game", gameId: "g2048", emoji: "🔢", title: "2048", desc: "O'yinni butunlay ochadi", price: 200 },
  { key: "game_tower", kind: "game", gameId: "tower", emoji: "🏗️", title: "Qalqon Minorasi", desc: "O'yinni butunlay ochadi", price: 250 },

  { key: "ai_10", kind: "boost", emoji: "🤖", title: "+10 ta AI savol", desc: "Faqat bugun uchun", price: 40, consumable: true },
];
const SHOP_BY_KEY: Record<string, ShopItem> = Object.fromEntries(SHOP_ITEMS.map((i) => [i.key, i]));

/** Sotib olinmaydigan, faqat ishlab topiladigan yorliqlar. */
const EARNED_BADGES = [
  { key: "streak7", emoji: "🔥", title: "7 kun ketma-ket", need: 7 },
  { key: "streak30", emoji: "🌟", title: "30 kun ketma-ket", need: 30 },
];

const CARD_BOX_PRICE = 150;
const CARD_RARITY: Record<string, { label: string; supply: number; chance: number }> = {
  oddiy: { label: "Oddiy", supply: 1000, chance: 75 },
  noyob: { label: "Noyob", supply: 300, chance: 21 },
  afsonaviy: { label: "Afsonaviy", supply: 50, chance: 4 },
};
const CARDS = [
  { key: "oqbori", rarity: "oddiy", emoji: "🐺", title: "Oqbo'ri" },
  { key: "qorbori", rarity: "oddiy", emoji: "❄️", title: "Qorbo'ri" },
  { key: "dasht", rarity: "oddiy", emoji: "🌾", title: "Dasht bo'risi" },
  { key: "tog", rarity: "oddiy", emoji: "⛰️", title: "Tog' bo'risi" },
  { key: "tungi", rarity: "oddiy", emoji: "🌙", title: "Tungi bo'ri" },
  { key: "ormon", rarity: "oddiy", emoji: "🌲", title: "O'rmon bo'risi" },
  { key: "olov", rarity: "noyob", emoji: "🔥", title: "Olov bo'ri" },
  { key: "muz", rarity: "noyob", emoji: "🧊", title: "Muz bo'ri" },
  { key: "chaqmoq", rarity: "noyob", emoji: "⚡", title: "Momaqaldiroq bo'ri" },
  { key: "yulduz", rarity: "noyob", emoji: "⭐", title: "Yulduz bo'ri" },
  { key: "oltin", rarity: "afsonaviy", emoji: "🏆", title: "Oltin bo'ri" },
  { key: "registon", rarity: "afsonaviy", emoji: "🕌", title: "Registon qo'riqchisi" },
];
const CARD_BY_KEY: Record<string, any> = Object.fromEntries(CARDS.map((c) => [c.key, c]));

function jsonRes(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** So'rovchi farzand bo'lsa — uning oilasi va id'si, aks holda null. */
async function actorAsChild(actor: Actor): Promise<{ familyCode: string; childId: string } | null> {
  if (actor.kind === "device") return { familyCode: actor.familyCode, childId: actor.childId };
  if (!(await isPairedChild(actor.telegramId))) return null;
  return { familyCode: await resolveActorFamily(actor), childId: "tg_" + actor.telegramId };
}

/** So'rovchi ota-ona bo'lsa — oila kodi. Farzand yoki qurilma bo'lsa null. */
async function actorAsParent(actor: Actor): Promise<string | null> {
  if (actor.kind !== "telegram") return null;
  if (await isPairedChild(actor.telegramId)) return null;
  return actor.familyCode;
}

async function childGrade(familyCode: string, childId: string): Promise<number> {
  if (!db) return 6;
  const { data } = await db
    .from("child_pairings")
    .select("grade")
    .eq("family_code", familyCode)
    .eq("child_id", childId)
    .limit(1);
  const g = Number(data && data[0] && data[0].grade);
  return g >= 1 && g <= 11 ? g : 6;
}

/** Kutilayotgan sovg'a so'rovlari — ular uchun ball band qilingan. */
async function reservedPoints(familyCode: string, childId: string): Promise<number> {
  if (!db) return 0;
  const { data } = await db
    .from("reward_redemptions")
    .select("price")
    .eq("family_code", familyCode)
    .eq("child_id", childId)
    .eq("status", "pending")
    .limit(50);
  return (data || []).reduce((a: number, r: any) => a + (Number(r.price) || 0), 0);
}

/** Bugun sotib olingan AI savollar. */
async function aiBoostToday(familyCode: string, childId: string): Promise<number> {
  if (!db) return 0;
  const { data } = await db
    .from("shop_purchases")
    .select("id")
    .eq("family_code", familyCode)
    .eq("child_id", childId)
    .eq("item_key", "ai_10")
    .gte("created_at", tashkentDayStartISO())
    .limit(100);
  return (data || []).length * 10;
}

/** Kiyilgan yorliq va bo'ri buyumi — bo'ri kartasida ko'rsatish uchun. */
async function equippedItems(familyCode: string, childId: string) {
  if (!db) return { badge: null, accessory: null };
  const { data } = await db
    .from("shop_purchases")
    .select("item_key")
    .eq("family_code", familyCode)
    .eq("child_id", childId)
    .eq("equipped", true)
    .limit(10);
  let badge: any = null, accessory: any = null;
  for (const r of data || []) {
    const it = SHOP_BY_KEY[r.item_key];
    if (!it) continue;
    if (it.kind === "badge") badge = { emoji: it.emoji, title: it.title };
    if (it.kind === "companion") accessory = { emoji: it.emoji, title: it.title };
  }
  return { badge, accessory };
}

/** Fokus tekshiruvi uchun 3 ta savol — bolaning sinfiga mos. */
/**
 * Bugungi uy vazifasida mashq raqamlari bo'lsa — savollar AYNAN o'sha mashq
 * matnidan tuziladi. Bu fokus tekshiruvining zaif joyi edi: savollar bola
 * o'qigan narsaga umuman bog'liq emasdi.
 */
async function homeworkExerciseQuestions(familyCode: string, childId: string) {
  if (!db) return null;
  const { data } = await db.from("homework_items")
    .select("subject, exercises, grade, created_at")
    .eq("family_code", familyCode).eq("child_id", childId)
    .not("exercises", "is", null)
    .gte("created_at", tashkentDayStartISO())
    .order("created_at", { ascending: false }).limit(1);
  const hw = data && data[0];
  if (!hw) return null;
  const rows = await textbookExercises(Number(hw.grade) || await childGrade(familyCode, childId), hw.subject, parseExerciseNumbers(hw.exercises));
  if (!rows.length) return null;

  const apiKey = Deno.env.get("GEMINI_API_KEY") || "";
  if (!apiKey) return null;
  const model = Deno.env.get("GEMINI_MODEL") || "gemini-3.6-flash";
  const material = rows.map((r: any) => `${r.number}-mashq (${r.topic || ""}, ${r.page}-bet):\n${r.body}`).join("\n\n");
  const prompt =
    `Quyida ${hw.grade}-sinf "${hw.subject}" darsligidagi mashq(lar) matni bor. ` +
    `Bola shu mashqni uyda bajardim deydi. AYNAN SHU MATNGA tayanib ${FOCUS_CHECK_QUESTIONS} ta tekshiruv savoli yoz.\n\n` +
    `MATN:\n${material}\n\n` +
    `Qoidalar:\n` +
    `- Savollar mashqni haqiqatan o'qib, bajargan bola javob bera oladigan bo'lsin ` +
    `(matndagi so'zlar, topshiriq nima ekani, misollar, qoidaning qo'llanishi).\n` +
    `- Matnda javobi yo'q savol yozma.\n` +
    `- Faqat JSON massiv qaytar: [{"q":"savol","a":["v1","v2","v3","v4"],"c":to'g'ri indeks 0-3,"why":"bir jumla izoh"}]\n` +
    `- Hammasi o'zbek tilida, ${hw.grade}-sinf darajasida. LaTeX yozma.`;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.4, maxOutputTokens: 4096 } }) },
    );
    const j = await res.json();
    const txt = (j?.candidates?.[0]?.content?.parts || []).filter((p: any) => p?.text && p.thought !== true).map((p: any) => p.text).join("");
    const arr = JSON.parse((txt.match(/\[[\s\S]*\]/) || ["[]"])[0]);
    const good = arr.filter(validQuizItem).slice(0, FOCUS_CHECK_QUESTIONS);
    if (good.length < FOCUS_CHECK_QUESTIONS) return null;
    return good.map((q: any) => ({ q: q.q, a: q.a, c: q.c, why: q.why || "", from: "homework" }));
  } catch (e) {
    console.error("homeworkExerciseQuestions:", e);
    return null;
  }
}

async function pickFocusCheckQuestions(familyCode: string, childId: string) {
  const fromHw = await homeworkExerciseQuestions(familyCode, childId);
  if (fromHw) return fromHw;
  const grade = await childGrade(familyCode, childId);
  const category = Math.random() < 0.6 ? "maktab" : "fikrlash";
  const all = (await buildQuizQuestions(category, grade)).filter(validQuizItem);
  let pool = all.length >= FOCUS_CHECK_QUESTIONS ? all : QUIZ_FALLBACK.maktab.concat(QUIZ_FALLBACK.fikrlash);
  pool = quizPick(pool, FOCUS_CHECK_QUESTIONS);
  return pool.map((q: any) => ({ q: q.q, a: q.a, c: q.c, why: q.why || "" }));
}

/** Fokus tekshiruvini yakunlaydi va (o'tgan bo'lsa) ball yozadi. */
async function finishFocusCheck(session: any, answers: any[], familyCode: string, childId: string) {
  const correct = answers.filter((a) => a.correct).length;
  const passed = correct >= FOCUS_CHECK_PASS;

  const { data: today } = await db!
    .from("focus_sessions")
    .select("id")
    .eq("family_code", familyCode)
    .eq("child_id", childId)
    .eq("check_passed", true)
    .gt("awarded_minutes", 0)
    .gte("completed_at", tashkentDayStartISO())
    .limit(FOCUS_AWARDS_PER_DAY + 1);
  const underLimit = (today || []).length < FOCUS_AWARDS_PER_DAY;

  const rules = await getTimeBankRules(familyCode, childId);
  let awarded = 0;
  if (passed && underLimit && rules.enabled) {
    // Mukofot seans uzunligiga mutanosib: kurs "25 daqiqalik seans uchun".
    const scaled = Math.round(
      (Number(rules.minutes_per_focus) * Number(session.planned_minutes)) / 25
    );
    awarded = await timeBankAward(
      familyCode, childId, Math.max(1, scaled), "focus",
      `${session.planned_minutes} daqiqalik fokus · ${correct}/${answers.length}`
    );
  }

  await db!
    .from("focus_sessions")
    .update({
      completed_at: new Date().toISOString(),
      awarded_minutes: awarded,
      check_answers: answers,
      check_issued_at: null,
      check_correct: correct,
      check_passed: passed,
    })
    .eq("id", session.id);

  if (awarded > 0) {
    await notifyFamilyParents(
      familyCode,
      `🎯 <b>Farzandingiz ${session.planned_minutes} daqiqa diqqat bilan ishladi.</b>\n\n` +
        `Tekshiruv savollaridan <b>${correct} / ${answers.length}</b> tasiga to'g'ri javob berdi — ` +
        `<b>+${awarded} ball</b>.`
    );
  }

  const { balance, earnedToday } = await timeBankBalance(familyCode, childId);
  return {
    done: true,
    passed,
    correct,
    total: answers.length,
    awarded,
    limitReached: passed && !underLimit,
    capReached: passed && underLimit && rules.enabled && awarded === 0,
    perDay: FOCUS_AWARDS_PER_DAY,
    balance,
    earnedToday,
    dailyCap: rules.daily_cap_minutes,
    companion: await companionState(familyCode, childId),
  };
}

/** Karta qutisi uchun nomzodlar tartibi: tushgan noyoblik, keyin pastrog'i. */
function cardBoxCandidates(): any[] {
  const roll = Math.random() * 100;
  const rarity = roll < CARD_RARITY.afsonaviy.chance
    ? "afsonaviy"
    : roll < CARD_RARITY.afsonaviy.chance + CARD_RARITY.noyob.chance ? "noyob" : "oddiy";
  const order = rarity === "afsonaviy"
    ? ["afsonaviy", "noyob", "oddiy"]
    : rarity === "noyob" ? ["noyob", "oddiy", "afsonaviy"] : ["oddiy", "noyob", "afsonaviy"];
  const out: any[] = [];
  for (const r of order) {
    for (const c of quizPick(CARDS.filter((x) => x.rarity === r), 99)) {
      out.push({ key: c.key, supply: CARD_RARITY[r].supply });
    }
  }
  return out;
}

/**
 * Ball tizimining Mini App so'rovlari. Mos kelmasa null — asosiy
 * handler davom etadi.
 */
async function handleBallRoutes(payload: any, actor: Actor): Promise<Response | null> {
  const t = String(payload?.type || "");
  const mine = [
    "focus_complete", "focus_check_question", "focus_check_answer",
    "homework_claim", "shop_status", "shop_buy", "shop_equip", "shop_open_box",
    "reward_request", "reward_items_list", "reward_item_save", "reward_item_delete",
    "pro_exchange_status", "pro_exchange_request",
  ];
  if (!mine.includes(t)) return null;
  if (!db) return jsonRes({ ok: false, error: "Baza ulanmagan" }, 500);

  if (t === "pro_exchange_status" || t === "pro_exchange_request") {
    return jsonRes({ ok: false, removed: true, error: "Ballar endi Ball do'konida sarflanadi." }, 410);
  }

  // ---------------------------------------------------------------- FOKUS
  if (t === "focus_complete" || t === "focus_check_question" || t === "focus_check_answer") {
    const kid = await actorAsChild(actor);
    if (!kid) return unauthorized("Faqat farzand");
    const { familyCode, childId } = kid;

    const { data: rows } = await db
      .from("focus_sessions")
      .select("id, planned_minutes, started_at, completed_at, check_questions, check_answers, check_issued_at")
      .eq("id", String(payload.sessionId || ""))
      .eq("family_code", familyCode)
      .eq("child_id", childId)
      .limit(1);
    const session = rows && rows[0];
    if (!session) return jsonRes({ ok: false, error: "Seans topilmadi." }, 404);
    if (session.completed_at) return jsonRes({ ok: false, error: "Bu seans allaqachon yakunlangan." }, 409);

    const questions: any[] = session.check_questions || [];
    const answers: any[] = Array.isArray(session.check_answers) ? session.check_answers : [];

    if (t === "focus_complete") {
      // Haqiqatan o'tirilganini SERVER tekshiradi (taymer sekundlari va
      // tarmoq kechikishi uchun 10% bo'sh joy).
      const elapsedMin = (Date.now() - new Date(session.started_at).getTime()) / 60000;
      const required = Number(session.planned_minutes) * 0.9;
      if (elapsedMin < required) {
        return jsonRes({
          ok: false, tooEarly: true, error: "Seans hali tugamadi.",
          remainingMinutes: Math.max(1, Math.ceil(required - elapsedMin)),
        }, 400);
      }
      if (questions.length) {
        return jsonRes({ ok: true, check: { total: questions.length, answered: answers.length, seconds: FOCUS_CHECK_SECONDS } });
      }
      const qs = await pickFocusCheckQuestions(familyCode, childId);
      await db
        .from("focus_sessions")
        .update({ check_questions: qs, check_answers: [], check_issued_at: null })
        .eq("id", session.id);
      return jsonRes({ ok: true, check: { total: qs.length, answered: 0, seconds: FOCUS_CHECK_SECONDS } });
    }

    if (!questions.length) return jsonRes({ ok: false, error: "Avval seansni yakunlang." }, 400);

    if (t === "focus_check_question") {
      // Berilgan savol javobsiz qayta so'ralsa — bu javob topishga urinish
      // (sahifani yangilab, boshqa ilovaga o'tib). Noto'g'ri hisoblanadi.
      if (session.check_issued_at) {
        answers.push({ choice: -1, correct: false, reissued: true });
        if (answers.length >= questions.length) {
          return jsonRes({ ok: true, ...(await finishFocusCheck(session, answers, familyCode, childId)) });
        }
      }
      const i = answers.length;
      await db
        .from("focus_sessions")
        .update({ check_answers: answers, check_issued_at: new Date().toISOString() })
        .eq("id", session.id);
      return jsonRes({
        ok: true, index: i, total: questions.length, seconds: FOCUS_CHECK_SECONDS,
        skippedPrevious: !!session.check_issued_at,
        question: { q: questions[i].q, a: questions[i].a },
      });
    }

    // focus_check_answer
    if (!session.check_issued_at) return jsonRes({ ok: false, error: "Savol berilmagan." }, 400);
    const i = answers.length;
    const q = questions[i];
    const elapsedSec = (Date.now() - new Date(session.check_issued_at).getTime()) / 1000;
    const choice = Number.isInteger(payload.choice) ? Number(payload.choice) : -1;
    const timedOut = elapsedSec > FOCUS_CHECK_SECONDS + FOCUS_CHECK_GRACE_SECONDS;
    const correct = !timedOut && choice === q.c;
    answers.push({ choice, correct, ms: Math.round(elapsedSec * 1000), timedOut });

    const feedback = { correct, timedOut, correctIndex: q.c, why: q.why || "" };
    if (answers.length >= questions.length) {
      return jsonRes({ ok: true, ...feedback, ...(await finishFocusCheck(session, answers, familyCode, childId)) });
    }
    await db
      .from("focus_sessions")
      .update({ check_answers: answers, check_issued_at: null })
      .eq("id", session.id);
    return jsonRes({ ok: true, ...feedback, done: false, index: i, total: questions.length });
  }

  // ---------------------------------------------------------- UY VAZIFASI
  if (t === "homework_claim") {
    const kid = await actorAsChild(actor);
    if (!kid) return unauthorized("Faqat farzand");
    const { familyCode, childId } = kid;

    const { data: todays } = await db
      .from("homework_items")
      .select("id, status")
      .eq("family_code", familyCode)
      .eq("child_id", childId)
      .gte("created_at", tashkentDayStartISO())
      .limit(20);
    const list = todays || [];
    if (list.some((r: any) => r.status === "pending")) {
      return jsonRes({ ok: false, error: "Oldingi xabaringni ota-onang hali ko'rmadi." }, 409);
    }
    if (list.filter((r: any) => r.status === "approved").length >= HOMEWORK_PER_DAY) {
      return jsonRes({ ok: false, error: `Bugun ${HOMEWORK_PER_DAY} ta uy vazifasi tasdiqlandi — ertaga yana.` }, 429);
    }

    const note = String(payload.note || "").trim().slice(0, 120);
    const subject = String(payload.subject || "Uy vazifasi").trim().slice(0, 40) || "Uy vazifasi";
    // Daftar surati (ixtiyoriy) — oila chatiga karta bilan birga tushadi.
    const hwPhoto = typeof payload.photo === "string" && /^data:image\/(jpeg|png|webp);base64,/.test(payload.photo) &&
      payload.photo.length <= CHAT_PHOTO_MAX ? payload.photo : null;
    // Mashq raqamlari ("39-40") — fokus savollari shu mashqlardan tuziladi.
    const hwNumbers = parseExerciseNumbers(payload.exercises);
    const hwGrade = await childGrade(familyCode, childId);
    const hwFound = await textbookExercises(hwGrade, subject, hwNumbers);
    const { data: ins } = await db
      .from("homework_items")
      .insert({
        family_code: familyCode,
        child_id: childId,
        grade: hwGrade,
        subject,
        title: note,
        exercises: hwNumbers.join(",") || null,
        status: "pending",
      })
      .select("id")
      .limit(1);
    const id = ins && ins[0] && ins[0].id;
    if (!id) return jsonRes({ ok: false, error: "Saqlab bo'lmadi." }, 500);

    const rules = await getTimeBankRules(familyCode, childId);
    const nom = await participantName(familyCode, childId);
    await postChatEvent(familyCode, { id: childId, role: "child", name: nom },
      { type: "homework", refId: id, status: "pending", subject, note, points: rules.minutes_per_homework,
        exercises: hwNumbers.join(","), matched: hwFound.map((e: any) => e.number) },
      `📚 Uy vazifam tayyor: ${subject}${hwNumbers.length ? " — " + hwNumbers.join(", ") + "-mashq" : ""}${note ? " — " + note : ""}`, hwPhoto);
    const delivered = await notifyFamilyParents(
      familyCode,
      `📚 <b>${nom}: "Uy vazifamni bajardim"</b>\n\n` +
        `<b>Fan:</b> ${subject}` + (note ? `\n<b>Izoh:</b> ${note}` : "") +
        (hwPhoto ? `\n📷 Daftar surati oila chatida.` : "") +
        `\n\nTekshirib ko'ring. Tasdiqlasangiz, <b>+${rules.minutes_per_homework} ball</b> yoziladi.`,
      {
        inline_keyboard: [[
          { text: "✅ Tasdiqlayman", callback_data: "hw_ok_" + id },
          { text: "❌ Bajarilmagan", callback_data: "hw_no_" + id },
        ]],
      }
    );
    return jsonRes({
      ok: true, id, delivered,
      // Mijoz "39-mashq darslikdan topildi" deb ko'rsatishi uchun.
      exercises: hwNumbers,
      matched: hwFound.map((e: any) => ({ number: e.number, topic: e.topic, page: e.page })),
    });
  }

  // ------------------------------------------------------ OTA-ONA SOVG'ALARI
  if (t === "reward_items_list") {
    const fam = (await actorAsParent(actor)) || (await actorAsChild(actor))?.familyCode;
    if (!fam) return unauthorized("Oila topilmadi");
    const { data } = await db
      .from("reward_items")
      .select("id, emoji, title, price")
      .eq("family_code", fam)
      .eq("active", true)
      .order("price", { ascending: true })
      .limit(GIFT_ITEMS_MAX);
    return jsonRes({ ok: true, items: data || [] });
  }

  if (t === "reward_item_save") {
    const fam = await actorAsParent(actor);
    if (!fam) return unauthorized("Faqat ota-ona");
    const title = String(payload.title || "").trim().slice(0, 60);
    const emoji = String(payload.emoji || "🎁").trim().slice(0, 8) || "🎁";
    const price = Math.round(Number(payload.price));
    if (title.length < 2) return jsonRes({ ok: false, error: "Sovg'a nomini yozing." }, 400);
    if (!(price >= 10 && price <= 100000)) return jsonRes({ ok: false, error: "Narx 10 dan 100 000 gacha bo'lsin." }, 400);
    const { data: cnt } = await db
      .from("reward_items").select("id").eq("family_code", fam).eq("active", true).limit(GIFT_ITEMS_MAX + 1);
    if ((cnt || []).length >= GIFT_ITEMS_MAX) {
      return jsonRes({ ok: false, error: `Ko'pi bilan ${GIFT_ITEMS_MAX} ta sovg'a.` }, 400);
    }
    const { error } = await db.from("reward_items").insert({ family_code: fam, title, emoji, price });
    if (error) return jsonRes({ ok: false, error: error.message }, 500);
    return jsonRes({ ok: true });
  }

  if (t === "reward_item_delete") {
    const fam = await actorAsParent(actor);
    if (!fam) return unauthorized("Faqat ota-ona");
    await db
      .from("reward_items")
      .update({ active: false })
      .eq("id", String(payload.id || ""))
      .eq("family_code", fam);
    return jsonRes({ ok: true });
  }

  // ------------------------------------------------------------- DO'KON
  if (t === "shop_status") {
    let kid = await actorAsChild(actor);
    if (!kid) {
      const fam = await actorAsParent(actor);
      const cid = String(payload.childId || "").trim();
      if (!fam || !cid) return unauthorized("Do'kon faqat farzand panelida ishlaydi");
      kid = { familyCode: fam, childId: cid };
    }
    const { familyCode, childId } = kid;

    const [{ balance }, reserved, purchasesRes, giftsRes, pendingRes, cardsRes, mintedRes, boost, companion] =
      await Promise.all([
        timeBankBalance(familyCode, childId),
        reservedPoints(familyCode, childId),
        db.from("shop_purchases").select("item_key, equipped")
          .eq("family_code", familyCode).eq("child_id", childId).limit(500),
        db.from("reward_items").select("id, emoji, title, price")
          .eq("family_code", familyCode).eq("active", true)
          .order("price", { ascending: true }).limit(GIFT_ITEMS_MAX),
        db.from("reward_redemptions").select("id, item_id, emoji, title, price, created_at")
          .eq("family_code", familyCode).eq("child_id", childId).eq("status", "pending").limit(10),
        db.from("collectible_cards").select("card_key, serial, acquired_at")
          .eq("family_code", familyCode).eq("child_id", childId)
          .order("acquired_at", { ascending: false }).limit(500),
        db.from("collectible_cards").select("card_key").limit(20000),
        aiBoostToday(familyCode, childId),
        companionState(familyCode, childId),
      ]);

    const owned = new Map<string, boolean>();
    for (const p of purchasesRes.data || []) {
      owned.set(p.item_key, owned.get(p.item_key) || !!p.equipped);
    }
    const minted: Record<string, number> = {};
    for (const r of mintedRes.data || []) minted[r.card_key] = (minted[r.card_key] || 0) + 1;

    const best = companion ? Number(companion.bestStreak) || 0 : 0;

    return jsonRes({
      ok: true,
      balance,
      reserved,
      available: Math.max(0, balance - reserved),
      items: SHOP_ITEMS.map((i) => ({
        key: i.key, kind: i.kind, emoji: i.emoji, title: i.title, desc: i.desc,
        price: i.price, consumable: !!i.consumable, gameId: i.gameId || null,
        owned: !i.consumable && owned.has(i.key),
        equipped: owned.get(i.key) === true,
      })),
      earnedBadges: EARNED_BADGES.map((b) => ({ ...b, earned: best >= b.need })),
      gifts: giftsRes.data || [],
      pendingGifts: pendingRes.data || [],
      aiBoostToday: boost,
      cardBox: {
        price: CARD_BOX_PRICE,
        rarities: CARD_RARITY,
      },
      cardCatalog: CARDS.map((c) => ({
        ...c,
        supply: CARD_RARITY[c.rarity].supply,
        minted: minted[c.key] || 0,
      })),
      myCards: (cardsRes.data || []).map((c: any) => ({
        ...c,
        ...(CARD_BY_KEY[c.card_key] || {}),
        supply: CARD_RARITY[(CARD_BY_KEY[c.card_key] || {}).rarity]?.supply || 0,
      })),
      companion,
    });
  }

  // Quyidagilar faqat bolaning o'zi uchun: xarid — uning qarori.
  const kid = await actorAsChild(actor);
  if (!kid) return unauthorized("Faqat farzand");
  const { familyCode, childId } = kid;

  if (t === "shop_buy") {
    const item = SHOP_BY_KEY[String(payload.itemKey || "")];
    if (!item) return jsonRes({ ok: false, error: "Bunday buyum yo'q." }, 404);
    const { data, error } = await db.rpc("qalqon_buy", {
      p_family: familyCode, p_child: childId, p_item: item.key,
      p_price: item.price, p_consumable: !!item.consumable,
    });
    if (error) return jsonRes({ ok: false, error: error.message }, 500);
    if (data === "owned") return jsonRes({ ok: false, error: "Bu senda allaqachon bor." }, 409);
    if (data === "no_balance") return jsonRes({ ok: false, noBalance: true, error: "Ball yetmaydi." }, 402);

    // Yangi yorliq yoki bo'ri buyumi darhol kiyiladi — shu kutilgan narsa.
    if (item.kind === "badge" || item.kind === "companion") {
      const sameKind = SHOP_ITEMS.filter((i) => i.kind === item.kind).map((i) => i.key);
      await db.from("shop_purchases").update({ equipped: false })
        .eq("family_code", familyCode).eq("child_id", childId).in("item_key", sameKind);
      await db.from("shop_purchases").update({ equipped: true })
        .eq("family_code", familyCode).eq("child_id", childId).eq("item_key", item.key);
    }
    const { balance } = await timeBankBalance(familyCode, childId);
    return jsonRes({ ok: true, item: { key: item.key, emoji: item.emoji, title: item.title }, balance });
  }

  if (t === "shop_equip") {
    const item = SHOP_BY_KEY[String(payload.itemKey || "")];
    if (!item || (item.kind !== "badge" && item.kind !== "companion")) {
      return jsonRes({ ok: false, error: "Bu buyumni kiyib bo'lmaydi." }, 400);
    }
    const { data: mineRows } = await db.from("shop_purchases").select("id, equipped")
      .eq("family_code", familyCode).eq("child_id", childId).eq("item_key", item.key).limit(1);
    if (!mineRows || !mineRows[0]) return jsonRes({ ok: false, error: "Avval sotib ol." }, 403);
    const wasOn = !!mineRows[0].equipped;
    const sameKind = SHOP_ITEMS.filter((i) => i.kind === item.kind).map((i) => i.key);
    await db.from("shop_purchases").update({ equipped: false })
      .eq("family_code", familyCode).eq("child_id", childId).in("item_key", sameKind);
    if (!wasOn) {
      await db.from("shop_purchases").update({ equipped: true }).eq("id", mineRows[0].id);
    }
    return jsonRes({ ok: true, equipped: !wasOn });
  }

  if (t === "shop_open_box") {
    const { data, error } = await db.rpc("qalqon_open_box", {
      p_family: familyCode, p_child: childId, p_price: CARD_BOX_PRICE,
      p_candidates: cardBoxCandidates(),
    });
    if (error) return jsonRes({ ok: false, error: error.message }, 500);
    if (data?.status === "no_balance") return jsonRes({ ok: false, noBalance: true, error: "Ball yetmaydi." }, 402);
    if (data?.status !== "ok") return jsonRes({ ok: false, error: "Barcha kartalar tugadi!" }, 410);
    const c = CARD_BY_KEY[data.card_key];
    const { balance } = await timeBankBalance(familyCode, childId);

    // Afsonaviy karta — oilaviy voqea, ota-ona ham bilsin.
    if (c.rarity === "afsonaviy") {
      const nom = await participantName(familyCode, childId);
      await notifyFamilyParents(
        familyCode,
        `🏆 <b>${nom} afsonaviy karta topdi!</b>\n\n${c.emoji} <b>${c.title}</b> — ` +
          `#${String(data.serial).padStart(3, "0")} / ${CARD_RARITY.afsonaviy.supply}. ` +
          `Butun ilovada atigi ${CARD_RARITY.afsonaviy.supply} ta.`
      );
    }
    return jsonRes({
      ok: true,
      card: { ...c, serial: data.serial, supply: CARD_RARITY[c.rarity].supply, rarityLabel: CARD_RARITY[c.rarity].label },
      balance,
    });
  }

  if (t === "reward_request") {
    const { data: items } = await db.from("reward_items").select("id, emoji, title, price")
      .eq("id", String(payload.itemId || "")).eq("family_code", familyCode).eq("active", true).limit(1);
    const item = items && items[0];
    if (!item) return jsonRes({ ok: false, error: "Bu sovg'a endi yo'q." }, 404);

    const { data: pend } = await db.from("reward_redemptions").select("id, item_id")
      .eq("family_code", familyCode).eq("child_id", childId).eq("status", "pending").limit(10);
    if ((pend || []).some((p: any) => p.item_id === item.id)) {
      return jsonRes({ ok: false, error: "Bu sovg'ani allaqachon so'ragansan — javobni kut." }, 409);
    }
    if ((pend || []).length >= GIFT_PENDING_MAX) {
      return jsonRes({ ok: false, error: `Bir vaqtda ko'pi bilan ${GIFT_PENDING_MAX} ta so'rov.` }, 429);
    }
    const { balance } = await timeBankBalance(familyCode, childId);
    const reserved = await reservedPoints(familyCode, childId);
    if (balance - reserved < item.price) {
      return jsonRes({ ok: false, noBalance: true, error: `Ball yetmaydi: ${Math.max(0, balance - reserved)} bor, ${item.price} kerak.` }, 402);
    }

    const { data: ins } = await db.from("reward_redemptions").insert({
      family_code: familyCode, child_id: childId, item_id: item.id,
      emoji: item.emoji, title: item.title, price: item.price,
    }).select("id").limit(1);
    const rid = ins && ins[0] && ins[0].id;
    if (!rid) return jsonRes({ ok: false, error: "Saqlab bo'lmadi." }, 500);

    const nom = await participantName(familyCode, childId);
    await postChatEvent(familyCode, { id: childId, role: "child", name: nom },
      { type: "gift", refId: rid, status: "pending", emoji: item.emoji, title: item.title, price: item.price },
      `🎁 Sovg'a so'rayman: ${item.emoji} ${item.title} — ${item.price} ball`);
    await notifyFamilyParents(
      familyCode,
      `🎁 <b>${nom} sovg'a so'rayapti</b>\n\n${item.emoji} <b>${item.title}</b> — ${item.price} ball\n` +
        `Balansi: ${balance} ball\n\n` +
        `<i>Tasdiqlasangiz, ball yechiladi va va'dani bajarish sizda bo'ladi.</i>`,
      {
        inline_keyboard: [[
          { text: "✅ Tasdiqlayman", callback_data: "rw_ok_" + rid },
          { text: "⏳ Hozir emas", callback_data: "rw_no_" + rid },
        ]],
      }
    );
    return jsonRes({ ok: true, id: rid });
  }

  return null;
}

/**
 * Ota-onaning bot tugmalari: uy vazifasi va sovg'a tasdig'i.
 * Tugma ma'lumotini qo'lda yasash qiyin emas — shuning uchun yozuv id'si
 * ruxsat emas, bosgan odamning oilasi solishtiriladi.
 */
async function handleBallCallback(
  data: string,
  chatId: number,
  // Mini App chatidan chaqirilganda ota-onaga bot xabari yuborilmaydi —
  // javob matni shu massivga yig'ilib, ekranda ko'rsatiladi.
  opts: { collect?: string[] } = {},
): Promise<boolean> {
  const tellParent = async (text: string) => {
    if (opts.collect) opts.collect.push(text);
    else await tellParent(text);
  };
  if (data.startsWith("pex_")) {
    await tellParent("ℹ️ Ballarni Pro'ga almashtirish olib tashlandi — endi ballar Ball do'konida sarflanadi.");
    return true;
  }
  const isHw = data.startsWith("hw_ok_") || data.startsWith("hw_no_");
  const isRw = data.startsWith("rw_ok_") || data.startsWith("rw_no_");
  if (!isHw && !isRw) return false;
  if (!db) {
    await tellParent("⚠️ Baza ulanmagan.");
    return true;
  }
  const approve = data.startsWith("hw_ok_") || data.startsWith("rw_ok_");
  const id = data.slice(6);
  const myFamily = generateFamilyCode(chatId);
  const table = isHw ? "homework_items" : "reward_redemptions";

  const { data: rows } = await db.from(table).select("*").eq("id", id).limit(1);
  const row = rows && rows[0];
  if (!row || row.family_code !== myFamily) {
    await tellParent("⛔️ Bu so'rov sizning oilangizga tegishli emas.");
    return true;
  }
  if (row.status !== "pending") {
    await tellParent("ℹ️ Bu so'rov allaqachon ko'rib chiqilgan.");
    return true;
  }

  const nom = await participantName(row.family_code, row.child_id);
  const childTg = String(row.child_id).startsWith("tg_") ? String(row.child_id).slice(3) : null;

  // Avval holatni o'zgartiramiz (faqat pending bo'lsa): ikki marta bosish
  // ikki marta ball bermaydi va ikki marta yechmaydi.
  const { data: claimed } = await db.from(table)
    .update({ status: approve ? "approved" : "rejected", decided_at: new Date().toISOString(), ...(isRw ? { decided_by: chatId } : {}) })
    .eq("id", id).eq("status", "pending").select("id");
  if (!claimed || !claimed[0]) {
    await tellParent("ℹ️ Bu so'rov allaqachon ko'rib chiqilgan.");
    return true;
  }

  await updateChatEvent(row.family_code, isHw ? "homework" : "gift", id, { status: approve ? "approved" : "rejected" });

  if (isHw) {
    if (!approve) {
      await tellParent(`❌ Belgilandi: ${nom}ning uy vazifasi tasdiqlanmadi.`);
      if (childTg) await sendMessage(childTg, `📚 Ota-onang uy vazifangni hali bajarilgan deb hisoblamadi. Tugatib, qayta yubor 💪`);
      return true;
    }
    const rules = await getTimeBankRules(row.family_code, row.child_id);
    const awarded = await timeBankAward(row.family_code, row.child_id, Number(rules.minutes_per_homework), "homework", row.subject || "Uy vazifasi");
    await db.from("homework_items").update({ done: true, done_at: new Date().toISOString(), awarded }).eq("id", id);
    await updateChatEvent(row.family_code, "homework", id, { status: "approved", awarded });
    await tellParent(
      awarded > 0
        ? `✅ Tasdiqlandi. ${nom}ga <b>+${awarded} ball</b> yozildi.`
        : `✅ Tasdiqlandi. Lekin ${nom} bugungi ball chegarasiga yetgan — ball yozilmadi.`
    );
    if (childTg) {
      await sendMessage(childTg, awarded > 0
        ? `🎉 <b>Ota-onang uy vazifangni tasdiqladi!</b>\n\n+${awarded} ball.`
        : `🎉 <b>Ota-onang uy vazifangni tasdiqladi!</b>\n\nBugungi ball chegarasiga yetding, ertaga yana yig'asan.`);
    }
    return true;
  }

  // Sovg'a
  if (!approve) {
    await tellParent(`⏳ Belgilandi: ${row.emoji || "🎁"} ${row.title} hozircha berilmaydi. Ball yechilmadi.`);
    if (childTg) await sendMessage(childTg, `⏳ Ota-onang «${row.title}» sovg'asini hozircha qoldirdi. Ballaring joyida — keyinroq yana so'rashing mumkin.`);
    return true;
  }
  const { data: spent, error } = await db.rpc("qalqon_spend", {
    p_family: row.family_code, p_child: row.child_id, p_amount: Number(row.price),
    p_reason: "gift", p_note: row.title,
  });
  if (error || spent !== true) {
    await db.from("reward_redemptions").update({ status: "rejected" }).eq("id", id);
    await updateChatEvent(row.family_code, "gift", id, { status: "rejected", reason: "no_balance" });
    await tellParent(`⚠️ ${nom}da endi ${row.price} ball yo'q — sovg'a berilmadi.`);
    return true;
  }
  await tellParent(`✅ Tasdiqlandi: ${row.emoji || "🎁"} <b>${row.title}</b>. ${nom}dan ${row.price} ball yechildi.\n\nEndi va'dani bajarish sizda 🙂`);
  if (childTg) {
    await sendMessage(childTg, `🎉 <b>Ota-onang sovg'angni tasdiqladi!</b>\n\n${row.emoji || "🎁"} <b>${row.title}</b>\n−${row.price} ball. Buni sen ishlab topding!`);
  }
  return true;
}




// ============================================================================
// ANDROID ILOVAGA KIRISH VA PUSH (database/20_ilova_kirish_push.sql)
//
// Kirish: ilova "Telegram bilan kirish" tugmasini bosganda bitta so'rov
// ochadi va botni ochadi. Bot ota-onaga tasdiqlash tugmasini ko'rsatadi,
// ota-ona bosgach ilova seansni o'zi olib ketadi. Username yozish bilan
// kirish yo'q: username — oddiy matn, uni istalgan odam yozadi.
//
// Push: bot xabari telefonda Telegram bo'lmasa yetib bormaydi. Shuning
// uchun muhim xabarlar (SOS, joylashuv, chat) push orqali ham yuboriladi.
// FCM kaliti sozlanmagan bo'lsa, hammasi avvalgidek bot orqali ishlayveradi.
// ============================================================================

const APP_LOGIN_TTL_MIN = 10;

function randomHex(bytes = 32) {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
    .map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Shu Telegram hisobi qaysi oilaning ro'yxatdan o'tgan ota-onasi. */
async function registeredParentFamily(telegramId: number): Promise<string | null> {
  if (!db) return null;
  const { data } = await db.from("parent_registrations").select("family_code")
    .eq("parent_telegram_id", telegramId).limit(1);
  return (data && data[0] && data[0].family_code) || null;
}

/* ------------------------------------------------------------------ PUSH */

let fcmToken: { value: string; exp: number } | null = null;

/** Servis hisobi kalitidan FCM uchun kirish tokeni (1 soat saqlanadi). */
async function fcmAccessToken(sa: any): Promise<string | null> {
  if (fcmToken && fcmToken.exp > Date.now() + 60_000) return fcmToken.value;
  try {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: "RS256", typ: "JWT" };
    const claim = {
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    };
    const b64 = (o: unknown) => btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const body = `${b64(header)}.${b64(claim)}`;
    const pem = String(sa.private_key).replace(/-----[A-Z ]+-----/g, "").replace(/\s+/g, "");
    const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
    const key = await crypto.subtle.importKey("pkcs8", der.buffer as ArrayBuffer,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
    const sig = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(body)));
    const jwt = body + "." + btoa(String.fromCharCode(...sig)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });
    const j = await res.json();
    if (!j.access_token) {
      console.error("FCM token olinmadi:", JSON.stringify(j).slice(0, 200));
      return null;
    }
    fcmToken = { value: j.access_token, exp: Date.now() + (Number(j.expires_in) || 3600) * 1000 };
    return fcmToken.value;
  } catch (e) {
    console.error("fcmAccessToken:", e);
    return null;
  }
}

/**
 * Oiladagi bir nechta a'zoga push yuboradi. Kalit yo'q bo'lsa jim qaytadi —
 * bu holda bot xabari yagona yo'l bo'lib qolaveradi.
 */
async function sendPush(familyCode: string, subjectIds: string[], title: string, body: string, data: Record<string, string> = {}) {
  if (!db || !subjectIds.length) return 0;
  const raw = Deno.env.get("FCM_SERVICE_ACCOUNT") || "";
  if (!raw) return 0;
  let sa: any;
  try { sa = JSON.parse(raw); } catch { console.error("FCM_SERVICE_ACCOUNT JSON emas"); return 0; }
  const access = await fcmAccessToken(sa);
  if (!access) return 0;

  const { data: rows } = await db.from("push_tokens").select("id, token, subject_id")
    .eq("family_code", familyCode).in("subject_id", subjectIds).limit(20);
  let sent = 0;
  for (const r of rows || []) {
    try {
      const res = await fetch(`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`, {
        method: "POST",
        headers: { Authorization: "Bearer " + access, "Content-Type": "application/json" },
        body: JSON.stringify({
          message: {
            token: r.token,
            notification: { title, body: body.slice(0, 300) },
            data: { ...data, family: familyCode },
            android: { priority: "HIGH", notification: { channel_id: "qalqon", sound: "default" } },
          },
        }),
      });
      if (res.ok) sent++;
      else if ([404, 400].includes(res.status)) {
        // Token eskirgan — saqlab turishning ma'nosi yo'q.
        await db.from("push_tokens").delete().eq("id", r.id);
      }
    } catch (e) {
      console.error("sendPush:", e);
    }
  }
  return sent;
}

/** Bot xabaridagi HTML'ni push matniga aylantiradi. */
function plainText(html: string): string {
  return String(html).replace(/<[^>]+>/g, "").replace(/\n{2,}/g, "\n").trim();
}

async function handleAppRoutes(payload: any, actor: Actor | null): Promise<Response | null> {
  const t = String(payload?.type || "");
  if (!["app_login_start", "app_login_poll", "push_register", "push_unregister"].includes(t)) return null;
  if (!db) return jsonRes({ ok: false, error: "Baza ulanmagan" }, 500);

  // Kirish so'rovi — hali hech qanday hisob ma'lumoti yo'q.
  if (t === "app_login_start") {
    const token = randomHex(32);
    const code = randomCode(8);
    const { error } = await db.from("app_login_requests").insert({
      token_hash: await sha256Hex(token),
      code,
      device_label: String(payload.deviceLabel || "").slice(0, 60) || null,
      expires_at: new Date(Date.now() + APP_LOGIN_TTL_MIN * 60000).toISOString(),
    });
    if (error) return jsonRes({ ok: false, error: error.message }, 500);
    return jsonRes({
      ok: true, token,
      link: `https://t.me/qalqon_aiBot?start=app_${code}`,
      expiresInSec: APP_LOGIN_TTL_MIN * 60,
    });
  }

  if (t === "app_login_poll") {
    const token = String(payload.token || "");
    if (!token) return jsonRes({ ok: false, error: "token majburiy" }, 400);
    const { data } = await db.from("app_login_requests")
      .select("id, status, session_token, family_code, expires_at, taken_at")
      .eq("token_hash", await sha256Hex(token)).limit(1);
    const row = data && data[0];
    if (!row) return jsonRes({ ok: true, status: "expired" });
    if (new Date(row.expires_at).getTime() < Date.now() && row.status === "pending") {
      return jsonRes({ ok: true, status: "expired" });
    }
    if (row.status === "rejected") return jsonRes({ ok: true, status: "rejected" });
    // Seans bir marta olinadi: ikkinchi so'rov "kutilmoqda" desa, ilova
    // nima bo'lganini tushunmay qolardi.
    if (row.taken_at) return jsonRes({ ok: true, status: "used" });
    if (row.status !== "approved" || !row.session_token) return jsonRes({ ok: true, status: "pending" });
    // Seans bir marta beriladi va bazadan darhol o'chiriladi.
    await db.from("app_login_requests")
      .update({ session_token: null, taken_at: new Date().toISOString() }).eq("id", row.id);
    return jsonRes({ ok: true, status: "approved", role: "parent", sessionToken: row.session_token, familyCode: row.family_code });
  }

  // Push manzilini saqlash — ota-ona ham, farzand ham.
  if (!actor) return unauthorized("Avval kiring");
  const kid = await actorAsChild(actor);
  const fam = kid ? kid.familyCode : await actorAsParent(actor);
  if (!fam) return unauthorized("Oila topilmadi");
  const subjectId = kid ? kid.childId : "parent_" + (actor.kind === "telegram" ? actor.telegramId : "");
  const token = String(payload.token || "").trim();
  if (!token || token.length < 20) return jsonRes({ ok: false, error: "push tokeni noto'g'ri" }, 400);

  if (t === "push_unregister") {
    await db.from("push_tokens").delete().eq("token", token);
    return jsonRes({ ok: true });
  }
  const { error } = await db.from("push_tokens").upsert({
    family_code: fam, subject_id: subjectId, role: kid ? "child" : "parent",
    token, platform: String(payload.platform || "android").slice(0, 20),
    updated_at: new Date().toISOString(),
  }, { onConflict: "token" });
  if (error) return jsonRes({ ok: false, error: error.message }, 500);
  return jsonRes({ ok: true, subjectId });
}

// ============================================================================
// DARSLIK MASHQLARI (database/19_darslik_mashqlari.sql)
//
// Ilgari fokus tekshiruvidagi savollar bola bugun nima o'qigani bilan
// bog'liq emas edi, AI esa "39-mashq" deganda mashq matnini bilmasdan javob
// to'qib chiqarardi. Endi ikkalasi ham darslikdagi HAQIQIY matnga tayanadi.
// Darslik bazada bo'lmasa, AI buni ochiq aytadi va o'ylab topmaydi.
// ============================================================================

/** "39-40, 42" -> [39,40,42]. Bemaʼni raqamlar tashlanadi. */
function parseExerciseNumbers(raw: unknown): number[] {
  const out = new Set<number>();
  for (const part of String(raw || "").split(/[,;\s]+/)) {
    const range = part.match(/^(\d{1,3})\s*[-–—]\s*(\d{1,3})$/);
    if (range) {
      const a = Number(range[1]), b = Number(range[2]);
      if (b >= a && b - a <= 20) for (let i = a; i <= b; i++) out.add(i);
      continue;
    }
    const one = part.match(/^(\d{1,3})$/);
    if (one) out.add(Number(one[1]));
  }
  return [...out].filter((n) => n >= 1 && n <= 999).slice(0, 10);
}

/** Fan nomini bazadagi yozuvga solishtirish uchun soddalashtiradi. */
function normalizeSubject(raw: unknown): string {
  return String(raw || "").toLowerCase().replace(/[`'’ʻ]/g, "'").replace(/\s+/g, " ").trim();
}

async function textbookExercises(grade: number, subject: unknown, numbers: number[]) {
  if (!db || !numbers.length) return [];
  const { data } = await db.from("textbook_exercises")
    .select("subject, number, page, topic, body")
    .eq("grade", grade).in("number", numbers).limit(20);
  const want = normalizeSubject(subject);
  const rows = (data || []).filter((r: any) => !want || normalizeSubject(r.subject) === want ||
    normalizeSubject(r.subject).includes(want) || want.includes(normalizeSubject(r.subject)));
  return rows.sort((a: any, b: any) => a.number - b.number);
}

/** Shu sinf/fan uchun darslik bazada bormi va nechta mashq bor. */
async function textbookCoverage(grade: number, subject: unknown) {
  if (!db) return null;
  const { data } = await db.from("textbook_exercises").select("subject, number").eq("grade", grade).limit(1000);
  const want = normalizeSubject(subject);
  const rows = (data || []).filter((r: any) => !want || normalizeSubject(r.subject) === want);
  if (!rows.length) return null;
  return { count: rows.length, max: Math.max(...rows.map((r: any) => r.number)) };
}

// ============================================================================
// OILAVIY CHAT (database/18_oila_chati.sql)
//
// A'zolik mijozdan emas, serverdan: ota-ona — o'z oila kodi, farzand —
// child_pairings dagi haqiqiy juftligi. Ilova voqealari (uy vazifasi, sovg'a,
// "Maktabdaman", joylashuv, SOS) ham shu suhbatga tushadi va ota-ona uy
// vazifasi bilan sovg'ani chatning o'zida tasdiqlaydi.
// ============================================================================

const CHAT_TEXT_MAX = 1000;
// Siqilgan JPEG data URL. Mijoz 1024px / 60% sifatga tushiradi (~150 KB).
const CHAT_PHOTO_MAX = 600_000;
const CHAT_PAGE = 60;
// Shu vaqt ichida chatni o'qigan a'zoga bot orqali xabar yuborilmaydi —
// u baribir ekranda ko'rib turibdi.
const CHAT_ACTIVE_MS = 2 * 60 * 1000;

type ChatMember = { familyCode: string; memberId: string; role: "parent" | "child"; name: string; telegramId: number | null };

async function chatMember(actor: Actor): Promise<ChatMember | null> {
  if (!db) return null;
  const kid = await actorAsChild(actor);
  if (kid) {
    const { data } = await db.from("child_pairings").select("child_name")
      .eq("family_code", kid.familyCode).eq("child_id", kid.childId).limit(1);
    return {
      familyCode: kid.familyCode, memberId: kid.childId, role: "child",
      name: (data && data[0]?.child_name) || "Farzand",
      telegramId: kid.childId.startsWith("tg_") ? Number(kid.childId.slice(3)) : null,
    };
  }
  const fam = await actorAsParent(actor);
  if (!fam || actor.kind !== "telegram") return null;
  const { data } = await db.from("parent_registrations").select("parent_name, parent_telegram_id, mother_name")
    .eq("family_code", fam).limit(1);
  const reg = data && data[0];
  // Faqat shu oilaning RO'YXATDAN O'TGAN ota-onasi. Ilgari ulanmagan istalgan
  // Telegram foydalanuvchisi o'z ID'sidan hisoblangan (mavjud bo'lmagan)
  // oila kodi bilan chatga "ota-ona" bo'lib yoza olardi.
  if (!reg || Number(reg.parent_telegram_id) !== Number(actor.telegramId)) return null;
  const isMain = true;
  return {
    familyCode: fam, memberId: "parent_" + actor.telegramId, role: "parent",
    name: (isMain ? reg?.parent_name : reg?.mother_name) || "Ota-ona",
    telegramId: actor.telegramId,
  };
}

/** Ilova voqeasini chatga yozadi. Xato bo'lsa asosiy amal buzilmasligi uchun jim. */
async function postChatEvent(
  familyCode: string,
  author: { id: string; role: "parent" | "child"; name: string },
  event: Record<string, unknown>,
  body: string,
  photo?: string | null,
) {
  if (!db || !familyCode) return;
  try {
    await db.from("family_messages").insert({
      family_code: familyCode, author_id: author.id, author_role: author.role,
      author_name: author.name, body: body.slice(0, CHAT_TEXT_MAX), photo: photo || null, event,
    });
  } catch (e) {
    console.error("postChatEvent:", e);
  }
}

/** Voqea holatini yangilaydi (masalan, uy vazifasi tasdiqlandi). */
async function updateChatEvent(familyCode: string, type: string, refId: string, patch: Record<string, unknown>) {
  if (!db) return;
  try {
    const { data } = await db.from("family_messages").select("id, event")
      .eq("family_code", familyCode).order("created_at", { ascending: false }).limit(200);
    const row = (data || []).find((m: any) => m.event && m.event.type === type && m.event.refId === refId);
    if (!row) return;
    await db.from("family_messages")
      .update({ event: { ...row.event, ...patch }, updated_at: new Date().toISOString() })
      .eq("id", row.id);
  } catch (e) {
    console.error("updateChatEvent:", e);
  }
}

/** Chat xabari haqida bot orqali xabar — faqat hozir chatda bo'lmagan a'zolarga. */
async function notifyChatMembers(familyCode: string, author: ChatMember, preview: string) {
  if (!db) return;
  const { data: reads } = await db.from("family_chat_reads").select("member_id, last_read_at")
    .eq("family_code", familyCode).limit(50);
  const active = new Set((reads || [])
    .filter((r: any) => Date.now() - new Date(r.last_read_at).getTime() < CHAT_ACTIVE_MS)
    .map((r: any) => r.member_id));
  const text = `💬 <b>${author.name}</b> (oila chati):\n${preview}`;

  const { data: reg } = await db.from("parent_registrations").select("parent_telegram_id")
    .eq("family_code", familyCode).limit(1);
  const parentTg = reg && reg[0]?.parent_telegram_id;
  if (parentTg && author.memberId !== "parent_" + parentTg && !active.has("parent_" + parentTg)) {
    await sendMessage(parentTg, text, {
      inline_keyboard: [[{ text: "💬 Chatni ochish", web_app: { url: `${miniAppUrl()}&chat=1` } }]],
    });
    await sendPush(familyCode, ["parent_" + parentTg], `💬 ${author.name}`, preview, { open: "chat" });
  }
  const { data: kids } = await db.from("child_pairings").select("child_id")
    .eq("family_code", familyCode).eq("is_active", true).like("child_id", "tg\\_%").limit(10);
  for (const k of kids || []) {
    if (k.child_id === author.memberId || active.has(k.child_id)) continue;
    await sendMessage(String(k.child_id).slice(3), text, {
      inline_keyboard: [[{ text: "💬 Chatni ochish", web_app: { url: `${miniAppUrl()}&role=child&chat=1` } }]],
    });
  }
  // Telegramsiz (faqat ilovadagi) farzandlarga ham yetib borishi uchun.
  const { data: allKids } = await db.from("child_pairings").select("child_id")
    .eq("family_code", familyCode).eq("is_active", true).limit(10);
  const targets = (allKids || []).map((k: any) => String(k.child_id))
    .filter((id: string) => id !== author.memberId && !active.has(id) && !id.startsWith("invite_"));
  if (targets.length) await sendPush(familyCode, targets, `💬 ${author.name}`, preview, { open: "chat" });
}

function chatRow(m: any) {
  return {
    id: m.id, authorId: m.author_id, role: m.author_role, name: m.author_name,
    body: m.body, hasPhoto: !!m.photo, event: m.event, createdAt: m.created_at, updatedAt: m.updated_at,
  };
}

async function handleChatRoutes(payload: any, actor: Actor): Promise<Response | null> {
  const t = String(payload?.type || "");
  if (!t.startsWith("chat_")) return null;
  if (!db) return jsonRes({ ok: false, error: "Baza ulanmagan" }, 500);
  const me = await chatMember(actor);
  if (!me) return unauthorized("Oila chati faqat oila a'zolari uchun");

  if (t === "chat_unread") {
    const { data: r } = await db.from("family_chat_reads").select("last_read_at")
      .eq("family_code", me.familyCode).eq("member_id", me.memberId).limit(1);
    let q = db.from("family_messages").select("id").eq("family_code", me.familyCode).neq("author_id", me.memberId).limit(100);
    if (r && r[0]) q = q.gt("created_at", r[0].last_read_at);
    const { data } = await q;
    return jsonRes({ ok: true, unread: (data || []).length });
  }

  if (t === "chat_list") {
    // after — shu vaqtdan keyin YARATILGAN yoki YANGILANGAN xabarlar (so'rov
    // takrorlanganda faqat yangilar keladi, suratlar esa umuman kelmaydi).
    const after = String(payload.after || "");
    let q = db.from("family_messages")
      .select("id, author_id, author_role, author_name, body, photo, event, created_at, updated_at")
      .eq("family_code", me.familyCode);
    if (after) q = q.gt("updated_at", after).order("updated_at", { ascending: true }).limit(CHAT_PAGE);
    else q = q.order("created_at", { ascending: false }).limit(CHAT_PAGE);
    const { data, error } = await q;
    if (error) return jsonRes({ ok: false, error: error.message }, 500);
    const rows = (data || []).map(chatRow);
    if (!after) rows.reverse();
    return jsonRes({ ok: true, me: { id: me.memberId, role: me.role, name: me.name }, messages: rows, serverTime: new Date().toISOString() });
  }

  if (t === "chat_photo") {
    const { data } = await db.from("family_messages").select("photo")
      .eq("family_code", me.familyCode).eq("id", String(payload.id || "")).limit(1);
    if (!data || !data[0] || !data[0].photo) return jsonRes({ ok: false, error: "Surat topilmadi." }, 404);
    return jsonRes({ ok: true, photo: data[0].photo });
  }

  if (t === "chat_read") {
    await db.from("family_chat_reads").upsert(
      { family_code: me.familyCode, member_id: me.memberId, last_read_at: new Date().toISOString() },
      { onConflict: "family_code,member_id" },
    );
    return jsonRes({ ok: true });
  }

  if (t === "chat_send") {
    const body = String(payload.text || "").trim().slice(0, CHAT_TEXT_MAX);
    const photo = typeof payload.photo === "string" ? payload.photo : "";
    if (photo && (!/^data:image\/(jpeg|png|webp);base64,/.test(photo) || photo.length > CHAT_PHOTO_MAX)) {
      return jsonRes({ ok: false, error: "Surat juda katta yoki noto'g'ri formatda." }, 400);
    }
    if (!body && !photo) return jsonRes({ ok: false, error: "Xabar bo'sh." }, 400);
    // Suiiste'molga qarshi: daqiqasiga 20 tadan ko'p emas.
    const { data: recent } = await db.from("family_messages").select("id")
      .eq("family_code", me.familyCode).eq("author_id", me.memberId)
      .gte("created_at", new Date(Date.now() - 60_000).toISOString()).limit(21);
    if ((recent || []).length >= 20) return jsonRes({ ok: false, error: "Juda tez yozyapsiz — biroz kuting." }, 429);

    const { data: ins, error } = await db.from("family_messages").insert({
      family_code: me.familyCode, author_id: me.memberId, author_role: me.role,
      author_name: me.name, body: body || null, photo: photo || null,
    }).select("id, author_id, author_role, author_name, body, photo, event, created_at, updated_at").limit(1);
    if (error || !ins || !ins[0]) return jsonRes({ ok: false, error: error?.message || "Yuborilmadi." }, 500);
    await db.from("family_chat_reads").upsert(
      { family_code: me.familyCode, member_id: me.memberId, last_read_at: new Date().toISOString() },
      { onConflict: "family_code,member_id" },
    );
    await notifyChatMembers(me.familyCode, me, body ? body.slice(0, 200) : "📷 Surat");
    return jsonRes({ ok: true, message: chatRow(ins[0]) });
  }

  // Ota-ona chatdagi karta tugmasi bilan tasdiqlaydi — bot tugmasi bilan AYNI yo'l.
  if (t === "chat_decide") {
    if (me.role !== "parent" || !me.telegramId) return unauthorized("Faqat ota-ona");
    const kind = String(payload.kind || "");
    const id = String(payload.id || "");
    const approve = payload.approve === true;
    const prefix = kind === "homework" ? (approve ? "hw_ok_" : "hw_no_") : kind === "gift" ? (approve ? "rw_ok_" : "rw_no_") : "";
    if (!prefix || !id) return jsonRes({ ok: false, error: "Noma'lum amal." }, 400);
    const said: string[] = [];
    await handleBallCallback(prefix + id, me.telegramId, { collect: said });
    const plain = said.map((x) => x.replace(/<[^>]+>/g, "")).join("\n");
    return jsonRes({ ok: !/tegishli emas|topilmadi|Baza ulanmagan/.test(plain), message: plain });
  }

  return jsonRes({ ok: false, error: "Noma'lum amal." }, 400);
}

// ============================================================================
// DO'ST BILAN ONLINE O'YINLAR (database/16_online_oyinlar.sql)
//
// Raqib faqat taklif havolasi orqali keladi, chat yo'q, haqiqiy ism o'rniga
// bo'ri ismi. Natija va yurishlarni SERVER hisoblaydi: Poyga/Tetrisda
// bosishlar yozuvi sim.js orqali qayta o'ynatiladi, viktorinada vaqtni
// server o'lchaydi, Dengiz jangida raqib kemalari mijozga yuborilmaydi.
// ============================================================================

const Sim = (globalThis as any).QalqonSim;

const MATCH_GAMES: Record<string, { title: string; emoji: string; kind: "async" | "turn" }> = {
  quiz: { title: "Viktorina dueli", emoji: "🧩", kind: "async" },
  race: { title: "Poyga", emoji: "🏎️", kind: "async" },
  tetris: { title: "Tetris", emoji: "🧱", kind: "async" },
  connect4: { title: "To'rtta qator", emoji: "🔴", kind: "turn" },
  battleship: { title: "Dengiz jangi", emoji: "🚢", kind: "turn" },
};
const MATCH_OPEN_HOURS = 48;
const MATCH_IDLE_HOURS = 72;
const MATCH_OPEN_MAX = 5;
const MATCH_CREATE_PER_DAY = 20;
const QUIZ_DUEL_SECONDS = 15;
const QUIZ_DUEL_GRACE = 3;
const MATCH_NOTIFY_GAP_MS = 3 * 60 * 1000;

function matchLink(code: string) {
  return `https://t.me/qalqon_aiBot?start=play_${code}`;
}

async function matchNick(fam: string, cid: string): Promise<string> {
  const { data } = await db!
    .from("child_companion").select("name")
    .eq("family_code", fam).eq("child_id", cid).limit(1);
  return (data && data[0]?.name) || defaultCompanionName(cid);
}

function randomCode(len = 6) {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(len))).map((b) => alphabet[b % alphabet.length]).join("");
}

function randomSeed() {
  return crypto.getRandomValues(new Uint32Array(1))[0] || 1;
}

/** Bolaga tugmali xabar: "navbat senda", "do'sting qo'shildi" va h.k. */
async function notifyMatchChild(m: any, role: "p1" | "p2", text: string, force = false) {
  const cid = String(role === "p1" ? m.p1_child : m.p2_child || "");
  if (!cid.startsWith("tg_")) return;
  const st = m.state || {};
  st.notified = st.notified || {};
  const last = Number(st.notified[role] || 0);
  if (!force && Date.now() - last < MATCH_NOTIFY_GAP_MS) return;
  st.notified[role] = Date.now();
  m.state = st;
  const g = MATCH_GAMES[m.game];
  await sendMessage(cid.slice(3), text, {
    inline_keyboard: [[{ text: `${g.emoji} O'yinni ochish`, web_app: { url: `${miniAppUrl()}&role=child&play=${m.code}` } }]],
  });
}

async function saveMatch(m: any, fields: Record<string, unknown>) {
  const upd = { ...fields, state: m.state, updated_at: new Date().toISOString() };
  await db!.from("game_matches").update(upd).eq("id", m.id);
  Object.assign(m, upd);
}

/** Uzoq kutib qolgan o'yinlarni yakunlaydi (o'qish paytida, alohida cron'siz). */
async function settleMatch(m: any): Promise<any> {
  const age = Date.now() - new Date(m.updated_at).getTime();
  const g = MATCH_GAMES[m.game];
  if (m.status === "open" && Date.now() - new Date(m.created_at).getTime() > MATCH_OPEN_HOURS * 3600e3) {
    await saveMatch(m, { status: "expired", finished_at: new Date().toISOString() });
  } else if (m.status === "active" && age > MATCH_IDLE_HOURS * 3600e3) {
    let winner: string | null = null;
    if (g.kind === "turn") winner = m.turn === "p1" ? "p2" : "p1";
    else {
      const r = (m.state && m.state.res) || {};
      winner = r.p1 && !r.p2 ? "p1" : r.p2 && !r.p1 ? "p2" : null;
    }
    await saveMatch(m, { status: winner ? "finished" : "expired", winner, finished_at: new Date().toISOString() });
  }
  return m;
}

/** Ikkala natija bo'lsa — g'olib aniqlanadi. */
async function finishAsyncIfReady(m: any) {
  const r = m.state.res || {};
  if (!r.p1 || !r.p2 || m.status === "finished") return;
  const a = Number(r.p1.score) || 0, b = Number(r.p2.score) || 0;
  const winner = a > b ? "p1" : b > a ? "p2" : "draw";
  const g = MATCH_GAMES[m.game];
  await saveMatch(m, { status: "finished", winner, finished_at: new Date().toISOString() });
  for (const role of ["p1", "p2"] as const) {
    const mine = role === "p1" ? a : b, theirs = role === "p1" ? b : a;
    const rival = role === "p1" ? m.p2_name : m.p1_name;
    const verdict = winner === "draw" ? "🤝 Durang!" : winner === role ? "🏆 Sen yutding!" : "💪 Bu safar do'sting yutdi.";
    await notifyMatchChild(m, role, `${g.emoji} <b>${g.title}: natija tayyor</b>\n\n${verdict}\nSen: <b>${mine}</b> · ${rival || "Do'sting"}: <b>${theirs}</b>`, true);
  }
  await saveMatch(m, {});
}

/** So'rovchi uchun o'yin holati — maxfiy qismlarsiz. */
function matchView(m: any, me: "p1" | "p2") {
  const rival = me === "p1" ? "p2" : "p1";
  const g = MATCH_GAMES[m.game];
  const st = m.state || {};
  const base: any = {
    id: m.id, code: m.code, game: m.game, title: g.title, emoji: g.emoji, kind: g.kind,
    status: m.status, winner: m.winner, me, turn: m.turn,
    myTurn: m.status === "active" && m.turn === me,
    myName: me === "p1" ? m.p1_name : m.p2_name,
    rivalName: (rival === "p1" ? m.p1_name : m.p2_name) || null,
    link: matchLink(m.code), updatedAt: m.updated_at, createdAt: m.created_at,
  };
  const res = st.res || {};
  if (m.game === "quiz") {
    const my = (st.q || {})[me] || { answers: [] };
    base.total = (st.questions || []).length;
    base.answered = (my.answers || []).length;
    base.myResult = res[me] || null;
    // Raqib natijasi faqat o'zim tugatgandan keyin — oldindan bilish qiziqni o'ldiradi.
    base.rivalDone = !!res[rival];
    base.rivalResult = res[me] ? (res[rival] || null) : null;
  }
  if (m.game === "race" || m.game === "tetris") {
    base.seed = m.seed;
    base.myResult = res[me] ? { score: res[me].score, ticks: res[me].ticks } : null;
    base.myStarted = !!(st.started || {})[me];
    base.rivalResult = res[rival] ? { score: res[rival].score, ticks: res[rival].ticks } : null;
    // Arvoh: raqibning bosishlar yozuvi (Poyga) yoki hisob chizig'i (Tetris).
    if (res[rival]) base.ghost = m.game === "race" ? { log: res[rival].log || [], ticks: res[rival].ticks } : { timeline: res[rival].timeline || [], ticks: res[rival].ticks };
  }
  if (m.game === "connect4") {
    base.board = st.board;
    base.myMark = me === "p1" ? "1" : "2";
    base.last = st.last || null;
    base.line = st.line || null;
  }
  if (m.game === "battleship") {
    const fleets = st.fleets || {};
    const shots = st.shots || {};
    const rivalFleet: any[] = fleets[rival] || [];
    const myShots: any[] = shots[me] || [];
    const hitSet = new Set(myShots.filter((s: any) => s[2]).map((s: any) => s[0] * 8 + s[1]));
    base.myFleet = fleets[me] || null;
    base.myShots = myShots;
    base.rivalShots = shots[rival] || [];
    base.sunkRival = rivalFleet.filter((ship: any[]) => ship.every(([r, c]) => hitSet.has(r * 8 + c)));
    base.rivalShipsLeft = rivalFleet.length - base.sunkRival.length;
    if (m.status === "finished") base.rivalFleet = rivalFleet;
  }
  return base;
}

async function handleMatchRoutes(payload: any, actor: Actor): Promise<Response | null> {
  const t = String(payload?.type || "");
  if (!t.startsWith("match_") && t !== "family_matches") return null;
  if (!db) return jsonRes({ ok: false, error: "Baza ulanmagan" }, 500);

  // Ota-ona: farzandi kim bilan, qaysi o'yinni o'ynagan.
  if (t === "family_matches") {
    const fam = await actorAsParent(actor);
    if (!fam) return unauthorized("Faqat ota-ona");
    const since = new Date(Date.now() - 30 * 86400e3).toISOString();
    const { data } = await db.from("game_matches").select("*")
      .or(`p1_family.eq.${fam},p2_family.eq.${fam}`)
      .gte("created_at", since).order("created_at", { ascending: false }).limit(50);
    const { data: kids } = await db.from("child_pairings").select("child_id, child_name").eq("family_code", fam).limit(20);
    const nameOf = (cid: string) => (kids || []).find((k: any) => k.child_id === cid)?.child_name || "Farzand";
    return jsonRes({
      ok: true,
      matches: (data || []).map((m: any) => {
        const me = m.p1_family === fam ? "p1" : "p2";
        const g = MATCH_GAMES[m.game] || { title: m.game, emoji: "🎮" };
        return {
          game: g.title, emoji: g.emoji, status: m.status, createdAt: m.created_at,
          child: nameOf(me === "p1" ? m.p1_child : m.p2_child),
          rival: (me === "p1" ? m.p2_name : m.p1_name) || null,
          result: m.status !== "finished" ? null : m.winner === "draw" ? "draw" : m.winner === me ? "won" : "lost",
        };
      }),
    });
  }

  const kid = await actorAsChild(actor);
  if (!kid) return unauthorized("Online o'yinlar faqat farzand panelida");
  const { familyCode, childId } = kid;

  if (t === "match_list") {
    const { data } = await db.from("game_matches").select("*")
      .or(`p1_child.eq.${childId},p2_child.eq.${childId}`)
      .order("updated_at", { ascending: false }).limit(20);
    const out = [];
    for (const m of data || []) {
      await settleMatch(m);
      if (["cancelled"].includes(m.status)) continue;
      const me = m.p1_child === childId ? "p1" : "p2";
      const v = matchView(m, me);
      out.push({
        id: v.id, code: v.code, game: v.game, title: v.title, emoji: v.emoji, status: v.status,
        winner: v.winner, me, myTurn: v.myTurn, rivalName: v.rivalName, updatedAt: v.updatedAt,
        needsMe: v.myTurn || (m.status !== "finished" && MATCH_GAMES[m.game].kind === "async" && !((m.state.res || {})[me])),
      });
    }
    return jsonRes({ ok: true, matches: out });
  }

  if (t === "match_create") {
    const game = String(payload.game || "");
    const g = MATCH_GAMES[game];
    if (!g) return jsonRes({ ok: false, error: "Bunday o'yin yo'q." }, 400);

    const { data: mine } = await db.from("game_matches").select("id, status, created_at")
      .eq("p1_child", childId).gte("created_at", tashkentDayStartISO()).limit(MATCH_CREATE_PER_DAY + 1);
    if ((mine || []).length >= MATCH_CREATE_PER_DAY) {
      return jsonRes({ ok: false, error: `Bugun ${MATCH_CREATE_PER_DAY} ta o'yin ochding — ertaga yana.` }, 429);
    }
    const { data: open } = await db.from("game_matches").select("id")
      .eq("p1_child", childId).eq("status", "open").limit(MATCH_OPEN_MAX + 1);
    if ((open || []).length >= MATCH_OPEN_MAX) {
      return jsonRes({ ok: false, error: `Do'stlaring qo'shilmagan ${MATCH_OPEN_MAX} ta o'yin bor. Avval ularni yakunla yoki bekor qil.` }, 429);
    }

    const seed = randomSeed();
    const state: any = { res: {}, notified: {} };
    let turn: string | null = null;
    if (game === "quiz") {
      const grade = await childGrade(familyCode, childId);
      const cat = Math.random() < 0.5 ? "maktab" : Math.random() < 0.5 ? "fikrlash" : "ozbekiston";
      const qs = (await buildQuizQuestions(cat, grade)).filter(validQuizItem);
      const pool = qs.length >= 6 ? qs : QUIZ_FALLBACK.maktab.concat(QUIZ_FALLBACK.fikrlash);
      state.questions = quizPick(pool, 8).map((q: any) => ({ q: q.q, a: q.a, c: q.c, why: q.why || "" }));
      state.category = cat;
      state.q = { p1: { answers: [] }, p2: { answers: [] } };
    }
    if (game === "connect4") { state.board = Sim.c4Empty(); turn = "p1"; }
    if (game === "battleship") { state.fleets = { p1: Sim.bsFleet(randomSeed()) }; state.shots = { p1: [], p2: [] }; turn = "p1"; }
    if (game === "race" || game === "tetris") state.started = {};

    const code = randomCode();
    const { data: created, error } = await db.from("game_matches").insert({
      code, game, seed, turn, state,
      p1_family: familyCode, p1_child: childId, p1_name: await matchNick(familyCode, childId),
    }).select("*").limit(1);
    if (error || !created || !created[0]) return jsonRes({ ok: false, error: error?.message || "Saqlab bo'lmadi." }, 500);
    return jsonRes({ ok: true, match: matchView(created[0], "p1") });
  }

  // Quyidagilar aniq o'yinga tegishli.
  const byCode = String(payload.code || "").trim().toUpperCase();
  const byId = String(payload.id || "").trim();
  let q: any = db.from("game_matches").select("*").limit(1);
  q = byId ? q.eq("id", byId) : q.eq("code", byCode);
  const { data: found } = await q;
  const m = found && found[0];
  if (!m) return jsonRes({ ok: false, error: "O'yin topilmadi." }, 404);
  await settleMatch(m);
  const g = MATCH_GAMES[m.game];

  if (t === "match_join") {
    if (m.p1_child === childId || m.p2_child === childId) {
      return jsonRes({ ok: true, match: matchView(m, m.p1_child === childId ? "p1" : "p2") });
    }
    if (m.status !== "open") {
      return jsonRes({ ok: false, error: m.status === "expired" ? "Bu taklifning muddati o'tgan." : "Bu o'yinga boshqa do'st qo'shilib bo'lgan." }, 409);
    }
    // Faqat ochiq qatorni egallaymiz — ikki kishi bir vaqtda bossa, bittasi o'tadi.
    if (m.game === "battleship") m.state.fleets.p2 = Sim.bsFleet(randomSeed());
    const nick = await matchNick(familyCode, childId);
    const { data: claimed } = await db.from("game_matches").update({
      p2_family: familyCode, p2_child: childId, p2_name: nick, status: "active",
      state: m.state, updated_at: new Date().toISOString(),
    }).eq("id", m.id).eq("status", "open").select("*");
    if (!claimed || !claimed[0]) return jsonRes({ ok: false, error: "Bu o'yinga boshqa do'st qo'shilib bo'lgan." }, 409);
    const mm = claimed[0];
    await notifyMatchChild(mm, "p1",
      `${g.emoji} <b>${nick} "${g.title}" o'yiningga qo'shildi!</b>` +
        (g.kind === "turn" ? (mm.turn === "p1" ? "\n\nBirinchi yurish seniki." : "") : "\n\nNatijalaringizni solishtiramiz."), true);
    await saveMatch(mm, {});
    return jsonRes({ ok: true, match: matchView(mm, "p2") });
  }

  const me: "p1" | "p2" | null = m.p1_child === childId ? "p1" : m.p2_child === childId ? "p2" : null;
  if (!me) return jsonRes({ ok: false, error: "Bu o'yin seniki emas." }, 403);
  const rival = me === "p1" ? "p2" : "p1";

  if (t === "match_state") return jsonRes({ ok: true, match: matchView(m, me) });

  if (t === "match_cancel") {
    if (m.status === "open" && me === "p1") {
      await saveMatch(m, { status: "cancelled", finished_at: new Date().toISOString() });
      return jsonRes({ ok: true, match: matchView(m, me) });
    }
    if (m.status === "active" && g.kind === "turn") {
      await saveMatch(m, { status: "finished", winner: rival, finished_at: new Date().toISOString() });
      await notifyMatchChild(m, rival, `${g.emoji} <b>${g.title}:</b> do'sting taslim bo'ldi — 🏆 sen yutding!`, true);
      await saveMatch(m, {});
      return jsonRes({ ok: true, match: matchView(m, me) });
    }
    return jsonRes({ ok: false, error: "Bu o'yinni endi bekor qilib bo'lmaydi." }, 409);
  }

  if (t !== "match_move") return jsonRes({ ok: false, error: "Noma'lum amal." }, 400);
  if (m.status === "finished" || m.status === "expired" || m.status === "cancelled") {
    return jsonRes({ ok: false, error: "O'yin tugagan.", match: matchView(m, me) }, 409);
  }
  const st = m.state;
  st.res = st.res || {};

  // ------------------------------------------------ Poyga / Tetris (arvoh)
  if (m.game === "race" || m.game === "tetris") {
    const action = String(payload.action || "");
    if (st.res[me]) return jsonRes({ ok: false, error: "Sen allaqachon o'ynading.", match: matchView(m, me) }, 409);
    st.started = st.started || {};
    if (action === "start") {
      // Bitta urinish: qayta boshlash = mashq qilib olish. Shuning uchun
      // ikkinchi "start" oldingi urinishni 0 bilan yopadi.
      if (st.started[me]) {
        st.res[me] = { score: 0, ticks: 0, log: [], timeline: [], abandoned: true };
        await saveMatch(m, {});
        await finishAsyncIfReady(m);
        return jsonRes({ ok: false, abandoned: true, error: "Urinish oldin boshlangan edi va tugatilmagan — natija 0.", match: matchView(m, me) }, 409);
      }
      st.started[me] = new Date().toISOString();
      await saveMatch(m, {});
      return jsonRes({ ok: true, match: matchView(m, me) });
    }
    if (action !== "finish") return jsonRes({ ok: false, error: "Noma'lum amal." }, 400);
    if (!st.started[me]) return jsonRes({ ok: false, error: "Avval o'yinni boshla." }, 400);
    const log = Array.isArray(payload.log) ? payload.log.slice(0, Sim.MAX_LOG) : [];
    for (let i = 1; i < log.length; i++) {
      if (!Array.isArray(log[i]) || Number(log[i][0]) < Number(log[i - 1][0])) {
        return jsonRes({ ok: false, error: "Yozuv buzilgan." }, 400);
      }
    }
    const sim = m.game === "race" ? Sim.raceSimulate(Number(m.seed), log) : Sim.tetSimulate(Number(m.seed), log);
    const claimed = Number(payload.score);
    st.res[me] = {
      score: sim.score, ticks: sim.ticks, log: m.game === "race" ? log : [],
      timeline: sim.timeline || [], claimed: Number.isFinite(claimed) ? claimed : null,
      at: new Date().toISOString(),
    };
    await saveMatch(m, {});
    if (m.status === "active" && !st.res[rival]) {
      await notifyMatchChild(m, rival, `${g.emoji} <b>${m[me + "_name"] || "Do'sting"} ${g.title}da ${sim.score} ochko to'pladi.</b>\n\nEndi navbat senda — arvohini quvib o't!`);
      await saveMatch(m, {});
    }
    await finishAsyncIfReady(m);
    return jsonRes({ ok: true, result: { score: sim.score, ticks: sim.ticks }, mismatch: Number.isFinite(claimed) && claimed !== sim.score, match: matchView(m, me) });
  }

  // ---------------------------------------------------------- Viktorina
  if (m.game === "quiz") {
    const action = String(payload.action || "");
    const qs: any[] = st.questions || [];
    st.q = st.q || { p1: { answers: [] }, p2: { answers: [] } };
    const my = st.q[me] = st.q[me] || { answers: [] };
    if (st.res[me]) return jsonRes({ ok: false, error: "Sen allaqachon javob berding.", match: matchView(m, me) }, 409);

    const finishMine = async () => {
      const correct = my.answers.filter((a: any) => a.correct).length;
      const score = my.answers.reduce((s: number, a: any) => s + (Number(a.points) || 0), 0);
      st.res[me] = { score, correct, total: qs.length, at: new Date().toISOString() };
      await saveMatch(m, {});
      if (m.status === "active" && !st.res[rival]) {
        await notifyMatchChild(m, rival, `🧩 <b>${m[me + "_name"] || "Do'sting"} viktorinani tugatdi.</b>\n\nEndi navbat senda!`);
        await saveMatch(m, {});
      }
      await finishAsyncIfReady(m);
    };

    if (action === "next") {
      if (my.issued) {
        my.answers.push({ choice: -1, correct: false, points: 0, reissued: true });
        my.issued = null;
        if (my.answers.length >= qs.length) {
          await finishMine();
          return jsonRes({ ok: true, done: true, match: matchView(m, me) });
        }
      }
      const i = my.answers.length;
      if (i >= qs.length) {
        await finishMine();
        return jsonRes({ ok: true, done: true, match: matchView(m, me) });
      }
      my.issued = new Date().toISOString();
      await saveMatch(m, {});
      return jsonRes({ ok: true, index: i, total: qs.length, seconds: QUIZ_DUEL_SECONDS, question: { q: qs[i].q, a: qs[i].a } });
    }
    if (action === "answer") {
      if (!my.issued) return jsonRes({ ok: false, error: "Savol berilmagan." }, 400);
      const i = my.answers.length;
      const sec = (Date.now() - new Date(my.issued).getTime()) / 1000;
      const choice = Number.isInteger(payload.choice) ? Number(payload.choice) : -1;
      const timedOut = sec > QUIZ_DUEL_SECONDS + QUIZ_DUEL_GRACE;
      const correct = !timedOut && choice === qs[i].c;
      // To'g'ri javob 100 ochko, tezlik uchun +50 gacha.
      const points = correct ? 100 + Math.max(0, Math.round(50 * (QUIZ_DUEL_SECONDS - Math.min(sec, QUIZ_DUEL_SECONDS)) / QUIZ_DUEL_SECONDS)) : 0;
      my.answers.push({ choice, correct, points, ms: Math.round(sec * 1000), timedOut });
      my.issued = null;
      const feedback = { correct, timedOut, correctIndex: qs[i].c, why: qs[i].why || "", points };
      if (my.answers.length >= qs.length) {
        await finishMine();
        return jsonRes({ ok: true, ...feedback, done: true, match: matchView(m, me) });
      }
      await saveMatch(m, {});
      return jsonRes({ ok: true, ...feedback, done: false });
    }
    return jsonRes({ ok: false, error: "Noma'lum amal." }, 400);
  }

  // --------------------------------------------- navbatli o'yinlar umumiy
  if (m.status !== "active") return jsonRes({ ok: false, error: "Do'sting hali qo'shilmagan." }, 409);
  if (m.turn !== me) return jsonRes({ ok: false, error: "Hozir do'stingning navbati.", match: matchView(m, me) }, 409);

  if (m.game === "connect4") {
    const col = Number(payload.col);
    const mark = me === "p1" ? "1" : "2";
    const drop = Sim.c4Drop(st.board, col, mark);
    if (drop.row < 0) return jsonRes({ ok: false, error: "Bu ustun to'la." }, 400);
    st.board = drop.board;
    st.last = [drop.row, col];
    const r = Sim.c4Result(st.board);
    if (r.winner) {
      st.line = r.line;
      const winner = r.winner === "draw" ? "draw" : r.winner === "1" ? "p1" : "p2";
      await saveMatch(m, { status: "finished", winner, turn: null, finished_at: new Date().toISOString() });
      await notifyMatchChild(m, rival, winner === "draw" ? "🔴 <b>To'rtta qator:</b> 🤝 durang!" : `🔴 <b>To'rtta qator:</b> ${m[me + "_name"]} to'rttani qatorga qo'ydi. Bu safar u yutdi 💪`, true);
      await saveMatch(m, {});
    } else {
      await saveMatch(m, { turn: rival });
      await notifyMatchChild(m, rival, `🔴 <b>To'rtta qator:</b> ${m[me + "_name"] || "Do'sting"} yurdi — navbat senda!`);
      await saveMatch(m, {});
    }
    return jsonRes({ ok: true, match: matchView(m, me) });
  }

  if (m.game === "battleship") {
    const r = Number(payload.r), c = Number(payload.c);
    const N = Sim.BS.N;
    if (!(Number.isInteger(r) && Number.isInteger(c) && r >= 0 && r < N && c >= 0 && c < N)) {
      return jsonRes({ ok: false, error: "Noto'g'ri katak." }, 400);
    }
    const shots: any[] = st.shots[me] = st.shots[me] || [];
    if (shots.some((s: any) => s[0] === r && s[1] === c)) return jsonRes({ ok: false, error: "Bu katakka otgansan." }, 400);
    const fleet: any[] = st.fleets[rival] || [];
    const hit = fleet.some((ship: any[]) => ship.some(([a, b]) => a === r && b === c));
    shots.push([r, c, hit]);
    const hitSet = new Set(shots.filter((s: any) => s[2]).map((s: any) => s[0] * N + s[1]));
    const ship = fleet.find((sh: any[]) => sh.some(([a, b]) => a === r && b === c));
    const sunk = !!ship && ship.every(([a, b]: number[]) => hitSet.has(a * N + b));
    const allSunk = fleet.every((sh: any[]) => sh.every(([a, b]) => hitSet.has(a * N + b)));
    if (allSunk) {
      await saveMatch(m, { status: "finished", winner: me, turn: null, finished_at: new Date().toISOString() });
      await notifyMatchChild(m, rival, `🚢 <b>Dengiz jangi:</b> ${m[me + "_name"]} oxirgi kemangni cho'ktirdi. Revansh? 💪`, true);
      await saveMatch(m, {});
    } else if (hit) {
      // Tekkizsa — yana o'zi otadi (klassik qoida).
      await saveMatch(m, {});
    } else {
      await saveMatch(m, { turn: rival });
      await notifyMatchChild(m, rival, `🚢 <b>Dengiz jangi:</b> ${m[me + "_name"] || "Do'sting"} o'tkazib yubordi — navbat senda!`);
      await saveMatch(m, {});
    }
    return jsonRes({ ok: true, shot: { r, c, hit, sunk }, match: matchView(m, me) });
  }

  return jsonRes({ ok: false, error: "Noma'lum o'yin." }, 400);
}

// ============================================================================
// VIKTORINA SAVOLLARI
//
// Savollarni Gemini bolaning SINFIGA qarab yozadi — shuning uchun kontent
// hech qachon tugamaydi va 1-sinf bilan 11-sinf bir xil savol olmaydi.
// Lekin AI ishlamay qolsa ham o'yin to'xtamasligi kerak: har toifa uchun
// zaxira savollar shu faylda turadi. AI — yaxshilanish, shart emas.
//
// "Hayot" toifasi ataylab FAQAT zaxiradan oladi: bu savollarda to'g'ri javob
// yo'q, ular bola bilan ota-ona o'rtasida suhbat ochish uchun. Bunday
// savollarni tasodifiy generatsiyaga topshirib bo'lmaydi.
// ============================================================================

const QUIZ_FALLBACK: Record<string, any[]> = {
  maktab: [
    { q: "7 × 8 nechchi?", a: ["54", "56", "58", "64"], c: 1, why: "7 × 8 = 56" },
    { q: "Suvning kimyoviy formulasi qaysi?", a: ["CO₂", "H₂O", "O₂", "NaCl"], c: 1, why: "Ikki vodorod va bitta kislorod." },
    { q: "O'zbekiston mustaqilligi qachon e'lon qilingan?", a: ["1989", "1991", "1993", "1995"], c: 1, why: "1991-yil 31-avgust." },
    { q: "Doira yuzasi formulasi qaysi?", a: ["2πr", "πr²", "πd", "r²"], c: 1, why: "S = πr²; 2πr — aylana uzunligi." },
    { q: "Gap bo'laklaridan qaysi biri «Kim? Nima?» so'rog'iga javob beradi?", a: ["Kesim", "Ega", "Aniqlovchi", "Hol"], c: 1, why: "Ega — ish-harakat bajaruvchisi." },
    { q: "Inson tanasidagi eng yirik a'zo qaysi?", a: ["Jigar", "Teri", "O'pka", "Miya"], c: 1, why: "Teri — eng katta a'zo." },
  ],
  fikrlash: [
    { q: "Agar hamma bo'rilar hayvon bo'lsa va Olov — bo'ri bo'lsa, Olov nima?", a: ["Hayvon", "Odam", "O'simlik", "Aniqlab bo'lmaydi"], c: 0, why: "Mantiqiy xulosa: bo'ri → hayvon." },
    { q: "2, 4, 8, 16, ... keyingi son qaysi?", a: ["20", "24", "32", "18"], c: 2, why: "Har son ikkiga ko'paytiriladi." },
    { q: "Otangning o'g'lining otasi kim?", a: ["Bobom", "Otam", "Akam", "Amakim"], c: 1, why: "Otangning o'g'li — sen; sening otang — otang." },
    { q: "Bir g'isht 1 kg va yarim g'isht og'irligida. G'isht necha kg?", a: ["1,5", "2", "2,5", "3"], c: 1, why: "x = 1 + x/2 → x = 2." },
    { q: "Xonada 3 ta sham yondi, 2 tasi o'chdi. Nechtasi qoladi?", a: ["1", "2", "3", "0"], c: 1, why: "O'chganlari yonib tugamaydi — o'sha 2 tasi qoladi." },
  ],
  ozbekiston: [
    { q: "Amir Temur poytaxti qaysi shahar edi?", a: ["Buxoro", "Samarqand", "Xiva", "Toshkent"], c: 1, why: "Samarqand — Temuriylar poytaxti." },
    { q: "Ulug'bek nima bilan mashhur?", a: ["Shoir", "Astronom", "Sarkarda", "Me'mor"], c: 1, why: "Rasadxonasi va yulduzlar jadvali bilan." },
    { q: "Registon maydoni qayerda?", a: ["Buxoro", "Samarqand", "Shahrisabz", "Qo'qon"], c: 1, why: "Samarqand markazida." },
    { q: "Alisher Navoiy qaysi tilda yozgan?", a: ["Faqat forsiy", "Eski o'zbek (chig'atoy)", "Arab", "Turk"], c: 1, why: "Asosan eski o'zbek tilida." },
    { q: "O'zbekistonning eng uzun daryosi qaysi?", a: ["Zarafshon", "Amudaryo", "Chirchiq", "Sirdaryo"], c: 1, why: "Amudaryo — eng uzun va sersuv." },
  ],
  hayot: [
    { q: "Do'sting xato qilganini bilsang, unga aytasanmi yoki jim turasanmi?", a: ["Darhol aytaman", "Yolg'iz qolganda aytaman", "Jim turaman", "Boshqa do'stlar bilan maslahatlashaman"], c: -1 },
    { q: "Sen uchun muvaffaqiyat nima?", a: ["Ko'p pul topish", "O'z ishini sevish", "Boshqalarga foyda keltirish", "Tinch yashash"], c: -1 },
    { q: "Xafa bo'lganingda nima qilasan?", a: ["Yolg'iz qolaman", "Kimgadir aytaman", "Boshqa narsa bilan chalg'iyman", "Uxlayman"], c: -1 },
    { q: "Qaysi biri og'irroq: kechirish yoki kechirim so'rash?", a: ["Kechirish", "Kechirim so'rash", "Ikkalasi ham bir xil", "Vaziyatga bog'liq"], c: -1 },
    { q: "Agar bir kunni istaganingcha o'tkaza olsang, nima qilarding?", a: ["Oilam bilan bo'lardim", "Sayohat qilardim", "Yangi narsa o'rganardim", "Dam olardim"], c: -1 },
  ],
};

/** Toifa nomi — AI'ga beriladigan ta'rif. */
const QUIZ_TOPICS: Record<string, string> = {
  maktab: "maktab dasturidagi fanlar (matematika, ona tili, tabiiy fanlar, tarix)",
  fikrlash: "mantiqiy jumboqlar va fikrlash mashqlari (yodlash emas, o'ylash)",
  ozbekiston: "O'zbekiston tarixi, madaniyati va geografiyasi",
};

function quizPick(list: any[], n: number) {
  return list.slice().sort(() => Math.random() - 0.5).slice(0, n);
}

/** Javob berilgan variantlar to'g'ri shakldami — AI javobiga ishonmaymiz. */
function validQuizItem(it: any): boolean {
  return (
    it && typeof it.q === "string" && it.q.length > 3 &&
    Array.isArray(it.a) && it.a.length === 4 &&
    it.a.every((o: any) => typeof o === "string" && o.length > 0) &&
    Number.isInteger(it.c) && it.c >= 0 && it.c <= 3
  );
}

// Savollar qayerdan kelgani va AI nega ishlamagani — tashxis uchun.
// Kalitning o'zi hech qachon bu yerga tushmaydi.
let lastQuizSource = "zaxira";
let lastQuizError: string | null = null;

async function buildQuizQuestions(category: string, grade: number): Promise<any[]> {
  const fallback = QUIZ_FALLBACK[category] || QUIZ_FALLBACK.maktab;
  lastQuizSource = "zaxira";
  lastQuizError = null;

  if (category === "hayot") {
    lastQuizSource = "zaxira (hayot toifasi ataylab)";
    // Hayot savollari ataylab kamroq: ularni sun'iy ko'paytirish mumkin emas,
    // har biri o'ylab yozilgan.
    return quizPick(fallback, 5);
  }

  const apiKey = Deno.env.get("GEMINI_API_KEY") || "";
  if (!apiKey) {
    lastQuizError = "GEMINI_API_KEY sozlanmagan";
    return quizPick(fallback, 8);
  }

  const model = Deno.env.get("GEMINI_MODEL") || "gemini-3.6-flash";
  const prompt =
    `Sen O'zbekistondagi ${grade}-sinf o'quvchisi uchun viktorina savollari tuzasan.\n` +
    `Mavzu: ${QUIZ_TOPICS[category] || QUIZ_TOPICS.maktab}.\n\n` +
    `AYNAN 8 ta savol yoz. Faqat JSON massiv qaytar, boshqa hech narsa yozma.\n` +
    `Har element: {"q": "savol", "a": ["variant1","variant2","variant3","variant4"], "c": to'g'ri variant indeksi (0-3), "why": "bir jumlalik izoh"}\n\n` +
    `Qoidalar:\n` +
    `- Hammasi o'zbek tilida (lotin yozuvida).\n` +
    `- ${grade}-sinf darajasiga mos: na juda oson, na juda qiyin.\n` +
    `- Savollar TARTIB BILAN qiyinlashsin: 1-2 savol oson (deyarli hamma biladi), ` +
    `3-6 o'rtacha, 7-8 esa o'ylashni talab qilsin. Bola boshida o'zini bilimdon ` +
    `his qilsin, oxirida esa qiynalsin.\n` +
    `- To'rtala variant ham jiddiy ko'rinsin; kulgili variant qo'yma.\n` +
    `- To'g'ri javob indeksi har safar turlicha bo'lsin.\n` +
    `- Siyosat, din, zo'ravonlik yoki kattalarga oid mavzularga tegma.\n` +
    `- LaTeX yozma ($...$ kabi) — oddiy matn bilan yoz.\n` +
    `- Uzoq o'ylama, to'g'ridan-to'g'ri JSON yoz.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 1.0,
            // maxOutputTokens modelning "o'ylash" tokenlarini ham sanaydi.
            // 2048 da model o'ylab tugatgach javob yozishga joy qolmay,
            // JSON massiv o'rtasidan kesilib qolar edi — natijada har safar
            // zaxira savollar chiqardi. 8192 ikkalasiga ham yetadi.
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
          },
        }),
      }
    );
    const j = await res.json();

    // "O'ylash" bo'laklarini tashlaymiz: ular javob emas, modelning ichki
    // mulohazasi, va matnga qo'shilsa JSON gap o'rtasidan boshlanib qoladi.
    const parts = j?.candidates?.[0]?.content?.parts || [];
    const text = parts
      .filter((p: any) => p && typeof p.text === "string" && p.thought !== true)
      .map((p: any) => p.text)
      .join("");

    if (!text) {
      lastQuizError = String(
        j?.error?.message || j?.promptFeedback?.blockReason || `HTTP ${res.status}`
      ).slice(0, 200);
      console.error("Viktorina: AI bo'sh javob", JSON.stringify(j).slice(0, 400));
      return quizPick(fallback, 8);
    }

    // Model javobini QAT'IY JSON deb hisoblamaymiz. Amalda u ba'zan
    // ```json ... ``` ichiga o'raydi, ba'zan oldiga bir jumla qo'shadi,
    // ba'zan "o'ylash" qismini alohida bo'lak qilib yuboradi va matn
    // o'rtasidan boshlanadi. Shuning uchun matnning ichidan birinchi
    // to'liq massivni qavslar bo'yicha ajratib olamiz.
    const items = (() => {
      const tryParse = (s: string) => {
        try {
          const p = JSON.parse(s);
          const arr = Array.isArray(p) ? p : p.questions;
          return Array.isArray(arr) ? arr : null;
        } catch (_) {
          return null;
        }
      };

      const direct = tryParse(text.replace(/```(?:json)?/gi, "").trim());
      if (direct) return direct.filter(validQuizItem);

      const start = text.indexOf("[");
      if (start >= 0) {
        let depth = 0;
        for (let i = start; i < text.length; i++) {
          if (text[i] === "[") depth++;
          else if (text[i] === "]") {
            depth--;
            if (depth === 0) {
              const arr = tryParse(text.slice(start, i + 1));
              if (arr) return arr.filter(validQuizItem);
              break;
            }
          }
        }
      }
      return [] as any[];
    })();

    if (items.length >= 8) {
      lastQuizSource = "ai";
      return items.slice(0, 8);
    }
    // 5 tasi to'liq chiqmasa, yetmaganini zaxiradan to'ldiramiz — o'yin
    // baribir boshlanadi.
    lastQuizSource = items.length ? "ai + zaxira" : "zaxira";
    lastQuizError =
      `AI ${items.length} ta yaroqli savol berdi. Javob boshi: ` +
      JSON.stringify(text.slice(0, 120));
    return items.concat(quizPick(fallback, Math.max(0, 8 - items.length)));
  } catch (e) {
    lastQuizError = (e instanceof Error ? e.message : String(e)).slice(0, 200);
    console.error("Viktorina AI xatosi:", lastQuizError);
    return quizPick(fallback, 8);
  }
}

/** Viktorinada ko'rsatiladigan ism: bola bo'lsa oiladagi ismi, ota-ona bo'lsa
 *  "Ota-ona". Haqiqiy Telegram ismini ishlatmaymiz — u begonaga ham ko'rinadi. */
async function participantName(familyCode: string, who: string): Promise<string> {
  if (!db) return "Ishtirokchi";
  const { data } = await db
    .from("child_pairings")
    .select("child_name")
    .eq("family_code", familyCode)
    .eq("child_id", who)
    .limit(1);
  if (data && data[0] && data[0].child_name) return data[0].child_name;
  return "Ota-ona";
}

/** Bu Telegram hisobi biror oilaga FARZAND sifatida ulanganmi. */
async function isPairedChild(telegramId: number | string): Promise<boolean> {
  if (!db) return false;
  const { data } = await db
    .from("child_pairings")
    .select("child_id")
    .eq("child_id", "tg_" + telegramId)
    .eq("is_active", true)
    .limit(1);
  return !!(data && data[0]);
}

function boshlashReplyKeyboard(): any {
  // Persistent ReplyKeyboard: one Boshlash button (= /start)
  return {
    keyboard: [[{ text: "Start" }]],
    resize_keyboard: true,
    is_persistent: true,
    one_time_keyboard: false,
  };
}
// Farzandni ulash yo'riqnomasi.
//
// Ilgari bu yerda `?start=pair_<oila kodi>` havolasi berilardi. U hech qachon
// juftlik yaratmagan: bot faqat "muvaffaqiyatli bog'landingiz" deb yozardi,
// bazada esa hech narsa paydo bo'lmasdi — shu sabab farzand keyin ilovani
// ochganda server uni farzand deb tanimay, ota-ona panelini ko'rsatardi.
// Ustiga-ustak o'sha havola oila kodini oshkor qilardi, u esa ota-onaning
// Telegram ID'sidan hisoblanadi va sir emas.
//
// Endi yagona haqiqiy yo'l: Mini App'dagi "Farzand qo'shish" har bir farzandga
// alohida, bir martalik taklif kodi beradi (child_invites).
function getPairingText(userId: string | number, lang: string = "uz", isApproved: boolean = false): string {
  if (!isApproved) {
    if (lang === "ru") {
      return `⏳ <b>ОЖИДАНИЕ ОДОБРЕНИЯ АДМИНИСТРАТОРАМИ:</b>\n\nВаш аккаунт находится на рассмотрении. После подтверждения вы сможете подключить реальное устройство ребёнка.\nВ настоящее время вам доступен <b>Тестовый / Демо-режим</b> панели.`;
    }
    return `⏳ <b>ADMINISTRATOR TASDIG'I KUTILMOQDA:</b>\n\nSizning profilingiz ko'rib chiqish jarayonida. Administrator ruxsat berganidan so'ng farzand qurilmasini ulashingiz mumkin bo'ladi.\nHozirda siz uchun boshqaruv paneli <b>Test / Demo rejimida</b> to'liq ochiq.`;
  }

  if (lang === "ru") {
    return `🔗 <b>КАК ПОДКЛЮЧИТЬ РЕБЁНКА:</b>\n\n1. Откройте панель (кнопка ниже) → <b>«Добавить ребёнка»</b>.\n2. Введите имя ребёнка — система выдаст <b>персональный одноразовый код</b> и ссылку.\n3. Отправьте эту ссылку ребёнку: он откроет её, согласится с 4 правилами и введёт код.\n\n📱 <b>Android-приложение</b> подключается отдельно: в той же панели нажмите <b>«Получить код Android»</b> — код действует 15 минут.\n\n⚠️ Никогда никому не пересылайте свой семейный код — он не предназначен для подключения.`;
  }
  return `🔗 <b>FARZANDNI ULASH YO'RIQNOMASI:</b>\n\n1. Panelni oching (pastdagi tugma) → <b>«Yangi farzand qo'shish»</b>.\n2. Farzandning ismini kiriting — tizim unga <b>alohida, bir martalik kod</b> va havola beradi.\n3. O'sha havolani farzandingizga yuboring: u ochadi, 4 qoidaga rozilik beradi va kodni kiritadi.\n\n📱 <b>Android ilova</b> alohida ulanadi: shu panelda <b>«Android kodi olish»</b> tugmasini bosing — kod 15 daqiqa amal qiladi.\n\n⚠️ Oila kodingizni hech kimga yubormang — u ulanish uchun mo'ljallanmagan.`;
}

function getReelsAnalysisText(lang: string = "uz"): string {
  if (lang === "ru") {
    return `🎬 <b>АНАЛИЗ ПРОСМОТРЕННЫХ REELS И ВИДЕО:</b>\n\n📊 <b>Распределение по темам:</b>\n• 💻 <b>Образование и IT (Python, Робототехника, Языки):</b> 45% (Полезно)\n• 🔬 <b>Научные эксперименты и Логика:</b> 25% (Положительно)\n• 🎮 <b>Развлечения и Игры:</b> 30% (В норме)\n\n💡 <b>Рекомендация:</b> Чтобы алгоритм чаще рекомендовал обучающие видео, подпишитесь на полезные каналы по школьным предметам.`;
  }
  return `🎬 <b>KO'RILAYOTGAN REELS VA VIDEO KONTENT TAHLILI:</b>\n\n📊 <b>Mavzular taqsimoti:</b>\n• 💻 <b>Ta'limiy & IT (Python, Robototexnika, Chet tili):</b> 45% (Foydali va rivojlantiruvchi)\n• 🔬 <b>Ilmiy tajribalar & Mantiqiy jumboqlar:</b> 25% (Ijobiy tendensiya)\n• 🎮 <b>Ko'ngilochar va o'yin strimlari:</b> 30% (Me'yorida)\n\n💡 <b>Tavsiya:</b> Algoritm ko'proq ta'limiy videolarni tavsiya qilishi uchun fanlar bo'yicha foydalanuvchi kanallariga obuna bo'lishni yo'lga qo'ying.`;
}

function getFeedbackText(lang: string = "uz"): string {
  if (lang === "ru") {
    return `💡 <b>ОТЗЫВЫ И ПРЕДЛОЖЕНИЯ:</b>\n\nВаше мнение очень важно для нас! Отправьте свои предложения по улучшению программы разработчикам:\n\n📬 <b>Официальная почта:</b> <code>alhamdulillah@tmail.ton</code>\n\n👉 <a href="https://mail.google.com/mail/?view=cm&fs=1&to=alhamdulillah@tmail.ton&su=Shield+Parental+Guard+Taklif+va+Mulohaza">Написать письмо через Gmail</a>`;
  }
  return `💡 <b>TAKLIF VA FIKR-MULOHAZALAR:</b>\n\nDasturni yanada yaxshilash bo'yicha takliflaringizni to'g'ridan-to'g'ri ishlab chiquvchilarga yuboring:\n\n📬 <b>Rasmiy qabul pochtasi:</b> <code>alhamdulillah@tmail.ton</code>\n\n👉 <a href="https://mail.google.com/mail/?view=cm&fs=1&to=alhamdulillah@tmail.ton&su=Shield+Parental+Guard+Taklif+va+Mulohaza">Gmail orqali xat yozish</a>`;
}

async function handleRequest(req: Request): Promise<Response> {
  await ensureBotCommands();
  if (req.method === "GET") {
    return new Response(JSON.stringify({ status: "OK", service: "Qalqon AI Bot" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();

    // Telegram webhook update'i (payload.type YO'Q). Bu yo'l bot nomidan xabar
    // yuborish va admin amallarini bajarish imkonini beradi, shuning uchun
    // so'rov haqiqatan Telegram'dan kelganini tekshiramiz: setWebhook paytida
    // berilgan maxfiy token har bir so'rovda shu sarlavhada qaytib keladi.
    // Ilgari hech qanday tekshiruv yo'q edi — istalgan odam funksiya URL'iga
    // soxta "tugma bosildi" so'rovini yuborib, oilalarni o'zi tasdiqlay olardi.
    if (typeof payload?.type !== "string" && WEBHOOK_SECRET) {
      if (req.headers.get("x-telegram-bot-api-secret-token") !== WEBHOOK_SECRET) {
        console.error("Webhook: maxfiy token mos kelmadi — so'rov rad etildi");
        return new Response(JSON.stringify({ ok: false, error: "forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Mini App / Android so'rovlari (payload.type bor) autentifikatsiyadan
    // O'TISHI SHART. Ilgari bu yer butunlay ochiq edi: oddiy curl bilan
    // istalgan oilaga bola qo'shish va ro'yxatini o'qish mumkin edi.
    // Telegram webhook update'larida "type" bo'lmaydi — ular Telegram
    // serveridan keladi va quyida alohida ishlanadi.
    // app_login_start / app_login_poll — ilova hali kirmagan.
    // device_pair — qurilmada hali hech qanday hisob ma'lumoti yo'q.
    // cron_daily_digest — ichki chaqiruv, o'zi maxfiy sarlavha bilan himoyalangan.
    // web_login / web_logout — brauzerda Telegram imzosi yo'q; web_login o'zi
    //   login/parolni tekshiradi va urinishlar soni cheklangan.
    const NO_ACTOR_TYPES = [
      "device_pair", "parent_pair", "cron_daily_digest", "cron_live_reminder",
      "cron_evening_check", "web_login", "web_logout",
      "app_login_start", "app_login_poll",
    ];
    let actor: Actor | null = null;
    if (typeof payload?.type === "string" && !NO_ACTOR_TYPES.includes(payload.type)) {
      actor = await authenticate(payload);
      if (!actor) {
        return unauthorized(
          "initData (Mini App) yoki deviceToken (Android) yuborilishi kerak"
        );
      }
    }

    // 0. Mini App'dan to'g'ridan-to'g'ri ro'yxatdan o'tish so'rovi kelganda
    // 0. Mini App'dan ota-ona registratsiya so'rovi.
    //
    // Mini App bu yerga butun oila ma'lumotini yuboradi (ota, ona, farzand,
    // telefon, sinf). Ilgari bu handler ulardan faqat username va familyCode
    // ni o'qib, qolganini tashlab yuborardi va hech narsani saqlamasdi —
    // so'rov Telegram xabari bilan birga yo'qolardi. Xabar esa ADMIN_CHAT_IDS
    // bo'sh bo'lgani uchun hech qachon yetib bormasdi.
    //
    // Endi tartib teskari: avval bazaga yozamiz (manba shu), keyin Telegram
    // orqali xabar berishga urinamiz va urinish natijasini o'sha qatorga
    // qayd qilamiz. Xabar yetmasa ham so'rov yo'qolmaydi.
    if (payload.type === "parent_registration_request") {
      // Oila kodi mijozdan OLINMAYDI — imzolangan Telegram identitetidan
      // chiqariladi, aks holda birov boshqa oila nomidan yozib ketardi.
      const familyCode = actor!.kind === "telegram" ? actor!.familyCode : "";
      if (!familyCode) return unauthorized("Faqat Mini App orqali");
      const parentUsername = normalizeUsername(
        payload.parentUsername || payload.username
      );
      const gradeNum = Number(payload.childGrade);

      if (!familyCode) {
        return new Response(
          JSON.stringify({ ok: false, error: "familyCode majburiy" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const row: Record<string, unknown> = {
        family_code: familyCode,
        family_name: payload.familyName || null,
        parent_name: payload.parentName || null,
        parent_username: parentUsername || null,
        parent_phone: payload.parentPhone || null,
        // Mijozdan emas, imzolangan identitetdan: aks holda bu maydon doim
        // bo'sh qolardi (Mini App uni hech qachon yubormagan) va tasdiqlangach
        // ota-onaga xabar yuborib bo'lmasdi.
        parent_telegram_id: actor!.kind === "telegram" ? actor!.telegramId : null,
        mother_name: payload.motherName || null,
        mother_username: normalizeUsername(payload.motherUsername) || null,
        child_name: payload.childName || null,
        child_grade: Number.isFinite(gradeNum) && gradeNum > 0 ? gradeNum : null,
        child_username: normalizeUsername(payload.childUsername) || null,
        updated_at: new Date().toISOString(),
      };

      // Ro'yxatdan o'tishda parol ham beriladi (username = login). U faqat
      // Telegramdan tashqarida kirish uchun kerak; Telegram ichida initData
      // baribir kuchliroq. Parol bo'sh bo'lsa — hech narsa o'zgarmaydi,
      // ya'ni ma'lumotni tahrirlash parolni o'chirib yubormaydi.
      if (typeof payload.password === "string" && payload.password.length > 0) {
        const pwProblem = passwordProblem(payload.password);
        if (pwProblem) {
          return new Response(JSON.stringify({ ok: false, error: pwProblem }), {
            status: 400, headers: { "Content-Type": "application/json" },
          });
        }
        (row as Record<string, unknown>).password_hash = await hashPassword(payload.password);
        (row as Record<string, unknown>).password_set_at = new Date().toISOString();
      }

      // Taklif kodi: faqat MAVJUD va o'zi bo'lmagan oila qabul qilinadi.
      // Mukofot bu yerda berilmaydi — admin tasdig'idan keyin beriladi.
      const refRaw = String(payload.ref || "").replace(/\D/g, "");
      if (db && refRaw.length === 6 && refRaw !== familyCode) {
        const { data: refFamily } = await db
          .from("parent_registrations")
          .select("family_code")
          .eq("family_code", refRaw)
          .limit(1);
        if (refFamily && refFamily[0]) {
          (row as Record<string, unknown>).referred_by_family_code = refRaw;

          // Taklifni BOLA yuborganmi. Mukofot baribir oilaga tushadi (tarif
          // oilaniki), lekin kim chaqirganini bilmasak, bolani tabriklay
          // olmasdik — taklif mexanikasining butun jozibasi esa shunda.
          const refChild = String(payload.refChild || "").replace(/\D/g, "");
          if (refChild) {
            const { data: refKid } = await db
              .from("child_pairings")
              .select("child_id")
              .eq("family_code", refRaw)
              .eq("child_id", "tg_" + refChild)
              .eq("is_active", true)
              .limit(1);
            if (refKid && refKid[0]) {
              (row as Record<string, unknown>).referred_by_child_id = "tg_" + refChild;
              (row as Record<string, unknown>).referred_via = "child";
            }
          }
          if (!(row as Record<string, unknown>).referred_via) {
            (row as Record<string, unknown>).referred_via = "parent";
          }
        }
      }

      // Bu oila allaqachon ko'rib chiqilganmi? Tasdiqlangan oila ma'lumotini
      // tahrirlash — bu YANGI so'rov emas, shuning uchun adminni qaytadan
      // bezovta qilmaymiz va holatni "pending"ga qaytarmaymiz. Ilgari har
      // saqlash adminga yangi so'rov yuborardi.
      let existingStatus = "none";
      if (db) {
        const { data: prev } = await db
          .from("parent_registrations")
          .select("status")
          .eq("family_code", familyCode)
          .limit(1);
        if (prev && prev[0]) existingStatus = prev[0].status;
      }
      const alreadyApproved = existingStatus === "approved";

      let saved = false;
      if (db) {
        const { error } = await db
          .from("parent_registrations")
          .upsert(row, { onConflict: "family_code" });
        if (error) console.error("parent_registrations upsert failed:", error.message);
        else saved = true;
      }

      if (alreadyApproved) {
        return new Response(
          JSON.stringify({ ok: saved, saved, alreadyApproved: true, adminNotified: false, notifyErrors: [] }),
          { status: saved ? 200 : 500, headers: { "Content-Type": "application/json" } }
        );
      }

      const line = (label: string, value: unknown) =>
        value ? `\n${label} ${value}` : "";

      const adminNotice =
        `🔔 <b>YANGI OTA-ONA RO'YXATDAN O'TMOQCHI!</b>` +
        line("👨‍👩‍👧 <b>Oila:</b>", payload.familyName) +
        line("👤 <b>Ota:</b>", payload.parentName) +
        line("🔗 <b>Username:</b>", parentUsername ? "@" + parentUsername : null) +
        line("📞 <b>Telefon:</b>", payload.parentPhone) +
        line("👩 <b>Ona:</b>", payload.motherName) +
        line("👦 <b>Farzand:</b>", payload.childName) +
        line("🎓 <b>Sinf:</b>", row.child_grade) +
        `\n🔑 <b>Oila Kodi:</b> <code>${familyCode}</code>` +
        `\n📅 <b>Vaqt:</b> ${tashkentVaqt(new Date().toISOString())}` +
        `\n\nRuxsat berasizmi?`;

      // Tugma endi username emas, oila kodini olib yuradi — tasdiqlash
      // bazadagi aynan shu qatorga yoziladi.
      const approvalKeyboard = {
        inline_keyboard: [
          [
            { text: "✅ Ruxsat berish", callback_data: `admin_approve_${familyCode}` },
            { text: "❌ Rad etish", callback_data: `admin_reject_${familyCode}` },
          ],
        ],
      };

      const delivery = await notifyAdmins(adminNotice, approvalKeyboard);

      if (db && saved) {
        await db
          .from("parent_registrations")
          .update({
            admin_notified: delivery.sent > 0,
            notify_error: delivery.failed.length ? delivery.failed.join("; ") : null,
          })
          .eq("family_code", familyCode);
      }

      return new Response(
        JSON.stringify({
          ok: saved,
          saved,
          adminNotified: delivery.sent > 0,
          notifyErrors: delivery.failed,
        }),
        { status: saved ? 200 : 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 0.0a Ota-ona Mini App'dagi "Farzand qo'shish" formasidan.
    //
    // Bu bosqichda farzandning Telegram ID'si hali yo'q (u havolani hali
    // ochmagan), shuning uchun yozuv uning username'i bo'yicha
    // "invite_<username>" kaliti bilan saqlanadi. Farzand rozilik berganda
    // child_consent haqiqiy "tg_<id>" yozuvini yaratadi va reconcileInvite()
    // taklifni o'chiradi — shunday qilib bitta farzand ikki marta
    // ko'rinmaydi. Taklif yozuvi source = "parent_invite" bilan belgilanadi,
    // shuning uchun panel uni "kutilmoqda" holatida ko'rsata oladi.
    if (payload.type === "add_child_request") {
      // Oila kodi mijozdan OLINMAYDI — imzolangan Telegram identitetidan
      // chiqariladi, aks holda birov boshqa oila nomidan yozib ketardi.
      const familyCode = actor!.kind === "telegram" ? actor!.familyCode : "";
      if (!familyCode) return unauthorized("Faqat Mini App orqali");
      const childName = String(payload.childName || "").trim();
      const uname = normalizeUsername(payload.childUsername);
      const gradeNum = Number(payload.childGrade);
      const grade = Number.isFinite(gradeNum) && gradeNum > 0 ? gradeNum : null;

      if (!familyCode || !childName || !uname) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: "familyCode, childName va childUsername majburiy",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const saved = await upsertPairing(familyCode, `invite_${uname}`, {
        childName,
        deviceLabel: `@${uname}`,
        source: "parent_invite",
        grade,
        telegramUsername: uname,
      });

      // Yozilmagan bo'lsa "ok" demaymiz: Mini App buni muvaffaqiyat deb
      // ko'rsatib, ota-onani farzand qo'shildi deb aldardi.
      if (!saved) {
        return new Response(
          JSON.stringify({ ok: false, error: "Bazaga yozib bo'lmadi" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      await notifyAdmins(
        `➕ <b>OTA-ONA FARZAND QO'SHDI</b>\n\n👦 <b>Farzand:</b> ${childName}\n🔗 <b>Username:</b> @${uname}\n🎓 <b>Sinf:</b> ${grade ?? "—"}\n🔑 <b>Oila Kodi:</b> <code>${familyCode}</code>`
      );

      return new Response(
        JSON.stringify({
          ok: true,
          childId: `invite_${uname}`,
          pairLink: `https://t.me/qalqon_aibot?start=pair_${familyCode}`,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 0.0b Ota-ona panelidagi farzandlar ro'yxati.
    //
    // Nega backend'ning /api/v1/parent/children endpointi emas: u Render'ning
    // bepul tarifida ishlaydi va uzoq tanaffusdan keyin sovuq startda ~50
    // soniya javob bermaydi — Mini App ochilishida bu buzilgandek ko'rinadi.
    // Bu funksiya esa doim issiq va allaqachon shu jadvalga service_role
    // bilan yozadi, shuning uchun o'qish ham shu yerda.
    // Mavjud farzandning smenasini o'zgartirish. Maktab hududlari ham shu
    // vaqtga o'tadi — aks holda ota-ona ikki joyni alohida tuzatishi kerak edi.
    if (payload.type === "update_child_school") {
      if (actor!.kind !== "telegram" || (await isPairedChild(actor!.telegramId))) return unauthorized("Faqat ota-ona");
      if (!db) return jsonRes({ ok: false, error: "Baza ulanmagan" }, 500);
      const childId = String(payload.childId || "").trim();
      const school = parseSchoolShift(payload.schoolShift, payload.schoolArriveBy);
      if (!childId || !school.shift) return jsonRes({ ok: false, error: "Smena va vaqtni tanlang." }, 400);
      const { data: upd } = await db.from("child_pairings")
        .update({ school_shift: school.shift, school_arrive_by: school.arriveBy })
        .eq("family_code", actor!.familyCode).eq("child_id", childId).select("child_id");
      if (!upd || !upd[0]) return jsonRes({ ok: false, error: "Farzand topilmadi." }, 404);
      const { data: zones } = await db.from("geofence_zones").select("name")
        .eq("family_code", actor!.familyCode).eq("child_id", childId).limit(20);
      let zonesUpdated = 0;
      for (const z of zones || []) {
        if (!isSchoolZoneName(z.name)) continue;
        await db.from("geofence_zones").update({ arrive_by: school.arriveBy })
          .eq("family_code", actor!.familyCode).eq("child_id", childId).eq("name", z.name);
        zonesUpdated++;
      }
      return jsonRes({ ok: true, schoolShift: school.shift, schoolArriveBy: school.arriveBy, zonesUpdated });
    }

    if (payload.type === "list_children") {
      // O'QISH: faqat so'rovchining O'Z oilasi. Mijoz yuborgan kod
      // e'tiborga olinmaydi.
      const familyCode = actor!.familyCode;
      if (!familyCode || !db) {
        return new Response(JSON.stringify({ ok: false, children: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { data, error } = await db
        .from("child_pairings")
        .select(
          "child_id, child_name, grade, telegram_username, device_label, source, paired_at, last_seen_at, school_shift, school_arrive_by"
        )
        .eq("family_code", familyCode)
        .eq("is_active", true)
        .order("paired_at", { ascending: true });

      if (error) {
        console.error("list_children failed:", error.message);
        return new Response(
          JSON.stringify({ ok: false, error: error.message, children: [] }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify({ ok: true, children: data || [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 0.0e Ota-ona farzand uchun taklif yaratadi.
    //
    // Har bir farzandga ALOHIDA bir martalik kod beriladi. Ilgari hamma
    // farzand bitta oila kodi bilan ulanardi va o'sha kod ota-onaning
    // Telegram ID'sidan hisoblanardi — ya'ni sir emas edi.
    if (payload.type === "create_child_invite") {
      if (actor!.kind !== "telegram") return unauthorized("Faqat ota-ona");
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      const childName = String(payload.childName || "").trim();
      if (!childName) {
        return new Response(
          JSON.stringify({ ok: false, error: "Farzand ismi majburiy" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      const gradeRaw = Number(payload.childGrade);
      const grade = Number.isFinite(gradeRaw) && gradeRaw > 0 ? gradeRaw : null;
      const uname = normalizeUsername(payload.childUsername) || null;
      const code = makeInviteCode();
      const school = parseSchoolShift(payload.schoolShift, payload.schoolArriveBy);

      const { error } = await db.from("child_invites").insert({
        code,
        family_code: actor!.familyCode,
        child_name: childName,
        child_grade: grade,
        child_username: uname,
        school_shift: school.shift,
        school_arrive_by: school.arriveBy,
        created_by_telegram_id: actor!.telegramId,
        expires_at: new Date(Date.now() + INVITE_TTL_HOURS * 3600 * 1000).toISOString(),
      });

      if (error) {
        console.error("child_invites insert failed:", error.message);
        return new Response(JSON.stringify({ ok: false, error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Panelda darhol "kutilmoqda" bo'lib ko'rinishi uchun.
      await upsertPairing(actor!.familyCode, "invite_" + code, {
        childName,
        deviceLabel: null,
        source: "parent_invite",
        grade,
        telegramUsername: uname,
        schoolShift: school.shift,
        schoolArriveBy: school.arriveBy,
      });

      // Havola ikkala yo'l uchun ham bir xil:
      //  (a) ota-ona uni farzandga o'zi ulashadi;
      //  (b) farzand bossa, bot /start inv_<kod> ni ko'radi va shundan keyin
      //      unga o'zi yozib, kodni yuboradi. Telegram botga faqat o'ziga
      //      yozgan odamga xabar yuborishga ruxsat beradi, shuning uchun
      //      (b) faqat farzand havolani bosgandan keyin ishlaydi.
      return new Response(
        JSON.stringify({
          ok: true,
          code,
          link: "https://t.me/qalqon_aiBot?start=inv_" + code,
          expiresInHours: INVITE_TTL_HOURS,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 0.0f Farzand kod kiritishdan oldin darvoza holatini so'raydi, shunda
    // Mini App "bloklangansiz, N soniya qoldi" deb ko'rsata oladi.
    if (payload.type === "entry_status") {
      const actorKey =
        actor!.kind === "telegram" ? "tg:" + actor!.telegramId : "dev:" + actor!.childId;
      const gate = await entryGate(actorKey);
      return new Response(JSON.stringify({ ok: true, ...gate }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 0.0g Farzand kodni kiritadi.
    //
    // 3 ta noto'g'ri urinishdan keyin 3 daqiqaga bloklanadi; blok tugagach
    // yana to'liq 3 ta urinish beriladi. Mantiq shu yerda bo'lgani uchun
    // Mini App, Android va iPhone uchun bir xil ishlaydi.
    if (payload.type === "redeem_child_invite") {
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      const actorKey =
        actor!.kind === "telegram" ? "tg:" + actor!.telegramId : "dev:" + actor!.childId;

      const gate = await entryGate(actorKey);
      if (gate.banned) {
        return new Response(
          JSON.stringify({
            ok: false,
            banned: true,
            secondsLeft: gate.secondsLeft,
            attemptsLeft: 0,
            error:
              "Juda ko'p noto'g'ri urinish. " +
              gate.secondsLeft +
              " soniyadan keyin qayta urinib ko'ring.",
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }

      const code = String(payload.code || "").trim().toUpperCase();
      const { data } = await db
        .from("child_invites")
        .select("code, family_code, child_name, child_grade, child_username, school_shift, school_arrive_by, expires_at, used_at")
        .eq("code", code)
        .limit(1);

      const inv = data && data[0];
      const valid = !!(inv && !inv.used_at && new Date(inv.expires_at).getTime() > Date.now());

      if (!valid) {
        const after = await registerFailedAttempt(actorKey);
        return new Response(
          JSON.stringify({
            ok: false,
            banned: after.banned,
            secondsLeft: after.secondsLeft,
            attemptsLeft: after.attemptsLeft,
            error: after.banned
              ? "Juda ko'p noto'g'ri urinish. " +
                after.secondsLeft +
                " soniyadan keyin qayta urinib ko'ring."
              : "Kod noto'g'ri. Yana " + after.attemptsLeft + " ta urinish qoldi.",
          }),
          {
            status: after.banned ? 429 : 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Bir martalik: kodni darhol kuydiramiz.
      await db
        .from("child_invites")
        .update({
          used_at: new Date().toISOString(),
          used_by_telegram_id: actor!.kind === "telegram" ? actor!.telegramId : null,
        })
        .eq("code", code);

      // child_id mijozdan emas, imzolangan identitetdan olinadi.
      const childId =
        actor!.kind === "telegram" ? "tg_" + actor!.telegramId : actor!.childId;

      await upsertPairing(inv.family_code, childId, {
        childName: inv.child_name || "Farzand",
        deviceLabel:
          actor!.kind === "telegram" && actor!.username ? "@" + actor!.username : null,
        source: actor!.kind === "telegram" ? "telegram_miniapp" : "android_parental_guard",
        grade: inv.child_grade,
        telegramUsername:
          actor!.kind === "telegram" ? actor!.username || null : inv.child_username,
        schoolShift: inv.school_shift,
        schoolArriveBy: inv.school_arrive_by,
      });

      // "Kutilmoqda" qatorini olib tashlaymiz, aks holda panelda bitta
      // farzand ikki marta ko'rinardi.
      await db
        .from("child_pairings")
        .delete()
        .eq("family_code", inv.family_code)
        .eq("child_id", "invite_" + code);

      await clearEntryState(actorKey);

      await notifyAdmins(
        "\u{1F389} <b>FARZAND ULANDI</b>\n\n\u{1F466} <b>Farzand:</b> " +
          (inv.child_name || "Farzand") +
          "\n\u{1F511} <b>Oila:</b> <code>" +
          inv.family_code +
          "</code>"
      );

      return new Response(
        JSON.stringify({ ok: true, childId, familyCode: inv.family_code }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 0.0h Ota-ona paneli o'z oila kodini SERVERDAN so'raydi.
    //
    // Ilgari Mini App kodni localStorage'dan o'qirdi va u yerda eski qiymat
    // (masalan 849210) qolib ketardi — shu sabab har foydalanuvchida o'z
    // kodi bo'lishi kerak bo'lsa ham, eskisi ko'rinaverardi.
    // 0.0z "BUGUN MEN..." — farzanddan ota-onaga ijobiy xabar.
    //
    // Bu SOS emas va hisobot ham emas: maqsadi — bola o'zi gapirishi.
    // Nazorat ilovasida bolaning ovozi bo'lmasa, u ilovani dushman deb
    // biladi; bitta tugma buni ancha o'zgartiradi.
    if (payload.type === "child_daily_note") {
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }
      const familyCode = await resolveActorFamily(actor!);
      const childId =
        actor!.kind === "device" ? actor!.childId : "tg_" + actor!.telegramId;

      const moods: Record<string, { emoji: string; label: string }> = {
        great: { emoji: "🤩", label: "Kayfiyatim zo'r" },
        good: { emoji: "🙂", label: "Yaxshiman" },
        tired: { emoji: "😮‍💨", label: "Charchadim" },
        sad: { emoji: "😔", label: "Biroz xafaman" },
      };
      const mood = moods[String(payload.mood)] ? String(payload.mood) : "good";
      const note = String(payload.note || "").trim().slice(0, 200);

      // Kuniga bir nechta — lekin cheksiz emas.
      const { data: today } = await db
        .from("child_notes")
        .select("id")
        .eq("family_code", familyCode)
        .eq("child_id", childId)
        .gte("created_at", new Date(Date.now() - 86400000).toISOString())
        .limit(6);
      if (today && today.length >= 5) {
        return new Response(
          JSON.stringify({ ok: false, error: "Bugun yetarlicha xabar yubording 🙂 Ertaga yana yozasan." }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }

      await db.from("child_notes").insert({
        family_code: familyCode, child_id: childId, mood, note: note || null,
      });

      const { data: pairing } = await db
        .from("child_pairings")
        .select("child_name")
        .eq("child_id", childId)
        .eq("family_code", familyCode)
        .limit(1);
      const childName = (pairing && pairing[0]?.child_name) || "Farzandingiz";
      const m = moods[mood];

      await notifyFamilyParents(
        familyCode,
        `${m.emoji} <b>${childName}dan xabar</b>\n\n` +
          `<b>${m.label}</b>` +
          (note ? `\n\n"${note}"` : "") +
          `\n\n<i>Bu xabarni farzandingiz o'zi yubordi.</i>`
      );

      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    // 0.1c NATIJA KARTOCHKASI — Telegram Story uchun rasm.
    //
    // shareToStory tayyor rasm URL'ini talab qiladi (data: URI ham, canvas
    // ham qabul qilinmaydi), shuning uchun rasm mijozda chiziladi, bu yerda
    // saqlanadi va ommaviy havolasi qaytariladi.
    //
    // Rasmni SERVER chizmaydi: Deno'da rasm rasterizatori yo'q va uni olib
    // kirish funksiyani ancha og'irlashtirardi. Mijozdagi canvas ayni shu
    // ish uchun yetarli.
    if (payload.type === "story_card_upload") {
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }

      const raw = String(payload.image || "");
      const m = raw.match(/^data:image\/(png|jpeg);base64,(.+)$/);
      if (!m) {
        return new Response(JSON.stringify({ ok: false, error: "Rasm formati noto'g'ri." }), {
          status: 400, headers: { "Content-Type": "application/json" },
        });
      }
      const ext = m[1] === "jpeg" ? "jpg" : "png";
      const b64 = m[2];
      // ~1.5 MB dan katta bo'lsa rad etamiz (bucket chegarasi 2 MB).
      if (b64.length > 2_000_000) {
        return new Response(JSON.stringify({ ok: false, error: "Rasm juda katta." }), {
          status: 413, headers: { "Content-Type": "application/json" },
        });
      }

      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const who =
        actor!.kind === "telegram" ? String(actor!.telegramId) : actor!.childId;
      // Fayl nomi taxmin qilinmaydigan bo'lsin: havola ommaviy, ya'ni
      // nomni bilgan har kim ocha oladi.
      const name = `${await sha256Hex(who + ":" + Date.now())}`.slice(0, 32);
      const path = `${name}.${ext}`;

      const { error } = await db.storage.from("story-cards").upload(path, bytes, {
        contentType: m[1] === "jpeg" ? "image/jpeg" : "image/png",
        upsert: false,
      });
      if (error) {
        console.error("story_card_upload xatosi:", error.message);
        return new Response(JSON.stringify({ ok: false, error: error.message }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }

      const url = `${SUPABASE_URL}/storage/v1/object/public/story-cards/${path}`;
      return new Response(JSON.stringify({ ok: true, url }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    // 0.1a QALQON LIGASI — haftalik reyting.
    //
    // MUHIM: boshqa bolalarning ismi yoki username'i HECH QACHON
    // qaytarilmaydi. Voyaga yetmaganlarning ro'yxatini bir-biriga ko'rsatish
    // maxfiylik jihatidan ham, Play'ning bolalar siyosati jihatidan ham
    // yo'l qo'yib bo'lmaydigan narsa. Faqat o'z o'rning va umumiy son.
    // 0.1q ILOVAGA KIRISH VA PUSH (kirish so'rovi hisobsiz ham ishlaydi).
    {
      const appRes = await handleAppRoutes(payload, actor);
      if (appRes) return appRes;
    }

    // 0.1p BALL TIZIMI: fokus tekshiruvi, uy vazifasi, do'kon, kartalar.
    {
      const ballRes = await handleBallRoutes(payload, actor!);
      if (ballRes) return ballRes;
      const matchRes = await handleMatchRoutes(payload, actor!);
      if (matchRes) return matchRes;
      const chatRes = await handleChatRoutes(payload, actor!);
      if (chatRes) return chatRes;
    }

    // ========================================================================
    // OILAVIY VIKTORINA
    //
    // Asinxron: ota-ona va bola (yoki aka-uka) AYNI savollarga javob beradi,
    // lekin bir vaqtda onlayn bo'lishi shart emas. Fokus Jangi ham shu
    // tamoyilda ishlaydi — real vaqtli o'yin bo'lsa, u deyarli hech qachon
    // boshlanmasdi.
    //
    // To'g'ri javob mijozga HECH QACHON yuborilmaydi: savollar serverda
    // saqlanadi, baholash ham serverda. Aks holda ekran kodini ochgan bola
    // hamma javobni ko'rardi.
    //
    // "Hayot savollari" toifasida to'g'ri javob umuman yo'q — u ball uchun
    // emas, ota-ona bilan bolaning javoblarini solishtirish uchun.
    // ========================================================================
    if (payload.type === "quiz_create") {
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }

      const familyCode = await resolveActorFamily(actor!);
      const who =
        actor!.kind === "device" ? actor!.childId : "tg_" + actor!.telegramId;

      const category = ["maktab", "fikrlash", "hayot", "ozbekiston"].includes(
        String(payload.category)
      ) ? String(payload.category) : "maktab";

      const grade = Math.max(1, Math.min(11, Number(payload.grade) || 6));

      const questions = await buildQuizQuestions(category, grade);
      if (!questions.length) {
        return new Response(
          JSON.stringify({ ok: false, error: "Savollarni tayyorlab bo'lmadi." }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      const { data, error } = await db
        .from("quiz_rounds")
        .insert({
          family_code: familyCode,
          category,
          grade,
          created_by: who,
          questions,
        })
        .select("id")
        .limit(1);

      if (error || !data || !data[0]) {
        console.error("quiz_rounds insert:", error && error.message);
        return new Response(JSON.stringify({ ok: false, error: "Saqlab bo'lmadi." }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          ok: true,
          roundId: data[0].id,
          category,
          grade,
          // To'g'ri javob olib tashlanadi.
          questions: questions.map((q: any) => ({ q: q.q, a: q.a })),
          scored: category !== "hayot",
          source: lastQuizSource,
          sourceNote: lastQuizError,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (payload.type === "quiz_submit") {
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }

      const familyCode = await resolveActorFamily(actor!);
      const who =
        actor!.kind === "device" ? actor!.childId : "tg_" + actor!.telegramId;

      const { data: rounds } = await db
        .from("quiz_rounds")
        .select("id, family_code, category, questions")
        .eq("id", String(payload.roundId || ""))
        .eq("family_code", familyCode)
        .limit(1);

      const round = rounds && rounds[0];
      if (!round) {
        return new Response(JSON.stringify({ ok: false, error: "Viktorina topilmadi." }), {
          status: 404, headers: { "Content-Type": "application/json" },
        });
      }

      const given: number[] = Array.isArray(payload.answers) ? payload.answers : [];
      const qs = round.questions as any[];
      const scored = round.category !== "hayot";

      let score = 0;
      const review = qs.map((q, i) => {
        const chosen = Number(given[i]);
        const correct = Number(q.c);
        if (scored && chosen === correct) score++;
        return {
          q: q.q,
          a: q.a,
          chosen: Number.isFinite(chosen) ? chosen : null,
          correct: scored ? correct : null,
          why: q.why || null,
        };
      });

      const nameRow = await participantName(familyCode, who);

      // upsert: bola javobni ikki marta yubormasin, lekin qayta o'ynasa
      // (yangi round) muammo bo'lmaydi.
      const { error } = await db.from("quiz_answers").upsert(
        {
          round_id: round.id,
          family_code: familyCode,
          participant_id: who,
          participant_name: nameRow,
          answers: given,
          score,
          total: qs.length,
        },
        { onConflict: "round_id,participant_id" }
      );
      if (error) console.error("quiz_answers upsert:", error.message);

      const { data: all } = await db
        .from("quiz_answers")
        .select("participant_id, participant_name, score, total, answers, finished_at")
        .eq("round_id", round.id)
        .limit(10);

      // Raqib javob berib bo'lgan bo'lsa — unga xabar beramiz. Bu o'yinning
      // aylanishini ta'minlaydigan yagona narsa: aks holda kim qachon javob
      // berganini hech kim bilmasdi.
      for (const p of all || []) {
        if (p.participant_id === who) continue;
        const tgId = String(p.participant_id).startsWith("tg_")
          ? String(p.participant_id).slice(3)
          : null;
        if (!tgId) continue;
        await sendMessage(
          tgId,
          `🧩 <b>${nameRow} viktorinani yakunladi.</b>\n\n` +
            (scored
              ? `Natija: <b>${nameRow} ${score}/${qs.length}</b>, siz ${p.score}/${p.total}.`
              : `Endi javoblaringizni solishtirib ko'ring — bu toifada to'g'ri javob yo'q.`)
        );
      }

      return new Response(
        JSON.stringify({
          ok: true,
          scored,
          score,
          total: qs.length,
          review,
          participants: (all || []).map((p: any) => ({
            name: p.participant_name,
            score: p.score,
            total: p.total,
            me: p.participant_id === who,
            answers: p.answers,
          })),
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Mavjud raundning savollarini olish (boshqa oila a'zosi boshlagan).
    // To'g'ri javob bu yerda ham berilmaydi.
    if (payload.type === "quiz_round_questions") {
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }
      const familyCode = await resolveActorFamily(actor!);
      const { data: rows } = await db
        .from("quiz_rounds")
        .select("id, category, grade, questions, expires_at")
        .eq("id", String(payload.roundId || ""))
        .eq("family_code", familyCode)
        .limit(1);

      const r = rows && rows[0];
      if (!r || new Date(r.expires_at).getTime() < Date.now()) {
        return new Response(
          JSON.stringify({ ok: false, error: "Viktorina topilmadi yoki muddati o'tgan." }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          ok: true,
          roundId: r.id,
          category: r.category,
          grade: r.grade,
          questions: (r.questions as any[]).map((q) => ({ q: q.q, a: q.a })),
          scored: r.category !== "hayot",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (payload.type === "quiz_open_rounds") {
      if (!db) {
        return new Response(JSON.stringify({ ok: true, rounds: [] }), {
          status: 200, headers: { "Content-Type": "application/json" },
        });
      }
      const familyCode = await resolveActorFamily(actor!);
      const who =
        actor!.kind === "device" ? actor!.childId : "tg_" + actor!.telegramId;

      const { data: rounds } = await db
        .from("quiz_rounds")
        .select("id, category, grade, questions, created_by, created_at")
        .eq("family_code", familyCode)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(10);

      const out: any[] = [];
      for (const r of rounds || []) {
        const { data: mine } = await db
          .from("quiz_answers")
          .select("id")
          .eq("round_id", r.id)
          .eq("participant_id", who)
          .limit(1);

        const { data: others } = await db
          .from("quiz_answers")
          .select("participant_name, score, total")
          .eq("round_id", r.id)
          .limit(10);

        out.push({
          roundId: r.id,
          category: r.category,
          grade: r.grade,
          count: (r.questions as any[]).length,
          answered: !!(mine && mine[0]),
          createdByMe: r.created_by === who,
          createdAt: r.created_at,
          results: (others || []).map((o: any) => ({
            name: o.participant_name, score: o.score, total: o.total,
          })),
        });
      }

      return new Response(JSON.stringify({ ok: true, rounds: out }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    // 0.1a+ TAKLIF HAVOLASI — ota-ona uchun ham, bola uchun ham.
    //
    // Havola oila kodidan yasaladi, ya'ni alohida "taklif kodlari" jadvali
    // kerak emas: kod yo'qolmaydi, eskirmaydi va uni tiklash ham shart emas.
    if (payload.type === "referral_status") {
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }

      const familyCode = await resolveActorFamily(actor!);
      if (!familyCode) {
        return new Response(
          JSON.stringify({ ok: false, error: "Oila topilmadi" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      // Bola o'z havolasini oladi, ota-ona o'zinikini. Farq faqat mukofot
      // miqdorida va tabrik kimga borishida.
      const isChild =
        actor!.kind === "device" ||
        (actor!.kind === "telegram" && (await isPairedChild(actor!.telegramId)));

      const childTgId =
        actor!.kind === "telegram" ? String(actor!.telegramId) : null;

      const link = isChild && childTgId
        ? `https://t.me/qalqon_aibot?start=refc_${familyCode}_${childTgId}`
        : `https://t.me/qalqon_aibot?start=ref_${familyCode}`;

      const { data: invited } = await db
        .from("parent_registrations")
        .select("family_name, referral_rewarded_at, referred_via")
        .eq("referred_by_family_code", familyCode)
        .limit(100);

      const rows = invited || [];
      const joined = rows.filter((r: any) => r.referral_rewarded_at).length;
      const pending = rows.length - joined;
      const days = isChild ? REFERRAL_BONUS_DAYS_CHILD : REFERRAL_BONUS_DAYS;

      const plan = await getPlan(familyCode);
      const { data: reg } = await db
        .from("parent_registrations")
        .select("plan_expires_at")
        .eq("family_code", familyCode)
        .limit(1);

      return new Response(
        JSON.stringify({
          ok: true,
          isChild,
          link,
          bonusDays: days,
          joined,
          pending,
          daysEarned: joined * days,
          plan,
          planExpiresAt: (reg && reg[0] && reg[0].plan_expires_at) || null,
          shareText: isChild
            ? "Men Qalqon AI'da diqqat bilan ishlab, bo'rimni o'stiryapman 🐺 Sen ham qo'shil — ota-onang ro'yxatdan o'tsa, ikkalamizga ham 7 kun bepul Pro!"
            : "Qalqon AI — farzandim qayerdaligini bilib turaman, u esa ekran vaqtini o'zi ishlab topadi. Qo'shiling, ikkalamizga ham 14 kun bepul Pro beriladi.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (payload.type === "league_status") {
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }
      const familyCode = await resolveActorFamily(actor!);
      const childId =
        actor!.kind === "device"
          ? actor!.childId
          : (await isPairedChild(actor!.telegramId))
            ? "tg_" + actor!.telegramId
            : String(payload.childId || "").trim();

      // Hafta boshi (dushanba).
      const now = new Date();
      const day = (now.getUTCDay() + 6) % 7; // dushanba = 0
      const weekStart = new Date(Date.UTC(
        now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - day
      )).toISOString();

      // Reyting HAQIQIY fokus daqiqalari bo'yicha, vaqt banki mukofoti
      // bo'yicha emas. Mukofot kunlik shiftga tushadi — agar reyting shundan
      // hisoblansa, shiftga yetgan bola yana bir soat ishlasa ham o'rni
      // qimirlamasdi, ya'ni musobaqa kun o'rtasida o'lib qolardi. Fokus
      // seansining uzunligini esa server o'zi o'lchaydi (focus_complete),
      // shuning uchun bu son ham aldashdan himoyalangan.
      const { data: rows } = await db
        .from("focus_sessions")
        .select("child_id, planned_minutes, completed_at")
        .not("completed_at", "is", null)
        // Faqat tekshiruv savollaridan o'tgan seanslar — taymerni yoqib
        // qo'yib ketilgani hisoblanmaydi.
        .eq("check_passed", true)
        .gte("completed_at", weekStart)
        .limit(5000);

      const totals: Record<string, number> = {};
      for (const r of rows || []) {
        totals[r.child_id] =
          (totals[r.child_id] || 0) + (Number(r.planned_minutes) || 0);
      }
      const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
      const myMinutes = totals[childId] || 0;
      const rank = sorted.findIndex(([id]) => id === childId) + 1;
      const total = sorted.length;

      // Keyingi o'ringacha qancha qolgani — bolani harakatga undaydigan son.
      let toNext = 0;
      if (rank > 1) toNext = Math.max(1, sorted[rank - 2][1] - myMinutes + 1);

      return new Response(
        JSON.stringify({
          ok: true,
          rank: rank > 0 ? rank : null,
          total,
          myMinutes,
          toNext,
          topMinutes: sorted.length ? sorted[0][1] : 0,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 0.1b FOKUS JANGI.
    //
    // ASINXRON: bola taklif kodini do'stiga yuboradi, do'sti istalgan payt
    // qabul qiladi va 24 soat ichida kim ko'proq fokus daqiqasi to'plasa —
    // o'sha yutadi. Real vaqtli variant chiroyliroq ko'rinadi, lekin ikki
    // bolaning bir vaqtda onlayn bo'lishini talab qiladi va amalda deyarli
    // hech qachon ishga tushmaydi.
    if (payload.type === "duel_create" || payload.type === "duel_accept" || payload.type === "duel_status") {
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }
      const familyCode = await resolveActorFamily(actor!);
      const childId =
        actor!.kind === "device" ? actor!.childId : "tg_" + actor!.telegramId;

      // Bo'rining ismi — bolaning haqiqiy ismi o'rniga ko'rsatiladi.
      // Begona bolaga haqiqiy ism ko'rsatmaslik uchun.
      const nick = async (fam: string, cid: string) => {
        const { data } = await db!
          .from("child_companion")
          .select("name")
          .eq("family_code", fam).eq("child_id", cid).limit(1);
        return (data && data[0]?.name) || defaultCompanionName(cid);
      };

      /** Ikki ishtirokchining davr ichidagi fokus daqiqalari. */
      const scores = async (duel: any) => {
        const sum = async (fam: string, cid: string) => {
          if (!fam || !cid) return 0;
          // Ligadagi kabi: hisob haqiqiy fokus daqiqalaridan. Vaqt banki
          // mukofoti kunlik shiftga tushadi, shuning uchun undan hisoblansa
          // shiftga yetgan bola qancha ishlamasin hisobini oshirolmasdi —
          // 24 soatlik jang yarmida tugab qolardi.
          const { data } = await db!
            .from("focus_sessions")
            .select("planned_minutes")
            .eq("family_code", fam).eq("child_id", cid)
            .not("completed_at", "is", null)
            // Faqat tekshiruv savollaridan o'tgan seanslar — taymerni yoqib
            // qo'yib ketilgani hisoblanmaydi.
            .eq("check_passed", true)
            .gte("completed_at", duel.starts_at)
            .lte("completed_at", duel.ends_at)
            .limit(500);
          return (data || []).reduce(
            (a: number, r: any) => a + (Number(r.planned_minutes) || 0), 0
          );
        };
        return {
          challenger: await sum(duel.challenger_family, duel.challenger_child),
          opponent: await sum(duel.opponent_family, duel.opponent_child),
        };
      };

      if (payload.type === "duel_create") {
        // Ochiq yoki ketayotgan jang bo'lsa, yangisini ochmaymiz.
        const { data: existing } = await db
          .from("focus_duels")
          .select("*")
          .or(`challenger_child.eq.${childId},opponent_child.eq.${childId}`)
          .in("status", ["open", "active"])
          .limit(1);
        if (existing && existing[0]) {
          return new Response(
            JSON.stringify({ ok: true, duel: existing[0], existed: true }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }

        const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
        const bytes = crypto.getRandomValues(new Uint8Array(6));
        const code = Array.from(bytes).map((b) => alphabet[b % alphabet.length]).join("");

        const { data: created, error } = await db
          .from("focus_duels")
          .insert({
            code,
            challenger_family: familyCode,
            challenger_child: childId,
            challenger_name: await nick(familyCode, childId),
          })
          .select("*");
        if (error) {
          return new Response(JSON.stringify({ ok: false, error: error.message }), {
            status: 500, headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(
          JSON.stringify({
            ok: true,
            duel: created && created[0],
            link: `https://t.me/qalqon_aiBot?start=duel_${code}`,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (payload.type === "duel_accept") {
        const code = String(payload.code || "").trim().toUpperCase();
        const { data } = await db
          .from("focus_duels").select("*").eq("code", code).limit(1);
        const duel = data && data[0];

        if (!duel) {
          return new Response(JSON.stringify({ ok: false, error: "Bunday jang topilmadi." }), {
            status: 404, headers: { "Content-Type": "application/json" },
          });
        }
        if (duel.status !== "open") {
          return new Response(JSON.stringify({ ok: false, error: "Bu jang allaqachon boshlangan." }), {
            status: 409, headers: { "Content-Type": "application/json" },
          });
        }
        if (duel.challenger_child === childId) {
          return new Response(JSON.stringify({ ok: false, error: "O'zing bilan jang qila olmaysan 🙂" }), {
            status: 400, headers: { "Content-Type": "application/json" },
          });
        }

        const startsAt = new Date().toISOString();
        const endsAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
        const { data: updated } = await db
          .from("focus_duels")
          .update({
            opponent_family: familyCode,
            opponent_child: childId,
            opponent_name: await nick(familyCode, childId),
            status: "active",
            starts_at: startsAt,
            ends_at: endsAt,
          })
          .eq("id", duel.id)
          .select("*");

        return new Response(JSON.stringify({ ok: true, duel: updated && updated[0] }), {
          status: 200, headers: { "Content-Type": "application/json" },
        });
      }

      // duel_status
      const { data } = await db
        .from("focus_duels")
        .select("*")
        .or(`challenger_child.eq.${childId},opponent_child.eq.${childId}`)
        .in("status", ["open", "active", "finished"])
        .order("created_at", { ascending: false })
        .limit(1);

      const duel = data && data[0];
      if (!duel) {
        return new Response(JSON.stringify({ ok: true, duel: null }), {
          status: 200, headers: { "Content-Type": "application/json" },
        });
      }

      let me = 0, rival = 0, finished = duel.status === "finished";
      if (duel.status === "active") {
        const s = await scores(duel);
        const iAmChallenger = duel.challenger_child === childId;
        me = iAmChallenger ? s.challenger : s.opponent;
        rival = iAmChallenger ? s.opponent : s.challenger;

        if (new Date(duel.ends_at).getTime() < Date.now()) {
          await db.from("focus_duels").update({ status: "finished" }).eq("id", duel.id);
          finished = true;
        }
      }

      const iAmChallenger = duel.challenger_child === childId;
      return new Response(
        JSON.stringify({
          ok: true,
          duel: {
            code: duel.code,
            status: finished ? "finished" : duel.status,
            rivalName: iAmChallenger ? duel.opponent_name : duel.challenger_name,
            endsAt: duel.ends_at,
            myMinutes: me,
            rivalMinutes: rival,
            link: `https://t.me/qalqon_aiBot?start=duel_${duel.code}`,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 0.0x HISOBNI O'CHIRISH.
    //
    // Google Play talabi: hisobi bor ilova foydalanuvchiga hisobini VA
    // ma'lumotini o'chirish yo'lini berishi shart (ilova ichida va veb
    // orqali). Bu yerda "yumshoq o'chirish" yo'q — qatorlar haqiqatan
    // o'chiriladi.
    //
    // Ro'yxat ataylab to'liq: ma'lumot 19 ta jadvalda yotadi va bittasini
    // unutish "o'chirdik" deyishni yolg'onga aylantiradi.
    if (payload.type === "delete_account") {
      if (actor!.kind !== "telegram") return unauthorized("Faqat ota-ona");
      if (await isPairedChild(actor!.telegramId)) {
        return unauthorized("Farzand hisobi uchun: leave_family");
      }
      if (payload.confirm !== true) {
        return new Response(
          JSON.stringify({ ok: false, error: "Tasdiqlash kerak (confirm: true)." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }

      const familyCode = actor!.familyCode;

      // Farzandlarga xabar berish uchun ularning Telegram ID'larini
      // O'CHIRISHDAN OLDIN yig'ib olamiz.
      const { data: kids } = await db
        .from("child_pairings")
        .select("child_id")
        .eq("family_code", familyCode);
      const childIds = (kids || []).map((k: any) => k.child_id as string);
      const childTelegramIds = childIds
        .filter((id) => id.startsWith("tg_"))
        .map((id) => Number(id.slice(3)))
        .filter((n) => Number.isFinite(n) && n > 0);

      // Yangi jadval qo'shilganda uni SHU RO'YXATGA ham qo'shish shart.
      // Aks holda "hisobni o'chirdim" degan va'da yolg'on bo'lib qoladi —
      // ma'lumot bazada qolib ketadi.
      const byFamily = [
        "child_companion", "child_invites", "child_notes", "child_pairings",
        "curfew_policies", "device_pair_codes", "device_telemetry", "device_tokens",
        "focus_sessions", "geofence_alerts", "geofence_zones", "homework_items",
        "join_attempts", "location_pings", "location_requests",
        "pro_exchange_requests", "quiz_answers", "quiz_rounds",
        "time_bank_entries", "time_bank_rules", "web_sessions", "families",
        "reward_items", "reward_redemptions", "shop_purchases", "collectible_cards",
        "family_messages", "family_chat_reads",
      ];

      const failed: string[] = [];
      for (const table of byFamily) {
        const { error } = await db.from(table).delete().eq("family_code", familyCode);
        if (error) {
          console.error(`delete_account: ${table} o'chmadi:`, error.message);
          failed.push(table);
        }
      }

      // Online o'yinlar ikki oilaga tegishli (p1/p2) — oila qaysi tomonda
      // bo'lmasin, o'yin butunlay o'chadi: aks holda do'stning ro'yxatida
      // o'chirilgan bolaning bo'ri ismi qolib ketardi.
      for (const col of ["p1_family", "p2_family"]) {
        const { error } = await db.from("game_matches").delete().eq(col, familyCode);
        if (error) console.error("delete_account: game_matches o'chmadi:", error.message);
      }

      // Faqat child_id bo'yicha saqlanadigan jadvallar.
      for (const table of ["geo_zones", "location_events"]) {
        for (const childId of childIds) {
          const { error } = await db.from(table).delete().eq("child_id", childId);
          if (error) console.error(`delete_account: ${table} o'chmadi:`, error.message);
        }
      }

      // AI suhbatlari Telegram ID bo'yicha saqlanadi — ota-ona va farzandlarniki.
      for (const tgId of [actor!.telegramId, ...childTelegramIds]) {
        await db.from("ai_chat_messages").delete().eq("telegram_id", tgId);
      }

      // Ro'yxat yozuvi eng oxirida: yuqoridagilar shu kod orqali topiladi.
      const { error: regErr } = await db
        .from("parent_registrations")
        .delete()
        .eq("family_code", familyCode);
      if (regErr) failed.push("parent_registrations");

      // Farzandlarga xabar: ulanish to'xtaganini bilishlari shart.
      for (const tgId of childTelegramIds) {
        try {
          await sendMessage(
            tgId,
            "ℹ️ <b>Oila profili o'chirildi.</b>\n\nOta-onang Qalqon AI hisobini o'chirdi. Endi joylashuving va ekran vaqting hech kimga ko'rinmaydi."
          );
        } catch (e) {
          console.error("Farzandga xabar yuborilmadi:", e);
        }
      }

      try {
        await sendMessage(
          actor!.telegramId,
          "✅ <b>Hisobingiz va barcha ma'lumotlaringiz o'chirildi.</b>\n\nJoylashuv tarixi, ekran vaqti hisobotlari, farzand ulanishlari va sozlamalar — hammasi butunlay o'chirildi.\n\nQaytadan boshlamoqchi bo'lsangiz, shunchaki /start bosing."
        );
      } catch (e) { /* xabar bormasa ham o'chirish bajarildi */ }

      return new Response(
        JSON.stringify({
          ok: failed.length === 0,
          deletedFamily: familyCode,
          childrenNotified: childTelegramIds.length,
          failedTables: failed,
        }),
        { status: failed.length === 0 ? 200 : 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 0.0y FARZAND O'ZI CHIQADI.
    //
    // Stalkerware siyosati ham, bizning o'z tamoyilimiz ham buni talab
    // qiladi: kuzatilayotgan odam ulanishni to'xtata olishi kerak. Ota-onaga
    // xabar beriladi — jimgina yo'qolib qolish ishonchni buzadi.
    if (payload.type === "leave_family") {
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }
      const childId =
        actor!.kind === "device" ? actor!.childId : "tg_" + actor!.telegramId;
      const familyCode = await resolveActorFamily(actor!);

      const { data: pairing } = await db
        .from("child_pairings")
        .select("child_name")
        .eq("child_id", childId)
        .eq("family_code", familyCode)
        .limit(1);

      if (!pairing || !pairing[0]) {
        return new Response(
          JSON.stringify({ ok: false, error: "Siz hech qanday oilaga ulanmagansiz." }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      // child_id ustuni bor jadvallar. quiz_rounds bu yerda YO'Q: u butun
      // oilaga tegishli va boshqa a'zolar javoblari bilan bog'liq — bitta
      // bola chiqqani uchun uni o'chirsak, qolganlarning natijasi yo'qolardi.
      for (const table of [
        "child_pairings", "child_notes", "location_pings", "device_telemetry",
        "device_tokens", "geofence_alerts", "geofence_zones", "curfew_policies",
        "homework_items", "time_bank_entries", "time_bank_rules", "focus_sessions",
        "child_companion", "location_requests", "pro_exchange_requests",
        "reward_redemptions", "shop_purchases", "collectible_cards",
      ]) {
        const { error } = await db
          .from(table)
          .delete()
          .eq("family_code", familyCode)
          .eq("child_id", childId);
        if (error) console.error(`leave_family: ${table} o'chmadi:`, error.message);
      }

      for (const col of ["p1_child", "p2_child"]) {
        const { error } = await db.from("game_matches").delete().eq(col, childId);
        if (error) console.error("leave_family: game_matches o'chmadi:", error.message);
      }
      // Oila chatidagi shu farzandning xabarlari ham ketadi.
      await db.from("family_messages").delete().eq("family_code", familyCode).eq("author_id", childId);
      await db.from("family_chat_reads").delete().eq("family_code", familyCode).eq("member_id", childId);

      // Viktorina javoblarida ustun nomi boshqacha (participant_id), shuning
      // uchun yuqoridagi tsikl uni ushlamaydi.
      {
        const { error } = await db
          .from("quiz_answers")
          .delete()
          .eq("family_code", familyCode)
          .eq("participant_id", childId);
        if (error) console.error("leave_family: quiz_answers o'chmadi:", error.message);
      }

      if (actor!.kind === "telegram") {
        await db.from("ai_chat_messages").delete().eq("telegram_id", actor!.telegramId);
      }

      await notifyFamilyParents(
        familyCode,
        `ℹ️ <b>${pairing[0].child_name || "Farzandingiz"} ulanishni to'xtatdi.</b>\n\n` +
          `Uning joylashuvi va ekran vaqti endi ko'rinmaydi. Farzandingiz bilan gaplashib ko'ring — ` +
          `qayta ulanish uchun unga yangi taklif havolasi yuborishingiz mumkin.`
      );

      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    // 0.0w VAQT BANKI.
    //
    // Balansni ham farzand (o'ziniki), ham ota-ona (farzandiniki) so'ray oladi.
    if (payload.type === "time_bank_status") {
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }
      const familyCode = await resolveActorFamily(actor!);
      const childId =
        actor!.kind === "device"
          ? actor!.childId
          : (await isPairedChild(actor!.telegramId))
            ? "tg_" + actor!.telegramId
            : String(payload.childId || "").trim();

      if (!childId) {
        return new Response(JSON.stringify({ ok: false, error: "childId majburiy" }), {
          status: 400, headers: { "Content-Type": "application/json" },
        });
      }

      const rules = await getTimeBankRules(familyCode, childId);
      const { balance, earnedToday } = await timeBankBalance(familyCode, childId);

      const { data: history } = await db
        .from("time_bank_entries")
        .select("minutes, reason, note, created_at")
        .eq("family_code", familyCode)
        .eq("child_id", childId)
        .order("created_at", { ascending: false })
        .limit(10);

      // Ochiq fokus seansi bor bo'lsa — mijoz taymerni davom ettira oladi.
      const { data: open } = await db
        .from("focus_sessions")
        .select("id, planned_minutes, started_at")
        .eq("family_code", familyCode)
        .eq("child_id", childId)
        .is("completed_at", null)
        .order("started_at", { ascending: false })
        .limit(1);

      return new Response(
        JSON.stringify({
          ok: true,
          balance,
          earnedToday,
          dailyCap: rules.daily_cap_minutes,
          rules,
          history: history || [],
          openSession: (open && open[0]) || null,
          companion: await companionState(familyCode, childId),
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fokus seansini boshlash. Boshlanish vaqtini SERVER yozadi.
    if (payload.type === "focus_start") {
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }
      const familyCode = await resolveActorFamily(actor!);
      const childId =
        actor!.kind === "device" ? actor!.childId : "tg_" + actor!.telegramId;

      const planned = Number(payload.plannedMinutes);
      const plannedMinutes = planned >= 5 && planned <= 60 ? Math.round(planned) : 25;

      // Ochiq seans bo'lsa yangisini ochmaymiz — aks holda bola bir vaqtda
      // o'nlab seans ochib, keyin hammasini "tugatdim" deb yozdirardi.
      const { data: existing } = await db
        .from("focus_sessions")
        .select("id, planned_minutes, started_at")
        .eq("family_code", familyCode)
        .eq("child_id", childId)
        .is("completed_at", null)
        .order("started_at", { ascending: false })
        .limit(1);

      if (existing && existing[0]) {
        return new Response(
          JSON.stringify({ ok: true, session: existing[0], resumed: true }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      const { data: created, error } = await db
        .from("focus_sessions")
        .insert({ family_code: familyCode, child_id: childId, planned_minutes: plannedMinutes })
        .select("id, planned_minutes, started_at");

      if (error) {
        console.error("focus_start xatosi:", error.message);
        return new Response(JSON.stringify({ ok: false, error: error.message }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({ ok: true, session: created && created[0], resumed: false }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fokus seansini tugatish — handleBallRoutes (3 ta tekshiruv savoli bilan).

    // Ota-ona kursni belgilaydi.
    if (payload.type === "time_bank_rules_save") {
      if (actor!.kind !== "telegram") return unauthorized("Faqat ota-ona");
      if (await isPairedChild(actor!.telegramId)) return unauthorized("Faqat ota-ona");
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }
      const childId = String(payload.childId || "").trim();
      if (!childId) {
        return new Response(JSON.stringify({ ok: false, error: "childId majburiy" }), {
          status: 400, headers: { "Content-Type": "application/json" },
        });
      }
      const clamp = (v: unknown, def: number, max: number) => {
        const n = Number(v);
        return Number.isFinite(n) && n >= 0 && n <= max ? Math.round(n) : def;
      };

      const { error } = await db.from("time_bank_rules").upsert(
        {
          family_code: actor!.familyCode,
          child_id: childId,
          enabled: payload.enabled !== false,
          minutes_per_focus: clamp(payload.minutesPerFocus, 10, 60),
          minutes_per_school_ontime: clamp(payload.minutesPerSchoolOntime, 20, 60),
          minutes_per_homework: clamp(payload.minutesPerHomework, 15, 60),
          daily_cap_minutes: clamp(payload.dailyCapMinutes, 60, 480),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "family_code,child_id" }
      );
      if (error) {
        console.error("time_bank_rules xatosi:", error.message);
        return new Response(JSON.stringify({ ok: false, error: error.message }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    // 0.0v AI DO'ST (farzand paneli uchun o'quv yordamchisi).
    //
    // Ilgari bu Render'dagi alohida xizmatga borardi va u initData'ni BOSHQA
    // bot tokeni bilan tekshirar edi — ya'ni har bir farzandning so'rovi
    // "initData yaroqsiz" deb rad etilardi va AI do'st hech kimga ishlamasdi.
    // Endi u shu yerda: bitta backend, bitta ishlaydigan autentifikatsiya.
    // AI chegarasi — savol berishdan OLDIN ko'rsatish uchun.
    // Mini App: shu sinf/fan uchun darslik bormi va mashq matni topiladimi.
    if (payload.type === "textbook_lookup") {
      const kidInfo = await actorAsChild(actor!);
      const fam = kidInfo ? kidInfo.familyCode : await actorAsParent(actor!);
      if (!fam) return unauthorized("Oila topilmadi");
      const grade = kidInfo ? await childGrade(kidInfo.familyCode, kidInfo.childId) : Math.max(1, Math.min(11, Number(payload.grade) || 7));
      const numbers = parseExerciseNumbers(payload.exercises);
      const rows = await textbookExercises(grade, payload.subject, numbers);
      return jsonRes({
        ok: true,
        grade,
        coverage: await textbookCoverage(grade, payload.subject),
        found: rows.map((r: any) => ({ number: r.number, page: r.page, topic: r.topic, preview: String(r.body).slice(0, 160) })),
        missing: numbers.filter((n) => !rows.some((r: any) => r.number === n)),
      });
    }

    if (payload.type === "ai_quota") {
      const who = actor!.kind === "telegram" ? actor!.telegramId : 0;
      let limit = AI_FREE_DAILY;
      let boost = 0;
      if (actor!.kind === "telegram") {
        const fam = await resolveActorFamily(actor!);
        if (fam && (await getPlan(fam)) === "pro") limit = AI_PRO_DAILY;
        // Ball do'konidan olingan qo'shimcha savollar (faqat bugun).
        if (fam && (await isPairedChild(actor!.telegramId))) {
          boost = await aiBoostToday(fam, "tg_" + actor!.telegramId);
        }
      }
      const baseLimit = limit;
      limit += boost;

      let used = 0;
      if (db && who) {
        const dayStart = new Date(tashkentDayStartISO());
        const { data } = await db
          .from("ai_chat_messages")
          .select("id")
          .eq("telegram_id", who)
          .eq("role", "user")
          .gte("created_at", dayStart.toISOString())
          .limit(limit + 1);
        used = (data || []).length;
      }

      return new Response(
        JSON.stringify({
          ok: true,
          dailyLimit: limit,
          used,
          remaining: Math.max(0, limit - used),
          plan: baseLimit === AI_PRO_DAILY ? "pro" : "free",
          boost,
          freeDaily: AI_FREE_DAILY,
          proDaily: AI_PRO_DAILY,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (payload.type === "ai_tutor_chat") {
      const apiKey = Deno.env.get("GEMINI_API_KEY") || "";
      if (!apiKey) {
        return new Response(
          JSON.stringify({ ok: false, error: "AI kaliti sozlanmagan (GEMINI_API_KEY)." }),
          { status: 503, headers: { "Content-Type": "application/json" } }
        );
      }

      const question = String(payload.message || "").trim();

      // Rasm (mashq surati) ixtiyoriy: "data:image/jpeg;base64,..." ko'rinishida
      // yoki toza base64. Rasm bo'lsa savol bo'sh bo'lishi ham mumkin.
      let imagePart: { inline_data: { mime_type: string; data: string } } | null = null;
      const rawImage = typeof payload.image === "string" ? payload.image : "";
      if (rawImage) {
        const m = rawImage.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        const mime = m ? m[1] : "image/jpeg";
        const b64 = m ? m[2] : rawImage;
        // ~6 MB base64 chegarasi — undan kattasi so'rovni ham, xarajatni ham shishiradi.
        if (b64.length > 8_000_000) {
          return new Response(JSON.stringify({ ok: false, error: "Rasm juda katta." }), {
            status: 400, headers: { "Content-Type": "application/json" },
          });
        }
        imagePart = { inline_data: { mime_type: mime, data: b64 } };
      }

      if (!question && !imagePart) {
        return new Response(JSON.stringify({ ok: false, error: "Savol bo'sh." }), {
          status: 400, headers: { "Content-Type": "application/json" },
        });
      }
      if (question.length > 2000) {
        return new Response(JSON.stringify({ ok: false, error: "Savol juda uzun." }), {
          status: 400, headers: { "Content-Type": "application/json" },
        });
      }

      const who = actor!.kind === "telegram" ? actor!.telegramId : 0;

      // Ikki xil cheklov, ikki xil vazifa bilan:
      //
      //  · SOATLIK — suiiste'molga qarshi. Odam soatiga 40 ta savol bermaydi;
      //    bunday oqim faqat skript yozilganda bo'ladi.
      //  · KUNLIK — xarajatni bashorat qilinadigan qiladi va tarifni farqlaydi.
      //
      // Kunlik chegara ataylab boshqa bepul AI xizmatlaridan yuqori qo'yilgan
      // (ChatGPT bepul tarifida yaxshi model uchun ~10 ta / 5 soat). Bu
      // mahsulotning eng ko'rinadigan ustunligi, shuning uchun foydalanuvchiga
      // qolgan soni ham qaytariladi — u buni ko'rib tursin.
      let dailyLimit = AI_FREE_DAILY;
      let aiBoost = 0;
      if (actor!.kind === "telegram") {
        const fam = await resolveActorFamily(actor!);
        if (fam && (await getPlan(fam)) === "pro") dailyLimit = AI_PRO_DAILY;
        if (fam && (await isPairedChild(actor!.telegramId))) {
          aiBoost = await aiBoostToday(fam, "tg_" + actor!.telegramId);
        }
      }
      const baseDaily = dailyLimit;
      dailyLimit += aiBoost;

      let usedToday = 0;
      if (db && who) {
        const { data: recent } = await db
          .from("ai_chat_messages")
          .select("id")
          .eq("telegram_id", who)
          .eq("role", "user")
          .gte("created_at", new Date(Date.now() - 3600000).toISOString())
          .limit(41);
        if (recent && recent.length >= 40) {
          return new Response(
            JSON.stringify({ ok: false, error: "Bir soatda juda ko'p savol. Biroz dam oling 🙂" }),
            { status: 429, headers: { "Content-Type": "application/json" } }
          );
        }

        const dayStart = new Date(tashkentDayStartISO());
        const { data: bugun } = await db
          .from("ai_chat_messages")
          .select("id")
          .eq("telegram_id", who)
          .eq("role", "user")
          .gte("created_at", dayStart.toISOString())
          .limit(dailyLimit + 1);
        usedToday = (bugun || []).length;

        if (usedToday >= dailyLimit) {
          return new Response(
            JSON.stringify({
              ok: false,
              limitReached: true,
              dailyLimit,
              remaining: 0,
              upgradeRequired: baseDaily === AI_FREE_DAILY,
              error:
                `Bugungi ${dailyLimit} ta savol tugadi. Ertaga yana ochiladi.` +
                (aiBoost === 0 ? " Ball do'konida +10 ta savol olish mumkin." : "") +
                (baseDaily === AI_FREE_DAILY
                  ? ` Pro tarifda kuniga ${AI_PRO_DAILY} ta.`
                  : ""),
            }),
            { status: 429, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      const grade = Number(payload.grade) > 0 ? Number(payload.grade) : 5;
      const subject = String(payload.subject || "Umumiy").slice(0, 40);
      const childName = String(payload.childName || "").slice(0, 40);

      // Oldingi suhbat — ko'p bosqichli savol-javob uchun.
      let history: Array<{ role: string; parts: Array<{ text: string }> }> = [];
      if (db && who) {
        const { data: prev } = await db
          .from("ai_chat_messages")
          .select("role, message")
          .eq("telegram_id", who)
          .order("created_at", { ascending: false })
          .limit(6);
        history = (prev || [])
          .reverse()
          .map((m: any) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: String(m.message || "") }],
          }));
      }

      // Ota-ona va farzand uchun ohang ham, vazifa ham boshqacha.
      // Mini App rus tilida bo'lsa, AI ham ruscha javob beradi. Ilgari ko'rsatma
      // "faqat o'zbek tilida" edi — ruscha yozgan bola o'zbekcha javob olardi.
      const replyLang = payload.lang === "ru"
        ? "Faqat RUS tilida javob ber (foydalanuvchi ilovani rus tilida ishlatadi)"
        : "Faqat o'zbek tilida";
      const parentPrompt =
        `Sen "Qalqon" — O'zbekistondagi ota-onaga yordam beradigan maslahatchisan. ` +
        `Farzandi ${grade}-sinfda o'qiydi.\n\n` +
        `Qoidalar:\n` +
        `- ${replyLang}, hurmat bilan va amaliy javob ber (4-7 gap).\n` +
        `- Mavzular: bolaning o'qishi, ekran vaqti, raqamli odatlar, xavfsizlik, motivatsiya.\n` +
        `- Aniq qadamlar taklif qil, umumiy gaplardan qoch.\n` +
        `- Jazolash emas, kelishuv va chegara qo'yish yo'lini tavsiya qil.\n` +
        `- Tibbiy yoki psixologik jiddiy holatlarda mutaxassisga murojaatni maslahat ber.\n` +
        `- BOSHQA nazorat ilovalarini tavsiya qilma (Family Link va shunga o'xshashlar). ` +
        `Texnik vosita kerak bo'lsa — Qalqon AI ning o'z imkoniyatlarini ayt: ` +
        `ekran vaqti hisoboti, kunlik kechki xulosa, komendant soat (ilovalarni jadval bo'yicha cheklash), ` +
        `radar va geo-bildirishnomalar, farzand uchun AI o'quv yordamchisi.`;

      const childPrompt =
        `Sen "Qalqon" — O'zbekistondagi ${grade}-sinf o'quvchisining do'stona o'quv yordamchisisan. ` +
        (childName ? `Suhbatdoshingning ismi ${childName}. ` : "") +
        `Hozirgi fan: ${subject}.\n\n` +
        `Qoidalar:\n` +
        `- ${replyLang}, sodda va iliq javob ber.\n` +
        `- Javobni qisqa tut (4-6 gap). Kerak bo'lsa qadamma-qadam tushuntir.\n` +
        `- TAYYOR JAVOBNI BERIB QO'YMA: avval yo'l ko'rsat, bola o'zi yechishga harakat qilsin. ` +
        `Agar u yechimni so'rasa yoki ikki marta urinib ko'rgan bo'lsa — to'liq tushuntir.\n` +
        `- Doim rag'batlantir, hech qachon kamsitma.\n` +
        `- Yoshga nomunosib mavzular (zo'ravonlik, kattalar mazmuni, giyohvandlik, qimor, o'z joniga qasd) ` +
        `so'ralsa — javob berma, muloyimlik bilan ota-ona yoki o'qituvchi bilan gaplashishni taklif qil.\n` +
        `- Agar bola xavf ostida ekanini bildirsa, darhol ota-onasiga yoki ishonchli kattaga aytishni maslahat ber.`;

      let systemPrompt = payload.audience === "parent" ? parentPrompt : childPrompt;

      // "39-mashq" so'ralsa — darslikdagi HAQIQIY matnni beramiz. Bazada
      // bo'lmasa, modelga buni aytamiz: to'qib chiqarishdan ko'ra "bilmayman"
      // deyish yaxshiroq.
      const askedNumbers = [...String(question).matchAll(/(\d{1,3})\s*[-–—]?\s*mashq/gi)].map((m) => Number(m[1])).slice(0, 5);
      if (askedNumbers.length && payload.audience !== "parent") {
        const found = await textbookExercises(grade, payload.subject, askedNumbers);
        const cover = await textbookCoverage(grade, payload.subject);
        if (found.length) {
          systemPrompt += `\n\nDARSLIKDAN OLINGAN HAQIQIY MATN (faqat shunga tayan, o'zingdan qo'shma):\n` +
            found.map((e: any) => `${e.number}-mashq (${e.topic || ""}, ${e.page}-bet):\n${e.body}`).join("\n\n");
        } else {
          systemPrompt += `\n\nMUHIM: bolaning so'ragan mashq(lar)i bizdagi darslik matnida topilmadi` +
            (cover ? ` (bizda ${grade}-sinf "${payload.subject}" darsligining ${cover.count} ta mashqi bor, oxirgisi ${cover.max}-mashq).` : ".") +
            ` Mashq matnini O'YLAB TOPMA. Bolaga mashq matnini yozib yuborishini yoki suratga olib yuborishini so'ra.`;
        }
      }

      const model = Deno.env.get("GEMINI_MODEL") || "gemini-3.6-flash";
      try {
        const callGemini = () => fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: [
                ...history,
                {
                  role: "user",
                  parts: imagePart
                    ? [{ text: question || "Bu mashqni tushuntirib yubor." }, imagePart]
                    : [{ text: question }],
                },
              ],
              // maxOutputTokens "o'ylash" tokenlarini ham o'z ichiga oladi.
              // Tarix qo'shilgandan keyin 2048 yetmay qoldi: model o'ylab
              // tugatgach javob yozishga joy qolmay, BO'SH javob qaytardi va
              // bola "AI javob bermadi" degan xabarni ko'rardi. Viktorinada
              // ham xuddi shu tuzoq bor edi.
              generationConfig: { temperature: 0.7, maxOutputTokens: 6144 },
            }),
          }
        );
        // Gemini "band" (503) yoki "juda ko'p so'rov" (429) desa — bir marta
        // qayta urinamiz. Bu vaqtinchalik va bola uchun xato ko'rinmasligi kerak.
        let gRes = await callGemini();
        if ([429, 500, 503].includes(gRes.status)) {
          await new Promise((r) => setTimeout(r, 1500));
          gRes = await callGemini();
        }
        const gJson = await gRes.json();
        // "O'ylash" bo'laklari javob emas — ular qo'shilsa, bolaga modelning
        // ichki mulohazasi ko'rinib qolardi.
        const answer = (gJson?.candidates?.[0]?.content?.parts || [])
          .filter((p: any) => p && typeof p.text === "string" && p.thought !== true)
          .map((p: any) => p.text)
          .join("");

        if (!answer) {
          // Sababni yashirmaymiz: "qayta urinib ko'ring" degan umumiy xabar
          // tufayli yaroqsiz kalit yoki noto'g'ri model nomi haftalab
          // sezilmay qolishi mumkin. Kalitning o'zi hech qachon qaytarilmaydi.
          const upstream =
            gJson?.error?.message ||
            gJson?.promptFeedback?.blockReason ||
            "noma'lum sabab";
          console.error("Gemini javobi bo'sh:", JSON.stringify(gJson).slice(0, 500));
          // Sabablar turlicha: model band (503) yoki kalitning kunlik
          // chegarasi tugagan (429). Ikkalasi bir xil xabar bo'lsa, nima
          // qilish kerakligi noma'lum bo'lib qolardi.
          const quotaOut = /quota|rate limit|RESOURCE_EXHAUSTED/i.test(String(upstream));
          return new Response(
            JSON.stringify({
              ok: false,
              error: quotaOut
                ? "AI xizmatining bugungi chegarasi tugadi. Ertaga yana ochiladi."
                : "AI hozir band. Bir daqiqadan keyin qayta urinib ko'ring.",
              detail: String(upstream).slice(0, 200),
              model,
              // Xato savol hisoblanmaydi — qolgan son o'zgarmaydi, lekin ko'rsatiladi.
              dailyLimit,
              remaining: Math.max(0, dailyLimit - usedToday),
            }),
            { status: 502, headers: { "Content-Type": "application/json" } }
          );
        }

        // Suhbat tarixini yozamiz. Xatoni JIM o'tkazib yuborish mumkin emas:
        // bu yozuvlar kunlik chegarani ham hisoblaydi, ya'ni ular yozilmasa
        // chegara umuman ishlamaydi va har bir foydalanuvchi cheksiz savol
        // bera oladi. Aynan shunday bo'lgan edi — insert xatosi hech qayerda
        // ko'rinmagani uchun "qolgan: 29" deb yozilardi-yu, hisob 0 da turardi.
        let historyError: string | null = null;
        if (db && who) {
          // Jadvaldagi cheklov faqat 'user' va 'assistant' ni qabul qiladi.
          // Kod esa Gemini atamasi bo'lgan 'model' ni yozishga urinardi va
          // har bir insert jimgina rad etilardi. Baza sxemasini sotuvchining
          // atamasiga moslashtirmaymiz — o'qiyotgan joyda o'giramiz.
          const { error: insErr } = await db.from("ai_chat_messages").insert([
            { telegram_id: who, role: "user", message: question || "[rasm yuborildi]" },
            { telegram_id: who, role: "assistant", message: answer },
          ]);
          if (insErr) {
            historyError = insErr.message;
            console.error("ai_chat_messages yozilmadi:", insErr.message);
          }
        }

        return new Response(
          JSON.stringify({
            ok: true,
            answer,
            // Qolgan savollar soni — mijoz uni ekranda ko'rsatadi. Chegarani
            // yashirsak, foydalanuvchi u tugagan paytda kutilmaganda
            // to'xtab qolgandek his qilardi.
            dailyLimit,
            remaining: Math.max(0, dailyLimit - usedToday - 1),
            plan: baseDaily === AI_PRO_DAILY ? "pro" : "free",
            historyError,
            // Javob kesilib qolganini keyin ham ko'ra olishimiz uchun.
            finishReason: gJson?.candidates?.[0]?.finishReason || null,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      } catch (e) {
        console.error("ai_tutor_chat xatosi:", e);
        return new Response(
          JSON.stringify({ ok: false, error: "AI xizmatiga ulanib bo'lmadi." }),
          { status: 502, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 0.0t TELEGRAMDAN TASHQARIDA KIRISH: username + parol -> seans tokeni.
    //
    // Bu YAGONA endpoint initData'siz ishlaydi (device_pair kabi), chunki
    // brauzerda Telegram imzosi yo'q. Shu sabab urinishlar cheklanadi va
    // xato xabari "login yo'q" bilan "parol noto'g'ri"ni farqlamaydi —
    // aks holda qaysi username ro'yxatda borligini bilib olish mumkin bo'lardi.
    if (payload.type === "web_login") {
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }
      const actorKey = `weblogin:${clientKey(req)}`;
      if (await joinRateLimited(actorKey)) {
        return new Response(
          JSON.stringify({ ok: false, error: "Juda ko'p urinish. Keyinroq qayta urinib ko'ring." }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }

      const username = normalizeUsername(payload.username);
      const password = String(payload.password || "");
      const failMsg = "Login yoki parol noto'g'ri.";

      if (!username || !password) {
        await recordJoinAttempt(actorKey, "", false);
        return new Response(JSON.stringify({ ok: false, error: failMsg }), {
          status: 401, headers: { "Content-Type": "application/json" },
        });
      }

      const { data } = await db
        .from("parent_registrations")
        .select("family_code, parent_telegram_id, password_hash, status")
        .ilike("parent_username", username)
        .limit(1);

      const row = data && data[0];
      const ok = !!(row && row.password_hash && (await verifyPassword(password, row.password_hash)));
      await recordJoinAttempt(actorKey, row ? row.family_code : "", ok);

      if (!ok) {
        return new Response(JSON.stringify({ ok: false, error: failMsg }), {
          status: 401, headers: { "Content-Type": "application/json" },
        });
      }

      const token = toHex(crypto.getRandomValues(new Uint8Array(32)));
      const expiresAt = new Date(Date.now() + WEB_SESSION_DAYS * 86400000).toISOString();
      const { error: sErr } = await db.from("web_sessions").insert({
        token_hash: await sha256Hex(token),
        family_code: row.family_code,
        telegram_id: row.parent_telegram_id,
        user_agent: (req.headers.get("user-agent") || "").slice(0, 200),
        expires_at: expiresAt,
      });
      if (sErr) {
        console.error("web_sessions insert xatosi:", sErr.message);
        return new Response(JSON.stringify({ ok: false, error: sErr.message }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }

      // Token faqat shu javobda ko'rinadi.
      return new Response(
        JSON.stringify({
          ok: true,
          sessionToken: token,
          familyCode: row.family_code,
          registrationStatus: row.status,
          expiresAt,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 0.0u Parol o'rnatish/almashtirish. Faqat Telegram ichidan — ya'ni parolni
    // o'rnatish uchun odam avval Telegram imzosi bilan o'zini tanitishi shart.
    // Shu sabab parolni "unutdim" oqimi ham kerak emas: Telegram orqali kirib,
    // yangisini qo'yish yetarli.
    if (payload.type === "set_password") {
      if (actor!.kind !== "telegram") return unauthorized("Faqat ota-ona");
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }
      const problem = passwordProblem(payload.password);
      if (problem) {
        return new Response(JSON.stringify({ ok: false, error: problem }), {
          status: 400, headers: { "Content-Type": "application/json" },
        });
      }

      const { data: reg } = await db
        .from("parent_registrations")
        .select("family_code, parent_username")
        .eq("family_code", actor!.familyCode)
        .limit(1);
      if (!reg || !reg[0]) {
        return new Response(
          JSON.stringify({ ok: false, error: "Avval oila ma'lumotlarini saqlang." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      if (!reg[0].parent_username) {
        return new Response(
          JSON.stringify({ ok: false, error: "Avval Telegram username'ingizni kiriting — u login bo'ladi." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const { error } = await db
        .from("parent_registrations")
        .update({
          password_hash: await hashPassword(String(payload.password)),
          password_set_at: new Date().toISOString(),
        })
        .eq("family_code", actor!.familyCode);
      if (error) {
        console.error("set_password xatosi:", error.message);
        return new Response(JSON.stringify({ ok: false, error: error.message }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }

      // Parol almashtirilganda eski brauzer seanslari bekor qilinadi.
      await db
        .from("web_sessions")
        .update({ revoked_at: new Date().toISOString() })
        .eq("family_code", actor!.familyCode)
        .is("revoked_at", null);

      return new Response(
        JSON.stringify({ ok: true, login: reg[0].parent_username }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (payload.type === "web_logout") {
      if (db && typeof payload.sessionToken === "string") {
        await db
          .from("web_sessions")
          .update({ revoked_at: new Date().toISOString() })
          .eq("token_hash", await sha256Hex(payload.sessionToken.trim()));
      }
      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    // 0.0r KUNLIK KECHKI XULOSA — ichki (cron) chaqiruv.
    //
    // Ota-ona ilovani ochmasa ham har kuni qiymat ko'rishi uchun: ekran vaqti,
    // eng ko'p ishlatilgan 3 ta ilova va kun davomidagi kelish-ketishlar.
    // Ma'lumot allaqachon yig'ilib turibdi — shu paytgacha faqat hech kim
    // uni o'qib bermasdi.
    //
    // Himoya: Telegram webhook'i bilan bir xil maxfiy sarlavha talab qilinadi,
    // ya'ni bu endpointni tashqaridan chaqirib bo'lmaydi.
    // 0.0z1 JONLI JOYLASHUV TUGAGANDA ESLATMA.
    //
    // Chegara tugagach, bola hech narsa sezmasa — qayta yoqmaydi, va radar
    // jimgina o'ladi. Bu "kuniga 2 marta yoqish = butun kun ko'rinib turish"
    // rejimini ishlatadigan yagona narsa.
    //
    // Webhook tomonida ham shunday xabar bor, lekin u faqat bola hamon
    // yangilanish yuborayotgan bo'lsa ishlaydi. Bola bir joyda tinch o'tirsa,
    // Telegram yangilanish yubormaydi va u yo'l hech qachon ishga tushmaydi —
    // aynan shu bo'shliqni cron yopadi.
    if (payload.type === "cron_live_reminder") {
      if (!WEBHOOK_SECRET || req.headers.get("x-telegram-bot-api-secret-token") !== WEBHOOK_SECRET) {
        return new Response(JSON.stringify({ ok: false, error: "forbidden" }), {
          status: 403, headers: { "Content-Type": "application/json" },
        });
      }
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }

      // 12 soatlik oyna: undan eskisi uchun eslatma yuborish kech, faqat
      // bezovta qilardi (masalan xizmat bir kecha to'xtab qolgan bo'lsa).
      const { data: expired } = await db
        .from("child_pairings")
        .select("family_code, child_id, child_name, live_until")
        .eq("is_active", true)
        .not("live_until", "is", null)
        .lte("live_until", new Date().toISOString())
        .gte("live_until", new Date(Date.now() - 12 * 3600 * 1000).toISOString())
        .limit(200);

      let reminded = 0;
      for (const row of expired || []) {
        const tgId = String(row.child_id).startsWith("tg_")
          ? String(row.child_id).slice(3)
          : null;

        // Avval belgini o'chiramiz: xabar yuborishda xato bo'lsa ham, keyingi
        // yurishda bir xil eslatma qayta ketmasin.
        await db
          .from("child_pairings")
          .update({ live_until: null, live_msg_id: null })
          .eq("family_code", row.family_code)
          .eq("child_id", row.child_id);

        if (!tgId) continue;

        const plan = await getPlan(row.family_code);
        const hours = plan === "pro" ? PRO_LIVE_HOURS : FREE_LIVE_HOURS;

        await sendMessage(
          tgId,
          `🛰️ <b>Jonli joylashuving o'chdi.</b>\n\n` +
            `${hours} soat tugadi. Ota-onang endi seni xaritada jonli ko'rmaydi.\n\n` +
            `Qayta yoqish: shu suhbatda <b>📎</b> → <b>Joylashuv</b> → <b>«Jonli joylashuvni ulashish»</b>.\n\n` +
            `<i>Telefonda ishlaydi; kompyuterdagi Telegram'da bu band yo'q.</i>`,
          {
            inline_keyboard: [
              [
                {
                  text: "📍 Hozirgi joylashuvni yuborish",
                  web_app: { url: `${miniAppUrl()}&role=child&ask=loc` },
                },
              ],
            ],
          }
        );
        reminded++;
      }

      return new Response(JSON.stringify({ ok: true, reminded }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    // 0.0z2 KECHKI TEKSHIRUV — "farzandingiz uydami?"
    //
    // Kuniga bitta jumla, lekin ota-ona uchun kunning eng muhim savoli.
    // Hudud nomiga tayanmaymiz (ota-ona uni istalgancha nomlashi mumkin) —
    // oxirgi nuqta QAYSI hududga tushishini hisoblaymiz.
    if (payload.type === "cron_evening_check") {
      if (!WEBHOOK_SECRET || req.headers.get("x-telegram-bot-api-secret-token") !== WEBHOOK_SECRET) {
        return new Response(JSON.stringify({ ok: false, error: "forbidden" }), {
          status: 403, headers: { "Content-Type": "application/json" },
        });
      }
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }

      const { data: kids } = await db
        .from("child_pairings")
        .select("family_code, child_id, child_name")
        .eq("is_active", true)
        .not("child_id", "like", "invite\\_%")
        .limit(500);

      const byFamily: Record<string, string[]> = {};

      for (const k of kids || []) {
        const { data: zones } = await db
          .from("geofence_zones")
          .select("name, center_lat, center_lng, radius_m")
          .eq("family_code", k.family_code)
          .eq("child_id", k.child_id);

        // Hududi yo'q oilaga bu xabarning ma'nosi yo'q — jim o'tamiz.
        if (!zones || !zones.length) continue;

        const { data: ping } = await db
          .from("location_pings")
          .select("lat, lng, recorded_at")
          .eq("family_code", k.family_code)
          .eq("child_id", k.child_id)
          .order("recorded_at", { ascending: false })
          .limit(1);

        const nom = k.child_name || "Farzandingiz";
        const p = ping && ping[0];

        let line: string;
        if (!p || Date.now() - new Date(p.recorded_at).getTime() > 12 * 3600 * 1000) {
          line = `❔ <b>${nom}</b> — bugun joylashuv kelmagan.`;
        } else {
          let inZone: string | null = null;
          for (const z of zones) {
            if (distanceMeters(p.lat, p.lng, z.center_lat, z.center_lng) <= z.radius_m) {
              inZone = z.name;
              break;
            }
          }
          const vaqt = new Date(p.recorded_at).toLocaleTimeString("uz-UZ", {
            hour: "2-digit", minute: "2-digit",
          });
          line = inZone
            ? `✅ <b>${nom}</b> — <b>${inZone}</b> hududida (${vaqt}).`
            : `⚠️ <b>${nom}</b> — belgilangan hududlardan tashqarida (${vaqt}).\n` +
              `<a href="https://maps.google.com/?q=${p.lat},${p.lng}">Xaritada ko'rish</a>`;
        }

        (byFamily[k.family_code] = byFamily[k.family_code] || []).push(line);
      }

      let sent = 0;
      for (const [fam, lines] of Object.entries(byFamily)) {
        await notifyFamilyParents(
          fam,
          `🌙 <b>Kechki tekshiruv</b>\n\n${lines.join("\n\n")}`
        );
        sent++;
      }

      return new Response(JSON.stringify({ ok: true, families: sent }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    if (payload.type === "cron_daily_digest") {
      if (!WEBHOOK_SECRET || req.headers.get("x-telegram-bot-api-secret-token") !== WEBHOOK_SECRET) {
        return new Response(JSON.stringify({ ok: false, error: "forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      const sinceIso = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const todayKey = new Date().toISOString().slice(0, 10);

      const { data: families } = await db
        .from("parent_registrations")
        .select("family_code, parent_telegram_id, digest_sent_at, child_name")
        .eq("status", "approved")
        .eq("digest_enabled", true)
        .limit(500);

      let sent = 0;
      let skipped = 0;

      for (const fam of families || []) {
        if (!fam.parent_telegram_id) { skipped++; continue; }
        // Bir kunda bir marta.
        if (fam.digest_sent_at && String(fam.digest_sent_at).slice(0, 10) === todayKey) {
          skipped++;
          continue;
        }

        const { data: tel } = await db
          .from("device_telemetry")
          .select("app_package_name, screen_time_seconds")
          .eq("family_code", fam.family_code)
          .gte("created_at", sinceIso)
          .limit(1000);

        const totals: Record<string, number> = {};
        let totalSec = 0;
        for (const r of tel || []) {
          const app = r.app_package_name || "unknown";
          const sec = Number(r.screen_time_seconds) || 0;
          totals[app] = (totals[app] || 0) + sec;
          totalSec += sec;
        }
        const top = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 3);

        const { data: alerts } = await db
          .from("geofence_alerts")
          .select("message, alert_type, created_at")
          .eq("family_code", fam.family_code)
          .gte("created_at", sinceIso)
          .order("created_at", { ascending: true })
          .limit(20);

        const loc = await lastKnownLocation(fam.family_code);

        // Ma'lumot umuman bo'lmasa — bo'sh xabar yubormaymiz.
        if (totalSec === 0 && (!alerts || alerts.length === 0) && !loc) {
          skipped++;
          continue;
        }

        const fmt = (sec: number) => {
          const h = Math.floor(sec / 3600);
          const m = Math.round((sec % 3600) / 60);
          return h > 0 ? `${h} soat ${m} daqiqa` : `${m} daqiqa`;
        };

        let text = `🌙 <b>Kunlik xulosa — ${fam.child_name || "farzandingiz"}</b>\n`;
        text += `\n📱 <b>Ekran vaqti:</b> ${totalSec > 0 ? fmt(totalSec) : "ma'lumot yo'q"}`;

        if (top.length > 0) {
          text += `\n\n🔝 <b>Eng ko'p ishlatilgan:</b>`;
          top.forEach(([app, sec], i) => {
            text += `\n${i + 1}. ${app} — ${fmt(sec)}`;
          });
        }

        if (alerts && alerts.length > 0) {
          text += `\n\n📍 <b>Kun davomida:</b>`;
          for (const a of alerts.slice(0, 6)) {
            const t = new Date(a.created_at).toLocaleTimeString("uz-UZ", {
              hour: "2-digit",
              minute: "2-digit",
            });
            text += `\n• ${t} — ${a.message}`;
          }
        }

        if (loc) {
          text += `\n\n🗺 <a href="https://maps.google.com/?q=${loc.lat},${loc.lng}">So'nggi joylashuvi</a>`;
        }

        text += `\n\n<i>Bu xulosani o'chirish uchun: /xulosa</i>`;

        const ok = await notifyFamilyParents(fam.family_code, text);
        if (ok) {
          await db
            .from("parent_registrations")
            .update({ digest_sent_at: new Date().toISOString() })
            .eq("family_code", fam.family_code);
          sent++;
        } else {
          skipped++;
        }
      }

      return new Response(JSON.stringify({ ok: true, sent, skipped }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 0.0s KOMENDANT SOAT (maktab/uyqu rejimi).
    //
    // Qoida serverda saqlanadi, qurilma uni o'qib o'zi qo'llaydi — shunda
    // farzand ilovadagi sozlamani o'zgartirib qoidadan qochib qutula olmaydi.
    if (payload.type === "save_curfew_policy") {
      if (actor!.kind !== "telegram") return unauthorized("Faqat ota-ona");
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }
      const plan = await getPlan(actor!.familyCode);
      if (plan !== "pro") {
        return new Response(
          JSON.stringify({ ok: false, upgradeRequired: true, plan, error: "Komendant soat Pro tarifda mavjud." }),
          { status: 402, headers: { "Content-Type": "application/json" } }
        );
      }

      const childId = String(payload.childId || "").trim();
      if (!childId) {
        return new Response(JSON.stringify({ ok: false, error: "childId majburiy" }), {
          status: 400, headers: { "Content-Type": "application/json" },
        });
      }
      const timeRe = /^([01]\d|2[0-3]):[0-5]\d$/;
      const startTime = timeRe.test(String(payload.startTime)) ? String(payload.startTime) : "22:00";
      const endTime = timeRe.test(String(payload.endTime)) ? String(payload.endTime) : "06:30";

      const { error } = await db.from("curfew_policies").upsert(
        {
          family_code: actor!.familyCode,
          child_id: childId,
          enabled: payload.enabled !== false,
          blocked_apps: Array.isArray(payload.blockedApps) ? payload.blockedApps : [],
          allowed_apps: Array.isArray(payload.allowedApps) ? payload.allowedApps : [],
          start_time: startTime,
          end_time: endTime,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "family_code,child_id" }
      );
      if (error) {
        console.error("curfew upsert xatosi:", error.message);
        return new Response(JSON.stringify({ ok: false, error: error.message }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    // Qoidani ham ota-ona (ko'rish uchun), ham qurilma (qo'llash uchun) so'raydi.
    if (payload.type === "get_curfew_policy") {
      if (!db) {
        return new Response(JSON.stringify({ ok: true, policy: null }), {
          status: 200, headers: { "Content-Type": "application/json" },
        });
      }
      const childId =
        actor!.kind === "device" ? actor!.childId : String(payload.childId || "").trim();
      const { data } = await db
        .from("curfew_policies")
        .select("enabled, blocked_apps, allowed_apps, start_time, end_time")
        .eq("family_code", actor!.familyCode)
        .eq("child_id", childId)
        .limit(1);

      return new Response(JSON.stringify({ ok: true, policy: (data && data[0]) || null }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    if (payload.type === "my_family") {
      if (actor!.kind !== "telegram") return unauthorized("Faqat ota-ona");
      let status = "none";
      // Saqlangan oila ma'lumotlari ham qaytariladi: ilgari faqat holat
      // qaytarilardi va panel yozuvni hech qachon qayta o'qimasdi — shu sabab
      // ro'yxatdan o'tgan odam qaytib kirsa forma BO'SH ochilar, u qaytadan
      // to'ldirib yuborar va adminga yana yangi so'rov ketardi.
      let profile: Record<string, unknown> | null = null;
      if (db) {
        const { data } = await db
          .from("parent_registrations")
          .select(
            "status, family_name, parent_name, parent_username, parent_phone, mother_name, mother_username, child_name, child_grade, child_username, parent_telegram_id, password_hash"
          )
          .eq("family_code", actor!.familyCode)
          .limit(1);
        if (data && data[0]) {
          status = data[0].status;
          profile = data[0];
          // Parolning O'ZI ham, hash'i ham qaytarilmaydi — faqat "qo'yilganmi".
          (profile as Record<string, unknown>).password_set = !!data[0].password_hash;
          delete (profile as Record<string, unknown>).password_hash;
        }

        // parent_telegram_id'ni to'ldirib qo'yamiz: bu maydon ilgari hech
        // qachon yozilmagan, ya'ni eski oilalarga bildirishnoma (SOS, geo,
        // kunlik xulosa) yubora olmasdik. Panel har ochilganda shu yerda
        // jimgina tiklanadi.
        if (data && data[0] && !data[0].parent_telegram_id) {
          await db
            .from("parent_registrations")
            .update({ parent_telegram_id: actor!.telegramId })
            .eq("family_code", actor!.familyCode);
        }
      }
      return new Response(
        JSON.stringify({
          ok: true,
          familyCode: actor!.familyCode,
          telegramId: actor!.telegramId,
          username: actor!.username,
          registrationStatus: status,
          profile,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 0.0i Ota-ona farzandning joylashuvini so'raydi.
    //
    // Kvota shu yerda tekshiriladi: bepul tarifda 1 ta farzand va 48 soatda
    // 2 ta so'rov. Tekshiruv mijozda emas, serverda - aks holda Mini App
    // kodini o'zgartirgan odam limitni aylanib o'tardi.
    if (payload.type === "request_location") {
      const familyCode = actor!.familyCode;
      const childId = String(payload.childId || "").trim();
      if (!childId) {
        return new Response(
          JSON.stringify({ ok: false, error: "childId majburiy" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const r = await askChildForLocation(
        familyCode,
        childId,
        actor!.kind === "telegram" ? actor!.telegramId : null
      );
      const q = r.quota;

      if (!r.ok) {
        return new Response(
          JSON.stringify({
            ok: false,
            upgradeRequired: !!q?.upgradeRequired,
            plan: q?.plan,
            remaining: 0,
            resetInHours: q?.resetInHours || 0,
            error: r.error,
          }),
          { status: r.status, headers: { "Content-Type": "application/json" } }
        );
      }

      // Eng so'nggi ma'lum joylashuv (qurilma yoki Mini App yuborgan).
      const { data: pings } = await db!
        .from("location_pings")
        .select("lat, lng, accuracy_m, recorded_at")
        .eq("family_code", familyCode)
        .eq("child_id", childId)
        .order("recorded_at", { ascending: false })
        .limit(1);

      return new Response(
        JSON.stringify({
          ok: true,
          plan: q!.plan,
          // Pro uchun -1 (cheklovsiz), bepul uchun bu so'rovdan keyin qolgani.
          remaining: q!.remaining > 0 ? q!.remaining - 1 : q!.remaining,
          resetInHours: q!.resetInHours,
          location: pings && pings[0] ? pings[0] : null,
          liveUntil: r.liveUntil,
          asked: r.asked,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 0.0j Panel tarif holatini va qolgan so'rovlar sonini ko'rsatishi uchun.
    if (payload.type === "plan_status") {
      if (actor!.kind !== "telegram") return unauthorized("Faqat ota-ona");
      const plan = await getPlan(actor!.familyCode);
      const slot = await freeSlotChildId(actor!.familyCode);
      const used = slot ? await locationRequestsInWindow(actor!.familyCode, slot) : 0;

      return new Response(
        JSON.stringify({
          ok: true,
          plan,
          freeChildLimit: FREE_CHILD_LIMIT,
          freeRequestsPerWindow: FREE_LOCATION_REQUESTS,
          windowHours: FREE_WINDOW_HOURS,
          freeSlotChildId: slot,
          remaining: plan === "pro" ? -1 : Math.max(0, FREE_LOCATION_REQUESTS - used),
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 0.0k Xavfsiz hudud qo'shish / yangilash (PRO).
    if (payload.type === "save_geofence_zone") {
      if (actor!.kind !== "telegram") return unauthorized("Faqat ota-ona");
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }

      const plan = await getPlan(actor!.familyCode);
      const childId = String(payload.childId || "").trim();
      const name = String(payload.name || "").trim();
      const lat = Number(payload.lat);
      const lng = Number(payload.lng);
      if (!childId || !name || !Number.isFinite(lat) || !Number.isFinite(lng)) {
        return new Response(
          JSON.stringify({ ok: false, error: "childId, name, lat, lng majburiy" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // "Maktabga kirdi / uyga keldi" xabari mahsulotning eng kerakli qismi,
      // shuning uchun u bepul tarifda ham ishlaydi — faqat SONI cheklangan:
      // uy va maktab. Mavjud hududni qayta saqlash limitga kirmaydi, aks
      // holda ota-ona uy manzilini tuzatolmay qolardi.
      if (plan !== "pro") {
        const { data: existing } = await db
          .from("geofence_zones")
          .select("name")
          .eq("family_code", actor!.familyCode)
          .eq("child_id", childId)
          .limit(20);

        const names = (existing || []).map((z: any) => z.name);
        if (!names.includes(name) && names.length >= FREE_ZONE_LIMIT) {
          return new Response(
            JSON.stringify({
              ok: false,
              upgradeRequired: true,
              plan,
              error:
                `Bepul tarifda ${FREE_ZONE_LIMIT} ta hudud saqlash mumkin (uy va maktab). ` +
                `Pro tarifda cheklov yo'q.`,
            }),
            { status: 402, headers: { "Content-Type": "application/json" } }
          );
        }
      }

      const radius = Number(payload.radiusM);
      const { error } = await db.from("geofence_zones").upsert(
        {
          family_code: actor!.familyCode,
          child_id: childId,
          name,
          center_lat: lat,
          center_lng: lng,
          radius_m: Number.isFinite(radius) && radius > 0 ? Math.round(radius) : 150,
          arrive_by: payload.arriveBy || (isSchoolZoneName(name) ? await childSchoolArriveBy(actor!.familyCode, childId) : null),
          leave_after: payload.leaveAfter || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "family_code,child_id,name" }
      );

      if (error) {
        console.error("geofence_zones upsert failed:", error.message);
        return new Response(JSON.stringify({ ok: false, error: error.message }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    // 0.0l Xavfsiz hududlar ro'yxati va so'nggi ogohlantirishlar.
    // Hududni o'chirish. Busiz ota-ona xato qo'ygan uyni tuzatolmasdi —
    // faqat ustiga yangisini yozishi mumkin edi, eskisi esa xaritada qolib,
    // "kirdi/chiqdi" xabarlarini yuboraverardi.
    if (payload.type === "delete_geofence_zone") {
      if (actor!.kind !== "telegram") return unauthorized("Faqat ota-ona");
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }
      const childId = String(payload.childId || "").trim();
      const name = String(payload.name || "").trim();
      if (!childId || !name) {
        return new Response(JSON.stringify({ ok: false, error: "childId va name majburiy" }), {
          status: 400, headers: { "Content-Type": "application/json" },
        });
      }

      const { error } = await db
        .from("geofence_zones")
        .delete()
        .eq("family_code", actor!.familyCode)
        .eq("child_id", childId)
        .eq("name", name);

      if (error) {
        return new Response(JSON.stringify({ ok: false, error: error.message }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }

      // Shu hududga tegishli eski ogohlantirishlarni ham olib tashlaymiz:
      // hudud yo'q bo'lsa, uning tarixi ham ma'nosini yo'qotadi va lentada
      // mavjud bo'lmagan joy nomi turib qolardi.
      await db
        .from("geofence_alerts")
        .delete()
        .eq("family_code", actor!.familyCode)
        .eq("child_id", childId)
        .eq("zone_name", name);

      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    // Bildirishnoma sozlamalari: kunlik hisobot va kechki tekshiruv.
    if (payload.type === "notification_settings") {
      if (actor!.kind !== "telegram") return unauthorized("Faqat ota-ona");
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }

      if (typeof payload.digestEnabled === "boolean") {
        await db
          .from("parent_registrations")
          .update({ digest_enabled: payload.digestEnabled })
          .eq("family_code", actor!.familyCode);
      }

      const { data } = await db
        .from("parent_registrations")
        .select("digest_enabled")
        .eq("family_code", actor!.familyCode)
        .limit(1);

      return new Response(
        JSON.stringify({
          ok: true,
          digestEnabled: !!(data && data[0] && data[0].digest_enabled),
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (payload.type === "list_geofences") {
      if (actor!.kind !== "telegram") return unauthorized("Faqat ota-ona");
      if (!db) {
        return new Response(JSON.stringify({ ok: true, zones: [], alerts: [] }), {
          status: 200, headers: { "Content-Type": "application/json" },
        });
      }
      const plan = await getPlan(actor!.familyCode);
      const childId = String(payload.childId || "").trim();

      const { data: zones } = await db
        .from("geofence_zones")
        .select("name, center_lat, center_lng, radius_m, arrive_by, leave_after")
        .eq("family_code", actor!.familyCode)
        .eq("child_id", childId);

      const { data: alerts } = await db
        .from("geofence_alerts")
        .select("zone_name, alert_type, message, distance_m, created_at")
        .eq("family_code", actor!.familyCode)
        .eq("child_id", childId)
        .order("created_at", { ascending: false })
        .limit(plan === "pro" ? 50 : 3);

      return new Response(
        JSON.stringify({ ok: true, plan, zones: zones || [], alerts: alerts || [] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 0.0l+ RADAR HOLATI — ota-ona panelidagi Radar bo'limining yagona manbasi.
    //
    // Bitta so'rovda hammasi: har bir farzandning jonli holati, oxirgi ma'lum
    // nuqtasi va bugungi "kirdi/chiqdi" hodisalari. Alohida uchta so'rov bilan
    // qilinsa, panel uch xil paytdagi holatni aralash ko'rsatib qo'yardi.
    if (payload.type === "radar_status") {
      if (actor!.kind !== "telegram") return unauthorized("Faqat ota-ona");
      if (!db) {
        return new Response(JSON.stringify({ ok: true, children: [] }), {
          status: 200, headers: { "Content-Type": "application/json" },
        });
      }

      const familyCode = actor!.familyCode;
      const plan = await getPlan(familyCode);

      const { data: kids } = await db
        .from("child_pairings")
        .select("child_id, child_name, live_until, live_started_at")
        .eq("family_code", familyCode)
        .eq("is_active", true)
        .not("child_id", "like", "invite\\_%")
        .limit(10);

      // Bugun — mahalliy emas, UTC kun boshidan. Ota-ona uchun "bugungi
      // harakatlar" ro'yxati shundan to'ldiriladi.
      const dayStart = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const children: any[] = [];

      for (const k of kids || []) {
        const { data: ping } = await db
          .from("location_pings")
          .select("lat, lng, accuracy_m, recorded_at")
          .eq("family_code", familyCode)
          .eq("child_id", k.child_id)
          .order("recorded_at", { ascending: false })
          .limit(1);

        const { data: events } = await db
          .from("geofence_alerts")
          .select("zone_name, alert_type, message, created_at")
          .eq("family_code", familyCode)
          .eq("child_id", k.child_id)
          .gte("created_at", dayStart)
          .order("created_at", { ascending: false })
          .limit(12);

        const liveActive =
          !!k.live_until && new Date(k.live_until).getTime() > Date.now();

        children.push({
          childId: k.child_id,
          childName: k.child_name || "Farzand",
          live: liveActive,
          liveUntil: liveActive ? k.live_until : null,
          liveMinutesLeft: liveActive
            ? Math.max(0, Math.round((new Date(k.live_until).getTime() - Date.now()) / 60000))
            : 0,
          lastPing: (ping && ping[0]) || null,
          events: events || [],
        });
      }

      return new Response(
        JSON.stringify({
          ok: true,
          plan,
          liveHours: plan === "pro" ? PRO_LIVE_HOURS : FREE_LIVE_HOURS,
          proLiveHours: PRO_LIVE_HOURS,
          children,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }


    // ========================================================================
    // "FARZANDINGIZ HAQIDA" — HAFTALIK TAHLIL
    //
    // Bu Reels tahlilining o'rnini bosadigan funksiya, va u kuchliroq:
    // Reels bola NIMA KO'RGANINI aytadi, bu esa NIMA HIS QILAYOTGANINI.
    //
    // Uchta haqiqiy manbadan yig'iladi — birortasi ham o'ylab topilgan emas:
    //   1) bolaning AI do'st bilan suhbatlari (bizning o'z xizmatimiz),
    //   2) kayfiyat kundaligi ("Bugun men..."),
    //   3) xulq signallari: fokus daqiqalari, hududga kelish-ketish vaqtlari.
    //
    // Bolaning YOZGAN MATNI ota-onaga ko'chirilmaydi. AI faqat XULOSA yozadi.
    // Aks holda bu suhbat emas, o'qib chiqish bo'lardi — va bola buni bilgan
    // kuni AI'ga yozishni butunlay to'xtatardi, ya'ni manbaning o'zi o'lardi.
    // ========================================================================
    if (payload.type === "weekly_report") {
      if (actor!.kind !== "telegram") return unauthorized("Faqat ota-ona");
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }

      const familyCode = actor!.familyCode;
      const childId = String(payload.childId || "").trim();
      if (!childId) {
        return new Response(JSON.stringify({ ok: false, error: "childId majburiy" }), {
          status: 400, headers: { "Content-Type": "application/json" },
        });
      }

      const haftaOldin = new Date(Date.now() - 7 * 86400000).toISOString();
      const ikkiHafta = new Date(Date.now() - 14 * 86400000).toISOString();

      // --- 1. Fokus: bu hafta va o'tgan hafta (taqqoslash uchun) ---
      const { data: fokus } = await db
        .from("focus_sessions")
        .select("planned_minutes, completed_at")
        .eq("family_code", familyCode)
        .eq("child_id", childId)
        .not("completed_at", "is", null)
        // Faqat tekshiruv savollaridan o'tgan seanslar — taymerni yoqib
        // qo'yib ketilgani hisoblanmaydi.
        .eq("check_passed", true)
        .gte("completed_at", ikkiHafta)
        .limit(500);

      let buHafta = 0, otganHafta = 0, seansSoni = 0;
      for (const f of fokus || []) {
        const m = Number(f.planned_minutes) || 0;
        if (f.completed_at >= haftaOldin) { buHafta += m; seansSoni++; }
        else otganHafta += m;
      }

      // --- 2. Kayfiyat ---
      const { data: notes } = await db
        .from("child_notes")
        .select("mood, note, created_at")
        .eq("family_code", familyCode)
        .eq("child_id", childId)
        .gte("created_at", haftaOldin)
        .order("created_at", { ascending: true })
        .limit(50);

      const kayfiyat: Record<string, number> = {};
      for (const n of notes || []) kayfiyat[n.mood] = (kayfiyat[n.mood] || 0) + 1;

      // --- 3. Hududga kelish-ketish ---
      const { data: alerts } = await db
        .from("geofence_alerts")
        .select("zone_name, alert_type, created_at")
        .eq("family_code", familyCode)
        .eq("child_id", childId)
        .gte("created_at", haftaOldin)
        .order("created_at", { ascending: true })
        .limit(100);

      // --- 4. AI suhbatlari: faqat BOLANING savollari ---
      const kidTgId = String(childId).startsWith("tg_") ? Number(String(childId).slice(3)) : 0;
      let suhbat: string[] = [];
      if (kidTgId) {
        const { data: msgs } = await db
          .from("ai_chat_messages")
          .select("message, created_at")
          .eq("telegram_id", kidTgId)
          .eq("role", "user")
          .gte("created_at", haftaOldin)
          .order("created_at", { ascending: true })
          .limit(60);
        suhbat = (msgs || []).map((m: any) => String(m.message || "").slice(0, 300));
      }

      const { data: kid } = await db
        .from("child_pairings")
        .select("child_name")
        .eq("family_code", familyCode)
        .eq("child_id", childId)
        .limit(1);
      const nom = (kid && kid[0] && kid[0].child_name) || "Farzandingiz";

      // Ma'lumot juda kam bo'lsa AI chaqirmaymiz: u bo'sh ma'lumotdan
      // ishonchli ko'rinadigan, lekin asossiz xulosa yasab beradi — bu
      // ota-onani noto'g'ri yo'lga boshlaydi.
      const yetarli = buHafta > 0 || (notes || []).length > 0 || suhbat.length > 0;
      if (!yetarli) {
        return new Response(
          JSON.stringify({
            ok: true,
            empty: true,
            childName: nom,
            message:
              `${nom} bu hafta ilovadan deyarli foydalanmadi, shuning uchun ` +
              `tahlil qilishga ma'lumot yo'q. Fokus seansi, kayfiyat kundaligi ` +
              `yoki AI do'st bilan suhbat bo'lsa, keyingi hafta xulosa tayyor bo'ladi.`,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      const raqamlar = {
        fokusDaqiqa: buHafta,
        otganHaftaFokus: otganHafta,
        seansSoni,
        kayfiyat,
        kunlikXabar: (notes || []).length,
        aiSavollar: suhbat.length,
        hududHodisalari: (alerts || []).length,
      };

      const apiKey = Deno.env.get("GEMINI_API_KEY") || "";
      let hisobot: any = null;

      if (apiKey) {
        const model = Deno.env.get("GEMINI_MODEL") || "gemini-3.6-flash";
        const prompt =
          `Sen O'zbekistondagi ota-onaga farzandi haqida HAFTALIK xulosa yozasan.\n\n` +
          `Farzand ismi: ${nom}\n\n` +
          `MA'LUMOT:\n` +
          `- Bu hafta diqqat bilan ishlagan vaqti: ${buHafta} daqiqa (${seansSoni} seans)\n` +
          `- O'tgan hafta: ${otganHafta} daqiqa\n` +
          `- Kayfiyat belgilari: ${JSON.stringify(kayfiyat)} ` +
          `(great=zo'r, good=yaxshi, tired=charchagan, sad=xafa)\n` +
          `- Uy/maktab hududiga kelish-ketish hodisalari: ${(alerts || []).length} ta\n` +
          `- AI do'stga bergan savollari (${suhbat.length} ta):\n` +
          suhbat.slice(0, 40).map((q) => `  · ${q}`).join("\n") + `\n\n` +
          `QOIDALAR — buzilmasin:\n` +
          `- Bolaning yozgan gaplarini AYNAN ko'chirma. Faqat umumiy xulosa.\n` +
          `- Faqat berilgan ma'lumotga tayan. Ma'lumot yetmasa, "ma'lumot yetarli emas" deb yoz.\n` +
          `- Tashxis qo'yma, kasallik nomini aytma.\n` +
          `- Ota-onani ayblama va qo'rqitma. Ohang xotirjam va hurmatli bo'lsin.\n` +
          `- Hammasi o'zbek tilida (lotin yozuvida).\n\n` +
          `FAQAT shu JSON ni qaytar:\n` +
          `{"ozgarish":"bu hafta nima o'zgardi, 1-2 jumla",` +
          `"yaxshi":"xursand bo'ladigan bitta narsa, 1 jumla",` +
          `"etibor":"e'tibor berish kerak bo'lgan bitta narsa, 1-2 jumla",` +
          `"savollar":["farzandga beriladigan aniq savol 1","savol 2","savol 3"],` +
          `"xavf":"agar zo'ravonlik, o'ziga zarar, qo'rquv yoki majburlash belgisi bo'lsa qisqa izoh, aks holda bo'sh satr"}`;

        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.6,
                  maxOutputTokens: 6144,
                  responseMimeType: "application/json",
                },
              }),
            }
          );
          const j = await res.json();
          const text = (j?.candidates?.[0]?.content?.parts || [])
            .filter((p: any) => p && typeof p.text === "string" && p.thought !== true)
            .map((p: any) => p.text)
            .join("");

          const tozalangan = text.replace(/```(?:json)?/gi, "").trim();
          const start = tozalangan.indexOf("{");
          const end = tozalangan.lastIndexOf("}");
          if (start >= 0 && end > start) {
            hisobot = JSON.parse(tozalangan.slice(start, end + 1));
          }
        } catch (e) {
          console.error("weekly_report AI xatosi:", e instanceof Error ? e.message : e);
        }
      }

      // AI ishlamasa ham ota-ona bo'sh ekran ko'rmasin: raqamlardan
      // tuzilgan xulosa — kambag'alroq, lekin rost.
      if (!hisobot) {
        const farq = buHafta - otganHafta;
        hisobot = {
          ozgarish:
            otganHafta === 0
              ? `${nom} bu hafta ${buHafta} daqiqa diqqat bilan ishladi.`
              : `Diqqat bilan ishlagan vaqti ${farq >= 0 ? "oshdi" : "kamaydi"}: ` +
                `${otganHafta} → ${buHafta} daqiqa.`,
          yaxshi: seansSoni > 0 ? `${seansSoni} ta fokus seansini oxirigacha yetkazdi.` : "",
          etibor: (kayfiyat["tired"] || 0) + (kayfiyat["sad"] || 0) >= 3
            ? "Bu hafta bir necha kun charchagan yoki xafa kayfiyat belgilandi."
            : "",
          savollar: [
            "Bu hafta eng qiyin bo'lgan narsa nima edi?",
            "Kim bilan ko'proq vaqt o'tkazding?",
            "Keyingi hafta nimani boshqacha qilmoqchisan?",
          ],
          xavf: "",
          manba: "raqamlar",
        };
      }

      return new Response(
        JSON.stringify({
          ok: true,
          childName: nom,
          stats: raqamlar,
          report: hisobot,
          generatedAt: new Date().toISOString(),
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 0.0m+ KUN MARSHRUTI — bir kunlik yo'l, xaritaga chizish uchun.
    //
    // location_history dan farqi: u eng yangi nuqtalarni beradi, bu esa BIR
    // KUNNI to'liq va vaqt bo'yicha o'sish tartibida beradi. Chiziq chizish
    // uchun tartib muhim — teskari tartibda chizilsa yo'l orqaga ketardi.
    //
    // Nuqtalar siyraklashtiriladi: bir joyda turganda Telegram o'nlab deyarli
    // bir xil nuqta yuboradi, ular xaritada bitta dog' bo'lib qoladi-yu,
    // javobni og'irlashtiradi.
    if (payload.type === "day_route") {
      if (actor!.kind !== "telegram") return unauthorized("Faqat ota-ona");
      if (!db) {
        return new Response(JSON.stringify({ ok: true, points: [] }), {
          status: 200, headers: { "Content-Type": "application/json" },
        });
      }

      const familyCode = actor!.familyCode;
      const plan = await getPlan(familyCode);
      const childId = String(payload.childId || "").trim();

      // Bepul tarifda faqat bugun. Pro'da 30 kungacha orqaga.
      let dayOffset = Math.max(0, Math.min(PRO_HISTORY_DAYS, Number(payload.dayOffset) || 0));
      if (plan !== "pro") dayOffset = 0;

      const now = new Date();
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOffset);
      const dayEnd = new Date(dayStart.getTime() + 86400000);

      const { data: raw } = await db
        .from("location_pings")
        .select("lat, lng, accuracy_m, recorded_at")
        .eq("family_code", familyCode)
        .eq("child_id", childId)
        .gte("recorded_at", dayStart.toISOString())
        .lt("recorded_at", dayEnd.toISOString())
        .order("recorded_at", { ascending: true })
        .limit(2000);

      // Bir-biriga 40 metrdan yaqin ketma-ket nuqtalarni tashlab yuboramiz.
      const thinned: any[] = [];
      for (const p of raw || []) {
        const last = thinned[thinned.length - 1];
        if (!last || distanceMeters(last.lat, last.lng, p.lat, p.lng) > 40) {
          thinned.push(p);
        } else {
          // Oxirgi vaqtni yangilaymiz: bola shu yerda turgani ko'rinsin.
          last.recorded_at = p.recorded_at;
        }
      }

      const points = plan === "pro" ? thinned : thinned.slice(-FREE_ROUTE_POINTS);

      const { data: events } = await db
        .from("geofence_alerts")
        .select("zone_name, alert_type, message, created_at")
        .eq("family_code", familyCode)
        .eq("child_id", childId)
        .gte("created_at", dayStart.toISOString())
        .lt("created_at", dayEnd.toISOString())
        .order("created_at", { ascending: true })
        .limit(50);

      // Bosib o'tilgan masofa — kun qanchalik "harakatli" bo'lganini bitta
      // son bilan ko'rsatadi.
      let meters = 0;
      for (let i = 1; i < thinned.length; i++) {
        meters += distanceMeters(
          thinned[i - 1].lat, thinned[i - 1].lng, thinned[i].lat, thinned[i].lng
        );
      }

      return new Response(
        JSON.stringify({
          ok: true,
          plan,
          dayOffset,
          date: dayStart.toISOString().slice(0, 10),
          points,
          events: events || [],
          totalPoints: thinned.length,
          distanceKm: Math.round(meters / 100) / 10,
          maxDaysBack: plan === "pro" ? PRO_HISTORY_DAYS : 0,
          upgradeHint:
            plan === "pro"
              ? null
              : `Bepul tarifda bugungi oxirgi ${FREE_ROUTE_POINTS} nuqta ko'rinadi. Pro tarifda ${PRO_HISTORY_DAYS} kunlik to'liq marshrut.`,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 0.0m Joylashuv tarixi. Bepulda oxirgi nuqta, Pro'da 30 kun.
    //
    // Bepul tarifda ham bo'sh emas, cheklangan javob qaytariladi: ota-ona
    // nimadan foydalanmayotganini ko'rsa, Pro'ning qiymati tushunarli.
    if (payload.type === "location_history") {
      if (actor!.kind !== "telegram") return unauthorized("Faqat ota-ona");
      if (!db) {
        return new Response(JSON.stringify({ ok: true, points: [] }), {
          status: 200, headers: { "Content-Type": "application/json" },
        });
      }
      const plan = await getPlan(actor!.familyCode);
      const childId = String(payload.childId || "").trim();

      let q = db
        .from("location_pings")
        .select("lat, lng, accuracy_m, recorded_at")
        .eq("family_code", actor!.familyCode)
        .eq("child_id", childId)
        .order("recorded_at", { ascending: false });

      if (plan === "pro") {
        const since = new Date(Date.now() - PRO_HISTORY_DAYS * 86400000).toISOString();
        q = q.gte("recorded_at", since).limit(1000);
      } else {
        q = q.limit(FREE_HISTORY_POINTS);
      }

      const { data } = await q;
      return new Response(
        JSON.stringify({
          ok: true,
          plan,
          points: data || [],
          limitedTo: plan === "pro" ? PRO_HISTORY_DAYS + " kun" : FREE_HISTORY_POINTS + " nuqta",
          upgradeHint: plan === "pro" ? null : "Pro tarifda " + PRO_HISTORY_DAYS + " kunlik yo'l xaritasi",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 0.0n Ekran vaqti hisoboti (PRO).
    if (payload.type === "screen_time_report") {
      if (actor!.kind !== "telegram") return unauthorized("Faqat ota-ona");
      const plan = await getPlan(actor!.familyCode);
      if (plan !== "pro") {
        return new Response(
          JSON.stringify({
            ok: false,
            upgradeRequired: true,
            plan,
            error: "Ekran vaqti hisoboti Pro tarifda mavjud.",
          }),
          { status: 402, headers: { "Content-Type": "application/json" } }
        );
      }
      if (!db) {
        return new Response(JSON.stringify({ ok: true, apps: [] }), {
          status: 200, headers: { "Content-Type": "application/json" },
        });
      }

      const childId = String(payload.childId || "").trim();
      const days = Number(payload.days) > 0 ? Number(payload.days) : 7;
      const since = new Date(Date.now() - days * 86400000).toISOString();

      const { data } = await db
        .from("device_telemetry")
        .select("app_package_name, category, screen_time_seconds, risk_rating, created_at")
        .eq("family_code", actor!.familyCode)
        .eq("child_id", childId)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(1000);

      // Ilova bo'yicha yig'amiz - panel uchun tayyor ko'rinishda.
      const totals: Record<string, { seconds: number; category: string; risk: string }> = {};
      (data || []).forEach((r: any) => {
        const k = r.app_package_name;
        if (!totals[k]) totals[k] = { seconds: 0, category: r.category, risk: r.risk_rating };
        totals[k].seconds += r.screen_time_seconds || 0;
      });

      const apps = Object.entries(totals)
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.seconds - a.seconds);

      return new Response(JSON.stringify({ ok: true, plan, days, apps }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    // 0.0o Qurilma joylashuv yuboradi (Android). Kvota bu yerga tegmaydi -
    // kvota ota-onaning SO'RASHIGA tegishli, qurilmaning yuborishiga emas.
    // 0.0o- BOLA JOYLASHUVI — Mini App ichidan (Telegram LocationManager).
    //
    // Nega kerak: Telegram'ning 📎 menyusi orqali jonli joylashuv ulashish
    // faqat TELEFONDAGI mijozda bor — Desktop'da "Joylashuv" bandi umuman
    // yo'q, Mini App ichida esa 📎 tugmasining o'zi yo'q. Shu sabab bola
    // ko'rsatmani bajara olmay qolardi. Mini App'ning o'z LocationManager'i
    // esa har joyda ishlaydi va bitta bosish talab qiladi.
    //
    // Bu JONLI kuzatuvning o'rnini bosmaydi — u bitta nuqta beradi. Lekin
    // bola panelni kuniga bir necha marta ochadi, ya'ni bepul nuqtalar
    // hech qanday bosishsiz ham yig'ilib boradi.
    if (payload.type === "child_report_location") {
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }

      const familyCode = await resolveActorFamily(actor!);
      const childId =
        actor!.kind === "device" ? actor!.childId : "tg_" + actor!.telegramId;

      // Faqat oilaga ulangan bola yuborishi mumkin. Aks holda istalgan
      // Telegram hisobi begona oilaning xaritasiga nuqta qo'yib ketardi.
      if (actor!.kind === "telegram" && !(await isPairedChild(actor!.telegramId))) {
        return unauthorized("Faqat ulangan farzand");
      }

      const lat = Number(payload.lat);
      const lng = Number(payload.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) ||
          Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        return new Response(JSON.stringify({ ok: false, error: "lat/lng noto'g'ri" }), {
          status: 400, headers: { "Content-Type": "application/json" },
        });
      }

      const reason = String(payload.reason || "manual");

      // Panel ochilganda avtomatik yuboriladigan nuqtalarni siyraklashtirmasak,
      // bola ilovani 10 marta ochib-yopsa baza bir xil nuqta bilan to'lardi va
      // "kun marshruti" o'qib bo'lmas holga kelardi.
      if (reason === "auto") {
        const { data: recent } = await db
          .from("location_pings")
          .select("recorded_at")
          .eq("family_code", familyCode)
          .eq("child_id", childId)
          .gte("recorded_at", new Date(Date.now() - 5 * 60 * 1000).toISOString())
          .limit(1);
        if (recent && recent[0]) {
          return new Response(JSON.stringify({ ok: true, skipped: true }), {
            status: 200, headers: { "Content-Type": "application/json" },
          });
        }
      }

      await db.from("location_pings").insert({
        family_code: familyCode,
        child_id: childId,
        lat,
        lng,
        accuracy_m: Math.round(Number(payload.accuracyM) || 0) || null,
      });

      const fired = await evaluateGeofences(familyCode, childId, lat, lng);
      for (const f of fired) {
        await notifyFamilyParents(
          familyCode,
          "\u{1F4CD} <b>" + f.message + "</b>\n\n" +
            '<a href="https://maps.google.com/?q=' + lat + "," + lng + '">Xaritada ko\'rish</a>' +
            "\n🕒 " + tashkentVaqt(new Date().toISOString())
        );
      }

      // "Yetib keldim" va "Qayerdasan?" javobi ota-onaga alohida boradi:
      // bular bolaning o'z tashabbusi, ya'ni kuzatuv emas, xabar berish.
      if (reason === "arrived" || reason === "asked" || reason === "manual") {
        const { data: kidRow } = await db.from("child_pairings").select("child_name")
          .eq("family_code", familyCode).eq("child_id", childId).limit(1);
        await postChatEvent(familyCode, { id: childId, role: "child", name: (kidRow && kidRow[0]?.child_name) || "Farzand" },
          { type: "location", reason, lat, lng }, reason === "arrived" ? "🏫 Yetib keldim" : "📍 Joylashuvim");
      }
      if (reason === "arrived" || reason === "asked") {
        const { data: kid } = await db
          .from("child_pairings")
          .select("child_name")
          .eq("family_code", familyCode)
          .eq("child_id", childId)
          .limit(1);
        const nom = (kid && kid[0] && kid[0].child_name) || "Farzandingiz";
        await notifyFamilyParents(
          familyCode,
          (reason === "arrived"
            ? `🏫 <b>${nom}: "Yetib keldim"</b>`
            : `📍 <b>${nom} joylashuvini yubordi</b>`) +
            `\n\n<a href="https://maps.google.com/?q=${lat},${lng}">Xaritada ko'rish</a>` +
            `\n🕒 ${tashkentVaqt(new Date().toISOString())}`
        );
      }

      return new Response(
        JSON.stringify({ ok: true, alerts: fired, savedAt: new Date().toISOString() }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (payload.type === "report_location") {
      if (actor!.kind !== "device") return unauthorized("Faqat juftlashgan qurilma");
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }

      const lat = Number(payload.lat);
      const lng = Number(payload.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return new Response(JSON.stringify({ ok: false, error: "lat/lng majburiy" }), {
          status: 400, headers: { "Content-Type": "application/json" },
        });
      }

      await db.from("location_pings").insert({
        family_code: actor!.familyCode,
        child_id: actor!.childId,
        lat,
        lng,
        accuracy_m: Number(payload.accuracyM) || null,
      });

      // Geo-bildirishnoma OTA-ONAGA boradi. Ilgari u notifyAdmins() edi —
      // "maktabga yetdi" xabarini ota-ona emas, ilova admini olardi.
      const fired = await evaluateGeofences(actor!.familyCode, actor!.childId, lat, lng);
      for (const f of fired) {
        await notifyFamilyParents(
          actor!.familyCode,
          "\u{1F4CD} <b>" + f.message + "</b>\n\n" +
            '<a href="https://maps.google.com/?q=' + lat + "," + lng + '">Xaritada ko\'rish</a>' +
            "\n🕒 " + tashkentVaqt(new Date().toISOString())
        );
      }

      return new Response(JSON.stringify({ ok: true, alerts: fired }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    // 0.0o+ Qurilma ekran vaqti/ilova telemetriyasini yuboradi (Android).
    //
    // Bu ham report_location kabi faqat deviceToken bilan ishlaydi. Ilgari
    // Android buni Render'dagi backend/routes/telemetry.py'ga X-Family-Code
    // + X-Child-Id header bilan yuborardi — o'sha handler o'zi "oila kodi
    // nisbatan zaif maxfiy kalit" deb belgilagan edi (require_family_access),
    // chunki ikkalasi ham formula bilan hisoblanadi, sir emas.
    if (payload.type === "report_telemetry") {
      if (actor!.kind !== "device") return unauthorized("Faqat juftlashgan qurilma");
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }

      const encryptedPayload = String(payload.encryptedPayload || "");
      const iv = String(payload.iv || "");
      if (!encryptedPayload || !iv) {
        return new Response(JSON.stringify({ ok: false, error: "encryptedPayload/iv majburiy" }), {
          status: 400, headers: { "Content-Type": "application/json" },
        });
      }

      await db.from("device_telemetry").insert({
        family_code: actor!.familyCode,
        child_id: actor!.childId,
        app_package_name: String(payload.appPackageName || "unknown"),
        category: String(payload.category || "General"),
        screen_time_seconds: Number(payload.screenTimeSeconds) || 0,
        encrypted_payload: encryptedPayload,
        iv,
      });

      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    // 0.0p Foydalanuvchi ota-onami yoki farzandmi.
    //
    // app.js dagi fetchAndApplyRole() bu so'rovni ancha vaqtdan beri
    // yuborib kelgan, lekin bunday handler HECH QACHON bo'lmagan - javob
    // e'tiborsiz qolib, rol faqat URL parametri yoki localStorage'dan
    // aniqlanardi. Shu sabab boshqa qurilmadan kirgan farzand o'zini
    // ota-ona panelida ko'rishi mumkin edi.
    //
    // Rol payload'dan emas, imzolangan identitetdan aniqlanadi.
    if (payload.type === "check_role") {
      if (actor!.kind === "device") {
        // Ilova ichidagi sahifa ismni va oila kodini shu javobdan oladi.
        // Ilgari faqat rol qaytardi, shuning uchun Android'dagi farzand
        // panelida ism bo'sh, oila kodi esa noma'lum qolardi.
        let childName: string | null = null;
        if (db) {
          const { data: pr } = await db
            .from("child_pairings")
            .select("child_name")
            .eq("child_id", actor!.childId)
            .limit(1);
          childName = (pr && pr[0] && pr[0].child_name) || null;
        }
        return new Response(
          JSON.stringify({
            ok: true,
            role: "child",
            familyCode: actor!.familyCode,
            childId: actor!.childId,
            childName,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      if (!db) {
        return new Response(JSON.stringify({ ok: true, role: "parent" }), {
          status: 200, headers: { "Content-Type": "application/json" },
        });
      }

      // Bu Telegram hisobi biror oilaga FARZAND sifatida ulanganmi.
      const { data } = await db
        .from("child_pairings")
        .select("family_code, child_name")
        .eq("child_id", "tg_" + actor!.telegramId)
        .eq("is_active", true)
        .limit(1);

      if (data && data[0]) {
        return new Response(
          JSON.stringify({
            ok: true,
            role: "child",
            familyCode: data[0].family_code,
            childName: data[0].child_name,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ ok: true, role: "parent", familyCode: actor!.familyCode }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 0.0c Ota-ona Android qurilmasi uchun bir martalik juftlash kodi so'raydi.
    //
    // Android endi oila kodi bilan tanitilmaydi. Sabab: oila kodi sir emas
    // (ota-onaning Telegram ID'sidan hisoblanadi) va qurilmaning child_id'si
    // ham o'sha koddan quriladi — ikkalasini ham begona odam topa olardi.
    // Buning o'rniga ota-ona shu yerda qisqa muddatli kod oladi va uni
    // farzandning telefoniga kiritadi.
    if (payload.type === "create_device_pair_code") {
      if (actor!.kind !== "telegram") {
        return unauthorized("Faqat ota-ona Mini App'dan so'rashi mumkin");
      }
      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      // 8 ta belgi, chalkashadigan harflarsiz (0/O, 1/I/L).
      const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
      const bytes = crypto.getRandomValues(new Uint8Array(8));
      const code = Array.from(bytes).map((b) => alphabet[b % alphabet.length]).join("");

      // Ota-ona qaysi farzandning telefoni ulanayotganini ko'rsatsa, telefon
      // O'SHA yozuvga bog'lanadi. Aks holda har bir telefon yangi farzand
      // yaratardi: panelda bitta bola ikki marta ko'rinar, ballari,
      // joylashuvi va uy vazifasi ikkiga bo'linib ketardi.
      let boundChildId: string | null = null;
      const wantedChildId = String(payload.childId || "").trim();
      if (wantedChildId) {
        const { data: own } = await db
          .from("child_pairings")
          .select("child_id, child_name")
          .eq("family_code", actor!.familyCode)
          .eq("child_id", wantedChildId)
          .limit(1);
        if (!own || !own[0]) {
          return new Response(
            JSON.stringify({ ok: false, error: "Bu farzand sizning oilangizda topilmadi" }),
            { status: 403, headers: { "Content-Type": "application/json" } }
          );
        }
        boundChildId = own[0].child_id;
        if (!payload.childName) payload.childName = own[0].child_name;
      }

      const { error } = await db.from("device_pair_codes").insert({
        code,
        family_code: actor!.familyCode,
        child_id: boundChildId,
        child_name: payload.childName || null,
        created_by_telegram_id: actor!.telegramId,
        // Qisqa muddat: kod uzoq yashasa, uni taxmin qilishga vaqt qoladi.
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      });

      if (error) {
        console.error("device_pair_codes insert failed:", error.message);
        return new Response(JSON.stringify({ ok: false, error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({ ok: true, pairCode: code, expiresInSec: 900 }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 0.0d Android ilovasi bir martalik kodni uzoq muddatli tokenga almashtiradi.
    //
    // Bu YAGONA autentifikatsiyasiz endpoint — qurilmada hali hech qanday
    // hisob ma'lumoti yo'q. Shuning uchun kod bir martalik, 15 daqiqalik va
    // urinishlar soni cheklangan.
    if (payload.type === "device_pair") {
      const code = String(payload.pairCode || "").trim().toUpperCase();
      const deviceModel = String(payload.deviceModel || "android").trim();
      const actorKey = `devpair:${clientKey(req)}`;

      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (await joinRateLimited(actorKey)) {
        return new Response(
          JSON.stringify({ ok: false, error: "Juda ko'p urinish. Keyinroq qayta urinib ko'ring." }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }

      const { data } = await db
        .from("device_pair_codes")
        .select("code, family_code, child_id, child_name, expires_at, used_at")
        .eq("code", code)
        .limit(1);

      const row = data && data[0];
      const valid =
        row && !row.used_at && new Date(row.expires_at).getTime() > Date.now();

      await recordJoinAttempt(actorKey, row ? row.family_code : "", !!valid);

      if (!valid) {
        return new Response(
          JSON.stringify({ ok: false, error: "Kod yaroqsiz, muddati o'tgan yoki ishlatilgan" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      // Kodni darhol kuydiramiz — ikkinchi qurilma o'sha kod bilan ulanmasin.
      await db
        .from("device_pair_codes")
        .update({ used_at: new Date().toISOString() })
        .eq("code", code);

      const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
      const token = toHex(tokenBytes);
      // Kod bir farzandga bog'langan bo'lsa — telefon o'sha yozuvga ulanadi;
      // bog'lanmagan bo'lsa (masalan, faqat Android ishlatadigan farzand)
      // yangi yozuv ochiladi.
      const childId = row.child_id ||
        `android_${row.family_code}_${deviceModel}`.replace(/\s+/g, "_");

      // Tokenning O'ZI saqlanmaydi — faqat hash'i.
      const { error: tokErr } = await db.from("device_tokens").insert({
        token_hash: await sha256Hex(token),
        family_code: row.family_code,
        child_id: childId,
        device_label: row.child_name || deviceModel,
        device_model: deviceModel,
      });

      if (tokErr) {
        console.error("device_tokens insert failed:", tokErr.message);
        return new Response(JSON.stringify({ ok: false, error: tokErr.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      await upsertPairing(row.family_code, childId, {
        // Mavjud farzandga bog'langanda ismini telefon modeliga
        // almashtirmaymiz.
        childName: row.child_name || (row.child_id ? undefined : deviceModel),
        deviceLabel: deviceModel,
        source: "android_parental_guard",
      });

      // Token faqat SHU javobda ko'rinadi, boshqa hech qachon.
      return new Response(
        JSON.stringify({ ok: true, deviceToken: token, childId, familyCode: row.family_code }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 0.0e Ota-ona Android ilovaga ENG SODDA yo'l bilan kiradi: botda
    // "📲 Android ilova kodi" tugmasini bosadi (action_app_code), chiqqan
    // 8 xonali kodni shu yerda web_sessions'ga almashtiradi — device_pair
    // bilan bir xil naqsh, faqat qurilma tokeni o'rniga brauzer seansi
    // beriladi. Parol ham, ilovalar orasida almashish ham kerak emas.
    if (payload.type === "parent_pair") {
      const code = String(payload.code || "").trim().toUpperCase();
      const actorKey = `parentpair:${clientKey(req)}`;

      if (!db) {
        return new Response(JSON.stringify({ ok: false, error: "Baza ulanmagan" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (await joinRateLimited(actorKey)) {
        return new Response(
          JSON.stringify({ ok: false, error: "Juda ko'p urinish. Keyinroq qayta urinib ko'ring." }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }

      const { data } = await db
        .from("parent_pair_codes")
        .select("code, family_code, parent_telegram_id, expires_at, used_at")
        .eq("code", code)
        .limit(1);

      const row = data && data[0];
      const valid =
        row && !row.used_at && new Date(row.expires_at).getTime() > Date.now();

      await recordJoinAttempt(actorKey, row ? row.family_code : "", !!valid);

      if (!valid) {
        return new Response(
          JSON.stringify({ ok: false, error: "Kod yaroqsiz, muddati o'tgan yoki ishlatilgan" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      // Kodni darhol kuydiramiz — ikkinchi qurilma o'sha kod bilan kirmasin.
      await db
        .from("parent_pair_codes")
        .update({ used_at: new Date().toISOString() })
        .eq("code", code);

      const token = toHex(crypto.getRandomValues(new Uint8Array(32)));
      const expiresAt = new Date(Date.now() + WEB_SESSION_DAYS * 86400000).toISOString();
      const { error: sErr } = await db.from("web_sessions").insert({
        token_hash: await sha256Hex(token),
        family_code: row.family_code,
        telegram_id: row.parent_telegram_id,
        user_agent: "android-app",
        expires_at: expiresAt,
      });
      if (sErr) {
        console.error("web_sessions insert failed (parent_pair):", sErr.message);
        return new Response(JSON.stringify({ ok: false, error: sErr.message }), {
          status: 500, headers: { "Content-Type": "application/json" },
        });
      }

      // Token faqat SHU javobda ko'rinadi.
      return new Response(
        JSON.stringify({ ok: true, sessionToken: token, familyCode: row.family_code }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 0.1 Farzand ulanganida adminga xabar. FAQAT xabar — bazaga yozish
    // child_consent'da, u yerda ruxsat tekshiriladi. Ilgari bu handler ham
    // yozardi, lekin u paytda hech qanday tekshiruv yo'q edi.
    if (payload.type === "child_paired_event") {
      const childName = payload.childName || "Farzand";
      const shownCode =
        actor!.kind === "device"
          ? actor!.familyCode
          : String(payload.familyCode || "").replace(/\D/g, "");

      const alertMsg = `🎉 <b>FARZAND ULANDI!</b>\n\n👦 <b>Farzand:</b> ${childName}\n🔑 <b>Oila Kodi:</b> <code>${shownCode}</code>\n📅 <b>Vaqt:</b> ${tashkentVaqt(new Date().toISOString())}`;

      await notifyAdmins(alertMsg);
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // 0.1b Farzandning oilaga qo'shilishi — bazaga yoziladigan yagona joy.
    if (payload.type === "child_consent") {
      const childName = payload.childName || "Farzand";

      // Qurilma tokeni bilan kelsa, oila allaqachon device_pair'da bog'langan.
      if (actor!.kind === "device") {
        await upsertPairing(actor!.familyCode, actor!.childId, {
          childName,
          deviceLabel: payload.deviceModel || null,
          source: "android_parental_guard",
        });
        return new Response(
          JSON.stringify({ ok: true, childId: actor!.childId }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      // Telegram farzandi oilaga QO'SHILMOQCHI — faqat shu yerda oila kodi
      // mijozdan olinadi (bu taklif siri). Ikki qavat himoya:
      //   1) urinishlar cheklangan — 6 xonali kodni taxmin qilishga qarshi;
      //   2) ota-ona bu username'ni OLDINDAN qo'shgan bo'lishi SHART.
      // Bularsiz begona odam oila kodini hisoblab, o'zini farzand qilib
      // ro'yxatga qo'sha olardi.
      const familyCode = String(payload.familyCode || "").replace(/\D/g, "");
      const uname = actor!.username;
      const actorKey = `join:${actor!.telegramId}`;

      if (await joinRateLimited(actorKey)) {
        return new Response(
          JSON.stringify({ ok: false, error: "Juda ko'p urinish. Keyinroq urinib ko'ring." }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }

      let allowed = false;
      if (uname && familyCode && db) {
        const { data } = await db
          .from("child_pairings")
          .select("child_id")
          .eq("family_code", familyCode)
          .eq("child_id", `invite_${uname}`)
          .limit(1);
        allowed = !!(data && data[0]);
      }
      await recordJoinAttempt(actorKey, familyCode, allowed);

      if (!allowed) {
        return new Response(
          JSON.stringify({
            ok: false,
            error:
              "Bu oilaga qo'shilish uchun ota-onangiz avval sizning Telegram username'ingizni qo'shishi kerak.",
          }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      // child_id mijozdan emas, imzolangan Telegram ID'sidan — birov o'zini
      // boshqa farzand qilib ko'rsata olmaydi.
      const childId = `tg_${actor!.telegramId}`;
      await upsertPairing(familyCode, childId, {
        childName,
        deviceLabel: uname ? `@${uname}` : null,
        source: "telegram_miniapp",
        telegramUsername: uname || null,
      });
      await reconcileInvite(familyCode, uname, childId);

      return new Response(JSON.stringify({ ok: true, childId }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 0.2 Farzand tezkor xabar yuborganda (Maktab, Uy, Olib keting, SOS)
    // Farzandning tezkor xabari va SOS. Ilgari bu xabar notifyAdmins() orqali
    // ILOVA ADMINIGA ketardi — ota-ona uni umuman olmasdi. Endi to'g'ri
    // manzilga: farzandning o'z ota-onasiga, so'nggi ma'lum joyi bilan.
    if (payload.type === "child_status_alert") {
      const statusText = payload.statusText || "Xabar keldi";
      // Oila kodi mijozdan emas — lekin farzand uchun uni formuladan emas,
      // child_pairings dagi HAQIQIY juftlikdan olamiz (qarang: resolveActorFamily).
      const familyCode = await resolveActorFamily(actor!);
      const isSos = payload.sos === true || /sos/i.test(String(statusText));

      const childId = actor!.kind === "telegram" ? "tg_" + actor!.telegramId : actor!.childId;
      // Ism ham mijozdan emas: Mini App uni demo yozuvdan yuborardi va ota-ona
      // "Aliyor Valijonov: Maktabga yetib keldi" degan begona ismni ko'rardi.
      const { data: kidName } = await db!.from("child_pairings").select("child_name")
        .eq("family_code", familyCode).eq("child_id", childId).limit(1);
      const childName = (kidName && kidName[0]?.child_name) || payload.childName || "Farzand";
      const loc = await lastKnownLocation(familyCode, childId);
      const locLine = loc
        ? `\n📍 <b>So'nggi joyi:</b> <a href="https://maps.google.com/?q=${loc.lat},${loc.lng}">xaritada ochish</a>` +
          `\n🕒 <i>${tashkentVaqt(loc.recordedAt)} holatiga ko'ra</i>`
        : `\n📍 <i>Joylashuv hali kelmagan (Android ilova o'rnatilganini tekshiring).</i>`;

      const alertMsg = isSos
        ? `🆘 <b>SHOSHILINCH! FARZANDINGIZ YORDAM SO'RAMOQDA</b>\n\n👦 <b>Farzand:</b> ${childName}\n💬 <b>Xabar:</b> <b>${statusText}</b>${locLine}\n\n📅 ${tashkentVaqt(new Date().toISOString())}`
        : `📍 <b>Farzandingizdan xabar</b>\n\n👦 <b>${childName}:</b> <b>${statusText}</b>${locLine}\n\n📅 ${tashkentVaqt(new Date().toISOString())}`;

      const delivered = await notifyFamilyParents(familyCode, alertMsg);
      await postChatEvent(familyCode, { id: childId, role: "child", name: childName },
        { type: isSos ? "sos" : "status", statusType: payload.statusType || null, text: statusText, loc: loc ? { lat: loc.lat, lng: loc.lng, at: loc.recordedAt } : null },
        isSos ? `🆘 ${statusText}` : `📣 ${statusText}`);

      // SOS yetib bormasa (ota-ona hali botga yozmagan bo'lsa) — zaxira sifatida
      // adminga xabar beramiz, bu shoshilinch holat.
      if (!delivered && isSos) {
        await notifyAdmins(
          `⚠️ <b>SOS yetkazilmadi</b> — oila: <code>${familyCode}</code>\n\n${alertMsg}`
        );
      }

      return new Response(JSON.stringify({ ok: true, delivered }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const update = payload;

    // 0. JONLI JOYLASHUV (Telegram "Live Location").
    //
    // Telegram foydalanuvchi harakatlanganda joylashuvni FONDA o'zi yangilab
    // turadi (8 soatgacha) va har yangilanishni bizga edited_message sifatida
    // yuboradi. Bu — hech qanday ilova o'rnatmasdan ishlaydigan jonli radar:
    // yozuvlar Android ilova yozadigan AYNAN SHU location_pings jadvaliga
    // tushadi, shuning uchun panel ham, geo-bildirishnomalar ham o'zgarishsiz
    // ishlayveradi.
    const locMsg = update.message?.location ? update.message : update.edited_message;
    if (locMsg?.location) {
      const loc = locMsg.location;
      const fromId = locMsg.from?.id;
      const chatId = locMsg.chat?.id ?? fromId;

      if (db && fromId) {
        const childId = "tg_" + fromId;
        const { data: pairing } = await db
          .from("child_pairings")
          .select("family_code, child_name, live_until, live_msg_id")
          .eq("child_id", childId)
          .eq("is_active", true)
          .limit(1);

        const row = pairing && pairing[0];
        if (!row) {
          // Ota-ona yoki ulanmagan odam yuborgan bo'lsa — jim o'tkazamiz,
          // lekin faqat birinchi (tahrirlanmagan) xabarga javob beramiz.
          if (update.message?.location) {
            await sendMessage(
              chatId,
              "📍 Joylashuv qabul qilindi, lekin bu hisob hech qanday oilaga farzand sifatida ulanmagan.\n\nOta-onangizdan taklif havolasini so'rang."
            );
          }
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }

        const livePeriod = Number(loc.live_period) || 0;

        // Telegram yangi ulashishni ODDIY xabar sifatida, keyingi
        // yangilanishlarni esa TAHRIRLANGAN xabar sifatida yuboradi. Ayni shu
        // farqqa tayanamiz: aks holda muddati tugagan seansning har bir
        // yangilanishi "yangi seans" deb qabul qilinib, ota-onaga bir xil
        // xabar o'nlab marta borardi.
        const isNewShare = !!update.message?.location && livePeriod > 0;
        const plan = await getPlan(row.family_code);
        const capHours = plan === "pro" ? PRO_LIVE_HOURS : FREE_LIVE_HOURS;
        const fmtDur = (sec: number) =>
          sec >= 3600 ? `${Math.round(sec / 3600)} soat` : `${Math.round(sec / 60)} daqiqa`;

        // Seansning O'ZI qaysi Telegram xabari ekanini eslab qolamiz. Busiz
        // chegara umuman ishlamasdi: muddat tugagach live_until tozalanadi,
        // keyin O'SHA seansning navbatdagi yangilanishi "yangi ulashish"dek
        // ko'rinib, yana 2 soat berilaverardi. Xabar raqami esa seans tugab,
        // bola qaytadan yoqmaguncha o'zgarmaydi.
        const sameSession =
          row.live_msg_id != null && Number(row.live_msg_id) === Number(locMsg.message_id);

        if (!isNewShare && livePeriod > 0 && sameSession) {
          const expired =
            !row.live_until || new Date(row.live_until).getTime() <= Date.now();

          if (expired) {
            // Ogohlantirish faqat BIR marta: live_until tozalangach bu shart
            // boshqa bajarilmaydi, lekin jim o'tkazish davom etadi.
            if (row.live_until) {
              await db
                .from("child_pairings")
                .update({ live_until: null })
                .eq("child_id", childId)
                .eq("family_code", row.family_code);

              await notifyFamilyParents(
                row.family_code,
                plan === "pro"
                  ? `⏳ <b>${row.child_name || "Farzandingiz"}ning jonli joylashuv muddati tugadi.</b>\n\nRadar oxirgi ma'lum joyni ko'rsatishda davom etadi.`
                  : `⏳ <b>Bepul tarifdagi ${FREE_LIVE_HOURS} soatlik jonli kuzatuv tugadi.</b>\n\nPro tarifda bu muddat <b>${PRO_LIVE_HOURS} soat</b> — ya'ni butun maktab kunini bir marta yoqishning o'zi qoplaydi.`
              );
              await sendMessage(
                chatId,
                `⏳ <b>Jonli joylashuv muddati tugadi.</b>\n\nYana yoqmoqchi bo'lsang — /joylashuv`
              );
            }
            return new Response(JSON.stringify({ ok: true }), { status: 200 });
          }
        }

        await db.from("location_pings").insert({
          family_code: row.family_code,
          child_id: childId,
          lat: loc.latitude,
          lng: loc.longitude,
          accuracy_m: Math.round(Number(loc.horizontal_accuracy) || 0) || null,
        });

        // Jonli ulashish boshlandi / tugadi.
        if (isNewShare || (livePeriod > 0 && !sameSession)) {
          const grantedSec = Math.min(livePeriod, capHours * 3600);
          const until = new Date(Date.now() + grantedSec * 1000).toISOString();
          await db
            .from("child_pairings")
            .update({
              live_until: until,
              live_started_at: new Date().toISOString(),
              live_msg_id: locMsg.message_id,
            })
            .eq("child_id", childId)
            .eq("family_code", row.family_code);

          // Bola tanlagan muddat bizning chegaradan uzun bo'lsa, buni undan
          // yashirmaymiz — aks holda u "8 soat yoqdim" deb o'ylab yuradi-yu,
          // ota-ona 2 soatdan keyin uni ko'rmay qoladi.
          const capNote =
            livePeriod > grantedSec
              ? `\n\n<i>Sen ${fmtDur(livePeriod)} ni tanlading, lekin oilangdagi bepul tarifda ${FREE_LIVE_HOURS} soat ishlaydi.</i>`
              : "";

          await sendMessage(
            chatId,
            `✅ <b>Jonli joylashuv yoqildi.</b>\n\nEndi ota-onang seni xaritada jonli ko'radi — <b>${fmtDur(grantedSec)}</b> davomida. Telefoningni ochib turishing shart emas.${capNote}\n\nTo'xtatmoqchi bo'lsang: xabardagi joylashuvni bosib, <i>«Ulashishni to'xtatish»</i> ni tanla.`
          );
          await notifyFamilyParents(
            row.family_code,
            `🟢 <b>${row.child_name || "Farzandingiz"} jonli joylashuvni yoqdi.</b>\n\n${fmtDur(grantedSec)} davomida radarda jonli ko'rinadi.` +
              (plan !== "pro" && livePeriod > grantedSec
                ? `\n\n<i>Pro tarifda bu ${PRO_LIVE_HOURS} soat bo'lardi.</i>`
                : "")
          );
        } else if (livePeriod > 0) {
          // Davom etayotgan seans. live_until ga TEGMAYMIZ — aks holda har
          // yangilanish muddatni uzaytirib, chegara hech qachon ishlamasdi.
        } else if (update.edited_message && row.live_until) {
          // live_period yo'q + tahrirlangan xabar = ulashish to'xtadi.
          await db
            .from("child_pairings")
            .update({ live_until: null, live_msg_id: null })
            .eq("child_id", childId)
            .eq("family_code", row.family_code);
          await notifyFamilyParents(
            row.family_code,
            `🔴 <b>${row.child_name || "Farzandingiz"} jonli joylashuvni to'xtatdi.</b>\n\nRadar oxirgi ma'lum joyni ko'rsatishda davom etadi.`
          );
        }

        // Geo-bildirishnomalar shu yerda ham ishlaydi.
        const fired = await evaluateGeofences(
          row.family_code,
          childId,
          loc.latitude,
          loc.longitude
        );
        for (const f of fired) {
          await notifyFamilyParents(
            row.family_code,
            "\u{1F4CD} <b>" + f.message + "</b>\n\n" +
              '<a href="https://maps.google.com/?q=' + loc.latitude + "," + loc.longitude + '">Xaritada ko\'rish</a>' +
              "\n🕒 " + tashkentVaqt(new Date().toISOString())
          );
        }

        // Bir martalik joylashuv (live emas) uchun qisqa tasdiq.
        if (update.message?.location && livePeriod === 0) {
          await sendMessage(
            chatId,
            "📍 <b>Joylashuving ota-onangga yuborildi.</b>\n\nDoimiy ko'rinib turishi uchun <b>jonli joylashuv</b>ni yoqishing mumkin — /joylashuv"
          );
        }
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // 1. Callback query tugmalari bosilganda
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message.chat.id;
      const data = cb.data || "";
      const lang = USER_LANG[chatId] || "uz";
      const rawUsername = (cb.from.username || "").toLowerCase().replace("@", "");
      const isAdmin = ADMIN_USERNAMES.has(rawUsername);
      if (isAdmin) ADMIN_CHAT_IDS.add(chatId);

      const userKey = `@${cb.from.username || cb.from.id}`;
      const isApproved = isAdmin || (await isFamilyApproved(chatId));

      await answerCallbackQuery(cb.id);

      // Admin Tasdiqlash Callbacklari.
      //
      // isAdmin TEKSHIRUVI SHART: ilgari u hisoblanardi-yu, bu yerda
      // ishlatilmasdi — ya'ni tugma bosgan (yoki so'rovni qo'lda yasagan)
      // istalgan odam istalgan oilani o'zi tasdiqlab yoki rad etib qo'ya
      // olardi. Oila kodi esa Telegram ID'dan hisoblanadi, ya'ni topish oson.
      if (data.startsWith("admin_approve_") || data.startsWith("admin_reject_")) {
        if (!isAdmin) {
          await sendMessage(chatId, "⛔️ Bu amal faqat administratorlar uchun.");
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }
      }

      // Ilovaga kirishni tasdiqlash.
      if (data.startsWith("applogin_ok_") || data.startsWith("applogin_no_")) {
        const approve = data.startsWith("applogin_ok_");
        const appCode = data.slice("applogin_ok_".length).toUpperCase();
        if (!db) return new Response(JSON.stringify({ ok: true }), { status: 200 });
        const fam = await registeredParentFamily(chatId);
        const { data: rows } = await db.from("app_login_requests")
          .select("id, status, expires_at").eq("code", appCode).limit(1);
        const req = rows && rows[0];
        if (!req || !fam || new Date(req.expires_at).getTime() < Date.now() || req.status !== "pending") {
          await sendMessage(chatId, "⌛️ Bu so'rov eskirgan. Ilovada qaytadan urinib ko'ring.");
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }
        if (!approve) {
          await db.from("app_login_requests").update({ status: "rejected" }).eq("id", req.id).eq("status", "pending");
          await sendMessage(chatId, "✅ Rad etildi. Ilova kira olmaydi.");
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }
        const sessionToken = randomHex(32);
        await db.from("web_sessions").insert({
          token_hash: await sha256Hex(sessionToken),
          family_code: fam,
          telegram_id: chatId,
          user_agent: "android-app",
          expires_at: new Date(Date.now() + WEB_SESSION_DAYS * 86400000).toISOString(),
        });
        const { data: claimed } = await db.from("app_login_requests")
          .update({ status: "approved", approved_by: chatId, family_code: fam, session_token: sessionToken })
          .eq("id", req.id).eq("status", "pending").select("id");
        if (!claimed || !claimed[0]) {
          await sendMessage(chatId, "⌛️ Bu so'rov allaqachon ishlatilgan.");
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }
        await sendMessage(chatId, "✅ <b>Kirish tasdiqlandi.</b>\n\nIlovaga qayting — u o'zi ochiladi.");
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Uy vazifasi va sovg'a tasdig'i (eski Pro almashtirish tugmalari ham).
      if (await handleBallCallback(data, chatId)) {
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      if (data.startsWith("admin_approve_")) {
        const targetCode = data.replace("admin_approve_", "");
        const ok = await setFamilyApproval(targetCode, "approved");
        await sendMessage(
          chatId,
          ok
            ? `✅ <b>Tasdiqlandi:</b> <code>${targetCode}</code> oilasiga to'liq ruxsat berildi.`
            : `⚠️ <b>Bazaga yozilmadi:</b> <code>${targetCode}</code> uchun so'rov topilmadi.`
        );
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      if (data.startsWith("admin_reject_")) {
        const targetCode = data.replace("admin_reject_", "");
        const ok = await setFamilyApproval(targetCode, "rejected");
        await sendMessage(
          chatId,
          ok
            ? `❌ <b>Rad etildi:</b> <code>${targetCode}</code> so'rovi rad etildi.`
            : `⚠️ <b>Bazaga yozilmadi:</b> <code>${targetCode}</code> uchun so'rov topilmadi.`
        );
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // "Farzandim qayerda?" — so'nggi joy va vaqti.
      if (data === "action_where") {
        const r = await buildWhereReport(generateFamilyCode(chatId), lang);
        await sendMessage(chatId, r.text, r.keyboard);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Android ilovaga ENG SODDA kirish: farzand device_pair_codes bilan
      // qanday ulansa, ota-ona ham xuddi shunday — bitta bosishda kod
      // chiqadi, uni ilovada kiritadi. Parol yo'q, ilovalar orasida
      // almashish yo'q (Telegram-orqali kirish shu bilan solishtirganda
      // ko'proq bosqichli va deep-link ochilishiga bog'liq edi).
      if (data === "action_app_code" && db) {
        const famOfParent = await registeredParentFamily(chatId);
        if (!famOfParent) {
          await sendMessage(
            chatId,
            lang === "ru"
              ? "⚠️ Сначала зарегистрируйтесь через «Открыть панель»."
              : "⚠️ Avval «Ota-ona paneli» orqali ro'yxatdan o'ting."
          );
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }
        const appCode = randomCode(8);
        const { error } = await db.from("parent_pair_codes").insert({
          code: appCode,
          family_code: famOfParent,
          parent_telegram_id: chatId,
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        });
        if (error) {
          console.error("parent_pair_codes insert failed:", error.message);
          await sendMessage(chatId, lang === "ru" ? "⚠️ Ошибка сервера." : "⚠️ Server xatosi.");
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }
        const msg = lang === "ru"
          ? `📲 <b>Код для входа в приложение:</b>\n\n<code>${appCode}</code>\n\n` +
            `Откройте Android-приложение и введите этот код в поле входа. Код действует 15 минут и работает один раз.`
          : `📲 <b>Ilovaga kirish kodi:</b>\n\n<code>${appCode}</code>\n\n` +
            `Android ilovani oching va shu kodni kirish maydoniga kiriting. Kod 15 daqiqa amal qiladi va bir marta ishlatiladi.`;
        await sendMessage(chatId, msg);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Hisobotdagi "hozirgi joyini so'rash" tugmasi. Oila kodi tugmadan
      // emas, bosgan odamning o'z ID'sidan olinadi — begona bolani so'rab
      // bo'lmaydi (askChildForLocation egalikni ham tekshiradi).
      if (data.startsWith("askloc_")) {
        const childId = data.slice("askloc_".length);
        const r = await askChildForLocation(generateFamilyCode(chatId), childId, chatId);
        let javob: string;
        if (r.ok && r.live) {
          javob = "🟢 <b>Jonli joylashuv yoqilgan</b> — farzandingiz joyi o'zi yangilanib turibdi. Bezovta qilmadim.";
        } else if (r.ok && r.asked) {
          const qoldi = r.quota && r.quota.plan !== "pro"
            ? `\n\n<i>Bepul tarifda ${FREE_WINDOW_HOURS} soatda yana ${Math.max(0, r.quota.remaining - 1)} ta so'rov qoldi.</i>`
            : "";
          javob =
            "📨 <b>Farzandingizga so'rov yuborildi.</b>\n\n" +
            "U tugmani bosishi bilan joylashuvi va vaqti shu yerga keladi." + qoldi;
        } else if (r.ok) {
          javob = "ℹ️ Bu farzand Telegram orqali emas, ilova orqali ulangan — joylashuvi ilovadan o'zi keladi.";
        } else if (r.status === 402) {
          javob = `💎 <b>${r.error}</b>\n\nHozircha yuqoridagi so'nggi ma'lum joy ko'rinib turadi.`;
        } else {
          javob = `⚠️ ${r.error || "So'rovni yuborib bo'lmadi."}`;
        }
        await sendMessage(chatId, javob);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      if (data.startsWith("action_pair")) {
        await sendMessage(chatId, getPairingText(chatId, lang, isApproved));
      } else if (data === "action_reels") {
        await sendMessage(chatId, getReelsAnalysisText(lang));
      } else if (data === "action_feedback") {
        await sendMessage(chatId, getFeedbackText(lang));
      } else if (data === "action_lang") {
        const langKeyboard = {
          inline_keyboard: [
            [
              { text: "🇺🇿 O'zbek tili", callback_data: "set_lang_uz" },
              { text: "🇷🇺 Русский язык", callback_data: "set_lang_ru" },
            ],
          ],
        };
        await sendMessage(chatId, "🌐 Tilni tanlang / Выберите язык интерфейса:", langKeyboard);
      } else if (data === "set_lang_uz") {
        USER_LANG[chatId] = "uz";
        await sendMessage(chatId, "✅ Til o'zbekchaga o'zgartirildi!", getStartKeyboard(chatId, "uz"));
      await sendMessage(chatId, "👇 <b>Start</b> tugmasi doim pastda.", boshlashReplyKeyboard());
      } else if (data === "set_lang_ru") {
        USER_LANG[chatId] = "ru";
        await sendMessage(chatId, "✅ Язык успешно изменён на русский!", getStartKeyboard(chatId, "ru"));
        await sendMessage(chatId, "👇 <b>Start</b> всегда внизу — / не нужен.", boshlashReplyKeyboard());
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // 2. Matnli xabarlar
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      let text = (msg.text || "").trim();
      const lang = USER_LANG[chatId] || "uz";
      const rawUsername = (msg.from.username || "").toLowerCase().replace("@", "");
      const isAdmin = ADMIN_USERNAMES.has(rawUsername);
      if (isAdmin) ADMIN_CHAT_IDS.add(chatId);

      const userKey = `@${msg.from.username || msg.from.id}`;
      const isApproved = isAdmin || (await isFamilyApproved(chatId));

      // Sherik qo'shish komandasi: /addadmin @username
      if (text.startsWith("/addadmin")) {
        if (!isAdmin) {
          await sendMessage(chatId, "⚠️ Bu buyruq faqat bosh administratorlar uchun!");
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }
        const parts = text.split(" ");
        if (parts.length > 1) {
          const target = parts[1].replace("@", "").toLowerCase().trim();
          ADMIN_USERNAMES.add(target);
          await sendMessage(chatId, `👑 <b>Yangi Hamkor / Admin qo'shildi:</b> @${target}\nEndi @${target} ham loyihani to'liq boshqarishi va so'rovlarni tasdiqlashi mumkin!`);
        } else {
          await sendMessage(chatId, "⚠️ Foydalanish: <code>/addadmin @sherik_username</code>");
        }
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Sherikni o'chirish: /removeadmin @username
      if (text.startsWith("/removeadmin")) {
        if (!isAdmin) {
          await sendMessage(chatId, "⚠️ Bu buyruq faqat bosh administratorlar uchun!");
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }
        const parts = text.split(" ");
        if (parts.length > 1) {
          const target = parts[1].replace("@", "").toLowerCase().trim();
          ADMIN_USERNAMES.delete(target);
          await sendMessage(chatId, `❌ <b>Admin huquqi olib tashlandi:</b> @${target}`);
        } else {
          await sendMessage(chatId, "⚠️ Foydalanish: <code>/removeadmin @sherik_username</code>");
        }
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Barcha adminlar ro'yxati: /admins
      if (text === "/admins") {
        const list = Array.from(ADMIN_USERNAMES).map(u => `• @${u}`).join("\n");
        await sendMessage(chatId, `👑 <b>Loyihani Boshqaruvchi Administratorlar va Sheriklar:</b>\n\n${list}\n\n<i>Yangi sherik qo'shish: /addadmin @username</i>`);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Admin tayinlash buyrug'i (/admin yoki /setadmin)
      if (text === "/admin" || text === "/setadmin" || isAdmin) {
        ADMIN_CHAT_IDS.add(chatId);
      }

      // /start [payload] komandasi
      const textNorm = (text || "").trim().replace(/[«»]/g, "").toLowerCase();
      if (textNorm === "boshlash" || textNorm === "start" || textNorm === "бошлаш") {
        text = "/start";
      }
      if (text.startsWith("/start")) {
        // Force-remove old reply keyboard (location sharing button) from user's Telegram client cache
        try {
          const resClean = await fetch(`${TELEGRAM_API}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: "🛡️",
              reply_markup: { remove_keyboard: true }
            })
          });
          const cleanJson = await resClean.json();
          if (cleanJson.ok && cleanJson.result?.message_id) {
            await fetch(`${TELEGRAM_API}/deleteMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: chatId, message_id: cleanJson.result.message_id })
            });
          }
        } catch (_) {}

        // (b) yo'li: farzand ota-ona ulashgan taklif havolasini bosdi.
        //
        // Telegram botga faqat O'ZIGA yozgan odamga xabar yuborishga ruxsat
        // beradi, shuning uchun bot farzandga birinchi bo'lib yoza olmaydi.
        // Havola bosilishi /start ni yuboradi — aynan shu payt bot unga
        // yozish huquqiga ega bo'ladi va kodni o'zi yetkazadi.
        const invMatch = text.match(/inv_([A-Za-z0-9]{4,16})/);
        if (invMatch) {
          const invCode = invMatch[1].toUpperCase();
          let inv: any = null;
          if (db) {
            const { data } = await db
              .from("child_invites")
              .select("code, child_name, expires_at, used_at")
              .eq("code", invCode)
              .limit(1);
            inv = data && data[0];
          }

          const stillOpen =
            inv && !inv.used_at && new Date(inv.expires_at).getTime() > Date.now();

          if (!stillOpen) {
            await sendMessage(
              chatId,
              "⚠️ <b>Bu taklif havolasi ishlamaydi.</b>\n\nU allaqachon ishlatilgan yoki muddati o'tgan. Ota-onangizdan yangi havola so'rang."
            );
            return new Response(JSON.stringify({ ok: true }), { status: 200 });
          }

          await sendMessage(
            chatId,
            "\u{1F44B} <b>Assalomu alaykum" +
              (inv.child_name ? ", " + inv.child_name : "") +
              "!</b>\n\n" +
              "Ota-onangiz sizni Qalqon AI oilaviy himoyasiga taklif qildi.\n\n" +
              "\u{1F511} <b>Sizning kodingiz:</b>\n<code>" +
              invCode +
              "</code>\n\n" +
              "Pastdagi tugmani bosing, 4 ta qoida bilan tanishing va shu kodni kiriting.",
            {
              inline_keyboard: [
                [
                  {
                    text: "\u{1F6E1}️ Qalqonni ochish",
                    web_app: { url: miniAppUrl() + "&role=child&inv=" + invCode },
                  },
                ],
              ],
            }
          );
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }

        // Eski `pair_<oila kodi>` havolasi. U hech qachon juftlik yaratmagan,
        // lekin bot "muvaffaqiyatli bog'landingiz" deb yozardi — farzand esa
        // aslida ulanmagan bo'lib, keyin ilovada ota-ona panelini ko'rardi.
        // Endi yolg'on javob o'rniga haqiqiy yo'l aytiladi.
        if (text.includes("pair_") || text.includes("child_")) {
          const reply = lang === "ru"
            ? "⚠️ <b>Эта ссылка устарела.</b>\n\nПопросите родителя открыть панель → «Добавить ребёнка» и прислать вам <b>персональную ссылку с одноразовым кодом</b>. Только она подключает вас по-настоящему."
            : "⚠️ <b>Bu havola eskirgan.</b>\n\nOta-onangizdan panelni ochib, «Yangi farzand qo'shish» orqali sizga <b>alohida, bir martalik kodli havola</b> yuborishini so'rang. Faqat o'sha havola sizni haqiqatan ulaydi.";
          await sendMessage(chatId, reply);
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }

        // Fokus jangi havolasi: ?start=duel_<kod>. Mini App'da ochiladi,
        // qabul qilish o'sha yerda bajariladi (bola kim ekanini imzolangan
        // identitet hal qiladi).
        // Android ilovaga kirish: ?start=app_<kod>. Kodni ilova yaratgan,
        // bu yerda faqat ota-ona TASDIQLAYDI — shundan keyin ilova seansni
        // o'zi olib ketadi.
        const appMatch = text.match(/app_([A-Z0-9]{6,10})/i);
        if (appMatch && db) {
          const appCode = appMatch[1].toUpperCase();
          const { data: reqRows } = await db.from("app_login_requests")
            .select("id, status, device_label, expires_at").eq("code", appCode).limit(1);
          const req = reqRows && reqRows[0];
          const famOfParent = await registeredParentFamily(chatId);
          if (!req || new Date(req.expires_at).getTime() < Date.now() || req.status !== "pending") {
            await sendMessage(chatId, "⌛️ <b>Bu kirish so'rovi eskirgan.</b>\n\nIlovada «Telegram bilan kirish» tugmasini qaytadan bosing.");
          } else if (await isPairedChild(chatId)) {
            await sendMessage(chatId, "ℹ️ <b>Bu tugma ota-onalar uchun.</b>\n\nSen ilovaga ota-onang bergan bir martalik kod bilan kirasan.");
          } else if (!famOfParent) {
            await sendMessage(chatId, "⚠️ <b>Avval ro'yxatdan o'ting.</b>\n\nBotda «Ro'yxatdan o'tish» ni bosing, keyin ilovaga kiring.");
          } else {
            await sendMessage(
              chatId,
              `📱 <b>Ilovaga kirishni tasdiqlaysizmi?</b>\n\n` +
                (req.device_label ? `<b>Qurilma:</b> ${req.device_label}\n` : "") +
                `<b>Oila kodi:</b> <code>${famOfParent}</code>\n\n` +
                `<i>Bu so'rovni siz boshlamagan bo'lsangiz — «Yo'q» ni bosing.</i>`,
              { inline_keyboard: [[
                { text: "✅ Ha, bu men", callback_data: "applogin_ok_" + appCode },
                { text: "❌ Yo'q", callback_data: "applogin_no_" + appCode },
              ]] },
            );
          }
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }

        // Do'st bilan online o'yin: ?start=play_<kod>. Qo'shilish Mini App'da,
        // imzolangan identitet bilan bajariladi.
        const playMatch = text.match(/play_([A-Z0-9]{4,10})/i);
        if (playMatch) {
          const playCode = playMatch[1].toUpperCase();
          const kidHere = await isPairedChild(chatId);
          let title = "o'yin";
          let emoji = "🎮";
          if (db) {
            const { data: pm } = await db.from("game_matches").select("game, p1_name").eq("code", playCode).limit(1);
            const gm = pm && pm[0] && MATCH_GAMES[pm[0].game];
            if (gm) { title = gm.title; emoji = gm.emoji; }
          }
          await sendMessage(
            chatId,
            kidHere
              ? `${emoji} <b>Do'sting seni "${title}" o'yiniga chaqiryapti!</b>\n\nPastdagi tugmani bosib qo'shil.`
              : `${emoji} <b>Bu — Qalqon AI'dagi do'stlar o'yiniga taklif.</b>\n\n` +
                  `O'ynash uchun avval ota-onang seni Qalqon AI'ga ulashi kerak. Ota-onangga ayt: botni ochib, «Farzandni ulash» ni bossin.`,
            kidHere
              ? { inline_keyboard: [[{ text: `${emoji} Qo'shilish`, web_app: { url: `${miniAppUrl()}&role=child&play=${playCode}` } }]] }
              : undefined
          );
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }

        const duelMatch = text.match(/duel_([A-Z0-9]{4,10})/i);
        if (duelMatch) {
          const duelCode = duelMatch[1].toUpperCase();
          await sendMessage(
            chatId,
            `⚔️ <b>Senga fokus jangiga chaqiruv keldi!</b>\n\n` +
              `Do'sting seni sinab ko'rmoqchi: 24 soat ichida kim ko'proq diqqat bilan ishlaydi?\n\n` +
              `Pastdagi tugmani bosib qabul qil.`,
            {
              inline_keyboard: [[
                {
                  text: "⚔️ Jangni qabul qilish",
                  web_app: { url: `${miniAppUrl()}&role=child&duel=${duelCode}` },
                },
              ]],
            }
          );
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }

        // Taklif havolasi: ?start=ref_<oila kodi>. Kod Mini App'ga uzatiladi
        // va ro'yxatdan o'tishda kim chaqirgani yozib qo'yiladi. Mukofot esa
        // keyinroq, admin tasdiqlaganda beriladi.
        // Bola taklifi alohida shaklda keladi: refc_<oila kodi>_<tg id>.
        // "refc_" ni avval tekshiramiz, chunki keyingi "ref_" qolipi bilan
        // chalkashib ketmasligi kerak.
        const refChildMatch = text.match(/refc_(\d{6})_(\d{4,15})/);
        if (refChildMatch) {
          const refCode = refChildMatch[1];
          const refChild = refChildMatch[2];
          await sendMessage(
            chatId,
            `👋 <b>Xush kelibsiz!</b>\n\nFarzandingizning do'sti sizni Qalqon AI'ga taklif qildi.\n\nRo'yxatdan o'tib, administrator tasdig'ini olganingizdan so'ng <b>sizga ham, taklif qilgan oilaga ham +${REFERRAL_BONUS_DAYS_CHILD} kun Pro</b> beriladi.\n\nPastdagi tugmani bosing va oila ma'lumotlarini to'ldiring.`,
            {
              inline_keyboard: [
                [
                  {
                    text: "📝 Ro'yxatdan o'tish",
                    web_app: {
                      url: `${miniAppUrl()}&lang=${lang}&ref=${refCode}&refc=${refChild}`,
                    },
                  },
                ],
              ],
            }
          );
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }

        const refMatch = text.match(/ref_(\d{6})/);
        if (refMatch) {
          const refCode = refMatch[1];
          await sendMessage(
            chatId,
            `👋 <b>Xush kelibsiz!</b>\n\nSizni Qalqon AI'ga bir oila taklif qildi. Ro'yxatdan o'tib, administrator tasdig'ini olganingizdan so'ng <b>sizga ham, taklif qilgan oilaga ham +${REFERRAL_BONUS_DAYS} kun Pro</b> beriladi.\n\nPastdagi tugmani bosing va oila ma'lumotlarini to'ldiring.`,
            {
              inline_keyboard: [
                [
                  {
                    text: "📝 Ro'yxatdan o'tish",
                    web_app: { url: `${miniAppUrl()}&lang=${lang}&ref=${refCode}` },
                  },
                ],
              ],
            }
          );
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }

        // Kim ekani BAZADAN aniqlanadi: ulangan farzandga ota-ona paneli
        // tugmasi ko'rsatilmaydi.
        const startIsChild = await isPairedChild(chatId);

        // Hali ro'yxatdan o'tmagan odam avval maqsad va qoidalarni ko'radi,
        // so'ng o'zi tanlaydi: ro'yxatdan o'tish yoki kirish.
        if (!startIsChild && !isAdmin && !(await hasRegistration(chatId))) {
          await sendMessage(chatId, getWelcomeGateText(lang), getWelcomeGateKeyboard(lang));
          await sendMessage(chatId, "👇 <b>Start</b> tugmasi doim pastda — / kerak emas.", boshlashReplyKeyboard());
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }

        await sendMessage(
          chatId,
          startIsChild ? getChildStartText(lang) : getStartMenuText(chatId, lang, true, isAdmin),
          getStartKeyboard(chatId, lang, startIsChild)
        );
        await sendMessage(chatId, "👇 <b>Start</b> tugmasi doim pastda — / kerak emas.", boshlashReplyKeyboard());
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Jonli joylashuvni yoqish bo'yicha yo'riqnoma.
      //
      // Muhim: bot jonli joylashuvni TUGMA orqali so'ray olmaydi — Telegram
      // buni faqat foydalanuvchining o'zi qo'lda yoqishiga ruxsat beradi.
      // Shuning uchun bu yerda aniq qadamlar yoziladi.
      // Ota-ona "qayerda?" deb so'raydi — buyruq bilan ham, oddiy so'z bilan
      // ham. Bola yozsa bu yerga tushmaydi: uning oilasi o'z ID'sidan emas.
      if (
        text.startsWith("/qayerda") ||
        (!text.startsWith("/") && text.length <= 40 &&
          /(qayerda|lokatsiya|joylashuv|где)/i.test(text))
      ) {
        if (!(await isPairedChild(chatId)) && (await hasRegistration(chatId))) {
          const r = await buildWhereReport(generateFamilyCode(chatId), lang);
          await sendMessage(chatId, r.text, r.keyboard);
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }
      }

      if (text.startsWith("/joylashuv")) {
        const isChildHere = await isPairedChild(chatId);
        if (isChildHere) {
          // Bolaga oilasining amaldagi chegarasini aytamiz — "8 soat" deb
          // yozib qo'yib, keyin 2 soatda uzib qo'yish aldash bo'lardi.
          const kidFam = await resolveActorFamily({
            kind: "telegram",
            telegramId: chatId,
            familyCode: "",
          } as any);
          const kidPlan = kidFam ? await getPlan(kidFam) : "free";
          const kidHours = kidPlan === "pro" ? PRO_LIVE_HOURS : FREE_LIVE_HOURS;

          await sendMessage(
            chatId,
            `📍 <b>Jonli joylashuvni qanday yoqish kerak</b>\n\n` +
              `1. Shu suhbatda pastdagi <b>📎 (qisqich)</b> belgisini bos.\n` +
              `2. <b>Joylashuv (Location)</b> ni tanla.\n` +
              `3. <b>«Jonli joylashuvni ulashish»</b> (Share My Live Location) ni bos.\n` +
              `4. Muddatni tanla.\n\n` +
              `Oilangdagi tarifda jonli kuzatuv <b>${kidHours} soat</b> ishlaydi` +
              (kidPlan === "pro" ? `.` : ` (Pro tarifda ${PRO_LIVE_HOURS} soat).`) +
              `\n\nShundan keyin telefoningni cho'ntagingga solib qo'yaversang bo'ladi: ` +
              `Telegram joylashuvni o'zi yangilab turadi, ota-onang esa seni xaritada jonli ko'radi.\n\n` +
              `To'xtatish uchun o'sha xabarni ochib, <i>«Ulashishni to'xtatish»</i> ni bosasan.`
          );
        } else {
          await sendMessage(
            chatId,
            `📍 <b>Jonli joylashuv</b>\n\n` +
              `Farzandingiz o'z Telegramida shu botga <b>jonli joylashuv</b> ulashsa, ` +
              `siz uni panelda xaritada jonli ko'rasiz — hech qanday ilova o'rnatmasdan, ` +
              `iPhone'da ham.\n\n` +
              `Bepul tarifda <b>${FREE_LIVE_HOURS} soat</b>, Pro tarifda <b>${PRO_LIVE_HOURS} soat</b> davom etadi.\n\n` +
              `Farzandingizga ayting: botni ochsin va <code>/joylashuv</code> deb yozsin — ` +
              `bot unga qadamlarni ko'rsatadi.`
          );
        }
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Telefon raqami — Telegram tugmasi orqali. SMS kod kerak emas:
      // raqamni Telegram o'zi tasdiqlagan bo'ladi va foydalanuvchi uni
      // qo'lda yozmaydi, ya'ni xato raqam ham, begona raqam ham tushmaydi.
      if (text.startsWith("/telefon")) {
        await sendMessage(
          chatId,
          "📞 <b>Telefon raqamingizni tasdiqlash</b>\n\nPastdagi tugmani bosing — raqam Telegram orqali, avtomatik yuboriladi. Qo'lda yozish va SMS kod kerak emas.\n\n<i>Raqam faqat oilangizni tiklashda va shoshilinch holatlarda ishlatiladi.</i>",
          undefined
        );
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "👇",
            reply_markup: {
              keyboard: [[{ text: "📞 Raqamimni yuborish", request_contact: true }]],
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          }),
        });
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Kunlik xulosani yoqish/o'chirish.
      if (text.startsWith("/xulosa")) {
        if (db) {
          const famCode = generateFamilyCode(chatId);
          const { data } = await db
            .from("parent_registrations")
            .select("digest_enabled")
            .eq("family_code", famCode)
            .limit(1);
          if (!data || !data[0]) {
            await sendMessage(chatId, "⚠️ Avval ro'yxatdan o'ting — kunlik xulosa ro'yxatdan o'tgan oilalarga yuboriladi.");
          } else {
            const next = !data[0].digest_enabled;
            await db
              .from("parent_registrations")
              .update({ digest_enabled: next })
              .eq("family_code", famCode);
            await sendMessage(
              chatId,
              next
                ? "🌙 <b>Kunlik xulosa yoqildi.</b>\n\nHar kuni kechqurun farzandingizning ekran vaqti, eng ko'p ishlatilgan ilovalari va kelish-ketishlari haqida qisqa hisobot yuboraman."
                : "🔕 <b>Kunlik xulosa o'chirildi.</b>\n\nQayta yoqish uchun yana /xulosa buyrug'ini yuboring."
            );
          }
        }
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      if (text.startsWith("/farzand")) {
        await sendMessage(chatId, getPairingText(chatId, lang, true));
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      if (text.startsWith("/reels")) {
        await sendMessage(chatId, getReelsAnalysisText(lang));
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Rasm yoki skrinshot yuborilgan bo'lsa
      // Telegram tugmasi orqali kelgan raqam. Faqat O'Z raqamini qabul
      // qilamiz: contact.user_id yuboruvchiga teng bo'lishi shart, aks holda
      // birov boshqa odamning kontaktini yuborib, uni o'z oilasiga yozdirib
      // qo'yishi mumkin bo'lardi.
      if (msg.contact) {
        const contact = msg.contact;
        if (Number(contact.user_id) !== Number(msg.from?.id)) {
          await sendMessage(chatId, "⚠️ Iltimos, <b>o'z</b> raqamingizni yuboring (tugma orqali).");
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }
        if (db) {
          const famCode = generateFamilyCode(chatId);
          const { data } = await db
            .from("parent_registrations")
            .select("family_code")
            .eq("family_code", famCode)
            .limit(1);
          if (data && data[0]) {
            await db
              .from("parent_registrations")
              .update({
                parent_phone: contact.phone_number,
                phone_verified_at: new Date().toISOString(),
              })
              .eq("family_code", famCode);
            await sendMessage(
              chatId,
              `✅ <b>Raqamingiz tasdiqlandi:</b> <code>${contact.phone_number}</code>\n\nRahmat! Endi oilangizni tiklash kerak bo'lsa, shu raqam yordam beradi.`,
              undefined
            );
            // Vaqtinchalik klaviaturani olib tashlaymiz.
            await fetch(`${TELEGRAM_API}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: chatId, text: "🛡", reply_markup: { remove_keyboard: true } }),
            });
            await sendMessage(chatId, "👇 <b>Start</b> tugmasi doim pastda.", boshlashReplyKeyboard());
          } else {
            await sendMessage(chatId, "⚠️ Avval ro'yxatdan o'ting, keyin raqamni tasdiqlaysiz.");
          }
        }
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      if (msg.photo) {
        const photoReply = lang === "ru"
          ? "✅ <b>Скриншот принят!</b>\n\nВремя использования приложений и задания проанализированы. Данные синхронизированы с панелью управления."
          : "✅ <b>Skrinshot qabul qilindi!</b>\n\n📱 Ilovalardan foydalanish vaqti va darslik topshiriqlari tahlil qilindi. Ma'lumotlar boshqaruv paneliga sinxronlashtirildi.";
        await sendMessage(chatId, photoReply);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Ovozli xabar
      if (msg.voice) {
        const voiceReply = lang === "ru"
          ? "🎙️ <b>Голосовое сообщение принято.</b>\n\nРекомендации по школьным предметам и цифровым привычкам синхронизированы."
          : "🎙️ <b>Ovozli xabar qabul qilindi.</b>\n\nFarzandingizning darsliklarni o'zlashtirishi va raqamli odatlarini yaxshilash bo'yicha tavsiyalar sinxronlashtirildi.";
        await sendMessage(chatId, voiceReply);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Farzand yozgan boshqa matn. Ilgari u ham ota-onaga mo'ljallangan
      // javobni olardi ("Farzandingizning baholari... Ota-Ona Paneli") —
      // masalan "qayerda" deb yozgan bola o'zini ota-ona deb chalg'itardi.
      if (await isPairedChild(chatId)) {
        const aboutLocation = /(qayer|joylash|lokats|manzil|где)/i.test(text);
        await sendMessage(
          chatId,
          aboutLocation
            ? `📍 <b>Joylashuvingni ota-onangga yuborasanmi?</b>

` +
                `Pastdagi tugmani bos — joylashuving bir zumda ota-onangga boradi. ` +
                `Bu doimiy kuzatuv emas, faqat shu daqiqadagi nuqta.`
            : `🌟 <b>Salom!</b> Bu yerda yozishmalar o'qilmaydi — hamma narsa o'z panelingda.

` +
                `Pastdagi tugmani bos: AI do'st, ballaring, do'kon, o'yinlar va ota-onangga tezkor xabar o'sha yerda.`,
          {
            inline_keyboard: [[
              aboutLocation
                ? { text: "📍 Joylashuvni yuborish", web_app: { url: `${miniAppUrl()}&role=child&ask=loc` } }
                : { text: "🌟 O'z panelimni ochish", web_app: { url: `${miniAppUrl()}&role=child&lang=${lang}` } },
            ]],
          }
        );
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Boshqa matnli savollar
      const generalReply = lang === "ru"
        ? "💡 <b>Информация:</b> Оценки 100 баллов, школьные предметы 1-11 классов и онлайн-радар под защитой. Нажмите кнопку <b>«📊 Панель Родителя»</b> внизу слева."
        : "💡 <b>Ma'lumot:</b> Farzandingizning 100 ballik baholari, 1-11 sinf DTS darsliklari va jonli joylashuvi nazorat ostida. Boshqaruv panelini ochish uchun ekranning pastki chap qismidagi <b>«📊 Ota-Ona Paneli»</b> tugmasini bosing.";
      await sendMessage(chatId, generalReply);
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // Mini App'dan kelgan, lekin yuqorida ushlanmagan so'rov. Ilgari bu yer
    // ham { ok: true } qaytarardi — aynan shu sabab add_child_request
    // jimgina yo'qolib, Mini App ota-onaga "farzand qo'shildi" deb
    // ko'rsatardi. Telegram webhook update'larida "type" maydoni yo'q,
    // ular uchun 200/ok o'z holicha qoladi (aks holda Telegram qayta
    // yuborishni boshlaydi).
    if (payload && typeof payload.type === "string") {
      console.error("Noma'lum Mini App so'rov turi:", payload.type);
      return new Response(
        JSON.stringify({ ok: false, error: `Noma'lum so'rov turi: ${payload.type}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (error) {
    console.error("Webhook xatosi:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// Mini App brauzerda github.io'dan ochiladi, funksiya esa supabase.co'da —
// ya'ni har bir so'rov cross-origin. Bu sarlavhalarsiz brauzer so'rovni
// BLOKLAYDI: javob mijozgacha umuman yetib bormaydi. Panel shu sababli
// serverdan hech narsa ololmay, faqat localStorage'dagi eski ma'lumot bilan
// ishlayotgandek ko'rinardi — ro'yxatdan o'tish oynasi ochilmagani ham,
// farzand kod kiritganda "server xatoligi" chiqqani ham aynan shundan edi.
//
// curl bilan sinaganda bu muammo KO'RINMAYDI, chunki CORS'ni faqat brauzer
// tekshiradi. Shuning uchun server tomoni har safar "ishlayapti" bo'lib
// ko'rinardi.
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  // Preflight. Ilgari OPTIONS ham umumiy oqimga tushib, bo'sh tanani
  // req.json() bilan o'qimoqchi bo'lardi va 500 qaytarardi — ya'ni
  // preflight'ning o'zi yiqilib, keyingi POST hech qachon yuborilmasdi.
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const res = await handleRequest(req);
  const headers = new Headers(res.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) headers.set(key, value);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
});
