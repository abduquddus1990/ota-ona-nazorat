// app.js — to'liq mini-ilova: hamburger-menyu (yon panel) + profil oynasi +
// har bir bo'lim uchun ekran, jumladan "Intizom AI" (matn/ovoz/rasm orqali
// suhbat). Har bir navigatsiya/xabar backend'ga (Edge Function) so'rov
// yuboradi — initData har safar qayta tekshiriladi (stateless, sessiya
// saqlanmaydi), shuning uchun alohida login/parol tizimi kerak emas.

const SUPABASE_URL = "https://wfrclcwjeeqeqchmdhzw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_XXGPseelcyjkO6EJie1bHQ_t32mh4Do";
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/miniapp-api`;

const tg = window.Telegram?.WebApp;

// ESLATMA: "bonuses" endi mustaqil menyu bandi emas — "Sozlamalar" ichiga
// ko'chirildi (rahbar so'rovi bo'yicha), o'rniga "Intizom AI" qo'shildi.
// "label" endi shu yerda emas — TRANSLATIONS'dagi "nav_<key>" orqali
// olinadi (TZ 24-bo'lim: to'liq o'zbek/rus interfeysi).
const NAV_ITEMS = [
  { key: "reports", icon: "analytics" },
  { key: "attendance", icon: "schedule" },
  { key: "employees", icon: "badge" },
  { key: "ai_chat", icon: "smart_toy" },
  { key: "camera", icon: "videocam" },
  { key: "settings", icon: "settings" },
];

let currentUser = null; // { full_name, role, role_label, permissions, language }

// =========================================================================
// TIL (i18n) — Dashboard interfeysi to'liq o'zbek va rus tilida (TZ 24-bo'lim).
// `currentUser.language` — bot_users.language bilan bir xil qiymat
// (bot.py'dagi TRANSLATIONS/t() bilan mantiqan mos, alohida tilda yozilgan).
// =========================================================================

const TRANSLATIONS = {
  uz: {
    loading: "Yuklanmoqda...",
    error_generic: "Xatolik yuz berdi.",
    telegram_only: "Bu ilova faqat Telegram ichida ochilganda ishlaydi.",
    no_sections: "Sizga ko'rsatiladigan bo'lim yo'q.",
    welcome: "Xush kelibsiz, {name}!",
    welcome_hint: "Kerakli bo'limni ochish uchun yon menyudan (☰) foydalaning.",

    nav_reports: "Hisobotlar",
    nav_attendance: "Davomat",
    nav_employees: "Xodimlar",
    nav_ai_chat: "Intizom AI",
    nav_camera: "Kamera",
    nav_settings: "Sozlamalar",
    nav_history: "Yozuvlar tarixi",

    role_manager: "Rahbar", role_deputy: "O'rinbosar", role_hr: "HR xodimi", role_admin: "Admin",

    reports_today_conversations: "Bugungi suhbatlar",
    reports_avg_score: "O'rtacha ball",
    reports_none_today: "Bugun hali suhbatlar tahlil qilinmagan.",
    pending: "kutilmoqda",
    listen: "Eshitish",
    back: "Orqaga",

    history_title: "Yozuvlar tarixi (so'nggi 31 kun)",
    history_pick_day: "Kunni tanlang.",
    history_no_conversations: "{date} uchun suhbatlar topilmadi.",
    history_daily_summary: "Kunlik umumiy hisobot",
    history_summary_line: "{count} suhbat · o'rtacha {avg} · min {min} · max {max}",
    history_summary_pending: "Kunlik umumiy hisobot hali tayyor emas (ertasi kuni 00:15da avtomatik hisoblanadi).",

    attendance_mic_on: "mikrofon yondi",
    attendance_active: "faol",
    attendance_offline: "o'chiq",
    attendance_today: "Bugun",
    attendance_month: "Shu oy",
    attendance_active_recorded: "faol {active}, yozilgan {recorded}",
    attendance_empty: "Hozircha xodimlar ro'yxati bo'sh.",
    min_short: "daq",
    hour_short: "soat",

    employees_empty: "Hozircha xodimlar ro'yxati bo'sh.",
    workstation: "darcha",

    bonus_none: "Bu oy uchun hali hisoblanadigan bonus ma'lumotlari yo'q.",
    bonus_line: "{count} suhbat · hajm {volume}% · o'rtacha {avg}",
    bonus_monthly_norm: "Oylik norma",
    bonus_norm_value: "{norm} suhbat",
    bonus_currency: "so'm",

    camera_unset: "Kamera hozircha sozlanmagan.",

    settings_bonus_max_percent: "Bonus maksimal foizi",
    settings_monthly_norm: "Oylik suhbat normasi",
    settings_show_bonuses: "Bonuslarni ko'rsatish",
    settings_language: "Til",
    settings_background: "Fon",
    theme_trust: "Ishonch",
    theme_order: "Tartib",
    theme_control: "Nazorat",

    chat_placeholder: "Xodimlar haqida so'rang...",
    chat_greeting: "Salom! Men Intizom AI'man. Xodimlaringiz haqida savol bering — masalan: \"Kim eng ko'p xato qilyapti?\" yoki \"Aliyevga qanday yordam kerak?\". Matn, ovozli xabar yoki rasm (masalan hisobot skrinshoti) yuborishingiz mumkin.",
    chat_history_loading: "Suhbat tarixi yuklanmoqda...",
    chat_image_chip: "Rasm",
    chat_audio_chip: "Ovoz",
    chat_voice_note: "Ovozli xabar",
    chat_mic_denied: "Mikrofonga ruxsat berilmadi.",
    chat_error: "Xatolik: {message}",
    aria_image: "Rasm", aria_voice: "Ovoz", aria_send: "Yuborish",
    aria_tts_toggle: "Ovozli o'qish/pauza", aria_tts_stop: "To'xtatish",

    preview_user: "Ko'rib chiqish rejimi",
    preview_banner: "🔍 Brauzer ko'rinishi — bu faqat dizaynni ko'rib chiqish uchun. Haqiqiy ma'lumotlar faqat Telegram ilovasi ichida yuklanadi.",
    data_telegram_only: "Bu bo'limdagi haqiqiy ma'lumotlar faqat Telegram ilovasi ichida yuklanadi.",
    theme_group_patterns: "Naqshli fonlar",
    theme_group_light: "Och ranglar",
    theme_group_dark: "To'q ranglar",
    color_cream: "Fil suyagi", color_sage: "Sokin yashil", color_blush: "Nafis pushti", color_sky: "Tiniq osmon",
    color_espresso: "Qahva", color_forest: "O'rmon", color_plum: "Shafaq", color_night: "Tun",
  },
  ru: {
    loading: "Загрузка...",
    error_generic: "Произошла ошибка.",
    telegram_only: "Это приложение работает только внутри Telegram.",
    no_sections: "Вам не доступен ни один раздел.",
    welcome: "Добро пожаловать, {name}!",
    welcome_hint: "Используйте боковое меню (☰), чтобы открыть нужный раздел.",

    nav_reports: "Отчёты",
    nav_attendance: "Посещаемость",
    nav_employees: "Сотрудники",
    nav_ai_chat: "Intizom AI",
    nav_camera: "Камера",
    nav_settings: "Настройки",
    nav_history: "История записей",

    role_manager: "Руководитель", role_deputy: "Заместитель", role_hr: "HR-специалист", role_admin: "Админ",

    reports_today_conversations: "Разговоры за сегодня",
    reports_avg_score: "Средний балл",
    reports_none_today: "Сегодня разговоры ещё не анализировались.",
    pending: "ожидается",
    listen: "Слушать",
    back: "Назад",

    history_title: "История записей (последние 31 день)",
    history_pick_day: "Выберите день.",
    history_no_conversations: "Разговоры за {date} не найдены.",
    history_daily_summary: "Итоговый отчёт за день",
    history_summary_line: "{count} разговоров · среднее {avg} · мин {min} · макс {max}",
    history_summary_pending: "Итоговый отчёт за день ещё не готов (формируется автоматически в 00:15 следующего дня).",

    attendance_mic_on: "микрофон включён",
    attendance_active: "активен",
    attendance_offline: "выключен",
    attendance_today: "Сегодня",
    attendance_month: "В этом месяце",
    attendance_active_recorded: "активен {active}, записано {recorded}",
    attendance_empty: "Список сотрудников пока пуст.",
    min_short: "мин",
    hour_short: "ч",

    employees_empty: "Список сотрудников пока пуст.",
    workstation: "окно",

    bonus_none: "За этот месяц пока нет данных для расчёта бонуса.",
    bonus_line: "{count} разговоров · объём {volume}% · среднее {avg}",
    bonus_monthly_norm: "Месячная норма",
    bonus_norm_value: "{norm} разговоров",
    bonus_currency: "сум",

    camera_unset: "Камера пока не настроена.",

    settings_bonus_max_percent: "Максимальный процент бонуса",
    settings_monthly_norm: "Месячная норма разговоров",
    settings_show_bonuses: "Показать бонусы",
    settings_language: "Язык",
    settings_background: "Фон",
    theme_trust: "Доверие",
    theme_order: "Порядок",
    theme_control: "Контроль",

    chat_placeholder: "Спросите о сотрудниках...",
    chat_greeting: "Здравствуйте! Я Intizom AI. Задайте вопрос о своих сотрудниках — например: \"Кто чаще всего ошибается?\" или \"Какая помощь нужна Алиеву?\". Можно отправить текст, голосовое сообщение или изображение (например скриншот отчёта).",
    chat_history_loading: "Загрузка истории переписки...",
    chat_image_chip: "Фото",
    chat_audio_chip: "Голос",
    chat_voice_note: "Голосовое сообщение",
    chat_mic_denied: "Доступ к микрофону не предоставлен.",
    chat_error: "Ошибка: {message}",
    aria_image: "Фото", aria_voice: "Голос", aria_send: "Отправить",
    aria_tts_toggle: "Озвучить/пауза", aria_tts_stop: "Остановить",

    preview_user: "Режим просмотра",
    preview_banner: "🔍 Просмотр в браузере — только для оценки дизайна. Реальные данные загружаются лишь внутри приложения Telegram.",
    data_telegram_only: "Реальные данные этого раздела загружаются только внутри приложения Telegram.",
    theme_group_patterns: "Узорные фоны",
    theme_group_light: "Светлые цвета",
    theme_group_dark: "Тёмные цвета",
    color_cream: "Слоновая кость", color_sage: "Спокойный зелёный", color_blush: "Нежный розовый", color_sky: "Ясное небо",
    color_espresso: "Кофе", color_forest: "Лес", color_plum: "Сумерки", color_night: "Ночь",
  },
};

function t(key, vars) {
  const lang = (currentUser && currentUser.language === "ru") ? "ru" : "uz";
  let text = (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.uz[key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{${k}}`, v);
    }
  }
  return text;
}

