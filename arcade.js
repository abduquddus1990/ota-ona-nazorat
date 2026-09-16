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
    const H = Math.min(Math.round(W * 1.35), Math.max(320, (window.innerHeight || 700) - 300));
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

/* ------------------------------------------------------------------------ */
/* Ro'yxatga qo'shamiz. games.js oldinroq yuklanadi, shuning uchun GAMES
   massivi shu paytda mavjud bo'ladi.                                         */
if (typeof GAMES !== 'undefined') {
    GAMES.push(
        { id: 'tower', name: 'Qalqon Minorasi', emoji: '🏗️', desc: 'Bloklarni aniq tushirib, osmono\'par bino qur', tag: 'Oflayn' }
    );
}

/* ===========================================================================
 * 3) POYGA
 *
 * Cheksiz yo'l, qarama-qarshi mashinalar. Tezlik vaqt bilan oshib boradi,
 * shuning uchun o'yin har safar "yana bir marta" deyishga undaydi.
 * Boshqaruv: barmoqni surish, tugmalar va klaviatura — uchalasi ham, chunki
 * bolalar telefonda, ota-onalar esa ko'pincha kompyuterda ochadi.
 * ======================================================================== */

function startRaceGame(stage) {
    stopArcade();
    const host = arcadeShell(stage, '🏎️ Poyga', '0');
    const W = Math.min(stage.clientWidth || 340, 400);
    const H = Math.min(Math.round(W * 1.5), Math.max(320, (window.innerHeight || 700) - 300));
    const { canvas, x } = arcadeCanvas(host, W, H);

    document.getElementById('arcadeFoot').innerHTML =
        '<div class="grid grid-cols-2 gap-2 mt-1 max-w-[240px] mx-auto select-none" id="racePad">' +
            '<button data-d="l" class="py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-lg">←</button>' +
            '<button data-d="r" class="py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-lg">→</button>' +
        '</div>' +
        '<div class="text-[10px] text-slate-400 text-center mt-1">Barmoqni surib ham boshqarsa bo\'ladi</div>';

    const LANES = 3;
    const laneW = W / LANES;
    const carW = laneW * 0.56;
    const carH = carH_(carW);
    function carH_(w) { return Math.round(w * 1.8); }

    let lane = 1;          // joriy yo'lak
    let carX = laneW * (lane + 0.5);
    let obstacles = [];
    let road = 0;          // yo'l chiziqlarining siljishi
    let speed = 3.2;
    let score = 0;
    let over = false;
    let tick = 0;
    let boom = 0;

    const RANGLAR = ['#f87171', '#fbbf24', '#a78bfa', '#34d399', '#38bdf8'];

    function reset() {
        lane = 1; carX = laneW * 1.5; obstacles = []; road = 0;
        speed = 3.2; score = 0; over = false; tick = 0; boom = 0;
        const hud = document.getElementById('arcadeHud');
        if (hud) hud.textContent = '0';
    }

    function move(d) {
        if (over) { reset(); return; }
        lane = Math.max(0, Math.min(LANES - 1, lane + d));
    }

    const keyFn = (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
        if (over && (e.code === 'Space' || e.key === 'Enter')) reset();
    };
    window.addEventListener('keydown', keyFn);
    arcadeCleanup.push(() => window.removeEventListener('keydown', keyFn));

    document.querySelectorAll('#racePad button').forEach(b => {
        const d = b.getAttribute('data-d') === 'l' ? -1 : 1;
        const go = (ev) => { ev.preventDefault(); move(d); };
        b.addEventListener('touchstart', go, { passive: false });
        b.addEventListener('mousedown', go);
    });

    let sx = 0;
    canvas.addEventListener('pointerdown', (e) => { sx = e.offsetX; });
    canvas.addEventListener('pointerup', (e) => {
        if (over) { reset(); return; }
        const dx = e.offsetX - sx;
        if (Math.abs(dx) > 20) move(dx > 0 ? 1 : -1);
        else move(e.offsetX > W / 2 ? 1 : -1);
    });

    function drawCar(cx, cy, w, h, color, mine) {
        // Soya — "yo'lda turgandek" ko'rinishi uchun
        x.fillStyle = 'rgba(0,0,0,0.35)';
        if (x.roundRect) { x.beginPath(); x.roundRect(cx - w / 2 + 3, cy - h / 2 + 4, w, h, 7); x.fill(); }

        const g = x.createLinearGradient(cx - w / 2, cy, cx + w / 2, cy);
        g.addColorStop(0, color);
        g.addColorStop(1, mine ? '#0ea5e9' : 'rgba(0,0,0,0.45)');
        x.fillStyle = g;
        if (x.roundRect) { x.beginPath(); x.roundRect(cx - w / 2, cy - h / 2, w, h, 7); x.fill(); }
        else x.fillRect(cx - w / 2, cy - h / 2, w, h);

        // Oyna
        x.fillStyle = 'rgba(15,23,42,0.75)';
        x.fillRect(cx - w * 0.32, cy - h * 0.28, w * 0.64, h * 0.22);
        x.fillRect(cx - w * 0.32, cy + h * 0.08, w * 0.64, h * 0.18);

        // G'ildiraklar
        x.fillStyle = '#0f172a';
        x.fillRect(cx - w / 2 - 2, cy - h * 0.3, 3, h * 0.22);
        x.fillRect(cx + w / 2 - 1, cy - h * 0.3, 3, h * 0.22);
        x.fillRect(cx - w / 2 - 2, cy + h * 0.12, 3, h * 0.22);
        x.fillRect(cx + w / 2 - 1, cy + h * 0.12, 3, h * 0.22);
    }

    function frame() {
        tick++;
        if (!over) {
            speed += 0.0016;
            road += speed;
            score += speed * 0.05;
            const hud = document.getElementById('arcadeHud');
            if (hud) hud.textContent = String(Math.floor(score));

            // Yangi mashina. Chastota tezlikka bog'liq, lekin hech qachon
            // uchala yo'lakni birdan yopmaydi — aks holda o'yin adolatsiz.
            if (tick % Math.max(26, Math.round(70 - speed * 4)) === 0) {
                const band = Math.floor(Math.random() * LANES);
                const oxirgi = obstacles[obstacles.length - 1];
                if (!oxirgi || oxirgi.y > carH * 1.6 || oxirgi.lane !== band) {
                    obstacles.push({
                        lane: band, y: -carH,
                        c: RANGLAR[Math.floor(Math.random() * RANGLAR.length)]
                    });
                }
            }

            obstacles.forEach(o => { o.y += speed; });
            obstacles = obstacles.filter(o => o.y < H + carH);

            const maqsad = laneW * (lane + 0.5);
            carX += (maqsad - carX) * 0.25;

            const myY = H - carH * 0.9;
            for (const o of obstacles) {
                const ox = laneW * (o.lane + 0.5);
                if (Math.abs(ox - carX) < carW * 0.85 && Math.abs(o.y - myY) < carH * 0.9) {
                    over = true; boom = 20;
                    if (typeof saveBest === 'function') saveBest('race', Math.floor(score), false);
                    if (typeof tg !== 'undefined' && tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
                }
            }
        }

        const sh = boom > 0 ? (Math.random() - 0.5) * boom : 0;
        if (boom > 0) boom *= 0.85;

        x.save();
        x.translate(sh, 0);

        // Yo'l
        x.fillStyle = '#1e293b';
        x.fillRect(0, 0, W, H);
        x.fillStyle = '#0f172a';
        x.fillRect(laneW * 0.06, 0, W - laneW * 0.12, H);

        // Chetdagi o't
        x.fillStyle = '#134e4a';
        x.fillRect(0, 0, laneW * 0.06, H);
        x.fillRect(W - laneW * 0.06, 0, laneW * 0.06, H);

        // Yo'lak chiziqlari
        x.strokeStyle = 'rgba(226,232,240,0.5)';
        x.lineWidth = 3;
        x.setLineDash([22, 24]);
        x.lineDashOffset = -road;
        for (let i = 1; i < LANES; i++) {
            x.beginPath(); x.moveTo(laneW * i, 0); x.lineTo(laneW * i, H); x.stroke();
        }
        x.setLineDash([]);

        obstacles.forEach(o => drawCar(laneW * (o.lane + 0.5), o.y, carW, carH, o.c, false));
        drawCar(carX, H - carH * 0.9, carW, carH, '#22d3ee', true);

        x.restore();

        if (over) {
            x.fillStyle = 'rgba(2,6,23,0.85)';
            x.fillRect(0, 0, W, H);
            x.textAlign = 'center';
            x.fillStyle = '#fff';
            x.font = 'bold 24px system-ui, sans-serif';
            x.fillText('To\'qnashuv!', W / 2, H / 2 - 20);
            x.fillStyle = '#22d3ee';
            x.font = 'bold 44px system-ui, sans-serif';
            x.fillText(String(Math.floor(score)), W / 2, H / 2 + 24);
            x.fillStyle = '#94a3b8';
            x.font = '13px system-ui, sans-serif';
            const rekord = (typeof gamesBest !== 'undefined' && gamesBest.race) || 0;
            x.fillText('Eng yaxshi: ' + rekord, W / 2, H / 2 + 50);
            x.fillText('Qaytadan boshlash uchun bos', W / 2, H / 2 + 76);
        }

        arcadeLoop = requestAnimationFrame(frame);
    }

    reset();
    frame();
}

/* ===========================================================================
 * 4) 2048
 *
 * Jumboq o'yin: bir xil sonlar qo'shilib, kattaroq son hosil qiladi.
 * Bu yerda arkada emas — bola o'ylashi kerak, va shuning uchun u
 * matematikadan qo'rqmaydigan bolani ham o'ziga tortadi.
 * ======================================================================== */

function start2048Game(stage) {
    stopArcade();
    const host = arcadeShell(stage, '🔢 2048', '0');
    const W = Math.min(stage.clientWidth || 340, 380);
    const { canvas, x } = arcadeCanvas(host, W, W);

    document.getElementById('arcadeFoot').innerHTML =
        '<div class="grid grid-cols-3 gap-2 mt-1 max-w-[210px] mx-auto select-none" id="pad2048">' +
            '<span></span>' +
            '<button data-d="u" class="py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">↑</button>' +
            '<span></span>' +
            '<button data-d="l" class="py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">←</button>' +
            '<button data-d="d" class="py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">↓</button>' +
            '<button data-d="r" class="py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">→</button>' +
        '</div>' +
        '<div class="text-[10px] text-slate-400 text-center mt-1">Barmoqni surib ham o\'ynasa bo\'ladi</div>';

    const N = 4;
    const PAD = 8;
    const CELL = (W - PAD * (N + 1)) / N;
    let grid, score, over, won;

    const RANG = {
        2: ['#334155', '#e2e8f0'], 4: ['#3f4c63', '#e2e8f0'],
        8: ['#f59e0b', '#0f172a'], 16: ['#f97316', '#fff'],
        32: ['#ef4444', '#fff'], 64: ['#dc2626', '#fff'],
        128: ['#a78bfa', '#fff'], 256: ['#8b5cf6', '#fff'],
        512: ['#6366f1', '#fff'], 1024: ['#0ea5e9', '#fff'],
        2048: ['#22d3ee', '#0f172a']
    };

    function reset() {
        grid = Array.from({ length: N }, () => Array(N).fill(0));
        score = 0; over = false; won = false;
        add(); add();
        paintHud();
    }
    function paintHud() {
        const hud = document.getElementById('arcadeHud');
        if (hud) hud.textContent = String(score);
    }
    function add() {
        const bosh = [];
        for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!grid[r][c]) bosh.push([r, c]);
        if (!bosh.length) return;
        const [r, c] = bosh[Math.floor(Math.random() * bosh.length)];
        grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
    function siqish(qator) {
        const t = qator.filter(v => v);
        for (let i = 0; i < t.length - 1; i++) {
            if (t[i] === t[i + 1]) {
                t[i] *= 2;
                score += t[i];
                if (t[i] === 2048) won = true;
                t.splice(i + 1, 1);
            }
        }
        while (t.length < N) t.push(0);
        return t;
    }
    function yur(d) {
        if (over) { reset(); return; }
        const oldin = JSON.stringify(grid);
        if (d === 'l') grid = grid.map(siqish);
        if (d === 'r') grid = grid.map(row => siqish(row.slice().reverse()).reverse());
        if (d === 'u' || d === 'd') {
            for (let c = 0; c < N; c++) {
                let col = grid.map(r => r[c]);
                if (d === 'd') col.reverse();
                col = siqish(col);
                if (d === 'd') col.reverse();
                for (let r = 0; r < N; r++) grid[r][c] = col[r];
            }
        }
        if (JSON.stringify(grid) !== oldin) {
            add();
            paintHud();
            if (typeof tg !== 'undefined' && tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
        }
        // Yurish qolmadimi
        let bor = false;
        for (let r = 0; r < N && !bor; r++) for (let c = 0; c < N && !bor; c++) {
            if (!grid[r][c]) bor = true;
            if (c < N - 1 && grid[r][c] === grid[r][c + 1]) bor = true;
            if (r < N - 1 && grid[r][c] === grid[r + 1][c]) bor = true;
        }
        if (!bor) {
            over = true;
            if (typeof saveBest === 'function') saveBest('g2048', score, false);
        }
    }

    const keyFn = (e) => {
        const m = { ArrowUp: 'u', ArrowDown: 'd', ArrowLeft: 'l', ArrowRight: 'r' }[e.key];
        if (m) { e.preventDefault(); yur(m); }
    };
    window.addEventListener('keydown', keyFn);
    arcadeCleanup.push(() => window.removeEventListener('keydown', keyFn));

    document.querySelectorAll('#pad2048 button').forEach(b => {
        const d = b.getAttribute('data-d');
        const go = (ev) => { ev.preventDefault(); yur(d); };
        b.addEventListener('touchstart', go, { passive: false });
        b.addEventListener('mousedown', go);
    });

    let sx = 0, sy = 0;
    canvas.addEventListener('pointerdown', (e) => { sx = e.offsetX; sy = e.offsetY; });
    canvas.addEventListener('pointerup', (e) => {
        const dx = e.offsetX - sx, dy = e.offsetY - sy;
        if (Math.abs(dx) < 18 && Math.abs(dy) < 18) { if (over) reset(); return; }
        yur(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u'));
    });

    function frame() {
        x.fillStyle = '#0b1220';
        x.fillRect(0, 0, W, W);
        x.fillStyle = '#1e293b';
        if (x.roundRect) { x.beginPath(); x.roundRect(2, 2, W - 4, W - 4, 12); x.fill(); }

        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                const px = PAD + c * (CELL + PAD);
                const py = PAD + r * (CELL + PAD);
                const v = grid[r][c];
                const [bg, fg] = RANG[v] || ['#16a34a', '#fff'];
                x.fillStyle = v ? bg : 'rgba(148,163,184,0.10)';
                if (x.roundRect) { x.beginPath(); x.roundRect(px, py, CELL, CELL, 9); x.fill(); }
                else x.fillRect(px, py, CELL, CELL);
                if (v) {
                    x.fillStyle = fg;
                    const size = v >= 1024 ? CELL * 0.30 : (v >= 128 ? CELL * 0.36 : CELL * 0.44);
                    x.font = 'bold ' + size + 'px system-ui, sans-serif';
                    x.textAlign = 'center';
                    x.textBaseline = 'middle';
                    x.fillText(String(v), px + CELL / 2, py + CELL / 2);
                }
            }
        }
        x.textBaseline = 'alphabetic';

        if (won) {
            x.fillStyle = 'rgba(34,211,238,0.14)';
            x.fillRect(0, 0, W, W);
        }
        if (over) {
            x.fillStyle = 'rgba(2,6,23,0.86)';
            x.fillRect(0, 0, W, W);
            x.textAlign = 'center';
            x.fillStyle = '#fff';
            x.font = 'bold 22px system-ui, sans-serif';
            x.fillText('Yurish qolmadi', W / 2, W / 2 - 18);
            x.fillStyle = '#22d3ee';
            x.font = 'bold 40px system-ui, sans-serif';
            x.fillText(String(score), W / 2, W / 2 + 22);
            x.fillStyle = '#94a3b8';
            x.font = '13px system-ui, sans-serif';
            const rekord = (typeof gamesBest !== 'undefined' && gamesBest.g2048) || 0;
            x.fillText('Eng yaxshi: ' + rekord, W / 2, W / 2 + 48);
            x.fillText('Qaytadan boshlash uchun bos', W / 2, W / 2 + 72);
        }
        arcadeLoop = requestAnimationFrame(frame);
    }

    reset();
    frame();
}

/* ===========================================================================
 * 5) PENALTI
 *
 * O'zbekistonda eng tanish o'yin. Bir bosishda o'ynaladi: yo'nalish va kuch
 * harakatlanuvchi ko'rsatkichlar bilan tanlanadi — ya'ni omad emas, aniqlik
 * hal qiladi. Darvozabon ham har safar boshqa tomonga tashlanadi.
 * ======================================================================== */

function startPenaltyGame(stage) {
    stopArcade();
    const host = arcadeShell(stage, '⚽ Penalti', '0 / 5');
    const W = Math.min(stage.clientWidth || 340, 400);
    const H = Math.round(W * 0.95);
    const { canvas, x } = arcadeCanvas(host, W, H);

    document.getElementById('arcadeFoot').innerHTML =
        '<div class="text-[10px] text-slate-400 text-center">Birinchi bosish — yo\'nalish, ikkinchisi — kuch</div>';

    let bosqich = 0;     // 0: yo'nalish tanlash, 1: kuch, 2: zarba, 3: natija
    let dirT = 0, powT = 0;
    let dir = 0, pow = 0;
    let urinish = 0, gol = 0;
    let ball = null, kipper = null, natija = '';
    let over = false;

    const GW = W * 0.66, GH = H * 0.30;
    const GX = (W - GW) / 2, GY = H * 0.12;

    function reset() {
        bosqich = 0; urinish = 0; gol = 0; over = false; natija = '';
        ball = null; kipper = null;
        hud();
    }
    function hud() {
        const h = document.getElementById('arcadeHud');
        if (h) h.textContent = gol + ' / ' + Math.max(urinish, 0);
    }

    function tap() {
        if (over) { reset(); return; }
        if (bosqich === 0) { dir = Math.sin(dirT); bosqich = 1; return; }
        if (bosqich === 1) {
            pow = 0.45 + Math.abs(Math.sin(powT)) * 0.55;
            bosqich = 2;
            urinish++;
            // Darvozabon tomoni tasodifiy, lekin kuchli zarbaga yetib
            // borishi qiyinroq — ya'ni kuch ham, aniqlik ham kerak.
            const kdir = [-1, 0, 1][Math.floor(Math.random() * 3)];
            ball = { x: W / 2, y: H * 0.82, t: 0, tx: W / 2 + dir * GW * 0.42, ty: GY + GH * 0.45 };
            kipper = { dir: kdir, t: 0 };
            return;
        }
        if (bosqich === 3) {
            if (urinish >= 5) {
                over = true;
                if (typeof saveBest === 'function') saveBest('penalty', gol, false);
            } else {
                bosqich = 0; natija = ''; ball = null; kipper = null;
            }
        }
    }
    canvas.addEventListener('pointerdown', tap);
    const keyFn = (e) => { if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); tap(); } };
    window.addEventListener('keydown', keyFn);
    arcadeCleanup.push(() => window.removeEventListener('keydown', keyFn));

    function frame() {
        if (bosqich === 0) dirT += 0.055;
        if (bosqich === 1) powT += 0.075;

        if (bosqich === 2 && ball) {
            ball.t += 0.035 + pow * 0.02;
            if (ball.t >= 1) {
                const kx = W / 2 + kipper.dir * GW * 0.36;
                const ushladi = Math.abs(kx - ball.tx) < GW * 0.17 && pow < 0.92;
                if (ushladi) { natija = 'Darvozabon ushlab qoldi!'; }
                else { gol++; natija = 'GOL! ⚽'; }
                hud();
                bosqich = 3;
                if (typeof tg !== 'undefined' && tg && tg.HapticFeedback) {
                    tg.HapticFeedback.notificationOccurred(ushladi ? 'warning' : 'success');
                }
            }
        }
        if (kipper && bosqich >= 2) kipper.t = Math.min(1, kipper.t + 0.07);

        // Maydon
        const g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#166534');
        g.addColorStop(1, '#14532d');
        x.fillStyle = g;
        x.fillRect(0, 0, W, H);
        for (let i = 0; i < 8; i++) {
            if (i % 2) { x.fillStyle = 'rgba(255,255,255,0.03)'; x.fillRect(0, i * H / 8, W, H / 8); }
        }

        // Darvoza
        x.strokeStyle = '#f8fafc';
        x.lineWidth = 5;
        x.strokeRect(GX, GY, GW, GH);
        x.strokeStyle = 'rgba(248,250,252,0.22)';
        x.lineWidth = 1;
        for (let i = 1; i < 10; i++) {
            x.beginPath(); x.moveTo(GX + GW / 10 * i, GY); x.lineTo(GX + GW / 10 * i, GY + GH); x.stroke();
        }
        for (let i = 1; i < 5; i++) {
            x.beginPath(); x.moveTo(GX, GY + GH / 5 * i); x.lineTo(GX + GW, GY + GH / 5 * i); x.stroke();
        }

        // Darvozabon
        const kx = kipper
            ? W / 2 + kipper.dir * GW * 0.36 * kipper.t
            : W / 2;
        // Emoji chizishdan oldin fillStyle ni tiklash SHART: yuqorida maydon
        // chiziqlari uchun deyarli shaffof rang qo'yilgan edi, va u emoji
        // ham ko'rinmay ketishiga sabab bo'lardi.
        x.fillStyle = '#ffffff';
        x.font = Math.round(GH * 0.72) + 'px system-ui, sans-serif';
        x.textAlign = 'center';
        x.fillText('🧤', kx, GY + GH * 0.86);

        // Ko'rsatkichlar
        if (bosqich === 0) {
            const px = W / 2 + Math.sin(dirT) * GW * 0.42;
            x.strokeStyle = '#fde047'; x.lineWidth = 3;
            x.beginPath(); x.moveTo(W / 2, H * 0.82); x.lineTo(px, GY + GH * 0.5); x.stroke();
        }
        if (bosqich === 1) {
            const p = Math.abs(Math.sin(powT));
            x.fillStyle = 'rgba(15,23,42,0.6)';
            x.fillRect(W * 0.12, H * 0.92, W * 0.76, 10);
            x.fillStyle = p > 0.85 ? '#f87171' : (p > 0.5 ? '#fbbf24' : '#34d399');
            x.fillRect(W * 0.12, H * 0.92, W * 0.76 * p, 10);
            x.strokeStyle = '#fde047'; x.lineWidth = 3;
            const px = W / 2 + dir * GW * 0.42;
            x.beginPath(); x.moveTo(W / 2, H * 0.82); x.lineTo(px, GY + GH * 0.5); x.stroke();
        }

        // To'p
        let bx = W / 2, by = H * 0.82, bs = 26;
        if (ball) {
            bx = W / 2 + (ball.tx - W / 2) * ball.t;
            by = H * 0.82 + (ball.ty - H * 0.82) * ball.t;
            bs = 26 - ball.t * 9;
        }
        x.fillStyle = '#ffffff';
        x.font = Math.max(12, bs) + 'px system-ui, sans-serif';
        x.fillText('⚽', bx, by);

        if (natija) {
            x.fillStyle = 'rgba(2,6,23,0.55)';
            x.fillRect(0, H * 0.4, W, 54);
            x.fillStyle = natija.indexOf('GOL') === 0 ? '#34d399' : '#f87171';
            x.font = 'bold 22px system-ui, sans-serif';
            x.fillText(natija, W / 2, H * 0.4 + 35);
        }

        if (over) {
            x.fillStyle = 'rgba(2,6,23,0.86)';
            x.fillRect(0, 0, W, H);
            x.fillStyle = '#fff';
            x.font = 'bold 22px system-ui, sans-serif';
            x.fillText('5 ta zarba tugadi', W / 2, H / 2 - 16);
            x.fillStyle = '#34d399';
            x.font = 'bold 42px system-ui, sans-serif';
            x.fillText(gol + ' / 5', W / 2, H / 2 + 26);
            x.fillStyle = '#94a3b8';
            x.font = '13px system-ui, sans-serif';
            const rekord = (typeof gamesBest !== 'undefined' && gamesBest.penalty) || 0;
            x.fillText('Eng yaxshi: ' + rekord + ' / 5', W / 2, H / 2 + 52);
            x.fillText('Qaytadan boshlash uchun bos', W / 2, H / 2 + 76);
        }

        arcadeLoop = requestAnimationFrame(frame);
    }

    reset();
    frame();
}

