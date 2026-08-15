/**
 * SHIELD PARENTAL GUARD — CORE FRONTEND LOGIC
 * Bilingual (UZ / RU), 100-Point Grading, 1-11 Class DTS, Free Location & Pro AI/e-Maktab, Auto Self-Pairing.
 */

// 1. O'ZBEKISTON DTS 1-11 SINF DARSLIKLARI (O'zbekcha / Русский)
const CURRICULUM_DATABASE = {
    uz: {
        1: ["Ona tili va o'qish savodxonligi", "Matematika", "Tabiiy fanlar (Science)", "Tasviriy san'at", "Musiqa", "Texnologiya", "Jismoniy tarbiya", "Ingliz tili", "Tarbiya"],
        2: ["Ona tili va o'qish savodxonligi", "Matematika", "Tabiiy fanlar (Science)", "Tasviriy san'at", "Musiqa", "Texnologiya", "Jismoniy tarbiya", "Ingliz tili", "Tarbiya"],
        3: ["Ona tili va o'qish savodxonligi", "Matematika", "Tabiiy fanlar (Science)", "Tasviriy san'at", "Musiqa", "Texnologiya", "Jismoniy tarbiya", "Ingliz tili", "Tarbiya"],
        4: ["Ona tili va o'qish savodxonligi", "Matematika", "Tabiiy fanlar (Science)", "Tasviriy san'at", "Musiqa", "Texnologiya", "Jismoniy tarbiya", "Ingliz tili", "Tarbiya"],
        5: ["Ona tili", "Adabiyot", "Matematika", "Tarixdan hikoyalar", "Tabiiy fanlar (Science)", "Chet tili (Ingliz tili)", "Informatika va axborot texnologiyalari", "Tasviriy san'at", "Texnologiya", "Musiqa", "Jismoniy tarbiya", "Tarbiya"],
        6: ["Ona tili", "Adabiyot", "Matematika", "Qadimgi dunyo tarixi", "Biologiya (Botanika)", "Geografiya", "Chet tili (Ingliz tili)", "Informatika", "Tasviriy san'at", "Texnologiya", "Musiqa", "Jismoniy tarbiya", "Tarbiya"],
        7: ["Ona tili", "Adabiyot", "Algebra", "Geometriya", "Fizika", "Kimyo", "Biologiya (Zoologiya)", "O'zbekiston tarixi", "Jahon tarixi", "Geografiya", "Informatika", "Chet tili", "Texnologiya", "Jismoniy tarbiya", "Tarbiya"],
        8: ["Ona tili", "Adabiyot", "Algebra", "Geometriya", "Fizika", "Kimyo", "Biologiya (Odam va salomatligi)", "O'zbekiston tarixi", "Jahon tarixi", "Geografiya", "Davlat va huquq asoslari", "Informatika", "Chet tili", "Tarbiya"],
        9: ["Ona tili", "Adabiyot", "Algebra", "Geometriya", "Fizika", "Kimyo", "Biologiya (Genetika)", "O'zbekiston tarixi", "Jahon tarixi", "Geografiya", "Konstitutsiya asoslari", "Informatika", "Chet tili", "Tarbiya"],
        10: ["Ona tili", "Adabiyot", "Algebra", "Geometriya", "Fizika", "Kimyo", "Biologiya", "O'zbekiston tarixi", "Jahon tarixi", "Davlat va huquq asoslari", "Informatika", "Chet tili", "Astronomiya", "ChaQBT", "Jismoniy tarbiya"],
        11: ["Ona tili", "Adabiyot", "Algebra", "Geometriya", "Fizika", "Kimyo", "Biologiya", "O'zbekiston tarixi", "Jahon tarixi", "Davlat va huquq asoslari", "Informatika", "Chet tili", "Astronomiya", "ChaQBT", "Jismoniy tarbiya"]
    },
    ru: {
        1: ["Родной язык и грамотность", "Математика", "Естествознание (Science)", "ИЗО (Рисование)", "Музыка", "Технология", "Физкультура", "Английский язык", "Воспитание"],
        2: ["Родной язык и грамотность", "Математика", "Естествознание (Science)", "ИЗО (Рисование)", "Музыка", "Технология", "Физкультура", "Английский язык", "Воспитание"],
        3: ["Родной язык и грамотность", "Математика", "Естествознание (Science)", "ИЗО (Рисование)", "Музыка", "Технология", "Физкультура", "Английский язык", "Воспитание"],
        4: ["Родной язык и грамотность", "Математика", "Естествознание (Science)", "ИЗО (Рисование)", "Музыка", "Технология", "Физкультура", "Английский язык", "Воспитание"],
        5: ["Родной язык", "Литература", "Математика", "Рассказы по истории", "Естествознание (Science)", "Иностранный язык (Английский)", "Информатика и IT", "ИЗО", "Технология", "Музыка", "Физкультура", "Воспитание"],
        6: ["Родной язык", "Литература", "Математика", "История древнего мира", "Биология (Ботаника)", "География", "Иностранный язык", "Информатика", "ИЗО", "Технология", "Музыка", "Физкультура", "Воспитание"],
        7: ["Родной язык", "Литература", "Алгебра", "Геометрия", "Физика", "Химия", "Биология (Зоология)", "История Узбекистана", "Всемирная история", "География", "Информатика", "Иностранный язык", "Технология", "Физкультура", "Воспитание"],
        8: ["Родной язык", "Литература", "Алгебра", "Геометрия", "Физика", "Химия", "Биология (Человек и здоровье)", "История Узбекистана", "Всемирная история", "География", "Основы государства и права", "Информатика", "Иностранный язык", "Воспитание"],
        9: ["Родной язык", "Литература", "Алгеbra", "Геометрия", "Физика", "Химия", "Биология (Генетика)", "История Узбекистана", "Всемирная история", "География", "Основы конституции", "Информатика", "Иностранный язык", "Воспитание"],
        10: ["Родной язык", "Литература", "Алгебра", "Геометрия", "Физика", "Химия", "Биология", "История Узбекистана", "Всемирная история", "Основы государства и права", "Информатика", "Иностранный язык", "Астрономия", "НВП", "Физкультура"],
        11: ["Родной язык", "Литература", "Алгебра", "Геометрия", "Физика", "Химия", "Биология", "История Узбекистана", "Всемирная история", "Основы государства и права", "Информатика", "Иностранный язык", "Астрономия", "НВП", "Физкультура"]
    }
};