function applyTelegramTheme() {
  if (!tg) return;
  tg.ready();
  tg.expand();
  document.documentElement.setAttribute("data-theme", tg.colorScheme || "light");
  const root = document.documentElement.style;
  const p = tg.themeParams || {};
  const map = {
    bg_color: "--tg-theme-bg-color",
    secondary_bg_color: "--tg-theme-secondary-bg-color",
    text_color: "--tg-theme-text-color",
    hint_color: "--tg-theme-hint-color",
    link_color: "--tg-theme-link-color",
    button_color: "--tg-theme-button-color",
    button_text_color: "--tg-theme-button-text-color",
  };
  for (const [key, cssVar] of Object.entries(map)) {
    if (p[key]) root.setProperty(cssVar, p[key]);
  }
}

// ---- Fon temasi (TZ 25-bo'lim) — Telegram CloudStorage orqali saqlanadi,
// qurilma almashtirilsa ham tanlov saqlanib qoladi. Mini App tashqarisida
// (oddiy brauzerda) ochilsa, localStorage'ga tushadi (faqat sinov uchun).
const BG_THEME_KEY = "dashboard_background_theme";
const PATTERN_BG_THEMES = ["theme-trust", "theme-order", "theme-control"];
const LIGHT_BG_COLORS = ["color-cream", "color-sage", "color-blush", "color-sky"];
const DARK_BG_COLORS = ["color-espresso", "color-forest", "color-plum", "color-night"];
const VALID_BG_THEMES = [...PATTERN_BG_THEMES, ...LIGHT_BG_COLORS, ...DARK_BG_COLORS];

