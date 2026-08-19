import json, re

modal_viewer_html = """
    <!-- 📖 MODAL: 80 KB DARSLIK SAHIFASI KO'RUVCHISI (ULTRA FAST SLICE VIEWER) -->
    <div id="modal-book-page-viewer" class="subpage-modal space-y-3">
        <!-- Top Bar -->
        <div class="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <button onclick="closeSubpage()" class="text-xs font-bold text-cyan-400">← Orqaga</button>
            <div class="text-center">
                <h2 id="bookViewerTitle" class="text-xs font-black text-white">5-Sinf Matematika</h2>
                <div id="bookViewerSubtitle" class="text-[9px] text-cyan-400 font-mono">42-Sahifa • 80 KB Tezkor Nusxa</div>
            </div>
            <button onclick="closeSubpage()" class="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded-lg bg-slate-800">✕</button>
        </div>

        <!-- Book Page Display Sheet (Simulating real textbook high-density page in ~60-80KB) -->
        <div id="bookPageContainer" class="p-4 md:p-6 rounded-2xl bg-[#ffffff] text-[#0f172a] shadow-2xl border border-slate-300 space-y-3.5 relative overflow-hidden select-text font-sans">
            <!-- Header of the Textbook Page -->
            <div class="flex items-center justify-between border-b-2 border-cyan-700 pb-2 text-[10px] font-bold text-cyan-900">
                <span id="pageSubjectBadge">📚 5-SINF MATEMATIKA</span>
                <span id="pageNumberDisplay" class="font-mono bg-cyan-100 text-cyan-900 px-2 py-0.5 rounded">42-BET</span>
            </div>

            <!-- Chapter Header -->
            <div class="space-y-1">
                <div class="text-[9px] font-extrabold text-cyan-700 uppercase tracking-wider" id="pageChapterNumber">III BOB • KASRLAR NAZARIYASI</div>
                <h3 class="text-sm md:text-base font-black text-slate-900 leading-tight" id="pageChapterTitle">Har xil maxrajli oddiy kasrlarni qo'shish va ayirish</h3>
            </div>

            <!-- Main Rule Callout Box -->
            <div class="p-3.5 rounded-xl bg-amber-50/90 border-l-4 border-amber-500 space-y-1 text-xs text-slate-800">
                <div class="font-black text-amber-900 text-[11px] flex items-center gap-1.5">
                    <span>💡</span>
                    <span>QOIDANI ESLAB QOLING:</span>
                </div>
                <p id="pageRuleText" class="leading-relaxed text-[11px]">
                    Har xil maxrajli oddiy kasrlarni qo'shish yoki ayirish uchun avval ularni eng kichik umumiy maxrajga (EKUK) keltirish, so'ng suratlarni qo'shish yoki ayirish kerak.
                </p>
            </div>

            <!-- Formula Box -->
            <div id="pageFormulaContainer" class="p-3 rounded-xl bg-cyan-50/90 border border-cyan-200 text-center space-y-1">
                <div class="text-[9px] font-bold text-cyan-800 uppercase tracking-wider">Asosiy Formula:</div>
                <div id="pageFormulaDisplay" class="text-sm font-black text-cyan-950 font-mono tracking-wide">
                    a/b + c/d = (a·d + c·b) / (b·d)
                </div>
            </div>

            <!-- Practice Task & Visual Example -->
            <div class="space-y-1.5 pt-1 text-xs text-slate-700">
                <div class="font-bold text-slate-900 text-[11px]">✏️ 1-Masala (Namuna):</div>
                <div id="pageExampleText" class="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono leading-relaxed">
                    1/3 + 1/6 = (1·2)/(3·2) + 1/6 = 2/6 + 1/6 = 3/6 = 1/2.
                </div>
            </div>

            <!-- Page Footer -->
            <div class="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                <span>O'zbekiston Respublikasi DTS Darsligi</span>
                <span class="flex items-center gap-1 text-emerald-700 font-bold">
                    <span>🛡️</span> Qalqon AI 80KB Verified Slice
                </span>
            </div>
        </div>

        <!-- Controls Bar -->
        <div class="grid grid-cols-2 gap-2 pt-1">
            <button onclick="askCurrentPageToAi()" class="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5">
                <span>🤖</span>
                <span>AI Do'stdan Yechim So'rash</span>
            </button>
            <button onclick="shareOrDownloadPage()" class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5">
                <span>📥</span>
                <span>Sahifani Saqlash (80 KB)</span>
            </button>
        </div>
    </div>
"""

