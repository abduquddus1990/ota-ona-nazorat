/**
 * Zero-Trust Parental Guard Dashboard
 * Telegram WebApp SDK, Modular Tabs, Leaflet Map & Interactive Engine
 */

// 1. Data Store (Mock & Synced via API/Bot)
const dashboardState = {
    child: {
        name: "Aliyor (14 yosh)",
        username: "ali_student",
        status: "Darsda (244-Maktab)",
        battery: 84,
        totalScreenTime: "3s 45d",
        dailyLimit: "4s 00d",
        safetyStatus: "Xavfsiz",
        lastActive: "Hozirda faol"
    },
    appUsage: [
        { name: "YouTube (Shorts/Dars)", time: "1s 50d", percent: 48, category: "Ta'limiy / Video", color: "bg-red-500", tagColor: "text-red-400 bg-red-500/10" },
        { name: "Instagram (Reels)", time: "1s 05d", percent: 28, category: "Ijtimoiy Tarmoq", color: "bg-pink-500", tagColor: "text-pink-400 bg-pink-500/10" },
        { name: "Telegram Messenger", time: "35d", percent: 15, category: "Muloqot / Darslar", color: "bg-sky-500", tagColor: "text-sky-400 bg-sky-500/10" },
        { name: "Duolingo", time: "15d", percent: 6, category: "Til O'rganish", color: "bg-emerald-500", tagColor: "text-emerald-400 bg-emerald-500/10" },
        { name: "Boshqa tizim ilovalari", time: "10d", percent: 3, category: "Tizim", color: "bg-slate-500", tagColor: "text-slate-400 bg-slate-500/10" }
    ],
    aiInsights: {
        pedagogyAdvice: "Farzandingiz bugun YouTube orqali fizika va robototexnika darslarini qiziqish bilan ko'rdi. Kechki ovqat paytida unga robotlar yoki sun'iy intellekt haqida qiziqarli savol berib, fikrini so'rashingiz munosabatlarni yanada yaqinlashtiradi.",
        vectors: [
            { topic: "Dasturlash va Texnologiya", percent: 88, color: "bg-emerald-500" },
            { topic: "Fizika va Matematika", percent: 74, color: "bg-sky-500" },
            { topic: "Ijtimoiy Tarmoqlar / Trendlar", percent: 42, color: "bg-amber-500" },
            { topic: "Kiberxavfsizlik va O'yinlar", percent: 35, color: "bg-violet-500" }
        ],
        reelsDigest: [
            { title: "Python dasturlash asoslari", channel: "CodeUz", category: "Darslik", badge: "Ijobiy" },
            { title: "Koinot sirlari: Jeyms Vebb teleskopi", channel: "ScienceTV", category: "Fanga qiziqish", badge: "Ijobiy" },
            { title: "Top-5 trend memlar", channel: "FunWorld", category: "Ko'ngilochar", badge: "Me'yorda" }
        ]
    },
    school: {
        averageGrade: "4.9",
        attendance: "100%",
        todaySchedule: [
            { subject: "Algebra", time: "08:30 - 09:15", grade: "5", room: "302-xona" },
            { subject: "Fizika", time: "09:25 - 10:10", grade: "5", room: "Fizika lab." },
            { subject: "Ona tili", time: "10:20 - 11:05", grade: "4", room: "204-xona" },
            { subject: "Ingliz tili", time: "11:25 - 12:10", grade: "5", room: "Til markazi" }
        ]
    },
    location: {
        lat: 41.2995,
        lng: 69.2401,
        address: "Toshkent shahar, Yunusobod tumani, 244-Maktab hududida",
        geofences: [
            { name: "🏠 Uy (Yunusobod 4-mavze)", status: "Tashqarisida", color: "text-slate-400" },
            { name: "🏫 244-Maktab (Xavfsiz Zona)", status: "Ichida (Faol)", color: "text-emerald-400" },
            { name: "⚽ Futbol Maydoni (To'garak)", status: "Kutilmoqda (16:00)", color: "text-amber-400" }
        ]
    }
};

// 2. Telegram WebApp Initialization
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    if (tg.setHeaderColor) tg.setHeaderColor('#090d16');
    if (tg.setBackgroundColor) tg.setBackgroundColor('#090d16');
    
    const user = tg.initDataUnsafe?.user;
    if (user) {
        document.getElementById('parentNameBadge').innerText = `${user.first_name || 'Ota-ona'}`;
    }
}

// 3. Tab Switching Logic
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    const targetTab = document.getElementById(tabId);
    const targetBtn = document.querySelector(`[data-tab="${tabId}"]`);
    
    if (targetTab) targetTab.classList.add('active');
    if (targetBtn) targetBtn.classList.add('active');

    // Agar xarita tabiga o'tilsa, xarita o'lchamini yangilash
    if (tabId === 'tab-radar' && mapInstance) {
        setTimeout(() => mapInstance.invalidateSize(), 200);
    }
}

