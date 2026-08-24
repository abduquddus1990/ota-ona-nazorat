import re, json

# 1. Update index.html and telegram_miniapp/index.html with new modals & updated consent overlay
new_child_consent = """    <!-- ==================================================================== -->
    <!-- 🤝 TO'LIQ EKRANLI FARZAND ROZILIK & ULANISH MODALI -->
    <!-- ==================================================================== -->
    <div id="childConsentOverlay" class="fixed inset-0 z-[100001] bg-[#13131b] flex flex-col justify-between p-4 md:p-6 overflow-y-auto hidden" style="background-image: linear-gradient(rgba(19,19,27,0.94), rgba(19,19,27,0.98)), url('assets/wolf_pup_hero.png'); background-size: 360px auto; background-position: center 50px; background-repeat: no-repeat;">
        <div class="space-y-3.5 pt-2">
            <!-- Mascot & Brand -->
            <div class="flex items-center justify-center gap-2.5">
                <div class="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(129,140,248,0.4)]">
                    <img src="assets/wolf_pup_hero.png" alt="Qalqon AI Bo'ri" class="w-10 h-10 object-contain">
                </div>
                <div>
                    <h1 class="font-display-brand text-base text-indigo-300 font-black tracking-wider leading-none">QALQON AI</h1>
                    <p class="text-[10px] text-slate-400 mt-0.5">Yosh Qahramon Xavfsizlik & Do'stlik Qalqoni</p>
                </div>
            </div>

            <!-- Psychological Trust Header -->
            <div class="glass-panel p-4 space-y-3 border-indigo-500/40 bg-slate-900/90 rounded-3xl text-center shadow-xl">
                <h2 class="text-sm font-black text-white leading-snug flex items-center justify-center gap-1.5">
                    <span>🌟</span>
                    <span>Salom, Yosh Qahramon!</span>
                </h2>
                <div class="p-2.5 rounded-xl bg-indigo-950/50 border border-indigo-500/30 text-left text-xs text-indigo-200 leading-relaxed">
                    <b>Bizning qat'iy kafolatimiz:</b> Sening ota-onang seni <u>hech qachon poylamaydi</u> va shaxsiy yozishmalaringni o'qimaydi. Tizim faqat sening xavfsizliging va darslarda eng yuqori 100 ball olishing uchun ishlaydi. 🐺✨
                </div>

                <!-- 4 Ta Aniq Ota-onaga Uzatiladigan Ruxsatlar va Ma'lumotlar -->
                <div class="space-y-2 text-left pt-1">
                    <div class="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1">
                        <span>📋</span>
                        <span>Ota-onangizga ko'rinadigan 4 ta ma'lumot:</span>
                    </div>

                    <!-- 1. Lokatsiya -->
                    <div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                        <span class="text-base flex-shrink-0">📍</span>
                        <div class="text-[11px]">
                            <b class="text-cyan-300">1. Jonli Lokatsiya va Xavfsiz Hududlar:</b>
                            <p class="text-slate-300 text-[10px] leading-tight mt-0.5">Darsdan so'ng maktabdan eson-omon chiqqaningizni va xavfsiz joydaligingizni bilish uchun.</p>
                        </div>
                    </div>

                    <!-- 2. YouTube & Insta -->
                    <div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                        <span class="text-base flex-shrink-0">🎬</span>
                        <div class="text-[11px]">
                            <b class="text-pink-300">2. YouTube & Instagram Qiziqish Mavzulari:</b>
                            <p class="text-slate-300 text-[10px] leading-tight mt-0.5">Shaxsiy chatlar o'qilmaydi! Faqat IT, ilm-fan, mantiq yoki o'yin qiziqishlari foizlarda tahlil qilinadi.</p>
                        </div>
                    </div>

                    <!-- 3. Ilovalar va Ekran vaqti -->
                    <div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                        <span class="text-base flex-shrink-0">📱</span>
                        <div class="text-[11px]">
                            <b class="text-amber-300">3. Ko'p Ishlatilayotgan Ilovalar va Ekran Vaqti:</b>
                            <p class="text-slate-300 text-[10px] leading-tight mt-0.5">Ko'z salomatligi va dars vaqtida diqqatni jamlash me'yorini saqlash uchun.</p>
                        </div>
                    </div>

                    <!-- 4. e-Maktab baholari -->
                    <div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                        <span class="text-base flex-shrink-0">📚</span>
                        <div class="text-[11px]">
                            <b class="text-emerald-300">4. e-Maktab 100 Ballik Baholar va Rag'batlar:</b>
                            <p class="text-slate-300 text-[10px] leading-tight mt-0.5">Darslardagi a'lochi natijalaringiz uchun ota-onangizdan yutuq va sovg'alar olishingiz uchun.</p>
                        </div>
                    </div>
                </div>

                <!-- Family Code Input (Oral code from parents) -->
                <div class="space-y-1.5 text-left pt-2 border-t border-slate-800">
                    <label class="text-[11px] font-bold text-slate-300 block">
                        🔑 6 Xonali Oila Kodi <span class="text-[10px] text-indigo-300 font-normal">(Ota-onangizdan og'zaki oling):</span>
                    </label>
                    <input type="text" id="childConsentFamilyCode" placeholder="Masalan: 849-210" maxlength="7" class="w-full bg-slate-950 border-2 border-indigo-500/60 rounded-2xl px-4 py-3 text-center text-lg font-black text-white font-mono tracking-widest focus:outline-none focus:border-cyan-400 placeholder-slate-600 transition">
                    <p id="childConsentError" class="text-[10px] text-rose-400 font-bold text-center hidden">⚠️ Iltimos, 6 xonali oila kodini to'liq kiriting!</p>
                </div>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-2 pb-3 pt-2">
            <button onclick="handleChildConsentAccept()" class="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs md:text-sm rounded-2xl transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2">
                <span>✅</span>
                <span>Barchasini Tushundim, Roziman va Ulanaman</span>
            </button>
            <button onclick="handleChildConsentDecline()" class="w-full py-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white font-bold text-xs rounded-2xl transition">
                <span>❌</span>
                <span>Qarshiman (Hozircha emas)</span>
            </button>
        </div>
    </div>
"""