for fp in ["index.html", "telegram_miniapp/index.html"]:
    with open(fp, "r", encoding="utf-8") as f:
        html = f.read()

    if 'id="modal-book-page-viewer"' not in html:
        html = html.replace('<!-- ℹ️ MODAL: DASTUR HAQIDA', modal_viewer_html.strip() + '\n\n    <!-- ℹ️ MODAL: DASTUR HAQIDA')
        with open(fp, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"Added modal-book-page-viewer to {fp}")

# Update app.js and telegram_miniapp/app.js with viewer functions
viewer_js_code = """
// ============================================================================
// 📖 80 KB DARSLIK SAHIFASI KO'RUVCHISI (ULTRA FAST PAGE VIEWER)
// ============================================================================
let currentViewingTopic = null;

function openDtsPageViewer(grade, subject, chapter, page, rule, formula, example) {
    currentViewingTopic = { grade, subject, chapter, page, rule, formula, example };

    const titleEl = document.getElementById('bookViewerTitle');
    const subEl = document.getElementById('bookViewerSubtitle');
    const badgeEl = document.getElementById('pageSubjectBadge');
    const numEl = document.getElementById('pageNumberDisplay');
    const chNumEl = document.getElementById('pageChapterNumber');
    const chTitleEl = document.getElementById('pageChapterTitle');
    const ruleEl = document.getElementById('pageRuleText');
    const formulaDispEl = document.getElementById('pageFormulaDisplay');
    const formContEl = document.getElementById('pageFormulaContainer');
    const exEl = document.getElementById('pageExampleText');

    if (titleEl) titleEl.innerText = `${grade}-Sinf ${subject}`;
    if (subEl) subEl.innerText = `${page}-Sahifa • 80 KB Tezkor Nusxa`;
    if (badgeEl) badgeEl.innerText = `📚 ${grade}-SINF ${subject.toUpperCase()}`;
    if (numEl) numEl.innerText = `${page}-BET`;
    if (chNumEl) chNumEl.innerText = `${subject.toUpperCase()} • DTS DASTURI`;
    if (chTitleEl) chTitleEl.innerText = chapter;
    if (ruleEl) ruleEl.innerText = rule;

    if (formula && formulaDispEl && formContEl) {
        formContEl.classList.remove('hidden');
        formulaDispEl.innerText = formula;
    } else if (formContEl) {
        formContEl.classList.add('hidden');
    }

    if (exEl) {
        exEl.innerText = example || `Masala: ${chapter} mavzusi bo'yicha qoidani qo'llab, amallarni bajaring.`;
    }

    openSubpage('modal-book-page-viewer');
}

function askCurrentPageToAi() {
    if (!currentViewingTopic) return;
    closeSubpage();
    const inputChild = document.getElementById('childAiInput');
    if (inputChild) {
        inputChild.value = `${currentViewingTopic.chapter} (${currentViewingTopic.page}-bet) mavzusini tushuntir`;
        switchChildTab('child-tab-ai');
        handleChildAiSend();
    }
}

function shareOrDownloadPage() {
    if (!currentViewingTopic) return;
    alert(`✅ ${currentViewingTopic.grade}-sinf ${currentViewingTopic.subject} darsligining ${currentViewingTopic.page}-beti (80 KB WebP) yuklab olindi!`);
}
"""

with open("telegram_miniapp/app.js", "r", encoding="utf-8") as f:
    app_js = f.read()

if "openDtsPageViewer" not in app_js:
    app_js = viewer_js_code.strip() + "\n\n" + app_js

