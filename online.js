/* ============================================================================
 * QALQON AI — DO'ST BILAN ONLINE O'YINLAR (Mini App tomoni)
 *
 * Viktorina dueli, Poyga va Tetris "arvoh" bilan, To'rtta qator, Dengiz jangi.
 *
 * Bu fayl faqat KO'RSATADI va bosishlarni yuboradi. Natijani server
 * hisoblaydi: Poyga/Tetrisda bosishlar yozuvi sim.js orqali serverda qayta
 * o'ynatiladi (shuning uchun bu yerda ham aynan o'sha sim.js ishlatiladi),
 * viktorinada vaqtni server o'lchaydi, Dengiz jangida raqib kemalari umuman
 * kelmaydi.
 *
 * Bolalar xavfsizligi: raqib faqat taklif havolasi orqali, chat yo'q,
 * haqiqiy ism o'rniga bo'ri ismi.
 * ========================================================================= */

const ONLINE_GAMES = [
    { id: 'quiz', emoji: '🧩', title: 'Viktorina dueli', desc: '8 savol — kim tez va to\'g\'ri' },
    { id: 'race', emoji: '🏎️', title: 'Poyga', desc: 'Do\'stingning arvohini quvib o\'t' },
    { id: 'tetris', emoji: '🧱', title: 'Tetris', desc: 'Bir xil shakllar — kim ko\'p ochko' },
    { id: 'connect4', emoji: '🔴', title: "To'rtta qator", desc: 'Navbatma-navbat, to\'rttani qatorga' },
    { id: 'battleship', emoji: '🚢', title: 'Dengiz jangi', desc: 'Do\'stingning kemalarini cho\'ktir' }
];

let onlineMatch = null;      // ochiq o'yin holati (serverdan)
let onlinePoll = null;       // navbat kutilayotganda so'rov taymeri
let onlineLoop = null;       // Poyga/Tetris kadr tsikli
let onlineCleanup = [];

function onlineCall(body) { return shopCall(body); }

function stopOnline() {
    if (onlinePoll) { clearInterval(onlinePoll); onlinePoll = null; }
    if (onlineLoop) { cancelAnimationFrame(onlineLoop); onlineLoop = null; }
    onlineCleanup.forEach(fn => { try { fn(); } catch (e) {} });
    onlineCleanup = [];
    onlineMatch = null;
}

function onlineStage() {
    const stage = document.getElementById('gameStage');
    const grid = document.getElementById('gamesGrid');
    const intro = document.getElementById('gamesIntro');
    if (grid) grid.classList.add('hidden');
    if (intro) intro.classList.add('hidden');
    if (stage) stage.classList.remove('hidden');
    return stage;
}

/* ------------------------------------------------------------------ MARKAZ */

/** O'yinlar ro'yxatining tepasidagi "Do'st bilan o'ynash" bo'limi (faqat bola). */
async function renderOnlineHub() {
    const hub = document.getElementById('onlineHub');
    if (!hub) return;
    if (currentAppRole !== 'child') { hub.innerHTML = ''; return; }
    hub.innerHTML = `<div class="p-3.5 rounded-2xl bg-gradient-to-br from-sky-600/20 to-violet-700/20 border border-sky-500/40 space-y-2.5">
        <div class="flex items-center gap-2">
            <span class="text-xl">🌐</span>
            <div>
                <div class="text-xs font-bold text-sky-100">Do'st bilan o'ynash</div>
                <div class="text-[10px] text-slate-400">Havola yuborasan — do'sting qo'shiladi. Chat yo'q, faqat o'yin.</div>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-1.5">
            ${ONLINE_GAMES.map(g => `<button onclick="createMatch('${g.id}')" class="p-2 rounded-xl bg-slate-900/70 border border-slate-700 hover:border-sky-500/60 text-left">
                <div class="text-[11px] font-bold text-white">${g.emoji} ${g.title}</div>
                <div class="text-[9px] text-slate-400 leading-tight">${g.desc}</div>
            </button>`).join('')}
        </div>
        <div id="onlineMyMatches" class="space-y-1.5"><div class="text-[10px] text-slate-500">O'yinlaring yuklanmoqda...</div></div>
    </div>`;
    try {
        const r = await onlineCall({ type: 'match_list' });
        const box = document.getElementById('onlineMyMatches');
        if (!box) return;
        const list = (r && r.matches) || [];
        if (!list.length) { box.innerHTML = '<div class="text-[10px] text-slate-500">Hali o\'yin yo\'q — yuqoridan birini tanla.</div>'; return; }
        box.innerHTML = '<div class="text-[10px] font-bold text-slate-300 pt-1">Mening o\'yinlarim</div>' + list.slice(0, 8).map(m => {
            let badge = '', cls = 'text-slate-400';
            if (m.status === 'open') { badge = m.needsMe ? "O'ynashing mumkin" : "Do'st kutilmoqda"; cls = m.needsMe ? 'text-amber-300' : 'text-slate-400'; }
            else if (m.status === 'active') { badge = m.needsMe ? '👉 Navbat senda' : 'Do\'sting o\'ylayapti'; cls = m.needsMe ? 'text-amber-300' : 'text-slate-400'; }
            else if (m.status === 'finished') { badge = m.winner === 'draw' ? '🤝 Durang' : m.winner === m.me ? '🏆 Yutding' : 'Yutqazding'; cls = m.winner === m.me ? 'text-emerald-300' : 'text-slate-400'; }
            else badge = 'Muddati o\'tgan';
            return `<button onclick="openMatch('${m.id}')" class="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border ${m.needsMe && m.status !== 'finished' ? 'border-amber-500/50' : 'border-slate-800'} text-left">
                <span class="text-lg">${m.emoji}</span>
                <span class="flex-1 min-w-0">
                    <span class="block text-[11px] font-bold text-white truncate">${escapeHtml(m.title)}${m.rivalName ? ' · ' + escapeHtml(m.rivalName) : ''}</span>
                    <span class="block text-[9px] ${cls}">${badge}</span>
                </span>
                <span class="text-slate-500">›</span>
            </button>`;
        }).join('');
    } catch (e) {
        console.error('match_list:', e);
    }
}

