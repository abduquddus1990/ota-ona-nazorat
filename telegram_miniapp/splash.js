/* ==========================================================================
   OTA-ONA PANELIGA KIRISH ANIMATSIYASI va OVOZ EFFEKTLARI
   ==========================================================================

   Kunning BIRINCHI ochilishida — to'liq sahna (6 s): markazda qalqon,
   atrofida to'rt yo'nalish — xavfsizlik (farzandning HAQIQIY holati:
   "Madina maktabda · 08:05 da kirdi"), AI murabbiy, xulosa, ekran vaqti —
   ular qalqonga yig'iladi, keyin bo'ri va va'da. Shu kunning keyingi ochilishlarida —
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
  // "Hammasi bitta qalqonda" (2026-10-06 da tasdiqlangan): markazda qalqon,
  // atrofida to'rt yo'nalish. Faqat XAVFSIZLIK kartasi haqiqiy ma'lumot
  // ko'rsatadi; qolganlari — imkoniyat tavsifi. O'ylab topilgan raqam
  // ("matematika +12%") ota-onani chalg'itadi, shuning uchun yo'q.
  var SAHNA = '' +
    '<button type="button" class="qs-skip">O\'tkazib yuborish ›</button>' +
    '<svg class="qs-lines" viewBox="0 0 390 844" preserveAspectRatio="none">' +
      '<path class="qs-ln qs-l1" d="M150 236 L170 335"/><path class="qs-ln qs-l2" d="M235 300 L215 335"/>' +
      '<path class="qs-ln qs-l3" d="M150 545 L172 476"/><path class="qs-ln qs-l4" d="M235 505 L215 476"/></svg>' +
    '<div class="qs-hub"><svg viewBox="0 0 150 150">' +
      '<circle class="qs-pulse" cx="75" cy="75" r="62" fill="none" stroke="#1d6fe0" stroke-width="3"/>' +
      '<circle cx="75" cy="75" r="62" fill="#ffffffcc"/>' +
      '<circle class="qs-ring" cx="75" cy="75" r="70" fill="none" stroke="#22b8e6" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M75 38 l30 11 v20 c0 19 -13 31 -30 38 c-17 -7 -30 -19 -30 -38 v-20 z" fill="#0f2a4a"/>' +
      '<path d="M62 75 l9 9 l18 -19" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg></div>' +
    '<div class="qs-card qs-c1"><i class="qs-e">📍</i><div class="qs-k">Xavfsizlik</div><b class="qs-t">Farzandingiz himoyada</b><small class="qs-s">Holat yuklanmoqda…</small></div>' +
    '<div class="qs-card qs-c2"><i>🎓</i><div class="qs-k">AI murabbiy</div><b>Darsda yordam</b><small>1–11-sinf, o\'zi topishga o\'rgatadi</small></div>' +
    '<div class="qs-card qs-c3"><i>📊</i><div class="qs-k">Xulosa</div><b>Farzandingiz haqida</b><small>Haftalik tahlil va suhbat savollari</small></div>' +
    '<div class="qs-card qs-c4"><i>⏱</i><div class="qs-k">Ekran vaqti</div><b>Muvozanat</b><small>Taqiq emas — kelishuv</small></div>' +
    '<div class="qs-chips"><span>🆘 SOS</span><span>🏆 Ball va sovg\'alar</span><span>💬 Oila chati</span></div>' +
    '<img class="qs-wolf" src="assets/qalqon-qoriqchi.webp" alt="">' +
    '<div class="qs-brand"><div class="qs-logo"><span>🛡</span>Qalqon AI</div>' +
      '<p>Xavfsizlik, bilim va oila — bitta qalqonda.</p>' +
      '<h1>Farzandingiz xavfsiz —<br><em>siz xotirjam.</em></h1></div>' +
    '<div class="qs-bar"><i></i></div>';

  var QISQA = '<div class="qs-mini"><span>🛡</span><b>Qalqon AI</b></div>';

  function yop(el) {
    if (!el || el.dataset.yopildi) return;
    el.dataset.yopildi = '1';
    el.classList.add('qs-ket');
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 450);
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
    ovozChal('kirish');

    // Xavfsizlik kartasi ~0,7 s da paydo bo'lib, 3,8 s gacha turadi —
    // javob shungacha kelsa, haqiqiy holat yoziladi.
    var muddat = Date.now() + 3600;
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
    }, 3600);
    setTimeout(function () { ovozChal('xabar'); }, 4100);
    setTimeout(function () { yop(el); }, 6300);
  };
})();
