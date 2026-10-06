/* ==========================================================================
   OTA-ONA PANELIGA KIRISH ANIMATSIYASI va OVOZ EFFEKTLARI
   ==========================================================================

   Kunning BIRINCHI ochilishida — to'liq sahna (4,6 s): shahar xaritasi,
   farzand nuqtasi uydan maktabga boradi, maktab atrofida qalqon yonadi,
   farzandning HAQIQIY holati kartada chiqadi ("Madina maktabda · 08:05 da
   kirdi"), keyin bo'ri va va'da. Shu kunning keyingi ochilishlarida —
   1 soniyalik qisqa logotip: panelni kuniga bir necha marta ochadigan
   ota-onani har safar 4,6 soniya kutdirish charchatadi.

   Karta bezak emas: u panelga kirishdanoq birinchi savolga javob beradi.
   Server javobi 2,3 soniyagacha kelmasa, umumiy "himoyada" matni qoladi —
   noto'g'ri holatni ko'rsatgandan ko'ra umumiy gap yaxshi.

   Ovoz: telefonlar sahifa ochilishi bilan ovozni bloklaydi (Telegram
   ichida ayniqsa). Shuning uchun play() xatosi jimgina yutiladi — ovoz
   chiqmasa ham hech narsa buzilmaydi. Android ilovamizda WebView buni
   ruxsat beradi. Sozlamalarda o'chirib qo'yish mumkin (qalqon_ovoz).
   ========================================================================== */
