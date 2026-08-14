// supabase/functions/miniapp/index.ts
//
// To'liq mini-ilovaning statik fayllarini (HTML/CSS/JS/manifest/service
// worker) to'g'ridan-to'g'ri Supabase Edge Function orqali beradi —
// alohida hosting xizmati kerak emas. Manba fayllar (o'qish/tahrirlash
// uchun qulayroq) miniapp/ papkasida ham saqlanadi — ikkalasi bir xil
// mazmunda bo'lishi kerak, shu faylni yangilasangiz miniapp/ papkasidagi
// fayllarni ham yangilang (yoki aksincha).
//
// MUHIM: Deploy qilishda "Enforce JWT Verification" / "Verify JWT"
// belgisini O'CHIRING — bu funksiya ochiq/public bo'lishi kerak (Telegram
// va oddiy brauzer hech qanday Authorization sarlavhasi yubormaydi).
//
// TEXNIK ESLATMA: quyidagi APP_JS matni ataylab shablon satr (`${...}`)
// ishlatmaydi, faqat oddiy satr qo'shish (+ concatenation) bilan
// yozilgan — chunki bu butun fayl o'zi ham tashqi shablon satr ichida
// joylashgan, va ichma-ich shablon satrlarni escaping qilish juda oson
// xato qildiradi (birinchi urinishda aynan shu sabab xato chiqqan edi).
//
// Kelajakda App Store/Google Play uchun: bu — PWA (manifest.json +
// service-worker.js bilan) sifatida qurilgan, shuning uchun Google Play'ga
// "Trusted Web Activity" orqali, yoki Capacitor kabi vosita bilan iOS/
// Android uchun deyarli kod o'zgarishisiz o'rab chiqarish mumkin bo'ladi.

const INDEX_HTML = `<!DOCTYPE html>
<html lang="uz">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>Xodim Intizom</title>
<meta name="theme-color" content="#2563eb" />
<link rel="manifest" href="./manifest.json" />
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<link rel="stylesheet" href="./style.css" />
</head>
<body>
  <div id="app">
    <header class="topbar">
      <h1 id="app-title">Xodim Intizom</h1>
      <div id="whoami" class="whoami">Yuklanmoqda...</div>
    </header>

    <main id="view">
      <div class="state-message">Yuklanmoqda...</div>
    </main>

    <nav id="tabbar" class="tabbar hidden"></nav>
  </div>

  <script src="./app.js"></script>
</body>
</html>`;

const STYLE_CSS = `:root {
  --bg: var(--tg-theme-bg-color, #ffffff);
  --secondary-bg: var(--tg-theme-secondary-bg-color, #f0f2f5);
  --text: var(--tg-theme-text-color, #111827);
  --hint: var(--tg-theme-hint-color, #6b7280);
  --link: var(--tg-theme-link-color, #2563eb);
  --button: var(--tg-theme-button-color, #2563eb);
  --button-text: var(--tg-theme-button-text-color, #ffffff);
  --score-good: #16a34a;
  --score-mid: #d97706;
  --score-bad: #dc2626;
}
* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; }
body { background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
#app { display: flex; flex-direction: column; height: 100vh; height: 100dvh; }
.topbar { flex-shrink: 0; padding: 14px 16px; border-bottom: 1px solid var(--secondary-bg); }
.topbar h1 { font-size: 17px; margin: 0 0 2px; }
.whoami { font-size: 12px; color: var(--hint); }
#view { flex: 1; overflow-y: auto; padding: 12px 16px 16px; -webkit-overflow-scrolling: touch; }
.state-message { text-align: center; color: var(--hint); padding: 32px 16px; }
.state-message.error { color: var(--score-bad); }
.hidden { display: none !important; }
.tabbar { flex-shrink: 0; display: flex; border-top: 1px solid var(--secondary-bg); padding-bottom: env(safe-area-inset-bottom, 0); background: var(--bg); }
.tabbar button { flex: 1; background: none; border: none; padding: 8px 4px 6px; font-size: 10.5px; color: var(--hint); display: flex; flex-direction: column; align-items: center; gap: 2px; font-family: inherit; }
.tabbar button .icon { font-size: 19px; }
.tabbar button.active { color: var(--link); font-weight: 600; }
.item-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.item-card { display: flex; align-items: center; gap: 12px; background: var(--secondary-bg); border-radius: 12px; padding: 12px 14px; }
.item-card .emoji { font-size: 20px; flex-shrink: 0; }
.item-card .info { flex: 1; min-width: 0; }
.item-card .title { font-weight: 600; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-card .subtitle { font-size: 12px; color: var(--hint); }
.badge { font-weight: 700; font-size: 13px; padding: 4px 10px; border-radius: 999px; color: #fff; flex-shrink: 0; white-space: nowrap; }
.badge.good { background: var(--score-good); }
.badge.mid { background: var(--score-mid); }
.badge.bad { background: var(--score-bad); }
.badge.pending { background: var(--hint); }
.badge.neutral { background: var(--link); }
.settings-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--secondary-bg); }
.settings-row .label { color: var(--hint); }
.settings-row .value { font-weight: 600; }`;