function cloudStorageGet(key) {
  return new Promise((resolve) => {
    try {
      if (tg?.CloudStorage && !isPreviewMode()) {
        tg.CloudStorage.getItem(key, (err, value) => resolve(!err && value ? value : null));
        return;
      }
    } catch (e) {
      // brauzerda/Telegram tashqarisida CloudStorage kutilmagan xato bersa
      // ham, sahifa ishlashda davom etishi kerak (localStorage'ga tushamiz).
    }
    resolve(localStorage.getItem(key));
  });
}

function cloudStorageSet(key, value) {
  try {
    if (tg?.CloudStorage && !isPreviewMode()) {
      tg.CloudStorage.setItem(key, value);
      return;
    }
  } catch (e) {
    // xuddi shu — yiqilib qolmaslik uchun localStorage'ga tushamiz.
  }
  localStorage.setItem(key, value);
}

function applyBgTheme(theme) {
  if (VALID_BG_THEMES.includes(theme)) {
    document.documentElement.setAttribute("data-bg-theme", theme);
  } else {
    document.documentElement.removeAttribute("data-bg-theme");
  }
}

async function loadSavedBgTheme() {
  applyBgTheme(await cloudStorageGet(BG_THEME_KEY));
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function formatTime(isoString) {
  const locale = (currentUser && currentUser.language === "ru") ? "ru-RU" : "uz-UZ";
  return new Date(isoString).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

function formatMinutes(mins) {
  const m = Math.round(mins || 0);
  if (m < 60) return `${m} ${t("min_short")}`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return `${h} ${t("hour_short")} ${rem} ${t("min_short")}`;
}

function scoreBadgeClass(score) {
  if (score === null || score === undefined) return "pending";
  if (score >= 85) return "good";
  if (score >= 60) return "mid";
  return "bad";
}

function scoreEmoji(score) {
  if (score === null || score === undefined) return "⏳";
  if (score >= 85) return "🟢";
  if (score >= 60) return "🟡";
  return "🔴";
}

async function callApi(action, extra = {}) {
  if (!tg || !tg.initData) {
    throw new Error(t("telegram_only"));
  }
  const res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "apikey": SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ initData: tg.initData, action, ...extra }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || t("error_generic"));
  return data;
}

function setView(html) {
  document.getElementById("view").innerHTML = html;
}

function stateMessage(text, isError = false) {
  setView(`<div class="state-message${isError ? " error" : ""}">${escapeHtml(text)}</div>`);
}

// ---- Ekranlar (views) ------------------------------------------------

function conversationListHtml(conversations) {
  return `<ul class="item-list">${conversations.map((c) => `
    <li class="item-card" data-conversation-id="${c.id}">
      <span class="emoji">${scoreEmoji(c.score)}</span>
      <span class="info">
        <div class="title">${escapeHtml(c.employee_name)}</div>
        <div class="subtitle">${formatTime(c.created_at)}</div>
        <div class="audio-slot"></div>
      </span>
      <span class="badge ${scoreBadgeClass(c.score)}">
        ${c.score !== null ? c.score + "/100" : t("pending")}
      </span>
      ${c.has_audio ? `<button class="listen-btn" aria-label="${t("listen")}"><span class="material-symbols-outlined">play_circle</span></button>` : ""}
    </li>
  `).join("")}</ul>`;
}

function wireListenButtons() {
  document.querySelectorAll(".listen-btn").forEach((btn) => {
    btn.addEventListener("click", () => playAudioFor(btn));
  });
}

async function viewReports() {
  stateMessage(t("loading"));
  const { conversations } = await callApi("reports");

  const total = conversations.length;
  const scored = conversations.filter((c) => c.score !== null);
  const avg = scored.length
    ? Math.round(scored.reduce((s, c) => s + c.score, 0) / scored.length)
    : null;

  const statGrid = `
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-label">${t("reports_today_conversations")}</div>
        <div class="stat-value">${total}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">${t("reports_avg_score")}</div>
        <div class="stat-value">${avg !== null ? avg : "—"}</div>
      </div>
    </div>
  `;

  if (!total) {
    setView(statGrid + `<div class="state-message">${t("reports_none_today")}</div>`);
    return;
  }

  setView(statGrid + conversationListHtml(conversations));
  wireListenButtons();
}

async function playAudioFor(btn) {
  const card = btn.closest(".item-card");
  const conversationId = card.dataset.conversationId;
  const slot = card.querySelector(".audio-slot");

  btn.disabled = true;
  btn.innerHTML = '<span class="material-symbols-outlined">hourglass_top</span>';
  try {
    const { url } = await callApi("audio_url", { conversation_id: conversationId });
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.autoplay = true;
    audio.src = url;
    audio.className = "audio-player";
    slot.appendChild(audio);
    btn.remove();
  } catch (e) {
    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined">error</span>';
  }
}

// ---- Yozuvlar tarixi (31 kunlik kalendar) ------------------------------

function last31Dates() {
  const dates = [];
  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d);
  }
  return dates;
}

function toDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function viewHistory() {
  const dates = last31Dates();
  const todayKey = toDateKey(new Date());

  setView(`
    <div class="view-header">
      <h3 class="section-title">${t("history_title")}</h3>
      <button id="history-back-btn" class="icon-btn" aria-label="${t("back")}">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
    </div>
    <div class="calendar-grid">
      ${dates.map((d) => {
        const key = toDateKey(d);
        const isToday = key === todayKey;
        return `<button class="calendar-day${isToday ? " today" : ""}" data-date="${key}">${d.getDate()}</button>`;
      }).join("")}
    </div>
    <div id="history-day-slot">
      <div class="state-message">${t("history_pick_day")}</div>
    </div>
  `);

  document.getElementById("history-back-btn").addEventListener("click", () => navigateTo("reports"));

  document.querySelectorAll(".calendar-day").forEach((btn) => {
    btn.addEventListener("click", async () => {
      document.querySelectorAll(".calendar-day").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      await loadHistoryDay(btn.dataset.date);
    });
  });
}

