// api/webhook.js
// Vercel Serverless Function — Telegram Bot Webhook (pair_ deep-link capable)
//
// CONFLICT NOTE:
// Production on the Surface PC uses LONG POLLING via bot_engine.py (getUpdates).
// Telegram delivers each update to EITHER webhook OR polling — not both.
// If you run bot_engine.py polling, do NOT leave setWebhook active (bot_engine
// calls deleteWebhook on startup). Only enable this Vercel webhook when you
// intentionally switch off local polling.
//
// Env: BOT_TOKEN only (no hardcoded fallback). Optional MINI_APP_URL.

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'OK',
      bot: 'Qalqon AI (Vercel webhook)',
      pairing: 'pair_XXXXXX deep-link + age/sinf onboard',
      note: 'Disable this webhook when using bot_engine.py long polling'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const BOT_TOKEN = process.env.BOT_TOKEN || process.env.MAIN_BOT_TOKEN || '';
  if (!BOT_TOKEN) {
    console.error('Webhook Error: BOT_TOKEN / MAIN_BOT_TOKEN missing from environment');
    return res.status(500).json({ error: 'BOT_TOKEN missing from environment' });
  }

  const MINI_APP_URL = process.env.MINI_APP_URL || 'https://abduquddus1990.github.io/ota-ona-nazorat/?v=5.4';
  const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

  const normalizeCode = (code) => String(code || '').replace(/\D/g, '');

  const sendMessage = async (chatId, text, replyMarkup = null, parseMode = 'HTML') => {
    const body = { chat_id: chatId, text, parse_mode: parseMode };
    if (replyMarkup) body.reply_markup = replyMarkup;
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  };

  try {
    const update = req.body;

    // Callback: parent "Farzandni Ulash" style actions (optional)
    if (update && update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message && cb.message.chat ? cb.message.chat.id : null;
      const data = cb.data || '';
      await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: cb.id })
      });
      if (chatId && data.startsWith('action_pair')) {
        const codePart = normalizeCode(data.replace('action_pair_', ''));
        const code = codePart.length === 6 ? codePart : '______';
        const link = `https://t.me/qalqon_aibot?start=pair_${code}`;
        await sendMessage(
          chatId,
          `🔗 <b>FARZANDNI ULASH:</b>\n\n👉 ${link}\n🔑 Oila kodi: <code>${code}</code>`
        );
      }
      return res.status(200).json({ ok: true });
    }

    if (update && update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const text = msg.text || '';

      if (text.startsWith('/start')) {
        const payload = text.slice('/start'.length).trim();
        if (payload.startsWith('pair_') || payload.startsWith('child_')) {
          const cleanCode = normalizeCode(payload.replace(/^pair_/, '').replace(/^child_/, ''));
          if (cleanCode.length !== 6) {
            await sendMessage(chatId, "⚠️ Noto'g'ri oila kodi. Ota-onangizdan 6 xonali kodni so'rang.");
            return res.status(200).json({ ok: true });
          }
          // Equivalent to bot_engine pair success path: ask yosh then sinf.
          // Stateless serverless: instruct child to reply with "YOSH SINF" (e.g. "12 7").
          await sendMessage(
            chatId,
            `🐺 <b>ASSALOMU ALAYKUM, YOSH QAHRAMON!</b>\n\n` +
              `Sizni ota-onangiz «Qalqon AI» tizimiga taklif qildi!\n\n` +
              `🔑 <b>Oila kodingiz:</b> <code>${cleanCode}</code>\n\n` +
              `Iltimos, <b>yosh</b> va <b>sinf</b> (1–11) ni bitta xabarda yuboring.\n` +
              `Masalan: <code>12 7</code>\n\n` +
              `<i>To'liq multi-step onboard uchun Surface dagi bot_engine.py long-polling ni ishlating.</i>`
          );
          // Stash lightweight hint on reply keyboard-less path via next message heuristic:
          // Client may reply "12 7"; handled below when text matches age+sinf.
          globalThis.__qalqonPending = globalThis.__qalqonPending || {};
          globalThis.__qalqonPending[String(chatId)] = { code: cleanCode, step: 'age_sinf' };
          return res.status(200).json({ ok: true });
        }

        const welcomeText =
          `👋 <b>Assalomu alaykum!</b>\n\n` +
          `🛡️ <b>Qalqon AI</b> — Ota-ona nazorati va AI tahlil tizimi.\n\n` +
          `Farzandingizning darsliklari, baholari va radarini ko'rish uchun pastdagi tugmani bosing:`;

        await sendMessage(chatId, welcomeText, {
          inline_keyboard: [
            [{ text: '📊 Ota-ona Boshqaruv Panelini Ochish (Mini App)', web_app: { url: MINI_APP_URL } }]
          ]
        });
        return res.status(200).json({ ok: true });
      }

      // Complete pair onboard if child replies "12 7" after pair_
      const pending = (globalThis.__qalqonPending || {})[String(chatId)];
      if (pending && pending.step === 'age_sinf') {
        const m = text.trim().match(/^(\d{1,2})\s+(\d{1,2})$/);
        if (!m) {
          await sendMessage(chatId, '⚠️ Format: <code>yosh sinf</code> — masalan <code>12 7</code>');
          return res.status(200).json({ ok: true });
        }
        const age = parseInt(m[1], 10);
        const sinf = parseInt(m[2], 10);
        if (age < 3 || age > 25 || sinf < 1 || sinf > 11) {
          await sendMessage(chatId, "Yosh 3-25, sinf 1-11 bolishi kerak.");
          return res.status(200).json({ ok: true });
        }
        const code = pending.code;
        delete globalThis.__qalqonPending[String(chatId)];
        await sendMessage(
          chatId,
          `✅ <b>Ulandi!</b>\n\n🔑 Kod: <code>${code}</code>\n🎂 Yosh: <b>${age}</b>\n🏫 Sinf: <b>${sinf}</b>`,
          {
            inline_keyboard: [
              [{
                text: '🌟 Bola Panelini Ochish & Rozilik Berish',
                web_app: { url: `${MINI_APP_URL}&role=child&code=${code}&age=${age}&sinf=${sinf}` }
              }]
            ]
          }
        );
        return res.status(200).json({ ok: true });
      }

      if (text.toLowerCase().includes('reels') || text.toLowerCase().includes('video')) {
        await sendMessage(
          chatId,
          `🎬 <b>Reels va Video Tahlili:</b>\n\n• 💻 IT: 45%\n• 🔬 Ilmiy: 25%\n• 🎮 Ko'ngilochar: 30%`
        );
      } else {
        await sendMessage(
          chatId,
          `💡 Boshqaruv panelini ochish uchun /start bosing.`
        );
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
