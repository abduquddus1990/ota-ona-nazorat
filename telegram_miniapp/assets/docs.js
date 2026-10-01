/* Hujjat tilini tanlash.
 *
 * Uchala til bitta faylda turadi va havola bitta bo'ladi. Buning sababi
 * amaliy: Play Console'ga, Google tekshiruviga, botga va saytga bir xil
 * manzil beriladi — uchta alohida fayl bo'lsa, qaysi biri eskirganini
 * kuzatib bo'lmaydi.
 *
 * Boshlang'ich til: manzildagi ?lang= -> brauzer tili -> o'zbekcha.
 * Google tekshiruvchisining brauzeri inglizcha bo'ladi, shuning uchun u
 * hech narsa bosmasdan inglizcha matnni ko'radi.
 */
(function () {
  'use strict';
  var TILLAR = ['uz', 'ru', 'en'];

  function qoy(til) {
    if (TILLAR.indexOf(til) < 0) til = 'uz';
    TILLAR.forEach(function (t) {
      var bor = document.querySelector('[data-lang="' + t + '"]');
      if (bor) bor.classList.toggle('on', t === til);
      var btn = document.querySelector('.langbar button[data-set="' + t + '"]');
      if (btn) btn.setAttribute('aria-pressed', String(t === til));
    });
    document.documentElement.lang = til;
    try { localStorage.setItem('qalqon_doc_lang', til); } catch (e) {}
  }

  function boshlangich() {
    try {
      var u = new URLSearchParams(location.search).get('lang');
      if (u && TILLAR.indexOf(u) >= 0) return u;
    } catch (e) {}
    try {
      var saqlangan = localStorage.getItem('qalqon_doc_lang');
      if (saqlangan && TILLAR.indexOf(saqlangan) >= 0) return saqlangan;
    } catch (e) {}
    var n = (navigator.language || 'uz').slice(0, 2).toLowerCase();
    return TILLAR.indexOf(n) >= 0 ? n : 'uz';
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.langbar button[data-set]') : null;
    if (!b) return;
    qoy(b.getAttribute('data-set'));
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { qoy(boshlangich()); });
  } else {
    qoy(boshlangich());
  }
})();
