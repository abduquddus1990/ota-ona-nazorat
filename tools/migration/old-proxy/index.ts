// ESKI MANZIL -> YANGI SERVER (2026-10, Sidney -> Frankfurt).
//
// Qalqon serveri wfrclcwjeeqeqchmdhzw (Sidney) loyihasidan ytjvmmcpmpnaivtzymtq
// (Frankfurt) loyihasiga ko'chdi: baza Toshkentdan ~10 baravar yaqinroq.
// Eski loyihada "Xodim intizom" boti qoladi, shuning uchun uning o'rnida
// "ota-ona-bot" nomi bilan SHU funksiya turadi: eski manzilni ishlatadigan
// o'rnatilgan Android ilovalar (manzil APK ichiga yozilgan) va keshdagi
// Mini App so'rovlarini o'zgartirmasdan yangi serverga uzatadi.
//
// QALQON_TEXNIK=1 (eski loyihaning sekreti) — almashtirish paytidagi qisqa
// "texnik ishlar" rejimi: hamma narsaga 503. Telegram yetkazilmagan bot
// xabarlarini saqlab, keyin qayta yuboradi; ilovalar keyinroq urinadi.
//
// Deploy (faqat eski loyihaga):
//   Management API /v1/projects/wfrclcwjeeqeqchmdhzw/functions/deploy?slug=ota-ona-bot

const YANGI = "https://ytjvmmcpmpnaivtzymtq.supabase.co/functions/v1/ota-ona-bot";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-telegram-bot-api-secret-token",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  if (Deno.env.get("QALQON_TEXNIK") === "1") {
    return new Response(
      JSON.stringify({ ok: false, error: "Texnik ishlar. 15 daqiqadan keyin qayta urinib ko'ring." }),
      { status: 503, headers: { ...CORS, "Content-Type": "application/json", "Retry-After": "600" } },
    );
  }

  const sarlavha = new Headers(req.headers);
  sarlavha.delete("host");
  sarlavha.delete("content-length");
  try {
    const javob = await fetch(YANGI, {
      method: req.method,
      headers: sarlavha,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer(),
    });
    const chiqish = new Headers(javob.headers);
    for (const [k, v] of Object.entries(CORS)) chiqish.set(k, v);
    return new Response(javob.body, { status: javob.status, headers: chiqish });
  } catch (e) {
    console.error("old-proxy:", e);
    return new Response(JSON.stringify({ ok: false, error: "Server vaqtincha javob bermayapti." }),
      { status: 502, headers: { ...CORS, "Content-Type": "application/json" } });
  }
});
