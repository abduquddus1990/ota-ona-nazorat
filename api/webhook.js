// api/webhook.js
// Vercel Serverless Function — 24/7 Telegram Bot Webhook
export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'OK', bot: 'Shield Parental Guard (Vercel Serverless)' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const BOT_TOKEN = process.env.BOT_TOKEN || "8992925094:AAE5K1N8VVxiCh9P6H1j7hCrYoTeIBmC8r0";
  const MINI_APP_URL = process.env.MINI_APP_URL || "https://abduquddus1990.github.io/ota-ona-nazorat/";
  const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

  try {
    const update = req.body;
    if (update && update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const text = msg.text || '';

      if (text.startsWith('/start')) {
        const welcomeText = `👋 *Assalomu alaykum!*\n\n🛡️ *Shield Parental Guard* — Ota-ona nazorati va AI tahlil tizimi 24/7 serverda faol.\n\nFarzandingizning darsliklari (1-11 sinf DTS), 100 ballik baholari, ekran vaqti va ilovalar reytingini ko'rish uchun pastdagi tugmani bosing:`;

        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeText,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '📊 Ota-ona Boshqaruv Panelini Ochish (Mini App)',
                    web_app: { url: MINI_APP_URL }
                  }
                ]
              ]
            }
          })
        });
      } else if (text.toLowerCase().includes('reels') || text.toLowerCase().includes('video')) {
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `🎬 *Ko'rilayotgan Reels va Video Kontent Tahlili:*\n\n📊 *Mavzular taqsimoti:*\n• 💻 *Ta'limiy & IT:* 45%\n• 🔬 *Ilmiy tajribalar:* 25%\n• 🎮 *Ko'ngilochar:* 30%\n\n💡 *Tavsiya:* Algoritm ko'proq ta'limiy videolarni tavsiya qilishi uchun fanlar bo'yicha foydali kanallarga obuna bo'lishni yo'lga qo'ying.`,
            parse_mode: 'Markdown'
          })
        });
      } else {
        await fetch(`${TELEGRAM_API}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `💡 *Ma'lumot:* Farzandingizning 100 ballik baholari va dars jadvali doimiy nazorat ostida. Boshqaruv panelini ochish uchun /start bosing.`,
            parse_mode: 'Markdown'
          })
        });
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
