import re, json

# 1. Update index.html and telegram_miniapp/index.html
for fp in ["index.html", "telegram_miniapp/index.html"]:
    with open(fp, "r", encoding="utf-8") as f:
        html = f.read()

    # Redesign #modal-parent-onboarding into a spacious, multi-step family onboarding wizard
    wizard_html = """    <!-- 👨‍👩‍👧 MODAL: OTA-ONA DASTLABKI PROFILI & KENG QAMROVLI OILA WIZARD (STEP-BY-STEP) -->
    <div id="modal-parent-onboarding" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <span class="w-8"></span>
            <div class="text-center">
                <h2 class="text-xs font-black text-white">Qalqon AI — Oila Profilini Sozlash</h2>
                <div class="text-[9px] text-cyan-400 font-mono">1-Bosqich: Ota-Ona & Farzandlar Ro'yxati</div>
            </div>
            <button onclick="closeSubpage()" class="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded-lg bg-slate-800">✕</button>
        </div>

        <div class="glass-card p-5 space-y-4 rounded-3xl border-cyan-500/30 bg-slate-900/95 shadow-2xl">
            <!-- Brand Welcome Header -->
            <div class="text-center space-y-1.5 pb-2 border-b border-slate-800">
                <div class="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                    👨‍👩‍👧
                </div>
                <h3 class="text-sm font-black text-white">Xush kelibsiz, Hurmatli Ota-ona!</h3>
                <p class="text-[11px] text-slate-300 leading-relaxed">
                    Farzandlaringiz xavfsizligi va ta'limini to'liq nazorat qilish uchun oilaviy ma'lumotlarni to'ldiring.
                </p>
            </div>

            <!-- STEP 1: OTA MA'LUMOTLARI (ASOSIY FOYDALANUVCHI) -->
            <div class="space-y-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                        <span>👨</span> 1. Ota Ma'lumotlari:
                    </span>
                    <span class="text-[10px] text-slate-500 font-mono">Majburiy</span>
                </div>

                <div>
                    <label class="text-[11px] font-bold text-slate-300 block mb-1">Oila Nomi / Familiyasi:</label>
                    <input type="text" id="onboardFamilyName" placeholder="Masalan: Valijonovlar Oilasi" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium">
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-[10px] font-bold text-slate-300 block mb-1">Otaning Ismi:</label>
                        <input type="text" id="onboardParentName" placeholder="Abduquddus" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500">
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-slate-300 block mb-1">Telefon Raqami:</label>
                        <input type="tel" id="onboardParentPhone" placeholder="+998 90 123 45 67" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono">
                    </div>
                </div>

                <div>
                    <div class="flex items-center justify-between mb-1">
                        <label class="text-[10px] font-bold text-slate-300">Otaning Telegram Usernamesi:</label>
                        <button type="button" onclick="openUsernameGuideModal()" class="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5">
                            <span>ℹ️</span> Username olish
                        </button>
                    </div>
                    <div class="relative">
                        <span class="absolute left-3 top-2 text-xs text-slate-500 font-bold">@</span>
                        <input type="text" id="onboardParentUsername" placeholder="superman_uzb" class="w-full bg-slate-900 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono">
                    </div>
                </div>
            </div>

            <!-- STEP 2: ONA MA'LUMOTLARI (TURMUSH O'RTOG'I) -->
            <div class="space-y-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span class="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                    <span>👩</span> 2. Ona Ma'lumotlari (Turmush o'rtog'i):
                </span>

                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-[10px] font-bold text-slate-300 block mb-1">Onaning Ismi:</label>
                        <input type="text" id="onboardMotherName" placeholder="Dilnoza" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500">
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-slate-300 block mb-1">Telefoni:</label>
                        <input type="tel" id="onboardMotherPhone" placeholder="+998 91 234 56 78" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono">
                    </div>
                </div>

                <div>
                    <label class="text-[10px] font-bold text-slate-300 block mb-1">Onaning Telegram Usernamesi:</label>
                    <div class="relative">
                        <span class="absolute left-3 top-2 text-xs text-slate-500 font-bold">@</span>
                        <input type="text" id="onboardMotherUsername" placeholder="ona_username" class="w-full bg-slate-900 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono">
                    </div>
                </div>
            </div>

            <!-- STEP 3: FARZANDLAR MA'LUMOTLARI (1-FARZAND) -->
            <div class="space-y-3 p-3.5 rounded-2xl bg-slate-950/80 border border-indigo-500/40">
                <span class="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <span>👦</span> 3. Birinchi Farzand Ma'lumotlari:
                </span>

                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-[10px] font-bold text-slate-300 block mb-1">Farzand Ismi:</label>
                        <input type="text" id="onboardChildName" placeholder="Aliyor" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500">
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-slate-300 block mb-1">Sinfi (1-11 Sinf DTS):</label>
                        <select id="onboardChildGrade" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500">
                            <option value="1">1-sinf</option>
                            <option value="2">2-sinf</option>
                            <option value="3">3-sinf</option>
                            <option value="4">4-sinf</option>
                            <option value="5" selected>5-sinf</option>
                            <option value="6">6-sinf</option>
                            <option value="7">7-sinf</option>
                            <option value="8">8-sinf</option>
                            <option value="9">9-sinf</option>
                            <option value="10">10-sinf</option>
                            <option value="11">11-sinf</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="text-[10px] font-bold text-slate-300 block mb-1">Farzandning Telegram Usernamesi:</label>
                    <div class="relative">
                        <span class="absolute left-3 top-2 text-xs text-slate-500 font-bold">@</span>
                        <input type="text" id="onboardChildUsername" placeholder="aliyor_2012" class="w-full bg-slate-900 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono">
                    </div>
                    <p class="text-[9px] text-amber-300/80 mt-1">⚠️ Eslatma: Farzand ushbu username orqali 4 ta qoidaga rozilik bergach ma'lumotlar ko'rinadi.</p>
                </div>
            </div>

            <!-- UNIFIED FAMILY CODE INFO -->
            <div class="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                <div>
                    <span class="text-[10px] text-indigo-300 font-bold block">🔑 Barcha A'zolar Uchun Yagona Oila Kodi:</span>
                    <span class="text-xs text-slate-300">Ota, ona va farzandlar bitta kod orqali ulanadi.</span>
                </div>
                <div class="text-sm font-black text-cyan-400 font-mono px-3 py-1 bg-slate-900 rounded-xl border border-cyan-500/40">
                    849-210
                </div>
            </div>

            <!-- Submit Button -->
            <button onclick="handleCompleteParentOnboarding()" class="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-black text-xs md:text-sm rounded-2xl shadow-xl shadow-cyan-500/25 transition flex items-center justify-center gap-2">
                <span>🛡️</span>
                <span>Oilani Saqlash va Adminga So'rov Yuborish</span>
            </button>
        </div>
    </div>

    <!-- ℹ️ MODAL: TELEGRAM USERNAME OLISH YO'RIQNOTMASI -->
    <div id="modal-username-guide" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <button onclick="closeSubpage()" class="text-xs font-bold text-cyan-400">← Orqaga</button>
            <h2 class="text-xs font-bold text-white">Telegram Username Yo'riqnomasi</h2>
            <button onclick="closeSubpage()" class="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded-lg bg-slate-800">✕</button>
        </div>

        <div class="glass-card p-4 space-y-3.5 text-xs text-slate-200">
            <div class="text-center space-y-1 pb-2 border-b border-slate-800">
                <span class="text-3xl">📱✨</span>
                <h3 class="text-sm font-black text-white">Telegramda Username Qanday Belgilanadi?</h3>
            </div>

            <ol class="space-y-2.5 list-decimal list-inside text-[11px] text-slate-300 leading-relaxed">
                <li>Telegram ilovangizni oching va <b>Sozlamalar (Настройки / Settings)</b> bo'limiga kiring;</li>
                <li>O'z profil rasmingiz ostidagi <b>«Foydalanuvchi nomi» (Имя пользователя / Username)</b> qatorini bosing;</li>
                <li>O'zingizga qulay nom yozing (Masalan: <code>superman_uzb</code> yoki <code>aliyor_2012</code>);</li>
                <li>Yuqori o'ng burchakdagi <b>✓ (Saqlash)</b> tugmasini bosing;</li>
                <li>Shundan so'ng ushbu nomni Qalqon AI tizimiga kiriting!</li>
            </ol>

            <button onclick="closeSubpage(); openSubpage('modal-parent-onboarding');" class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition">
                « Tushundim, Ro'yxatdan O'tishga Qaytish
            </button>
        </div>
    </div>

    <!-- ⏳ MODAL / OVERLAY: ADMIN TASDIG'I KUTILMOQDA (PENDING BANNER) -->
    <div id="pendingApprovalOverlay" class="fixed inset-0 z-[99998] bg-[#13131bcc] backdrop-blur-md flex items-center justify-center p-4 hidden">
        <div class="glass-panel p-6 max-w-sm w-full space-y-4 text-center border-amber-500/40 bg-slate-900/95 rounded-3xl shadow-2xl">
            <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl animate-bounce">
                ⏳
            </div>
            <div class="space-y-1">
                <h3 class="text-sm font-black text-white">So'rov Adminga Yuborildi!</h3>
                <p class="text-xs text-slate-300 leading-relaxed">
                    Sizning hisobingiz yagona bosh administratorga (@ai_loyihachi) tekshirish va tasdiqlash uchun muvaffaqiyatli yetkazildi.
                </p>
            </div>
            <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 text-left space-y-1">
                <div>🛡️ <b>Holat:</b> <code>Kutilmoqda (Pending)</code></div>
                <div>ℹ️ Administrator tasdiqlaguniga qadar tizimdan <b>Test / Demo</b> rejimida foydalanishingiz mumkin.</div>
            </div>
            <button onclick="document.getElementById('pendingApprovalOverlay').classList.add('hidden')" class="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold text-xs rounded-2xl shadow-lg transition">
                👀 Test Rejimida Davom Etish
            </button>
        </div>
    </div>

    <!-- 🔘 FLOATING BOTTOM-RIGHT QUICK MENU BUTTON -->
    <div class="fixed bottom-20 right-4 z-[99990]">
        <div class="relative">
            <button onclick="toggleQuickMenu()" class="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 font-black shadow-xl shadow-cyan-500/40 flex items-center justify-center text-xl hover:scale-105 transition active:scale-95 border-2 border-white/40">
                ⚙️
            </button>
            <div id="quickMenuDropdown" class="absolute bottom-14 right-0 w-48 bg-slate-900/95 border border-slate-700 rounded-2xl p-2 shadow-2xl backdrop-blur-xl space-y-1 hidden">
                <button onclick="openSubpage('modal-plans'); toggleQuickMenu();" class="w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold text-amber-300 hover:bg-slate-800 flex items-center gap-2">
                    <span>⭐</span> <span>Stars To'lov Boti</span>
                </button>
                <button onclick="copyPairingLink(); toggleQuickMenu();" class="w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold text-cyan-300 hover:bg-slate-800 flex items-center gap-2">
                    <span>🔗</span> <span>Farzand Havolasi</span>
                </button>
                <button onclick="openSubpage('modal-parent-onboarding'); toggleQuickMenu();" class="w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold text-slate-300 hover:bg-slate-800 flex items-center gap-2">
                    <span>👨‍👩‍👧</span> <span>Oila Ma'lumotlari</span>
                </button>
                <button onclick="openSubpage('modal-settings'); toggleQuickMenu();" class="w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold text-slate-300 hover:bg-slate-800 flex items-center gap-2">
                    <span>⚙️</span> <span>Sozlamalar</span>
                </button>
            </div>
        </div>
    </div>
"""

    # Replace old modal-parent-onboarding
    modal_pattern = r'<!-- 👨‍👩‍👧 MODAL: OTA-ONA DASTLABKI PROFILI[\s\S]*?<\/div>\s*<\/div>\s*<\/div>'
    html = re.sub(modal_pattern, wizard_html.strip(), html, count=1)

    with open(fp, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Updated onboarding wizard in {fp}")

# 2. Update app.js and telegram_miniapp/app.js with multi-step handler and child security masking
with open("telegram_miniapp/app.js", "r", encoding="utf-8") as f:
    js = f.read()

app_handlers = """
function openUsernameGuideModal() {
    closeSubpage();
    openSubpage('modal-username-guide');
}

function toggleQuickMenu() {
    const menu = document.getElementById('quickMenuDropdown');
    if (menu) menu.classList.toggle('hidden');
}

function handleCompleteParentOnboarding() {
    const familyName = document.getElementById('onboardFamilyName')?.value.trim() || "Bizning Oila";
    const parentName = document.getElementById('onboardParentName')?.value.trim() || "Ota";
    const parentPhone = document.getElementById('onboardParentPhone')?.value.trim() || "";
    const parentUsername = document.getElementById('onboardParentUsername')?.value.trim().replace('@', '') || "";
    
    const motherName = document.getElementById('onboardMotherName')?.value.trim() || "";
    const motherPhone = document.getElementById('onboardMotherPhone')?.value.trim() || "";
    const motherUsername = document.getElementById('onboardMotherUsername')?.value.trim().replace('@', '') || "";

    const childName = document.getElementById('onboardChildName')?.value.trim() || "Aliyor";
    const childGrade = document.getElementById('onboardChildGrade')?.value || "5";
    const childUsername = document.getElementById('onboardChildUsername')?.value.trim().replace('@', '') || "";

    const familyData = {
        familyName,
        father: { name: parentName, phone: parentPhone, username: parentUsername },
        mother: { name: motherName, phone: motherPhone, username: motherUsername },
        children: [{ name: childName, grade: childGrade, username: childUsername, consented: false }],
        code: familyCode || "849-210",
        status: "pending"
    };

    localStorage.setItem('qalqon_family_profile', JSON.stringify(familyData));
    localStorage.setItem('parent_onboarded', 'true');
    localStorage.setItem('auth_status', 'pending');

    // Yangi farzandni bazaga qo'shish
    if (childName) {
        const childId = `CH-${Math.floor(100 + Math.random() * 900)}`;
        childrenDatabase[childId] = {
            id: childId,
            name: `${childName} (${childGrade}-sinf)`,
            grade: parseInt(childGrade),
            username: childUsername,
            avatar: "👦",
            battery: 92,
            streak: 5,
            points: 120,
            consented: false,
            location: { lat: 41.3111, lng: 69.2797, address: "Toshkent shahri (Rozilik kutilmoqda)" },
            schedule: [
                { time: "08:00", subject: "Matematika", room: "204-xona", status: "finished" }
            ],
            apps: [
                { name: "YouTube", time: "45d", percent: 40, category: "Ta'lim / Video", color: "bg-red-500", icon: "▶️" }
            ]
        };
        saveChildrenDatabase();
        currentChildKey = childId;
        renderChildSelectDropdown();
        renderActiveChild();
    }

    closeSubpage();

    // Show pending approval modal
    const pendingOverlay = document.getElementById('pendingApprovalOverlay');
    if (pendingOverlay) pendingOverlay.classList.remove('hidden');

    alert("✅ Oila ma'lumotlari saqlandi va Bosh administrator (@ai_loyihachi) tasdig'iga yuborildi!");
}
"""

if "function openUsernameGuideModal()" not in js:
    js += "\n" + app_handlers.strip() + "\n"

with open("telegram_miniapp/app.js", "w", encoding="utf-8") as f:
    f.write(js)
with open("app.js", "w", encoding="utf-8") as f:
    f.write(js)

print("Updated app.js with comprehensive onboarding wizard and pending approval workflow!")
