import re

# 1. Update child AI section in index.html and telegram_miniapp/index.html
new_child_ai_tab = """    <!-- FARZAND TAB 2: 🧠 AI DO'ST (AI CHAT, DOIMIY MULTI-TURN SUHBAT, RAG & FAN SHABLONLARI) -->
    <main id="child-tab-ai" class="tab-content space-y-3.5 hidden">
        <section class="glass-panel p-4 space-y-3 border-indigo-500/40">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                    <div class="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl shadow-md">
                        🐺
                    </div>
                    <div>
                        <h3 class="text-xs font-black text-white">Qalqon AI — Aqlli Bo'ri Do'stim</h3>
                        <div class="text-[10px] text-indigo-300">1-11 Sinf DTS Darsliklari & Yordamchi</div>
                    </div>
                </div>
                <button onclick="clearChildChatHistory()" class="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[10px] text-slate-400 hover:text-white transition" title="Suhbatni tozalash">
                    🔄 Tozalash
                </button>
            </div>

            <!-- AI Multi-Turn Chat Tarixi Oynasi (Uzluksiz Suhbat) -->
            <div id="childAiChatThread" class="max-h-80 overflow-y-auto space-y-2.5 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col text-xs shadow-inner">
                <div class="flex items-start gap-2.5">
                    <div class="w-7 h-7 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm flex-shrink-0">🐺</div>
                    <div class="p-3 rounded-2xl rounded-tl-sm bg-indigo-950/50 border border-indigo-500/30 text-slate-200 leading-relaxed shadow-sm">
                        Assalomu alaykum, aziz do'stim! 🌟 Men sening o'qishdagi eng yaqin do'stingman. Matematika, Fizika, Ingliz tili yoki darslikdagi istalgan qiyin misolingni yoz — birgalikda bosqichma-bosqich yechamiz! 🐺✨
                    </div>
                </div>
            </div>

            <!-- Tezkor Fan Shablonlari -->
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button onclick="askChildAiPreset('matem')" class="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-indigo-600/30 border border-slate-700/80 text-[10px] font-bold text-slate-300 hover:text-indigo-300 whitespace-nowrap transition flex items-center gap-1">📐 Matematika (Kasrlar)</button>
                <button onclick="askChildAiPreset('english')" class="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-indigo-600/30 border border-slate-700/80 text-[10px] font-bold text-slate-300 hover:text-indigo-300 whitespace-nowrap transition flex items-center gap-1">📖 Ingliz tili (Grammar)</button>
                <button onclick="askChildAiPreset('physics')" class="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-indigo-600/30 border border-slate-700/80 text-[10px] font-bold text-slate-300 hover:text-indigo-300 whitespace-nowrap transition flex items-center gap-1">⚡ Fizika (Om qonuni)</button>
                <button onclick="askChildAiPreset('science')" class="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-indigo-600/30 border border-slate-700/80 text-[10px] font-bold text-slate-300 hover:text-indigo-300 whitespace-nowrap transition flex items-center gap-1">🧪 Kimyo (Davriy jadval)</button>
            </div>

            <!-- Input Bar -->
            <div class="flex items-center gap-2 pt-1 border-t border-slate-800">
                <input type="text" id="childAiInput" placeholder="Savolingni yoz..." class="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition" onkeypress="if(event.key==='Enter') handleChildAiSend()">
                <button onclick="handleChildAiSend()" class="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold transition shadow-md shadow-indigo-500/20">
                    ➤
                </button>
            </div>
        </section>
    </main>"""