async function createMatch(game) {
    const g = ONLINE_GAMES.find(x => x.id === game);
    const stage = onlineStage();
    if (stage) stage.innerHTML = `<div class="p-6 text-center text-[11px] text-slate-400">${g ? g.emoji : '🎮'} Tayyorlanmoqda...</div>`;
    try {
        const r = await onlineCall({ type: 'match_create', game });
        if (!r.ok) { shopAlert(r.error || "O'yin ochilmadi."); closeGame(); return; }
        onlineMatch = r.match;
        renderMatch();
        shareMatch();
    } catch (e) {
        console.error('match_create:', e);
        shopAlert('Server javob bermadi.');
        closeGame();
    }
}

function shareMatch() {
    const m = onlineMatch;
    if (!m) return;
    const text = `${m.emoji} Qalqon'da "${m.title}" o'ynaymizmi? Havolani bos va qo'shil!`;
    const url = 'https://t.me/share/url?url=' + encodeURIComponent(m.link) + '&text=' + encodeURIComponent(text);
    if (tg && tg.openTelegramLink) tg.openTelegramLink(url);
    else window.open(url, '_blank');
}

async function openMatch(id) {
    stopOnline();
    const stage = onlineStage();
    if (stage) stage.innerHTML = '<div class="p-6 text-center text-[11px] text-slate-400">Yuklanmoqda...</div>';
    try {
        const r = await onlineCall({ type: 'match_state', id });
        if (!r.ok) { shopAlert(r.error || "O'yin ochilmadi."); closeGame(); return; }
        onlineMatch = r.match;
        renderMatch();
    } catch (e) {
        console.error('match_state:', e);
        shopAlert('Server javob bermadi.');
        closeGame();
    }
}

/** Havolada ?play=KOD bo'lsa — o'yinga qo'shilamiz va darhol ochamiz. */
async function acceptPlayFromUrl() {
    const code = new URLSearchParams(window.location.search).get('play');
    if (!code || currentAppRole !== 'child') return;
    try {
        const r = await onlineCall({ type: 'match_join', code });
        if (!r.ok) { shopAlert(r.error || "O'yinga qo'shilib bo'lmadi."); return; }
        if (typeof openSubpage === 'function') openSubpage('modal-games');
        if (typeof renderGamesGrid === 'function') renderGamesGrid();
        onlineMatch = r.match;
        onlineStage();
        renderMatch();
    } catch (e) {
        console.error('match_join:', e);
    }
}

function startMatchPolling() {
    if (onlinePoll) return;
    onlinePoll = setInterval(async () => {
        if (!onlineMatch || document.hidden) return;
        try {
            const r = await onlineCall({ type: 'match_state', id: onlineMatch.id });
            if (!r.ok || !onlineMatch) return;
            const changed = JSON.stringify([r.match.status, r.match.turn, r.match.updatedAt]) !==
                JSON.stringify([onlineMatch.status, onlineMatch.turn, onlineMatch.updatedAt]);
            onlineMatch = r.match;
            if (changed) renderMatch();
        } catch (e) {}
    }, 4000);
}

/* ----------------------------------------------------------- UMUMIY RAMKA */

function matchHeader(m) {
    return `<div class="flex items-center justify-between mb-2">
        <button onclick="closeGame()" class="text-[11px] font-bold text-indigo-300">← O'yinlar</button>
        <div class="text-[11px] font-bold text-white">${m.emoji} ${escapeHtml(m.title)}</div>
        <div class="text-[10px] text-slate-400 truncate max-w-[35%]">${m.rivalName ? 'vs ' + escapeHtml(m.rivalName) : ''}</div>
    </div>`;
}

