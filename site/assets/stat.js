/* qalqonai.uz hisoblagichi (server: index.ts -> site_visit).
 *
 * Cookie yo'q, shaxsiy ma'lumot yo'q: faqat sahifa, qayerdan kelgani
 * (qisqa havola / referrer) va tasodifiy brauzer raqami — bir odamni ikki
 * marta sanamaslik uchun. Har ertalab adminga Telegram'da hisobot keladi.
 * Muhim tugmalar bosilishi ham sanaladi: botga o'tdi, ilovani yukladi.
 */
(function () {
  'use strict';
  var URL = 'https://ytjvmmcpmpnaivtzymtq.supabase.co/functions/v1/ota-ona-bot';

  function vid() {
    try {
      var v = localStorage.getItem('q_vid');
      if (!v) {
        v = Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem('q_vid', v);
      }
      return v;
    } catch (e) { return ''; }
  }

  var q = new URLSearchParams(location.search);
  var utm = q.get('utm_source') || '';
  var ref = document.referrer || '';
  // Manba — tashrifning BIRINCHI sahifasi bo'yicha: sayt ichida yurganda
  // referrer qalqonai.uz bo'lib qoladi va manba yo'qolardi.
  try {
    var s = sessionStorage.getItem('q_src');
    if (s) { var o = JSON.parse(s); utm = o.u; ref = o.r; }
    else sessionStorage.setItem('q_src', JSON.stringify({ u: utm, r: ref }));
  } catch (e) {}

  function yubor(event) {
    var body = JSON.stringify({
      type: 'site_visit', vid: vid(), path: location.pathname,
      utm: utm, ref: ref, event: event || ''
    });
    try {
      // text/plain — "oddiy" so'rov: brauzer oldindan CORS so'rovi yubormaydi
      // va sahifa yopilayotganda ham yetib boradi.
      if (navigator.sendBeacon && navigator.sendBeacon(URL, new Blob([body], { type: 'text/plain' }))) return;
      fetch(URL, { method: 'POST', body: body, keepalive: true, mode: 'no-cors' });
    } catch (e) {}
  }

  yubor('');

  // Manzildagi ?utm_source=... ni yashiramiz (ulashilganda qayta sanalmasin).
  if (q.has('utm_source') && history.replaceState) {
    q.delete('utm_source');
    var qs = q.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = a.href;
    var ev = /t\.me\/qalqon_aibot/i.test(h) ? 'bot'
      : /qalqon\.apk/.test(h) ? 'apk'
      : /play\.google/.test(h) ? 'play'
      : /instagram\.com/.test(h) ? 'instagram'
      : /youtube\.com|youtu\.be/.test(h) ? 'youtube'
      : /t\.me\/aibotqalqon/i.test(h) ? 'telegram' : '';
    if (ev) yubor(ev);
  }, true);
})();
