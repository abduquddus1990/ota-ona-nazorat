// supabase/functions/miniapp-api/index.ts
//
// Telegram Mini App uchun autentifikatsiya + ma'lumot shlyuzi (gateway).
// Dashboard'da bu funksiya "bright-handler" nomi bilan saqlangan (Supabase
// avtomatik nom berdi) — statik sahifa ("miniapp" funksiyasi) shu manzilga
// murojaat qiladi.
//
// TZ 7-bo'lim: "Kamera Mini App autentifikatsiyasi ... telegram_id'si
// tekshirilib, faqat ruxsatli foydalanuvchilarga ochilishi kerak" talabini
// shu funksiya bajaradi — Mini App hech qachon Supabase'ga to'g'ridan-to'g'ri
// (service_role kalit bilan) ulanmaydi, faqat shu funksiya orqali ishlaydi.
//
// Xavfsizlik: Telegram'ning rasmiy "Validating data received via the Mini
// App" algoritmi bo'yicha initData imzosi HMAC-SHA256 orqali tekshiriladi.
// BOT_TOKEN va SUPABASE_SERVICE_ROLE_KEY hech qachon mijoz (brauzer)
// tomoniga chiqmaydi — faqat shu server tomonidagi funksiya ichida qoladi.
//
// ESLATMA (texnik qarz): rol/huquq matritsasi (ROLE_PERMISSIONS) va bonus
// formulasi bot.py'dagi bilan MANTIQAN bir xil bo'lishi shart, lekin ikki
// xil til (Python / TypeScript)da alohida yozilgan — birontasini
// o'zgartirsangiz, ikkinchisini ham qo'lda yangilang.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
// analyzer.py'da ishlatilgan bilan bir xil model (gemini-2.5-flash yangi
// kalitlar uchun yopilgani sababli almashtirilgan edi — u yerdagi
// izohga qarang).
const AI_MODEL = "gemini-3.5-flash";

// TZ 4.1 — bot.py'dagi BONUS_MAX_PERCENT / MONTHLY_CONVERSATION_NORM bilan
// bir xil bo'lishi kerak (u yerda .env orqali, bu yerda Edge Function
// Secrets orqali sozlanadi — ikkalasi ham bir xil qiymatda saqlansin).
const BONUS_MAX_PERCENT = Number(Deno.env.get("BONUS_MAX_PERCENT") ?? "0.10");
const MONTHLY_CONVERSATION_NORM = Number(Deno.env.get("MONTHLY_CONVERSATION_NORM") ?? "20");

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  // "authorization" va "apikey" — Mini App bu ikkalasini har bir so'rovda
  // yuboradi (Supabase gateway autentifikatsiyasi uchun); ro'yxatda
  // bo'lmasa, brauzer CORS preflight'ni rad etadi va "Failed to fetch"
  // xatosi chiqadi (aynan shu sabab kuzatildi).
  "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ROLE_PERMISSIONS: Record<string, string[]> = {
  // "ai_chat" — "Intizom AI" bilan xodimlar samaradorligi haqida
  // suhbatlashish (TZ 12-bo'lim, coaching moduli). Bonus bilan bir xil
  // sezgirlik darajasida (xodimning kuchsiz tomonlari muhokama qilinadi),
  // shuning uchun faqat manager/admin'ga ochiq.
  manager: ["reports", "employees", "bonuses", "camera", "settings", "ai_chat", "attendance"],
  deputy: ["reports", "employees", "camera", "attendance"],
  hr: ["employees", "attendance"],
  admin: ["reports", "employees", "bonuses", "camera", "settings", "ai_chat", "attendance"],
};
const ROLES_WITH_SALARY_ACCESS = new Set(["manager", "admin"]);

const ROLE_LABELS: Record<string, string> = {
  manager: "Rahbar",
  deputy: "O'rinbosar",
  hr: "HR xodimi",
  admin: "Admin",
};

