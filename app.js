// ============================================================================
// XAVFSIZLIK: har bir bot so'roviga Telegram initData qo'shiladi.
//
// Edge Function endi imzolangan identitetni talab qiladi (ilgari u butunlay
// ochiq edi — oddiy curl bilan istalgan oilaga bola qo'shish mumkin edi).
// initData'ni har bir chaqiruv joyida qo'lda qo'shish o'rniga bitta yerda
// qilamiz: bot URL'iga ketadigan so'rovlar o'nga yaqin joyda tarqalgan va
// bittasi unutilsa, o'sha amal jimgina 401 bilan tushardi.
//
// Faqat shu bitta URL'ga tegadi; boshqa so'rovlar o'z holicha ketadi.
// ============================================================================
(function attachInitDataToBotCalls() {
    const BOT_FN = 'https://wfrclcwjeeqeqchmdhzw.supabase.co/functions/v1/ota-ona-bot';
    const nativeFetch = window.fetch.bind(window);
    window.fetch = function (input, init) {
        try {
            const url = (typeof input === 'string') ? input : (input && input.url) || '';
            if (url.indexOf(BOT_FN) === 0 && init && typeof init.body === 'string') {
                const payload = JSON.parse(init.body);
                if (payload && typeof payload === 'object' && !payload.initData && !payload.sessionToken) {
                    const initData =
                        (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) || '';
                    if (initData) {
                        payload.initData = initData;
                    } else {
                        // Telegramdan tashqarida (oddiy brauzer) initData yo'q —
                        // bu yerda login/parol orqali olingan seans ishlatiladi.
                        try {
                            const token = localStorage.getItem('web_session_token');
                            if (token) payload.sessionToken = token;
                        } catch (e) {}
                    }
                    init = Object.assign({}, init, { body: JSON.stringify(payload) });
                }
            }
        } catch (e) {
            // Body JSON emas — o'zgartirmasdan yuboramiz.
        }
        return nativeFetch(input, init);
    };
})();

let currentChildSubject = "Matematika";
// ============================================================================
// 📖 80 KB DARSLIK SAHIFASI KO'RUVCHISI (ULTRA FAST PAGE VIEWER)
// ============================================================================
let currentViewingTopic = null;

function openDtsPageViewer(grade, subject, chapter, page, rule, formula, example) {
    currentViewingTopic = { grade, subject, chapter, page, rule, formula, example };

    const titleEl = document.getElementById('bookViewerTitle');
    const subEl = document.getElementById('bookViewerSubtitle');
    const badgeEl = document.getElementById('pageSubjectBadge');
    const numEl = document.getElementById('pageNumberDisplay');
    const chNumEl = document.getElementById('pageChapterNumber');
    const chTitleEl = document.getElementById('pageChapterTitle');
    const ruleEl = document.getElementById('pageRuleText');
    const formulaDispEl = document.getElementById('pageFormulaDisplay');
    const formContEl = document.getElementById('pageFormulaContainer');
    const exEl = document.getElementById('pageExampleText');

    if (titleEl) titleEl.innerText = `${grade}-Sinf ${subject}`;
    if (subEl) subEl.innerText = `${page}-Sahifa • 80 KB Tezkor Nusxa`;
    if (badgeEl) badgeEl.innerText = `📚 ${grade}-SINF ${subject.toUpperCase()}`;
    if (numEl) numEl.innerText = `${page}-BET`;
    if (chNumEl) chNumEl.innerText = `${subject.toUpperCase()} • DTS DASTURI`;
    if (chTitleEl) chTitleEl.innerText = chapter;
    if (ruleEl) ruleEl.innerText = rule;

    if (formula && formulaDispEl && formContEl) {
        formContEl.classList.remove('hidden');
        formulaDispEl.innerText = formula;
    } else if (formContEl) {
        formContEl.classList.add('hidden');
    }

    if (exEl) {
        exEl.innerText = example || `Masala: ${chapter} mavzusi bo'yicha qoidani qo'llab, amallarni bajaring.`;
    }

    openSubpage('modal-book-page-viewer');
}

function askCurrentPageToAi() {
    if (!currentViewingTopic) return;
    closeSubpage();
    const inputChild = document.getElementById('childAiInput');
    if (inputChild) {
        inputChild.value = `${currentViewingTopic.chapter} (${currentViewingTopic.page}-bet) mavzusini tushuntir`;
        switchChildTab('child-tab-ai');
        handleChildAiSend();
    }
}

function shareOrDownloadPage() {
    if (!currentViewingTopic) return;
    alert(`✅ ${currentViewingTopic.grade}-sinf ${currentViewingTopic.subject} darsligining ${currentViewingTopic.page}-beti (80 KB WebP) yuklab olindi!`);
}

// ============================================================================
// 🧠 QALQON AI — 1-11 SINF DTS RAG BILIMLAR BAZASI & ENGINE
// ============================================================================
const DTS_KNOWLEDGE_BASE = [{"grade": 1, "subject": "Matematika", "chapter": "20 ichida qo'shish va ayirish", "page": 35, "rule": "Sonlarni qo'shishda o'nlik hosil qilish: masalan, 8 + 5 ni hisoblash uchun 5 soni 2 va 3 ga ajratiladi. 8 + 2 = 10, 10 + 3 = 13.", "formula": "a + b = c (Qo'shiluvchi + Qo'shiluvchi = Yig'indi)", "keywords": ["qo'shish", "ayirish", "1-sinf", "yig'indi", "ayirma", "sanoq"]}, {"grade": 2, "subject": "Matematika", "chapter": "Ko'paytirish va Bo'lish jadvali", "page": 48, "rule": "Ko'paytirish — bir xil qo'shiluvchilar yig'indisidir. Masalan: 3 * 4 = 3 + 3 + 3 + 3 = 12. Ko'paytuvchilar o'rni almashgani bilan ko'paytma o'zgarmaydi (a * b = b * a).", "formula": "a * b = c (Ko'paytuvchi * Ko'paytuvchi = Ko'paytma)", "keywords": ["ko'paytirish", "bo'lish", "jadval", "2-sinf", "ko'paytma"]}, {"grade": 3, "subject": "Ona tili va O'qish", "chapter": "So'z turkumlari: Ot, Sifat, Fe'l", "page": 56, "rule": "Shaxs va narsa nomini bildirgan so'zlar Ot (Kim? Nima?), belgisini bildirgan so'zlar Sifat (Qanday? Qanaqa?), harakatini bildirgan so'zlar Fe'l (Nima qildi? Nima qilyapti?) deyiladi.", "formula": "Ot: Kim? Nima? | Sifat: Qanday? | Fe'l: Nima qildi?", "keywords": ["ot", "sifat", "fe'l", "ona tili", "3-sinf", "so'z turkumi"]}, {"grade": 4, "subject": "Matematika", "chapter": "Ko'p xonali sonlar va Geometrik shakllar", "page": 74, "rule": "To'g'ri to'rtburchakning perimetri barcha tomonlari yig'indisiga teng: P = 2 * (a + b). Yuzi esa bo'yi va eni ko'paytmasiga teng: S = a * b.", "formula": "P = 2(a + b); S = a * b", "keywords": ["perimetr", "yuza", "to'g'ri to'rtburchak", "4-sinf", "geometriya"]}, {"grade": 5, "subject": "Matematika", "chapter": "Oddiy va O'nli Kasrlar", "page": 42, "rule": "Har xil maxrajli oddiy kasrlarni qo'shish yoki ayirish uchun avval ularni eng kichik umumiy maxrajga (EKUK) keltirish, so'ng suratlarni qo'shish yoki ayirish kerak. Kasrlarni ko'paytirishda surat suratga, maxraj maxrajga ko'paytiriladi.", "formula": "a/b + c/d = (a*d + c*b)/(b*d); (a/b) * (c/d) = (a*c)/(b*d)", "keywords": ["kasr", "oddiy kasr", "o'nli kasr", "maxraj", "surat", "5-sinf", "ekuk", "ekub"]}, {"grade": 5, "subject": "Ingliz tili", "chapter": "Present Simple Tense (Hozirgi oddiy zamon)", "page": 28, "rule": "Doimiy takrorlanadigan odatlar va faktlar uchun Present Simple ishlatiladi. He/She/It olmoshlaridan so'ng fe'lga -s yoki -es qo'shimchasi qo'shiladi. Inkor shakli: don't / doesn't + V1.", "formula": "Subject + Verb(s/es) | I work, He works | Do/Does + Subject + Verb?", "keywords": ["present simple", "ingliz tili", "5-sinf", "grammar", "verb", "tenses"]}, {"grade": 6, "subject": "Matematika", "chapter": "Nisbat, Proporsiya va Foizlar", "page": 64, "rule": "Ikki nisbatning tengligi proporsiya deyiladi: a/b = c/d. Proporsiyaning asosiy xossasi: chetki hadlar ko'paytmasi o'rta hadlar ko'paytmasiga teng (a * d = b * c). Sonning foizini topish uchun sonni foizga ko'paytirib 100 ga bo'linadi.", "formula": "a/b = c/d => a*d = b*c; A sonining p% = (A * p) / 100", "keywords": ["proporsiya", "foiz", "nisbat", "6-sinf", "matematika", "tenglama"]}, {"grade": 6, "subject": "Botanika", "chapter": "O'simlik hujayrasi va Fotosintez", "page": 38, "rule": "O'simliklar quyosh nuri, suv va karbonat angidrid (CO2) yordamida xlorofill orqali organik moddalar va kislorod (O2) ishlab chiqaradi. Bu jarayon fotosintez deyiladi.", "formula": "6CO2 + 6H2O + Quyosh nuri => C6H12O6 (Glyukoza) + 6O2", "keywords": ["fotosintez", "botanika", "hujayra", "xlorofill", "kislorod", "6-sinf"]}, {"grade": 7, "subject": "Algebra", "chapter": "Chiziqli tenglamalar va Qisqa ko'paytirish formulalari", "page": 55, "rule": "Qisqa ko'paytirish formulalari hisoblashni osonlashtiradi: Yig'indining kvadrati (a+b)^2 = a^2 + 2ab + b^2. Kvadratlar ayirmasi: a^2 - b^2 = (a-b)(a+b).", "formula": "(a + b)^2 = a^2 + 2ab + b^2; a^2 - b^2 = (a - b)(a + b)", "keywords": ["algebra", "qisqa ko'paytirish", "7-sinf", "kvadrat", "tenglama", "ko'phad"]}, {"grade": 7, "subject": "Fizika", "chapter": "Tezlik, Zichlik va Nyutonning 1-qonuni", "page": 40, "rule": "Tezlik — bosib o'tilgan yo'lning ketgan vaqtga nisbatidir: v = S / t. Jismning zichligi esa massaning hajmga nisbatidir: rho = m / V. Nyuton 1-qonuni: Jismga tashqi kuch ta'sir etmasa, u tinch turadi yoki to'g'ri chiziqli tekis harakatlanadi.", "formula": "v = S / t; rho = m / V; F = m * a", "keywords": ["fizika", "tezlik", "zichlik", "nyuton", "massa", "7-sinf", "kuch"]}, {"grade": 8, "subject": "Geometriya", "chapter": "Pifagor Teoremasi va To'g'ri burchakli uchburchak", "page": 78, "rule": "To'g'ri burchakli uchburchakda gipotenuza kvadratining qiymati katetlar kvadratlari yig'indisiga teng: c^2 = a^2 + b^2. Uchburchak ichki burchaklari yig'indisi har doim 180 gradusga teng.", "formula": "c^2 = a^2 + b^2; alpha + beta + gamma = 180°", "keywords": ["pifagor", "gipotenuza", "katet", "uchburchak", "geometriya", "8-sinf"]}, {"grade": 8, "subject": "Fizika", "chapter": "Elektr toki, Kuchlanish va Om qonuni", "page": 92, "rule": "Zanjir qismidagi tok kuchi (I) kuchlanishga (U) to'g'ri proporsional va qarshilikka (R) teskari proporsionaldir: I = U / R. Elektr toki zaryadlangan zarrachalarning tartibli harakatidir.", "formula": "I = U / R; P = U * I (Elektr quvvati)", "keywords": ["om qonuni", "tok kuchi", "kuchlanish", "qarshilik", "fizika", "8-sinf", "elektr"]}, {"grade": 8, "subject": "Kimyo", "chapter": "Mendeleyev davriy jadvali va Kimyoviy bog'lanish", "page": 62, "rule": "Elementlarning xossalari ularning atom yadrosi zaryadiga davriy bog'liqdir. Valentlik — atomning boshqa atomlarni biriktirib olish qobiliyati. Suv molekulasi H2O kovalent qutbli bog'lanishga ega.", "formula": "M(H2O) = 1*2 + 16 = 18 g/mol; n = m / M", "keywords": ["kimyo", "mendeleyev", "valentlik", "atom", "molekula", "8-sinf", "davriy qonun"]}, {"grade": 9, "subject": "Algebra", "chapter": "Kvadrat tenglamalar va Viyet Teoremasi", "page": 85, "rule": "ax^2 + bx + c = 0 kvadrat tenglama diskriminant D = b^2 - 4ac orqali yechiladi. D > 0 bo'lsa 2 ta ildiz, D = 0 bo'lsa 1 ta ildiz, D < 0 bo'lsa haqiqiy ildiz yo'q. Viyet teoremasi: x1 + x2 = -b/a, x1 * x2 = c/a.", "formula": "D = b^2 - 4ac; x = (-b +- sqrt(D)) / (2a); x1+x2 = -b/a, x1*x2 = c/a", "keywords": ["kvadrat tenglama", "diskriminant", "viyet", "ildiz", "algebra", "9-sinf"]}, {"grade": 10, "subject": "Algebra va Analiz", "chapter": "Trigonometrik funksiyalar va Asosiy ayniyatlar", "page": 110, "rule": "Asosiy trigonometrik ayniyat: sin^2(x) + cos^2(x) = 1. Tangens tg(x) = sin(x) / cos(x). Ikkilangan burchak formulasi: sin(2x) = 2*sin(x)*cos(x).", "formula": "sin^2(alpha) + cos^2(alpha) = 1; tg(alpha) = sin(alpha)/cos(alpha)", "keywords": ["trigonometriya", "sinus", "kosinus", "tangens", "10-sinf", "analiz"]}, {"grade": 10, "subject": "Fizika", "chapter": "Molekulyar fizika va Termodinamika qonunlari", "page": 95, "rule": "Ideal gaz holat tenglamasi (Mendeleyev-Klapeyron): P * V = (m/M) * R * T. Termodinamikaning 1-qonuni: Tizimga berilgan issiqlik miqdori uning ichki energiyasini oshirishga va tashqi kuchlarga qarshi ish bajarishga sarflanadi (Q = deltaU + A).", "formula": "P * V = nu * R * T; Q = deltaU + A", "keywords": ["termodinamika", "ideal gaz", "issiqlik", "fizika", "10-sinf", "klapeyron"]}, {"grade": 11, "subject": "Algebra va Analiz", "chapter": "Hosilalar va Integrallar (Matematik analiz)", "page": 130, "rule": "Hosila — funksiyaning o'zgarish tezligini ifodalaydi. (x^n)' = n * x^(n-1). Boshlang'ich funksiya (aniqmas integral) esa differensiallashning teskarisidir: integral(x^n dx) = (x^(n+1))/(n+1) + C.", "formula": "(x^n)' = n * x^(n-1); (sin x)' = cos x; integral(x^n dx) = x^(n+1)/(n+1) + C", "keywords": ["hosila", "integral", "differensial", "11-sinf", "analiz", "matematika"]}, {"grade": 11, "subject": "Fizika", "chapter": "Optika, Kvant fizikasi va Eynshteyn formulasi", "page": 145, "rule": "Yorug'lik ham to'lqin, ham zarracha (foton) tabiatiga ega (korpuskulyar-to'lqin dualizmi). Foton energiyasi E = h * nu ga teng. Eynshteynning mashhur massa va energiya ekvivalentligi formulasi: E = m * c^2.", "formula": "E = h * nu; E = m * c^2; lambda = c / nu", "keywords": ["kvant", "foton", "eynshteyn", "optika", "fizika", "11-sinf", "yorug'lik"]}, {"grade": 11, "subject": "Informatika", "chapter": "Python Dasturlash & Sun'iy Intellekt Asoslari", "page": 80, "rule": "Pythonda ma'lumotlar turlari (int, float, str, list, dict). Shart operatorlari (if-elif-else) va sikllar (for, while). Sun'iy intellekt (Machine Learning) ma'lumotlar to'plami (dataset) orqali naqshlarni o'rganadi.", "formula": "def calculate_dts(score): return 'A' if score >= 86 else 'B'", "keywords": ["python", "dasturlash", "informatika", "11-sinf", "ai", "algoritm"]}];


function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function safeAiHtml(text) {
    return escapeHtml(text).replace(/\n/g, '<br>');
}

function getTutorSubject() {
    const sel = document.getElementById('childAiSubject') || document.getElementById('aiSubject');
    if (sel && sel.value) return sel.value;
    return (typeof currentChildSubject === 'string' && currentChildSubject) ? currentChildSubject : 'Matematika';
}

function telegramInitDataHeader() {
    try {
        const raw = (typeof tg !== 'undefined' && tg?.initData) ? tg.initData : '';
        return raw ? { 'X-Telegram-Init-Data': raw } : {};
    } catch (e) {
        return {};
    }
}

function searchDtsKnowledge(query, gradeFilter = null) {
    if (!query) return null;
    const lowerQ = query.toLowerCase().trim();
    const words = lowerQ.split(/\s+/);

    let bestMatch = null;
    let maxScore = 0;

    DTS_KNOWLEDGE_BASE.forEach(module => {
        let score = 0;
        if (gradeFilter && module.grade === Number(gradeFilter)) {
            score += 3;
        }

        // Match keywords
        module.keywords.forEach(kw => {
            if (lowerQ.includes(kw.toLowerCase())) score += 4;
        });

        // Match subject or chapter
        if (lowerQ.includes(module.subject.toLowerCase())) score += 3;
        if (lowerQ.includes(module.chapter.toLowerCase())) score += 5;

        // Word overlap in rule
        words.forEach(w => {
            if (w.length > 3 && module.rule.toLowerCase().includes(w)) score += 1;
        });

        if (score > maxScore) {
            maxScore = score;
            bestMatch = module;
        }
    });

    return (maxScore >= 3) ? bestMatch : null;
}

// 📚 RAG e-Maktab Darsliklari Katalogi (1-11 Sinf DTS)
let activeDtsGradeFilter = 5;

function setDtsGradeFilter(grade) {
    activeDtsGradeFilter = grade;
    renderSchoolCurriculum();
}

