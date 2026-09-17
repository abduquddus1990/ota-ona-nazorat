/* ============================================================================
 * QALQON AI — ONLINE O'YINLARNING UMUMIY MANTIG'I
 *
 * Bu fayl IKKI joyda aynan bir xil ishlaydi:
 *   · Mini App'da (telegram_miniapp/sim.js) — bola o'ynaydi;
 *   · serverda (supabase/functions/ota-ona-bot/sim.js) — server bolaning
 *     bosishlar yozuvini qayta o'ynatib, natijani O'ZI hisoblaydi.
 *
 * Shuning uchun uch qoida buzilmasligi kerak:
 *   1) Tasodif faqat urug'dan (seed) — Math.random ishlatilmaydi.
 *   2) Vaqt faqat "qadam"da: 60 qadam = 1 soniya, ekran chastotasiga
 *      bog'liq emas. Aks holda 120 Hz telefonda o'yin ikki barobar tez
 *      yurardi va musobaqa adolatsiz bo'lardi.
 *   3) Maydon o'lchami qat'iy — ekranga moslash faqat chizishda.
 *
 * O'ZGARTIRSANGIZ: faylni uchala joyga ham nusxalang (ildiz, telegram_miniapp,
 * funksiya papkasi) va funksiyani qayta deploy qiling. Mijoz va server
 * farq qilsa, server halol natijani ham rad etadi.
 * ========================================================================= */