function matchBanner(m) {
    if (m.status === 'finished') {
        const won = m.winner === m.me, draw = m.winner === 'draw';
        return `<div class="p-3 rounded-xl text-center border ${won ? 'bg-emerald-600/20 border-emerald-500/50' : draw ? 'bg-slate-800/70 border-slate-600' : 'bg-rose-600/15 border-rose-500/40'}">
            <div class="text-sm font-black text-white">${won ? '🏆 Sen yutding!' : draw ? '🤝 Durang!' : '💪 Bu safar do\'sting yutdi'}</div>
            <button onclick="rematch()" class="mt-2 px-4 py-1.5 rounded-xl bg-sky-500/25 border border-sky-400/50 text-sky-100 text-[11px] font-bold">🔁 Revansh</button>
        </div>`;
    }
    if (m.status === 'expired') return '<div class="p-3 rounded-xl bg-slate-800/70 border border-slate-700 text-center text-[11px] text-slate-300">⌛ Muddati o\'tdi — do\'sting vaqtida qo\'shilmadi.</div>';
    if (m.status === 'cancelled') return '<div class="p-3 rounded-xl bg-slate-800/70 border border-slate-700 text-center text-[11px] text-slate-300">Bu o\'yin bekor qilingan.</div>';
    if (m.status === 'open') {
        return `<div class="p-3 rounded-xl bg-sky-600/15 border border-sky-500/40 text-center space-y-2">
            <div class="text-[11px] text-sky-100">Do'sting havola orqali qo'shilishini kutyapmiz.</div>
            <div class="flex gap-2 justify-center">
                <button onclick="shareMatch()" class="px-3 py-1.5 rounded-xl bg-sky-500/30 border border-sky-400/60 text-sky-50 text-[11px] font-bold">📤 Do'stga yuborish</button>
                ${m.me === 'p1' ? '<button onclick="cancelMatch()" class="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">Bekor qilish</button>' : ''}
            </div>
        </div>`;
    }
    return '';
}

async function rematch() {
    const game = onlineMatch && onlineMatch.game;
    stopOnline();
    if (game) createMatch(game);
}

async function cancelMatch() {
    if (!onlineMatch) return;
    const turnGame = onlineMatch.kind === 'turn' && onlineMatch.status === 'active';
    shopConfirm(turnGame ? "Taslim bo'lasanmi? G'alaba do'stingga beriladi." : 'Taklifni bekor qilasanmi?', async () => {
        const r = await onlineCall({ type: 'match_cancel', id: onlineMatch.id });
        if (!r.ok) { shopAlert(r.error || "Bo'lmadi."); return; }
        onlineMatch = r.match;
        renderMatch();
    });
}

function renderMatch() {
    const m = onlineMatch;
    const stage = document.getElementById('gameStage');
    if (!m || !stage) return;
    if (onlinePoll) { clearInterval(onlinePoll); onlinePoll = null; }
    if (m.game === 'quiz') renderQuizMatch(stage, m);
    if (m.game === 'race' || m.game === 'tetris') renderGhostMatch(stage, m);
    if (m.game === 'connect4') renderConnect4(stage, m);
    if (m.game === 'battleship') renderBattleship(stage, m);
    const waiting = m.status === 'open' || (m.status === 'active' && (m.kind === 'turn' ? !m.myTurn : !m.rivalResult));
    if (waiting) startMatchPolling();
}

/* ------------------------------------------------------- VIKTORINA DUELI */

function renderQuizMatch(stage, m) {
    let body = '';
    if (!m.myResult) {
        body = `<div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 text-center space-y-2">
            <div class="text-4xl">🧩</div>
            <div class="text-[11px] text-slate-300">${m.total} ta savol, har biriga 15 soniya. To'g'ri javob — 100 ochko, tez javob uchun +50 gacha.</div>
            <div class="text-[10px] text-slate-500">Ilovadan chiqsang, savol javobsiz qoladi. Faqat bitta urinish.</div>
            ${m.answered ? `<div class="text-[10px] text-amber-300">${m.answered} ta savolga javob bergansan — davom etamiz.</div>` : ''}
            <button onclick="runQuizDuel()" class="w-full py-2.5 rounded-xl bg-violet-500/30 border border-violet-400/60 text-violet-50 text-xs font-bold">${m.answered ? '▶️ Davom etish' : '▶️ Boshlash'}</button>
        </div>`;
    } else {
        const r = m.rivalResult;
        body = `<div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 space-y-2">
            <div class="flex justify-between text-xs"><span class="text-slate-300">Sen</span><b class="text-white">${m.myResult.score} <span class="text-[10px] text-slate-400">(${m.myResult.correct}/${m.myResult.total})</span></b></div>
            <div class="flex justify-between text-xs border-t border-slate-800 pt-2"><span class="text-slate-300">${escapeHtml(m.rivalName || "Do'sting")}</span>${r ? `<b class="text-white">${r.score} <span class="text-[10px] text-slate-400">(${r.correct}/${r.total})</span></b>` : '<span class="text-[10px] text-slate-500">hali o\'ynamagan</span>'}</div>
        </div>`;
    }
    stage.innerHTML = matchHeader(m) + '<div class="space-y-2.5">' + matchBanner(m) + body + '</div>';
}