async function hmacSha256(key: BufferSource, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface TelegramUser {
  id: number;
  first_name: string;
}

async function verifyInitData(initData: string): Promise<TelegramUser | null> {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const authDate = Number(params.get("auth_date") || "0");
  const ageSeconds = Date.now() / 1000 - authDate;
  if (!authDate || ageSeconds > 86400) return null; // replay himoyasi

  const pairs: string[] = [];
  for (const key of Array.from(params.keys()).sort()) {
    pairs.push(`${key}=${params.get(key)}`);
  }
  const dataCheckString = pairs.join("\n");

  const secretKey = await hmacSha256(new TextEncoder().encode("WebAppData"), BOT_TOKEN);
  const computedHash = bufToHex(await hmacSha256(secretKey, dataCheckString));

  if (computedHash !== hash) return null;

  const userJson = params.get("user");
  if (!userJson) return null;
  return JSON.parse(userJson) as TelegramUser;
}

interface BotUser {
  role: string;
  is_active: boolean;
  full_name: string;
  language?: string;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "content-type": "application/json" },
  });
}

async function handleReports(perms: string[]) {
  if (!perms.includes("reports")) return jsonResponse({ error: "Ruxsat yo'q" }, 403);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: convs, error: convError } = await supabase
    .from("conversations")
    .select("id, created_at, audio_storage_path, employees(full_name)")
    .gte("created_at", todayStart.toISOString())
    .order("created_at", { ascending: false });
  if (convError) throw convError;

  const convIds = (convs ?? []).map((c: any) => c.id);
  const { data: analytics } = convIds.length
    ? await supabase.from("analytics").select("conversation_id, total_score").in("conversation_id", convIds)
    : { data: [] as any[] };

  const scoreMap = new Map((analytics ?? []).map((a: any) => [a.conversation_id, a.total_score]));

  const conversations = (convs ?? []).map((c: any) => ({
    id: c.id,
    employee_name: c.employees?.full_name ?? "Noma'lum",
    created_at: c.created_at,
    score: scoreMap.get(c.id) ?? null,
    has_audio: !!c.audio_storage_path,
  }));

  return jsonResponse({ conversations });
}

async function handleHistoryDay(perms: string[], dateStr: string | undefined) {
  // "Yozuvlar tarixi" — Hisobotlar bo'limidagi ☰ menyudan ochiladigan
  // 31 kunlik kalendar. Rahbar tanlagan kun uchun o'sha kundagi barcha
  // suhbatlarni (xodim ismi, ball, eshitish tugmasi) va kun oxiridagi
  // umumiy kunlik hisobotni (daily_reports) ko'rsatadi.
  if (!perms.includes("reports")) return jsonResponse({ error: "Ruxsat yo'q" }, 403);
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return jsonResponse({ error: "Noto'g'ri sana formati (YYYY-MM-DD kerak)" }, 400);
  }

  const dayStart = new Date(`${dateStr}T00:00:00`);
  const dayEnd = new Date(`${dateStr}T23:59:59.999`);

  const { data: convs, error: convError } = await supabase
    .from("conversations")
    .select("id, created_at, audio_storage_path, employees(full_name)")
    .gte("created_at", dayStart.toISOString())
    .lte("created_at", dayEnd.toISOString())
    .order("created_at", { ascending: false });
  if (convError) throw convError;

  const convIds = (convs ?? []).map((c: any) => c.id);
  const { data: analytics } = convIds.length
    ? await supabase.from("analytics").select("conversation_id, total_score").in("conversation_id", convIds)
    : { data: [] as any[] };
  const scoreMap = new Map((analytics ?? []).map((a: any) => [a.conversation_id, a.total_score]));

  const conversations = (convs ?? []).map((c: any) => ({
    id: c.id,
    employee_name: c.employees?.full_name ?? "Noma'lum",
    created_at: c.created_at,
    score: scoreMap.get(c.id) ?? null,
    has_audio: !!c.audio_storage_path,
  }));

  // Kunlik umumiy hisobot — daily_reports jadvalidan (har kuni 00:15da
  // avtomatik yoziladi; bugungi sana uchun hali bo'lmasligi mumkin).
  const { data: dailyRows } = await supabase
    .from("daily_reports")
    .select("employee_id, conversations_count, avg_score, min_score, max_score, employees(full_name)")
    .eq("report_date", dateStr);

  const summary = (dailyRows ?? []).map((r: any) => ({
    employee_name: r.employees?.full_name ?? "Noma'lum",
    conversations_count: r.conversations_count,
    avg_score: r.avg_score,
    min_score: r.min_score,
    max_score: r.max_score,
  }));

  return jsonResponse({ date: dateStr, conversations, summary });
}

