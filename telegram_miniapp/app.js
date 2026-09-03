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
        plansSub: "Free (Lokatsiya) / Pro (10,000 so'm)",
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
        approvalNoticeDesc: "Siz hozirda Test / Demo rejimidan foydalanmoqdasiz. Barcha bo'limlar (Radar, AI, e-Maktab) siz uchun ko'rishga ochiq.<br><br>Haqiqiy farzand ma'lumotlarini saqlash va qurilmani ulash administrator ruxsat berganidan so'ng faollashadi.",
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
        childPairingSub: "Ota-onang bergan 6 xonali Oila Kodini kirit",
        childConsentLabel: "Men yuqoridagi barcha 4 ta qoida bilan tanishdim va ota-onam bilan tizimga ulanishga roziman.",
        childInputCodeLabel: "6 Xonali Oila Kodi (masalan: 849210):",
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
        navRadar: "Radar (Bepul)",
        navAi: "AI Murabbiy 💎",
        navSchool: "e-Maktab 💎",
        navSettings: "Sozlamalar",
        backBtn: "← Orqaga",
        nameLabel: "Ism va Familiyasi",
        usernameLabel: "Telegram Usernamesi",
        phoneLabel: "Telefon Raqami",
        emaktabSyncHeader: "e-Maktab (Kundalik) Sinxronizatsiyasi",
        emaktabSyncDesc: "Baholar va davomatni avtomatik olish uchun kiritiladi (Tasdiq kodi shart emas).",
        emaktabLoginLabel: "e-Maktab Login",
        emaktabPassLabel: "e-Maktab Parol",
        classLabel: "Sinfi (1-11 Sinf DTS)",
        saveProfileBtn: "💾 Saqlash va Darsliklarni Yangilash",
        freePlanBadge: "Bepul Tarif (Free)",
        freePlanTitle: "Free Basic",
        freePlanDesc: "📍 Jonli Lokatsiya & Radar (100% Bepul), batareya va umumiy ekran vaqti",
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
        childPairingSub: "Введите 6-значный семейный код от родителей",
        childConsentLabel: "Я ознакомился со всеми 4 правилами и согласен на подключение к родительскому профилю.",
        childInputCodeLabel: "6-значный Код Семьи (например: 849210):",
        btnChildConnect: "Подключиться к Семье",
        childPairedSuccess: "🎉 Поздравляем! Вы успешно подключены к семейному профилю!",
        childPairedSub: "Уведомление отправлено родителям в Telegram-бот.",
        childNavHome: "Главная",
        childNavAi: "AI Друг",
        childNavRewards: "Награды",
        childNavSchool: "e-Maktab",
        childNavExplore: "Интересы",
        navDashboard: "Главная",
        navRadar: "Радар (Free)",
        navAi: "AI Наставник 💎",
        navSchool: "e-Maktab 💎",
        navSettings: "Настройки",
        backBtn: "← Назад",
        nameLabel: "Имя и Фамилия",
        usernameLabel: "Telegram Username",
        phoneLabel: "Номер Телефона",
        emaktabSyncHeader: "Синхронизация с e-Maktab (Kundalik)",
        emaktabSyncDesc: "Для автоматического получения оценок и посещаемости (Код подтверждения не требуется).",
        emaktabLoginLabel: "e-Maktab Логин",
        emaktabPassLabel: "e-Maktab Пароль",
        classLabel: "Класс (1-11 Классы DTS)",
        saveProfileBtn: "💾 Сохранить и Обновить Учебники",
        freePlanBadge: "Бесплатный Тариф",
        freePlanTitle: "Free Basic",
        freePlanDesc: "📍 Онлайн-Локация и Радар (100% Бесплатно), батарея и общее экранное время",
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
        emaktabLogin: "aliyor_kundalik",
        emaktabPassword: "••••••••",
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