// 2. BILINGUAL DICTIONARY (UZ / RU)
const I18N = {
    uz: {
        screenTime: "Bugungi Ekran Vaqti",
        normalStatus: "Normal",
        limitRemain: "Qoldi:",
        appRankings: "📱 Ilovalardan Foydalanish Reytingi",
        autoSynced: "Avtomatik",
        liveRadar: "📍 Jonli Oila Radari",
        freeForLife: "Bepul",
        voiceRadarBtn: "Ovozli Radar",
        aiTitle: "Gemini AI Dars & Qiziqish Murabbiyi",
        aiSub: "Ovozli, Matnli va Rasm orqali tavsiyalar",
        aiWelcome: "Assalomu alaykum! Men farzandingizning darsliklarini o'zlashtirishi, qiziqishlari va raqamli odatlarini tahlil qiluvchi AI yordamchisiman. Darslik topshirig'i rasmini yuklang, savol yozing yoki ovozli xabar qoldiring! 🌟",
        readyForAnalysis: "Tahlil uchun tayyor",
        chip1: "💡 Darsga qiziqishni oshirish",
        chip2: "🎬 Reels & Video tahlili",
        chip3: "📱 Ekran vaqti tahlili",
        recordingVoice: "Ovoz yozilmoqda...",
        readyBtn: "Tayyor",
        interestVectors: "🎯 Farzand Qiziqishlari Vektorlari",
        aiAnalysis: "AI Xulosasi",
        gpaTitle: "O'zlashtirish Ko'rsatkichi",
        maxScore: "/ 100 ball",
        periodWeekly: "Haftalik",
        periodMonthly: "Oylik",
        periodQuarterly: "Choraklik",
        curriculumSub: "O'zbekiston DTS Ta'lim Standarti",
        changeGradeBtn: "Sinfni o'zgartirish ✎",
        settingsTitle: "⚙️ Tizim Sozlamalari",
        themeSelect: "Fon va Dizaynni Tanlash",
        themeSub: "10 xil eksklyuziv estetika fonlari",
        profileTitle: "Farzand Ma'lumotlari & Sinfi",
        profileSub: "Ism, Username va 1-11 Sinf Darsliklari",
        langSelect: "Tilni O'zgartirish (Язык)",
        langSub: "O'zbekcha / Русский",
        plansSelect: "Tariflar va Obuna",
        plansSub: "Free (Lokatsiya) / Family Pro (AI)",
        pairingSelect: "Farzandni Ulash & Android Ilova",
        pairingSub: "Oila kodi va avtomatik juftlash",
        navDashboard: "Asosiy",
        navRadar: "Radar (Bepul)",
        navAi: "AI Murabbiy 💎",
        navSchool: "e-Maktab 💎",
        navSettings: "Sozlamalar",
        backBtn: "← Orqaga",
        nameLabel: "Ism va Familiyasi",
        usernameLabel: "Telegram Usernamesi",
        classLabel: "Sinfi (1-11 Sinf DTS)",
        saveProfileBtn: "💾 Saqlash va Darsliklarni Yangilash",
        freePlanBadge: "Bepul Tarif (Free)",
        freePlanTitle: "Free Basic",
        freePlanDesc: "📍 Jonli Lokatsiya & Radar (100% Bepul), 1 ta farzand, batareya va umumiy ekran vaqti",
        freePrice: "0 so'm",
        foreverFree: "Doimiy bepul",
        proPlanBadge: "Premium Oilaviy",
        proPlanTitle: "Family Pro 💎",
        proPlanDesc: "🧠 Gemini AI Murabbiy (Ovoz/Rasm/Matn), 📚 1-11 Sinf DTS e-Maktab 100 ballik tahlil, 🎬 Reels chuqur tahlili va cheksiz farzandlar",
        proPrice: "25,000",
        perMonth: "so'm / oy",
        activateProBtn: "💎 Family Pro'ni Faollashtirish",
        activeProBtn: "✅ Pro Faollashtirilgan",
        autoPairTitle: "🔑 Sizning Oila Kodingiz (Avtomatik):",
        familyCodeHint: "Farzand telefonida kiritiladi yoki havolani yuboring",
        pairingInstruction: "Farzand hech qanday admin ishtirokisiz ulanadi:\n1. Ushbu havolani farzandingizga yuboring:",
        copyPairLinkBtn: "🔗 Ulash Havolasidan Nusxa Olish"
    },
    ru: {
        screenTime: "Экранное Время Сегодня",
        normalStatus: "В норме",
        limitRemain: "Осталось:",
        appRankings: "📱 Рейтинг Использования Приложений",
        autoSynced: "Автоматически",
        liveRadar: "📍 Семейный Онлайн-Радар",
        freeForLife: "Бесплатно",
        voiceRadarBtn: "Голосовой Радар",
        aiTitle: "Gemini AI Наставник по Учёбе и Интересам",
        aiSub: "Голосовые, текстовые и фото-рекомендации",
        aiWelcome: "Здравствуйте! Я AI-помощник, анализирующий успеваемость, интересы и цифровые привычки вашего ребёнка. Загрузите фото задания, задайте вопрос или отправьте голосовое сообщение! 🌟",
        readyForAnalysis: "Готово к анализу",
        chip1: "💡 Повысить интерес к учёбе",
        chip2: "🎬 Анализ Reels и видео",
        chip3: "📱 Анализ экранного времени",
        recordingVoice: "Запись голоса...",
        readyBtn: "Готово",
        interestVectors: "🎯 Векторы Интересов Ребёнка",
        aiAnalysis: "Выводы AI",
        gpaTitle: "Показатель Успеваемости",
        maxScore: "/ 100 баллов",
        periodWeekly: "Неделя",
        periodMonthly: "Месяц",
        periodQuarterly: "Четверть",
        curriculumSub: "Госстандарт образования Узбекистана (DTS)",
        changeGradeBtn: "Изменить класс ✎",
        settingsTitle: "⚙️ Системные Настройки",
        themeSelect: "Выбор Темы и Дизайна",
        themeSub: "10 эксклюзивных эстетических фонов",
        profileTitle: "Данные Ребёнка и Класс",
        profileSub: "Имя, Username и Учебники 1-11 классов",
        langSelect: "Сменить Язык (Til)",
        langSub: "O'zbekcha / Русский",
        plansSelect: "Тарифы и Подписка",
        plansSub: "Free (Локация) / Family Pro (AI)",
        pairingSelect: "Подключение Ребёнка и Android App",
        pairingSub: "Код семьи и авто-привязка",
        navDashboard: "Главная",
        navRadar: "Радар (Free)",
        navAi: "AI Наставник 💎",
        navSchool: "e-Maktab 💎",
        navSettings: "Настройки",
        backBtn: "← Назад",
        nameLabel: "Имя и Фамилия",
        usernameLabel: "Telegram Username",
        classLabel: "Класс (1-11 Классы DTS)",
        saveProfileBtn: "💾 Сохранить и Обновить Учебники",
        freePlanBadge: "Бесплатный Тариф",
        freePlanTitle: "Free Basic",
        freePlanDesc: "📍 Онлайн-Локация и Радар (100% Бесплатно), 1 ребёнок, батарея и общее экранное время",
        freePrice: "0 сум",
        foreverFree: "Всегда бесплатно",
        proPlanBadge: "Премиум Семейный",
        proPlanTitle: "Family Pro 💎",
        proPlanDesc: "🧠 Gemini AI Наставник (Голос/Фото/Текст), 📚 1-11 классы DTS e-Maktab анализ 100 баллов, 🎬 Анализ Reels и безлимит детей",
        proPrice: "25,000",
        perMonth: "сум / месяц",
        activateProBtn: "💎 Активировать Family Pro",
        activeProBtn: "✅ Pro Активирован",
        autoPairTitle: "🔑 Ваш Семейный Код (Автоматический):",
        familyCodeHint: "Введите на телефоне ребёнка или отправьте ссылку",
        pairingInstruction: "Ребёнок подключается без участия администратора:\n1. Отправьте эту ссылку ребёнку:",
        copyPairLinkBtn: "🔗 Скопировать Ссылку Подключения"
    }
};

