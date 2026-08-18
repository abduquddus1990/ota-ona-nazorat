import re

# 1. Update Hero Banners with generous left padding (px-6 py-5 pl-7)
new_parent_hero = """        <!-- 3D Bo'ri Qalqon AI Himoyachi Katta & Kengaytirilgan Hero Card (Erkin va Keng Hoshiyali) -->
        <section class="glass-panel px-6 py-5 bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-cyan-950/85 border-2 border-cyan-500/50 rounded-3xl relative overflow-hidden shadow-[0_8px_36px_rgba(34,211,238,0.22)]">
            <!-- Top Badges Row -->
            <div class="flex items-center justify-between gap-2 mb-3.5 z-10 relative pl-1">
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-[11px] font-black uppercase tracking-wider shadow-sm">
                    <span class="material-symbols-outlined text-sm text-cyan-300">shield</span>
                    <span>QALQON AI HIMOYACHI</span>
                </div>
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Doimiy Himoyada</span>
                </div>
            </div>

            <!-- Main Content & Wolf Row with generous left margin -->
            <div class="flex items-center justify-between gap-3 z-10 relative pl-1">
                <div class="space-y-2 flex-1 pr-2">
                    <h2 class="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-white leading-tight tracking-wide font-display-brand uppercase">
                        QALQON AI
                    </h2>
                    <div class="text-xs font-extrabold text-cyan-200/90 tracking-wide uppercase">
                        Oila Xavfsizlik & Ta'lim Qalqoni
                    </div>
                    <p class="text-xs text-slate-300 leading-relaxed pt-0.5">
                        Farzandingiz 24/7 aqlli sun'iy intellekt, 100 ballik DTS darsliklari va raqamli odatlar xavfsizligi nazorati ostida.
                    </p>
                </div>

                <!-- 3D Bo'ri Render Figurasi -->
                <div class="w-28 h-36 md:w-34 md:h-40 relative flex-shrink-0 flex items-center justify-center">
                    <img src="assets/wolf_adult_hero.png" alt="Qalqon AI Bo'ri Himoyachi" class="w-full h-full object-contain filter drop-shadow-[0_0_24px_rgba(34,211,238,0.65)] transform hover:scale-105 transition duration-300">
                </div>
            </div>

            <!-- Bottom Tech Tags -->
            <div class="mt-3.5 pt-3 border-t border-cyan-500/25 flex items-center justify-between text-[10px] text-slate-300 font-semibold z-10 relative px-1">
                <span class="flex items-center gap-1 text-cyan-300">
                    <span class="material-symbols-outlined text-xs">psychology</span>
                    <span>Gemini 2.0 AI</span>
                </span>
                <span class="flex items-center gap-1 text-emerald-300">
                    <span class="material-symbols-outlined text-xs">school</span>
                    <span>100 Ball DTS</span>
                </span>
                <span class="flex items-center gap-1 text-sky-300">
                    <span class="material-symbols-outlined text-xs">distance</span>
                    <span>Jonli Radar</span>
                </span>
            </div>

            <!-- Orqa Fon Suv Belgisi (Watermark) -->
            <div class="absolute -right-8 -bottom-10 w-56 h-56 opacity-15 pointer-events-none bg-center bg-no-repeat bg-contain" style="background-image: url('assets/wolf_adult_hero.png');"></div>
        </section>"""

