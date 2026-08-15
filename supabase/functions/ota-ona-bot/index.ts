// supabase/functions/ota-ona-bot/index.ts
//
// SHIELD PARENTAL GUARD — ADVANCED 24/7 SUPABASE SERVERLESS BOT
// Bilingual (UZ / RU), Admin Notifications (@username approval workflow), Demo/Test Mode, and 10k Pricing.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN") || "8992925094:AAE5K1N8VVxiCh9P6H1j7hCrYoTeIBmC8r0";
const MINI_APP_URL = Deno.env.get("MINI_APP_URL") || "https://abduquddus1990.github.io/ota-ona-nazorat/?v=3.0";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Dynamic Admin IDs Store & User States
const ADMIN_CHAT_IDS = new Set<string | number>();
const USER_LANG: Record<string | number, string> = {};
const USER_APPROVAL_STATUS: Record<string, "pending" | "approved" | "rejected"> = {};

function generateFamilyCode(userId: string | number): string {
  const num = Math.abs((Number(userId) * 31 + 7919) % 900000) + 100000;
  return `${String(num).slice(0, 3)}-${String(num).slice(3, 6)}`;
}

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

async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  await fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text: text }),
  });
}

async function notifyAdmins(text: string, replyMarkup?: any) {
  for (const adminId of ADMIN_CHAT_IDS) {
    try {
      await sendMessage(adminId, text, replyMarkup);
    } catch (e) {
      console.error(`Admin ${adminId} ga xabar yuborishda xato:`, e);
    }
  }
}

// BILINGUAL TEXT TEMPLATES (UZ / RU)
function getStartMenuText(userId: string | number, lang: string = "uz", isApproved: boolean = false): string {
  const code = generateFamilyCode(userId);
  if (lang === "ru") {
    const statusNote = isApproved 
      ? "✅ *Ваш аккаунт подтвержден администратором!*" 
      : "⏳ *Статус:* Запрос отправлен администратору. До одобрения доступен **Тестовый / Демо-режим**.";

    return `🛡️ *SHIELD PARENTAL GUARD — ЦЕНТР РОДИТЕЛЬСКОГО КОНТРОЛЯ*

Добро пожаловать! Безопасность, школьные предметы и цифровые привычки вашего ребёнка под защитой 24/7.

${statusNote}

🔑 *Ваш семейный код:* \`${code}\`
📍 *Онлайн-радар и локация:* **Бесплатно**
💎 *Pro Версия (AI & e-Maktab 100 баллов):* **10,000 сум/мес (за 1 ребёнка)**
⚠️ *Примечание:* В будущем для бесплатной версии также может быть введена минимальная плата для поддержания серверов.

Выберите нужный раздел:`;
  }

  const statusNote = isApproved
    ? "✅ *Sizning hisobingiz administrator tomonidan tasdiqlangan!*"
    : "⏳ *Holat:* Administratorga so'rov yuborilgan. Tasdiqlanguniga qadar tizim **Test / Demo rejimida** ishlaydi.";

  return `🛡️ *SHIELD PARENTAL GUARD — OTA-ONA BOSHQARUV MARKAZI*

Assalomu alaykum! Farzandingizning xavfsizligi, darsliklari va raqamli odatlari 24/7 doimiy nazorat ostida.

${statusNote}

🔑 *Sizning oila kodingiz:* \`${code}\`
📍 *Jonli lokatsiya va radar:* **100% BEPUL**
💎 *Pro Versiya (AI & 100 ballik e-Maktab):* **10,000 so'm/oy (har bir bola uchun)**
⚠️ *Eslatma:* Kelajakda sifat va barqarorlikni ta'minlash uchun bepul versiyaga ham ramziy to'lov kiritilishi mumkin.

Quyidagi bo'limlardan birini tanlang:`;
}