async function runQuizDuel() {
    const m = onlineMatch;
    const stage = document.getElementById('gameStage');
    if (!m || !stage) return;
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    let total = 0;
    while (onlineMatch && onlineMatch.id === m.id) {
        const q = await onlineCall({ type: 'match_move', id: m.id, action: 'next' });
        if (!q.ok) { shopAlert(q.error || 'Savol kelmadi.'); break; }
        if (q.done) { onlineMatch = q.match; break; }
        stage.innerHTML = matchHeader(m) + `<div class="space-y-3">
            <div class="flex justify-between text-[11px] text-slate-400"><span>Savol ${q.index + 1} / ${q.total}</span><span class="font-mono font-black text-amber-300" id="qdTimer">15</span></div>
            <div class="h-1.5 rounded-full bg-slate-800 overflow-hidden"><div id="qdBar" class="h-full bg-gradient-to-r from-violet-400 to-rose-500" style="width:100%"></div></div>
            <div class="text-sm font-bold text-white leading-snug">${escapeHtml(q.question.q)}</div>
            <div id="qdOpts" class="grid gap-2">${q.question.a.map((a, i) => `<button data-i="${i}" class="qd-opt w-full text-left px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white">${escapeHtml(a)}</button>`).join('')}</div>
            <div id="qdFb" class="text-[11px] text-slate-300 min-h-[2rem]"></div>
            <div class="text-right text-[11px] text-slate-400">Ochko: <b class="text-white" id="qdTotal">${total}</b></div>
        </div>`;
        const choice = await new Promise(resolve => {
            const started = Date.now();
            let done = false;
            const finish = v => { if (done) return; done = true; clearInterval(iv); document.removeEventListener('visibilitychange', onHide); resolve(v); };
            const onHide = () => { if (document.hidden) finish(-1); };
            document.addEventListener('visibilitychange', onHide);
            const iv = setInterval(() => {
                const left = Math.max(0, q.seconds - (Date.now() - started) / 1000);
                const t = document.getElementById('qdTimer'); if (t) t.textContent = Math.ceil(left);
                const b = document.getElementById('qdBar'); if (b) b.style.width = (left / q.seconds * 100) + '%';
                if (left <= 0) finish(-1);
            }, 150);
            stage.querySelectorAll('.qd-opt').forEach(b => { b.onclick = () => finish(Number(b.dataset.i)); });
        });
        stage.querySelectorAll('.qd-opt').forEach(b => { b.disabled = true; });
        const a = await onlineCall({ type: 'match_move', id: m.id, action: 'answer', choice });
        if (!a.ok) { shopAlert(a.error || 'Javob qabul qilinmadi.'); break; }
        total += a.points || 0;
        stage.querySelectorAll('.qd-opt').forEach(b => {
            const i = Number(b.dataset.i);
            if (i === a.correctIndex) b.classList.add('bg-emerald-600/40', 'border-emerald-400');
            else if (i === choice) b.classList.add('bg-rose-600/40', 'border-rose-400');
        });
        const fb = document.getElementById('qdFb');
        if (fb) fb.textContent = (a.correct ? `✅ +${a.points} ` : a.timedOut || choice < 0 ? '⏰ Vaqt tugadi. ' : '❌ ') + (a.why || '');
        const tt = document.getElementById('qdTotal'); if (tt) tt.textContent = total;
        if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred(a.correct ? 'success' : 'error');
        await sleep(1500);
        if (a.done) { onlineMatch = a.match; break; }
    }
    renderMatch();
    renderOnlineHub();
}

/* -------------------------------------------- POYGA va TETRIS (arvoh bilan) */

function renderGhostMatch(stage, m) {
    const Sim = window.QalqonSim;
    let body = '';
    if (!m.myResult && m.status !== 'expired' && m.status !== 'cancelled') {
        const ghostTxt = m.rivalResult
            ? `👻 Do'stingning arvohi <b>${m.rivalResult.score}</b> ochko to'plagan — undan o'zib ket!`
            : "Sen birinchisan: do'sting keyin sening arvohing bilan poyga qiladi.";
        body = `<div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 text-center space-y-2">
            <div class="text-4xl">${m.emoji}</div>
            <div class="text-[11px] text-slate-300">${ghostTxt}</div>
            <div class="text-[10px] text-slate-500">Ikkalangizda ${m.game === 'race' ? 'trassa' : 'shakllar ketma-ketligi'} bir xil. Faqat <b>bitta urinish</b> — o'yinni yarim yo'lda tashlasang, natija 0.</div>
            ${m.myStarted ? '<div class="text-[10px] text-rose-300">Urinish oldin boshlangan va tugatilmagan edi. Qayta boshlasang, natija 0 deb yoziladi.</div>' : ''}
            <button onclick="startGhostRun()" ${Sim ? '' : 'disabled'} class="w-full py-2.5 rounded-xl bg-sky-500/30 border border-sky-400/60 text-sky-50 text-xs font-bold">${m.myStarted ? 'Natijani yopish' : '▶️ Boshlash'}</button>
        </div>`;
    } else if (m.myResult) {
        const r = m.rivalResult;
        body = `<div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 space-y-2">
            <div class="flex justify-between text-xs"><span class="text-slate-300">Sen</span><b class="text-white">${m.myResult.score}</b></div>
            <div class="flex justify-between text-xs border-t border-slate-800 pt-2"><span class="text-slate-300">${escapeHtml(m.rivalName || "Do'sting")}</span>${r ? `<b class="text-white">${r.score}</b>` : '<span class="text-[10px] text-slate-500">hali o\'ynamagan</span>'}</div>
        </div>`;
    }
    stage.innerHTML = matchHeader(m) + '<div class="space-y-2.5">' + matchBanner(m) + body + '</div>';
}

