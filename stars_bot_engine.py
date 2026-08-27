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

STARS_BOT_TOKEN = "8746113611:AAFGsysUKD9r_q31sC-VfDn025KYXCUmRmk"
TELEGRAM_API = f"https://api.telegram.org/bot{STARS_BOT_TOKEN}"
MAIN_APP_URL = "https://abduquddus1990.github.io/ota-ona-nazorat/?v=5.7"

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
        print(f"Stars Bot Error [{method}]:", e)
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

def send_stars_invoice(chat_id, title, description, payload_str, stars_amount):
    # Telegram Stars invoice (currency = 'XTR')
    invoice_payload = {
        "chat_id": chat_id,
        "title": title,
        "description": description,
        "payload": payload_str,
        "currency": "XTR",
        "prices": [{"label": title, "amount": stars_amount}], # 1 XTR = 1 Star
        "start_parameter": "qalqon_pro_stars"
    }
    return call_tg("sendInvoice", invoice_payload)

def handle_update(update):
    # 1. Pre-checkout query (Telegram requires answering within 10 seconds)
    if "pre_checkout_query" in update:
        pcq = update["pre_checkout_query"]
        pcq_id = pcq["id"]
        # Always approve valid star payments
        call_tg("answerPreCheckoutQuery", {
            "pre_checkout_query_id": pcq_id,
            "ok": True
        })
        print(f"[Stars Bot] PreCheckout approved for user {pcq.get('from', {}).get('id')}")
        return

    # 2. Callback Queries
    if "callback_query" in update:
        cb = update["callback_query"]
        chat_id = cb["message"]["chat"]["id"]
        data = cb.get("data", "")
        call_tg("answerCallbackQuery", {"callback_query_id": cb["id"]})

        if data == "buy_pro_1m":
            send_stars_invoice(
                chat_id=chat_id,
                title="Qalqon AI — 1 Oylik Pro Obuna",
                description="Gemini AI dars yordamchisi, 1-11 sinf DTS tahlili va to'liq ota-ona nazorati (50 Telegram Stars / 10,000 so'm)",
                payload_str=f"pro_1m_{chat_id}",
                stars_amount=50
            )
        elif data == "buy_pro_3m":
            send_stars_invoice(
                chat_id=chat_id,
                title="Qalqon AI — 3 Oylik Pro Obuna (10% Chegirma)",
                description="3 oylik to'liq Pro reja barcha farzandlar uchun (135 Telegram Stars)",
                payload_str=f"pro_3m_{chat_id}",
                stars_amount=135
            )
        elif data == "buy_pro_1y":
            send_stars_invoice(
                chat_id=chat_id,
                title="Qalqon AI — 1 Yillik VIP Oila Rejasi (25% Chegirma)",
                description="1 yillik cheksiz VIP a'zolik va maxsus qo'llab-quvvatlash (450 Telegram Stars)",
                payload_str=f"pro_1y_{chat_id}",
                stars_amount=450
            )
        elif data == "how_to_get_stars":
            help_text = (
                "⭐ <b>TELEGRAM YULDUZLARINI (STARS) SOTIB OLISH YO'RIQNOMASI:</b>\n\n"
                "1. <b>Telegram Sozlamalari orqali:</b>\n"
                "Telegram dasturingizda: <i>Sozlamalar (Settings) -> Mening Yulduzlarim (My Stars)</i> bo'limiga kiring va to'g'ridan-to'g'ri xarid qiling.\n\n"
                "2. <b>Rasmiy Bot orqali:</b>\n"
                "👉 @PremiumBot ga kirib <b>/stars</b> buyrug'ini yuboring.\n\n"
                "3. <b>Fragment.com platformasida:</b>\n"
                "TON kripto hamyoningiz orqali arzon narxda yulduzcha xarid qilish mumkin."
            )
            markup = {
                "inline_keyboard": [
                    [{"text": "⭐ 50 Yulduzcha Bilan Pro Olish", "callback_data": "buy_pro_1m"}],
                    [{"text": "« Orqaga", "callback_data": "start_menu"}]
                ]
            }
            send_message(chat_id, help_text, markup)
        elif data == "start_menu":
            send_start_menu(chat_id)
        return

    # 3. Messages
    if "message" in update:
        msg = update["message"]
        chat_id = msg["chat"]["id"]
        text = msg.get("text", "")

        # Successful Payment handler
        if "successful_payment" in msg:
            sp = msg["successful_payment"]
            amount = sp.get("total_amount", 50)
            payload = sp.get("invoice_payload", "")
            
            # Update user plan in DB
            users = load_json(USERS_FILE, {})
            users[str(chat_id)] = {
                "status": "approved",
                "plan": "pro",
                "paid_stars": amount,
                "paid_at": time.strftime("%Y-%m-%d %H:%M:%S")
            }
            save_json(USERS_FILE, users)

            congrats_text = (
                "🎉 <b>TO'LOV MUVAFFAQIYATLI AMALGA OSHIRILDI!</b>\n\n"
                f"Siz <b>{amount} ta Telegram Yulduzi (Stars)</b> orqali <b>Qalqon AI Pro</b> obunasini muvaffaqiyatli xarid qildingiz! 💎\n\n"
                "✅ Barcha imkoniyatlar faollashtirildi:\n"
                "• 🧠 Gemini AI shaxsiy repetitor\n"
                "• 📚 1-11 sinf DTS darsliklari tahlili\n"
                "• 📍 Aniq jonli lokatsiya va cheksiz bildirishnomalar\n\n"
                "Boshqaruv panelini ochish uchun pastdagi tugmani bosing:"
            )
            markup = {
                "inline_keyboard": [
                    [{"text": "🚀 Ota-ona Boshqaruv Panelini Ochish (Mini App)", "web_app": {"url": MAIN_APP_URL}}]
                ]
            }
            send_message(chat_id, congrats_text, markup)
            print(f"[Stars Bot] Payment success for {chat_id}: {amount} Stars")
            return

        if text.startswith("/start") or text.startswith("/buy") or text.startswith("/stars"):
            send_start_menu(chat_id)