function renderSchoolCurriculum() {
    const containerParent = document.getElementById('schoolCurriculumList');
    const containerChild = document.getElementById('childSchoolList');

    const filtered = DTS_KNOWLEDGE_BASE.filter(m => activeDtsGradeFilter === 'all' || m.grade === Number(activeDtsGradeFilter));

    let html = '';
    
    // Grade Filter Pills (1-11)
    let filterPillsHtml = `
        <div class="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
            <button onclick="setDtsGradeFilter('all')" class="px-3 py-1 rounded-xl text-[10px] font-bold transition flex-shrink-0 ${activeDtsGradeFilter === 'all' ? 'bg-cyan-500 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'}">Barcha Sinflar</button>
    `;
    for (let g = 1; g <= 11; g++) {
        const isActive = (activeDtsGradeFilter === g);
        filterPillsHtml += `
            <button onclick="setDtsGradeFilter(${g})" class="px-2.5 py-1 rounded-xl text-[10px] font-bold transition flex-shrink-0 ${isActive ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25' : 'bg-slate-800/80 text-slate-400 hover:text-white'}">${g}-Sinf</button>
        `;
    }
    filterPillsHtml += '</div>';

    filtered.forEach(item => {
        const itemJson = JSON.stringify(item).replace(/"/g, '&quot;');
        html += `
            <div class="glass-card p-3.5 space-y-2 border border-slate-700/60 hover:border-cyan-500/50 transition">
                <div class="flex items-center justify-between">
                    <span class="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-extrabold">
                        ${item.grade}-Sinf • ${item.subject}
                    </span>
                    <span class="text-[9px] text-cyan-400 font-mono font-bold">Darslik ${item.page}-bet (80 KB)</span>
                </div>
                <div>
                    <h4 class="text-xs font-black text-white">${item.chapter}</h4>
                    <p class="text-[11px] text-slate-300 leading-relaxed mt-1">${item.rule}</p>
                </div>
                ${item.formula ? `
                    <div class="p-2 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[10px] text-cyan-300">
                        📐 <b>Formula:</b> ${item.formula}
                    </div>
                ` : ''}
                <div class="pt-1 flex items-center justify-between gap-2 text-[10px]">
                    <button onclick="openDtsPageViewer(${item.grade}, '${item.subject}', '${item.chapter}', ${item.page}, '${item.rule.replace(/'/g, "\'")}', '${item.formula || ''}', '')" class="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-lg font-bold transition flex items-center justify-center gap-1">
                        <span>📖</span> Sahifani Ochish (80 KB)
                    </button>
                    <button onclick="askDtsTopic('${item.chapter}')" class="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg font-bold transition flex items-center gap-1">
                        <span>🤖</span> AI Yechim
                    </button>
                </div>
            </div>
        `;
    });

    const fullParentHtml = filterPillsHtml + (html || '<div class="text-center py-6 text-xs text-slate-400">Darslik topilmadi</div>');
    if (containerParent) containerParent.innerHTML = fullParentHtml;
    if (containerChild) containerChild.innerHTML = fullParentHtml;
}

function askDtsTopic(topic) {
    const inputChild = document.getElementById('childAiInput');
    if (inputChild) {
        inputChild.value = topic + " mavzusini misollar bilan tushuntir";
        switchChildTab('child-tab-ai');
        handleChildAiSend();
    }
}

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
        appSubtitle: "Guardian Intelligence — Ota-ona & Farzand",
        aboutShortDesc: "Hurmatli Ota-onalar! Qalqon AI dasturining bosh maqsadi — aslo bolaning orqasidan poyloqchilik qilish emas, balki mehr, o'zaro ishonch, raqamli xavfsizlik va darslarni 100 ballik DTS davlat standarti bo'yicha a'lo o'zlashtirishiga ko'maklashishdir.",
        aboutPrivacyNote: "Shaxsiy chatlar o'qilmaydi, faqat ta'limiy qiziqishlar tahlil qilinadi.",
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
        plansSub: "Bepul: 1 farzand / Pro: cheklovsiz",
        pairingSelect: "Farzandni Ulash & Android Ilova",
        pairingSub: "Oila kodi va avtomatik juftlash",
        feedbackTitle: "Taklif va Mulohazalar",
        feedbackSub: "alhamdulillah@tmail.ton orqali fikr yuborish",
        feedbackHeader: "Fikringiz biz uchun muhim!",
        feedbackDesc: "Dasturni yanada takomillashtirish, yangi darsliklar yoki qulayliklar bo'yicha takliflaringizni to'g'ridan-to'g'ri ishlab chiquvchilarga yuboring.",
        feedbackEmailLabel: "Rasmiy qabul pochtasi:",
        openGmailBtn: "Gmail orqali xat yozish",
        openDefaultMailBtn: "Boshqa pochta dasturi orqali",
        demoModeTitle: "Test / Demo Rejimi",
        demoModeSub: "Admin tasdig'i bilan farzand qo'shish ochiladi",
        loginRegisterBtn: "🔑 Kirish / Ro'yxat",
        authSettingsTitle: "Ota-ona Hisobi & Kirish",
        authSettingsSub: "Holat: Test Rejimida",
        authModalTitle: "Ota-ona Hisobi",
        tabRegister: "📝 Ro'yxatdan o'tish",
        tabLogin: "🔑 Kirish",
        regHeader: "Ota-ona Profilini Yaratish",
        regSub: "Username va parol tanlang. So'rov adminga yuboriladi.",
        regUsernameLabel: "Telegram Usernamesi / Ism",
        regPasswordLabel: "Parol Tanlang",
        regConfirmPasswordLabel: "Parolni Takrorlang",
        btnSubmitRegister: "📝 Ro'yxatdan O'tish & So'rov Yuborish",
        loginHeader: "Tizimga Kirish",
        loginSub: "Avval ro'yxatdan o'tgan parolingizni kiriting",
        loginUsernameLabel: "Telegram Usernamesi",
        loginPasswordLabel: "Parol",
        btnSubmitLogin: "🚀 Kirish",
        approvalNoticeTitle: "Admin Tasdig'i Kutilmoqda",
        approvalNoticeHeader: "So'rovingiz Administrator Ko'rib Chiqishida",
        // Tarjimalar innerText bilan qo'yiladi, ya'ni <br> matn bo'lib
        // ko'rinadi. Shuning uchun bu yerda haqiqiy qator ko'chirish — u
        // innerText'da to'g'ri bo'linadi va HTML kiritish yo'li ham ochilmaydi.
        approvalNoticeDesc: "Siz hozirda Test / Demo rejimidan foydalanmoqdasiz. Barcha bo'limlar (Radar, AI, e-Maktab) siz uchun ko'rishga ochiq.\n\nHaqiqiy farzand ma'lumotlarini saqlash va qurilmani ulash administrator ruxsat berganidan so'ng faollashadi.",
        roleParent: "Ota-ona Paneli",
        roleChild: "Farzand Paneli",
        childWelcomeTitle: "Salom, Yosh Qahramon! 🌟",
        childWelcomeSub: "Sening shaxsiy aqlli yordamching va xavfsizlik qalqoning",
        childGoalTitle: "🎯 Tizimning Asosiy Maqsadi Nima?",
        childGoalDesc: "Bu dastur seni nazorat qilish yoki jazolash uchun emas! Asosiy maqsad — darslarda a'lochi bo'lishing, qiyin masalalarni oson yechishing, vaqtingni qiziqarli o'tkazishing va xavfsizligingni ta'minlashda senga eng yaqin aqlli do'st bo'lishdir.",
        childBenefitsTitle: "🌟 Senga Qanday Katta Afzalliklari Bor?",
        childBenefit1Title: "Gemini AI Aqlli Murabbiy",
        childBenefit1Desc: "Tushunarsiz darslik misollarini rasmga olib yubor, u senga oddiy va qiziqarli qilib tushuntirib beradi.",
        childBenefit2Title: "100 Ballik e-Maktab & Rag'bat",
        childBenefit2Desc: "Fanlardan yuqori ball to'plab, ota-onang bilan kelishgan holda maxsus mukofotlar va sayrlar yutib olasan.",
        childBenefit3Title: "Xotirjam Ota-ona",
        childBenefit3Desc: "Maktabdan yoki to'garakdan eson-omon uyga yetganingda ota-onang xavotir olmasligi uchun xarita yordam beradi.",
        childReelsTitle: "🎬 YouTube & Reels Tahlili Qanday Ishlaydi?",
        childPrivacyGuarantee: "Maxfiylik Kafolati:",
        childReelsDesc: "Biz sening shaxsiy yozishmalaringni (chatlaringni) yoki aynan qaysi videoni ko'rganingni tomosha qilmaymiz! Faqat qaysi fanlarga (IT dasturlash, Mantiq, Ilmiy tajribalar, Ingliz tili) qiziqayotganing mavzusi va daqiqalari ota-onang bilan birga yangi ko'nikmalarni rivojlantirishing uchun tahlil qilinadi.",
        childAppsTitle: "📱 Ilovalar Balansi & Ko'rish Qobiliyati",
        childAppsDesc: "Telefon ko'zni charchatmasligi va darslarga xalaqit bermasligi uchun har kungi foydalanish vaqti me'yori saqlanadi. Ilovalardan o'z vaqtida to'g'ri foydalanib, vaqtni unumli rejalashtirishni o'rganasan.",
        childPairingHeader: "Oila Profiliga Ulanish & Rozilik",
        childPairingSub: "Ota-onang bergan 8 belgili kodni kirit",
        childConsentLabel: "Men yuqoridagi barcha 4 ta qoida bilan tanishdim va ota-onam bilan tizimga ulanishga roziman.",
        childInputCodeLabel: "8 Belgili Kod:",
        btnChildConnect: "Oila Profiliga Ulanish",
        childPairedSuccess: "🎉 Tabriklaymiz! Siz Oila Profiliga Muvaffaqiyatli Ulandingiz!",
        childPairedSub: "Ota-onangizning Telegram botiga xabar yuborildi.",
        childNavHome: "Asosiy",
        childNavAi: "AI Do'st",
        childNavRewards: "Yutuqlar",
        childNavSchool: "e-Maktabim",
        childNavExplore: "Qiziqishlar",
        aboutAppTitle: "Dastur Haqida & Asosiy Maqsad",
        aboutAppSub: "Poyloqchilik emas — mehr, xavfsizlik va darslik nazorati",
        aboutAppModalTitle: "Dastur Haqida & Bizning Maqsadimiz",
        aboutManifestTitle: "Poyloqchilik Emas — Mehr, Ishonch va Xavfsizlik!",
        aboutManifestSubtitle: "Zamonaviy raqamli dunyoda farzandingizning eng yaqin himoyachisi",
        aboutText1: "Hurmatli ota-onalar! Qalqon AI tizimining bosh falsafasi hech qachon bolaning orqasidan poyloqchilik qilish yoki uning shaxsiy erkinligini cheklash emas.",
        aboutText2: "Bizning asosiy maqsadimiz — farzandimizni raqamli xavf-xatarlardan asrash, darslarni 100 ballik DTS davlat standarti bo'yicha a'lo o'zlashtirishiga yordam berish va oilada o'zaro ishonch muhitini mustahkamlashdir.",
        aboutPrivacyHead: "100% Shaffoflik va Maxfiylik:",
        aboutPrivacyBody: "Biz shaxsiy chatlarni o'qimaymiz va videolarni tomosha qilmaymiz. Tizim faqat qiziqish vektorlari va darsliklar tahlilini yuritadi.",
        aboutAiHead: "Gemini AI Yordamchi & Repetitor:",
        aboutAiBody: "Qiyin darslik topshiriqlarini rasmga olib yuborish orqali bolaga do'stona va tushunarli yechimlar taqdim etiladi.",
        aboutContactHint: "Loyiha bo'yicha taklif, mulohaza va murojaatlaringiz uchun rasmiy manzil:",
        writeGmailBtn: "Gmail orqali xat yozish",
        appStatsTitle: "Dastur Statistikasi & Dinamika",
        appStatsSub: "14,820+ Ota-onalar, 23,450+ Farzandlar",
        appStatsModalTitle: "Dastur Statistikasi & Dinamika",
        statParentsLabel: "Ulangan Ota-onalar",
        statChildrenLabel: "Ulangan Farzandlar",
        navDashboard: "Asosiy",
        navRadar: "Radar",
        navAi: "AI Murabbiy",
        navSchool: "e-Maktab 💎",
        navSettings: "Sozlamalar",
        backBtn: "← Orqaga",
        nameLabel: "Ism va Familiyasi",
        usernameLabel: "Telegram Usernamesi",
        phoneLabel: "Telefon Raqami",
        classLabel: "Sinfi (1-11 Sinf DTS)",
        saveProfileBtn: "💾 Saqlash va Darsliklarni Yangilash",
        freePlanBadge: "Bepul Tarif (Free)",
        freePlanTitle: "Free Basic",
        freePlanDesc: "Jonli radar. Bepul: 1 farzand, 48 soatda 2 joylashuv so'rovi",
        freePrice: "0 so'm",
        foreverFree: "Hozirda bepul",
        freeQualityNotice: "Eslatma: Tizim sifati va serverlar barqarorligini ta'minlash maqsadida kelajakda bepul versiyaga ham juda kam (ramziy) miqdorda to'lov joriy etilishi mumkin.",
        proPlanBadge: "Premium Farzand Nazorati",
        proPlanTitle: "Pro Versiya 💎",
        proPlanDesc: "🧠 Gemini AI Murabbiy (Ovoz/Rasm/Matn), 📚 1-11 Sinf DTS e-Maktab 100 ballik tahlil va 🎬 Reels chuqur tahlili",
        proPrice: "10,000",
        perChildMonth: "so'm / oy (har bir bola uchun)",
        activateProBtn: "💎 Pro Versiyani Faollashtirish",
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
        plansSub: "Free (Локация) / Pro (10 000 сум)",
        pairingSelect: "Подключение Ребёнка и Android App",
        pairingSub: "Код семьи и авто-привязка",
        feedbackTitle: "Предложения и Отзывы",
        feedbackSub: "Отправить отзыв на alhamdulillah@tmail.ton",
        feedbackHeader: "Ваше мнение важно для нас!",
        feedbackDesc: "Отправьте свои предложения по улучшению программы, новым предметам или удобствам напрямую разработчикам.",
        feedbackEmailLabel: "Официальная почта для приёма:",
        openGmailBtn: "Написать через Gmail",
        openDefaultMailBtn: "Другой почтовый клиент",
        aboutAppTitle: "О Программе и Главной Цели",
        aboutAppSub: "Не слежка — а забота, безопасность и помощь в учёбе",
        aboutAppModalTitle: "О Программе и Нашей Миссии",
        aboutManifestTitle: "Не Слежка — а Любовь, Доверие и Безопасность!",
        aboutManifestSubtitle: "Главный защитник вашего ребёнка в цифровом мире",
        aboutText1: "Уважаемые родители! Главная философия Qalqon AI — это ни в коем случае не слежка и не ограничение свободы ребёнка.",
        aboutText2: "Наша главная цель — защитить детей от цифровых угроз, помочь учиться на 100 баллов по стандартам DTS и построить атмосферу взаимного доверия в семье.",
        aboutPrivacyHead: "100% Прозрачность и Приватность:",
        aboutPrivacyBody: "Мы не читаем личные чаты и не смотрим видео. Анализируются только векторы интересов и успеваемость.",
        aboutAiHead: "Gemini AI Репетитор и Наставник:",
        aboutAiBody: "Сфотографируйте сложное задание из учебника, и AI объяснит решение простым и понятным языком.",
        aboutContactHint: "Официальный адрес для предложений и связи с создателями:",
        writeGmailBtn: "Написать через Gmail",
        appStatsTitle: "Статистика Программы и Динамика",
        appStatsSub: "14,820+ Родителей, 23,450+ Детей",
        appStatsModalTitle: "Статистика Программы и Динамика",
        statParentsLabel: "Подключённых Родителей",
        statChildrenLabel: "Подключённых Детей",
        demoModeTitle: "Аккаунт Родителя",
        demoModeSub: "Полный доступ активен",
        loginRegisterBtn: "🔑 Вход / Регистрация",
        authSettingsTitle: "Аккаунт Родителя и Вход",
        authSettingsSub: "Статус: Активен (Вход)",
        authModalTitle: "Аккаунт Родителя",
        tabRegister: "📝 Регистрация",
        tabLogin: "🔑 Вход",
        regHeader: "Создание Профиля Родителя",
        regSub: "Выберите логин и пароль для входа в панель.",
        regUsernameLabel: "Telegram Username / Имя",
        regPasswordLabel: "Выберите Пароль",
        regConfirmPasswordLabel: "Повторите Пароль",
        btnSubmitRegister: "📝 Зарегистрироваться",
        loginHeader: "Вход в Систему",
        loginSub: "Введите ваш ранее созданный пароль",
        loginUsernameLabel: "Telegram Username",
        loginPasswordLabel: "Пароль",
        btnSubmitLogin: "🚀 Войти",
        approvalNoticeTitle: "Полный Доступ Активен",
        approvalNoticeHeader: "Добро пожаловать в Qalqon AI!",
        approvalNoticeDesc: "Все разделы (Радар, Gemini AI, e-Maktab 100 баллов) открыты для вас без ограничений.",
        roleParent: "Панель Родителя",
        roleChild: "Панель Ребёнка",
        childWelcomeTitle: "Привет, Юный Герой! 🌟",
        childWelcomeSub: "Твой умный помощник по учёбе и щит безопасности",
        childGoalTitle: "🎯 Какова Главная Цель Системы?",
        childGoalDesc: "Это приложение создано не для наказаний или слежки! Главная цель — помочь тебе учиться на отлично, легко решать сложные задачи, полезно проводить время и быть в безопасности.",
        childBenefitsTitle: "🌟 Какие Супер-Возможности Ты Получаешь?",
        childBenefit1Title: "Умный Наставник Gemini AI",
        childBenefit1Desc: "Сфотографируй сложный пример из учебника, и AI объяснит решение просто и понятно.",
        childBenefit2Title: "100-Балльный e-Maktab и Награды",
        childBenefit2Desc: "Получай высокие баллы по предметам и выигрывай классные призы и прогулки от родителей.",
        childBenefit3Title: "Спокойствие Родителей",
        childBenefit3Desc: "Родители не волнуются, видя, что ты благополучно добрался до школы или секции.",
        childReelsTitle: "🎬 Как Работает Анализ YouTube и Reels?",
        childPrivacyGuarantee: "Гарантия Приватности:",
        childReelsDesc: "Мы НЕ читаем твои личные переписки (чаты) и не смотрим твои видео! Анализируются только темы интересов (IT-программирование, Логика, Наука, Английский) и время для твоего развития.",
        childAppsTitle: "📱 Баланс Приложений и Здоровье Глаз",
        childAppsDesc: "Норма экранного времени помогает беречь зрение и не отвлекаться от уроков, распределяя время с пользой.",
        childPairingHeader: "Подключение к Семье с Согласием",
        childPairingSub: "Введите 8-значный код от родителей",
        childConsentLabel: "Я ознакомился со всеми 4 правилами и согласен на подключение к родительскому профилю.",
        childInputCodeLabel: "8-значный код:",
        btnChildConnect: "Подключиться к Семье",
        childPairedSuccess: "🎉 Поздравляем! Вы успешно подключены к семейному профилю!",
        childPairedSub: "Уведомление отправлено родителям в Telegram-бот.",
        childNavHome: "Главная",
        childNavAi: "AI Друг",
        childNavRewards: "Награды",
        childNavSchool: "e-Maktab",
        childNavExplore: "Интересы",
        navDashboard: "Главная",
        navRadar: "Радар",
        navAi: "AI Наставник 💎",
        navSchool: "e-Maktab 💎",
        navSettings: "Настройки",
        backBtn: "← Назад",
        nameLabel: "Имя и Фамилия",
        usernameLabel: "Telegram Username",
        phoneLabel: "Номер Телефона",
        classLabel: "Класс (1-11 Классы DTS)",
        saveProfileBtn: "💾 Сохранить и Обновить Учебники",
        freePlanBadge: "Бесплатный Тариф",
        freePlanTitle: "Free Basic",
        freePlanDesc: "Живой радар. Бесплатно: 1 ребёнок, 2 запроса за 48 часов",
        freePrice: "0 сум",
        foreverFree: "Сейчас бесплатно",
        freeQualityNotice: "Примечание: В целях повышения качества и стабильности серверов в будущем для бесплатной версии также может быть введена минимальная символическая плата.",
        proPlanBadge: "Премиум Контроль",
        proPlanTitle: "Pro Версия 💎",
        proPlanDesc: "🧠 Gemini AI Наставник (Голос/Фото/Текст), 📚 1-11 классы DTS e-Maktab анализ 100 баллов и 🎬 Анализ Reels",
        proPrice: "10,000",
        perChildMonth: "сум / месяц (за каждого ребёнка)",
        activateProBtn: "💎 Активировать Pro Версию",
        activeProBtn: "✅ Pro Активирован",
        autoPairTitle: "🔑 Ваш Семейный Код (Автоматический):",
        familyCodeHint: "Введите на телефоне ребёнка или отправьте ссылку",
        pairingInstruction: "Ребёнок подключается без участия администратора:\n1. Отправьте эту ссылку ребёнку:",
        copyPairLinkBtn: "🔗 Скопировать Ссылку Подключения"
    }
};

// 3. DINAMIK KO'P FARZANDLIK VA PROFIL BOSHQARUVI (LOCALSTORAGE & UNIQUE ID)
const DEFAULT_INITIAL_CHILDREN = {
    "CH-101": {
        id: "CH-101",
        name: "Aliyor Valijonov",
        name_ru: "Алиёр Валиджонов",
        username: "@aliyor_v",
        phone: "+998 90 123 45 67",
        grade: 5,
        battery: 86,
        screenTime: "2s 45d",
        screenTime_ru: "2ч 45м",
        remaining: "1s 30d",
        remaining_ru: "1ч 30м",
        location: {
            lat: 41.3145,
            lng: 69.2812,
            address: "Yunusobod 4-mavze, 24-maktab",
            address_ru: "Юнусабад 4-й квартал, 24-я школа",
            geofences: [
                { name: "🏠 Uy / Дом", status: "Xavfsiz / Безопасно", color: "text-emerald-400" },
                { name: "🏫 24-Maktab / 24-Школа", status: "Ichida (Faol) / Внутри", color: "text-sky-400" }
            ]
        },
        apps: [
            { name: "YouTube", time: "1s 15d", percent: 35, category: "Ta'lim / Video", color: "bg-red-500", icon: "▶️" },
            { name: "Instagram (Reels)", time: "45d", percent: 25, category: "Ijtimoiy Tarmoq", color: "bg-pink-500", icon: "📸" },
            { name: "Telegram", time: "35d", percent: 20, category: "Muloqot", color: "bg-sky-500", icon: "💬" },
            { name: "Duolingo", time: "25d", percent: 12, category: "Til O'rganish", color: "bg-emerald-500", icon: "🦉" },
            { name: "O'yinlar", time: "15d", percent: 8, category: "O'yin", color: "bg-amber-500", icon: "🎮" }
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
                { topic: "Английский разговорный", percent: 65, color: "bg-purple-500" }
            ]
        }
    }
};

function loadChildrenDatabase() {
    try {
        const saved = localStorage.getItem('qalqon_children_database');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && Object.keys(parsed).length > 0) return parsed;
        }
    } catch(e) {}
    return DEFAULT_INITIAL_CHILDREN;
}

function saveChildrenDatabase() {
    try {
        localStorage.setItem('qalqon_children_database', JSON.stringify(childrenDatabase));
    } catch(e) {}
}

let childrenDatabase = loadChildrenDatabase();
let currentChildKey = Object.keys(childrenDatabase)[0] || "CH-101";

function renderChildSelectDropdown() {
    const select = document.getElementById('childSelect');
    if (!select) return;
    select.innerHTML = Object.keys(childrenDatabase).map(k => {
        const c = childrenDatabase[k];
        const isSelected = (k === currentChildKey) ? 'selected' : '';
        return `<option value="${k}" ${isSelected}>👦 ${c.name} (${c.grade}-sinf [ID: ${k}])</option>`;
    }).join('');
}

function switchChild(childKey) {
    if (childrenDatabase[childKey]) {
        currentChildKey = childKey;
        renderActiveChild();
        renderSchoolCurriculum();
        updateMapCoordinates();
    }
}

// Ota-ona paneli farzandlar ro'yxatini serverdan oladi. Ilgari ro'yxat
// faqat localStorage'dagi demo ma'lumotdan iborat edi — shuning uchun
// boshqa qurilmadan kirilganda yoki ilova qayta o'rnatilganda qo'shilgan
// farzandlar umuman ko'rinmasdi.
//
// So'rov backend'ning /api/v1/parent/children endpointiga emas, bot Edge
// Function'iga boradi: backend Render'ning bepul tarifida sovuq startda
// ~50 soniya javob bermaydi, Edge Function esa doim issiq.
const QALQON_BOT_FN = 'https://wfrclcwjeeqeqchmdhzw.supabase.co/functions/v1/ota-ona-bot';

function buildChildRecord(serverChild, existing) {
    // Panelning qolgan qismi (xarita, ilovalar, qiziqishlar) hali demo
    // ma'lumot bilan ishlaydi, shuning uchun yangi farzand uchun o'sha
    // tuzilmadan nusxa olamiz va ustidan haqiqiy maydonlarni yozamiz.
    const base = existing || JSON.parse(JSON.stringify(DEFAULT_INITIAL_CHILDREN["CH-101"]));
    base.id = serverChild.child_id;
    base.name = serverChild.child_name || base.name;
    base.name_ru = base.name;
    if (serverChild.grade) base.grade = serverChild.grade;
    if (serverChild.telegram_username) base.username = '@' + serverChild.telegram_username;
    else if (serverChild.device_label) base.username = serverChild.device_label;
    // Ota-ona qo'shgan, lekin farzand hali rozilik bermagan yozuv.
    base.pending = (serverChild.source === 'parent_invite');
    return base;
}

/**
 * Oila kodini SERVERDAN oladi va ko'rsatadi.
 *
 * Ilgari kod resolveInitialFamilyCode() orqali localStorage'dan o'qilardi
 * va u yerda eski qiymat (masalan 849210) turib qolardi — shuning uchun har
 * foydalanuvchida o'z kodi bo'lishi kerak bo'lsa-da, telefonda saqlangan
 * eskisi ko'rinaverardi. Endi manba faqat server: u kodni imzolangan
 * Telegram identitetidan o'zi chiqaradi.
 *
 * Shu bilan birga admin tasdig'i holatini ham oladi va kerak bo'lsa
 * "Admin Tasdig'i Kutilmoqda" oynasini ko'rsatadi (u index.html da bor edi,
 * lekin hech qachon ochilmasdi).
 */
// ============================================================================
// TELEGRAMDAN TASHQARIDA KIRISH
//
// Telegram ichida initData bor — u imzolangan va paroldan kuchliroq, shuning
// uchun u yerda hech qanday login so'ralmaydi. Oddiy brauzerda esa initData
// yo'q: faqat shu holatda login/parol oynasi ochiladi.
// ============================================================================
function hasTelegramIdentity() {
    return !!(window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData);
}

function webSessionToken() {
    try { return localStorage.getItem('web_session_token'); } catch (e) { return null; }
}

function showWebLogin(show) {
    const overlay = document.getElementById('webLoginOverlay');
    if (overlay) overlay.classList.toggle('hidden', !show);
}

/** Kirish oynasi kerakmi: Telegram identifikatori ham, seans ham bo'lmasa. */
function checkWebLoginNeeded() {
    const wantsLogin = new URLSearchParams(window.location.search).get('mode') === 'login';
    if (hasTelegramIdentity() && !wantsLogin) return false;
    if (!hasTelegramIdentity() && !webSessionToken()) { showWebLogin(true); return true; }
    if (wantsLogin && !hasTelegramIdentity()) { showWebLogin(true); return true; }
    return false;
}

async function handleWebLogin() {
    const userEl = document.getElementById('webLoginUsername');
    const passEl = document.getElementById('webLoginPassword');
    const errEl = document.getElementById('webLoginError');
    const btn = document.getElementById('webLoginBtn');

    const username = (userEl?.value || '').trim().replace('@', '');
    const password = passEl?.value || '';

    const fail = (msg) => {
        if (errEl) { errEl.innerText = msg; errEl.classList.remove('hidden'); }
    };

    if (!username || !password) return fail('Login va parolni kiriting.');
    if (errEl) errEl.classList.add('hidden');
    if (btn) { btn.disabled = true; btn.innerText = '⏳ Tekshirilmoqda...'; }

    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'web_login', username, password })
        });
        const data = await resp.json();
        if (!data.ok) return fail(data.error || "Kirish amalga oshmadi.");

        try {
            localStorage.setItem('web_session_token', data.sessionToken);
            if (data.familyCode) localStorage.setItem('parent_family_code', data.familyCode);
        } catch (e) {}
        showWebLogin(false);
        window.location.reload();
    } catch (e) {
        console.error('web_login error:', e);
        fail("Server javob bermayapti. Keyinroq urinib ko'ring.");
    } finally {
        if (btn) { btn.disabled = false; btn.innerText = '🔐 Kirish'; }
    }
}

// Parol allaqachon qo'yilganmi (serverdan). Parolning o'zi hech qachon
// qaytarilmaydi — faqat shu belgi.
let savedProfileHasPassword = false;

/** Serverda saqlangan oila yozuvini ro'yxatdan o'tish formasiga qaytaradi. */
function applySavedFamilyProfile(profile) {
    savedProfileHasPassword = !!profile.password_set;
    const pwField = document.getElementById('onboardPassword');
    if (pwField && savedProfileHasPassword) {
        pwField.placeholder = "Parol o'rnatilgan — o'zgartirish uchun yangisini yozing";
    }
    const set = (id, value) => {
        const el = document.getElementById(id);
        if (el && value !== null && value !== undefined && value !== '') el.value = value;
    };
    set('onboardFamilyName', profile.family_name);
    set('onboardParentName', profile.parent_name);
    set('onboardParentPhone', profile.parent_phone);
    set('onboardParentUsername', profile.parent_username);
    set('onboardMotherName', profile.mother_name);
    set('onboardMotherUsername', profile.mother_username);
    set('onboardChildName', profile.child_name);
    set('onboardChildUsername', profile.child_username);
    if (profile.child_grade) set('onboardChildGrade', String(profile.child_grade));
}

async function syncFamilyFromServer() {
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'my_family' })
        });
        const data = await resp.json();
        if (!data || !data.ok || !data.familyCode) return false;

        familyCode = String(data.familyCode);

        // Telefonda qolgan eski kodni ham yangilaymiz, aks holda ilova
        // keyingi ochilishida yana eskisini ko'rsatardi.
        try {
            localStorage.setItem('parent_family_code', familyCode);
            const prof = JSON.parse(localStorage.getItem('qalqon_family_profile') || 'null') || {};
            prof.code = familyCode;
            localStorage.setItem('qalqon_family_profile', JSON.stringify(prof));
        } catch (e) {}

        updateDisplayFamilyCode();

        // Ro'yxatdan o'tish oynasi endi SERVER holatiga qarab ochiladi, mahalliy
        // "bir marta ko'rsatildi" belgisiga emas — aks holda avval sinab ko'rgan
        // qurilmada (yoki admin username'da) hech qachon ko'rinmay qolardi,
        // haqiqiy ota-ona esa hech qachon ro'yxatdan o'tmasdan panelga kirib
        // ketardi. "none" — hali so'rov yuborilmagan: shu yerda kiritish oynasi
        // majburiy ochiladi (yopish mumkin — Test Rejimi shu tugma orqali).
        // Saqlangan oila ma'lumotlarini formaga qaytaramiz. Ilgari yozuv
        // qayta o'qilmasdi: ro'yxatdan o'tgan odam qaytib kirsa forma bo'sh
        // ochilib, u qaytadan to'ldirar va adminga yana so'rov ketardi.
        if (data.profile) applySavedFamilyProfile(data.profile);

        if (currentAppRole === 'parent') {
            if (data.registrationStatus === 'none') {
                openSubpage('modal-parent-onboarding');
            } else if (data.registrationStatus === 'pending') {
                openSubpage('modal-approval-notice');
            }
        }
        return true;
    } catch (e) {
        console.error('syncFamilyFromServer error:', e);
        return false;
    }
}

// ============================================================================
// JOYLASHUV SO'ROVI VA TARIF CHEKLOVI (panel tomoni)
//
// Kvota SERVERDA hisoblanadi (Edge Function: request_location). Bu yerdagi
// kod faqat natijani ko'rsatadi - hisobni takrorlamaydi. Aks holda ikki
// joyda ikki xil hisob paydo bo'lib, biri ikkinchisiga yolg'on gapirardi.
// ============================================================================

/** Panelda "2 tadan 1 tasi qoldi" kabi yozuvni yangilaydi. */
function renderQuotaBadge(remaining, plan) {
    const el = document.getElementById('locationQuotaBadge');
    if (!el) return;
    if (plan === 'pro') {
        el.textContent = 'Pro - cheklovsiz';
        el.className = 'text-[10px] font-bold text-amber-300';
        return;
    }
    el.textContent = remaining > 0
        ? ('Bepul: yana ' + remaining + ' ta so\'rov')
        : 'Bepul limit tugadi';
    el.className = remaining > 0
        ? 'text-[10px] font-bold text-slate-400'
        : 'text-[10px] font-bold text-rose-400';
}

/** Pro taklifi. 402 javobidagi sabab shu yerda ko'rsatiladi. */
function showProOffer(reason) {
    const box = document.getElementById('proOfferBox');
    if (!box) {
        alert(reason);
        return;
    }
    box.classList.remove('hidden');
    const txt = document.getElementById('proOfferText');
    if (txt) txt.textContent = reason;
}

/** Tarif holatini serverdan olib, panelga yozadi. */
async function refreshPlanStatus() {
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'plan_status' })
        });
        const data = await resp.json();
        if (!data || !data.ok) return;
        renderQuotaBadge(data.remaining, data.plan);
    } catch (e) {
        console.error('refreshPlanStatus error:', e);
    }
}

/**
 * Farzandning joylashuvini so'raydi.
 *
 * Server 402 qaytarsa - bu xato emas, tarif chegarasi: shuning uchun
 * "xatolik yuz berdi" emas, Pro taklifi ko'rsatiladi.
 */
async function requestChildLocation() {
    const btn = document.getElementById('requestLocationBtn');
    const childId = currentChildKey;
    if (!childId) {
        alert("Avval farzandni tanlang.");
        return;
    }

    if (btn) { btn.disabled = true; btn.textContent = '📍 So\'ralmoqda...'; }
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'request_location', childId: childId })
        });
        const data = await resp.json();

        if (resp.status === 402 || data.upgradeRequired) {
            renderQuotaBadge(0, data.plan || 'free');
            showProOffer(data.error || 'Bu imkoniyat Pro tarifda mavjud.');
            return;
        }
        if (!data.ok) {
            alert(data.error || "Joylashuvni olib bo'lmadi.");
            return;
        }

        renderQuotaBadge(data.remaining, data.plan);

        if (data.location) {
            const addr = document.getElementById('radarAddress');
            if (addr) {
                // Vaqtsiz nuqta aldaydi: 3 soat oldingi joy ham "hozirgi"
                // bo'lib ko'rinardi. Shuning uchun har doim qachon olingani.
                const at = new Date(data.location.recorded_at);
                const agoMin = Math.max(0, Math.floor((Date.now() - at) / 60000));
                const ago = agoMin < 2 ? 'hozirgina'
                    : agoMin < 60 ? agoMin + ' daqiqa oldin'
                    : agoMin < 2880 ? Math.floor(agoMin / 60) + ' soat oldin'
                    : Math.floor(agoMin / 1440) + ' kun oldin';
                const coords = data.location.lat.toFixed(5) + ', ' + data.location.lng.toFixed(5) +
                    ' · 🕒 ' + at.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) + ' (' + ago + ')';
                // Jonli ulashish yoqilgan bo'lsa — buni aniq ko'rsatamiz,
                // chunki "jonli" bilan "oxirgi ma'lum joy" bir narsa emas.
                if (data.liveUntil) {
                    const leftMin = Math.max(0, Math.round((new Date(data.liveUntil) - Date.now()) / 60000));
                    const leftTxt = leftMin >= 60
                        ? Math.floor(leftMin / 60) + ' soat ' + (leftMin % 60) + ' daqiqa'
                        : leftMin + ' daqiqa';
                    addr.textContent = '🟢 Jonli · ' + coords + ' (' + leftTxt + ' qoldi)';
                } else {
                    addr.textContent = coords;
                }
            }
            if (typeof mapInstance !== 'undefined' && mapInstance && childMarker) {
                childMarker.setLatLng([data.location.lat, data.location.lng]);
                mapInstance.setView([data.location.lat, data.location.lng], 15);
            }
        } else {
            alert("Farzanddan hali joylashuv kelmagan.\n\n" +
                  (data.asked
                    ? "Farzandingizga so'rov yuborildi — u tugmani bosishi bilan joylashuvi va vaqti botga keladi.\n\n"
                    : "") +
                  "Bundan keyin farzandingiz botdagi o'z panelini har ochganda joylashuvi avtomatik saqlanadi.");
        }
        if (data.location && data.asked && tg && tg.showAlert) {
            tg.showAlert("📨 Farzandingizga so'rov yuborildi. Hozir ko'rinib turgani — so'nggi ma'lum joy; yangisi kelganda bot xabar beradi.");
        }
    } catch (e) {
        console.error('requestChildLocation error:', e);
        alert("Server javob bermayapti. Keyinroq urinib ko'ring.");
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '📍 Joylashuvni so\'rash'; }
    }
}

/** Xavfsiz hududlar ro'yxati va so'nggi ogohlantirishlar (Pro). */
async function loadGeofences() {
    const list = document.getElementById('geofenceZoneList');
    if (!list || !currentChildKey) return;
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'list_geofences', childId: currentChildKey })
        });
        const data = await resp.json();
        if (!data || !data.ok) return;

        const zones = data.zones || [];
        const alerts = data.alerts || [];

        if (zones.length === 0) {
            list.innerHTML = data.plan === 'pro'
                ? '<div class="text-[10px] text-slate-400">Hali xavfsiz hudud belgilanmagan.</div>'
                : '<div class="text-[10px] text-slate-400">🔒 Xavfsiz hududlar (uy, maktab) Pro tarifda.</div>';
            return;
        }

        list.innerHTML = zones.map(z => {
            const last = alerts.find(a => a.zone_name === z.name);
            const state = last
                ? (last.alert_type === 'enter' ? 'Ichida' : 'Tashqarida')
                : '—';
            const color = last && last.alert_type === 'enter' ? 'text-emerald-400' : 'text-slate-400';
            return '<div class="flex items-center justify-between py-1">' +
                   '<span class="text-[11px] text-white">' + z.name + '</span>' +
                   '<span class="text-[10px] font-bold ' + color + '">' + state + '</span>' +
                   '</div>';
        }).join('');
    } catch (e) {
        console.error('loadGeofences error:', e);
    }
}

// ============================================================================
// FARZANDNING KIRISHI — kod kiritish, urinishlar va blok
//
// Bu YAGONA joy. Ilgari farzand kodni ikki xil ekranda kiritardi (rozilik
// oynasi va panel ichidagi bo'lim) va har biri alohida yozilgan edi -
// ikkalasi ham eski, oila kodiga asoslangan child_consent'ni chaqirardi.
//
// Urinishlar va blok SERVERDA sanaladi (redeem_child_invite). Bu yerda
// faqat javob ko'rsatiladi: shu sabab bir xil qoida Mini App, Android va
// keyinchalik iPhone uchun bir xil ishlaydi va brauzerda aylanib o'tib
// bo'lmaydi.
// ============================================================================