async function loadHistoryDay(dateKey) {
  const slot = document.getElementById("history-day-slot");
  slot.innerHTML = `<div class="state-message">${t("loading")}</div>`;
  try {
    const { conversations, summary } = await callApi("history_day", { date: dateKey });

    if (!conversations.length) {
      slot.innerHTML = `<div class="state-message">${escapeHtml(t("history_no_conversations", { date: dateKey }))}</div>`;
      return;
    }

    const summaryHtml = summary.length ? `
      <h4 class="section-title">${t("history_daily_summary")}</h4>
      <ul class="item-list">
        ${summary.map((s) => `
          <li class="item-card">
            <span class="emoji">${scoreEmoji(s.avg_score)}</span>
            <span class="info">
              <div class="title">${escapeHtml(s.employee_name)}</div>
              <div class="subtitle">${escapeHtml(t("history_summary_line", {
                count: s.conversations_count,
                avg: s.avg_score ?? "—",
                min: s.min_score ?? "—",
                max: s.max_score ?? "—",
              }))}</div>
            </span>
          </li>
        `).join("")}
      </ul>
    ` : `<div class="state-message">${t("history_summary_pending")}</div>`;

    slot.innerHTML = conversationListHtml(conversations) + summaryHtml;
    wireListenButtons();
  } catch (e) {
    slot.innerHTML = `<div class="state-message error">${escapeHtml(e.message)}</div>`;
  }
}

async function viewAttendance() {
  // TZ 22-bo'lim: har bir xodim uchun mikrofon holati (recorder.py
  // heartbeat orqali) + bugungi va shu oylik faol/yozilgan daqiqalar.
  stateMessage(t("loading"));
  const { rows } = await callApi("attendance");

  if (!rows.length) {
    stateMessage(t("attendance_empty"));
    return;
  }

  const items = rows.map((r) => `
    <li class="item-card attendance-card">
      <span class="emoji">${r.is_online ? "🟢" : "🔴"}</span>
      <span class="info">
        <div class="title">${escapeHtml(r.full_name)}</div>
        <div class="subtitle">
          ${escapeHtml(r.microphone_id || "-")} ·
          ${t("attendance_mic_on")}: ${r.session_start ? formatTime(r.session_start) : "—"} ·
          ${r.is_online ? t("attendance_active") : t("attendance_offline")}
        </div>
        <div class="attendance-stats">
          <span><b>${t("attendance_today")}:</b> ${escapeHtml(t("attendance_active_recorded", {
            active: formatMinutes(r.today_active_minutes),
            recorded: formatMinutes(r.today_recorded_minutes),
          }))}</span>
          <span><b>${t("attendance_month")}:</b> ${escapeHtml(t("attendance_active_recorded", {
            active: formatMinutes(r.month_active_minutes),
            recorded: formatMinutes(r.month_recorded_minutes),
          }))}</span>
        </div>
      </span>
    </li>
  `).join("");

  setView(`<ul class="item-list">${items}</ul>`);
}

async function viewEmployees() {
  stateMessage(t("loading"));
  const { employees } = await callApi("employees");
  if (!employees.length) {
    stateMessage(t("employees_empty"));
    return;
  }
  const items = employees.map((e) => `
    <li class="item-card">
      <span class="emoji">👤</span>
      <span class="info">
        <div class="title">${escapeHtml(e.full_name)}</div>
        <div class="subtitle">${escapeHtml(e.position || "-")} · ${t("workstation")} ${escapeHtml(e.workstation_number || "-")}</div>
      </span>
      <span class="badge neutral">${escapeHtml(e.microphone_id || "-")}</span>
    </li>
  `).join("");
  setView(`<ul class="item-list">${items}</ul>`);
}

function bonusListHtml(bonuses, conversationsNorm) {
  if (!bonuses.length) {
    return `<div class="state-message">${t("bonus_none")}</div>`;
  }
  const items = bonuses.map((b) => `
    <li class="item-card">
      <span class="emoji">${scoreEmoji(b.avg_score)}</span>
      <span class="info">
        <div class="title">${escapeHtml(b.full_name)}</div>
        <div class="subtitle">${escapeHtml(t("bonus_line", { count: b.conv_count, volume: (b.volume_coef * 100).toFixed(0), avg: b.avg_score }))}</div>
      </span>
      <span class="badge neutral">
        ${b.bonus_amount !== null ? Math.round(b.bonus_amount).toLocaleString("uz-UZ") + " " + t("bonus_currency") : "—"}
      </span>
    </li>
  `).join("");
  return `
    <div class="settings-row"><span class="label">${t("bonus_monthly_norm")}</span><span class="value">${escapeHtml(t("bonus_norm_value", { norm: conversationsNorm }))}</span></div>
    <ul class="item-list" style="margin-top:12px">${items}</ul>
  `;
}

async function viewCamera() {
  stateMessage(t("loading"));
  const data = await callApi("camera");
  stateMessage(data.message || t("camera_unset"));
}

function settingsToggleRowHtml(rowId, iconBtnId, label, slotId, slotContentHtml) {
  // "Hisobotlar" yon menyu qatoridagi kabi: label yonida kichik ☰
  // (uch chiziq) tugmasi, bosilganda pastdagi bo'lim ochiladi/yopiladi.
  return `
    <div class="settings-toggle-row">
      <span class="settings-toggle-label">${label}</span>
      <button id="${iconBtnId}" class="icon-btn" aria-label="${label}">
        <span class="material-symbols-outlined">menu</span>
      </button>
    </div>
    <div id="${slotId}" class="hidden">${slotContentHtml}</div>
  `;
}

function themeSwatchButtonsHtml(keys, activeBgTheme) {
  return keys.map((key) => {
    // "color-cream" -> "cream", "theme-trust" -> "trust" (CSS klass va tarjima kaliti uchun)
    const short = key.replace(/^(color|theme)-/, "");
    const labelKey = key.startsWith("color-") ? `color_${short}` : `theme_${short}`;
    return `<button class="theme-swatch swatch-${short}${activeBgTheme === key ? " selected" : ""}" data-theme="${key}">${t(labelKey)}</button>`;
  }).join("");
}

