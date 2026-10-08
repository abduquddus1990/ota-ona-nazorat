// Server xavfsizligi sinovlari — haqiqiy index.ts soxta baza va soxta
// Telegram bilan ishga tushiriladi va hujum ssenariylari o'ynaladi:
// begona ota-ona tasdiqlay oladimi, bir kod bilan ikki kirish bo'ladimi,
// parol yolg'iz o'zi kirgizib yuboradimi va h.k.
//
//   deno run -A --no-check tests/security/security_test.ts
//
// Haqiqiy baza ham, Telegram ham ishlatilmaydi.
import { DB, TG, installFetch, STRICT_COLS } from "./fake.ts";

const BOT = "123456:TESTTOKEN";
const SUPA = "http://fake.supabase";
Deno.env.set("BOT_TOKEN", BOT);
Deno.env.set("SUPABASE_URL", SUPA);
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "service");
Deno.env.set("TELEGRAM_WEBHOOK_SECRET", "whsec");
Deno.env.set("ADMIN_CHAT_IDS", "9999");
const realFetch = installFetch(SUPA);

const gen = (id: number) => String(Math.abs((id * 31 + 7919) % 900000) + 100000);
const fam1 = gen(1001), fam2 = gen(2001);
const future = () => new Date(Date.now() + 600000).toISOString();

DB.parent_registrations = [
  { family_code: fam1, parent_telegram_id: 1001, parent_username: "otajon", parent_name: "Ota", status: "approved" },
  { family_code: fam2, parent_telegram_id: 2001, parent_username: "begona", parent_name: "Begona", status: "approved" },
];
DB.family_parents = [{ telegram_id: 1002, family_code: fam1, name: "Ona", role: "mother", created_at: new Date().toISOString() }];
DB.child_pairings = [{ family_code: fam1, child_id: "tg_3001", child_name: "Madina", is_active: true }];

await import(new URL("../../supabase/functions/ota-ona-bot/index.ts", import.meta.url).href);
await new Promise((r) => setTimeout(r, 800));

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
let ipN = 1;
async function api(body: any, ip = "10.0.0." + ipN) {
  const r = await realFetch("http://localhost:8000", {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": UA, "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
  return { status: r.status, ...(await r.json()) };
}
let upd = 1;
async function hook(update: any) {
  const r = await realFetch("http://localhost:8000", {
    method: "POST",
    headers: { "content-type": "application/json", "x-telegram-bot-api-secret-token": "whsec" },
    body: JSON.stringify({ update_id: upd++, ...update }),
  });
  await r.text();
}
const press = (from: number, data: string) =>
  hook({ callback_query: { id: "cb" + upd, from: { id: from, first_name: "U" + from }, message: { chat: { id: from }, message_id: 1 }, data } });
const say = (from: number, text: string) =>
  hook({ message: { message_id: upd, chat: { id: from, type: "private" }, from: { id: from, first_name: "U" + from }, text } });

async function hmac(key: Uint8Array, msg: string) {
  const k = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(msg)));
}
const hex = (b: Uint8Array) => Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
async function initData(id: number) {
  const p = new URLSearchParams();
  p.set("auth_date", String(Math.floor(Date.now() / 1000)));
  p.set("user", JSON.stringify({ id, first_name: "U" + id }));
  const pairs = [...p].map(([k, v]) => `${k}=${v}`).sort().join("\n");
  const secret = await hmac(new TextEncoder().encode("WebAppData"), BOT);
  p.set("hash", hex(await hmac(secret, pairs)));
  return p.toString();
}

const results: Array<[boolean, string]> = [];
function check(ok: boolean, name: string, info?: unknown) {
  results.push([ok, name]);
  console.log((ok ? "✅" : "❌") + " " + name + (ok || info === undefined ? "" : "  → " + JSON.stringify(info).slice(0, 400)));
}
const tgSince = (n: number) => TG.slice(n).filter((m) => m.method === "sendMessage");
const btn = (m: any) => JSON.stringify(m.reply_markup || {});

