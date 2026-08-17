import urllib.request
import json

BOT_TOKEN = "8992925094:AAE5K1N8VVxiCh9P6H1j7hCrYoTeIBmC8r0"

def get_info():
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/getWebhookInfo"
    with urllib.request.urlopen(url) as resp:
        return json.loads(resp.read().decode("utf-8"))

info = get_info()
print("Webhook Info:")
print(json.dumps(info, indent=2))
