import urllib.request
import json

url = "https://wfrclcwjeeqeqchmdhzw.supabase.co/functions/v1/ota-ona-bot"

# Let's test GET
with urllib.request.urlopen(url) as resp:
    print("GET response:", resp.read().decode("utf-8"))

# Let's test sending a dummy update
payload = {
    "update_id": 99999,
    "message": {
        "message_id": 100,
        "date": 1723875000,
        "chat": {"id": 12345678, "type": "private"},
        "from": {"id": 12345678, "is_bot": False, "first_name": "Mirkamol", "username": "ai_loyihachi"},
        "text": "/start"
    }
}

req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})
try:
    with urllib.request.urlopen(req) as resp:
        print("POST response status:", resp.status)
        print("POST response body:", resp.read().decode("utf-8"))
except urllib.error.HTTPError as e:
    print("POST error:", e.code, e.read().decode("utf-8"))