// 4. Leaflet Map Initialization
let mapInstance = null;
function initRadarMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl || mapInstance) return;

    mapInstance = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([dashboardState.location.lat, dashboardState.location.lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(mapInstance);

    // Farzand belgisi (Radar Pin)
    const customIcon = L.divIcon({
        className: 'custom-radar-icon',
        html: '<div class="radar-pin"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });

    L.marker([dashboardState.location.lat, dashboardState.location.lng], { icon: customIcon })
        .addTo(mapInstance)
        .bindPopup(`<b>${dashboardState.child.name}</b><br>${dashboardState.location.address}`)
        .openPopup();

    // Xavfsiz zona doirasi (Geofence Circle)
    L.circle([dashboardState.location.lat, dashboardState.location.lng], {
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.15,
        radius: 300
    }).addTo(mapInstance);
}

// 5. Renderers
function renderDashboard() {
    // 1. Asosiy Header & Ekran Vaqti
    document.getElementById('childName').innerText = dashboardState.child.name;
    document.getElementById('totalScreenTime').innerText = dashboardState.child.totalScreenTime;
    document.getElementById('batteryBadge').innerText = `${dashboardState.child.battery}%`;

    // 2. Ilovalar Reytingi (App Usage Rankings)
    const appList = document.getElementById('appUsageList');
    if (appList) {
        appList.innerHTML = dashboardState.appUsage.map(app => `
            <div class="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-white">${app.name}</span>
                        <span class="text-[10px] px-2 py-0.5 rounded-full font-medium ${app.tagColor}">${app.category}</span>
                    </div>
                    <span class="text-xs font-mono font-bold text-slate-300">${app.time} (${app.percent}%)</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill ${app.color}" style="width: ${app.percent}%"></div>
                </div>
            </div>
        `).join('');
    }

    // 3. AI Pedagogika & Qiziqishlar Matritsasi
    const adviceEl = document.getElementById('aiPedagogyAdvice');
    if (adviceEl) adviceEl.innerText = dashboardState.aiInsights.pedagogyAdvice;

    const vectorList = document.getElementById('aiVectorList');
    if (vectorList) {
        vectorList.innerHTML = dashboardState.aiInsights.vectors.map(v => `
            <div class="space-y-1">
                <div class="flex justify-between text-xs">
                    <span class="text-slate-300 font-medium">${v.topic}</span>
                    <span class="text-emerald-400 font-mono font-bold">${v.percent}%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill ${v.color}" style="width: ${v.percent}%"></div>
                </div>
            </div>
        `).join('');
    }

    const digestList = document.getElementById('reelsDigestList');
    if (digestList) {
        digestList.innerHTML = dashboardState.aiInsights.reelsDigest.map(r => `
            <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/50 border border-slate-800">
                <div>
                    <div class="text-xs font-semibold text-slate-200">${r.title}</div>
                    <div class="text-[10px] text-slate-400">${r.channel} • ${r.category}</div>
                </div>
                <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">${r.badge}</span>
            </div>
        `).join('');
    }

    // 4. e-Maktab Jadvali
    const scheduleList = document.getElementById('schoolScheduleList');
    if (scheduleList) {
        scheduleList.innerHTML = dashboardState.school.todaySchedule.map(s => `
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-xs text-emerald-400">
                        ${s.grade}
                    </div>
                    <div>
                        <div class="text-xs font-bold text-white">${s.subject}</div>
                        <div class="text-[10px] text-slate-400">${s.time} • ${s.room}</div>
                    </div>
                </div>
                <span class="text-xs font-semibold text-emerald-400">A'lo</span>
            </div>
        `).join('');
    }

    // 5. Geofence Zonalar
    const geofenceList = document.getElementById('geofenceZoneList');
    if (geofenceList) {
        geofenceList.innerHTML = dashboardState.location.geofences.map(g => `
            <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 text-xs">
                <span class="text-slate-300 font-medium">${g.name}</span>
                <span class="font-bold ${g.color}">${g.status}</span>
            </div>
        `).join('');
    }
}

// 6. Action Triggers
function triggerVoiceAlert() {
    if (tg?.showPopup) {
        tg.showPopup({
            title: "🎙️ Ovozli Radar So'rovi",
            message: "Farzandingizga avtomatik ovozli ogohlantirish yuborildi: 'Ota-onangiz joylashuvingizni so'ramoqda.'",
            buttons: [{ type: "ok" }]
        });
    } else {
        alert("🎙️ Farzandingizga ovozli ogohlantirish yuborildi!");
    }
}

function openTelegramCall() {
    if (tg?.openTelegramLink) {
        tg.openTelegramLink(`https://t.me/${dashboardState.child.username}`);
    } else {
        window.open(`https://t.me/${dashboardState.child.username}`, '_blank');
    }
}

function copyPairingLink() {
    const link = "https://t.me/farzand_nazorat_bot?start=pair_8f93a1c2";
    navigator.clipboard.writeText(link).then(() => {
        alert("🔗 Farzandni ulash havolasi nusxalandi!");
    });
}

// Initsializatsiya
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
    initRadarMap();
});