async function viewSettings() {
  stateMessage(t("loading"));

  // Preview rejimida (Telegram tashqarisida) haqiqiy sozlamalarni
  // yuklab bo'lmaydi — lekin bu Til/Fon tanlovini ko'rsatishga to'sqinlik
  // qilmasin (ular backend ma'lumotiga muhtoj emas).
  let s = null;
  try {
    s = await callApi("settings");
  } catch (e) {
    if (!isPreviewMode()) { stateMessage(e.message, true); return; }
  }

  const canSeeBonuses = currentUser.permissions.includes("bonuses");
  const activeBgTheme = document.documentElement.getAttribute("data-bg-theme");

  setView(`
    ${s ? `
      <div class="settings-row">
        <span class="label">${t("settings_bonus_max_percent")}</span>
        <span class="value">${(s.bonus_max_percent * 100).toFixed(0)}%</span>
      </div>
      <div class="settings-row">
        <span class="label">${t("settings_monthly_norm")}</span>
        <span class="value">${escapeHtml(t("bonus_norm_value", { norm: s.monthly_conversation_norm }))}</span>
      </div>
    ` : `<div class="state-message">${t("data_telegram_only")}</div>`}
    ${canSeeBonuses ? settingsToggleRowHtml(
      "bonuses-row", "toggle-bonuses-btn", t("settings_show_bonuses"), "bonuses-slot", ""
    ) : ""}
    ${settingsToggleRowHtml("language-row", "toggle-language-btn", t("settings_language"), "language-slot", `
      <div class="lang-btn-row">
        <button class="lang-option${(currentUser.language || "uz") === "uz" ? " selected" : ""}" data-lang="uz">🇺🇿 O'zbekcha</button>
        <button class="lang-option${currentUser.language === "ru" ? " selected" : ""}" data-lang="ru">🇷🇺 Русский</button>
      </div>
    `)}
    ${settingsToggleRowHtml("background-row", "toggle-background-btn", t("settings_background"), "background-slot", `
      <div class="theme-group-label">${t("theme_group_light")}</div>
      <div class="theme-swatch-grid">${themeSwatchButtonsHtml(LIGHT_BG_COLORS, activeBgTheme)}</div>
      <div class="theme-group-label">${t("theme_group_dark")}</div>
      <div class="theme-swatch-grid">${themeSwatchButtonsHtml(DARK_BG_COLORS, activeBgTheme)}</div>
      <div class="theme-group-label">${t("theme_group_patterns")}</div>
      <div class="theme-swatch-grid">${themeSwatchButtonsHtml(PATTERN_BG_THEMES, activeBgTheme)}</div>
    `)}
  `);

  const wireToggleSlot = (btnId, slotId) => {
    const toggleBtn = document.getElementById(btnId);
    const slot = document.getElementById(slotId);
    if (!toggleBtn || !slot) return;
    toggleBtn.addEventListener("click", () => slot.classList.toggle("hidden"));
  };
  wireToggleSlot("toggle-language-btn", "language-slot");
  wireToggleSlot("toggle-background-btn", "background-slot");

  document.querySelectorAll(".lang-option").forEach((langBtn) => {
    langBtn.addEventListener("click", async () => {
      const lang = langBtn.dataset.lang;
      if (lang === (currentUser.language || "uz")) return;
      langBtn.disabled = true;
      try {
        // Preview rejimida (Telegram tashqarisida) haqiqiy bot_users
        // yozuvi yo'q — shuning uchun serverga saqlashga urinmasdan,
        // faqat mahalliy (shu sessiya uchun) qo'llanadi.
        if (!isPreviewMode()) {
          await callApi("set_language", { language: lang });
        }
        currentUser.language = lang;
        refreshUiTexts();
        await viewSettings(); // butun bo'limni yangi tilda qayta chizadi
        document.getElementById("language-slot")?.classList.remove("hidden");
      } catch (e) {
        alert(e.message);
        langBtn.disabled = false;
      }
    });
  });

  document.querySelectorAll(".theme-swatch").forEach((swatchBtn) => {
    swatchBtn.addEventListener("click", () => {
      const theme = swatchBtn.dataset.theme;
      applyBgTheme(theme);
      cloudStorageSet(BG_THEME_KEY, theme);
      document.querySelectorAll(".theme-swatch").forEach((b) => b.classList.toggle("selected", b === swatchBtn));
    });
  });

  if (canSeeBonuses) {
    const btn = document.getElementById("toggle-bonuses-btn");
    const slot = document.getElementById("bonuses-slot");
    let loaded = false;
    btn.addEventListener("click", async () => {
      const willShow = slot.classList.contains("hidden");
      slot.classList.toggle("hidden", !willShow);
      if (!willShow || loaded) return;
      btn.disabled = true;
      slot.innerHTML = `<div class="state-message">${t("loading")}</div>`;
      try {
        const { bonuses, conversations_norm } = await callApi("bonuses");
        slot.innerHTML = bonusListHtml(bonuses, conversations_norm);
        loaded = true;
      } catch (e) {
        slot.innerHTML = `<div class="state-message error">${escapeHtml(e.message)}</div>`;
      }
      btn.disabled = false;
    });
  }
}

// ---- Intizom AI (matn/ovoz/rasm suhbati) — TZ 12-bo'lim ----------------

let aiChatMessages = []; // { role: 'user'|'assistant', text, imagePreview?, audioNote? }
let aiChatHistoryLoaded = false;

function chatBubbleHtml(msg, index) {
  const cls = msg.role === "user" ? "chat-bubble user" : "chat-bubble assistant";
  let media = "";
  if (msg.imagePreview) media += `<img src="${msg.imagePreview}" class="chat-image" alt="rasm" />`;
  if (msg.audioNote) media += `<div class="chat-audio-note"><span class="material-symbols-outlined">mic</span>${t("chat_voice_note")}</div>`;
  const textHtml = msg.text ? `<div class="chat-text">${escapeHtml(msg.text)}</div>` : "";
  // "so'ralganda ovozli javob" — AI xabarlariga 🔊 tugma, matnni ovozga
  // aylantirib eshittiradi (avtomatik emas, faqat bosilganda). Tugma
  // o'zi play/pauza almashtiradi; "to'xtatish" tugmasi faqat o'ynalayotgan
  // paytda ko'rinadi (boshida "hidden").
  const ttsControls = msg.role === "assistant" && msg.text && !msg.pending
    ? `<div class="chat-tts-row">
         <button class="chat-speak-btn" data-index="${index}" aria-label="${t("aria_tts_toggle")}">
           <span class="material-symbols-outlined">volume_up</span>
         </button>
         <button class="chat-stop-btn hidden" data-index="${index}" aria-label="${t("aria_tts_stop")}">
           <span class="material-symbols-outlined">stop</span>
         </button>
       </div>`
    : "";
  return `<div class="${cls}">${media}${textHtml}${ttsControls}</div>`;
}

