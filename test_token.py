import urllib.request
import json

BOT_TOKEN = "8992925094:AAE5K1N8VVxiCh9P6H1j7hCrYoTeIBmC8r0"

# Test getMe
url = f"https://api.telegram.org/bot{BOT_TOKEN}/getMe"
with urllib.request.urlopen(url) as resp:
    print("getMe:", resp.read().decode("utf-8"))

# Test getUpdates (if webhook is deleted temporarily)
# Wait, if webhook is set, getUpdates returns 409 Conflict.
