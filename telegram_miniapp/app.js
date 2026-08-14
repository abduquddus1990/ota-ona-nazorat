/**
 * SHIELD PARENTAL GUARD — ADVANCED AI & E-MAKTAB DASHBOARD
 * Core Frontend Logic (Bilingual UZ/RU, 100-Point Grading, 1-11 Class DTS, AI Voice/Text/Image)
 */

// 1. O'ZBEKISTON DTS BO'YICHA 1-11 SINF DARSLIKLARI BAZASI
const CURRICULUM_DATABASE = {
    1: ["Ona tili va o'qish savodxonligi", "Matematika", "Tabiiy fanlar (Science)", "Tasviriy san'at", "Musiqa", "Texnologiya", "Jismoniy tarbiya", "Ingliz tili", "Tarbiya"],
    2: ["Ona tili va o'qish savodxonligi", "Matematika", "Tabiiy fanlar (Science)", "Tasviriy san'at", "Musiqa", "Texnologiya", "Jismoniy tarbiya", "Ingliz tili", "Tarbiya"],
    3: ["Ona tili va o'qish savodxonligi", "Matematika", "Tabiiy fanlar (Science)", "Tasviriy san'at", "Musiqa", "Texnologiya", "Jismoniy tarbiya", "Ingliz tili", "Tarbiya"],
    4: ["Ona tili va o'qish savodxonligi", "Matematika", "Tabiiy fanlar (Science)", "Tasviriy san'at", "Musiqa", "Texnologiya", "Jismoniy tarbiya", "Ingliz tili", "Tarbiya"],
    5: ["Ona tili", "Adabiyot", "Matematika", "Tarixdan hikoyalar", "Tabiiy fanlar (Science)", "Chet tili (Ingliz tili)", "Informatika va axborot texnologiyalari", "Tasviriy san'at", "Texnologiya", "Musiqa", "Jismoniy tarbiya", "Tarbiya"],
    6: ["Ona tili", "Adabiyot", "Matematika", "Qadimgi dunyo tarixi", "Biologiya (Botanika)", "Geografiya", "Chet tili (Ingliz tili)", "Informatika", "Tasviriy san'at", "Texnologiya", "Musiqa", "Jismoniy tarbiya", "Tarbiya"],
    7: ["Ona tili", "Adabiyot", "Algebra", "Geometriya", "Fizika", "Kimyo", "Biologiya (Zoologiya)", "O'zbekiston tarixi", "Jahon tarixi", "Geografiya", "Informatika", "Chet tili", "Texnologiya", "Jismoniy tarbiya", "Tarbiya"],
    8: ["Ona tili", "Adabiyot", "Algebra", "Geometriya", "Fizika", "Kimyo", "Biologiya (Odam va salomatligi)", "O'zbekiston tarixi", "Jahon tarixi", "Geografiya", "Davlat va huquq asoslari", "Informatika", "Chet tili", "Tarbiya"],
    9: ["Ona tili", "Adabiyot", "Algebra", "Geometriya", "Fizika", "Kimyo", "Biologiya (Sitologiya va genetika)", "O'zbekiston tarixi", "Jahon tarixi", "Geografiya", "Konstitutsiya asoslari", "Informatika", "Chet tili", "Tarbiya"],
    10: ["Ona tili", "Adabiyot", "Algebra", "Geometriya", "Fizika", "Kimyo", "Biologiya", "O'zbekiston tarixi", "Jahon tarixi", "Davlat va huquq asoslari", "Informatika", "Chet tili", "Astronomiya", "ChaQBT", "Jismoniy tarbiya"],
    11: ["Ona tili", "Adabiyot", "Algebra", "Geometriya", "Fizika", "Kimyo", "Biologiya", "O'zbekiston tarixi", "Jahon tarixi", "Davlat va huquq asoslari", "Informatika", "Chet tili", "Astronomiya", "ChaQBT", "Jismoniy tarbiya"]
};