let entryBanTimer = null;

function showEntryError(errorEl, text) {
    if (!errorEl) { alert(text); return; }
    errorEl.innerText = text;
    errorEl.classList.remove('hidden');
}

/** Blok tugaguncha sanoqni ko'rsatadi va tugagach o'chiradi. */
function startBanCountdown(errorEl, seconds, buttonEl) {
    if (entryBanTimer) clearInterval(entryBanTimer);
    let left = seconds;

    const tick = () => {
        if (left <= 0) {
            clearInterval(entryBanTimer);
            entryBanTimer = null;
            if (errorEl) errorEl.classList.add('hidden');
            if (buttonEl) buttonEl.disabled = false;
            return;
        }
        const m = Math.floor(left / 60);
        const s = left % 60;
        showEntryError(
            errorEl,
            "Juda ko'p noto'g'ri urinish. Qayta urinish: " +
                m + ":" + String(s).padStart(2, '0')
        );
        left--;
    };

    if (buttonEl) buttonEl.disabled = true;
    tick();
    entryBanTimer = setInterval(tick, 1000);
}

/**
 * Kodni serverga yuboradi.
 * Javoblar: ok | noto'g'ri (urinish qoldi) | bloklangan (sanoq).
 */
async function redeemInviteCode(code, errorEl, buttonEl, onSuccess) {
    const clean = String(code || '').trim().toUpperCase();
    if (clean.length < 4) {
        showEntryError(errorEl, "Ota-onangiz bergan kodni to'liq kiriting.");
        return false;
    }
    if (errorEl) errorEl.classList.add('hidden');
    if (buttonEl) { buttonEl.disabled = true; }

    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'redeem_child_invite', code: clean })
        });
        const data = await resp.json();

        if (data.ok) {
            try {
                localStorage.setItem('child_consented', 'true');
                if (data.familyCode) localStorage.setItem('child_family_code', data.familyCode);
            } catch (e) {}
            if (typeof onSuccess === 'function') onSuccess(data);
            return true;
        }

        if (data.banned) {
            startBanCountdown(errorEl, data.secondsLeft || 180, buttonEl);
            return false;
        }

        // Xato matni serverdan keladi va nechta urinish qolganini aytadi.
        showEntryError(errorEl, data.error || "Kod noto'g'ri.");
        return false;
    } catch (e) {
        console.error('redeemInviteCode error:', e);
        showEntryError(errorEl, "Server javob bermayapti. Keyinroq urinib ko'ring.");
        return false;
    } finally {
        // Blok holatida tugma sanoq tugaguncha o'chiq qoladi.
        if (buttonEl && !entryBanTimer) buttonEl.disabled = false;
    }
}

/**
 * Havoladagi ?inv=KOD ni kod maydonlariga oldindan yozadi.
 * Bot yuborgan havola aynan shu parametr bilan keladi, shuning uchun
 * farzand kodni qo'lda ko'chirib yozishi shart emas.
 */
function prefillInviteCodeFromUrl() {
    try {
        const inv = new URLSearchParams(window.location.search).get('inv');
        if (!inv) return;
        ['childConsentFamilyCode', 'childFamilyCodeInput'].forEach(id => {
            const el = document.getElementById(id);
            if (el && !el.value) el.value = inv.toUpperCase();
        });
    } catch (e) {}
}

async function syncChildrenFromServer() {
    if (!familyCode || String(familyCode).length !== 6) return false;
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'list_children', familyCode: familyCode })
        });
        const data = await resp.json();
        if (!data || !data.ok || !Array.isArray(data.children)) return false;

        // Server 0 ta farzand qaytarsa mavjud ro'yxatni o'chirmaymiz: yangi
        // o'rnatishda panel butunlay bo'sh va buzilgandek ko'rinardi.
        if (data.children.length === 0) return true;

        const next = {};
        data.children.forEach(c => {
            next[c.child_id] = buildChildRecord(c, childrenDatabase[c.child_id]);
        });
        childrenDatabase = next;
        if (!childrenDatabase[currentChildKey]) {
            currentChildKey = Object.keys(childrenDatabase)[0];
        }
        saveChildrenDatabase();
        renderChildSelectDropdown();
        renderActiveChild();
        return true;
    } catch (e) {
        console.error('syncChildrenFromServer error:', e);
        return false;
    }
}

async function handleAddNewChildSubmit() {
    const nameInput = document.getElementById('newChildNameInput');
    const gradeSelect = document.getElementById('newChildGradeInput');
    const usernameInput = document.getElementById('newChildUsernameInput');
    const resultBox = document.getElementById('addChildResultBox');
    const submitBtn = document.getElementById('addChildSubmitBtn');
    const isRuAdd = (currentLang === 'ru');

    const name = nameInput ? nameInput.value.trim() : "";
    const grade = gradeSelect ? parseInt(gradeSelect.value) : 5;
    const username = usernameInput ? usernameInput.value.trim().replace('@', '') : "";

    if (!name) {
        alert(isRuAdd ? "Введите имя ребёнка!" : "Iltimos, farzandingizning ism-familiyasini kiriting!");
        return;
    }

    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerText = '⏳ Yuborilmoqda...'; }

    try {
        // Har bir farzandga ALOHIDA bir martalik kod. Ilgari bu yer
        // add_child_request yuborardi va hamma farzand bitta oila kodi
        // bilan ulanardi - o'sha kod esa ota-onaning Telegram ID'sidan
        // hisoblanardi, ya'ni sir emas edi.
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'create_child_invite',
                childName: name,
                childGrade: grade,
                childUsername: username || null
            })
        });
        const data = await resp.json();

        if (!data.ok) {
            console.error('create_child_invite rad etildi:', data);
            alert((isRuAdd ? 'Ошибка: ' : 'Xatolik: ') +
                  (data.error || (isRuAdd ? 'Попробуйте ещё раз.' : "Qayta urinib ko'ring.")));
            return;
        }

        const link = data.link || '';
        const shareText = encodeURIComponent(
            name + " uchun Qalqon AI kodi: " + data.code + "\n" + link
        );

        if (resultBox) {
            resultBox.classList.remove('hidden');
            resultBox.innerHTML =
                '<div class="text-xs font-bold text-emerald-300">✅ ' + name + ' qo\'shildi!</div>' +
                '<div class="text-[10px] text-slate-300">Farzandingizga shu havolani yuboring. U kirib, 4 qoidaga rozilik bergach, quyidagi kodni kiritadi:</div>' +
                '<div class="p-2 rounded-lg bg-slate-950/60 text-center">' +
                    '<div class="text-lg font-black text-emerald-400 tracking-widest font-mono">' + data.code + '</div>' +
                    '<div class="text-[9px] text-slate-500">' + (data.expiresInHours || 72) + ' soat amal qiladi, bir marta ishlatiladi</div>' +
                '</div>' +
                '<div class="text-[10px] font-mono text-cyan-300 bg-slate-950/60 p-2 rounded-lg break-all">' + link + '</div>' +
                '<a href="https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + shareText + '" target="_blank" ' +
                   'class="block w-full text-center py-2 rounded-xl bg-sky-500/20 border border-sky-500/50 text-sky-200 font-bold text-[11px]">' +
                    '📤 Telegram orqali yuborish' +
                '</a>';
        }
        if (nameInput) nameInput.value = '';
        if (usernameInput) usernameInput.value = '';

        await syncChildrenFromServer();
    } catch (e) {
        console.error('Add child error:', e);
        alert(isRuAdd ? 'Сервер недоступен.' : "Server javob bermayapti. Keyinroq urinib ko'ring.");
    } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerText = "➕ Ro'yxatga Qo'shish"; }
    }
}

// Android ilova o'zini oila kodi bilan emas, shu bir martalik pairCode'ni
// device_tokens'dagi uzoq muddatli tokenga almashtirib tanitadi (07_device_tokens.sql).
// Oila kodi formula bilan chiqadi va sir emas — shu sabab radar/telemetriya
// endpointlari (report_location) faqat shu tokenni qabul qiladi.
async function handleCreateDeviceCode() {
    const nameInput = document.getElementById('androidChildNameInput');
    const resultBox = document.getElementById('androidPairResultBox');
    const submitBtn = document.getElementById('androidPairSubmitBtn');
    const isRuAdd = (currentLang === 'ru');

    const name = nameInput ? nameInput.value.trim() : "";

    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerText = '⏳ Yuborilmoqda...'; }

    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'create_device_pair_code',
                childName: name || null
            })
        });
        const data = await resp.json();

        if (!data.ok) {
            console.error('create_device_pair_code rad etildi:', data);
            alert((isRuAdd ? 'Ошибка: ' : 'Xatolik: ') +
                  (data.error || (isRuAdd ? 'Попробуйте ещё раз.' : "Qayta urinib ko'ring.")));
            return;
        }

        if (resultBox) {
            const deepLink = 'shield://pair?code=' + encodeURIComponent(data.pairCode);
            const shareText = encodeURIComponent(
                (name || 'Farzand') + " uchun Qalqon AI qurilma kodi: " + data.pairCode
            );
            resultBox.classList.remove('hidden');
            resultBox.innerHTML =
                '<div class="text-xs font-bold text-indigo-300">✅ Kod tayyor!</div>' +
                '<div class="text-[10px] text-slate-300">Bu kodni farzandingizning telefonidagi Android ilovaga kiriting, yoki havolani o\'sha telefonda oching:</div>' +
                '<div class="p-2 rounded-lg bg-slate-950/60 text-center">' +
                    '<div class="text-lg font-black text-indigo-400 tracking-widest font-mono">' + data.pairCode + '</div>' +
                    '<div class="text-[9px] text-slate-500">' + Math.round((data.expiresInSec || 900) / 60) + ' daqiqa amal qiladi, bir marta ishlatiladi</div>' +
                '</div>' +
                '<a href="https://t.me/share/url?url=' + encodeURIComponent(deepLink) + '&text=' + shareText + '" target="_blank" ' +
                   'class="block w-full text-center py-2 rounded-xl bg-sky-500/20 border border-sky-500/50 text-sky-200 font-bold text-[11px]">' +
                    '📤 Telegram orqali yuborish' +
                '</a>';
        }
        if (nameInput) nameInput.value = '';
    } catch (e) {
        console.error('Create device code error:', e);
        alert(isRuAdd ? 'Сервер недоступен.' : "Server javob bermayapti. Keyinroq urinib ko'ring.");
    } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerText = "📱 Android Kodi Olish"; }
    }
}

function handleDeleteActiveChild() {
    const child = childrenDatabase[currentChildKey];
    if (!child) return;

    const count = Object.keys(childrenDatabase).length;
    if (count <= 1) {
        alert("⚠️ Sizda kamida 1 ta farzand profili bo'lishi kerak. O'chirishdan oldin yangisini qo'shing!");
        return;
    }

    const confirmDelete = confirm(`Haqiqatan ham «${child.name} (ID: ${currentChildKey})» profilini ro'yxatdan butunlay olib tashlamoqchimisiz?`);
    if (confirmDelete) {
        delete childrenDatabase[currentChildKey];
        saveChildrenDatabase();
        currentChildKey = Object.keys(childrenDatabase)[0];
        renderChildSelectDropdown();
        renderActiveChild();
        renderSchoolCurriculum();
        alert("✅ Farzand profili ro'yxatdan muvaffaqiyatli olib tashlandi!");
    }
}



async function handleChildConsentAccept() {
    const input = document.getElementById('childConsentFamilyCode');
    const errorBox = document.getElementById('childConsentError');
    const btn = document.querySelector('[onclick="handleChildConsentAccept()"]');

    await redeemInviteCode(input ? input.value : '', errorBox, btn, (data) => {
        const overlay = document.getElementById('childConsentOverlay');
        if (overlay) overlay.classList.add('hidden');
        switchChildTab('child-tab-home');

        // Adminga xabar - bu faqat bildirishnoma, ulanishga ta'sir qilmaydi.
        fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'child_paired_event',
                familyCode: data.familyCode || '',
                childName: (typeof tg !== 'undefined' && tg?.initDataUnsafe?.user?.first_name) || 'Farzand',
                timestamp: new Date().toISOString()
            })
        }).catch(() => {});
    });
}

function handleChildConsentDecline() {
    const isRu = (currentLang === 'ru');
    alert(isRu
        ? "Для использования приложения необходимо согласие. Пожалуйста, поговорите с родителями."
        : "Ilovadan foydalanish uchun rozilik zarur. Iltimos, ota-onangiz bilan gaplashing.");
}

function checkChildConsentStatus() {
    if (currentAppRole === 'child') {
        // Ulanish holatining MANBASI — server (check_role -> child_pairings).
        // Ilgari bu faqat localStorage'dan o'qilardi, u esa shu brauzerda
        // yashaydi va Telegram Mini App xotirasini tez-tez tozalaydi. Natijada
        // allaqachon ulangan farzanddan har safar yana kod so'ralardi — kod
        // bir martalik bo'lgani uchun u boshqa hech qachon ichkariga kira
        // olmasdi. localStorage endi faqat zaxira (server javob bermasa).
        const serverSaysPaired = !!(realChildProfile && realChildProfile.role === 'child');
        const consented = serverSaysPaired || localStorage.getItem('child_consented') === 'true';

        if (serverSaysPaired) {
            try {
                localStorage.setItem('child_consented', 'true');
                if (realChildProfile.familyCode) {
                    localStorage.setItem('child_family_code', realChildProfile.familyCode);
                }
            } catch (e) {}
        }

        const overlay = document.getElementById('childConsentOverlay');
        const codeInput = document.getElementById('childConsentFamilyCode');

        // Farzand kodni qo'lda kiritadi (havolada ?inv= bo'lsa,
        // prefillInviteCodeFromUrl() keyinroq uni o'zi to'ldiradi).
        if (codeInput) codeInput.value = "";

        if (overlay) {
            if (!consented) {
                overlay.classList.remove('hidden');
            } else {
                overlay.classList.add('hidden');
            }
        }
        

        // Farzand panelini majburiy tanlash
        switchChildTab('child-tab-home');

        // Vaqt banki, liga, jang va kunlik xabar — hammasi serverdan.
        if (consented) {
            renderTimeBank();
            renderLeague();
            renderReferral();
            const noteCard = document.getElementById('dailyNoteCard');
            if (noteCard) noteCard.classList.remove('hidden');
            acceptDuelFromUrl().then(renderDuel);
            // Do'st yuborgan online o'yin havolasi (?play=KOD).
            if (typeof acceptPlayFromUrl === 'function') acceptPlayFromUrl();

            const locCard = document.getElementById('childLocationCard');
            if (locCard) locCard.classList.remove('hidden');
            const gamesCard = document.getElementById('gamesEntryCard');
            if (gamesCard) gamesCard.classList.remove('hidden');

            // Ota-ona "Qayerdasan?" deb so'ragan bo'lsa, bot havolasida
            // ?ask=loc keladi — u holda bolaga tugma qidirtirmaymiz.
            if (new URLSearchParams(window.location.search).get('ask') === 'loc') {
                sendMyLocation('asked');
            } else {
                // Jim nuqta: ruxsat allaqachon berilgan bo'lsa hech narsa
                // so'ralmaydi, berilmagan bo'lsa Telegram o'zi so'raydi va
                // bola "yo'q" desa, biz qayta bezovta qilmaymiz.
                setTimeout(() => sendMyLocation('auto'), 2500);
            }
        }
    }
}


function checkParentOnboarding() {
    const isParent = (currentAppRole === 'parent');
    const onboarded = localStorage.getItem('parent_onboarded') === 'true';
    if (isParent && !onboarded) {
        setTimeout(() => {
            openSubpage('modal-parent-onboarding');
        }, 300);
    }
}

const urlParams = new URLSearchParams(window.location.search);
const urlRole = urlParams.get('role');
const urlCode = urlParams.get('code') || urlParams.get('start');

let currentLang = urlParams.get('lang') || localStorage.getItem('app_lang') || 'uz';
let currentTheme = localStorage.getItem('app_theme') || 'default';
let userPlan = localStorage.getItem('user_plan') || 'pro';
let activeSchoolPeriod = 'weekly';
let isRecordingVoice = false;
let uploadedImageBase64 = null;

function generateFamilyCode(userId) {
    // Same algorithm as live supabase ota-ona-bot (per Telegram userId)
    const num = Math.abs((Number(userId) * 31 + 7919) % 900000) + 100000;
    return String(num).padStart(6, "0");
}

function normalizeFamilyCodeDigits(raw) {
    return String(raw || "").replace(/^pair_/i, "").replace(/^child_/i, "").replace(/\D/g, "");
}

function resolveInitialFamilyCode(urlCodeValue) {
    let code = normalizeFamilyCodeDigits(urlCodeValue);
    if (code.length === 6) return code;
    try {
        const profile = JSON.parse(localStorage.getItem("qalqon_family_profile") || "null");
        code = normalizeFamilyCodeDigits(profile && profile.code);
        if (code.length === 6) return code;
    } catch (e) {}
    code = normalizeFamilyCodeDigits(
        localStorage.getItem("parent_family_code") || localStorage.getItem("child_family_code") || ""
    );
    if (code.length === 6) return code;
    // Child role must never get a self-derived "family code" from their own Telegram id
    try {
        const roleHint = (new URLSearchParams(window.location.search).get("role") || localStorage.getItem("app_role") || "").toLowerCase();
        const startHint = String(urlCodeValue || "").toLowerCase();
        if (roleHint === "child" || startHint.startsWith("child") || startHint.startsWith("pair_")) {
            // pair_ without digits already failed normalize; do not invent
            if (!(code.length === 6)) return "";
        }
    } catch (e) {}
    const tgId = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user && window.Telegram.WebApp.initDataUnsafe.user.id;
    if (tgId) return generateFamilyCode(tgId);
    return "";
}

function updateDisplayFamilyCode() {
    const shown = (familyCode && String(familyCode).length === 6) ? String(familyCode) : "———";
    const el = document.getElementById("displayFamilyCode");
    if (el) el.textContent = shown;
    const el2 = document.getElementById("onboardDisplayFamilyCode");
    if (el2) el2.textContent = shown;
}

let familyCode = resolveInitialFamilyCode(urlCode);
updateDisplayFamilyCode();

// Agar havola bola uchun bo'lsa
let currentAppRole = urlRole || localStorage.getItem('app_role') || 'parent';
if (urlRole === 'child' || (urlCode && (urlCode.startsWith('child') || urlCode.startsWith('pair')))) {
    currentAppRole = 'child';
    localStorage.setItem('app_role', 'child');
} // 'parent' or 'child'

// Ota-ona autentifikatsiyasi va admin tasdiq holati
let currentAuthUser = JSON.parse(localStorage.getItem('auth_user') || 'null');
let authStatus = localStorage.getItem('auth_status') || (currentAuthUser ? currentAuthUser.status : 'guest_demo'); // 'guest_demo', 'pending', 'approved'

let mapInstance = null;
let childMarker = null;
let parentMarker = null;

let pomodoroSeconds = 25 * 60;
let pomodoroInterval = null;
let isPomodoroRunning = false;

// Telegram WebApp Setup & Auto Role / Admin Detection
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    // Ensure parent family code from Telegram userId (align with bot generateFamilyCode)
    // Never invent a code for child role — children must use parent's pair code / typed code.
    if (currentAppRole !== 'child' && (!familyCode || String(familyCode).length !== 6)) {
        const tid = tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id;
        if (tid) {
            familyCode = generateFamilyCode(tid);
            localStorage.setItem('parent_family_code', familyCode);
        }
    }
    updateDisplayFamilyCode();
    const rawUsername = (tg.initDataUnsafe?.user?.username || "").toLowerCase();
    
    if (rawUsername === 'ai_loyihachi' || rawUsername === 'mirkamolov13') {
        currentAuthUser = {
            username: `@${rawUsername}`,
            name: `${tg.initDataUnsafe.user.first_name || ''} ${tg.initDataUnsafe.user.last_name || ''}`.trim() || "Administrator",
            status: 'approved',
            isAdmin: true
        };
        authStatus = 'approved';
        localStorage.setItem('auth_user', JSON.stringify(currentAuthUser));
        localStorage.setItem('auth_status', authStatus);
        // Super admin uchun ota-ona ro'yxatdan o'tish oynasi hech qachon ko'rsatilmasin
        localStorage.setItem('parent_onboarded', 'true');
    } else if (rawUsername && !currentAuthUser) {
        currentAuthUser = {
            username: `@${rawUsername}`,
            name: `${tg.initDataUnsafe.user.first_name || ''} ${tg.initDataUnsafe.user.last_name || ''}`.trim(),
            status: 'approved'
        };
        authStatus = 'approved';
        localStorage.setItem('auth_user', JSON.stringify(currentAuthUser));
        localStorage.setItem('auth_status', authStatus);
    }
}

// ============================================================================
// 4. ROL TANLASH (OTA / ONA VA FARZAND REJIMLARI)
// ============================================================================
let currentParentRelation = localStorage.getItem('parent_relation') || 'father';

function setParentRelation(relation) {
    currentParentRelation = relation;
    localStorage.setItem('parent_relation', relation);
    const btnFather = document.getElementById('relBtnFather');
    const btnMother = document.getElementById('relBtnMother');
    const isFather = (relation === 'father');

    if (btnFather) {
        btnFather.className = isFather 
            ? "px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40 text-[10px] transition"
            : "px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-400 font-semibold border border-transparent text-[10px] hover:text-white transition";
    }
    if (btnMother) {
        btnMother.className = !isFather 
            ? "px-2.5 py-0.5 rounded-lg bg-pink-500/20 text-pink-400 font-bold border border-pink-500/40 text-[10px] transition"
            : "px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-400 font-semibold border border-transparent text-[10px] hover:text-white transition";
    }

    const titleEl = document.getElementById('roleBtnParent');
    if (titleEl) {
        const text = isFather 
            ? (currentLang === 'ru' ? "👨 Панель Отца" : "👨 Ota Paneli")
            : (currentLang === 'ru' ? "👩 Панель Матери" : "👩 Ona Paneli");
        const span = titleEl.querySelector('span:last-child');
        if (span) span.innerText = text;
    }
}

function switchAppRole(role) {
    // Server tasdiqlagan farzand ota-ona paneliga o'ta olmaydi. Ilgari rol
    // almashtirgich hammaga ochiq edi — farzand bitta tugma bosib ota-ona
    // panelini (radar, hisobotlar, sozlamalar) ochib olardi.
    if (role === 'parent' && realChildProfile && realChildProfile.role === 'child') {
        const msg = (currentLang === 'ru')
            ? "Эта панель только для родителей."
            : "Bu panel faqat ota-onalar uchun.";
        if (tg && tg.showAlert) tg.showAlert(msg); else alert(msg);
        role = 'child';
    }

    currentAppRole = role;
    localStorage.setItem('app_role', role);

    // Farzand uchun almashtirgichni umuman ko'rsatmaymiz.
    const roleSwitcher = document.getElementById('roleSwitcherContainer');
    if (roleSwitcher) {
        const lockedToChild = !!(realChildProfile && realChildProfile.role === 'child');
        roleSwitcher.classList.toggle('hidden', lockedToChild);
    }

    const isParent = (role === 'parent');
    const quickMenuFab = document.getElementById('quickMenuFab');
    if (quickMenuFab) {
        quickMenuFab.classList.toggle('hidden', !isParent);
    }
    const authBannerBtnRole = document.getElementById('authBannerBtn');
    if (authBannerBtnRole) {
        authBannerBtnRole.classList.toggle('hidden', !isParent);
    }
    const roleBtnParent = document.getElementById('roleBtnParent');
    const roleBtnChild = document.getElementById('roleBtnChild');
    const parentHeader = document.getElementById('mainParentHeader');
    const authBanner = document.getElementById('authStatusBanner');
    const parentBottomNav = document.getElementById('parentBottomNav');
    const childBottomNav = document.getElementById('childBottomNav');
    const rolePillContainer = document.getElementById('parentRolePillContainer');

    if (roleBtnParent) {
        roleBtnParent.className = isParent
            ? "flex-1 py-2 px-2 rounded-xl text-xs font-bold text-white bg-emerald-500 shadow-md transition flex items-center justify-center gap-1.5"
            : "flex-1 py-2 px-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5";
    }

    if (roleBtnChild) {
        roleBtnChild.className = !isParent
            ? "flex-1 py-2 px-2 rounded-xl text-xs font-bold text-white bg-indigo-500 shadow-md transition flex items-center justify-center gap-1.5"
            : "flex-1 py-2 px-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5";
    }

    if (rolePillContainer) {
        rolePillContainer.style.display = isParent ? 'flex' : 'none';
    }

    // Barcha tablarni yopish
    document.querySelectorAll('.tab-content').forEach(t => {
        t.classList.remove('active');
        t.classList.add('hidden');
    });

    if (isParent) {
        document.body.classList.remove('role-child');
        document.body.classList.add('role-parent');
        if (childBottomNav) {
            childBottomNav.style.display = 'none';
            childBottomNav.classList.add('hidden');
        }
        if (parentBottomNav) {
            parentBottomNav.style.display = 'flex';
            parentBottomNav.classList.remove('hidden');
        }
        if (parentHeader) parentHeader.classList.remove('hidden');
        if (authBanner) authBanner.classList.remove('hidden');
        setParentRelation(currentParentRelation);
        switchTab('tab-dashboard');
    } else {
        document.body.classList.remove('role-parent');
        document.body.classList.add('role-child');
        if (parentBottomNav) {
            parentBottomNav.style.display = 'none';
            parentBottomNav.classList.add('hidden');
        }
        if (childBottomNav) {
            childBottomNav.style.display = 'flex';
            childBottomNav.classList.remove('hidden');
        }
        if (parentHeader) parentHeader.classList.add('hidden');
        if (authBanner) authBanner.classList.add('hidden');
        switchChildTab('child-tab-home');
    }
}

function switchChildTab(tabId) {
    // MUHIM: bu ro'yxatda 'child-tab-settings' yo'q edi, ya'ni u hech qachon
    // yashirilmasdi va boshqa har qanday bo'lim ostida ochiq turaverardi —
    // "Mening sozlamalarim hamma panel ostida ko'rinmoqda" nuqsonining
    // ikkinchi sababi shu edi (birinchisi — HTML'da ikki marta yozilgani).
    // Yangi bo'lim qo'shilsa, uni ham shu yerga qo'shish shart.
    const childTabs = [
        'child-tab-home', 'child-tab-ai', 'child-tab-rewards', 'child-tab-school',
        'child-tab-explore', 'child-tab-settings', 'child-tab-extras', 'child-tab-games'
    ];
    childTabs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('active');
            el.classList.add('hidden');
        }
        const navBtn = document.getElementById(`nav-${id}`);
        if (navBtn) navBtn.classList.remove('active');
    });

    const activeEl = document.getElementById(tabId);
    if (activeEl) {
        activeEl.classList.remove('hidden');
        activeEl.classList.add('active');
    }

    if (tabId === 'child-tab-ai') renderAiQuota();
    if (tabId === 'child-tab-extras') mountChildExtras();
    if (tabId === 'child-tab-games') mountGamesInto('childGamesHost');

    const activeNav = document.getElementById(`nav-${tabId}`);
    if (activeNav) activeNav.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 📍 FARZAND TEZKOR XABARLARI
function sendChildQuickStatus(statusType) {
    const isRu = (currentLang === 'ru');
    const child = childrenDatabase[currentChildKey];
    let statusTextUz = "Maktabga yetib keldi";
    let statusTextRu = "Прибыл в школу";

    if (statusType === 'uy') {
        statusTextUz = "Uyga eson-omon yetib keldi";
        statusTextRu = "Благополучно вернулся домой";
    } else if (statusType === 'olib_keting') {
        statusTextUz = "Darslari tugadi, olib ketishni so'ramoqda";
        statusTextRu = "Уроки закончились, просит забрать";
    } else if (statusType === 'sos') {
        statusTextUz = "🚨 SHOSHILINCH SOS XABAR: Farzandingiz yordam so'ramoqda!";
        statusTextRu = "🚨 СРОЧНОЕ SOS СООБЩЕНИЕ: Ребёнок просит о помощи!";
    }

    try {
        fetch('https://wfrclcwjeeqeqchmdhzw.supabase.co/functions/v1/ota-ona-bot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'child_status_alert',
                statusType: statusType,
                statusText: isRu ? statusTextRu : statusTextUz,
                childName: isRu ? (child.name_ru || child.name) : child.name,
                familyCode: familyCode,
                timestamp: new Date().toISOString()
            })
        }).catch(e => console.log('Status alert sent'));
    } catch(e) {}

    const alertMsg = isRu 
        ? `✅ Оповещение «${statusTextRu}» успешно отправлено родителям в Telegram!`
        : `✅ «${statusTextUz}» xabari ota-onangizning Telegramiga muvaffaqiyatli yuborildi!`;
    alert(alertMsg);
}