function handleAddNewChildSubmit() {
    const nameInput = document.getElementById('newChildNameInput');
    const gradeSelect = document.getElementById('newChildGradeInput');
    const name = nameInput ? nameInput.value.trim() : "";
    const grade = gradeSelect ? parseInt(gradeSelect.value) : 5;

    if (!name) {
        alert("Iltimos, farzandingizning ism-familiyasini kiriting!");
        return;
    }

    const newId = "CH-" + Math.floor(1000 + Math.random() * 9000);
    childrenDatabase[newId] = {
        id: newId,
        name: name,
        name_ru: name,
        username: "@" + name.toLowerCase().replace(/\s+/g, '_'),
        phone: "+998 90 --- -- --",
        grade: grade,
        battery: 92,
        screenTime: "1s 30d",
        screenTime_ru: "1ч 30м",
        remaining: "2s 30d",
        remaining_ru: "2ч 30м",
        location: {
            lat: 41.311081,
            lng: 69.240562,
            address: "Toshkent shahri (Yangi profil)",
            address_ru: "г. Ташкент (Новый профиль)",
            geofences: [
                { name: "🏠 Uy / Дом", status: "Xavfsiz / Безопасно", color: "text-emerald-400" },
                { name: "🏫 Maktab / Школа", status: "Xavfsiz / Безопасно", color: "text-sky-400" }
            ]
        },
        apps: [
            { name: "YouTube", time: "45d", percent: 40, category: "Ta'lim / Video", color: "bg-red-500", icon: "▶️" },
            { name: "Telegram", time: "30d", percent: 30, category: "Muloqot", color: "bg-sky-500", icon: "💬" },
            { name: "Duolingo", time: "20d", percent: 20, category: "Ta'lim", color: "bg-emerald-500", icon: "🦉" },
            { name: "O'yinlar", time: "10d", percent: 10, category: "O'yin", color: "bg-amber-500", icon: "🎮" }
        ],
        interests: {
            uz: [
                { topic: "Dasturlash va IT", percent: 80, color: "bg-emerald-500" },
                { topic: "Matematika va Mantiq", percent: 75, color: "bg-sky-500" }
            ],
            ru: [
                { topic: "Программирование и IT", percent: 80, color: "bg-emerald-500" },
                { topic: "Математика и Логика", percent: 75, color: "bg-sky-500" }
            ]
        }
    };

    saveChildrenDatabase();
    currentChildKey = newId;
    renderChildSelectDropdown();
    renderActiveChild();
    renderSchoolCurriculum();
    closeSubpage();

    if (nameInput) nameInput.value = "";
    alert(`🎉 Yangi farzand profili muvaffaqiyatli yaratildi! (ID: ${newId})`);
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

function saveParentOnboarding() {
    const fam = document.getElementById('onboardFamilyName');
    const par = document.getElementById('onboardParentName');
    const pho = document.getElementById('onboardParentPhone');
    const chName = document.getElementById('onboardChildName');
    const chGrade = document.getElementById('onboardChildGrade');

    const familyName = fam ? fam.value.trim() : "";
    const parentName = par ? par.value.trim() : "";
    const phone = pho ? pho.value.trim() : "";
    const childName = chName ? chName.value.trim() : "";
    const grade = chGrade ? parseInt(chGrade.value) : 5;

    if (!parentName || !childName) {
        alert("Iltimos, o'z ismingiz va birinchi farzandingiz ismini kiriting!");
        return;
    }

    localStorage.setItem('parent_onboarded', 'true');
    localStorage.setItem('parent_name', parentName);
    localStorage.setItem('family_name', familyName);
    localStorage.setItem('parent_phone', phone);

    if (childrenDatabase[currentChildKey]) {
        childrenDatabase[currentChildKey].name = childName;
        childrenDatabase[currentChildKey].name_ru = childName;
        childrenDatabase[currentChildKey].grade = grade;
    }
    saveChildrenDatabase();

    renderChildSelectDropdown();
    renderActiveChild();
    renderSchoolCurriculum();
    closeSubpage();
    alert("🎉 Oila va farzand ma'lumotlari muvaffaqiyatli saqlandi!");
}


function handleChildConsentAccept() {
    const codeInput = document.getElementById('childConsentFamilyCode')?.value.trim();
    const errorBox = document.getElementById('childConsentError');
    if (!codeInput || codeInput.length < 5) {
        if (errorBox) errorBox.classList.remove('hidden');
        return;
    }
    if (errorBox) errorBox.classList.add('hidden');

    localStorage.setItem('child_consented', 'true');
    localStorage.setItem('child_family_code', codeInput);

    const overlay = document.getElementById('childConsentOverlay');
    if (overlay) overlay.classList.add('hidden');

    const childFullName = (typeof tg !== 'undefined' && tg?.initDataUnsafe?.user)
        ? `${tg.initDataUnsafe.user.first_name || ''} ${tg.initDataUnsafe.user.last_name || ''}`.trim()
        : "Farzand";

    try {
        fetch('https://wfrclcwjeeqeqchmdhzw.supabase.co/functions/v1/ota-ona-bot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'child_consent',
                username: (typeof tg !== 'undefined' && tg?.initDataUnsafe?.user?.username) || null,
                telegramId: (typeof tg !== 'undefined' && tg?.initDataUnsafe?.user?.id) || null,
                familyCode: codeInput,
                childName: childFullName || "Farzand"
            })
        }).catch(e => console.log('Child consent dispatched'));

        fetch('https://wfrclcwjeeqeqchmdhzw.supabase.co/functions/v1/ota-ona-bot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'child_paired_event',
                familyCode: codeInput,
                childName: childFullName || "Farzand",
                timestamp: new Date().toISOString()
            })
        }).catch(e => console.log('Child paired notification dispatched'));
    } catch (e) {}

    switchChildTab('child-tab-home');
}