// 3. KO'P FARZANDLIK TIZIMI MA'LUMOTLARI
let childrenDatabase = {
    "child_1": {
        name: "Aliyor Valijonov",
        name_ru: "Алиёр Валиджонов",
        username: "@aliyor_v",
        grade: 5,
        battery: 84,
        screenTime: "3s 45d",
        screenTime_ru: "3ч 45м",
        remaining: "1s 15d",
        remaining_ru: "1ч 15м",
        location: {
            lat: 41.3145,
            lng: 69.2812,
            address: "Yunusobod 4-mavze, 24-maktab",
            address_ru: "Юнусабад 4-й квартал, 24-я школа",
            geofences: [
                { name: "🏠 Uy / Дом (Yunusobod)", status: "Tashqarisida / Снаружи", color: "text-slate-400" },
                { name: "🏫 24-Maktab / 24-Школа", status: "Ichida (Faol) / Внутри (Активен)", color: "text-emerald-400" }
            ]
        },
        apps: [
            { name: "YouTube", time: "1s 20d", percent: 35, category: "Ta'lim / Video", category_ru: "Видео / Обучение", color: "bg-red-500", icon: "▶️" },
            { name: "Instagram (Reels)", time: "55d", percent: 24, category: "Ijtimoiy Tarmoq", category_ru: "Соцсеть", color: "bg-pink-500", icon: "📸" },
            { name: "Telegram", time: "45d", percent: 20, category: "Muloqot", category_ru: "Общение", color: "bg-sky-500", icon: "💬" },
            { name: "Duolingo", time: "30d", percent: 13, category: "Til O'rganish", category_ru: "Изучение языков", color: "bg-emerald-500", icon: "🦉" },
            { name: "PUBG Mobile", time: "15d", percent: 8, category: "O'yin", category_ru: "Игры", color: "bg-amber-500", icon: "🎮" }
        ],
        interests: {
            uz: [
                { topic: "Dasturlash va IT", percent: 85, color: "bg-emerald-500" },
                { topic: "Robototexnika va Fizika", percent: 72, color: "bg-sky-500" },
                { topic: "Ingliz tili muloqoti", percent: 65, color: "bg-purple-500" }
            ],
            ru: [
                { topic: "Программирование и IT", percent: 85, color: "bg-emerald-500" },
                { topic: "Робототехника и Физика", percent: 72, color: "bg-sky-500" },
                { topic: "Английская речь и общение", percent: 65, color: "bg-purple-500" }
            ]
        }
    },
    "child_2": {
        name: "Madina Valijonova",
        name_ru: "Мадина Валиджонова",
        username: "@madina_v",
        grade: 3,
        battery: 92,
        screenTime: "2s 10d",
        screenTime_ru: "2ч 10м",
        remaining: "50d",
        remaining_ru: "50м",
        location: {
            lat: 41.3110,
            lng: 69.2797,
            address: "Mirzo Ulug'bek, San'at Maktabi",
            address_ru: "Мирзо Улугбек, Школа искусств",
            geofences: [
                { name: "🏠 Uy / Дом", status: "Tashqarisida / Снаружи", color: "text-slate-400" },
                { name: "🎨 San'at Maktabi / Школа искусств", status: "Ichida / Внутри", color: "text-emerald-400" }
            ]
        },
        apps: [
            { name: "YouTube Kids", time: "1s 10d", percent: 54, category: "Multfilm / Ta'lim", category_ru: "Мультфильмы", color: "bg-amber-500", icon: "🧸" },
            { name: "Picsart", time: "40d", percent: 30, category: "San'at va Ijod", category_ru: "Творчество", color: "bg-purple-500", icon: "🎨" },
            { name: "Telegram", time: "20d", percent: 16, category: "Oila guruhi", category_ru: "Семейная группа", color: "bg-sky-500", icon: "💬" }
        ],
        interests: {
            uz: [
                { topic: "Tasviriy San'at va Rassomlik", percent: 92, color: "bg-pink-500" },
                { topic: "Ertaklar va O'qish", percent: 80, color: "bg-emerald-500" }
            ],
            ru: [
                { topic: "Изобразительное искусство", percent: 92, color: "bg-pink-500" },
                { topic: "Сказки и Чтение", percent: 80, color: "bg-emerald-500" }
            ]
        }
    },
    "child_3": {
        name: "Temur Valijonov",
        name_ru: "Темур Валиджонов",
        username: "@temur_v",
        grade: 9,
        battery: 76,
        screenTime: "4s 15d",
        screenTime_ru: "4ч 15м",
        remaining: "45d",
        remaining_ru: "45м",
        location: {
            lat: 41.3200,
            lng: 69.2850,
            address: "Shayxontohur, O'quv Markazi",
            address_ru: "Шайхантахур, Учебный центр",
            geofences: [
                { name: "🏠 Uy / Дом", status: "Tashqarisida / Снаружи", color: "text-slate-400" },
                { name: "💻 IT Markazi / IT Центр", status: "Ichida / Внутри", color: "text-emerald-400" }
            ]
        },
        apps: [
            { name: "VS Code / GitHub", time: "2s 10d", percent: 51, category: "Dasturlash", category_ru: "Разработка", color: "bg-sky-500", icon: "💻" },
            { name: "Telegram", time: "1s 15d", percent: 30, category: "Guruhlar", category_ru: "Группы", color: "bg-sky-500", icon: "💬" },
            { name: "YouTube", time: "50d", percent: 19, category: "Darsliklar", category_ru: "Уроки", color: "bg-red-500", icon: "▶️" }
        ],
        interests: {
            uz: [
                { topic: "Frontend & Backend Development", percent: 94, color: "bg-emerald-500" },
                { topic: "Matematika va Algoritmlar", percent: 88, color: "bg-sky-500" }
            ],
            ru: [
                { topic: "Frontend & Backend разработка", percent: 94, color: "bg-emerald-500" },
                { topic: "Математика и Алгоритмы", percent: 88, color: "bg-sky-500" }
            ]
        }
    }
};