// 🧠 FARZAND AI CHAT (MULTI-TURN UZLUKSIZ SUHBAT)
function clearChildChatHistory() {
    const thread = document.getElementById('childAiChatThread');
    if (!thread) return;
    const isRu = (currentLang === 'ru');
    thread.innerHTML = `
        <div class="flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm flex-shrink-0">🐺</div>
            <div class="p-3 rounded-2xl rounded-tl-sm bg-indigo-950/50 border border-indigo-500/30 text-slate-200 leading-relaxed shadow-sm">
                ${isRu ? "🐺 Чат очищен! Задай любой вопрос из школьной программы 1-11 классов." : "🐺 Suhbat tozalandi! 1-11 sinf darsliklaridan istalgan savolingni yoz."}
            </div>
        </div>
    `;
}

function askChildAiPreset(type) {
    const isRu = (currentLang === 'ru');
    const input = document.getElementById('childAiInput');
    if (!input) return;

    if (type === 'matem') {
        input.value = isRu ? "Как сложить разные дроби?" : "Oddiy kasrlarni qo'shish qoidasini tushuntir";
    } else if (type === 'english') {
        input.value = isRu ? "Объясни время Present Simple с примерами" : "Present Simple zamonini misollar bilan tushuntir";
    } else if (type === 'physics') {
        input.value = isRu ? "Что гласит закон Ома?" : "Om qonuni formulasi va qoidasi qanday?";
    } else if (type === 'science') {
        input.value = isRu ? "Расскажи про периодическую таблицу Менделеева" : "Mendeleyev davriy jadvali nima?";
    }
    handleChildAiSend();
}

function appendChildUserMessage(text) {
    const thread = document.getElementById('childAiChatThread');
    if (!thread) return;
    const msg = document.createElement('div');
    msg.className = "flex justify-end";
    msg.innerHTML = `
        <div class="bg-indigo-600 text-white font-medium rounded-2xl rounded-tr-sm p-3 max-w-[85%] text-xs shadow-md">
            ${text}
        </div>
    `;
    thread.appendChild(msg);
    thread.scrollTop = thread.scrollHeight;
}

function appendChildAiMessage(htmlContent) {
    const thread = document.getElementById('childAiChatThread');
    if (!thread) return;
    const msg = document.createElement('div');
    msg.className = "flex items-start gap-2.5 max-w-[95%]";
    msg.innerHTML = `
        <div class="w-7 h-7 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm flex-shrink-0">🐺</div>
        <div class="p-3 rounded-2xl rounded-tl-sm bg-indigo-950/50 border border-indigo-500/30 text-slate-200 leading-relaxed shadow-sm">
            ${htmlContent}
        </div>
    `;
    thread.appendChild(msg);
    thread.scrollTop = thread.scrollHeight;
}

let uploadedChildImageBase64 = null;

/**
 * Rasmni yuborishdan oldin kichraytiradi.
 *
 * Nega: AI xarajatining eng katta qismi rasmlarda. Zamonaviy telefon 4000
 * piksel kenglikda surat oladi, mashq daftarining matnini o'qish uchun esa
 * 1280 piksel yetib ortadi. Kichraytirilmagan rasm bir necha barobar ko'p
 * token yeydi va sekin yuklanadi — foyda esa nolga teng.
 */
function shrinkImage(file, maxSide, sifat) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let { width: w, height: h } = img;
                const k = Math.min(1, maxSide / Math.max(w, h));
                w = Math.round(w * k);
                h = Math.round(h * k);
                const c = document.createElement('canvas');
                c.width = w; c.height = h;
                c.getContext('2d').drawImage(img, 0, 0, w, h);
                try {
                    resolve(c.toDataURL('image/jpeg', sifat));
                } catch (err) {
                    // Kanvas ishlamasa, asl rasmni yuboramiz — foydalanuvchi
                    // uchun xatodan ko'ra sekin yuklanish yaxshiroq.
                    resolve(e.target.result);
                }
            };
            img.onerror = () => resolve(e.target.result);
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

async function handleChildImageSelected(event) {
    const file = event.target.files[0];
    if (!file) return;
    uploadedChildImageBase64 = await shrinkImage(file, 1280, 0.82);
    handleChildAiSend();
}


// AI do'st endi o'z serverimizda (ota-ona-bot: ai_tutor_chat). Ilgari u
// Render'dagi alohida xizmatga borardi, u esa initData'ni boshqa bot tokeni
// bilan tekshirgani uchun HAR BIR so'rovni "initData yaroqsiz" deb rad etardi.
async function callRealTextBackendForChild(message) {
    const child = childrenDatabase[currentChildKey];
    const isRu = (currentLang === 'ru');
    appendChildAiMessage(isRu ? '⏳ Думаю…' : '⏳ O\'ylayapman…');
    try {
        const childRealName = realChildProfile?.childName || realChildProfile?.fullName
            || (typeof tg !== 'undefined' && tg?.initDataUnsafe?.user?.first_name) || '';
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'ai_tutor_chat',
                message: message,
                grade: realChildProfile?.grade || child?.grade || 5,
                subject: getTutorSubject(),
                childName: childRealName
            })
        });
        const data = await resp.json();
        if (data.ok && data.answer) {
            appendChildAiMessage(safeAiHtml(data.answer));
        } else {
            appendChildAiMessage(safeAiHtml(data.error ||
                (isRu ? 'Ошибка. Попробуйте ещё раз.' : 'Xatolik. Qayta urinib ko\'ring.')));
        }
    } catch (e) {
        console.error('Child text backend error:', e);
        appendChildAiMessage(isRu ? '⚠️ Сервер временно недоступен.' : '⚠️ Server vaqtincha javob bermayapti.');
    }
}

async function callRealVisionBackendForChild(query, imageBase64) {
    const child = childrenDatabase[currentChildKey];
    const isRu = (currentLang === 'ru');
    appendChildAiMessage(isRu
        ? '\ud83e\udd14 Анализирую фото задания, подождите (может занять до минуты)...'
        : '\ud83e\udd14 Mashq rasmini tahlil qilyapman, kuting (bir daqiqagacha vaqt olishi mumkin)...');
    try {
        const childRealName = realChildProfile?.childName || realChildProfile?.fullName
            || (typeof tg !== 'undefined' && tg?.initDataUnsafe?.user?.first_name) || '';
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'ai_tutor_chat',
                message: query || '',
                image: imageBase64,
                grade: realChildProfile?.grade || child?.grade || 5,
                subject: getTutorSubject(),
                childName: childRealName
            })
        });
        const data = await resp.json();
        if (data.ok && data.answer) {
            appendChildAiMessage(safeAiHtml(data.answer));
        } else {
            appendChildAiMessage(safeAiHtml(data.error ||
                (isRu ? 'Ошибка анализа. Попробуйте ещё раз.' : 'Tahlilda xatolik yuz berdi. Qayta urinib ko\'ring.')));
        }
    } catch (e) {
        console.error('Child vision backend error:', e);
        appendChildAiMessage(isRu ? '\u26a0\ufe0f Сервер временно недоступен.' : '\u26a0\ufe0f Server vaqtincha javob bermayapti.');
    }
}

function handleChildAiSend() {
    // Har savoldan keyin qolgan sonni yangilaymiz — bola chegaraga
    // kutilmaganda urilmasin.
    setTimeout(renderAiQuota, 2500);
    const input = document.getElementById('childAiInput');
    const text = input ? input.value.trim() : "";
    const isRu = (currentLang === 'ru');
    if (!text && !uploadedChildImageBase64) return;
    if (input) input.value = "";

    if (uploadedChildImageBase64) {
        appendChildUserMessage(text || (isRu ? '[\u0424\u043e\u0442\u043e \u0437\u0430\u0434\u0430\u043d\u0438\u044f]' : '[Mashq rasmi]'));
        const imgToSend = uploadedChildImageBase64;
        uploadedChildImageBase64 = null;
        callRealVisionBackendForChild(text, imgToSend);
        return;
    }


    appendChildUserMessage(text);
    callRealTextBackendForChild(text);
    return;

    const thread = document.getElementById('childAiChatThread');
    const loadingId = 'child-ai-loading-' + Date.now();
    if (thread) {
        const loadDiv = document.createElement('div');
        loadDiv.id = loadingId;
        loadDiv.className = "flex items-center gap-2 text-[11px] text-indigo-300 italic pl-9";
        loadDiv.innerHTML = isRu ? "⏳ Ищу в базе 1-11 классов ДТС (80 KB)..." : "⏳ 1-11 sinf DTS darsliklar bazasidan qidiryapman (80 KB)...";
        thread.appendChild(loadDiv);
        thread.scrollTop = thread.scrollHeight;
    }

    const lower = text.toLowerCase();
    const isGreeting = lower.includes('salom') || lower.includes('assalom') || lower.includes('privet') || lower.includes('hello') || lower.includes('qalaysan') || lower.includes('qalesan') || lower.includes('yaxshimisiz');

    setTimeout(() => {
        const loadEl = document.getElementById(loadingId);
        if (loadEl) loadEl.remove();

        let answer = "";
        const ragMatch = searchDtsKnowledge(text, null);

        if (isGreeting) {
            answer = isRu
                ? "🐺 Привет, дорогой друг! 🌟 Как твои дела? Какой школьный предмет (математика, языки, физика) разберём сегодня? Задай любой вопрос из учебника!"
                : "🐺 Assalomu alaykum, aziz do'stim! 🌟 Kayfiyating qanday? Bugun qaysi fan (matematika, ingliz tili, fizika, kimyo) bo'yicha birga shug'ullanamiz? Darslikdagi istalgan qiyin mavzuingni so'ra, birga yechamiz!";
        } else if (ragMatch) {
            answer = `📚 <b>${ragMatch.grade}-sinf ${ragMatch.subject} (DTS Standarti, ${ragMatch.page}-bet)</b><br>`
                   + `📖 <b>Mavzu:</b> ${ragMatch.chapter}<br><br>`
                   + `💡 <b>Rasmiy qoida:</b><br>${ragMatch.rule}<br><br>`
                   + (ragMatch.formula ? `📐 <b>Formula:</b> <code>${ragMatch.formula}</code><br><br>` : '')
                   + `<div class="pt-2"><button onclick="openDtsPageViewer(${ragMatch.grade}, '${ragMatch.subject}', '${ragMatch.chapter}', ${ragMatch.page}, '${ragMatch.rule.replace(/'/g, "\'")}', '${ragMatch.formula || ''}', '')" class="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition flex items-center gap-1 shadow-md">📖 Darslikning ${ragMatch.page}-betini ochish (80 KB) ↗</button></div>`;
        } else if (lower.includes('matem') || lower.includes('+') || lower.includes('-') || lower.includes('*') || lower.includes('/') || lower.includes('kasr')) {
            answer = isRu
                ? `📐 Отличный математический вопрос! По задаче «${text}»: давай решим шаг за шагом. Сначала определим формулу, а затем вычислим результат. Ты отлично справляешься! 🚀`
                : `📐 Ajoyib matematik savol! «${text}» masalasini kel, birga bosqichma-bosqich yechamiz: avval qoidani eslaymiz, so'ng amallarni ketma-ket bajaramiz. Senda hammasi oson o'xshaydi! 🚀`;
        } else {
            answer = isRu
                ? `💡 Отличный вопрос по теме «${text}»! Главное понять суть и применить на практике. Если нужно подробнее разобрать примеры, просто напиши! 🐺✨`
                : `💡 «${text}» bo'yicha ajoyib savol! Asosiysi qoidani to'g'ri tushunib, amalda qo'llashdir. Agar qaysi qismi tushunarsiz bo'lsa, bemalol so'ra! 🐺✨`;
        }
        appendChildAiMessage(answer);
    }, 500);
}

// ⏱️ POMODORO TAYMERI
function updatePomodoroDisplay() {
    const display = document.getElementById('pomodoroTimerDisplay');
    const mins = Math.floor(pomodoroSeconds / 60);
    const secs = pomodoroSeconds % 60;
    if (display) {
        display.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
}

// Fokus seansi SERVERDA ochiladi va u yerda vaqt hisoblanadi. Brauzerdagi
// taymer — faqat ko'rsatkich: uni to'xtatib qo'yish yoki soatni o'zgartirish
// bilan vaqt yutib bo'lmaydi.
let activeFocusSessionId = null;

function togglePomodoroTimer() {
    const btn = document.getElementById('pomodoroBtn');
    const label = document.getElementById('pomodoroStatusLabel');
    const isRu = (currentLang === 'ru');

    if (isPomodoroRunning) {
        clearInterval(pomodoroInterval);
        isPomodoroRunning = false;
        if (btn) btn.innerText = isRu ? "▶️ Продолжить" : "▶️ Davom etish";
        if (label) label.innerText = isRu ? "Таймер приостановлен" : "Taymer to'xtatildi";
    } else {
        isPomodoroRunning = true;
        if (btn) btn.innerText = isRu ? "⏸️ Пауза" : "⏸️ To'xtatish";
        if (label) label.innerText = isRu ? "📚 Идёт урок! Фокусируйся на заданиях." : "📚 Dars vaqti! Diqqatni misollarga qarat.";

        // Seansni serverda ochamiz (faqat bola uchun).
        if (!activeFocusSessionId && currentAppRole === 'child') {
            fetch(QALQON_BOT_FN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'focus_start', plannedMinutes: Math.round(pomodoroSeconds / 60) || 25 })
            }).then(r => r.json()).then(d => {
                if (d.ok && d.session) activeFocusSessionId = d.session.id;
            }).catch(e => console.error('focus_start error:', e));
        }

        pomodoroInterval = setInterval(() => {
            if (pomodoroSeconds > 0) {
                pomodoroSeconds--;
                updatePomodoroDisplay();
            } else {
                clearInterval(pomodoroInterval);
                isPomodoroRunning = false;
                finishFocusSession();
            }
        }, 1000);
    }
}

/** Taymer tugadi. Ball darhol berilmaydi: avval 3 ta tekshiruv savoli. */
async function finishFocusSession() {
    const isRu = (currentLang === 'ru');
    if (!activeFocusSessionId) {
        alert(isRu ? "🎉 25 минут завершены! 5 минут отдыха для глаз 👀" : "🎉 25 daqiqa tugadi! Ko'zlarga 5 daqiqa dam beramiz 👀");
        resetPomodoroTimer();
        return;
    }
    const sessionId = activeFocusSessionId;
    activeFocusSessionId = null;

    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'focus_complete', sessionId })
        });
        const data = await resp.json();

        if (data.ok && data.check) {
            resetPomodoroTimer();
            const ready = () => runFocusCheck(sessionId).then(() => renderTimeBank());
            const msg = `⏱ Seans tugadi!\n\nBall olish uchun ${data.check.total} ta savol — har biriga ${data.check.seconds} soniya. Ilovadan chiqma.\n\nTayyormisan?`;
            if (tg && tg.showAlert) tg.showAlert(msg, ready);
            else { alert(msg); ready(); }
            return;
        } else if (data.tooEarly) {
            alert(`⏳ Seans hali tugamadi — yana ${data.remainingMinutes} daqiqa.`);
        } else {
            alert(isRu ? "🎉 25 минут завершены!" : "🎉 25 daqiqa tugadi! Ko'zlarga 5 daqiqa dam beramiz 👀");
        }
        renderTimeBank();
    } catch (e) {
        console.error('focus_complete error:', e);
        alert(isRu ? "🎉 25 минут завершены!" : "🎉 25 daqiqa tugadi!");
    }
    resetPomodoroTimer();
}

/**
 * Hisobni o'chirish. Google Play talabi: hisobi bor ilova foydalanuvchiga
 * hisobini va ma'lumotini o'chirish yo'lini berishi shart.
 *
 * Tasdiqlash uchun so'z yozdiriladi — bitta tasodifiy bosish bilan butun
 * oila tarixini yo'qotib qo'ymaslik uchun.
 */
async function handleDeleteAccount() {
    const input = document.getElementById('deleteConfirmInput');
    const btn = document.getElementById('deleteAccountBtn');
    const typed = (input?.value || '').trim().toUpperCase();

    if (typed !== "O'CHIRISH" && typed !== "OCHIRISH") {
        alert("Tasdiqlash uchun katta harflar bilan O'CHIRISH deb yozing.");
        input?.focus();
        return;
    }
    if (!confirm("Oxirgi tasdiq: hisob va barcha ma'lumotlar butunlay o'chiriladi. Davom etaylikmi?")) {
        return;
    }

    if (btn) { btn.disabled = true; btn.innerText = '⏳ O\'chirilmoqda...'; }
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'delete_account', confirm: true })
        });
        const data = await resp.json();

        if (data.ok) {
            try { localStorage.clear(); } catch (e) {}
            alert("✅ Hisobingiz va barcha ma'lumotlaringiz o'chirildi.\n\n" +
                  (data.childrenNotified ? `${data.childrenNotified} ta farzandga xabar berildi.` : ''));
            window.location.reload();
        } else {
            console.error('delete_account:', data);
            alert("O'chirishda xatolik: " + (data.error || "qayta urinib ko'ring") +
                  (data.failedTables?.length ? "\n\nQisman o'chirildi — administratorga murojaat qiling." : ''));
        }
    } catch (e) {
        console.error('delete_account error:', e);
        alert("Server javob bermayapti. Keyinroq urinib ko'ring.");
    } finally {
        if (btn) { btn.disabled = false; btn.innerText = "🗑 Hisobni butunlay o'chirish"; }
    }
}

// ============================================================================
// VAQT BANKI — ota-ona tomoni (kursni belgilash)
// ============================================================================
/**
 * Panel ochilganda farzandlar ro'yxati serverdan kelguncha bir necha soniya
 * o'tadi va shu vaqt ichida currentChildKey hali demo qiymatda ("CH-101")
 * turadi. Ota-ona aynan shu paytda kursni saqlasa, u mavjud bo'lmagan
 * farzandga yozilib, hech qachon qo'llanmasdi.
 */
async function resolveRealChildKey() {
    const isReal = k => typeof k === 'string' && (k.startsWith('tg_') || k.startsWith('android_'));
    if (isReal(currentChildKey)) return currentChildKey;
    await syncChildrenFromServer();
    return isReal(currentChildKey) ? currentChildKey : null;
}

async function openTimeBankRules() {
    openSubpage('modal-time-bank');
    renderParentGifts();
    const childKey = await resolveRealChildKey();
    if (!childKey) {
        // Sovg'alar ro'yxati butun oila uchun — farzand bo'lmasa ham ochiq qoladi.
        return;
    }
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'time_bank_status', childId: childKey })
        });
        const d = await resp.json();
        if (!d.ok) return;

        const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
        const r = d.rules || {};
        set('tbFocus', r.minutes_per_focus ?? 10);
        set('tbSchool', r.minutes_per_school_ontime ?? 20);
        set('tbHomework', r.minutes_per_homework ?? 15);
        set('tbCap', r.daily_cap_minutes ?? 60);
        const en = document.getElementById('tbEnabled');
        if (en) en.checked = r.enabled !== false;

        const box = document.getElementById('tbCurrentBalance');
        const val = document.getElementById('tbBalanceValue');
        if (box && val) {
            val.innerText = d.balance + ' ball';
            box.classList.remove('hidden');
        }
    } catch (e) {
        console.error('time_bank_status error:', e);
    }
}

async function saveTimeBankRules() {
    const btn = document.getElementById('tbSaveBtn');
    const num = (id, def) => {
        const v = parseInt(document.getElementById(id)?.value, 10);
        return Number.isFinite(v) && v >= 0 ? v : def;
    };
    const childKey = await resolveRealChildKey();
    if (!childKey) {
        alert("Avval farzand qo'shing — kurs har bir farzandga alohida saqlanadi.");
        return;
    }
    if (btn) { btn.disabled = true; btn.innerText = '⏳ Saqlanmoqda...'; }
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'time_bank_rules_save',
                childId: childKey,
                enabled: document.getElementById('tbEnabled')?.checked !== false,
                minutesPerFocus: num('tbFocus', 10),
                minutesPerSchoolOntime: num('tbSchool', 20),
                minutesPerHomework: num('tbHomework', 15),
                dailyCapMinutes: num('tbCap', 60)
            })
        });
        const d = await resp.json();
        if (d.ok) {
            alert("✅ Kurs saqlandi. Farzandingiz shu kurs bo'yicha ball ishlab topadi.");
            closeSubpage();
        } else {
            alert('Xatolik: ' + (d.error || "qayta urinib ko'ring"));
        }
    } catch (e) {
        console.error('time_bank_rules_save error:', e);
        alert("Server javob bermayapti. Keyinroq urinib ko'ring.");
    } finally {
        if (btn) { btn.disabled = false; btn.innerText = '💾 Kursni Saqlash'; }
    }
}

let timeBankInfo = null;

/** Vaqt banki kartasini serverdagi haqiqiy balans bilan yangilaydi. */
async function renderTimeBank() {
    const card = document.getElementById('timeBankCard');
    if (!card || currentAppRole !== 'child') return;
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'time_bank_status' })
        });
        const d = await resp.json();
        if (!d.ok) return;

        card.classList.remove('hidden');
        timeBankInfo = d;
        const set = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; };
        set('timeBankBalance', d.balance + ' ball');
        set('timeBankToday', `Bugun: ${d.earnedToday} / ${d.dailyCap} ball`);

        const list = document.getElementById('timeBankHistory');
        if (list) {
            const labels = {
                focus: '🎯 Fokus',
                school_ontime: '🏫 O\'z vaqtida',
                homework: '📚 Uy vazifasi',
                parent_bonus: '🎁 Ota-ona bonusi',
                spend: '📱 Sarflandi',
                gift: '🎁 Sovg\'a',
                shop: '🛍 Do\'kon',
                pro_exchange: '⭐️ Pro'
            };
            list.innerHTML = (d.history || []).slice(0, 4).map(h =>
                `<div class="flex items-center justify-between text-[10px]">
                    <span class="text-slate-400">${labels[h.reason] || h.reason}</span>
                    <span class="font-bold ${h.minutes > 0 ? 'text-emerald-400' : 'text-rose-400'}">${h.minutes > 0 ? '+' : ''}${h.minutes} ball</span>
                </div>`
            ).join('') || '<div class="text-[10px] text-slate-500">Hali yozuv yo\'q — fokus seansini boshla!</div>';
        }

        renderCompanion(d.companion);
        loadShop().catch(() => {});
    } catch (e) {
        console.error('time_bank_status error:', e);
    }
}

// ============================================================================
// BOLA PANELI: kunlik xabar, liga, fokus jangi
// ============================================================================

/** "Bugun men..." — bola ota-onasiga o'zi xabar yuboradi. */
async function sendDailyNote(mood) {
    const note = prompt("Qisqa gap qo'shasanmi? (ixtiyoriy, bo'sh qoldirsang ham bo'ladi)") || '';
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'child_daily_note', mood, note })
        });
        const d = await resp.json();
        alert(d.ok
            ? "✅ Xabaring ota-onangga yuborildi!"
            : (d.error || "Yuborilmadi. Keyinroq urinib ko'r."));
    } catch (e) {
        console.error('child_daily_note error:', e);
        alert("Server javob bermayapti.");
    }
}

/**
 * Qalqon Ligasi. Server faqat O'RINni qaytaradi — boshqa bolalarning ismi
 * yoki username'i emas. Voyaga yetmaganlarning ro'yxatini bir-biriga
 * ko'rsatish maxfiylik jihatidan yo'l qo'yib bo'lmaydigan narsa.
 */
let leagueState = null;
async function renderLeague() {
    const card = document.getElementById('leagueCard');
    if (!card || currentAppRole !== 'child') return;
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'league_status' })
        });
        const d = await resp.json();
        if (!d.ok) return;
        leagueState = d;
        card.classList.remove('hidden');

        const set = (id, t) => { const el = document.getElementById(id); if (el) el.innerText = t; };
        set('leagueRank', d.rank ? d.rank + '-o\'rin' : '—');
        set('leagueTotal', d.total ? d.total + ' bola orasida' : 'hali ishtirokchi yo\'q');
        set('leagueSub', 'Bu hafta: ' + d.myMinutes + ' daqiqa');

        const bar = document.getElementById('leagueBar');
        if (bar) {
            const pct = d.topMinutes > 0 ? Math.round((d.myMinutes / d.topMinutes) * 100) : 0;
            bar.style.width = Math.max(3, Math.min(100, pct)) + '%';
        }
        // Ligada deyarli hech kim bo'lmasa "sen birinchisan" degan maqtov
        // bo'sh yangraydi. O'sha payt bolani do'stini chaqirishga undaymiz —
        // liga faqat shunda haqiqiy musobaqaga aylanadi.
        set('leagueHint', !d.rank
            ? "Fokus seansini boshla — va reytingga qo'shil!"
            : d.total < 3
                ? "Ligada hali kam odam. Do'stingni chaqir — birga qiziqroq! 🤝"
                : d.rank === 1
                    ? "🥇 Sen birinchisan! Ushlab tur."
                    : `Keyingi o'ringa chiqish uchun yana ${d.toNext} daqiqa kerak.`);
    } catch (e) {
        console.error('league_status error:', e);
    }
}

/**
 * Natija kartochkasini chizadi (Telegram Story formati — 1080x1920).
 *
 * Rasm mijozda chiziladi: shareToStory tayyor HTTPS havolani talab qiladi,
 * data: URI ham, canvas ham qabul qilinmaydi. Shuning uchun chizilgan rasm
 * serverga yuborilib, ommaviy havolasi olinadi.
 */
function drawStoryCard(league, companion) {
    const W = 1080, H = 1920;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');

    // Fon — ilovaning o'z rangi
    const bg = x.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0f172a');
    bg.addColorStop(0.55, '#1e1b4b');
    bg.addColorStop(1, '#0f172a');
    x.fillStyle = bg;
    x.fillRect(0, 0, W, H);

    // Yumshoq yorug'lik
    const glow = x.createRadialGradient(W / 2, 620, 40, W / 2, 620, 620);
    glow.addColorStop(0, 'rgba(139,92,246,0.35)');
    glow.addColorStop(1, 'rgba(139,92,246,0)');
    x.fillStyle = glow;
    x.fillRect(0, 0, W, 1300);

    x.textAlign = 'center';

    // Sarlavha
    x.fillStyle = '#67e8f9';
    x.font = 'bold 44px system-ui, sans-serif';
    x.fillText('QALQON AI', W / 2, 220);

    // Bo'ri
    x.font = '210px system-ui, sans-serif';
    x.fillText(companion && !companion.asleep ? (companion.emoji || '🐺') : '🐺', W / 2, 520);

    x.fillStyle = '#ffffff';
    x.font = 'bold 66px system-ui, sans-serif';
    x.fillText(companion?.name || 'Qalqon', W / 2, 630);

    x.fillStyle = '#a5b4fc';
    x.font = '40px system-ui, sans-serif';
    x.fillText(`${companion?.level || 1}-daraja · ${companion?.title || ''}`, W / 2, 700);

    // Asosiy natija.
    //
    // Agar ligada bola deyarli yolg'iz bo'lsa, "1 bola orasida 1-o'rin" deb
    // yozish maqtanish emas, kulgili bo'lardi — do'sti buni ko'rsa ilovaga
    // qiziqmaydi. Shuning uchun kam odam bo'lganda o'rin emas, bolaning
    // haqiqiy mehnati — fokus daqiqalari asosiy son bo'ladi.
    const hasLeague = league.total >= 3 && league.rank;
    const cardY = 800, cardH = 420;
    x.fillStyle = 'rgba(15,23,42,0.75)';
    if (x.roundRect) { x.beginPath(); x.roundRect(90, cardY, W - 180, cardH, 48); x.fill(); }
    else x.fillRect(90, cardY, W - 180, cardH);

    x.fillStyle = '#c4b5fd';
    x.font = 'bold 38px system-ui, sans-serif';
    x.fillText('BU HAFTA', W / 2, cardY + 90);

    x.fillStyle = '#a78bfa';
    x.font = 'bold 190px system-ui, sans-serif';
    x.fillText(String(hasLeague ? league.rank : (league.myMinutes || 0)), W / 2, cardY + 265);

    x.fillStyle = '#e2e8f0';
    x.font = 'bold 46px system-ui, sans-serif';
    x.fillText(
        hasLeague ? `${league.total} bola orasida` : 'daqiqa diqqat bilan',
        W / 2, cardY + 350
    );

    // Pastki ko'rsatkichlar
    const statY = 1340;
    const stat = (cx, value, label, color) => {
        x.fillStyle = color;
        x.font = 'bold 82px system-ui, sans-serif';
        x.fillText(value, cx, statY);
        x.fillStyle = '#94a3b8';
        x.font = '34px system-ui, sans-serif';
        x.fillText(label, cx, statY + 58);
    };
    // Asosiy sonda nima ko'rsatilgan bo'lsa, pastda u takrorlanmaydi.
    if (hasLeague) stat(W / 4, String(league.myMinutes), 'daqiqa fokus', '#34d399');
    else stat(W / 4, String(companion?.level || 1), 'bo\'ri darajasi', '#34d399');
    stat((W / 4) * 3, String(companion?.streak || 0), 'kun ketma-ket', '#fb923c');

    // Shior
    x.fillStyle = '#e2e8f0';
    x.font = 'bold 52px system-ui, sans-serif';
    x.fillText('Diqqat bilan ishladim 🎯', W / 2, 1560);

    x.fillStyle = '#64748b';
    x.font = '38px system-ui, sans-serif';
    x.fillText('@qalqon_aibot', W / 2, 1760);

    return c.toDataURL('image/jpeg', 0.9);
}

