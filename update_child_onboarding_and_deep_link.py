import re

# 1. Update bot_engine.py
with open("bot_engine.py", "r", encoding="utf-8") as f:
    bot_code = f.read()

child_start_block = """
            if "child_" in text or "pair_" in text:
                clean_code = text.replace("/start", "").replace("child_", "").replace("pair_", "").strip()
                if not clean_code:
                    clean_code = generate_family_code(chat_id)
                
                child_start_msg = (
                    "🐺 <b>ASSALOMU ALAYKUM, YOSH QAHRAMON!</b>\\n\\n"
                    "Sizni ota-onangiz «Qalqon AI» xavfsizlik va dars yordamchisi tizimiga taklif qildi! 🌟\\n\\n"
                    "<b>Dasturdagi 4 ta asosiy imkoniyat:</b>\\n"
                    "• 📍 <b>Jonli radar va xavfsiz joylashuv</b>\\n"
                    "• 🎬 <b>YouTube va video qiziqishlari tahlili</b>\\n"
                    "• 📱 <b>Ekran vaqti va ilovalar balansi</b>\\n"
                    "• 📚 <b>1-11 sinf DTS darsliklari va Gemini AI do'st</b>\\n\\n"
                    f"🔑 <b>Oila kodingiz:</b> <code>{clean_code}</code>\\n\\n"
                    "Pastdagi tugmani bosing va 4 ta jabha bo'yicha qoidalar bilan tanishib, tasdiqlang:"
                )
                child_markup = {
                    "inline_keyboard": [
                        [{"text": "🌟 Bola Panelini Ochish & Rozilik Berish", "web_app": {"url": f"{MINI_APP_URL}&role=child&code={clean_code}"}}]
                    ]
                }
                send_message(chat_id, child_start_msg, child_markup)
                return
"""

bot_code = re.sub(r'if "pair_" in text:[\s\S]*?return', child_start_block.strip(), bot_code)

with open("bot_engine.py", "w", encoding="utf-8") as f:
    f.write(bot_code)
print("Updated bot_engine.py with child deep link start handler!")

# 2. Update telegram_miniapp/app.js & app.js
with open("telegram_miniapp/app.js", "r", encoding="utf-8") as f:
    js = f.read()

# Update URL parameters role checking
url_role_block = """
const urlParams = new URLSearchParams(window.location.search);
const urlRole = urlParams.get('role');
const urlCode = urlParams.get('code') || urlParams.get('start');

let currentLang = urlParams.get('lang') || localStorage.getItem('app_lang') || 'uz';
let currentTheme = localStorage.getItem('app_theme') || 'default';
let userPlan = localStorage.getItem('user_plan') || 'pro';
let activeSchoolPeriod = 'weekly';
let isRecordingVoice = false;
let uploadedImageBase64 = null;
let familyCode = urlCode || "849-210";

// Agar havola bola uchun bo'lsa
let currentAppRole = urlRole || localStorage.getItem('app_role') || 'parent';
if (urlRole === 'child' || (urlCode && (urlCode.startsWith('child') || urlCode.startsWith('pair')))) {
    currentAppRole = 'child';
    localStorage.setItem('app_role', 'child');
}
"""

js = re.sub(r'let currentLang = new URLSearchParams[\s\S]*?let currentAppRole = localStorage\.getItem\(\'app_role\'\) \|\| \'parent\';', url_role_block.strip(), js)

# Check child consent on DOMContentLoaded
child_consent_check = """
function checkChildConsentStatus() {
    if (currentAppRole === 'child') {
        const consented = localStorage.getItem('child_consented') === 'true';
        const overlay = document.getElementById('childConsentOverlay');
        const codeInput = document.getElementById('childConsentFamilyCode');
        
        if (codeInput && familyCode) {
            codeInput.value = familyCode.replace('child_', '').replace('pair_', '');
        }

        if (overlay) {
            if (!consented) {
                overlay.classList.remove('hidden');
            } else {
                overlay.classList.add('hidden');
            }
        }
        
        // Farzand panelini majburiy tanlash
        switchChildTab('child-tab-home');
    }
}
"""

if "function checkChildConsentStatus()" not in js:
    js = js.replace("function checkParentOnboarding() {", child_consent_check + "\n\nfunction checkParentOnboarding() {")

# Call checkChildConsentStatus in DOMContentLoaded
js = js.replace("checkParentOnboarding();", "checkParentOnboarding();\n    checkChildConsentStatus();")

with open("telegram_miniapp/app.js", "w", encoding="utf-8") as f:
    f.write(js)

with open("app.js", "w", encoding="utf-8") as f:
    f.write(js)

print("Updated app.js with instant child consent flow and role lock!")