async function handleAudioUrl(perms: string[], conversationId: string | undefined) {
  if (!perms.includes("reports")) return jsonResponse({ error: "Ruxsat yo'q" }, 403);
  if (!conversationId) return jsonResponse({ error: "conversation_id kerak" }, 400);

  const { data: conv, error } = await supabase
    .from("conversations")
    .select("audio_storage_path")
    .eq("id", conversationId)
    .maybeSingle();
  if (error) throw error;
  if (!conv || !conv.audio_storage_path) {
    return jsonResponse({ error: "Audio topilmadi" }, 404);
  }

  // Imzolangan havola — 1 soat amal qiladi, shundan keyin avtomatik
  // yaroqsiz bo'ladi (xavfsizlik: doimiy ochiq havola emas).
  const { data: signed, error: signError } = await supabase.storage
    .from("conversation-audio")
    .createSignedUrl(conv.audio_storage_path, 3600);
  if (signError) throw signError;

  return jsonResponse({ url: signed.signedUrl });
}

async function handleEmployees(perms: string[]) {
  if (!perms.includes("employees")) return jsonResponse({ error: "Ruxsat yo'q" }, 403);

  const { data, error } = await supabase
    .from("employees")
    .select("id, full_name, position, department, workstation_number, microphone_id, is_active")
    .eq("is_active", true)
    .order("full_name");
  if (error) throw error;

  return jsonResponse({ employees: data ?? [] });
}

async function handleAttendance(perms: string[]) {
  // TZ 22-bo'lim: Dashboard'dagi "Davomat" bo'limi — har bir xodim uchun
  // bugungi mikrofon holati (recorder.py heartbeat orqali) + shu oy
  // uchun jamlangan faol/yozilgan daqiqalar.
  if (!perms.includes("attendance")) return jsonResponse({ error: "Ruxsat yo'q" }, 403);

  const { data: employees, error: empError } = await supabase
    .from("employees")
    .select("id, full_name, microphone_id")
    .eq("is_active", true)
    .order("full_name");
  if (empError) throw empError;

  const { data: today, error: todayError } = await supabase
    .from("today_attendance")
    .select("*");
  if (todayError) throw todayError;
  const todayByEmployee = new Map((today ?? []).map((r: any) => [r.employee_id, r]));

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthStartIso = monthStart.toISOString();

  const { data: sessions, error: sessionsError } = await supabase
    .from("work_sessions")
    .select("employee_id, session_start, last_heartbeat, session_end")
    .gte("session_start", monthStartIso);
  if (sessionsError) throw sessionsError;

  const { data: convs, error: convsError } = await supabase
    .from("conversations")
    .select("employee_id, audio_duration_sec")
    .gte("created_at", monthStartIso);
  if (convsError) throw convsError;

  const monthlyActiveMin = new Map<string, number>();
  for (const s of sessions ?? []) {
    const end = s.session_end ?? s.last_heartbeat;
    const minutes = (new Date(end).getTime() - new Date(s.session_start).getTime()) / 60000;
    monthlyActiveMin.set(s.employee_id, (monthlyActiveMin.get(s.employee_id) ?? 0) + Math.max(0, minutes));
  }

  const monthlyRecordedMin = new Map<string, number>();
  for (const c of convs ?? []) {
    if (!c.employee_id || !c.audio_duration_sec) continue;
    monthlyRecordedMin.set(
      c.employee_id,
      (monthlyRecordedMin.get(c.employee_id) ?? 0) + c.audio_duration_sec / 60,
    );
  }

  const rows = (employees ?? []).map((e: any) => {
    const t = todayByEmployee.get(e.id);
    return {
      employee_id: e.id,
      full_name: e.full_name,
      microphone_id: e.microphone_id,
      is_online: t?.is_online ?? false,
      session_start: t?.session_start ?? null,
      today_active_minutes: t?.active_minutes ?? 0,
      today_recorded_minutes: t?.recorded_minutes ?? 0,
      month_active_minutes: Math.round(monthlyActiveMin.get(e.id) ?? 0),
      month_recorded_minutes: Math.round(monthlyRecordedMin.get(e.id) ?? 0),
    };
  });

  return jsonResponse({ rows });
}