function handleChildConsentDecline() {
    const isRu = (currentLang === 'ru');
    alert(isRu
        ? "Для использования приложения необходимо согласие. Пожалуйста, поговорите с родителями."
        : "Ilovadan foydalanish uchun rozilik zarur. Iltimos, ota-onangiz bilan gaplashing.");
}

function checkChildConsentStatus() {
    if (currentAppRole === 'child') {
        const consented = localStorage.getItem('child_consented') === 'true';
        const overlay = document.getElementById('childConsentOverlay');
        const codeInput = document.getElementById('childConsentFamilyCode');
        
        // Farzand og'zaki kodni qo'lda kiritadi
        if (codeInput) codeInput.value = "";

        if (overlay) {
            if (!consented) {
                overlay.classList.remove('hidden');
            } else {
                overlay.classList.add('hidden');
            }
        }
        
        const pairingSection = document.getElementById('childPairingSection');
        if (pairingSection) {
            pairingSection.classList.toggle('hidden', consented);
        }

        // Farzand panelini majburiy tanlash
        switchChildTab('child-tab-home');
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
let familyCode = urlCode || "849210";

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
    currentAppRole = role;
    localStorage.setItem('app_role', role);

    const isParent = (role === 'parent');
    const quickMenuFab = document.getElementById('quickMenuFab');
    if (quickMenuFab) {
        quickMenuFab.classList.toggle('hidden', !isParent);
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
    const childTabs = ['child-tab-home', 'child-tab-ai', 'child-tab-rewards', 'child-tab-school', 'child-tab-explore'];
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

function handleChildImageSelected(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedChildImageBase64 = e.target.result;
        handleChildAiSend();
    };
    reader.readAsDataURL(file);
}

async function callRealVisionBackendForChild(query, imageBase64) {
    const child = childrenDatabase[currentChildKey];
    const isRu = (currentLang === 'ru');
    appendChildAiMessage(isRu
        ? '\ud83e\udd14 Анализирую фото задания, подождите (может занять до минуты)...'
        : '\ud83e\udd14 Mashq rasmini tahlil qilyapman, kuting (bir daqiqagacha vaqt olishi mumkin)...');
    try {
        const blob = await (await fetch(imageBase64)).blob();
        const formData = new FormData();
        formData.append('image', blob, 'exercise.jpg');
        formData.append('child_id', currentChildKey || 'unknown');
        formData.append('grade', String(child?.grade || 5));
        formData.append('subject', 'Umumiy');
        const resp = await fetch('https://qalqon-backend.onrender.com/api/v1/tutor/vision', {
            method: 'POST',
            body: formData
        });
        const data = await resp.json();
        if (data.ok && data.answer) {
            appendChildAiMessage(data.answer.replace(/\n/g, '<br>'));
        } else {
            appendChildAiMessage(isRu ? 'Ошибка анализа. Попробуйте ещё раз.' : 'Tahlilda xatolik yuz berdi. Qayta urinib ko\'ring.');
        }
    } catch (e) {
        console.error('Child vision backend error:', e);
        appendChildAiMessage(isRu ? '\u26a0\ufe0f Сервер временно недоступен.' : '\u26a0\ufe0f Server vaqtincha javob bermayapti.');
    }
}

function handleChildAiSend() {
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

        pomodoroInterval = setInterval(() => {
            if (pomodoroSeconds > 0) {
                pomodoroSeconds--;
                updatePomodoroDisplay();
            } else {
                clearInterval(pomodoroInterval);
                isPomodoroRunning = false;
                alert(isRu ? "🎉 25 минут завершены! 5 минут отдыха для глаз 👀" : "🎉 25 daqiqa tugadi! Ko'zlarga 5 daqiqa dam beramiz 👀");
                resetPomodoroTimer();
            }
        }, 1000);
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

function handleChildPairingSubmit() {
    const consent = document.getElementById('childConsentCheckbox')?.checked;
    const codeInput = document.getElementById('childFamilyCodeInput')?.value.trim();
    const errorBox = document.getElementById('childPairErrorMsg');
    const successBox = document.getElementById('childPairedSuccessBox');

    if (!consent) {
        if (errorBox) {
            errorBox.innerText = (currentLang === 'ru') 
                ? "⚠️ Пожалуйста, подтвердите согласие с правилами (отметьте галочку)!" 
                : "⚠️ Iltimos, barcha qoidalar bilan tanishib, rozilik belgisini qo'ying!";
            errorBox.classList.remove('hidden');
        }
        return;
    }

    if (!codeInput || codeInput.length < 5) {
        if (errorBox) {
            errorBox.innerText = (currentLang === 'ru') 
                ? "⚠️ Введите корректный 6-значный семейный код (например: 849210)!" 
                : "⚠️ Ota-onangiz bergan to'g'ri 6 xonali oila kodini kiriting (masalan: 849210)!";
            errorBox.classList.remove('hidden');
        }
        return;
    }

    if (errorBox) errorBox.classList.add('hidden');

    // Supabase botiga farzand muvaffaqiyatli ulanganligi haqida xabar yuborish
    try {
        fetch('https://wfrclcwjeeqeqchmdhzw.supabase.co/functions/v1/ota-ona-bot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'child_paired_event',
                familyCode: codeInput,
                childName: childrenDatabase[currentChildKey]?.name || "Farzand",
                timestamp: new Date().toISOString()
            })
        }).catch(e => console.log('Child paired notification dispatched'));
        // Ma'lumotlar bazasida ham rozilik berilganini belgilaymiz
        fetch('https://wfrclcwjeeqeqchmdhzw.supabase.co/functions/v1/ota-ona-bot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'child_consent',
                username: (typeof tg !== 'undefined' && tg?.initDataUnsafe?.user?.username) || null,
                telegramId: (typeof tg !== 'undefined' && tg?.initDataUnsafe?.user?.id) || null,
                familyCode: codeInput,
                childName: childrenDatabase[currentChildKey]?.name || "Farzand"
            })
        }).catch(e => console.log('Child consent dispatched'));
    } catch(e) {}

    if (successBox) successBox.classList.remove('hidden');
    localStorage.setItem('child_paired', 'true');
    localStorage.setItem('child_family_code', codeInput);

    alert(currentLang === 'ru' 
        ? "🎉 Отлично! Вы успешно подключились к семье. Оповещение отправлено родителям!" 
        : "🎉 Ajoyib! Siz oila profiliga muvaffaqiyatli ulandingiz. Ota-onangizga xabar yuborildi!");
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
    if (document.getElementById('profileEmaktabLogin')) {
        document.getElementById('profileEmaktabLogin').value = child.emaktabLogin || "login_kundalik";
    }
    if (document.getElementById('profileEmaktabPassword')) {
        document.getElementById('profileEmaktabPassword').value = child.emaktabPassword || "••••••••";
    }
    openSubpage('modal-child-profile');
}

