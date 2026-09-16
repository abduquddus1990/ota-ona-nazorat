/* ============================================================================
 * QALQON AI — O'YINLAR
 *
 * Ikkita qoida butun faylni belgilaydi:
 *
 * 1) O'yinlar HECH QANDAY ball, XP yoki Pro bermaydi. Ular faqat bolani
 *    ilovaga qaytarish uchun. Buning yoqimli oqibati bor: o'yin qimmatli
 *    narsa bermagani uchun, uni aldashning ham ma'nosi yo'q — demak
 *    vaqtni o'lchash, urinishlarni cheklash kerak emas.
 *
 * 2) Yolg'iz o'ynaladigan o'yinlar (Bo'ri Sarguzashti, Xotira Kartalari)
 *    butunlay OFLAYN ishlaydi: savollar ham, kartalar ham shu faylning
 *    ichida. Sahifa bir marta ochilgandan keyin internet kerak emas —
 *    metroda, mashinada, qishloqda ham o'ynaydi.
 *
 *    Oilaviy Viktorina esa istisno va boshqacha bo'lolmaydi: uning butun
 *    ma'nosi boshqa odam bilan o'ynashda, ya'ni server kerak. To'g'ri
 *    javoblar ham serverda qoladi — bu yerdagi kod ularni bilmaydi.
 *
 * Eng yaxshi natija brauzerning o'zida (localStorage) saqlanadi: u boshqa
 * hech kimga ko'rinmaydi va yo'qolsa ham hech narsa buzilmaydi.
 * ========================================================================= */

/* ---------------------------------------------------------------------------
 * KONTENT: FALSAFIY TOPSHIRIQLAR (Bo'ri Sarguzashti uchun)
 *
 * Bularning ko'pchiligida TO'G'RI JAVOB YO'Q — ataylab. Bola tanlaydi, bo'ri
 * esa o'ylashga undaydigan javob qaytaradi. Maqsad — bolani "to'g'ri javobni
 * top" o'yinidan "o'zing nima deb o'ylaysan" suhbatiga olib o'tish.
 * ------------------------------------------------------------------------ */