let currentChildKey = "child_1";
let currentLang = new URLSearchParams(window.location.search).get('lang') || localStorage.getItem('app_lang') || 'uz';
let currentTheme = localStorage.getItem('app_theme') || 'default';
let userPlan = localStorage.getItem('user_plan') || 'pro'; // 'free' or 'pro'
let activeSchoolPeriod = 'weekly';
let isRecordingVoice = false;
let uploadedImageBase64 = null;
let familyCode = "849-210";

let mapInstance = null;
let childMarker = null;
let parentMarker = null;

// Telegram WebApp Setup
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

// ============================================================================
// 4. TILNI YANGILASH (I18N TRANSLATION ENGINE)
// ============================================================================
function applyLanguageTranslations() {
    const dict = I18N[currentLang] || I18N.uz;
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.innerText = dict[key];
        }
    });

    const aiBubble = document.getElementById('aiWelcomeBubble');
    if (aiBubble) aiBubble.innerText = dict.aiWelcome;

    document.getElementById('langCheckUz').classList.toggle('hidden', currentLang !== 'uz');
    document.getElementById('langCheckRu').classList.toggle('hidden', currentLang !== 'ru');

    // Update Plan Badge
    updatePlanBadge();
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('app_lang', lang);
    applyLanguageTranslations();
    renderActiveChild();
    renderSchoolCurriculum();
    closeSubpage();
}

