/**
 * Shield Parental Guard | Multi-Child, Multi-Language & Aesthetic Themes Engine
 */

// 1. Lug'at va Tarjimalar (Bilingual Localization: UZ / RU)
const i18n = {
    uz: {
        appName: "Zero-Trust Himoya",
        parentBadge: "Ota-ona",
        totalScreenTime: "Bugungi Umumiy Ekran Vaqti",
        dailyLimit: "Kunlik limit",
        remaining: "Qoldi",
        inNorm: "Me'yorda",
        viewRadar: "📍 Radarda Ko'rish",
        appUsageTitle: "📱 Ilovalardan Foydalanish Reytingi",
        appUsageSubtitle: "Android Batareya va Raqamli Qulaylik tahlili",
        voiceAlertBtn: "🎙️ Ovozli Radar",
        voiceAlertSub: "Lokatsiya so'rovi",
        voiceAlertSentTitle: "🎙️ Ovozli Radar So'rovi",
        voiceAlertSentMsg: "Farzandingizga ovozli ogohlantirish yuborildi: 'Ota-onangiz joylashuvingizni so'ramoqda.'",
        radarTitle: "Jonli Geolokatsiya (Radar)",
        gpsLive: "GPS Jonli",
        geofenceTitle: "🛡️ Xavfsiz Hududlar Holati",
        sendVoicePrompt: "🎙️ Farzandga Ovozli Lokatsiya Ogohlantirishini Yuborish",
        aiPedagogyTitle: "🧠 Gemini AI Pedagogik Tahlili",
        aiTodaySummary: "Bugungi xulosa",
        aiVectorTitle: "✨ Iqtidorlar va Qiziqishlar Matritsasi",
        reelsDigestTitle: "🎬 Tahlil Qilingan Media & Mavzular",
        gpaAvg: "O'rtacha Baho",
        attendance: "Davomat",
        todayLessons: "📚 Bugungi Darslar va Baholar",
        settingsTitle: "⚙️ Tizim Sozlamalari",
        themeSelect: "🎨 Fon va Dizaynni Tanlash (Pinterest)",
        themeSub: "8 xil eksklyuziv estetika fonlari",
        langSelect: "🌐 Tilni O'zgartirish (Язык)",
        langSub: "O'zbekcha / Русский",
        plansSelect: "💎 Tariflar va Obuna",
        plansSub: "Bepul va Premium imkoniyatlar",
        pairingSelect: "🛡️ Farzandni Bog'lash & Face ID",
        pairingSub: "Biometrik tasdiq va QR kod",
        backBtn: "← Orqaga",
        copyLink: "📋 Havolani Nusxalash",
        linkCopied: "🔗 Havola nusxalandi!",
        consentNotice: "Farzand dumaloq videoda 'nazorat_bot o'rnatilishiga roziman' deb aytishi shart."
    },
    ru: {
        appName: "Zero-Trust Защита",
        parentBadge: "Родитель",
        totalScreenTime: "Общее Экранное Время",
        dailyLimit: "Дневной лимит",
        remaining: "Осталось",
        inNorm: "В норме",
        viewRadar: "📍 Смотреть на Радаре",
        appUsageTitle: "📱 Рейтинг Использования Приложений",
        appUsageSubtitle: "Анализ батареи и Цифрового Благополучия",
        voiceAlertBtn: "🎙️ Голосовой Радар",
        voiceAlertSub: "Запрос локации",
        voiceAlertSentTitle: "🎙️ Голосовой Радар",
        voiceAlertSentMsg: "Ребёнку отправлено голосовое уведомление: 'Родители запросили вашу локацию.'",
        radarTitle: "Живая Геолокация (Радар)",
        gpsLive: "GPS Онлайн",
        geofenceTitle: "🛡️ Статус Безопасных Зон",
        sendVoicePrompt: "🎙️ Отправить голосовой запрос локации ребёнку",
        aiPedagogyTitle: "🧠 Педагогический Анализ Gemini AI",
        aiTodaySummary: "Итог дня",
        aiVectorTitle: "✨ Матрица Способностей и Интересов",
        reelsDigestTitle: "🎬 Анализ Просмотренных Reels & Медиа",
        gpaAvg: "Средний Балл",
        attendance: "Посещаемость",
        todayLessons: "📚 Уроки и Оценки на Сегодня",
        settingsTitle: "⚙️ Настройки Системы",
        themeSelect: "🎨 Выбор Фона и Темы (Pinterest)",
        themeSub: "8 эксклюзивных эстетичных фонов",
        langSelect: "🌐 Выбор Языка (Til)",
        langSub: "Русский / O'zbekcha",
        plansSelect: "💎 Тарифы и Подписка",
        plansSub: "Бесплатные и Премиум функции",
        pairingSelect: "🛡️ Привязка Ребёнка и Face ID",
        pairingSub: "Биометрическое согласие и QR",
        backBtn: "← Назад",
        copyLink: "📋 Копировать Ссылку",
        linkCopied: "🔗 Ссылка скопирована!",
        consentNotice: "Ребёнок в видеосообщении должен сказать: 'Я согласен на установку nazorat_bot'."
    }
};