function fileOrBlobToDataUrl(fileOrBlob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(fileOrBlob);
  });
}

async function viewAiChat() {
  setView(`
    <div class="chat-container">
      <div class="chat-messages" id="chat-messages"></div>
      <div id="chat-pending-row" class="chat-pending-row hidden"></div>
      <div class="chat-input-row">
        <input type="file" id="chat-image-input" accept="image/*" class="hidden" />
        <button id="chat-image-btn" class="icon-btn" aria-label="${t("aria_image")}">
          <span class="material-symbols-outlined">image</span>
        </button>
        <input type="text" id="chat-text-input" placeholder="${escapeHtml(t("chat_placeholder"))}" autocomplete="off" />
        <button id="chat-mic-btn" class="icon-btn" aria-label="${t("aria_voice")}">
          <span class="material-symbols-outlined">mic</span>
        </button>
        <button id="chat-send-btn" class="send-btn" aria-label="${t("aria_send")}">
          <span class="material-symbols-outlined">send</span>
        </button>
      </div>
    </div>
  `);

  const messagesEl = document.getElementById("chat-messages");

  if (!aiChatHistoryLoaded) {
    messagesEl.innerHTML = `<div class="state-message">${t("chat_history_loading")}</div>`;
    try {
      const { messages } = await callApi("ai_chat_history");
      aiChatMessages = messages.map((m) => ({ role: m.role, text: m.text }));
    } catch (e) {
      // Tarix yuklanmasa ham, yangi suhbatni boshlashga xalaqit bermaydi.
    }
    aiChatHistoryLoaded = true;
  }

  if (!aiChatMessages.length) {
    // ESLATMA: "local: true" — bu xabarni AI aslida aytmagan (mahalliy,
    // qattiq yozilgan salomlashish), shuning uchun Gemini'ga tarix
    // sifatida yuborilmaydi (sendChatMessage'dagi filterga qarang).
    // Aks holda Gemini API "birinchi xabar 'user' rolida bo'lishi kerak"
    // qoidasini buzib, xato qaytarishi mumkin edi.
    aiChatMessages.push({
      role: "assistant",
      local: true,
      text: t("chat_greeting"),
    });
  }

  const textInput = document.getElementById("chat-text-input");
  const sendBtn = document.getElementById("chat-send-btn");
  const micBtn = document.getElementById("chat-mic-btn");
  const imageBtn = document.getElementById("chat-image-btn");
  const imageInput = document.getElementById("chat-image-input");
  const pendingRow = document.getElementById("chat-pending-row");

  let pendingImage = null; // { base64, mime, previewUrl }
  let pendingAudio = null; // { base64, mime }
  let mediaRecorder = null;
  let recordedChunks = [];
  let isRecording = false;

  function renderMessages() {
    messagesEl.innerHTML = aiChatMessages.map((m, i) => chatBubbleHtml(m, i)).join("");
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // Bir vaqtning o'zida faqat bitta AI ovozli javobi o'ynaydi. Foydalanuvchi
  // tugmani qayta bossa — pauza/davom ettirish; alohida "to'xtatish"
  // tugmasi butunlay to'xtatib, boshiga qaytaradi.
  let currentTts = { audio: null, index: null };

  function ttsButtons(index) {
    return {
      play: messagesEl.querySelector(`.chat-speak-btn[data-index="${index}"]`),
      stop: messagesEl.querySelector(`.chat-stop-btn[data-index="${index}"]`),
    };
  }

  function setPlayIcon(index, iconName) {
    const { play } = ttsButtons(index);
    if (play) play.innerHTML = `<span class="material-symbols-outlined">${iconName}</span>`;
  }

  function stopCurrentTts() {
    if (currentTts.audio) {
      currentTts.audio.pause();
      currentTts.audio.currentTime = 0;
    }
    if (currentTts.index !== null) {
      setPlayIcon(currentTts.index, "volume_up");
      const { stop } = ttsButtons(currentTts.index);
      if (stop) stop.classList.add("hidden");
    }
    currentTts = { audio: null, index: null };
  }

  async function playAudioData(index, base64, mime, isAutoplay = false) {
    stopCurrentTts();
    try {
      const audio = new Audio(`data:${mime};base64,${base64}`);
      currentTts = { audio, index };
      audio.onended = () => stopCurrentTts();
      audio.onerror = () => stopCurrentTts();
      await audio.play();
      setPlayIcon(index, "pause");
      const { stop, play } = ttsButtons(index);
      if (stop) stop.classList.remove("hidden");
      if (play) play.classList.remove("tts-ready-pulse");
    } catch (e) {
      // Ba'zi brauzerlar/WebView'lar avtomatik ijroni bloklaydi (odatda
      // iOS'da). Audio obyektini currentTts'da saqlab qolamiz — keyingi
      // bosishda (haqiqiy foydalanuvchi bosishi bilan) muvaffaqiyatli
      // ijro etiladi. Buni sezilarli qilish uchun tugmani "yonib turadigan"
      // holatga o'tkazamiz — aks holda ovoz kelgani sezilmasdan qolardi
      // (aynan shu muammo xabar qilingan edi).
      setPlayIcon(index, "volume_up");
      if (isAutoplay) {
        const { play } = ttsButtons(index);
        if (play) play.classList.add("tts-ready-pulse");
      }
    }
  }

  async function toggleTts(index) {
    const msg = aiChatMessages[index];
    if (!msg || !msg.text) return;

    // Xuddi shu xabar allaqachon yuklangan bo'lsa (pauzada ham) — qayta
    // so'ramasdan play/pauza almashtiramiz.
    if (currentTts.index === index && currentTts.audio) {
      if (currentTts.audio.paused) {
        currentTts.audio.play();
        setPlayIcon(index, "pause");
      } else {
        currentTts.audio.pause();
        setPlayIcon(index, "play_arrow");
      }
      return;
    }

    // Agar bu xabar uchun ovoz allaqachon serverdan kelgan bo'lsa (ovozli
    // xabarga avtomatik ovozli javob), qayta so'ramasdan shuni ishlatamiz.
    if (msg.autoAudio) {
      playAudioData(index, msg.autoAudio.base64, msg.autoAudio.mime);
      return;
    }

    setPlayIcon(index, "hourglass_top");
    try {
      const { audio_base64, mime } = await callApi("tts", { text: msg.text });
      await playAudioData(index, audio_base64, mime);
    } catch (e) {
      setPlayIcon(index, "volume_up");
    }
  }

  // Xabarlar har safar qayta chizilgani uchun, tugmalarga alohida emas,
  // konteynerning o'ziga (delegation) bitta marta ulash yetarli.
  messagesEl.addEventListener("click", (e) => {
    const playBtn = e.target.closest(".chat-speak-btn");
    if (playBtn) {
      toggleTts(Number(playBtn.dataset.index));
      return;
    }
    const stopBtn = e.target.closest(".chat-stop-btn");
    if (stopBtn) {
      stopCurrentTts();
    }
  });

  function renderPending() {
    const chips = [];
    if (pendingImage) chips.push(`<span class="chat-chip">🖼️ ${t("chat_image_chip")} <button type="button" data-clear="image">✕</button></span>`);
    if (pendingAudio) chips.push(`<span class="chat-chip">🎤 ${t("chat_audio_chip")} <button type="button" data-clear="audio">✕</button></span>`);
    pendingRow.innerHTML = chips.join("");
    pendingRow.classList.toggle("hidden", chips.length === 0);
    pendingRow.querySelectorAll("button[data-clear]").forEach((b) => {
      b.addEventListener("click", () => {
        if (b.dataset.clear === "image") pendingImage = null;
        if (b.dataset.clear === "audio") pendingAudio = null;
        renderPending();
      });
    });
  }

  imageBtn.addEventListener("click", () => imageInput.click());
  imageInput.addEventListener("change", async () => {
    const file = imageInput.files[0];
    imageInput.value = "";
    if (!file) return;
    const dataUrl = await fileOrBlobToDataUrl(file);
    pendingImage = { base64: dataUrl.split(",")[1], mime: file.type, previewUrl: dataUrl };
    renderPending();
  });

  // Gemini rasman qo'llab-quvvatlaydigan audio formatlariga (wav/mp3/ogg/
  // aac/flac) yaqinroq variantni tanlaymiz — ba'zi WebView'lar standart
  // "audio/webm" formatini beradi, bu Gemini'da har doim ham to'g'ri
  // tushunilmasligi mumkin edi (topilgan muammo).
  const PREFERRED_MIME_TYPES = ["audio/ogg;codecs=opus", "audio/ogg", "audio/mp4", "audio/webm"];
  function pickRecorderMimeType() {
    for (const type of PREFERRED_MIME_TYPES) {
      if (window.MediaRecorder?.isTypeSupported?.(type)) return type;
    }
    return undefined; // brauzerning standart formati
  }

  micBtn.addEventListener("click", async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType = pickRecorderMimeType();
        mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        recordedChunks = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunks.push(e.data);
        };
        mediaRecorder.start();
        isRecording = true;
        micBtn.classList.add("recording");
      } catch (e) {
        stateMessageInChat(t("chat_mic_denied"));
      }
      return;
    }

    isRecording = false;
    micBtn.classList.remove("recording");
    const stoppedPromise = new Promise((resolve) => { mediaRecorder.onstop = resolve; });
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach((t) => t.stop());
    await stoppedPromise;

    const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || "audio/webm" });
    const dataUrl = await fileOrBlobToDataUrl(blob);
    pendingAudio = { base64: dataUrl.split(",")[1], mime: blob.type || "audio/webm" };
    renderPending();
  });

  function stateMessageInChat(text) {
    aiChatMessages.push({ role: "assistant", text });
    renderMessages();
  }

  async function sendChatMessage() {
    const text = textInput.value.trim();
    if (!text && !pendingImage && !pendingAudio) return;

    const historyForApi = aiChatMessages
      .filter((m) => !m.pending && !m.local)
      .map((m) => ({ role: m.role, text: m.text }));

    const userMsg = { role: "user", text };
    if (pendingImage) userMsg.imagePreview = pendingImage.previewUrl;
    if (pendingAudio) userMsg.audioNote = true;
    aiChatMessages.push(userMsg);

    const payload = { message: text, history: historyForApi };
    if (pendingImage) {
      payload.image_base64 = pendingImage.base64;
      payload.image_mime = pendingImage.mime;
    }
    if (pendingAudio) {
      payload.audio_base64 = pendingAudio.base64;
      payload.audio_mime = pendingAudio.mime;
    }

    textInput.value = "";
    pendingImage = null;
    pendingAudio = null;
    renderPending();

    aiChatMessages.push({ role: "assistant", text: "…", pending: true });
    renderMessages();
    sendBtn.disabled = true;

    const wasVoiceRequest = !!payload.audio_base64;
    let playAfterRender = null;

    try {
      const { reply, reply_audio_base64, reply_audio_mime } = await callApi("ai_chat", payload);
      const assistantMsg = { role: "assistant", text: reply };
      if (reply_audio_base64) {
        assistantMsg.autoAudio = { base64: reply_audio_base64, mime: reply_audio_mime };
      }
      aiChatMessages[aiChatMessages.length - 1] = assistantMsg;
      // "Ovozli xabar so'ralganda ovozli fayl kelsin" — foydalanuvchi
      // ovozli xabar yuborgan bo'lsa, javobni avtomatik ijro etamiz
      // (tugma bosishini kutmasdan).
      if (wasVoiceRequest && reply_audio_base64) {
        playAfterRender = () => playAudioData(aiChatMessages.length - 1, reply_audio_base64, reply_audio_mime, true);
      }
    } catch (e) {
      aiChatMessages[aiChatMessages.length - 1] = { role: "assistant", text: t("chat_error", { message: e.message }) };
    }
    sendBtn.disabled = false;
    renderMessages();
    if (playAfterRender) playAfterRender();
  }

  sendBtn.addEventListener("click", sendChatMessage);
  textInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendChatMessage();
  });

  renderMessages();
  renderPending();
}

