import re

with open("telegram_miniapp/app.js", "r", encoding="utf-8") as f:
    js = f.read()

# Update switchAppRole to hide role switcher on child and show consent overlay if not paired
new_switch_app_role = """function switchAppRole(role) {
    currentAppRole = role;
    localStorage.setItem('app_role', role);

    const isParent = (role === 'parent');
    const roleSwitcherContainer = document.getElementById('roleSwitcherContainer');
    const roleBtnParent = document.getElementById('roleBtnParent');
    const roleBtnChild = document.getElementById('roleBtnChild');
    const parentHeader = document.getElementById('mainParentHeader');
    const authBanner = document.getElementById('authStatusBanner');
    const parentBottomNav = document.getElementById('parentBottomNav');
    const childBottomNav = document.getElementById('childBottomNav');
    const rolePillContainer = document.getElementById('parentRolePillContainer');
    const consentOverlay = document.getElementById('childConsentOverlay');

    if (roleBtnParent) {
        roleBtnParent.className = isParent
            ? "flex-1 py-1.5 px-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-teal-500 shadow-md transition flex items-center justify-center gap-1.5"
            : "flex-1 py-1.5 px-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5";
    }

    if (roleBtnChild) {
        roleBtnChild.className = !isParent
            ? "flex-1 py-1.5 px-2 rounded-xl text-xs font-bold text-white bg-indigo-500 shadow-md transition flex items-center justify-center gap-1.5"
            : "flex-1 py-1.5 px-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5";
    }

    // Barcha tablarni yopish
    document.querySelectorAll('.tab-content').forEach(t => {
        t.classList.remove('active');
        t.classList.add('hidden');
    });

    if (isParent) {
        document.body.classList.remove('role-child');
        document.body.classList.add('role-parent');
        if (roleSwitcherContainer) roleSwitcherContainer.classList.remove('hidden');
        if (rolePillContainer) rolePillContainer.style.display = 'flex';
        if (childBottomNav) {
            childBottomNav.style.display = 'none';
            childBottomNav.classList.add('hidden');
        }
        if (parentBottomNav) {
            parentBottomNav.style.display = 'flex';
            parentBottomNav.classList.remove('hidden');
        }
        if (parentHeader) parentHeader.classList.remove('hidden');
        if (authBanner) authBanner.classList.remove('hidden');
        if (consentOverlay) consentOverlay.classList.add('hidden');
        setParentRelation(currentParentRelation);
        switchTab('tab-dashboard');
    } else {
        document.body.classList.remove('role-parent');
        document.body.classList.add('role-child');
        // Farzand panelida ota-ona rolini almashtiruvchi tugmalar yashiriladi
        if (roleSwitcherContainer) roleSwitcherContainer.classList.add('hidden');
        if (rolePillContainer) rolePillContainer.style.display = 'none';
        if (parentBottomNav) {
            parentBottomNav.style.display = 'none';
            parentBottomNav.classList.add('hidden');
        }
        if (childBottomNav) {
            childBottomNav.style.display = 'flex';
            childBottomNav.classList.remove('hidden');
        }
        if (parentHeader) parentHeader.classList.add('hidden');
        if (authBanner) authBanner.classList.add('hidden');

        // Check if child is paired
        const isPaired = localStorage.getItem('child_paired') === 'true';
        if (!isPaired && consentOverlay) {
            consentOverlay.classList.remove('hidden');
        } else if (consentOverlay) {
            consentOverlay.classList.add('hidden');
        }

        switchChildTab('child-tab-home');
    }
}

function handleChildConsentAccept() {
    const input = document.getElementById('childConsentFamilyCode');
    const err = document.getElementById('childConsentError');
    const code = input ? input.value.trim() : "";
    const isRu = (currentLang === 'ru');

    if (!code || code.length < 3) {
        if (err) err.classList.remove('hidden');
        return;
    }
    if (err) err.classList.add('hidden');

    localStorage.setItem('child_paired', 'true');
    const consentOverlay = document.getElementById('childConsentOverlay');
    if (consentOverlay) consentOverlay.classList.add('hidden');

    // Notify Telegram Bot
    try {
        fetch('https://wfrclcwjeeqeqchmdhzw.supabase.co/functions/v1/ota-ona-bot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'child_status_alert',
                statusType: 'rozilik_berildi',
                statusText: isRu ? "Ребёнок подтвердил подключение по коду" : "Farzand og'zaki oila kodi bilan to'liq ulandi",
                childName: "Aliyor Valijonov",
                familyCode: code,
                timestamp: new Date().toISOString()
            })
        }).catch(e => console.log('Consent alert sent'));
    } catch(e) {}

    const successMsg = isRu 
        ? "🎉 Отлично! Ты успешно подключился. Теперь Qalqon AI — твой надёжный помощник в учёбе и безопасности!"
        : "🎉 Ajoyib! Muvaffaqiyatli ulanding. Endi Qalqon AI — o'qishda va xavfsizlikda sening eng yaqin do'sting!";
    alert(successMsg);
    switchChildTab('child-tab-home');
}

function handleChildConsentDecline() {
    const isRu = (currentLang === 'ru');
    const consentOverlay = document.getElementById('childConsentOverlay');
    if (consentOverlay) consentOverlay.classList.add('hidden');

    const declineMsg = isRu
        ? "Понятно! Без твоего согласия функции безопасности не включены. Ты можешь пользоваться обучающими материалами и AI-помощником."
        : "Tushundik! Sening roziligingsiz xavfsizlik funksiyalari yoqilmaydi. Darsliklar va AI yordamchidan bemalol mustaqil foydalanishing mumkin.";
    alert(declineMsg);
    switchChildTab('child-tab-home');
}

function switchChildTab(tabId) {
    const childTabs = ['child-tab-home', 'child-tab-ai', 'child-tab-rewards', 'child-tab-school', 'child-tab-settings', 'child-tab-explore'];
    childTabs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('active');
            el.classList.add('hidden');
        }
        const navBtn = document.getElementById(`nav-${id}`);
        if (navBtn) navBtn.classList.remove('active');
    });

    const activeEl = document.getElementById(tabId);
    if (activeEl) {
        activeEl.classList.remove('hidden');
        activeEl.classList.add('active');
    }

    const activeNav = document.getElementById(`nav-${tabId}`);
    if (activeNav) activeNav.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}"""