// 2. KO'P FARZANDLIK TIZIMI MA'LUMOTLAR BAZASI
let childrenDatabase = {
    "child_1": {
        name: "Aliyor Valijonov",
        username: "@aliyor_v",
        grade: 5,
        battery: 84,
        screenTime: "3s 45d",
        remaining: "1s 15d",
        location: {
            lat: 41.3145,
            lng: 69.2812,
            address: "Yunusobod 4-mavze, 24-maktab",
            geofences: [
                { name: "🏠 Uy (Yunusobod)", status: "Tashqarisida", color: "text-slate-400" },
                { name: "🏫 24-Maktab", status: "Ichida (Faol)", color: "text-emerald-400" }
            ]
        },
        apps: [
            { name: "YouTube", time: "1s 20d", percent: 35, category: "Ta'lim / Video", color: "bg-red-500", icon: "▶️" },
            { name: "Instagram (Reels)", time: "55d", percent: 24, category: "Ijtimoiy Tarmoq", color: "bg-pink-500", icon: "📸" },
            { name: "Telegram", time: "45d", percent: 20, category: "Muloqot", color: "bg-sky-500", icon: "💬" },
            { name: "Duolingo", time: "30d", percent: 13, category: "Til O'rganish", color: "bg-emerald-500", icon: "🦉" },
            { name: "PUBG Mobile", time: "15d", percent: 8, category: "O'yin", color: "bg-amber-500", icon: "🎮" }
        ],
        interests: [
            { topic: "Dasturlash va IT", percent: 85, color: "bg-emerald-500" },
            { topic: "Robototexnika va Fizika", percent: 72, color: "bg-sky-500" },
            { topic: "Ingliz tili muloqoti", percent: 65, color: "bg-purple-500" }
        ]
    },
    "child_2": {
        name: "Madina Valijonova",
        username: "@madina_v",
        grade: 3,
        battery: 92,
        screenTime: "2s 10d",
        remaining: "50d",
        location: {
            lat: 41.3110,
            lng: 69.2797,
            address: "Mirzo Ulug'bek, San'at Maktabi",
            geofences: [
                { name: "🏠 Uy", status: "Tashqarisida", color: "text-slate-400" },
                { name: "🎨 San'at Maktabi", status: "Ichida (Faol)", color: "text-emerald-400" }
            ]
        },
        apps: [
            { name: "YouTube Kids", time: "1s 10d", percent: 54, category: "Multfilm / Ta'lim", color: "bg-amber-500", icon: "🧸" },
            { name: "Picsart (Rasm chizish)", time: "40d", percent: 30, category: "San'at va Ijod", color: "bg-purple-500", icon: "🎨" },
            { name: "Telegram", time: "20d", percent: 16, category: "Oila guruhi", color: "bg-sky-500", icon: "💬" }
        ],
        interests: [
            { topic: "Tasviriy San'at va Rassomlik", percent: 92, color: "bg-pink-500" },
            { topic: "Ertaklar va O'qish", percent: 80, color: "bg-emerald-500" }
        ]
    },
    "child_3": {
        name: "Temur Valijonov",
        username: "@temur_v",
        grade: 9,
        battery: 76,
        screenTime: "4s 15d",
        remaining: "45d",
        location: {
            lat: 41.3200,
            lng: 69.2850,
            address: "Shayxontohur, O'quv Markazi",
            geofences: [
                { name: "🏠 Uy", status: "Tashqarisida", color: "text-slate-400" },
                { name: "💻 IT O'quv Markazi", status: "Ichida (Faol)", color: "text-emerald-400" }
            ]
        },
        apps: [
            { name: "VS Code / GitHub", time: "2s 10d", percent: 51, category: "Dasturlash", color: "bg-sky-500", icon: "💻" },
            { name: "Telegram", time: "1s 15d", percent: 30, category: "Guruhlar", color: "bg-sky-500", icon: "💬" },
            { name: "YouTube", time: "50d", percent: 19, category: "Darsliklar", color: "bg-red-500", icon: "▶️" }
        ],
        interests: [
            { topic: "Frontend & Backend Development", percent: 94, color: "bg-emerald-500" },
            { topic: "Matematika va Algoritmlar", percent: 88, color: "bg-sky-500" }
        ]
    }
};