const APP_JS = `var SUPABASE_URL = "https://wfrclcwjeeqeqchmdhzw.supabase.co";
var SUPABASE_PUBLISHABLE_KEY = "sb_publishable_XXGPseelcyjkO6EJie1bHQ_t32mh4Do";
var FUNCTION_URL = SUPABASE_URL + "/functions/v1/miniapp-api";

var tg = window.Telegram ? window.Telegram.WebApp : null;

// ESLATMA: emoji/maxsus belgilar ataylab \\u{...} kod ko'rinishida
// yozilgan (literal emoji emas) — chunki bularni to'g'ridan-to'g'ri
// Supabase'ning brauzer-ichi kod muharririga nusxalab joylashtirishda
// UTF-8 kodlanishi ba'zan buzilib qolishi kuzatildi. \\u{...} yozuvi esa
// oddiy ASCII belgilardan iborat, hech qanday nusxalashda buzilmaydi.
var NAV_ITEMS = [
  { key: "reports", icon: "\u{1F4CA}", label: "Hisobotlar" },
  { key: "employees", icon: "\u{1F465}", label: "Xodimlar" },
  { key: "bonuses", icon: "\u{1F4B0}", label: "Bonuslar" },
  { key: "camera", icon: "\u{1F4F9}", label: "Kamera" },
  { key: "settings", icon: "\u{2699}\u{FE0F}", label: "Sozlamalar" }
];

var currentUser = null;

function applyTelegramTheme() {
  if (!tg) return;
  tg.ready();
  tg.expand();
  var root = document.documentElement.style;
  var p = tg.themeParams || {};
  var map = {
    bg_color: "--tg-theme-bg-color",
    secondary_bg_color: "--tg-theme-secondary-bg-color",
    text_color: "--tg-theme-text-color",
    hint_color: "--tg-theme-hint-color",
    link_color: "--tg-theme-link-color",
    button_color: "--tg-theme-button-color",
    button_text_color: "--tg-theme-button-text-color"
  };
  for (var key in map) {
    if (p[key]) root.setProperty(map[key], p[key]);
  }
}

function escapeHtml(str) {
  var div = document.createElement("div");
  div.textContent = str == null ? "" : str;
  return div.innerHTML;
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
}

function scoreBadgeClass(score) {
  if (score === null || score === undefined) return "pending";
  if (score >= 85) return "good";
  if (score >= 60) return "mid";
  return "bad";
}

function scoreEmoji(score) {
  if (score === null || score === undefined) return String.fromCodePoint(0x231B);
  if (score >= 85) return String.fromCodePoint(0x1F7E2);
  if (score >= 60) return String.fromCodePoint(0x1F7E1);
  return String.fromCodePoint(0x1F534);
}

async function callApi(action) {
  if (!tg || !tg.initData) {
    throw new Error("Bu ilova faqat Telegram ichida ochilganda ishlaydi.");
  }
  var res = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + SUPABASE_PUBLISHABLE_KEY,
      "apikey": SUPABASE_PUBLISHABLE_KEY
    },
    body: JSON.stringify({ initData: tg.initData, action: action })
  });
  var data = await res.json();
  if (!res.ok) throw new Error(data.error || "Xatolik yuz berdi.");
  return data;
}

function setView(html) {
  document.getElementById("view").innerHTML = html;
}

function stateMessage(text, isError) {
  setView('<div class="state-message' + (isError ? ' error' : '') + '">' + escapeHtml(text) + '</div>');
}

async function viewReports() {
  stateMessage("Yuklanmoqda...");
  var res = await callApi("reports");
  var conversations = res.conversations;
  if (!conversations.length) {
    stateMessage("Bugun hali suhbatlar tahlil qilinmagan.");
    return;
  }
  var items = conversations.map(function (c) {
    return '<li class="item-card">' +
      '<span class="emoji">' + scoreEmoji(c.score) + '</span>' +
      '<span class="info">' +
        '<div class="title">' + escapeHtml(c.employee_name) + '</div>' +
        '<div class="subtitle">' + formatTime(c.created_at) + '</div>' +
      '</span>' +
      '<span class="badge ' + scoreBadgeClass(c.score) + '">' +
        (c.score !== null ? c.score + '/100' : 'kutilmoqda') +
      '</span>' +
    '</li>';
  }).join("");
  setView('<ul class="item-list">' + items + '</ul>');
}

async function viewEmployees() {
  stateMessage("Yuklanmoqda...");
  var res = await callApi("employees");
  var employees = res.employees;
  if (!employees.length) {
    stateMessage("Hozircha xodimlar ro'yxati bo'sh.");
    return;
  }
  var PERSON_ICON = String.fromCodePoint(0x1F464);
  var MIDDOT = String.fromCodePoint(0x00B7);
  var items = employees.map(function (e) {
    return '<li class="item-card">' +
      '<span class="emoji">' + PERSON_ICON + '</span>' +
      '<span class="info">' +
        '<div class="title">' + escapeHtml(e.full_name) + '</div>' +
        '<div class="subtitle">' + escapeHtml(e.position || "-") + " " + MIDDOT + " darcha " + escapeHtml(e.workstation_number || "-") + '</div>' +
      '</span>' +
      '<span class="badge neutral">' + escapeHtml(e.microphone_id || "-") + '</span>' +
    '</li>';
  }).join("");
  setView('<ul class="item-list">' + items + '</ul>');
}

async function viewBonuses() {
  stateMessage("Yuklanmoqda...");
  var res = await callApi("bonuses");
  var bonuses = res.bonuses;
  var norm = res.conversations_norm;
  if (!bonuses.length) {
    stateMessage("Bu oy uchun hali hisoblanadigan bonus ma'lumotlari yo'q.");
    return;
  }
  var EM_DASH = String.fromCodePoint(0x2014);
  var MIDDOT2 = String.fromCodePoint(0x00B7);
  var items = bonuses.map(function (b) {
    var bonusText = b.bonus_amount !== null
      ? Math.round(b.bonus_amount).toLocaleString("uz-UZ") + " so'm"
      : EM_DASH;
    return '<li class="item-card">' +
      '<span class="emoji">' + scoreEmoji(b.avg_score) + '</span>' +
      '<span class="info">' +
        '<div class="title">' + escapeHtml(b.full_name) + '</div>' +
        '<div class="subtitle">' + b.conv_count + " suhbat " + MIDDOT2 + " hajm " + (b.volume_coef * 100).toFixed(0) + "% " + MIDDOT2 + " o'rtacha " + b.avg_score + '</div>' +
      '</span>' +
      '<span class="badge neutral">' + bonusText + '</span>' +
    '</li>';
  }).join("");
  setView(
    '<div class="settings-row"><span class="label">Oylik norma</span><span class="value">' + norm + ' suhbat</span></div>' +
    '<ul class="item-list" style="margin-top:12px">' + items + '</ul>'
  );
}

async function viewCamera() {
  stateMessage("Yuklanmoqda...");
  var data = await callApi("camera");
  stateMessage(data.message || "Kamera hozircha sozlanmagan.");
}

async function viewSettings() {
  stateMessage("Yuklanmoqda...");
  var s = await callApi("settings");
  setView(
    '<div class="settings-row"><span class="label">Bonus maksimal foizi</span><span class="value">' + (s.bonus_max_percent * 100).toFixed(0) + '%</span></div>' +
    '<div class="settings-row"><span class="label">Oylik suhbat normasi</span><span class="value">' + s.monthly_conversation_norm + ' ta</span></div>'
  );
}

var VIEWS = { reports: viewReports, employees: viewEmployees, bonuses: viewBonuses, camera: viewCamera, settings: viewSettings };

function renderTabbar() {
  var tabbar = document.getElementById("tabbar");
  var allowed = NAV_ITEMS.filter(function (item) {
    return currentUser.permissions.indexOf(item.key) !== -1;
  });
  tabbar.innerHTML = allowed.map(function (item) {
    return '<button data-key="' + item.key + '">' +
      '<span class="icon">' + item.icon + '</span>' +
      '<span>' + item.label + '</span>' +
    '</button>';
  }).join("");
  tabbar.classList.remove("hidden");
  var buttons = tabbar.querySelectorAll("button");
  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      navigateTo(btn.dataset.key);
    });
  });
  return allowed;
}

function setActiveTab(key) {
  document.querySelectorAll("#tabbar button").forEach(function (btn) {
    btn.classList.toggle("active", btn.dataset.key === key);
  });
}

async function navigateTo(key) {
  location.hash = key;
  setActiveTab(key);
  try {
    await VIEWS[key]();
  } catch (e) {
    stateMessage(e.message, true);
  }
}

async function init() {
  applyTelegramTheme();
  if (!tg || !tg.initData) {
    stateMessage("Bu ilova faqat Telegram ichida ochilganda ishlaydi.", true);
    return;
  }
  try {
    currentUser = await callApi("whoami");
  } catch (e) {
    stateMessage(e.message, true);
    return;
  }
  document.getElementById("whoami").textContent = currentUser.full_name + " (" + currentUser.role_label + ")";
  var allowed = renderTabbar();
  if (!allowed.length) {
    stateMessage("Sizga ko'rsatiladigan bo'lim yo'q.");
    return;
  }
  var initialKey = location.hash.replace("#", "") || allowed[0].key;
  var startKey = allowed[0].key;
  for (var i = 0; i < allowed.length; i++) {
    if (allowed[i].key === initialKey) { startKey = initialKey; break; }
  }
  navigateTo(startKey);
  window.addEventListener("hashchange", function () {
    var key = location.hash.replace("#", "");
    if (VIEWS[key]) navigateTo(key);
  });
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").catch(function () {});
}

init();`;