function updatePlanBadge() {
    const badge = document.getElementById('headerPlanBadge');
    const toggleBtn = document.getElementById('btnPlanToggle');
    const dict = I18N[currentLang] || I18N.uz;

    if (userPlan === 'pro') {
        badge.className = "px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold";
        badge.innerText = "💎 Pro";
        if (toggleBtn) toggleBtn.innerText = dict.activeProBtn;
    } else {
        badge.className = "px-2 py-1 rounded-full bg-slate-700/60 border border-slate-600 text-slate-300 text-[10px] font-bold";
        badge.innerText = "Free";
        if (toggleBtn) toggleBtn.innerText = dict.activateProBtn;
    }
}

function togglePlanUpgrade() {
    userPlan = (userPlan === 'free') ? 'pro' : 'free';
    localStorage.setItem('user_plan', userPlan);
    updatePlanBadge();
    const msg = (currentLang === 'ru') 
        ? `Тариф переключен на: ${userPlan.toUpperCase()}`
        : `Tarif o'zgartirildi: ${userPlan.toUpperCase()}`;
    alert(msg);
}

// ============================================================================
// 5. 100-BALLIK E-MAKTAB BAHOLARI GENERATORI & KO'RSATISH
// ============================================================================
function getSubjectScore(subjectName, gradeNum, period) {
    let hash = 0;
    const key = subjectName + gradeNum + period + currentChildKey;
    for (let i = 0; i < key.length; i++) {
        hash = (hash << 5) - hash + key.charCodeAt(i);
        hash |= 0;
    }
    const baseScore = 75 + Math.abs(hash % 24);
    return Math.min(100, Math.max(60, baseScore));
}

function renderSchoolCurriculum() {
    const child = childrenDatabase[currentChildKey];
    const grade = child.grade || 5;
    const langDict = CURRICULUM_DATABASE[currentLang] || CURRICULUM_DATABASE.uz;
    const subjects = langDict[grade] || langDict[5];
    
    const titleText = (currentLang === 'ru')
        ? `📚 Учебники и Оценки ${grade}-го Класса`
        : `📚 ${grade}-Sinf Davlat Darsliklari & Baholari`;
    document.getElementById('curriculumClassTitle').innerText = titleText;
    document.getElementById('childClassBadge').innerText = `${grade}-${currentLang === 'ru' ? 'класс DTS' : 'sinf DTS'}`;

    let totalScore = 0;
    const listContainer = document.getElementById('subjectsGradeList');

    listContainer.innerHTML = subjects.map((subject, index) => {
        const score = getSubjectScore(subject, grade, activeSchoolPeriod);
        totalScore += score;

        let badgeColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
        let statusLabel = currentLang === 'ru' ? "Отлично" : "A'lo";
        if (score < 71) {
            badgeColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
            statusLabel = currentLang === 'ru' ? "Удовл." : "Qoniqarli";
        } else if (score < 86) {
            badgeColor = "text-sky-400 bg-sky-500/10 border-sky-500/30";
            statusLabel = currentLang === 'ru' ? "Хорошо" : "Yaxshi";
        }

        return `
            <div class="subject-item-card flex items-center justify-between">
                <div class="space-y-1 flex-1 pr-3">
                    <div class="flex items-center gap-2">
                        <span class="text-[11px] font-bold text-white">${index + 1}. ${subject}</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill bg-gradient-to-r from-emerald-500 to-sky-400" style="width: ${score}%;"></div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-xs font-black text-white">${score} <span class="text-[9px] text-slate-400">/ 100</span></div>
                    <span class="text-[9px] font-bold px-1.5 py-0.5 rounded border ${badgeColor}">${statusLabel}</span>
                </div>
            </div>
        `;
    }).join('');

    const overallAvg = (totalScore / subjects.length).toFixed(1);
    document.getElementById('overallGradeScore').innerText = overallAvg;
    
    const periodNames = {
        uz: {
            'weekly': 'Haftalik baholash (Oxirgi 7 kun)',
            'monthly': 'Oylik umumiy ko\'rsatkich',
            'quarterly': 'I-Chorak yakuniy baholari'
        },
        ru: {
            'weekly': 'Оценка за неделю (последние 7 дней)',
            'monthly': 'Ежемесячный сводный показатель',
            'quarterly': 'Итоговые оценки за I-четверть'
        }
    };
    document.getElementById('activePeriodLabel').innerText = (periodNames[currentLang] || periodNames.uz)[activeSchoolPeriod];

    let overallLabel = currentLang === 'ru' ? "Отлично (Топ 5%)" : "A'lo (Top 5%)";
    if (overallAvg < 71) overallLabel = currentLang === 'ru' ? "Средний уровень" : "O'rtacha daraja";
    else if (overallAvg < 86) overallLabel = currentLang === 'ru' ? "Хороший результат" : "Yaxshi (Ijobiy)";
    document.getElementById('overallGradeLabel').innerText = overallLabel;
}

function setSchoolPeriod(period) {
    activeSchoolPeriod = period;
    document.querySelectorAll('.period-pill').forEach(p => p.classList.remove('active'));
    const btn = document.getElementById(`period-${period}`);
    if (btn) btn.classList.add('active');
    renderSchoolCurriculum();
}