// 2. Ko'p Farzandlar Ma'lumotlar Bazasi (Multi-Child Database)
const childrenDatabase = {
    "child_1": {
        name: "Aliyor (14 yosh)",
        name_ru: "Алиёр (14 лет)",
        battery: 84,
        screenTime: "3s 45d",
        screenTime_ru: "3ч 45м",
        limit: "4s 00d",
        remaining: "15d",
        remaining_ru: "15м",
        location: {
            lat: 41.2995,
            lng: 69.2401,
            address_uz: "Yunusobod, 244-Maktab hududida",
            address_ru: "Юнусабад, территория школы №244",
            geofences_uz: [
                { name: "🏠 Uy (Yunusobod 4)", status: "Tashqarisida", color: "text-slate-400" },
                { name: "🏫 244-Maktab (Xavfsiz)", status: "Ichida (Faol)", color: "text-emerald-400" },
                { name: "⚽ Futbol to'garagi", status: "Kutilmoqda (16:00)", color: "text-amber-400" }
            ],
            geofences_ru: [
                { name: "🏠 Дом (Юнусабад 4)", status: "Снаружи", color: "text-slate-400" },
                { name: "🏫 Школа №244 (Безопасно)", status: "Внутри (Активно)", color: "text-emerald-400" },
                { name: "⚽ Секция футбола", status: "Ожидается (16:00)", color: "text-amber-400" }
            ]
        },
        apps_uz: [
            { name: "YouTube (Shorts/Dars)", time: "1s 50d", percent: 48, category: "Ta'lim / Video", color: "bg-red-500", tagColor: "text-red-400 bg-red-500/10" },
            { name: "Instagram (Reels)", time: "1s 05d", percent: 28, category: "Ijtimoiy", color: "bg-pink-500", tagColor: "text-pink-400 bg-pink-500/10" },
            { name: "Telegram Messenger", time: "35d", percent: 15, category: "Muloqot", color: "bg-sky-500", tagColor: "text-sky-400 bg-sky-500/10" },
            { name: "Duolingo", time: "15d", percent: 6, category: "Til", color: "bg-emerald-500", tagColor: "text-emerald-400 bg-emerald-500/10" }
        ],
        apps_ru: [
            { name: "YouTube (Shorts/Уроки)", time: "1ч 50м", percent: 48, category: "Обучение / Видео", color: "bg-red-500", tagColor: "text-red-400 bg-red-500/10" },
            { name: "Instagram (Reels)", time: "1ч 05м", percent: 28, category: "Соцсеть", color: "bg-pink-500", tagColor: "text-pink-400 bg-pink-500/10" },
            { name: "Telegram Messenger", time: "35м", percent: 15, category: "Общение", color: "bg-sky-500", tagColor: "text-sky-400 bg-sky-500/10" },
            { name: "Duolingo", time: "15м", percent: 6, category: "Языки", color: "bg-emerald-500", tagColor: "text-emerald-400 bg-emerald-500/10" }
        ],
        ai_uz: {
            advice: "Farzandingiz bugun robototexnika va fizika darslarini qiziqish bilan ko'rdi. Kechki ovqatda u bilan yangi texnologiyalar haqida suhbatlashish tavsiya etiladi.",
            vectors: [
                { topic: "Dasturlash va IT", percent: 88, color: "bg-emerald-500" },
                { topic: "Fizika va Matematika", percent: 74, color: "bg-sky-500" },
                { topic: "Trendlar / O'yinlar", percent: 38, color: "bg-amber-500" }
            ],
            digest: [
                { title: "Python dasturlash asoslari", channel: "CodeUz", category: "Darslik", badge: "Ijobiy" },
                { title: "Jeyms Vebb kosmik teleskopi", channel: "ScienceTV", category: "Fanga qiziqish", badge: "Ijobiy" }
            ]
        },
        ai_ru: {
            advice: "Ребёнок сегодня с интересом изучал уроки по робототехнике и физике. Рекомендуется за ужином обсудить с ним современные технологии.",
            vectors: [
                { topic: "Программирование и IT", percent: 88, color: "bg-emerald-500" },
                { topic: "Физика и Математика", percent: 74, color: "bg-sky-500" },
                { topic: "Тренды и Игры", percent: 38, color: "bg-amber-500" }
            ],
            digest: [
                { title: "Основы Python с нуля", channel: "CodeUz", category: "Урок", badge: "Позитивно" },
                { title: "Телескоп Джеймс Уэбб", channel: "ScienceTV", category: "Наука", badge: "Позитивно" }
            ]
        },
        gpa: "4.9",
        attendance: "100%",
        lessons_uz: [
            { subject: "Algebra", time: "08:30 - 09:15", grade: "5", room: "302-xona" },
            { subject: "Fizika", time: "09:25 - 10:10", grade: "5", room: "Fizika lab." },
            { subject: "Ona tili", time: "10:20 - 11:05", grade: "4", room: "204-xona" }
        ],
        lessons_ru: [
            { subject: "Алгебра", time: "08:30 - 09:15", grade: "5", room: "Кабинет 302" },
            { subject: "Физика", time: "09:25 - 10:10", grade: "5", room: "Физ. лаб." },
            { subject: "Родной язык", time: "10:20 - 11:05", grade: "4", room: "Кабинет 204" }
        ]
    },
    "child_2": {
        name: "Madina (10 yosh)",
        name_ru: "Мадина (10 лет)",
        battery: 92,
        screenTime: "2s 10d",
        screenTime_ru: "2ч 10м",
        limit: "3s 00d",
        remaining: "50d",
        remaining_ru: "50м",
        location: {
            lat: 41.3110,
            lng: 69.2797,
            address_uz: "Mirzo Ulug'bek, San'at Maktabi",
            address_ru: "Мирзо Улугбек, Школа Искусств",
            geofences_uz: [
                { name: "🏠 Uy", status: "Tashqarisida", color: "text-slate-400" },
                { name: "🎨 San'at Maktabi", status: "Ichida (Faol)", color: "text-emerald-400" }
            ],
            geofences_ru: [
                { name: "🏠 Дом", status: "Снаружи", color: "text-slate-400" },
                { name: "🎨 Школа Искусств", status: "Внутри (Активно)", color: "text-emerald-400" }
            ]
        },
        apps_uz: [
            { name: "YouTube (Rasm chizish)", time: "1s 10d", percent: 55, category: "San'at", color: "bg-red-500", tagColor: "text-red-400 bg-red-500/10" },
            { name: "Duolingo English", time: "35d", percent: 27, category: "Til", color: "bg-emerald-500", tagColor: "text-emerald-400 bg-emerald-500/10" },
            { name: "Telegram", time: "25d", percent: 18, category: "Muloqot", color: "bg-sky-500", tagColor: "text-sky-400 bg-sky-500/10" }
        ],
        apps_ru: [
            { name: "YouTube (Рисование)", time: "1ч 10м", percent: 55, category: "Искусство", color: "bg-red-500", tagColor: "text-red-400 bg-red-500/10" },
            { name: "Duolingo English", time: "35м", percent: 27, category: "Языки", color: "bg-emerald-500", tagColor: "text-emerald-400 bg-emerald-500/10" },
            { name: "Telegram", time: "25м", percent: 18, category: "Общение", color: "bg-sky-500", tagColor: "text-sky-400 bg-sky-500/10" }
        ],
        ai_uz: {
            advice: "Madinada akvarel va rangtasvir san'atiga qobiliyat yuqori. Birgalikda yangi mo'yqalamlar to'plamini tanlash tavsiya etiladi.",
            vectors: [
                { topic: "Tasviriy San'at va Dizayn", percent: 92, color: "bg-pink-500" },
                { topic: "Chet Tillari", percent: 78, color: "bg-emerald-500" }
            ],
            digest: [
                { title: "Akvarel bo'yoqlari bilan ishlash", channel: "ArtClass", category: "San'at", badge: "A'lo" }
            ]
        },
        ai_ru: {
            advice: "У Мадины высокая склонность к акварели и рисованию. Рекомендуется вместе выбрать набор новых кистей.",
            vectors: [
                { topic: "Изобразительное искусство", percent: 92, color: "bg-pink-500" },
                { topic: "Иностранные языки", percent: 78, color: "bg-emerald-500" }
            ],
            digest: [
                { title: "Уроки акварели для детей", channel: "ArtClass", category: "Искусство", badge: "Отлично" }
            ]
        },
        gpa: "5.0",
        attendance: "100%",
        lessons_uz: [
            { subject: "Tasviriy san'at", time: "09:00 - 09:45", grade: "5", room: "San'at zali" },
            { subject: "Matematika", time: "09:55 - 10:40", grade: "5", room: "105-xona" }
        ],
        lessons_ru: [
            { subject: "ИЗО", time: "09:00 - 09:45", grade: "5", room: "Арт-зал" },
            { subject: "Математика", time: "09:55 - 10:40", grade: "5", room: "Кабинет 105" }
        ]
    }
};

