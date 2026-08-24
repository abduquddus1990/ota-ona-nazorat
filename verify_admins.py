import os

files_to_remove = ["update_admins.py", "update_admin_and_user_flow.py"]
for f in files_to_remove:
    if os.path.exists(f):
        os.remove(f)
        print(f"Removed temporary script {f}")

# Check bot_engine.py
with open("bot_engine.py", "r", encoding="utf-8") as f:
    code = f.read()

print("bot_engine.py ADMIN_USERNAMES line:")
for line in code.splitlines():
    if "ADMIN_USERNAMES" in line:
        print(line)

# Check supabase
with open("supabase/functions/ota-ona-bot/index.ts", "r", encoding="utf-8") as f:
    supa = f.read()

print("supabase bot ADMIN_USERNAMES line:")
for line in supa.splitlines():
    if "ADMIN_USERNAMES" in line:
        print(line)