// ============================================================================
// 6. FARZAND PROFILI VA AVTO-JUFTLASH
// ============================================================================
function openChildProfileModal() {
    const child = childrenDatabase[currentChildKey];
    document.getElementById('profileFullName').value = (currentLang === 'ru') ? (child.name_ru || child.name) : child.name;
    document.getElementById('profileUsername').value = child.username;
    document.getElementById('profileClassSelect').value = child.grade || 5;
    openSubpage('modal-child-profile');
}

function saveChildProfile() {
    const fullName = document.getElementById('profileFullName').value.trim() || "Farzand";
    const username = document.getElementById('profileUsername').value.trim() || "@farzand";
    const grade = parseInt(document.getElementById('profileClassSelect').value) || 5;

    childrenDatabase[currentChildKey].name = fullName;
    childrenDatabase[currentChildKey].username = username;
    childrenDatabase[currentChildKey].grade = grade;

    const select = document.getElementById('childSelector');
    if (select.querySelector(`option[value="${currentChildKey}"]`)) {
        select.querySelector(`option[value="${currentChildKey}"]`).innerText = `${fullName} (${grade}-${currentLang === 'ru' ? 'класс' : 'sinf'})`;
    }

    renderActiveChild();
    renderSchoolCurriculum();
    closeSubpage();

    const alertMsg = (currentLang === 'ru')
        ? `✅ Данные ребёнка сохранены!\nУчебники ${grade}-го класса и шкала 100 баллов установлены.`
        : `✅ Farzand ma'lumotlari saqlandi!\n${grade}-sinf Davlat darsliklari va 100 ballik baholar o'rnatildi.`;
    alert(alertMsg);
}

function switchChild(childKey) {
    currentChildKey = childKey;
    renderActiveChild();
    renderSchoolCurriculum();
    if (mapInstance) updateMapCoordinates();
}

function renderActiveChild() {
    const child = childrenDatabase[currentChildKey];
    const isRu = (currentLang === 'ru');

    document.getElementById('totalScreenTime').innerText = isRu ? child.screenTime_ru : child.screenTime;
    document.getElementById('batteryBadge').innerText = `${child.battery}%`;
    document.getElementById('remainingTime').innerText = isRu ? child.remaining_ru : child.remaining;
    document.getElementById('childSelector').value = currentChildKey;
    document.getElementById('displayFamilyCode').innerText = familyCode;

    // Ilovalar Reytingi
    const appList = document.getElementById('appUsageList');
    if (appList) {
        appList.innerHTML = child.apps.map(app => `
            <div class="space-y-1">
                <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2">
                        <span class="text-sm">${app.icon}</span>
                        <span class="font-bold text-white">${app.name}</span>
                        <span class="text-[10px] text-slate-400 bg-slate-800/60 px-1.5 py-0.2 rounded">${isRu ? app.category_ru : app.category}</span>
                    </div>
                    <span class="font-mono text-slate-300">${app.time} <b class="text-emerald-400">(${app.percent}%)</b></span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill ${app.color}" style="width: ${app.percent}%;"></div>
                </div>
            </div>
        `).join('');
    }

    // Geofences (Barcha uchun bepul)
    const geofenceList = document.getElementById('geofenceZoneList');
    if (geofenceList) {
        geofenceList.innerHTML = child.location.geofences.map(g => `
            <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 text-xs">
                <span class="text-slate-300 font-medium">${g.name}</span>
                <span class="font-bold ${g.color}">${g.status}</span>
            </div>
        `).join('');
    }

    // Interests
    const interestList = document.getElementById('aiInterestVectors');
    if (interestList) {
        const interests = isRu ? child.interests.ru : child.interests.uz;
        interestList.innerHTML = interests.map(i => `
            <div class="space-y-1">
                <div class="flex justify-between text-xs">
                    <span class="text-slate-300 font-medium">${i.topic}</span>
                    <span class="font-bold text-white">${i.percent}%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill ${i.color}" style="width: ${i.percent}%;"></div>
                </div>
            </div>
        `).join('');
    }

    document.getElementById('radarAddress').innerText = isRu ? child.location.address_ru : child.location.address;
}

// ============================================================================
// 7. AI CHAT, OVOZ VA REELS TAHLILI (GEMINI AI)
// ============================================================================
function appendUserMessage(text, imageSrc = null) {
    const thread = document.getElementById('aiChatThread');
    const msgDiv = document.createElement('div');
    msgDiv.className = "chat-bubble-user";
    
    let content = "";
    if (imageSrc) {
        content += `<img src="${imageSrc}" class="w-32 h-24 object-cover rounded-lg mb-1.5 border border-emerald-500/40" />`;
    }
    content += `<span>${text}</span>`;
    msgDiv.innerHTML = content;
    thread.appendChild(msgDiv);
    thread.scrollTop = thread.scrollHeight;
}

function appendAIMessage(text) {
    const thread = document.getElementById('aiChatThread');
    const msgDiv = document.createElement('div');
    msgDiv.className = "chat-bubble-ai";
    const headerTitle = (currentLang === 'ru') ? "🧠 Gemini AI Наставник:" : "🧠 Gemini AI Murabbiy:";
    msgDiv.innerHTML = `<span class="text-purple-400 font-bold text-[10px] block mb-1">${headerTitle}</span>` + text;
    thread.appendChild(msgDiv);
    thread.scrollTop = thread.scrollHeight;
}

function sendTextMessage() {
    const input = document.getElementById('aiTextInput');
    const text = input.value.trim();
    if (!text && !uploadedImageBase64) return;

    const defaultImgText = (currentLang === 'ru') ? "📷 Отправлено фото для анализа" : "📷 Rasm tahlili uchun yuborildi";
    appendUserMessage(text || defaultImgText, uploadedImageBase64);
    input.value = "";
    
    setTimeout(() => {
        generateAIResponse(text, uploadedImageBase64);
        clearImagePreview();
    }, 600);
}

