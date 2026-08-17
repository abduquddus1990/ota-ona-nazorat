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
    <!-- ROL TANLASH (PARENT VS CHILD ROLE SWITCHER) -->
    <!-- ==================================================================== -->
    <div class="glass-card p-1.5 mb-3 flex items-center justify-between gap-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <button onclick="switchAppRole('parent')" id="roleBtnParent" class="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold text-white bg-emerald-500 shadow-md transition flex items-center justify-center gap-1.5">
            <span>👨‍👩‍👧</span>
            <span data-i18n="roleParent">Ota-ona Paneli</span>
        </button>
        <button onclick="switchAppRole('child')" id="roleBtnChild" class="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5">
            <span>👦</span>
            <span data-i18n="roleChild">Farzand Paneli</span>
        </button>
    </div>

    <!-- ==================================================================== -->
    <!-- HEADER: Farzand Tanlash & Plan Statusi (Multi-Child & Plan Badge) -->
    <!-- ==================================================================== -->
    <header id="mainParentHeader" class="glass-card p-3 mb-3 flex items-center justify-between">
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
            <!-- Plan Badge (Free / Pro) -->
            <button onclick="openSubpage('modal-plans')" id="headerPlanBadge" class="px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                💎 Pro
            </button>
            <div class="px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold" id="batteryBadge">
                84%
            </div>
        </div>
    </header>

    <!-- ==================================================================== -->
    <!-- AUTH STATUS / DEMO REJIMI BANNERI -->
    <!-- ==================================================================== -->
    <div id="authStatusBanner" class="p-2.5 mb-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 flex items-center justify-between">
        <div class="flex items-center gap-2">
            <span class="text-sm" id="authBannerIcon">🧪</span>
            <div>
                <div class="text-[11px] font-bold text-amber-300" id="authBannerTitle" data-i18n="demoModeTitle">Test / Demo Rejimi</div>
                <div class="text-[9px] text-slate-400" id="authBannerSub" data-i18n="demoModeSub">Admin tasdig'i bilan farzand qo'shish ochiladi</div>
            </div>
        </div>
        <button onclick="openSubpage('modal-auth')" class="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] shadow-sm transition" id="authBannerBtn" data-i18n="loginRegisterBtn">
            🔑 Kirish / Ro'yxat
        </button>
    </div>

    <!-- ==================================================================== -->
    <!-- 👦 FARZAND PORTALI (CHILD DASHBOARD & ONBOARDING) -->
    <!-- ==================================================================== -->
    <main id="tab-child-portal" class="tab-content space-y-3.5 hidden">
        <!-- Farzand Salomlashish Headeri -->
        <section class="glass-card p-4 bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border-indigo-500/40 relative overflow-hidden">
            <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-2xl animate-bounce">
                    🚀
                </div>
                <div>
                    <h2 class="text-sm font-black text-white" data-i18n="childWelcomeTitle">Salom, Yosh Qahramon! 🌟</h2>
                    <p class="text-[11px] text-indigo-300 mt-0.5" data-i18n="childWelcomeSub">Sening shaxsiy aqlli yordamching va xavfsizlik qalqoning</p>
                </div>
            </div>
        </section>

        <!-- 🎯 1-BAND: TIZIMNING MAQSADI (BOLA TILIDA) -->
        <section class="glass-card p-4 space-y-2 border-emerald-500/30">
            <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">1</div>
                <h3 class="text-xs font-bold text-white" data-i18n="childGoalTitle">🎯 Tizimning Asosiy Maqsadi Nima?</h3>
            </div>
            <p class="text-[11px] text-slate-300 leading-relaxed pl-9" data-i18n="childGoalDesc">
                Bu dastur seni nazorat qilish yoki jazolash uchun emas! Asosiy maqsad — darslarda a'lochi bo'lishing, qiyin masalalarni oson yechishing, vaqtingni qiziqarli o'tkazishing va xavfsizligingni ta'minlashda senga eng yaqin aqlli do'st bo'lishdir.
            </p>
        </section>

        <!-- 🌟 2-BAND: FARZAND UCHUN FOYDA VA AFZALLIKLAR -->
        <section class="glass-card p-4 space-y-2.5 border-sky-500/30">
            <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-sm font-bold">2</div>
                <h3 class="text-xs font-bold text-white" data-i18n="childBenefitsTitle">🌟 Senga Qanday Katta Afzalliklari Bor?</h3>
            </div>
            <div class="space-y-2 pl-9">
                <div class="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                    <span class="text-base">🧠</span>
                    <div>
                        <div class="text-[11px] font-bold text-white" data-i18n="childBenefit1Title">Gemini AI Aqlli Murabbiy</div>
                        <div class="text-[10px] text-slate-400" data-i18n="childBenefit1Desc">Tushunarsiz darslik misollarini rasmga olib yubor, u senga oddiy va qiziqarli qilib tushuntirib beradi.</div>
                    </div>
                </div>

                <div class="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                    <span class="text-base">🏆</span>
                    <div>
                        <div class="text-[11px] font-bold text-white" data-i18n="childBenefit2Title">100 Ballik e-Maktab & Rag'bat</div>
                        <div class="text-[10px] text-slate-400" data-i18n="childBenefit2Desc">Fanlardan yuqori ball to'plab, ota-onang bilan kelishgan holda maxsus mukofotlar va sayrlar yutib olasan.</div>
                    </div>
                </div>

                <div class="p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                    <span class="text-base">📍</span>
                    <div>
                        <div class="text-[11px] font-bold text-white" data-i18n="childBenefit3Title">Xotirjam Ota-ona</div>
                        <div class="text-[10px] text-slate-400" data-i18n="childBenefit3Desc">Maktabdan yoki to'garakdan eson-omon uyga yetganingda ota-onang xavotir olmasligi uchun xarita yordam beradi.</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 🎬 3-BAND: YOUTUBE & REELS TAHLILI (AYNAN SHAXSIY VIDEO EMAS!) -->
        <section class="glass-card p-4 space-y-2.5 border-purple-500/30">
            <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold">3</div>
                <h3 class="text-xs font-bold text-white" data-i18n="childReelsTitle">🎬 YouTube & Reels Tahlili Qanday Ishlaydi?</h3>
            </div>
            <div class="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-[11px] text-purple-200 leading-relaxed pl-3 space-y-1.5">
                <div class="font-bold flex items-center gap-1.5 text-purple-300">
                    <span>🛡️</span>
                    <span data-i18n="childPrivacyGuarantee">Maxfiylik Kafolati:</span>
                </div>
                <p data-i18n="childReelsDesc">
                    Biz sening <b>shaxsiy yozishmalaringni (chatlaringni)</b> yoki aynan qaysi videoni ko'rganingni tomosha qilmaymiz! Faqat qaysi fanlarga (IT dasturlash, Mantiq, Ilmiy tajribalar, Ingliz tili) qiziqayotganing mavzusi va daqiqalari ota-onang bilan birga yangi ko'nikmalarni rivojlantirishing uchun tahlil qilinadi.
                </p>
            </div>
        </section>

        <!-- 📱 4-BAND: ILOVALAR BALANSI VA SALOMATLIK -->
        <section class="glass-card p-4 space-y-2 border-amber-500/30">
            <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold">4</div>
                <h3 class="text-xs font-bold text-white" data-i18n="childAppsTitle">📱 Ilovalar Balansi & Ko'rish Qobiliyati</h3>
            </div>
            <p class="text-[11px] text-slate-300 leading-relaxed pl-9" data-i18n="childAppsDesc">
                Telefon ko'zni charchatmasligi va darslarga xalaqit bermasligi uchun har kungi foydalanish vaqti me'yori saqlanadi. Ilovalardan o'z vaqtida to'g'ri foydalanib, vaqtni unumli rejalashtirishni o'rganasan.
            </p>
        </section>

        <!-- 🔑 5-BAND: ROZILIK VA OILAVIY KODNI KIRITISH (PAIRING FORM) -->
        <section class="glass-card p-4 space-y-3.5 border-emerald-500/40 bg-gradient-to-b from-slate-900/80 to-slate-950/80">
            <div class="flex items-center gap-2 pb-2 border-b border-slate-800">
                <span class="text-xl">🤝</span>
                <div>
                    <h3 class="text-xs font-bold text-white" data-i18n="childPairingHeader">Oila Profiliga Ulanish & Rozilik</h3>
                    <div class="text-[10px] text-slate-400" data-i18n="childPairingSub">Ota-onang bergan 6 xonali Oila Kodini kirit</div>
                </div>
            </div>

            <!-- Rozilik Chekboxi -->
            <label class="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-700 cursor-pointer hover:border-emerald-500/60 transition">
                <input type="checkbox" id="childConsentCheckbox" class="mt-0.5 w-4 h-4 rounded text-emerald-500 focus:ring-0 cursor-pointer">
                <span class="text-[11px] text-slate-200 leading-snug" data-i18n="childConsentLabel">
                    Men yuqoridagi barcha 4 ta qoida bilan tanishdim va ota-onam bilan tizimga ulanishga roziman.
                </span>
            </label>

            <!-- 6 Xonali Kod Kiritish -->
            <div class="space-y-1.5">
                <label class="text-[11px] font-bold text-sky-400 block" data-i18n="childInputCodeLabel">6 Xonali Oila Kodi (masalan: 849-210):</label>
                <input type="text" id="childFamilyCodeInput" placeholder="849-210" class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-mono text-center font-bold text-emerald-400 tracking-widest focus:outline-none focus:border-emerald-500 uppercase">
            </div>

            <div id="childPairErrorMsg" class="hidden p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[10px] text-rose-400 font-medium"></div>

            <button onclick="handleChildPairingSubmit()" class="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2">
                <span>🚀</span>
                <span data-i18n="btnChildConnect">Oila Profiliga Ulanish</span>
            </button>

            <!-- Muvaffaqiyatli ulanganlik xabari -->
            <div id="childPairedSuccessBox" class="hidden p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-center space-y-1">
                <div class="text-xs font-bold text-emerald-300" data-i18n="childPairedSuccess">🎉 Tabriklaymiz! Siz Oila Profiliga Muvaffaqiyatli Ulandingiz!</div>
                <div class="text-[10px] text-slate-400" data-i18n="childPairedSub">Ota-onangizning Telegram botiga xabar yuborildi.</div>
            </div>
        </section>
    </main>

    <!-- ==================================================================== -->
    <!-- TAB 1: 📊 DASHBOARD (EKRAN VAQTI & ILOVALAR REYTINGI) -->
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
                    <div class="text-[11px] text-slate-400 mt-1"><span data-i18n="limitRemain">Qoldi:</span> <b class="text-slate-200" id="remainingTime">1s 15d</b></div>
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
                <span class="text-[10px] text-slate-400" data-i18n="autoSynced">Avtomatik</span>
            </div>

            <div class="space-y-3" id="appUsageList">
                <!-- JS orqali to'ldiriladi -->
            </div>
        </section>
    </main>

    <!-- ==================================================================== -->
    <!-- TAB 2: 📍 JONLI RADAR (LOKATSIYA & XARITA — BARCHA UCHUN BEPUL) -->
    <!-- ==================================================================== -->
    <main id="tab-radar" class="tab-content space-y-3">
        <section class="glass-card p-4 space-y-3">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-xs font-bold text-white flex items-center gap-1.5">
                        <span data-i18n="liveRadar">📍 Jonli Oila Radari</span>
                        <span class="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold" data-i18n="freeForLife">Bepul</span>
                    </h2>
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
    <!-- TAB 3: 🧠 AI MURABBIY (PRO: MATN, OVOZ VA RASM TAHLILI) -->
    <!-- ==================================================================== -->
    <main id="tab-ai" class="tab-content space-y-3">
        <!-- AI Interaktiv Muloqot Majmuasi -->
        <section class="glass-card p-3.5 space-y-3">
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
            <div id="aiChatThread" class="ai-chat-container space-y-2 p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col">
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
                <button onclick="sendQuickPrompt('Farzandim darslariga qiziqishini qanday oshirsam bo\\'ladi?')" class="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-emerald-400 transition" data-i18n="chip1">
                    💡 Darsga qiziqishni oshirish
                </button>
                <button onclick="sendQuickPrompt('Ko\\'rilgan Reels va video kontentlar tahlili')" class="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-emerald-400 transition" data-i18n="chip2">
                    🎬 Reels & Video tahlili
                </button>
                <button onclick="sendQuickPrompt('Ekran vaqti me\\'yori va batareya tahlili')" class="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-emerald-400 transition" data-i18n="chip3">
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

        <!-- Farzand Qiziqishlari Vektorlari -->
        <section class="glass-card p-3.5 space-y-2.5">
            <h3 class="text-xs font-bold text-white flex items-center justify-between">
                <span data-i18n="interestVectors">🎯 Farzand Qiziqishlari Vektorlari</span>
                <span class="text-[10px] text-slate-400" data-i18n="aiAnalysis">AI Xulosasi</span>
            </h3>
            <div class="space-y-2" id="aiInterestVectors">
                <!-- JS orqali to'ldiriladi -->
            </div>
        </section>
    </main>

    <!-- ==================================================================== -->
    <!-- TAB 4: 📚 E-MAKTAB (PRO: 100 BALLIK SHKALA & 1-11 SINF DARSLIKLARI) -->
    <!-- ==================================================================== -->
    <main id="tab-school" class="tab-content space-y-3">
        <!-- 1. Davr Tanlash & 100 Ballik Umumiy GPA -->
        <section class="glass-card p-4 space-y-3">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-xs font-bold text-slate-400" data-i18n="gpaTitle">O'zlashtirish Ko'rsatkichi</h2>
                    <div class="flex items-baseline gap-1 mt-0.5">
                        <span class="score-badge-100" id="overallGradeScore">92.4</span>
                        <span class="text-xs font-bold text-slate-400" data-i18n="maxScore">/ 100 ball</span>
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20" id="overallGradeLabel">A'lo (Top 5%)</span>
                    <div class="text-[10px] text-slate-400 mt-1" id="activePeriodLabel">Haftalik baholash</div>
                </div>
            </div>

            <!-- Davrni Tanlash (Haftalik / Oylik / Choraklik) -->
            <div class="flex items-center justify-between bg-slate-900/60 p-1 rounded-full border border-slate-800">
                <button onclick="setSchoolPeriod('weekly')" id="period-weekly" class="period-pill active flex-1 text-center" data-i18n="periodWeekly">Haftalik</button>
                <button onclick="setSchoolPeriod('monthly')" id="period-monthly" class="period-pill flex-1 text-center" data-i18n="periodMonthly">Oylik</button>
                <button onclick="setSchoolPeriod('quarterly')" id="period-quarterly" class="period-pill flex-1 text-center" data-i18n="periodQuarterly">Choraklik</button>
            </div>
        </section>

        <!-- 2. Sinfi Bo'yicha Fanlar va 100 Ballik Baholar Jadvali -->
        <section class="glass-card p-4 space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                    <h3 class="text-xs font-bold text-white flex items-center gap-1.5" id="curriculumClassTitle">
                        📚 5-Sinf Davlat Darsliklari & Baholari
                    </h3>
                    <div class="text-[10px] text-slate-400" data-i18n="curriculumSub">O'zbekiston DTS Ta'lim Standarti</div>
                </div>
                <button onclick="openChildProfileModal()" class="text-[10px] text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-1 rounded-lg hover:bg-sky-500/20 transition" data-i18n="changeGradeBtn">
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
                    <div class="text-xs font-bold text-white" data-i18n="profileTitle">Farzand Ma'lumotlari & Sinfi</div>
                    <div class="text-[10px] text-slate-400" data-i18n="profileSub">Ism, Username va 1-11 Sinf Darsliklari</div>
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

        <!-- 4. Tariflar va Obuna (Free / Family Pro) -->
        <div onclick="openSubpage('modal-plans')" class="glass-card p-3.5 flex items-center justify-between cursor-pointer hover:border-emerald-500/40 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-lg">
                    💎
                </div>
                <div>
                    <div class="text-xs font-bold text-white" data-i18n="plansSelect">Tariflar va Obuna</div>
                    <div class="text-[10px] text-slate-400" data-i18n="plansSub">Free (Lokatsiya) / Family Pro (AI)</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm">›</span>
        </div>

        <!-- 5. Juftlash va Android Ilova -->
        <div onclick="openSubpage('modal-pairing')" class="glass-card p-3.5 flex items-center justify-between cursor-pointer hover:border-emerald-500/40 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-lg">
                    🛡️
                </div>
                <div>
                    <div class="text-xs font-bold text-white" data-i18n="pairingSelect">Farzandni Ulash & Android Ilova</div>
                    <div class="text-[10px] text-slate-400" data-i18n="pairingSub">Oila kodi va avtomatik juftlash</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm">›</span>
        </div>

        <!-- 6. Takliflar va Fikr-mulohazalar (alhamdulillah@tmail.ton) -->
        <div onclick="openSubpage('modal-feedback')" class="glass-card p-3.5 flex items-center justify-between cursor-pointer hover:border-emerald-500/40 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 text-lg">
                    💡
                </div>
                <div>
                    <div class="text-xs font-bold text-white" data-i18n="feedbackTitle">Taklif va Mulohazalar</div>
                    <div class="text-[10px] text-slate-400" data-i18n="feedbackSub">alhamdulillah@tmail.ton orqali fikr yuborish</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm">›</span>
        </div>

        <!-- 7. Ota-ona Hisobi & Kirish (Auth Settings) -->
        <div onclick="openSubpage('modal-auth')" class="glass-card p-3.5 flex items-center justify-between cursor-pointer hover:border-emerald-500/40 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-lg">
                    👤
                </div>
                <div>
                    <div class="text-xs font-bold text-white" id="settingsAuthUsername" data-i18n="authSettingsTitle">Ota-ona Hisobi & Kirish</div>
                    <div class="text-[10px] text-amber-400" id="settingsAuthStatus" data-i18n="authSettingsSub">Holat: Test Rejimida (Kirish)</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm">›</span>
        </div>
    </main>

    <!-- ==================================================================== -->
    <!-- SUBPAGE MODALS -->
    <!-- ==================================================================== -->

    <!-- 🔑 MODAL: OTA-ONA KIRISH VA REGISTRATSIYA (USERNAME + PAROL + PAROLNI TAKRORLASH) -->
    <div id="modal-auth" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <button onclick="closeSubpage()" class="text-xs font-bold text-emerald-400" data-i18n="backBtn">← Orqaga</button>
            <h2 class="text-xs font-bold text-white" id="authModalTitle" data-i18n="authModalTitle">Ota-ona Hisobi</h2>
            <span class="w-8"></span>
        </div>

        <!-- Auth Tab Buttons (Kirish / Registratsiya) -->
        <div class="flex items-center justify-between bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button onclick="switchAuthTab('register')" id="tabBtnRegister" class="flex-1 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-500 shadow transition" data-i18n="tabRegister">
                📝 Ro'yxatdan o'tish
            </button>
            <button onclick="switchAuthTab('login')" id="tabBtnLogin" class="flex-1 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition" data-i18n="tabLogin">
                🔑 Kirish
            </button>
        </div>

        <!-- Registratsiya Formasi -->
        <div id="formRegister" class="glass-card p-4 space-y-3">
            <div class="text-center pb-1">
                <span class="text-2xl">🛡️</span>
                <h3 class="text-xs font-bold text-white mt-1" data-i18n="regHeader">Ota-ona Profilini Yaratish</h3>
                <p class="text-[10px] text-slate-400" data-i18n="regSub">Username va parol tanlang. So'rov adminga yuboriladi.</p>
            </div>

            <div>
                <label class="text-[11px] font-bold text-slate-300 block mb-1" data-i18n="regUsernameLabel">Telegram Usernamesi / Ism</label>
                <input type="text" id="regUsername" placeholder="@ota_ona_username" class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
            </div>

            <div>
                <label class="text-[11px] font-bold text-slate-300 block mb-1" data-i18n="regPasswordLabel">Parol Tanlang</label>
                <input type="password" id="regPassword" placeholder="••••••••" class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
            </div>

            <div>
                <label class="text-[11px] font-bold text-slate-300 block mb-1" data-i18n="regConfirmPasswordLabel">Parolni Takrorlang</label>
                <input type="password" id="regConfirmPassword" placeholder="••••••••" class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
            </div>

            <!-- Xatolik xabari -->
            <div id="authErrorMsg" class="hidden p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[10px] text-rose-400 font-medium"></div>

            <button onclick="handleParentRegister()" class="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20" data-i18n="btnSubmitRegister">
                📝 Ro'yxatdan O'tish & So'rov Yuborish
            </button>
        </div>

        <!-- Kirish Formasi -->
        <div id="formLogin" class="glass-card p-4 space-y-3 hidden">
            <div class="text-center pb-1">
                <span class="text-2xl">🔑</span>
                <h3 class="text-xs font-bold text-white mt-1" data-i18n="loginHeader">Tizimga Kirish</h3>
                <p class="text-[10px] text-slate-400" data-i18n="loginSub">Avval ro'yxatdan o'tgan parolingizni kiriting</p>
            </div>

            <div>
                <label class="text-[11px] font-bold text-slate-300 block mb-1" data-i18n="loginUsernameLabel">Telegram Usernamesi</label>
                <input type="text" id="loginUsername" placeholder="@ota_ona_username" class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
            </div>

            <div>
                <label class="text-[11px] font-bold text-slate-300 block mb-1" data-i18n="loginPasswordLabel">Parol</label>
                <input type="password" id="loginPassword" placeholder="••••••••" class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
            </div>

            <div id="loginErrorMsg" class="hidden p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[10px] text-rose-400 font-medium"></div>

            <button onclick="handleParentLogin()" class="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-sky-500/20" data-i18n="btnSubmitLogin">
                🚀 Kirish
            </button>
        </div>
    </div>

    <!-- ⏳ MODAL: ADMIN TASDIG'I KUTILMOQDA -->
    <div id="modal-approval-notice" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <button onclick="closeSubpage()" class="text-xs font-bold text-emerald-400" data-i18n="backBtn">← Orqaga</button>
            <h2 class="text-xs font-bold text-white" data-i18n="approvalNoticeTitle">Admin Tasdig'i Kutilmoqda</h2>
            <span class="w-8"></span>
        </div>

        <div class="glass-card p-5 text-center space-y-3">
            <span class="text-4xl">⏳</span>
            <h3 class="text-sm font-bold text-white" data-i18n="approvalNoticeHeader">So'rovingiz Administrator Ko'rib Chiqishida</h3>
            <p class="text-[11px] text-slate-300 leading-relaxed" data-i18n="approvalNoticeDesc">
                Siz hozirda <b>Test / Demo</b> rejimidan foydalanmoqdasiz. Barcha bo'limlar (Radar, AI, e-Maktab) siz uchun ko'rishga ochiq.
                <br><br>
                Haqiqiy farzand ma'lumotlarini saqlash va qurilmani ulash administrator ruxsat berganidan so'ng faollashadi.
            </p>

            <div class="p-3 rounded-xl bg-slate-900/80 border border-amber-500/30 text-[10px] text-amber-300">
                🔔 Adminga so'rov yuborilgan. Tasdiqlanishi bilan Telegramingizga bildirishnoma boradi.
            </div>

            <button onclick="closeSubpage()" class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition">
                🧪 Test Rejimida Davom Etish
            </button>
        </div>
    </div>

    <!-- 👶 MODAL: FARZAND PROFILINI TAHRIRLASH -->
    <div id="modal-child-profile" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <button onclick="closeSubpage()" class="text-xs font-bold text-emerald-400" data-i18n="backBtn">← Orqaga</button>
            <h2 class="text-xs font-bold text-white" data-i18n="profileTitle">Farzand Ma'lumotlari</h2>
            <span class="w-8"></span>
        </div>

        <div class="space-y-3">
            <div class="glass-card p-4 space-y-3">
                <div>
                    <label class="text-[11px] font-bold text-slate-300 block mb-1" data-i18n="nameLabel">Ism va Familiyasi</label>
                    <input type="text" id="profileFullName" placeholder="Aliyor Valijonov" class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
                </div>

                <div>
                    <label class="text-[11px] font-bold text-slate-300 block mb-1" data-i18n="usernameLabel">Telegram Usernamesi</label>
                    <input type="text" id="profileUsername" placeholder="@aliyor_valijonov" class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
                </div>

                <div>
                    <label class="text-[11px] font-bold text-slate-300 block mb-1" data-i18n="classLabel">Sinfi (1-11 Sinf DTS)</label>
                    <select id="profileClassSelect" class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
                        <option value="1">1-sinf / 1-класс</option>
                        <option value="2">2-sinf / 2-класс</option>
                        <option value="3">3-sinf / 3-класс</option>
                        <option value="4">4-sinf / 4-класс</option>
                        <option value="5" selected>5-sinf / 5-класс</option>
                        <option value="6">6-sinf / 6-класс</option>
                        <option value="7">7-sinf / 7-класс</option>
                        <option value="8">8-sinf / 8-класс</option>
                        <option value="9">9-sinf / 9-класс</option>
                        <option value="10">10-sinf / 10-класс</option>
                        <option value="11">11-sinf / 11-класс</option>
                    </select>
                </div>

                <button onclick="saveChildProfile()" class="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20" data-i18n="saveProfileBtn">
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
                Cyber Dark
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

    <!-- 💎 MODAL: TARIFLAR VA OBUNA (10,000 SO'M / HAR BIR BOLA UCHUN) -->
    <div id="modal-plans" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <button onclick="closeSubpage()" class="text-xs font-bold text-emerald-400" data-i18n="backBtn">← Orqaga</button>
            <h2 class="text-xs font-bold text-white" data-i18n="plansSelect">Tarif Rejalari / Тарифы</h2>
            <span class="w-8"></span>
        </div>

        <div class="space-y-3">
            <!-- Free Basic Plan -->
            <div class="glass-card p-4 border-emerald-500/40 relative overflow-hidden">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="text-[9px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full" data-i18n="freePlanBadge">Bepul Tarif (Free)</span>
                        <h3 class="text-sm font-bold text-white mt-1" data-i18n="freePlanTitle">Free Basic</h3>
                        <p class="text-[11px] text-slate-400 mt-1" data-i18n="freePlanDesc">📍 Jonli Lokatsiya & Radar (100% Bepul), batareya va umumiy ekran vaqti</p>
                    </div>
                    <div class="text-right">
                        <div class="text-base font-black text-white" data-i18n="freePrice">0 so'm</div>
                        <span class="text-[10px] text-slate-500" data-i18n="foreverFree">Hozirda bepul</span>
                    </div>
                </div>
                <!-- Sifat va Barqarorlik Ogohlantirishi -->
                <div class="mt-2.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300/90 leading-tight flex items-start gap-1.5">
                    <span class="text-xs">⚠️</span>
                    <span data-i18n="freeQualityNotice">Eslatma: Tizim sifati va serverlar barqarorligini ta'minlash maqsadida kelajakda bepul versiyaga ham juda kam (ramziy) miqdorda to'lov joriy etilishi mumkin.</span>
                </div>
            </div>

            <!-- Pro Plan (10,000 so'm har bir bola uchun) -->
            <div class="glass-card p-4 border-amber-500/50 bg-amber-500/5 relative overflow-hidden">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="text-[9px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full" data-i18n="proPlanBadge">Premium Farzand Nazorati</span>
                        <h3 class="text-sm font-bold text-white mt-1" data-i18n="proPlanTitle">Pro Versiya 💎</h3>
                        <p class="text-[11px] text-slate-300 mt-1" data-i18n="proPlanDesc">🧠 Gemini AI Murabbiy (Ovoz/Rasm/Matn), 📚 1-11 Sinf DTS e-Maktab 100 ballik tahlil va 🎬 Reels chuqur tahlili</p>
                    </div>
                    <div class="text-right">
                        <div class="text-base font-black text-amber-400" data-i18n="proPrice">10,000</div>
                        <span class="text-[10px] text-slate-400" data-i18n="perChildMonth">so'm / oy (1 bola uchun)</span>
                    </div>
                </div>
                <button onclick="togglePlanUpgrade()" id="btnPlanToggle" class="w-full mt-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20" data-i18n="activateProBtn">
                    💎 Pro Versiyani Faollashtirish
                </button>
            </div>
        </div>
    </div>

    <!-- 💡 MODAL: TAKLIFLAR VA FIKR-MULOHAZALAR (alhamdulillah@tmail.ton) -->
    <div id="modal-feedback" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <button onclick="closeSubpage()" class="text-xs font-bold text-emerald-400" data-i18n="backBtn">← Orqaga</button>
            <h2 class="text-xs font-bold text-white" data-i18n="feedbackTitle">Taklif va Mulohazalar</h2>
            <span class="w-8"></span>
        </div>

        <div class="glass-card p-4 space-y-3">
            <div class="text-center space-y-1">
                <span class="text-3xl">📬</span>
                <h3 class="text-sm font-bold text-white mt-1" data-i18n="feedbackHeader">Fikringiz biz uchun muhim!</h3>
                <p class="text-[11px] text-slate-300 leading-relaxed" data-i18n="feedbackDesc">
                    Dasturni yanada takomillashtirish, yangi darsliklar yoki qulayliklar bo'yicha takliflaringizni to'g'ridan-to'g'ri ishlab chiquvchilarga yuboring.
                </p>
            </div>

            <!-- Email manzili kartochkasi -->
            <div class="p-3.5 rounded-xl bg-slate-900/90 border border-teal-500/40 text-center space-y-1">
                <div class="text-[10px] text-slate-400" data-i18n="feedbackEmailLabel">Rasmiy qabul pochtasi:</div>
                <div class="text-sm font-black text-teal-300 font-mono select-all">alhamdulillah@tmail.ton</div>
            </div>

            <!-- Gmail / Pochta orqali yozish tugmalari -->
            <div class="space-y-2 pt-1">
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=alhamdulillah@tmail.ton&su=Shield+Parental+Guard+Taklif+va+Mulohaza&body=Assalomu+alaykum,+loyiha+bo'yicha+taklifim:" target="_blank" class="w-full py-2.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-red-500/20">
                    <span>✉️</span>
                    <span data-i18n="openGmailBtn">Gmail orqali xat yozish</span>
                </a>

                <a href="mailto:alhamdulillah@tmail.ton?subject=Shield%20Parental%20Guard%20Taklif&body=Assalomu%20alaykum,%20mening%20taklifim:" class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-2">
                    <span>📧</span>
                    <span data-i18n="openDefaultMailBtn">Boshqa pochta dasturi orqali</span>
                </a>
            </div>
        </div>
    </div>

    <!-- 🛡️ MODAL: JUFTLASH VA ANDROID ILOVA (AUTO-ONBOARDING) -->
    <div id="modal-pairing" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <button onclick="closeSubpage()" class="text-xs font-bold text-emerald-400" data-i18n="backBtn">← Orqaga</button>
            <h2 class="text-xs font-bold text-white" data-i18n="pairingSelect">Farzandni Ulash</h2>
            <span class="w-8"></span>
        </div>

        <div class="glass-card p-4 space-y-3">
            <h3 class="text-xs font-bold text-white" data-i18n="autoPairTitle">🔑 Sizning Oila Kodingiz (Avtomatik):</h3>
            
            <!-- 6 Xonali Oila Kodi -->
            <div class="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-center space-y-1">
                <div class="text-2xl font-black text-emerald-400 tracking-wider font-mono" id="displayFamilyCode">849-210</div>
                <div class="text-[10px] text-slate-400" data-i18n="familyCodeHint">Farzand telefonida kiritiladi yoki havolani yuboring</div>
            </div>

            <p class="text-[11px] text-slate-300 leading-relaxed" data-i18n="pairingInstruction">
                Farzand hech qanday admin ishtirokisiz ulanadi:
                <br>1. Ushbu havolani farzandingizga yuboring:
            </p>

            <button onclick="copyPairingLink()" class="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition" data-i18n="copyPairLinkBtn">
                🔗 Ulash Havolasidan Nusxa Olish
            </button>

            <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div class="text-xs font-bold text-sky-400">📱 Android Ilova orqali ulash:</div>
                <div class="text-[10px] text-slate-400 leading-relaxed">
                    Android ilovani farzand telefoniga o'rnating va yuqoridagi 6 xonali kodni kiriting.
                </div>
            </div>
        </div>
    </div>

    <!-- 🛡️ MODAL: JUFTLASH VA ANDROID ILOVA (AUTO-ONBOARDING) -->
    <div id="modal-pairing" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <button onclick="closeSubpage()" class="text-xs font-bold text-emerald-400" data-i18n="backBtn">← Orqaga</button>
            <h2 class="text-xs font-bold text-white" data-i18n="pairingSelect">Farzandni Ulash</h2>
            <span class="w-8"></span>
        </div>

        <div class="glass-card p-4 space-y-3">
            <h3 class="text-xs font-bold text-white" data-i18n="autoPairTitle">🔑 Sizning Oila Kodingiz (Avtomatik):</h3>
            
            <!-- 6 Xonali Oila Kodi -->
            <div class="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-center space-y-1">
                <div class="text-2xl font-black text-emerald-400 tracking-wider font-mono" id="displayFamilyCode">849-210</div>
                <div class="text-[10px] text-slate-400" data-i18n="familyCodeHint">Farzand telefonida kiritiladi yoki havolani yuboring</div>
            </div>

            <p class="text-[11px] text-slate-300 leading-relaxed" data-i18n="pairingInstruction">
                Farzand hech qanday admin ishtirokisiz ulanadi:
                <br>1. Ushbu havolani farzandingizga yuboring:
            </p>

            <button onclick="copyPairingLink()" class="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition" data-i18n="copyPairLinkBtn">
                🔗 Ulash Havolasidan Nusxa Olish
            </button>

            <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div class="text-xs font-bold text-sky-400">📱 Android Ilova orqali ulash:</div>
                <div class="text-[10px] text-slate-400 leading-relaxed">
                    Android ilovani farzand telefoniga o'rnating va yuqoridagi 6 xonali kodni kiriting.
                </div>
            </div>
        </div>
    </div>

    <!-- ==================================================================== -->
    <!-- BOTTOM NAVIGATION BAR (5 TA BO'LIM) -->
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
            <span data-i18n="navRadar">Radar (Bepul)</span>
        </button>

        <button onclick="switchTab('tab-ai')" id="nav-tab-ai" class="nav-btn">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span data-i18n="navAi">AI Murabbiy 💎</span>
        </button>

        <button onclick="switchTab('tab-school')" id="nav-tab-school" class="nav-btn">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span data-i18n="navSchool">e-Maktab 💎</span>
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
 * SHIELD PARENTAL GUARD — CORE FRONTEND LOGIC
 * Bilingual (UZ / RU), 100-Point Grading, 1-11 Class DTS, Free Location & Pro AI/e-Maktab, Auto Self-Pairing.
 */

// 1. O'ZBEKISTON DTS 1-11 SINF DARSLIKLARI (O'zbekcha / Русский)
const CURRICULUM_DATABASE = {
    uz: {
        1: ["Ona tili va o'qish savodxonligi", "Matematika", "Tabiiy fanlar (Science)", "Tasviriy san'at", "Musiqa", "Texnologiya", "Jismoniy tarbiya", "Ingliz tili", "Tarbiya"],
        2: ["Ona tili va o'qish savodxonligi", "Matematika", "Tabiiy fanlar (Science)", "Tasviriy san'at", "Musiqa", "Texnologiya", "Jismoniy tarbiya", "Ingliz tili", "Tarbiya"],
        3: ["Ona tili va o'qish savodxonligi", "Matematika", "Tabiiy fanlar (Science)", "Tasviriy san'at", "Musiqa", "Texnologiya", "Jismoniy tarbiya", "Ingliz tili", "Tarbiya"],
        4: ["Ona tili va o'qish savodxonligi", "Matematika", "Tabiiy fanlar (Science)", "Tasviriy san'at", "Musiqa", "Texnologiya", "Jismoniy tarbiya", "Ingliz tili", "Tarbiya"],
        5: ["Ona tili", "Adabiyot", "Matematika", "Tarixdan hikoyalar", "Tabiiy fanlar (Science)", "Chet tili (Ingliz tili)", "Informatika va axborot texnologiyalari", "Tasviriy san'at", "Texnologiya", "Musiqa", "Jismoniy tarbiya", "Tarbiya"],
        6: ["Ona tili", "Adabiyot", "Matematika", "Qadimgi dunyo tarixi", "Biologiya (Botanika)", "Geografiya", "Chet tili (Ingliz tili)", "Informatika", "Tasviriy san'at", "Texnologiya", "Musiqa", "Jismoniy tarbiya", "Tarbiya"],
        7: ["Ona tili", "Adabiyot", "Algebra", "Geometriya", "Fizika", "Kimyo", "Biologiya (Zoologiya)", "O'zbekiston tarixi", "Jahon tarixi", "Geografiya", "Informatika", "Chet tili", "Texnologiya", "Jismoniy tarbiya", "Tarbiya"],
        8: ["Ona tili", "Adabiyot", "Algebra", "Geometriya", "Fizika", "Kimyo", "Biologiya (Odam va salomatligi)", "O'zbekiston tarixi", "Jahon tarixi", "Geografiya", "Davlat va huquq asoslari", "Informatika", "Chet tili", "Tarbiya"],
        9: ["Ona tili", "Adabiyot", "Algebra", "Geometriya", "Fizika", "Kimyo", "Biologiya (Genetika)", "O'zbekiston tarixi", "Jahon tarixi", "Geografiya", "Konstitutsiya asoslari", "Informatika", "Chet tili", "Tarbiya"],
        10: ["Ona tili", "Adabiyot", "Algebra", "Geometriya", "Fizika", "Kimyo", "Biologiya", "O'zbekiston tarixi", "Jahon tarixi", "Davlat va huquq asoslari", "Informatika", "Chet tili", "Astronomiya", "ChaQBT", "Jismoniy tarbiya"],
        11: ["Ona tili", "Adabiyot", "Algebra", "Geometriya", "Fizika", "Kimyo", "Biologiya", "O'zbekiston tarixi", "Jahon tarixi", "Davlat va huquq asoslari", "Informatika", "Chet tili", "Astronomiya", "ChaQBT", "Jismoniy tarbiya"]
    },
    ru: {
        1: ["Родной язык и грамотность", "Математика", "Естествознание (Science)", "ИЗО (Рисование)", "Музыка", "Технология", "Физкультура", "Английский язык", "Воспитание"],
        2: ["Родной язык и грамотность", "Математика", "Естествознание (Science)", "ИЗО (Рисование)", "Музыка", "Технология", "Физкультура", "Английский язык", "Воспитание"],
        3: ["Родной язык и грамотность", "Математика", "Естествознание (Science)", "ИЗО (Рисование)", "Музыка", "Технология", "Физкультура", "Английский язык", "Воспитание"],
        4: ["Родной язык и грамотность", "Математика", "Естествознание (Science)", "ИЗО (Рисование)", "Музыка", "Технология", "Физкультура", "Английский язык", "Воспитание"],
        5: ["Родной язык", "Литература", "Математика", "Рассказы по истории", "Естествознание (Science)", "Иностранный язык (Английский)", "Информатика и IT", "ИЗО", "Технология", "Музыка", "Физкультура", "Воспитание"],
        6: ["Родной язык", "Литература", "Математика", "История древнего мира", "Биология (Ботаника)", "География", "Иностранный язык", "Информатика", "ИЗО", "Технология", "Музыка", "Физкультура", "Воспитание"],
        7: ["Родной язык", "Литература", "Алгебра", "Геометрия", "Физика", "Химия", "Биология (Зоология)", "История Узбекистана", "Всемирная история", "География", "Информатика", "Иностранный язык", "Технология", "Физкультура", "Воспитание"],
        8: ["Родной язык", "Литература", "Алгебра", "Геометрия", "Физика", "Химия", "Биология (Человек и здоровье)", "История Узбекистана", "Всемирная история", "География", "Основы государства и права", "Информатика", "Иностранный язык", "Воспитание"],
        9: ["Родной язык", "Литература", "Алгеbra", "Геометрия", "Физика", "Химия", "Биология (Генетика)", "История Узбекистана", "Всемирная история", "География", "Основы конституции", "Информатика", "Иностранный язык", "Воспитание"],
        10: ["Родной язык", "Литература", "Алгебра", "Геометрия", "Физика", "Химия", "Биология", "История Узбекистана", "Всемирная история", "Основы государства и права", "Информатика", "Иностранный язык", "Астрономия", "НВП", "Физкультура"],
        11: ["Родной язык", "Литература", "Алгебра", "Геометрия", "Физика", "Химия", "Биология", "История Узбекистана", "Всемирная история", "Основы государства и права", "Информатика", "Иностранный язык", "Астрономия", "НВП", "Физкультура"]
    }
};

// 2. BILINGUAL DICTIONARY (UZ / RU)
const I18N = {
    uz: {
        screenTime: "Bugungi Ekran Vaqti",
        normalStatus: "Normal",
        limitRemain: "Qoldi:",
        appRankings: "📱 Ilovalardan Foydalanish Reytingi",
        autoSynced: "Avtomatik",
        liveRadar: "📍 Jonli Oila Radari",
        freeForLife: "Bepul",
        voiceRadarBtn: "Ovozli Radar",
        aiTitle: "Gemini AI Dars & Qiziqish Murabbiyi",
        aiSub: "Ovozli, Matnli va Rasm orqali tavsiyalar",
        aiWelcome: "Assalomu alaykum! Men farzandingizning darsliklarini o'zlashtirishi, qiziqishlari va raqamli odatlarini tahlil qiluvchi AI yordamchisiman. Darslik topshirig'i rasmini yuklang, savol yozing yoki ovozli xabar qoldiring! 🌟",
        readyForAnalysis: "Tahlil uchun tayyor",
        chip1: "💡 Darsga qiziqishni oshirish",
        chip2: "🎬 Reels & Video tahlili",
        chip3: "📱 Ekran vaqti tahlili",
        recordingVoice: "Ovoz yozilmoqda...",
        readyBtn: "Tayyor",
        interestVectors: "🎯 Farzand Qiziqishlari Vektorlari",
        aiAnalysis: "AI Xulosasi",
        gpaTitle: "O'zlashtirish Ko'rsatkichi",
        maxScore: "/ 100 ball",
        periodWeekly: "Haftalik",
        periodMonthly: "Oylik",
        periodQuarterly: "Choraklik",
        curriculumSub: "O'zbekiston DTS Ta'lim Standarti",
        changeGradeBtn: "Sinfni o'zgartirish ✎",
        settingsTitle: "⚙️ Tizim Sozlamalari",
        themeSelect: "Fon va Dizaynni Tanlash",
        themeSub: "10 xil eksklyuziv estetika fonlari",
        profileTitle: "Farzand Ma'lumotlari & Sinfi",
        profileSub: "Ism, Username va 1-11 Sinf Darsliklari",
        langSelect: "Tilni O'zgartirish (Язык)",
        langSub: "O'zbekcha / Русский",
        plansSelect: "Tariflar va Obuna",
        plansSub: "Free (Lokatsiya) / Pro (10,000 so'm)",
        pairingSelect: "Farzandni Ulash & Android Ilova",
        pairingSub: "Oila kodi va avtomatik juftlash",
        feedbackTitle: "Taklif va Mulohazalar",
        feedbackSub: "alhamdulillah@tmail.ton orqali fikr yuborish",
        feedbackHeader: "Fikringiz biz uchun muhim!",
        feedbackDesc: "Dasturni yanada takomillashtirish, yangi darsliklar yoki qulayliklar bo'yicha takliflaringizni to'g'ridan-to'g'ri ishlab chiquvchilarga yuboring.",
        feedbackEmailLabel: "Rasmiy qabul pochtasi:",
        openGmailBtn: "Gmail orqali xat yozish",
        openDefaultMailBtn: "Boshqa pochta dasturi orqali",
        demoModeTitle: "Test / Demo Rejimi",
        demoModeSub: "Admin tasdig'i bilan farzand qo'shish ochiladi",
        loginRegisterBtn: "🔑 Kirish / Ro'yxat",
        authSettingsTitle: "Ota-ona Hisobi & Kirish",
        authSettingsSub: "Holat: Test Rejimida",
        authModalTitle: "Ota-ona Hisobi",
        tabRegister: "📝 Ro'yxatdan o'tish",
        tabLogin: "🔑 Kirish",
        regHeader: "Ota-ona Profilini Yaratish",
        regSub: "Username va parol tanlang. So'rov adminga yuboriladi.",
        regUsernameLabel: "Telegram Usernamesi / Ism",
        regPasswordLabel: "Parol Tanlang",
        regConfirmPasswordLabel: "Parolni Takrorlang",
        btnSubmitRegister: "📝 Ro'yxatdan O'tish & So'rov Yuborish",
        loginHeader: "Tizimga Kirish",
        loginSub: "Avval ro'yxatdan o'tgan parolingizni kiriting",
        loginUsernameLabel: "Telegram Usernamesi",
        loginPasswordLabel: "Parol",
        btnSubmitLogin: "🚀 Kirish",
        approvalNoticeTitle: "Admin Tasdig'i Kutilmoqda",
        approvalNoticeHeader: "So'rovingiz Administrator Ko'rib Chiqishida",
        approvalNoticeDesc: "Siz hozirda Test / Demo rejimidan foydalanmoqdasiz. Barcha bo'limlar (Radar, AI, e-Maktab) siz uchun ko'rishga ochiq.<br><br>Haqiqiy farzand ma'lumotlarini saqlash va qurilmani ulash administrator ruxsat berganidan so'ng faollashadi.",
        roleParent: "Ota-ona Paneli",
        roleChild: "Farzand Paneli",
        childWelcomeTitle: "Salom, Yosh Qahramon! 🌟",
        childWelcomeSub: "Sening shaxsiy aqlli yordamching va xavfsizlik qalqoning",
        childGoalTitle: "🎯 Tizimning Asosiy Maqsadi Nima?",
        childGoalDesc: "Bu dastur seni nazorat qilish yoki jazolash uchun emas! Asosiy maqsad — darslarda a'lochi bo'lishing, qiyin masalalarni oson yechishing, vaqtingni qiziqarli o'tkazishing va xavfsizligingni ta'minlashda senga eng yaqin aqlli do'st bo'lishdir.",
        childBenefitsTitle: "🌟 Senga Qanday Katta Afzalliklari Bor?",
        childBenefit1Title: "Gemini AI Aqlli Murabbiy",
        childBenefit1Desc: "Tushunarsiz darslik misollarini rasmga olib yubor, u senga oddiy va qiziqarli qilib tushuntirib beradi.",
        childBenefit2Title: "100 Ballik e-Maktab & Rag'bat",
        childBenefit2Desc: "Fanlardan yuqori ball to'plab, ota-onang bilan kelishgan holda maxsus mukofotlar va sayrlar yutib olasan.",
        childBenefit3Title: "Xotirjam Ota-ona",
        childBenefit3Desc: "Maktabdan yoki to'garakdan eson-omon uyga yetganingda ota-onang xavotir olmasligi uchun xarita yordam beradi.",
        childReelsTitle: "🎬 YouTube & Reels Tahlili Qanday Ishlaydi?",
        childPrivacyGuarantee: "Maxfiylik Kafolati:",
        childReelsDesc: "Biz sening shaxsiy yozishmalaringni (chatlaringni) yoki aynan qaysi videoni ko'rganingni tomosha qilmaymiz! Faqat qaysi fanlarga (IT dasturlash, Mantiq, Ilmiy tajribalar, Ingliz tili) qiziqayotganing mavzusi va daqiqalari ota-onang bilan birga yangi ko'nikmalarni rivojlantirishing uchun tahlil qilinadi.",
        childAppsTitle: "📱 Ilovalar Balansi & Ko'rish Qobiliyati",
        childAppsDesc: "Telefon ko'zni charchatmasligi va darslarga xalaqit bermasligi uchun har kungi foydalanish vaqti me'yori saqlanadi. Ilovalardan o'z vaqtida to'g'ri foydalanib, vaqtni unumli rejalashtirishni o'rganasan.",
        childPairingHeader: "Oila Profiliga Ulanish & Rozilik",
        childPairingSub: "Ota-onang bergan 6 xonali Oila Kodini kirit",
        childConsentLabel: "Men yuqoridagi barcha 4 ta qoida bilan tanishdim va ota-onam bilan tizimga ulanishga roziman.",
        childInputCodeLabel: "6 Xonali Oila Kodi (masalan: 849-210):",
        btnChildConnect: "Oila Profiliga Ulanish",
        childPairedSuccess: "🎉 Tabriklaymiz! Siz Oila Profiliga Muvaffaqiyatli Ulandingiz!",
        childPairedSub: "Ota-onangizning Telegram botiga xabar yuborildi.",
        navDashboard: "Asosiy",
        navRadar: "Radar (Bepul)",
        navAi: "AI Murabbiy 💎",
        navSchool: "e-Maktab 💎",
        navSettings: "Sozlamalar",
        backBtn: "← Orqaga",
        nameLabel: "Ism va Familiyasi",
        usernameLabel: "Telegram Usernamesi",
        classLabel: "Sinfi (1-11 Sinf DTS)",
        saveProfileBtn: "💾 Saqlash va Darsliklarni Yangilash",
        freePlanBadge: "Bepul Tarif (Free)",
        freePlanTitle: "Free Basic",
        freePlanDesc: "📍 Jonli Lokatsiya & Radar (100% Bepul), batareya va umumiy ekran vaqti",
        freePrice: "0 so'm",
        foreverFree: "Hozirda bepul",
        freeQualityNotice: "Eslatma: Tizim sifati va serverlar barqarorligini ta'minlash maqsadida kelajakda bepul versiyaga ham juda kam (ramziy) miqdorda to'lov joriy etilishi mumkin.",
        proPlanBadge: "Premium Farzand Nazorati",
        proPlanTitle: "Pro Versiya 💎",
        proPlanDesc: "🧠 Gemini AI Murabbiy (Ovoz/Rasm/Matn), 📚 1-11 Sinf DTS e-Maktab 100 ballik tahlil va 🎬 Reels chuqur tahlili",
        proPrice: "10,000",
        perChildMonth: "so'm / oy (har bir bola uchun)",
        activateProBtn: "💎 Pro Versiyani Faollashtirish",
        activeProBtn: "✅ Pro Faollashtirilgan",
        autoPairTitle: "🔑 Sizning Oila Kodingiz (Avtomatik):",
        familyCodeHint: "Farzand telefonida kiritiladi yoki havolani yuboring",
        pairingInstruction: "Farzand hech qanday admin ishtirokisiz ulanadi:\\n1. Ushbu havolani farzandingizga yuboring:",
        copyPairLinkBtn: "🔗 Ulash Havolasidan Nusxa Olish"
    },
    ru: {
        screenTime: "Экранное Время Сегодня",
        normalStatus: "В норме",
        limitRemain: "Осталось:",
        appRankings: "📱 Рейтинг Использования Приложений",
        autoSynced: "Автоматически",
        liveRadar: "📍 Семейный Онлайн-Радар",
        freeForLife: "Бесплатно",
        voiceRadarBtn: "Голосовой Радар",
        aiTitle: "Gemini AI Наставник по Учёбе и Интересам",
        aiSub: "Голосовые, текстовые и фото-рекомендации",
        aiWelcome: "Здравствуйте! Я AI-помощник, анализирующий успеваемость, интересы и цифровые привычки вашего ребёнка. Загрузите фото задания, задайте вопрос или отправьте голосовое сообщение! 🌟",
        readyForAnalysis: "Готово к анализу",
        chip1: "💡 Повысить интерес к учёбе",
        chip2: "🎬 Анализ Reels и видео",
        chip3: "📱 Анализ экранного времени",
        recordingVoice: "Запись голоса...",
        readyBtn: "Готово",
        interestVectors: "🎯 Векторы Интересов Ребёнка",
        aiAnalysis: "Выводы AI",
        gpaTitle: "Показатель Успеваемости",
        maxScore: "/ 100 баллов",
        periodWeekly: "Неделя",
        periodMonthly: "Месяц",
        periodQuarterly: "Четверть",
        curriculumSub: "Госстандарт образования Узбекистана (DTS)",
        changeGradeBtn: "Изменить класс ✎",
        settingsTitle: "⚙️ Системные Настройки",
        themeSelect: "Выбор Темы и Дизайна",
        themeSub: "10 эксклюзивных эстетических фонов",
        profileTitle: "Данные Ребёнка и Класс",
        profileSub: "Имя, Username и Учебники 1-11 классов",
        langSelect: "Сменить Язык (Til)",
        langSub: "O'zbekcha / Русский",
        plansSelect: "Тарифы и Подписка",
        plansSub: "Free (Локация) / Pro (10 000 сум)",
        pairingSelect: "Подключение Ребёнка и Android App",
        pairingSub: "Код семьи и авто-привязка",
        feedbackTitle: "Предложения и Отзывы",
        feedbackSub: "Отправить отзыв на alhamdulillah@tmail.ton",
        feedbackHeader: "Ваше мнение важно для нас!",
        feedbackDesc: "Отправьте свои предложения по улучшению программы, новым предметам или удобствам напрямую разработчикам.",
        feedbackEmailLabel: "Официальная почта для приёма:",
        openGmailBtn: "Написать через Gmail",
        openDefaultMailBtn: "Другой почтовый клиент",
        demoModeTitle: "Тестовый / Демо-Режим",
        demoModeSub: "Добавление детей откроется после одобрения админом",
        loginRegisterBtn: "🔑 Вход / Регистрация",
        authSettingsTitle: "Аккаунт Родителя и Вход",
        authSettingsSub: "Статус: В Демо-Режиме",
        authModalTitle: "Аккаунт Родителя",
        tabRegister: "📝 Регистрация",
        tabLogin: "🔑 Вход",
        regHeader: "Создание Профиля Родителя",
        regSub: "Выберите логин и пароль. Запрос отправится админу.",
        regUsernameLabel: "Telegram Username / Имя",
        regPasswordLabel: "Выберите Пароль",
        regConfirmPasswordLabel: "Повторите Пароль",
        btnSubmitRegister: "📝 Зарегистрироваться и Отправить Запрос",
        loginHeader: "Вход в Систему",
        loginSub: "Введите ваш ранее созданный пароль",
        loginUsernameLabel: "Telegram Username",
        loginPasswordLabel: "Пароль",
        btnSubmitLogin: "🚀 Войти",
        approvalNoticeTitle: "Ожидание Одобрения Админом",
        approvalNoticeHeader: "Ваш Запрос на Рассмотрении Администратора",
        approvalNoticeDesc: "Сейчас вы находитесь в Тестовом / Демо-режиме. Все разделы (Радар, AI, e-Maktab) открыты для ознакомления.<br><br>Сохранение реальных данных детей и привязка устройств активируются после одобрения администратором.",
        roleParent: "Панель Родителя",
        roleChild: "Панель Ребёнка",
        childWelcomeTitle: "Привет, Юный Герой! 🌟",
        childWelcomeSub: "Твой умный помощник по учёбе и щит безопасности",
        childGoalTitle: "🎯 Какова Главная Цель Системы?",
        childGoalDesc: "Это приложение создано не для наказаний или слежки! Главная цель — помочь тебе учиться на отлично, легко решать сложные задачи, полезно проводить время и быть в безопасности.",
        childBenefitsTitle: "🌟 Какие Супер-Возможности Ты Получаешь?",
        childBenefit1Title: "Умный Наставник Gemini AI",
        childBenefit1Desc: "Сфотографируй сложный пример из учебника, и AI объяснит решение просто и понятно.",
        childBenefit2Title: "100-Балльный e-Maktab и Награды",
        childBenefit2Desc: "Получай высокие баллы по предметам и выигрывай классные призы и прогулки от родителей.",
        childBenefit3Title: "Спокойствие Родителей",
        childBenefit3Desc: "Родители не волнуются, видя, что ты благополучно добрался до школы или секции.",
        childReelsTitle: "🎬 Как Работает Анализ YouTube и Reels?",
        childPrivacyGuarantee: "Гарантия Приватности:",
        childReelsDesc: "Мы НЕ читаем твои личные переписки (чаты) и не смотрим твои видео! Анализируются только темы интересов (IT-программирование, Логика, Наука, Английский) и время для твоего развития.",
        childAppsTitle: "📱 Баланс Приложений и Здоровье Глаз",
        childAppsDesc: "Норма экранного времени помогает беречь зрение и не отвлекаться от уроков, распределяя время с пользой.",
        childPairingHeader: "Подключение к Семье с Согласием",
        childPairingSub: "Введите 6-значный семейный код от родителей",
        childConsentLabel: "Я ознакомился со всеми 4 правилами и согласен на подключение к родительскому профилю.",
        childInputCodeLabel: "6-значный Код Семьи (например: 849-210):",
        btnChildConnect: "Подключиться к Семье",
        childPairedSuccess: "🎉 Поздравляем! Вы успешно подключены к семейному профилю!",
        childPairedSub: "Уведомление отправлено родителям в Telegram-бот.",
        navDashboard: "Главная",
        navRadar: "Радар (Free)",
        navAi: "AI Наставник 💎",
        navSchool: "e-Maktab 💎",
        navSettings: "Настройки",
        backBtn: "← Назад",
        nameLabel: "Имя и Фамилия",
        usernameLabel: "Telegram Username",
        classLabel: "Класс (1-11 Классы DTS)",
        saveProfileBtn: "💾 Сохранить и Обновить Учебники",
        freePlanBadge: "Бесплатный Тариф",
        freePlanTitle: "Free Basic",
        freePlanDesc: "📍 Онлайн-Локация и Радар (100% Бесплатно), батарея и общее экранное время",
        freePrice: "0 сум",
        foreverFree: "Сейчас бесплатно",
        freeQualityNotice: "Примечание: В целях повышения качества и стабильности серверов в будущем для бесплатной версии также может быть введена минимальная символическая плата.",
        proPlanBadge: "Премиум Контроль",
        proPlanTitle: "Pro Версия 💎",
        proPlanDesc: "🧠 Gemini AI Наставник (Голос/Фото/Текст), 📚 1-11 классы DTS e-Maktab анализ 100 баллов и 🎬 Анализ Reels",
        proPrice: "10,000",
        perChildMonth: "сум / месяц (за каждого ребёнка)",
        activateProBtn: "💎 Активировать Pro Версию",
        activeProBtn: "✅ Pro Активирован",
        autoPairTitle: "🔑 Ваш Семейный Код (Автоматический):",
        familyCodeHint: "Введите на телефоне ребёнка или отправьте ссылку",
        pairingInstruction: "Ребёнок подключается без участия администратора:\\n1. Отправьте эту ссылку ребёнку:",
        copyPairLinkBtn: "🔗 Скопировать Ссылку Подключения"
    }
};

// 3. KO'P FARZANDLIK TIZIMI MA'LUMOTLARI
let childrenDatabase = {
    "child_1": {
        name: "Aliyor Valijonov",
        name_ru: "Алиёр Валиджонов",
        username: "@aliyor_v",
        grade: 5,
        battery: 84,
        screenTime: "3s 45d",
        screenTime_ru: "3ч 45м",
        remaining: "1s 15d",
        remaining_ru: "1ч 15м",
        location: {
            lat: 41.3145,
            lng: 69.2812,
            address: "Yunusobod 4-mavze, 24-maktab",
            address_ru: "Юнусабад 4-й квартал, 24-я школа",
            geofences: [
                { name: "🏠 Uy / Дом (Yunusobod)", status: "Tashqarisida / Снаружи", color: "text-slate-400" },
                { name: "🏫 24-Maktab / 24-Школа", status: "Ichida (Faol) / Внутри (Активен)", color: "text-emerald-400" }
            ]
        },
        apps: [
            { name: "YouTube", time: "1s 20d", percent: 35, category: "Ta'lim / Video", category_ru: "Видео / Обучение", color: "bg-red-500", icon: "▶️" },
            { name: "Instagram (Reels)", time: "55d", percent: 24, category: "Ijtimoiy Tarmoq", category_ru: "Соцсеть", color: "bg-pink-500", icon: "📸" },
            { name: "Telegram", time: "45d", percent: 20, category: "Muloqot", category_ru: "Общение", color: "bg-sky-500", icon: "💬" },
            { name: "Duolingo", time: "30d", percent: 13, category: "Til O'rganish", category_ru: "Изучение языков", color: "bg-emerald-500", icon: "🦉" },
            { name: "PUBG Mobile", time: "15d", percent: 8, category: "O'yin", category_ru: "Игры", color: "bg-amber-500", icon: "🎮" }
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
                { topic: "Английская речь и общение", percent: 65, color: "bg-purple-500" }
            ]
        }
    },
    "child_2": {
        name: "Madina Valijonova",
        name_ru: "Мадина Валиджонова",
        username: "@madina_v",
        grade: 3,
        battery: 92,
        screenTime: "2s 10d",
        screenTime_ru: "2ч 10м",
        remaining: "50d",
        remaining_ru: "50м",
        location: {
            lat: 41.3110,
            lng: 69.2797,
            address: "Mirzo Ulug'bek, San'at Maktabi",
            address_ru: "Мирзо Улугбек, Школа искусств",
            geofences: [
                { name: "🏠 Uy / Дом", status: "Tashqarisida / Снаружи", color: "text-slate-400" },
                { name: "🎨 San'at Maktabi / Школа искусств", status: "Ichida / Внутри", color: "text-emerald-400" }
            ]
        },
        apps: [
            { name: "YouTube Kids", time: "1s 10d", percent: 54, category: "Multfilm / Ta'lim", category_ru: "Мультфильмы", color: "bg-amber-500", icon: "🧸" },
            { name: "Picsart", time: "40d", percent: 30, category: "San'at va Ijod", category_ru: "Творчество", color: "bg-purple-500", icon: "🎨" },
            { name: "Telegram", time: "20d", percent: 16, category: "Oila guruhi", category_ru: "Семейная группа", color: "bg-sky-500", icon: "💬" }
        ],
        interests: {
            uz: [
                { topic: "Tasviriy San'at va Rassomlik", percent: 92, color: "bg-pink-500" },
                { topic: "Ertaklar va O'qish", percent: 80, color: "bg-emerald-500" }
            ],
            ru: [
                { topic: "Изобразительное искусство", percent: 92, color: "bg-pink-500" },
                { topic: "Сказки и Чтение", percent: 80, color: "bg-emerald-500" }
            ]
        }
    },
    "child_3": {
        name: "Temur Valijonov",
        name_ru: "Темур Валиджонов",
        username: "@temur_v",
        grade: 9,
        battery: 76,
        screenTime: "4s 15d",
        screenTime_ru: "4ч 15м",
        remaining: "45d",
        remaining_ru: "45м",
        location: {
            lat: 41.3200,
            lng: 69.2850,
            address: "Shayxontohur, O'quv Markazi",
            address_ru: "Шайхантахур, Учебный центр",
            geofences: [
                { name: "🏠 Uy / Дом", status: "Tashqarisida / Снаружи", color: "text-slate-400" },
                { name: "💻 IT Markazi / IT Центр", status: "Ichida / Внутри", color: "text-emerald-400" }
            ]
        },
        apps: [
            { name: "VS Code / GitHub", time: "2s 10d", percent: 51, category: "Dasturlash", category_ru: "Разработка", color: "bg-sky-500", icon: "💻" },
            { name: "Telegram", time: "1s 15d", percent: 30, category: "Guruhlar", category_ru: "Группы", color: "bg-sky-500", icon: "💬" },
            { name: "YouTube", time: "50d", percent: 19, category: "Darsliklar", category_ru: "Уроки", color: "bg-red-500", icon: "▶️" }
        ],
        interests: {
            uz: [
                { topic: "Frontend & Backend Development", percent: 94, color: "bg-emerald-500" },
                { topic: "Matematika va Algoritmlar", percent: 88, color: "bg-sky-500" }
            ],
            ru: [
                { topic: "Frontend & Backend разработка", percent: 94, color: "bg-emerald-500" },
                { topic: "Математика и Алгоритмы", percent: 88, color: "bg-sky-500" }
            ]
        }
    }
};

let currentChildKey = "child_1";
let currentLang = new URLSearchParams(window.location.search).get('lang') || localStorage.getItem('app_lang') || 'uz';
let currentTheme = localStorage.getItem('app_theme') || 'default';
let userPlan = localStorage.getItem('user_plan') || 'pro'; // 'free' or 'pro'
let activeSchoolPeriod = 'weekly';
let isRecordingVoice = false;
let uploadedImageBase64 = null;
let familyCode = "849-210";
let currentAppRole = localStorage.getItem('app_role') || 'parent'; // 'parent' or 'child'

// Ota-ona autentifikatsiyasi va admin tasdiq holati
let currentAuthUser = JSON.parse(localStorage.getItem('auth_user') || 'null');
let authStatus = localStorage.getItem('auth_status') || (currentAuthUser ? currentAuthUser.status : 'guest_demo'); // 'guest_demo', 'pending', 'approved'

let mapInstance = null;
let childMarker = null;
let parentMarker = null;

// Telegram WebApp Setup
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    if (tg.initDataUnsafe?.user?.username && !currentAuthUser) {
        currentAuthUser = {
            username: \`@\${tg.initDataUnsafe.user.username}\`,
            name: \`\${tg.initDataUnsafe.user.first_name || ''} \${tg.initDataUnsafe.user.last_name || ''}\`.trim(),
            status: 'approved'
        };
        authStatus = 'approved';
        localStorage.setItem('auth_user', JSON.stringify(currentAuthUser));
        localStorage.setItem('auth_status', authStatus);
    }
}

// ============================================================================
// 4. ROL TANLASH (OTA-ONA VA FARZAND REJIMLARI)
// ============================================================================
function switchAppRole(role) {
    currentAppRole = role;
    localStorage.setItem('app_role', role);

    const isParent = (role === 'parent');
    const roleBtnParent = document.getElementById('roleBtnParent');
    const roleBtnChild = document.getElementById('roleBtnChild');
    const parentHeader = document.getElementById('mainParentHeader');
    const authBanner = document.getElementById('authStatusBanner');
    const childPortal = document.getElementById('tab-child-portal');
    const bottomNav = document.querySelector('.bottom-nav');

    if (roleBtnParent) {
        roleBtnParent.className = isParent
            ? "flex-1 py-1.5 px-2 rounded-xl text-xs font-bold text-white bg-emerald-500 shadow-md transition flex items-center justify-center gap-1.5"
            : "flex-1 py-1.5 px-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5";
    }

    if (roleBtnChild) {
        roleBtnChild.className = !isParent
            ? "flex-1 py-1.5 px-2 rounded-xl text-xs font-bold text-white bg-indigo-500 shadow-md transition flex items-center justify-center gap-1.5"
            : "flex-1 py-1.5 px-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5";
    }

    if (isParent) {
        if (childPortal) childPortal.classList.add('hidden');
        if (parentHeader) parentHeader.classList.remove('hidden');
        if (authBanner) authBanner.classList.remove('hidden');
        if (bottomNav) bottomNav.style.display = 'flex';
        switchTab('tab-dashboard');
    } else {
        // Barcha ota-ona tablarini berkitib, Farzand Portalini faollashtirish
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        if (childPortal) {
            childPortal.classList.remove('hidden');
            childPortal.classList.add('active');
        }
        if (parentHeader) parentHeader.classList.add('hidden');
        if (authBanner) authBanner.classList.add('hidden');
        if (bottomNav) bottomNav.style.display = 'none';
    }
}

function handleChildPairingSubmit() {
    const consent = document.getElementById('childConsentCheckbox')?.checked;
    const codeInput = document.getElementById('childFamilyCodeInput')?.value.trim();
    const errorBox = document.getElementById('childPairErrorMsg');
    const successBox = document.getElementById('childPairedSuccessBox');

    if (!consent) {
        if (errorBox) {
            errorBox.innerText = (currentLang === 'ru') 
                ? "⚠️ Пожалуйста, подтвердите согласие с правилами (отметьте галочку)!" 
                : "⚠️ Iltimos, barcha qoidalar bilan tanishib, rozilik belgisini qo'ying!";
            errorBox.classList.remove('hidden');
        }
        return;
    }

    if (!codeInput || codeInput.length < 5) {
        if (errorBox) {
            errorBox.innerText = (currentLang === 'ru') 
                ? "⚠️ Введите корректный 6-значный семейный код (например: 849-210)!" 
                : "⚠️ Ota-onangiz bergan to'g'ri 6 xonali oila kodini kiriting (masalan: 849-210)!";
            errorBox.classList.remove('hidden');
        }
        return;
    }

    if (errorBox) errorBox.classList.add('hidden');

    // Supabase botiga farzand muvaffaqiyatli ulanganligi haqida xabar yuborish
    try {
        fetch('https://wfrclcwjeeqeqchmdhzw.supabase.co/functions/v1/ota-ona-bot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'child_paired_event',
                familyCode: codeInput,
                childName: childrenDatabase[currentChildKey]?.name || "Aliyor Valijonov",
                timestamp: new Date().toISOString()
            })
        }).catch(e => console.log('Child paired notification dispatched'));
    } catch(e) {}

    if (successBox) successBox.classList.remove('hidden');
    localStorage.setItem('child_paired', 'true');
    localStorage.setItem('child_family_code', codeInput);

    alert(currentLang === 'ru' 
        ? "🎉 Отлично! Вы успешно подключились к семье. Оповещение отправлено родителям!" 
        : "🎉 Ajoyib! Siz oila profiliga muvaffaqiyatli ulandingiz. Ota-onangizga xabar yuborildi!");
}

// ============================================================================
// 5. AUTHENTICATION (KIRISH VA REGISTRATSIYA)
// ============================================================================
function switchAuthTab(tab) {
    const isRegister = (tab === 'register');
    const tabReg = document.getElementById('tabBtnRegister');
    const tabLog = document.getElementById('tabBtnLogin');
    if (tabReg) {
        tabReg.className = isRegister 
            ? "flex-1 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-500 shadow transition" 
            : "flex-1 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition";
    }
    if (tabLog) {
        tabLog.className = !isRegister 
            ? "flex-1 py-1.5 rounded-lg text-xs font-bold text-white bg-sky-500 shadow transition" 
            : "flex-1 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition";
    }
    
    const formReg = document.getElementById('formRegister');
    const formLog = document.getElementById('formLogin');
    if (formReg) formReg.classList.toggle('hidden', !isRegister);
    if (formLog) formLog.classList.toggle('hidden', isRegister);
    
    const authErr = document.getElementById('authErrorMsg');
    const loginErr = document.getElementById('loginErrorMsg');
    if (authErr) authErr.classList.add('hidden');
    if (loginErr) loginErr.classList.add('hidden');
}

function handleParentRegister() {
    const usernameInput = document.getElementById('regUsername');
    const passwordInput = document.getElementById('regPassword');
    const confirmInput = document.getElementById('regConfirmPassword');
    const errorBox = document.getElementById('authErrorMsg');

    const username = usernameInput ? usernameInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";
    const confirmPassword = confirmInput ? confirmInput.value.trim() : "";

    if (!username || !password || !confirmPassword) {
        if (errorBox) {
            errorBox.innerText = (currentLang === 'ru') 
                ? "⚠️ Заполните все поля!" 
                : "⚠️ Barcha maydonlarni to'ldiring!";
            errorBox.classList.remove('hidden');
        }
        return;
    }

    if (password !== confirmPassword) {
        if (errorBox) {
            errorBox.innerText = (currentLang === 'ru') 
                ? "⚠️ Пароли не совпадают! Введите одинаковые пароли." 
                : "⚠️ Parollar mos kelmadi! Iltimos, bir xil parol kiriting.";
            errorBox.classList.remove('hidden');
        }
        return;
    }

    if (password.length < 4) {
        if (errorBox) {
            errorBox.innerText = (currentLang === 'ru') 
                ? "⚠️ Пароль должен содержать минимум 4 символа!" 
                : "⚠️ Parol kamida 4 ta belgidan iborat bo'lishi kerak!";
            errorBox.classList.remove('hidden');
        }
        return;
    }

    if (errorBox) errorBox.classList.add('hidden');

    const formattedUsername = username.startsWith('@') ? username : \`@\${username}\`;
    currentAuthUser = {
        username: formattedUsername,
        password: password,
        status: 'pending',
        registeredAt: new Date().toISOString()
    };
    authStatus = 'pending';
    localStorage.setItem('auth_user', JSON.stringify(currentAuthUser));
    localStorage.setItem('auth_status', authStatus);

    // Supabase orqali adminga xabar yuborish
    try {
        fetch('https://wfrclcwjeeqeqchmdhzw.supabase.co/functions/v1/ota-ona-bot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'parent_registration_request',
                username: formattedUsername,
                familyCode: familyCode,
                timestamp: new Date().toISOString()
            })
        }).catch(err => console.log('Admin notification sent'));
    } catch(e) {}

    updateAuthUI();
    closeSubpage();
    openSubpage('modal-approval-notice');
}

function handleParentLogin() {
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    const errorBox = document.getElementById('loginErrorMsg');

    const username = usernameInput ? usernameInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value.trim() : "";

    if (!username || !password) {
        if (errorBox) {
            errorBox.innerText = (currentLang === 'ru') ? "⚠️ Введите логин и пароль!" : "⚠️ Username va parolni kiriting!";
            errorBox.classList.remove('hidden');
        }
        return;
    }

    const formattedUsername = username.startsWith('@') ? username : \`@\${username}\`;
    currentAuthUser = {
        username: formattedUsername,
        password: password,
        status: 'approved'
    };
    authStatus = 'approved';
    localStorage.setItem('auth_user', JSON.stringify(currentAuthUser));
    localStorage.setItem('auth_status', authStatus);

    if (errorBox) errorBox.classList.add('hidden');
    closeSubpage();
    updateAuthUI();
    alert(currentLang === 'ru' ? "✅ Успешный вход в аккаунт!" : "✅ Tizimga muvaffaqiyatli kirdingiz!");
}

function updateAuthUI() {
    const banner = document.getElementById('authStatusBanner');
    const bannerIcon = document.getElementById('authBannerIcon');
    const bannerTitle = document.getElementById('authBannerTitle');
    const bannerSub = document.getElementById('authBannerSub');
    const bannerBtn = document.getElementById('authBannerBtn');
    const settingsUsername = document.getElementById('settingsAuthUsername');
    const settingsStatus = document.getElementById('settingsAuthStatus');
    const isRu = (currentLang === 'ru');

    if (authStatus === 'approved') {
        if (banner) {
            banner.className = "p-2.5 mb-3 rounded-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 flex items-center justify-between";
            if (bannerIcon) bannerIcon.innerText = "✅";
            if (bannerTitle) bannerTitle.innerText = isRu ? \`\${currentAuthUser?.username || 'Родитель'} (Одобрен)\` : \`\${currentAuthUser?.username || 'Ota-ona'} (Tasdiqlangan)\`;
            if (bannerSub) bannerSub.innerText = isRu ? "Полный доступ активен" : "To'liq kirish faol";
            if (bannerBtn) {
                bannerBtn.className = "px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30";
                bannerBtn.innerText = isRu ? "Профиль" : "Profil";
            }
        }
        if (settingsUsername) settingsUsername.innerText = currentAuthUser?.username || (isRu ? "Аккаунт Родителя" : "Ota-ona Hisobi");
        if (settingsStatus) {
            settingsStatus.className = "text-[10px] text-emerald-400";
            settingsStatus.innerText = isRu ? "Статус: Одобрен (Активен)" : "Holat: Tasdiqlangan (Faol)";
        }
    } else if (authStatus === 'pending') {
        if (banner) {
            banner.className = "p-2.5 mb-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-yellow-500/15 border border-amber-500/30 flex items-center justify-between";
            if (bannerIcon) bannerIcon.innerText = "⏳";
            if (bannerTitle) bannerTitle.innerText = isRu ? \`\${currentAuthUser?.username || 'Запрос'} (На рассмотрении)\` : \`\${currentAuthUser?.username || 'So\\'rov'} (Tasdiq kutilmoqda)\`;
            if (bannerSub) bannerSub.innerText = isRu ? "Тестовый режим. Ждём ответа админа" : "Test rejimi. Admin tasdig'i kutilmoqda";
            if (bannerBtn) {
                bannerBtn.className = "px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] shadow-sm";
                bannerBtn.innerText = isRu ? "Статус" : "Holat";
            }
        }
        if (settingsUsername) settingsUsername.innerText = currentAuthUser?.username || (isRu ? "Аккаунт Родителя" : "Ota-ona Hisobi");
        if (settingsStatus) {
            settingsStatus.className = "text-[10px] text-amber-400";
            settingsStatus.innerText = isRu ? "Статус: Ожидание админа" : "Holat: Tasdiq kutilmoqda";
        }
    } else {
        // guest_demo
        if (banner) {
            banner.className = "p-2.5 mb-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 flex items-center justify-between";
            if (bannerIcon) bannerIcon.innerText = "🧪";
            if (bannerTitle) bannerTitle.innerText = isRu ? "Тестовый / Демо-Режим" : "Test / Demo Rejimi";
            if (bannerSub) bannerSub.innerText = isRu ? "Добавление детей откроется после одобрения админом" : "Admin tasdig'i bilan farzand qo'shish ochiladi";
            if (bannerBtn) {
                bannerBtn.className = "px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] shadow-sm";
                bannerBtn.innerText = isRu ? "🔑 Вход / Регистрация" : "🔑 Kirish / Ro'yxat";
            }
        }
        if (settingsUsername) settingsUsername.innerText = isRu ? "Аккаунт Родителя и Вход" : "Ota-ona Hisobi & Kirish";
        if (settingsStatus) {
            settingsStatus.className = "text-[10px] text-amber-400";
            settingsStatus.innerText = isRu ? "Статус: В Демо-Режиме" : "Holat: Test Rejimida (Kirish)";
        }
    }
}

// ============================================================================
// 4. TILNI YANGILASH (I18N TRANSLATION ENGINE)
// ============================================================================
function applyLanguageTranslations() {
    const dict = I18N[currentLang] || I18N.uz;
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.innerText = dict[key];
        }
    });

    const aiBubble = document.getElementById('aiWelcomeBubble');
    if (aiBubble) aiBubble.innerText = dict.aiWelcome;

    document.getElementById('langCheckUz').classList.toggle('hidden', currentLang !== 'uz');
    document.getElementById('langCheckRu').classList.toggle('hidden', currentLang !== 'ru');

    // Update Plan Badge
    updatePlanBadge();
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('app_lang', lang);
    applyLanguageTranslations();
    renderActiveChild();
    renderSchoolCurriculum();
    closeSubpage();
}

function updatePlanBadge() {
    const badge = document.getElementById('headerPlanBadge');
    const toggleBtn = document.getElementById('btnPlanToggle');
    const dict = I18N[currentLang] || I18N.uz;

    if (userPlan === 'pro') {
        badge.className = "px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold";
        badge.innerText = "💎 Pro";
        if (toggleBtn) toggleBtn.innerText = dict.activeProBtn;
    } else {
        badge.className = "px-2 py-1 rounded-full bg-slate-700/60 border border-slate-600 text-slate-300 text-[10px] font-bold";
        badge.innerText = "Free";
        if (toggleBtn) toggleBtn.innerText = dict.activateProBtn;
    }
}

function togglePlanUpgrade() {
    userPlan = (userPlan === 'free') ? 'pro' : 'free';
    localStorage.setItem('user_plan', userPlan);
    updatePlanBadge();
    const msg = (currentLang === 'ru') 
        ? \`Тариф переключен на: \${userPlan.toUpperCase()}\`
        : \`Tarif o'zgartirildi: \${userPlan.toUpperCase()}\`;
    alert(msg);
}

// ============================================================================
// 5. 100-BALLIK E-MAKTAB BAHOLARI GENERATORI & KO'RSATISH
// ============================================================================
function getSubjectScore(subjectName, gradeNum, period) {
    let hash = 0;
    const key = subjectName + gradeNum + period + currentChildKey;
    for (let i = 0; i < key.length; i++) {
        hash = (hash << 5) - hash + key.charCodeAt(i);
        hash |= 0;
    }
    const baseScore = 75 + Math.abs(hash % 24);
    return Math.min(100, Math.max(60, baseScore));
}

function renderSchoolCurriculum() {
    const child = childrenDatabase[currentChildKey];
    const grade = child.grade || 5;
    const langDict = CURRICULUM_DATABASE[currentLang] || CURRICULUM_DATABASE.uz;
    const subjects = langDict[grade] || langDict[5];
    
    const titleText = (currentLang === 'ru')
        ? \`📚 Учебники и Оценки \${grade}-го Класса\`
        : \`📚 \${grade}-Sinf Davlat Darsliklari & Baholari\`;
    document.getElementById('curriculumClassTitle').innerText = titleText;
    document.getElementById('childClassBadge').innerText = \`\${grade}-\${currentLang === 'ru' ? 'класс DTS' : 'sinf DTS'}\`;

    let totalScore = 0;
    const listContainer = document.getElementById('subjectsGradeList');

    listContainer.innerHTML = subjects.map((subject, index) => {
        const score = getSubjectScore(subject, grade, activeSchoolPeriod);
        totalScore += score;

        let badgeColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
        let statusLabel = currentLang === 'ru' ? "Отлично" : "A'lo";
        if (score < 71) {
            badgeColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
            statusLabel = currentLang === 'ru' ? "Удовл." : "Qoniqarli";
        } else if (score < 86) {
            badgeColor = "text-sky-400 bg-sky-500/10 border-sky-500/30";
            statusLabel = currentLang === 'ru' ? "Хорошо" : "Yaxshi";
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
        uz: {
            'weekly': 'Haftalik baholash (Oxirgi 7 kun)',
            'monthly': 'Oylik umumiy ko\\'rsatkich',
            'quarterly': 'I-Chorak yakuniy baholari'
        },
        ru: {
            'weekly': 'Оценка за неделю (последние 7 дней)',
            'monthly': 'Ежемесячный сводный показатель',
            'quarterly': 'Итоговые оценки за I-четверть'
        }
    };
    document.getElementById('activePeriodLabel').innerText = (periodNames[currentLang] || periodNames.uz)[activeSchoolPeriod];

    let overallLabel = currentLang === 'ru' ? "Отлично (Топ 5%)" : "A'lo (Top 5%)";
    if (overallAvg < 71) overallLabel = currentLang === 'ru' ? "Средний уровень" : "O'rtacha daraja";
    else if (overallAvg < 86) overallLabel = currentLang === 'ru' ? "Хороший результат" : "Yaxshi (Ijobiy)";
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
// 6. FARZAND PROFILI VA AVTO-JUFTLASH
// ============================================================================
function openChildProfileModal() {
    const child = childrenDatabase[currentChildKey];
    document.getElementById('profileFullName').value = (currentLang === 'ru') ? (child.name_ru || child.name) : child.name;
    document.getElementById('profileUsername').value = child.username;
    document.getElementById('profileClassSelect').value = child.grade || 5;
    openSubpage('modal-child-profile');
}

function saveChildProfile() {
    if (authStatus !== 'approved') {
        openSubpage('modal-approval-notice');
        return;
    }

    const fullName = document.getElementById('profileFullName').value.trim() || "Farzand";
    const username = document.getElementById('profileUsername').value.trim() || "@farzand";
    const grade = parseInt(document.getElementById('profileClassSelect').value) || 5;

    childrenDatabase[currentChildKey].name = fullName;
    childrenDatabase[currentChildKey].username = username;
    childrenDatabase[currentChildKey].grade = grade;

    const select = document.getElementById('childSelector');
    if (select.querySelector(\`option[value="\${currentChildKey}"]\`)) {
        select.querySelector(\`option[value="\${currentChildKey}"]\`).innerText = \`\${fullName} (\${grade}-\${currentLang === 'ru' ? 'класс' : 'sinf'})\`;
    }

    renderActiveChild();
    renderSchoolCurriculum();
    closeSubpage();

    const alertMsg = (currentLang === 'ru')
        ? \`✅ Данные ребёнка сохранены!\\nУчебники \${grade}-го класса и шкала 100 баллов установлены.\`
        : \`✅ Farzand ma'lumotlari saqlandi!\\n\${grade}-sinf Davlat darsliklari va 100 ballik baholar o'rnatildi.\`;
    alert(alertMsg);
}

function switchChild(childKey) {
    currentChildKey = childKey;
    renderActiveChild();
    renderSchoolCurriculum();
    if (mapInstance) updateMapCoordinates();
}

function renderActiveChild() {
    const child = childrenDatabase[currentChildKey];
    const isRu = (currentLang === 'ru');

    document.getElementById('totalScreenTime').innerText = isRu ? child.screenTime_ru : child.screenTime;
    document.getElementById('batteryBadge').innerText = \`\${child.battery}%\`;
    document.getElementById('remainingTime').innerText = isRu ? child.remaining_ru : child.remaining;
    document.getElementById('childSelector').value = currentChildKey;
    document.getElementById('displayFamilyCode').innerText = familyCode;

    // Ilovalar Reytingi
    const appList = document.getElementById('appUsageList');
    if (appList) {
        appList.innerHTML = child.apps.map(app => \`
            <div class="space-y-1">
                <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2">
                        <span class="text-sm">\${app.icon}</span>
                        <span class="font-bold text-white">\${app.name}</span>
                        <span class="text-[10px] text-slate-400 bg-slate-800/60 px-1.5 py-0.2 rounded">\${isRu ? app.category_ru : app.category}</span>
                    </div>
                    <span class="font-mono text-slate-300">\${app.time} <b class="text-emerald-400">(\${app.percent}%)</b></span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill \${app.color}" style="width: \${app.percent}%;"></div>
                </div>
            </div>
        \`).join('');
    }

    // Geofences (Barcha uchun bepul)
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
        const interests = isRu ? child.interests.ru : child.interests.uz;
        interestList.innerHTML = interests.map(i => \`
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

    document.getElementById('radarAddress').innerText = isRu ? child.location.address_ru : child.location.address;
}

// ============================================================================
// 7. AI CHAT, OVOZ VA REELS TAHLILI (GEMINI AI)
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
    const headerTitle = (currentLang === 'ru') ? "🧠 Gemini AI Наставник:" : "🧠 Gemini AI Murabbiy:";
    msgDiv.innerHTML = \`<span class="text-purple-400 font-bold text-[10px] block mb-1">\${headerTitle}</span>\` + text;
    thread.appendChild(msgDiv);
    thread.scrollTop = thread.scrollHeight;
}

function sendTextMessage() {
    const input = document.getElementById('aiTextInput');
    const text = input.value.trim();
    if (!text && !uploadedImageBase64) return;

    const defaultImgText = (currentLang === 'ru') ? "📷 Отправлено фото для анализа" : "📷 Rasm tahlili uchun yuborildi";
    appendUserMessage(text || defaultImgText, uploadedImageBase64);
    input.value = "";
    
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
    const isRu = (currentLang === 'ru');
    let responseText = "";

    if (imageBase64) {
        if (isRu) {
            responseText = \`
                <b>📷 Вывод по анализу задания:</b><br>
                Загруженное фото школьного задания проанализировано. Рекомендация для <b>\${child.name_ru || child.name} (\${child.grade}-класс)</b>:<br>
                • <b>Правило:</b> Закрепите теоретическое понятие на практических примерах в течение 10 минут.<br>
                • <b>Закрепление:</b> Решите 2-3 упражнения самостоятельно и проверьте балл в e-Maktab! 🌟
            \`;
        } else {
            responseText = \`
                <b>📷 Vazifa / Rasm Tahlili Xulosasi:</b><br>
                Yuklangan darslik topshirig'i tahlil qilindi. <b>\${child.name} (\${child.grade}-sinf)</b> uchun ushbu darslik mavzusini o'zlashtirish bo'yicha yo'riqnoma:<br>
                • <b>Asosiy qoida:</b> Mavzuning nazariy tushunchasini 10 daqiqa amaliy misollar orqali ko'rib chiqing.<br>
                • <b>Mustahkamlash:</b> Darslikdagi 2-3 ta topshiriqni mustaqil yechishga yo'naltiring va 100 ballik e-Maktab ko'rsatkichini qayd eting! 🌟
            \`;
        }
    } else if (qLower.includes("reels") || qLower.includes("short") || qLower.includes("video") || qLower.includes("insta") || qLower.includes("youtube") || qLower.includes("видео")) {
        if (isRu) {
            responseText = \`
                <b>🎬 Анализ просмотренных Reels и видео:</b><br>
                Точные данные по видеоконтенту для <b>\${child.name_ru || child.name} (\${child.grade}-класс)</b>:<br><br>
                📊 <b>Распределение по темам:</b><br>
                • <b>💻 Образование и IT (Python, Робототехника, Языки):</b> 45% (Полезно)<br>
                • <b>🔬 Научные опыты и Логические задачи:</b> 25% (Положительно)<br>
                • <b>🎮 Развлечения и Игры:</b> 30% (В норме)<br><br>
                💡 <b>Рекомендация:</b> Чтобы алгоритм чаще рекомендовал обучающие видео, подпишитесь на полезные каналы по школьным предметам.
            \`;
        } else {
            responseText = \`
                <b>🎬 Ko'rilayotgan Reels va Video Kontent Tahlili:</b><br>
                Farzandingiz <b>\${child.name} (\${child.grade}-sinf)</b> tomosha qilayotgan Reels / Shorts videolari bo'yicha aniq ma'lumotlar:<br><br>
                📊 <b>Mavzular taqsimoti:</b><br>
                • <b>💻 Ta'limiy & IT (Python, Robototexnika, Ingliz tili):</b> 45% (Foydali va rivojlantiruvchi)<br>
                • <b>🔬 Ilmiy tajribalar & Mantiqiy jumboqlar:</b> 25% (Ijobiy tendensiya)<br>
                • <b>🎮 Ko'ngilochar va o'yin strimlari:</b> 30% (Me'yorida)<br><br>
                💡 <b>Tavsiya:</b> Algoritm ko'proq ta'limiy videolarni tavsiya qilishi uchun fanlar bo'yicha foydali kanallarga obuna bo'lishni yo'lga qo'ying.
            \`;
        }
    } else if (qLower.includes("qiziqish") || qLower.includes("fan") || qLower.includes("dars") || qLower.includes("учеб") || qLower.includes("интерес")) {
        if (isRu) {
            responseText = \`
                <b>📚 Усвоение предметов и повышение интереса:</b><br>
                Методы закрепления школьных предметов госстандарта (DTS) для <b>\${child.name_ru || child.name} (\${child.grade}-класс)</b>:<br>
                • <b>Практический подход:</b> Изучение математики и естественных наук через графические примеры и опыты гораздо эффективнее.<br>
                • <b>Аналитика:</b> Совместно просматривайте показатели 100 баллов в разделе e-Maktab.
            \`;
        } else {
            responseText = \`
                <b>📚 Darslarni O'zlashtirish va Qiziqishni Oshirish:</b><br>
                <b>\${child.name} (\${child.grade}-sinf)</b> uchun Davlat ta'lim standarti fanlarini mustahkamlash usullari:<br>
                • <b>Amaliy yondashuv:</b> Matematika va tabiiy fanlarni grafik misollar va tajribalar orqali o'rganish samaraliroq.<br>
                • <b>Haftalik tahlil:</b> e-Maktab bo'limidagi 100 ballik ko'rsatkichlarni birgalikda ko'rib, yuqori natijalarni qayd etib boring.
            \`;
        }
    } else {
        if (isRu) {
            responseText = \`
                <b>💡 Информация:</b> Расписание уроков, оценки 100 баллов, онлайн-локация и заряд батареи <b>\${child.name_ru || child.name}</b> под постоянным контролем. Вы можете задать любой вопрос по предметам или лимитам.
            \`;
        } else {
            responseText = \`
                <b>💡 Ma'lumot:</b> Farzandingiz <b>\${child.name} (\${child.grade}-sinf)</b> ning dars jadvali, 100 ballik baholari, jonli joylashuvi va batareya ko'rsatkichlari doimiy nazorat ostida. Har qanday fan, video tahlili yoki limitlar bo'yicha savolingizni yozishingiz mumkin.
            \`;
        }
    }

    appendAIMessage(responseText);
}

// Ovoz Yozish (Voice Recording)
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

    const voiceUserText = (currentLang === 'ru') ? "🎙️ <i>[Голосовое сообщение: 0:08 сек]</i>" : "🎙️ <i>[Ovozli xabar: 0:08 sek]</i>";
    appendUserMessage(voiceUserText);
    setTimeout(() => {
        const voiceAIText = (currentLang === 'ru') 
            ? "🎙️ <b>Анализ голосового сообщения:</b> Ваш вопрос принят. Рекомендации по учебному процессу и привычкам подготовлены!"
            : "🎙️ <b>Ovozli Xabar Tahlili:</b> Savolingiz qabul qilindi. Farzandingizning dars jarayonini nazorat qilish bo'yicha yo'riqnoma tayyorlandi!";
        appendAIMessage(voiceAIText);
    }, 800);
}

// Rasm Yuklash
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
// 8. SUBPAGE, MAVZU VA LOKATSIYA BOSHQARUVI
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
    const title = (currentLang === 'ru') ? "🎙️ Голосовой Радар" : "🎙️ Ovozli Radar";
    const msg = (currentLang === 'ru') 
        ? "Запрос локации отправлен ребёнку в виде звукового оповещения."
        : "Farzandingizga ota-ona joylashuv so'rovi ovozli bildirishnoma ko'rinishida yuborildi.";
    if (tg?.showPopup) {
        tg.showPopup({
            title: title,
            message: msg,
            buttons: [{ type: "ok" }]
        });
    } else {
        alert(msg);
    }
}

function copyPairingLink() {
    if (authStatus !== 'approved') {
        openSubpage('modal-approval-notice');
        return;
    }

    const link = \`https://t.me/farzand_nazorat_bot?start=pair_\${familyCode.replace("-", "")}\`;
    navigator.clipboard.writeText(link).then(() => {
        const msg = (currentLang === 'ru') 
            ? "✅ Ссылка для подключения скопирована!"
            : "✅ Farzandni ulash havolasi nusxalandi!";
        alert(msg);
    });
}

// 9. LEAFLET MAP (BEPUL RADAR)
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

// DOM Init
document.addEventListener('DOMContentLoaded', () => {
    setTheme(currentTheme);
    applyLanguageTranslations();
    updateAuthUI();
    if (currentAppRole === 'child') {
        switchAppRole('child');
    }
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
