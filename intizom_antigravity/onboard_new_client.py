"""
onboard_new_client.py
----------------------
Yangi mijozni tizimga ulash jarayonini avtomatlashtiradi (TZ 15-bo'lim
va onboarding muhokamasi asosida).

NIMA QILADI (avtomatik):
  1. clients/<client_id>/ papkasini yaratadi
  2. Tanlangan sohaning shabloni (clients/templates/<industry>.json)ni
     clients/<client_id>/criteria.json sifatida nusxalaydi
  3. .env.example asosida clients/<client_id>/.env shablonini tayyorlaydi
     (CLIENT_ID va INDUSTRY avtomatik to'ldiriladi, qolgan kalitlar
     bo'sh — qo'lda to'ldirilishi kerak)

NIMA QILMAYDI (qo'lda bajarilishi kerak — skript oxirida eslatib beradi):
  - Yangi Supabase loyihasi yaratish va schema.sql'ni ishga tushirish
  - Yangi Telegram bot yaratish (BotFather)
  - .env fayldagi haqiqiy API kalitlarini kiritish

ISHLATISH:
    python onboard_new_client.py --client-id tasnif_konsalting --industry xususiy_ofis

Mavjud industry qiymatlarini ko'rish uchun:
    python onboard_new_client.py --list-industries
"""

import argparse
import shutil
import sys
from pathlib import Path

BASE_DIR = Path(__file__).parent
TEMPLATES_DIR = BASE_DIR / "clients" / "templates"
CLIENTS_DIR = BASE_DIR / "clients"
ENV_EXAMPLE = BASE_DIR / ".env.example"


def list_industries() -> list[str]:
    return sorted(p.stem for p in TEMPLATES_DIR.glob("*.json"))


def onboard(client_id: str, industry: str, force: bool = False):
    available = list_industries()
    if industry not in available:
        print(f"❌ Noto'g'ri soha: '{industry}'. Mavjud sohalar: {', '.join(available)}")
        sys.exit(1)

    client_dir = CLIENTS_DIR / client_id
    if client_dir.exists() and not force:
        print(f"❌ '{client_dir}' allaqachon mavjud. Qayta yozish uchun --force qo'shing.")
        sys.exit(1)

    client_dir.mkdir(parents=True, exist_ok=True)

    # 1) criteria.json — tanlangan soha shablonidan nusxa
    template_path = TEMPLATES_DIR / f"{industry}.json"
    criteria_path = client_dir / "criteria.json"
    shutil.copy(template_path, criteria_path)
    print(f"✅ Mezonlar: {criteria_path} ('{industry}' shablonidan)")

    # 2) .env shabloni
    env_path = client_dir / ".env"
    if ENV_EXAMPLE.exists():
        env_content = ENV_EXAMPLE.read_text(encoding="utf-8")
    else:
        env_content = (
            "BOT_TOKEN=\nSUPABASE_URL=\nSUPABASE_KEY=\nGEMINI_API_KEY=\n"
            "CAMERA_WEBAPP_URL=\nBONUS_MAX_PERCENT=0.10\nMONTHLY_CONVERSATION_NORM=20\n"
        )
    env_content += f"\n# Onboarding skripti tomonidan avtomatik qo'shildi:\nCLIENT_ID={client_id}\nINDUSTRY={industry}\n"
    env_path.write_text(env_content, encoding="utf-8")
    print(f"✅ .env shabloni: {env_path} (API kalitlarini qo'lda to'ldiring)")

    print(f"\n🎉 '{client_id}' mijozi uchun boshlang'ich fayllar tayyor.\n")
    print("QOLGAN QO'LDA BAJARILADIGAN QADAMLAR:")
    print(f"  1. Yangi Supabase loyihasi yarating, so'ng schema.sql'ni shu yerda ishga tushiring")
    print(f"  2. BotFather orqali yangi Telegram bot yarating, tokenini {env_path} ga qo'ying")
    print(f"  3. {env_path} dagi qolgan API kalitlarini (Gemini, Supabase) to'ldiring")
    print(f"  4. Kompyuterda: CLIENT_ID={client_id} muhit o'zgaruvchisi bilan bot.py'ni ishga tushiring")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Yangi mijozni tizimga ulash")
    parser.add_argument("--client-id", help="Mijoz identifikatori (masalan: tasnif_konsalting)")
    parser.add_argument("--industry", help="Soha (--list-industries bilan ko'ring)")
    parser.add_argument("--force", action="store_true", help="Mavjud mijoz papkasini qayta yozish")
    parser.add_argument("--list-industries", action="store_true", help="Mavjud sohalar ro'yxatini ko'rsatish")
    args = parser.parse_args()

    if args.list_industries:
        print("Mavjud sohalar:")
        for industry in list_industries():
            print(f"  - {industry}")
        sys.exit(0)

    if not args.client_id or not args.industry:
        parser.error("--client-id va --industry majburiy (yoki --list-industries ishlating)")

    onboard(args.client_id, args.industry, force=args.force)
