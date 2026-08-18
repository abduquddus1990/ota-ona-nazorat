import re

child_consent_overlay = """
    <!-- ==================================================================== -->
    <!-- 🤝 TO'LIQ EKRANLI FARZAND ROZILIK & ULANISH MODALI -->
    <!-- ==================================================================== -->
    <div id="childConsentOverlay" class="fixed inset-0 z-[100001] bg-[#13131b] flex flex-col justify-between p-5 overflow-y-auto hidden" style="background-image: linear-gradient(rgba(19,19,27,0.92), rgba(19,19,27,0.98)), url('assets/wolf_pup_hero.png'); background-size: 360px auto; background-position: center 60px; background-repeat: no-repeat;">
        <div class="space-y-4 pt-4">
            <!-- Mascot & Brand -->
            <div class="flex items-center justify-center gap-2.5">
                <div class="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(129,140,248,0.4)]">
                    <img src="assets/wolf_pup_hero.png" alt="Qalqon AI Bo'ri" class="w-10 h-10 object-contain">
                </div>
                <div>
                    <h1 class="font-display-brand text-base text-indigo-300 font-black tracking-wider leading-none">QALQON AI</h1>
                    <p class="text-[10px] text-slate-400 mt-0.5">Yosh Qahramon Aqlli Do'sti</p>
                </div>
            </div>

            <!-- Psychological Trust Card -->
            <div class="glass-panel p-5 space-y-3.5 border-indigo-500/40 bg-slate-900/90 rounded-3xl text-center shadow-xl">
                <span class="text-3xl">🛡️✨</span>
                <h2 class="text-sm font-black text-white leading-snug">
                    Salom, Yosh Qahramon! 🌟
                </h2>
                <div class="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-left space-y-2 text-xs text-slate-200 leading-relaxed">
                    <p>
                        <b>Bizning asosiy qoidamiz:</b> Sening ota-onang seni <u>hech qachon poylamaydi</u> va shaxsiy yozishmalaringni o'qimaydi.
                    </p>
                    <p class="text-[11px] text-indigo-200">
                        Sening o'z roziligingsiz hech qanday xavfsizlik funksiyalari yoqilmaydi. Bu ilova darslarda a'lochi bo'lishing, qiyin misollarni oson yechishing va xavfsizligingda senga eng yaqin do'st bo'lish uchun yaratilgan! 🐺
                    </p>
                </div>

                <!-- Family Code Input (Oral code from parents) -->
                <div class="space-y-1.5 text-left pt-1">
                    <label class="text-[11px] font-bold text-slate-300 block">
                        🔑 6 Xonali Oila Kodi <span class="text-[10px] text-indigo-300 font-normal">(Ota-onangizdan og'zaki oling):</span>
                    </label>
                    <input type="text" id="childConsentFamilyCode" placeholder="Masalan: 849-210" maxlength="7" class="w-full bg-slate-950 border-2 border-indigo-500/60 rounded-2xl px-4 py-3 text-center text-lg font-black text-white font-mono tracking-widest focus:outline-none focus:border-cyan-400 placeholder-slate-600 transition">
                    <p id="childConsentError" class="text-[10px] text-rose-400 font-bold text-center hidden">⚠️ Iltimos, 6 xonali oila kodini to'liq kiriting!</p>
                </div>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-2.5 pb-4 pt-3">
            <button onclick="handleChildConsentAccept()" class="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm rounded-2xl transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2">
                <span>✅</span>
                <span>Roziman va Ulanaman</span>
            </button>
            <button onclick="handleChildConsentDecline()" class="w-full py-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white font-bold text-xs rounded-2xl transition">
                <span>❌</span>
                <span>Qarshiman (Hozircha emas)</span>
            </button>
        </div>
    </div>
"""