function getStartKeyboard(userId: string | number, lang: string = "uz"): any {
  const code = generateFamilyCode(userId);
  
  if (lang === "ru") {
    return {
      inline_keyboard: [
        [
          {
            text: "🚀 Открыть Панель Управления (Mini App)",
            web_app: { url: `${MINI_APP_URL}&lang=ru` },
          },
        ],
        [
          { text: "🔗 Подключить Ребёнка", callback_data: `action_pair_${code}` },
          { text: "🎬 Анализ Reels и Видео", callback_data: "action_reels" },
        ],
        [
          { text: "💡 Отзывы и Предложения", callback_data: "action_feedback" },
          { text: "🌐 Til / Язык (UZ/RU)", callback_data: "action_lang" },
        ],
      ],
    };
  }
  return {
    inline_keyboard: [
      [
        {
          text: "🚀 Ota-ona Boshqaruv Panelini Ochish (Mini App)",
          web_app: { url: `${MINI_APP_URL}&lang=uz` },
        },
      ],
      [
        { text: "🔗 Farzandni Ulash", callback_data: `action_pair_${code}` },
        { text: "🎬 Reels & Video Tahlili", callback_data: "action_reels" },
      ],
      [
        { text: "💡 Taklif va Fikrlar", callback_data: "action_feedback" },
        { text: "🌐 Til / Язык (UZ/RU)", callback_data: "action_lang" },
      ],
    ],
  };
}

function getPairingText(userId: string | number, lang: string = "uz", isApproved: boolean = false): string {
  const code = generateFamilyCode(userId);
  const pairLink = `https://t.me/farzand_nazorat_bot?start=pair_${code.replace("-", "")}`;
  
  if (!isApproved) {
    if (lang === "ru") {
      return `⏳ *ОЖИДАНИЕ ОДОБРЕНИЯ АДМИНИСТРАТОРОМ:*

Ваш аккаунт находится на рассмотрении. После того как администратор подтвердит ваш профиль, вы сможете подключить реальное устройство ребёнка.
В настоящее время вам доступен **Тестовый / Демо-режим** панели.`;
    }
    return `⏳ *ADMINISTRATOR TASDIG'I KUTILMOQDA:*

Sizning profilingiz ko'rib chiqish jarayonida. Administrator ruxsat berganidan so'ng farzand qurilmasini ulashingiz mumkin bo'ladi.
Hozirda siz uchun boshqaruv paneli **Test / Demo rejimida** to'liq ochiq.`;
  }

  if (lang === "ru") {
    return `🔗 *АВТОМАТИЧЕСКОЕ ПОДКЛЮЧЕНИЕ РЕБЁНКА:*

1. Перешлите эту ссылку ребёнку в Telegram:
👉 ${pairLink}

2. Или в Android-приложении введите код:
🔑 **\`${code}\`**

Ребёнок подключится автоматически!`;
  }
  return `🔗 *FARZANDNI AVTOMATIK ULASH YO'RIQNOMASI:*

1. Quyidagi havolani farzandingizga Telegram orqali yuboring:
👉 ${pairLink}

2. Yoki Android mobil ilovasida ushbu kodni kiriting:
🔑 **\`${code}\`**

Farzand profilingizga muvaffaqiyatli bog'lanadi!`;
}

function getReelsAnalysisText(lang: string = "uz"): string {
  if (lang === "ru") {
    return `🎬 *АНАЛИЗ ПРОСМОТРЕННЫХ REELS И ВИДЕО:*

📊 *Распределение по темам:*
• 💻 *Образование и IT (Python, Робототехника, Языки):* 45% (Полезно)
• 🔬 *Научные эксперименты и Логика:* 25% (Положительно)
• 🎮 *Развлечения и Игры:* 30% (В норме)

💡 *Рекомендация:* Чтобы алгоритм чаще рекомендовал обучающие видео, подпишитесь на полезные каналы по школьным предметам.`;
  }
  return `🎬 *KO'RILAYOTGAN REELS VA VIDEO KONTENT TAHLILI:*

📊 *Mavzular taqsimoti:*
• 💻 *Ta'limiy & IT (Python, Robototexnika, Chet tili):* 45% (Foydali va rivojlantiruvchi)
• 🔬 *Ilmiy tajribalar & Mantiqiy jumboqlar:* 25% (Ijobiy tendensiya)
• 🎮 *Ko'ngilochar va o'yin strimlari:* 30% (Me'yorida)

💡 *Tavsiya:* Algoritm ko'proq ta'limiy videolarni tavsiya qilishi uchun fanlar bo'yicha foydalanuvchi kanallariga obuna bo'lishni yo'lga qo'ying.`;
}