/**
 * Natijani ulashish. Avval Story'ga urinamiz (bolalar uchun eng "maqtanarli"
 * joy); mijoz eski bo'lsa yoki rasm yuklanmasa — oddiy ulashish oynasiga
 * qaytamiz, shunda tugma hech qachon "ishlamay qolgan"dek bo'lmaydi.
 */
async function shareLeagueResult() {
    const d = leagueState;
    if (!d || !d.myMinutes) {
        alert("Avval biroz fokus qil — keyin maqtanadigan natija bo'ladi 🙂");
        return;
    }
    // Matn ham kartochka bilan bir xil mantiqda: kam odam bo'lsa o'rin haqida
    // gapirmaymiz, chunki "1 bola orasida 1-o'rin" hech narsani anglatmaydi.
    const text = (d.total >= 3 && d.rank)
        ? `Men bu hafta Qalqon Ligasida ${d.total} bola orasida ${d.rank}-o'rindaman! ` +
          `${d.myMinutes} daqiqa diqqat bilan ishladim 🎯`
        : `Bu hafta ${d.myMinutes} daqiqa diqqat bilan ishladim 🎯 Sen ham sinab ko'r!`;

    const fallback = () => {
        const shareUrl = 'https://t.me/share/url?url=' + encodeURIComponent('https://t.me/qalqon_aibot') +
                         '&text=' + encodeURIComponent(text);
        if (tg && tg.openTelegramLink) tg.openTelegramLink(shareUrl);
        else window.open(shareUrl, '_blank');
    };

    if (!tg || typeof tg.shareToStory !== 'function') { fallback(); return; }

    try {
        const dataUrl = drawStoryCard(d, companionState);
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'story_card_upload', image: dataUrl })
        });
        const up = await resp.json();
        if (!up.ok || !up.url) { fallback(); return; }

        tg.shareToStory(up.url, {
            text: text,
            widget_link: { url: 'https://t.me/qalqon_aibot', name: 'Qalqon AI' }
        });
    } catch (e) {
        console.error('shareToStory error:', e);
        fallback();
    }
}

/** Fokus jangi holati. */
let duelState = null;
async function renderDuel() {
    const card = document.getElementById('duelCard');
    if (!card || currentAppRole !== 'child') return;
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'duel_status' })
        });
        const d = await resp.json();
        if (!d.ok) return;
        card.classList.remove('hidden');
        duelState = d.duel;

        const body = document.getElementById('duelBody');
        const btn = document.getElementById('duelBtn');
        if (!body || !btn) return;

        if (!d.duel) {
            body.innerHTML = "Do'stingni chaqir: 24 soat ichida kim ko'proq fokus daqiqasi to'plasa — o'sha yutadi.";
            btn.innerText = "⚔️ Do'stni chaqirish";
            return;
        }
        if (d.duel.status === 'open') {
            body.innerHTML = `Chaqiruv yuborilgan, do'sting qabul qilishini kutyapmiz.<br>
                <span class="text-[10px] text-slate-500">Kod: <b>${d.duel.code}</b></span>`;
            btn.innerText = "📤 Chaqiruvni qayta yuborish";
            return;
        }
        if (d.duel.status === 'active') {
            const leftMin = Math.max(0, Math.round((new Date(d.duel.endsAt) - Date.now()) / 60000));
            const left = leftMin >= 60 ? Math.floor(leftMin / 60) + ' soat' : leftMin + ' daqiqa';
            const winning = d.duel.myMinutes >= d.duel.rivalMinutes;
            body.innerHTML = `
                <div class="flex items-center justify-between py-1">
                    <span>Sen</span><b class="${winning ? 'text-emerald-400' : 'text-slate-300'}">${d.duel.myMinutes} daq</b>
                </div>
                <div class="flex items-center justify-between py-1 border-t border-slate-800">
                    <span>${d.duel.rivalName || "Raqib"}</span><b class="${!winning ? 'text-emerald-400' : 'text-slate-300'}">${d.duel.rivalMinutes} daq</b>
                </div>
                <div class="text-[10px] text-slate-500 pt-1">${left} qoldi · ${winning ? 'Oldindasan! 🔥' : 'Yetib olish mumkin 💪'}</div>`;
            btn.innerText = "🎯 Fokus seansini boshlash";
            return;
        }
        const won = d.duel.myMinutes > d.duel.rivalMinutes;
        body.innerHTML = won
            ? `🏆 <b>Yutding!</b> ${d.duel.myMinutes} : ${d.duel.rivalMinutes}`
            : `Bu safar bo'lmadi: ${d.duel.myMinutes} : ${d.duel.rivalMinutes}. Yangi jang boshla!`;
        btn.innerText = "⚔️ Yangi jang";
    } catch (e) {
        console.error('duel_status error:', e);
    }
}

async function handleDuelButton() {
    // Jang ketayotgan bo'lsa — tugma taymerni boshlaydi.
    if (duelState && duelState.status === 'active') {
        switchChildTab('child-tab-home');
        if (!isPomodoroRunning) togglePomodoroTimer();
        return;
    }
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'duel_create' })
        });
        const d = await resp.json();
        if (!d.ok) { alert(d.error || "Bajarilmadi."); return; }

        const link = d.link || (d.duel && `https://t.me/qalqon_aiBot?start=duel_${d.duel.code}`);
        const text = "Fokus jangiga chaqiraman! 24 soat — kim ko'proq diqqat bilan ishlaydi? 🎯";
        const shareUrl = 'https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(text);
        if (tg && tg.openTelegramLink) tg.openTelegramLink(shareUrl);
        else window.open(shareUrl, '_blank');
        renderDuel();
    } catch (e) {
        console.error('duel_create error:', e);
        alert("Server javob bermayapti.");
    }
}

/** Havolada ?duel=KOD bo'lsa — jangni qabul qilamiz. */
async function acceptDuelFromUrl() {
    const code = new URLSearchParams(window.location.search).get('duel');
    if (!code || currentAppRole !== 'child') return;
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'duel_accept', code })
        });
        const d = await resp.json();
        if (d.ok) {
            alert("⚔️ Jang boshlandi! 24 soat ichida kim ko'proq fokus daqiqasi to'plasa — o'sha yutadi.");
        } else if (d.error) {
            alert(d.error);
        }
    } catch (e) {
        console.error('duel_accept error:', e);
    }
}

// Bo'ri holati — natija kartochkasini chizishda ham ishlatiladi.
let companionState = null;

/** Bo'ri hamroh. Barcha qiymatlar serverdan — bola o'ziga daraja yoza olmaydi. */
function renderCompanion(c) {
    const card = document.getElementById('companionCard');
    if (!card || !c) return;
    companionState = c;
    card.classList.remove('hidden');

    const set = (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; };
    set('companionName', c.name || 'Qalqon');
    const badge = document.getElementById('companionBadge');
    if (badge) {
        badge.textContent = c.badge ? c.badge.emoji + ' ' + c.badge.title : '';
        badge.classList.toggle('hidden', !c.badge);
    }
    const acc = document.getElementById('companionAccessory');
    if (acc) {
        acc.textContent = c.accessory ? c.accessory.emoji : '';
        acc.classList.toggle('hidden', !c.accessory);
    }
    set('companionLevel', c.level + '-daraja');
    set('companionXp', c.xp + ' XP');
    set('companionStreak', c.streak + ' kun');

    const emoji = document.getElementById('companionEmoji');
    // Uxlayotgan bo'ri boshqacha ko'rinadi — bu bolani qaytarishga undaydi.
    if (emoji) emoji.innerText = c.asleep ? '😴' : (c.emoji || '🐺');
    set('companionTitle', c.asleep ? "Uxlab qoldi — uyg'otish uchun dars qil" : (c.title || ''));

    const bar = document.getElementById('companionBar');
    if (bar) bar.style.width = Math.max(0, Math.min(100, c.progress || 0)) + '%';

    const hint = document.getElementById('companionHint');
    if (hint) {
        if (c.asleep) {
            hint.innerText = "Bo'ring seni kutyapti. Bitta fokus seansi — va u yana uyg'onadi.";
        } else if (c.xpForNext) {
            hint.innerText = `Keyingi darajagacha ${c.xpForNext - c.xp} XP qoldi. Eng uzun ketma-ketliging: ${c.bestStreak} kun.`;
        } else {
            hint.innerText = `Eng yuqori darajaga yetding! Eng uzun ketma-ketliging: ${c.bestStreak} kun.`;
        }
    }
}

function resetPomodoroTimer() {
    clearInterval(pomodoroInterval);
    isPomodoroRunning = false;
    pomodoroSeconds = 25 * 60;
    updatePomodoroDisplay();
    const btn = document.getElementById('pomodoroBtn');
    const label = document.getElementById('pomodoroStatusLabel');
    const isRu = (currentLang === 'ru');
    if (btn) btn.innerText = isRu ? "▶️ Старт" : "▶️ Boshlash";
    if (label) label.innerText = isRu ? "Готов к урокам? Нажми Старт!" : "Dars qilishga tayyormisan? Boshlash tugmasini bos!";
}

/**
 * Farzand ulanishni o'zi to'xtatadi.
 *
 * Bu ataylab mavjud: kuzatilayotgan odam kuzatuvni to'xtata olishi kerak
 * (Google Play'ning stalkerware siyosati ham shuni talab qiladi). Ota-onaga
 * xabar boradi — jimgina yo'qolib qolish ishonchni buzadi.
 */
async function handleChildLeaveFamily() {
    const ok = confirm(
        "Ulanishni to'xtatmoqchimisan?\n\n" +
        "Ota-onang bu haqda xabar oladi va joylashuving unga ko'rinmay qoladi.\n\n" +
        "Avval ota-onang bilan gaplashib olishing yaxshiroq bo'ladi."
    );
    if (!ok) return;

    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'leave_family' })
        });
        const data = await resp.json();
        if (data.ok) {
            try {
                localStorage.removeItem('child_consented');
                localStorage.removeItem('child_family_code');
            } catch (e) {}
            alert("Ulanish to'xtatildi. Ota-onangga xabar berildi.");
            window.location.reload();
        } else {
            alert(data.error || "Bajarilmadi. Keyinroq urinib ko'ring.");
        }
    } catch (e) {
        console.error('leave_family error:', e);
        alert("Server javob bermayapti. Keyinroq urinib ko'ring.");
    }
}

// ============================================================================
// 5. AUTHENTICATION (KIRISH VA REGISTRATSIYA)
// ============================================================================
function switchAuthTab(tab) {
    const isRegister = (tab === 'register');
    const tabReg = document.getElementById('tabBtnRegister');
    const tabLog = document.getElementById('tabBtnLogin');
    if (tabReg) {
        tabReg.className = isRegister 
            ? "flex-1 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-500 shadow transition" 
            : "flex-1 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition";
    }
    if (tabLog) {
        tabLog.className = !isRegister 
            ? "flex-1 py-1.5 rounded-lg text-xs font-bold text-white bg-sky-500 shadow transition" 
            : "flex-1 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition";
    }
    
    const formReg = document.getElementById('formRegister');
    const formLog = document.getElementById('formLogin');
    if (formReg) formReg.classList.toggle('hidden', !isRegister);
    if (formLog) formLog.classList.toggle('hidden', isRegister);
    
    const authErr = document.getElementById('authErrorMsg');
    const loginErr = document.getElementById('loginErrorMsg');
    if (authErr) authErr.classList.add('hidden');
    if (loginErr) loginErr.classList.add('hidden');
}

function handleParentRegister() {
    const usernameInput = document.getElementById('regUsername');
    const passwordInput = document.getElementById('regPassword');
    const confirmInput = document.getElementById('regConfirmPassword');
    const errorBox = document.getElementById('authErrorMsg');

    const username = usernameInput ? usernameInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";
    const confirmPassword = confirmInput ? confirmInput.value.trim() : "";

    if (!username || !password || !confirmPassword) {
        if (errorBox) {
            errorBox.innerText = (currentLang === 'ru') 
                ? "⚠️ Заполните все поля!" 
                : "⚠️ Barcha maydonlarni to'ldiring!";
            errorBox.classList.remove('hidden');
        }
        return;
    }

    if (password !== confirmPassword) {
        if (errorBox) {
            errorBox.innerText = (currentLang === 'ru') 
                ? "⚠️ Пароли не совпадают! Введите одинаковые пароли." 
                : "⚠️ Parollar mos kelmadi! Iltimos, bir xil parol kiriting.";
            errorBox.classList.remove('hidden');
        }
        return;
    }

    if (password.length < 4) {
        if (errorBox) {
            errorBox.innerText = (currentLang === 'ru') 
                ? "⚠️ Пароль должен содержать минимум 4 символа!" 
                : "⚠️ Parol kamida 4 ta belgidan iborat bo'lishi kerak!";
            errorBox.classList.remove('hidden');
        }
        return;
    }

    if (errorBox) errorBox.classList.add('hidden');

    const formattedUsername = username.startsWith('@') ? username : `@${username}`;
    currentAuthUser = {
        username: formattedUsername,
        password: password,
        status: 'approved',
        registeredAt: new Date().toISOString()
    };
    authStatus = 'approved';
    localStorage.setItem('auth_user', JSON.stringify(currentAuthUser));
    localStorage.setItem('auth_status', authStatus);

    // Supabase orqali bildirishnoma yuborish
    try {
        fetch('https://wfrclcwjeeqeqchmdhzw.supabase.co/functions/v1/ota-ona-bot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'parent_registration_request',
                username: formattedUsername,
                familyCode: familyCode,
                timestamp: new Date().toISOString()
            })
        }).catch(err => console.log('Notification sent'));
    } catch(e) {}

    updateAuthUI();
    closeSubpage();
    const successMsg = (currentLang === 'ru') 
        ? "🎉 Регистрация успешно завершена! Доступ ко всем функциям активирован."
        : "🎉 Ro'yxatdan o'tish muvaffaqiyatli yakunlandi! Barcha bo'limlar to'liq faollashtirildi.";
    alert(successMsg);
}

function handleParentLogin() {
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    const errorBox = document.getElementById('loginErrorMsg');

    const username = usernameInput ? usernameInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    if (!username || !password) {
        if (errorBox) {
            errorBox.innerText = (currentLang === 'ru') ? "⚠️ Введите логин и пароль!" : "⚠️ Username va parolni kiriting!";
            errorBox.classList.remove('hidden');
        }
        return;
    }

    const formattedUsername = username.startsWith('@') ? username : `@${username}`;
    currentAuthUser = {
        username: formattedUsername,
        password: password,
        status: 'approved'
    };
    authStatus = 'approved';
    localStorage.setItem('auth_user', JSON.stringify(currentAuthUser));
    localStorage.setItem('auth_status', authStatus);

    if (errorBox) errorBox.classList.add('hidden');
    closeSubpage();
    updateAuthUI();
    alert(currentLang === 'ru' ? "✅ Успешный вход в аккаунт!" : "✅ Tizimga muvaffaqiyatli kirdingiz!");
}

function updateAuthUI() {
    const banner = document.getElementById('authStatusBanner');
    const bannerIcon = document.getElementById('authBannerIcon');
    const bannerTitle = document.getElementById('authBannerTitle');
    const bannerSub = document.getElementById('authBannerSub');
    const bannerBtn = document.getElementById('authBannerBtn');
    const settingsUsername = document.getElementById('settingsAuthUsername');
    const settingsStatus = document.getElementById('settingsAuthStatus');
    const isRu = (currentLang === 'ru');

    if (banner) {
        banner.className = "p-2.5 mb-3 rounded-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 flex items-center justify-between";
        if (bannerIcon) bannerIcon.innerText = "🛡️";
        if (bannerTitle) bannerTitle.innerText = isRu ? `${currentAuthUser?.username || 'Родитель'} (Активен)` : `${currentAuthUser?.username || 'Ota-ona'} (Faol)`;
        if (bannerSub) bannerSub.innerText = isRu ? "Все разделы контроля активны" : "Barcha nazorat bo'limlari to'liq faol";
        if (bannerBtn) {
            bannerBtn.className = "px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30";
            bannerBtn.innerText = isRu ? "Профиль" : "Profil";
        }
    }
    if (settingsUsername) settingsUsername.innerText = currentAuthUser?.username || (isRu ? "Аккаунт Родителя" : "Ota-ona Hisobi");
    if (settingsStatus) {
        settingsStatus.className = "text-[10px] text-emerald-400";
        settingsStatus.innerText = isRu ? "Статус: Активен (Вход выполнен)" : "Holat: To'liq Faol";
    }
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
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('app_lang', lang);
    applyLanguageTranslations();
    renderActiveChild();
    renderSchoolCurriculum();
    closeSubpage();
}

// ============================================================================
// 5. TA'LIM VA DTS 100 BALLIK BAHOLAR GRAFIGI
// ============================================================================
function getSubjectScore(subject, grade, period) {
    let hash = 0;
    const key = `${subject}_${grade}_${period}`;
    for (let i = 0; i < key.length; i++) {
        hash = (hash << 5) - hash + key.charCodeAt(i);
        hash |= 0;
    }
    const base = 75 + Math.abs(hash % 24); // 75 dan 98 gacha ball
    return Math.min(100, Math.max(60, base));
}

function renderSchoolCurriculum() {
    const child = childrenDatabase[currentChildKey];
    if (!child) return;

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
    if (document.getElementById('profilePhone')) {
        document.getElementById('profilePhone').value = child.phone || "+998 90 123 45 67";
    }
    openSubpage('modal-child-profile');
}

function saveChildProfile() {
    const fullName = document.getElementById('profileFullName').value.trim() || "Farzand";
    const username = document.getElementById('profileUsername').value.trim() || "@farzand";
    const grade = parseInt(document.getElementById('profileClassSelect').value) || 5;
    const phone = document.getElementById('profilePhone')?.value.trim() || "+998 90 123 45 67";

    childrenDatabase[currentChildKey].name = fullName;
    childrenDatabase[currentChildKey].username = username;
    childrenDatabase[currentChildKey].grade = grade;
    childrenDatabase[currentChildKey].phone = phone;

    localStorage.setItem('children_database', JSON.stringify(childrenDatabase));

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
    if (!child) return;
    const isRu = (currentLang === 'ru');

    const screenEl = document.getElementById('totalScreenTime');
    if (screenEl) screenEl.innerText = isRu ? child.screenTime_ru : child.screenTime;

    const battEl = document.getElementById('batteryBadge');
    if (battEl) battEl.innerText = `${child.battery}%`;

    const statBattEl = document.getElementById('statBattery');
    if (statBattEl) statBattEl.innerText = `${child.battery}%`;

    const remEl = document.getElementById('remainingTime');
    if (remEl) remEl.innerText = isRu ? child.remaining_ru : child.remaining;

    const selectEl = document.getElementById('childSelector');
    if (selectEl) selectEl.value = currentChildKey;

    // Ilovalar reytingi
    const appList = document.getElementById('appUsageList');
    if (appList && child.apps) {
        appList.innerHTML = child.apps.map(app => `
            <div class="space-y-1">
                <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2">
                        <span>${app.icon}</span>
                        <span class="font-bold text-white">${app.name}</span>
                        <span class="text-[10px] text-slate-400">(${isRu ? app.category_ru : app.category})</span>
                    </div>
                    <span class="font-bold text-slate-300 font-mono">${app.time}</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill ${app.color}" style="width: ${app.percent}%;"></div>
                </div>
            </div>
        `).join('');
    }

    // Qiziqishlar vektorlari
    const interestContainer = document.getElementById('aiInterestVectors');
    if (interestContainer && child.interests) {
        const interests = child.interests[currentLang] || child.interests.uz || [];
        interestContainer.innerHTML = interests.map(item => `
            <div class="space-y-1">
                <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-300 font-medium">${item.topic}</span>
                    <span class="font-bold text-emerald-400 font-mono">${item.percent}%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill ${item.color}" style="width: ${item.percent}%;"></div>
                </div>
            </div>
        `).join('');
    }

    // Geofences
    const geofenceList = document.getElementById('geofenceList');
    if (geofenceList && child.location && child.location.geofences) {
        geofenceList.innerHTML = child.location.geofences.map(geo => `
            <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span class="text-xs font-semibold text-slate-300">${geo.name}</span>
                <span class="text-[10px] font-bold ${geo.color}">${geo.status}</span>
            </div>
        `).join('');
    }

    // Radar manzil
    const radarAddr = document.getElementById('radarCurrentAddress') || document.getElementById('radarAddress');
    if (radarAddr && child.location) {
        radarAddr.innerText = isRu ? child.location.address_ru : child.location.address;
    }
}

// ============================================================================
// 7. GEMINI AI TIZIMI (CHAT, FOTO, OVOZ VA REELS TAHLILI)
// ============================================================================
function handleImageSelected(event) {
    handleImageUpload(event);
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImageBase64 = e.target.result;
        const prevContainer = document.getElementById('imagePreviewContainer');
        const prevThumb = document.getElementById('imagePreviewThumb') || document.getElementById('imagePreview');
        if (prevContainer) prevContainer.classList.remove('hidden');
        if (prevThumb) prevThumb.src = uploadedImageBase64;
    };
    reader.readAsDataURL(file);
}

function clearImagePreview() {
    uploadedImageBase64 = null;
    const prevContainer = document.getElementById('imagePreviewContainer');
    if (prevContainer) prevContainer.classList.add('hidden');
    const fileInput = document.getElementById('aiFileInput') || document.getElementById('aiImageInput');
    if (fileInput) fileInput.value = "";
}

function sendTextMessage() {
    const input = document.getElementById('aiTextInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text && !uploadedImageBase64) return;

    appendUserMessage(text, uploadedImageBase64);
    input.value = "";

    setTimeout(() => {
        generateAIResponse(text, uploadedImageBase64);
        clearImagePreview();
    }, 600);
}

function sendQuickPrompt(promptText) {
    const input = document.getElementById('aiTextInput');
    if (input) input.value = promptText;
    sendTextMessage();
}


async function callRealTextBackend(message) {
    const child = childrenDatabase[currentChildKey];
    const isRu = (currentLang === 'ru');
    appendAIMessage(isRu ? '⏳ Думаю…' : '⏳ O\'ylayapman…');
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'ai_tutor_chat',
                audience: 'parent',
                message: message || '',
                grade: child?.grade || 5,
                subject: getTutorSubject()
            })
        });
        const data = await resp.json();
        if (data.ok && data.answer) {
            appendAIMessage(safeAiHtml(data.answer));
        } else {
            appendAIMessage(safeAiHtml(data.error || (isRu ? 'Ошибка анализа.' : 'Tahlilda xatolik.')));
        }
    } catch (e) {
        console.error('Text backend error:', e);
        appendAIMessage(isRu ? '⚠️ Сервер временно недоступен.' : '⚠️ Server vaqtincha javob bermayapti.');
    }
}

async function callRealVisionBackend(query, imageBase64) {
    const child = childrenDatabase[currentChildKey];
    const isRu = (currentLang === 'ru');
    const thinkingMsg = isRu
        ? '\ud83e\udd14 Анализирую фото задания, подождите немного (может занять до минуты при первом запросе)...'
        : '\ud83e\udd14 Mashqni tahlil qilyapman, biroz kuting (birinchi so\'rovda bir daqiqagacha vaqt olishi mumkin)...';
    appendAIMessage(thinkingMsg);
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'ai_tutor_chat',
                audience: 'parent',
                message: query || '',
                image: imageBase64,
                grade: child?.grade || 5,
                subject: getTutorSubject()
            })
        });
        const data = await resp.json();
        if (data.ok && data.answer) {
            appendAIMessage(safeAiHtml(data.answer));
        } else {
            appendAIMessage(isRu ? 'Извините, произошла ошибка при анализе. Попробуйте ещё раз.' : 'Kechirasiz, tahlil qilishda xatolik yuz berdi. Qayta urinib ko\'ring.');
        }
    } catch (e) {
        console.error('Vision backend error:', e);
        const isRu2 = (currentLang === 'ru');
        appendAIMessage(isRu2 ? '\u26a0\ufe0f Сервер временно недоступен. Попробуйте через минуту.' : '\u26a0\ufe0f Server vaqtincha javob bermayapti. Bir daqiqadan keyin qayta urinib ko\'ring.');
    }
}