const WOLF_TASKS = [
    {
        q: "Do'sting imtihonda sendan ko'chirmoqchi. Bermasang — xafa bo'ladi, bersang — aldagan bo'lasan.",
        a: [
            { t: "Beraman — do'stlik muhimroq", r: "Do'stlikni qadrlaysan. Lekin o'ylab ko'r: unga bugun yordam berding, ertaga u o'zi bilmay qoladi. Haqiqiy do'stlik — o'rgatish." },
            { t: "Bermayman va sababini tushuntiraman", r: "Qiyin yo'lni tanlading. Rost gapirish do'stlikni yo'qotmaydi — aksincha, sinovdan o'tkazadi." },
            { t: "Keyin birga tayyorlanishni taklif qilaman", r: "Eng kuchli javob: sen na aldading, na do'stingni tashlab qo'yding." }
        ]
    },
    {
        q: "Ko'chada pul topib olding. Egasi kim ekani noma'lum.",
        a: [
            { t: "O'zimga olaman", r: "Ko'pchilik shunday qiladi. Endi bir savol: o'sha pulni yo'qotgan odam haqida o'ylab ko'rdingmi?" },
            { t: "Kattalarga beraman", r: "Sen mas'uliyatni o'zingdan katta odamga topshirding — bu ham to'g'ri yo'l." },
            { t: "Egasini qidiraman", r: "Eng og'ir, lekin eng halol yo'l. Topolmasang ham, o'zingga bo'lgan hurmating saqlanadi." }
        ]
    },
    {
        q: "Sinfdoshingni boshqalar masxara qilishyapti. Sen jim tursang, senga tegishmaydi.",
        a: [
            { t: "Jim turaman", r: "Xavfsiz yo'l. Lekin bir kun o'sha o'rinda sen turishing mumkin — o'shanda kim gapiradi?" },
            { t: "To'xtating, deyman", r: "Bu jasorat. Jasorat — qo'rqmaslik emas, qo'rqib turib to'g'ri ish qilish." },
            { t: "Keyin uning yoniga boraman", r: "Ba'zan bitta \"yolg'iz emassan\" degan gap baqirishdan kuchliroq." }
        ]
    },
    {
        q: "Nima deb o'ylaysan: yolg'on gapirish har doim yomonmi?",
        a: [
            { t: "Ha, har doim", r: "Qattiq, lekin ravshan qoida. Shunday yashash oson emas, lekin ishonch qozonadi." },
            { t: "Yo'q, birovni asrash uchun mumkin", r: "Ko'pchilik shunday deydi. Faqat ehtiyot bo'l: \"yaxshilik uchun\" degan bahona juda tez odat bo'lib qoladi." },
            { t: "Bilmayman", r: "\"Bilmayman\" — kuchsizlik emas. Eng chuqur savollarga tayyor javob bo'lmaydi." }
        ]
    },
    {
        q: "Onang sendan telefonni bir kunga olib qo'ydi. Sen g'azabdasan.",
        a: [
            { t: "Baqiraman", r: "G'azab tabiiy. Lekin baqirgan odamni hech kim eshitmaydi — faqat ovozini eshitadi." },
            { t: "Jim bo'lib, xafa bo'laman", r: "Jimlik ham bir gap. Faqat u ko'pincha noto'g'ri tushuniladi." },
            { t: "Tinchlanib, sababini so'rayman", r: "Eng qiyin qismi — tinchlanish. Uni uddalasang, qolgani osonlashadi." }
        ]
    },
    {
        q: "Senga: \"Bu ishni bajarolmaysan, qo'l tortib qo'ya qol\" deyishdi.",
        a: [
            { t: "To'xtataman", r: "Ba'zan to'xtash ham aqlli qaror. Savol shu: to'xtatayotgan sensanmi yoki ularning gapimi?" },
            { t: "Isbotlash uchun davom etaman", r: "Kuch bor. Faqat eslab qol: eng yaxshi ishlar birovga isbotlash uchun emas, o'zing uchun qilinadi." },
            { t: "Nega bajarolmasligimni so'rayman", r: "Savol berish — eng kam ishlatiladigan qurol." }
        ]
    },
    {
        q: "Bir ish juda qiziq, lekin uzoq vaqt talab qiladi. Boshqasi oson, lekin zerikarli.",
        a: [
            { t: "Osonini tanlayman", r: "Vaqt tejaysan. Faqat zerikarli ishlar vaqtni tejamaydi — ular uni bilintirmay yeydi." },
            { t: "Qiyinini tanlayman", r: "Qiyin narsalar ko'pincha keyin \"eng yaxshi qarorim edi\" deb eslanadi." },
            { t: "Qiyinini kichik bo'laklarga bo'laman", r: "Sen kattalar ham bilmaydigan narsani topding: katta ish — ko'p kichik ishning boshqa nomi." }
        ]
    },
    {
        q: "Xato qilding va uni hech kim ko'rmadi.",
        a: [
            { t: "Jim qolaman", r: "Hech kim bilmaydi. Sen bilasan — va odatda shunisi og'irroq." },
            { t: "O'zim aytaman", r: "Aytilgan xato tuzatiladi; yashirilgani kattalashadi." },
            { t: "Avval tuzataman, keyin aytaman", r: "Yetuk yondashuv: avval zararni to'xtatasan, keyin rostini aytasan." }
        ]
    },
    {
        q: "Baxtli bo'lish uchun nima kerak deb o'ylaysan?",
        a: [
            { t: "Ko'p narsaga ega bo'lish", r: "Narsalar quvontiradi — qisqa vaqtga. Keyin yana yangisi kerak bo'ladi." },
            { t: "Yaqinlar bilan birga bo'lish", r: "Ko'p yillik tadqiqotlar ham shuni ko'rsatadi: baxtni eng ko'p belgilaydigan narsa — munosabatlar." },
            { t: "O'z ishini sevish", r: "Kuningning uchdan biri ishda o'tadi. Uni yoqtirmasang, hayotning uchdan biri yoqimsiz bo'ladi." }
        ]
    },
    {
        q: "Kimdir senga yomonlik qildi. Kechirasanmi?",
        a: [
            { t: "Yo'q, kechirmayman", r: "Haqqing bor. Faqat g'azabni ushlab turish — ko'mir ushlagandek: avval o'z qo'ling kuyadi." },
            { t: "Kechiraman, lekin unutmayman", r: "Ko'pchilik shu yerda to'xtaydi. Bu aqlli muvozanat." },
            { t: "Avval nega qilganini bilmoqchiman", r: "Tushunish — kechirishning boshlanishi. Lekin tushunish \"to'g'ri\" degani emas." }
        ]
    },
    {
        q: "Hamma bir narsani to'g'ri deydi, sen esa noto'g'ri deb o'ylaysan.",
        a: [
            { t: "Jim turaman", r: "Ko'pchilikka qarshi chiqish qiyin. Lekin tarixdagi eng muhim o'zgarishlar shu jimlikni buzgan odamlardan boshlangan." },
            { t: "Fikrimni aytaman", r: "Yaxshi. Faqat aytishdan oldin bir savol ber: men haqiqatan bilaman, yoki shunchaki ishonamanmi?" },
            { t: "Avval yaxshilab tekshiraman", r: "Eng kuchli javob. Fikr — tekshirilgandan keyin og'irlik oladi." }
        ]
    },
    {
        q: "Vaqt — eng qimmat narsami yoki pulmi?",
        a: [
            { t: "Pul", r: "Pul kerak, shubhasiz. Faqat pulni qaytarib topish mumkin, vaqtni esa — yo'q." },
            { t: "Vaqt", r: "Sen hamma ham kech tushunadigan narsani erta tushunding." },
            { t: "Ikkalasi ham emas — sog'liq", r: "Kutilmagan javob, va ehtimol eng to'g'risi: qolgan ikkitasi shunga bog'liq." }
        ]
    }
];

/* ---------------------------------------------------------------------------
 * KONTENT: XOTIRA KARTALARI
 *
 * Juftliklar ma'noli: bir tomonda savol, ikkinchisida javob. Oddiy "bir xil
 * rasmni top" o'yinidan farqi shu — bola juftni topish uchun mazmunni bilishi
 * yoki eslab qolishi kerak.
 * ------------------------------------------------------------------------ */