const VIEWS = {
  reports: viewReports,
  history: viewHistory,
  attendance: viewAttendance,
  employees: viewEmployees,
  ai_chat: viewAiChat,
  camera: viewCamera,
  settings: viewSettings,
};

// ---- Yon panel (sidebar) / navigatsiya ---------------------------------

const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const menuBtn = document.getElementById("menu-btn");
const sidebarClose = document.getElementById("sidebar-close");
const profileBtn = document.getElementById("profile-btn");
const profileDropdown = document.getElementById("profile-dropdown");

function openSidebar() {
  sidebarOverlay.classList.remove("hidden");
  requestAnimationFrame(() => sidebarOverlay.classList.add("visible"));
  sidebar.classList.add("open");
}

function closeSidebar() {
  sidebarOverlay.classList.remove("visible");
  sidebar.classList.remove("open");
  setTimeout(() => sidebarOverlay.classList.add("hidden"), 250);
}

menuBtn.addEventListener("click", openSidebar);
sidebarClose.addEventListener("click", closeSidebar);
sidebarOverlay.addEventListener("click", closeSidebar);

profileBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  profileDropdown.classList.toggle("hidden");
});
document.addEventListener("click", (e) => {
  if (!profileDropdown.contains(e.target) && e.target !== profileBtn) {
    profileDropdown.classList.add("hidden");
  }
});

