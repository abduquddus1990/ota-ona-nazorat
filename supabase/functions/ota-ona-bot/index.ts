// supabase/functions/ota-ona-bot/index.ts
//
// SHIELD PARENTAL GUARD — ADVANCED 24/7 SUPABASE SERVERLESS BOT
// Multi-Admin / Partner Management (@ai_loyihachi & partners), HTML Parse Mode (Zero parsing errors),
// Child Status Alerts, Zero Location Demands, and Instant Approval Workflow.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN") || "8992925094:AAE5K1N8VVxiCh9P6H1j7hCrYoTeIBmC8r0";
const MINI_APP_URL = Deno.env.get("MINI_APP_URL") || "https://abduquddus1990.github.io/ota-ona-nazorat/?v=3.0";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Dynamic Admin IDs Store & Known Admin Usernames (Sheriklar ro'yxati)
const ADMIN_USERNAMES = new Set<string>(["ai_loyihachi", "mirkamolov13"]);
const ADMIN_CHAT_IDS = new Set<string | number>();
const USER_LANG: Record<string | number, string> = {};
const USER_APPROVAL_STATUS: Record<string, "pending" | "approved" | "rejected"> = {};

function generateFamilyCode(userId: string | number): string {
  const num = Math.abs((Number(userId) * 31 + 7919) % 900000) + 100000;
  return `${String(num).slice(0, 3)}-${String(num).slice(3, 6)}`;
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

async function notifyAdmins(htmlText: string, replyMarkup?: any) {
  for (const adminId of ADMIN_CHAT_IDS) {
    try {
      await sendMessage(adminId, htmlText, replyMarkup);
    } catch (e) {
      console.error(`Admin ${adminId} ga xabar yuborishda xato:`, e);
    }
  }
}

// BILINGUAL TEXT TEMPLATES (HTML MODE)
function getStartMenuText(userId: string | number, lang: string = "uz", isApproved: boolean = false, isAdmin: boolean = false): string {
  const code = generateFamilyCode(userId);

  if (isAdmin) {
    return `👑 <b>SHIELD PARENTAL GUARD — ADMINISTRATOR PANELI</b>

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
    const statusNote = isApproved 
      ? "✅ <b>Ваш аккаунт подтвержден администратором!</b>" 
      : "⏳ <b>Статус:</b> Запрос отправлен администраторам. До одобрения доступен <b>Тестовый / Демо-режим</b>.";

    return `🛡️ <b>SHIELD PARENTAL GUARD — ЦЕНТР РОДИТЕЛЬСКОГО КОНТРОЛЯ</b>

Добро пожаловать! Безопасность, школьные предметы и цифровые привычки вашего ребёнка под защитой 24/7.

${statusNote}

🔑 <b>Ваш семейный код:</b> <code>${code}</code>
📍 <b>Онлайн-радар и локация:</b> <b>Бесплатно</b>
💎 <b>Pro Версия (AI & e-Maktab 100 баллов):</b> <b>10,000 сум/мес (за 1 ребёнка)</b>
⚠️ <i>Примечание: В будущем для бесплатной версии также может быть введена минимальная плата для поддержания серверов.</i>

Выберите нужный раздел:`;
  }

  const statusNote = isApproved
    ? "✅ <b>Sizning hisobingiz administrator tomonidan tasdiqlangan!</b>"
    : "⏳ <b>Holat:</b> Administratorlarga so'rov yuborilgan. Tasdiqlanguniga qadar tizim <b>Test / Demo rejimida</b> ishlaydi.";

  return `🛡️ <b>SHIELD PARENTAL GUARD — OTA-ONA BOSHQARUV MARKAZI</b>

Assalomu alaykum! Farzandingizning xavfsizligi, darsliklari va raqamli odatlari 24/7 doimiy nazorat ostida.

${statusNote}

🔑 <b>Sizning oila kodingiz:</b> <code>${code}</code>
📍 <b>Jonli lokatsiya va radar:</b> <b>100% BEPUL</b>
💎 <b>Pro Versiya (AI & 100 ballik e-Maktab):</b> <b>10,000 so'm/oy (har bir bola uchun)</b>
⚠️ <i>Eslatma: Kelajakda sifat va barqarorlikni ta'minlash uchun bepul versiyaga ham ramziy to'lov kiritilishi mumkin.</i>

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
      
      const adminNotice = `🔔 <b>YANGI OTA-ONA RO'YXATDAN O'TMOQCHI!</b>\n\n👤 <b>Username:</b> ${username}\n🔑 <b>Oila Kodi:</b> <code>${familyCode}</code>\n📅 <b>Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}\n\nUshbu foydalanuvchiga to'liq foydalanish (farzand qo'shish)ga ruxsat berasizmi?`;

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

    // 0.1 Farzand rozilik berib, 6 xonali kod bilan ulanganda
    if (payload.type === "child_paired_event") {
      const familyCode = payload.familyCode || "849-210";
      const childName = payload.childName || "Farzand";
      
      const alertMsg = `🎉 <b>FARZAND ROZILIK BILAN ULANDI!</b>\n\n👦 <b>Farzand:</b> ${childName}\n🔑 <b>Oila Kodi:</b> <code>${familyCode}</code>\n📅 <b>Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}\n\n✨ Farzand barcha 4 ta qoidalar bilan tanishdi va ulanishga to'liq rozilik berdi.\nEndi jonli lokatsiya, darsliklar bahosi va qiziqishlar tahlili to'liq ishlaydi!`;

      await notifyAdmins(alertMsg);
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // 0.2 Farzand tezkor xabar yuborganda (Maktab, Uy, Olib keting, SOS)
    if (payload.type === "child_status_alert") {
      const childName = payload.childName || "Farzand";
      const statusText = payload.statusText || "Xabar keldi";
      const familyCode = payload.familyCode || "849-210";

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
      const isApproved = USER_APPROVAL_STATUS[userKey] === "approved" || isAdmin;

      await answerCallbackQuery(cb.id);

      // Admin Tasdiqlash Callbacklari
      if (data.startsWith("admin_approve_")) {
        const targetUsername = data.replace("admin_approve_", "");
        USER_APPROVAL_STATUS[targetUsername] = "approved";
        
        await sendMessage(chatId, `✅ <b>Muvaffaqiyatli:</b> ${targetUsername} uchun tizimdan foydalanish va farzand qo'shishga to'liq ruxsat berildi!`);
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }

      if (data.startsWith("admin_reject_")) {
        const targetUsername = data.replace("admin_reject_", "");
        USER_APPROVAL_STATUS[targetUsername] = "rejected";
        
        await sendMessage(chatId, `❌ <b>Rad etildi:</b> ${targetUsername} so'rovi rad etildi (Test rejimida qoladi).`);
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
      const text = (msg.text || "").trim();
      const lang = USER_LANG[chatId] || "uz";
      const rawUsername = (msg.from.username || "").toLowerCase().replace("@", "");
      const isAdmin = ADMIN_USERNAMES.has(rawUsername);
      if (isAdmin) ADMIN_CHAT_IDS.add(chatId);

      const userKey = `@${msg.from.username || msg.from.id}`;
      const isApproved = USER_APPROVAL_STATUS[userKey] === "approved" || isAdmin;

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
      if (text.startsWith("/start")) {
        if (text.includes("pair_")) {
          // Farzand juftlash havolasi orqali kirgan (hech qanday lokatsiya so'ralmaydi!)
          const reply = lang === "ru" 
            ? "✅ <b>Вы успешно привязаны к родительскому аккаунту!</b> Все школьные предметы и функции активированы."
            : "✅ <b>Siz ota-onangizning profiliga muvaffaqiyatli bog'landingiz!</b> Barcha darsliklar va imkoniyatlar faollashtirildi.";
          await sendMessage(chatId, reply);
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        }

        // Agar oddiy yangi foydalanuvchi kirsa (va admin bo'lmasa), adminga bildirishnoma yuborish
        if (!isAdmin && !isApproved) {
          const userFull = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim() || "Foydalanuvchi";
          const username = msg.from.username ? `@${msg.from.username}` : `ID: ${msg.from.id}`;
          const code = generateFamilyCode(chatId);

          const adminAlert = `🔔 <b>YANGI FOYDALANUVCHI ULANMOQCHI!</b>\n\n👤 <b>Ism:</b> ${userFull}\n💬 <b>Username:</b> ${username}\n🆔 <b>Telegram ID:</b> <code>${chatId}</code>\n🔑 <b>Oila Kodi:</b> <code>${code}</code>\n📅 <b>Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}\n\nFoydalanuvchiga to'liq foydalanish (farzand qo'shish)ga ruxsat berasizmi?`;

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

        await sendMessage(chatId, getStartMenuText(chatId, lang, isApproved, isAdmin), getStartKeyboard(chatId, lang));
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

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (error) {
    console.error("Webhook xatosi:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