const MEMORY_DECKS = [
    {
        id: 'tarix',
        name: 'Tarix sanalari',
        emoji: '📜',
        pairs: [
            ['1991', "O'zbekiston mustaqilligi"],
            ['1370', 'Amir Temur davlati'],
            ['1917', 'Rossiyada inqilob'],
            ['1945', 'Ikkinchi jahon urushi tugadi'],
            ['1969', 'Odam Oyga qadam qo\'ydi'],
            ['1428', 'Ulug\'bek rasadxonasi'],
            ['2016', 'Yangi O\'zbekiston islohotlari'],
            ['1206', 'Chingizxon imperiyasi']
        ]
    },
    {
        id: 'formula',
        name: 'Formulalar',
        emoji: '🧪',
        pairs: [
            ['H₂O', 'Suv'],
            ['CO₂', 'Karbonat angidrid'],
            ['NaCl', 'Osh tuzi'],
            ['E = mc²', 'Eynshteyn tenglamasi'],
            ['S = πr²', 'Doira yuzasi'],
            ['O₂', 'Kislorod'],
            ['V = a³', 'Kub hajmi'],
            ['a² + b² = c²', 'Pifagor teoremasi']
        ]
    },
    {
        id: 'tabiat',
        name: 'Tabiat',
        emoji: '🌍',
        pairs: [
            ['Eng baland tog\'', 'Everest'],
            ['Eng uzun daryo', 'Nil'],
            ['Eng katta okean', 'Tinch okeani'],
            ['Eng katta hayvon', 'Ko\'k kit'],
            ['Eng tez hayvon', 'Gepard'],
            ['O\'zbekistondagi eng katta ko\'l', 'Orol (qurigan)'],
            ['Eng issiq sayyora', 'Venera'],
            ['Quyoshga eng yaqin sayyora', 'Merkuriy']
        ]
    },
    {
        id: 'ingliz',
        name: 'Ingliz tili',
        emoji: '🔤',
        pairs: [
            ['Brave', 'Jasur'],
            ['Honest', 'Halol'],
            ['Curious', 'Qiziquvchan'],
            ['Patient', 'Sabrli'],
            ['Grateful', 'Minnatdor'],
            ['Wisdom', 'Donolik'],
            ['Effort', 'Harakat'],
            ['Promise', 'Va\'da']
        ]
    },
    {
        id: 'ona-tili',
        name: 'Ona tili',
        emoji: '📖',
        pairs: [
            ['Sinonim', 'Ma\'nodosh so\'z'],
            ['Antonim', 'Zid ma\'noli so\'z'],
            ['Omonim', 'Shakldosh so\'z'],
            ['Ega', 'Kim? Nima?'],
            ['Kesim', 'Nima qildi?'],
            ['Sifat', 'Qanday?'],
            ['Son', 'Nechta?'],
            ['Ravish', 'Qanday qilib?']
        ]
    }
];

/* ========================================================================= */

let gamesBest = {};
try { gamesBest = JSON.parse(localStorage.getItem('qalqon_games_best') || '{}'); } catch (e) { gamesBest = {}; }

function saveBest(key, value, lowerIsBetter) {
    const old = gamesBest[key];
    const better = old == null || (lowerIsBetter ? value < old : value > old);
    if (better) {
        gamesBest[key] = value;
        // localStorage bloklangan bo'lishi mumkin (maxfiy oyna, o'chirilgan
        // sayt ma'lumotlari) — u holda o'yin baribir ishlayveradi.
        try { localStorage.setItem('qalqon_games_best', JSON.stringify(gamesBest)); } catch (e) {}
    }
    return better;
}

const GAMES = [
    {
        id: 'quiz',
        name: 'Oilaviy Viktorina',
        emoji: '🧩',
        desc: 'Ota-onang bilan bir xil savollarga javob ber',
        tag: 'Oila'
    },
    {
        id: 'wolf',
        name: "Bo'ri Sarguzashti",
        emoji: '🐺',
        desc: "Bo'rini yurgizib, o'rmondagi topshiriqlarni top va yech",
        tag: 'Oflayn'
    },
    {
        id: 'memory',
        name: 'Xotira Kartalari',
        emoji: '🃏',
        desc: 'Juftlarni top — tarix, formulalar, so\'zlar',
        tag: 'Oflayn'
    }
];

function renderGamesGrid() {
    const grid = document.getElementById('gamesGrid');
    if (!grid) return;
    grid.innerHTML = GAMES.map(g => {
        const bestMap = {
            memory: gamesBest.memory != null ? 'Eng yaxshi: ' + gamesBest.memory + ' yurish' : '',
            wolf: gamesBest.wolf != null ? 'Yechilgan: ' + gamesBest.wolf + ' topshiriq' : '',
            tower: gamesBest.tower != null ? 'Eng baland: ' + gamesBest.tower + ' qavat' : '',
            snake: gamesBest.snake != null ? 'Eng yaxshi: ' + gamesBest.snake : ''
        };
        const best = bestMap[g.id] || '';
        return `
        <div onclick="openGame('${g.id}')" class="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-700 hover:border-indigo-500/60 transition cursor-pointer flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-slate-950/80 border border-slate-700 flex items-center justify-center text-2xl">${g.emoji}</div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold text-white">${g.name}</span>
                    <span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">${g.tag}</span>
                </div>
                <div class="text-[10px] text-slate-400 mt-0.5">${g.desc}</div>
                ${best ? `<div class="text-[9px] text-amber-300 mt-0.5">${best}</div>` : ''}
            </div>
            <span class="text-slate-500 text-lg">›</span>
        </div>`;
    }).join('');
}

function openGame(id) {
    const grid = document.getElementById('gamesGrid');
    const stage = document.getElementById('gameStage');
    const intro = document.getElementById('gamesIntro');
    if (!stage) return;
    if (grid) grid.classList.add('hidden');
    if (intro) intro.classList.add('hidden');
    stage.classList.remove('hidden');
    if (id === 'wolf') startWolfGame(stage);
    if (id === 'memory') startMemoryGame(stage);
    if (id === 'quiz') startQuiz(stage);
    if (id === 'tower') startTowerGame(stage);
    if (id === 'snake') startSnakeGame(stage);
}

