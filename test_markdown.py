import urllib.request
import json

BOT_TOKEN = "8992925094:AAE5K1N8VVxiCh9P6H1j7hCrYoTeIBmC8r0"

# Test Telegram sendMessage with unescaped @ai_loyihachi in Markdown v1
payload = {
    "chat_id": 999999, # Dummy ID
    "text": "Assalomu alaykum @ai_loyihachi",
    "parse_mode": "Markdown"
}

url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})

try:
    with urllib.request.urlopen(req) as resp:
        print("Success:", resp.read().decode("utf-8"))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code, e.read().decode("utf-8"))
