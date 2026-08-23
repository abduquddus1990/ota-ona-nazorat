import urllib.request
import json
import re

BOT_TOKEN = "8992925094:AAE5K1N8VVxiCh9P6H1j7hCrYoTeIBmC8r0"
STABLE_MINI_APP_URL = "https://abduquddus1990.github.io/ota-ona-nazorat/?v=5.3"

# 1. Update Telegram Menu Button via API
menu_payload = {
    "menu_button": {
        "type": "web_app",
        "text": "📊 Ota-Ona Paneli",
        "web_app": {
            "url": STABLE_MINI_APP_URL
        }
    }
}

url = f"https://api.telegram.org/bot{BOT_TOKEN}/setChatMenuButton"
req = urllib.request.Request(url, data=json.dumps(menu_payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode('utf-8'))
    print("setChatMenuButton natijasi:", res)

# 2. Check getChatMenuButton
url2 = f"https://api.telegram.org/bot{BOT_TOKEN}/getChatMenuButton"
req2 = urllib.request.Request(url2, data=json.dumps({}).encode('utf-8'), headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req2) as resp:
    res2 = json.loads(resp.read().decode('utf-8'))
    print("Yangi Menu Button:", res2)

# 3. Update bot_engine.py MINI_APP_URL
with open("bot_engine.py", "r", encoding="utf-8") as f:
    bot_code = f.read()

bot_code = re.sub(r'MINI_APP_URL\s*=\s*".*?"', f'MINI_APP_URL = "{STABLE_MINI_APP_URL}"', bot_code)

# Add setChatMenuButton in setup_bot_commands of bot_engine.py
if "setChatMenuButton" not in bot_code:
    bot_code = bot_code.replace(
        'res = call_tg("setMyCommands", {"commands": commands})',
        '''res = call_tg("setMyCommands", {"commands": commands})
    call_tg("setChatMenuButton", {
        "menu_button": {
            "type": "web_app",
            "text": "📊 Ota-Ona Paneli",
            "web_app": {"url": MINI_APP_URL}
        }
    })'''
    )

with open("bot_engine.py", "w", encoding="utf-8") as f:
    f.write(bot_code)

# 4. Update supabase/functions/ota-ona-bot/index.ts
with open("supabase/functions/ota-ona-bot/index.ts", "r", encoding="utf-8") as f:
    supa_bot = f.read()

supa_bot = re.sub(r'const MINI_APP_URL\s*=\s*Deno\.env\.get\("MINI_APP_URL"\)\s*\|\|\s*".*?";', f'const MINI_APP_URL = Deno.env.get("MINI_APP_URL") || "{STABLE_MINI_APP_URL}";', supa_bot)

with open("supabase/functions/ota-ona-bot/index.ts", "w", encoding="utf-8") as f:
    f.write(supa_bot)

print("Barcha Telegram Menu Button va Mini App URL manzillari doimiy GitHub Pages ga ulandi!")
