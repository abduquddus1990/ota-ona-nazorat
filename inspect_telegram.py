import urllib.request
import json

BOT_TOKEN = "8992925094:AAE5K1N8VVxiCh9P6H1j7hCrYoTeIBmC8r0"
WEBHOOK_URL = "https://wfrclcwjeeqeqchmdhzw.supabase.co/functions/v1/ota-ona-bot"

def call_tg(method, data=None):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/{method}"
    if data:
        req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers={"Content-Type": "application/json"})
    else:
        req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

print("1. Webhook Info before:")
print(json.dumps(call_tg("getWebhookInfo"), indent=2))

print("\n2. Re-setting Webhook to Supabase:")
set_res = call_tg("setWebhook", {
    "url": WEBHOOK_URL,
    "allowed_updates": ["message", "edited_message", "callback_query", "my_chat_member", "chat_member"]
})
print(json.dumps(set_res, indent=2))

print("\n3. Webhook Info after:")
print(json.dumps(call_tg("getWebhookInfo"), indent=2))
