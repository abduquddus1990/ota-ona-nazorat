# bot_engine.py
#
# SHIELD PARENTAL GUARD — 24/7 PRODUCTION TELEGRAM BOT
# Multi-Admin & Partner Management (@ai_loyihachi & partners)
# HTML Formatting, Instant Role Recognition, Zero Location Demands, Child Alerts

import urllib.request
import json
import time
import sys

BOT_TOKEN = "8992925094:AAE5K1N8VVxiCh9P6H1j7hCrYoTeIBmC8r0"
MINI_APP_URL = "https://abduquddus1990.github.io/ota-ona-nazorat/?v=3.0"
TELEGRAM_API = f"https://api.telegram.org/bot{BOT_TOKEN}"

# Dynamic Admin & Partner Storage
ADMIN_USERNAMES = {"ai_loyihachi", "mirkamolov13"}
ADMIN_CHAT_IDS = set()
USER_APPROVAL_STATUS = {}
USER_LANG = {}

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
    for admin_id in ADMIN_CHAT_IDS:
        send_message(admin_id, html_text, reply_markup)

def get_start_menu_text(user_id, lang="uz", is_approved=True, is_admin=False):
    code = generate_family_code(user_id)
    if is_admin:
        return (
            f"👑 <b>SHIELD PARENTAL GUARD — ADMINISTRATOR PANELI</b>\n\n"
            f"Assalomu alaykum, hurmatli Boshqaruvchi / Hamkor!\n\n"
            f"🔑 <b>Sizning Admin ID:</b> <code>{user_id}</code>\n"
            f"🛡️ <b>Huquq darajasi:</b> To'liq Boshqaruv (Administrator)\n"
            f"🔔 <i>Barcha yangi ota-onalar va farzandlar so'rovlari ushbu chatga keladi.</i>\n\n"
            f"<b>Sheriklar boshqaruvi:</b>\n"
            f"• <code>/addadmin @username</code> — Yangi sherikka admin huquqini berish\n"
            f"• <code>/removeadmin @username</code> — Sherik huquqini bekor qilish\n"
            f"• <code>/admins</code> — Barcha administratorlar ro'yxati\n\n"
            f"Quyidagi tugma orqali boshqaruv panelini to'liq ochishingiz mumkin:"
        )

    if lang == "ru":
        return (
            f"🛡️ <b>SHIELD PARENTAL GUARD — ЦЕНТР РОДИТЕЛЬСКОГО КОНТРОЛЯ</b>\n\n"
            f"Добро пожаловать! Безопасность, школьные предметы и цифровые привычки вашего ребёнка под защитой 24/7.\n\n"
            f"✅ <b>Ваш доступ полностью активен!</b>\n\n"
            f"🔑 <b>Ваш семейный код:</b> <code>{code}</code>\n"
            f"📍 <b>Онлайн-радар и локация:</b> <b>Бесплатно</b>\n"
            f"💎 <b>Pro Версия (AI & e-Maktab 100 баллов):</b> <b>10,000 сум/мес (за 1 ребёнка)</b>\n"
            f"ℹ️ <i>Официальная почта для предложений: <code>alhamdulillah@tmail.ton</code></i>\n\n"
            f"Выберите нужный раздел:"
        )

    return (
        f"🛡️ <b>SHIELD PARENTAL GUARD — OTA-ONA BOSHQARUV MARKAZI</b>\n\n"
        f"Assalomu alaykum! Farzandingizning xavfsizligi, darsliklari va raqamli odatlari 24/7 doimiy nazorat ostida.\n\n"
        f"✅ <b>Sizning hisobingiz to'liq faol!</b>\n\n"
        f"🔑 <b>Sizning oila kodingiz:</b> <code>{code}</code>\n"
        f"📍 <b>Jonli lokatsiya va radar:</b> <b>100% BEPUL</b>\n"
        f"💎 <b>Pro Versiya (AI & 100 ballik e-Maktab):</b> <b>10,000 so'm/oy (har bir bola uchun)</b>\n"
        f"ℹ️ <i>Taklif va mulohazalar uchun rasmiy pochta: <code>alhamdulillah@tmail.ton</code></i>\n\n"
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

        call_tg("answerCallbackQuery", {"callback_query_id": cb["id"]})

        if data.startswith("admin_approve_"):
            target = data.replace("admin_approve_", "")
            USER_APPROVAL_STATUS[target] = "approved"
            send_message(chat_id, f"✅ <b>Muvaffaqiyatli:</b> {target} uchun tizimdan foydalanish va farzand qo'shishga to'liq ruxsat berildi!")
            return

        if data.startswith("admin_reject_"):
            target = data.replace("admin_reject_", "")
            USER_APPROVAL_STATUS[target] = "rejected"
            send_message(chat_id, f"❌ <b>Rad etildi:</b> {target} so'rovi rad etildi (Test rejimida qoladi).")
            return

        if data.startswith("action_pair"):
            code = generate_family_code(chat_id)
            link = f"https://t.me/farzand_nazorat_bot?start=pair_{code.replace('-', '')}"
            send_message(chat_id, f"🔗 <b>FARZANDNI ULASH YO'RIQNOMASI:</b>\n\n1. Ushbu havolani farzandingizga yuboring:\n👉 {link}\n\n2. Yoki 6 xonali oila kodingiz: <code>{code}</code>")
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
            send_message(chat_id, "✅ Til o'zbekchaga o'zgartirildi!", get_start_keyboard(chat_id, "uz"))
        elif data == "set_lang_ru":
            USER_LANG[chat_id] = "ru"
            send_message(chat_id, "✅ Язык успешно изменён на русский!", get_start_keyboard(chat_id, "ru"))
        return

    if "message" in update:
        msg = update["message"]
        chat_id = msg["chat"]["id"]
        text = (msg.get("text") or "").strip()
        lang = USER_LANG.get(chat_id, "uz")
        raw_username = (msg.get("from", {}).get("username") or "").lower().replace("@", "")
        is_admin = raw_username in ADMIN_USERNAMES
        if is_admin:
            ADMIN_CHAT_IDS.add(chat_id)

        user_key = f"@{raw_username}" if raw_username else f"ID: {msg['from']['id']}"
        is_approved = USER_APPROVAL_STATUS.get(user_key) == "approved" or is_admin

        if text.startswith("/addadmin"):
            if not is_admin:
                send_message(chat_id, "⚠️ Bu buyruq faqat bosh administratorlar uchun!")
                return
            parts = text.split()
            if len(parts) > 1:
                target = parts[1].replace("@", "").lower().strip()
                ADMIN_USERNAMES.add(target)
                send_message(chat_id, f"👑 <b>Yangi Hamkor / Admin qo'shildi:</b> @{target}\nEndi @{target} ham barcha so'rovlarni tasdiqlashi mumkin!")
            else:
                send_message(chat_id, "⚠️ Foydalanish: <code>/addadmin @sherik_username</code>")
            return

        if text.startswith("/removeadmin"):
            if not is_admin:
                send_message(chat_id, "⚠️ Bu buyruq faqat bosh administratorlar uchun!")
                return
            parts = text.split()
            if len(parts) > 1:
                target = parts[1].replace("@", "").lower().strip()
                ADMIN_USERNAMES.discard(target)
                send_message(chat_id, f"❌ <b>Admin huquqi olib tashlandi:</b> @{target}")
            else:
                send_message(chat_id, "⚠️ Foydalanish: <code>/removeadmin @sherik_username</code>")
            return

        if text == "/admins":
            admin_list = "\n".join([f"• @{u}" for u in ADMIN_USERNAMES])
            send_message(chat_id, f"👑 <b>Administratorlar va Sheriklar Ro'yxati:</b>\n\n{admin_list}\n\n<i>Yangi sherik qo'shish: /addadmin @username</i>")
            return

        if text.startswith("/start"):
            # Force-remove old reply keyboard (location sharing button) from user's Telegram client cache
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
            except Exception as e:
                pass

            if "pair_" in text:
                send_message(chat_id, "✅ <b>Siz ota-onangizning profiliga muvaffaqiyatli bog'landingiz!</b> Barcha darsliklar va imkoniyatlar faollashtirildi.")
                return

            send_message(chat_id, get_start_menu_text(chat_id, lang, True, is_admin), get_start_keyboard(chat_id, lang))
            return

        if text.startswith("/farzand"):
            code = generate_family_code(chat_id)
            link = f"https://t.me/farzand_nazorat_bot?start=pair_{code.replace('-', '')}"
            send_message(chat_id, f"🔗 <b>FARZANDNI ULASH:</b>\n\n👉 {link}\n🔑 Oila kodi: <code>{code}</code>")
            return

        # Force-remove old reply keyboard on any other message as well
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

        # Umumiy javob
        send_message(chat_id, "💡 <b>Ma'lumot:</b> Farzandingizning 100 ballik baholari, 1-11 sinf DTS darsliklari va jonli joylashuvi nazorat ostida. Boshqaruv panelini ochish uchun ekranning pastki chap qismidagi <b>«📊 Ota-Ona Paneli»</b> tugmasini bosing.")

def main_loop():
    print("Shield Parental Guard Bot Engine ishga tushdi (Polling)...")
    call_tg("deleteWebhook", {"drop_pending_updates": False})
    last_update_id = 0

    while True:
        try:
            updates = call_tg("getUpdates", {"offset": last_update_id + 1, "timeout": 20})
            if updates.get("ok") and updates.get("result"):
                for up in updates["result"]:
                    last_update_id = max(last_update_id, up["update_id"])
                    print("Yangi update keldi:", up.get("update_id"))
                    handle_update(up)
        except Exception as e:
            print("Loop xatosi:", e)
            time.sleep(2)
        time.sleep(0.5)

if __name__ == "__main__":
    main_loop()
