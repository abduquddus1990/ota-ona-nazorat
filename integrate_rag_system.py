import json, re

# Load DTS Knowledge Base
with open("knowledge_base_dts.json", "r", encoding="utf-8") as f:
    dts_kb = json.load(f)

dts_json_string = json.dumps(dts_kb["modules"], ensure_ascii=False)

rag_code_snippet = f"""
// ============================================================================
// 🧠 QALQON AI — 1-11 SINF DTS RAG BILIMLAR BAZASI & ENGINE
// ============================================================================
const DTS_KNOWLEDGE_BASE = {dts_json_string};

function searchDtsKnowledge(query, gradeFilter = null) {{
    if (!query) return null;
    const lowerQ = query.toLowerCase().trim();
    const words = lowerQ.split(/\\s+/);

    let bestMatch = null;
    let maxScore = 0;

    DTS_KNOWLEDGE_BASE.forEach(module => {{
        let score = 0;
        if (gradeFilter && module.grade === Number(gradeFilter)) {{
            score += 3;
        }}

        // Match keywords
        module.keywords.forEach(kw => {{
            if (lowerQ.includes(kw.toLowerCase())) score += 4;
        }});

        // Match subject or chapter
        if (lowerQ.includes(module.subject.toLowerCase())) score += 3;
        if (lowerQ.includes(module.chapter.toLowerCase())) score += 5;

        // Word overlap in rule
        words.forEach(w => {{
            if (w.length > 3 && module.rule.toLowerCase().includes(w)) score += 1;
        }});

        if (score > maxScore) {{
            maxScore = score;
            bestMatch = module;
        }}
    }});

    return (maxScore >= 3) ? bestMatch : null;
}}

// 📚 RAG e-Maktab Darsliklari Katalogi (1-11 Sinf DTS)
let activeDtsGradeFilter = 5;

function setDtsGradeFilter(grade) {{
    activeDtsGradeFilter = grade;
    renderSchoolCurriculum();
}}

function renderSchoolCurriculum() {{
    const containerParent = document.getElementById('schoolCurriculumList');
    const containerChild = document.getElementById('childSchoolList');

    const filtered = DTS_KNOWLEDGE_BASE.filter(m => activeDtsGradeFilter === 'all' || m.grade === Number(activeDtsGradeFilter));

    let html = '';
    
    // Grade Filter Pills (1-11)
    let filterPillsHtml = `
        <div class="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
            <button onclick="setDtsGradeFilter('all')" class="px-3 py-1 rounded-xl text-[10px] font-bold transition flex-shrink-0 ${{activeDtsGradeFilter === 'all' ? 'bg-cyan-500 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'}}">Barcha Sinflar</button>
    `;
    for (let g = 1; g <= 11; g++) {{
        const isActive = (activeDtsGradeFilter === g);
        filterPillsHtml += `
            <button onclick="setDtsGradeFilter(${{g}})" class="px-2.5 py-1 rounded-xl text-[10px] font-bold transition flex-shrink-0 ${{isActive ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25' : 'bg-slate-800/80 text-slate-400 hover:text-white'}}">${{g}}-Sinf</button>
        `;
    }}
    filterPillsHtml += '</div>';

    filtered.forEach(item => {{
        html += `
            <div class="glass-card p-3.5 space-y-2 border border-slate-700/60 hover:border-cyan-500/50 transition">
                <div class="flex items-center justify-between">
                    <span class="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-extrabold">
                        ${{item.grade}}-Sinf • ${{item.subject}}
                    </span>
                    <span class="text-[9px] text-slate-400 font-mono">Darslik ${{item.page}}-bet</span>
                </div>
                <div>
                    <h4 class="text-xs font-black text-white">${{item.chapter}}</h4>
                    <p class="text-[11px] text-slate-300 leading-relaxed mt-1">${{item.rule}}</p>
                </div>
                ${{item.formula ? `
                    <div class="p-2 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[10px] text-cyan-300">
                        📐 <b>Formula:</b> ${{item.formula}}
                    </div>
                ` : ''}}
                <div class="pt-1 flex items-center justify-between text-[10px]">
                    <span class="text-emerald-400 font-bold flex items-center gap-1">
                        <span>✅</span> 100 Ballik DTS Standarti
                    </span>
                    <button onclick="askDtsTopic('${{item.chapter}}')" class="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg font-bold transition">
                        AI bilan yechish 🤖
                    </button>
                </div>
            </div>
        `;
    }});

    const fullParentHtml = filterPillsHtml + (html || '<div class="text-center py-6 text-xs text-slate-400">Darslik topilmadi</div>');
    if (containerParent) containerParent.innerHTML = fullParentHtml;
    if (containerChild) containerChild.innerHTML = fullParentHtml;
}}

function askDtsTopic(topic) {{
    const inputChild = document.getElementById('childAiInput');
    if (inputChild) {{
        inputChild.value = topic + " mavzusini misollar bilan tushuntir";
        switchChildTab('child-tab-ai');
        handleChildAiSend();
    }}
}}
"""

