import urllib.request
import json
import time
import sys
import os

# Fix Windows console UTF-8 output
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

BOT_TOKEN = "8992925094:AAE5K1N8VVxiCh9P6H1j7hCrYoTeIBmC8r0"
MINI_APP_URL = "https://abduquddus1990.github.io/ota-ona-nazorat/?v=5.4"
TELEGRAM_API = f"https://api.telegram.org/bot{BOT_TOKEN}"

ADMIN_USERNAMES = {"ai_loyihachi"}
ADMIN_FILE = "admin_ids.json"
USERS_FILE = "users_db.json"

def load_json(filepath, default):
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return default
    return default

def save_json(filepath, data):
    try:
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Error saving {filepath}:", e)

ADMIN_CHAT_IDS = set(load_json(ADMIN_FILE, []))
USER_APPROVAL_STATUS = load_json(USERS_FILE, {})
USER_LANG = {}

def save_admins():
    save_json(ADMIN_FILE, list(ADMIN_CHAT_IDS))

def save_users():
    save_json(USERS_FILE, USER_APPROVAL_STATUS)

def generate_family_code(user_id):
    num = abs((int(user_id) * 31 + 7919) % 900000) + 100000
    s = str(num)
    return f"{s[:3]}-{s[3:6]}"

def call_tg(method, data=None):
    url = f"{TELEGRAM_API}/{method}"
    try:
        if data:
            req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers={"Content-Type": "application/json"})
        else:
            req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"Telegram API Error [{method}]:", e)
        return {"ok": False, "error": str(e)}