function closeGame() {
    stopWolfGame();
    // Arkada o'yinlari o'z tsikli va klaviatura tinglovchilarini qoldirib
    // ketmasligi kerak: aks holda bola boshqa bo'limga o'tganda ham o'yin
    // fon rejimida ishlab, batareyani yeb turardi.
    if (typeof stopArcade === 'function') stopArcade();
    const grid = document.getElementById('gamesGrid');
    const stage = document.getElementById('gameStage');
    const intro = document.getElementById('gamesIntro');
    if (stage) { stage.classList.add('hidden'); stage.innerHTML = ''; }
    if (grid) grid.classList.remove('hidden');
    if (intro) intro.classList.remove('hidden');
    renderGamesGrid();
}

/* ===========================================================================
 * 1) BO'RI SARGUZASHTI
 *
 * Yuqoridan qaralgan kichik o'rmon. Bola bo'rini yurgizadi, yorqin nuqtaga
 * yetganda topshiriq ochiladi. Topshiriqlarning ko'pida to'g'ri javob yo'q —
 * shuning uchun "yutqazish" ham yo'q. Bu ataylab: o'yin bolani jazolamaydi,
 * o'ylantiradi.
 * ======================================================================== */

let wolfLoop = null;
let wolfKeyHandler = null;

function stopWolfGame() {
    if (wolfLoop) { cancelAnimationFrame(wolfLoop); wolfLoop = null; }
    if (wolfKeyHandler) { window.removeEventListener('keydown', wolfKeyHandler); wolfKeyHandler = null; }
}

