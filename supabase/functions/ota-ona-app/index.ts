import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const HTML = `<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title>Shield Parental Guard — Ota-Ona Nazorati & AI Murabbiy</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Telegram WebApp SDK -->
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <!-- Leaflet OpenStreetMap CSS & JS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <!-- Custom CSS -->
    <style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

/* ==========================================================================
   THEME PALETTES (10 PINTEREST-INSPIRED AESTHETIC THEMES)
   ========================================================================== */
:root {
    --bg-primary: #090d16;
    --bg-surface: #111827;
    --bg-card: rgba(17, 24, 39, 0.88);
    --border-subtle: rgba(255, 255, 255, 0.08);
    --border-active: rgba(16, 185, 129, 0.4);
    --accent-primary: #10b981;
    --accent-hover: #059669;
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --wallpaper-gradient: radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.15), transparent 70%);
}

/* Theme 1: Aurora Borealis */
body[data-theme="aurora"] {
    --bg-primary: #05131e;
    --bg-surface: #0a253a;
    --bg-card: rgba(10, 37, 58, 0.88);
    --border-active: rgba(14, 165, 233, 0.4);
    --accent-primary: #0ea5e9;
    --wallpaper-gradient: radial-gradient(circle at 50% 0%, rgba(14, 165, 233, 0.25), rgba(16, 185, 129, 0.15) 50%, transparent 80%);
}

/* Theme 2: Deep Space Nebula */
body[data-theme="nebula"] {
    --bg-primary: #0d0818;
    --bg-surface: #1b1030;
    --bg-card: rgba(27, 16, 48, 0.88);
    --border-active: rgba(168, 85, 247, 0.4);
    --accent-primary: #a855f7;
    --wallpaper-gradient: radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.25), rgba(236, 72, 153, 0.15) 50%, transparent 80%);
}

/* Theme 3: Sunset Glow */
body[data-theme="sunset"] {
    --bg-primary: #180a0a;
    --bg-surface: #2b1212;
    --bg-card: rgba(43, 18, 18, 0.88);
    --border-active: rgba(249, 115, 22, 0.4);
    --accent-primary: #f97316;
    --wallpaper-gradient: radial-gradient(circle at 50% 0%, rgba(249, 115, 22, 0.25), rgba(239, 68, 68, 0.15) 50%, transparent 80%);
}

/* Theme 4: Emerald Matrix */
body[data-theme="emerald"] {
    --bg-primary: #06140d;
    --bg-surface: #0b291a;
    --bg-card: rgba(11, 41, 26, 0.88);
    --border-active: rgba(16, 185, 129, 0.4);
    --accent-primary: #10b981;
    --wallpaper-gradient: radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.25), transparent 75%);
}

/* Theme 5: Sakura Mist */
body[data-theme="sakura"] {
    --bg-primary: #170912;
    --bg-surface: #2b1122;
    --bg-card: rgba(43, 17, 34, 0.88);
    --border-active: rgba(244, 63, 94, 0.4);
    --accent-primary: #f43f5e;
    --wallpaper-gradient: radial-gradient(circle at 50% 0%, rgba(244, 63, 94, 0.2), rgba(217, 70, 239, 0.1) 60%, transparent 80%);
}

/* Theme 6: Obsidian Gold */
body[data-theme="gold"] {
    --bg-primary: #12100a;
    --bg-surface: #242013;
    --bg-card: rgba(36, 32, 19, 0.88);
    --border-active: rgba(234, 179, 8, 0.4);
    --accent-primary: #eab308;
    --wallpaper-gradient: radial-gradient(circle at 50% 0%, rgba(234, 179, 8, 0.2), transparent 75%);
}

/* Theme 7: Minimal Slate */
body[data-theme="minimal"] {
    --bg-primary: #0f172a;
    --bg-surface: #1e293b;
    --bg-card: rgba(30, 41, 59, 0.88);
    --border-active: rgba(148, 163, 184, 0.4);
    --accent-primary: #38bdf8;
    --wallpaper-gradient: none;
}

/* Theme 8: Cyberpunk Night */
body[data-theme="cyberpunk"] {
    --bg-primary: #05050d;
    --bg-surface: #0f1026;
    --bg-card: rgba(15, 16, 38, 0.92);
    --border-active: rgba(6, 182, 212, 0.4);
    --accent-primary: #06b6d4;
    --wallpaper-gradient: radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.25), rgba(217, 70, 239, 0.15) 60%, transparent 80%);
}

/* Theme 9: Metallic Silver Light 🌟 */
body[data-theme="silver"] {
    --bg-primary: #e2e8f0;
    --bg-surface: #f8fafc;
    --bg-card: rgba(255, 255, 255, 0.95);
    --border-subtle: rgba(15, 23, 42, 0.12);
    --border-active: rgba(71, 85, 105, 0.5);
    --accent-primary: #0f172a;
    --text-primary: #0f172a;
    --text-secondary: #334155;
    --text-muted: #64748b;
    --wallpaper-gradient: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
}

/* Theme 10: Sky Breeze Cyan 🌟 */
body[data-theme="sky"] {
    --bg-primary: #f0f9ff;
    --bg-surface: #e0f2fe;
    --bg-card: rgba(255, 255, 255, 0.95);
    --border-subtle: rgba(14, 165, 233, 0.2);
    --border-active: rgba(2, 132, 199, 0.5);
    --accent-primary: #0284c7;
    --text-primary: #0c4a6e;
    --text-secondary: #0369a1;
    --text-muted: #38bdf8;
    --wallpaper-gradient: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    -webkit-tap-highlight-color: transparent;
}

body {
    background-color: var(--bg-primary);
    background-image: var(--wallpaper-gradient);
    background-attachment: fixed;
    color: var(--text-primary);
    min-height: 100vh;
    padding-bottom: 95px;
    user-select: none;
    overflow-x: hidden;
    transition: background-color 0.35s ease, background-image 0.35s ease, color 0.35s ease;
}

/* Light Theme Overrides */
body[data-theme="silver"] .glass-card,
body[data-theme="sky"] .glass-card {
    box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.08);
}

body[data-theme="silver"] .text-white,
body[data-theme="sky"] .text-white {
    color: var(--text-primary) !important;
}

body[data-theme="silver"] .bg-slate-900,
body[data-theme="sky"] .bg-slate-900,
body[data-theme="silver"] .bg-slate-900\\/70,
body[data-theme="sky"] .bg-slate-900\\/70,
body[data-theme="silver"] .bg-slate-900\\/60,
body[data-theme="sky"] .bg-slate-900\\/60,
body[data-theme="silver"] .bg-slate-900\\/50,
body[data-theme="sky"] .bg-slate-900\\/50 {
    background-color: rgba(241, 245, 249, 0.92) !important;
}

body[data-theme="silver"] .border-slate-800,
body[data-theme="sky"] .border-slate-800 {
    border-color: rgba(148, 163, 184, 0.3) !important;
}

body[data-theme="silver"] .bottom-nav,
body[data-theme="sky"] .bottom-nav {
    background: rgba(255, 255, 255, 0.96);
    border-top: 1px solid rgba(0, 0, 0, 0.08);
}

/* Glassmorphism Card Effect */
.glass-card {
    background: var(--bg-card);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--border-subtle);
    border-radius: 1.25rem;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
    border-color: var(--border-active);
}

/* 3D Smooth Page Flip / Slide Transition */
.tab-content {
    display: none;
    opacity: 0;
    transform: translateY(8px) scale(0.99);
    transition: opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1), transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-content.active {
    display: block;
    opacity: 1;
    transform: translateY(0) scale(1);
}

/* Sub-page / Modal Overlay */
.subpage-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-primary);
    z-index: 2000;
    display: none;
    overflow-y: auto;
    padding: 16px;
    padding-bottom: 90px;
    animation: slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.subpage-modal.active {
    display: block;
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Bottom Navigation Bar */
.bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-width: 480px;
    margin: 0 auto;
    background: rgba(9, 13, 22, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid var(--border-subtle);
    z-index: 1000;
    display: flex;
    justify-content: space-around;
    padding: 8px 12px 14px 12px;
}

.nav-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 6px 10px;
    border-radius: 12px;
}

.nav-btn svg {
    width: 22px;
    height: 22px;
    margin-bottom: 3px;
    transition: transform 0.2s ease;
}

.nav-btn.active {
    color: var(--accent-primary);
    background: rgba(16, 185, 129, 0.1);
}

.nav-btn.active svg {
    transform: scale(1.1);
}

/* Leaflet Map */
#map {
    height: 240px;
    width: 100%;
    border-radius: 1rem;
    z-index: 10;
}

/* Radar Pin */
.radar-pin {
    width: 14px;
    height: 14px;
    background: var(--accent-primary);
    border: 2px solid #ffffff;
    border-radius: 50%;
    position: relative;
}

.radar-pin::after {
    content: '';
    position: absolute;
    top: -8px;
    left: -8px;
    width: 30px;
    height: 30px;
    background: rgba(16, 185, 129, 0.4);
    border-radius: 50%;
    animation: radarRipple 2s infinite;
}

@keyframes radarRipple {
    0% { transform: scale(0.5); opacity: 1; }
    100% { transform: scale(2.2); opacity: 0; }
}

/* Progress Bars */
.progress-bar-bg {
    background-color: rgba(255, 255, 255, 0.06);
    border-radius: 9999px;
    height: 8px;
    overflow: hidden;
}

body[data-theme="silver"] .progress-bar-bg,
body[data-theme="sky"] .progress-bar-bg {
    background-color: rgba(0, 0, 0, 0.08);
}

.progress-bar-fill {
    height: 100%;
    border-radius: 9999px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Theme Thumbnail Cards */
.theme-card {
    height: 70px;
    border-radius: 12px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: flex-end;
    padding: 8px;
    font-size: 11px;
    font-weight: 700;
}

.theme-card.active {
    border-color: var(--accent-primary);
    box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
}

/* ==========================================================================
   AI CHAT & AUDIO VISUALIZER
   ========================================================================== */
.ai-chat-container {
    max-height: 280px;
    overflow-y: auto;
    scroll-behavior: smooth;
}

.chat-bubble-user {
    background: rgba(16, 185, 129, 0.15);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 14px 14px 2px 14px;
    color: var(--text-primary);
    padding: 8px 12px;
    max-width: 85%;
    align-self: flex-end;
    font-size: 12px;
}

.chat-bubble-ai {
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: 14px 14px 14px 2px;
    color: var(--text-primary);
    padding: 10px 14px;
    max-width: 90%;
    align-self: flex-start;
    font-size: 12px;
    line-height: 1.45;
}

/* Voice Recording Pulsing Button */
.voice-record-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.voice-record-btn.recording {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    animation: voicePulse 1.2s infinite;
}

@keyframes voicePulse {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
    70% { transform: scale(1.1); box-shadow: 0 0 0 14px rgba(239, 68, 68, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

/* Waveform Bars */
.waveform-bars {
    display: flex;
    align-items: center;
    gap: 3px;
    height: 24px;
}

.waveform-bar {
    width: 3px;
    background: #10b981;
    border-radius: 2px;
    animation: waveAnim 1s ease-in-out infinite alternate;
}

@keyframes waveAnim {
    0% { height: 4px; }
    100% { height: 22px; }
}

/* 100-Point Grade Score Card */
.score-badge-100 {
    font-size: 28px;
    font-weight: 800;
    line-height: 1;
    background: linear-gradient(135deg, #10b981, #38bdf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* Period Pills */
.period-pill {
    padding: 6px 14px;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    border: 1px solid var(--border-subtle);
    background: transparent;
    color: var(--text-muted);
    transition: all 0.2s ease;
}

.period-pill.active {
    background: var(--accent-primary);
    color: #ffffff;
    border-color: var(--accent-primary);
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);
}

/* Sticky High-Contrast Subject List */
.subject-sticky-container {
    max-height: 380px;
    overflow-y: auto;
    padding-right: 4px;
}

.subject-item-card {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 10px 14px;
    transition: transform 0.2s ease, border-color 0.2s ease;
}

body[data-theme="silver"] .subject-item-card,
body[data-theme="sky"] .subject-item-card {
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(148, 163, 184, 0.25);
}

.subject-item-card:hover {
    border-color: var(--accent-primary);
    transform: translateY(-1px);
}

</style>
</head>
<body class="p-3 max-w-md mx-auto relative antialiased">

    <!-- ==================================================================== -->
    <!-- HEADER: Farzand Tanlash (Multi-Child Selector) & Ota-ona Statusi -->
    <!-- ==================================================================== -->
    <header class="glass-card p-3 mb-3 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
            <!-- Farzand Avatari va Tahrirlash Tugmasi -->
            <div onclick="openChildProfileModal()" class="relative cursor-pointer group" title="Farzand profilini tahrirlash">
                <div class="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-lg font-bold text-emerald-400 group-hover:scale-105 transition">
                    👦
                </div>
                <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-[9px] text-white">
                    ✎
                </div>
            </div>
            
            <div>
                <!-- Dinamik Farzand Dropdowni -->
                <div class="flex items-center gap-1.5">
                    <select id="childSelector" onchange="switchChild(this.value)" class="bg-transparent text-white font-bold text-xs cursor-pointer focus:outline-none border-none p-0">
                        <option value="child_1" class="bg-slate-900 text-white">Aliyor Valijonov (5-sinf)</option>
                        <option value="child_2" class="bg-slate-900 text-white">Madina Valijonova (3-sinf)</option>
                        <option value="child_3" class="bg-slate-900 text-white">Temur Valijonov (9-sinf)</option>
                    </select>
                </div>
                <div class="flex items-center gap-1.5 mt-0.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span class="text-[10px] text-slate-400" id="childClassBadge">5-sinf DTS Darsliklari</span>
                </div>
            </div>
        </div>

        <div class="flex items-center gap-2">
            <button onclick="openChildProfileModal()" class="p-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 hover:text-emerald-400 text-xs transition" title="Farzand ma'lumotlarini kiritish">
                👶 Profil
            </button>
            <div class="px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold" id="batteryBadge">
                84%
            </div>
        </div>
    </header>

    <!-- ==================================================================== -->
    <!-- TAB 1: 📊 DASHBOARD (ILOMALAR REYTINGI & BATALON) -->
    <!-- ==================================================================== -->
    <main id="tab-dashboard" class="tab-content active space-y-3">
        <!-- 1. Ekran Vaqti & Limit Bloki -->
        <section class="glass-card p-4">
            <div class="flex items-center justify-between mb-3">
                <div>
                    <h2 class="text-xs font-bold text-slate-400" data-i18n="screenTime">Bugungi Ekran Vaqti</h2>
                    <div class="text-2xl font-black text-white mt-0.5" id="totalScreenTime">3s 45d</div>
                </div>
                <div class="text-right">
                    <span class="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20" id="screenStatus" data-i18n="normalStatus">Normal</span>
                    <div class="text-[11px] text-slate-400 mt-1" data-i18n="limitRemain">Qoldi: <b class="text-slate-200" id="remainingTime">1s 15d</b></div>
                </div>
            </div>

            <div class="progress-bar-bg">
                <div id="screenTimeBar" class="progress-bar-fill bg-gradient-to-r from-emerald-500 to-sky-400" style="width: 72%;"></div>
            </div>
        </section>

        <!-- 2. Ilovalar Reytingi (Batareya & Screen-Time Tahlili) -->
        <section class="glass-card p-4 space-y-3">
            <div class="flex items-center justify-between">
                <h3 class="text-xs font-bold text-white flex items-center gap-1.5" data-i18n="appRankings">
                    📱 Ilovalardan Foydalanish Reytingi
                </h3>
                <span class="text-[10px] text-slate-400" data-i18n="autoSynced">Batareya / OCR</span>
            </div>

            <div class="space-y-3" id="appUsageList">
                <!-- JS orqali to'ldiriladi -->
            </div>
        </section>
    </main>

    <!-- ==================================================================== -->
    <!-- TAB 2: 📍 JONLI RADAR (LOKATSIYA & OVOZLI RADAR) -->
    <!-- ==================================================================== -->
    <main id="tab-radar" class="tab-content space-y-3">
        <section class="glass-card p-4 space-y-3">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-xs font-bold text-white" data-i18n="liveRadar">📍 Jonli Oila Radari</h2>
                    <div class="text-[10px] text-slate-400" id="radarAddress">Yunusobod 4-mavze, 24-maktab</div>
                </div>
                <button onclick="triggerVoiceAlert()" class="px-2.5 py-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-lg hover:bg-emerald-500/30 transition flex items-center gap-1">
                    <span>🎙️</span>
                    <span data-i18n="voiceRadarBtn">Ovozli Radar</span>
                </button>
            </div>

            <!-- Leaflet Map Container -->
            <div id="map"></div>

            <!-- Xavfsiz Hududlar (Geofences) -->
            <div class="space-y-2" id="geofenceZoneList">
                <!-- JS orqali to'ldiriladi -->
            </div>
        </section>
    </main>

    <!-- ==================================================================== -->
    <!-- TAB 3: 🧠 AI MURABBIY (MATN, OVOZ VA RASM TAHLILI) -->
    <!-- ==================================================================== -->
    <main id="tab-ai" class="tab-content space-y-3">
        <!-- 1. AI Interaktiv Muloqot Majmuasi -->
        <section class="glass-card p-3.5 space-y-3">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="text-xl">🧠</span>
                    <div>
                        <h2 class="text-xs font-bold text-white">Gemini AI Pedagog & Psixolog</h2>
                        <div class="text-[10px] text-emerald-400">Ovozli, Matnli va Rasm orqali maslahat</div>
                    </div>
                </div>
                <span class="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-mono">Gemini 1.5 Pro</span>
            </div>

            <!-- AI Chat Tarixi Oynasi -->
            <div id="aiChatThread" class="ai-chat-container space-y-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col">
                <div class="chat-bubble-ai">
                    Assalomu alaykum! Men sizning sun'iy intellekt tarbiyachi murabbiyingizman. Farzandingizning darslari, qiziqishlari, darslikdagi qiyin masalalari rasmi yoki ruhiy holati bo'yicha savol bering, ovoz yozing yoki rasm yuklang! 🌟
                </div>
            </div>

            <!-- Rasm Yuklangan bo'lsa Kichik Preview -->
            <div id="imagePreviewContainer" class="hidden p-2 rounded-lg bg-slate-900/80 border border-slate-700 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <img id="imagePreview" src="" class="w-10 h-10 object-cover rounded-lg border border-slate-600" />
                    <div class="text-[10px] text-slate-300">
                        <div class="font-bold text-white" id="imageFileName">vazifa_rasmi.jpg</div>
                        <div>Tahlil uchun tayyor</div>
                    </div>
                </div>
                <button onclick="clearImagePreview()" class="text-slate-400 hover:text-red-400 text-xs px-2">✕</button>
            </div>

            <!-- Tezkor Savol Tugmalari (Prompt Chips) -->
            <div class="flex gap-1.5 overflow-x-auto pb-1 text-[10px]">
                <button onclick="sendQuickPrompt('Farzandim 5-sinf darslariga qiziqishini qanday oshirsam bo\\'ladi?')" class="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-emerald-400 transition">
                    💡 Darsga qiziqishni oshirish
                </button>
                <button onclick="sendQuickPrompt('Ekran vaqti me\\'yori va batareya tahlili bo\\'yicha maslahat')" class="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-emerald-400 transition">
                    📱 Ekran vaqti tahlili
                </button>
                <button onclick="sendQuickPrompt('Farzandim bilan do\\'stona muloqot o\\'rnatish sirlari')" class="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-emerald-400 transition">
                    🤝 Do'stona muloqot
                </button>
            </div>

            <!-- Input & Ovoz/Rasm Yuklash Kontrollari -->
            <div class="flex items-center gap-2 pt-1 border-t border-slate-800">
                <!-- Rasm Yuklash Input (Hidden) -->
                <input type="file" id="aiImageInput" accept="image/*" class="hidden" onchange="handleImageSelected(event)">
                <button onclick="document.getElementById('aiImageInput').click()" class="p-2 rounded-xl bg-slate-800/70 border border-slate-700 text-slate-300 hover:text-purple-400 hover:border-purple-500/40 transition" title="Darslik yoki vazifa rasmini yuklash">
                    📷
                </button>

                <!-- Matnli Input -->
                <input type="text" id="aiTextInput" placeholder="Savol yoki vazifani yozing..." class="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition" onkeypress="if(event.key==='Enter') sendTextMessage()">

                <!-- Ovoz Yozish Tugmasi -->
                <button id="voiceRecordBtn" onclick="toggleVoiceRecording()" class="voice-record-btn" title="Ovoz yozish">
                    🎙️
                </button>

                <!-- Yuborish Tugmasi -->
                <button onclick="sendTextMessage()" class="p-2 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition" title="Yuborish">
                    ➤
                </button>
            </div>

            <!-- Ovoz Yozish Holati (Recording Indicator) -->
            <div id="voiceRecordingStatus" class="hidden p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                    <span class="text-[11px] font-bold text-red-400">Ovoz yozilmoqda...</span>
                </div>
                <div class="waveform-bars">
                    <span class="waveform-bar" style="animation-delay: 0.1s"></span>
                    <span class="waveform-bar" style="animation-delay: 0.3s"></span>
                    <span class="waveform-bar" style="animation-delay: 0.2s"></span>
                    <span class="waveform-bar" style="animation-delay: 0.4s"></span>
                    <span class="waveform-bar" style="animation-delay: 0.15s"></span>
                </div>
                <button onclick="stopAndSendVoice()" class="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded font-bold">
                    Tayyor
                </button>
            </div>
        </section>

        <!-- 2. Farzand Qiziqishlari Vektorlari -->
        <section class="glass-card p-3.5 space-y-2.5">
            <h3 class="text-xs font-bold text-white flex items-center justify-between">
                <span>🎯 Farzand Qiziqishlari Vektorlari</span>
                <span class="text-[10px] text-slate-400">AI Xulosasi</span>
            </h3>
            <div class="space-y-2" id="aiInterestVectors">
                <!-- JS orqali to'ldiriladi -->
            </div>
        </section>
    </main>

    <!-- ==================================================================== -->
    <!-- TAB 4: 📚 E-MAKTAB (100 BALLIK SHKALA & 1-11 SINF DARSLIKLARI) -->
    <!-- ==================================================================== -->
    <main id="tab-school" class="tab-content space-y-3">
        <!-- 1. Davr Tanlash & 100 Ballik Umumiy GPA -->
        <section class="glass-card p-4 space-y-3">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-xs font-bold text-slate-400">O'zlashtirish Ko'rsatkichi</h2>
                    <div class="flex items-baseline gap-1 mt-0.5">
                        <span class="score-badge-100" id="overallGradeScore">92.4</span>
                        <span class="text-xs font-bold text-slate-400">/ 100 ball</span>
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20" id="overallGradeLabel">A'lo (Top 5%)</span>
                    <div class="text-[10px] text-slate-400 mt-1" id="activePeriodLabel">Haftalik baholash</div>
                </div>
            </div>

            <!-- Davrni Tanlash (Haftalik / Oylik / Choraklik) -->
            <div class="flex items-center justify-between bg-slate-900/60 p-1 rounded-full border border-slate-800">
                <button onclick="setSchoolPeriod('weekly')" id="period-weekly" class="period-pill active flex-1 text-center">Haftalik</button>
                <button onclick="setSchoolPeriod('monthly')" id="period-monthly" class="period-pill flex-1 text-center">Oylik</button>
                <button onclick="setSchoolPeriod('quarterly')" id="period-quarterly" class="period-pill flex-1 text-center">Choraklik</button>
            </div>
        </section>

        <!-- 2. Sinfi Bo'yicha Fanlar va 100 Ballik Baholar Jadvali -->
        <section class="glass-card p-4 space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                    <h3 class="text-xs font-bold text-white flex items-center gap-1.5" id="curriculumClassTitle">
                        📚 5-Sinf Davlat Darsliklari & Baholari
                    </h3>
                    <div class="text-[10px] text-slate-400">O'zbekiston DTS Ta'lim Standarti</div>
                </div>
                <button onclick="openChildProfileModal()" class="text-[10px] text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-1 rounded-lg hover:bg-sky-500/20 transition">
                    Sinfni o'zgartirish ✎
                </button>
            </div>

            <!-- Scroll qilinganda ravshan ko'rinuvchi fanlar ro'yxati -->
            <div class="subject-sticky-container space-y-2.5" id="subjectsGradeList">
                <!-- JS orqali dinamik 1-11 sinf fanlari yuklanadi -->
            </div>
        </section>
    </main>

    <!-- ==================================================================== -->
    <!-- TAB 5: ⚙️ SOZLAMALAR -->
    <!-- ==================================================================== -->
    <main id="tab-settings" class="tab-content space-y-3">
        <h2 class="text-sm font-bold text-white px-1" data-i18n="settingsTitle">⚙️ Tizim Sozlamalari</h2>

        <!-- 1. Fon Tanlash (Pinterest Estetikasi) -->
        <div onclick="openSubpage('modal-themes')" class="glass-card p-3.5 flex items-center justify-between cursor-pointer hover:border-emerald-500/40 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-lg">
                    🎨
                </div>
                <div>
                    <div class="text-xs font-bold text-white" data-i18n="themeSelect">Fon va Dizaynni Tanlash</div>
                    <div class="text-[10px] text-slate-400" data-i18n="themeSub">10 xil eksklyuziv estetika fonlari</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm">›</span>
        </div>

        <!-- 2. Farzand Ma'lumotlarini Kiritish & Tahrirlash -->
        <div onclick="openChildProfileModal()" class="glass-card p-3.5 flex items-center justify-between cursor-pointer hover:border-emerald-500/40 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-lg">
                    👶
                </div>
                <div>
                    <div class="text-xs font-bold text-white">Farzand Ma'lumotlari & Sinfi</div>
                    <div class="text-[10px] text-slate-400">Ism, Username va 1-11 Sinf Darsliklari</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm">›</span>
        </div>

        <!-- 3. Tilni O'zgartirish (UZ / RU) -->
        <div onclick="openSubpage('modal-languages')" class="glass-card p-3.5 flex items-center justify-between cursor-pointer hover:border-emerald-500/40 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 text-lg">
                    🌐
                </div>
                <div>
                    <div class="text-xs font-bold text-white" data-i18n="langSelect">Tilni O'zgartirish (Язык)</div>
                    <div class="text-[10px] text-slate-400" data-i18n="langSub">O'zbekcha / Русский</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm">›</span>
        </div>

        <!-- 4. Tariflar va Obuna -->
        <div onclick="openSubpage('modal-plans')" class="glass-card p-3.5 flex items-center justify-between cursor-pointer hover:border-emerald-500/40 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-lg">
                    💎
                </div>
                <div>
                    <div class="text-xs font-bold text-white" data-i18n="plansSelect">Tariflar va Obuna</div>
                    <div class="text-[10px] text-slate-400" data-i18n="plansSub">Free / Family Premium</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm">›</span>
        </div>

        <!-- 5. Juftlash va Biometriya -->
        <div onclick="openSubpage('modal-pairing')" class="glass-card p-3.5 flex items-center justify-between cursor-pointer hover:border-emerald-500/40 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-lg">
                    🛡️
                </div>
                <div>
                    <div class="text-xs font-bold text-white" data-i18n="pairingSelect">Juftlash & Face ID Xavfsizlik</div>
                    <div class="text-[10px] text-slate-400" data-i18n="pairingSub">Biometrik tasdiq va QR kod</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm">›</span>
        </div>
    </main>

    <!-- ==================================================================== -->
    <!-- SUBPAGE MODALS (ICHKI SAHIFALAR) -->
    <!-- ==================================================================== -->

    <!-- 👶 MODAL: FARZAND PROFILINI KIRITISH & TAHRIRLASH -->
    <div id="modal-child-profile" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <button onclick="closeSubpage()" class="text-xs font-bold text-emerald-400">← Orqaga</button>
            <h2 class="text-xs font-bold text-white">Farzand Ma'lumotlari</h2>
            <span class="w-8"></span>
        </div>

        <div class="space-y-3">
            <div class="glass-card p-4 space-y-3">
                <div>
                    <label class="text-[11px] font-bold text-slate-300 block mb-1">Ism va Familiyasi</label>
                    <input type="text" id="profileFullName" placeholder="Masalan: Aliyor Valijonov" class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
                </div>

                <div>
                    <label class="text-[11px] font-bold text-slate-300 block mb-1">Telegram Usernamesi</label>
                    <input type="text" id="profileUsername" placeholder="@aliyor_valijonov" class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
                </div>

                <div>
                    <label class="text-[11px] font-bold text-slate-300 block mb-1">Sinfi (O'zbekiston Maktab Darsliklari)</label>
                    <select id="profileClassSelect" class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
                        <option value="1">1-sinf (Boshlang'ich)</option>
                        <option value="2">2-sinf (Boshlang'ich)</option>
                        <option value="3">3-sinf (Boshlang'ich)</option>
                        <option value="4">4-sinf (Boshlang'ich)</option>
                        <option value="5" selected>5-sinf (O'rta ta'lim)</option>
                        <option value="6">6-sinf (O'rta ta'lim)</option>
                        <option value="7">7-sinf (O'rta ta'lim)</option>
                        <option value="8">8-sinf (O'rta ta'lim)</option>
                        <option value="9">9-sinf (O'rta ta'lim)</option>
                        <option value="10">10-sinf (Yuqori sinf)</option>
                        <option value="11">11-sinf (Bitiruvchi sinf)</option>
                    </select>
                </div>

                <button onclick="saveChildProfile()" class="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20">
                    💾 Saqlash va Darsliklarni Yangilash
                </button>
            </div>
        </div>
    </div>

    <!-- 🎨 MODAL: FONLAR GALEREYASI -->
    <div id="modal-themes" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <button onclick="closeSubpage()" class="text-xs font-bold text-emerald-400" data-i18n="backBtn">← Orqaga</button>
            <h2 class="text-xs font-bold text-white" data-i18n="themeSelect">Fonlar Tanlovi</h2>
            <span class="w-8"></span>
        </div>

        <div class="grid grid-cols-2 gap-3">
            <div onclick="setTheme('default')" data-theme-name="default" class="theme-card active bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-emerald-400">
                Cyber Dark (Standart)
            </div>
            <div onclick="setTheme('aurora')" data-theme-name="aurora" class="theme-card bg-gradient-to-br from-sky-950 to-emerald-950 border-sky-800 text-sky-400">
                Aurora Borealis
            </div>
            <div onclick="setTheme('nebula')" data-theme-name="nebula" class="theme-card bg-gradient-to-br from-purple-950 to-pink-950 border-purple-800 text-purple-400">
                Deep Space Nebula
            </div>
            <div onclick="setTheme('sunset')" data-theme-name="sunset" class="theme-card bg-gradient-to-br from-amber-950 to-red-950 border-amber-800 text-amber-400">
                Sunset Glow
            </div>
            <div onclick="setTheme('emerald')" data-theme-name="emerald" class="theme-card bg-gradient-to-br from-emerald-950 to-slate-950 border-emerald-800 text-emerald-300">
                Emerald Matrix
            </div>
            <div onclick="setTheme('sakura')" data-theme-name="sakura" class="theme-card bg-gradient-to-br from-pink-950 to-slate-950 border-pink-800 text-pink-300">
                Sakura Mist
            </div>
            <div onclick="setTheme('gold')" data-theme-name="gold" class="theme-card bg-gradient-to-br from-yellow-950 to-slate-950 border-yellow-800 text-yellow-300">
                Obsidian Gold
            </div>
            <div onclick="setTheme('cyberpunk')" data-theme-name="cyberpunk" class="theme-card bg-gradient-to-br from-cyan-950 to-fuchsia-950 border-cyan-800 text-cyan-300">
                Cyberpunk Night
            </div>
            <div onclick="setTheme('silver')" data-theme-name="silver" class="theme-card bg-gradient-to-br from-slate-200 to-slate-400 border-slate-400 text-slate-900 shadow-md">
                Metallic Silver Light 🌟
            </div>
            <div onclick="setTheme('sky')" data-theme-name="sky" class="theme-card bg-gradient-to-br from-sky-100 to-sky-300 border-sky-400 text-sky-950 shadow-md">
                Sky Breeze Cyan 🌟
            </div>
        </div>
    </div>

    <!-- 🌐 MODAL: TILNI TANLASH -->
    <div id="modal-languages" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <button onclick="closeSubpage()" class="text-xs font-bold text-emerald-400" data-i18n="backBtn">← Orqaga</button>
            <h2 class="text-xs font-bold text-white" data-i18n="langSelect">Til / Язык</h2>
            <span class="w-8"></span>
        </div>

        <div class="space-y-3">
            <div onclick="setLanguage('uz')" class="glass-card p-4 flex items-center justify-between cursor-pointer hover:border-emerald-500">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">🇺🇿</span>
                    <div>
                        <div class="text-xs font-bold text-white">O'zbek tili</div>
                        <div class="text-[10px] text-slate-400">Asosiy til</div>
                    </div>
                </div>
                <span id="langCheckUz" class="text-emerald-400 text-sm font-bold">✓</span>
            </div>

            <div onclick="setLanguage('ru')" class="glass-card p-4 flex items-center justify-between cursor-pointer hover:border-emerald-500">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">🇷🇺</span>
                    <div>
                        <div class="text-xs font-bold text-white">Русский язык</div>
                        <div class="text-[10px] text-slate-400">Интерфейс и AI на русском</div>
                    </div>
                </div>
                <span id="langCheckRu" class="text-emerald-400 text-sm font-bold hidden">✓</span>
            </div>
        </div>
    </div>

    <!-- 💎 MODAL: TARIFLAR VA OBUNA -->
    <div id="modal-plans" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <button onclick="closeSubpage()" class="text-xs font-bold text-emerald-400" data-i18n="backBtn">← Orqaga</button>
            <h2 class="text-xs font-bold text-white" data-i18n="plansSelect">Tarif Rejalari</h2>
            <span class="w-8"></span>
        </div>

        <div class="space-y-3">
            <div class="glass-card p-4 border-emerald-500/40 relative overflow-hidden">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="text-[9px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">Hozirgi Tarif</span>
                        <h3 class="text-sm font-bold text-white mt-1">Free Basic</h3>
                        <p class="text-[11px] text-slate-400 mt-1">1 ta farzand, batareya tahlili va e-Maktab</p>
                    </div>
                    <div class="text-right">
                        <div class="text-base font-black text-white">0 so'm</div>
                        <span class="text-[10px] text-slate-500">Doimiy bepul</span>
                    </div>
                </div>
            </div>

            <div class="glass-card p-4 border-amber-500/30 relative overflow-hidden">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="text-[9px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">Premium Oilaviy</span>
                        <h3 class="text-sm font-bold text-white mt-1">Family Pro 🛡️</h3>
                        <p class="text-[11px] text-slate-400 mt-1">Cheksiz farzandlar, 100 ballik chuqur AI tahlil va real vaqtli video radar</p>
                    </div>
                    <div class="text-right">
                        <div class="text-base font-black text-amber-400">29,000</div>
                        <span class="text-[10px] text-slate-500">so'm / oy</span>
                    </div>
                </div>
                <button class="w-full mt-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20">
                    Tarifni Faollashtirish
                </button>
            </div>
        </div>
    </div>

    <!-- 🛡️ MODAL: JUFTLASH VA FACE ID -->
    <div id="modal-pairing" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <button onclick="closeSubpage()" class="text-xs font-bold text-emerald-400" data-i18n="backBtn">← Orqaga</button>
            <h2 class="text-xs font-bold text-white" data-i18n="pairingSelect">Farzandni Ulash</h2>
            <span class="w-8"></span>
        </div>

        <div class="glass-card p-4 space-y-3">
            <h3 class="text-xs font-bold text-white">🔐 Face ID & Dumaloq Video Qoidasi:</h3>
            <p class="text-[11px] text-slate-300 leading-relaxed">
                Farzandning roziligi va xavfsizligini ta'minlash uchun, u botga ulanganida quyidagi so'zlarni aytib <b>Video Note (dumaloq video)</b> yuborishi shart:
            </p>
            
            <div class="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-center space-y-1">
                <div class="text-xs font-bold text-emerald-400">🇺🇿 "nazorat_bot o'rnatilishiga roziman"</div>
                <div class="text-xs font-bold text-sky-400">🇷🇺 "Я согласен на установку nazorat_bot"</div>
            </div>

            <button onclick="copyPairingLink()" class="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition">
                🔗 Ulash Havolasidan Nusxa Olish
            </button>
        </div>
    </div>

    <!-- ==================================================================== -->
    <!-- BOTTOM NAVIGATION BAR (5 TA ASOSIY BO'LIM) -->
    <!-- ==================================================================== -->
    <nav class="bottom-nav">
        <button onclick="switchTab('tab-dashboard')" id="nav-tab-dashboard" class="nav-btn active">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span data-i18n="navDashboard">Asosiy</span>
        </button>

        <button onclick="switchTab('tab-radar')" id="nav-tab-radar" class="nav-btn">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span data-i18n="navRadar">Radar</span>
        </button>

        <button onclick="switchTab('tab-ai')" id="nav-tab-ai" class="nav-btn">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span data-i18n="navAi">AI Murabbiy</span>
        </button>

        <button onclick="switchTab('tab-school')" id="nav-tab-school" class="nav-btn">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span data-i18n="navSchool">e-Maktab</span>
        </button>

        <button onclick="switchTab('tab-settings')" id="nav-tab-settings" class="nav-btn">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span data-i18n="navSettings">Sozlamalar</span>
        </button>
    </nav>

    <!-- Custom JavaScript -->
    <script>
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
    
    document.getElementById('curriculumClassTitle').innerText = \`📚 \${grade}-Sinf Davlat Darsliklari & Baholari\`;
    document.getElementById('childClassBadge').innerText = \`\${grade}-sinf DTS Darsliklari\`;

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

        return \`
            <div class="subject-item-card flex items-center justify-between">
                <div class="space-y-1 flex-1 pr-3">
                    <div class="flex items-center gap-2">
                        <span class="text-[11px] font-bold text-white">\${index + 1}. \${subject}</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill bg-gradient-to-r from-emerald-500 to-sky-400" style="width: \${score}%;"></div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-xs font-black text-white">\${score} <span class="text-[9px] text-slate-400">/ 100</span></div>
                    <span class="text-[9px] font-bold px-1.5 py-0.5 rounded border \${badgeColor}">\${statusLabel}</span>
                </div>
            </div>
        \`;
    }).join('');

    const overallAvg = (totalScore / subjects.length).toFixed(1);
    document.getElementById('overallGradeScore').innerText = overallAvg;
    
    const periodNames = {
        'weekly': 'Haftalik baholash (Oxirgi 7 kun)',
        'monthly': 'Oylik umumiy ko\\'rsatkich',
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
    const btn = document.getElementById(\`period-\${period}\`);
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
    if (select.querySelector(\`option[value="\${currentChildKey}"]\`)) {
        select.querySelector(\`option[value="\${currentChildKey}"]\`).innerText = \`\${fullName} (\${grade}-sinf)\`;
    }

    renderActiveChild();
    renderSchoolCurriculum();
    closeSubpage();

    alert(\`✅ Farzand ma'lumotlari saqlandi!\\n\${grade}-sinf Davlat darsliklari va 100 ballik baholar e-Maktab bo'limiga o'rnatildi.\`);
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
    document.getElementById('batteryBadge').innerText = \`\${child.battery}%\`;
    document.getElementById('remainingTime').innerText = child.remaining;
    document.getElementById('childSelector').value = currentChildKey;

    // Ilovalar Reytingi
    const appList = document.getElementById('appUsageList');
    if (appList) {
        appList.innerHTML = child.apps.map(app => \`
            <div class="space-y-1">
                <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2">
                        <span class="text-sm">\${app.icon}</span>
                        <span class="font-bold text-white">\${app.name}</span>
                        <span class="text-[10px] text-slate-400 bg-slate-800/60 px-1.5 py-0.2 rounded">\${app.category}</span>
                    </div>
                    <span class="font-mono text-slate-300">\${app.time} <b class="text-emerald-400">(\${app.percent}%)</b></span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill \${app.color}" style="width: \${app.percent}%;"></div>
                </div>
            </div>
        \`).join('');
    }

    // Geofences
    const geofenceList = document.getElementById('geofenceZoneList');
    if (geofenceList) {
        geofenceList.innerHTML = child.location.geofences.map(g => \`
            <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 text-xs">
                <span class="text-slate-300 font-medium">\${g.name}</span>
                <span class="font-bold \${g.color}">\${g.status}</span>
            </div>
        \`).join('');
    }

    // Interests
    const interestList = document.getElementById('aiInterestVectors');
    if (interestList) {
        interestList.innerHTML = child.interests.map(i => \`
            <div class="space-y-1">
                <div class="flex justify-between text-xs">
                    <span class="text-slate-300 font-medium">\${i.topic}</span>
                    <span class="font-bold text-white">\${i.percent}%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill \${i.color}" style="width: \${i.percent}%;"></div>
                </div>
            </div>
        \`).join('');
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
        content += \`<img src="\${imageSrc}" class="w-32 h-24 object-cover rounded-lg mb-1.5 border border-emerald-500/40" />\`;
    }
    content += \`<span>\${text}</span>\`;
    msgDiv.innerHTML = content;
    thread.appendChild(msgDiv);
    thread.scrollTop = thread.scrollHeight;
}

function appendAIMessage(text) {
    const thread = document.getElementById('aiChatThread');
    const msgDiv = document.createElement('div');
    msgDiv.className = "chat-bubble-ai";
    msgDiv.innerHTML = \`<span class="text-purple-400 font-bold text-[10px] block mb-1">🧠 Gemini AI Murabbiy:</span>\` + text;
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
    const qLower = (query || "").toLowerCase();
    let responseText = "";

    if (imageBase64) {
        responseText = \`
            <b>📷 Vazifa / Rasm Tahlili Xulosasi:</b><br>
            Yuklangan darslik topshirig'i tahlil qilindi. <b>\${child.name} (\${child.grade}-sinf)</b> uchun ushbu darslik mavzusini o'zlashtirish bo'yicha yo'riqnoma:<br>
            • <b>Asosiy qoida:</b> Mavzuning nazariy tushunchasini 10 daqiqa amaliy misollar orqali ko'rib chiqing.<br>
            • <b>Mustahkamlash:</b> Darslikdagi 2-3 ta topshiriqni mustaqil yechishga yo'naltiring va 100 ballik e-Maktab ko'rsatkichini qayd eting! 🌟
        \`;
    } else if (qLower.includes("reels") || qLower.includes("short") || qLower.includes("video") || qLower.includes("insta") || qLower.includes("youtube")) {
        responseText = \`
            <b>🎬 Ko'rilayotgan Reels va Video Kontent Tahlili:</b><br>
            Farzandingiz <b>\${child.name} (\${child.grade}-sinf)</b> tomosha qilayotgan Reels / Shorts videolari bo'yicha aniq ma'lumotlar:<br><br>
            📊 <b>Mavzular taqsimoti:</b><br>
            • <b>💻 Ta'limiy & IT (Python, Robototexnika, Ingliz tili):</b> 45% (Foydali va rivojlantiruvchi)<br>
            • <b>🔬 Ilmiy tajribalar & Mantiqiy boshqotirmalar:</b> 25% (Ijobiy tendensiya)<br>
            • <b>🎮 Ko'ngilochar va o'yin strimlari:</b> 30% (Me'yorida)<br><br>
            💡 <b>Tavsiya:</b> Algoritm ko'proq ta'limiy videolarni tavsiya qilishi uchun fanlar bo'yicha foydali kanallarga obuna bo'lishni yo'lga qo'ying.
        \`;
    } else if (qLower.includes("qiziqish") || qLower.includes("fan") || qLower.includes("dars")) {
        responseText = \`
            <b>📚 Darslarni O'zlashtirish va Qiziqishni Oshirish:</b><br>
            <b>\${child.name} (\${child.grade}-sinf)</b> uchun Davlat ta'lim standarti fanlarini mustahkamlash usullari:<br>
            • <b>Amaliy yondashuv:</b> Matematika va tabiiy fanlarni grafik misollar va tajribalar orqali o'rganish samaraliroq.<br>
            • <b>Haftalik tahlil:</b> e-Maktab bo'limidagi 100 ballik ko'rsatkichlarni birgalikda ko'rib, yuqori natijalarni qayd etib boring.
        \`;
    } else if (qLower.includes("ekran") || qLower.includes("batareya") || qLower.includes("vaqt") || qLower.includes("limit")) {
        responseText = \`
            <b>📱 Raqamli Odatlar & Ekran Vaqti Tahlili:</b><br>
            Bugungi sarflangan umumiy vaqt: <b>\${child.screenTime}</b> (Qolgan limit: <b>\${child.remaining}</b>).<br>
            Ilovalar ichida eng ko'p foydalanilgani: <b>\${child.apps[0]?.name || "YouTube"} (\${child.apps[0]?.percent || 35}%)</b>.<br>
            Kunlik rejimga ko'ra darsdan keyin sport va jismoniy faollikni rejalashtirish tavsiya etiladi.
        \`;
    } else {
        responseText = \`
            <b>💡 Ma'lumot:</b> Farzandingiz <b>\${child.name} (\${child.grade}-sinf)</b> ning dars jadvali, 100 ballik baholari, jonli joylashuvi va batareya ko'rsatkichlari doimiy nazorat ostida. Har qanday fan, video tahlili yoki limitlar bo'yicha savolingizni yozishingiz mumkin.
        \`;
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
    const activeCard = document.querySelector(\`[data-theme-name="\${themeName}"]\`);
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
    const targetBtn = document.getElementById(\`nav-\${tabId}\`);

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

</script>
</body>
</html>
`;

serve((req) => {
  return new Response(HTML, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
