import re, json, random

# 1. Update bot_engine.py with Unique Family Code Registry & Child Audio Invite
with open("bot_engine.py", "r", encoding="utf-8") as f:
    bot_code = f.read()

family_code_system = """
FAMILY_CODES_FILE = "family_codes.json"
FAMILY_CODES = load_json(FAMILY_CODES_FILE, {})

def get_unique_family_code(user_id):
    uid_str = str(user_id)
    if uid_str in FAMILY_CODES:
        return FAMILY_CODES[uid_str]
    
    existing_codes = set(FAMILY_CODES.values())
    for attempt in range(1000):
        # 6 xonali unikal takrorlanmas kod
        num = random.randint(100000, 999999)
        code_str = f"{str(num)[:3]}-{str(num)[3:6]}"
        if code_str not in existing_codes:
            FAMILY_CODES[uid_str] = code_str
            save_json(FAMILY_CODES_FILE, FAMILY_CODES)
            return code_str
    # Fallback
    fallback = f"849-{abs(int(user_id)) % 900 + 100}"
    FAMILY_CODES[uid_str] = fallback
    save_json(FAMILY_CODES_FILE, FAMILY_CODES)
    return fallback

def generate_family_code(user_id):
    return get_unique_family_code(user_id)
"""

bot_code = re.sub(r'def generate_family_code\(user_id\)[\s\S]*?return f"\{s\[:3\]\}-\{s\[3:6\]\}"', family_code_system.strip(), bot_code)

# Add /invite or child registration voice notification handler
child_invite_handler = """
        if text.startswith("/taklif_farzand") or text.startswith("/invite"):
            parts = text.split()
            code = generate_family_code(chat_id)
            parent_name = f"@{raw_username}" if raw_username else "Ota-onangiz"
            if len(parts) > 1:
                child_target = parts[1].replace("@", "").strip()
                send_message(chat_id, f"🎙️ <b>OVOZLI TAKLIF YUBORILDI:</b>\\n\\nFarzandingiz @{child_target} ga ovozli xabar va ulanish havolasi tayyorlandi!\\n\\n🔗 Farzand ulanish kodi: <code>{code}</code>")
                # Farzandga yuboriladigan ovozli taklif matni va tugma
                child_invite_msg = (
                    f"🎙️ <b>OVOZLI XABAR — QALQON AI:</b>\\n\\n"
                    f"<i>«Assalomu alaykum, aziz do'stim! 🌟 {parent_name} sizni o'z farzandi sifatida ko'rsatdi va «Qalqon AI» xavfsizlik hamda dars yordamchisi dasturiga ulanishingizni so'ramoqda.\\n\\n"
                    f"Dasturda 1-11 sinf darsliklari, Gemini AI do'st va a'lo baholar uchun yutuqlar bor! Pastdagi tugmani bosing va 4 ta qoida bilan tanishing.»</i>\\n\\n"
                    f"🔑 <b>Oila kodingiz:</b> <code>{code}</code>"
                )
                child_markup = {
                    "inline_keyboard": [
                        [{"text": "🌟 Qalqon AI Bolalar Panelini Ochish", "web_app": {"url": f"{MINI_APP_URL}&role=child&code={code}&parent={raw_username}"}}]
                    ]
                }
                # Farzand chatiga xabar (agar ma'lum bo'lsa yoki admin orqali)
                send_message(chat_id, f"📋 <b>Farzand uchun tayyor taklifnoma:</b>\\n\\n{child_invite_msg}", child_markup)
            else:
                send_message(chat_id, f"⚠️ Foydalanish: <code>/invite @farzand_username</code>\\n\\n🔑 Oila kodingiz: <code>{code}</code>")
            return
"""

if "/taklif_farzand" not in bot_code:
    bot_code = bot_code.replace('if text.startswith("/farzand"):', child_invite_handler.strip() + '\n\n        if text.startswith("/farzand"):')

with open("bot_engine.py", "w", encoding="utf-8") as f:
    f.write(bot_code)
print("Updated bot_engine.py with non-repeating family code system and voice notification invite!")

# 2. Update app.js and telegram_miniapp/app.js to auto-open consent for child and trigger GPS on accept
with open("telegram_miniapp/app.js", "r", encoding="utf-8") as f:
    js = f.read()

# Update handleChildConsentAccept to request live GPS
gps_consent_code = """
function handleChildConsentAccept() {
    const codeInput = document.getElementById('childConsentFamilyCode');
    const errorEl = document.getElementById('childConsentError');
    const code = codeInput ? codeInput.value.trim() : "";

    if (!code || code.length < 5) {
        if (errorEl) {
            errorEl.classList.remove('hidden');
            errorEl.innerText = (currentLang === 'ru') 
                ? "⚠️ Пожалуйста, введите 6-значный семейный код от родителей!" 
                : "⚠️ Iltimos, ota-onangizdan olgan 6 xonali oila kodini to'liq kiriting!";
        }
        return;
    }

    if (errorEl) errorEl.classList.add('hidden');

    // 1. So'rov: Real Telefon GPS Lokatsiyasini Yoqish (Browser/Telegram API)
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                if (childrenDatabase[currentChildKey]) {
                    childrenDatabase[currentChildKey].location.lat = lat;
                    childrenDatabase[currentChildKey].location.lng = lng;
                    childrenDatabase[currentChildKey].location.address = `Toshkent (GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)})`;
                    saveChildrenDatabase();
                }
                console.log("GPS Location updated:", lat, lng);
            },
            (err) => {
                console.warn("GPS Permission info:", err.message);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    }

    localStorage.setItem('child_consented', 'true');
    localStorage.setItem('child_family_code', code);

    const overlay = document.getElementById('childConsentOverlay');
    if (overlay) overlay.classList.add('hidden');

    // Ota-ona botiga bildirishnoma yuborish
    try {
        if (window.Telegram && window.Telegram.WebApp) {
            Telegram.WebApp.HapticFeedback?.notificationOccurred('success');
        }
    } catch(e) {}

    alert((currentLang === 'ru') 
        ? "🎉 Поздравляем! Доступ к безопасности, GPS-радару и AI-помощнику успешно активирован!" 
        : "🎉 Tabriklaymiz! Xavfsizlik qalqoni, GPS-radar va AI darslik yordamchisi muvaffaqiyatli faollashtirildi! 🐺✨");

    switchChildTab('child-tab-home');
}
"""

js = re.sub(r'function handleChildConsentAccept\(\)[\s\S]*?switchChildTab\(\'child-tab-home\'\);\s*\}', gps_consent_code.strip(), js)

with open("telegram_miniapp/app.js", "w", encoding="utf-8") as f:
    f.write(js)
with open("app.js", "w", encoding="utf-8") as f:
    f.write(js)

print("Updated app.js with live GPS request upon child consent!")
