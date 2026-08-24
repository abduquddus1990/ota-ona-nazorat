import re, json

# 1. Update bot_engine.py and supabase bot with superman_uzb
with open("bot_engine.py", "r", encoding="utf-8") as f:
    bot_code = f.read()

bot_code = re.sub(r'ADMIN_USERNAMES\s*=\s*\{.*?\}', 'ADMIN_USERNAMES = {"ai_loyihachi", "superman_uzb"}', bot_code)

with open("bot_engine.py", "w", encoding="utf-8") as f:
    f.write(bot_code)
print("Updated bot_engine.py with @superman_uzb admin!")

with open("supabase/functions/ota-ona-bot/index.ts", "r", encoding="utf-8") as f:
    supa_code = f.read()

supa_code = re.sub(r'const ADMIN_USERNAMES\s*=\s*new Set<string>\(\[.*?\]\);', 'const ADMIN_USERNAMES = new Set<string>(["ai_loyihachi", "superman_uzb"]);', supa_code)

with open("supabase/functions/ota-ona-bot/index.ts", "w", encoding="utf-8") as f:
    f.write(supa_code)
print("Updated supabase bot with @superman_uzb admin!")
