import urllib.request
import json

url = "https://wfrclcwjeeqeqchmdhzw.supabase.co/functions/v1/ota-ona-bot"
payload = {
    "update_id": 12345,
    "message": {
        "message_id": 1,
        "date": 1723875000,
        "chat": {"id": 999999, "type": "private"},
        "from": {"id": 999999, "is_bot": False, "first_name": "Test", "username": "ai_loyihachi"},
        "text": "/start"
    }
}

req = urllib.request.Request(
    url,
    data=json.dumps(payload).encode("utf-8"),
    headers={"Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(req) as resp:
        print("Status code:", resp.status)
        print("Response body:", resp.read().decode("utf-8"))
except Exception as e:
    print("Error:", e)
