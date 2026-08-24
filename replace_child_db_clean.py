with open("telegram_miniapp/app.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Find start of childrenDatabase
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if "// 3. KO'P FARZANDLIK TIZIMI MA'LUMOTLARI" in line or "let childrenDatabase = {" in line:
        if start_idx == -1:
            start_idx = i
    if 'let currentChildKey = "child_1";' in line:
        end_idx = i + 1
        break

print("Found childrenDatabase range:", start_idx, end_idx)

new_code = """// 3. DINAMIK KO'P FARZANDLIK VA PROFIL BOSHQARUVI (LOCALSTORAGE & UNIQUE ID)
const DEFAULT_INITIAL_CHILDREN = {
    "CH-101": {
        id: "CH-101",
        name: "Aliyor Valijonov",
        name_ru: "Алиёр Валиджонов",
        username: "@aliyor_v",
        phone: "+998 90 123 45 67",
        emaktabLogin: "aliyor_kundalik",
        emaktabPassword: "••••••••",
        grade: 5,
        battery: 86,
        screenTime: "2s 45d",
        screenTime_ru: "2ч 45м",
        remaining: "1s 30d",
        remaining_ru: "1ч 30м",
        location: {
            lat: 41.3145,
            lng: 69.2812,
            address: "Yunusobod 4-mavze, 24-maktab",
            address_ru: "Юнусабад 4-й квартал, 24-я школа",
            geofences: [
                { name: "🏠 Uy / Дом", status: "Xavfsiz / Безопасно", color: "text-emerald-400" },
                { name: "🏫 24-Maktab / 24-Школа", status: "Ichida (Faol) / Внутри", color: "text-sky-400" }
            ]
        },
        apps: [
            { name: "YouTube", time: "1s 15d", percent: 35, category: "Ta'lim / Video", color: "bg-red-500", icon: "▶️" },
            { name: "Instagram (Reels)", time: "45d", percent: 25, category: "Ijtimoiy Tarmoq", color: "bg-pink-500", icon: "📸" },
            { name: "Telegram", time: "35d", percent: 20, category: "Muloqot", color: "bg-sky-500", icon: "💬" },
            { name: "Duolingo", time: "25d", percent: 12, category: "Til O'rganish", color: "bg-emerald-500", icon: "🦉" },
            { name: "O'yinlar", time: "15d", percent: 8, category: "O'yin", color: "bg-amber-500", icon: "🎮" }
        ],
        interests: {
            uz: [
                { topic: "Dasturlash va IT", percent: 85, color: "bg-emerald-500" },
                { topic: "Robototexnika va Fizika", percent: 72, color: "bg-sky-500" },
                { topic: "Ingliz tili muloqoti", percent: 65, color: "bg-purple-500" }
            ],
            ru: [
                { topic: "Программирование и IT", percent: 85, color: "bg-emerald-500" },
                { topic: "Робототехника и Физика", percent: 72, color: "bg-sky-500" },
                { topic: "Английский разговорный", percent: 65, color: "bg-purple-500" }
            ]
        }
    }
};

function loadChildrenDatabase() {
    try {
        const saved = localStorage.getItem('qalqon_children_database');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && Object.keys(parsed).length > 0) return parsed;
        }
    } catch(e) {}
    return DEFAULT_INITIAL_CHILDREN;
}

function saveChildrenDatabase() {
    try {
        localStorage.setItem('qalqon_children_database', JSON.stringify(childrenDatabase));
    } catch(e) {}
}

let childrenDatabase = loadChildrenDatabase();
let currentChildKey = Object.keys(childrenDatabase)[0] || "CH-101";

function renderChildSelectDropdown() {
    const select = document.getElementById('childSelect');
    if (!select) return;
    select.innerHTML = Object.keys(childrenDatabase).map(k => {
        const c = childrenDatabase[k];
        const isSelected = (k === currentChildKey) ? 'selected' : '';
        return `<option value="${k}" ${isSelected}>👦 ${c.name} (${c.grade}-sinf [ID: ${k}])</option>`;
    }).join('');
}

function switchChild(childKey) {
    if (childrenDatabase[childKey]) {
        currentChildKey = childKey;
        renderActiveChild();
        renderSchoolCurriculum();
        updateMapCoordinates();
    }
}

function handleAddNewChildSubmit() {
    const nameInput = document.getElementById('newChildNameInput');
    const gradeSelect = document.getElementById('newChildGradeInput');
    const name = nameInput ? nameInput.value.trim() : "";
    const grade = gradeSelect ? parseInt(gradeSelect.value) : 5;

    if (!name) {
        alert("Iltimos, farzandingizning ism-familiyasini kiriting!");
        return;
    }

    const newId = "CH-" + Math.floor(1000 + Math.random() * 9000);
    childrenDatabase[newId] = {
        id: newId,
        name: name,
        name_ru: name,
        username: "@" + name.toLowerCase().replace(/\\s+/g, '_'),
        phone: "+998 90 --- -- --",
        grade: grade,
        battery: 92,
        screenTime: "1s 30d",
        screenTime_ru: "1ч 30м",
        remaining: "2s 30d",
        remaining_ru: "2ч 30м",
        location: {
            lat: 41.311081,
            lng: 69.240562,
            address: "Toshkent shahri (Yangi profil)",
            address_ru: "г. Ташкент (Новый профиль)",
            geofences: [
                { name: "🏠 Uy / Дом", status: "Xavfsiz / Безопасно", color: "text-emerald-400" },
                { name: "🏫 Maktab / Школа", status: "Xavfsiz / Безопасно", color: "text-sky-400" }
            ]
        },
        apps: [
            { name: "YouTube", time: "45d", percent: 40, category: "Ta'lim / Video", color: "bg-red-500", icon: "▶️" },
            { name: "Telegram", time: "30d", percent: 30, category: "Muloqot", color: "bg-sky-500", icon: "💬" },
            { name: "Duolingo", time: "20d", percent: 20, category: "Ta'lim", color: "bg-emerald-500", icon: "🦉" },
            { name: "O'yinlar", time: "10d", percent: 10, category: "O'yin", color: "bg-amber-500", icon: "🎮" }
        ],
        interests: {
            uz: [
                { topic: "Dasturlash va IT", percent: 80, color: "bg-emerald-500" },
                { topic: "Matematika va Mantiq", percent: 75, color: "bg-sky-500" }
            ],
            ru: [
                { topic: "Программирование и IT", percent: 80, color: "bg-emerald-500" },
                { topic: "Математика и Логика", percent: 75, color: "bg-sky-500" }
            ]
        }
    };

    saveChildrenDatabase();
    currentChildKey = newId;
    renderChildSelectDropdown();
    renderActiveChild();
    renderSchoolCurriculum();
    closeSubpage();

    if (nameInput) nameInput.value = "";
    alert(`🎉 Yangi farzand profili muvaffaqiyatli yaratildi! (ID: ${newId})`);
}

function handleDeleteActiveChild() {
    const child = childrenDatabase[currentChildKey];
    if (!child) return;

    const count = Object.keys(childrenDatabase).length;
    if (count <= 1) {
        alert("⚠️ Sizda kamida 1 ta farzand profili bo'lishi kerak. O'chirishdan oldin yangisini qo'shing!");
        return;
    }

    const confirmDelete = confirm(`Haqiqatan ham «${child.name} (ID: ${currentChildKey})» profilini ro'yxatdan butunlay olib tashlamoqchimisiz?`);
    if (confirmDelete) {
        delete childrenDatabase[currentChildKey];
        saveChildrenDatabase();
        currentChildKey = Object.keys(childrenDatabase)[0];
        renderChildSelectDropdown();
        renderActiveChild();
        renderSchoolCurriculum();
        alert("✅ Farzand profili ro'yxatdan muvaffaqiyatli olib tashlandi!");
    }
}

function saveParentOnboarding() {
    const fam = document.getElementById('onboardFamilyName');
    const par = document.getElementById('onboardParentName');
    const pho = document.getElementById('onboardParentPhone');
    const chName = document.getElementById('onboardChildName');
    const chGrade = document.getElementById('onboardChildGrade');

    const familyName = fam ? fam.value.trim() : "";
    const parentName = par ? par.value.trim() : "";
    const phone = pho ? pho.value.trim() : "";
    const childName = chName ? chName.value.trim() : "";
    const grade = chGrade ? parseInt(chGrade.value) : 5;

    if (!parentName || !childName) {
        alert("Iltimos, o'z ismingiz va birinchi farzandingiz ismini kiriting!");
        return;
    }

    localStorage.setItem('parent_onboarded', 'true');
    localStorage.setItem('parent_name', parentName);
    localStorage.setItem('family_name', familyName);
    localStorage.setItem('parent_phone', phone);

    if (childrenDatabase[currentChildKey]) {
        childrenDatabase[currentChildKey].name = childName;
        childrenDatabase[currentChildKey].name_ru = childName;
        childrenDatabase[currentChildKey].grade = grade;
    }
    saveChildrenDatabase();

    renderChildSelectDropdown();
    renderActiveChild();
    renderSchoolCurriculum();
    closeSubpage();
    alert("🎉 Oila va farzand ma'lumotlari muvaffaqiyatli saqlandi!");
}

function checkParentOnboarding() {
    const isParent = (currentAppRole === 'parent');
    const onboarded = localStorage.getItem('parent_onboarded') === 'true';
    if (isParent && !onboarded) {
        setTimeout(() => {
            openSubpage('modal-parent-onboarding');
        }, 300);
    }
}
"""

if start_idx != -1 and end_idx != -1:
    new_lines = lines[:start_idx] + [new_code + "\n"] + lines[end_idx:]
    with open("telegram_miniapp/app.js", "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    with open("app.js", "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print("Replaced childrenDatabase successfully in telegram_miniapp/app.js and app.js!")
else:
    print("Could not find start/end range!")
