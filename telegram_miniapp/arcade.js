/* ============================================================================
 * QALQON AI — ARKADA O'YINLARI
 *
 * Bu fayldagi o'yinlar butunlay OFLAYN: hech qanday so'rov yo'q, hech qanday
 * ball yo'q. Ular faqat bolani ilovaga qaytarish uchun.
 *
 * Grafika kutubxonasi ishlatilmadi. Sabab amaliy: Telegram ichidagi brauzer
 * sekin telefonlarda ham ochilishi kerak, va har bir tashqi kutubxona
 * birinchi ochilishni sekinlashtiradi. Kerakli "hajm" hissi soyalar,
 * perspektiva va gradientlar bilan beriladi — bu canvas'ning o'zida arzon.
 * ========================================================================= */

/** Ekran zichligiga moslangan canvas. Busiz chiziqlar xira ko'rinadi. */
function arcadeCanvas(host, w, h) {
    const c = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    c.width = w * dpr;
    c.height = h * dpr;
    c.style.width = w + 'px';
    c.style.height = h + 'px';
    c.style.borderRadius = '16px';
    c.style.display = 'block';
    c.style.margin = '0 auto';
    c.style.touchAction = 'none';
    host.appendChild(c);
    const x = c.getContext('2d');
    x.scale(dpr, dpr);
    return { canvas: c, x: x, w: w, h: h };
}

function arcadeShell(stage, title, hud) {
    stage.innerHTML =
        '<div class="flex items-center justify-between mb-2">' +
            '<button onclick="closeGame()" class="text-[11px] font-bold text-indigo-300">← O\'yinlar</button>' +
            '<div class="text-[11px] font-bold text-white">' + title + '</div>' +
            '<div class="text-[11px] font-mono font-bold text-amber-300" id="arcadeHud">' + hud + '</div>' +
        '</div>' +
        '<div id="arcadeHost"></div>' +
        '<div id="arcadeFoot" class="mt-2"></div>';
    return document.getElementById('arcadeHost');
}

let arcadeLoop = null;
let arcadeCleanup = [];

function stopArcade() {
    if (arcadeLoop) { cancelAnimationFrame(arcadeLoop); arcadeLoop = null; }
    arcadeCleanup.forEach(fn => { try { fn(); } catch (e) {} });
    arcadeCleanup = [];
}

/* ===========================================================================
 * 1) QALQON MINORASI (Tower Bloxx uslubida)
 *
 * Kran blokni chayqatib turadi, bola bosganda blok tushadi. Blok pastdagisining
 * markaziga qanchalik aniq tushsa, minora shunchalik tik turadi. Chetga
 * tushgan har bir blok minorani egadi — va egilish chegaradan oshsa, minora
 * qulaydi. Ya'ni o'yin jazolamaydi, lekin shoshqaloqlikni kechirmaydi.
 * ======================================================================== */