parent_onboarding_and_manage_child_modals = """
    <!-- 👨‍👩‍👧 MODAL: OTA-ONA DASTLABKI PROFILI & OILANI SOZLASH (INITIAL ONBOARDING) -->
    <div id="modal-parent-onboarding" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <span class="w-8"></span>
            <h2 class="text-xs font-bold text-white">Oila va Profilni Sozlash</h2>
            <button onclick="closeSubpage()" class="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded-lg bg-slate-800">✕</button>
        </div>

        <div class="glass-card p-4 space-y-3.5">
            <div class="text-center space-y-1">
                <span class="text-3xl">👨‍👩‍👧</span>
                <h3 class="text-sm font-black text-white">Xush kelibsiz!</h3>
                <p class="text-[11px] text-slate-300 leading-relaxed">
                    Boshqaruv panelidan to'laqonli foydalanish uchun o'zingiz va oilangiz haqidagi asosiy ma'lumotlarni kiriting.
                </p>
            </div>

            <div class="space-y-2.5 pt-1 text-xs">
                <div>
                    <label class="text-[11px] font-bold text-slate-300 block mb-1">Oila Nomi / Familiyasi</label>
                    <input type="text" id="onboardFamilyName" placeholder="Masalan: Valijonovlar Oilasi" class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500">
                </div>

                <div>
                    <label class="text-[11px] font-bold text-slate-300 block mb-1">Sizning Ismingiz (Ota / Ona)</label>
                    <input type="text" id="onboardParentName" placeholder="Masalan: Abduquddus" class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500">
                </div>

                <div>
                    <label class="text-[11px] font-bold text-slate-300 block mb-1">Telefon Raqamingiz</label>
                    <input type="tel" id="onboardParentPhone" placeholder="+998 90 123 45 67" class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500">
                </div>

                <!-- Birinchi Farzand Ma'lumotlari -->
                <div class="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-2">
                    <div class="text-[11px] font-bold text-cyan-400 flex items-center gap-1">
                        <span>👦</span>
                        <span>Birinchi Farzandingiz:</span>
                    </div>
                    <div>
                        <label class="text-[10px] text-slate-300 block mb-1">Farzand Ism-Familiyasi</label>
                        <input type="text" id="onboardChildName" placeholder="Masalan: Aliyor Valijonov" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500">
                    </div>
                    <div>
                        <label class="text-[10px] text-slate-300 block mb-1">Sinfi (1-11 Sinf DTS)</label>
                        <select id="onboardChildGrade" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500">
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

                <button onclick="saveParentOnboarding()" class="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition">
                    💾 Saqlash va Dashboardga O'tish
                </button>
            </div>
        </div>
    </div>

    <!-- ➕ MODAL: YANGI FARZAND QO'SHISH -->
    <div id="modal-add-child" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <button onclick="closeSubpage()" class="text-xs font-bold text-emerald-400">← Orqaga</button>
            <h2 class="text-xs font-bold text-white">Yangi Farzand Qo'shish</h2>
            <span class="w-8"></span>
        </div>

        <div class="glass-card p-4 space-y-3">
            <div class="text-center space-y-1">
                <span class="text-3xl">👦</span>
                <h3 class="text-sm font-bold text-white">Farzand Profilini Yaratish</h3>
                <p class="text-[11px] text-slate-300">Har bir farzand uchun alohida unikal ID va darsliklar dasturi biriktiriladi.</p>
            </div>

            <div class="space-y-2.5 pt-1 text-xs">
                <div>
                    <label class="text-[11px] font-bold text-slate-300 block mb-1">Farzand Ism-Familiyasi</label>
                    <input type="text" id="newChildNameInput" placeholder="Masalan: Jasur Alimov" class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500">
                </div>

                <div>
                    <label class="text-[11px] font-bold text-slate-300 block mb-1">Sinfi (1-11 Sinf DTS)</label>
                    <select id="newChildGradeInput" class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500">
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

                <button onclick="handleAddNewChildSubmit()" class="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition">
                    ➕ Ro'yxatga Qo'shish
                </button>
            </div>
        </div>
    </div>
"""