(function (root) {
    'use strict';

    function rng(seed) {
        let a = (Number(seed) >>> 0) || 1;
        return function () {
            a = (a + 0x6D2B79F5) >>> 0;
            let t = a;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    const MAX_TICKS = 60 * 60 * 30; // 30 daqiqa — undan uzun o'yin bo'lmaydi
    const MAX_LOG = 20000;

    /* ---------------------------------------------------------------- POYGA */
    const RACE = { W: 300, H: 450, LANES: 3 };
    RACE.laneW = RACE.W / RACE.LANES;
    RACE.carW = RACE.laneW * 0.56;
    RACE.carH = Math.round(RACE.carW * 1.8);
    RACE.COLORS = ['#f87171', '#fbbf24', '#a78bfa', '#34d399', '#38bdf8'];

    function raceNew(seed) {
        return {
            r: rng(seed), tick: 0, lane: 1, carX: RACE.laneW * 1.5,
            obstacles: [], road: 0, speed: 3.2, score: 0, over: false
        };
    }

    function raceSetLane(s, lane) {
        if (s.over) return;
        s.lane = Math.max(0, Math.min(RACE.LANES - 1, lane));
    }

    function raceStep(s) {
        if (s.over) return;
        s.tick++;
        s.speed += 0.0016;
        s.road += s.speed;
        s.score += s.speed * 0.05;
        if (s.tick % Math.max(26, Math.round(70 - s.speed * 4)) === 0) {
            const band = Math.floor(s.r() * RACE.LANES);
            const last = s.obstacles[s.obstacles.length - 1];
            if (!last || last.y > RACE.carH * 1.6 || last.lane !== band) {
                s.obstacles.push({ lane: band, y: -RACE.carH, c: RACE.COLORS[Math.floor(s.r() * RACE.COLORS.length)] });
            }
        }
        for (const o of s.obstacles) o.y += s.speed;
        s.obstacles = s.obstacles.filter(o => o.y < RACE.H + RACE.carH);
        s.carX += (RACE.laneW * (s.lane + 0.5) - s.carX) * 0.25;
        const myY = RACE.H - RACE.carH * 0.9;
        for (const o of s.obstacles) {
            const ox = RACE.laneW * (o.lane + 0.5);
            if (Math.abs(ox - s.carX) < RACE.carW * 0.85 && Math.abs(o.y - myY) < RACE.carH * 0.9) {
                s.over = true;
                break;
            }
        }
        if (s.tick >= MAX_TICKS) s.over = true;
    }

    /** log: [[tick, lane], ...] — "tick" = bosish paytida tugagan qadamlar soni. */
    function raceSimulate(seed, log) {
        const s = raceNew(seed);
        const L = Array.isArray(log) ? log.slice(0, MAX_LOG) : [];
        let i = 0;
        while (!s.over) {
            while (i < L.length && Number(L[i][0]) <= s.tick) {
                if (Number(L[i][0]) === s.tick) raceSetLane(s, Number(L[i][1]));
                i++;
            }
            raceStep(s);
        }
        return { ticks: s.tick, score: Math.floor(s.score) };
    }

    /* --------------------------------------------------------------- TETRIS */
    const TETRIS = { COLS: 10, ROWS: 16 };
    TETRIS.SHAPES = [
        { c: '#22d3ee', k: [[1, 1, 1, 1]] },
        { c: '#fbbf24', k: [[1, 1], [1, 1]] },
        { c: '#a78bfa', k: [[0, 1, 0], [1, 1, 1]] },
        { c: '#34d399', k: [[0, 1, 1], [1, 1, 0]] },
        { c: '#f87171', k: [[1, 1, 0], [0, 1, 1]] },
        { c: '#60a5fa', k: [[1, 0, 0], [1, 1, 1]] },
        { c: '#fb923c', k: [[0, 0, 1], [1, 1, 1]] }
    ];

    function tetShape(s) {
        const t = TETRIS.SHAPES[Math.floor(s.r() * TETRIS.SHAPES.length)];
        return { k: t.k.map(row => row.slice()), c: t.c, x: Math.floor((TETRIS.COLS - t.k[0].length) / 2), y: 0 };
    }

    function tetNew(seed) {
        const s = {
            r: rng(seed), tick: 0, score: 0, lines: 0, level: 1, over: false, fall: 48,
            grid: Array.from({ length: TETRIS.ROWS }, () => Array(TETRIS.COLS).fill(null))
        };
        s.cur = tetShape(s);
        s.next = tetShape(s);
        return s;
    }

    function tetHit(s, p, nx, ny) {
        for (let r = 0; r < p.k.length; r++) {
            for (let c = 0; c < p.k[r].length; c++) {
                if (!p.k[r][c]) continue;
                const gx = nx + c, gy = ny + r;
                if (gx < 0 || gx >= TETRIS.COLS || gy >= TETRIS.ROWS) return true;
                if (gy >= 0 && s.grid[gy][gx]) return true;
            }
        }
        return false;
    }

    function tetLock(s) {
        const p = s.cur;
        for (let r = 0; r < p.k.length; r++) {
            for (let c = 0; c < p.k[r].length; c++) {
                if (!p.k[r][c]) continue;
                const gy = p.y + r, gx = p.x + c;
                if (gy < 0) { s.over = true; return; }
                s.grid[gy][gx] = p.c;
            }
        }
        let cleared = 0;
        for (let r = TETRIS.ROWS - 1; r >= 0; r--) {
            if (s.grid[r].every(v => v)) {
                s.grid.splice(r, 1);
                s.grid.unshift(Array(TETRIS.COLS).fill(null));
                cleared++;
                r++;
            }
        }
        if (cleared) {
            s.score += [0, 40, 100, 300, 1200][cleared] * s.level;
            s.lines += cleared;
            const lvl = Math.floor(s.lines / 10) + 1;
            if (lvl > s.level) { s.level = lvl; s.fall = Math.max(6, 48 - (lvl - 1) * 5); }
        }
        s.cur = s.next;
        s.next = tetShape(s);
        if (tetHit(s, s.cur, s.cur.x, s.cur.y)) s.over = true;
        return cleared;
    }

    function tetAction(s, a) {
        if (s.over) return 0;
        const p = s.cur;
        if (a === 'l' && !tetHit(s, p, p.x - 1, p.y)) p.x--;
        if (a === 'r' && !tetHit(s, p, p.x + 1, p.y)) p.x++;
        if (a === 'rot') {
            const k = p.k;
            const rotated = k[0].map((_, i) => k.map(row => row[i]).reverse());
            p.k = rotated;
            let ok = false;
            for (const dx of [0, -1, 1, -2, 2]) {
                if (!tetHit(s, p, p.x + dx, p.y)) { p.x += dx; ok = true; break; }
            }
            if (!ok) p.k = k;
        }
        if (a === 'd') {
            if (!tetHit(s, p, p.x, p.y + 1)) { p.y++; s.score++; }
            else return tetLock(s);
        }
        return 0;
    }

    function tetStep(s) {
        if (s.over) return 0;
        s.tick++;
        let cleared = 0;
        if (s.tick % s.fall === 0) {
            if (!tetHit(s, s.cur, s.cur.x, s.cur.y + 1)) s.cur.y++;
            else cleared = tetLock(s);
        }
        if (s.tick >= MAX_TICKS) s.over = true;
        return cleared;
    }

    /** log: [[tick, action], ...]. timeline — arvoh hisobi uchun [[tick, score], ...]. */
    function tetSimulate(seed, log) {
        const s = tetNew(seed);
        const L = Array.isArray(log) ? log.slice(0, MAX_LOG) : [];
        const timeline = [];
        let last = -1, i = 0;
        const mark = () => { if (s.score !== last) { timeline.push([s.tick, s.score]); last = s.score; } };
        while (!s.over) {
            while (i < L.length && Number(L[i][0]) <= s.tick) {
                if (Number(L[i][0]) === s.tick && ['l', 'r', 'rot', 'd'].includes(L[i][1])) tetAction(s, L[i][1]);
                i++;
                if (s.over) break;
            }
            if (s.over) break;
            tetStep(s);
            mark();
        }
        mark();
        return { ticks: s.tick, score: s.score, lines: s.lines, level: s.level, timeline: timeline.slice(-400) };
    }

    /* --------------------------------------------------------- TO'RTTA QATOR */
    const C4 = { ROWS: 6, COLS: 7 };

    function c4Empty() { return '.'.repeat(C4.ROWS * C4.COLS); }

    /** Tosh tushgan qator yoki -1 (ustun to'la). board — 42 belgili satr. */
    function c4Drop(board, col, mark) {
        if (!(col >= 0 && col < C4.COLS)) return { board, row: -1 };
        for (let r = C4.ROWS - 1; r >= 0; r--) {
            const i = r * C4.COLS + col;
            if (board[i] === '.') return { board: board.slice(0, i) + mark + board.slice(i + 1), row: r };
        }
        return { board, row: -1 };
    }

    /** '1' | '2' | 'draw' | null, va g'alaba chizig'i. */
    function c4Result(board) {
        const at = (r, c) => (r >= 0 && r < C4.ROWS && c >= 0 && c < C4.COLS) ? board[r * C4.COLS + c] : null;
        for (let r = 0; r < C4.ROWS; r++) {
            for (let c = 0; c < C4.COLS; c++) {
                const m = at(r, c);
                if (m !== '1' && m !== '2') continue;
                for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
                    const line = [[r, c]];
                    for (let k = 1; k < 4 && at(r + dr * k, c + dc * k) === m; k++) line.push([r + dr * k, c + dc * k]);
                    if (line.length === 4) return { winner: m, line };
                }
            }
        }
        return { winner: board.includes('.') ? null : 'draw', line: null };
    }

    /* ---------------------------------------------------------- DENGIZ JANGI */
    const BS = { N: 8, FLEET: [4, 3, 3, 2, 2] };

    /** Kemalar bir-biriga tegmaydi (burchak bilan ham). */
    function bsFleet(seed) {
        const r = rng(seed);
        for (let attempt = 0; attempt < 200; attempt++) {
            const busy = new Set();
            const ships = [];
            let ok = true;
            for (const len of BS.FLEET) {
                let placed = false;
                for (let t = 0; t < 300 && !placed; t++) {
                    const horiz = r() < 0.5;
                    const row = Math.floor(r() * (horiz ? BS.N : BS.N - len + 1));
                    const col = Math.floor(r() * (horiz ? BS.N - len + 1 : BS.N));
                    const cells = [];
                    for (let k = 0; k < len; k++) cells.push(horiz ? [row, col + k] : [row + k, col]);
                    if (cells.some(([a, b]) => busy.has(a * BS.N + b))) continue;
                    ships.push(cells);
                    for (const [a, b] of cells) {
                        for (let da = -1; da <= 1; da++) for (let db = -1; db <= 1; db++) {
                            const na = a + da, nb = b + db;
                            if (na >= 0 && na < BS.N && nb >= 0 && nb < BS.N) busy.add(na * BS.N + nb);
                        }
                    }
                    placed = true;
                }
                if (!placed) { ok = false; break; }
            }
            if (ok) return ships;
        }
        return null;
    }

    const api = {
        rng, MAX_TICKS, MAX_LOG,
        RACE, raceNew, raceSetLane, raceStep, raceSimulate,
        TETRIS, tetNew, tetAction, tetStep, tetSimulate, tetHit,
        C4, c4Empty, c4Drop, c4Result,
        BS, bsFleet
    };
    root.QalqonSim = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