async function startGhostRun() {
    const m = onlineMatch;
    if (!m) return;
    const r = await onlineCall({ type: 'match_move', id: m.id, action: 'start' });
    if (!r.ok) {
        if (r.match) onlineMatch = r.match;
        if (!r.abandoned) shopAlert(r.error || "Boshlab bo'lmadi.");
        renderMatch();
        return;
    }
    onlineMatch = r.match;
    if (m.game === 'race') runGhostRace(onlineMatch);
    else runGhostTetris(onlineMatch);
}

async function finishGhostRun(m, log, score) {
    if (onlineLoop) { cancelAnimationFrame(onlineLoop); onlineLoop = null; }
    onlineCleanup.forEach(fn => { try { fn(); } catch (e) {} });
    onlineCleanup = [];
    let tries = 0;
    while (tries++ < 4) {
        try {
            const r = await onlineCall({ type: 'match_move', id: m.id, action: 'finish', log, score });
            if (r.match) onlineMatch = r.match;
            break;
        } catch (e) {
            await new Promise(z => setTimeout(z, 2000));
        }
    }
    renderMatch();
    renderOnlineHub();
}

/** Qat'iy 60 qadam/soniya — ekran chastotasidan qat'i nazar. */
function fixedLoop(step, draw, isOver, onOver) {
    let last = performance.now(), acc = 0;
    const STEP = 1000 / 60;
    const frame = (now) => {
        acc += Math.min(250, now - last);
        last = now;
        let n = 0;
        while (acc >= STEP && n < 12 && !isOver()) { step(); acc -= STEP; n++; }
        draw();
        if (isOver()) { onOver(); return; }
        onlineLoop = requestAnimationFrame(frame);
    };
    onlineLoop = requestAnimationFrame(frame);
}

function runGhostRace(m) {
    const Sim = window.QalqonSim;
    const R = Sim.RACE;
    const stage = document.getElementById('gameStage');
    const cssW = Math.min(stage.clientWidth || 320, 360);
    stage.innerHTML = matchHeader(m) + `
        <div class="flex justify-between text-[11px] mb-1"><span class="text-cyan-300 font-bold">Sen: <span id="grMe">0</span></span><span class="text-fuchsia-300 font-bold" id="grGhost">${m.ghost ? "👻 Do'sting: 0" : ''}</span></div>
        <canvas id="grCanvas" style="width:${cssW}px;height:${Math.round(cssW * R.H / R.W)}px;display:block;margin:0 auto;border-radius:16px;touch-action:none"></canvas>
        <div class="grid grid-cols-2 gap-2 mt-2 max-w-[240px] mx-auto select-none" id="grPad">
            <button data-d="-1" class="py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-lg">←</button>
            <button data-d="1" class="py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-lg">→</button>
        </div>`;
    const canvas = document.getElementById('grCanvas');
    const dpr = window.devicePixelRatio || 1;
    const scale = cssW / R.W;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssW * R.H / R.W * dpr);
    const x = canvas.getContext('2d');
    x.scale(dpr * scale, dpr * scale);

    const s = Sim.raceNew(m.seed);
    const log = [];
    const ghost = m.ghost ? { log: m.ghost.log || [], ticks: m.ghost.ticks, lane: 1, x: R.laneW * 1.5, i: 0 } : null;

    const move = (d) => {
        if (s.over) return;
        const nl = Math.max(0, Math.min(R.LANES - 1, s.lane + d));
        if (nl === s.lane) return;
        Sim.raceSetLane(s, nl);
        log.push([s.tick, nl]);
    };
    const keyFn = (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
    };
    window.addEventListener('keydown', keyFn);
    onlineCleanup.push(() => window.removeEventListener('keydown', keyFn));
    document.querySelectorAll('#grPad button').forEach(b => {
        const d = Number(b.dataset.d);
        const go = (ev) => { ev.preventDefault(); move(d); };
        b.addEventListener('touchstart', go, { passive: false });
        b.addEventListener('mousedown', go);
    });
    let sx = 0;
    canvas.addEventListener('pointerdown', e => { sx = e.offsetX; });
    canvas.addEventListener('pointerup', e => {
        const dx = e.offsetX - sx;
        if (Math.abs(dx) > 20) move(dx > 0 ? 1 : -1);
        else move(e.offsetX > cssW / 2 ? 1 : -1);
    });

    const car = (cx, cy, color, alpha) => {
        const w = R.carW, h = R.carH;
        x.globalAlpha = alpha;
        x.fillStyle = color;
        if (x.roundRect) { x.beginPath(); x.roundRect(cx - w / 2, cy - h / 2, w, h, 7); x.fill(); } else x.fillRect(cx - w / 2, cy - h / 2, w, h);
        x.fillStyle = 'rgba(15,23,42,0.75)';
        x.fillRect(cx - w * 0.32, cy - h * 0.28, w * 0.64, h * 0.22);
        x.fillRect(cx - w * 0.32, cy + h * 0.08, w * 0.64, h * 0.18);
        x.globalAlpha = 1;
    };

    const step = () => {
        Sim.raceStep(s);
        if (ghost && s.tick <= ghost.ticks) {
            while (ghost.i < ghost.log.length && Number(ghost.log[ghost.i][0]) < s.tick) {
                ghost.lane = Number(ghost.log[ghost.i][1]); ghost.i++;
            }
            ghost.x += (R.laneW * (ghost.lane + 0.5) - ghost.x) * 0.25;
        }
    };
    const draw = () => {
        const W = R.W, H = R.H, laneW = R.laneW;
        x.fillStyle = '#1e293b'; x.fillRect(0, 0, W, H);
        x.fillStyle = '#0f172a'; x.fillRect(laneW * 0.06, 0, W - laneW * 0.12, H);
        x.fillStyle = '#134e4a'; x.fillRect(0, 0, laneW * 0.06, H); x.fillRect(W - laneW * 0.06, 0, laneW * 0.06, H);
        x.strokeStyle = 'rgba(226,232,240,0.5)'; x.lineWidth = 3; x.setLineDash([22, 24]); x.lineDashOffset = -s.road;
        for (let i = 1; i < R.LANES; i++) { x.beginPath(); x.moveTo(laneW * i, 0); x.lineTo(laneW * i, H); x.stroke(); }
        x.setLineDash([]);
        for (const o of s.obstacles) car(laneW * (o.lane + 0.5), o.y, o.c, 1);
        const myY = H - R.carH * 0.9;
        car(s.carX, myY, '#22d3ee', 1);
        // Arvoh bola mashinasining USTIDAN chiziladi: bir yo'lakda bo'lsa
        // ham pushti tus bilan ko'rinib turadi.
        if (ghost) {
            if (s.tick <= ghost.ticks) car(ghost.x, myY, '#e879f9', 0.45);
            else { x.font = '28px system-ui'; x.textAlign = 'center'; x.globalAlpha = Math.max(0, 1 - (s.tick - ghost.ticks) / 90); x.fillText('💥', ghost.x, myY); x.globalAlpha = 1; }
        }
        const me = document.getElementById('grMe'); if (me) me.textContent = Math.floor(s.score);
        const gh = document.getElementById('grGhost');
        if (gh && ghost) gh.textContent = s.tick <= ghost.ticks ? "👻 Do'sting: " + Math.floor(s.score) : "👻 Do'sting to'xtadi: " + (m.rivalResult ? m.rivalResult.score : '');
    };
    fixedLoop(step, draw, () => s.over, () => {
        if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
        finishGhostRun(m, log, Math.floor(s.score));
    });
}