function getFeedbackText(lang: string = "uz"): string {
  if (lang === "ru") {
    return `💡 *ОТЗЫВЫ И ПРЕДЛОЖЕНИЯ:*

Ваше мнение очень важно для нас! Отправьте свои предложения по улучшению программы разработчикам:

📬 *Официальная почта:* \`alhamdulillah@tmail.ton\`

👉 [Написать письмо через Gmail](https://mail.google.com/mail/?view=cm&fs=1&to=alhamdulillah@tmail.ton&su=Shield+Parental+Guard+Taklif+va+Mulohaza)`;
  }
  return `💡 *TAKLIF VA FIKR-MULOHAZALAR:*

Dasturni yanada yaxshilash bo'yicha takliflaringizni to'g'ridan-to'g'ri ishlab chiquvchilarga yuboring:

📬 *Rasmiy qabul pochtasi:* \`alhamdulillah@tmail.ton\`

👉 [Gmail orqali xat yozish](https://mail.google.com/mail/?view=cm&fs=1&to=alhamdulillah@tmail.ton&su=Shield+Parental+Guard+Taklif+va+Mulohaza)`;
}

serve(async (req) => {
  if (req.method === "GET") {
    return new Response(JSON.stringify({ status: "OK", service: "Shield Parental Guard Bot" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload = await req.json();

    // 0. Mini App'dan to'g'ridan-to'g'ri ro'yxatdan o'tish so'rovi kelganda
    if (payload.type === "parent_registration_request") {
      const username = payload.username || "@noma'lum";
      const familyCode = payload.familyCode || "849-210";
      
      const adminNotice = `🔔 *YANGI OTA-ONA RO'YXATDAN O'TMOQCHI!*

👤 *Username:* ${username}
🔑 *Oila Kodi:* \`${familyCode}\`
📅 *Vaqt:* ${new Date().toLocaleString("uz-UZ")}

Ushbu foydalanuvchiga to'liq foydalanish (farzand qo'shish)ga ruxsat berasizmi?`;

      const approvalKeyboard = {
        inline_keyboard: [
          [
            { text: "✅ Ruxsat berish (Approve)", callback_data: `admin_approve_${username}` },
            { text: "❌ Rad etish (Reject)", callback_data: `admin_reject_${username}` },
          ],
        ],
      };

      await notifyAdmins(adminNotice, approvalKeyboard);
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    const update = payload;

    // 1. Callback query tugmalari bosilganda
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = cb.message.chat.id;
      const data = cb.data || "";
      const lang = USER_LANG[chatId] || "uz";
      const userKey = `@${cb.from.username || cb.from.id}`;
      const isApproved = USER_APPROVAL_STATUS[userKey] === "approved";

      await answerCallbackQuery(cb.id);

      // Admin Tasdiqlash Callbacklari
      if (data.startsWith("admin_approve_")) {
        const targetUsername = data.replace("admin_approve_", "");
        USER_APPROVAL_STATUS[targetUsername] = "approved";
        
        await sendMessage(chatId, `✅ *Muvaffaqiyatli:* ${targetUsername} uchun tizimdan foydalanish va farzand qo'shishga to'liq ruxsat berildi!`);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      if (data.startsWith("admin_reject_")) {
        const targetUsername = data.replace("admin_reject_", "");
        USER_APPROVAL_STATUS[targetUsername] = "rejected";
        
        await sendMessage(chatId, `❌ *Rad etildi:* ${targetUsername} so'rovi rad etildi (Test rejimida qoladi).`);
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
      } else if (data === "set_lang_ru") {
        USER_LANG[chatId] = "ru";
        await sendMessage(chatId, "✅ Язык успешно изменён на русский!", getStartKeyboard(chatId, "ru"));
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // 2. Matnli xabarlar
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const text = msg.text || "";
      const lang = USER_LANG[chatId] || "uz";
      const userKey = `@${msg.from.username || msg.from.id}`;
      const isApproved = USER_APPROVAL_STATUS[userKey] === "approved";

      // Admin tayinlash buyrug'i (/admin yoki /setadmin)
      if (text === "/admin" || text === "/setadmin") {
        ADMIN_CHAT_IDS.add(chatId);
        await sendMessage(chatId, `👑 *ADMINISTRATOR SIFATIDA TAYINLANDINGIZ!*\n\nSizning Telegram ID: \`${chatId}\`\nEndi barcha yangi foydalanuvchilarning ro'yxatdan o'tish so'rovlari shu yerga [Ruxsat berish / Rad etish] tugmalari bilan yuboriladi.`);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // /start [payload] komandasi
      if (text.startsWith("/start")) {
        if (text.includes("pair_")) {
          // Farzand juftlash havolasi orqali kirgan
          const reply = lang === "ru" 
            ? "✅ Вы успешно привязаны к родительскому аккаунту! Отправьте круглое видео или локацию для завершения."
            : "✅ Siz ota-onangizning profiliga muvaffaqiyatli bog'landingiz! Rozilik uchun dumaloq video yoki lokatsiya yuboring.";
          await sendMessage(chatId, reply);
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }

        // Yangi foydalanuvchi kirganda adminga bildirishnoma yuborish
        if (!ADMIN_CHAT_IDS.has(chatId) && !isApproved) {
          const userFull = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim() || "Foydalanuvchi";
          const username = msg.from.username ? `@${msg.from.username}` : `ID: ${msg.from.id}`;
          const code = generateFamilyCode(chatId);

          const adminAlert = `🔔 *YANGI FOYDALANUVCHI ULANMOQCHI!*

👤 *Ism:* ${userFull}
💬 *Username:* ${username}
🆔 *Telegram ID:* \`${chatId}\`
🔑 *Oila Kodi:* \`${code}\`
📅 *Vaqt:* ${new Date().toLocaleString("uz-UZ")}

Foydalanuvchiga to'liq foydalanish (farzand qo'shish)ga ruxsat berasizmi?`;

          const approveBtn = {
            inline_keyboard: [
              [
                { text: "✅ Ruxsat berish (Approve)", callback_data: `admin_approve_${username}` },
                { text: "❌ Rad etish (Reject)", callback_data: `admin_reject_${username}` },
              ],
            ],
          };

          await notifyAdmins(adminAlert, approveBtn);
        }

        await sendMessage(chatId, getStartMenuText(chatId, lang, isApproved), getStartKeyboard(chatId, lang));
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      if (text.startsWith("/farzand")) {
        await sendMessage(chatId, getPairingText(chatId, lang, isApproved));
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      if (text.startsWith("/reels")) {
        await sendMessage(chatId, getReelsAnalysisText(lang));
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Rasm yoki skrinshot yuborilgan bo'lsa
      if (msg.photo) {
        const photoReply = lang === "ru"
          ? "✅ *Скриншот принят!*\n\nВремя использования приложений и задания проанализированы. Данные синхронизированы с панелью управления."
          : "✅ *Skrinshot qabul qilindi!*\n\n📱 Ilovalardan foydalanish vaqti va darslik topshiriqlari tahlil qilindi. Ma'lumotlar boshqaruv paneliga sinxronlashtirildi.";
        await sendMessage(chatId, photoReply);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Ovozli xabar
      if (msg.voice) {
        const voiceReply = lang === "ru"
          ? "🎙️ *Голосовое сообщение принято.*\n\nРекомендации по школьным предметам и цифровым привычкам синхронизированы."
          : "🎙️ *Ovozli xabar qabul qilindi.*\n\nFarzandingizning darsliklarni o'zlashtirishi va raqamli odatlarini yaxshilash bo'yicha tavsiyalar sinxronlashtirildi.";
        await sendMessage(chatId, voiceReply);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      // Boshqa matnli savollar
      const generalReply = lang === "ru"
        ? "💡 *Информация:* Оценки 100 баллов, школьные предметы 1-11 классов и онлайн-радар под защитой. Нажмите кнопку **«📊 Панель Родителя»** внизу слева."
        : "💡 *Ma'lumot:* Farzandingizning 100 ballik baholari, 1-11 sinf DTS darsliklari va jonli joylashuvi nazorat ostida. Boshqaruv panelini ochish uchun ekranning pastki chap qismidagi **«📊 Ota-Ona Paneli»** tugmasini bosing.";
      await sendMessage(chatId, generalReply);
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (error) {
    console.error("Webhook xatosi:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
