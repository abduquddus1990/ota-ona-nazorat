import json, re

# 1. Reset user databases
with open("users_db.json", "w", encoding="utf-8") as f:
    json.dump({}, f)

with open("family_codes.json", "w", encoding="utf-8") as f:
    json.dump({}, f)

with open("admin_ids.json", "w", encoding="utf-8") as f:
    json.dump([358795989], f)

print("users_db.json and family_codes.json 100% wiped clean for fresh test!")

# 2. Add Oila Ro'yxatdan O'tish button into Settings in index.html & telegram_miniapp/index.html
for fp in ["index.html", "telegram_miniapp/index.html"]:
    with open(fp, "r", encoding="utf-8") as f:
        html = f.read()

    settings_btn = """        <!-- 0. Oila Ro'yxatdan O'tish & Profilni Yangilash -->
        <div onclick="openSubpage('modal-parent-onboarding')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition bg-cyan-500/10 border-cyan-500/30">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-lg shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                    👨‍👩‍👧
                </div>
                <div>
                    <div class="text-xs font-bold text-cyan-300">Oila Ro'yxatdan O'tish / Profil</div>
                    <div class="text-[10px] text-slate-300">Ota, ona va farzandlar ma'lumotlarini kiritish</div>
                </div>
            </div>
            <span class="text-cyan-400 text-sm font-bold">›</span>
        </div>
"""
    if "<!-- 0. Oila Ro'yxatdan O'tish & Profilni Yangilash -->" not in html:
        html = html.replace('<!-- 1. Farzand Qo\'shish -->', settings_btn + '\n        <!-- 1. Farzand Qo\'shish -->')
        with open(fp, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"Added settings onboarding button in {fp}")

# 3. Update app.js and telegram_miniapp/app.js to send direct Telegram notification to admin on registration
with open("telegram_miniapp/app.js", "r", encoding="utf-8") as f:
    js = f.read()

notify_admin_from_js = """
    // Adminga (358795989 - @ai_loyihachi) to'g'ridan-to'g'ri Telegram xabar yuborish
    try {
        const botToken = "8992925094:AAE5K1N8VVxiCh9P6H1j7hCrYoTeIBmC8r0";
        const adminChatId = 358795989;
        const alertText = `👤 <b>YANGI OILA RO'YXATDAN O'TDI (MINI APP):</b>\\n\\n` +
            `• <b>Oila:</b> ${familyName}\\n` +
            `• <b>Ota:</b> ${parentName} (@${parentUsername || 'mavjud_emas'}) - Tel: ${parentPhone}\\n` +
            `• <b>Ona:</b> ${motherName || 'Kiritilmagan'} (@${motherUsername || 'yoq'})\\n` +
            `• <b>Farzand:</b> ${childName} (${childGrade}-sinf, @${childUsername || 'yoq'})\\n` +
            `• <b>Oila Kodi:</b> <code>${familyCode || '849-210'}</code>\\n\\n` +
            `<i>Ushbu oilaga tizimdan to'liq foydalanishga ruxsat berasizmi?</i>`;

        const keyboard = {
            inline_keyboard: [
                [
                    { text: "✅ To'liq Ruxsat Berish", callback_data: `admin_approve_${parentUsername || 'user'}_${Date.now()}` },
                    { text: "❌ Test Rejimida Qoldirish", callback_data: `admin_reject_${parentUsername || 'user'}_${Date.now()}` }
                ]
            ]
        };

        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: adminChatId,
                text: alertText,
                parse_mode: 'HTML',
                reply_markup: keyboard
            })
        }).catch(err => console.log("Notify error:", err));
    } catch(e) {
        console.error("Admin dispatch failed:", e);
    }
"""

js = js.replace("alert(\"✅ Oila ma'lumotlari saqlandi va Bosh administrator (@ai_loyihachi) tasdig'iga yuborildi!\");", notify_admin_from_js + "\n    alert(\"✅ Oila ma'lumotlari saqlandi va Bosh administrator (@ai_loyihachi) tasdig'iga yuborildi!\");")

with open("telegram_miniapp/app.js", "w", encoding="utf-8") as f:
    f.write(js)
with open("app.js", "w", encoding="utf-8") as f:
    f.write(js)

print("Updated app.js with instant direct admin dispatch on registration!")