async function handleBonuses(perms: string[], role: string) {
  if (!perms.includes("bonuses")) return jsonResponse({ error: "Ruxsat yo'q" }, 403);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { data: employees, error: empError } = await supabase
    .from("employees")
    .select("id, full_name, salary")
    .eq("is_active", true);
  if (empError) throw empError;

  const results = [];
  for (const emp of employees ?? []) {
    const { data: convs } = await supabase
      .from("conversations")
      .select("id")
      .eq("employee_id", emp.id)
      .gte("created_at", monthStart.toISOString());
    if (!convs || convs.length === 0) continue;

    const convIds = convs.map((c: any) => c.id);
    const { data: analytics } = await supabase
      .from("analytics")
      .select("total_score")
      .in("conversation_id", convIds);
    if (!analytics || analytics.length === 0) continue;

    const avgScore = analytics.reduce((s: number, a: any) => s + a.total_score, 0) / analytics.length;
    const salary = ROLES_WITH_SALARY_ACCESS.has(role) ? Number(emp.salary ?? 0) : null;

    const qualityCoef = avgScore / 100;
    const volumeCoef = Math.min(convs.length / MONTHLY_CONVERSATION_NORM, 1.0);
    const bonusAmount = salary !== null
      ? Math.round(salary * BONUS_MAX_PERCENT * qualityCoef * volumeCoef * 100) / 100
      : null;

    results.push({
      full_name: emp.full_name,
      conv_count: convs.length,
      avg_score: Math.round(avgScore * 10) / 10,
      volume_coef: Math.round(volumeCoef * 100) / 100,
      // HR kabi oklad ko'rish huquqi bo'lmagan rollarga bonus summasi
      // ko'rsatilmaydi (TZ 2-bo'lim — moliyaviy ma'lumot cheklovi).
      bonus_amount: bonusAmount,
    });
  }

  return jsonResponse({ conversations_norm: MONTHLY_CONVERSATION_NORM, bonuses: results });
}

function handleSettings(perms: string[]) {
  if (!perms.includes("settings")) return jsonResponse({ error: "Ruxsat yo'q" }, 403);
  return jsonResponse({
    bonus_max_percent: BONUS_MAX_PERCENT,
    monthly_conversation_norm: MONTHLY_CONVERSATION_NORM,
  });
}

function handleCamera(perms: string[]) {
  if (!perms.includes("camera")) return jsonResponse({ error: "Ruxsat yo'q" }, 403);
  // TZ 4.2: kamera vendori bilan ulanish usuli hali aniqlanmagan — hozircha
  // faqat joy-tutuvchi javob.
  return jsonResponse({
    configured: false,
    message: "Kamera integratsiyasi hali sozlanmagan (TZ 4.2-band, keyingi bosqichda aniqlanadi).",
  });
}

// =========================================================================
// INTIZOM AI — TZ 12-bo'lim (coaching moduli). Rahbar xodimlar
// samaradorligi haqida erkin suhbat orqali savol-javob qiladi (matn,
// ovoz, rasm). AI javobi so'nggi 30 kunlik haqiqiy ma'lumotlarga
// (o'rtacha ball, takrorlanuvchi xatolar) asoslanadi.
// =========================================================================