child_tab_settings = """
    <!-- ==================================================================== -->
    <!-- FARZAND TAB 5: ⚙️ SOZLAMALAR (CHILD SETTINGS HUB) -->
    <!-- ==================================================================== -->
    <main id="child-tab-settings" class="tab-content space-y-2.5 hidden">
        <div class="flex items-center justify-between px-1 mb-1">
            <h2 class="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-indigo-400">settings</span>
                <span>Mening Sozlamalarim</span>
            </h2>
            <span class="text-[10px] text-indigo-400 font-mono font-bold">Farzand Profili</span>
        </div>

        <!-- 1. Qahramon Fonlari -->
        <div onclick="openSubpage('modal-themes')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-indigo-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-lg">
                    🎨
                </div>
                <div>
                    <div class="text-xs font-bold text-white">Qahramon Fonlari</div>
                    <div class="text-[10px] text-slate-400">Kichik Bo'ri, Cyber Ice, Neon Fazoviy</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 2. Ilova Haqida & Maxfiylik Kafolati -->
        <div onclick="openSubpage('modal-about')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-indigo-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg">
                    🛡️
                </div>
                <div>
                    <div class="text-xs font-bold text-white">Ilova Haqida & Maxfiylik Huquqlarim</div>
                    <div class="text-[10px] text-slate-400">Poyloqchilik emas — bilim va xavfsiz do'stlik</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 3. Pomodoro Dars Taymeri -->
        <div onclick="switchChildTab('child-tab-home')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-indigo-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">
                    ⏱️
                </div>
                <div>
                    <div class="text-xs font-bold text-white">Pomodoro Dars Taymeri</div>
                    <div class="text-[10px] text-slate-400">25 daqiqa dars / 5 daqiqa ko'z mashqi</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 4. Yutuqlarim va Rag'batlar -->
        <div onclick="switchChildTab('child-tab-rewards')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-indigo-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 text-lg">
                    🏆
                </div>
                <div>
                    <div class="text-xs font-bold text-white">Mening Yutuqlarim & Ballarim</div>
                    <div class="text-[10px] text-slate-400">100 ballik e-Maktab DTS rag'batlari</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 5. Ota-onam bilan Favqulodda Bog'lanish (SOS) -->
        <div onclick="sendChildQuickStatus('sos')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-rose-500/50 transition bg-rose-950/20">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 text-lg">
                    🚨
                </div>
                <div>
                    <div class="text-xs font-bold text-rose-300">Favqulodda SOS Xabar Yuborish</div>
                    <div class="text-[10px] text-slate-400">Ota-onaga zudlik bilan lokatsiya va signal boradi</div>
                </div>
            </div>
            <span class="text-rose-400 text-xs font-bold">SOS ↗</span>
        </div>
    </main>
"""

new_child_nav = """    <!-- ==================================================================== -->
    <!-- FARZAND BOTTOM NAVIGATION BAR (STITCH 5 TA FARZAND BO'LIMI) -->
    <!-- ==================================================================== -->
    <nav id="childBottomNav" class="bottom-nav hidden">
        <button onclick="switchChildTab('child-tab-home')" id="nav-child-tab-home" class="nav-btn active">
            <span class="material-symbols-outlined">home</span>
            <span data-i18n="childNavHome">Asosiy</span>
        </button>

        <button onclick="switchChildTab('child-tab-ai')" id="nav-child-tab-ai" class="nav-btn">
            <span class="material-symbols-outlined">smart_toy</span>
            <span data-i18n="childNavAi">AI Do'st</span>
        </button>

        <button onclick="switchChildTab('child-tab-rewards')" id="nav-child-tab-rewards" class="nav-btn">
            <span class="material-symbols-outlined">military_tech</span>
            <span data-i18n="childNavRewards">Yutuqlar</span>
        </button>

        <button onclick="switchChildTab('child-tab-school')" id="nav-child-tab-school" class="nav-btn">
            <span class="material-symbols-outlined">menu_book</span>
            <span data-i18n="childNavSchool">e-Maktabim</span>
        </button>

        <button onclick="switchChildTab('child-tab-settings')" id="nav-child-tab-settings" class="nav-btn">
            <span class="material-symbols-outlined">settings</span>
            <span>Sozlamalar</span>
        </button>
    </nav>"""