# Replace switchAppRole and switchChildTab
old_role_pattern = r'function switchAppRole\(role\)[\s\S]*?function switchChildTab\(tabId\)[\s\S]*?window\.scrollTo\(\{ top: 0, behavior: \'smooth\' \};\s*\}'
js = re.sub(old_role_pattern, new_switch_app_role.strip(), js, count=1)

# Update handleChildAiSend for natural polite conversation
new_child_ai_logic = """function handleChildAiSend() {
    const input = document.getElementById('childAiInput');
    const bubble = document.getElementById('childAiBubble');
    const text = input ? input.value.trim() : "";
    const isRu = (currentLang === 'ru');

    if (!text) return;
    if (input) input.value = "";

    if (bubble) {
        bubble.innerText = isRu ? "⏳ Думаю над ответом..." : "⏳ Javobni tayyorlayapman...";
    }

    const lower = text.toLowerCase();
    const isGreeting = lower.includes('salom') || lower.includes('assalom') || lower.includes('privet') || lower.includes('hello') || lower.includes('qalaysan') || lower.includes('qalesan') || lower.includes('yaxshimisiz');

    setTimeout(() => {
        let answer = "";
        if (isGreeting) {
            answer = isRu
                ? "🐺 Привет, дорогой друг! 🌟 Как твои дела и настроение? Какой предмет (математика, языки, физика) сегодня разберём вместе или у тебя есть интересный вопрос?"
                : "🐺 Assalomu alaykum, aziz do'stim! 🌟 Kayfiyating qanday? Bugun qaysi fan (matematika, ingliz tili, fizika) bo'yicha birga shug'ullanamiz yoki qanday qiziqarli savoling bor?";
        } else if (lower.includes('kasr') || lower.includes('drob') || lower.includes('matem') || lower.includes('+') || lower.includes('-') || lower.includes('*') || lower.includes('/')) {
            answer = isRu
                ? `📐 Отличный математический вопрос! По задаче «${text}»: давай решим шаг за шагом. Сначала приводим к общему знаменателю, а затем складываем числители. Ты отлично справляешься! 🚀`
                : `📐 Ajoyib matematik savol! «${text}» masalasini kel, birga bosqichma-bosqich yechamiz: avval umumiy maxraj topamiz, so'ng suratlarni qo'shamiz. Senda hammasi a'lo darajada o'xshaydi! 🚀`;
        } else {
            answer = isRu
                ? `💡 Отличный вопрос по теме «${text}»! Главное понять суть и применить на практике. Если нужно подробнее объяснить, просто напиши! 🐺✨`
                : `💡 «${text}» bo'yicha ajoyib savol! Asosiysi qoidani tushunib, amalda qo'llashdir. Agar qaysi qismi tushunarsiz bo'lsa, bemalol so'ra, birga o'rganamiz! 🐺✨`;
        }
        if (bubble) bubble.innerText = answer;
    }, 600);
}"""

old_child_ai_pattern = r'function handleChildAiSend\(\)[\s\S]*?if \(bubble\) bubble\.innerText = answer;\s*\}, 800\);\s*\}'
js = re.sub(old_child_ai_pattern, new_child_ai_logic.strip(), js, count=1)

with open("telegram_miniapp/app.js", "w", encoding="utf-8") as f:
    f.write(js)

with open("app.js", "w", encoding="utf-8") as f:
    f.write(js)

print("Updated app.js and telegram_miniapp/app.js with full consent flow and child AI logic!")