const AI_CHAT_SYSTEM_PROMPT = `
Sen — "Intizom AI", "Yagona darcha" davlat xizmati markazida ishlaydigan
rahbarga yordamchi HR-koching (coaching) mutaxassisisan.

VAZIFANG: rahbarga o'z xodimlarining ish sifati haqida savollariga javob
berish, kim qayerda qiynalayotganini tushuntirish va aniq, amaliy
tavsiyalar (qanday yordam/o'qitish kerakligi) berish.

Senga har safar "XODIMLAR BO'YICHA JORIY MA'LUMOT" nomli blok beriladi —
bu haqiqiy, so'nggi 30 kunlik statistika (Supabase bazasidan olingan).
FAQAT shu ma'lumotga tayan, taxmin qilma. Agar so'ralgan xodim haqida
ma'lumot bo'lmasa yoki suhbatlar kam bo'lsa, buni ochiq ayt.

Agar rahbar ovozli xabar yoki rasm (masalan, hisobot skrinshoti,
qo'lyozma eslatma) yuborsa, uni ham tahlilga qo'shib javob ber.

MUHIM — XODIMGA ADOLATLI, XOLIS MUNOSABAT (bu qoidani hech qachon
buzma): sen faqat rahbarning "nazorat quroli" emassan — xodimning ham
manfaatini himoya qiladigan xolis maslahatchisan. Past ballarni yoki
xatolarni tahlil qilganda:
  - Avval ehtimoliy sabablarni ko'rib chiq (yetarli o'qitilmaganlik,
    noaniq reglament, og'ir/talabchan mijoz, charchoq, tajribasizlik) —
    faqat "xodim yomon ishlayapti" deb bir tomonlama xulosa chiqarma.
  - Aybni qidirish emas, RIVOJLANTIRISH nuqtai nazaridan yoz — jazo
    emas, qo'llab-quvvatlash chorasini taklif qil (o'qitish, mentor
    biriktirish, ish yukini qayta ko'rib chiqish).
  - Agar ma'lumot yetarli bo'lmasa (masalan bitta-ikkita past ball),
    keskin xulosaga shoshilma — "aniq xulosa uchun ko'proq kuzatuv
    kerak" deb ochiq ayt.
  - Xodimning yaxshi tomonlari/yutuqlari bo'lsa, ularni ham albatta
    aytib o't — faqat kamchiliklarga qaramaslik kerak.

Uslub: professional, qisqa va aniq, konkret amaliy tavsiyalar bilan
(masalan: "Aliyev bilan individual suhbat o'tkazish, mahsulot bo'yicha
qo'shimcha ta'lim tavsiya etiladi"). O'zbek tilida javob ber.

QUYIDA — KUTILGAN JAVOB USLUBIGA IKKI NAMUNA (few-shot):

Misol 1
Rahbar: "Aliyev nega past ball olyapti?"
Sen: "Aliyevning so'nggi suhbatlarida o'rtacha ball past ko'rinadi, asosiy
sabab — mijozga ma'lumotni to'liq va tushunarli yetkaza olmaslik. Bu
ko'pincha reglament yaxshi o'zlashtirilmaganda yoki hali tajriba
yetishmaganda uchraydi. Uni to'g'ridan-to'g'ri ayblashdan oldin, avval
qaysi mavzularda qiynalayotganini individual suhbatda aniqlashni, so'ng
tajribali xodim bilan bir necha kun ishlashini tashkil qilishni tavsiya
qilaman. Agar bu chora natija bermasa, qo'shimcha ta'lim moduli haqida
qayta ko'rib chiqish mumkin."

Misol 2
Rahbar: "Kim eng yaxshi ishlayapti?"
Sen: "Ma'lumotlarga ko'ra eng yuqori va barqaror ballga ega xodim —
[ism], jiddiy xato deyarli qayd etilmagan. Bunday natijani rag'batlantirish
(masalan, ochiq minnatdorchilik bildirish yoki bonus hisobida hisobga
olish) boshqa xodimlar uchun ham ijobiy namuna bo'ladi."
`.trim();

