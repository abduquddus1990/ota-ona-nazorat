import urllib.request
import json

BOT_TOKEN = "8992925094:AAE5K1N8VVxiCh9P6H1j7hCrYoTeIBmC8r0"
TELEGRAM_API = f"https://api.telegram.org/bot{BOT_TOKEN}"

def call_tg(method, data=None):
    url = f"{TELEGRAM_API}/{method}"
    try:
        if data:
            req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers={"Content-Type": "application/json"})
        else:
            req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        return {"ok": False, "error": str(e)}

# 1. Test sending message to admin 358795989
markup = {
    "inline_keyboard": [
        [
            {"text": "✅ To'liq Ruxsat Berish", "callback_data": "admin_approve_test_superman_uzb"},
            {"text": "❌ Test Rejimida Qoldirish", "callback_data": "admin_reject_test_superman_uzb"}
        ]
    ]
}

res = call_tg("sendMessage", {
    "chat_id": 358795989,
    "text": "🔔 <b>TEST XABAR (ADMIN TEKSHIRUVI):</b>\n\nAdmin so'rovlari ushbu chatga yetib kelmoqda!",
    "parse_mode": "HTML",
    "reply_markup": markup
})

print("Telegram sendMessage result to 358795989:", json.dumps(res, indent=2))

# 2. Check getUpdates
updates = call_tg("getUpdates", {"limit": 10})
print("Recent updates count:", len(updates.get("result", [])))
for u in updates.get("result", []):
    print("Update:", u.get("update_id"), u.get("message", {}).get("from", {}).get("username"), u.get("message", {}).get("text"))