// 3. Global App State
let currentLang = localStorage.getItem('app_lang') || 'uz';
let currentChildKey = 'child_1';
let currentTheme = localStorage.getItem('app_theme') || 'default';
let mapInstance = null;
let parentMarker = null;
let childMarker = null;

// 4. Initsializatsiya
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    const user = tg.initDataUnsafe?.user;
    if (user) {
        document.getElementById('parentNameBadge').innerText = `${user.first_name || 'Ota-ona'}`;
    }
}

// 5. Tilni O'zgartirish Funksiyasi
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('app_lang', lang);
    applyLanguage();
    renderActiveChild();
    closeSubpage();
}

function applyLanguage() {
    const dict = i18n[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.innerText = dict[key];
        }
    });
}

// 6. Mavzuni O'zgartirish Funksiyasi (Themes Switcher)
function setTheme(themeName) {
    currentTheme = themeName;
    localStorage.setItem('app_theme', themeName);
    if (themeName === 'default') {
        document.body.removeAttribute('data-theme');
    } else {
        document.body.setAttribute('data-theme', themeName);
    }
    document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
    const activeCard = document.querySelector(`[data-theme-name="${themeName}"]`);
    if (activeCard) activeCard.classList.add('active');
}

// 7. Farzandni O'zgartirish Funksiyasi
function switchChild(childKey) {
    currentChildKey = childKey;
    renderActiveChild();
    if (mapInstance) {
        updateMapCoordinates();
    }
}