// 1. Parol o'rnatish (Telegram ichidan)
let t0 = TG.length;
let r = await api({ type: "set_password", password: "Kuchli#Parol9", initData: await initData(1001) });
check(r.ok && r.login === "otajon", "1. set_password ishladi", r);
let msgs = tgSince(t0).filter((m) => /paroli o'zgartirildi/.test(m.text));
check(msgs.length === 2 && msgs.some((m) => m.chat_id === 1001) && msgs.some((m) => m.chat_id === 1002), "1b. ikkala ota-onaga 'parol o'zgardi' xabari", tgSince(t0));

// 2. 5 ta xato parol — bir marta ogohlantirish
t0 = TG.length;
for (let i = 0; i < 6; i++) {
  r = await api({ type: "web_login", username: "otajon", password: "xato" + i }, "10.1.0." + i);
}
check(r.status === 401, "2. xato parol rad etiladi", r);
msgs = tgSince(t0).filter((m) => /5 marta/.test(m.text));
check(msgs.length === 2, "2b. '5 marta xato' xabari faqat bir marta (2 ota-onaga)", tgSince(t0).map((m) => m.text?.slice(0, 40)));

// 3. To'g'ri parol — endi tasdiq kutiladi, seans YO'Q
t0 = TG.length;
const sessBefore = (DB.web_sessions || []).length;
r = await api({ type: "web_login", username: "otajon", password: "Kuchli#Parol9" }, "10.2.0.1");
check(r.ok && r.pending && !r.sessionToken && typeof r.pollToken === "string", "3. to'g'ri parol → pending, token berilmaydi", r);
check((DB.web_sessions || []).length === sessBefore, "3b. bazada seans ochilmadi");
const poll1 = r.pollToken;
msgs = tgSince(t0).filter((m) => /applogin_ok_/.test(btn(m)));
check(msgs.length === 2, "3c. tasdiq tugmalari ikkala ota-onaga", tgSince(t0));
const code1 = (btn(msgs[0]).match(/applogin_ok_([A-Z0-9]+)/) || [])[1];
check(/Chrome · Windows/.test(msgs[0]?.text || ""), "3d. xabarda qurilma: Chrome · Windows", msgs[0]?.text);

r = await api({ type: "app_login_poll", token: poll1 });
check(r.ok && JSON.stringify(r).includes('"pending"'), "4. poll → pending", r);

// 5. Begona oila ota-onasi tugmani bossa
t0 = TG.length;
await press(2001, "applogin_ok_" + code1);
check(tgSince(t0).some((m) => m.chat_id === 2001 && /tegishli emas/.test(m.text)), "5. begona ota-ona tasdiqlay olmaydi", tgSince(t0));
r = await api({ type: "app_login_poll", token: poll1 });
check(JSON.stringify(r).includes('"pending"'), "5b. so'rov hamon kutilmoqda", r);

// 6. Ona tasdiqlaydi
await press(1002, "applogin_ok_" + code1);
r = await api({ type: "app_login_poll", token: poll1 });
const S = r.sessionToken;
check(JSON.stringify(r).includes('"approved"') && typeof S === "string", "6. ona tasdiqladi → seans berildi", r);
const sRow = (DB.web_sessions || []).at(-1);
check(sRow?.login_method === "password" && /Chrome/.test(sRow?.user_agent || ""), "6b. seans: usul=password, brauzer saqlandi", sRow);
r = await api({ type: "app_login_poll", token: poll1 });
check(JSON.stringify(r).includes('"used"'), "6c. seans ikkinchi marta berilmaydi", r);

// 7. Kirishlar ro'yxati
r = await api({ type: "security_overview", sessionToken: S });
check(r.ok && r.sessions?.length === 1 && r.sessions[0].current && r.sessions[0].device === "Chrome · Windows", "7. security_overview: joriy seans ko'rinadi", r);
const kinds = (r.events || []).map((e: any) => e.kind);
check(["login", "password_set", "login_failed_many"].every((k) => kinds.includes(k)), "7b. jurnalda login, password_set, login_failed_many", kinds);
check(!JSON.stringify(r.events).includes("sessionId"), "7c. jurnal ichki ID'larni chiqarmaydi");

// 8. Farzand ko'ra olmaydi
r = await api({ type: "security_overview", initData: await initData(3001) });
check(r.status === 401, "8. farzand xavfsizlik bo'limini ocha olmaydi", r);

// 9. Bot kodi bilan kirish — bir vaqtda ikki so'rov
DB.parent_pair_codes = [{ code: "APPCODE1", family_code: fam1, parent_telegram_id: 1001, purpose: "app_login", expires_at: future() }];
t0 = TG.length;
const [a1, a2] = await Promise.all([api({ type: "parent_pair", code: "APPCODE1" }, "10.3.0.1"), api({ type: "parent_pair", code: "APPCODE1" }, "10.3.0.2")]);
check([a1, a2].filter((x) => x.ok).length === 1, "9. bitta kod bilan faqat bitta kirish", [a1, a2]);
const A = (a1.ok ? a1 : a2).sessionToken;
msgs = tgSince(t0).filter((m) => /yangi kirish/.test(m.text));
check(msgs.length === 2 && /sec_kill_/.test(btn(msgs[0])) && /Qalqon Android ilovasi/.test(msgs[0].text), "9b. 'yangi kirish' xabari + 'Bu men emasman' tugmasi", tgSince(t0));
const kill = (btn(msgs[0]).match(/sec_kill_([0-9a-f-]+)/) || [])[1];

// 10. "Bu men emasman"
await press(2001, "sec_kill_" + kill);
r = await api({ type: "security_overview", sessionToken: A });
check(r.ok, "10. begona odam boshqa oila seansini uza olmaydi", r);
t0 = TG.length;
await press(1001, "sec_kill_" + kill);
r = await api({ type: "security_overview", sessionToken: A });
check(r.status === 401, "10b. 'Bu men emasman' seansni uzdi", r);
check(tgSince(t0).some((m) => /Kirish uzildi/.test(m.text)), "10c. tasdiq xabari");

// 11. Qurilma ulash — bir vaqtda ikki so'rov, ogohlantirish
DB.device_pair_codes = [
  { code: "DEVCODE1", family_code: fam1, child_id: "tg_3001", child_name: "Madina", expires_at: future() },
  { code: "DEVCODE2", family_code: fam1, child_id: "tg_3001", child_name: "Madina", expires_at: future() },
];
t0 = TG.length;
const [d1, d2] = await Promise.all([
  api({ type: "device_pair", pairCode: "DEVCODE1", deviceModel: "Samsung <b>A15</b>" }, "10.4.0.1"),
  api({ type: "device_pair", pairCode: "DEVCODE1", deviceModel: "Samsung A15" }, "10.4.0.2"),
]);
check([d1, d2].filter((x) => x.ok).length === 1, "11. bitta kod bilan faqat bitta telefon", [d1, d2]);
const D1 = (d1.ok ? d1 : d2).deviceToken;
msgs = tgSince(t0).filter((m) => /Yangi qurilma ulandi/.test(m.text));
check(msgs.length === 2 && /dev_kill_/.test(btn(msgs[0])) && /Madina/.test(msgs[0].text), "11b. 'yangi qurilma' xabari + tugma", tgSince(t0));
check(msgs.every((m) => !m.text.includes("<b>A15</b>")), "11c. telefon nomi xabarda tozalangan", msgs[0]?.text);
r = await api({ type: "parent_pair", code: "DEVCODE2", deviceModel: "Redmi" }, "10.4.0.3");
check(r.ok && r.role === "child", "11d. farzand kodi parent_pair orqali ham ishlaydi", r);
const active = (DB.device_tokens || []).filter((d) => d.child_id === "tg_3001" && d.is_active);
check(active.length === 1 && active[0].device_model === "Redmi", "11e. eski telefon kaliti bekor qilindi (parent_pair yo'lida ham)", DB.device_tokens);
r = await api({ type: "list_devices", deviceToken: D1 });
check(r.status === 401 && /initData/.test(JSON.stringify(r)), "11f. eski telefon kaliti endi ishlamaydi", r);

// 12. "Men ulamaganman"
msgs = tgSince(0).filter((m) => /Yangi qurilma ulandi/.test(m.text));
const lastDev = (btn(msgs.at(-1)).match(/dev_kill_([0-9a-f-]+)/) || [])[1];
await press(2001, "dev_kill_" + lastDev);
check((DB.device_tokens || []).find((d) => d.id === lastDev)?.is_active === true, "12. begona odam qurilmani uza olmaydi");
await press(1001, "dev_kill_" + lastDev);
check((DB.device_tokens || []).find((d) => d.id === lastDev)?.is_active === false, "12b. ota-ona tugma bilan qurilmani uzdi");

// 13. Boshqa barcha kirishlarni uzish
DB.parent_pair_codes.push({ code: "APPCODE2", family_code: fam1, parent_telegram_id: 1001, purpose: "app_login", expires_at: future() });
const B = (await api({ type: "parent_pair", code: "APPCODE2" }, "10.5.0.1")).sessionToken;
r = await api({ type: "revoke_other_sessions", sessionToken: S });
check(r.ok && r.revoked === 1, "13. boshqa kirishlar uzildi", r);
check((await api({ type: "security_overview", sessionToken: S })).ok, "13b. o'zi turgan seans saqlandi");
check((await api({ type: "security_overview", sessionToken: B })).status === 401, "13c. boshqa seans ishlamaydi");

// 14. Brauzerdan parol almashtirish o'zini chiqarib yubormaydi
DB.parent_pair_codes.push({ code: "APPCODE3", family_code: fam1, parent_telegram_id: 1001, purpose: "app_login", expires_at: future() });
const C = (await api({ type: "parent_pair", code: "APPCODE3" }, "10.6.0.1")).sessionToken;
r = await api({ type: "set_password", password: "Yangi#Parol10", sessionToken: S });
check(r.ok, "14. seansdan parol almashtirildi", r);
check((await api({ type: "security_overview", sessionToken: S })).ok, "14b. joriy seans saqlandi");
check((await api({ type: "security_overview", sessionToken: C })).status === 401, "14c. boshqa seanslar uzildi");

// 15. Rad etish
r = await api({ type: "web_login", username: "otajon", password: "Yangi#Parol10" }, "10.7.0.1");
const poll2 = r.pollToken;
const code2 = (btn(tgSince(0).filter((m) => /applogin_ok_/.test(btn(m))).at(-1)).match(/applogin_ok_([A-Z0-9]+)/) || [])[1];
t0 = TG.length;
await press(1001, "applogin_no_" + code2);
r = await api({ type: "app_login_poll", token: poll2 });
check(JSON.stringify(r).includes('"rejected"'), "15. 'Yo'q' → kirish rad etildi", r);
check(tgSince(t0).some((m) => /begonaga ma'lum/.test(m.text)), "15b. parolni almashtirish maslahati");
check((DB.security_events || []).some((e) => e.kind === "login_rejected"), "15c. jurnalda login_rejected");
await press(1001, "applogin_ok_" + code2);
r = await api({ type: "app_login_poll", token: poll2 });
check(JSON.stringify(r).includes('"rejected"'), "15d. rad etilgandan keyin 'Ha' bosish ishlamaydi", r);

// 16. /myid
t0 = TG.length;
await say(1001, "/myid");
check(tgSince(t0).some((m) => m.chat_id === 1001 && /1001/.test(m.text)), "16. /myid ID'ni ko'rsatadi", tgSince(t0));

// 17. Qurilma nomi tasdiq xabarida tozalanadi
r = await api({ type: "app_login_start", deviceLabel: "<a href='https://x.uz'>Sizning telefoningiz</a>" }, "10.8.0.1");
const appCode = (r.link.match(/app_([A-Z0-9]+)/) || [])[1];
t0 = TG.length;
await say(1001, "/start app_" + appCode);
const conf = tgSince(t0).find((m) => /tasdiqlaysizmi/.test(m.text));
check(!!conf && conf.text.includes("&lt;a") && !conf.text.includes("<a href"), "17. app kirish so'rovidagi qurilma nomi tozalangan", conf?.text);
await press(1001, "applogin_ok_" + appCode);
r = await api({ type: "app_login_poll", token: r.token });
check(JSON.stringify(r).includes('"approved"'), "17b. Android 'Telegram bilan kirish' oqimi buzilmagan", r);

// 18. Migratsiya qo'llanmagan bo'lsa ham kirish ishlaydi
STRICT_COLS.web_sessions = ["token_hash", "family_code", "telegram_id", "user_agent", "expires_at"];
DB.parent_pair_codes.push({ code: "APPCODE4", family_code: fam1, parent_telegram_id: 1001, purpose: "app_login", expires_at: future() });
r = await api({ type: "parent_pair", code: "APPCODE4" }, "10.9.0.1");
check(r.ok && r.sessionToken, "18. login_method ustunisiz ham kirish ishlaydi", r);
STRICT_COLS.web_sessions = undefined;

// 19. Ona havolasi — bir vaqtda ikki odam
DB.parent_pair_codes.push({ code: "ONA12345", family_code: fam1, parent_telegram_id: 1001, purpose: "co_parent", expires_at: future() });
await Promise.all([say(4001, "/start ona_ONA12345"), say(4002, "/start ona_ONA12345")]);
const qoshildi = (DB.family_parents || []).filter((p) => p.telegram_id === 4001 || p.telegram_id === 4002);
check(qoshildi.length === 1, "19. ona havolasi bilan faqat bitta odam qo'shiladi", qoshildi);
check((DB.security_events || []).some((e) => e.kind === "coparent_added"), "19b. jurnalda coparent_added");

// 20. Telegram ichidan ro'yxat (seanssiz)
r = await api({ type: "security_overview", initData: await initData(1001) });
check(r.ok && r.insideTelegram && r.sessions.every((s: any) => !s.current), "20. Telegram ichidan ochilganda ham ro'yxat chiqadi", r);

const fail = results.filter(([ok]) => !ok).length;
console.log(`\n${results.length - fail}/${results.length} o'tdi`);
Deno.exit(fail ? 1 : 0);