new_child_hero = """        <!-- Farzand 3D Bo'ri Qahramon Katta & Kengaytirilgan Hero Card (Erkin va Keng Hoshiyali) -->
        <section class="glass-panel px-6 py-5 bg-gradient-to-br from-indigo-950/95 via-slate-900/90 to-purple-950/85 border-2 border-indigo-500/50 rounded-3xl relative overflow-hidden shadow-[0_8px_36px_rgba(129,140,248,0.22)]">
            <!-- Top Badges Row -->
            <div class="flex items-center justify-between gap-2 mb-3.5 z-10 relative pl-1">
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/50 text-indigo-300 text-[11px] font-black uppercase tracking-wider shadow-sm">
                    <span>⚔️</span>
                    <span>YOSH QAHRAMON HAMROHI</span>
                </div>
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>🟢 Faol & Himoyada</span>
                </div>
            </div>

            <!-- Main Content & Wolf Pup Row with generous left margin -->
            <div class="flex items-center justify-between gap-3 z-10 relative pl-1">
                <div class="space-y-2 flex-1 pr-2">
                    <h2 class="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-200 to-white leading-tight tracking-wide font-display-brand uppercase" data-i18n="childWelcomeTitle">
                        SALOM, YOSH QAHRAMON! 🌟
                    </h2>
                    <div class="text-xs font-extrabold text-indigo-200/90 tracking-wide uppercase">
                        Sening Aqlli Do'sting & Bilim Qalqoning
                    </div>
                    <p class="text-xs text-indigo-200 leading-relaxed pt-0.5" data-i18n="childWelcomeSub">
                        Darslarda a'lochi bo'lish, qiyin masalalarni oson yechish va maroqli bilim olishda yoningdagi sadoqatli yordamchi.
                    </p>
                </div>

                <!-- 3D Kichik Bo'ri Render Figurasi -->
                <div class="w-28 h-36 md:w-34 md:h-40 relative flex-shrink-0 flex items-center justify-center">
                    <img src="assets/wolf_pup_hero.png" alt="Qalqon AI Kichik Bo'ri" class="w-full h-full object-contain filter drop-shadow-[0_0_24px_rgba(129,140,248,0.65)] transform hover:scale-105 transition duration-300">
                </div>
            </div>

            <!-- Bottom Tags -->
            <div class="mt-3.5 pt-3 border-t border-indigo-500/25 flex items-center justify-between text-[10px] text-indigo-200 font-semibold z-10 relative px-1">
                <span class="flex items-center gap-1 text-indigo-300">
                    <span class="material-symbols-outlined text-xs">smart_toy</span>
                    <span>AI Do'st</span>
                </span>
                <span class="flex items-center gap-1 text-amber-300">
                    <span class="material-symbols-outlined text-xs">military_tech</span>
                    <span>100 Ball Yutuq</span>
                </span>
                <span class="flex items-center gap-1 text-emerald-300">
                    <span class="material-symbols-outlined text-xs">timer</span>
                    <span>25m Pomodoro</span>
                </span>
            </div>

            <!-- Orqa Fon Suv Belgisi (Watermark) -->
            <div class="absolute -right-8 -bottom-10 w-56 h-56 opacity-15 pointer-events-none bg-center bg-no-repeat bg-contain" style="background-image: url('assets/wolf_pup_hero.png');"></div>
        </section>"""