def send_start_menu(chat_id):
    welcome_text = (
        "⭐ <b>QALQON AI — TELEGRAM STARS RASMIY TO'LOV BOTI</b>\n\n"
        "Xush kelibsiz! Ushbu bot orqali siz <b>Qalqon AI Ota-ona nazorati va ta'lim tizimi</b> uchun rasmiy Telegram Yulduzlari (Stars / XTR) orqali to'lov qilishingiz mumkin.\n\n"
        "💎 <b>Mavjud Tariflar:</b>\n"
        "• <b>1 Oylik Pro Obuna:</b> ⭐ <code>50 Stars</code> (~10,000 so'm)\n"
        "• <b>3 Oylik Pro Obuna:</b> ⭐ <code>135 Stars</code> (10% Chegirma)\n"
        "• <b>1 Yillik VIP Reja:</b> ⭐ <code>450 Stars</code> (25% Chegirma)\n\n"
        "Kerakli paketni tanlang:"
    )
    markup = {
        "inline_keyboard": [
            [{"text": "⭐ 1 Oylik Pro (50 Stars / 10,000 so'm)", "callback_data": "buy_pro_1m"}],
            [{"text": "⭐ 3 Oylik Pro (135 Stars / 10% chegirma)", "callback_data": "buy_pro_3m"}],
            [{"text": "👑 1 Yillik VIP (450 Stars / 25% chegirma)", "callback_data": "buy_pro_1y"}],
            [{"text": "❓ Yulduzchalarni Qanday Xarid Qilish Mumkin?", "callback_data": "how_to_get_stars"}],
            [{"text": "📊 Asosiy Ilovani Ochish (Mini App)", "web_app": {"url": MAIN_APP_URL}}]
        ]
    }
    send_message(chat_id, welcome_text, markup)

def main():
    print("="*60)
    print("[STARS BOT] Telegram Stars Payment Bot (@StarsUchun_bot) is running...")
    print("="*60)

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
            print("Stars Bot Polling Error:", e)
            time.sleep(2)

if __name__ == "__main__":
    main()