# Header Child Actions Bar
header_child_actions = """        <div class="flex items-center gap-1.5">
            <!-- Farzand Tanlash Dropdown -->
            <select id="childSelect" onchange="switchChild(this.value)" class="bg-slate-900/90 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 cursor-pointer">
                <!-- JS orqali to'ldiriladi -->
            </select>
            <!-- ➕ Yangi Farzand Qo'shish -->
            <button onclick="openSubpage('modal-add-child')" class="p-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition" title="Yangi farzand qo'shish">
                ➕
            </button>
            <!-- 🗑️ Ushbu Farzandni O'chirish -->
            <button onclick="handleDeleteActiveChild()" class="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-bold transition" title="Ushbu farzandni o'chirish">
                🗑️
            </button>
        </div>"""

for fp in ["index.html", "telegram_miniapp/index.html"]:
    with open(fp, "r", encoding="utf-8") as f:
        html = f.read()

    # Replace child consent overlay
    consent_pattern = r'<!-- =+ -->\s*<!-- 🤝 TO\'LIQ EKRANLI FARZAND ROZILIK[\s\S]*?</div>\s*</div>'
    html = re.sub(consent_pattern, new_child_consent.strip(), html, count=1)

    # Insert onboarding and add child modals
    if 'id="modal-parent-onboarding"' not in html:
        html = html.replace('<!-- ℹ️ MODAL: DASTUR HAQIDA', parent_onboarding_and_manage_child_modals.strip() + '\n\n    <!-- ℹ️ MODAL: DASTUR HAQIDA')

    # Update header child selector
    header_select_pattern = r'<select id="childSelect"[\s\S]*?</select>'
    html = re.sub(header_select_pattern, header_child_actions.strip(), html, count=1)

    with open(fp, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Updated HTML in {fp}")

print("HTML updates applied successfully!")