function startWolfGame(stage) {
    stopWolfGame();

    stage.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <button onclick="closeGame()" class="text-[11px] font-bold text-indigo-300">← O'yinlar</button>
            <div class="text-[11px] font-bold text-white">🐺 Bo'ri Sarguzashti</div>
            <div class="text-[10px] text-amber-300 font-mono" id="wolfScore">0/5</div>
        </div>
        <canvas id="wolfCanvas" class="w-full rounded-2xl border border-slate-700" style="background:#0b1220;touch-action:none"></canvas>
        <div class="text-[10px] text-slate-400 text-center mt-2" id="wolfHint">Bo'rini yurgizib, yorqin nuqtalarga bor</div>
        <div class="grid grid-cols-3 gap-2 mt-3 max-w-[220px] mx-auto select-none" id="wolfPad">
            <span></span>
            <button data-dir="up"    class="py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">↑</button>
            <span></span>
            <button data-dir="left"  class="py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">←</button>
            <button data-dir="down"  class="py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">↓</button>
            <button data-dir="right" class="py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">→</button>
        </div>
        <div id="wolfTask" class="hidden mt-3 p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 space-y-2.5"></div>
    `;

    const canvas = document.getElementById('wolfCanvas');
    const W = Math.min(stage.clientWidth || 340, 420);
    const H = Math.round(W * 0.78);
    // Ekran zichligiga moslash — aks holda chiziqlar xira ko'rinadi.
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.height = H + 'px';
    const x = canvas.getContext('2d');
    x.scale(dpr, dpr);

    // Bir seansda 5 ta topshiriq, har safar boshqacha tartibda.
    const pool = WOLF_TASKS.slice().sort(() => Math.random() - 0.5).slice(0, 5);
    const spots = pool.map((t, i) => ({
        x: 40 + Math.random() * (W - 80),
        y: 40 + Math.random() * (H - 80),
        task: t,
        done: false,
        i
    }));

    const trees = Array.from({ length: 14 }, () => ({
        x: Math.random() * W, y: Math.random() * H, s: 10 + Math.random() * 10
    }));

    const wolf = { x: W / 2, y: H / 2, vx: 0, vy: 0, dir: 1 };
    const keys = {};
    let solved = 0;
    let paused = false;

    wolfKeyHandler = (e) => {
        const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
        if (map[e.key]) { keys[map[e.key]] = e.type === 'keydown'; e.preventDefault(); }
    };
    window.addEventListener('keydown', wolfKeyHandler);
    window.addEventListener('keyup', (e) => {
        const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
        if (map[e.key]) keys[map[e.key]] = false;
    });

    // Tugmalar: bosib turilganda yuradi, qo'yib yuborilganda to'xtaydi.
    document.querySelectorAll('#wolfPad button').forEach(btn => {
        const d = btn.getAttribute('data-dir');
        const on = (ev) => { ev.preventDefault(); keys[d] = true; };
        const off = (ev) => { ev.preventDefault(); keys[d] = false; };
        btn.addEventListener('touchstart', on, { passive: false });
        btn.addEventListener('touchend', off, { passive: false });
        btn.addEventListener('touchcancel', off, { passive: false });
        btn.addEventListener('mousedown', on);
        btn.addEventListener('mouseup', off);
        btn.addEventListener('mouseleave', off);
    });

    function openTask(spot) {
        paused = true;
        const box = document.getElementById('wolfTask');
        box.classList.remove('hidden');
        box.innerHTML = `
            <div class="text-[11px] text-indigo-200 font-bold">🐺 Bo'ri so'raydi:</div>
            <div class="text-[12px] text-white leading-relaxed">${escapeHtml(spot.task.q)}</div>
            <div class="space-y-1.5" id="wolfAnswers">
                ${spot.task.a.map((o, i) => `
                    <button data-i="${i}" class="w-full text-left p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-indigo-500 text-[11px] text-slate-200 transition">
                        ${escapeHtml(o.t)}
                    </button>`).join('')}
            </div>`;
        box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        box.querySelectorAll('#wolfAnswers button').forEach(b => {
            b.onclick = () => {
                const chosen = spot.task.a[Number(b.getAttribute('data-i'))];
                spot.done = true;
                solved++;
                document.getElementById('wolfScore').textContent = solved + '/5';
                box.innerHTML = `
                    <div class="text-[11px] text-indigo-200 font-bold">🐺 Bo'ri javob beradi:</div>
                    <div class="text-[12px] text-slate-200 leading-relaxed">${escapeHtml(chosen.r)}</div>
                    <button id="wolfNext" class="w-full py-2 rounded-xl bg-indigo-500/25 border border-indigo-500/50 text-indigo-100 text-[11px] font-bold">
                        ${solved >= 5 ? '🏁 Yakunlash' : 'Davom etish →'}
                    </button>`;
                document.getElementById('wolfNext').onclick = () => {
                    box.classList.add('hidden');
                    paused = false;
                    if (solved >= 5) finish();
                };
                if (typeof tg !== 'undefined' && tg && tg.HapticFeedback) {
                    tg.HapticFeedback.impactOccurred('light');
                }
            };
        });
    }

    function finish() {
        stopWolfGame();
        saveBest('wolf', solved, false);
        stage.querySelector('#wolfHint').textContent = '';
        const box = document.getElementById('wolfTask');
        box.classList.remove('hidden');
        box.innerHTML = `
            <div class="text-center space-y-2">
                <div class="text-4xl">🐺</div>
                <div class="text-sm font-black text-white">Sarguzasht tugadi</div>
                <div class="text-[11px] text-slate-300 leading-relaxed">
                    Sen 5 ta topshiriqni yeching. Bularning ko'pida to'g'ri javob yo'q edi —
                    muhimi javobing emas, o'ylaganing.
                </div>
                <button onclick="openGame('wolf')" class="w-full py-2 rounded-xl bg-indigo-500/25 border border-indigo-500/50 text-indigo-100 text-[11px] font-bold">
                    🔁 Yana o'ynash
                </button>
                <button onclick="closeGame()" class="w-full py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold">
                    ← O'yinlarga qaytish
                </button>
            </div>`;
    }

    function frame() {
        if (!paused) {
            const sp = 1.9;
            wolf.vx = (keys.right ? sp : 0) - (keys.left ? sp : 0);
            wolf.vy = (keys.down ? sp : 0) - (keys.up ? sp : 0);
            if (wolf.vx) wolf.dir = wolf.vx > 0 ? 1 : -1;
            wolf.x = Math.max(14, Math.min(W - 14, wolf.x + wolf.vx));
            wolf.y = Math.max(14, Math.min(H - 14, wolf.y + wolf.vy));

            for (const s of spots) {
                if (s.done) continue;
                const d = Math.hypot(s.x - wolf.x, s.y - wolf.y);
                if (d < 22) { openTask(s); break; }
            }
        }

        x.clearRect(0, 0, W, H);

        // O'rmon foni
        const g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#0f172a');
        g.addColorStop(1, '#122019');
        x.fillStyle = g;
        x.fillRect(0, 0, W, H);

        x.font = '20px system-ui, sans-serif';
        x.textAlign = 'center';
        for (const t of trees) x.fillText('🌲', t.x, t.y);

        const pulse = 6 + Math.sin(Date.now() / 260) * 2.5;
        for (const s of spots) {
            if (s.done) {
                x.globalAlpha = 0.35;
                x.font = '18px system-ui, sans-serif';
                x.fillText('✅', s.x, s.y + 6);
                x.globalAlpha = 1;
                continue;
            }
            x.beginPath();
            x.arc(s.x, s.y, pulse + 8, 0, Math.PI * 2);
            x.fillStyle = 'rgba(167,139,250,0.18)';
            x.fill();
            x.beginPath();
            x.arc(s.x, s.y, pulse, 0, Math.PI * 2);
            x.fillStyle = '#a78bfa';
            x.fill();
            x.font = '13px system-ui, sans-serif';
            x.fillStyle = '#0b1220';
            x.fillText('?', s.x, s.y + 4.5);
        }

        x.save();
        x.translate(wolf.x, wolf.y);
        x.scale(wolf.dir, 1);
        x.font = '30px system-ui, sans-serif';
        x.fillText('🐺', 0, 10);
        x.restore();

        wolfLoop = requestAnimationFrame(frame);
    }
    frame();
}

/* ===========================================================================
 * 2) XOTIRA KARTALARI
 *
 * Juftliklar ma'noli: "1991" ↔ "O'zbekiston mustaqilligi". Shuning uchun
 * o'yin faqat xotirani emas, bilimni ham ishlatadi — va bilmagan bola
 * o'ynab yurib eslab qoladi.
 * ======================================================================== */

function startMemoryGame(stage) {
    stage.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <button onclick="closeGame()" class="text-[11px] font-bold text-indigo-300">← O'yinlar</button>
            <div class="text-[11px] font-bold text-white">🃏 Xotira Kartalari</div>
            <span class="w-14"></span>
        </div>
        <div class="text-[11px] text-slate-300 mb-2">Mavzuni tanla:</div>
        <div class="grid grid-cols-2 gap-2" id="deckList">
            ${MEMORY_DECKS.map(d => `
                <button onclick="playMemoryDeck('${d.id}')" class="p-3 rounded-2xl bg-slate-900/70 border border-slate-700 hover:border-indigo-500/60 transition text-left">
                    <div class="text-xl">${d.emoji}</div>
                    <div class="text-[11px] font-bold text-white mt-1">${d.name}</div>
                    <div class="text-[9px] text-slate-400">${d.pairs.length} juft</div>
                </button>`).join('')}
        </div>`;
}