def send_message(chat_id, html_text, reply_markup=None):
    payload = {
        "chat_id": chat_id,
        "text": html_text,
        "parse_mode": "HTML"
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup
    return call_tg("sendMessage", payload)

def notify_admins(html_text, reply_markup=None):
    print(f"Notifying {len(ADMIN_CHAT_IDS)} admin(s)...")
    for admin_id in ADMIN_CHAT_IDS:
        send_message(admin_id, html_text, reply_markup)

def get_start_menu_text(user_id, lang="uz", is_approved=True, is_admin=False):
    code = generate_family_code(user_id)
    if is_admin:
        return (
            f"👑 <b>QALQON AI — BOSH ADMINISTRATOR PANELI</b>\n\n"
            f"Assalomu alaykum, hurmatli Boshqaruvchi (@ai_loyihachi)!\n\n"
            f"🔑 <b>Admin Chat ID:</b> <code>{user_id}</code>\n"
            f"🛡️ <b>Huquq darajasi:</b> Yagona Bosh Administrator\n"
            f"🔔 <i>Barcha yangi ota-onalarning so'rovlari to'g'ridan-to'g'ri ushbu chatga keladi.</i>\n\n"
            f"Boshqaruv panelini ochish uchun pastdagi tugmani bosing:"
        )

    if lang == "ru":
        return (
            f"🛡️ <b>QALQON AI — ЦЕНТР РОДИТЕЛЬСКОГО КОНТРОЛЯ</b>\n\n"
            f"Добро пожаловать! Безопасность, школьные предметы и цифровые привычки вашего ребёнка под защитой 24/7.\n\n"
            f"🔑 <b>Ваш семейный код:</b> <code>{code}</code>\n"
            f"📍 <b>Онлайн-радар и локация:</b> <b>Бесплатно</b>\n"
            f"💎 <b>Pro Версия (AI & e-Maktab 100 баллов):</b> <b>10,000 сум/мес</b>\n"
            f"ℹ️ <i>Официальная почта: <code>alhamdulillah@tmail.ton</code></i>\n\n"
            f"Выберите нужный раздел:"
        )

    return (
        f"👋 <b>Assalomu alaykum!</b>\n\n"
        f"🛡️ <b>Qalqon AI</b> — Ota-ona nazorati va ta'limiy sun'iy intellekt tizimi.\n\n"
        f"Farzandingizning 1-11 sinf DTS darsliklari, 100 ballik baholari, jonli lokatsiyasi va ilovalar reytingini ko'rish uchun pastdagi tugmani bosing.\n\n"
        f"🔑 <b>Sizning oila kodingiz:</b> <code>{code}</code>\n"
        f"📍 <b>Jonli lokatsiya va radar:</b> <b>100% BEPUL</b>\n"
        f"💎 <b>Pro Versiya (AI & e-Maktab 100 ball):</b> <b>10,000 so'm/oy</b>\n"
        f"ℹ️ <i>Taklif va murojaatlar: <code>alhamdulillah@tmail.ton</code></i>\n\n"
        f"Quyidagi bo'limlardan birini tanlang:"
    )

def get_start_keyboard(user_id, lang="uz"):
    code = generate_family_code(user_id)
    if lang == "ru":
        return {
            "inline_keyboard": [
                [{"text": "🚀 Открыть Панель Управления (Mini App)", "web_app": {"url": f"{MINI_APP_URL}&lang=ru"}}],
                [{"text": "🔗 Подключить Ребёнка", "callback_data": f"action_pair_{code}"}, {"text": "🎬 Анализ Reels и Видео", "callback_data": "action_reels"}],
                [{"text": "💡 Отзывы и Предложения", "callback_data": "action_feedback"}, {"text": "🌐 Til / Язык (UZ/RU)", "callback_data": "action_lang"}]
            ]
        }
    return {
        "inline_keyboard": [
            [{"text": "🚀 Ota-ona Boshqaruv Panelini Ochish (Mini App)", "web_app": {"url": f"{MINI_APP_URL}&lang=uz"}}],
            [{"text": "🔗 Farzandni Ulash", "callback_data": f"action_pair_{code}"}, {"text": "🎬 Reels & Video Tahlili", "callback_data": "action_reels"}],
            [{"text": "💡 Taklif va Fikrlar", "callback_data": "action_feedback"}, {"text": "🌐 Til / Яzyк (UZ/RU)", "callback_data": "action_lang"}]
        ]
    }

def handle_update(update):
    if "callback_query" in update:
        cb = update["callback_query"]
        chat_id = cb["message"]["chat"]["id"]
        data = cb.get("data", "")
        lang = USER_LANG.get(chat_id, "uz")
        raw_username = (cb["from"].get("username") or "").lower().replace("@", "")
        is_admin = raw_username in ADMIN_USERNAMES
        if is_admin:
            ADMIN_CHAT_IDS.add(chat_id)
            save_admins()

        call_tg("answerCallbackQuery", {"callback_query_id": cb["id"]})

        if data.startswith("admin_approve_"):
            parts = data.replace("admin_approve_", "").split("_")
            target_chat_id = parts[0]
            target_username = parts[1] if len(parts) > 1 else ""
            USER_APPROVAL_STATUS[str(target_chat_id)] = "approved"
            save_users()
            send_message(chat_id, f"✅ <b>Muvaffaqiyatli:</b> @{target_username} ({target_chat_id}) uchun to'liq foydalanishga ruxsat berildi!")
            
            # Send notification to the user
            send_message(target_chat_id, "🎉 <b>Tabriklaymiz!</b>\n\nBosh administrator @ai_loyihachi sizning hisobingizni tasdiqladi! Endi barcha imkoniyatlar (lokatsiya, RAG darsliklar, AI tahlil) siz uchun to'liq faollashtirildi.", {
                "inline_keyboard": [
                    [{"text": "🚀 Boshqaruv Panelini Ochish (Mini App)", "web_app": {"url": f"{MINI_APP_URL}&lang=uz"}}]
                ]
            })
            return

        if data.startswith("admin_reject_"):
            parts = data.replace("admin_reject_", "").split("_")
            target_chat_id = parts[0]
            target_username = parts[1] if len(parts) > 1 else ""
            USER_APPROVAL_STATUS[str(target_chat_id)] = "rejected"
            save_users()
            send_message(chat_id, f"❌ <b>Rad etildi:</b> @{target_username} ({target_chat_id}) so'rovi test rejimida qoldirildi.")
            return

        if data.startswith("action_pair"):
            code = generate_family_code(chat_id)
            link = f"https://t.me/farzand_nazorat_bot?start=pair_{code.replace('-', '')}"
            send_message(chat_id, f"🔗 <b>FARZANDNI ULASH YO'RIQNOMASI:</b>\n\n1. Farzandingiz ushbu havolani ochishi kifoya:\n👉 {link}\n\n2. Yoki 6 xonali oila kodingiz: <code>{code}</code>")
        elif data == "action_reels":
            send_message(chat_id, "🎬 <b>REELS VA VIDEO TAHLILI:</b>\n\n📊 • 💻 IT va Dasturlash: 45%\n• 🔬 Ilmiy tajribalar: 25%\n• 🎮 O'yinlar: 30%")
        elif data == "action_feedback":
            send_message(chat_id, "💡 <b>TAKLIF VA MULOHAZALAR:</b>\n\n📬 Rasmiy pochta: <code>alhamdulillah@tmail.ton</code>\n👉 <a href='https://mail.google.com/mail/?view=cm&fs=1&to=alhamdulillah@tmail.ton'>Gmail orqali xat yozish</a>")
        elif data == "action_lang":
            send_message(chat_id, "🌐 Tilni tanlang / Выберите язык:", {
                "inline_keyboard": [
                    [{"text": "🇺🇿 O'zbek tili", "callback_data": "set_lang_uz"}, {"text": "🇷🇺 Русский язык", "callback_data": "set_lang_ru"}]
                ]
            })
        elif data == "set_lang_uz":
            USER_LANG[chat_id] = "uz"
            send_message(chat_id, "🇺🇿 Til o'zbekchaga o'zgartirildi!")
            send_message(chat_id, get_start_menu_text(chat_id, "uz", True, is_admin), get_start_keyboard(chat_id, "uz"))
        elif data == "set_lang_ru":
            USER_LANG[chat_id] = "ru"
            send_message(chat_id, "🇷🇺 Язык изменён на русский!")
            send_message(chat_id, get_start_menu_text(chat_id, "ru", True, is_admin), get_start_keyboard(chat_id, "ru"))
        return

    if "message" in update:
        msg = update["message"]
        chat_id = msg["chat"]["id"]
        text = msg.get("text", "")
        raw_username = (msg["from"].get("username") or "").lower().replace("@", "")
        is_admin = raw_username in ADMIN_USERNAMES

        if is_admin:
            ADMIN_CHAT_IDS.add(chat_id)
            save_admins()

        lang = USER_LANG.get(chat_id, "uz")

        if text.startswith("/start"):
            try:
                res_clean = call_tg("sendMessage", {
                    "chat_id": chat_id,
                    "text": "🛡️",
                    "reply_markup": json.dumps({"remove_keyboard": True})
                })
                if res_clean.get("ok") and res_clean.get("result", {}).get("message_id"):
                    call_tg("deleteMessage", {
                        "chat_id": chat_id,
                        "message_id": res_clean["result"]["message_id"]
                    })
            except Exception:
                pass

            if "pair_" in text:
                send_message(chat_id, "✅ <b>Siz ota-onangizning profiliga muvaffaqiyatli bog'landingiz!</b> Barcha darsliklar va imkoniyatlar faollashtirildi.")
                return

            if not is_admin and raw_username:
                admin_markup = {
                    "inline_keyboard": [
                        [
                            {"text": "✅ To'liq Ruxsat Berish", "callback_data": f"admin_approve_{chat_id}_{raw_username}"},
                            {"text": "❌ Test Rejimida Qoldirish", "callback_data": f"admin_reject_{chat_id}_{raw_username}"}
                        ]
                    ]
                }
                notify_admins(
                    f"👤 <b>YANGI OTA-ONA ULANISH SO'ROVI:</b>\n\n"
                    f"• <b>Username:</b> @{raw_username}\n"
                    f"• <b>Telegram ID:</b> <code>{chat_id}</code>\n"
                    f"• <b>Oila kodi:</b> <code>{generate_family_code(chat_id)}</code>\n\n"
                    f"<i>Ushbu foydalanuvchiga to'liq (test bo'lmagan) variantdan foydalanishiga ruxsat berasizmi?</i>",
                    admin_markup
                )

            send_message(chat_id, get_start_menu_text(chat_id, lang, True, is_admin), get_start_keyboard(chat_id, lang))
            return

        if text.startswith("/farzand"):
            code = generate_family_code(chat_id)
            link = f"https://t.me/farzand_nazorat_bot?start=pair_{code.replace('-', '')}"
            send_message(chat_id, f"🔗 <b>FARZANDNI ULASH:</b>\n\n👉 {link}\n🔑 Oila kodi: <code>{code}</code>")
            return

        if text.startswith("/reels"):
            send_message(chat_id, "🎬 <b>REELS VA VIDEO TAHLILI:</b>\n\n📊 • 💻 IT va Dasturlash: 45%\n• 🔬 Ilmiy tajribalar: 25%\n• 🎮 O'yinlar: 30%")
            return

        if text.startswith("/taklif"):
            send_message(chat_id, "💡 <b>TAKLIF VA MULOHAZALAR:</b>\n\n📬 Rasmiy pochta: <code>alhamdulillah@tmail.ton</code>\n👉 <a href='https://mail.google.com/mail/?view=cm&fs=1&to=alhamdulillah@tmail.ton'>Gmail orqali xat yozish</a>")
            return

def setup_bot_commands():
    commands = [
        {"command": "start", "description": "🚀 Asosiy boshqaruv menyusi"},
        {"command": "farzand", "description": "🔗 Farzandni ulash kodi va havolasi"},
        {"command": "reels", "description": "🎬 Reels va video tahlili"},
        {"command": "taklif", "description": "💡 Taklif va mulohaza yuborish"}
    ]
    call_tg("setMyCommands", {"commands": commands})
    call_tg("setChatMenuButton", {
        "menu_button": {
            "type": "web_app",
            "text": "📊 Ota-Ona Paneli",
            "web_app": {"url": MINI_APP_URL}
        }
    })

def main():
    print("="*60)
    print("[QALQON AI] Telegram Bot Engine is running 24/7...")
    print(f"[QALQON AI] Sole Admin: @ai_loyihachi")
    print(f"[QALQON AI] Admin Chat IDs cached: {list(ADMIN_CHAT_IDS)}")
    print("="*60)
    setup_bot_commands()

    last_offset = 0
    while True:
        try:
            url = f"{TELEGRAM_API}/getUpdates?offset={last_offset}&timeout=20"
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=25) as resp:
                data = json.loads(resp.read().decode("utf-8"))

            if data.get("ok"):
                for update in data.get("result", []):
                    last_offset = update["update_id"] + 1
                    handle_update(update)
        except Exception as e:
            print("Polling Error:", e)
            time.sleep(2)

if __name__ == "__main__":
    main()