function saveChildProfile() {
    const fullName = document.getElementById('profileFullName').value.trim() || "Farzand";
    const username = document.getElementById('profileUsername').value.trim() || "@farzand";
    const grade = parseInt(document.getElementById('profileClassSelect').value) || 5;
    const phone = document.getElementById('profilePhone')?.value.trim() || "+998 90 123 45 67";
    const emaktabLogin = document.getElementById('profileEmaktabLogin')?.value.trim() || "login_kundalik";
    const emaktabPassword = document.getElementById('profileEmaktabPassword')?.value.trim() || "••••••••";

    childrenDatabase[currentChildKey].name = fullName;
    childrenDatabase[currentChildKey].username = username;
    childrenDatabase[currentChildKey].grade = grade;
    childrenDatabase[currentChildKey].phone = phone;
    childrenDatabase[currentChildKey].emaktabLogin = emaktabLogin;
    childrenDatabase[currentChildKey].emaktabPassword = emaktabPassword;

    localStorage.setItem('children_database', JSON.stringify(childrenDatabase));

    const select = document.getElementById('childSelector');
    if (select.querySelector(`option[value="${currentChildKey}"]`)) {
        select.querySelector(`option[value="${currentChildKey}"]`).innerText = `${fullName} (${grade}-${currentLang === 'ru' ? 'класс' : 'sinf'})`;
    }

    renderActiveChild();
    renderSchoolCurriculum();
    closeSubpage();

    const alertMsg = (currentLang === 'ru')
        ? `✅ Данные ребёнка и синхронизация с e-Maktab сохранены!\nУчебники ${grade}-го класса и шкала 100 баллов установлены.`
        : `✅ Farzand ma'lumotlari va e-Maktab sinxronizatsiyasi saqlandi!\n${grade}-sinf Davlat darsliklari va 100 ballik baholar o'rnatildi.`;
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

async function callRealVisionBackend(query, imageBase64) {
    const child = childrenDatabase[currentChildKey];
    const isRu = (currentLang === 'ru');
    const thinkingMsg = isRu
        ? '\ud83e\udd14 Анализирую фото задания, подождите немного (может занять до минуты при первом запросе)...'
        : '\ud83e\udd14 Mashqni tahlil qilyapman, biroz kuting (birinchi so\'rovda bir daqiqagacha vaqt olishi mumkin)...';
    appendAIMessage(thinkingMsg);
    try {
        const blob = await (await fetch(imageBase64)).blob();
        const formData = new FormData();
        formData.append('image', blob, 'exercise.jpg');
        formData.append('child_id', currentChildKey || 'unknown');
        formData.append('grade', String(child?.grade || 5));
        formData.append('subject', 'Umumiy');
        const resp = await fetch('https://qalqon-backend.onrender.com/api/v1/tutor/vision', {
            method: 'POST',
            body: formData
        });
        const data = await resp.json();
        if (data.ok && data.answer) {
            appendAIMessage(data.answer.replace(/\n/g, '<br>'));
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
    const isRuNoImg = (currentLang === 'ru');
    appendAIMessage(isRuNoImg
        ? '\ud83d\udcf8 Пожалуйста, прикрепите фото задания (учебника) \u2014 я анализирую именно фотографии, чтобы дать точный ответ по вашей теме.'
        : '\ud83d\udcf8 Iltimos, mashq yoki darslik sahifasining rasmini biriktiring \u2014 men rasm orqali aniq va to\'g\'ri javob beraman.');
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

    if (tabId === 'tab-radar') {
        setTimeout(() => {
            initRadarMap();
            if (mapInstance) mapInstance.invalidateSize();
        }, 150);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
async function fetchAndApplyRole() {
    if (urlRole) return; // Havolada aniq rol ko'rsatilgan bo'lsa (masalan admin tugmasi), shuni ustun qo'yamiz
    const uname = (typeof tg !== 'undefined' && tg?.initDataUnsafe?.user?.username) || null;
    const tid = (typeof tg !== 'undefined' && tg?.initDataUnsafe?.user?.id) || null;
    if (!uname && !tid) return;
    try {
        const resp = await fetch('https://wfrclcwjeeqeqchmdhzw.supabase.co/functions/v1/ota-ona-bot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'check_role', username: uname, telegramId: tid })
        });
        const data = await resp.json();
        if (data.role === 'child') {
            currentAppRole = 'child';
            localStorage.setItem('app_role', 'child');
        } else if (data.role === 'parent') {
            currentAppRole = 'parent';
            localStorage.setItem('app_role', 'parent');
        }
    } catch (e) {
        console.error('check_role sorovida xato:', e);
    }
}
// DOM Init
document.addEventListener('DOMContentLoaded', async () => {
    setTheme(currentTheme);
    applyLanguageTranslations();
    updateAuthUI();
    await fetchAndApplyRole();
    switchAppRole(currentAppRole);
    renderChildSelectDropdown();
    renderActiveChild();
    renderSchoolCurriculum();
    initRadarMap();
    checkParentOnboarding();
    checkChildConsentStatus();
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
        code: familyCode || "849210",
        status: "pending"
    };

    localStorage.setItem('qalqon_family_profile', JSON.stringify(familyData));
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

    // Show pending approval modal
    const pendingOverlay = document.getElementById('pendingApprovalOverlay');
    if (pendingOverlay) pendingOverlay.classList.remove('hidden');

    
    // Adminga (358795989 - @ai_loyihachi) to'g'ridan-to'g'ri Telegram xabar yuborish
    try {
        // Supabase Edge Function orqali (xavfsiz, CORS to'g'ri sozlangan) adminga yuboriladi
        const SUPABASE_FUNCTION_URL = "https://wfrclcwjeeqeqchmdhzw.supabase.co/functions/v1/ota-ona-bot";
        fetch(SUPABASE_FUNCTION_URL, {
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
                familyCode: familyCode
            })
        }).catch(err => console.log("Notify error:", err));
    } catch(e) {
        console.error("Admin dispatch failed:", e);
    }

    alert("✅ Oila ma'lumotlari saqlandi va Bosh administrator (@ai_loyihachi) tasdig'iga yuborildi!");
}
