// service-worker.js — PWA "o'rnatiladigan ilova" bo'lishi uchun minimal
// talab. MUHIM TUZATISH: avvalgi versiya "kesh-birinchi" strategiyasida
// edi — bu birinchi yuklangandan keyin YANGI deploy qilingan o'zgarishlarni
// UMUMAN ko'rsatmasdan, doim eski nusxani berardi (real foydalanuvchida
// aynan shu sabab "hech qanday o'zgarish yo'q" muammosi kuzatildi). Endi
// "tarmoq-birinchi" (network-first) strategiyasi ishlatiladi — internet
// bo'lganda doim eng yangi nusxa olinadi, faqat internet uzilganda kesh
// zaxira sifatida ishlatiladi.

const CACHE_NAME = "xodim-intizom-shell-v4";
const SHELL_FILES = ["./", "./style.css", "./app.js", "./manifest.json", "./bg-light.svg", "./bg-dark.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request)),
  );
});