function renderActiveChild() {
    const child = childrenDatabase[currentChildKey];
    const dict = i18n[currentLang];
    const isRu = currentLang === 'ru';

    // Header & Ekran Vaqti
    document.getElementById('childNameDisplay').innerText = isRu ? child.name_ru : child.name;
    document.getElementById('totalScreenTime').innerText = isRu ? child.screenTime_ru : child.screenTime;
    document.getElementById('batteryBadge').innerText = `${child.battery}%`;
    document.getElementById('remainingTime').innerText = isRu ? child.remaining_ru : child.remaining;

    // Ilovalar Reytingi
    const appList = document.getElementById('appUsageList');
    const apps = isRu ? child.apps_ru : child.apps_uz;
    if (appList) {
        appList.innerHTML = apps.map(app => `
            <div class="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-white">${app.name}</span>
                        <span class="text-[10px] px-2 py-0.5 rounded-full font-medium ${app.tagColor}">${app.category}</span>
                    </div>
                    <span class="text-xs font-mono font-bold text-slate-300">${app.time} (${app.percent}%)</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill ${app.color}" style="width: ${app.percent}%"></div>
                </div>
            </div>
        `).join('');
    }

    // AI Pedagogik Tahlil
    const aiData = isRu ? child.ai_ru : child.ai_uz;
    document.getElementById('aiPedagogyAdvice').innerText = aiData.advice;

    const vectorList = document.getElementById('aiVectorList');
    if (vectorList) {
        vectorList.innerHTML = aiData.vectors.map(v => `
            <div class="space-y-1">
                <div class="flex justify-between text-xs">
                    <span class="text-slate-300 font-medium">${v.topic}</span>
                    <span class="text-emerald-400 font-mono font-bold">${v.percent}%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill ${v.color}" style="width: ${v.percent}%"></div>
                </div>
            </div>
        `).join('');
    }

    const digestList = document.getElementById('reelsDigestList');
    if (digestList) {
        digestList.innerHTML = aiData.digest.map(r => `
            <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/50 border border-slate-800">
                <div>
                    <div class="text-xs font-semibold text-slate-200">${r.title}</div>
                    <div class="text-[10px] text-slate-400">${r.channel} • ${r.category}</div>
                </div>
                <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">${r.badge}</span>
            </div>
        `).join('');
    }

    // e-Maktab
    document.getElementById('gpaBadge').innerText = `${child.gpa} / 5.0`;
    document.getElementById('attendanceBadge').innerText = child.attendance;

    const lessons = isRu ? child.lessons_ru : child.lessons_uz;
    const scheduleList = document.getElementById('schoolScheduleList');
    if (scheduleList) {
        scheduleList.innerHTML = lessons.map(s => `
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-xs text-emerald-400">
                        ${s.grade}
                    </div>
                    <div>
                        <div class="text-xs font-bold text-white">${s.subject}</div>
                        <div class="text-[10px] text-slate-400">${s.time} • ${s.room}</div>
                    </div>
                </div>
                <span class="text-xs font-semibold text-emerald-400">${isRu ? "Отлично" : "A'lo"}</span>
            </div>
        `).join('');
    }

    // Geofences
    const geofences = isRu ? child.location.geofences_ru : child.location.geofences_uz;
    const geofenceList = document.getElementById('geofenceZoneList');
    if (geofenceList) {
        geofenceList.innerHTML = geofences.map(g => `
            <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 text-xs">
                <span class="text-slate-300 font-medium">${g.name}</span>
                <span class="font-bold ${g.color}">${g.status}</span>
            </div>
        `).join('');
    }

    document.getElementById('radarAddress').innerText = isRu ? child.location.address_ru : child.location.address_uz;
}