balanced_ai_widget = """        <!-- 1. AI Tahlil & Video Qiziqishlar (Ijobiy & Xavf Signallari Muvozanati) -->
        <section class="glass-panel p-4 border-t-2 border-t-cyan-400/80 space-y-3">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <span class="material-symbols-outlined text-xl">psychology</span>
                    </div>
                    <div>
                        <h3 class="text-xs font-black text-white">AI Tahlil & Video Qiziqishlar</h3>
                        <div class="text-[10px] text-slate-400">YouTube Shorts va Instagram Reels</div>
                    </div>
                </div>
                <span class="px-2.5 py-0.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <span class="material-symbols-outlined text-xs">tune</span>
                    <span>Muvozanatli</span>
                </span>
            </div>

            <!-- Ijobiy va Salbiy Tomonlar Gridi -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                <!-- Ijobiy qiziqishlar -->
                <div class="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                    <div class="font-bold text-emerald-300 flex items-center gap-1 text-[11px]">
                        <span>🟢</span>
                        <span>Ijobiy Qiziqishlar:</span>
                    </div>
                    <p class="text-slate-300 text-[10px] leading-relaxed">
                        • <b>IT & Python dasturlash:</b> 40%<br>
                        • <b>Ilmiy tajribalar & Mantiq:</b> 25%
                    </p>
                </div>

                <!-- Salbiy / E'tibor berish kerak bo'lgan xatarlar -->
                <div class="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1">
                    <div class="font-bold text-rose-300 flex items-center gap-1 text-[11px]">
                        <span>⚠️</span>
                        <span>E'tibor berish kerak bo'lgan xatarlar:</span>
                    </div>
                    <p class="text-slate-300 text-[10px] leading-relaxed">
                        • <b>Ortiqcha o'yinlar & Shorts:</b> 35%<br>
                        • <b>Tungi ekran vaqti:</b> 22:30 dan so'ng chalg'ish
                    </p>
                </div>
            </div>

            <!-- Psixologik Tavsiya -->
            <div class="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-[10px] text-cyan-200 leading-relaxed flex items-start gap-2">
                <span class="text-sm">💡</span>
                <div>
                    <b>Psixologik tavsiya:</b> Farzandingiz bilan telefonni tortib olmasdan, o'yin vaqtini 1 soat bilan cheklab, birga sport to'garagi yoki robototexnikaga borishni rag'batlantiring.
                </div>
            </div>

            <!-- Qiziqishlar Vektorlari -->
            <div class="pt-2 border-t border-slate-800/80 space-y-2">
                <div class="text-[11px] font-bold text-slate-300" data-i18n="interestVectors">🎯 Farzand Qiziqishlari Vektorlari:</div>
                <div class="space-y-2" id="aiInterestVectors">
                    <!-- JS orqali to'ldiriladi -->
                </div>
            </div>
        </section>"""

for fp in ["index.html", "telegram_miniapp/index.html"]:
    with open(fp, "r", encoding="utf-8") as f:
        html = f.read()

    # Wrap role switcher with ID
    html = re.sub(
        r'<div class="glass-panel p-1.5 mb-2.5 flex items-center justify-between gap-1.5 bg-slate-900/90 border-\[#334155\] rounded-2xl">',
        '<div id="roleSwitcherContainer" class="glass-panel p-1.5 mb-2.5 flex items-center justify-between gap-1.5 bg-slate-900/90 border-[#334155] rounded-2xl">',
        html
    )

    # Insert childConsentOverlay before </header> or after body
    if 'id="childConsentOverlay"' not in html:
        html = re.sub(r'(<body[^>]*>)', r'\1\n' + child_consent_overlay.strip() + '\n', html, count=1)

    # Insert child-tab-settings
    if 'id="child-tab-settings"' not in html:
        html = html.replace('<!-- ==================================================================== -->\n    <!-- TAB 1: 📊 DASHBOARD', child_tab_settings.strip() + '\n\n    <!-- ==================================================================== -->\n    <!-- TAB 1: 📊 DASHBOARD')

    # Update child bottom nav
    nav_pattern = r'<!-- =+ -->\s*<!-- FARZAND BOTTOM NAVIGATION BAR[\s\S]*?</nav>'
    html = re.sub(nav_pattern, new_child_nav.strip(), html)

    # Update balanced AI widget in tab-ai
    ai_widget_pattern = r'<!-- 1\. AI Tahlil & Video Qiziqishlar[\s\S]*?</section>'
    html = re.sub(ai_widget_pattern, balanced_ai_widget.strip(), html, count=1)

    with open(fp, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Updated HTML in {fp}")

print("HTML updates completed!")