function sendQuickPrompt(promptText) {
    document.getElementById('aiTextInput').value = promptText;
    sendTextMessage();
}

function generateAIResponse(query, imageBase64) {
    const child = childrenDatabase[currentChildKey];
    const qLower = (query || "").toLowerCase();
    const isRu = (currentLang === 'ru');
    let responseText = "";

    if (imageBase64) {
        if (isRu) {
            responseText = `
                <b>📷 Вывод по анализу задания:</b><br>
                Загруженное фото школьного задания проанализировано. Рекомендация для <b>${child.name_ru || child.name} (${child.grade}-класс)</b>:<br>
                • <b>Правило:</b> Закрепите теоретическое понятие на практических примерах в течение 10 минут.<br>
                • <b>Закрепление:</b> Решите 2-3 упражнения самостоятельно и проверьте балл в e-Maktab! 🌟
            `;
        } else {
            responseText = `
                <b>📷 Vazifa / Rasm Tahlili Xulosasi:</b><br>
                Yuklangan darslik topshirig'i tahlil qilindi. <b>${child.name} (${child.grade}-sinf)</b> uchun ushbu darslik mavzusini o'zlashtirish bo'yicha yo'riqnoma:<br>
                • <b>Asosiy qoida:</b> Mavzuning nazariy tushunchasini 10 daqiqa amaliy misollar orqali ko'rib chiqing.<br>
                • <b>Mustahkamlash:</b> Darslikdagi 2-3 ta topshiriqni mustaqil yechishga yo'naltiring va 100 ballik e-Maktab ko'rsatkichini qayd eting! 🌟
            `;
        }
    } else if (qLower.includes("reels") || qLower.includes("short") || qLower.includes("video") || qLower.includes("insta") || qLower.includes("youtube") || qLower.includes("видео")) {
        if (isRu) {
            responseText = `
                <b>🎬 Анализ просмотренных Reels и видео:</b><br>
                Точные данные по видеоконтенту для <b>${child.name_ru || child.name} (${child.grade}-класс)</b>:<br><br>
                📊 <b>Распределение по темам:</b><br>
                • <b>💻 Образование и IT (Python, Робототехника, Языки):</b> 45% (Полезно)<br>
                • <b>🔬 Научные опыты и Логические задачи:</b> 25% (Положительно)<br>
                • <b>🎮 Развлечения и Игры:</b> 30% (В норме)<br><br>
                💡 <b>Рекомендация:</b> Чтобы алгоритм чаще рекомендовал обучающие видео, подпишитесь на полезные каналы по школьным предметам.
            `;
        } else {
            responseText = `
                <b>🎬 Ko'rilayotgan Reels va Video Kontent Tahlili:</b><br>
                Farzandingiz <b>${child.name} (${child.grade}-sinf)</b> tomosha qilayotgan Reels / Shorts videolari bo'yicha aniq ma'lumotlar:<br><br>
                📊 <b>Mavzular taqsimoti:</b><br>
                • <b>💻 Ta'limiy & IT (Python, Robototexnika, Ingliz tili):</b> 45% (Foydali va rivojlantiruvchi)<br>
                • <b>🔬 Ilmiy tajribalar & Mantiqiy jumboqlar:</b> 25% (Ijobiy tendensiya)<br>
                • <b>🎮 Ko'ngilochar va o'yin strimlari:</b> 30% (Me'yorida)<br><br>
                💡 <b>Tavsiya:</b> Algoritm ko'proq ta'limiy videolarni tavsiya qilishi uchun fanlar bo'yicha foydali kanallarga obuna bo'lishni yo'lga qo'ying.
            `;
        }
    } else if (qLower.includes("qiziqish") || qLower.includes("fan") || qLower.includes("dars") || qLower.includes("учеб") || qLower.includes("интерес")) {
        if (isRu) {
            responseText = `
                <b>📚 Усвоение предметов и повышение интереса:</b><br>
                Методы закрепления школьных предметов госстандарта (DTS) для <b>${child.name_ru || child.name} (${child.grade}-класс)</b>:<br>
                • <b>Практический подход:</b> Изучение математики и естественных наук через графические примеры и опыты гораздо эффективнее.<br>
                • <b>Аналитика:</b> Совместно просматривайте показатели 100 баллов в разделе e-Maktab.
            `;
        } else {
            responseText = `
                <b>📚 Darslarni O'zlashtirish va Qiziqishni Oshirish:</b><br>
                <b>${child.name} (${child.grade}-sinf)</b> uchun Davlat ta'lim standarti fanlarini mustahkamlash usullari:<br>
                • <b>Amaliy yondashuv:</b> Matematika va tabiiy fanlarni grafik misollar va tajribalar orqali o'rganish samaraliroq.<br>
                • <b>Haftalik tahlil:</b> e-Maktab bo'limidagi 100 ballik ko'rsatkichlarni birgalikda ko'rib, yuqori natijalarni qayd etib boring.
            `;
        }
    } else {
        if (isRu) {
            responseText = `
                <b>💡 Информация:</b> Расписание уроков, оценки 100 баллов, онлайн-локация и заряд батареи <b>${child.name_ru || child.name}</b> под постоянным контролем. Вы можете задать любой вопрос по предметам или лимитам.
            `;
        } else {
            responseText = `
                <b>💡 Ma'lumot:</b> Farzandingiz <b>${child.name} (${child.grade}-sinf)</b> ning dars jadvali, 100 ballik baholari, jonli joylashuvi va batareya ko'rsatkichlari doimiy nazorat ostida. Har qanday fan, video tahlili yoki limitlar bo'yicha savolingizni yozishingiz mumkin.
            `;
        }
    }

    appendAIMessage(responseText);
}