function renderSidebarNav() {
  const nav = document.getElementById("sidebar-nav");
  const allowed = NAV_ITEMS.filter((item) => currentUser.permissions.includes(item.key));
  nav.innerHTML = allowed.map((item) => {
    const mainBtn = `
      <button data-key="${item.key}" class="sidebar-nav-btn">
        <span class="material-symbols-outlined">${item.icon}</span>
        <span>${t("nav_" + item.key)}</span>
      </button>
    `;
    if (item.key !== "reports") return mainBtn;
    // "Yozuvlar tarixi" — Hisobotlar qatori YONIDA (dashboard ichida emas,
    // aynan shu yon menyu qatorida) alohida uchta-chiziq tugmasi.
    return `
      <div class="sidebar-nav-row">
        ${mainBtn}
        <button id="sidebar-history-btn" class="icon-btn" aria-label="${t("nav_history")}">
          <span class="material-symbols-outlined">menu</span>
        </button>
      </div>
    `;
  }).join("");

  nav.querySelectorAll("button[data-key]").forEach((btn) => {
    btn.addEventListener("click", () => {
      navigateTo(btn.dataset.key);
      closeSidebar();
    });
  });

  const historyBtn = document.getElementById("sidebar-history-btn");
  if (historyBtn) {
    historyBtn.addEventListener("click", () => {
      navigateTo("history");
      closeSidebar();
    });
  }

  return allowed;
}

function setActiveNav(key) {
  document.querySelectorAll("#sidebar-nav button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.key === key);
  });
}

// "Dashboardning asosiy qismida ma'lumot bo'lmasin, keyinchalik reklama
// joylashtirish uchun bo'sh qolsin" (rahbar so'rovi) — shuning uchun
// ilova ochilganda avtomatik ravishda "Hisobotlar" emas, shu bo'sh sahifa
// ko'rsatiladi. Statistikaning o'zi yo'qolmaydi — sidebar'dan
// "Hisobotlar"ni bosib istalgan vaqt ko'rish mumkin.
function renderHomeView() {
  setActiveNav(null);
  document.getElementById("view").innerHTML = `
    <div class="home-view">
      <h2>${escapeHtml(t("welcome", { name: currentUser.full_name }))}</h2>
      <p>${t("welcome_hint")}</p>
      <div class="home-ad-slot" aria-hidden="true"></div>
    </div>
  `;
}

// Til almashtirilganda sarlavha/sidebar/dropdown matnlarini darhol yangi
// tilda ko'rsatish uchun (TZ 24-bo'lim).
function refreshUiTexts() {
  if (!currentUser) return [];
  const roleLabel = t("role_" + currentUser.role);
  document.getElementById("sidebar-whoami").textContent = `${currentUser.full_name} (${roleLabel})`;
  document.getElementById("dropdown-name").textContent = currentUser.full_name;
  document.getElementById("dropdown-role").textContent = roleLabel;
  const allowed = renderSidebarNav();
  setActiveNav(location.hash.replace("#", ""));
  return allowed;
}

async function navigateTo(key) {
  location.hash = key;
  setActiveNav(key);
  try {
    await VIEWS[key]();
  } catch (e) {
    stateMessage(e.message, true);
  }
}

// Telegram tashqarisida (oddiy brauzerda) ochilganda — haqiqiy autentifikatsiya
// (initData) mavjud emas, shuning uchun HAQIQIY ma'lumot yuklab bo'lmaydi.
// Lekin bu — dizayn/joylashuvni (jumladan Fon/Til tanlovini) ko'rib chiqish
// uchun butunlay ishlamay qolishga arzimaydi: shunday holatda ko'rib chiqish
// (preview) rejimi yoqiladi — barcha sahifalar navigatsiyasi ishlaydi, lekin
// haqiqiy ma'lumot kerak bo'lgan joyларda soxta raqamlar EMAS, balki ochiq
// "bu yerda haqiqiy ma'lumot faqat Telegram ichida yuklanadi" xabari chiqadi.
function isPreviewMode() {
  return !tg || !tg.initData;
}

async function init() {
  applyTelegramTheme();
  loadSavedBgTheme();

  if (isPreviewMode()) {
    currentUser = {
      full_name: t("preview_user"),
      role: "manager",
      permissions: ["reports", "attendance", "employees", "bonuses", "camera", "settings", "ai_chat"],
      language: "uz",
    };
    document.getElementById("app").insertAdjacentHTML("afterbegin", `
      <div class="preview-banner">${t("preview_banner")}</div>
    `);
  } else {
    try {
      currentUser = await callApi("whoami");
    } catch (e) {
      stateMessage(e.message, true);
      return;
    }
  }

  document.getElementById("avatar-letter").textContent =
    (currentUser.full_name || "?").trim().charAt(0).toUpperCase();

  const allowed = refreshUiTexts();
  if (!allowed.length) {
    stateMessage(t("no_sections"));
    return;
  }

  const initialKey = location.hash.replace("#", "");
  if (initialKey && allowed.some((a) => a.key === initialKey)) {
    navigateTo(initialKey);
  } else {
    renderHomeView();
  }

  window.addEventListener("hashchange", () => {
    const key = location.hash.replace("#", "");
    if (VIEWS[key]) navigateTo(key);
  });
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").catch(() => {});
}

if (tg && tg.onEvent) {
  tg.onEvent("themeChanged", applyTelegramTheme);
}

init();
