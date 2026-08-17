import urllib.request
import json
import time

BOT_TOKEN = "8992925094:AAE5K1N8VVxiCh9P6H1j7hCrYoTeIBmC8r0"

def call_tg(method, data=None):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/{method}"
    if data:
        req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers={"Content-Type": "application/json"})
    else:
        req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

# Delete webhook to test getUpdates
print("Deleting webhook...")
del_res = call_tg("deleteWebhook", {"drop_pending_updates": False})
print("Delete webhook result:", del_res)

print("Fetching updates...")
updates = call_tg("getUpdates", {"limit": 10})
print("Updates count:", len(updates.get("result", [])))
print("Updates:", json.dumps(updates, indent=2, ensure_ascii=False))