for fp in ["index.html", "telegram_miniapp/index.html"]:
    with open(fp, "r", encoding="utf-8") as f:
        html = f.read()

    # Replace parent hero section
    parent_hero_pattern = r'<!-- 3D Bo\'ri Qalqon AI Himoyachi.*?-->\s*<section class="glass-panel px?-?[\s\S]*?</section>'
    html = re.sub(parent_hero_pattern, new_parent_hero.strip(), html, count=1)

    # Replace child hero section
    child_hero_pattern = r'<!-- Farzand 3D Bo\'ri Qahramon.*?-->\s*<section class="glass-panel px?-?[\s\S]*?</section>'
    html = re.sub(child_hero_pattern, new_child_hero.strip(), html, count=1)

    with open(fp, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Updated padding and layout in {fp}")

# 2. Update bot_engine.py
with open("bot_engine.py", "r", encoding="utf-8") as f:
    bot_code = f.read()

# Update get_start_menu_text
old_start_uz = """    return (
        f"🛡️ <b>QALQON AI — BOSHQARUV MARKAZI</b>\\n\\n"
        f"Assalomu alaykum! Farzandingizning xavfsizligi, darsliklari va raqamli odatlari 24/7 doimiy himoya ostida.\\n\\n"
        f"✅ <b>Sizning hisobingiz to'liq faol!</b>\\n\\n"
        f"🔑 <b>Sizning oila kodingiz:</b> <code>{code}</code>\\n"
        f"📍 <b>Jonli lokatsiya va radar:</b> <b>100% BEPUL</b>\\n"
        f"💎 <b>Pro Versiya (AI & 100 ballik e-Maktab):</b> <b>10,000 so'm/oy (har bir bola uchun)</b>\\n"
        f"ℹ️ <i>Taklif va mulohazalar uchun rasmiy pochta: <code>alhamdulillah@tmail.ton</code></i>\\n\\n"
        f"Quyidagi bo'limlardan birini tanlang:"
    )"""

new_start_uz = """    return (
        f"👋 <b>Assalomu alaykum!</b>\\n\\n"
        f"🛡️ <b>Qalqon AI</b> — Ota-ona nazorati va AI tahlil tizimi 24/7 serverda faol.\\n\\n"
        f"Farzandingizning darsliklari (1-11 sinf DTS), 100 ballik baholari, ekran vaqti va ilovalar reytingini ko'rish uchun pastdagi tugmani bosing.\\n\\n"
        f"🔑 <b>Sizning oila kodingiz:</b> <code>{code}</code>\\n"
        f"📍 <b>Jonli lokatsiya va radar:</b> <b>100% BEPUL</b>\\n"
        f"💎 <b>Pro Versiya (AI & 100 ballik e-Maktab):</b> <b>10,000 so'm/oy (har bir bola uchun)</b>\\n"
        f"ℹ️ <i>Taklif va mulohazalar uchun rasmiy pochta: <code>alhamdulillah@tmail.ton</code></i>\\n\\n"
        f"Quyidagi bo'limlardan birini tanlang:"
    )"""

if old_start_uz in bot_code:
    bot_code = bot_code.replace(old_start_uz, new_start_uz)
else:
    # Pattern replace
    bot_code = re.sub(
        r'return \(\s*f"🛡️ <b>QALQON AI — BOSHQARUV MARKAZI</b>[\s\S]*?Quyidagi bo\'limlardan birini tanlang:"\s*\)',
        new_start_uz.strip(),
        bot_code
    )

# Clean any ShiParental Guardeld from bot_engine.py and supabase bot
bot_code = bot_code.replace("ShiParental Guardeld", "Qalqon AI")
bot_code = bot_code.replace("Shield Parental Guard", "Qalqon AI")
bot_code = bot_code.replace("SHIELD PARENTAL GUARD", "QALQON AI")

with open("bot_engine.py", "w", encoding="utf-8") as f:
    f.write(bot_code)
print("Updated bot_engine.py with Qalqon AI greetings!")

# 3. Update supabase/functions/ota-ona-bot/index.ts
with open("supabase/functions/ota-ona-bot/index.ts", "r", encoding="utf-8") as f:
    supa_bot = f.read()

supa_bot = supa_bot.replace("ShiParental Guardeld", "Qalqon AI")
supa_bot = supa_bot.replace("Shield Parental Guard", "Qalqon AI")
supa_bot = supa_bot.replace("SHIELD PARENTAL GUARD", "QALQON AI")

# Replace default start text in supabase bot
old_supa_uz = """  return `🛡️ <b>SHIELD PARENTAL GUARD — OTA-ONA BOSHQARUV MARKAZI</b>

Assalomu alaykum! Farzandingizning xavfsizligi, darsliklari va raqamli odatlari 24/7 doimiy nazorat ostida.

✅ <b>Sizning hisobingiz to'liq faol!</b>

🔑 <b>Sizning oila kodingiz:</b> <code>${code}</code>
📍 <b>Jonli lokatsiya va radar:</b> <b>100% BEPUL</b>
💎 <b>Pro Versiya (AI & 100 ballik e-Maktab):</b> <b>10,000 so'm/oy (har bir bola uchun)</b>
ℹ️ <i>Taklif va mulohazalar uchun rasmiy pochta: <code>alhamdulillah@tmail.ton</code></i>

Quyidagi bo'limlardan birini tanlang:`;"""

new_supa_uz = """  return `👋 <b>Assalomu alaykum!</b>

🛡️ <b>Qalqon AI</b> — Ota-ona nazorati va AI tahlil tizimi 24/7 serverda faol.

Farzandingizning darsliklari (1-11 sinf DTS), 100 ballik baholari, ekran vaqti va ilovalar reytingini ko'rish uchun pastdagi tugmani bosing.

🔑 <b>Sizning oila kodingiz:</b> <code>${code}</code>
📍 <b>Jonli lokatsiya va radar:</b> <b>100% BEPUL</b>
💎 <b>Pro Versiya (AI & 100 ballik e-Maktab):</b> <b>10,000 so'm/oy (har bir bola uchun)</b>
ℹ️ <i>Taklif va mulohazalar uchun rasmiy pochta: <code>alhamdulillah@tmail.ton</code></i>

Quyidagi bo'limlardan birini tanlang:`;"""

supa_bot = supa_bot.replace(old_supa_uz, new_supa_uz)

with open("supabase/functions/ota-ona-bot/index.ts", "w", encoding="utf-8") as f:
    f.write(supa_bot)
print("Updated supabase/functions/ota-ona-bot/index.ts with Qalqon AI greetings!")
