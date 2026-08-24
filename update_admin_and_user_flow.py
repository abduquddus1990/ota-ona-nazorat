import re

with open("bot_engine.py", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Update ADMIN_USERNAMES to only ai_loyihachi
code = re.sub(r'ADMIN_USERNAMES\s*=\s*\{.*?\}', 'ADMIN_USERNAMES = {"ai_loyihachi"}', code)

# 2. Add notification to admin when new user starts bot
approval_logic = """
            if not is_admin and raw_username:
                # Notify admin about new user registration request
                admin_markup = {
                    "inline_keyboard": [
                        [
                            {"text": "✅ To'liq Ruxsat Berish", "callback_data": f"admin_approve_{chat_id}_{raw_username}"},
                            {"text": "❌ Test Rejimida Qoldirish", "callback_data": f"admin_reject_{chat_id}_{raw_username}"}
                        ]
                    ]
                }
                notify_admins(
                    f"👤 <b>YANGI OTA-ONA ULANI SH SO'ROVI:</b>\\n\\n"
                    f"• <b>Username:</b> @{raw_username}\\n"
                    f"• <b>Telegram ID:</b> <code>{chat_id}</code>\\n"
                    f"• <b>Oila kodi:</b> <code>{generate_family_code(chat_id)}</code>\\n\\n"
                    f"<i>Ushbu foydalanuvchiga to'liq (test bo'lmagan) variantdan foydalanishiga ruxsat berasizmi?</i>",
                    admin_markup
                )
"""

if "admin_approve_" in code:
    code = re.sub(r'if data\.startswith\("admin_approve_"\):[\s\S]*?return', """if data.startswith("admin_approve_"):
            parts = data.replace("admin_approve_", "").split("_")
            target_chat_id = parts[0]
            target_username = parts[1] if len(parts) > 1 else ""
            USER_APPROVAL_STATUS[target_chat_id] = "approved"
            send_message(chat_id, f"✅ <b>Muvaffaqiyatli:</b> @{target_username} ({target_chat_id}) uchun to'liq foydalanishga ruxsat berildi!")
            
            # Send message to the user
            send_message(target_chat_id, f"🎉 <b>Tabriklaymiz!</b>\\n\\nBosh administrator @ai_loyihachi sizning hisobingizni tasdiqladi! Endi barcha imkoniyatlar (lokatsiya, RAG darsliklar, AI tahlil) siz uchun to'liq faollashtirildi.", {
                "inline_keyboard": [
                    [{"text": "🚀 Boshqaruv Panelini Ochish (Mini App)", "web_app": {"url": f"{MINI_APP_URL}&lang=uz"}}]
                ]
            })
            return""", code)

if "admin_reject_" in code:
    code = re.sub(r'if data\.startswith\("admin_reject_"\):[\s\S]*?return', """if data.startswith("admin_reject_"):
            parts = data.replace("admin_reject_", "").split("_")
            target_chat_id = parts[0]
            target_username = parts[1] if len(parts) > 1 else ""
            USER_APPROVAL_STATUS[target_chat_id] = "rejected"
            send_message(chat_id, f"❌ <b>Rad etildi:</b> @{target_username} ({target_chat_id}) so'rovi test rejimida qoldirildi.")
            return""", code)

if "notify_admins(" not in code or "YANGI OTA-ONA ULANI SH SO'ROVI" not in code:
    code = code.replace(
        'send_message(chat_id, get_start_menu_text(chat_id, lang, True, is_admin), get_start_keyboard(chat_id, lang))\n            return',
        approval_logic + '\n            send_message(chat_id, get_start_menu_text(chat_id, lang, True, is_admin), get_start_keyboard(chat_id, lang))\n            return'
    )

with open("bot_engine.py", "w", encoding="utf-8") as f:
    f.write(code)

print("Updated bot_engine.py: @superman_uzb is standard parent user, @ai_loyihachi is sole admin with instant approval workflow!")

# Update supabase/functions/ota-ona-bot/index.ts
with open("supabase/functions/ota-ona-bot/index.ts", "r", encoding="utf-8") as f:
    supa = f.read()

supa = re.sub(r'const ADMIN_USERNAMES\s*=\s*new Set<string>\(\[.*?\]\);', 'const ADMIN_USERNAMES = new Set<string>(["ai_loyihachi"]);', supa)

with open("supabase/functions/ota-ona-bot/index.ts", "w", encoding="utf-8") as f:
    f.write(supa)

print("Updated supabase bot admin list!")
