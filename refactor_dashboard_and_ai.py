import re

def update_file(fp):
    with open(fp, "r", encoding="utf-8") as f:
        html = f.read()

    # 1. Remove authStatusBanner
    auth_banner_pattern = r'<!-- =+ -->\s*<!-- AUTH STATUS / DEMO REJIMI BANNERI -->\s*<!-- =+ -->\s*<div id="authStatusBanner".*?</div>\s*</div>'
    html = re.sub(auth_banner_pattern, '', html, flags=re.DOTALL)
    
    # Also in case of simpler structure
    simple_banner_pattern = r'<div id="authStatusBanner"[\s\S]*?</div>\s*</div>'
    html = re.sub(simple_banner_pattern, '', html)

    # 2. Replace tab-dashboard
    new_dashboard = """    <!-- ==================================================================== -->
    <!-- TAB 1: 📊 DASHBOARD (QALQON AI HIMOYACHI HERO & ASOSIY STATUS) -->
    <!-- ==================================================================== -->
    <main id="tab-dashboard" class="tab-content active space-y-3.5">
        <!-- 3D Bo'ri Qalqon AI Himoyachi Katta Hero Card -->
        <section class="glass-panel p-4.5 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-cyan-950/70 border-cyan-500/50 rounded-2xl relative overflow-hidden flex items-center justify-between shadow-[0_4px_30px_rgba(34,211,238,0.18)]">
            <div class="space-y-2 z-10 max-w-[62%]">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[11px] font-extrabold uppercase tracking-wider">
                    <span class="material-symbols-outlined text-sm text-cyan-400">shield</span>
                    <span>Qalqon AI Himoyachi</span>
                </div>
                <h2 class="text-base font-black text-white leading-tight tracking-wide">QALQON AI — OILA XAVFSIZLIK QALQONI</h2>
                <p class="text-[11px] text-slate-300 leading-relaxed">Farzandingiz 24/7 aqlli himoya, 100 ballik DTS va xavfsiz raqamli odatlar nazorati ostida.</p>
                <div class="pt-1 flex items-center gap-1.5">
                    <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Doimiy Himoyada</span>
                    </span>
                </div>
            </div>
            <div class="w-32 h-36 relative flex-shrink-0 z-10 flex items-center justify-center">
                <img src="assets/wolf_adult_hero.png" alt="Qalqon AI Bo'ri Himoyachi" class="w-full h-full object-contain filter drop-shadow-[0_0_22px_rgba(34,211,238,0.6)] transform hover:scale-105 transition duration-300">
            </div>
            <div class="absolute -right-6 -bottom-8 w-48 h-48 opacity-25 pointer-events-none bg-center bg-no-repeat bg-contain" style="background-image: url('assets/wolf_adult_hero.png');"></div>
        </section>

        <!-- 1. Stitch Status Card (Level 1 Surface with Glow) -->
        <section class="glass-panel p-4 status-glow-safe status-accent-safe relative overflow-hidden">
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h2 class="text-sm font-black text-white mb-0.5 flex items-center gap-2">
                        <div class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse-dot"></div>
                        <span>Tizim Faol & Xavfsiz</span>
                    </h2>
                    <p class="text-[11px] text-emerald-400/90 font-medium">Barcha xavfsizlik himoyasi yoqilgan</p>
                </div>
                <div class="text-right">
                    <div class="flex items-center gap-1 text-cyan-400 font-bold text-xs font-mono">
                        <span class="material-symbols-outlined text-[16px]">battery_charging_full</span>
                        <span id="statBattery">84%</span>
                    </div>
                </div>
            </div>

            <div class="flex items-center gap-2 text-slate-300 text-[11px] bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800 inline-flex">
                <span class="material-symbols-outlined text-xs text-cyan-400">location_on</span>
                <span id="radarCurrentAddress">Yunusobod 4-mavze, 24-maktab</span>
            </div>
        </section>

        <!-- 2. Bugungi Ekran Vaqti & Limit Bloki -->
        <section class="glass-panel p-4 space-y-3">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-xs font-bold text-slate-400" data-i18n="screenTime">Bugungi Ekran Vaqti</h2>
                    <div class="text-2xl font-black text-white font-mono mt-0.5" id="totalScreenTime">3s 45d</div>
                </div>
                <div class="text-right">
                    <span class="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20" id="screenStatus" data-i18n="normalStatus">Normal</span>
                    <div class="text-[11px] text-slate-400 mt-1"><span data-i18n="limitRemain">Qoldi:</span> <b class="text-slate-200" id="remainingTime">1s 15d</b></div>
                </div>
            </div>

            <div class="progress-bar-bg">
                <div id="screenTimeBar" class="progress-bar-fill bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400" style="width: 72%;"></div>
            </div>
        </section>

        <!-- 3. Ilovalar Reytingi -->
        <section class="glass-panel p-4 space-y-3">
            <div class="flex items-center justify-between">
                <h3 class="text-xs font-bold text-white flex items-center gap-1.5" data-i18n="appRankings">
                    📱 Ilovalardan Foydalanish Reytingi
                </h3>
                <span class="text-[10px] text-slate-400" data-i18n="autoSynced">Avtomatik</span>
            </div>

            <div class="space-y-3" id="appUsageList">
                <!-- JS orqali to'ldiriladi -->
            </div>
        </section>
    </main>"""

    # 3. Replace tab-ai
    new_ai = """    <!-- ==================================================================== -->
    <!-- TAB 3: 🧠 AI MURABBIY (PRO: MATN, OVOZ, RASM VA REELS TAHLILI) -->
    <!-- ==================================================================== -->
    <main id="tab-ai" class="tab-content space-y-3.5 hidden">
        <!-- 1. AI Tahlil & Video Qiziqishlar (YouTube Shorts & Instagram Reels) -->
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
                <span class="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <span class="material-symbols-outlined text-xs">check_circle</span>
                    <span>Ijobiy</span>
                </span>
            </div>

            <p class="text-[11px] text-slate-300 leading-relaxed">
                Bugun YouTube'da asosan <b>robototexnika, Python dasturlash</b> va ilm-fan videolarini tomosha qildi. Xavf darajasi: <b>Past</b>.
            </p>

            <!-- Qiziqishlar Vektorlari -->
            <div class="pt-2 border-t border-slate-800/80 space-y-2.5">
                <div class="text-[11px] font-bold text-slate-300" data-i18n="interestVectors">🎯 Farzand Qiziqishlari Vektorlari:</div>
                <div class="space-y-2" id="aiInterestVectors">
                    <!-- JS orqali to'ldiriladi -->
                </div>
            </div>
        </section>

        <!-- 2. Tezkor Jonli Radar & Navigatsiya Tugmasi -->
        <div class="glass-panel p-3 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400">
                    <span class="material-symbols-outlined text-lg">distance</span>
                </div>
                <div>
                    <div class="text-xs font-bold text-white">Jonli Radar & Joylashuv</div>
                    <div class="text-[9px] text-emerald-400 font-semibold">100% Bepul doimiy monitoring</div>
                </div>
            </div>
            <button onclick="switchTab('tab-radar')" class="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-bold transition flex items-center gap-1">
                <span>Xaritaga o'tish</span>
                <span class="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
        </div>

        <!-- 3. AI Interaktiv Muloqot Majmuasi (Gemini Chat, Rasm, Ovoz) -->
        <section class="glass-panel p-4 space-y-3">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="text-xl">🧠</span>
                    <div>
                        <h2 class="text-xs font-bold text-white" data-i18n="aiTitle">Gemini AI Dars & Qiziqish Murabbiyi</h2>
                        <div class="text-[10px] text-emerald-400" data-i18n="aiSub">Ovozli, Matnli va Rasm orqali tavsiyalar</div>
                    </div>
                </div>
                <span class="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">PRO 💎</span>
            </div>

            <!-- AI Chat Tarixi Oynasi -->
            <div id="aiChatThread" class="ai-chat-container space-y-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col">
                <div class="chat-bubble-ai" id="aiWelcomeBubble">
                    Assalomu alaykum! Men farzandingizning darsliklarini o'zlashtirishi, qiziqishlari va raqamli odatlarini tahlil qiluvchi AI yordamchisiman. Darslik topshirig'i rasmini yuklang, savol yozing yoki ovozli xabar qoldiring! 🌟
                </div>
            </div>

            <!-- Rasm Yuklangan bo'lsa Kichik Preview -->
            <div id="imagePreviewContainer" class="hidden p-2 rounded-lg bg-slate-900/80 border border-slate-700 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <img id="imagePreview" src="" class="w-10 h-10 object-cover rounded-lg border border-slate-600" />
                    <div class="text-[10px] text-slate-300">
                        <div class="font-bold text-white" id="imageFileName">vazifa_rasmi.jpg</div>
                        <div data-i18n="readyForAnalysis">Tahlil uchun tayyor</div>
                    </div>
                </div>
                <button onclick="clearImagePreview()" class="text-slate-400 hover:text-red-400 text-xs px-2">✕</button>
            </div>

            <!-- Tezkor Savol Tugmalari (Prompt Chips) -->
            <div class="flex gap-1.5 overflow-x-auto pb-1 text-[10px]">
                <button onclick="sendQuickPrompt('Farzandim darslariga qiziqishini qanday oshirsam bo\'ladi?')" class="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-emerald-400 transition" data-i18n="chip1">
                    💡 Darsga qiziqishni oshirish
                </button>
                <button onclick="sendQuickPrompt('Ko\'rilgan Reels va video kontentlar tahlili')" class="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-emerald-400 transition" data-i18n="chip2">
                    🎬 Reels & Video tahlili
                </button>
                <button onclick="sendQuickPrompt('Ekran vaqti me\'yori va batareya tahlili')" class="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-emerald-400 transition" data-i18n="chip3">
                    📱 Ekran vaqti tahlili
                </button>
            </div>

            <!-- Input & Ovoz/Rasm Yuklash Kontrollari -->
            <div class="flex items-center gap-2 pt-1 border-t border-slate-800">
                <input type="file" id="aiImageInput" accept="image/*" class="hidden" onchange="handleImageSelected(event)">
                <button onclick="document.getElementById('aiImageInput').click()" class="p-2 rounded-xl bg-slate-800/70 border border-slate-700 text-slate-300 hover:text-purple-400 hover:border-purple-500/40 transition" title="Darslik rasmini yuklash">
                    📷
                </button>

                <input type="text" id="aiTextInput" placeholder="Savol yoki vazifani yozing..." class="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition" onkeypress="if(event.key==='Enter') sendTextMessage()">

                <button id="voiceRecordBtn" onclick="toggleVoiceRecording()" class="voice-record-btn" title="Ovoz yozish">
                    🎙️
                </button>

                <button onclick="sendTextMessage()" class="p-2 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition" title="Yuborish">
                    ➤
                </button>
            </div>

            <!-- Ovoz Yozish Holati -->
            <div id="voiceRecordingStatus" class="hidden p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                    <span class="text-[11px] font-bold text-red-400" data-i18n="recordingVoice">Ovoz yozilmoqda...</span>
                </div>
                <div class="waveform-bars">
                    <span class="waveform-bar" style="animation-delay: 0.1s"></span>
                    <span class="waveform-bar" style="animation-delay: 0.3s"></span>
                    <span class="waveform-bar" style="animation-delay: 0.2s"></span>
                    <span class="waveform-bar" style="animation-delay: 0.4s"></span>
                    <span class="waveform-bar" style="animation-delay: 0.15s"></span>
                </div>
                <button onclick="stopAndSendVoice()" class="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded font-bold" data-i18n="readyBtn">
                    Tayyor
                </button>
            </div>
        </section>
    </main>"""

    # Find and replace tab-dashboard
    dash_start = html.find('<main id="tab-dashboard"')
    if dash_start != -1:
        dash_end = html.find('</main>', dash_start) + len('</main>')
        html = html[:dash_start] + new_dashboard.strip() + html[dash_end:]

    # Find and replace tab-ai
    ai_start = html.find('<main id="tab-ai"')
    if ai_start != -1:
        ai_end = html.find('</main>', ai_start) + len('</main>')
        html = html[:ai_start] + new_ai.strip() + html[ai_end:]

    with open(fp, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Updated {fp}")

update_file("index.html")
update_file("telegram_miniapp/index.html")
print("Refactoring complete!")