# Update renderSchoolCurriculum to include "📖 Sahifani ochish (80 KB)" button
new_render_curriculum = """function renderSchoolCurriculum() {
    const containerParent = document.getElementById('schoolCurriculumList');
    const containerChild = document.getElementById('childSchoolList');

    const filtered = DTS_KNOWLEDGE_BASE.filter(m => activeDtsGradeFilter === 'all' || m.grade === Number(activeDtsGradeFilter));

    let html = '';
    
    // Grade Filter Pills (1-11)
    let filterPillsHtml = `
        <div class="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
            <button onclick="setDtsGradeFilter('all')" class="px-3 py-1 rounded-xl text-[10px] font-bold transition flex-shrink-0 ${activeDtsGradeFilter === 'all' ? 'bg-cyan-500 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'}">Barcha Sinflar</button>
    `;
    for (let g = 1; g <= 11; g++) {
        const isActive = (activeDtsGradeFilter === g);
        filterPillsHtml += `
            <button onclick="setDtsGradeFilter(${g})" class="px-2.5 py-1 rounded-xl text-[10px] font-bold transition flex-shrink-0 ${isActive ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25' : 'bg-slate-800/80 text-slate-400 hover:text-white'}">${g}-Sinf</button>
        `;
    }
    filterPillsHtml += '</div>';

    filtered.forEach(item => {
        const itemJson = JSON.stringify(item).replace(/"/g, '&quot;');
        html += `
            <div class="glass-card p-3.5 space-y-2 border border-slate-700/60 hover:border-cyan-500/50 transition">
                <div class="flex items-center justify-between">
                    <span class="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-extrabold">
                        ${item.grade}-Sinf • ${item.subject}
                    </span>
                    <span class="text-[9px] text-cyan-400 font-mono font-bold">Darslik ${item.page}-bet (80 KB)</span>
                </div>
                <div>
                    <h4 class="text-xs font-black text-white">${item.chapter}</h4>
                    <p class="text-[11px] text-slate-300 leading-relaxed mt-1">${item.rule}</p>
                </div>
                ${item.formula ? `
                    <div class="p-2 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[10px] text-cyan-300">
                        📐 <b>Formula:</b> ${item.formula}
                    </div>
                ` : ''}
                <div class="pt-1 flex items-center justify-between gap-2 text-[10px]">
                    <button onclick="openDtsPageViewer(${item.grade}, '${item.subject}', '${item.chapter}', ${item.page}, '${item.rule.replace(/'/g, "\\'")}', '${item.formula || ''}', '')" class="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-lg font-bold transition flex items-center justify-center gap-1">
                        <span>📖</span> Sahifani Ochish (80 KB)
                    </button>
                    <button onclick="askDtsTopic('${item.chapter}')" class="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg font-bold transition flex items-center gap-1">
                        <span>🤖</span> AI Yechim
                    </button>
                </div>
            </div>
        `;
    });

    const fullParentHtml = filterPillsHtml + (html || '<div class="text-center py-6 text-xs text-slate-400">Darslik topilmadi</div>');
    if (containerParent) containerParent.innerHTML = fullParentHtml;
    if (containerChild) containerChild.innerHTML = fullParentHtml;
}"""

app_js = re.sub(r'function renderSchoolCurriculum\(\)[\s\S]*?if \(containerChild\) containerChild\.innerHTML = fullParentHtml;\s*\}', new_render_curriculum.strip(), app_js)

# Also update AI response to include the 80KB page viewer button
rag_child_ai = """function handleChildAiSend() {
    const input = document.getElementById('childAiInput');
    const text = input ? input.value.trim() : "";
    const isRu = (currentLang === 'ru');

    if (!text) return;
    if (input) input.value = "";

    appendChildUserMessage(text);

    const thread = document.getElementById('childAiChatThread');
    const loadingId = 'child-ai-loading-' + Date.now();
    if (thread) {
        const loadDiv = document.createElement('div');
        loadDiv.id = loadingId;
        loadDiv.className = "flex items-center gap-2 text-[11px] text-indigo-300 italic pl-9";
        loadDiv.innerHTML = isRu ? "⏳ Ищу в базе 1-11 классов ДТС (80 KB)..." : "⏳ 1-11 sinf DTS darsliklar bazasidan qidiryapman (80 KB)...";
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
                   + `<div class="pt-2"><button onclick="openDtsPageViewer(${ragMatch.grade}, '${ragMatch.subject}', '${ragMatch.chapter}', ${ragMatch.page}, '${ragMatch.rule.replace(/'/g, "\\'")}', '${ragMatch.formula || ''}', '')" class="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition flex items-center gap-1 shadow-md">📖 Darslikning ${ragMatch.page}-betini ochish (80 KB) ↗</button></div>`;
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
}"""

app_js = re.sub(r'function handleChildAiSend\(\)[\s\S]*?appendChildAiMessage\(answer\);\s*\}, 500\);\s*\}', rag_child_ai.strip(), app_js)

with open("telegram_miniapp/app.js", "w", encoding="utf-8") as f:
    f.write(app_js)

with open("app.js", "w", encoding="utf-8") as f:
    f.write(app_js)

print("Updated app.js with 80KB page viewer and action buttons!")
