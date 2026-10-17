"""Panelga kirish animatsiyasini Android ilovaga joylaydi.

Android ilova animatsiyani o'z fayllaridan, ilova ochilishi bilan
ko'rsatadi — Mini App yuklanguncha foydalanuvchi bo'sh ekranni emas,
animatsiyani ko'radi (AppWebActivity). Fayllar Mini App'dagisi bilan AYNAN
bir xil bo'lishi kerak, shuning uchun qo'lda emas, shu skript bilan
nusxalanadi:

    python tools/sync_android_splash.py          # nusxalash
    python tools/sync_android_splash.py --check  # farq bo'lsa xato (CI)

Manba — telegram_miniapp/ (GitHub Pages aynan shuni chiqaradi).
"""
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "telegram_miniapp"
DST = ROOT / "android/app/src/main/assets/splash"

FILES = [
    "splash.css",
    "splash.js",
    "assets/qalqon-qoriqchi.webp",
    "assets/sound/kirish.mp3",
    "assets/sound/xabar.mp3",
]

# Ilova sahifasi. Rejim va ovoz URL'ning # qismidan keladi:
#   index.html#full,on  — kunning birinchi ochilishi, to'liq sahna, ovoz bilan
#   index.html#short,off — qisqa logotip, ovozsiz
PAGE = """<!DOCTYPE html>
<!-- AVTOMATIK YARATILGAN — tools/sync_android_splash.py. Tahrir qilmang. -->
<html lang="uz">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="splash.css">
<style>html,body{margin:0;height:100%;background:#e4f1fb;-webkit-user-select:none;user-select:none}</style>
</head>
<body>
<script>
  var q = (location.hash || '').slice(1).split(',');
  window.QALQON_SPLASH_HOLD = true;
  window.QALQON_SPLASH_MODE = q[0] === 'short' ? 'short' : 'full';
  window.QALQON_SPLASH_OVOZ = q[1] !== 'off';
</script>
<script src="splash.js"></script>
<script>showPanelSplash(null);</script>
</body>
</html>
"""


def kerakli():
    out = {name: (SRC / name).read_bytes() for name in FILES}
    out["index.html"] = PAGE.encode("utf-8")
    return out


def main():
    check = "--check" in sys.argv
    farq = []
    for name, data in kerakli().items():
        target = DST / name
        # Windows'da git matnli fayllarni CRLF bilan yozadi — bu farq emas.
        bir_xil = lambda a, b: a.replace(b"\r\n", b"\n") == b.replace(b"\r\n", b"\n")
        if target.exists() and bir_xil(target.read_bytes(), data):
            continue
        farq.append(name)
        if not check:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
    if check and farq:
        print("Android'dagi animatsiya Mini App'dan farq qiladi: " + ", ".join(farq))
        print("Tuzatish: python tools/sync_android_splash.py")
        sys.exit(1)
    print("farq yo'q" if not farq else "yangilandi: " + ", ".join(farq))


if __name__ == "__main__":
    main()