function startTowerGame(stage) {
    stopArcade();
    const host = arcadeShell(stage, '🏗️ Qalqon Minorasi', '0');
    const W = Math.min(stage.clientWidth || 340, 400);
    const H = Math.round(W * 1.35);
    const { canvas, x } = arcadeCanvas(host, W, H);

    document.getElementById('arcadeFoot').innerHTML =
        '<div class="text-[10px] text-slate-400 text-center">Ekranni bos — blok tushadi. Markazga aniq tushsa, minora tik turadi.</div>';

    const BW = Math.round(W * 0.34);   // blok kengligi
    const BH = 26;                      // blok balandligi
    const GROUND = H - 40;

    let blocks = [];                    // qo'yilgan bloklar
    let falling = null;                 // tushayotgan blok
    let craneT = 0;                     // kranning chayqalish fazasi
    let scrollY = 0;                    // kamera
    let score = 0;
    let lean = 0;                       // to'plangan egilish
    let over = false;
    let shake = 0;
    let parts = [];                     // uchqunlar

    const rang = (i) => {
        // Balandlik oshgani sari ranglar iliqdan sovuqqa o'tadi.
        const h = (200 + i * 14) % 360;
        return ['hsl(' + h + ',70%,58%)', 'hsl(' + h + ',70%,44%)'];
    };

    function reset() {
        blocks = [{ cx: W / 2, w: BW, y: GROUND, i: 0 }];
        falling = null;
        score = 0; lean = 0; scrollY = 0; over = false; parts = [];
        spawn();
    }

    function spawn() {
        const top = blocks[blocks.length - 1];
        falling = { cx: W / 2, y: top.y - BH * 6, w: top.w, vy: 0, dropped: false, i: blocks.length };
    }

    function drop() {
        if (over) { reset(); return; }
        if (falling && !falling.dropped) falling.dropped = true;
    }

    canvas.addEventListener('pointerdown', drop);
    const keyFn = (e) => { if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); drop(); } };
    window.addEventListener('keydown', keyFn);
    arcadeCleanup.push(() => window.removeEventListener('keydown', keyFn));

    function burst(cx, cy, color, n) {
        for (let i = 0; i < n; i++) {
            parts.push({
                x: cx, y: cy,
                vx: (Math.random() - 0.5) * 5,
                vy: -Math.random() * 4 - 1,
                life: 1, c: color
            });
        }
    }

    function place() {
        const top = blocks[blocks.length - 1];
        const off = falling.cx - top.cx;
        const aniq = Math.abs(off);

        // Blokning pastdagisi bilan ustma-ust tushgan qismi. Umuman tegmasa —
        // minora shu yerda tugaydi.
        const overlap = top.w / 2 + falling.w / 2 - aniq;
        if (overlap <= 6) { over = true; shake = 14; return; }

        const yangiW = Math.max(18, Math.min(falling.w, overlap));
        const cx = falling.cx + (off > 0 ? -(falling.w - yangiW) / 2 : (falling.w - yangiW) / 2);

        blocks.push({ cx: cx, w: yangiW, y: top.y - BH, i: blocks.length });
        score++;

        if (aniq < 6) {
            // Mukammal tushish — egilishni biroz to'g'irlaydi va uchqun beradi.
            lean *= 0.55;
            burst(cx, top.y - BH, '#fde047', 18);
            shake = 4;
        } else {
            lean += off * 0.035;
            burst(cx, top.y - BH, '#94a3b8', 6);
        }

        if (Math.abs(lean) > 26) { over = true; shake = 16; return; }

        const hud = document.getElementById('arcadeHud');
        if (hud) hud.textContent = String(score);
        if (typeof saveBest === 'function') saveBest('tower', score, false);
        if (typeof tg !== 'undefined' && tg && tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred(aniq < 6 ? 'medium' : 'light');
        }
        spawn();
    }

    function osmon(yuqori) {
        // Balandlik oshgani sari kunduzdan kechaga, keyin kosmosga.
        const t = Math.min(1, yuqori / 2600);
        const g = x.createLinearGradient(0, 0, 0, H);
        if (t < 0.4) {
            const k = t / 0.4;
            g.addColorStop(0, 'rgb(' + (56 + k * 60) + ',' + (152 - k * 60) + ',' + (255 - k * 60) + ')');
            g.addColorStop(1, 'rgb(' + (186 - k * 60) + ',' + (230 - k * 90) + ',253)');
        } else if (t < 0.75) {
            const k = (t - 0.4) / 0.35;
            g.addColorStop(0, 'rgb(' + (116 - k * 70) + ',' + (92 - k * 60) + ',' + (195 - k * 120) + ')');
            g.addColorStop(1, 'rgb(' + (253 - k * 150) + ',' + (164 - k * 110) + ',' + (100 - k * 60) + ')');
        } else {
            const k = (t - 0.75) / 0.25;
            g.addColorStop(0, 'rgb(' + (12 - k * 6) + ',' + (10 - k * 5) + ',' + (40 + k * 10) + ')');
            g.addColorStop(1, 'rgb(' + (46 - k * 20) + ',' + (26 - k * 10) + ',' + (71 - k * 20) + ')');
        }
        x.fillStyle = g;
        x.fillRect(0, 0, W, H);

        if (t > 0.55) {
            x.fillStyle = 'rgba(255,255,255,' + ((t - 0.55) / 0.45 * 0.9) + ')';
            for (let i = 0; i < 40; i++) {
                const sx = (i * 137.5) % W;
                const sy = (i * 91.3) % (H * 0.7);
                x.fillRect(sx, sy, 1.6, 1.6);
            }
        }
    }

    function drawBlock(b, yOff) {
        const y = b.y + yOff;
        if (y < -BH || y > H + BH) return;
        // Egilish balandlikka mutanosib — pastki bloklar deyarli qimirlamaydi.
        const tilt = lean * (b.i / Math.max(1, blocks.length)) * 0.6;
        const cx = b.cx + tilt;
        const [c1, c2] = rang(b.i);

        // Yon soya — "hajm" hissi shundan keladi.
        x.fillStyle = 'rgba(0,0,0,0.28)';
        x.fillRect(cx - b.w / 2 + 4, y - BH + 4, b.w, BH);

        const g = x.createLinearGradient(cx - b.w / 2, y - BH, cx + b.w / 2, y);
        g.addColorStop(0, c1);
        g.addColorStop(1, c2);
        x.fillStyle = g;
        if (x.roundRect) { x.beginPath(); x.roundRect(cx - b.w / 2, y - BH, b.w, BH, 5); x.fill(); }
        else x.fillRect(cx - b.w / 2, y - BH, b.w, BH);

        // Derazalar
        x.fillStyle = 'rgba(255,255,255,0.75)';
        const n = Math.max(1, Math.floor(b.w / 22));
        for (let i = 0; i < n; i++) {
            const wx = cx - b.w / 2 + 8 + i * (b.w - 12) / n;
            if (wx + 7 < cx + b.w / 2) x.fillRect(wx, y - BH + 8, 7, 9);
        }
    }

    function frame() {
        const topY = blocks.length ? blocks[blocks.length - 1].y : GROUND;
        const maqsad = Math.max(0, H * 0.55 - topY);
        scrollY += (maqsad - scrollY) * 0.08;

        if (!over) {
            craneT += 0.035;
            if (falling && !falling.dropped) {
                const amp = Math.min(W / 2 - falling.w / 2 - 6, 60 + score * 2.2);
                falling.cx = W / 2 + Math.sin(craneT) * amp;
            } else if (falling) {
                falling.vy += 0.9;
                falling.y += falling.vy;
                const top = blocks[blocks.length - 1];
                if (falling.y >= top.y - BH) { falling.y = top.y - BH; place(); }
            }
        }

        const sh = shake > 0 ? (Math.random() - 0.5) * shake : 0;
        if (shake > 0) shake *= 0.85;

        x.save();
        x.translate(sh, 0);
        osmon(scrollY);

        // Yer
        x.fillStyle = 'rgba(15,23,42,0.85)';
        x.fillRect(0, GROUND + scrollY, W, H);

        blocks.forEach(b => drawBlock(b, scrollY));

        if (falling && !over) {
            const b = { cx: falling.cx, w: falling.w, y: falling.y, i: falling.i };
            drawBlock(b, scrollY);
            if (!falling.dropped) {
                // Kran arqoni
                x.strokeStyle = 'rgba(255,255,255,0.5)';
                x.lineWidth = 2;
                x.beginPath();
                x.moveTo(falling.cx, 0);
                x.lineTo(falling.cx, falling.y - BH + scrollY);
                x.stroke();
                // Tushish yo'nalishi
                const top = blocks[blocks.length - 1];
                x.strokeStyle = 'rgba(253,224,71,0.35)';
                x.setLineDash([5, 6]);
                x.beginPath();
                x.moveTo(falling.cx, falling.y + scrollY);
                x.lineTo(falling.cx, top.y - BH + scrollY);
                x.stroke();
                x.setLineDash([]);
            }
        }

        parts = parts.filter(p => p.life > 0);
        parts.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.vy += 0.25; p.life -= 0.03;
            x.globalAlpha = Math.max(0, p.life);
            x.fillStyle = p.c;
            x.fillRect(p.x, p.y + scrollY, 3, 3);
            x.globalAlpha = 1;
        });

        // Egilish ko'rsatkichi — bola xavfni oldindan ko'rsin.
        const d = Math.min(1, Math.abs(lean) / 26);
        x.fillStyle = 'rgba(255,255,255,0.15)';
        x.fillRect(12, 12, W - 24, 5);
        x.fillStyle = d > 0.7 ? '#f87171' : (d > 0.4 ? '#fbbf24' : '#34d399');
        x.fillRect(12, 12, (W - 24) * d, 5);

        x.restore();

        if (over) {
            x.fillStyle = 'rgba(2,6,23,0.82)';
            x.fillRect(0, 0, W, H);
            x.textAlign = 'center';
            x.fillStyle = '#fff';
            x.font = 'bold 26px system-ui, sans-serif';
            x.fillText('Minora quladi', W / 2, H / 2 - 24);
            x.fillStyle = '#fbbf24';
            x.font = 'bold 46px system-ui, sans-serif';
            x.fillText(String(score) + ' qavat', W / 2, H / 2 + 22);
            x.fillStyle = '#94a3b8';
            x.font = '13px system-ui, sans-serif';
            const rekord = (typeof gamesBest !== 'undefined' && gamesBest.tower) || 0;
            x.fillText('Eng yaxshi: ' + rekord + ' qavat', W / 2, H / 2 + 48);
            x.fillStyle = '#e2e8f0';
            x.fillText('Qaytadan boshlash uchun bos', W / 2, H / 2 + 78);
        }

        arcadeLoop = requestAnimationFrame(frame);
    }

    reset();
    frame();
}