let currentChildKey = "child_1";
let currentLang = localStorage.getItem('app_lang') || 'uz';
let currentTheme = localStorage.getItem('app_theme') || 'default';
let activeSchoolPeriod = 'weekly'; // 'weekly', 'monthly', 'quarterly'
let isRecordingVoice = false;
let uploadedImageBase64 = null;

let mapInstance = null;
let childMarker = null;
let parentMarker = null;

// Telegram WebApp Setup
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

// ============================================================================
// 3. 100-BALLIK E-MAKTAB BAHOLARI GENERATORI & KO'RSATISH
// ============================================================================
function getSubjectScore(subjectName, gradeNum, period) {
    let hash = 0;
    const key = subjectName + gradeNum + period + currentChildKey;
    for (let i = 0; i < key.length; i++) {
        hash = (hash << 5) - hash + key.charCodeAt(i);
        hash |= 0;
    }
    const baseScore = 75 + Math.abs(hash % 24); // 75 dan 98 ball oralig'ida
    return Math.min(100, Math.max(60, baseScore));
}

function renderSchoolCurriculum() {
    const child = childrenDatabase[currentChildKey];
    const grade = child.grade || 5;
    const subjects = CURRICULUM_DATABASE[grade] || CURRICULUM_DATABASE[5];
    
    document.getElementById('curriculumClassTitle').innerText = `📚 ${grade}-Sinf Davlat Darsliklari & Baholari`;
    document.getElementById('childClassBadge').innerText = `${grade}-sinf DTS Darsliklari`;

    let totalScore = 0;
    const listContainer = document.getElementById('subjectsGradeList');

    listContainer.innerHTML = subjects.map((subject, index) => {
        const score = getSubjectScore(subject, grade, activeSchoolPeriod);
        totalScore += score;

        let badgeColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
        let statusLabel = "A'lo";
        if (score < 71) {
            badgeColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
            statusLabel = "Qoniqarli";
        } else if (score < 86) {
            badgeColor = "text-sky-400 bg-sky-500/10 border-sky-500/30";
            statusLabel = "Yaxshi";
        }

        return `
            <div class="subject-item-card flex items-center justify-between">
                <div class="space-y-1 flex-1 pr-3">
                    <div class="flex items-center gap-2">
                        <span class="text-[11px] font-bold text-white">${index + 1}. ${subject}</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill bg-gradient-to-r from-emerald-500 to-sky-400" style="width: ${score}%;"></div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-xs font-black text-white">${score} <span class="text-[9px] text-slate-400">/ 100</span></div>
                    <span class="text-[9px] font-bold px-1.5 py-0.5 rounded border ${badgeColor}">${statusLabel}</span>
                </div>
            </div>
        `;
    }).join('');

    const overallAvg = (totalScore / subjects.length).toFixed(1);
    document.getElementById('overallGradeScore').innerText = overallAvg;
    
    const periodNames = {
        'weekly': 'Haftalik baholash (Oxirgi 7 kun)',
        'monthly': 'Oylik umumiy ko\'rsatkich',
        'quarterly': 'I-Chorak yakuniy baholari'
    };
    document.getElementById('activePeriodLabel').innerText = periodNames[activeSchoolPeriod];

    let overallLabel = "A'lo (Top 5%)";
    if (overallAvg < 71) overallLabel = "O'rtacha daraja";
    else if (overallAvg < 86) overallLabel = "Yaxshi (Ijobiy)";
    document.getElementById('overallGradeLabel').innerText = overallLabel;
}

function setSchoolPeriod(period) {
    activeSchoolPeriod = period;
    document.querySelectorAll('.period-pill').forEach(p => p.classList.remove('active'));
    const btn = document.getElementById(`period-${period}`);
    if (btn) btn.classList.add('active');
    renderSchoolCurriculum();
}

// ============================================================================
// 4. FARZAND PROFILINI KIRITISH & TAHRIRLASH (CHILD MANAGER)
// ============================================================================
function openChildProfileModal() {
    const child = childrenDatabase[currentChildKey];
    document.getElementById('profileFullName').value = child.name;
    document.getElementById('profileUsername').value = child.username;
    document.getElementById('profileClassSelect').value = child.grade || 5;
    openSubpage('modal-child-profile');
}

