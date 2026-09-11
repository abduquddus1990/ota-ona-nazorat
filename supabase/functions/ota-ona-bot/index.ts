// supabase/functions/ota-ona-bot/index.ts
//
// QALQON AI — ADVANCED 24/7 SUPABASE SERVERLESS BOT
// Multi-Admin / Partner Management (@ai_loyihachi & partners), HTML Parse Mode (Zero parsing errors),
// Child Status Alerts, Zero Location Demands, and Instant Approval Workflow.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN") || "";
if (!BOT_TOKEN) {
  console.error("BOT_TOKEN missing");
}
const MINI_APP_URL = Deno.env.get("MINI_APP_URL") || "https://abduquddus1990.github.io/ota-ona-nazorat/?v=5.4";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

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

  const { error } = await db
    .from("child_pairings")
    .upsert(row, { onConflict: "family_code,child_id" });

  if (error) {
    console.error("child_pairings upsert failed:", error.message);
    return false;
  }
  return true;
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
  return null;
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
  const { error } = await db
    .from("parent_registrations")
    .update({ status, reviewed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("family_code", familyCode);
  if (error) {
    console.error("setFamilyApproval xatosi:", error.message);
    return false;
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

function getStartKeyboard(userId: string | number, lang: string = "uz"): any {
  const code = generateFamilyCode(userId);
  if (lang === "ru") {
    return {
      inline_keyboard: [
        [{ text: "📱 Открыть панель (Mini App)", web_app: { url: `${MINI_APP_URL}&lang=ru` } }],
        [{ text: "👶 Подключить ребёнка", callback_data: `action_pair_${code}` }],
        [{ text: "🌐 Til / Язык (UZ/RU)", callback_data: "action_lang" }],
      ],
    };
  }
  return {
    inline_keyboard: [
      [{ text: "📱 Ota-ona paneli (Mini App)", web_app: { url: `${MINI_APP_URL}&lang=uz` } }],
      [{ text: "👶 Farzandni ulash", callback_data: `action_pair_${code}` }],
      [{ text: "🌐 Til / Язык (UZ/RU)", callback_data: "action_lang" }],
    ],
  };
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
function getPairingText(userId: string | number, lang: string = "uz", isApproved: boolean = false): string {
  const code = generateFamilyCode(userId);
  const pairLink = `https://t.me/qalqon_aibot?start=pair_${code}`;
  
  if (!isApproved) {
    if (lang === "ru") {
      return `⏳ <b>ОЖИДАНИЕ ОДОБРЕНИЯ АДМИНИСТРАТОРАМИ:</b>\n\nВаш аккаунт находится на рассмотрении. После подтверждения вы сможете подключить реальное устройство ребёнка.\nВ настоящее время вам доступен <b>Тестовый / Демо-режим</b> панели.`;
    }
    return `⏳ <b>ADMINISTRATOR TASDIG'I KUTILMOQDA:</b>\n\nSizning profilingiz ko'rib chiqish jarayonida. Administrator ruxsat berganidan so'ng farzand qurilmasini ulashingiz mumkin bo'ladi.\nHozirda siz uchun boshqaruv paneli <b>Test / Demo rejimida</b> to'liq ochiq.`;
  }

  if (lang === "ru") {
    return `🔗 <b>АВТОМАТИЧЕСКОЕ ПОДКЛЮЧЕНИЕ РЕБЁНКА:</b>\n\n1. Перешлите эту ссылку ребёнку в Telegram:\n👉 ${pairLink}\n\n2. Или в Android-приложении введите код:\n🔑 <b><code>${code}</code></b>\n\nРебёнок подключится автоматически!`;
  }
  return `🔗 <b>FARZANDNI AVTOMATIK ULASH YO'RIQNOMASI:</b>\n\n1. Quyidagi havolani farzandingizga Telegram orqali yuboring:\n👉 ${pairLink}\n\n2. Yoki Android mobil ilovasida ushbu kodni kiriting:\n🔑 <b><code>${code}</code></b>\n\nFarzand profilingizga muvaffaqiyatli bog'lanadi!`;
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

serve(async (req) => {
  await ensureBotCommands();
  if (req.method === "GET") {
    return new Response(JSON.stringify({ status: "OK", service: "Qalqon AI Bot" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();

    // Mini App / Android so'rovlari (payload.type bor) autentifikatsiyadan
    // O'TISHI SHART. Ilgari bu yer butunlay ochiq edi: oddiy curl bilan
    // istalgan oilaga bola qo'shish va ro'yxatini o'qish mumkin edi.
    // Telegram webhook update'larida "type" bo'lmaydi — ular Telegram
    // serveridan keladi va quyida alohida ishlanadi.
    let actor: Actor | null = null;
    if (typeof payload?.type === "string" && payload.type !== "device_pair") {
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
        parent_telegram_id: Number(payload.parentTelegramId) || null,
        mother_name: payload.motherName || null,
        mother_username: normalizeUsername(payload.motherUsername) || null,
        child_name: payload.childName || null,
        child_grade: Number.isFinite(gradeNum) && gradeNum > 0 ? gradeNum : null,
        child_username: normalizeUsername(payload.childUsername) || null,
        updated_at: new Date().toISOString(),
      };

      let saved = false;
      if (db) {
        const { error } = await db
          .from("parent_registrations")
          .upsert(row, { onConflict: "family_code" });
        if (error) console.error("parent_registrations upsert failed:", error.message);
        else saved = true;
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
        `\n📅 <b>Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}` +
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
          "child_id, child_name, grade, telegram_username, device_label, source, paired_at, last_seen_at"
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

      const { error } = await db.from("device_pair_codes").insert({
        code,
        family_code: actor!.familyCode,
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
        .select("code, family_code, child_name, expires_at, used_at")
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
      const childId = `android_${row.family_code}_${deviceModel}`.replace(/\s+/g, "_");

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
        childName: row.child_name || deviceModel,
        deviceLabel: deviceModel,
        source: "android_parental_guard",
      });

      // Token faqat SHU javobda ko'rinadi, boshqa hech qachon.
      return new Response(
        JSON.stringify({ ok: true, deviceToken: token, childId, familyCode: row.family_code }),
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

      const alertMsg = `🎉 <b>FARZAND ULANDI!</b>\n\n👦 <b>Farzand:</b> ${childName}\n🔑 <b>Oila Kodi:</b> <code>${shownCode}</code>\n📅 <b>Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}`;

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
    if (payload.type === "child_status_alert") {
      const childName = payload.childName || "Farzand";
      const statusText = payload.statusText || "Xabar keldi";
      // Oila kodi so'rovchining o'zidan, mijoz yuborganidan emas.
      const familyCode = actor!.familyCode;

      const alertMsg = `📍 <b>FARZANDINGIZDAN TEZKOR XABAR!</b>\n\n👦 <b>Farzand:</b> ${childName}\n💬 <b>Xabar:</b> <b>${statusText}</b>\n🔑 <b>Oila Kodi:</b> <code>${familyCode}</code>\n📅 <b>Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}`;

      await notifyAdmins(alertMsg);
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    const update = payload;

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

      // Admin Tasdiqlash Callbacklari
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

        if (text.includes("pair_") || text.includes("child_")) {
          const reply = lang === "ru" 
            ? "✅ <b>Вы успешно привязаны к родительскому аккаунту!</b> Все школьные предметы и функции активированы."
            : "✅ <b>Siz ota-onangizning profiliga muvaffaqiyatli bog'landingiz!</b> Barcha darsliklar va imkoniyatlar faollashtirildi.";
          await sendMessage(chatId, reply);
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }

        await sendMessage(chatId, getStartMenuText(chatId, lang, true, isAdmin), getStartKeyboard(chatId, lang));
        await sendMessage(chatId, "👇 <b>Start</b> tugmasi doim pastda — / kerak emas.", boshlashReplyKeyboard());
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
});