async function buildEmployeeContext(): Promise<string> {
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  const { data: employees } = await supabase
    .from("employees")
    .select("id, full_name")
    .eq("is_active", true);

  if (!employees || employees.length === 0) {
    return "Hozircha faol xodimlar ro'yxati bo'sh.";
  }

  const lines: string[] = [];
  for (const emp of employees) {
    const { data: convs } = await supabase
      .from("conversations")
      .select("id")
      .eq("employee_id", emp.id)
      .gte("created_at", monthAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(15);

    if (!convs || convs.length === 0) {
      lines.push(`- ${emp.full_name}: so'nggi 30 kunda suhbat qayd etilmagan.`);
      continue;
    }

    const convIds = convs.map((c: any) => c.id);
    const { data: analytics } = await supabase
      .from("analytics")
      .select("total_score, errors")
      .in("conversation_id", convIds);

    const scores = (analytics ?? []).map((a: any) => a.total_score).filter((s: any) => typeof s === "number");
    const avg = scores.length
      ? Math.round(scores.reduce((s: number, v: number) => s + v, 0) / scores.length)
      : null;

    const recentReasons = (analytics ?? [])
      .flatMap((a: any) => (Array.isArray(a.errors) ? a.errors : []))
      .map((e: any) => e?.sabab)
      .filter(Boolean)
      .slice(0, 4);

    lines.push(
      `- ${emp.full_name}: ${convs.length} ta suhbat (30 kun), o'rtacha ball ${avg ?? "—"}/100.` +
      (recentReasons.length
        ? ` Takrorlanuvchi muammolar: ${recentReasons.join("; ")}.`
        : " Jiddiy xato qayd etilmagan.")
    );
  }

  // "Faqat so'ralganda taqdim etsin, avtomatik ishlamasin" — bu yerda hech
  // qanday push-xabar yuborilmaydi, faqat past ballli suhbatlar ro'yxati
  // kontekstga qo'shiladi, shunda rahbar mos savol bersa ("bugun kim past
  // ball oldi?", "kim 20 balldan kam oldi?") AI aniq javob bera oladi.
  const LOW_SCORE_THRESHOLD = 20;
  const { data: recentConvs } = await supabase
    .from("conversations")
    .select("id, created_at, employees(full_name)")
    .gte("created_at", monthAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(500);

  let lowScoreSection = "";
  if (recentConvs && recentConvs.length > 0) {
    const convIds = recentConvs.map((c: any) => c.id);
    const { data: lowAnalytics } = await supabase
      .from("analytics")
      .select("conversation_id, total_score, summary")
      .in("conversation_id", convIds)
      .lt("total_score", LOW_SCORE_THRESHOLD);

    const convById = new Map(recentConvs.map((c: any) => [c.id, c]));
    const lowRows = (lowAnalytics ?? [])
      .map((a: any) => ({ ...a, conv: convById.get(a.conversation_id) }))
      .filter((r: any) => r.conv)
      .sort((a: any, b: any) => new Date(b.conv.created_at).getTime() - new Date(a.conv.created_at).getTime())
      .slice(0, 20);

    if (lowRows.length > 0) {
      const rows = lowRows.map((r: any) => {
        const empName = r.conv.employees?.full_name ?? "Noma'lum";
        const when = new Date(r.conv.created_at).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" });
        return `  • ${empName} — ${r.total_score}/100 (${when}) — ${r.summary ?? "xulosa yo'q"}`;
      });
      lowScoreSection =
        `\n\nDIQQAT — so'nggi 30 kunda ${LOW_SCORE_THRESHOLD} balldan past baholangan suhbatlar ` +
        `(faqat rahbar shu haqda so'raganda shu ro'yxatdan foydalan, o'z-o'zidan eslatma berma):\n` +
        rows.join("\n");
    }
  }

  return lines.join("\n") + lowScoreSection;
}

async function handleAiChatHistory(perms: string[], tgUserId: number) {
  if (!perms.includes("ai_chat")) return jsonResponse({ error: "Ruxsat yo'q" }, 403);

  const { data, error } = await supabase
    .from("ai_chat_messages")
    .select("role, message, created_at")
    .eq("telegram_id", tgUserId)
    .order("created_at", { ascending: true })
    .limit(50);
  if (error) throw error;

  return jsonResponse({
    messages: (data ?? []).map((m: any) => ({ role: m.role, text: m.message })),
  });
}

async function saveAiChatMessage(tgUserId: number, role: string, message: string) {
  try {
    await supabase.from("ai_chat_messages").insert({ telegram_id: tgUserId, role, message });
  } catch (e) {
    console.error("ai_chat_messages saqlashda xatolik:", e);
  }
}

async function handleAiChat(perms: string[], payload: any, tgUserId: number) {
  if (!perms.includes("ai_chat")) return jsonResponse({ error: "Ruxsat yo'q" }, 403);

  const userMessage: string = (payload?.message ?? "").toString();
  const history: Array<{ role: string; text: string }> = Array.isArray(payload?.history) ? payload.history : [];

  if (!userMessage && !payload?.audio_base64 && !payload?.image_base64) {
    return jsonResponse({ error: "Bo'sh xabar" }, 400);
  }

  const context = await buildEmployeeContext();

  const userParts: any[] = [
    { text: `XODIMLAR BO'YICHA JORIY MA'LUMOT (so'nggi 30 kun):\n${context}\n\nRahbar xabari: ${userMessage || "(matn yo'q, ovoz/rasm ilova qilingan)"}` },
  ];
  if (payload?.image_base64) {
    userParts.push({ inline_data: { mime_type: payload.image_mime || "image/jpeg", data: payload.image_base64 } });
  }
  if (payload?.audio_base64) {
    userParts.push({ inline_data: { mime_type: payload.audio_mime || "audio/ogg", data: payload.audio_base64 } });
  }

  const contents = [
    ...history.slice(-10).map((h) => ({
      role: h.role === "assistant" ? "model" : "user",
      parts: [{ text: h.text }],
    })),
    { role: "user", parts: userParts },
  ];

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: AI_CHAT_SYSTEM_PROMPT }] },
        contents,
        // ANIQLANGAN XATO: gemini-3.5-flash standart holatda "ichki
        // fikrlash" (thinking) tokenlarini ishlatadi — bu tokenlar ham
        // maxOutputTokens chegarasidan hisoblanadi, natijada haqiqiy javob
        // boshlanishidan oldin chegara tugab, javob deyarli bo'sh holda
        // kesilib qolardi (real testda finishReason=MAX_TOKENS bilan
        // tasdiqlandi). thinkingBudget:0 buni butunlay oldini oladi —
        // bonus sifatida tezroq va arzonroq ham bo'ladi.
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 3072,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error("Gemini xatosi:", res.status, errText);
    return jsonResponse({ error: "AI javob berolmadi. Birozdan keyin qayta urinib ko'ring." }, 502);
  }

  const data = await res.json();
  const reply = (data?.candidates?.[0]?.content?.parts ?? [])
    .map((p: any) => p.text ?? "")
    .join("")
    .trim() || "Javob shakllantirib bo'lmadi, qayta urinib ko'ring.";

  // Suhbat tarixini saqlaymiz (TZ 12-bo'lim: Dashboard qayta ochilganda
  // tarix yo'qolmasligi uchun). Rasm/ovoz binary saqlanmaydi — faqat
  // matn, borligi belgi bilan ko'rsatiladi.
  let storedUserText = userMessage;
  if (payload?.image_base64) storedUserText = `[rasm] ${storedUserText}`.trim();
  if (payload?.audio_base64) storedUserText = `[ovozli xabar] ${storedUserText}`.trim();
  await saveAiChatMessage(tgUserId, "user", storedUserText || "[bo'sh xabar]");
  await saveAiChatMessage(tgUserId, "assistant", reply);

  // "Ovozli xabar so'ralganda ovozli fayl kelsin" — foydalanuvchi OVOZLI
  // xabar yuborgan bo'lsa, javob ham matn ostidagi tugmani kutmasdan,
  // to'g'ridan-to'g'ri ovozli fayl sifatida qaytadi.
  let replyAudio: { base64: string; mime: string } | null = null;
  if (payload?.audio_base64) {
    replyAudio = await synthesizeSpeech(reply);
  }

  return jsonResponse({
    reply,
    reply_audio_base64: replyAudio?.base64 ?? null,
    reply_audio_mime: replyAudio?.mime ?? null,
  });
}