for fp in ["index.html", "telegram_miniapp/index.html"]:
    with open(fp, "r", encoding="utf-8") as f:
        html = f.read()

    # Replace child-tab-ai
    child_ai_pattern = r'<!-- FARZAND TAB 2: 🧠 AI DO\'ST[\s\S]*?</main>'
    html = re.sub(child_ai_pattern, new_child_ai_tab.strip(), html, count=1)

    with open(fp, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Updated child-tab-ai in {fp}")

# 2. Update app.js and telegram_miniapp/app.js
with open("telegram_miniapp/app.js", "r", encoding="utf-8") as f:
    js = f.read()

# Make sure child AI functions support multi-turn thread
new_child_ai_handlers = """
// 🧠 FARZAND AI CHAT (MULTI-TURN UZLUKSIZ SUHBAT)
function clearChildChatHistory() {
    const thread = document.getElementById('childAiChatThread');
    if (!thread) return;
    const isRu = (currentLang === 'ru');
    thread.innerHTML = `
        <div class="flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm flex-shrink-0">🐺</div>
            <div class="p-3 rounded-2xl rounded-tl-sm bg-indigo-950/50 border border-indigo-500/30 text-slate-200 leading-relaxed shadow-sm">
                ${isRu ? "🐺 Чат очищен! Задай любой вопрос из школьной программы 1-11 классов." : "🐺 Suhbat tozalandi! 1-11 sinf darsliklaridan istalgan savolingni yoz."}
            </div>
        </div>
    `;
}

function askChildAiPreset(type) {
    const isRu = (currentLang === 'ru');
    const input = document.getElementById('childAiInput');
    if (!input) return;

    if (type === 'matem') {
        input.value = isRu ? "Как сложить разные дроби?" : "Oddiy kasrlarni qo'shish qoidasini tushuntir";
    } else if (type === 'english') {
        input.value = isRu ? "Объясни время Present Simple с примерами" : "Present Simple zamonini misollar bilan tushuntir";
    } else if (type === 'physics') {
        input.value = isRu ? "Что гласит закон Ома?" : "Om qonuni formulasi va qoidasi qanday?";
    } else if (type === 'science') {
        input.value = isRu ? "Расскажи про периодическую таблицу Менделеева" : "Mendeleyev davriy jadvali nima?";
    }
    handleChildAiSend();
}

function appendChildUserMessage(text) {
    const thread = document.getElementById('childAiChatThread');
    if (!thread) return;
    const msg = document.createElement('div');
    msg.className = "flex justify-end";
    msg.innerHTML = `
        <div class="bg-indigo-600 text-white font-medium rounded-2xl rounded-tr-sm p-3 max-w-[85%] text-xs shadow-md">
            ${text}
        </div>
    `;
    thread.appendChild(msg);
    thread.scrollTop = thread.scrollHeight;
}

function appendChildAiMessage(htmlContent) {
    const thread = document.getElementById('childAiChatThread');
    if (!thread) return;
    const msg = document.createElement('div');
    msg.className = "flex items-start gap-2.5 max-w-[95%]";
    msg.innerHTML = `
        <div class="w-7 h-7 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm flex-shrink-0">🐺</div>
        <div class="p-3 rounded-2xl rounded-tl-sm bg-indigo-950/50 border border-indigo-500/30 text-slate-200 leading-relaxed shadow-sm">
            ${htmlContent}
        </div>
    `;
    thread.appendChild(msg);
    thread.scrollTop = thread.scrollHeight;
}

function handleChildAiSend() {
    const input = document.getElementById('childAiInput');
    const text = input ? input.value.trim() : "";
    const isRu = (currentLang === 'ru');

    if (!text) return;
    if (input) input.value = "";

    // 1. Foydalanuvchi xabarini chatga qo'shish
    appendChildUserMessage(text);

    // 2. Kutilmoqda indikatori
    const thread = document.getElementById('childAiChatThread');
    const loadingId = 'child-ai-loading-' + Date.now();
    if (thread) {
        const loadDiv = document.createElement('div');
        loadDiv.id = loadingId;
        loadDiv.className = "flex items-center gap-2 text-[11px] text-indigo-300 italic pl-9";
        loadDiv.innerHTML = isRu ? "⏳ Ищу в базе 1-11 классов ДТС..." : "⏳ 1-11 sinf DTS darsliklar bazasidan qidiryapman...";
        thread.appendChild(loadDiv);
        thread.scrollTop = thread.scrollHeight;
    }

    const lower = text.toLowerCase();
    const isGreeting = lower.includes('salom') || lower.includes('assalom') || lower.includes('privet') || lower.includes('hello') || lower.includes('qalaysan') || lower.includes('qalesan') || lower.includes('yaxshimisiz');

    setTimeout(() => {
        const loadEl = document.getElementById(loadingId);
        if (loadEl) loadEl.remove();

        let answer = "";
        const ragMatch = searchDtsKnowledge(text, null);

        if (isGreeting) {
            answer = isRu
                ? "🐺 Привет, дорогой друг! 🌟 Как твои дела? Какой школьный предмет (математика, языки, физика) разберём сегодня? Задай любой вопрос из учебника!"
                : "🐺 Assalomu alaykum, aziz do'stim! 🌟 Kayfiyating qanday? Bugun qaysi fan (matematika, ingliz tili, fizika, kimyo) bo'yicha birga shug'ullanamiz? Darslikdagi istalgan qiyin mavzuingni so'ra, birga yechamiz!";
        } else if (ragMatch) {
            answer = `📚 <b>${ragMatch.grade}-sinf ${ragMatch.subject} (DTS Standarti, ${ragMatch.page}-bet)</b><br>`
                   + `📖 <b>Mavzu:</b> ${ragMatch.chapter}<br><br>`
                   + `💡 <b>Rasmiy qoida:</b><br>${ragMatch.rule}<br><br>`
                   + (ragMatch.formula ? `📐 <b>Formula:</b> <code>${ragMatch.formula}</code><br><br>` : '')
                   + `🎯 <i>Senda bu mavzu a'lo darajada o'xshaydi! Keyingi savolingni bemalol yoz! 🐺✨</i>`;
        } else if (lower.includes('matem') || lower.includes('+') || lower.includes('-') || lower.includes('*') || lower.includes('/') || lower.includes('kasr')) {
            answer = isRu
                ? `📐 Отличный математический вопрос! По задаче «${text}»: давай решим шаг за шагом. Сначала определим формулу, а затем вычислим результат. Ты отлично справляешься! 🚀`
                : `📐 Ajoyib matematik savol! «${text}» masalasini kel, birga bosqichma-bosqich yechamiz: avval qoidani eslaymiz, so'ng amallarni ketma-ket bajaramiz. Senda hammasi oson o'xshaydi! 🚀`;
        } else {
            answer = isRu
                ? `💡 Отличный вопрос по теме «${text}»! Главное понять суть и применить на практике. Если нужно подробнее разобрать примеры, просто напиши! 🐺✨`
                : `💡 «${text}» bo'yicha ajoyib savol! Asosiysi qoidani to'g'ri tushunib, amalda qo'llashdir. Agar qaysi qismi tushunarsiz bo'lsa, bemalol so'ra! 🐺✨`;
        }
        appendChildAiMessage(answer);
    }, 500);
}
"""

# Replace old child AI logic
old_child_ai_pattern = r'// 🧠 FARZAND AI CHAT[\s\S]*?function handleChildAiSend\(\)[\s\S]*?if \(bubble\) bubble\.innerHTML = answer;\s*\}, 500\);\s*\}'
js = re.sub(old_child_ai_pattern, new_child_ai_handlers.strip(), js)

# Make sure generateAIResponse properly appends AI message and supports RAG for parents
new_parent_generate_ai = """function generateAIResponse(query, imageBase64) {
    const child = childrenDatabase[currentChildKey];
    const qLower = (query || "").toLowerCase();
    const isRu = (currentLang === 'ru');
    let responseText = "";

    const ragMatch = searchDtsKnowledge(query, null);

    if (imageBase64) {
        if (isRu) {
            responseText = `
                <b>📷 Вывод по анализу задания:</b><br>
                Загруженное фото школьного задания проанализировано. Рекомендация для <b>${child?.name_ru || child?.name || 'ребёнка'} (${child?.grade || 5}-класс)</b>:<br>
                • <b>Правило:</b> Закрепите теоретическое понятие на практических примерах в течение 10 минут.<br>
                • <b>Закрепление:</b> Решите 2-3 упражнения самостоятельно и проверьте балл в e-Maktab! 🌟
            `;
        } else {
            responseText = `
                <b>📷 Vazifa / Rasm Tahlili Xulosasi:</b><br>
                Yuklangan darslik topshirig'i tahlil qilindi. <b>${child?.name || 'Farzandingiz'} (${child?.grade || 5}-sinf)</b> uchun ushbu darslik mavzusini o'zlashtirish bo'yicha yo'riqnoma:<br>
                • <b>Asosiy qoida:</b> Mavzuning nazariy tushunchasini 10 daqiqa amaliy misollar orqali ko'rib chiqing.<br>
                • <b>Mustahkamlash:</b> Darslikdagi 2-3 ta topshiriqni mustaqil yechishga yo'naltiring va 100 ballik e-Maktab ko'rsatkichini qayd eting! 🌟
            `;
        }
    } else if (ragMatch) {
        responseText = `
            <b>📚 Darslik Tahlili (${ragMatch.grade}-sinf ${ragMatch.subject}, ${ragMatch.page}-bet):</b><br>
            • <b>Mavzu:</b> ${ragMatch.chapter}<br>
            • <b>DTS Standarti:</b> ${ragMatch.rule}<br>
            ${ragMatch.formula ? `• <b>Asosiy formula:</b> <code>${ragMatch.formula}</code><br>` : ''}
            💡 <i>Farzandingizga ushbu mavzu bo'yicha e-Maktabda 100 ball to'plashida yordam bering!</i>
        `;
    } else if (qLower.includes("reels") || qLower.includes("short") || qLower.includes("video") || qLower.includes("insta") || qLower.includes("youtube") || qLower.includes("видео")) {
        if (isRu) {
            responseText = `
                <b>🎬 Анализ просмотренных Reels и видео:</b><br>
                Точные данные по видеоконтенту для <b>${child?.name_ru || child?.name || 'ребёнка'} (${child?.grade || 5}-класс)</b>:<br><br>
                📊 <b>Распределение по темам:</b><br>
                • <b>💻 Образование и IT (Python, Робототехника, Языки):</b> 45% (Полезно)<br>
                • <b>🔬 Научные опыты и Логические задачи:</b> 25% (Положительно)<br>
                • <b>🎮 Развлечения и Игры:</b> 30% (В норме)<br><br>
                💡 <b>Рекомендация:</b> Чтобы алгоритм чаще рекомендовал обучающие видео, подпишитесь на полезные каналы по школьным предметам.
            `;
        } else {
            responseText = `
                <b>🎬 Ko'rilayotgan Reels va Video Kontent Tahlili:</b><br>
                Farzandingiz <b>${child?.name || 'Farzandingiz'} (${child?.grade || 5}-sinf)</b> tomosha qilayotgan Reels / Shorts videolari bo'yicha aniq ma'lumotlar:<br><br>
                📊 <b>Mavzular taqsimoti:</b><br>
                • <b>💻 Ta'limiy & IT (Python, Robototexnika, Ingliz tili):</b> 45% (Foydali va rivojlantiruvchi)<br>
                • <b>🔬 Ilmiy tajribalar & Mantiqiy jumboqlar:</b> 25% (Ijobiy tendensiya)<br>
                • <b>🎮 Ko'ngilochar va o'yin strimlari:</b> 30% (Me'yorida)<br><br>
                💡 <b>Tavsiya:</b> Algoritm ko'proq ta'limiy videolarni tavsiya qilishi uchun fanlar bo'yicha foydali kanallarga obuna bo'lishni yo'lga qo'ying.
            `;
        }
    } else if (qLower.includes("qiziqish") || qLower.includes("fan") || qLower.includes("dars") || qLower.includes("учеб") || qLower.includes("интерес")) {
        if (isRu) {
            responseText = `
                <b>📚 Усвоение предметов и повышение интереса:</b><br>
                Методы закрепления школьных предметов госстандарта (DTS) для <b>${child?.name_ru || child?.name || 'ребёнка'} (${child?.grade || 5}-класс)</b>:<br>
                • <b>Практический подход:</b> Изучение математики и естественных наук через графические примеры и опыты гораздо эффективнее.<br>
                • <b>Аналитика:</b> Совместно просматривайте показатели 100 баллов в разделе e-Maktab.
            `;
        } else {
            responseText = `
                <b>📚 Darslarni O'zlashtirish va Qiziqishni Oshirish:</b><br>
                <b>${child?.name || 'Farzandingiz'} (${child?.grade || 5}-sinf)</b> uchun Davlat ta'lim standarti fanlarini mustahkamlash usullari:<br>
                • <b>Amaliy yondashuv:</b> Matematika va tabiiy fanlarni grafik misollar va tajribalar orqali o'rganish samaraliroq.<br>
                • <b>Haftalik tahlil:</b> e-Maktab bo'limidagi 100 ballik ko'rsatkichlarni birgalikda ko'rib, yuqori natijalarni qayd etib boring.
            `;
        }
    } else {
        if (isRu) {
            responseText = `
                <b>💡 Информация:</b> Расписание уроков, оценки 100 баллов, онлайн-локация и заряд батареи <b>${child?.name_ru || child?.name || 'ребёнка'}</b> под постоянным контролем. Вы можете задать любой вопрос по предметам или лимитам.
            `;
        } else {
            responseText = `
                <b>💡 Ma'lumot:</b> Farzandingiz <b>${child?.name || 'Farzandingiz'} (${child?.grade || 5}-sinf)</b> ning dars jadvali, 100 ballik baholari, jonli joylashuvi va batareya ko'rsatkichlari doimiy nazorat ostida. Har qanday fan, video tahlili yoki limitlar bo'yicha savolingizni yozishingiz mumkin.
            `;
        }
    }

    appendAIMessage(responseText);
}"""

old_parent_generate_pattern = r'function generateAIResponse\(query, imageBase64\)[\s\S]*?appendAIMessage\(responseText\);\s*\}'
js = re.sub(old_parent_generate_pattern, new_parent_generate_ai.strip(), js)

with open("telegram_miniapp/app.js", "w", encoding="utf-8") as f:
    f.write(js)

with open("app.js", "w", encoding="utf-8") as f:
    f.write(js)

print("Updated Parent and Child AI Chats successfully!")