if (typeof GAMES !== 'undefined') {
    GAMES.push(
        { id: 'race', name: 'Poyga', emoji: '🏎️', desc: 'Mashinalarni chetlab o\'t — tezlik oshib boradi', tag: 'Oflayn' },
        { id: 'g2048', name: '2048', emoji: '🔢', desc: 'Sonlarni qo\'shib, 2048 ga yet', tag: 'Oflayn' },
        { id: 'penalty', name: 'Penalti', emoji: '⚽', desc: '5 ta zarba — yo\'nalish va kuchni to\'g\'ri tanla', tag: 'Oflayn' }
    );
}

/* ===========================================================================
 * TETRIS
 *
 * Tushish tezligi daraja bilan oshadi: har 10 ta to'la qator — yangi daraja.
 * Boshida shakl sekin tushadi va bola o'ylab ulguradi; 8-darajaga kelganda
 * qo'l o'ylashdan tezroq harakat qilishi kerak bo'ladi. Aynan shu o'sish
 * o'yinni ushlab turadi — tezlik o'zgarmasa, u 5 daqiqada zerikarli bo'ladi.
 * ======================================================================== */

const TETRIS_SHAPES = [
    { c: '#22d3ee', k: [[1, 1, 1, 1]] },                    // I
    { c: '#fbbf24', k: [[1, 1], [1, 1]] },                  // O
    { c: '#a78bfa', k: [[0, 1, 0], [1, 1, 1]] },            // T
    { c: '#34d399', k: [[0, 1, 1], [1, 1, 0]] },            // S
    { c: '#f87171', k: [[1, 1, 0], [0, 1, 1]] },            // Z
    { c: '#60a5fa', k: [[1, 0, 0], [1, 1, 1]] },            // J
    { c: '#fb923c', k: [[0, 0, 1], [1, 1, 1]] }             // L
];

