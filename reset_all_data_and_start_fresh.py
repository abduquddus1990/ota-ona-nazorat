import json, os

# 1. Clear databases
with open("users_db.json", "w", encoding="utf-8") as f:
    json.dump({}, f)
print("users_db.json tozalandi: {}")

with open("family_codes.json", "w", encoding="utf-8") as f:
    json.dump({}, f)
print("family_codes.json tozalandi: {}")

with open("admin_ids.json", "w", encoding="utf-8") as f:
    json.dump([358795989], f)
print("admin_ids.json yangilandi: [358795989] (@ai_loyihachi)")

print("Barcha foydalanuvchilar bazasi 100% tozalandi!")
