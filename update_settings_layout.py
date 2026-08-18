import os

new_settings_section = """    <!-- ==================================================================== -->
    <!-- TAB 5: ⚙️ SOZLAMALAR (FULL SETTINGS HUB & SUBPAGES) -->
    <!-- ==================================================================== -->
    <main id="tab-settings" class="tab-content space-y-2.5 hidden">
        <div class="flex items-center justify-between px-1 mb-1">
            <h2 class="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5" data-i18n="settingsTitle">
                <span class="material-symbols-outlined text-sm text-cyan-400">settings</span>
                <span>Tizim Sozlamalari & Ma'lumotlar</span>
            </h2>
            <span class="text-[10px] text-cyan-400 font-mono font-bold">v4.4 Qalqon AI</span>
        </div>

        <!-- 1. Dastur Haqida & Bizning Maqsadimiz -->
        <div onclick="openSubpage('modal-about')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg">
                    🛡️
                </div>
                <div>
                    <div class="text-xs font-bold text-white" data-i18n="aboutAppTitle">Dastur Haqida & Asosiy Maqsad</div>
                    <div class="text-[10px] text-slate-400" data-i18n="aboutAppSub">Poyloqchilik emas — mehr, xavfsizlik va darslik nazorati</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 2. Dastur Statistikasi & Dinamik O'sish -->
        <div onclick="openSubpage('modal-app-stats')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-lg">
                    📊
                </div>
                <div>
                    <div class="text-xs font-bold text-white" data-i18n="appStatsTitle">Dastur Statistikasi & Dinamika</div>
                    <div class="text-[10px] text-slate-400" data-i18n="appStatsSub">14,820+ Ota-onalar, 23,450+ Farzandlar</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 3. Fon va Dizaynni Tanlash -->
        <div onclick="openSubpage('modal-themes')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 text-lg">
                    🎨
                </div>
                <div>
                    <div class="text-xs font-bold text-white" data-i18n="themeSelect">Fon va Dizaynni Tanlash</div>
                    <div class="text-[10px] text-slate-400" data-i18n="themeSub">12 xil eksklyuziv estetika fonlari & 3D Bo'rilar</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 4. Farzand Ma'lumotlari & Sinfi -->
        <div onclick="openChildProfileModal()" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg">
                    👶
                </div>
                <div>
                    <div class="text-xs font-bold text-white" data-i18n="profileTitle">Farzand Ma'lumotlari & Sinfi</div>
                    <div class="text-[10px] text-slate-400" data-i18n="profileSub">Ism, Username, Telefon va e-Maktab</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 5. Tilni O'zgartirish (UZ / RU) -->
        <div onclick="openSubpage('modal-languages')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 text-lg">
                    🌐
                </div>
                <div>
                    <div class="text-xs font-bold text-white" data-i18n="langSelect">Tilni O'zgartirish (Язык)</div>
                    <div class="text-[10px] text-slate-400" data-i18n="langSub">O'zbekcha / Русский</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 6. Tariflar va Obuna (Free / Pro) -->
        <div onclick="openSubpage('modal-plans')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">
                    💎
                </div>
                <div>
                    <div class="text-xs font-bold text-white" data-i18n="plansSelect">Tariflar va Obuna</div>
                    <div class="text-[10px] text-slate-400" data-i18n="plansSub">Free (Lokatsiya) / Pro (10,000 so'm)</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 7. Juftlash va Android Ilova -->
        <div onclick="openSubpage('modal-pairing')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 text-lg">
                    🛡️
                </div>
                <div>
                    <div class="text-xs font-bold text-white" data-i18n="pairingSelect">Farzandni Ulash & Android Ilova</div>
                    <div class="text-[10px] text-slate-400" data-i18n="pairingSub">Oila kodi va avtomatik juftlash</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 8. Takliflar va Fikr-mulohazalar (alhamdulillah@tmail.ton) -->
        <div onclick="openSubpage('modal-feedback')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 text-lg">
                    💡
                </div>
                <div>
                    <div class="text-xs font-bold text-white" data-i18n="feedbackTitle">Taklif va Mulohazalar</div>
                    <div class="text-[10px] text-slate-400" data-i18n="feedbackSub">alhamdulillah@tmail.ton orqali fikr yuborish</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 9. Ota-ona Hisobi & Kirish (Auth Settings) -->
        <div onclick="openSubpage('modal-auth')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-lg">
                    👤
                </div>
                <div>
                    <div class="text-xs font-bold text-white" id="settingsAuthUsername" data-i18n="authSettingsTitle">Ota-ona Hisobi & Kirish</div>
                    <div class="text-[10px] text-emerald-400" id="settingsAuthStatus" data-i18n="authSettingsSub">Holat: To'liq Faol Kirish</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>
    </main>"""

for fp in ["index.html", "telegram_miniapp/index.html"]:
    with open(fp, "r", encoding="utf-8") as f:
        content = f.read()

    # Find start and end of tab-settings
    start_tag = '<main id="tab-settings"'
    end_tag = '</main>'
    
    start_idx = content.find(start_tag)
    if start_idx != -1:
        end_idx = content.find(end_tag, start_idx) + len(end_tag)
        old_part = content[start_idx:end_idx]
        content = content[:start_idx] + new_settings_section.strip() + content[end_idx:]
        with open(fp, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {fp} with modular settings menu!")
    else:
        print(f"Start tag not found in {fp}")

print("Settings layout updated successfully!")