function startTetrisGame(stage) {
    stopArcade();
    const host = arcadeShell(stage, '🧱 Tetris', '0');
    const COLS = 10, ROWS = 18;
    const Wmax = Math.min(stage.clientWidth || 340, 360);
    const bosh = Math.max(240, (window.innerHeight || 700) - 400);
    const CELL = Math.max(14, Math.min(Math.floor(Wmax / COLS), Math.floor(bosh / ROWS)));
    const W = CELL * COLS, H = CELL * ROWS;
    const { canvas, x } = arcadeCanvas(host, W, H);

    document.getElementById('arcadeFoot').innerHTML =
        '<div class="grid grid-cols-4 gap-2 mt-1 max-w-[280px] mx-auto select-none" id="tetPad">' +
            '<button data-a="l" class="py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">←</button>' +
            '<button data-a="rot" class="py-3 rounded-xl bg-indigo-600/40 border border-indigo-500 text-white font-bold">⟳</button>' +
            '<button data-a="r" class="py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">→</button>' +
            '<button data-a="d" class="py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold">↓</button>' +
        '</div>' +
        '<div class="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-1 max-w-[280px] mx-auto">' +
            '<span>Daraja: <b id="tetLevel" class="text-slate-200">1</b></span>' +
            '<span>Qatorlar: <b id="tetLines" class="text-slate-200">0</b></span>' +
        '</div>';

    let grid, cur, score, lines, level, over, tick, tushish, next;

    function bosh_grid() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    }
    function yangiShakl() {
        const t = TETRIS_SHAPES[Math.floor(Math.random() * TETRIS_SHAPES.length)];
        return {
            k: t.k.map(r => r.slice()),
            c: t.c,
            x: Math.floor((COLS - t.k[0].length) / 2),
            y: 0
        };
    }
    function reset() {
        grid = bosh_grid();
        cur = yangiShakl();
        next = yangiShakl();
        score = 0; lines = 0; level = 1; over = false; tick = 0;
        tushish = 48;   // necha kadrda bir qator pastga
        paint();
    }
    function paint() {
        const h = document.getElementById('arcadeHud');
        if (h) h.textContent = String(score);
        const l = document.getElementById('tetLevel');
        if (l) l.textContent = String(level);
        const q = document.getElementById('tetLines');
        if (q) q.textContent = String(lines);
    }

    function toqnash(shakl, nx, ny) {
        for (let r = 0; r < shakl.k.length; r++) {
            for (let c = 0; c < shakl.k[r].length; c++) {
                if (!shakl.k[r][c]) continue;
                const gx = nx + c, gy = ny + r;
                if (gx < 0 || gx >= COLS || gy >= ROWS) return true;
                if (gy >= 0 && grid[gy][gx]) return true;
            }
        }
        return false;
    }

    function burish() {
        // Soat yo'nalishi bo'yicha aylantirish
        const k = cur.k;
        const yangi = k[0].map((_, i) => k.map(r => r[i]).reverse());
        const eski = cur.k;
        cur.k = yangi;
        // Devorga tegib qolsa, chapga-o'ngga surib ko'ramiz — busiz shakl
        // chetda umuman burilmasdi va o'yin g'ashga tegardi.
        for (const siljish of [0, -1, 1, -2, 2]) {
            if (!toqnash(cur, cur.x + siljish, cur.y)) { cur.x += siljish; return; }
        }
        cur.k = eski;
    }

    function joylash() {
        for (let r = 0; r < cur.k.length; r++) {
            for (let c = 0; c < cur.k[r].length; c++) {
                if (!cur.k[r][c]) continue;
                const gy = cur.y + r, gx = cur.x + c;
                if (gy < 0) { over = true; return; }
                grid[gy][gx] = cur.c;
            }
        }
        // To'la qatorlarni olib tashlaymiz
        let olindi = 0;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (grid[r].every(v => v)) {
                grid.splice(r, 1);
                grid.unshift(Array(COLS).fill(null));
                olindi++;
                r++;
            }
        }
        if (olindi) {
            // Bir yo'la ko'p qator olish ko'proq ball beradi — bu bolani
            // shoshmay, to'rttani birga olishga undaydi.
            score += [0, 40, 100, 300, 1200][olindi] * level;
            lines += olindi;
            const yangiDaraja = Math.floor(lines / 10) + 1;
            if (yangiDaraja > level) {
                level = yangiDaraja;
                tushish = Math.max(6, 48 - (level - 1) * 5);
            }
            if (typeof tg !== 'undefined' && tg && tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred(olindi >= 3 ? 'medium' : 'light');
            }
        }
        cur = next;
        next = yangiShakl();
        if (toqnash(cur, cur.x, cur.y)) over = true;
        paint();
        if (over && typeof saveBest === 'function') saveBest('tetris', score, false);
    }

    function harakat(a) {
        if (over) { reset(); return; }
        if (a === 'l' && !toqnash(cur, cur.x - 1, cur.y)) cur.x--;
        if (a === 'r' && !toqnash(cur, cur.x + 1, cur.y)) cur.x++;
        if (a === 'rot') burish();
        if (a === 'd') {
            if (!toqnash(cur, cur.x, cur.y + 1)) { cur.y++; score++; paint(); }
            else joylash();
        }
    }

    const keyFn = (e) => {
        const m = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'rot', ArrowDown: 'd' }[e.key];
        if (m) { e.preventDefault(); harakat(m); }
        if (e.code === 'Space') { e.preventDefault(); harakat('rot'); }
    };
    window.addEventListener('keydown', keyFn);
    arcadeCleanup.push(() => window.removeEventListener('keydown', keyFn));

    document.querySelectorAll('#tetPad button').forEach(b => {
        const a = b.getAttribute('data-a');
        const go = (ev) => { ev.preventDefault(); harakat(a); };
        b.addEventListener('touchstart', go, { passive: false });
        b.addEventListener('mousedown', go);
    });

    let sx = 0, sy = 0;
    canvas.addEventListener('pointerdown', (e) => { sx = e.offsetX; sy = e.offsetY; });
    canvas.addEventListener('pointerup', (e) => {
        if (over) { reset(); return; }
        const dx = e.offsetX - sx, dy = e.offsetY - sy;
        if (Math.abs(dx) < 16 && Math.abs(dy) < 16) { harakat('rot'); return; }
        if (Math.abs(dx) > Math.abs(dy)) harakat(dx > 0 ? 'r' : 'l');
        else if (dy > 0) harakat('d');
    });

    function blok(cx, cy, color) {
        x.fillStyle = color;
        if (x.roundRect) { x.beginPath(); x.roundRect(cx + 1, cy + 1, CELL - 2, CELL - 2, 3); x.fill(); }
        else x.fillRect(cx + 1, cy + 1, CELL - 2, CELL - 2);
        // Yuqori chetiga yorug'lik — tekis kvadratga hajm beradi
        x.fillStyle = 'rgba(255,255,255,0.28)';
        x.fillRect(cx + 2, cy + 2, CELL - 4, Math.max(2, CELL * 0.14));
    }

    function frame() {
        tick++;
        if (!over && tick % tushish === 0) {
            if (!toqnash(cur, cur.x, cur.y + 1)) cur.y++;
            else joylash();
        }

        const g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#0b1220');
        g.addColorStop(1, '#131f38');
        x.fillStyle = g;
        x.fillRect(0, 0, W, H);

        x.strokeStyle = 'rgba(148,163,184,0.07)';
        x.lineWidth = 1;
        for (let i = 1; i < COLS; i++) { x.beginPath(); x.moveTo(i * CELL, 0); x.lineTo(i * CELL, H); x.stroke(); }
        for (let i = 1; i < ROWS; i++) { x.beginPath(); x.moveTo(0, i * CELL); x.lineTo(W, i * CELL); x.stroke(); }

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c]) blok(c * CELL, r * CELL, grid[r][c]);
            }
        }

        if (!over) {
            // Soya: shakl qayerga tushishini oldindan ko'rsatadi
            let gy = cur.y;
            while (!toqnash(cur, cur.x, gy + 1)) gy++;
            x.globalAlpha = 0.18;
            for (let r = 0; r < cur.k.length; r++) {
                for (let c = 0; c < cur.k[r].length; c++) {
                    if (cur.k[r][c]) blok((cur.x + c) * CELL, (gy + r) * CELL, cur.c);
                }
            }
            x.globalAlpha = 1;

            for (let r = 0; r < cur.k.length; r++) {
                for (let c = 0; c < cur.k[r].length; c++) {
                    if (cur.k[r][c] && cur.y + r >= 0) blok((cur.x + c) * CELL, (cur.y + r) * CELL, cur.c);
                }
            }
        }

        if (over) {
            x.fillStyle = 'rgba(2,6,23,0.86)';
            x.fillRect(0, 0, W, H);
            x.textAlign = 'center';
            x.fillStyle = '#fff';
            x.font = 'bold 22px system-ui, sans-serif';
            x.fillText("O'yin tugadi", W / 2, H / 2 - 30);
            x.fillStyle = '#22d3ee';
            x.font = 'bold 40px system-ui, sans-serif';
            x.fillText(String(score), W / 2, H / 2 + 12);
            x.fillStyle = '#94a3b8';
            x.font = '13px system-ui, sans-serif';
            x.fillText(lines + ' qator · ' + level + '-daraja', W / 2, H / 2 + 38);
            const rekord = (typeof gamesBest !== 'undefined' && gamesBest.tetris) || 0;
            x.fillText('Eng yaxshi: ' + rekord, W / 2, H / 2 + 62);
            x.fillText('Qaytadan boshlash uchun bos', W / 2, H / 2 + 86);
        }

        arcadeLoop = requestAnimationFrame(frame);
    }

    reset();
    frame();
}

if (typeof GAMES !== 'undefined') {
    GAMES.push({
        id: 'tetris', name: 'Tetris', emoji: '🧱',
        desc: "Shakllarni joyla — tezlik daraja bilan oshadi", tag: 'Oflayn'
    });
}