function saveChildProfile() {
    const fullName = document.getElementById('profileFullName').value.trim() || "Farzand";
    const username = document.getElementById('profileUsername').value.trim() || "@farzand";
    const grade = parseInt(document.getElementById('profileClassSelect').value) || 5;

    childrenDatabase[currentChildKey].name = fullName;
    childrenDatabase[currentChildKey].username = username;
    childrenDatabase[currentChildKey].grade = grade;

    // Dropdown nomini yangilash
    const select = document.getElementById('childSelector');
    if (select.querySelector(`option[value="${currentChildKey}"]`)) {
        select.querySelector(`option[value="${currentChildKey}"]`).innerText = `${fullName} (${grade}-sinf)`;
    }

    renderActiveChild();
    renderSchoolCurriculum();
    closeSubpage();

    alert(`✅ Farzand ma'lumotlari saqlandi!\n${grade}-sinf Davlat darsliklari va 100 ballik baholar e-Maktab bo'limiga o'rnatildi.`);
}

function switchChild(childKey) {
    currentChildKey = childKey;
    renderActiveChild();
    renderSchoolCurriculum();
    if (mapInstance) updateMapCoordinates();
}

function renderActiveChild() {
    const child = childrenDatabase[currentChildKey];
    document.getElementById('totalScreenTime').innerText = child.screenTime;
    document.getElementById('batteryBadge').innerText = `${child.battery}%`;
    document.getElementById('remainingTime').innerText = child.remaining;
    document.getElementById('childSelector').value = currentChildKey;

    // Ilovalar Reytingi
    const appList = document.getElementById('appUsageList');
    if (appList) {
        appList.innerHTML = child.apps.map(app => `
            <div class="space-y-1">
                <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2">
                        <span class="text-sm">${app.icon}</span>
                        <span class="font-bold text-white">${app.name}</span>
                        <span class="text-[10px] text-slate-400 bg-slate-800/60 px-1.5 py-0.2 rounded">${app.category}</span>
                    </div>
                    <span class="font-mono text-slate-300">${app.time} <b class="text-emerald-400">(${app.percent}%)</b></span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill ${app.color}" style="width: ${app.percent}%;"></div>
                </div>
            </div>
        `).join('');
    }

    // Geofences
    const geofenceList = document.getElementById('geofenceZoneList');
    if (geofenceList) {
        geofenceList.innerHTML = child.location.geofences.map(g => `
            <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 text-xs">
                <span class="text-slate-300 font-medium">${g.name}</span>
                <span class="font-bold ${g.color}">${g.status}</span>
            </div>
        `).join('');
    }

    // Interests
    const interestList = document.getElementById('aiInterestVectors');
    if (interestList) {
        interestList.innerHTML = child.interests.map(i => `
            <div class="space-y-1">
                <div class="flex justify-between text-xs">
                    <span class="text-slate-300 font-medium">${i.topic}</span>
                    <span class="font-bold text-white">${i.percent}%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill ${i.color}" style="width: ${i.percent}%;"></div>
                </div>
            </div>
        `).join('');
    }

    document.getElementById('radarAddress').innerText = child.location.address;
}

// ============================================================================
// 5. AI CHAT, OVOZ VA RASM TAHLILI (GEMINI AI INTERFACE)
// ============================================================================
function appendUserMessage(text, imageSrc = null) {
    const thread = document.getElementById('aiChatThread');
    const msgDiv = document.createElement('div');
    msgDiv.className = "chat-bubble-user";
    
    let content = "";
    if (imageSrc) {
        content += `<img src="${imageSrc}" class="w-32 h-24 object-cover rounded-lg mb-1.5 border border-emerald-500/40" />`;
    }
    content += `<span>${text}</span>`;
    msgDiv.innerHTML = content;
    thread.appendChild(msgDiv);
    thread.scrollTop = thread.scrollHeight;
}

