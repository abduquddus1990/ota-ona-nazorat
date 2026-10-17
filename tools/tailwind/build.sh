#!/usr/bin/env bash
# Mini App'ning Tailwind CSS'ini oldindan yig'adi: index.html va *.js dagi
# klasslardan tailwind.css (ildizda va telegram_miniapp/ da).
#
#   bash tools/tailwind/build.sh          # yig'ish
#   bash tools/tailwind/build.sh --check  # eskirgan bo'lsa xato (CI)
#
# GitHub Pages'ga chiqarishda (deploy.yml) baribir qayta yig'iladi, ya'ni
# yangi klass qo'shib, buni unutsangiz ham saytda uslub yo'qolmaydi.
set -euo pipefail
cd "$(dirname "$0")"
[ -d node_modules ] || npm ci --no-audit --no-fund --loglevel=error
npx tailwindcss -c tailwind.config.js -i input.css -o ../../tailwind.css.new --minify 2>/dev/null
cd ../..
if [ "${1:-}" = "--check" ]; then
  if ! cmp -s tailwind.css.new tailwind.css || ! cmp -s tailwind.css.new telegram_miniapp/tailwind.css; then
    rm -f tailwind.css.new
    echo "::error::tailwind.css eskirgan. Tuzatish: bash tools/tailwind/build.sh"
    exit 1
  fi
  rm -f tailwind.css.new
  echo "tailwind.css yangi"
else
  mv tailwind.css.new tailwind.css
  cp tailwind.css telegram_miniapp/tailwind.css
  echo "tailwind.css yig'ildi ($(wc -c < tailwind.css) bayt)"
fi