function runGhostTetris(m) {
    const Sim = window.QalqonSim;
    const T = Sim.TETRIS;
    const stage = document.getElementById('gameStage');
    const cssW = Math.min(stage.clientWidth || 320, 320);
    const CELL = Math.floor(cssW / T.COLS);
    const W = CELL * T.COLS, H = CELL * T.ROWS;
    stage.innerHTML = matchHeader(m) + `
        <div class="flex justify-between text-[11px] mb-1 max-w-[${W}px] mx-auto"><span class="text-cyan-300 font-bold">Sen: <span id="gtMe">0</span></span><span class="text-fuchsia-300 font-bold" id="gtGhost">${m.ghost ? "👻 Do'sting: 0" : ''}</span></div>
        <canvas id="gtCanvas" style="width:${W}px;height:${H}px;display:block;margin:0 auto;border-radius:12px;touch-action:none"></canvas>
        <div class="grid grid-cols-4 gap-2 mt-2 max-w-[280px] mx-auto select-none" id="gtPad">
            <button data-a="l" class="py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">←</button>
            <button data-a="rot" class="py-3 rounded-xl bg-indigo-600/40 border border-indigo-500 text-white font-bold">⟳</button>
            <button data-a="r" class="py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">→</button>
            <button data-a="d" class="py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">↓</button>
        </div>`;
    const canvas = document.getElementById('gtCanvas');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const x = canvas.getContext('2d');
    x.scale(dpr, dpr);

    const s = Sim.tetNew(m.seed);
    const log = [];
    const timeline = m.ghost ? (m.ghost.timeline || []) : null;
    let gi = 0, ghostScore = 0;

    const act = (a) => {
        if (s.over) return;
        log.push([s.tick, a]);
        Sim.tetAction(s, a);
    };
    const keyFn = (e) => {
        const a = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'rot', ArrowDown: 'd' }[e.key];
        if (a) { e.preventDefault(); act(a); }
    };
    window.addEventListener('keydown', keyFn);
    onlineCleanup.push(() => window.removeEventListener('keydown', keyFn));
    document.querySelectorAll('#gtPad button').forEach(b => {
        const a = b.dataset.a;
        const go = (ev) => { ev.preventDefault(); act(a); };
        b.addEventListener('touchstart', go, { passive: false });
        b.addEventListener('mousedown', go);
    });
    let sx = 0, sy = 0;
    canvas.addEventListener('pointerdown', e => { sx = e.offsetX; sy = e.offsetY; });
    canvas.addEventListener('pointerup', e => {
        const dx = e.offsetX - sx, dy = e.offsetY - sy;
        if (Math.abs(dx) < 16 && Math.abs(dy) < 16) { act('rot'); return; }
        if (Math.abs(dx) > Math.abs(dy)) act(dx > 0 ? 'r' : 'l'); else if (dy > 0) act('d');
    });

    const blok = (cx, cy, color, alpha) => {
        x.globalAlpha = alpha;
        x.fillStyle = color;
        if (x.roundRect) { x.beginPath(); x.roundRect(cx + 1, cy + 1, CELL - 2, CELL - 2, 3); x.fill(); } else x.fillRect(cx + 1, cy + 1, CELL - 2, CELL - 2);
        x.fillStyle = 'rgba(255,255,255,0.28)';
        x.fillRect(cx + 2, cy + 2, CELL - 4, Math.max(2, CELL * 0.14));
        x.globalAlpha = 1;
    };
    const step = () => {
        Sim.tetStep(s);
        if (timeline) {
            while (gi < timeline.length && timeline[gi][0] <= s.tick) { ghostScore = timeline[gi][1]; gi++; }
        }
    };
    const draw = () => {
        const g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#0b1220'); g.addColorStop(1, '#131f38');
        x.fillStyle = g; x.fillRect(0, 0, W, H);
        for (let r = 0; r < T.ROWS; r++) for (let c = 0; c < T.COLS; c++) if (s.grid[r][c]) blok(c * CELL, r * CELL, s.grid[r][c], 1);
        if (!s.over) {
            let gy = s.cur.y;
            while (!Sim.tetHit(s, s.cur, s.cur.x, gy + 1)) gy++;
            for (let r = 0; r < s.cur.k.length; r++) for (let c = 0; c < s.cur.k[r].length; c++) {
                if (!s.cur.k[r][c]) continue;
                blok((s.cur.x + c) * CELL, (gy + r) * CELL, s.cur.c, 0.18);
                if (s.cur.y + r >= 0) blok((s.cur.x + c) * CELL, (s.cur.y + r) * CELL, s.cur.c, 1);
            }
        }
        const me = document.getElementById('gtMe'); if (me) me.textContent = s.score;
        const gh = document.getElementById('gtGhost');
        if (gh && timeline) gh.textContent = s.tick <= m.ghost.ticks ? "👻 Do'sting: " + ghostScore : "👻 Do'sting tugatdi: " + (m.rivalResult ? m.rivalResult.score : ghostScore);
    };
    fixedLoop(step, draw, () => s.over, () => finishGhostRun(m, log, s.score));
}