// ---- Matnni ovozga aylantirish (TTS) — "so'ralganda ovozli javob" -----

function pcmBase64ToWavBase64(pcmBase64: string, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): string {
  const binaryPcm = atob(pcmBase64);
  const pcmLen = binaryPcm.length;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;

  const buffer = new ArrayBuffer(44 + pcmLen);
  const view = new DataView(buffer);

  function writeStr(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + pcmLen, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, "data");
  view.setUint32(40, pcmLen, true);

  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < pcmLen; i++) bytes[44 + i] = binaryPcm.charCodeAt(i);

  let binaryWav = "";
  for (let i = 0; i < bytes.length; i++) binaryWav += String.fromCharCode(bytes[i]);
  return btoa(binaryWav);
}

// ESLATMA: Gemini TTS "boshqariladigan" (controllable) ovoz — ya'ni
// ohang/sur'at kabi xususiyatlar alohida raqamli parametr emas, balki
// matn oldidan tabiiy tildagi ko'rsatma sifatida beriladi. "Puck" —
// hujjatlashtirilgan erkak ovozlaridan biri; agar tinglab ko'rib mos
// kelmasa, boshqa nomlar bilan almashtirish mumkin (Charon, Fenrir,
// Orus, Enceladus va h.k.).
const TTS_VOICE_NAME = "Puck";
const TTS_STYLE_INSTRUCTION =
  "Quyidagi matnni tabiiy, biroz tezroq sur'atda, erkak ovozida, o'zbek tilida aksentsiz, sof talaffuz bilan o'qi:\n\n";