with open("telegram_miniapp/app.js", "r", encoding="utf-8") as f:
    app_js = f.read()

# Replace or insert DTS_KNOWLEDGE_BASE and RAG engine into app.js
if "const DTS_KNOWLEDGE_BASE" in app_js:
    # Pattern replace
    app_js = re.sub(r'const DTS_KNOWLEDGE_BASE[\s\S]*?function renderSchoolCurriculum\(\)[\s\S]*?\}\n\}', rag_code_snippet.strip(), app_js)
else:
    app_js = rag_code_snippet.strip() + "\n\n" + app_js

# Update handleChildAiSend with RAG intelligence
rag_child_ai = """function handleChildAiSend() {
    const input = document.getElementById('childAiInput');
    const bubble = document.getElementById('childAiBubble');
    const text = input ? input.value.trim() : "";
    const isRu = (currentLang === 'ru');

    if (!text) return;
    if (input) input.value = "";

    if (bubble) {
        bubble.innerText = isRu ? "⏳ Ищу в базе учебников 1-11 классов ДТС..." : "⏳ 1-11 sinf DTS darsliklar bazasidan qidiryapman...";
    }

    const lower = text.toLowerCase();
    const isGreeting = lower.includes('salom') || lower.includes('assalom') || lower.includes('privet') || lower.includes('hello') || lower.includes('qalaysan') || lower.includes('qalesan') || lower.includes('yaxshimisiz');

    setTimeout(() => {
        let answer = "";
        const ragMatch = searchDtsKnowledge(text, 5);

        if (isGreeting) {
            answer = isRu
                ? "🐺 Привет, дорогой друг! 🌟 Как твои дела? Какой школьный предмет (математика, языки, физика) разберём сегодня? Задай любой вопрос из учебника!"
                : "🐺 Assalomu alaykum, aziz do'stim! 🌟 Kayfiyating qanday? Bugun qaysi fan (matematika, ingliz tili, fizika, kimyo) bo'yicha birga shug'ullanamiz? Darslikdagi istalgan qiyin mavzuingni so'ra, birga yechamiz!";
        } else if (ragMatch) {
            answer = `📚 <b>${ragMatch.grade}-sinf ${ragMatch.subject} (DTS Standarti, ${ragMatch.page}-bet)</b><br>`
                   + `📖 <b>Mavzu:</b> ${ragMatch.chapter}<br><br>`
                   + `💡 <b>Rasmiy qoida:</b><br>${ragMatch.rule}<br><br>`
                   + (ragMatch.formula ? `📐 <b>Formula:</b> <code>${ragMatch.formula}</code><br><br>` : '')
                   + `🎯 <i>Senda bu mavzu a'lo darajada o'xshaydi! Yana savollaring bo'lsa, bemalol yoz! 🐺✨</i>`;
        } else if (lower.includes('matem') || lower.includes('+') || lower.includes('-') || lower.includes('*') || lower.includes('/') || lower.includes('kasr')) {
            answer = isRu
                ? `📐 Отличный математический вопрос! По задаче «${text}»: давай решим шаг за шагом. Сначала определим формулу, а затем вычислим результат. Ты отлично справляешься! 🚀`
                : `📐 Ajoyib matematik savol! «${text}» masalasini kel, birga bosqichma-bosqich yechamiz: avval qoidani eslaymiz, so'ng amallarni ketma-ket bajaramiz. Senda hammasi oson o'xshaydi! 🚀`;
        } else {
            answer = isRu
                ? `💡 Отличный вопрос по теме «${text}»! Главное понять суть и применить на практике. Если нужно подробнее разобрать примеры, просто напиши! 🐺✨`
                : `💡 «${text}» bo'yicha ajoyib savol! Asosiysi qoidani to'g'ri tushunib, amalda qo'llashdir. Agar qaysi qismi tushunarsiz bo'lsa, bemalol so'ra! 🐺✨`;
        }
        if (bubble) bubble.innerHTML = answer;
    }, 500);
}"""

app_js = re.sub(r'function handleChildAiSend\(\)[\s\S]*?if \(bubble\) bubble\.innerText = answer;\s*\}, 600\);\s*\}', rag_child_ai.strip(), app_js)

with open("telegram_miniapp/app.js", "w", encoding="utf-8") as f:
    f.write(app_js)

with open("app.js", "w", encoding="utf-8") as f:
    f.write(app_js)

print("Integrated RAG Engine into app.js and telegram_miniapp/app.js successfully!")
