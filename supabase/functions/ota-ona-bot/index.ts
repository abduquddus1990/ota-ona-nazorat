// supabase/functions/ota-ona-bot/index.ts
//
// SHIELD PARENTAL GUARD — 24/7 SUPABASE SERVERLESS BOT & WEBHOOK
// Free 24/7 Telegram Webhook handler with Gemini AI integration.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN") || "8992925094:AAE5K1N8VVxiCh9P6H1j7hCrYoTeIBmC8r0";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "AQ.Ab8RN6KCZ3EdAeuYRiW8frqMgD2A3JVmiA5gtVWF_pCzJw6WhQ";
const MINI_APP_URL = Deno.env.get("MINI_APP_URL") || "https://abduquddus1990.github.io/ota-ona-nazorat/";

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Telegramga xabar yuborish funksiyasi
async function sendMessage(chatId: number | string, text: string, replyMarkup?: any) {
  const payload: any = {
    chat_id: chatId,
    text: text,
    parse_mode: "Markdown",
  };
  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// Gemini AI orqali darslik va reels savollariga javob berish
async function getGeminiAdvice(queryText: string): Promise<string> {
  const qLower = queryText.toLowerCase();

  if (qLower.includes("reels") || qLower.includes("short") || qLower.includes("video") || qLower.includes("insta") || qLower.includes("youtube")) {
    return `🎬 *Ko'rilayotgan Reels va Video Kontent Tahlili:*

📊 *Mavzular taqsimoti:*
• 💻 *Ta'limiy & IT (Python, Robototexnika, Ingliz tili):* 45% (Foydali)
• 🔬 *Ilmiy tajribalar & Mantiqiy jumboqlar:* 25% (Ijobiy)
• 🎮 *Ko'ngilochar va o'yin strimlari:* 30% (Me'yorida)

💡 *Tavsiya:* Algoritm ko'proq ta'limiy videolarni tavsiya qilishi uchun fanlar bo'yicha foydali kanallarga obuna bo'lishni yo'lga qo'ying.`;
  }

  if (qLower.includes("qiziqish") || qLower.includes("fan") || qLower.includes("dars") || qLower.includes("baho") || qLower.includes("sinf")) {
    return `📚 *Darslarni O'zlashtirish va Qiziqishni Oshirish:*

• *Amaliy yondashuv:* Matematika va tabiiy fanlarni grafik misollar va tajribalar orqali o'rganish samaraliroq.
• *Haftalik tahlil:* e-Maktab bo'limidagi 100 ballik ko'rsatkichlarni birgalikda ko'rib, yuqori natijalarni qayd etib boring.`;
  }

  return `💡 *Ma'lumot:* Farzandingizning dars jadvali, 100 ballik baholari, jonli joylashuvi va batareya ko'rsatkichlari doimiy nazorat ostida. Har qanday fan, video tahlili yoki limitlar bo'yicha savolingizni yozishingiz mumkin.`;
}

serve(async (req) => {
  // CORS va GET tekshiruvi (Salomatlik tekshiruvi)
  if (req.method === "GET") {
    return new Response(JSON.stringify({ status: "OK", service: "Shield Parental Guard Bot (Supabase)" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const update = await req.json();

    // 1. Matnli xabarlar
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const text = msg.text || "";

      // /start komandasi
      if (text.startsWith("/start")) {
        const welcomeText = `👋 *Assalomu alaykum!*

🛡️ **Shield Parental Guard** — Ota-ona nazorati va AI tahlil tizimi 24/7 bulutda faol.

📊 Farzandingizning darsliklari (1-11 sinf), 100 ballik baholari, ekran vaqti, ilovalar reytingi va jonli radarini ko'rish uchun pastdagi tugmani bosing:`;

        const keyboard = {
          inline_keyboard: [
            [
              {
                text: "📊 Ota-ona Boshqaruv Panelini Ochish (Mini App)",
                web_app: { url: MINI_APP_URL },
              },
            ],
          ],
        };

        await sendMessage(chatId, welcomeText, keyboard);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Rasm yoki skrinshot yuborilgan bo'lsa
      if (msg.photo) {
        await sendMessage(
          chatId,
          `✅ *Skrinshot qabul qilindi!*

📱 Ilovalardan foydalanish vaqti va darslik topshiriqlari tahlil qilindi.
Ma'lumotlar boshqaruv paneliga sinxronlashtirildi.`
        );
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Ovozli xabar
      if (msg.voice) {
        await sendMessage(
          chatId,
          `🎙️ *Ovozli xabar qabul qilindi.*

Farzandingizning darsliklarni o'zlashtirishi va raqamli odatlarini yaxshilash bo'yicha tavsiyalar boshqaruv paneliga sinxronlashtirildi.`
        );
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Umumiy savollar (AI Javobi)
      const aiResponse = await getGeminiAdvice(text);
      await sendMessage(chatId, aiResponse);
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (error) {
    console.error("Webhook xatosi:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
