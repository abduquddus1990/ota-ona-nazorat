# Bot kirish videosi (BotFather → Edit Description Picture)

`anim.html` — 640×360 sahna, 6 soniya. Video kadrma-kadr yoziladi:
Playwright sahifani ochadi, barcha CSS animatsiyalarni to'xtatib, har kadr
uchun `currentTime` ni qo'yadi; farzand nuqtasi va yo'l chizig'i
`.route` yo'li bo'ylab bir xil (ease-in-out) hisob bilan suriladi; 30 kadr/s,
2x o'lchamda (1280×720) skrinshot. Keyin:

    ffmpeg -framerate 30 -i frames/%03d.png -c:v libx264 -pix_fmt yuv420p -crf 22 -preset slow -movflags +faststart bot-intro.mp4

Natija: `assets/bot/bot-intro.mp4`, **960×540** — Telegram faqat 320×180, 640×360 yoki 960×540 ni qabul qiladi (1280×720 rad etilgan). ffmpeg buyrug'iga `-vf scale=960:540:flags=lanczos` qo'shing. Avatar: `assets/bot/bot-avatar.jpg`.
