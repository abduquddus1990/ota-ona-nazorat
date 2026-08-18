import re, json

# 1. Update bot_engine.py
with open("bot_engine.py", "r", encoding="utf-8") as f:
    bot_code = f.read()

# Make sure ADMIN_USERNAMES only has ai_loyihachi
bot_code = re.sub(r'ADMIN_USERNAMES\s*=\s*\{.*?\}', 'ADMIN_USERNAMES = {"ai_loyihachi"}', bot_code)

# Add child_status_alert processing to bot_engine
status_handler_code = """
        if text.startswith("/status_alert_"):
            # Triggered from mini app
            parts = text.replace("/status_alert_", "").split("_")
            st_type = parts[0] if len(parts) > 0 else "maktab"
            notify_admins(f"🔔 <b>FARZANDINGIZDAN TEZKOR XABAR:</b>\\n\\nHolat: {st_type.upper()}\\nManzil: Yunusobod 4-mavze, 24-maktab\\n⏰ Vaqt: {time.strftime('%H:%M')}")
            return
"""

if "/status_alert_" not in bot_code:
    bot_code = bot_code.replace('if text.startswith("/start"):', status_handler_code.strip() + '\n\n        if text.startswith("/start"):')

with open("bot_engine.py", "w", encoding="utf-8") as f:
    f.write(bot_code)
print("Updated bot_engine.py successfully!")

# 2. Update supabase/functions/ota-ona-bot/index.ts
with open("supabase/functions/ota-ona-bot/index.ts", "r", encoding="utf-8") as f:
    supa_bot = f.read()

supa_bot = re.sub(r'const ADMIN_USERNAMES\s*=\s*new Set<string>\(\[.*?\]\);', 'const ADMIN_USERNAMES = new Set<string>(["ai_loyihachi"]);', supa_bot)

with open("supabase/functions/ota-ona-bot/index.ts", "w", encoding="utf-8") as f:
    f.write(supa_bot)
print("Updated supabase/functions/ota-ona-bot/index.ts successfully!")