function generateAIResponse(query, imageBase64) {
    if (imageBase64) {
        callRealVisionBackend(query, imageBase64);
        return;
    }
    callRealTextBackend(query);
    return;

    const child = childrenDatabase[currentChildKey];
    const qLower = (query || "").toLowerCase();
    const isRu = (currentLang === 'ru');
    let responseText = "";

    const ragMatch = searchDtsKnowledge(query, null);

    if (imageBase64) {
        if (isRu) {
            responseText = `
                <b>📷 Вывод по анализу задания:</b><br>
                Загруженное фото школьного задания проанализировано. Рекомендация для <b>${child?.name_ru || child?.name || 'ребёнка'} (${child?.grade || 5}-класс)</b>:<br>
                • <b>Правило:</b> Закрепите теоретическое понятие на практических примерах в течение 10 минут.<br>
                • <b>Закрепление:</b> Решите 2-3 упражнения самостоятельно и проверьте балл в e-Maktab! 🌟
            `;
        } else {
            responseText = `
                <b>📷 Vazifa / Rasm Tahlili Xulosasi:</b><br>
                Yuklangan darslik topshirig'i tahlil qilindi. <b>${child?.name || 'Farzandingiz'} (${child?.grade || 5}-sinf)</b> uchun ushbu darslik mavzusini o'zlashtirish bo'yicha yo'riqnoma:<br>
                • <b>Asosiy qoida:</b> Mavzuning nazariy tushunchasini 10 daqiqa amaliy misollar orqali ko'rib chiqing.<br>
                • <b>Mustahkamlash:</b> Darslikdagi 2-3 ta topshiriqni mustaqil yechishga yo'naltiring va 100 ballik e-Maktab ko'rsatkichini qayd eting! 🌟
            `;
        }
    } else if (ragMatch) {
        responseText = `
            <b>📚 Darslik Tahlili (${ragMatch.grade}-sinf ${ragMatch.subject}, ${ragMatch.page}-bet):</b><br>
            • <b>Mavzu:</b> ${ragMatch.chapter}<br>
            • <b>DTS Standarti:</b> ${ragMatch.rule}<br>
            ${ragMatch.formula ? `• <b>Asosiy formula:</b> <code>${ragMatch.formula}</code><br>` : ''}
            💡 <i>Farzandingizga ushbu mavzu bo'yicha e-Maktabda 100 ball to'plashida yordam bering!</i>
        `;
    } else if (qLower.includes("reels") || qLower.includes("short") || qLower.includes("video") || qLower.includes("insta") || qLower.includes("youtube") || qLower.includes("видео")) {
        if (isRu) {
            responseText = `
                <b>🎬 Анализ просмотренных Reels и видео:</b><br>
                Точные данные по видеоконтенту для <b>${child?.name_ru || child?.name || 'ребёнка'} (${child?.grade || 5}-класс)</b>:<br><br>
                📊 <b>Распределение по темам:</b><br>
                • <b>💻 Образование и IT (Python, Робототехника, Языки):</b> 45% (Полезно)<br>
                • <b>🔬 Научные опыты и Логические задачи:</b> 25% (Положительно)<br>
                • <b>🎮 Развлечения и Игры:</b> 30% (В норме)<br><br>
                💡 <b>Рекомендация:</b> Чтобы алгоритм чаще рекомендовал обучающие видео, подпишитесь на полезные каналы по школьным предметам.
            `;
        } else {
            responseText = `
                <b>🎬 Ko'rilayotgan Reels va Video Kontent Tahlili:</b><br>
                Farzandingiz <b>${child?.name || 'Farzandingiz'} (${child?.grade || 5}-sinf)</b> tomosha qilayotgan Reels / Shorts videolari bo'yicha aniq ma'lumotlar:<br><br>
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
                Методы закрепления школьных предметов госстандарта (DTS) для <b>${child?.name_ru || child?.name || 'ребёнка'} (${child?.grade || 5}-класс)</b>:<br>
                • <b>Практический подход:</b> Изучение математики и естественных наук через графические примеры и опыты гораздо эффективнее.<br>
                • <b>Аналитика:</b> Совместно просматривайте показатели 100 баллов в разделе e-Maktab.
            `;
        } else {
            responseText = `
                <b>📚 Darslarni O'zlashtirish va Qiziqishni Oshirish:</b><br>
                <b>${child?.name || 'Farzandingiz'} (${child?.grade || 5}-sinf)</b> uchun Davlat ta'lim standarti fanlarini mustahkamlash usullari:<br>
                • <b>Amaliy yondashuv:</b> Matematika va tabiiy fanlarni grafik misollar va tajribalar orqali o'rganish samaraliroq.<br>
                • <b>Haftalik tahlil:</b> e-Maktab bo'limidagi 100 ballik ko'rsatkichlarni birgalikda ko'rib, yuqori natijalarni qayd etib boring.
            `;
        }
    } else {
        if (isRu) {
            responseText = `
                <b>💡 Информация:</b> Расписание уроков, оценки 100 баллов, онлайн-локация и заряд батареи <b>${child?.name_ru || child?.name || 'ребёнка'}</b> под постоянным контролем. Вы можете задать любой вопрос по предметам или лимитам.
            `;
        } else {
            responseText = `
                <b>💡 Ma'lumot:</b> Farzandingiz <b>${child?.name || 'Farzandingiz'} (${child?.grade || 5}-sinf)</b> ning dars jadvali, 100 ballik baholari, jonli joylashuvi va batareya ko'rsatkichlari doimiy nazorat ostida. Har qanday fan, video tahlili yoki limitlar bo'yicha savolingizni yozishingiz mumkin.
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
        if (btn) btn.classList.add('recording');
        if (status) status.classList.remove('hidden');
    } else {
        stopAndSendVoice();
    }
}

function stopAndSendVoice() {
    isRecordingVoice = false;
    const btn = document.getElementById('voiceRecordBtn');
    const status = document.getElementById('voiceRecordingStatus');
    if (btn) btn.classList.remove('recording');
    if (status) status.classList.add('hidden');

    const voiceNoteText = (currentLang === 'ru')
        ? "🎙️ Голосовой вопрос: «Помоги решить задачу по математике на странице 42»"
        : "🎙️ Ovozli savol: «42-betdagi matematika misolini tushuntirib ber»";
    
    appendUserMessage(voiceNoteText, null);
    setTimeout(() => {
        generateAIResponse("fan dars", null);
    }, 800);
}

function appendUserMessage(text, imageBase64) {
    const chat = document.getElementById('aiChatContainer') || document.getElementById('aiChatThread');
    if (!chat) return;
    let imgHtml = imageBase64 ? `<img src="${imageBase64}" class="w-32 h-32 object-cover rounded-xl mb-1.5 border border-white/20">` : "";
    const msg = document.createElement('div');
    msg.className = "flex justify-end";
    msg.innerHTML = `
        <div class="bg-emerald-500 text-white rounded-2xl rounded-tr-sm p-3 max-w-[85%] text-xs shadow-md">
            ${imgHtml}
            ${text ? `<div>${text}</div>` : ""}
        </div>
    `;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
}

function appendAIMessage(htmlContent) {
    const chat = document.getElementById('aiChatContainer') || document.getElementById('aiChatThread');
    if (!chat) return;
    const msg = document.createElement('div');
    msg.className = "flex gap-2.5 max-w-[90%]";
    msg.innerHTML = `
        <div class="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm flex-shrink-0">
            🤖
        </div>
        <div class="glass-card p-3 rounded-2xl rounded-tl-sm text-xs text-slate-200 leading-relaxed shadow-md">
            ${htmlContent}
        </div>
    `;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
}

// ============================================================================
// 8. SUBPAGE, MAVZU VA LOKATSIYA BOSHQARUVI
// ============================================================================
function setTheme(themeName) {
    currentTheme = themeName || 'default';
    localStorage.setItem('app_theme', currentTheme);
    document.body.setAttribute('data-theme', currentTheme);
    document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
    const activeCard = document.querySelector(`[data-theme-name="${currentTheme}"]`);
    if (activeCard) activeCard.classList.add('active');
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => {
        t.classList.remove('active');
        t.classList.add('hidden');
    });
    document.querySelectorAll('#parentBottomNav .nav-btn').forEach(b => b.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    const targetBtn = document.getElementById(`nav-${tabId}`);

    if (targetTab) {
        targetTab.classList.remove('hidden');
        targetTab.classList.add('active');
    }
    if (targetBtn) targetBtn.classList.add('active');

    if (tabId === 'tab-ai' && typeof renderParentAdvice === 'function') renderParentAdvice();
    if (tabId === 'tab-extras') renderParentExtras();
    if (tabId === 'tab-games') mountGamesInto('parentGamesHost');

    if (tabId === 'tab-radar') {
        setTimeout(() => {
            initRadarMap();
            if (mapInstance) mapInstance.invalidateSize();
        }, 150);
        renderRadarStatus();
        setTimeout(renderDayRoute, 400);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================================
// BOLA JOYLASHUVI — Mini App ichidan.
//
// Telegram'ning 📎 menyusi orqali jonli joylashuv ulashish faqat TELEFONDAGI
// mijozda mavjud: Desktop'da "Joylashuv" bandi yo'q, Mini App ichida esa 📎
// tugmasining o'zi yo'q. Shu sababli bolaga "📎 ni bos" deyish ko'p holatda
// bajarib bo'lmaydigan ko'rsatma edi.
//
// Mini App'ning o'z LocationManager'i esa har joyda ishlaydi. U JONLI
// kuzatuvni almashtirmaydi — bitta nuqta beradi — lekin ruxsat bir marta
// so'raladi, keyin panel har ochilganda nuqta o'zi saqlanadi.
// ============================================================================

let locationManagerReady = false;

function initLocationManager() {
    return new Promise((resolve) => {
        const lm = tg && tg.LocationManager;
        if (!lm || typeof lm.init !== 'function') { resolve(false); return; }
        if (lm.isInited) { locationManagerReady = true; resolve(true); return; }
        try {
            lm.init(() => { locationManagerReady = true; resolve(true); });
        } catch (e) {
            console.error('LocationManager init:', e);
            resolve(false);
        }
        // Eski mijozda callback umuman chaqirilmasligi mumkin — kutib
        // qolmaslik uchun qisqa muddatdan keyin baribir davom etamiz.
        setTimeout(() => resolve(locationManagerReady), 3000);
    });
}

function getTelegramLocation() {
    return new Promise((resolve) => {
        const lm = tg && tg.LocationManager;
        if (!lm || typeof lm.getLocation !== 'function') { resolve(null); return; }
        let done = false;
        try {
            lm.getLocation((loc) => { done = true; resolve(loc || null); });
        } catch (e) {
            console.error('getLocation:', e);
            resolve(null);
            return;
        }
        setTimeout(() => { if (!done) resolve(null); }, 12000);
    });
}

/**
 * Joylashuvni serverga yuboradi.
 * reason: 'auto' (panel ochilganda, jim), 'manual', 'arrived', 'asked'.
 */
async function sendMyLocation(reason) {
    const out = document.getElementById('childLocationResult');
    const silent = (reason === 'auto');
    const say = (t) => { if (out && !silent) out.textContent = t; };

    const ok = await initLocationManager();
    const lm = tg && tg.LocationManager;

    if (!ok || (lm && lm.isLocationAvailable === false)) {
        // Eski Telegram: imkoniyat yo'q. Bu xato emas, shuning uchun
        // bolani ayblamaymiz — nima qilishni aytamiz.
        if (!silent) {
            say("Telegram'ingiz eski bo'lgani uchun ilova ichidan joylashuv yuborib bo'lmaydi. Telegram'ni yangilang yoki pastdagi ko'rsatmadan foydalaning.");
        }
        return null;
    }

    say('📍 Joylashuv aniqlanmoqda...');
    const loc = await getTelegramLocation();

    if (!loc) {
        if (!silent) {
            const denied = lm && lm.isAccessGranted === false && lm.isAccessRequested;
            say(denied
                ? "Joylashuvga ruxsat berilmagan. Sozlamalardan ruxsat bering."
                : "Joylashuvni aniqlab bo'lmadi. Ochiq joyda qayta urinib ko'ring.");
            if (denied && lm && typeof lm.openSettings === 'function') lm.openSettings();
        }
        return null;
    }

    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'child_report_location',
                lat: loc.latitude,
                lng: loc.longitude,
                accuracyM: loc.horizontal_accuracy || null,
                reason: reason || 'manual'
            })
        });
        const d = await resp.json();
        if (!d.ok) { say(d.error || "Yuborib bo'lmadi."); return null; }

        if (!silent) {
            const zona = (d.alerts || []).map(a => a.message).join(' · ');
            say(reason === 'arrived'
                ? '✅ Ota-onangga "yetib keldim" deb yuborildi.' + (zona ? ' (' + zona + ')' : '')
                : '✅ Joylashuving yuborildi.' + (zona ? ' (' + zona + ')' : ''));
            if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
        }
        return d;
    } catch (e) {
        console.error('child_report_location:', e);
        say('Server javob bermadi.');
        return null;
    }
}

/** Jonli kuzatuv ko'rsatmasi. Mini App ichida 📎 yo'q, shuning uchun
 *  bolani suhbat oynasiga qaytarish kerak — u yerda 📎 bor. */
function openLiveLocationGuide() {
    const msg =
        "🛰️ Jonli kuzatuvni yoqish\n\n" +
        "MUHIM: buni ilova ichidan emas, botning SUHBAT oynasidan qilish kerak — " +
        "📎 tugmasi faqat o'sha yerda bo'ladi. Telefonda ishlaydi, kompyuterda yo'q.\n\n" +
        "1. Bu oynani yop\n" +
        "2. @qalqon_aibot suhbatida pastdagi 📎 ni bos\n" +
        "3. «Joylashuv» ni tanla\n" +
        "4. «Jonli joylashuvni ulashish» ni bos\n" +
        "5. Muddatni tanla\n\n" +
        "Yopamizmi?";
    const go = () => { if (tg && tg.close) tg.close(); };
    if (tg && tg.showConfirm) tg.showConfirm(msg, (yes) => { if (yes) go(); });
    else if (confirm(msg)) go();
}

// ============================================================================
// BALL DO'KONI (farzand) va SOVG'ALAR RO'YXATI (ota-ona)
//
// Ball Pro'ga almashtirilmaydi — Pro'ni ota-ona sotib oladi. Bola ballni
// o'zi his qiladigan narsaga sarflaydi. Narx, balans va egalik SERVERDA:
// bu yerdagi kod faqat ko'rsatadi, mijozdagi sonni o'zgartirish hech narsa
// bermaydi.
// ============================================================================

const RARITY_STYLE = {
    oddiy: { ring: 'border-slate-500/60', bg: 'from-slate-700/40 to-slate-900/60', text: 'text-slate-200' },
    noyob: { ring: 'border-sky-400/70', bg: 'from-sky-600/30 to-indigo-900/60', text: 'text-sky-200' },
    afsonaviy: { ring: 'border-amber-400/80', bg: 'from-amber-500/35 to-rose-900/60', text: 'text-amber-200' }
};

let shopState = null;
let shopTab = 'gifts';

/** O'yin qulflari internetsiz ham ishlashi uchun oxirgi holat eslab qolinadi. */
function rememberOwnedGames(items) {
    const owned = (items || []).filter(i => i.kind === 'game' && i.owned).map(i => i.gameId);
    const locked = (items || []).filter(i => i.kind === 'game').map(i => ({ id: i.gameId, price: i.price, key: i.key }));
    try { localStorage.setItem('qalqon_games', JSON.stringify({ owned, locked })); } catch (e) {}
}

/** Ball evaziga ochiladigan o'yinlar. Server ro'yxati bo'lmasa — standart. */
function paidGames(st) {
    if (st === undefined) {
        try { st = JSON.parse(localStorage.getItem('qalqon_games') || 'null'); } catch (e) { st = null; }
    }
    return (st && st.locked && st.locked.length) ? st.locked : [
        { id: 'race', price: 200, key: 'game_race' },
        { id: 'g2048', price: 200, key: 'game_g2048' },
        { id: 'tower', price: 250, key: 'game_tower' }
    ];
}

function gameLockInfo(gameId) {
    if (currentAppRole !== 'child') return null;
    let st = null;
    try { st = JSON.parse(localStorage.getItem('qalqon_games') || 'null'); } catch (e) {}
    // Holat hali kelmagan bo'lsa ham pullik o'yinlar qulf ko'rinadi.
    const locked = paidGames(st);
    const owned = (st && st.owned) || [];
    const l = locked.find(x => x.id === gameId);
    if (!l || owned.includes(gameId)) return null;
    return l;
}

async function loadShop() {
    const resp = await fetch(QALQON_BOT_FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'shop_status' })
    });
    const d = await resp.json();
    if (!d.ok) throw new Error(d.error || 'shop_status');
    shopState = d;
    rememberOwnedGames(d.items);
    return d;
}

async function openShop(tab) {
    if (tab) shopTab = tab;
    openSubpage('modal-shop');
    document.querySelectorAll('#shopTabs .shop-tab').forEach(b => {
        const on = b.dataset.tab === shopTab;
        b.classList.toggle('bg-amber-500/25', on);
        b.classList.toggle('border-amber-500/60', on);
        b.classList.toggle('text-amber-100', on);
    });
    const body = document.getElementById('shopBody');
    if (!shopState && body) body.innerHTML = '<div class="text-[11px] text-slate-400 p-3">Yuklanmoqda...</div>';
    try {
        await loadShop();
    } catch (e) {
        console.error('shop_status:', e);
        // Faqat haqiqiy tarmoq xatosida "internet" deymiz; server sababini
        // aytgan bo'lsa — o'sha sababni ko'rsatamiz.
        const offline = !e || !e.message || /fetch|network/i.test(e.message);
        if (body) body.innerHTML = '<div class="text-[11px] text-rose-300 p-3">' +
            (offline ? "Do'kon yuklanmadi. Internetni tekshirib, qayta och." : escapeHtml(e.message)) + '</div>';
        return;
    }
    renderShop();
}

function shopBtn(label, onclick, enabled, tone) {
    const cls = enabled
        ? (tone === 'owned'
            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100'
            : 'bg-amber-500/25 hover:bg-amber-500/35 border-amber-500/50 text-amber-100')
        : 'bg-slate-800/70 border-slate-700 text-slate-500';
    return `<button ${enabled ? `onclick="${onclick}"` : 'disabled'} class="shrink-0 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition ${cls}">${label}</button>`;
}

function shopRow(emoji, title, desc, right) {
    return `<div class="p-3 rounded-2xl bg-slate-900/70 border border-slate-700 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-slate-950/80 border border-slate-700 flex items-center justify-center text-2xl shrink-0">${emoji}</div>
        <div class="flex-1 min-w-0">
            <div class="text-xs font-bold text-white">${title}</div>
            <div class="text-[10px] text-slate-400">${desc}</div>
        </div>
        ${right}
    </div>`;
}

function renderShop() {
    const d = shopState;
    const body = document.getElementById('shopBody');
    if (!d || !body) return;
    const bal = document.getElementById('shopBalance');
    if (bal) bal.textContent = d.available + ' ball';
    const can = price => d.available >= price;
    let html = '';

    if (shopTab === 'gifts') {
        html += `<div class="text-[10px] text-slate-400 leading-relaxed p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            Bu sovg'alarni <b>ota-onang</b> belgilagan. So'raganingda botda tasdiqlaydi — shunda ball yechiladi.</div>`;
        for (const p of d.pendingGifts || []) {
            html += shopRow(escapeHtml(p.emoji || '🎁'), escapeHtml(p.title), `${p.price} ball · ota-onang javobini kutyapmiz`,
                '<span class="text-[10px] font-bold text-amber-300 shrink-0">⏳</span>');
        }
        const pendingIds = new Set((d.pendingGifts || []).map(p => p.item_id));
        const gifts = (d.gifts || []).filter(g => !pendingIds.has(g.id));
        if (!gifts.length && !(d.pendingGifts || []).length) {
            html += `<div class="p-4 rounded-2xl bg-slate-900/70 border border-slate-700 text-center space-y-1">
                <div class="text-2xl">🎁</div>
                <div class="text-[11px] text-slate-300">Ota-onang hali sovg'a qo'shmagan.</div>
                <div class="text-[10px] text-slate-500">Unga ayt: panelda "Ball tizimi" → "Sovg'alar ro'yxati".</div>
            </div>`;
        }
        for (const g of gifts) {
            html += shopRow(escapeHtml(g.emoji || '🎁'), escapeHtml(g.title), `${g.price} ball`,
                shopBtn(can(g.price) ? "So'rash" : `${g.price}`, `requestGift('${g.id}')`, can(g.price)));
        }
    }

    if (shopTab === 'cards') {
        const box = d.cardBox;
        const r = box.rarities;
        html += `<div class="p-4 rounded-2xl bg-gradient-to-br from-violet-600/25 to-fuchsia-900/40 border border-violet-500/50 text-center space-y-2">
            <div class="text-4xl">🎁</div>
            <div class="text-xs font-bold text-white">Karta qutisi</div>
            <div class="text-[10px] text-slate-300">Har karta raqamlangan va soni cheklangan — butun ilova bo'yicha.</div>
            <div class="text-[10px] text-slate-400">Oddiy ${r.oddiy.chance}% · <span class="text-sky-300">Noyob ${r.noyob.chance}%</span> · <span class="text-amber-300">Afsonaviy ${r.afsonaviy.chance}%</span></div>
            <button ${can(box.price) ? 'onclick="openCardBox()"' : 'disabled'} id="cardBoxBtn" class="w-full py-2 rounded-xl border text-[11px] font-bold ${can(box.price) ? 'bg-violet-500/30 hover:bg-violet-500/40 border-violet-400/60 text-violet-100' : 'bg-slate-800/70 border-slate-700 text-slate-500'}">
                ${can(box.price) ? `Ochish — ${box.price} ball` : `${box.price} ball kerak`}
            </button>
        </div>`;
        const mine = {};
        for (const c of d.myCards || []) (mine[c.card_key] = mine[c.card_key] || []).push(c.serial);
        const have = Object.keys(mine).length;
        html += `<div class="text-[11px] font-bold text-slate-200 pt-1">Kolleksiyam: ${have} / ${d.cardCatalog.length}</div>`;
        html += '<div class="grid grid-cols-3 gap-2">';
        for (const c of d.cardCatalog) {
            const st = RARITY_STYLE[c.rarity] || RARITY_STYLE.oddiy;
            const serials = mine[c.key];
            html += serials
                ? `<div class="p-2 rounded-xl border-2 ${st.ring} bg-gradient-to-br ${st.bg} text-center">
                    <div class="text-2xl">${c.emoji}</div>
                    <div class="text-[9px] font-bold ${st.text} leading-tight mt-1">${escapeHtml(c.title)}</div>
                    <div class="text-[9px] text-slate-300 font-mono">#${String(Math.min(...serials)).padStart(3, '0')}${serials.length > 1 ? ' ×' + serials.length : ''}</div>
                    <div class="text-[8px] text-slate-500">${c.minted} / ${c.supply}</div>
                  </div>`
                : `<div class="p-2 rounded-xl border border-slate-800 bg-slate-900/50 text-center opacity-60">
                    <div class="text-2xl grayscale">❔</div>
                    <div class="text-[9px] text-slate-500 leading-tight mt-1">${escapeHtml(c.title)}</div>
                    <div class="text-[8px] text-slate-600">${c.minted} / ${c.supply}</div>
                  </div>`;
        }
        html += '</div>';
    }

    if (shopTab === 'badge' || shopTab === 'companion') {
        if (shopTab === 'badge') {
            html += '<div class="text-[10px] text-slate-400">Yorliq bo\'ring yonida, isming oldida ko\'rinadi. Bittasini kiyasan.</div>';
            for (const b of d.earnedBadges || []) {
                html += shopRow(b.emoji, escapeHtml(b.title), b.earned ? 'Ishlab topding!' : `Faqat ishlab topiladi — ${b.need} kun ketma-ket dars`,
                    `<span class="text-[10px] font-bold ${b.earned ? 'text-emerald-300' : 'text-slate-500'} shrink-0">${b.earned ? '✅' : '🔒'}</span>`);
            }
        } else {
            html += '<div class="text-[10px] text-slate-400">Bo\'ring kiyadi — bitta buyum bir vaqtda.</div>';
        }
        for (const it of d.items.filter(i => i.kind === shopTab)) {
            const right = it.owned
                ? shopBtn(it.equipped ? '✅ Kiyilgan' : 'Kiyish', `equipShopItem('${it.key}')`, true, 'owned')
                : shopBtn(can(it.price) ? `${it.price} ball` : `🔒 ${it.price}`, `buyShopItem('${it.key}')`, can(it.price));
            html += shopRow(it.emoji, escapeHtml(it.title), escapeHtml(it.desc), right);
        }
    }

    if (shopTab === 'extra') {
        for (const it of d.items.filter(i => i.kind === 'game' || i.kind === 'boost')) {
            const desc = it.kind === 'boost'
                ? `${escapeHtml(it.desc)}${d.aiBoostToday ? ` · bugun +${d.aiBoostToday} olingan` : ''}`
                : escapeHtml(it.desc);
            const right = it.owned
                ? shopBtn('✅ Ochiq', `closeSubpage(); openSubpage('modal-games'); renderGamesGrid();`, true, 'owned')
                : shopBtn(can(it.price) ? `${it.price} ball` : `🔒 ${it.price}`, `buyShopItem('${it.key}')`, can(it.price));
            html += shopRow(it.emoji, escapeHtml(it.title), desc, right);
        }
    }

    body.innerHTML = html;
}

function showShopReveal(html) {
    const ov = document.getElementById('shopRevealOverlay');
    const body = document.getElementById('shopRevealBody');
    if (!ov || !body) return;
    body.innerHTML = html + '<div class="text-[10px] text-slate-500 pt-2">Yopish uchun bos</div>';
    ov.classList.remove('hidden');
    if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
}

function closeShopReveal() {
    const ov = document.getElementById('shopRevealOverlay');
    if (ov) ov.classList.add('hidden');
}

function shopConfirm(text, onYes) {
    if (tg && tg.showConfirm) tg.showConfirm(text, ok => { if (ok) onYes(); });
    else if (confirm(text)) onYes();
}

function shopAlert(text) {
    if (tg && tg.showAlert) tg.showAlert(text); else alert(text);
}

async function shopCall(body) {
    const resp = await fetch(QALQON_BOT_FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    return resp.json();
}

function buyShopItem(key) {
    const it = shopState && shopState.items.find(i => i.key === key);
    if (!it) return;
    shopConfirm(`${it.emoji} ${it.title} — ${it.price} ball.\n\nSotib olasanmi?`, async () => {
        try {
            const r = await shopCall({ type: 'shop_buy', itemKey: key });
            if (!r.ok) { shopAlert(r.error || "Sotib olib bo'lmadi."); return; }
            const extra = it.kind === 'game' ? "O'yinlar bo'limida ochildi."
                : it.kind === 'boost' ? "AI do'stingga bugun yana 10 ta savol bera olasan."
                : "Darhol kiyildi.";
            showShopReveal(`<div class="text-6xl">${it.emoji}</div>
                <div class="text-sm font-black text-white">${escapeHtml(it.title)}</div>
                <div class="text-[11px] text-slate-300">${extra}</div>`);
            await loadShop();
            renderShop();
            renderTimeBank();
        } catch (e) {
            console.error('shop_buy:', e);
            shopAlert('Server javob bermadi.');
        }
    });
}

async function equipShopItem(key) {
    try {
        const r = await shopCall({ type: 'shop_equip', itemKey: key });
        if (!r.ok) { shopAlert(r.error || "Bo'lmadi."); return; }
        await loadShop();
        renderShop();
        renderTimeBank();
    } catch (e) {
        console.error('shop_equip:', e);
    }
}

async function openCardBox() {
    const btn = document.getElementById('cardBoxBtn');
    if (btn) { btn.disabled = true; btn.textContent = '🎁 Ochilmoqda...'; }
    try {
        const r = await shopCall({ type: 'shop_open_box' });
        if (!r.ok) { shopAlert(r.error || "Ochib bo'lmadi."); return; }
        const c = r.card;
        const st = RARITY_STYLE[c.rarity] || RARITY_STYLE.oddiy;
        showShopReveal(`<div class="mx-auto w-48 p-5 rounded-3xl border-4 ${st.ring} bg-gradient-to-br ${st.bg} space-y-2">
                <div class="text-[10px] font-black uppercase tracking-widest ${st.text}">${escapeHtml(c.rarityLabel)}</div>
                <div class="text-7xl">${c.emoji}</div>
                <div class="text-sm font-black text-white">${escapeHtml(c.title)}</div>
                <div class="font-mono text-lg font-black ${st.text}">#${String(c.serial).padStart(3, '0')}</div>
                <div class="text-[10px] text-slate-300">butun ilovada ${c.supply} ta</div>
            </div>`);
        await loadShop();
        renderShop();
        renderTimeBank();
    } catch (e) {
        console.error('shop_open_box:', e);
        shopAlert('Server javob bermadi.');
    } finally {
        if (btn) btn.disabled = false;
    }
}

/**
 * Qulfli o'yin bosilganda. Ilgari do'kon ochilardi va server javob
 * bermasa bola "internetni tekshir" degan yozuvni ko'rardi — holbuki gap
 * internetda emas, ball yetmasligida edi. Endi oyna serverga bog'liq emas:
 * narx va ball to'plash yo'llari darhol ko'rinadi, balans kelsa qo'shiladi.
 */
function showGameLock(gameId) {
    const stage = document.getElementById('gameStage');
    const grid = document.getElementById('gamesGrid');
    const intro = document.getElementById('gamesIntro');
    const lock = gameLockInfo(gameId);
    const g = (typeof GAMES !== 'undefined' ? GAMES : []).find(x => x.id === gameId) || { name: "O'yin", emoji: '🎮' };
    if (!stage || !lock) return;
    if (grid) grid.classList.add('hidden');
    if (intro) intro.classList.add('hidden');
    stage.classList.remove('hidden');

    const r = (timeBankInfo && timeBankInfo.rules) || {};
    const draw = () => {
        const have = shopState ? shopState.available : null;
        const enough = have != null && have >= lock.price;
        stage.innerHTML = `<div id="gameLockCard" class="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/40 space-y-3 text-center">
            <div class="text-5xl">${g.emoji}</div>
            <div class="text-sm font-black text-white">🔒 ${escapeHtml(g.name)}</div>
            <div class="text-[11px] text-slate-300">Bu o'yin <b class="text-amber-300">${lock.price} ball</b> evaziga bir marta ochiladi — keyin doim sening.</div>
            ${have == null ? '' : enough
                ? `<div class="text-[11px] text-emerald-300">Senda ${have} ball bor — yetadi!</div>
                   <button id="gameUnlockBtn" onclick="unlockGame('${gameId}')" class="w-full py-2.5 rounded-xl bg-amber-500/30 hover:bg-amber-500/40 border border-amber-400/60 text-amber-50 text-xs font-bold">🔓 Ochish — ${lock.price} ball</button>`
                : `<div class="text-[11px] text-rose-300">Senda ${have} ball bor. Yana <b>${lock.price - have} ball</b> to'plash lozim.</div>`}
            <div class="text-left p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div class="text-[11px] font-bold text-slate-200">Zarur ballarni qanday to'plash mumkin:</div>
                <div class="text-[10px] text-slate-300">🎯 Fokus seansi + 3 savolga javob — <b>${r.minutes_per_focus ?? 10} ball</b> (kuniga 3 marta)</div>
                <div class="text-[10px] text-slate-300">🏫 Maktabga o'z vaqtida yetish — <b>${r.minutes_per_school_ontime ?? 20} ball</b></div>
                <div class="text-[10px] text-slate-300">📚 Uy vazifasi (ota-onang tasdiqlaydi) — <b>${r.minutes_per_homework ?? 15} ball</b></div>
                <div class="text-[9px] text-slate-500">Bir kunda ko'pi bilan ${r.daily_cap_minutes ?? 60} ball.</div>
            </div>
            <button onclick="closeGame()" class="w-full py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-[11px] font-bold">← O'yinlarga qaytish</button>
        </div>`;
    };
    draw();
    // Balans bilinmasa — jim olib kelamiz; kelmasa ham oyna ishlayveradi.
    loadShop().then(() => { if (document.getElementById('gameLockCard')) draw(); }).catch(() => {});
}

async function unlockGame(gameId) {
    const lock = gameLockInfo(gameId);
    const btn = document.getElementById('gameUnlockBtn');
    if (!lock) return;
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Ochilmoqda...'; }
    try {
        const r = await shopCall({ type: 'shop_buy', itemKey: lock.key });
        if (!r.ok && !/allaqachon/.test(r.error || '')) {
            shopAlert(r.noBalance ? "Ball yetmaydi — zarur ballarni to'plash lozim." : (r.error || "Ochib bo'lmadi."));
            if (btn) { btn.disabled = false; btn.textContent = `🔓 Ochish — ${lock.price} ball`; }
            return;
        }
        await loadShop();
        renderTimeBank();
        closeGame();
        openGame(gameId);
    } catch (e) {
        console.error('unlockGame:', e);
        shopAlert('Server javob bermadi.');
        if (btn) { btn.disabled = false; btn.textContent = `🔓 Ochish — ${lock.price} ball`; }
    }
}

function requestGift(id) {
    const g = shopState && (shopState.gifts || []).find(x => x.id === id);
    if (!g) return;
    shopConfirm(`${g.emoji} ${g.title} — ${g.price} ball.\n\nOta-onangga so'rov yuboraymi? Ular tasdiqlasa ball yechiladi.`, async () => {
        try {
            const r = await shopCall({ type: 'reward_request', itemId: id });
            if (!r.ok) { shopAlert(r.error || "Yuborib bo'lmadi."); return; }
            shopAlert("✅ So'roving ota-onangga yuborildi. Javob botga keladi.");
            await loadShop();
            renderShop();
        } catch (e) {
            console.error('reward_request:', e);
            shopAlert('Server javob bermadi.');
        }
    });
}

/** "Uy vazifam tayyor" — ota-onaga botda tasdiqlash tugmasi boradi. */
async function claimHomework() {
    const subject = prompt("Qaysi fan? (masalan: Matematika)") ;
    if (subject === null) return;
    const note = prompt("Nima qilding? Qisqa yoz (ixtiyoriy)") || '';
    const btn = document.getElementById('homeworkClaimBtn');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Yuborilmoqda...'; }
    try {
        const r = await shopCall({ type: 'homework_claim', subject: subject.trim(), note: note.trim() });
        shopAlert(r.ok
            ? "✅ Ota-onangga yuborildi. Ular tekshirib tasdiqlasa, ball tushadi."
            : (r.error || "Yuborib bo'lmadi."));
    } catch (e) {
        console.error('homework_claim:', e);
        shopAlert('Server javob bermadi.');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '📚 Uy vazifam tayyor'; }
    }
}

