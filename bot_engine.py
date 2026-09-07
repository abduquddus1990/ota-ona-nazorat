import urllib.request
import json
import time
import sys
import os
import random

# Fix Windows console UTF-8 output
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

# Load from .env file securely
def get_env_var(name, default=""):
    # Prefer process env, then .env next to this file, then backend/.env
    env_val = os.environ.get(name)
    if env_val:
        return env_val.strip().strip('"').strip("'")
    here = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.join(here, ".env"),
        os.path.join(here, "backend", ".env"),
        ".env",
        os.path.join("backend", ".env"),
    ]
    for env_path in candidates:
        if not os.path.exists(env_path):
            continue
        with open(env_path, "r", encoding="utf-8") as env_f:
            for line in env_f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if line.startswith(f"{name}="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    return default

BOT_TOKEN = get_env_var("MAIN_BOT_TOKEN", "")
if not BOT_TOKEN:
    # Also accept BOT_TOKEN for webhook/env parity
    BOT_TOKEN = get_env_var("BOT_TOKEN", "")

MINI_APP_URL = get_env_var("MINI_APP_URL", "https://abduquddus1990.github.io/ota-ona-nazorat/?v=5.4")
TELEGRAM_API = f"https://api.telegram.org/bot{BOT_TOKEN}" if BOT_TOKEN else ""

ADMIN_USERNAMES = {"ai_loyihachi"}
ADMIN_FILE = "admin_ids.json"
USERS_FILE = "users_db.json"
FAMILY_CODES_FILE = "family_codes.json"
PENDING_FILE = "pending_child_onboard.json"

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

ADMIN_CHAT_IDS = set(load_json(ADMIN_FILE, [358795989]))
ADMIN_CHAT_IDS.add(358795989)
USER_APPROVAL_STATUS = load_json(USERS_FILE, {})
USER_LANG = {}
FAMILY_CODES = load_json(FAMILY_CODES_FILE, {})
PENDING_CHILD = load_json(PENDING_FILE, {})  # chat_id -> {code, parent_id, step, age?}

def save_admins():
    save_json(ADMIN_FILE, list(ADMIN_CHAT_IDS))

def save_users():
    save_json(USERS_FILE, USER_APPROVAL_STATUS)

def save_pending():
    save_json(PENDING_FILE, PENDING_CHILD)

def normalize_code(code):
    """Store/compare family codes as plain digits (no hyphen required)."""
    return "".join(ch for ch in str(code or "") if ch.isdigit())

def get_unique_family_code(user_id):
    uid_str = str(user_id)
    if uid_str in FAMILY_CODES:
        code = normalize_code(FAMILY_CODES[uid_str])
        if len(code) == 6 and code != FAMILY_CODES[uid_str]:
            FAMILY_CODES[uid_str] = code
            save_json(FAMILY_CODES_FILE, FAMILY_CODES)
        elif len(code) == 6:
            return code
        # Invalid legacy value — regenerate below
    existing_codes = {normalize_code(c) for c in FAMILY_CODES.values() if isinstance(c, str) and normalize_code(c)}
    for _ in range(10000):
        code_str = f"{random.randint(100000, 999999)}"
        if code_str not in existing_codes:
            FAMILY_CODES[uid_str] = code_str
            save_json(FAMILY_CODES_FILE, FAMILY_CODES)
            return code_str
    raise RuntimeError("Could not allocate a unique 6-digit family code")

def generate_family_code(user_id):
    return get_unique_family_code(user_id)

def find_parent_by_code(code):
    digits = normalize_code(code)
    if len(digits) != 6:
        return None
    for uid, stored in FAMILY_CODES.items():
        if not isinstance(stored, str):
            continue
        if normalize_code(stored) == digits:
            return uid
    return None

def pair_deep_link(code):
    digits = normalize_code(code)
    return f"https://t.me/qalqon_aibot?start=pair_{digits}"

def persist_child_profile(child_chat_id, parent_id, code, age, sinf):
    uid = str(child_chat_id)
    existing = USER_APPROVAL_STATUS.get(uid)
    profile = existing if isinstance(existing, dict) else {}
    profile.update({
        "role": "child",
        "family_code": normalize_code(code),
        "parent_id": str(parent_id) if parent_id else None,
        "age": int(age),
        "sinf": int(sinf),
        "status": "paired",
    })
    USER_APPROVAL_STATUS[uid] = profile
    save_users()

def call_tg(method, data=None):
    if not BOT_TOKEN or not TELEGRAM_API:
        print("Telegram API Error: MAIN_BOT_TOKEN / BOT_TOKEN missing from env/.env")
        return {"ok": False, "error": "missing_bot_token"}
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

def begin_child_onboard(chat_id, clean_code, parent_id):
    PENDING_CHILD[str(chat_id)] = {
        "code": normalize_code(clean_code),
        "parent_id": parent_id,
        "step": "age",
    }
    save_pending()
    child_start_msg = (
        "🐺 <b>ASSALOMU ALAYKUM, YOSH QAHRAMON!</b>\n\n"
        "Sizni ota-onangiz «Qalqon AI» xavfsizlik va dars yordamchisi tizimiga taklif qildi! 🌟\n\n"
        f"🔑 <b>Oila kodingiz:</b> <code>{normalize_code(clean_code)}</code>\n\n"
        "Avval <b>yoshingizni</b> yozing (masalan: <code>12</code>):"
    )
    send_message(chat_id, child_start_msg)

def handle_pending_child(chat_id, text):
    state = PENDING_CHILD.get(str(chat_id))
    if not state:
        return False
    step = state.get("step")
    raw = (text or "").strip()

    if step == "age":
        if not raw.isdigit() or not (3 <= int(raw) <= 25):
            send_message(chat_id, "⚠️ Yoshingizni raqam bilan yozing (3–25), masalan: <code>12</code>")
            return True
        state["age"] = int(raw)
        state["step"] = "sinf"
        PENDING_CHILD[str(chat_id)] = state
        save_pending()
        send_message(chat_id, "📚 Endi <b>sinfingizni</b> yozing (1–11), masalan: <code>7</code>:")
        return True

    if step == "sinf":
        if not raw.isdigit() or not (1 <= int(raw) <= 11):
            send_message(chat_id, "⚠️ Sinf 1 dan 11 gacha bo'lishi kerak. Masalan: <code>7</code>")
            return True
        age = state.get("age")
        code = state.get("code")
        parent_id = state.get("parent_id")
        sinf = int(raw)
        persist_child_profile(chat_id, parent_id, code, age, sinf)
        PENDING_CHILD.pop(str(chat_id), None)
        save_pending()
        child_markup = {
            "inline_keyboard": [
                [{"text": "🌟 Bola Panelini Ochish & Rozilik Berish", "web_app": {"url": f"{MINI_APP_URL}&role=child&code={normalize_code(code)}&age={age}&sinf={sinf}"}}]
            ]
        }
        send_message(
            chat_id,
            f"✅ <b>Ulandi!</b>\n\n"
            f"🔑 Oila kodi: <code>{normalize_code(code)}</code>\n"
            f"🎂 Yosh: <b>{age}</b>\n"
            f"🏫 Sinf: <b>{sinf}</b>\n\n"
            f"Pastdagi tugma orqali panelni oching va 4 ta jabha bo'yicha qoidalar bilan tanishing:",
            child_markup,
        )
        if parent_id:
            try:
                send_message(
                    int(parent_id),
                    f"🎉 Farzand ulandi!\n"
                    f"👤 Child ID: <code>{chat_id}</code>\n"
                    f"🎂 Yosh: <b>{age}</b> | 🏫 Sinf: <b>{sinf}</b>\n"
                    f"🔑 Kod: <code>{normalize_code(code)}</code>",
                )
            except Exception:
                pass
        return True

    return False

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
            link = pair_deep_link(code)
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

        # Age / sinf onboarding after pair_ deep link
        if text and not text.startswith("/") and handle_pending_child(chat_id, text):
            return

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

            payload = text[len("/start"):].strip()
            if payload.startswith("child_") or payload.startswith("pair_"):
                clean_code = normalize_code(payload.replace("child_", "").replace("pair_", ""))
                if len(clean_code) != 6:
                    send_message(chat_id, "⚠️ Noto'g'ri oila kodi. Ota-onangizdan 6 xonali kodni so'rang yoki to'g'ri havolani oching.")
                    return
                parent_id = find_parent_by_code(clean_code)
                # Allow pairing even if parent code not yet in local JSON (e.g. first device)
                # but prefer known parent when present.
                begin_child_onboard(chat_id, clean_code, parent_id)
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

        if text.startswith("/taklif_farzand") or text.startswith("/invite"):
            parts = text.split()
            code = generate_family_code(chat_id)
            parent_name = f"@{raw_username}" if raw_username else "Ota-onangiz"
            if len(parts) > 1:
                child_target = parts[1].replace("@", "").strip()
                send_message(chat_id, f"🎙️ <b>OVOZLI TAKLIF YUBORILDI:</b>\n\nFarzandingiz @{child_target} ga ovozli xabar va ulanish havolasi tayyorlandi!\n\n🔗 Farzand ulanish kodi: <code>{code}</code>")
                # Farzandga yuboriladigan ovozli taklif matni va tugma
                child_invite_msg = (
                    f"🎙️ <b>OVOZLI XABAR — QALQON AI:</b>\n\n"
                    f"<i>«Assalomu alaykum, aziz do'stim! 🌟 {parent_name} sizni o'z farzandi sifatida ko'rsatdi va «Qalqon AI» xavfsizlik hamda dars yordamchisi dasturiga ulanishingizni so'ramoqda.\n\n"
                    f"Dasturda 1-11 sinf darsliklari, Gemini AI do'st va a'lo baholar uchun yutuqlar bor! Pastdagi tugmani bosing va 4 ta qoida bilan tanishing.»</i>\n\n"
                    f"🔑 <b>Oila kodingiz:</b> <code>{code}</code>\n"
                    f"👉 Havola: {pair_deep_link(code)}"
                )
                child_markup = {
                    "inline_keyboard": [
                        [{"text": "🌟 Qalqon AI Bolalar Panelini Ochish", "web_app": {"url": f"{MINI_APP_URL}&role=child&code={code}&parent={raw_username}"}}]
                    ]
                }
                # Farzand chatiga xabar (agar ma'lum bo'lsa yoki admin orqali)
                send_message(chat_id, f"📋 <b>Farzand uchun tayyor taklifnoma:</b>\n\n{child_invite_msg}", child_markup)
            else:
                send_message(chat_id, f"⚠️ Foydalanish: <code>/invite @farzand_username</code>\n\n🔑 Oila kodingiz: <code>{code}</code>\n👉 {pair_deep_link(code)}")
            return

        if text.startswith("/farzand"):
            code = generate_family_code(chat_id)
            link = pair_deep_link(code)
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
    if not BOT_TOKEN:
        print("[QALQON AI] ERROR: MAIN_BOT_TOKEN (or BOT_TOKEN) missing from env/.env")
        print("[QALQON AI] Set the token and restart. Refusing to poll.")
        sys.exit(1)
    token_hint = BOT_TOKEN[-4:] if len(BOT_TOKEN) >= 4 else "????"
    print(f"[QALQON AI] Token loaded (ends …{token_hint})")
    print(f"[QALQON AI] Sole Admin: @ai_loyihachi")
    print(f"[QALQON AI] Admin Chat IDs cached: {list(ADMIN_CHAT_IDS)}")
    print("[QALQON AI] Pairing path: LONG POLLING (getUpdates)")
    print("[QALQON AI] Calling deleteWebhook so polling is not stolen by Vercel webhook…")
    wh = call_tg("deleteWebhook", {"drop_pending_updates": False})
    print(f"[QALQON AI] deleteWebhook ok={wh.get('ok')}")
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
