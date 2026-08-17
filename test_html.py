import urllib.request
import json

BOT_TOKEN = "8992925094:AAE5K1N8VVxiCh9P6H1j7hCrYoTeIBmC8r0"

payload = {
    "chat_id": 999999,
    "text": "👑 <b>Assalomu alaykum</b> @ai_loyihachi! Oila kodi: <code>849-210</code>",
    "parse_mode": "HTML"
}

url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})

try:
    with urllib.request.urlopen(req) as resp:
        print("Success:", resp.read().decode("utf-8"))
except urllib.error.HTTPError as e:
    # We expect 400 "chat not found" because 999999 is a dummy ID, but NOT parse error!
    print("HTTP Response:", e.code, e.read().decode("utf-8"))