(function () {
  'use strict';

  var OVOZ_KALIT = 'qalqon_ovoz';
  var KUN_KALIT = 'qalqon_splash_kun';

  // ------------------------------------------------------------------ ovoz
  var ovozlar = {};
  function ovozYoqmi() {
    try { return localStorage.getItem(OVOZ_KALIT) !== 'off'; } catch (e) { return true; }
  }
  function ovozChal(nom) {
    if (!ovozYoqmi()) return;
    try {
      var a = ovozlar[nom] || (ovozlar[nom] = new Audio('assets/sound/' + nom + '.mp3'));
      a.currentTime = 0;
      a.volume = 0.7;
      var p = a.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }
  function ovozniAlmashtir() {
    var yangi = !ovozYoqmi();
    try { localStorage.setItem(OVOZ_KALIT, yangi ? 'on' : 'off'); } catch (e) {}
    ovozKalitiniChiz();
    if (yangi) ovozChal('xabar');
  }
  function ovozKalitiniChiz() {
    var el = document.getElementById('ovozHolati');
    if (el) el.textContent = ovozYoqmi() ? 'Yoqilgan' : "O'chirilgan";
    var k = document.getElementById('ovozKalit');
    if (k) k.classList.toggle('on', ovozYoqmi());
  }
  window.qalqonOvoz = { chal: ovozChal, almashtir: ovozniAlmashtir, chiz: ovozKalitiniChiz };
  document.addEventListener('DOMContentLoaded', ovozKalitiniChiz);

  // ----------------------------------------------------------- yordamchilar
  function bugun() {
    // Toshkent kuni (UTC+5) — kechasi soat 00:00 da yangi kun boshlanadi.
    return new Date(Date.now() + 5 * 3600 * 1000).toISOString().slice(0, 10);
  }
  function soat(iso) {
    var d = new Date(new Date(iso).getTime() + 5 * 3600 * 1000);
    return d.toISOString().slice(11, 16);
  }
  function toza(t) {
    return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  // "Maktab" -> "maktabda", "Uy" -> "uyda", "To'garak" -> "to'garakda"
  function joyda(zona) {
    var z = String(zona || '').trim();
    if (!z) return 'hududda';
    return z.charAt(0).toLowerCase() + z.slice(1) + 'da';
  }
  function qachon(iso) {
    var daq = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (daq < 1) return 'hozirgina';
    if (daq < 60) return daq + ' daq oldin';
    if (daq < 1440) return Math.floor(daq / 60) + ' soat oldin';
    return Math.floor(daq / 1440) + ' kun oldin';
  }

  /** radar_status javobidan karta matni. Hech narsa aniq bo'lmasa — null. */
  function holatMatni(d) {
    var kids = (d && d.ok && d.children) || [];
    var k = kids[0];
    if (!k) return null;
    var ism = k.childName || 'Farzandingiz';
    var ev = (k.events || [])[0];
    if (ev && ev.created_at) {
      if (ev.alert_type === 'enter') {
        return { emoji: '🏫', sarlavha: ism + ' ' + joyda(ev.zone_name), izoh: soat(ev.created_at) + ' da kirdi' };
      }
      return { emoji: '🚶', sarlavha: ism + " yo'lda", izoh: (ev.zone_name || 'Hudud') + 'dan ' + soat(ev.created_at) + ' da chiqdi' };
    }
    if (k.lastPing && k.lastPing.recorded_at) {
      return { emoji: '🛡', sarlavha: ism + ' himoyada', izoh: 'Oxirgi joylashuv: ' + qachon(k.lastPing.recorded_at) };
    }
    return null;
  }

  // ------------------------------------------------------------------ sahna
  var SAHNA = '' +
    '<button type="button" class="qs-skip">O\'tkazib yuborish ›</button>' +
    '<div class="qs-map"><svg viewBox="0 0 390 420" preserveAspectRatio="xMidYMid slice">' +
      '<g fill="#dbe8f4"><rect x="14" y="14" width="96" height="70" rx="12"/><rect x="128" y="14" width="110" height="70" rx="12"/><rect x="330" y="14" width="50" height="160" rx="12"/>' +
      '<rect x="14" y="104" width="96" height="120" rx="12"/><rect x="128" y="250" width="110" height="150" rx="12"/><rect x="256" y="250" width="124" height="150" rx="12"/><rect x="14" y="250" width="96" height="150" rx="12"/></g>' +
      '<g stroke="#ffffff" stroke-width="12" fill="none" stroke-linecap="round"><path d="M0 236 H390"/><path d="M119 0 V420"/><path d="M247 0 V420"/><path d="M0 94 H390"/></g>' +
      '<circle cx="62" cy="330" r="24" fill="#1d6fe022"/><text x="62" y="338" font-size="22" text-anchor="middle">🏠</text>' +
      '<path class="qs-route" d="M62 330 C 70 280, 110 250, 150 236 S 230 200, 247 160 S 270 115, 290 110" stroke="#22b8e6" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<g class="qs-zone"><circle cx="290" cy="110" r="56" fill="#22b8e633" stroke="#22b8e6" stroke-width="2.5" stroke-dasharray="7 7"/></g>' +
      '<g class="qs-shield"><path d="M290 70 l32 12 v21 c0 20 -14 32 -32 40 c-18 -8 -32 -20 -32 -40 v-21 z" fill="#1d6fe0" fill-opacity=".16" stroke="#1d6fe0" stroke-width="3"/>' +
      '<text x="290" y="113" font-size="22" text-anchor="middle">🏫</text></g>' +
      '<g class="qs-dot" transform="translate(62,330)"><circle r="10" fill="#1d6fe0" fill-opacity=".25"/><circle r="8" fill="#1d6fe0" stroke="#fff" stroke-width="4"/></g>' +
    '</svg></div>' +
    '<div class="qs-note"><i class="qs-e">🛡</i><div><div class="qs-app">Qalqon AI · hozir</div>' +
      '<b class="qs-t">Farzandingiz himoyada</b><small class="qs-s">Holat yuklanmoqda…</small></div></div>' +
    '<img class="qs-wolf" src="assets/qalqon-qoriqchi.webp" alt="">' +
    '<div class="qs-brand"><div class="qs-logo"><span>🛡</span>Qalqon AI</div><h1>Farzandingiz xavfsiz —<br><em>siz xotirjam.</em></h1></div>' +
    '<div class="qs-bar"><i></i></div>';

  var QISQA = '<div class="qs-mini"><span>🛡</span><b>Qalqon AI</b></div>';

  function yop(el) {
    if (!el || el.dataset.yopildi) return;
    el.dataset.yopildi = '1';
    el.classList.add('qs-ket');
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 450);
  }

  /** Nuqta va chiziq bir xil hisob bilan: 0.35 s dan 1.8 s gacha, ease-in-out. */
  function yolniYurit(el) {
    var r = el.querySelector('.qs-route');
    var dot = el.querySelector('.qs-dot');
    if (!r || !dot || !r.getTotalLength) return;
    var L = r.getTotalLength();
    r.style.strokeDasharray = L;
    r.style.strokeDashoffset = L;
    var t0 = performance.now();
    function kadr(now) {
      if (!el.isConnected) return;
      var t = (now - t0) / 1000;
      var p = Math.max(0, Math.min(1, (t - 0.35) / 1.45));
      p = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      r.style.strokeDashoffset = L * (1 - p);
      var pt = r.getPointAtLength(L * p);
      dot.setAttribute('transform', 'translate(' + pt.x + ',' + pt.y + ')');
      if (t < 2) requestAnimationFrame(kadr);
    }
    requestAnimationFrame(kadr);
  }

  /**
   * Ota-ona paneli ochilganda chaqiriladi.
   * holatOl — radar_status javobini qaytaradigan Promise (yoki null).
   */
  window.showPanelSplash = function (holatOl) {
    if (document.getElementById('qalqonSplash')) return;
    var qisqa = false;
    try { qisqa = localStorage.getItem(KUN_KALIT) === bugun(); } catch (e) {}
    var harakatsiz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var el = document.createElement('div');
    el.id = 'qalqonSplash';
    el.className = 'qalqon-splash' + (qisqa || harakatsiz ? ' qs-qisqa' : '');
    el.setAttribute('role', 'presentation');
    el.innerHTML = (qisqa || harakatsiz) ? QISQA : SAHNA;
    document.body.appendChild(el);

    if (qisqa || harakatsiz) {
      setTimeout(function () { yop(el); }, 1000);
      return;
    }
    try { localStorage.setItem(KUN_KALIT, bugun()); } catch (e) {}

    el.querySelector('.qs-skip').addEventListener('click', function () { yop(el); });
    yolniYurit(el);
    ovozChal('kirish');

    // Karta 2,5 s da tushadi — javob shungacha kelsa, haqiqiy holat yoziladi.
    var muddat = Date.now() + 2300;
    if (holatOl && holatOl.then) {
      holatOl.then(function (d) {
        if (Date.now() > muddat) return;
        var h = holatMatni(d);
        if (!h) { el.querySelector('.qs-s').textContent = 'Qalqon AI'; return; }
        el.querySelector('.qs-e').textContent = h.emoji;
        el.querySelector('.qs-t').innerHTML = toza(h.sarlavha);
        el.querySelector('.qs-s').innerHTML = toza(h.izoh);
      }).catch(function () {});
    }
    setTimeout(function () {
      var s = el.querySelector('.qs-s');
      if (s && s.textContent === 'Holat yuklanmoqda…') s.textContent = 'Qalqon AI';
      ovozChal('xabar');
    }, 2500);
    setTimeout(function () { yop(el); }, 4900);
  };
})();