/* ===========================================================================
 * 2) ILON
 *
 * Nokia'dagi o'yinning o'zi, faqat yumaloq bo'g'inlar, yorug'lik va ravon
 * harakat bilan. Boshqaruv uch xil: surish (swipe), tugmalar va klaviatura —
 * telefonda ham, kompyuterda ham o'ynash uchun.
 * ======================================================================== */

function startSnakeGame(stage) {
    stopArcade();
    const host = arcadeShell(stage, '🐍 Ilon', '0');
    const W = Math.min(stage.clientWidth || 340, 400);
    const CELL = Math.floor(W / 17);
    const COLS = 17;
    const ROWS = 21;
    const CW = CELL * COLS;
    const CH = CELL * ROWS;
    const { canvas, x } = arcadeCanvas(host, CW, CH);

    document.getElementById('arcadeFoot').innerHTML =
        '<div class="grid grid-cols-3 gap-2 mt-1 max-w-[210px] mx-auto select-none" id="snakePad">' +
            '<span></span>' +
            '<button data-d="u" class="py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">↑</button>' +
            '<span></span>' +
            '<button data-d="l" class="py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">←</button>' +
            '<button data-d="d" class="py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">↓</button>' +
            '<button data-d="r" class="py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">→</button>' +
        '</div>';

    let snake, dir, nextDir, food, score, over, tick, speed, glow;

    function reset() {
        snake = [{ x: 8, y: 12 }, { x: 8, y: 13 }, { x: 8, y: 14 }];
        dir = { x: 0, y: -1 };
        nextDir = dir;
        score = 0; over = false; tick = 0; speed = 8; glow = 0;
        placeFood();
        const hud = document.getElementById('arcadeHud');
        if (hud) hud.textContent = '0';
    }

    function placeFood() {
        let p;
        do {
            p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
        } while (snake.some(s => s.x === p.x && s.y === p.y));
        food = p;
    }

    function turn(d) {
        const m = { u: { x: 0, y: -1 }, d: { x: 0, y: 1 }, l: { x: -1, y: 0 }, r: { x: 1, y: 0 } }[d];
        if (!m) return;
        // Teskari tomonga burilish o'zini o'zi yeyishga olib kelardi.
        if (m.x === -dir.x && m.y === -dir.y) return;
        nextDir = m;
    }

    const keyFn = (e) => {
        const m = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r' }[e.key];
        if (m) { e.preventDefault(); turn(m); }
        if (over && (e.code === 'Space' || e.key === 'Enter')) reset();
    };
    window.addEventListener('keydown', keyFn);
    arcadeCleanup.push(() => window.removeEventListener('keydown', keyFn));

    document.querySelectorAll('#snakePad button').forEach(b => {
        const d = b.getAttribute('data-d');
        const go = (ev) => { ev.preventDefault(); if (over) reset(); else turn(d); };
        b.addEventListener('touchstart', go, { passive: false });
        b.addEventListener('mousedown', go);
    });

    // Surish bilan boshqarish
    let sx = 0, sy = 0;
    canvas.addEventListener('pointerdown', (e) => { sx = e.offsetX; sy = e.offsetY; });
    canvas.addEventListener('pointerup', (e) => {
        if (over) { reset(); return; }
        const dx = e.offsetX - sx, dy = e.offsetY - sy;
        if (Math.abs(dx) < 16 && Math.abs(dy) < 16) return;
        turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u'));
    });

    function step() {
        dir = nextDir;
        const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

        // Devordan o'tib, narigi tomondan chiqadi — bu bolalar uchun
        // kechirimliroq va o'yin uzoqroq davom etadi.
        if (head.x < 0) head.x = COLS - 1;
        if (head.x >= COLS) head.x = 0;
        if (head.y < 0) head.y = ROWS - 1;
        if (head.y >= ROWS) head.y = 0;

        if (snake.some(s => s.x === head.x && s.y === head.y)) {
            over = true;
            if (typeof saveBest === 'function') saveBest('snake', score, false);
            return;
        }

        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
            score++;
            glow = 1;
            speed = Math.min(18, 8 + score * 0.35);
            placeFood();
            const hud = document.getElementById('arcadeHud');
            if (hud) hud.textContent = String(score);
            if (typeof tg !== 'undefined' && tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
        } else {
            snake.pop();
        }
    }

    function frame() {
        tick++;
        if (!over && tick % Math.max(2, Math.round(60 / speed)) === 0) step();

        const g = x.createLinearGradient(0, 0, CW, CH);
        g.addColorStop(0, '#0b1220');
        g.addColorStop(1, '#111c34');
        x.fillStyle = g;
        x.fillRect(0, 0, CW, CH);

        x.strokeStyle = 'rgba(148,163,184,0.06)';
        x.lineWidth = 1;
        for (let i = 1; i < COLS; i++) { x.beginPath(); x.moveTo(i * CELL, 0); x.lineTo(i * CELL, CH); x.stroke(); }
        for (let i = 1; i < ROWS; i++) { x.beginPath(); x.moveTo(0, i * CELL); x.lineTo(CW, i * CELL); x.stroke(); }

        // Ovqat — nafas olayotgandek pulsatsiya
        glow = Math.max(0, glow - 0.04);
        const pr = CELL * 0.36 + Math.sin(tick / 9) * 1.6;
        x.shadowColor = '#f472b6';
        x.shadowBlur = 16;
        x.fillStyle = '#f472b6';
        x.beginPath();
        x.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, pr, 0, Math.PI * 2);
        x.fill();
        x.shadowBlur = 0;

        snake.forEach((s, i) => {
            const t = i / snake.length;
            x.fillStyle = i === 0 ? '#5eead4' : 'hsl(' + (170 + t * 60) + ',70%,' + (58 - t * 18) + '%)';
            if (i === 0) { x.shadowColor = '#5eead4'; x.shadowBlur = 12 + glow * 16; }
            const pad = i === 0 ? 1 : 2;
            if (x.roundRect) {
                x.beginPath();
                x.roundRect(s.x * CELL + pad, s.y * CELL + pad, CELL - pad * 2, CELL - pad * 2, CELL * 0.34);
                x.fill();
            } else {
                x.fillRect(s.x * CELL + pad, s.y * CELL + pad, CELL - pad * 2, CELL - pad * 2);
            }
            x.shadowBlur = 0;

            if (i === 0) {
                x.fillStyle = '#0b1220';
                const ex = s.x * CELL + CELL / 2 + dir.x * 3;
                const ey = s.y * CELL + CELL / 2 + dir.y * 3;
                x.beginPath(); x.arc(ex - 3, ey - 3, 1.8, 0, Math.PI * 2); x.fill();
                x.beginPath(); x.arc(ex + 3, ey + 3, 1.8, 0, Math.PI * 2); x.fill();
            }
        });

        if (over) {
            x.fillStyle = 'rgba(2,6,23,0.82)';
            x.fillRect(0, 0, CW, CH);
            x.textAlign = 'center';
            x.fillStyle = '#fff';
            x.font = 'bold 24px system-ui, sans-serif';
            x.fillText('O\'yin tugadi', CW / 2, CH / 2 - 20);
            x.fillStyle = '#5eead4';
            x.font = 'bold 44px system-ui, sans-serif';
            x.fillText(String(score), CW / 2, CH / 2 + 24);
            x.fillStyle = '#94a3b8';
            x.font = '13px system-ui, sans-serif';
            const rekord = (typeof gamesBest !== 'undefined' && gamesBest.snake) || 0;
            x.fillText('Eng yaxshi: ' + rekord, CW / 2, CH / 2 + 50);
            x.fillText('Qaytadan boshlash uchun bos', CW / 2, CH / 2 + 76);
        }

        arcadeLoop = requestAnimationFrame(frame);
    }

    reset();
    frame();
}

/* ------------------------------------------------------------------------ */
/* Ro'yxatga qo'shamiz. games.js oldinroq yuklanadi, shuning uchun GAMES
   massivi shu paytda mavjud bo'ladi.                                         */
if (typeof GAMES !== 'undefined') {
    GAMES.push(
        { id: 'tower', name: 'Qalqon Minorasi', emoji: '🏗️', desc: 'Bloklarni aniq tushirib, osmono\'par bino qur', tag: 'Oflayn' },
        { id: 'snake', name: 'Ilon', emoji: '🐍', desc: 'Klassik o\'yin — zamonaviy ko\'rinishda', tag: 'Oflayn' }
    );
}