function appendAIMessage(text) {
    const thread = document.getElementById('aiChatThread');
    const msgDiv = document.createElement('div');
    msgDiv.className = "chat-bubble-ai";
    msgDiv.innerHTML = `<span class="text-purple-400 font-bold text-[10px] block mb-1">🧠 Gemini AI Murabbiy:</span>` + text;
    thread.appendChild(msgDiv);
    thread.scrollTop = thread.scrollHeight;
}

function sendTextMessage() {
    const input = document.getElementById('aiTextInput');
    const text = input.value.trim();
    if (!text && !uploadedImageBase64) return;

    appendUserMessage(text || "📷 Rasm tahlili uchun yuborildi", uploadedImageBase64);
    input.value = "";
    
    // Simulate AI thinking and response
    setTimeout(() => {
        generateAIResponse(text, uploadedImageBase64);
        clearImagePreview();
    }, 600);
}

function sendQuickPrompt(promptText) {
    document.getElementById('aiTextInput').value = promptText;
    sendTextMessage();
}

function generateAIResponse(query, imageBase64) {
    const child = childrenDatabase[currentChildKey];
    let responseText = "";

    if (imageBase64) {
        responseText = `
            <b>📷 Rasm Tahlili Xulosasi:</b><br>
            Yuklangan darslik/vazifa rasmi tahlil qilindi. Farzandingiz <b>${child.name} (${child.grade}-sinf)</b> uchun darslikdagi ushbu mavzuni mustahkamlash bo'yicha tavsiya:<br>
            1. Nazariy qoidani 10 daqiqa hayotiy misollar orqali tushuntiring.<br>
            2. Qiziqishni oshirish uchun amaliy topshiriq bering va rag'batlantiring! 🌟
        `;
    } else if (query.includes("qiziqish")) {
        responseText = `
            Farzandingiz <b>${child.name} (${child.grade}-sinf)</b> ning darsliklarga qiziqishini oshirish uchun:<br>
            • <b>Interaktiv format:</b> Matematika va tabiiy fanlarni video darsliklar va tajribalar orqali o'rganishga yo'naltiring.<br>
            • <b>Rag'batlantirish:</b> Kichik yutuqlarini ham maqtang va haftalik 100 ballik ko'rsatkichini birgalikda tahlil qiling.
        `;
    } else if (query.includes("ekran") || query.includes("batareya")) {
        responseText = `
            <b>📱 Raqamli Salomatlik Xulosasi:</b><br>
            Bugungi umumiy ekran vaqti: <b>${child.screenTime}</b>. YouTube va ijtimoiy tarmoqlar ulushi me'yorda. Tavsiya: Darsdan so'ng 1 soat sport yoki ochiq havoda sayr qilishni rejalashtiring.
        `;
    } else {
        responseText = `
            Pedagogik tavsiya: Farzandingiz bilan har kuni 15 daqiqa darsdan tashqari qiziqishlari haqida do'stona suhbatlashing. Bu uning o'ziga bo'lgan ishonchini 40% ga oshiradi.
        `;
    }

    appendAIMessage(responseText);
}

// Ovoz Yozish (Voice Recording) Kontrollari
function toggleVoiceRecording() {
    isRecordingVoice = !isRecordingVoice;
    const btn = document.getElementById('voiceRecordBtn');
    const status = document.getElementById('voiceRecordingStatus');

    if (isRecordingVoice) {
        btn.classList.add('recording');
        status.classList.remove('hidden');
    } else {
        stopAndSendVoice();
    }
}

function stopAndSendVoice() {
    isRecordingVoice = false;
    const btn = document.getElementById('voiceRecordBtn');
    const status = document.getElementById('voiceRecordingStatus');
    btn.classList.remove('recording');
    status.classList.add('hidden');

    appendUserMessage("🎙️ <i>[Ovozli xabar: 0:08 sek]</i>");
    setTimeout(() => {
        appendAIMessage("🎙️ <b>Ovozli Xabar Tahlili:</b> Savolingiz qabul qilindi. Farzandingizning dars jarayonini nazorat qilish va rag'batlantirish bo'yicha ovozli yo'riqnoma tayyorlandi!");
    }, 800);
}