// ----------------------------------------------------------------------------
// FOKUS TEKSHIRUVI: 3 ta savol, har biriga 15 soniya.
//
// Vaqtni SERVER o'lchaydi — bu yerdagi taymer faqat ko'rsatkich. Bola
// ilovadan chiqsa (boshqa AI'dan javob qidirish uchun), savol darhol
// javobsiz yuboriladi. Sahifani yangilab qayta so'rash ham serverda
// noto'g'ri hisoblanadi.
// ----------------------------------------------------------------------------
async function runFocusCheck(sessionId) {
    const ov = document.getElementById('focusCheckOverlay');
    const qEl = document.getElementById('fcQuestion');
    const opts = document.getElementById('fcOptions');
    const fb = document.getElementById('fcFeedback');
    const prog = document.getElementById('fcProgress');
    const timerEl = document.getElementById('fcTimer');
    const bar = document.getElementById('fcBar');
    if (!ov) return null;
    ov.classList.remove('hidden');

    const sleep = ms => new Promise(r => setTimeout(r, ms));
    let final = null;

    try {
        while (!final) {
            const q = await shopCall({ type: 'focus_check_question', sessionId });
            if (!q.ok) { shopAlert(q.error || 'Savol kelmadi.'); break; }
            if (q.done) { final = q; break; }

            if (prog) prog.textContent = `Savol ${q.index + 1} / ${q.total}`;
            if (qEl) qEl.textContent = q.question.q;
            if (fb) fb.textContent = '';
            if (opts) {
                opts.innerHTML = q.question.a.map((a, i) =>
                    `<button data-i="${i}" class="fc-opt w-full text-left px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white">${escapeHtml(a)}</button>`
                ).join('');
            }

            const choice = await new Promise(resolve => {
                let left = q.seconds;
                const started = Date.now();
                let done = false;
                const finish = v => {
                    if (done) return;
                    done = true;
                    clearInterval(iv);
                    document.removeEventListener('visibilitychange', onHide);
                    resolve(v);
                };
                const onHide = () => { if (document.hidden) finish(-1); };
                document.addEventListener('visibilitychange', onHide);
                const iv = setInterval(() => {
                    const passed = (Date.now() - started) / 1000;
                    left = Math.max(0, q.seconds - passed);
                    if (timerEl) timerEl.textContent = Math.ceil(left);
                    if (bar) bar.style.width = (left / q.seconds * 100) + '%';
                    if (left <= 0) finish(-1);
                }, 200);
                if (opts) opts.querySelectorAll('.fc-opt').forEach(b => {
                    b.onclick = () => finish(Number(b.dataset.i));
                });
            });

            if (opts) opts.querySelectorAll('.fc-opt').forEach(b => { b.disabled = true; });
            const a = await shopCall({ type: 'focus_check_answer', sessionId, choice });
            if (!a.ok) { shopAlert(a.error || 'Javob qabul qilinmadi.'); break; }

            if (opts) opts.querySelectorAll('.fc-opt').forEach(b => {
                const i = Number(b.dataset.i);
                if (i === a.correctIndex) b.classList.add('bg-emerald-600/40', 'border-emerald-400');
                else if (i === choice) b.classList.add('bg-rose-600/40', 'border-rose-400');
            });
            if (fb) {
                fb.textContent = (a.correct ? "✅ To'g'ri! " : a.timedOut || choice < 0 ? '⏰ Vaqt tugadi. ' : "❌ Noto'g'ri. ") + (a.why || '');
            }
            if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred(a.correct ? 'success' : 'error');
            await sleep(1800);
            if (a.done) final = a;
        }
    } catch (e) {
        console.error('focus check:', e);
        shopAlert('Server javob bermadi.');
    } finally {
        ov.classList.add('hidden');
    }

    if (final) {
        let msg;
        if (!final.passed) {
            msg = `😕 ${final.total} ta savoldan ${final.correct} tasiga to'g'ri javob berding.\n\nBall uchun kamida 2 ta kerak. Keyingi seansda albatta chiqadi!`;
        } else if (final.awarded > 0) {
            msg = `🎉 Zo'r! ${final.correct} / ${final.total} to'g'ri.\n\n+${final.awarded} ball\n💰 Jami: ${final.balance} ball`;
        } else if (final.limitReached) {
            msg = `🎉 ${final.correct} / ${final.total} to'g'ri! Lekin bugun ${final.perDay} ta seans uchun ball olding — ertaga yana.\n\nLiga va jangda bu seans hisoblandi.`;
        } else {
            msg = `🎉 ${final.correct} / ${final.total} to'g'ri! Bugungi ball chegarasiga yetding (${final.dailyCap}).`;
        }
        shopAlert(msg);
        if (final.companion) renderCompanion(final.companion);
    }
    return final;
}

// ----------------------------------------------------------------------------
// OTA-ONA: sovg'alar ro'yxati
// ----------------------------------------------------------------------------
const GIFT_TEMPLATES = [
    { emoji: '🍕', title: 'Sevimli ovqat', price: 200 },
    { emoji: '🎬', title: 'Dam olish kuni kino', price: 400 },
    { emoji: '📱', title: '1 soat qo\'shimcha telefon', price: 150 },
    { emoji: '🏞', title: 'Oilaviy sayr — o\'zi tanlaydi', price: 600 },
    { emoji: '👫', title: 'Do\'stlarnikiga borish', price: 350 },
    { emoji: '🍦', title: 'Muzqaymoq', price: 80 },
    { emoji: '💰', title: '20 000 so\'m cho\'ntak puli', price: 1000 },
    { emoji: '🎮', title: 'Yangi o\'yinchoq yoki kitob', price: 1500 }
];

async function renderParentGifts() {
    const list = document.getElementById('parentGiftList');
    const tpl = document.getElementById('parentGiftTemplates');
    if (!list) return;
    try {
        const r = await shopCall({ type: 'reward_items_list' });
        const items = (r && r.items) || [];
        list.innerHTML = items.length
            ? items.map(i => `<div class="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-700">
                    <span class="text-lg">${escapeHtml(i.emoji)}</span>
                    <span class="flex-1 min-w-0 text-[11px] text-white truncate">${escapeHtml(i.title)}</span>
                    <span class="text-[11px] font-bold text-amber-300 shrink-0">${i.price} ball</span>
                    <button onclick="deleteParentGift('${i.id}')" class="text-[11px] text-rose-300 px-1.5 shrink-0">✕</button>
                </div>`).join('')
            : '<div class="text-[10px] text-slate-500 p-2 rounded-xl bg-slate-900/60 border border-slate-800">Hali sovg\'a yo\'q — pastdan qo\'shing.</div>';
        if (tpl) {
            const have = new Set(items.map(i => i.title));
            tpl.innerHTML = GIFT_TEMPLATES.filter(t => !have.has(t.title)).map((t, n) =>
                `<button onclick="addGiftTemplate(${GIFT_TEMPLATES.indexOf(t)})" class="px-2 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-[10px] text-slate-200">${t.emoji} ${escapeHtml(t.title)} · ${t.price}</button>`
            ).join('');
        }
    } catch (e) {
        console.error('reward_items_list:', e);
    }
}

async function saveParentGift(emoji, title, price) {
    const r = await shopCall({ type: 'reward_item_save', emoji, title, price });
    if (!r.ok) { shopAlert(r.error || "Saqlab bo'lmadi."); return false; }
    await renderParentGifts();
    return true;
}

async function addGiftTemplate(i) {
    const t = GIFT_TEMPLATES[i];
    if (t) await saveParentGift(t.emoji, t.title, t.price);
}

async function addParentGift() {
    const btn = document.getElementById('giftAddBtn');
    const emoji = (document.getElementById('giftEmoji')?.value || '🎁').trim();
    const title = (document.getElementById('giftTitle')?.value || '').trim();
    const price = parseInt(document.getElementById('giftPrice')?.value, 10);
    if (btn) btn.disabled = true;
    try {
        if (await saveParentGift(emoji, title, price)) {
            document.getElementById('giftTitle').value = '';
            document.getElementById('giftPrice').value = '';
        }
    } finally {
        if (btn) btn.disabled = false;
    }
}

async function deleteParentGift(id) {
    await shopCall({ type: 'reward_item_delete', id });
    renderParentGifts();
}

/** Taklif holati. Havola oila kodidan yasaladi, shuning uchun o'zgarmaydi. */
let referralState = null;

async function renderReferral() {
    const isChild = currentAppRole === 'child';
    const card = document.getElementById(isChild ? 'childReferralCard' : 'parentReferralCard');
    const stats = document.getElementById(isChild ? 'childReferralStats' : 'parentReferralStats');
    const sub = document.getElementById(isChild ? 'childReferralSub' : 'parentReferralSub');
    if (!card) return;

    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'referral_status' })
        });
        const d = await resp.json();
        if (!d.ok) return;
        referralState = d;
        card.classList.remove('hidden');

        if (sub) {
            sub.textContent = isChild
                ? `Do'sting qo'shilsa — oilangga ${d.bonusDays} kun bepul Pro`
                : `Chaqirgan oilangiz qo'shilsa — ikkalangizga ham ${d.bonusDays} kun Pro`;
        }
        if (stats) {
            // "Kutilmoqda" ni ham ko'rsatamiz: odam havolani yuborgan-u,
            // do'sti hali tasdiqdan o'tmagan bo'lsa, mukofot yo'qolgandek
            // tuyulmasligi kerak.
            const parts = [];
            parts.push(`✅ Qo'shilgan: <b>${d.joined}</b>`);
            if (d.pending > 0) parts.push(`⏳ Tasdiq kutmoqda: <b>${d.pending}</b>`);
            if (d.daysEarned > 0) parts.push(`⭐️ Yig'ilgan: <b>${d.daysEarned} kun Pro</b>`);
            stats.innerHTML = parts.join(' &nbsp;·&nbsp; ');
        }
    } catch (e) {
        console.error('referral_status error:', e);
    }
}

/** Taklif havolasini ulashish. Telegram'da bir bosishda ketadi. */
function shareReferralLink() {
    const d = referralState;
    if (!d || !d.link) {
        const msg = currentLang === 'ru'
            ? 'Ссылка ещё не готова, откройте панель заново.'
            : 'Havola hali tayyor emas, panelni qayta oching.';
        if (tg && tg.showAlert) tg.showAlert(msg); else alert(msg);
        return;
    }
    const ru = {
        child: 'Я тренирую внимание в Qalqon AI и растит своего волка 🐺 Присоединяйся — если родители зарегистрируются, нам обоим дадут ' + d.bonusDays + ' дней Pro!',
        parent: 'Qalqon AI — я знаю, где мой ребёнок, а он сам зарабатывает экранное время. Присоединяйтесь: нам обоим дадут ' + d.bonusDays + ' дней Pro.'
    };
    const text = currentLang === 'ru'
        ? (d.isChild ? ru.child : ru.parent)
        : (d.shareText || '');
    const url = 'https://t.me/share/url?url=' + encodeURIComponent(d.link) +
                '&text=' + encodeURIComponent(text);
    if (tg && tg.openTelegramLink) tg.openTelegramLink(url);
    else window.open(url, '_blank');
}

/**
 * Radar bo'limining ma'lumot qismi: har farzandning jonli holati, oxirgi
 * ma'lum nuqtasi va oxirgi 24 soatdagi "kirdi/chiqdi" hodisalari.
 *
 * Bularning hammasi Telegram xabari sifatida ham boradi, lekin xabar oqib
 * ketadi — ota-ona bir soatdan keyin "maktabga yetgan edimi?" deb qarasa,
 * uni chat tarixidan qidirishi kerak bo'lardi. Shuning uchun ayni o'sha
 * hodisalar panelda ham turadi.
 */
async function renderRadarStatus() {
    if (currentAppRole !== 'parent') return;
    const list = document.getElementById('radarChildList');
    const feed = document.getElementById('radarEventFeed');
    const badge = document.getElementById('radarLiveBadge');
    const hint = document.getElementById('radarLiveHint');
    if (!list) return;

    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'radar_status' })
        });
        const d = await resp.json();
        if (!d.ok) return;

        const kids = d.children || [];
        const anyLive = kids.some(k => k.live);

        if (badge) {
            badge.textContent = anyLive ? '🟢 Jonli' : '⚪️ Jonli emas';
            badge.className = anyLive
                ? 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300';
        }

        const when = (iso) => {
            const diff = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
            if (diff < 1) return 'hozir';
            if (diff < 60) return diff + ' daqiqa oldin';
            if (diff < 1440) return Math.floor(diff / 60) + ' soat oldin';
            return Math.floor(diff / 1440) + ' kun oldin';
        };

        list.innerHTML = kids.length ? kids.map(k => {
            const p = k.lastPing;
            const coords = p ? p.lat.toFixed(5) + ', ' + p.lng.toFixed(5) : null;
            const live = k.live
                ? `<span class="text-emerald-300 font-bold">🟢 Jonli · ${k.liveMinutesLeft} daqiqa qoldi</span>`
                : `<span class="text-slate-400">⚪️ Jonli ulashish o'chiq</span>`;
            return `
            <div class="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-bold text-white">${escapeHtml(k.childName)}</span>
                    <span class="text-[10px]">${live}</span>
                </div>
                <div class="text-[10px] text-slate-400">
                    ${p ? '📍 ' + coords + ' · ' + when(p.recorded_at) : 'Hali joylashuv kelmagan'}
                </div>
                ${p ? `<a href="https://maps.google.com/?q=${p.lat},${p.lng}" target="_blank" class="text-[10px] text-cyan-400 font-bold">Xaritada ochish →</a>` : ''}
            </div>`;
        }).join('') : '<div class="text-[10px] text-slate-500">Ulangan farzand yo\'q.</div>';

        const events = [];
        for (const k of kids) {
            for (const e of (k.events || [])) events.push({ ...e, who: k.childName });
        }
        events.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        if (feed) {
            feed.innerHTML = events.length ? events.slice(0, 12).map(e => {
                const icon = e.alert_type === 'enter' ? '🟢' : '🔵';
                const t = new Date(e.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
                return `<div class="flex items-center justify-between text-[10px]">
                    <span class="text-slate-300">${icon} ${escapeHtml(e.who)} — ${escapeHtml(e.message)}</span>
                    <span class="text-slate-500 font-mono">${t}</span>
                </div>`;
            }).join('') : '<div class="text-[10px] text-slate-500">Oxirgi 24 soatda hodisa yo\'q. Xavfsiz hudud (uy, maktab) qo\'shsangiz, kirdi-chiqdi shu yerda ko\'rinadi.</div>';
        }

        if (hint) {
            hint.innerHTML = d.plan === 'pro'
                ? `⭐️ <b>Pro tarif:</b> farzandingiz jonli joylashuvni yoqsa, <b>${d.proLiveHours} soat</b> davomida kuzatiladi.`
                : `Bepul tarifda jonli kuzatuv <b>${d.liveHours} soat</b> ishlaydi. Pro tarifda <b>${d.proLiveHours} soat</b> — ya'ni butun maktab kunini bir marta yoqish qoplaydi.`;
        }
    } catch (e) {
        console.error('radar_status error:', e);
    }
}

// ============================================================================
// KUN MARSHRUTI — bir kunlik yo'l xaritada chiziq bo'lib.
//
// Ota-ona uchun eng qimmatli ekran: "hozir qayerda" emas, "bugun qayerda
// bo'ldi". Ma'lumot allaqachon yig'ilib turgan edi (jonli joylashuv, panel
// ochilganda saqlangan nuqtalar), faqat ko'rsatiladigan joyi yo'q edi.
// ============================================================================

let routeLayer = null;

async function renderDayRoute() {
    if (currentAppRole !== 'parent') return;
    const sum = document.getElementById('routeSummary');
    const tl = document.getElementById('routeTimeline');
    const up = document.getElementById('routeUpgrade');
    const sel = document.getElementById('routeDaySelect');
    if (!sum) return;

    const childId = currentChildKey;
    if (!childId) { sum.textContent = 'Avval farzandni tanlang.'; return; }

    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'day_route',
                childId: childId,
                dayOffset: sel ? Number(sel.value) : 0
            })
        });
        const d = await resp.json();
        if (!d.ok) return;

        // Pro'da kun tanlash ro'yxati to'ldiriladi. Bepulda faqat "Bugun"
        // qoladi — tanlov ko'rsatib, keyin "bo'lmaydi" deyishdan ko'ra
        // umuman ko'rsatmagan yaxshi.
        if (sel && d.maxDaysBack > 0 && sel.options.length === 1) {
            for (let i = 1; i <= Math.min(30, d.maxDaysBack); i++) {
                const dt = new Date(Date.now() - i * 86400000);
                const o = document.createElement('option');
                o.value = String(i);
                o.textContent = i === 1 ? 'Kecha' : dt.toLocaleDateString('uz-UZ');
                sel.appendChild(o);
            }
        }

        if (up) {
            if (d.upgradeHint) { up.textContent = '⭐️ ' + d.upgradeHint; up.classList.remove('hidden'); }
            else up.classList.add('hidden');
        }

        const pts = d.points || [];
        if (!pts.length) {
            sum.textContent = "Bu kunda joylashuv yozilmagan.";
            if (tl) tl.innerHTML = '';
            return;
        }

        const t = (iso) => new Date(iso).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
        sum.innerHTML = `<b class="text-slate-200">${pts.length}</b> nuqta · ` +
                        `<b class="text-slate-200">${d.distanceKm}</b> km · ` +
                        `${t(pts[0].recorded_at)} – ${t(pts[pts.length - 1].recorded_at)}`;

        // Vaqt lentasi: hodisalar bo'lsa ular, bo'lmasa nuqtalar.
        if (tl) {
            const rows = (d.events || []).length
                ? d.events.map(e => `<div class="flex items-center justify-between text-[10px]">
                        <span class="text-slate-300">${e.alert_type === 'enter' ? '🟢' : '🔵'} ${escapeHtml(e.message)}</span>
                        <span class="text-slate-500 font-mono">${t(e.created_at)}</span></div>`)
                : [`<div class="text-[10px] text-slate-500">Xavfsiz hudud (uy, maktab) qo'shsangiz, kelish-ketish vaqtlari shu yerda chiqadi.</div>`];
            tl.innerHTML = rows.join('');
        }

        drawRouteOnMap(pts, d.events || []);
    } catch (e) {
        console.error('day_route error:', e);
    }
}

/** Marshrutni Leaflet xaritasiga chizadi. Xarita hali yaratilmagan bo'lsa,
 *  uni shu yerda birinchi nuqta bo'yicha ochamiz — initRadarMap mijozdagi
 *  namunaviy ma'lumotga bog'liq, u esa haqiqiy oilada bo'lmasligi mumkin. */
function drawRouteOnMap(points, events) {
    const mapEl = document.getElementById('map');
    if (!mapEl || typeof L === 'undefined') return;

    if (!mapInstance) {
        mapInstance = L.map('map', { zoomControl: false, attributionControl: false })
            .setView([points[0].lat, points[0].lng], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapInstance);
    }

    if (routeLayer) { mapInstance.removeLayer(routeLayer); routeLayer = null; }
    routeLayer = L.layerGroup().addTo(mapInstance);

    const latlngs = points.map(p => [p.lat, p.lng]);
    L.polyline(latlngs, { color: '#22d3ee', weight: 4, opacity: 0.85 }).addTo(routeLayer);

    const dot = (color, size) => L.divIcon({
        className: '',
        html: `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid #0f172a;border-radius:50%"></div>`,
        iconSize: [size, size], iconAnchor: [size / 2, size / 2]
    });

    L.marker(latlngs[0], { icon: dot('#34d399', 14) })
        .bindPopup('Boshlanish · ' + new Date(points[0].recorded_at).toLocaleTimeString('uz-UZ'))
        .addTo(routeLayer);
    L.marker(latlngs[latlngs.length - 1], { icon: dot('#f472b6', 16) })
        .bindPopup('Oxirgi · ' + new Date(points[points.length - 1].recorded_at).toLocaleTimeString('uz-UZ'))
        .addTo(routeLayer);

    for (let i = 1; i < latlngs.length - 1; i++) {
        L.marker(latlngs[i], { icon: dot('#38bdf8', 8) })
            .bindPopup(new Date(points[i].recorded_at).toLocaleTimeString('uz-UZ'))
            .addTo(routeLayer);
    }

    try { mapInstance.fitBounds(L.polyline(latlngs).getBounds(), { padding: [30, 30] }); } catch (e) {}
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

// Ilgari bu tugma `?start=pair_<oila kodi>` havolasini nusxalardi. O'sha
// havola HECH QACHON ulanish yaratmagan: bot faqat "bog'landingiz" deb
// yozardi, bazada esa juftlik paydo bo'lmasdi — natijada farzand keyin
// ilovani ochganda ota-ona panelini ko'rardi. Ustiga-ustak u oila kodini
// tarqatardi, u esa ota-onaning Telegram ID'sidan hisoblanadi.
//
// Yagona haqiqiy yo'l — har bir farzandga alohida, bir martalik taklif kodi.
// Bu yerda ilgari ikkinchi shareReferralLink turardi. U havolani MIJOZDAGI
// oila kodidan yasardi va faqat ota-ona uchun ishlardi — bola bossa, o'z
// taklif havolasi o'rniga ota-onasinikini yuborardi, ya'ni 7 kunlik mukofot
// hech qachon bolaga bog'lanmasdi. Yagona nusxa yuqorida: u havolani
// serverdan oladi, shuning uchun kim bosgani ham to'g'ri aniqlanadi.

function copyPairingLink() {
    openSubpage('modal-add-child');
    const isRu = (currentLang === 'ru');
    const msg = isRu
        ? "Каждый ребёнок подключается по своему одноразовому коду. Введите имя ребёнка — система выдаст код и ссылку."
        : "Har bir farzand o'zining bir martalik kodi bilan ulanadi. Farzand ismini kiriting — tizim kod va havola beradi.";
    if (tg && tg.showAlert) tg.showAlert(msg); else alert(msg);
}

// 9. LEAFLET MAP (BEPUL RADAR)
function initRadarMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl || mapInstance) return;

    const child = childrenDatabase[currentChildKey];
    if (!child || !child.location) return;
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
    if (mapInstance && childMarker && child && child.location) {
        childMarker.setLatLng([child.location.lat, child.location.lng]);
        mapInstance.setView([child.location.lat, child.location.lng], 14);
    }
}

// Backend (Supabase) orqali "bu foydalanuvchi ota-onami yoki farzandmi" ekanini
// haqiqiy ma'lumotlar bazasidan tekshiradi (eski hardcoded ism ro'yxati o'rniga).
let realChildProfile = null;
async function fetchAndApplyRole() {
    // Hech qanday identifikator bo'lmasa (Telegramsiz va seanssiz) so'rov
    // yubormaymiz — u baribir 401 qaytaradi va kirish oynasi ochiladi.
    if (!hasTelegramIdentity() && !webSessionToken()) return;
    const uname = (typeof tg !== 'undefined' && tg?.initDataUnsafe?.user?.username) || null;
    const tid = (typeof tg !== 'undefined' && tg?.initDataUnsafe?.user?.id) || null;
    if (!uname && !tid && !webSessionToken()) return;
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'check_role' })
        });
        const data = await resp.json();

        // Server "bu hisob allaqachon ulangan farzand" desa, bu havoladagi
        // role parametridan ham kuchliroq dalil: u child_pairings jadvalidagi
        // haqiqiy yozuvga asoslanadi. Ilgali bu so'rov havolada role bo'lsa
        // butunlay o'tkazib yuborilardi — bot esa har doim &role=child bilan
        // yuboradi, ya'ni farzand uchun server hech qachon so'ralmasdi.
        if (data.role === 'child') {
            currentAppRole = 'child';
            localStorage.setItem('app_role', 'child');
            realChildProfile = data;
        } else if (data.role === 'parent' && !urlRole) {
            // Havolada role=child bo'lsa uni buzmaymiz: hali ulanmagan farzand
            // uchun server tabiiy ravishda "parent" deydi, chunki uning
            // child_pairings'da yozuvi yo'q — aks holda u rozilik oynasini
            // umuman ko'rmay, ota-ona panelini ochib yuborardi.
            currentAppRole = 'parent';
            localStorage.setItem('app_role', 'parent');
        }
    } catch (e) {
        console.error('check_role sorovida xato:', e);
    }
}
// ============================================================================
// EKRAN KLAVIATURASI YOZILAYOTGAN MATNNI TO'SIB QO'YMASLIGI UCHUN
//
// Telefonda klaviatura ochilganda sahifa qisqarmaydi — u shunchaki matn
// maydonining ustiga chiqadi, va bola nima yozayotganini ko'rmaydi. Bu
// ayniqsa AI suhbatida sezilgan: kirish maydoni sahifaning eng pastida.
//
// Uchta narsa birga hal qiladi:
//  1) visualViewport orqali klaviatura balandligini o'lchaymiz va sahifa
//     ostiga shuncha bo'sh joy qo'shamiz — shunda maydon yuqoriga siljiydi;
//  2) pastdagi qat'iy (fixed) navigatsiyani yashiramiz, aks holda u
//     klaviatura ustida turib maydonni yana to'sardi;
//  3) fokusga kelgan maydonni ko'rinadigan qismning o'rtasiga olib kelamiz.
//
// visualViewport bo'lmagan eski brauzerda hech narsa buzilmaydi — shunchaki
// oldingi xatti-harakat qoladi.
// ============================================================================
/**
 * Maydonni klaviatura ustiga chiqaradi.
 *
 * scrollIntoView() bu yerda ISHLAMAYDI: u elementni butun oynaning
 * markaziga qo'yadi, klaviatura esa oynaning bir qismini yeb turganini
 * bilmaydi. Sinovda u maydonni atigi 19 piksel surdi va maydon baribir
 * klaviatura ostida qoldi. Shuning uchun hisobni o'zimiz qilamiz:
 * ko'rinadigan qismning pastki chegarasidan qancha oshib ketgan bo'lsa,
 * aynan shuncha suramiz.
 */
function ensureFieldVisible(el) {
    if (!el) return;
    const vv = window.visualViewport;
    const r = el.getBoundingClientRect();
    const korinadiganPast = vv ? (vv.offsetTop + vv.height) : window.innerHeight;
    const oshib = r.bottom - korinadiganPast + 16; // 16px — nafas olish joyi
    if (oshib > 0) window.scrollBy({ top: oshib, behavior: 'smooth' });
}

function setupKeyboardHandling() {
    const vv = window.visualViewport;
    const navs = () => [
        document.getElementById('parentBottomNav'),
        document.getElementById('childBottomNav')
    ].filter(Boolean);

    // Navigatsiya allaqachon yashirin bo'lsa (masalan ota-ona panelida
    // bola navigatsiyasi), uni keyin ko'rinadigan qilib yubormaslik kerak.
    let hiddenByKeyboard = [];

    const apply = () => {
        const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
        const ochiq = kb > 100; // 100px dan kichigi klaviatura emas

        document.body.style.paddingBottom = ochiq ? kb + 'px' : '';

        if (ochiq && !hiddenByKeyboard.length) {
            hiddenByKeyboard = navs().filter(n => !n.classList.contains('hidden'));
            hiddenByKeyboard.forEach(n => n.classList.add('hidden'));
        } else if (!ochiq && hiddenByKeyboard.length) {
            hiddenByKeyboard.forEach(n => n.classList.remove('hidden'));
            hiddenByKeyboard = [];
        }

        const el = document.activeElement;
        if (ochiq && el && /^(INPUT|TEXTAREA)$/.test(el.tagName)) {
            // Padding qo'shilgandan keyin brauzer o'lchamlarni qayta
            // hisoblab ulgursin, aks holda eski joy bo'yicha suriladi.
            requestAnimationFrame(() => ensureFieldVisible(el));
        }
    };

    if (vv) {
        let raf = null;
        const onChange = () => {
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(apply);
        };
        vv.addEventListener('resize', onChange);
        vv.addEventListener('scroll', onChange);
    }

    // Klaviatura ochilishi kechikadi, shuning uchun fokusdan keyin biroz
    // kutib, maydonni ko'rinadigan joyga suramiz. visualViewport yo'q
    // bo'lsa ham bu qism ishlaydi va muammoning katta qismini yopadi.
    document.addEventListener('focusin', (e) => {
        const el = e.target;
        if (!el || !/^(INPUT|TEXTAREA)$/.test(el.tagName)) return;
        // Ikki marta: klaviatura chiqish animatsiyasi telefonlarda turlicha
        // davom etadi, bitta o'lchov bilan tegib ketish mumkin.
        setTimeout(() => ensureFieldVisible(el), 350);
        setTimeout(() => ensureFieldVisible(el), 700);
    });
}

