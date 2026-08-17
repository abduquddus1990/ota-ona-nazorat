import os

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. Add Wolf Pup Hero in child-tab-home
child_hero_old = """    <!-- FARZAND TAB 1: 🏠 ASOSIY (BOSH SAHIFA, TEZKOR XABARLAR, POMODORO & ULANISH) -->
    <main id="child-tab-home" class="tab-content space-y-3.5 hidden">
        <!-- Farzand Salomlashish Headeri -->
        <section class="glass-card p-4 bg-gradient-to-br from-indigo-950/70 to-purple-950/70 border-indigo-500/40 relative overflow-hidden">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-2xl animate-bounce">
                        🚀
                    </div>
                    <div>
                        <h2 class="text-sm font-black text-white" data-i18n="childWelcomeTitle">Salom, Yosh Qahramon! 🌟</h2>
                        <p class="text-[11px] text-indigo-300 mt-0.5" data-i18n="childWelcomeSub">Sening shaxsiy aqlli yordamching va xavfsizlik qalqoning</p>
                    </div>
                </div>
                <div class="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Online</span>
                </div>
            </div>
        </section>"""

child_hero_new = """    <!-- FARZAND TAB 1: 🏠 ASOSIY (BOSH SAHIFA, TEZKOR XABARLAR, POMODORO & ULANISH) -->
    <main id="child-tab-home" class="tab-content space-y-3.5 hidden">
        <!-- Farzand 3D Bo'ri Qahramon Boshqaruv Kartasi -->
        <section class="glass-panel p-4 bg-gradient-to-r from-indigo-950/90 via-slate-900/85 to-purple-950/70 border-indigo-500/50 relative overflow-hidden flex items-center justify-between">
            <div class="space-y-1.5 z-10 max-w-[62%]">
                <div class="flex items-center gap-1 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                    <span>⚔️</span>
                    <span>Yosh Qahramon Bo'ri Hamrohi</span>
                </div>
                <h2 class="text-sm font-black text-white leading-tight" data-i18n="childWelcomeTitle">Salom, Yosh Qahramon! 🌟</h2>
                <p class="text-[10px] text-indigo-200" data-i18n="childWelcomeSub">Sening shaxsiy aqlli do'sting va bilim qalqoning</p>
                <div class="pt-1 flex items-center gap-1">
                    <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">🟢 Faol & Himoyada</span>
                </div>
            </div>
            <div class="w-24 h-28 relative flex-shrink-0 z-10 flex items-center justify-center">
                <img src="assets/wolf_pup_hero.png" alt="Qalqon AI Kichik Bo'ri" class="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(129,140,248,0.6)] transform hover:scale-105 transition duration-300">
            </div>
            <div class="absolute -right-4 -bottom-6 w-36 h-36 opacity-20 pointer-events-none bg-center bg-no-repeat bg-contain" style="background-image: url('assets/wolf_pup_hero.png');"></div>
        </section>"""

if child_hero_old in html:
    html = html.replace(child_hero_old, child_hero_new)
else:
    print("child_hero_old not matched precisely, searching regex...")

# 2. Add Adult Wolf Mascot in tab-dashboard
dashboard_old = """    <!-- TAB 1: 📊 DASHBOARD (STITCH STATUS CARD & AI INSIGHTS) -->
    <!-- ==================================================================== -->
    <main id="tab-dashboard" class="tab-content active space-y-3.5">
        <!-- 1. Stitch Status Card (Level 1 Surface with Glow) -->"""

dashboard_new = """    <!-- TAB 1: 📊 DASHBOARD (STITCH STATUS CARD & AI INSIGHTS) -->
    <!-- ==================================================================== -->
    <main id="tab-dashboard" class="tab-content active space-y-3.5">
        <!-- 3D Bo'ri Qalqon AI Himoyachi Hero Card -->
        <section class="glass-panel p-3.5 bg-gradient-to-r from-slate-900/95 via-slate-900/85 to-cyan-950/60 border-cyan-500/40 relative overflow-hidden flex items-center justify-between">
            <div class="space-y-1 z-10 max-w-[65%]">
                <div class="flex items-center gap-1.5 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                    <span class="material-symbols-outlined text-sm">shield</span>
                    <span>Qalqon AI Himoyachi</span>
                </div>
                <h2 class="text-sm font-black text-white leading-tight">Qalqon AI — Oila Xavfsizlik Qalqoni</h2>
                <p class="text-[10px] text-slate-300">Farzandingiz 24/7 aqlli himoya, 100 ballik DTS va xavfsiz odatlar nazoratida.</p>
            </div>
            <div class="w-24 h-28 relative flex-shrink-0 z-10 flex items-center justify-center">
                <img src="assets/wolf_adult_hero.png" alt="Qalqon AI Bo'ri Himoyachi" class="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] transform hover:scale-105 transition duration-300">
            </div>
            <div class="absolute -right-4 -bottom-6 w-36 h-36 opacity-20 pointer-events-none bg-center bg-no-repeat bg-contain" style="background-image: url('assets/wolf_adult_hero.png');"></div>
        </section>

        <!-- 1. Stitch Status Card (Level 1 Surface with Glow) -->"""

if dashboard_old in html:
    html = html.replace(dashboard_old, dashboard_new)

# 3. Update modal-themes with Wolf Themes
themes_old = """        <div class="grid grid-cols-2 gap-3">
            <div onclick="setTheme('default')" data-theme-name="default" class="theme-card active bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-emerald-400">
                Cyber Dark
            </div>"""

themes_new = """        <div class="grid grid-cols-2 gap-3">
            <div onclick="setTheme('wolf_adult')" data-theme-name="wolf_adult" class="theme-card active bg-gradient-to-br from-slate-900 to-cyan-950 border-cyan-500/50 text-cyan-300 flex flex-col justify-end p-2 relative overflow-hidden">
                <div class="absolute right-0 bottom-0 w-14 h-16 opacity-40 bg-contain bg-no-repeat bg-right-bottom" style="background-image: url('assets/wolf_adult_hero.png');"></div>
                <div class="text-[9px] text-cyan-400 font-semibold">🐺 Ota-ona Foni</div>
                <div class="font-bold text-white text-xs">Katta Bo'ri (Qalqon)</div>
            </div>
            <div onclick="setTheme('wolf_pup')" data-theme-name="wolf_pup" class="theme-card bg-gradient-to-br from-slate-900 to-indigo-950 border-indigo-500/50 text-indigo-300 flex flex-col justify-end p-2 relative overflow-hidden">
                <div class="absolute right-0 bottom-0 w-14 h-16 opacity-40 bg-contain bg-no-repeat bg-right-bottom" style="background-image: url('assets/wolf_pup_hero.png');"></div>
                <div class="text-[9px] text-indigo-400 font-semibold">🐺 Farzand Foni</div>
                <div class="font-bold text-white text-xs">Kichik Bo'ri (Qilich)</div>
            </div>
            <div onclick="setTheme('default')" data-theme-name="default" class="theme-card bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-emerald-400">
                Cyber Dark
            </div>"""

if themes_old in html:
    html = html.replace(themes_old, themes_new)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)

with open("telegram_miniapp/index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("Wolf hero cards and theme options injected into HTML files!")