/**
 * Matnni ovozga aylantiradi. Ikkala joyda ishlatiladi: (1) "tts" amali —
 * foydalanuvchi 🔊 tugmani bosganda, (2) handleAiChat — foydalanuvchi
 * OVOZLI xabar yuborganda, javob ham AVTOMATIK ravishda ovozli fayl
 * sifatida qaytadi (matn ostidagi tugmani bosishni kutmasdan).
 */
async function synthesizeSpeech(text: string): Promise<{ base64: string; mime: string } | null> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: TTS_STYLE_INSTRUCTION + text.slice(0, 2000) }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: TTS_VOICE_NAME } } },
        },
      }),
    },
  );

  if (!res.ok) {
    console.error("TTS xatosi:", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  const pcmBase64 = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!pcmBase64) return null;

  return { base64: pcmBase64ToWavBase64(pcmBase64), mime: "audio/wav" };
}

async function handleTts(perms: string[], payload: any) {
  if (!perms.includes("ai_chat")) return jsonResponse({ error: "Ruxsat yo'q" }, 403);

  const text: string = (payload?.text ?? "").toString();
  if (!text) return jsonResponse({ error: "Matn kerak" }, 400);

  const result = await synthesizeSpeech(text);
  if (!result) return jsonResponse({ error: "Ovoz yaratib bo'lmadi." }, 502);

  return jsonResponse({ audio_base64: result.base64, mime: result.mime });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  try {
    const body = await req.json();
    const { initData, action, conversation_id, date, language } = body;

    const tgUser = await verifyInitData(initData ?? "");
    if (!tgUser) return jsonResponse({ error: "Tasdiqlanmadi" }, 401);

    const { data: botUser } = await supabase
      .from("bot_users")
      .select("role, is_active, full_name, language")
      .eq("telegram_id", tgUser.id)
      .maybeSingle<BotUser>();

    if (!botUser || !botUser.is_active) {
      return jsonResponse({ error: "Sizda kirish huquqi yo'q" }, 403);
    }

    const perms = ROLE_PERMISSIONS[botUser.role] ?? [];

    switch (action) {
      case "whoami":
        return jsonResponse({
          full_name: botUser.full_name,
          role: botUser.role,
          role_label: ROLE_LABELS[botUser.role] ?? botUser.role,
          permissions: perms,
          language: botUser.language || "uz",
        });
      case "set_language": {
        // TZ 24-bo'lim: Dashboard Sozlamalar > Til — bot_users.language'ni
        // yangilaydi, shu bilan bot.py ham shu foydalanuvchiga keyingi
        // hisobotlarni/menyularni tanlangan tilda yuboradi.
        if (language !== "uz" && language !== "ru") {
          return jsonResponse({ error: "Noto'g'ri til" }, 400);
        }
        const { error: langError } = await supabase
          .from("bot_users")
          .update({ language })
          .eq("telegram_id", tgUser.id);
        if (langError) throw langError;
        return jsonResponse({ ok: true, language });
      }
      case "reports":
        return await handleReports(perms);
      case "audio_url":
        return await handleAudioUrl(perms, conversation_id);
      case "history_day":
        return await handleHistoryDay(perms, date);
      case "ai_chat":
        return await handleAiChat(perms, body, tgUser.id);
      case "ai_chat_history":
        return await handleAiChatHistory(perms, tgUser.id);
      case "tts":
        return await handleTts(perms, body);
      case "employees":
        return await handleEmployees(perms);
      case "attendance":
        return await handleAttendance(perms);
      case "bonuses":
        return await handleBonuses(perms, botUser.role);
      case "settings":
        return handleSettings(perms);
      case "camera":
        return handleCamera(perms);
      default:
        return jsonResponse({ error: "Noma'lum amal" }, 400);
    }
  } catch (e) {
    console.error(e);
    return jsonResponse({ error: "Server xatosi" }, 500);
  }
});