// DOM Init
document.addEventListener('DOMContentLoaded', async () => {
    setupKeyboardHandling();
    setTheme(currentTheme);
    applyLanguageTranslations();
    updateAuthUI();
    await fetchAndApplyRole();
    switchAppRole(currentAppRole);
    renderChildSelectDropdown();
    renderActiveChild();
    renderSchoolCurriculum();
    initRadarMap();
    // Telegramdan tashqarida va seanssiz bo'lsa — avval kirish oynasi.
    if (checkWebLoginNeeded()) return;
    checkChildConsentStatus();
    prefillInviteCodeFromUrl();
    // Farzandlar ro'yxatini serverdan yangilaymiz. Fon rejimida:
    // javob kelgach funksiya o'zi qayta render qiladi.
    // Avval oila kodini serverdan olamiz (849210 kabi eski, telefonda
    // qolgan kodlar shu yerda almashadi), keyin farzandlar ro'yxatini.
    // Ro'yxatdan o'tish oynasi ham shu javobga qarab ochiladi
    // (syncFamilyFromServer ichida) — server javob bermasa (oflayn),
    // eski mahalliy belgiga qaytamiz, aks holda hech narsa ko'rsatilmay
    // qolardi.
    syncFamilyFromServer()
        .then((ok) => { if (!ok) checkParentOnboarding(); })
        .then(() => syncChildrenFromServer())
        .then(() => {
            refreshPlanStatus();
            loadGeofences();
            // Taklif kartasi va radar holati — ikkalasi ham oila kodi
            // serverdan kelgandan KEYIN. checkParentOnboarding ichida
            // chaqirilgan edi, u esa faqat server javob bermaganda ishlaydi,
            // ya'ni normal holatda bu ikkisi hech qachon ko'rinmasdi.
            if (currentAppRole === 'parent') {
                renderReferral();
                renderRadarStatus();
            }
        });
});

function openUsernameGuideModal() {
    closeSubpage();
    openSubpage('modal-username-guide');
}

function toggleQuickMenu() {
    const menu = document.getElementById('quickMenuDropdown');
    if (menu) menu.classList.toggle('hidden');
}

function handleCompleteParentOnboarding() {
    const isRu = (currentLang === 'ru');

    // Username MAJBURIY: butun tizim shu bo'yicha ishlaydi — farzand taklifi
    // ham, oila a'zosini tanish ham. Bo'sh qoldirilsa, yozuv keyin hech kimga
    // bog'lanmay qolardi.
    const requiredUsernames = [
        ['onboardParentUsername', isRu ? "Telegram username отца" : "Otaning Telegram username'i"],
        ['onboardChildUsername', isRu ? "Telegram username ребёнка" : "Farzandning Telegram username'i"],
    ];
    for (const [id, label] of requiredUsernames) {
        const value = (document.getElementById(id)?.value || '').trim().replace('@', '');
        if (!value) {
            alert((isRu ? "⚠️ Обязательное поле: " : "⚠️ Majburiy maydon: ") + label);
            document.getElementById(id)?.focus();
            return;
        }
    }
    const childNameValue = (document.getElementById('onboardChildName')?.value || '').trim();
    if (!childNameValue) {
        alert(isRu ? "⚠️ Введите имя ребёнка!" : "⚠️ Farzandning ismini kiriting!");
        document.getElementById('onboardChildName')?.focus();
        return;
    }

    // Parol birinchi ro'yxatdan o'tishda majburiy. Keyin tahrirlashda bo'sh
    // qoldirilsa — eskisi o'z holicha qoladi (server uni o'chirmaydi).
    const password = document.getElementById('onboardPassword')?.value || '';
    if (!savedProfileHasPassword && !password) {
        alert(isRu
            ? "⚠️ Придумайте пароль — он нужен для входа без Telegram."
            : "⚠️ Parol o'ylab toping — u Telegramsiz kirish uchun kerak.");
        document.getElementById('onboardPassword')?.focus();
        return;
    }
    if (password && password.length < 6) {
        alert(isRu ? "⚠️ Пароль — минимум 6 символов." : "⚠️ Parol kamida 6 ta belgidan iborat bo'lsin.");
        document.getElementById('onboardPassword')?.focus();
        return;
    }

    const familyName = document.getElementById('onboardFamilyName')?.value.trim() || "Bizning Oila";
    const parentName = document.getElementById('onboardParentName')?.value.trim() || "Ota";
    const parentPhone = document.getElementById('onboardParentPhone')?.value.trim() || "";
    const parentUsername = document.getElementById('onboardParentUsername')?.value.trim().replace('@', '') || "";
    
    const motherName = document.getElementById('onboardMotherName')?.value.trim() || "";
    const motherPhone = document.getElementById('onboardMotherPhone')?.value.trim() || "";
    const motherUsername = document.getElementById('onboardMotherUsername')?.value.trim().replace('@', '') || "";

    const childName = document.getElementById('onboardChildName')?.value.trim() || "Aliyor";
    const childGrade = document.getElementById('onboardChildGrade')?.value || "5";
    const childUsername = document.getElementById('onboardChildUsername')?.value.trim().replace('@', '') || "";

    const familyData = {
        familyName,
        father: { name: parentName, phone: parentPhone, username: parentUsername },
        mother: { name: motherName, phone: motherPhone, username: motherUsername },
        children: [{ name: childName, grade: childGrade, username: childUsername, consented: false }],
        code: (function() {
            if (familyCode && String(familyCode).length === 6) return String(familyCode);
            const tgId = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user && window.Telegram.WebApp.initDataUnsafe.user.id;
            if (tgId) {
                const derived = generateFamilyCode(tgId);
                familyCode = derived;
                localStorage.setItem("parent_family_code", derived);
                updateDisplayFamilyCode();
                return derived;
            }
            return null;
        })(),
        status: "pending"
    };

    localStorage.setItem('qalqon_family_profile', JSON.stringify(familyData));
    if (familyData.code) {
        familyCode = String(familyData.code);
        localStorage.setItem('parent_family_code', familyCode);
        updateDisplayFamilyCode();
    }
    localStorage.setItem('parent_onboarded', 'true');
    localStorage.setItem('auth_status', 'pending');

    // Yangi farzandni bazaga qo'shish
    if (childName) {
        const childId = `CH-${Math.floor(100 + Math.random() * 900)}`;
        childrenDatabase[childId] = {
            id: childId,
            name: `${childName} (${childGrade}-sinf)`,
            grade: parseInt(childGrade),
            username: childUsername,
            avatar: "👦",
            battery: 92,
            streak: 5,
            points: 120,
            consented: false,
            location: { lat: 41.3111, lng: 69.2797, address: "Toshkent shahri (Rozilik kutilmoqda)" },
            schedule: [
                { time: "08:00", subject: "Matematika", room: "204-xona", status: "finished" }
            ],
            apps: [
                { name: "YouTube", time: "45d", percent: 40, category: "Ta'lim / Video", color: "bg-red-500", icon: "▶️" }
            ]
        };
        saveChildrenDatabase();
        currentChildKey = childId;
        renderChildSelectDropdown();
        renderActiveChild();
    }

    closeSubpage();

    // Javobni KUTAMIZ: allaqachon tasdiqlangan oila uchun server yangi so'rov
    // yubormaydi, shuning uchun "kutilmoqda" oynasini va "adminga yuborildi"
    // xabarini ko'rsatish noto'g'ri bo'lardi.
    fetch(QALQON_BOT_FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'parent_registration_request',
            familyName: familyName,
            parentName: parentName,
            parentUsername: parentUsername,
            parentPhone: parentPhone,
            motherName: motherName,
            motherUsername: motherUsername,
            childName: childName,
            childGrade: childGrade,
            childUsername: childUsername,
            password: password || undefined,
            ref: new URLSearchParams(window.location.search).get('ref') || undefined,
            // Taklifni bola yuborgan bo'lsa, kim yuborganini ham olib o'tamiz —
            // mukofot oilaga tushadi, lekin tabrik o'sha bolaga boradi.
            refChild: new URLSearchParams(window.location.search).get('refc') || undefined
        })
    }).then(r => r.json()).then(data => {
        if (data && data.alreadyApproved) {
            localStorage.setItem('auth_status', 'approved');
            alert(isRu
                ? "✅ Данные семьи обновлены. Ваш аккаунт уже подтверждён — повторный запрос администратору не отправлялся."
                : "✅ Oila ma'lumotlari yangilandi. Profilingiz allaqachon tasdiqlangan — adminga qayta so'rov yuborilmadi.");
            return;
        }
        const pendingOverlay = document.getElementById('pendingApprovalOverlay');
        if (pendingOverlay) pendingOverlay.classList.remove('hidden');
        alert(isRu
            ? "✅ Данные семьи сохранены и отправлены администратору на подтверждение!"
            : "✅ Oila ma'lumotlari saqlandi va administrator tasdig'iga yuborildi!");
    }).catch(err => {
        console.error('parent_registration_request error:', err);
        alert(isRu ? "⚠️ Сервер не отвечает. Попробуйте позже." : "⚠️ Server javob bermadi. Keyinroq urinib ko'ring.");
    });
}

// ============================================================================
// XAVFSIZ HUDUDLAR — ota-ona ekrani
//
// Server tomoni ancha oldin tayyor edi (save_geofence_zone, evaluateGeofences),
// lekin hududni QO'SHADIGAN ekran yo'q edi. Ya'ni "maktabga kirdi", "uyga
// keldi" xabarlari va kechki tekshiruv haqiqiy oilada hech qachon ishlay
// olmasdi — hudud bo'lmasa, tekshiriladigan narsa ham yo'q.
//
// Joyni tanlashning uchta yo'li bor va uchalasi ham kerak:
//   1) xaritani bosish — eng aniq, lekin manzilni bilish kerak;
//   2) "farzandim shu yerda" — bola maktabda turganda bir bosishda;
//   3) "men shu yerdaman" — ota-ona uyda turganda.
// ============================================================================

let zoneMap = null;
let zoneMarker = null;
let zoneCircle = null;
let zonePoint = null;

function openZonesModal() {
    openSubpage('modal-zones');
    // Modal ochilgach xarita o'lchamini bilishi uchun biroz kutamiz —
    // yashirin elementda Leaflet noto'g'ri o'lcham oladi.
    setTimeout(() => {
        initZoneMap();
        loadZoneList();
    }, 250);
}

function initZoneMap() {
    const el = document.getElementById('zoneMap');
    if (!el || typeof L === 'undefined') return;

    if (!zoneMap) {
        // Toshkent markazi — boshlang'ich nuqta sifatida.
        zoneMap = L.map('zoneMap', { zoomControl: true, attributionControl: false })
            .setView([41.3111, 69.2797], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(zoneMap);
        zoneMap.on('click', (e) => setZonePoint(e.latlng.lat, e.latlng.lng));
    }
    zoneMap.invalidateSize();
}

function setZonePoint(lat, lng) {
    zonePoint = { lat: lat, lng: lng };
    const r = Number(document.getElementById('zoneRadius').value) || 150;

    if (!zoneMarker) {
        zoneMarker = L.marker([lat, lng], { draggable: true }).addTo(zoneMap);
        zoneMarker.on('dragend', () => {
            const p = zoneMarker.getLatLng();
            setZonePoint(p.lat, p.lng);
        });
    } else {
        zoneMarker.setLatLng([lat, lng]);
    }

    if (!zoneCircle) {
        zoneCircle = L.circle([lat, lng], { radius: r, color: '#22d3ee', fillColor: '#22d3ee', fillOpacity: 0.15 }).addTo(zoneMap);
    } else {
        zoneCircle.setLatLng([lat, lng]);
        zoneCircle.setRadius(r);
    }

    zoneMap.setView([lat, lng], Math.max(zoneMap.getZoom(), 15));
    const c = document.getElementById('zoneCoords');
    if (c) c.textContent = '📍 ' + lat.toFixed(5) + ', ' + lng.toFixed(5);
}

function onZoneRadiusChange() {
    const r = Number(document.getElementById('zoneRadius').value) || 150;
    const lbl = document.getElementById('zoneRadiusLabel');
    if (lbl) lbl.textContent = r + ' m';
    if (zoneCircle) zoneCircle.setRadius(r);
}

function setZoneName(name) {
    const el = document.getElementById('zoneName');
    if (el) el.value = name;
    // Maktabga odatda kelish vaqti qo'yiladi — uni oldindan taklif qilamiz.
    const t = document.getElementById('zoneArriveBy');
    if (t && name === 'Maktab' && !t.value) t.value = '08:00';
}

async function zoneUseChildLocation() {
    const msg = document.getElementById('zoneCoords');
    if (msg) msg.textContent = 'Farzandingiz joyi so\'ralmoqda...';
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'radar_status' })
        });
        const d = await resp.json();
        const kid = (d.children || []).find(k => k.childId === currentChildKey) || (d.children || [])[0];
        if (!kid || !kid.lastPing) {
            if (msg) msg.textContent = 'Farzandingizdan hali joylashuv kelmagan. Xaritadan tanlang.';
            return;
        }
        setZonePoint(kid.lastPing.lat, kid.lastPing.lng);
    } catch (e) {
        console.error('zoneUseChildLocation:', e);
        if (msg) msg.textContent = 'Server javob bermadi.';
    }
}

function zoneUseMyLocation() {
    const msg = document.getElementById('zoneCoords');
    if (!navigator.geolocation) {
        if (msg) msg.textContent = 'Bu qurilmada joylashuv mavjud emas. Xaritadan tanlang.';
        return;
    }
    if (msg) msg.textContent = 'Joylashuvingiz aniqlanmoqda...';
    navigator.geolocation.getCurrentPosition(
        (pos) => setZonePoint(pos.coords.latitude, pos.coords.longitude),
        () => {
            // Telegram ichidagi brauzer ruxsat bermasligi mumkin — bu xato
            // emas, shunchaki boshqa yo'ldan borish kerak.
            if (msg) msg.textContent = 'Joylashuvga ruxsat berilmadi. Xaritadan qo\'lda tanlang.';
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

async function loadZoneList() {
    const list = document.getElementById('zoneList');
    if (!list) return;
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'list_geofences', childId: currentChildKey })
        });
        const d = await resp.json();
        const zones = d.zones || [];

        if (!zones.length) {
            list.innerHTML = '<div class="text-[10px] text-slate-500 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800">Hali hudud qo\'shilmagan.</div>';
            return;
        }

        list.innerHTML = zones.map(z =>
            '<div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">' +
                '<div class="min-w-0">' +
                    '<div class="text-[11px] font-bold text-white">' + escapeHtml(z.name) + '</div>' +
                    '<div class="text-[9px] text-slate-400">' + z.radius_m + ' m' +
                        (z.arrive_by ? ' · kelish: ' + z.arrive_by : '') + '</div>' +
                '</div>' +
                '<div class="flex gap-1.5">' +
                    '<button onclick="editZone(' + JSON.stringify(JSON.stringify(z)) + ')" class="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] text-slate-200">✏️</button>' +
                    '<button onclick="deleteZone(' + JSON.stringify(z.name) + ')" class="px-2 py-1 rounded-lg bg-rose-500/15 border border-rose-500/40 text-[10px] text-rose-300">🗑</button>' +
                '</div>' +
            '</div>').join('');
    } catch (e) {
        console.error('list_geofences:', e);
    }
}

function editZone(json) {
    let z;
    try { z = JSON.parse(json); } catch (e) { return; }
    document.getElementById('zoneName').value = z.name || '';
    document.getElementById('zoneRadius').value = z.radius_m || 150;
    document.getElementById('zoneArriveBy').value = z.arrive_by || '';
    onZoneRadiusChange();
    initZoneMap();
    setZonePoint(Number(z.center_lat), Number(z.center_lng));
}

async function deleteZone(name) {
    const savol = '«' + name + '» hududini o\'chiramizmi? Bu hudud bo\'yicha kelish-ketish xabarlari to\'xtaydi.';
    const bajar = async () => {
        try {
            await fetch(QALQON_BOT_FN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'delete_geofence_zone', childId: currentChildKey, name: name })
            });
            loadZoneList();
        } catch (e) { console.error('delete_geofence_zone:', e); }
    };
    if (tg && tg.showConfirm) tg.showConfirm(savol, (ha) => { if (ha) bajar(); });
    else if (confirm(savol)) bajar();
}

async function saveZone() {
    const msg = document.getElementById('zoneSaveMsg');
    const btn = document.getElementById('zoneSaveBtn');
    const name = (document.getElementById('zoneName').value || '').trim();
    const radius = Number(document.getElementById('zoneRadius').value) || 150;
    const arriveBy = (document.getElementById('zoneArriveBy').value || '').trim();

    if (!name) { msg.innerHTML = '<span class="text-rose-300">Hudud nomini yozing.</span>'; return; }
    if (!zonePoint) { msg.innerHTML = '<span class="text-rose-300">Xaritadan joyni tanlang.</span>'; return; }
    if (!currentChildKey) { msg.innerHTML = '<span class="text-rose-300">Avval farzandni tanlang.</span>'; return; }

    if (btn) { btn.disabled = true; btn.textContent = 'Saqlanmoqda...'; }
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'save_geofence_zone',
                childId: currentChildKey,
                name: name,
                lat: zonePoint.lat,
                lng: zonePoint.lng,
                radiusM: radius,
                arriveBy: arriveBy || null
            })
        });
        const d = await resp.json();
        if (!d.ok) {
            msg.innerHTML = '<span class="text-amber-300">' + escapeHtml(d.error || 'Saqlanmadi') + '</span>';
        } else {
            msg.innerHTML = '<span class="text-emerald-300">✅ «' + escapeHtml(name) + '» saqlandi.</span>';
            document.getElementById('zoneName').value = '';
            document.getElementById('zoneArriveBy').value = '';
            loadZoneList();
        }
    } catch (e) {
        console.error('save_geofence_zone:', e);
        msg.innerHTML = '<span class="text-rose-300">Server javob bermadi.</span>';
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '💾 Hududni saqlash'; }
    }
}

// ============================================================================
// BILDIRISHNOMALAR
// ============================================================================

async function openNotificationsModal() {
    openSubpage('modal-notifications');
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'notification_settings' })
        });
        const d = await resp.json();
        if (d.ok) paintDigestToggle(d.digestEnabled);
    } catch (e) { console.error('notification_settings:', e); }
}

function paintDigestToggle(on) {
    const btn = document.getElementById('digestToggle');
    if (!btn) return;
    btn.dataset.on = on ? '1' : '0';
    btn.textContent = on ? '✅ Yoqilgan' : '⭕️ O\'chirilgan';
    btn.className = on
        ? 'px-3 py-1.5 rounded-xl border text-[10px] font-bold transition bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
        : 'px-3 py-1.5 rounded-xl border text-[10px] font-bold transition bg-slate-800 border-slate-700 text-slate-300';
}

async function toggleDigest() {
    const btn = document.getElementById('digestToggle');
    if (!btn) return;
    const next = btn.dataset.on !== '1';
    btn.textContent = '...';
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'notification_settings', digestEnabled: next })
        });
        const d = await resp.json();
        paintDigestToggle(d.ok ? d.digestEnabled : !next);
    } catch (e) {
        console.error('toggleDigest:', e);
        paintDigestToggle(!next);
    }
}

// ============================================================================
// PANEL OSTIDAGI YANGI BO'LIMLAR: "Qo'shimcha" va "O'yinlar"
//
// Kartalar KO'CHIRILADI, nusxalanmaydi. Nusxalansa, bitta karta ikki joyda
// turib, ikkalasi ham bir xil id bilan yangilanishga urinardi va faqat
// birinchisi ishlardi — bu esa "tugma bosilyapti, hech narsa bo'lmayapti"
// degan eng chalg'ituvchi nuqson turi.
//
// Ota-ona va bola paneli bir vaqtda ochiq bo'lmaydi, shuning uchun o'yinlar
// bloki ham ikkalasi o'rtasida ko'chib yuraveradi.
// ============================================================================

function moveNode(id, hostId) {
    const el = document.getElementById(id);
    const host = document.getElementById(hostId);
    if (!el || !host) return false;
    if (el.parentElement !== host) host.appendChild(el);
    el.classList.remove('hidden');
    return true;
}

/** Ota-ona: "Qo'shimcha" bo'limi kataklari. */
function renderParentExtras() {
    const grid = document.getElementById('parentExtrasGrid');
    if (!grid) return;

    const tiles = [
        { emoji: '🧠', name: 'Farzandingiz haqida', desc: 'Haftalik tahlil va suhbat savollari', fn: 'openWeeklyReport()' },
        { emoji: '💰', name: 'Ball tizimi', desc: "Ball kursi va sovg'alar ro'yxati", fn: 'openTimeBankRules()' },
        { emoji: '🗺️', name: 'Kun marshruti', desc: "Bugun qayerlarda bo'ldi", fn: "switchTab('tab-radar'); setTimeout(renderDayRoute, 500);" },
        { emoji: '🎁', name: "Do'stingizni taklif qiling", desc: 'Ikkalangizga ham bepul Pro', fn: 'shareReferralLink()' },
        { emoji: '📍', name: 'Xavfsiz hududlar', desc: 'Uy va maktabni belgilang', fn: 'openZonesModal()' },
        { emoji: '🔔', name: 'Bildirishnomalar', desc: 'Nima va qachon keladi', fn: 'openNotificationsModal()' },
        { emoji: '🧩', name: 'Oilaviy Viktorina', desc: 'Farzandingiz bilan bellashing', fn: "switchTab('tab-games'); setTimeout(() => openGame('quiz'), 300);" },
        { emoji: '🎮', name: "Farzand o'yinlari", desc: "Kim bilan online o'ynagan", fn: 'openFamilyMatches()' }
    ];

    grid.innerHTML = tiles.map(t =>
        '<button onclick="' + t.fn + '" class="p-3 rounded-2xl bg-slate-900/70 border border-slate-700 hover:border-cyan-500/60 transition text-left">' +
            '<div class="text-xl">' + t.emoji + '</div>' +
            '<div class="text-[11px] font-bold text-white mt-1">' + t.name + '</div>' +
            '<div class="text-[9px] text-slate-400">' + t.desc + '</div>' +
        '</button>').join('');
}

/** Bola: "Qo'shimcha" bo'limiga kartalarni ko'chiramiz. */
function mountChildExtras() {
    ['leagueCard', 'childReferralCard', 'pomodoroCard']
        .forEach(id => moveNode(id, 'childExtrasHost'));

    const host = document.getElementById('childExtrasHost');
    if (host && !host.children.length) {
        host.innerHTML = '<div class="text-[10px] text-slate-500">Bo\'limlar yuklanmoqda...</div>';
    }
}

/** O'yinlar bloki qaysi panelda ochilgan bo'lsa, o'sha yerga ko'chadi. */
function mountGamesInto(hostId) {
    const host = document.getElementById(hostId);
    if (!host) return;
    if (!document.getElementById('gamesGrid')) return;
    moveNode('gamesGrid', hostId);
    moveNode('gameStage', hostId);
    // gameStage o'yin ochilmaguncha yashirin turishi kerak.
    const stage = document.getElementById('gameStage');
    if (stage && !stage.innerHTML.trim()) stage.classList.add('hidden');
    renderGamesGrid();
}


// ============================================================================
// AI KUNLIK CHEGARASI
//
// Buni ko'rsatish ataylab: bepul tarifimiz boshqa bepul AI xizmatlaridan
// ancha ochiq (ChatGPT bepul tarifida kuchli model uchun taxminan 10 ta /
// 5 soat). Foydalanuvchi buni bilmasa, ustunlik yo'qdek bo'ladi.
// ============================================================================

async function renderAiQuota() {
    const box = document.getElementById('aiQuotaBar');
    const txt = document.getElementById('aiQuotaText');
    if (!box || !txt) return;
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'ai_quota' })
        });
        const d = await resp.json();
        if (!d.ok) return;

        const oz = d.remaining <= 3;
        txt.textContent = d.remaining + ' / ' + d.dailyLimit + ' qoldi';
        txt.className = 'font-bold ' + (oz ? 'text-amber-300' : 'text-emerald-300');

        const izoh = box.querySelector('span');
        if (izoh) {
            izoh.textContent = d.plan === 'pro'
                ? 'Pro: kuniga ' + d.dailyLimit + ' ta savol'
                : "Bepul: kuniga " + d.freeDaily + " ta — ko'pchilik AI xizmatlaridan ko'proq";
        }
    } catch (e) {
        console.error('ai_quota:', e);
    }
}

// ============================================================================
// "FARZANDINGIZ HAQIDA" — HAFTALIK TAHLIL
//
// Reels tahlilining o'rnini bosadigan ekran. U bola NIMA KO'RGANINI emas,
// NIMA HIS QILAYOTGANINI ko'rsatadi — va faqat haqiqiy ma'lumotdan:
// fokus vaqti, kayfiyat kundaligi, AI do'st bilan suhbat.
//
// Bolaning yozgan gaplari bu yerda KO'RSATILMAYDI. Faqat xulosa. Aks holda
// bu suhbat emas, o'qib chiqish bo'lardi.
// ============================================================================

async function openWeeklyReport() {
    openSubpage('modal-weekly');
    const body = document.getElementById('weeklyBody');
    if (!body) return;
    body.innerHTML = '<div class="text-center py-8 text-[11px] text-slate-400">🧠 Hafta tahlil qilinmoqda...</div>';

    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'weekly_report', childId: currentChildKey })
        });
        const d = await resp.json();

        if (!d.ok) {
            body.innerHTML = '<div class="text-[11px] text-rose-300 text-center py-6">' + escapeHtml(d.error || 'Xato') + '</div>';
            return;
        }
        if (d.empty) {
            body.innerHTML = '<div class="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">' +
                escapeHtml(d.message) + '</div>';
            return;
        }

        const r = d.report || {};
        const st = d.stats || {};
        const kayf = st.kayfiyat || {};
        const kayfNom = { great: "zo'r", good: 'yaxshi', tired: 'charchagan', sad: 'xafa' };
        const kayfMatn = Object.keys(kayf).map(k => (kayfNom[k] || k) + ': ' + kayf[k]).join(' · ') || "belgilanmagan";

        let html = '';

        if (r.xavf && String(r.xavf).trim()) {
            html += '<div class="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/50 space-y-1 mb-3">' +
                '<div class="text-[11px] font-black text-rose-200">⚠️ E\'tibor talab qiladi</div>' +
                '<div class="text-[11px] text-rose-100 leading-relaxed">' + escapeHtml(r.xavf) + '</div>' +
                '</div>';
        }

        html += '<div class="grid grid-cols-3 gap-2 mb-3">' +
            '<div class="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-center">' +
                '<div class="text-lg font-black text-emerald-300">' + (st.fokusDaqiqa || 0) + '</div>' +
                '<div class="text-[9px] text-slate-400">daqiqa fokus</div></div>' +
            '<div class="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-center">' +
                '<div class="text-lg font-black text-violet-300">' + (st.aiSavollar || 0) + '</div>' +
                '<div class="text-[9px] text-slate-400">AI savoli</div></div>' +
            '<div class="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-center">' +
                '<div class="text-lg font-black text-amber-300">' + (st.kunlikXabar || 0) + '</div>' +
                '<div class="text-[9px] text-slate-400">kayfiyat belgisi</div></div>' +
        '</div>';

        const blok = (sarlavha, matn, rang) => matn && String(matn).trim()
            ? '<div class="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">' +
                '<div class="text-[10px] font-bold ' + rang + '">' + sarlavha + '</div>' +
                '<div class="text-[11px] text-slate-200 leading-relaxed">' + escapeHtml(matn) + '</div>' +
              '</div>'
            : '';

        html += '<div class="space-y-2">' +
            blok('📊 BU HAFTA NIMA O\'ZGARDI', r.ozgarish, 'text-slate-400') +
            blok('💚 XURSAND BO\'LADIGAN NARSA', r.yaxshi, 'text-emerald-300') +
            blok('👀 E\'TIBOR BERING', r.etibor, 'text-amber-300') +
        '</div>';

        if (Array.isArray(r.savollar) && r.savollar.length) {
            html += '<div class="mt-3 p-3.5 rounded-2xl bg-violet-950/40 border border-violet-500/40 space-y-2">' +
                '<div class="text-[11px] font-bold text-violet-200">💬 Farzandingizdan shuni so\'rang</div>' +
                r.savollar.slice(0, 3).map((q, i) =>
                    '<div class="text-[11px] text-slate-200 leading-relaxed">' + (i + 1) + '. ' + escapeHtml(q) + '</div>'
                ).join('') +
            '</div>';
        }

        html += '<div class="mt-3 text-[9px] text-slate-500 leading-relaxed">' +
            'Kayfiyat: ' + escapeHtml(kayfMatn) + '.<br>' +
            'Bu xulosa farzandingizning yozgan gaplarini ko\'chirmaydi — faqat umumiy tahlil. ' +
            'Shunday qilinmasa, u ilovaga yozishni to\'xtatgan bo\'lardi.' +
        '</div>';

        body.innerHTML = html;
    } catch (e) {
        console.error('weekly_report:', e);
        body.innerHTML = '<div class="text-[11px] text-rose-300 text-center py-6">Server javob bermadi.</div>';
    }
}