// 8. Leaflet Map (Ota-ona va Farzand Yonma-Yon Lokatsiyasi)
function initRadarMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl || mapInstance) return;

    const child = childrenDatabase[currentChildKey];
    mapInstance = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([child.location.lat, child.location.lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapInstance);

    // Farzand Nuqtasi
    const childIcon = L.divIcon({
        className: 'custom-radar-icon',
        html: '<div class="radar-pin"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });
    childMarker = L.marker([child.location.lat, child.location.lng], { icon: childIcon }).addTo(mapInstance);

    // Ota-ona Nuqtasi (Yonma-yon)
    const parentIcon = L.divIcon({
        className: 'parent-pin-icon',
        html: '<div style="width:12px;height:12px;background:#38bdf8;border:2px solid #fff;border-radius:50%;"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });
    parentMarker = L.marker([child.location.lat - 0.008, child.location.lng - 0.006], { icon: parentIcon })
        .addTo(mapInstance)
        .bindPopup(currentLang === 'ru' ? 'Вы (Родитель)' : 'Siz (Ota-ona)');
}

function updateMapCoordinates() {
    const child = childrenDatabase[currentChildKey];
    if (mapInstance && childMarker) {
        childMarker.setLatLng([child.location.lat, child.location.lng]);
        mapInstance.panTo([child.location.lat, child.location.lng]);
    }
}

// 9. Tab Almashinuvi
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    const targetBtn = document.querySelector(`[data-tab="${tabId}"]`);

    if (targetTab) targetTab.classList.add('active');
    if (targetBtn) targetBtn.classList.add('active');

    if (tabId === 'tab-radar' && mapInstance) {
        setTimeout(() => mapInstance.invalidateSize(), 200);
    }
}

// 10. Subpage / Modallar
function openSubpage(subpageId) {
    document.querySelectorAll('.subpage-modal').forEach(m => m.classList.remove('active'));
    const modal = document.getElementById(subpageId);
    if (modal) modal.classList.add('active');
}

function closeSubpage() {
    document.querySelectorAll('.subpage-modal').forEach(m => m.classList.remove('active'));
}

// 11. Ovozli Radar Trigger
function triggerVoiceAlert() {
    const dict = i18n[currentLang];
    if (tg?.showPopup) {
        tg.showPopup({
            title: dict.voiceAlertSentTitle,
            message: dict.voiceAlertSentMsg,
            buttons: [{ type: "ok" }]
        });
    } else {
        alert(dict.voiceAlertSentMsg);
    }
}

function copyPairingLink() {
    const dict = i18n[currentLang];
    const link = "https://t.me/farzand_nazorat_bot?start=pair_8f93a1c2";
    navigator.clipboard.writeText(link).then(() => {
        alert(dict.linkCopied);
    });
}

// DomContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    setTheme(currentTheme);
    applyLanguage();
    renderActiveChild();
    initRadarMap();
});