/* ----------------------------------------------------------- TO'RTTA QATOR */

function renderConnect4(stage, m) {
    const ROWS = 6, COLS = 7;
    const mine = m.myMark;
    const color = mk => mk === '1' ? 'bg-rose-500' : mk === '2' ? 'bg-amber-400' : 'bg-slate-950';
    const inLine = (r, c) => (m.line || []).some(([a, b]) => a === r && b === c);
    const canMove = m.status === 'active' && m.myTurn;
    let status;
    if (m.status === 'active') status = m.myTurn ? '👉 Navbat senda — ustunni bos' : `${escapeHtml(m.rivalName || "Do'sting")} o'ylayapti...`;
    let cells = '';
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const mk = m.board ? m.board[r * COLS + c] : '.';
        const last = m.last && m.last[0] === r && m.last[1] === c;
        cells += `<button ${canMove ? `onclick="connect4Move(${c})"` : 'disabled'} class="aspect-square rounded-full ${color(mk)} ${inLine(r, c) ? 'ring-4 ring-white' : last ? 'ring-2 ring-sky-300' : ''} border border-slate-900/60"></button>`;
    }
    stage.innerHTML = matchHeader(m) + `<div class="space-y-2.5">
        ${matchBanner(m)}
        <div class="flex justify-between text-[11px]"><span class="text-slate-300">Sen: <span class="inline-block w-3 h-3 rounded-full ${color(mine)} align-middle"></span></span><span class="text-slate-300">${escapeHtml(m.rivalName || "Do'sting")}: <span class="inline-block w-3 h-3 rounded-full ${color(mine === '1' ? '2' : '1')} align-middle"></span></span></div>
        ${status ? `<div class="text-center text-[11px] font-bold ${m.myTurn ? 'text-amber-300' : 'text-slate-400'}">${status}</div>` : ''}
        <div class="grid grid-cols-7 gap-1.5 p-2 rounded-2xl bg-blue-900/70 border border-blue-700 max-w-[340px] mx-auto">${cells}</div>
        ${m.status === 'active' ? '<div class="text-center"><button onclick="cancelMatch()" class="text-[10px] text-slate-500 underline">Taslim bo\'lish</button></div>' : ''}
    </div>`;
}

async function connect4Move(col) {
    if (!onlineMatch || !onlineMatch.myTurn) return;
    onlineMatch.myTurn = false;
    const r = await onlineCall({ type: 'match_move', id: onlineMatch.id, col });
    if (!r.ok) { shopAlert(r.error || "Yurib bo'lmadi."); }
    if (r.match) onlineMatch = r.match;
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    renderMatch();
}

/* ------------------------------------------------------------ DENGIZ JANGI */