function playMemoryDeck(deckId) {
    const deck = MEMORY_DECKS.find(d => d.id === deckId);
    const stage = document.getElementById('gameStage');
    if (!deck || !stage) return;

    // Har safar 6 juft — 12 karta telefon ekraniga sig'adi va o'yin
    // 2-3 daqiqada tugaydi. Hammasi qo'yilsa, bola zerikib tashlab ketardi.
    const chosen = deck.pairs.slice().sort(() => Math.random() - 0.5).slice(0, 6);
    const cards = [];
    chosen.forEach((p, i) => {
        cards.push({ pair: i, text: p[0] });
        cards.push({ pair: i, text: p[1] });
    });
    cards.sort(() => Math.random() - 0.5);

    let open = [];
    let matched = 0;
    let moves = 0;
    let lock = false;

    stage.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <button onclick="startMemoryGame(document.getElementById('gameStage'))" class="text-[11px] font-bold text-indigo-300">← Mavzular</button>
            <div class="text-[11px] font-bold text-white">${deck.emoji} ${deck.name}</div>
            <div class="text-[10px] text-amber-300 font-mono" id="memMoves">0</div>
        </div>
        <div class="grid grid-cols-3 gap-2" id="memGrid"></div>
        <div id="memDone" class="hidden mt-3 p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-center space-y-2"></div>`;

    const grid = document.getElementById('memGrid');
    grid.innerHTML = cards.map((c, i) => `
        <button data-i="${i}" class="mem-card h-20 rounded-xl bg-slate-800 border border-slate-700 text-[10px] font-bold text-white p-1.5 leading-tight flex items-center justify-center text-center transition">
            <span class="text-lg">❓</span>
        </button>`).join('');

    const paint = (btn, card, state) => {
        if (state === 'open') {
            btn.innerHTML = `<span>${escapeHtml(card.text)}</span>`;
            btn.className = 'mem-card h-20 rounded-xl bg-indigo-600/30 border border-indigo-400 text-[10px] font-bold text-white p-1.5 leading-tight flex items-center justify-center text-center transition';
        } else if (state === 'matched') {
            btn.innerHTML = `<span>${escapeHtml(card.text)}</span>`;
            btn.className = 'mem-card h-20 rounded-xl bg-emerald-600/25 border border-emerald-400/60 text-[10px] font-bold text-emerald-100 p-1.5 leading-tight flex items-center justify-center text-center';
            btn.disabled = true;
        } else {
            btn.innerHTML = '<span class="text-lg">❓</span>';
            btn.className = 'mem-card h-20 rounded-xl bg-slate-800 border border-slate-700 text-[10px] font-bold text-white p-1.5 leading-tight flex items-center justify-center text-center transition';
        }
    };

    grid.querySelectorAll('.mem-card').forEach(btn => {
        btn.onclick = () => {
            if (lock) return;
            const i = Number(btn.getAttribute('data-i'));
            if (open.find(o => o.i === i)) return;

            paint(btn, cards[i], 'open');
            open.push({ i, btn });

            if (open.length === 2) {
                moves++;
                document.getElementById('memMoves').textContent = moves;
                const [a, b] = open;

                if (cards[a.i].pair === cards[b.i].pair) {
                    paint(a.btn, cards[a.i], 'matched');
                    paint(b.btn, cards[b.i], 'matched');
                    matched++;
                    open = [];
                    if (typeof tg !== 'undefined' && tg && tg.HapticFeedback) {
                        tg.HapticFeedback.impactOccurred('light');
                    }
                    if (matched === chosen.length) {
                        const rekord = saveBest('memory', moves, true);
                        const done = document.getElementById('memDone');
                        done.classList.remove('hidden');
                        done.innerHTML = `
                            <div class="text-2xl">🎉</div>
                            <div class="text-sm font-black text-white">${moves} yurishda topding!</div>
                            ${rekord ? '<div class="text-[11px] text-amber-300 font-bold">🏆 Yangi rekord!</div>' : ''}
                            <button onclick="playMemoryDeck('${deck.id}')" class="w-full py-2 rounded-xl bg-emerald-500/25 border border-emerald-500/50 text-emerald-100 text-[11px] font-bold">🔁 Yana</button>
                            <button onclick="startMemoryGame(document.getElementById('gameStage'))" class="w-full py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-bold">← Boshqa mavzu</button>`;
                        done.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                } else {
                    lock = true;
                    setTimeout(() => {
                        paint(a.btn, cards[a.i], 'closed');
                        paint(b.btn, cards[b.i], 'closed');
                        open = [];
                        lock = false;
                    }, 750);
                }
            }
        };
    });
}

/* ===========================================================================
 * 3) OILAVIY VIKTORINA
 *
 * Yagona onlayn o'yin — chunki uning butun ma'nosi boshqa odam bilan
 * o'ynashda. Lekin u ham REAL VAQTLI emas: ota-ona ishda, bola maktabda
 * javob beradi, keyin natijani solishtiradi. Real vaqtli qilinganda o'yin
 * deyarli hech qachon boshlanmasdi — ikkovi bir vaqtda bo'sh bo'lishi kerak
 * bo'lardi.
 *
 * To'g'ri javoblar serverda qoladi. Bu yerdagi kod ularni bilmaydi — javob
 * yuborilgandan keyingina ko'radi.
 * ======================================================================== */

const QUIZ_CATEGORIES = [
    { id: 'maktab',     name: 'Maktab',          emoji: '📚', desc: 'Sinfingga mos fanlar' },
    { id: 'fikrlash',   name: 'Fikrlash',        emoji: '🧠', desc: 'Mantiq, yodlash emas' },
    { id: 'hayot',      name: 'Hayot savollari', emoji: '💭', desc: "To'g'ri javobi yo'q" },
    { id: 'ozbekiston', name: "O'zbekiston",     emoji: '🇺🇿', desc: 'Tarix va madaniyat' }
];

let quizState = null;

function startQuiz(stage) {
    stage.innerHTML =
        '<div class="flex items-center justify-between mb-2">' +
            '<button onclick="closeGame()" class="text-[11px] font-bold text-indigo-300">← O\'yinlar</button>' +
            '<div class="text-[11px] font-bold text-white">🧩 Oilaviy Viktorina</div>' +
            '<span class="w-14"></span>' +
        '</div>' +
        '<div id="quizBody"><div class="text-[10px] text-slate-500">Yuklanmoqda...</div></div>';
    renderQuizHome();
}

function quizCatName(id) {
    const c = QUIZ_CATEGORIES.find(x => x.id === id);
    return c ? c.name : id;
}

async function renderQuizHome() {
    const body = document.getElementById('quizBody');
    if (!body) return;

    let open = [];
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'quiz_open_rounds' })
        });
        const d = await resp.json();
        if (d.ok) open = d.rounds || [];
    } catch (e) { console.error('quiz_open_rounds:', e); }

    // Meni kutayotganlar: kimdir boshlagan, men hali javob bermaganman.
    const waiting = open.filter(r => !r.answered);
    const done = open.filter(r => r.answered && r.results.length > 1);

    let html = '';

    if (waiting.length) {
        html += '<div class="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/40 space-y-2 mb-3">' +
            '<div class="text-[11px] font-bold text-amber-200">⏳ Seni kutmoqda</div>' +
            waiting.map(r =>
                '<button onclick="loadQuizRound(\'' + r.roundId + '\')" class="w-full text-left p-2.5 rounded-xl bg-slate-900/70 border border-slate-700 hover:border-amber-500/60 transition">' +
                    '<div class="text-[11px] font-bold text-white">' + quizCatName(r.category) + ' · ' + r.count + ' savol</div>' +
                    '<div class="text-[9px] text-slate-400">Javob berib, natijalarni solishtir</div>' +
                '</button>').join('') +
            '</div>';
    }

    html += '<div class="text-[11px] text-slate-300 mb-2">Yangi viktorina boshla:</div>' +
        '<div class="grid grid-cols-2 gap-2">' +
        QUIZ_CATEGORIES.map(c =>
            '<button onclick="createQuiz(\'' + c.id + '\')" class="p-3 rounded-2xl bg-slate-900/70 border border-slate-700 hover:border-indigo-500/60 transition text-left">' +
                '<div class="text-xl">' + c.emoji + '</div>' +
                '<div class="text-[11px] font-bold text-white mt-1">' + c.name + '</div>' +
                '<div class="text-[9px] text-slate-400">' + c.desc + '</div>' +
            '</button>').join('') +
        '</div>';

    if (done.length) {
        html += '<div class="mt-3 pt-3 border-t border-slate-800 space-y-1.5">' +
            '<div class="text-[11px] font-bold text-slate-300">📊 Oxirgi natijalar</div>' +
            done.slice(0, 5).map(r =>
                '<div class="flex items-center justify-between text-[10px]">' +
                    '<span class="text-slate-400">' + quizCatName(r.category) + '</span>' +
                    '<span class="text-slate-200 font-bold">' +
                        r.results.map(x => escapeHtml(x.name || '?') + ' ' + x.score + '/' + x.total).join(' · ') +
                    '</span>' +
                '</div>').join('') +
            '</div>';
    }

    html += '<div class="mt-3 text-[9px] text-slate-500 leading-relaxed">' +
        'Savollarni AI sinfingga qarab yozadi. «Hayot savollari»da to\'g\'ri javob yo\'q — ' +
        'u ota-onang bilan fikringizni solishtirish uchun.</div>';

    body.innerHTML = html;
}

async function createQuiz(category) {
    const body = document.getElementById('quizBody');
    if (body) body.innerHTML = '<div class="text-[11px] text-slate-400 text-center py-6">🧩 Savollar tayyorlanmoqda...</div>';
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'quiz_create', category: category, grade: quizGuessGrade() })
        });
        const d = await resp.json();
        if (!d.ok) {
            if (body) body.innerHTML = '<div class="text-[11px] text-rose-300 text-center py-6">' + escapeHtml(d.error || 'Boshlab bo\'lmadi') + '</div>';
            return;
        }
        quizState = { roundId: d.roundId, questions: d.questions, scored: d.scored, i: 0, answers: [] };
        renderQuizQuestion();
    } catch (e) {
        console.error('quiz_create:', e);
        if (body) body.innerHTML = '<div class="text-[11px] text-rose-300 text-center py-6">Server javob bermadi.</div>';
    }
}

/** Boshqa oila a'zosi boshlagan raundga qo'shilish. */
async function loadQuizRound(roundId) {
    const body = document.getElementById('quizBody');
    if (body) body.innerHTML = '<div class="text-[11px] text-slate-400 text-center py-6">🧩 Yuklanmoqda...</div>';
    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'quiz_round_questions', roundId: roundId })
        });
        const d = await resp.json();
        if (!d.ok) { renderQuizHome(); return; }
        quizState = { roundId: roundId, questions: d.questions, scored: d.scored, i: 0, answers: [] };
        renderQuizQuestion();
    } catch (e) {
        console.error('loadQuizRound:', e);
        renderQuizHome();
    }
}

/** Sinfni paneldagi ma'lumotdan olamiz; topilmasa 6-sinf. */
function quizGuessGrade() {
    try {
        if (typeof childrenDatabase !== 'undefined' && typeof currentChildKey !== 'undefined') {
            const c = childrenDatabase[currentChildKey];
            if (c && c.grade) return Number(c.grade) || 6;
        }
    } catch (e) {}
    return 6;
}

function renderQuizQuestion() {
    const body = document.getElementById('quizBody');
    const s = quizState;
    if (!body || !s) return;
    const q = s.questions[s.i];

    body.innerHTML =
        '<div class="flex items-center justify-between mb-2">' +
            '<span class="text-[10px] text-slate-400">Savol ' + (s.i + 1) + ' / ' + s.questions.length + '</span>' +
            '<span class="text-[10px] text-slate-500">' + (s.scored ? 'To\'g\'ri javobi bor' : 'To\'g\'ri javobi yo\'q') + '</span>' +
        '</div>' +
        '<div class="h-1 rounded bg-slate-800 mb-3">' +
            '<div class="h-1 rounded bg-indigo-400" style="width:' + ((s.i / s.questions.length) * 100) + '%"></div>' +
        '</div>' +
        '<div class="text-[13px] text-white font-bold leading-relaxed mb-3">' + escapeHtml(q.q) + '</div>' +
        '<div class="space-y-2" id="quizOptions">' +
            q.a.map((o, i) =>
                '<button data-i="' + i + '" class="w-full text-left p-3 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-indigo-500 text-[11px] text-slate-200 transition">' +
                    escapeHtml(o) +
                '</button>').join('') +
        '</div>';

    body.querySelectorAll('#quizOptions button').forEach(b => {
        b.onclick = () => {
            s.answers[s.i] = Number(b.getAttribute('data-i'));
            if (typeof tg !== 'undefined' && tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
            s.i++;
            if (s.i >= s.questions.length) submitQuiz();
            else renderQuizQuestion();
        };
    });
}

async function submitQuiz() {
    const body = document.getElementById('quizBody');
    const s = quizState;
    if (!body || !s) return;
    body.innerHTML = '<div class="text-[11px] text-slate-400 text-center py-6">Tekshirilmoqda...</div>';

    try {
        const resp = await fetch(QALQON_BOT_FN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'quiz_submit', roundId: s.roundId, answers: s.answers })
        });
        const d = await resp.json();
        if (!d.ok) {
            body.innerHTML = '<div class="text-[11px] text-rose-300 text-center py-6">' + escapeHtml(d.error || 'Xato') + '</div>';
            return;
        }

        const others = (d.participants || []).filter(p => !p.me);

        let head = '<div class="text-center space-y-1 mb-3">' +
            '<div class="text-3xl">' + (d.scored ? (d.score >= d.total - 1 ? '🏆' : '🧩') : '💭') + '</div>' +
            (d.scored
                ? '<div class="text-lg font-black text-white">' + d.score + ' / ' + d.total + '</div>'
                : '<div class="text-sm font-black text-white">Javoblaring saqlandi</div>') +
            (others.length
                ? '<div class="text-[11px] text-slate-300">' +
                    others.map(o => escapeHtml(o.name || '?') + (d.scored ? ': ' + o.score + '/' + o.total : ' ham javob berdi')).join(' · ') +
                  '</div>'
                : '<div class="text-[10px] text-slate-400">Oilangdan yana kim javob berishini kutamiz.</div>') +
            '</div>';

        const rows = d.review.map((r, i) => {
            const mineTxt = (r.chosen != null && r.a[r.chosen]) ? r.a[r.chosen] : '—';
            if (r.correct == null) {
                return '<div class="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">' +
                    '<div class="text-[11px] text-slate-200 font-bold">' + (i + 1) + '. ' + escapeHtml(r.q) + '</div>' +
                    '<div class="text-[10px] text-indigo-300 mt-1">Sening javobing: ' + escapeHtml(mineTxt) + '</div>' +
                '</div>';
            }
            const ok = r.chosen === r.correct;
            return '<div class="p-2.5 rounded-xl ' + (ok ? 'bg-emerald-950/40 border border-emerald-500/30' : 'bg-rose-950/30 border border-rose-500/30') + '">' +
                '<div class="text-[11px] text-slate-200 font-bold">' + (ok ? '✅' : '❌') + ' ' + (i + 1) + '. ' + escapeHtml(r.q) + '</div>' +
                '<div class="text-[10px] text-slate-300 mt-1">Sen: ' + escapeHtml(mineTxt) +
                    (ok ? '' : ' · To\'g\'ri: <b>' + escapeHtml(r.a[r.correct]) + '</b>') + '</div>' +
                (r.why ? '<div class="text-[9px] text-slate-400 mt-0.5">' + escapeHtml(r.why) + '</div>' : '') +
            '</div>';
        }).join('');

        body.innerHTML = head + '<div class="space-y-2">' + rows + '</div>' +
            '<button onclick="renderQuizHome()" class="w-full mt-3 py-2 rounded-xl bg-indigo-500/25 border border-indigo-500/50 text-indigo-100 text-[11px] font-bold">' +
                '← Viktorinaga qaytish' +
            '</button>';
    } catch (e) {
        console.error('quiz_submit:', e);
        body.innerHTML = '<div class="text-[11px] text-rose-300 text-center py-6">Server javob bermadi.</div>';
    }
}
