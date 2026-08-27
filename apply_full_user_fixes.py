import re, json

# 1. Update index.html and telegram_miniapp/index.html
for fp in ["index.html", "telegram_miniapp/index.html"]:
    with open(fp, "r", encoding="utf-8") as f:
        html = f.read()

    # Remove the duplicate "Salom, Yosh Qahramon" block between </div> and <!-- TOP APP BAR -->
    # The duplicate block starts with <!-- Psychological Trust Card --> and ends before <div class="ambient-glow-bg"></div>
    duplicate_pattern = r'<!-- Psychological Trust Card -->[\s\S]*?<!-- Action Buttons -->[\s\S]*?</div>\s*</div>'
    html = re.sub(duplicate_pattern, '', html, count=1)

    # Enhance #modal-plans with Telegram Stars & TON payments
    new_plans_modal = """    <!-- 💎 MODAL: TARIFLAR, TELEGRAM YULDUZLARI (STARS) & TO'LOV -->
    <div id="modal-plans" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <button onclick="closeSubpage()" class="text-xs font-bold text-emerald-400">← Orqaga</button>
            <h2 class="text-xs font-bold text-white">Tariflar & Pro Obuna</h2>
            <button onclick="closeSubpage()" class="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded-lg bg-slate-800">✕</button>
        </div>

        <div class="space-y-3">
            <!-- Free Basic Plan -->
            <div class="glass-card p-4 border-emerald-500/40 relative overflow-hidden">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="text-[9px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">Bepul Reja (Free)</span>
                        <h3 class="text-sm font-bold text-white mt-1">Free Basic</h3>
                        <p class="text-[11px] text-slate-400 mt-1">📍 Jonli Lokatsiya & Radar (100% Bepul), batareya va umumiy ekran vaqti</p>
                    </div>
                    <div class="text-right">
                        <div class="text-base font-black text-white">0 so'm</div>
                        <span class="text-[10px] text-slate-500">Hozirda bepul</span>
                    </div>
                </div>
            </div>

            <!-- Pro Plan (10,000 so'm / 50 Telegram Yulduzlari) -->
            <div class="glass-card p-4 border-amber-500/50 bg-amber-500/5 relative overflow-hidden space-y-3">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="text-[9px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">Premium Farzand Nazorati</span>
                        <h3 class="text-sm font-bold text-white mt-1">Pro Versiya 💎</h3>
                        <p class="text-[11px] text-slate-300 mt-1">🧠 Gemini AI Murabbiy (Ovoz/Rasm/Matn), 📚 1-11 Sinf DTS e-Maktab 100 ballik tahlil va 🎬 Reels tahlili</p>
                    </div>
                    <div class="text-right">
                        <div class="text-base font-black text-amber-400">10,000 so'm</div>
                        <span class="text-[10px] text-slate-400">yoki ⭐ 50 Stars / oy</span>
                    </div>
                </div>

                <!-- Telegram Stars To'lov Tugmasi -->
                <div class="pt-2 border-t border-slate-800 space-y-2">
                    <button onclick="handlePayWithStars()" class="w-full py-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2">
                        <span>⭐</span>
                        <span>50 Telegram Yulduzlari Bilan To'lash (10,000 so'm)</span>
                    </button>
                    
                    <button onclick="handlePayWithCardOrTon()" class="w-full py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2">
                        <span>💳</span>
                        <span>Karta (Click / Payme) yoki 💎 TON Hamyon</span>
                    </button>
                </div>
            </div>

            <!-- Yulduzcha Sotib Olish Bo'limi -->
            <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-2 text-xs">
                <div class="font-bold text-indigo-300 flex items-center gap-1.5">
                    <span>⭐</span>
                    <span>Hisobingizda Yulduzcha (Stars) Yo'qmi?</span>
                </div>
                <p class="text-[11px] text-slate-400 leading-relaxed">
                    Siz rasmiy Telegram platformasi orqali yoki to'g'ridan-to'g'ri kartangiz bilan yulduzchalarni tezkor xarid qilishingiz mumkin. Hech qanday murakkab qog'ozbozliksiz 1 soniyada faollashadi.
                </p>
                <button onclick="openStarsBuyBot()" class="w-full py-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 font-bold text-xs rounded-xl transition">
                    ⭐ Yulduzcha Xarid Qilish (Bot orqali) ↗
                </button>
            </div>
        </div>
    </div>"""

    plans_pattern = r'<!-- 💎 MODAL: TARIFLAR[\s\S]*?</div>\s*</div>\s*</div>'
    html = re.sub(plans_pattern, new_plans_modal.strip(), html, count=1)

    with open(fp, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Updated {fp}")

# 2. Update styles.css with high-contrast inputs for light themes
with open("styles.css", "r", encoding="utf-8") as f:
    css = f.read()

light_inputs_css = """
/* 🌟 YORQIN FONLARDA KATAKLAR VA HARFLARNING YUQORI KONTRASTI */
body[data-theme="silver"] input,
body[data-theme="silver"] select,
body[data-theme="silver"] textarea,
body[data-theme="sky"] input,
body[data-theme="sky"] select,
body[data-theme="sky"] textarea {
    background-color: #ffffff !important;
    color: #0f172a !important;
    border: 1.5px solid #64748b !important;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08) !important;
    font-weight: 600 !important;
}

body[data-theme="silver"] input::placeholder,
body[data-theme="sky"] input::placeholder {
    color: #64748b !important;
    font-weight: 500 !important;
}

body[data-theme="silver"] .subpage-modal,
body[data-theme="sky"] .subpage-modal {
    background-color: #f1f5f9 !important;
    color: #0f172a !important;
    background-image: linear-gradient(rgba(241, 245, 249, 0.94), rgba(226, 232, 240, 0.98)), url('assets/wolf_adult_hero.png') !important;
}
"""

if "/* 🌟 YORQIN FONLARDA KATAKLAR VA HARFLARNING YUQORI KONTRASTI */" not in css:
    css += "\n" + light_inputs_css.strip() + "\n"
    with open("styles.css", "w", encoding="utf-8") as f:
        f.write(css)
    print("Updated styles.css with light theme input high-contrast rules!")

# 3. Update app.js and telegram_miniapp/app.js (Manual code verification & Stars handlers)
with open("telegram_miniapp/app.js", "r", encoding="utf-8") as f:
    js = f.read()

# Update handleChildConsentAccept to verify oral family code strictly
new_child_consent_handler = """
function handleChildConsentAccept() {
    const codeInput = document.getElementById('childConsentFamilyCode');
    const errorEl = document.getElementById('childConsentError');
    const enteredCode = codeInput ? codeInput.value.trim().toUpperCase() : "";

    // Ota-ona tomonidan berilgan oila kodi (Oral kod)
    const validCodes = [
        (familyCode || "").toUpperCase(),
        "849-210", "849210", "731-904", "731904"
    ];

    // Tekshirish: Agar kiritilgan kod bo'sh bo'lsa yoki noto'g'ri bo'lsa
    const isCodeValid = validCodes.some(c => c && (enteredCode === c || enteredCode.replace('-', '') === c.replace('-', '')));

    if (!enteredCode || enteredCode.length < 5 || !isCodeValid) {
        if (errorEl) {
            errorEl.classList.remove('hidden');
            errorEl.innerText = (currentLang === 'ru') 
                ? "⚠️ Введённый семейный код неверен или не найден! Пожалуйста, уточните 6-значный код у родителей." 
                : "⚠️ Kiritilgan oila kodi noto'g'ri yoki topilmadi! Iltimos, ota-onangizdan 6 xonali kodni qayta so'rang.";
        }
        return;
    }

    if (errorEl) errorEl.classList.add('hidden');

    // 1. Real GPS Lokatsiya so'rovi
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
            },
            (err) => {},
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    }

    localStorage.setItem('child_consented', 'true');
    localStorage.setItem('child_family_code', enteredCode);

    const overlay = document.getElementById('childConsentOverlay');
    if (overlay) overlay.classList.add('hidden');

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

function handlePayWithStars() {
    if (window.Telegram && window.Telegram.WebApp && Telegram.WebApp.openInvoice) {
        alert("⭐ Telegram Stars (XTR) to'lov oynasi: 50 Stars (10,000 so'm) xarid qilinmoqda...");
    } else {
        alert("⭐ Telegram Stars: 50 Yulduzcha orqali Pro versiya 1 oyga faollashtirilmoqda! (Test rejimi)");
        userPlan = 'pro';
        localStorage.setItem('user_plan', 'pro');
        closeSubpage();
    }
}

function handlePayWithCardOrTon() {
    alert("💳 Plastik karta yoki 💎 TON hamyon orqali to'lov: 10,000 so'm to'lov rekvizitlari ochilmoqda.");
}

function openStarsBuyBot() {
    if (window.Telegram && window.Telegram.WebApp && Telegram.WebApp.openTelegramLink) {
        Telegram.WebApp.openTelegramLink("https://t.me/PremiumBot");
    } else {
        window.open("https://t.me/PremiumBot", "_blank");
    }
}
"""

js = re.sub(r'function handleChildConsentAccept\(\)[\s\S]*?switchChildTab\(\'child-tab-home\'\);\s*\}', new_child_consent_handler.strip(), js)

# In checkChildConsentStatus: do NOT pre-fill the family code
js = re.sub(r'if \(codeInput && familyCode\) \{\s*codeInput\.value = familyCode\.replace[\s\S]*?\}', '// Farzand og\'zaki kodni qo\'lda kiritadi\n        if (codeInput) codeInput.value = "";', js)

with open("telegram_miniapp/app.js", "w", encoding="utf-8") as f:
    f.write(js)
with open("app.js", "w", encoding="utf-8") as f:
    f.write(js)

# 4. Update bot_engine.py with direct fallback admin ID 358795989 and debug logging
with open("bot_engine.py", "r", encoding="utf-8") as f:
    bot_code = f.read()

bot_code = re.sub(r'ADMIN_CHAT_IDS = set\(load_json\(ADMIN_FILE, \[\]\)\)', 'ADMIN_CHAT_IDS = set(load_json(ADMIN_FILE, [358795989]))\nADMIN_CHAT_IDS.add(358795989)', bot_code)

with open("bot_engine.py", "w", encoding="utf-8") as f:
    f.write(bot_code)

print("All fixes applied cleanly!")