function renderBattleship(stage, m) {
    const N = 8;
    const key = (r, c) => r * N + c;
    const myShots = new Map((m.myShots || []).map(s => [key(s[0], s[1]), s[2]]));
    const sunk = new Set((m.sunkRival || []).flat().map(([r, c]) => key(r, c)));
    const rivalFleet = new Set((m.rivalFleet || []).flat().map(([r, c]) => key(r, c)));
    const myFleet = new Set((m.myFleet || []).flat().map(([r, c]) => key(r, c)));
    const rivalShots = new Map((m.rivalShots || []).map(s => [key(s[0], s[1]), s[2]]));
    const canShoot = m.status === 'active' && m.myTurn;

    let enemy = '';
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        const k = key(r, c);
        const shot = myShots.has(k);
        let cls = 'bg-sky-950/80', mark = '';
        if (shot && sunk.has(k)) { cls = 'bg-rose-900'; mark = '💥'; }
        else if (shot && myShots.get(k)) { cls = 'bg-orange-700/70'; mark = '🔥'; }
        else if (shot) { cls = 'bg-sky-900/40'; mark = '·'; }
        else if (rivalFleet.has(k)) { cls = 'bg-slate-600'; }
        enemy += `<button ${canShoot && !shot ? `onclick="battleshipShot(${r},${c})"` : 'disabled'} class="aspect-square rounded border border-sky-700/70 ${cls} text-[11px] leading-none text-white flex items-center justify-center ${canShoot && !shot ? 'hover:bg-sky-700' : ''}">${mark}</button>`;
    }
    let own = '';
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        const k = key(r, c);
        const ship = myFleet.has(k), shot = rivalShots.has(k);
        const cls = ship ? (shot ? 'bg-rose-700' : 'bg-cyan-600') : 'bg-sky-950/80';
        own += `<div class="aspect-square rounded-sm ${cls} text-[8px] leading-none text-white flex items-center justify-center">${shot ? (ship ? '🔥' : '·') : ''}</div>`;
    }
    let status = '';
    if (m.status === 'active') status = m.myTurn ? '👉 Navbat senda — katakni tanlab ot' : `${escapeHtml(m.rivalName || "Do'sting")} otyapti...`;
    stage.innerHTML = matchHeader(m) + `<div class="space-y-2.5">
        ${matchBanner(m)}
        ${status ? `<div class="text-center text-[11px] font-bold ${m.myTurn ? 'text-amber-300' : 'text-slate-400'}">${status}</div>` : ''}
        <div class="text-[10px] text-slate-400 flex justify-between"><span>Do'stingning dengizi</span><span>Qolgan kemalar: <b class="text-white">${m.rivalShipsLeft ?? 5}</b></span></div>
        <div class="grid grid-cols-8 gap-1 p-1.5 rounded-xl bg-sky-900/50 border border-sky-800 max-w-[330px] mx-auto">${enemy}</div>
        <div class="text-[10px] text-slate-400 pt-1">Mening flotim</div>
        <div class="grid grid-cols-8 gap-0.5 p-1 rounded-lg bg-sky-900/40 border border-sky-900 max-w-[170px]">${own}</div>
        <div class="text-[9px] text-slate-500">🔥 tegdi · 💥 cho'kdi · <b>·</b> bo'sh. Tekkizsang — yana o'zing otasan.</div>
        ${m.status === 'active' ? '<div class="text-center"><button onclick="cancelMatch()" class="text-[10px] text-slate-500 underline">Taslim bo\'lish</button></div>' : ''}
    </div>`;
}

async function battleshipShot(r, c) {
    if (!onlineMatch || !onlineMatch.myTurn) return;
    onlineMatch.myTurn = false;
    const res = await onlineCall({ type: 'match_move', id: onlineMatch.id, r, c });
    if (!res.ok) shopAlert(res.error || "Otib bo'lmadi.");
    if (res.match) onlineMatch = res.match;
    if (res.shot && tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred(res.shot.hit ? 'success' : 'warning');
    renderMatch();
}

/* ---------------------------------------------------- OTA-ONA: RO'YXAT */

async function openFamilyMatches() {
    openSubpage('modal-family-matches');
    const box = document.getElementById('familyMatchesList');
    if (!box) return;
    box.innerHTML = '<div class="text-[11px] text-slate-400">Yuklanmoqda...</div>';
    try {
        const r = await onlineCall({ type: 'family_matches' });
        const list = (r && r.matches) || [];
        if (!r.ok) { box.innerHTML = `<div class="text-[11px] text-rose-300">${escapeHtml(r.error || 'Yuklanmadi')}</div>`; return; }
        if (!list.length) { box.innerHTML = "<div class=\"text-[11px] text-slate-400\">So'nggi 30 kunda online o'yin bo'lmagan.</div>"; return; }
        box.innerHTML = list.map(m => {
            const res = m.result === 'won' ? '🏆 Yutdi' : m.result === 'lost' ? 'Yutqazdi' : m.result === 'draw' ? '🤝 Durang' : m.status === 'open' ? "Do'st kutilmoqda" : m.status === 'active' ? 'Davom etmoqda' : "Tugamagan";
            return `<div class="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center gap-2">
                <span class="text-lg">${m.emoji}</span>
                <div class="flex-1 min-w-0">
                    <div class="text-[11px] font-bold text-white">${escapeHtml(m.child)} · ${escapeHtml(m.game)}</div>
                    <div class="text-[10px] text-slate-400">Raqib: ${escapeHtml(m.rival || '—')} · ${new Date(m.createdAt).toLocaleDateString('uz-UZ')}</div>
                </div>
                <span class="text-[10px] font-bold text-slate-300 shrink-0">${res}</span>
            </div>`;
        }).join('');
    } catch (e) {
        console.error('family_matches:', e);
        box.innerHTML = '<div class="text-[11px] text-rose-300">Server javob bermadi.</div>';
    }
}