// Rasm Yuklash Kontrollari
function handleImageSelected(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImageBase64 = e.target.result;
        document.getElementById('imagePreview').src = uploadedImageBase64;
        document.getElementById('imageFileName').innerText = file.name;
        document.getElementById('imagePreviewContainer').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

function clearImagePreview() {
    uploadedImageBase64 = null;
    document.getElementById('aiImageInput').value = "";
    document.getElementById('imagePreviewContainer').classList.add('hidden');
}

// ============================================================================
// 6. SUBPAGE VA MAVZU BOSHQARUVI
// ============================================================================
function setTheme(themeName) {
    currentTheme = themeName;
    localStorage.setItem('app_theme', themeName);
    if (themeName === 'default') {
        document.body.removeAttribute('data-theme');
    } else {
        document.body.setAttribute('data-theme', themeName);
    }
    document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
    const activeCard = document.querySelector(`[data-theme-name="${themeName}"]`);
    if (activeCard) activeCard.classList.add('active');
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('app_lang', lang);
    document.getElementById('langCheckUz').classList.toggle('hidden', lang !== 'uz');
    document.getElementById('langCheckRu').classList.toggle('hidden', lang !== 'ru');
    closeSubpage();
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    const targetBtn = document.getElementById(`nav-${tabId}`);

    if (targetTab) targetTab.classList.add('active');
    if (targetBtn) targetBtn.classList.add('active');

    if (tabId === 'tab-radar' && mapInstance) {
        setTimeout(() => mapInstance.invalidateSize(), 200);
    }
}

function openSubpage(subpageId) {
    document.querySelectorAll('.subpage-modal').forEach(m => m.classList.remove('active'));
    const modal = document.getElementById(subpageId);
    if (modal) modal.classList.add('active');
}

function closeSubpage() {
    document.querySelectorAll('.subpage-modal').forEach(m => m.classList.remove('active'));
}

function triggerVoiceAlert() {
    if (tg?.showPopup) {
        tg.showPopup({
            title: "🎙️ Ovozli Radar",
            message: "Farzandingizga ota-ona joylashuv so'rovi ovozli bildirishnoma ko'rinishida yuborildi.",
            buttons: [{ type: "ok" }]
        });
    } else {
        alert("🎙️ Farzandingizga ota-ona joylashuv so'rovi ovozli bildirishnoma ko'rinishida yuborildi.");
    }
}

function copyPairingLink() {
    const link = "https://t.me/farzand_nazorat_bot?start=pair_8f93a1c2";
    navigator.clipboard.writeText(link).then(() => {
        alert("✅ Farzandni ulash havolasi nusxalandi!");
    });
}

// 7. LEAFLET MAP
function initRadarMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl || mapInstance) return;

    const child = childrenDatabase[currentChildKey];
    mapInstance = L.map('map', { zoomControl: false, attributionControl: false }).setView([child.location.lat, child.location.lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapInstance);

    const childIcon = L.divIcon({
        className: 'custom-radar-icon',
        html: '<div class="radar-pin"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });
    childMarker = L.marker([child.location.lat, child.location.lng], { icon: childIcon }).addTo(mapInstance);

    const parentIcon = L.divIcon({
        className: 'parent-pin-icon',
        html: '<div style="width:12px;height:12px;background:#38bdf8;border:2px solid #fff;border-radius:50%;"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
    });
    parentMarker = L.marker([child.location.lat - 0.008, child.location.lng - 0.006], { icon: parentIcon }).addTo(mapInstance);
}

function updateMapCoordinates() {
    const child = childrenDatabase[currentChildKey];
    if (mapInstance && childMarker) {
        childMarker.setLatLng([child.location.lat, child.location.lng]);
        mapInstance.setView([child.location.lat, child.location.lng], 14);
    }
}

// DOM Yuklanganda
document.addEventListener('DOMContentLoaded', () => {
    setTheme(currentTheme);
    renderActiveChild();
    renderSchoolCurriculum();
    initRadarMap();
});
