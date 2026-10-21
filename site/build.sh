#!/bin/bash
# qalqonai.uz saytini yig'adi: bosh sahifa (site/) + huquqiy hujjatlar.
#
# Hujjatlarning manbasi — repo ildizidagi fayllar (Mini App ham shularni
# ishlatadi). Ularni bu yerga nusxalab qo'ymaymiz: aks holda ikki nusxa
# bir-biridan uzoqlashib ketadi va Play Console'dagi manzil eskirgan
# matnni ko'rsatadi. Har safar shu skript yangi nusxa oladi.
#
# Ishlatish: site/build.sh <chiqish_papkasi>
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${1:?chiqish papkasini bering}"
mkdir -p "$OUT/assets"
cp "$ROOT/site/index.html" "$ROOT/site/CNAME" "$OUT/"
cp "$ROOT/site/assets/"* "$OUT/assets/"
# Farzand telefonini ulash sahifasi (Mini App "Farzandga havola yuborish").
mkdir -p "$OUT/ulash"
cp "$ROOT/site/ulash/index.html" "$OUT/ulash/"
# "Telefon ilovani o'chirmasin" yo'riqnomasi (Android: Avtostart.kt havolasi).
mkdir -p "$OUT/fon"
cp "$ROOT/site/fon/index.html" "$OUT/fon/"
# Qisqa havolalar: qalqonai.uz/ig, /yt, /tg -> manbasi sanaladi (assets/stat.js).
for d in ig yt tg; do
  mkdir -p "$OUT/$d"
  cp "$ROOT/site/$d/index.html" "$OUT/$d/"
done
for f in about.html privacy-policy.html terms.html account-deletion.html; do
  cp "$ROOT/$f" "$OUT/"
done
cp "$ROOT/assets/docs.css" "$ROOT/assets/docs.js" "$OUT/assets/"
# GitHub Pages Jekyll'ni o'chiradi — fayllar qanday bo'lsa, shunday beriladi.
touch "$OUT/.nojekyll"
echo "Sayt yig'ildi: $OUT"