// Ovoz Yozish (Voice Recording)
function toggleVoiceRecording() {
    isRecordingVoice = !isRecordingVoice;
    const btn = document.getElementById('voiceRecordBtn');
    const status = document.getElementById('voiceRecordingStatus');

    if (isRecordingVoice) {
        btn.classList.add('recording');
        status.classList.remove('hidden');
    } else {
        stopAndSendVoice();
    }
}

function stopAndSendVoice() {
    isRecordingVoice = false;
    const btn = document.getElementById('voiceRecordBtn');
    const status = document.getElementById('voiceRecordingStatus');
    btn.classList.remove('recording');
    status.classList.add('hidden');

    const voiceUserText = (currentLang === 'ru') ? "🎙️ <i>[Голосовое сообщение: 0:08 сек]</i>" : "🎙️ <i>[Ovozli xabar: 0:08 sek]</i>";
    appendUserMessage(voiceUserText);
    setTimeout(() => {
        const voiceAIText = (currentLang === 'ru') 
            ? "🎙️ <b>Анализ голосового сообщения:</b> Ваш вопрос принят. Рекомендации по учебному процессу и привычкам подготовлены!"
            : "🎙️ <b>Ovozli Xabar Tahlili:</b> Savolingiz qabul qilindi. Farzandingizning dars jarayonini nazorat qilish bo'yicha yo'riqnoma tayyorlandi!";
        appendAIMessage(voiceAIText);
    }, 800);
}

// Rasm Yuklash
function handleImageSelected(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImageBase64 = e.target.result;
        document.getElementById('imagePreview').src = uploadedImageBase64;
        document.getElementById('imageFileName').innerText = file.name;
        document.getElementById('imagePreviewContainer').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

function clearImagePreview() {
    uploadedImageBase64 = null;
    document.getElementById('aiImageInput').value = "";
    document.getElementById('imagePreviewContainer').classList.add('hidden');
}

// ============================================================================
// 8. SUBPAGE, MAVZU VA LOKATSIYA BOSHQARUVI
// ============================================================================
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

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    const targetBtn = document.getElementById(`nav-${tabId}`);

    if (targetTab) targetTab.classList.add('active');
    if (targetBtn) targetBtn.classList.add('active');

    if (tabId === 'tab-radar' && mapInstance) {
        setTimeout(() => mapInstance.invalidateSize(), 200);
    }
}

function openSubpage(subpageId) {
    document.querySelectorAll('.subpage-modal').forEach(m => m.classList.remove('active'));
    const modal = document.getElementById(subpageId);
    if (modal) modal.classList.add('active');
}

function closeSubpage() {
    document.querySelectorAll('.subpage-modal').forEach(m => m.classList.remove('active'));
}

function triggerVoiceAlert() {
    const title = (currentLang === 'ru') ? "🎙️ Голосовой Радар" : "🎙️ Ovozli Radar";
    const msg = (currentLang === 'ru') 
        ? "Запрос локации отправлен ребёнку в виде звукового оповещения."
        : "Farzandingizga ota-ona joylashuv so'rovi ovozli bildirishnoma ko'rinishida yuborildi.";
    if (tg?.showPopup) {
        tg.showPopup({
            title: title,
            message: msg,
            buttons: [{ type: "ok" }]
        });
    } else {
        alert(msg);
    }
}

function copyPairingLink() {
    const link = `https://t.me/farzand_nazorat_bot?start=pair_${familyCode.replace("-", "")}`;
    navigator.clipboard.writeText(link).then(() => {
        const msg = (currentLang === 'ru') 
            ? "✅ Ссылка для подключения скопирована!"
            : "✅ Farzandni ulash havolasi nusxalandi!";
        alert(msg);
    });
}

// 9. LEAFLET MAP (BEPUL RADAR)
function initRadarMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl || mapInstance) return;

    const child = childrenDatabase[currentChildKey];
    mapInstance = L.map('map', { zoomControl: false, attributionControl: false }).setView([child.location.lat, child.location.lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapInstance);

    const childIcon = L.divIcon({
        className: 'custom-radar-icon',
        html: '<div class="radar-pin"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });
    childMarker = L.marker([child.location.lat, child.location.lng], { icon: childIcon }).addTo(mapInstance);

    const parentIcon = L.divIcon({
        className: 'parent-pin-icon',
        html: '<div style="width:12px;height:12px;background:#38bdf8;border:2px solid #fff;border-radius:50%;"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });
    parentMarker = L.marker([child.location.lat - 0.008, child.location.lng - 0.006], { icon: parentIcon }).addTo(mapInstance);
}

function updateMapCoordinates() {
    const child = childrenDatabase[currentChildKey];
    if (mapInstance && childMarker) {
        childMarker.setLatLng([child.location.lat, child.location.lng]);
        mapInstance.setView([child.location.lat, child.location.lng], 14);
    }
}

// DOM Init
document.addEventListener('DOMContentLoaded', () => {
    setTheme(currentTheme);
    applyLanguageTranslations();
    renderActiveChild();
    renderSchoolCurriculum();
    initRadarMap();
});