const MANIFEST_JSON = `{
  "name": "Xodim Intizom",
  "short_name": "Intizom",
  "description": "Yagona darcha xizmatida xodim-mijoz suhbatlarini AI yordamida tahlil qilish tizimi",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "lang": "uz",
  "icons": [
    {
      "src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%232563eb'/%3E%3Ctext x='50' y='64' font-size='42' font-family='sans-serif' font-weight='700' fill='white' text-anchor='middle'%3EXI%3C/text%3E%3C/svg%3E",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}`;

const SERVICE_WORKER_JS = `var CACHE_NAME = "xodim-intizom-shell-v1";
var SHELL_FILES = ["./", "./style.css", "./app.js", "./manifest.json"];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(SHELL_FILES); }));
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var network = fetch(event.request)
        .then(function (response) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
          return response;
        })
        .catch(function () { return cached; });
      return cached || network;
    })
  );
});`;

function textResponse(body: string, contentType: string): Response {
  // ESLATMA: content-type ni Headers obyekti orqali, aniq va batafsil
  // o'rnatamiz — ba'zi proksi/gateway qatlamlari oddiy object literal
  // headers'ni to'liq hurmat qilmasligi mumkin, shuning uchun bu
  // ishonchliroq usul.
  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set("Cache-Control", "no-cache");
  return new Response(body, { status: 200, headers });
}

Deno.serve((req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname;

  if (path.endsWith("/style.css")) {
    return textResponse(STYLE_CSS, "text/css; charset=utf-8");
  }
  if (path.endsWith("/app.js")) {
    return textResponse(APP_JS, "application/javascript; charset=utf-8");
  }
  if (path.endsWith("/manifest.json")) {
    return textResponse(MANIFEST_JSON, "application/manifest+json; charset=utf-8");
  }
  if (path.endsWith("/service-worker.js")) {
    return textResponse(SERVICE_WORKER_JS, "application/javascript; charset=utf-8");
  }
  return textResponse(INDEX_HTML, "text/html; charset=utf-8");
});
