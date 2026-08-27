import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const HTML = `<!DOCTYPE html>
<html class="dark" lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title>Qalqon AI — Ota-Ona Nazorati & Farzand Xavfsizligi</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <!-- Material Symbols & Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Geist:wght@500&display=swap" rel="stylesheet"/>
    <!-- Telegram WebApp SDK -->
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <!-- Leaflet OpenStreetMap CSS & JS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <!-- Custom Stitch Styles -->
    <style>
/* ==========================================================================
   QALQON AI (GUARDIAN INTELLIGENCE) — STITCH DESIGN SYSTEM
   Automatic Dual-Wolf Backgrounds + 10 Full Custom Themes
   ========================================================================== */

:root {
    --bg-primary: #13131b;
    --bg-surface: #1b1b23;
    --bg-surface-high: #292932;
    --bg-card: rgba(27, 27, 35, 0.78);
    --border-subtle: #334155;
    --border-active: #22d3ee;
    
    --accent-cyan: #22d3ee;
    --accent-emerald: #00a572;
    --accent-mint: #4edea3;
    --accent-amber: #f59e0b;
    --accent-rose: #f43f5e;
    --accent-indigo: #818cf8;
    
    --text-primary: #e4e1ed;
    --text-secondary: #c7c4d7;
    --text-muted: #908fa0;
    
    --radius-sm: 0.5rem;
    --radius-md: 0.75rem;
    --radius-lg: 1rem;
    --radius-xl: 1.25rem;
    --radius-full: 9999px;
}

/* ==========================================================================
   BASE & AUTOMATIC WOLF BACKGROUNDS (Parent = Adult Wolf, Child = Wolf Pup)
   ========================================================================== */
body {
    background-color: var(--bg-primary);
    background-image: linear-gradient(rgba(19, 19, 27, 0.84), rgba(19, 19, 27, 0.94)), url('assets/wolf_adult_hero.png');
    background-attachment: fixed;
    background-size: 380px auto;
    background-position: center 60px;
    background-repeat: no-repeat;
    color: var(--text-primary);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    min-height: 100vh;
    padding-bottom: 95px;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    overflow-x: hidden;
    transition: background-color 0.3s ease, color 0.3s ease;
}

body.role-child {
    background-image: linear-gradient(rgba(19, 19, 27, 0.84), rgba(19, 19, 27, 0.94)), url('assets/wolf_pup_hero.png') !important;
    background-size: 360px auto !important;
    background-position: center 60px !important;
}

/* 1. Cyber Dark (Default) */
body[data-theme="default"] {
    --bg-primary: #13131b;
    --bg-card: rgba(27, 27, 35, 0.78);
    background-color: #13131b !important;
    background-image: linear-gradient(rgba(19, 19, 27, 0.88), rgba(19, 19, 27, 0.96)), url('assets/wolf_adult_hero.png') !important;
}
body.role-child[data-theme="default"] {
    background-image: linear-gradient(rgba(19, 19, 27, 0.88), rgba(19, 19, 27, 0.96)), url('assets/wolf_pup_hero.png') !important;
}

/* 2. Aurora Borealis */
body[data-theme="aurora"] {
    --bg-primary: #0a192f;
    --bg-card: rgba(17, 34, 64, 0.82);
    --border-subtle: #233554;
    --border-active: #64ffda;
    --accent-cyan: #64ffda;
    background-color: #0a192f !important;
    background-image: linear-gradient(rgba(10, 25, 47, 0.86), rgba(10, 25, 47, 0.94)), url('assets/wolf_adult_hero.png') !important;
}
body.role-child[data-theme="aurora"] {
    background-image: linear-gradient(rgba(10, 25, 47, 0.86), rgba(10, 25, 47, 0.94)), url('assets/wolf_pup_hero.png') !important;
}

/* 3. Deep Space Nebula */
body[data-theme="nebula"] {
    --bg-primary: #120d24;
    --bg-card: rgba(29, 22, 58, 0.82);
    --border-subtle: #362a66;
    --border-active: #a855f7;
    --accent-cyan: #c084fc;
    background-color: #120d24 !important;
    background-image: linear-gradient(rgba(18, 13, 36, 0.86), rgba(18, 13, 36, 0.94)), url('assets/wolf_adult_hero.png') !important;
}
body.role-child[data-theme="nebula"] {
    background-image: linear-gradient(rgba(18, 13, 36, 0.86), rgba(18, 13, 36, 0.94)), url('assets/wolf_pup_hero.png') !important;
}

/* 4. Sunset Glow */
body[data-theme="sunset"] {
    --bg-primary: #1c1018;
    --bg-card: rgba(45, 24, 37, 0.82);
    --border-subtle: #522741;
    --border-active: #fb923c;
    --accent-cyan: #f97316;
    background-color: #1c1018 !important;
    background-image: linear-gradient(rgba(28, 16, 24, 0.86), rgba(28, 16, 24, 0.94)), url('assets/wolf_adult_hero.png') !important;
}
body.role-child[data-theme="sunset"] {
    background-image: linear-gradient(rgba(28, 16, 24, 0.86), rgba(28, 16, 24, 0.94)), url('assets/wolf_pup_hero.png') !important;
}

/* 5. Emerald Matrix */
body[data-theme="emerald"] {
    --bg-primary: #061a14;
    --bg-card: rgba(12, 43, 34, 0.82);
    --border-subtle: #194a3b;
    --border-active: #10b981;
    --accent-cyan: #34d399;
    background-color: #061a14 !important;
    background-image: linear-gradient(rgba(6, 26, 20, 0.86), rgba(6, 26, 20, 0.94)), url('assets/wolf_adult_hero.png') !important;
}
body.role-child[data-theme="emerald"] {
    background-image: linear-gradient(rgba(6, 26, 20, 0.86), rgba(6, 26, 20, 0.94)), url('assets/wolf_pup_hero.png') !important;
}

/* 6. Obsidian Gold */
body[data-theme="gold"] {
    --bg-primary: #1a1608;
    --bg-card: rgba(43, 36, 15, 0.82);
    --border-subtle: #4a3e1a;
    --border-active: #fbbf24;
    --accent-cyan: #f59e0b;
    background-color: #1a1608 !important;
    background-image: linear-gradient(rgba(26, 22, 8, 0.86), rgba(26, 22, 8, 0.94)), url('assets/wolf_adult_hero.png') !important;
}
body.role-child[data-theme="gold"] {
    background-image: linear-gradient(rgba(26, 22, 8, 0.86), rgba(26, 22, 8, 0.94)), url('assets/wolf_pup_hero.png') !important;
}

/* 7. Sakura Mist */
body[data-theme="sakura"] {
    --bg-primary: #1f1118;
    --bg-card: rgba(45, 24, 37, 0.82);
    --border-subtle: #5b2149;
    --border-active: #f472b6;
    --accent-cyan: #f472b6;
    background-color: #1f1118 !important;
    background-image: linear-gradient(rgba(31, 17, 24, 0.86), rgba(31, 17, 24, 0.94)), url('assets/wolf_adult_hero.png') !important;
}
body.role-child[data-theme="sakura"] {
    background-image: linear-gradient(rgba(31, 17, 24, 0.86), rgba(31, 17, 24, 0.94)), url('assets/wolf_pup_hero.png') !important;
}

/* 8. Cyberpunk Night */
body[data-theme="cyberpunk"] {
    --bg-primary: #0a0e17;
    --bg-card: rgba(18, 24, 41, 0.82);
    --border-subtle: #1e293b;
    --border-active: #00f0ff;
    --accent-cyan: #00f0ff;
    background-color: #0a0e17 !important;
    background-image: linear-gradient(rgba(10, 14, 23, 0.86), rgba(10, 14, 23, 0.94)), url('assets/wolf_adult_hero.png') !important;
}
body.role-child[data-theme="cyberpunk"] {
    background-image: linear-gradient(rgba(10, 14, 23, 0.86), rgba(10, 14, 23, 0.94)), url('assets/wolf_pup_hero.png') !important;
}

/* 9. Titanium Silver Glass (Och Kumush Titaniy 🌟) */
body[data-theme="silver"] {
    --bg-primary: #e6ebf2;
    --bg-card: rgba(255, 255, 255, 0.88);
    --border-subtle: #cbd5e1;
    --border-active: #0284c7;
    --accent-cyan: #0284c7;
    --text-primary: #0f172a;
    background-color: #e6ebf2 !important;
    background-image: linear-gradient(rgba(240, 244, 248, 0.84), rgba(226, 232, 240, 0.94)), url('assets/wolf_adult_hero.png') !important;
    color: #0f172a !important;
}
body.role-child[data-theme="silver"] {
    background-image: linear-gradient(rgba(240, 244, 248, 0.84), rgba(226, 232, 240, 0.94)), url('assets/wolf_pup_hero.png') !important;
}
body[data-theme="silver"] .glass-panel,
body[data-theme="silver"] .glass-card {
    background: rgba(255, 255, 255, 0.92) !important;
    border: 1px solid rgba(203, 213, 225, 0.9) !important;
    box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08) !important;
    color: #0f172a !important;
}
body[data-theme="silver"] .text-white { color: #0f172a !important; }
body[data-theme="silver"] .text-slate-200,
body[data-theme="silver"] .text-slate-300 { color: #334155 !important; }
body[data-theme="silver"] .text-slate-400 { color: #64748b !important; }
body[data-theme="silver"] .bg-slate-900,
body[data-theme="silver"] .bg-slate-950 {
    background-color: #f1f5f9 !important;
    border-color: #cbd5e1 !important;
}
body[data-theme="silver"] .bottom-nav {
    background: rgba(255, 255, 255, 0.96) !important;
    border-top: 1px solid #cbd5e1 !important;
    box-shadow: 0 -4px 24px rgba(15, 23, 42, 0.12) !important;
}
body[data-theme="silver"] .nav-btn { color: #64748b; }
body[data-theme="silver"] .nav-btn.active {
    color: #0284c7 !important;
    background: rgba(2, 132, 199, 0.14) !important;
}

/* 10. Cyber Ice Frost (Och Neon Tsian Muz 💎) */
body[data-theme="sky"] {
    --bg-primary: #dbeafe;
    --bg-card: rgba(255, 255, 255, 0.88);
    --border-subtle: #bfdbfe;
    --border-active: #0284c7;
    --accent-cyan: #0284c7;
    --text-primary: #082f49;
    background-color: #dbeafe !important;
    background-image: linear-gradient(rgba(239, 246, 255, 0.84), rgba(219, 234, 254, 0.94)), url('assets/wolf_adult_hero.png') !important;
    color: #082f49 !important;
}
body.role-child[data-theme="sky"] {
    background-image: linear-gradient(rgba(239, 246, 255, 0.84), rgba(219, 234, 254, 0.94)), url('assets/wolf_pup_hero.png') !important;
}
body[data-theme="sky"] .glass-panel,
body[data-theme="sky"] .glass-card {
    background: rgba(255, 255, 255, 0.92) !important;
    border: 1px solid rgba(191, 219, 254, 0.9) !important;
    box-shadow: 0 4px 20px rgba(2, 132, 199, 0.12) !important;
    color: #082f49 !important;
}
body[data-theme="sky"] .text-white { color: #082f49 !important; }
body[data-theme="sky"] .text-slate-200,
body[data-theme="sky"] .text-slate-300 { color: #0369a1 !important; }
body[data-theme="sky"] .text-slate-400 { color: #0284c7 !important; }
body[data-theme="sky"] .bg-slate-900,
body[data-theme="sky"] .bg-slate-950 {
    background-color: #eff6ff !important;
    border-color: #bfdbfe !important;
}
body[data-theme="sky"] .bottom-nav {
    background: rgba(255, 255, 255, 0.96) !important;
    border-top: 1px solid #bfdbfe !important;
    box-shadow: 0 -4px 24px rgba(2, 132, 199, 0.12) !important;
}
body[data-theme="sky"] .nav-btn { color: #0284c7; }
body[data-theme="sky"] .nav-btn.active {
    color: #0284c7 !important;
    background: rgba(2, 132, 199, 0.14) !important;
}

/* Glassmorphism Panel */
.glass-panel {
    background: var(--bg-card);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.45);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-panel:hover {
    border-color: rgba(34, 211, 238, 0.5);
}

.ambient-glow-bg {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: -1;
    background: radial-gradient(circle at 50% 12%, rgba(34, 211, 238, 0.12) 0%, transparent 65%);
    animation: ambientPulse 6s ease-in-out infinite alternate;
}

@keyframes ambientPulse {
    0% { opacity: 0.6; transform: scale(1); }
    100% { opacity: 1; transform: scale(1.06); }
}

.status-glow-safe {
    background: radial-gradient(circle at top right, rgba(0, 165, 114, 0.18) 0%, transparent 70%);
}

.status-accent-safe {
    border-left: 3px solid var(--accent-mint);
}

@keyframes pulseDot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(1.25); }
}
.animate-pulse-dot {
    animation: pulseDot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.font-display-brand {
    font-family: 'Inter', sans-serif;
    font-weight: 800;
    letter-spacing: 0.05em;
}

.font-data-mono {
    font-family: 'Geist', monospace, sans-serif;
}

.tab-content {
    display: none;
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 0.25s ease-out, transform 0.25s ease-out;
}

.tab-content.active:not(.hidden) {
    display: block !important;
    opacity: 1;
    transform: translateY(0);
}

.tab-content.hidden {
    display: none !important;
}

.bottom-nav {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    max-width: 480px;
    margin: 0 auto;
    background: rgba(19, 19, 27, 0.94) !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    border-top: 1px solid var(--border-subtle);
    border-top-left-radius: 1.25rem;
    border-top-right-radius: 1.25rem;
    z-index: 99999 !important;
    display: flex !important;
    justify-content: space-around;
    align-items: center;
    padding: 6px 8px calc(8px + env(safe-area-inset-bottom, 0px)) 8px;
    box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.65);
}

.bottom-nav.hidden {
    display: none !important;
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
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 6px 12px;
    border-radius: 9999px;
}

.nav-btn .material-symbols-outlined {
    font-size: 22px;
    margin-bottom: 2px;
    transition: transform 0.2s ease, font-variation-settings 0.2s ease;
}

.nav-btn.active {
    color: var(--accent-cyan) !important;
    background: rgba(34, 211, 238, 0.14);
}

.nav-btn.active .material-symbols-outlined {
    font-variation-settings: 'FILL' 1;
    transform: translateY(-1px) scale(1.08);
}

#childBottomNav .nav-btn.active {
    color: var(--accent-indigo) !important;
    background: rgba(129, 140, 248, 0.18);
}

.subpage-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-primary);
    background-image: linear-gradient(rgba(19, 19, 27, 0.94), rgba(19, 19, 27, 0.98)), url('assets/wolf_adult_hero.png');
    background-size: 380px auto;
    background-position: center 60px;
    background-repeat: no-repeat;
    z-index: 100000;
    display: none;
    overflow-y: auto;
    padding: 16px;
    padding-bottom: 95px;
    animation: modalSlideUp 0.24s cubic-bezier(0.4, 0, 0.2, 1);
}

.subpage-modal.active {
    display: block;
}

@keyframes modalSlideUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
}

.progress-bar-bg {
    background-color: rgba(255, 255, 255, 0.09);
    border-radius: 9999px;
    height: 7px;
    overflow: hidden;
}

.progress-bar-fill {
    height: 100%;
    border-radius: 9999px;
    transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

#map {
    height: 250px;
    width: 100%;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-subtle);
    z-index: 10;
}

.radar-pin {
    width: 16px;
    height: 16px;
    background: var(--accent-cyan);
    border: 2.5px solid #ffffff;
    border-radius: 50%;
    box-shadow: 0 0 16px var(--accent-cyan);
    animation: radarPulse 2s infinite;
}

@keyframes radarPulse {
    0% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.7); }
    70% { box-shadow: 0 0 0 14px rgba(34, 211, 238, 0); }
    100% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0); }
}

.voice-record-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #22d3ee, #0284c7);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.voice-record-btn.recording {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    animation: voiceRecordPulse 1.2s infinite;
}

@keyframes voiceRecordPulse {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
    70% { transform: scale(1.1); box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.theme-card {
    height: 72px;
    border-radius: 14px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 8px;
    font-size: 11px;
    font-weight: 700;
    position: relative;
    overflow: hidden;
}

.theme-card.active {
    border-color: var(--accent-cyan);
    box-shadow: 0 0 16px rgba(34, 211, 238, 0.45);
}

::-webkit-scrollbar {
    display: none;
}
* {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

/* Child AI Chat High-Contrast Theme Adaptation */
body[data-theme="silver"] #childAiChatThread,
body[data-theme="sky"] #childAiChatThread {
    background-color: rgba(241, 245, 249, 0.95) !important;
    border-color: #cbd5e1 !important;
}

body[data-theme="silver"] #childAiChatThread .bg-indigo-950\\/50,
body[data-theme="sky"] #childAiChatThread .bg-indigo-950\\/50 {
    background-color: #ffffff !important;
    border-color: #cbd5e1 !important;
    color: #0f172a !important;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08) !important;
}

body[data-theme="silver"] #childAiChatThread .text-slate-200,
body[data-theme="sky"] #childAiChatThread .text-slate-200 {
    color: #0f172a !important;
}

body[data-theme="silver"] #aiChatThread,
body[data-theme="sky"] #aiChatThread {
    background-color: rgba(241, 245, 249, 0.95) !important;
    border-color: #cbd5e1 !important;
}

body[data-theme="silver"] .chat-bubble-ai,
body[data-theme="sky"] .chat-bubble-ai {
    background-color: #ffffff !important;
    color: #0f172a !important;
    border-color: #cbd5e1 !important;
}

/* 🌟 YORQIN FONLARDA KATAKLAR VA HARFLARNING YUQORI KONTRASTI */
body[data-theme="silver"] input,
body[data-theme="silver"] select,
body[data-theme="silver"] textarea,
body[data-theme="sky"] input,
body[data-theme="sky"] select,
body[data-theme="sky"] textarea {
    background-color: #ffffff !important;
    color: #0f172a !important;
    border: 1.5px solid #64748b !important;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08) !important;
    font-weight: 600 !important;
}

body[data-theme="silver"] input::placeholder,
body[data-theme="sky"] input::placeholder {
    color: #64748b !important;
    font-weight: 500 !important;
}

body[data-theme="silver"] .subpage-modal,
body[data-theme="sky"] .subpage-modal {
    background-color: #f1f5f9 !important;
    color: #0f172a !important;
    background-image: linear-gradient(rgba(241, 245, 249, 0.94), rgba(226, 232, 240, 0.98)), url('assets/wolf_adult_hero.png') !important;
}

</style>
</head>
<body class="p-3 max-w-md mx-auto relative antialiased text-slate-200">
<!-- ==================================================================== -->
    <!-- 🤝 TO'LIQ EKRANLI FARZAND ROZILIK & ULANISH MODALI -->
    <!-- ==================================================================== -->
    <div id="childConsentOverlay" class="fixed inset-0 z-[100001] bg-[#13131b] flex flex-col justify-between p-4 md:p-6 overflow-y-auto hidden" style="background-image: linear-gradient(rgba(19,19,27,0.94), rgba(19,19,27,0.98)), url('assets/wolf_pup_hero.png'); background-size: 360px auto; background-position: center 50px; background-repeat: no-repeat;">
        <div class="space-y-3.5 pt-2">
            <!-- Mascot & Brand -->
            <div class="flex items-center justify-center gap-2.5">
                <div class="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(129,140,248,0.4)]">
                    <img src="assets/wolf_pup_hero.png" alt="Qalqon AI Bo'ri" class="w-10 h-10 object-contain">
                </div>
                <div>
                    <h1 class="font-display-brand text-base text-indigo-300 font-black tracking-wider leading-none">QALQON AI</h1>
                    <p class="text-[10px] text-slate-400 mt-0.5">Yosh Qahramon Xavfsizlik & Do'stlik Qalqoni</p>
                </div>
            </div>

            <!-- Psychological Trust Header -->
            <div class="glass-panel p-4 space-y-3 border-indigo-500/40 bg-slate-900/90 rounded-3xl text-center shadow-xl">
                <h2 class="text-sm font-black text-white leading-snug flex items-center justify-center gap-1.5">
                    <span>🌟</span>
                    <span>Salom, Yosh Qahramon!</span>
                </h2>
                <div class="p-2.5 rounded-xl bg-indigo-950/50 border border-indigo-500/30 text-left text-xs text-indigo-200 leading-relaxed">
                    <b>Bizning qat'iy kafolatimiz:</b> Sening ota-onang seni <u>hech qachon poylamaydi</u> va shaxsiy yozishmalaringni o'qimaydi. Tizim faqat sening xavfsizliging va darslarda eng yuqori 100 ball olishing uchun ishlaydi. 🐺✨
                </div>

                <!-- 4 Ta Aniq Ota-onaga Uzatiladigan Ruxsatlar va Ma'lumotlar -->
                <div class="space-y-2 text-left pt-1">
                    <div class="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1">
                        <span>📋</span>
                        <span>Ota-onangizga ko'rinadigan 4 ta ma'lumot:</span>
                    </div>

                    <!-- 1. Lokatsiya -->
                    <div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                        <span class="text-base flex-shrink-0">📍</span>
                        <div class="text-[11px]">
                            <b class="text-cyan-300">1. Jonli Lokatsiya va Xavfsiz Hududlar:</b>
                            <p class="text-slate-300 text-[10px] leading-tight mt-0.5">Darsdan so'ng maktabdan eson-omon chiqqaningizni va xavfsiz joydaligingizni bilish uchun.</p>
                        </div>
                    </div>

                    <!-- 2. YouTube & Insta -->
                    <div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                        <span class="text-base flex-shrink-0">🎬</span>
                        <div class="text-[11px]">
                            <b class="text-pink-300">2. YouTube & Instagram Qiziqish Mavzulari:</b>
                            <p class="text-slate-300 text-[10px] leading-tight mt-0.5">Shaxsiy chatlar o'qilmaydi! Faqat IT, ilm-fan, mantiq yoki o'yin qiziqishlari foizlarda tahlil qilinadi.</p>
                        </div>
                    </div>

                    <!-- 3. Ilovalar va Ekran vaqti -->
                    <div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                        <span class="text-base flex-shrink-0">📱</span>
                        <div class="text-[11px]">
                            <b class="text-amber-300">3. Ko'p Ishlatilayotgan Ilovalar va Ekran Vaqti:</b>
                            <p class="text-slate-300 text-[10px] leading-tight mt-0.5">Ko'z salomatligi va dars vaqtida diqqatni jamlash me'yorini saqlash uchun.</p>
                        </div>
                    </div>

                    <!-- 4. e-Maktab baholari -->
                    <div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                        <span class="text-base flex-shrink-0">📚</span>
                        <div class="text-[11px]">
                            <b class="text-emerald-300">4. e-Maktab 100 Ballik Baholar va Rag'batlar:</b>
                            <p class="text-slate-300 text-[10px] leading-tight mt-0.5">Darslardagi a'lochi natijalaringiz uchun ota-onangizdan yutuq va sovg'alar olishingiz uchun.</p>
                        </div>
                    </div>
                </div>

                <!-- Family Code Input (Oral code from parents) -->
                <div class="space-y-1.5 text-left pt-2 border-t border-slate-800">
                    <label class="text-[11px] font-bold text-slate-300 block">
                        🔑 6 Xonali Oila Kodi <span class="text-[10px] text-indigo-300 font-normal">(Ota-onangizdan og'zaki oling):</span>
                    </label>
                    <input type="text" id="childConsentFamilyCode" placeholder="Masalan: 849-210" maxlength="7" class="w-full bg-slate-950 border-2 border-indigo-500/60 rounded-2xl px-4 py-3 text-center text-lg font-black text-white font-mono tracking-widest focus:outline-none focus:border-cyan-400 placeholder-slate-600 transition">
                    <p id="childConsentError" class="text-[10px] text-rose-400 font-bold text-center hidden">⚠️ Iltimos, 6 xonali oila kodini to'liq kiriting!</p>
                </div>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-2 pb-3 pt-2">
            <button onclick="handleChildConsentAccept()" class="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs md:text-sm rounded-2xl transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2">
                <span>✅</span>
                <span>Barchasini Tushundim, Roziman va Ulanaman</span>
            </button>
            <button onclick="handleChildConsentDecline()" class="w-full py-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white font-bold text-xs rounded-2xl transition">
                <span>❌</span>
                <span>Qarshiman (Hozircha emas)</span>
            </button>
        </div>
    </div>

            

    <div class="ambient-glow-bg"></div>

    <!-- ==================================================================== -->
    <!-- TOP APP BAR (QALQON AI BRAND & MASCOT) -->
    <!-- ==================================================================== -->
    <header class="glass-panel px-3.5 py-2.5 mb-3 flex items-center justify-between border-[#334155]">
        <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[#22D3EE] text-2xl animate-pulse">shield</span>
            <div>
                <h1 class="font-display-brand text-sm text-[#22D3EE] font-black tracking-wider leading-none">QALQON AI</h1>
                <p class="text-[9px] text-slate-400 mt-0.5" data-i18n="appSubtitle">Guardian Intelligence — Ota-ona & Farzand</p>
            </div>
        </div>

        <div class="flex items-center gap-2">
            <!-- Silver Wolf Mascot Avatar -->
            <div class="w-8 h-8 rounded-full border-2 border-[#22D3EE]/80 bg-[#22D3EE]/20 flex items-center justify-center overflow-hidden relative shadow-[0_0_10px_rgba(34,211,238,0.35)]">
                <img src="assets/wolf_mascot.png" onerror="this.src='https://lh3.googleusercontent.com/aida-public/AB6AXuD4KD1uqMogxlSUh4XTwFZ6O8CcikpLzeXyE_AoKP5Bb7hfxrK_rDplyKX2s0KI3Kf-D2TRnanZtUX21nyuflU3WUny5Q3xGqSOAFplw0NaQNtSmIFXg_tVGW1h8CU70IPksptF26DN2hbF2nFN9sZOKWou2ZiNFaEl1s9UvWP8vjflsQwQWMt_BttzLNQBBJHpzrSqvqz-wwxaNui-4J52Xz6TfF8kqKuSIoBQubAXZiw9_QUtaSOjOw'" alt="Kumush Bo'ri" class="w-full h-full object-cover">
            </div>
            <!-- Plan Badge -->
            <button onclick="openSubpage('modal-plans')" class="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                💎 Pro
            </button>
        </div>
    </header>

    <!-- ==================================================================== -->
    <!-- ROL TANLASH (OTA / ONA VS FARZAND ROLE SWITCHER) -->
    <!-- ==================================================================== -->
    <div id="roleSwitcherContainer" class="glass-panel p-1.5 mb-2.5 flex items-center justify-between gap-1.5 bg-slate-900/90 border-[#334155] rounded-2xl">
        <button onclick="switchAppRole('parent')" id="roleBtnParent" class="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-teal-500 shadow-md transition flex items-center justify-center gap-1.5">
            <span class="material-symbols-outlined text-sm">family_restroom</span>
            <span data-i18n="roleParent">Ota / Ona Paneli</span>
        </button>
        <button onclick="switchAppRole('child')" id="roleBtnChild" class="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5">
            <span class="material-symbols-outlined text-sm">child_care</span>
            <span data-i18n="roleChild">Farzand Paneli</span>
        </button>
    </div>

    <!-- Ota / Ona Tanlash Pills -->
    <div id="parentRolePillContainer" class="flex items-center justify-between px-2.5 py-1 mb-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px]">
        <div class="flex items-center gap-1.5 text-slate-400">
            <span class="material-symbols-outlined text-xs text-cyan-400">person</span>
            <span data-i18n="parentIdentityLabel">Sizning rolingiz:</span>
        </div>
        <div class="flex items-center gap-1">
            <button onclick="setParentRelation('father')" id="relBtnFather" class="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 text-[10px] transition">
                👨 Otasi
            </button>
            <button onclick="setParentRelation('mother')" id="relBtnMother" class="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-400 font-semibold border border-transparent text-[10px] hover:text-white transition">
                👩 Onasi
            </button>
        </div>
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

    
        </div>
        <button onclick="openSubpage('modal-auth')" class="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] shadow-sm transition" id="authBannerBtn" data-i18n="loginRegisterBtn">
            🔑 Kirish / Ro'yxat
        </button>
    </div>

    <!-- ==================================================================== -->
    <!-- 👦 FARZAND 5 TA ASOSIY BO'LIMI (CHILD 5 TAB VIEWS & SUB-SECTIONS) -->
    <!-- ==================================================================== -->

    <!-- FARZAND TAB 1: 🏠 ASOSIY (BOSH SAHIFA, TEZKOR XABARLAR, POMODORO & ULANISH) -->
    <main id="child-tab-home" class="tab-content space-y-3.5 hidden">
        <!-- Farzand 3D Bo'ri Qahramon Katta & Kengaytirilgan Hero Card (Erkin va Keng Hoshiyali) -->
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
        </section>

        <!-- 📍 BO'LIMOSTI 1: TEZKOR XABARLAR (OTAN-ONAGA 1 SONIYADA) -->
        <section class="glass-card p-3.5 space-y-2 border-sky-500/30">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="text-base">📍</span>
                    <h3 class="text-xs font-bold text-white" data-i18n="childQuickStatusTitle">Tezkor Xabar (Ota-onaga 1 soniyada)</h3>
                </div>
                <span class="text-[9px] text-sky-400">Telegramga boradi</span>
            </div>
            <div class="grid grid-cols-2 gap-2">
                <button onclick="sendChildQuickStatus('maktab')" class="p-2.5 rounded-xl bg-slate-900/80 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/50 text-left transition flex items-center gap-2">
                    <span class="text-lg">🏫</span>
                    <div>
                        <div class="text-[11px] font-bold text-white" data-i18n="quickSchool">Maktabdaman</div>
                        <div class="text-[9px] text-slate-400" data-i18n="quickSchoolSub">Eson-omon yetdim</div>
                    </div>
                </button>

                <button onclick="sendChildQuickStatus('uy')" class="p-2.5 rounded-xl bg-slate-900/80 hover:bg-sky-500/20 border border-slate-700 hover:border-sky-500/50 text-left transition flex items-center gap-2">
                    <span class="text-lg">🏠</span>
                    <div>
                        <div class="text-[11px] font-bold text-white" data-i18n="quickHome">Uydaman</div>
                        <div class="text-[9px] text-slate-400" data-i18n="quickHomeSub">Uyga kirdim</div>
                    </div>
                </button>

                <button onclick="sendChildQuickStatus('olib_keting')" class="p-2.5 rounded-xl bg-slate-900/80 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-500/50 text-left transition flex items-center gap-2">
                    <span class="text-lg">🚗</span>
                    <div>
                        <div class="text-[11px] font-bold text-white" data-i18n="quickPickUp">Olib keting</div>
                        <div class="text-[9px] text-slate-400" data-i18n="quickPickUpSub">Darslarim tugadi</div>
                    </div>
                </button>

                <button onclick="sendChildQuickStatus('sos')" class="p-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-left transition flex items-center gap-2">
                    <span class="text-lg animate-pulse">🚨</span>
                    <div>
                        <div class="text-[11px] font-bold text-rose-300">SOS Yordam</div>
                        <div class="text-[9px] text-rose-400/80">Shoshilinch xabar</div>
                    </div>
                </button>
            </div>
        </section>

        <!-- ⏱️ BO'LIMOSTI 2: POMODORO DARS TAYMERI & KO'Z MASHQI -->
        <section class="glass-card p-4 space-y-3 border-teal-500/30">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="text-xl">⏱️</span>
                    <div>
                        <h3 class="text-xs font-bold text-white" data-i18n="childTimerTitle">Pomodoro Dars Taymeri & Ko'z Mashqi</h3>
                        <div class="text-[10px] text-slate-400">25 daqiqa dars, 5 daqiqa ko'zga dam berish</div>
                    </div>
                </div>
            </div>

            <div class="p-3 rounded-2xl bg-slate-900/90 border border-teal-500/30 text-center space-y-2">
                <div class="text-3xl font-black text-teal-400 font-mono" id="pomodoroTimerDisplay">25:00</div>
                <div class="text-[10px] text-slate-400" id="pomodoroStatusLabel">Dars qilishga tayyormisan? Boshlash tugmasini bos!</div>
                <div class="flex items-center justify-center gap-2 pt-1">
                    <button onclick="togglePomodoroTimer()" id="pomodoroBtn" class="px-4 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs shadow transition">
                        ▶️ Boshlash
                    </button>
                    <button onclick="resetPomodoroTimer()" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition">
                        🔄 Qayta o'rnatish
                    </button>
                </div>
            </div>
        </section>

        <!-- 🔑 BO'LIMOSTI 3: ROZILIK VA OILAVIY KODNI KIRITISH -->
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
                    Men yuqoridagi barcha qoidalar bilan tanishdim va ota-onam bilan tizimga ulanishga roziman.
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

            <div id="childPairedSuccessBox" class="hidden p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-center space-y-1">
                <div class="text-xs font-bold text-emerald-300" data-i18n="childPairedSuccess">🎉 Tabriklaymiz! Siz Oila Profiliga Muvaffaqiyatli Ulandingiz!</div>
                <div class="text-[10px] text-slate-400" data-i18n="childPairedSub">Ota-onangizning Telegram botiga xabar yuborildi.</div>
            </div>
        </section>
    </main>

    <!-- FARZAND TAB 2: 🧠 AI DO'ST (AI CHAT, DOIMIY MULTI-TURN SUHBAT, RAG & FAN SHABLONLARI) -->
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
    </main>

    <!-- FARZAND TAB 3: 🏆 YUTUQLAR (GAMIFICATION & MUKOFORLAR) -->
    <main id="child-tab-rewards" class="tab-content space-y-3.5 hidden">
        <section class="glass-card p-4 space-y-3 border-amber-500/40">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="text-2xl">🏆</span>
                    <div>
                        <h3 class="text-xs font-bold text-white" data-i18n="childBadgesTitle">Mening Yutuqlarim & Mukofotlar</h3>
                        <div class="text-[10px] text-amber-300">Darslarni a'lo bajarganing uchun nishonlar</div>
                    </div>
                </div>
                <span class="text-xs font-black text-amber-400">350 Ball ⭐</span>
            </div>

            <!-- Bo'limosti: Nishonlar Galereyasi -->
            <div class="grid grid-cols-3 gap-2 text-center">
                <div class="p-2.5 rounded-xl bg-slate-900/70 border border-amber-500/30 space-y-1">
                    <div class="text-2xl">🥇</div>
                    <div class="text-[10px] font-bold text-white">Darslik Qahramoni</div>
                    <div class="text-[8px] text-emerald-400">95+ ball</div>
                </div>
                <div class="p-2.5 rounded-xl bg-slate-900/70 border border-sky-500/30 space-y-1">
                    <div class="text-2xl">⏱️</div>
                    <div class="text-[10px] font-bold text-white">Vaqt Ustasi</div>
                    <div class="text-[8px] text-sky-400">Me'yorda</div>
                </div>
                <div class="p-2.5 rounded-xl bg-slate-900/70 border border-purple-500/30 space-y-1">
                    <div class="text-2xl">📚</div>
                    <div class="text-[10px] font-bold text-white">Kitobxon</div>
                    <div class="text-[8px] text-purple-400">Faol</div>
                </div>
            </div>

            <!-- Bo'limosti: Mukofotlar Kartasi -->
            <div class="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                    <span class="text-2xl">🎟️</span>
                    <div>
                        <div class="text-[11px] font-bold text-white">Kinoga Sayr Mukofoti</div>
                        <div class="text-[9px] text-slate-400">Ota-onang bilan kelishilgan rag'bat</div>
                    </div>
                </div>
                <span class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">Faollashdi ✅</span>
            </div>
        </section>
    </main>

    <!-- FARZAND TAB 4: 📚 E-MAKTABIM (100 BALLIK BAHOLAR & DARS JADVALI) -->
    <main id="child-tab-school" class="tab-content space-y-3.5 hidden">
        <section class="glass-card p-4 space-y-3 border-emerald-500/40">
            <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                    <h3 class="text-xs font-bold text-white">📚 Mening 100 Ballik Baholarim</h3>
                    <div class="text-[10px] text-slate-400">e-Maktab DTS Darsliklari Bo'yicha</div>
                </div>
                <span class="text-xs font-black text-emerald-400">92.4 / 100 ⭐</span>
            </div>

            <!-- Bo'limosti: Fanlar Shkalasi -->
            <div class="space-y-2 text-[11px]">
                <div class="p-2 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                    <span>📐 Matematika</span>
                    <span class="font-bold text-emerald-400">94 ball (A'lo)</span>
                </div>
                <div class="p-2 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                    <span>📖 Ingliz tili</span>
                    <span class="font-bold text-sky-400">88 ball (Yaxshi)</span>
                </div>
                <div class="p-2 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                    <span>🇺🇿 Ona tili va Adabiyot</span>
                    <span class="font-bold text-emerald-400">92 ball (A'lo)</span>
                </div>
                <div class="p-2 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                    <span>💻 Informatika va IT</span>
                    <span class="font-bold text-emerald-400">98 ball (Top 1%)</span>
                </div>
            </div>
        </section>
    </main>

    <!-- FARZAND TAB 5: 🎬 QIZIQISHLAR (IT, FAN & SHAFFOFLIK QOIDALARI) -->
    <main id="child-tab-explore" class="tab-content space-y-3.5 hidden">
        <!-- Bo'limosti 1: IT & Dasturlash Kurslari -->
        <section class="glass-card p-4 space-y-2.5 border-sky-500/30">
            <div class="flex items-center gap-2">
                <span class="text-xl">💻</span>
                <h3 class="text-xs font-bold text-white">IT & Scratch Dasturlash</h3>
            </div>
            <p class="text-[11px] text-slate-300 leading-relaxed">
                Yosh dasturchilar uchun Scratch va Python bo'yicha sara darslar va qiziqarli o'yinlar yaratish maydoni.
            </p>
        </section>

        <!-- Bo'limosti 2: Maxfiylik Kafolati -->
        <section class="glass-card p-4 space-y-2.5 border-purple-500/30">
            <div class="flex items-center gap-2">
                <span class="text-xl">🛡️</span>
                <h3 class="text-xs font-bold text-white" data-i18n="childGoalTitle">🎯 Tizim Qoidalari & Shaffoflik Kafolati</h3>
            </div>
            <div class="space-y-2 text-[11px] text-slate-300 leading-relaxed">
                <div class="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2">
                    <span>✨</span>
                    <span data-i18n="childGoalDesc">Bu dastur jazo emas, balki sening darslarda a'lochi bo'lishing va xavfsizliging uchun aqlli yordamchidir.</span>
                </div>
                <div class="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-start gap-2 text-purple-200">
                    <span>🔒</span>
                    <span data-i18n="childReelsDesc">Biz sening shaxsiy yozishmalaringni (chatlaringni) yoki videolaringni ko'rmaymiz! Faqat qaysi fanlarga qiziqayotganing mavzulari tahlil qilinadi.</span>
                </div>
            </div>
        </section>
    </main>

    <!-- ==================================================================== -->
    <!-- FARZAND TAB 5: ⚙️ SOZLAMALAR (CHILD SETTINGS HUB) -->
    <!-- ==================================================================== -->
    <main id="child-tab-settings" class="tab-content space-y-2.5 hidden">
        <div class="flex items-center justify-between px-1 mb-1">
            <h2 class="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-indigo-400">settings</span>
                <span>Mening Sozlamalarim</span>
            </h2>
            <span class="text-[10px] text-indigo-400 font-mono font-bold">Farzand Profili</span>
        </div>

        <!-- 1. Qahramon Fonlari -->
        <div onclick="openSubpage('modal-themes')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-indigo-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-lg">
                    🎨
                </div>
                <div>
                    <div class="text-xs font-bold text-white">Qahramon Fonlari</div>
                    <div class="text-[10px] text-slate-400">Kichik Bo'ri, Cyber Ice, Neon Fazoviy</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 2. Ilova Haqida & Maxfiylik Kafolati -->
        <div onclick="openSubpage('modal-about')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-indigo-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg">
                    🛡️
                </div>
                <div>
                    <div class="text-xs font-bold text-white">Ilova Haqida & Maxfiylik Huquqlarim</div>
                    <div class="text-[10px] text-slate-400">Poyloqchilik emas — bilim va xavfsiz do'stlik</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 3. Pomodoro Dars Taymeri -->
        <div onclick="switchChildTab('child-tab-home')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-indigo-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">
                    ⏱️
                </div>
                <div>
                    <div class="text-xs font-bold text-white">Pomodoro Dars Taymeri</div>
                    <div class="text-[10px] text-slate-400">25 daqiqa dars / 5 daqiqa ko'z mashqi</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 4. Yutuqlarim va Rag'batlar -->
        <div onclick="switchChildTab('child-tab-rewards')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-indigo-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 text-lg">
                    🏆
                </div>
                <div>
                    <div class="text-xs font-bold text-white">Mening Yutuqlarim & Ballarim</div>
                    <div class="text-[10px] text-slate-400">100 ballik e-Maktab DTS rag'batlari</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 5. Ota-onam bilan Favqulodda Bog'lanish (SOS) -->
        <div onclick="sendChildQuickStatus('sos')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-rose-500/50 transition bg-rose-950/20">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 text-lg">
                    🚨
                </div>
                <div>
                    <div class="text-xs font-bold text-rose-300">Favqulodda SOS Xabar Yuborish</div>
                    <div class="text-[10px] text-slate-400">Ota-onaga zudlik bilan lokatsiya va signal boradi</div>
                </div>
            </div>
            <span class="text-rose-400 text-xs font-bold">SOS ↗</span>
        </div>
    </main>

    <!-- ==================================================================== -->
    <!-- TAB 1: 📊 DASHBOARD (STITCH STATUS CARD & AI INSIGHTS) -->
    <!-- ==================================================================== -->
    <!-- ==================================================================== -->
    <!-- FARZAND TAB 5: ⚙️ SOZLAMALAR (CHILD SETTINGS HUB) -->
    <!-- ==================================================================== -->
    <main id="child-tab-settings" class="tab-content space-y-2.5 hidden">
        <div class="flex items-center justify-between px-1 mb-1">
            <h2 class="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-indigo-400">settings</span>
                <span>Mening Sozlamalarim</span>
            </h2>
            <span class="text-[10px] text-indigo-400 font-mono font-bold">Farzand Profili</span>
        </div>

        <!-- 1. Qahramon Fonlari -->
        <div onclick="openSubpage('modal-themes')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-indigo-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-lg">
                    🎨
                </div>
                <div>
                    <div class="text-xs font-bold text-white">Qahramon Fonlari</div>
                    <div class="text-[10px] text-slate-400">Kichik Bo'ri, Cyber Ice, Neon Fazoviy</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 2. Ilova Haqida & Maxfiylik Kafolati -->
        <div onclick="openSubpage('modal-about')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-indigo-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg">
                    🛡️
                </div>
                <div>
                    <div class="text-xs font-bold text-white">Ilova Haqida & Maxfiylik Huquqlarim</div>
                    <div class="text-[10px] text-slate-400">Poyloqchilik emas — bilim va xavfsiz do'stlik</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 3. Pomodoro Dars Taymeri -->
        <div onclick="switchChildTab('child-tab-home')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-indigo-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">
                    ⏱️
                </div>
                <div>
                    <div class="text-xs font-bold text-white">Pomodoro Dars Taymeri</div>
                    <div class="text-[10px] text-slate-400">25 daqiqa dars / 5 daqiqa ko'z mashqi</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 4. Yutuqlarim va Rag'batlar -->
        <div onclick="switchChildTab('child-tab-rewards')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-indigo-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 text-lg">
                    🏆
                </div>
                <div>
                    <div class="text-xs font-bold text-white">Mening Yutuqlarim & Ballarim</div>
                    <div class="text-[10px] text-slate-400">100 ballik e-Maktab DTS rag'batlari</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 5. Ota-onam bilan Favqulodda Bog'lanish (SOS) -->
        <div onclick="sendChildQuickStatus('sos')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-rose-500/50 transition bg-rose-950/20">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 text-lg">
                    🚨
                </div>
                <div>
                    <div class="text-xs font-bold text-rose-300">Favqulodda SOS Xabar Yuborish</div>
                    <div class="text-[10px] text-slate-400">Ota-onaga zudlik bilan lokatsiya va signal boradi</div>
                </div>
            </div>
            <span class="text-rose-400 text-xs font-bold">SOS ↗</span>
        </div>
    </main>

    <!-- ==================================================================== -->
    <!-- TAB 1: 📊 DASHBOARD (QALQON AI HIMOYACHI HERO & ASOSIY STATUS) -->
    <!-- ==================================================================== -->
    <main id="tab-dashboard" class="tab-content active space-y-3.5">
        <!-- 3D Bo'ri Qalqon AI Himoyachi Katta & Kengaytirilgan Hero Card (Erkin va Keng Hoshiyali) -->
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
        </section>

        <!-- 1. Stitch Status Card (Level 1 Surface with Glow) -->
        <section class="glass-panel p-4 status-glow-safe status-accent-safe relative overflow-hidden">
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h2 class="text-sm font-black text-white mb-0.5 flex items-center gap-2">
                        <div class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse-dot"></div>
                        <span>Tizim Faol & Xavfsiz</span>
                    </h2>
                    <p class="text-[11px] text-emerald-400/90 font-medium">Barcha xavfsizlik himoyasi yoqilgan</p>
                </div>
                <div class="text-right">
                    <div class="flex items-center gap-1 text-cyan-400 font-bold text-xs font-mono">
                        <span class="material-symbols-outlined text-[16px]">battery_charging_full</span>
                        <span id="statBattery">84%</span>
                    </div>
                </div>
            </div>

            <div class="flex items-center gap-2 text-slate-300 text-[11px] bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800 inline-flex">
                <span class="material-symbols-outlined text-xs text-cyan-400">location_on</span>
                <span id="radarCurrentAddress">Yunusobod 4-mavze, 24-maktab</span>
            </div>
        </section>

        <!-- 2. Bugungi Ekran Vaqti & Limit Bloki -->
        <section class="glass-panel p-4 space-y-3">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-xs font-bold text-slate-400" data-i18n="screenTime">Bugungi Ekran Vaqti</h2>
                    <div class="text-2xl font-black text-white font-mono mt-0.5" id="totalScreenTime">3s 45d</div>
                </div>
                <div class="text-right">
                    <span class="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20" id="screenStatus" data-i18n="normalStatus">Normal</span>
                    <div class="text-[11px] text-slate-400 mt-1"><span data-i18n="limitRemain">Qoldi:</span> <b class="text-slate-200" id="remainingTime">1s 15d</b></div>
                </div>
            </div>

            <div class="progress-bar-bg">
                <div id="screenTimeBar" class="progress-bar-fill bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400" style="width: 72%;"></div>
            </div>
        </section>

        <!-- 3. Ilovalar Reytingi -->
        <section class="glass-panel p-4 space-y-3">
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
    <!-- ==================================================================== -->
    <!-- TAB 3: 🧠 AI MURABBIY (PRO: MATN, OVOZ, RASM VA REELS TAHLILI) -->
    <!-- ==================================================================== -->
    <main id="tab-ai" class="tab-content space-y-3.5 hidden">
        <!-- 1. AI Tahlil & Video Qiziqishlar (Ijobiy & Xavf Signallari Muvozanati) -->
        <section class="glass-panel p-4 border-t-2 border-t-cyan-400/80 space-y-3">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <span class="material-symbols-outlined text-xl">psychology</span>
                    </div>
                    <div>
                        <h3 class="text-xs font-black text-white">AI Tahlil & Video Qiziqishlar</h3>
                        <div class="text-[10px] text-slate-400">YouTube Shorts va Instagram Reels</div>
                    </div>
                </div>
                <span class="px-2.5 py-0.5 bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <span class="material-symbols-outlined text-xs">tune</span>
                    <span>Muvozanatli</span>
                </span>
            </div>

            <!-- Ijobiy va Salbiy Tomonlar Gridi -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                <!-- Ijobiy qiziqishlar -->
                <div class="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                    <div class="font-bold text-emerald-300 flex items-center gap-1 text-[11px]">
                        <span>🟢</span>
                        <span>Ijobiy Qiziqishlar:</span>
                    </div>
                    <p class="text-slate-300 text-[10px] leading-relaxed">
                        • <b>IT & Python dasturlash:</b> 40%<br>
                        • <b>Ilmiy tajribalar & Mantiq:</b> 25%
                    </p>
                </div>

                <!-- Salbiy / E'tibor berish kerak bo'lgan xatarlar -->
                <div class="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1">
                    <div class="font-bold text-rose-300 flex items-center gap-1 text-[11px]">
                        <span>⚠️</span>
                        <span>E'tibor berish kerak bo'lgan xatarlar:</span>
                    </div>
                    <p class="text-slate-300 text-[10px] leading-relaxed">
                        • <b>Ortiqcha o'yinlar & Shorts:</b> 35%<br>
                        • <b>Tungi ekran vaqti:</b> 22:30 dan so'ng chalg'ish
                    </p>
                </div>
            </div>

            <!-- Psixologik Tavsiya -->
            <div class="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-[10px] text-cyan-200 leading-relaxed flex items-start gap-2">
                <span class="text-sm">💡</span>
                <div>
                    <b>Psixologik tavsiya:</b> Farzandingiz bilan telefonni tortib olmasdan, o'yin vaqtini 1 soat bilan cheklab, birga sport to'garagi yoki robototexnikaga borishni rag'batlantiring.
                </div>
            </div>

            <!-- Qiziqishlar Vektorlari -->
            <div class="pt-2 border-t border-slate-800/80 space-y-2">
                <div class="text-[11px] font-bold text-slate-300" data-i18n="interestVectors">🎯 Farzand Qiziqishlari Vektorlari:</div>
                <div class="space-y-2" id="aiInterestVectors">
                    <!-- JS orqali to'ldiriladi -->
                </div>
            </div>
        </section>

        <!-- 2. Tezkor Jonli Radar & Navigatsiya Tugmasi -->
        <div class="glass-panel p-3 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400">
                    <span class="material-symbols-outlined text-lg">distance</span>
                </div>
                <div>
                    <div class="text-xs font-bold text-white">Jonli Radar & Joylashuv</div>
                    <div class="text-[9px] text-emerald-400 font-semibold">100% Bepul doimiy monitoring</div>
                </div>
            </div>
            <button onclick="switchTab('tab-radar')" class="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-bold transition flex items-center gap-1">
                <span>Xaritaga o'tish</span>
                <span class="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
        </div>

        <!-- 3. AI Interaktiv Muloqot Majmuasi (Gemini Chat, Rasm, Ovoz) -->
        <section class="glass-panel p-4 space-y-3">
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
            <div id="aiChatThread" class="ai-chat-container space-y-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col">
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
                <button onclick="sendQuickPrompt('Farzandim darslariga qiziqishini qanday oshirsam bo'ladi?')" class="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-emerald-400 transition" data-i18n="chip1">
                    💡 Darsga qiziqishni oshirish
                </button>
                <button onclick="sendQuickPrompt('Ko'rilgan Reels va video kontentlar tahlili')" class="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-emerald-400 transition" data-i18n="chip2">
                    🎬 Reels & Video tahlili
                </button>
                <button onclick="sendQuickPrompt('Ekran vaqti me'yori va batareya tahlili')" class="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-emerald-400 transition" data-i18n="chip3">
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
    <!-- ==================================================================== -->
    <!-- TAB 5: ⚙️ SOZLAMALAR (FULL SETTINGS HUB & SUBPAGES) -->
    <!-- ==================================================================== -->
    <main id="tab-settings" class="tab-content space-y-2.5 hidden">
        <div class="flex items-center justify-between px-1 mb-1">
            <h2 class="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5" data-i18n="settingsTitle">
                <span class="material-symbols-outlined text-sm text-cyan-400">settings</span>
                <span>Tizim Sozlamalari & Ma'lumotlar</span>
            </h2>
            <span class="text-[10px] text-cyan-400 font-mono font-bold">v4.4 Qalqon AI</span>
        </div>

        <!-- 1. Dastur Haqida & Bizning Maqsadimiz -->
        <div onclick="openSubpage('modal-about')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg">
                    🛡️
                </div>
                <div>
                    <div class="text-xs font-bold text-white" data-i18n="aboutAppTitle">Dastur Haqida & Asosiy Maqsad</div>
                    <div class="text-[10px] text-slate-400" data-i18n="aboutAppSub">Poyloqchilik emas — mehr, xavfsizlik va darslik nazorati</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 2. Dastur Statistikasi & Dinamik O'sish -->
        <div onclick="openSubpage('modal-app-stats')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-lg">
                    📊
                </div>
                <div>
                    <div class="text-xs font-bold text-white" data-i18n="appStatsTitle">Dastur Statistikasi & Dinamika</div>
                    <div class="text-[10px] text-slate-400" data-i18n="appStatsSub">14,820+ Ota-onalar, 23,450+ Farzandlar</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 3. Fon va Dizaynni Tanlash -->
        <div onclick="openSubpage('modal-themes')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 text-lg">
                    🎨
                </div>
                <div>
                    <div class="text-xs font-bold text-white" data-i18n="themeSelect">Fon va Dizaynni Tanlash</div>
                    <div class="text-[10px] text-slate-400" data-i18n="themeSub">12 xil eksklyuziv estetika fonlari & 3D Bo'rilar</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 4. Farzand Ma'lumotlari & Sinfi -->
        <div onclick="openChildProfileModal()" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg">
                    👶
                </div>
                <div>
                    <div class="text-xs font-bold text-white" data-i18n="profileTitle">Farzand Ma'lumotlari & Sinfi</div>
                    <div class="text-[10px] text-slate-400" data-i18n="profileSub">Ism, Username, Telefon va e-Maktab</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 5. Tilni O'zgartirish (UZ / RU) -->
        <div onclick="openSubpage('modal-languages')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 text-lg">
                    🌐
                </div>
                <div>
                    <div class="text-xs font-bold text-white" data-i18n="langSelect">Tilni O'zgartirish (Язык)</div>
                    <div class="text-[10px] text-slate-400" data-i18n="langSub">O'zbekcha / Русский</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 6. Tariflar va Obuna (Free / Pro) -->
        <div onclick="openSubpage('modal-plans')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">
                    💎
                </div>
                <div>
                    <div class="text-xs font-bold text-white" data-i18n="plansSelect">Tariflar va Obuna</div>
                    <div class="text-[10px] text-slate-400" data-i18n="plansSub">Free (Lokatsiya) / Pro (10,000 so'm)</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 7. Juftlash va Android Ilova -->
        <div onclick="openSubpage('modal-pairing')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 text-lg">
                    🛡️
                </div>
                <div>
                    <div class="text-xs font-bold text-white" data-i18n="pairingSelect">Farzandni Ulash & Android Ilova</div>
                    <div class="text-[10px] text-slate-400" data-i18n="pairingSub">Oila kodi va avtomatik juftlash</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 8. Takliflar va Fikr-mulohazalar (alhamdulillah@tmail.ton) -->
        <div onclick="openSubpage('modal-feedback')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 text-lg">
                    💡
                </div>
                <div>
                    <div class="text-xs font-bold text-white" data-i18n="feedbackTitle">Taklif va Mulohazalar</div>
                    <div class="text-[10px] text-slate-400" data-i18n="feedbackSub">alhamdulillah@tmail.ton orqali fikr yuborish</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
        </div>

        <!-- 9. Ota-ona Hisobi & Kirish (Auth Settings) -->
        <div onclick="openSubpage('modal-auth')" class="glass-panel p-3.5 flex items-center justify-between cursor-pointer hover:border-cyan-500/50 transition">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-lg">
                    👤
                </div>
                <div>
                    <div class="text-xs font-bold text-white" id="settingsAuthUsername" data-i18n="authSettingsTitle">Ota-ona Hisobi & Kirish</div>
                    <div class="text-[10px] text-emerald-400" id="settingsAuthStatus" data-i18n="authSettingsSub">Holat: To'liq Faol Kirish</div>
                </div>
            </div>
            <span class="text-slate-500 text-sm font-bold">›</span>
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

                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-[11px] font-bold text-slate-300 block mb-1" data-i18n="usernameLabel">Telegram Username</label>
                        <input type="text" id="profileUsername" placeholder="@aliyor_v" class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
                    </div>
                    <div>
                        <label class="text-[11px] font-bold text-slate-300 block mb-1" data-i18n="phoneLabel">Telefon Raqami</label>
                        <input type="tel" id="profilePhone" placeholder="+998 90 123 45 67" class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
                    </div>
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

                <!-- e-Maktab (Kundalik) Login & Paroli -->
                <div class="p-3 rounded-xl bg-slate-900/80 border border-sky-500/30 space-y-2">
                    <div class="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                        <span>📚</span>
                        <span data-i18n="emaktabSyncHeader">e-Maktab (Kundalik) Sinxronizatsiyasi</span>
                    </div>
                    <div class="text-[9px] text-slate-400 leading-tight" data-i18n="emaktabSyncDesc">
                        Baholar va davomatni avtomatik olish uchun kiritiladi (Tasdiq kodi shart emas).
                    </div>
                    <div class="grid grid-cols-2 gap-2 pt-1">
                        <div>
                            <label class="text-[10px] text-slate-300 block mb-1" data-i18n="emaktabLoginLabel">e-Maktab Login</label>
                            <input type="text" id="profileEmaktabLogin" placeholder="login_kundalik" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500">
                        </div>
                        <div>
                            <label class="text-[10px] text-slate-300 block mb-1" data-i18n="emaktabPassLabel">e-Maktab Parol</label>
                            <input type="password" id="profileEmaktabPassword" placeholder="••••••••" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500">
                        </div>
                    </div>
                </div>

                <button onclick="saveChildProfile()" class="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20" data-i18n="saveProfileBtn">
                    💾 Saqlash va Darsliklarni Yangilash
                </button>
            </div>
        </div>
    </div>

    <!-- 🎨 MODAL: FONLAR GALEREYASI -->
    <!-- 🎨 MODAL: FONLAR GALEREYASI -->
    <div id="modal-themes" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <button onclick="closeSubpage()" class="text-xs font-bold text-emerald-400" data-i18n="backBtn">← Orqaga</button>
            <h2 class="text-xs font-bold text-white" data-i18n="themeSelect">Fonlar Tanlovi</h2>
            <span class="w-8"></span>
        </div>

        <div class="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-300 flex items-center gap-2">
            <span>ℹ️</span>
            <span>Bo'ri maskotlari avtomatik ravishda Ota-ona panelida Katta Bo'ri, Farzand panelida Kichik Bo'ri holatida aks etadi.</span>
        </div>

        <div class="grid grid-cols-2 gap-3">
            <div onclick="setTheme('default')" data-theme-name="default" class="theme-card active bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 text-emerald-400">
                <div class="text-[9px] text-emerald-500">🌌 Qorong'i</div>
                <div>Cyber Dark</div>
            </div>
            <div onclick="setTheme('aurora')" data-theme-name="aurora" class="theme-card bg-gradient-to-br from-sky-950 to-emerald-950 border-sky-800 text-sky-400">
                <div class="text-[9px] text-sky-500">🌌 Shimoliy Nur</div>
                <div>Aurora Borealis</div>
            </div>
            <div onclick="setTheme('nebula')" data-theme-name="nebula" class="theme-card bg-gradient-to-br from-purple-950 to-pink-950 border-purple-800 text-purple-400">
                <div class="text-[9px] text-purple-400">🌌 Fazoviy Tuman</div>
                <div>Deep Space Nebula</div>
            </div>
            <div onclick="setTheme('sunset')" data-theme-name="sunset" class="theme-card bg-gradient-to-br from-amber-950 to-red-950 border-amber-800 text-amber-400">
                <div class="text-[9px] text-amber-400">🌅 Quyosh Botishi</div>
                <div>Sunset Glow</div>
            </div>
            <div onclick="setTheme('emerald')" data-theme-name="emerald" class="theme-card bg-gradient-to-br from-emerald-950 to-slate-950 border-emerald-800 text-emerald-300">
                <div class="text-[9px] text-emerald-400">🌲 Zumrad Matrix</div>
                <div>Emerald Matrix</div>
            </div>
            <div onclick="setTheme('sakura')" data-theme-name="sakura" class="theme-card bg-gradient-to-br from-pink-950 to-slate-950 border-pink-800 text-pink-300">
                <div class="text-[9px] text-pink-400">🌸 Pushti Sakura</div>
                <div>Sakura Mist</div>
            </div>
            <div onclick="setTheme('gold')" data-theme-name="gold" class="theme-card bg-gradient-to-br from-yellow-950 to-slate-950 border-yellow-800 text-yellow-300">
                <div class="text-[9px] text-yellow-400">👑 Qirollik Oltini</div>
                <div>Obsidian Gold</div>
            </div>
            <div onclick="setTheme('cyberpunk')" data-theme-name="cyberpunk" class="theme-card bg-gradient-to-br from-cyan-950 to-fuchsia-950 border-cyan-800 text-cyan-300">
                <div class="text-[9px] text-cyan-400">⚡ Neon Shahar</div>
                <div>Cyberpunk Night</div>
            </div>
            <div onclick="setTheme('silver')" data-theme-name="silver" class="theme-card bg-gradient-to-br from-slate-100 to-slate-300 border-slate-300 text-slate-900 shadow-md">
                <div class="text-[9px] text-sky-700 font-bold">🌟 Och Kumush</div>
                <div class="font-extrabold text-slate-900">Titanium Silver</div>
            </div>
            <div onclick="setTheme('sky')" data-theme-name="sky" class="theme-card bg-gradient-to-br from-sky-100 to-blue-200 border-sky-300 text-sky-950 shadow-md">
                <div class="text-[9px] text-cyan-700 font-bold">💎 Och Neon Tsian</div>
                <div class="font-extrabold text-sky-950">Cyber Ice Frost</div>
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

    <!-- 💎 MODAL: TARIFLAR, TELEGRAM YULDUZLARI (STARS) & TO'LOV -->
    <div id="modal-plans" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <button onclick="closeSubpage()" class="text-xs font-bold text-emerald-400">← Orqaga</button>
            <h2 class="text-xs font-bold text-white">Tariflar & Pro Obuna</h2>
            <button onclick="closeSubpage()" class="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded-lg bg-slate-800">✕</button>
        </div>

        <div class="space-y-3">
            <!-- Free Basic Plan -->
            <div class="glass-card p-4 border-emerald-500/40 relative overflow-hidden">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="text-[9px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">Bepul Reja (Free)</span>
                        <h3 class="text-sm font-bold text-white mt-1">Free Basic</h3>
                        <p class="text-[11px] text-slate-400 mt-1">📍 Jonli Lokatsiya & Radar (100% Bepul), batareya va umumiy ekran vaqti</p>
                    </div>
                    <div class="text-right">
                        <div class="text-base font-black text-white">0 so'm</div>
                        <span class="text-[10px] text-slate-500">Hozirda bepul</span>
                    </div>
                </div>
            </div>

            <!-- Pro Plan (10,000 so'm / 50 Telegram Yulduzlari) -->
            <div class="glass-card p-4 border-amber-500/50 bg-amber-500/5 relative overflow-hidden space-y-3">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="text-[9px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">Premium Farzand Nazorati</span>
                        <h3 class="text-sm font-bold text-white mt-1">Pro Versiya 💎</h3>
                        <p class="text-[11px] text-slate-300 mt-1">🧠 Gemini AI Murabbiy (Ovoz/Rasm/Matn), 📚 1-11 Sinf DTS e-Maktab 100 ballik tahlil va 🎬 Reels tahlili</p>
                    </div>
                    <div class="text-right">
                        <div class="text-base font-black text-amber-400">10,000 so'm</div>
                        <span class="text-[10px] text-slate-400">yoki ⭐ 50 Stars / oy</span>
                    </div>
                </div>

                <!-- Telegram Stars To'lov Tugmasi -->
                <div class="pt-2 border-t border-slate-800 space-y-2">
                    <button onclick="handlePayWithStars()" class="w-full py-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2">
                        <span>⭐</span>
                        <span>50 Telegram Yulduzlari Bilan To'lash (10,000 so'm)</span>
                    </button>
                    
                    <button onclick="handlePayWithCardOrTon()" class="w-full py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2">
                        <span>💳</span>
                        <span>Karta (Click / Payme) yoki 💎 TON Hamyon</span>
                    </button>
                </div>
            </div>

            <!-- Yulduzcha Sotib Olish Bo'limi -->
            <div class="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-2 text-xs">
                <div class="font-bold text-indigo-300 flex items-center gap-1.5">
                    <span>⭐</span>
                    <span>Hisobingizda Yulduzcha (Stars) Yo'qmi?</span>
                </div>
                <p class="text-[11px] text-slate-400 leading-relaxed">
                    Siz rasmiy Telegram platformasi orqali yoki to'g'ridan-to'g'ri kartangiz bilan yulduzchalarni tezkor xarid qilishingiz mumkin. Hech qanday murakkab qog'ozbozliksiz 1 soniyada faollashadi.
                </p>
                <button onclick="openStarsBuyBot()" class="w-full py-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 font-bold text-xs rounded-xl transition">
                    ⭐ Yulduzcha Xarid Qilish (Bot orqali) ↗
                </button>
            </div>
        </div>
    </div>

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

    <!-- 👨‍👩‍👧 MODAL: OTA-ONA DASTLABKI PROFILI & KENG QAMROVLI OILA WIZARD (STEP-BY-STEP) -->
    <div id="modal-parent-onboarding" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <span class="w-8"></span>
            <div class="text-center">
                <h2 class="text-xs font-black text-white">Qalqon AI — Oila Profilini Sozlash</h2>
                <div class="text-[9px] text-cyan-400 font-mono">1-Bosqich: Ota-Ona & Farzandlar Ro'yxati</div>
            </div>
            <button onclick="closeSubpage()" class="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded-lg bg-slate-800">✕</button>
        </div>

        <div class="glass-card p-5 space-y-4 rounded-3xl border-cyan-500/30 bg-slate-900/95 shadow-2xl">
            <!-- Brand Welcome Header -->
            <div class="text-center space-y-1.5 pb-2 border-b border-slate-800">
                <div class="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                    👨‍👩‍👧
                </div>
                <h3 class="text-sm font-black text-white">Xush kelibsiz, Hurmatli Ota-ona!</h3>
                <p class="text-[11px] text-slate-300 leading-relaxed">
                    Farzandlaringiz xavfsizligi va ta'limini to'liq nazorat qilish uchun oilaviy ma'lumotlarni to'ldiring.
                </p>
            </div>

            <!-- STEP 1: OTA MA'LUMOTLARI (ASOSIY FOYDALANUVCHI) -->
            <div class="space-y-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                        <span>👨</span> 1. Ota Ma'lumotlari:
                    </span>
                    <span class="text-[10px] text-slate-500 font-mono">Majburiy</span>
                </div>

                <div>
                    <label class="text-[11px] font-bold text-slate-300 block mb-1">Oila Nomi / Familiyasi:</label>
                    <input type="text" id="onboardFamilyName" placeholder="Masalan: Valijonovlar Oilasi" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium">
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-[10px] font-bold text-slate-300 block mb-1">Otaning Ismi:</label>
                        <input type="text" id="onboardParentName" placeholder="Abduquddus" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500">
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-slate-300 block mb-1">Telefon Raqami:</label>
                        <input type="tel" id="onboardParentPhone" placeholder="+998 90 123 45 67" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono">
                    </div>
                </div>

                <div>
                    <div class="flex items-center justify-between mb-1">
                        <label class="text-[10px] font-bold text-slate-300">Otaning Telegram Usernamesi:</label>
                        <button type="button" onclick="openUsernameGuideModal()" class="text-[10px] text-cyan-400 hover:underline flex items-center gap-0.5">
                            <span>ℹ️</span> Username olish
                        </button>
                    </div>
                    <div class="relative">
                        <span class="absolute left-3 top-2 text-xs text-slate-500 font-bold">@</span>
                        <input type="text" id="onboardParentUsername" placeholder="superman_uzb" class="w-full bg-slate-900 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono">
                    </div>
                </div>
            </div>

            <!-- STEP 2: ONA MA'LUMOTLARI (TURMUSH O'RTOG'I) -->
            <div class="space-y-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span class="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                    <span>👩</span> 2. Ona Ma'lumotlari (Turmush o'rtog'i):
                </span>

                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-[10px] font-bold text-slate-300 block mb-1">Onaning Ismi:</label>
                        <input type="text" id="onboardMotherName" placeholder="Dilnoza" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500">
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-slate-300 block mb-1">Telefoni:</label>
                        <input type="tel" id="onboardMotherPhone" placeholder="+998 91 234 56 78" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono">
                    </div>
                </div>

                <div>
                    <label class="text-[10px] font-bold text-slate-300 block mb-1">Onaning Telegram Usernamesi:</label>
                    <div class="relative">
                        <span class="absolute left-3 top-2 text-xs text-slate-500 font-bold">@</span>
                        <input type="text" id="onboardMotherUsername" placeholder="ona_username" class="w-full bg-slate-900 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono">
                    </div>
                </div>
            </div>

            <!-- STEP 3: FARZANDLAR MA'LUMOTLARI (1-FARZAND) -->
            <div class="space-y-3 p-3.5 rounded-2xl bg-slate-950/80 border border-indigo-500/40">
                <span class="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <span>👦</span> 3. Birinchi Farzand Ma'lumotlari:
                </span>

                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="text-[10px] font-bold text-slate-300 block mb-1">Farzand Ismi:</label>
                        <input type="text" id="onboardChildName" placeholder="Aliyor" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500">
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-slate-300 block mb-1">Sinfi (1-11 Sinf DTS):</label>
                        <select id="onboardChildGrade" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500">
                            <option value="1">1-sinf</option>
                            <option value="2">2-sinf</option>
                            <option value="3">3-sinf</option>
                            <option value="4">4-sinf</option>
                            <option value="5" selected>5-sinf</option>
                            <option value="6">6-sinf</option>
                            <option value="7">7-sinf</option>
                            <option value="8">8-sinf</option>
                            <option value="9">9-sinf</option>
                            <option value="10">10-sinf</option>
                            <option value="11">11-sinf</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="text-[10px] font-bold text-slate-300 block mb-1">Farzandning Telegram Usernamesi:</label>
                    <div class="relative">
                        <span class="absolute left-3 top-2 text-xs text-slate-500 font-bold">@</span>
                        <input type="text" id="onboardChildUsername" placeholder="aliyor_2012" class="w-full bg-slate-900 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono">
                    </div>
                    <p class="text-[9px] text-amber-300/80 mt-1">⚠️ Eslatma: Farzand ushbu username orqali 4 ta qoidaga rozilik bergach ma'lumotlar ko'rinadi.</p>
                </div>
            </div>

            <!-- UNIFIED FAMILY CODE INFO -->
            <div class="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                <div>
                    <span class="text-[10px] text-indigo-300 font-bold block">🔑 Barcha A'zolar Uchun Yagona Oila Kodi:</span>
                    <span class="text-xs text-slate-300">Ota, ona va farzandlar bitta kod orqali ulanadi.</span>
                </div>
                <div class="text-sm font-black text-cyan-400 font-mono px-3 py-1 bg-slate-900 rounded-xl border border-cyan-500/40">
                    849-210
                </div>
            </div>

            <!-- Submit Button -->
            <button onclick="handleCompleteParentOnboarding()" class="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-black text-xs md:text-sm rounded-2xl shadow-xl shadow-cyan-500/25 transition flex items-center justify-center gap-2">
                <span>🛡️</span>
                <span>Oilani Saqlash va Adminga So'rov Yuborish</span>
            </button>
        </div>
    </div>

    <!-- ℹ️ MODAL: TELEGRAM USERNAME OLISH YO'RIQNOTMASI -->
    <div id="modal-username-guide" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <button onclick="closeSubpage()" class="text-xs font-bold text-cyan-400">← Orqaga</button>
            <h2 class="text-xs font-bold text-white">Telegram Username Yo'riqnomasi</h2>
            <button onclick="closeSubpage()" class="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded-lg bg-slate-800">✕</button>
        </div>

        <div class="glass-card p-4 space-y-3.5 text-xs text-slate-200">
            <div class="text-center space-y-1 pb-2 border-b border-slate-800">
                <span class="text-3xl">📱✨</span>
                <h3 class="text-sm font-black text-white">Telegramda Username Qanday Belgilanadi?</h3>
            </div>

            <ol class="space-y-2.5 list-decimal list-inside text-[11px] text-slate-300 leading-relaxed">
                <li>Telegram ilovangizni oching va <b>Sozlamalar (Настройки / Settings)</b> bo'limiga kiring;</li>
                <li>O'z profil rasmingiz ostidagi <b>«Foydalanuvchi nomi» (Имя пользователя / Username)</b> qatorini bosing;</li>
                <li>O'zingizga qulay nom yozing (Masalan: <code>superman_uzb</code> yoki <code>aliyor_2012</code>);</li>
                <li>Yuqori o'ng burchakdagi <b>✓ (Saqlash)</b> tugmasini bosing;</li>
                <li>Shundan so'ng ushbu nomni Qalqon AI tizimiga kiriting!</li>
            </ol>

            <button onclick="closeSubpage(); openSubpage('modal-parent-onboarding');" class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition">
                « Tushundim, Ro'yxatdan O'tishga Qaytish
            </button>
        </div>
    </div>

    <!-- ⏳ MODAL / OVERLAY: ADMIN TASDIG'I KUTILMOQDA (PENDING BANNER) -->
    <div id="pendingApprovalOverlay" class="fixed inset-0 z-[99998] bg-[#13131bcc] backdrop-blur-md flex items-center justify-center p-4 hidden">
        <div class="glass-panel p-6 max-w-sm w-full space-y-4 text-center border-amber-500/40 bg-slate-900/95 rounded-3xl shadow-2xl">
            <div class="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl animate-bounce">
                ⏳
            </div>
            <div class="space-y-1">
                <h3 class="text-sm font-black text-white">So'rov Adminga Yuborildi!</h3>
                <p class="text-xs text-slate-300 leading-relaxed">
                    Sizning hisobingiz yagona bosh administratorga (@ai_loyihachi) tekshirish va tasdiqlash uchun muvaffaqiyatli yetkazildi.
                </p>
            </div>
            <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 text-left space-y-1">
                <div>🛡️ <b>Holat:</b> <code>Kutilmoqda (Pending)</code></div>
                <div>ℹ️ Administrator tasdiqlaguniga qadar tizimdan <b>Test / Demo</b> rejimida foydalanishingiz mumkin.</div>
            </div>
            <button onclick="document.getElementById('pendingApprovalOverlay').classList.add('hidden')" class="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold text-xs rounded-2xl shadow-lg transition">
                👀 Test Rejimida Davom Etish
            </button>
        </div>
    </div>

    <!-- 🔘 FLOATING BOTTOM-RIGHT QUICK MENU BUTTON -->
    <div class="fixed bottom-20 right-4 z-[99990]">
        <div class="relative">
            <button onclick="toggleQuickMenu()" class="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 font-black shadow-xl shadow-cyan-500/40 flex items-center justify-center text-xl hover:scale-105 transition active:scale-95 border-2 border-white/40">
                ⚙️
            </button>
            <div id="quickMenuDropdown" class="absolute bottom-14 right-0 w-48 bg-slate-900/95 border border-slate-700 rounded-2xl p-2 shadow-2xl backdrop-blur-xl space-y-1 hidden">
                <button onclick="openSubpage('modal-plans'); toggleQuickMenu();" class="w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold text-amber-300 hover:bg-slate-800 flex items-center gap-2">
                    <span>⭐</span> <span>Stars To'lov Boti</span>
                </button>
                <button onclick="copyPairingLink(); toggleQuickMenu();" class="w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold text-cyan-300 hover:bg-slate-800 flex items-center gap-2">
                    <span>🔗</span> <span>Farzand Havolasi</span>
                </button>
                <button onclick="openSubpage('modal-parent-onboarding'); toggleQuickMenu();" class="w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold text-slate-300 hover:bg-slate-800 flex items-center gap-2">
                    <span>👨‍👩‍👧</span> <span>Oila Ma'lumotlari</span>
                </button>
                <button onclick="openSubpage('modal-settings'); toggleQuickMenu();" class="w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold text-slate-300 hover:bg-slate-800 flex items-center gap-2">
                    <span>⚙️</span> <span>Sozlamalar</span>
                </button>
            </div>
        </div>
    </div>

    <!-- ➕ MODAL: YANGI FARZAND QO'SHISH -->
    <div id="modal-add-child" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <button onclick="closeSubpage()" class="text-xs font-bold text-emerald-400">← Orqaga</button>
            <h2 class="text-xs font-bold text-white">Yangi Farzand Qo'shish</h2>
            <span class="w-8"></span>
        </div>

        <div class="glass-card p-4 space-y-3">
            <div class="text-center space-y-1">
                <span class="text-3xl">👦</span>
                <h3 class="text-sm font-bold text-white">Farzand Profilini Yaratish</h3>
                <p class="text-[11px] text-slate-300">Har bir farzand uchun alohida unikal ID va darsliklar dasturi biriktiriladi.</p>
            </div>

            <div class="space-y-2.5 pt-1 text-xs">
                <div>
                    <label class="text-[11px] font-bold text-slate-300 block mb-1">Farzand Ism-Familiyasi</label>
                    <input type="text" id="newChildNameInput" placeholder="Masalan: Jasur Alimov" class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500">
                </div>

                <div>
                    <label class="text-[11px] font-bold text-slate-300 block mb-1">Sinfi (1-11 Sinf DTS)</label>
                    <select id="newChildGradeInput" class="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500">
                        <option value="1">1-sinf</option>
                        <option value="2">2-sinf</option>
                        <option value="3">3-sinf</option>
                        <option value="4">4-sinf</option>
                        <option value="5" selected>5-sinf</option>
                        <option value="6">6-sinf</option>
                        <option value="7">7-sinf</option>
                        <option value="8">8-sinf</option>
                        <option value="9">9-sinf</option>
                        <option value="10">10-sinf</option>
                        <option value="11">11-sinf</option>
                    </select>
                </div>

                <button onclick="handleAddNewChildSubmit()" class="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition">
                    ➕ Ro'yxatga Qo'shish
                </button>
            </div>
        </div>
    </div>

    <!-- ℹ️ MODAL: DASTUR HAQIDA & ASOSIY MAQSAD (POYLOQCHILIK EMAS — MEHR VA XAVFSIZLIK) -->
    <div id="modal-about" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <button onclick="closeSubpage()" class="text-xs font-bold text-emerald-400" data-i18n="backBtn">← Orqaga</button>
            <h2 class="text-xs font-bold text-white" data-i18n="aboutAppModalTitle">Dastur Haqida & Bizning Maqsadimiz</h2>
            <span class="w-8"></span>
        </div>

        <div class="glass-card p-4 space-y-3.5 leading-relaxed">
            <div class="text-center space-y-1 pb-1">
                <span class="text-3xl">🛡️</span>
                <h3 class="text-sm font-black text-white" data-i18n="aboutManifestTitle">Poyloqchilik Emas — Mehr, Ishonch va Xavfsizlik!</h3>
                <p class="text-[11px] text-emerald-400 font-semibold" data-i18n="aboutManifestSubtitle">Zamonaviy raqamli dunyoda farzandingizning eng yaqin himoyachisi</p>
            </div>

            <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-[11px] text-slate-300">
                <p data-i18n="aboutText1">
                    Hurmatli ota-onalar! <b>Qalqon AI</b> tizimining bosh falsafasi hech qachon bolaning orqasidan poyloqchilik qilish yoki uning shaxsiy erkinligini cheklash emas.
                </p>
                <p data-i18n="aboutText2">
                    Bizning asosiy maqsadimiz — farzandimizni raqamli xavf-xatarlardan asrash, darslarni 100 ballik DTS davlat standarti bo'yicha a'lo o'zlashtirishiga yordam berish va oilada o'zaro ishonch muhitini mustahkamlashdir.
                </p>
            </div>

            <div class="space-y-2 text-[11px]">
                <div class="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2 text-emerald-200">
                    <span class="text-base">🔒</span>
                    <div>
                        <div class="font-bold text-white" data-i18n="aboutPrivacyHead">100% Shaffoflik va Maxfiylik:</div>
                        <div class="text-[10px] text-slate-300 mt-0.5" data-i18n="aboutPrivacyBody">Biz shaxsiy chatlarni o'qimaymiz va videolarni tomosha qilmaymiz. Tizim faqat qiziqish vektorlari va darsliklar tahlilini yuritadi.</div>
                    </div>
                </div>

                <div class="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-2 text-indigo-200">
                    <span class="text-base">🧠</span>
                    <div>
                        <div class="font-bold text-white" data-i18n="aboutAiHead">Gemini AI Yordamchi & Repetitor:</div>
                        <div class="text-[10px] text-slate-300 mt-0.5" data-i18n="aboutAiBody">Qiyin darslik topshiriqlarini rasmga olib yuborish orqali bolaga do'stona va tushunarli yechimlar taqdim etiladi.</div>
                    </div>
                </div>
            </div>

            <!-- Email va Murojaat -->
            <div class="p-3.5 rounded-xl bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/30 text-center space-y-2">
                <div class="text-[10px] text-slate-400" data-i18n="aboutContactHint">Loyiha bo'yicha taklif, mulohaza va murojaatlaringiz uchun rasmiy manzil:</div>
                <div class="text-sm font-black text-teal-300 font-mono select-all">alhamdulillah@tmail.ton</div>
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=alhamdulillah@tmail.ton&su=Shield+Parental+Guard+Murojaat" target="_blank" class="w-full py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2">
                    <span>✉️</span>
                    <span data-i18n="writeGmailBtn">Gmail orqali xat yozish</span>
                </a>
            </div>
        </div>
    </div>

    <!-- 📊 MODAL: DASTUR STATISTIKASI & DINAMIK O'SISH (FOYDALANUVCHILAR SONI VA DINAMIKASI) -->
    <div id="modal-app-stats" class="subpage-modal space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <button onclick="closeSubpage()" class="text-xs font-bold text-emerald-400" data-i18n="backBtn">← Orqaga</button>
            <h2 class="text-xs font-bold text-white" data-i18n="appStatsModalTitle">Dastur Statistikasi & Dinamika</h2>
            <span class="w-8"></span>
        </div>

        <div class="space-y-3.5">
            <!-- Asosiy 2 ta Hisoblagich: Ota-onalar va Farzandlar soni (Faqat soni) -->
            <div class="grid grid-cols-2 gap-3">
                <div class="glass-card p-4 text-center border-emerald-500/40 relative overflow-hidden bg-gradient-to-b from-emerald-950/30 to-slate-900/80">
                    <span class="text-2xl">👨‍👩‍👧</span>
                    <div class="text-2xl font-black text-emerald-400 font-mono tracking-tight mt-1" id="statParentsCount">14,820</div>
                    <div class="text-[10px] font-bold text-slate-300 mt-0.5" data-i18n="statParentsLabel">Ulangan Ota-onalar</div>
                    <div class="text-[8px] text-emerald-400 mt-1 flex items-center justify-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>+18.4% oylik o'sish</span>
                    </div>
                </div>

                <div class="glass-card p-4 text-center border-indigo-500/40 relative overflow-hidden bg-gradient-to-b from-indigo-950/30 to-slate-900/80">
                    <span class="text-2xl">👦</span>
                    <div class="text-2xl font-black text-indigo-400 font-mono tracking-tight mt-1" id="statChildrenCount">23,450</div>
                    <div class="text-[10px] font-bold text-slate-300 mt-0.5" data-i18n="statChildrenLabel">Ulangan Farzandlar</div>
                    <div class="text-[8px] text-indigo-400 mt-1 flex items-center justify-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                        <span>+24.6% oylik o'sish</span>
                    </div>
                </div>
            </div>

            <!-- Qo'shimcha faollik metrikalari -->
            <div class="grid grid-cols-2 gap-2">
                <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <div class="text-base font-black text-sky-400 font-mono">185,200</div>
                    <div class="text-[9px] text-slate-400 mt-0.5">Tahlil qilingan darslar</div>
                </div>
                <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <div class="text-base font-black text-amber-400 font-mono">940,500</div>
                    <div class="text-[9px] text-slate-400 mt-0.5">Radar bildirishnomalari</div>
                </div>
            </div>

            <!-- Dinamik O'sish Grafik Surat/Diagrammasi -->
            <div class="glass-card p-4 space-y-3 border-slate-800">
                <div class="flex items-center justify-between pb-1">
                    <div>
                        <h4 class="text-xs font-bold text-white">📈 Foydalanuvchilar Dinamik O'sishi</h4>
                        <div class="text-[9px] text-slate-400">Oylik faol qamrov dinamikasi</div>
                    </div>
                    <span class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">+34.5% ↗</span>
                </div>

                <!-- SVG Dinamik Trend Grafigi -->
                <div class="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                    <svg viewBox="0 0 300 90" class="w-full h-24 overflow-visible">
                        <defs>
                            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="#10b981" stop-opacity="0.4"/>
                                <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
                            </linearGradient>
                        </defs>
                        <path d="M 0,75 Q 50,70 100,55 T 200,35 T 300,10 L 300,90 L 0,90 Z" fill="url(#chartGrad)"/>
                        <path d="M 0,75 Q 50,70 100,55 T 200,35 T 300,10" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round"/>
                        <circle cx="100" cy="55" r="4" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
                        <circle cx="200" cy="35" r="4" fill="#38bdf8" stroke="#ffffff" stroke-width="2"/>
                        <circle cx="300" cy="10" r="5" fill="#818cf8" stroke="#ffffff" stroke-width="2" class="animate-ping"/>
                    </svg>
                    <div class="flex justify-between text-[9px] text-slate-400 font-mono pt-1">
                        <span>May (8k)</span>
                        <span>Iyun (15k)</span>
                        <span>Iyul (26k)</span>
                        <span class="text-emerald-400 font-bold">Avgust (38k+)</span>
                    </div>
                </div>

                <!-- Hududiy Qamrov -->
                <div class="space-y-1.5 pt-1 text-[10px]">
                    <div class="text-[10px] font-bold text-slate-300">O'zbekiston hududlari bo'yicha qamrov:</div>
                    <div class="space-y-1">
                        <div class="flex items-center justify-between text-slate-300">
                            <span>Toshkent sh. va viloyati</span>
                            <span class="font-mono text-emerald-400 font-bold">38%</span>
                        </div>
                        <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div class="bg-emerald-500 h-full rounded-full" style="width: 38%"></div>
                        </div>

                        <div class="flex items-center justify-between text-slate-300">
                            <span>Farg'ona vodiysi</span>
                            <span class="font-mono text-sky-400 font-bold">24%</span>
                        </div>
                        <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div class="bg-sky-500 h-full rounded-full" style="width: 24%"></div>
                        </div>

                        <div class="flex items-center justify-between text-slate-300">
                            <span>Samarqand, Buxoro, Xorazm va boshqalar</span>
                            <span class="font-mono text-indigo-400 font-bold">38%</span>
                        </div>
                        <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div class="bg-indigo-500 h-full rounded-full" style="width: 38%"></div>
                        </div>
                    </div>
                </div>
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
    <!-- ==================================================================== -->
    <!-- ==================================================================== -->
    <!-- OTA-ONA BOTTOM NAVIGATION BAR (STITCH 5 TA BO'LIM) -->
    <!-- ==================================================================== -->
    <nav id="parentBottomNav" class="bottom-nav">
        <button onclick="switchTab('tab-dashboard')" id="nav-tab-dashboard" class="nav-btn active">
            <span class="material-symbols-outlined">home</span>
            <span data-i18n="navDashboard">Asosiy</span>
        </button>

        <button onclick="switchTab('tab-radar')" id="nav-tab-radar" class="nav-btn">
            <span class="material-symbols-outlined">distance</span>
            <span data-i18n="navRadar">Radar (Bepul)</span>
        </button>

        <button onclick="switchTab('tab-ai')" id="nav-tab-ai" class="nav-btn">
            <span class="material-symbols-outlined">psychology</span>
            <span data-i18n="navAi">AI Murabbiy 💎</span>
        </button>

        <button onclick="switchTab('tab-school')" id="nav-tab-school" class="nav-btn">
            <span class="material-symbols-outlined">school</span>
            <span data-i18n="navSchool">e-Maktab 💎</span>
        </button>

        <button onclick="switchTab('tab-settings')" id="nav-tab-settings" class="nav-btn">
            <span class="material-symbols-outlined">settings</span>
            <span data-i18n="navSettings">Sozlamalar</span>
        </button>
    </nav>

    <!-- ==================================================================== -->
    <!-- FARZAND BOTTOM NAVIGATION BAR (STITCH 5 TA FARZAND BO'LIMI) -->
    <!-- ==================================================================== -->
    <nav id="childBottomNav" class="bottom-nav hidden">
        <button onclick="switchChildTab('child-tab-home')" id="nav-child-tab-home" class="nav-btn active">
            <span class="material-symbols-outlined">home</span>
            <span data-i18n="childNavHome">Asosiy</span>
        </button>

        <button onclick="switchChildTab('child-tab-ai')" id="nav-child-tab-ai" class="nav-btn">
            <span class="material-symbols-outlined">smart_toy</span>
            <span data-i18n="childNavAi">AI Do'st</span>
        </button>

        <button onclick="switchChildTab('child-tab-rewards')" id="nav-child-tab-rewards" class="nav-btn">
            <span class="material-symbols-outlined">military_tech</span>
            <span data-i18n="childNavRewards">Yutuqlar</span>
        </button>

        <button onclick="switchChildTab('child-tab-school')" id="nav-child-tab-school" class="nav-btn">
            <span class="material-symbols-outlined">menu_book</span>
            <span data-i18n="childNavSchool">e-Maktabim</span>
        </button>

        <button onclick="switchChildTab('child-tab-settings')" id="nav-child-tab-settings" class="nav-btn">
            <span class="material-symbols-outlined">settings</span>
            <span>Sozlamalar</span>
        </button>
    </nav>

    <!-- Custom JavaScript -->
    <script>
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

    if (titleEl) titleEl.innerText = \`\${grade}-Sinf \${subject}\`;
    if (subEl) subEl.innerText = \`\${page}-Sahifa • 80 KB Tezkor Nusxa\`;
    if (badgeEl) badgeEl.innerText = \`📚 \${grade}-SINF \${subject.toUpperCase()}\`;
    if (numEl) numEl.innerText = \`\${page}-BET\`;
    if (chNumEl) chNumEl.innerText = \`\${subject.toUpperCase()} • DTS DASTURI\`;
    if (chTitleEl) chTitleEl.innerText = chapter;
    if (ruleEl) ruleEl.innerText = rule;

    if (formula && formulaDispEl && formContEl) {
        formContEl.classList.remove('hidden');
        formulaDispEl.innerText = formula;
    } else if (formContEl) {
        formContEl.classList.add('hidden');
    }

    if (exEl) {
        exEl.innerText = example || \`Masala: \${chapter} mavzusi bo'yicha qoidani qo'llab, amallarni bajaring.\`;
    }

    openSubpage('modal-book-page-viewer');
}

function askCurrentPageToAi() {
    if (!currentViewingTopic) return;
    closeSubpage();
    const inputChild = document.getElementById('childAiInput');
    if (inputChild) {
        inputChild.value = \`\${currentViewingTopic.chapter} (\${currentViewingTopic.page}-bet) mavzusini tushuntir\`;
        switchChildTab('child-tab-ai');
        handleChildAiSend();
    }
}

function shareOrDownloadPage() {
    if (!currentViewingTopic) return;
    alert(\`✅ \${currentViewingTopic.grade}-sinf \${currentViewingTopic.subject} darsligining \${currentViewingTopic.page}-beti (80 KB WebP) yuklab olindi!\`);
}

// ============================================================================
// 🧠 QALQON AI — 1-11 SINF DTS RAG BILIMLAR BAZASI & ENGINE
// ============================================================================
const DTS_KNOWLEDGE_BASE = [{"grade": 1, "subject": "Matematika", "chapter": "20 ichida qo'shish va ayirish", "page": 35, "rule": "Sonlarni qo'shishda o'nlik hosil qilish: masalan, 8 + 5 ni hisoblash uchun 5 soni 2 va 3 ga ajratiladi. 8 + 2 = 10, 10 + 3 = 13.", "formula": "a + b = c (Qo'shiluvchi + Qo'shiluvchi = Yig'indi)", "keywords": ["qo'shish", "ayirish", "1-sinf", "yig'indi", "ayirma", "sanoq"]}, {"grade": 2, "subject": "Matematika", "chapter": "Ko'paytirish va Bo'lish jadvali", "page": 48, "rule": "Ko'paytirish — bir xil qo'shiluvchilar yig'indisidir. Masalan: 3 * 4 = 3 + 3 + 3 + 3 = 12. Ko'paytuvchilar o'rni almashgani bilan ko'paytma o'zgarmaydi (a * b = b * a).", "formula": "a * b = c (Ko'paytuvchi * Ko'paytuvchi = Ko'paytma)", "keywords": ["ko'paytirish", "bo'lish", "jadval", "2-sinf", "ko'paytma"]}, {"grade": 3, "subject": "Ona tili va O'qish", "chapter": "So'z turkumlari: Ot, Sifat, Fe'l", "page": 56, "rule": "Shaxs va narsa nomini bildirgan so'zlar Ot (Kim? Nima?), belgisini bildirgan so'zlar Sifat (Qanday? Qanaqa?), harakatini bildirgan so'zlar Fe'l (Nima qildi? Nima qilyapti?) deyiladi.", "formula": "Ot: Kim? Nima? | Sifat: Qanday? | Fe'l: Nima qildi?", "keywords": ["ot", "sifat", "fe'l", "ona tili", "3-sinf", "so'z turkumi"]}, {"grade": 4, "subject": "Matematika", "chapter": "Ko'p xonali sonlar va Geometrik shakllar", "page": 74, "rule": "To'g'ri to'rtburchakning perimetri barcha tomonlari yig'indisiga teng: P = 2 * (a + b). Yuzi esa bo'yi va eni ko'paytmasiga teng: S = a * b.", "formula": "P = 2(a + b); S = a * b", "keywords": ["perimetr", "yuza", "to'g'ri to'rtburchak", "4-sinf", "geometriya"]}, {"grade": 5, "subject": "Matematika", "chapter": "Oddiy va O'nli Kasrlar", "page": 42, "rule": "Har xil maxrajli oddiy kasrlarni qo'shish yoki ayirish uchun avval ularni eng kichik umumiy maxrajga (EKUK) keltirish, so'ng suratlarni qo'shish yoki ayirish kerak. Kasrlarni ko'paytirishda surat suratga, maxraj maxrajga ko'paytiriladi.", "formula": "a/b + c/d = (a*d + c*b)/(b*d); (a/b) * (c/d) = (a*c)/(b*d)", "keywords": ["kasr", "oddiy kasr", "o'nli kasr", "maxraj", "surat", "5-sinf", "ekuk", "ekub"]}, {"grade": 5, "subject": "Ingliz tili", "chapter": "Present Simple Tense (Hozirgi oddiy zamon)", "page": 28, "rule": "Doimiy takrorlanadigan odatlar va faktlar uchun Present Simple ishlatiladi. He/She/It olmoshlaridan so'ng fe'lga -s yoki -es qo'shimchasi qo'shiladi. Inkor shakli: don't / doesn't + V1.", "formula": "Subject + Verb(s/es) | I work, He works | Do/Does + Subject + Verb?", "keywords": ["present simple", "ingliz tili", "5-sinf", "grammar", "verb", "tenses"]}, {"grade": 6, "subject": "Matematika", "chapter": "Nisbat, Proporsiya va Foizlar", "page": 64, "rule": "Ikki nisbatning tengligi proporsiya deyiladi: a/b = c/d. Proporsiyaning asosiy xossasi: chetki hadlar ko'paytmasi o'rta hadlar ko'paytmasiga teng (a * d = b * c). Sonning foizini topish uchun sonni foizga ko'paytirib 100 ga bo'linadi.", "formula": "a/b = c/d => a*d = b*c; A sonining p% = (A * p) / 100", "keywords": ["proporsiya", "foiz", "nisbat", "6-sinf", "matematika", "tenglama"]}, {"grade": 6, "subject": "Botanika", "chapter": "O'simlik hujayrasi va Fotosintez", "page": 38, "rule": "O'simliklar quyosh nuri, suv va karbonat angidrid (CO2) yordamida xlorofill orqali organik moddalar va kislorod (O2) ishlab chiqaradi. Bu jarayon fotosintez deyiladi.", "formula": "6CO2 + 6H2O + Quyosh nuri => C6H12O6 (Glyukoza) + 6O2", "keywords": ["fotosintez", "botanika", "hujayra", "xlorofill", "kislorod", "6-sinf"]}, {"grade": 7, "subject": "Algebra", "chapter": "Chiziqli tenglamalar va Qisqa ko'paytirish formulalari", "page": 55, "rule": "Qisqa ko'paytirish formulalari hisoblashni osonlashtiradi: Yig'indining kvadrati (a+b)^2 = a^2 + 2ab + b^2. Kvadratlar ayirmasi: a^2 - b^2 = (a-b)(a+b).", "formula": "(a + b)^2 = a^2 + 2ab + b^2; a^2 - b^2 = (a - b)(a + b)", "keywords": ["algebra", "qisqa ko'paytirish", "7-sinf", "kvadrat", "tenglama", "ko'phad"]}, {"grade": 7, "subject": "Fizika", "chapter": "Tezlik, Zichlik va Nyutonning 1-qonuni", "page": 40, "rule": "Tezlik — bosib o'tilgan yo'lning ketgan vaqtga nisbatidir: v = S / t. Jismning zichligi esa massaning hajmga nisbatidir: rho = m / V. Nyuton 1-qonuni: Jismga tashqi kuch ta'sir etmasa, u tinch turadi yoki to'g'ri chiziqli tekis harakatlanadi.", "formula": "v = S / t; rho = m / V; F = m * a", "keywords": ["fizika", "tezlik", "zichlik", "nyuton", "massa", "7-sinf", "kuch"]}, {"grade": 8, "subject": "Geometriya", "chapter": "Pifagor Teoremasi va To'g'ri burchakli uchburchak", "page": 78, "rule": "To'g'ri burchakli uchburchakda gipotenuza kvadratining qiymati katetlar kvadratlari yig'indisiga teng: c^2 = a^2 + b^2. Uchburchak ichki burchaklari yig'indisi har doim 180 gradusga teng.", "formula": "c^2 = a^2 + b^2; alpha + beta + gamma = 180°", "keywords": ["pifagor", "gipotenuza", "katet", "uchburchak", "geometriya", "8-sinf"]}, {"grade": 8, "subject": "Fizika", "chapter": "Elektr toki, Kuchlanish va Om qonuni", "page": 92, "rule": "Zanjir qismidagi tok kuchi (I) kuchlanishga (U) to'g'ri proporsional va qarshilikka (R) teskari proporsionaldir: I = U / R. Elektr toki zaryadlangan zarrachalarning tartibli harakatidir.", "formula": "I = U / R; P = U * I (Elektr quvvati)", "keywords": ["om qonuni", "tok kuchi", "kuchlanish", "qarshilik", "fizika", "8-sinf", "elektr"]}, {"grade": 8, "subject": "Kimyo", "chapter": "Mendeleyev davriy jadvali va Kimyoviy bog'lanish", "page": 62, "rule": "Elementlarning xossalari ularning atom yadrosi zaryadiga davriy bog'liqdir. Valentlik — atomning boshqa atomlarni biriktirib olish qobiliyati. Suv molekulasi H2O kovalent qutbli bog'lanishga ega.", "formula": "M(H2O) = 1*2 + 16 = 18 g/mol; n = m / M", "keywords": ["kimyo", "mendeleyev", "valentlik", "atom", "molekula", "8-sinf", "davriy qonun"]}, {"grade": 9, "subject": "Algebra", "chapter": "Kvadrat tenglamalar va Viyet Teoremasi", "page": 85, "rule": "ax^2 + bx + c = 0 kvadrat tenglama diskriminant D = b^2 - 4ac orqali yechiladi. D > 0 bo'lsa 2 ta ildiz, D = 0 bo'lsa 1 ta ildiz, D < 0 bo'lsa haqiqiy ildiz yo'q. Viyet teoremasi: x1 + x2 = -b/a, x1 * x2 = c/a.", "formula": "D = b^2 - 4ac; x = (-b +- sqrt(D)) / (2a); x1+x2 = -b/a, x1*x2 = c/a", "keywords": ["kvadrat tenglama", "diskriminant", "viyet", "ildiz", "algebra", "9-sinf"]}, {"grade": 10, "subject": "Algebra va Analiz", "chapter": "Trigonometrik funksiyalar va Asosiy ayniyatlar", "page": 110, "rule": "Asosiy trigonometrik ayniyat: sin^2(x) + cos^2(x) = 1. Tangens tg(x) = sin(x) / cos(x). Ikkilangan burchak formulasi: sin(2x) = 2*sin(x)*cos(x).", "formula": "sin^2(alpha) + cos^2(alpha) = 1; tg(alpha) = sin(alpha)/cos(alpha)", "keywords": ["trigonometriya", "sinus", "kosinus", "tangens", "10-sinf", "analiz"]}, {"grade": 10, "subject": "Fizika", "chapter": "Molekulyar fizika va Termodinamika qonunlari", "page": 95, "rule": "Ideal gaz holat tenglamasi (Mendeleyev-Klapeyron): P * V = (m/M) * R * T. Termodinamikaning 1-qonuni: Tizimga berilgan issiqlik miqdori uning ichki energiyasini oshirishga va tashqi kuchlarga qarshi ish bajarishga sarflanadi (Q = deltaU + A).", "formula": "P * V = nu * R * T; Q = deltaU + A", "keywords": ["termodinamika", "ideal gaz", "issiqlik", "fizika", "10-sinf", "klapeyron"]}, {"grade": 11, "subject": "Algebra va Analiz", "chapter": "Hosilalar va Integrallar (Matematik analiz)", "page": 130, "rule": "Hosila — funksiyaning o'zgarish tezligini ifodalaydi. (x^n)' = n * x^(n-1). Boshlang'ich funksiya (aniqmas integral) esa differensiallashning teskarisidir: integral(x^n dx) = (x^(n+1))/(n+1) + C.", "formula": "(x^n)' = n * x^(n-1); (sin x)' = cos x; integral(x^n dx) = x^(n+1)/(n+1) + C", "keywords": ["hosila", "integral", "differensial", "11-sinf", "analiz", "matematika"]}, {"grade": 11, "subject": "Fizika", "chapter": "Optika, Kvant fizikasi va Eynshteyn formulasi", "page": 145, "rule": "Yorug'lik ham to'lqin, ham zarracha (foton) tabiatiga ega (korpuskulyar-to'lqin dualizmi). Foton energiyasi E = h * nu ga teng. Eynshteynning mashhur massa va energiya ekvivalentligi formulasi: E = m * c^2.", "formula": "E = h * nu; E = m * c^2; lambda = c / nu", "keywords": ["kvant", "foton", "eynshteyn", "optika", "fizika", "11-sinf", "yorug'lik"]}, {"grade": 11, "subject": "Informatika", "chapter": "Python Dasturlash & Sun'iy Intellekt Asoslari", "page": 80, "rule": "Pythonda ma'lumotlar turlari (int, float, str, list, dict). Shart operatorlari (if-elif-else) va sikllar (for, while). Sun'iy intellekt (Machine Learning) ma'lumotlar to'plami (dataset) orqali naqshlarni o'rganadi.", "formula": "def calculate_dts(score): return 'A' if score >= 86 else 'B'", "keywords": ["python", "dasturlash", "informatika", "11-sinf", "ai", "algoritm"]}];

function searchDtsKnowledge(query, gradeFilter = null) {
    if (!query) return null;
    const lowerQ = query.toLowerCase().trim();
    const words = lowerQ.split(/\\s+/);

    let bestMatch = null;
    let maxScore = 0;

    DTS_KNOWLEDGE_BASE.forEach(module => {
        let score = 0;
        if (gradeFilter && module.grade === Number(gradeFilter)) {
            score += 3;
        }

        // Match keywords
        module.keywords.forEach(kw => {
            if (lowerQ.includes(kw.toLowerCase())) score += 4;
        });

        // Match subject or chapter
        if (lowerQ.includes(module.subject.toLowerCase())) score += 3;
        if (lowerQ.includes(module.chapter.toLowerCase())) score += 5;

        // Word overlap in rule
        words.forEach(w => {
            if (w.length > 3 && module.rule.toLowerCase().includes(w)) score += 1;
        });

        if (score > maxScore) {
            maxScore = score;
            bestMatch = module;
        }
    });

    return (maxScore >= 3) ? bestMatch : null;
}

// 📚 RAG e-Maktab Darsliklari Katalogi (1-11 Sinf DTS)
let activeDtsGradeFilter = 5;

function setDtsGradeFilter(grade) {
    activeDtsGradeFilter = grade;
    renderSchoolCurriculum();
}

function renderSchoolCurriculum() {
    const containerParent = document.getElementById('schoolCurriculumList');
    const containerChild = document.getElementById('childSchoolList');

    const filtered = DTS_KNOWLEDGE_BASE.filter(m => activeDtsGradeFilter === 'all' || m.grade === Number(activeDtsGradeFilter));

    let html = '';
    
    // Grade Filter Pills (1-11)
    let filterPillsHtml = \`
        <div class="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
            <button onclick="setDtsGradeFilter('all')" class="px-3 py-1 rounded-xl text-[10px] font-bold transition flex-shrink-0 \${activeDtsGradeFilter === 'all' ? 'bg-cyan-500 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-white'}">Barcha Sinflar</button>
    \`;
    for (let g = 1; g <= 11; g++) {
        const isActive = (activeDtsGradeFilter === g);
        filterPillsHtml += \`
            <button onclick="setDtsGradeFilter(\${g})" class="px-2.5 py-1 rounded-xl text-[10px] font-bold transition flex-shrink-0 \${isActive ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25' : 'bg-slate-800/80 text-slate-400 hover:text-white'}">\${g}-Sinf</button>
        \`;
    }
    filterPillsHtml += '</div>';

    filtered.forEach(item => {
        const itemJson = JSON.stringify(item).replace(/"/g, '&quot;');
        html += \`
            <div class="glass-card p-3.5 space-y-2 border border-slate-700/60 hover:border-cyan-500/50 transition">
                <div class="flex items-center justify-between">
                    <span class="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-extrabold">
                        \${item.grade}-Sinf • \${item.subject}
                    </span>
                    <span class="text-[9px] text-cyan-400 font-mono font-bold">Darslik \${item.page}-bet (80 KB)</span>
                </div>
                <div>
                    <h4 class="text-xs font-black text-white">\${item.chapter}</h4>
                    <p class="text-[11px] text-slate-300 leading-relaxed mt-1">\${item.rule}</p>
                </div>
                \${item.formula ? \`
                    <div class="p-2 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[10px] text-cyan-300">
                        📐 <b>Formula:</b> \${item.formula}
                    </div>
                \` : ''}
                <div class="pt-1 flex items-center justify-between gap-2 text-[10px]">
                    <button onclick="openDtsPageViewer(\${item.grade}, '\${item.subject}', '\${item.chapter}', \${item.page}, '\${item.rule.replace(/'/g, "\\'")}', '\${item.formula || ''}', '')" class="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-lg font-bold transition flex items-center justify-center gap-1">
                        <span>📖</span> Sahifani Ochish (80 KB)
                    </button>
                    <button onclick="askDtsTopic('\${item.chapter}')" class="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg font-bold transition flex items-center gap-1">
                        <span>🤖</span> AI Yechim
                    </button>
                </div>
            </div>
        \`;
    });

    const fullParentHtml = filterPillsHtml + (html || '<div class="text-center py-6 text-xs text-slate-400">Darslik topilmadi</div>');
    if (containerParent) containerParent.innerHTML = fullParentHtml;
    if (containerChild) containerChild.innerHTML = fullParentHtml;
}

function askDtsTopic(topic) {
    const inputChild = document.getElementById('childAiInput');
    if (inputChild) {
        inputChild.value = topic + " mavzusini misollar bilan tushuntir";
        switchChildTab('child-tab-ai');
        handleChildAiSend();
    }
}

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
        appSubtitle: "Guardian Intelligence — Ota-ona & Farzand",
        aboutShortDesc: "Hurmatli Ota-onalar! Qalqon AI dasturining bosh maqsadi — aslo bolaning orqasidan poyloqchilik qilish emas, balki mehr, o'zaro ishonch, raqamli xavfsizlik va darslarni 100 ballik DTS davlat standarti bo'yicha a'lo o'zlashtirishiga ko'maklashishdir.",
        aboutPrivacyNote: "Shaxsiy chatlar o'qilmaydi, faqat ta'limiy qiziqishlar tahlil qilinadi.",
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
        childNavHome: "Asosiy",
        childNavAi: "AI Do'st",
        childNavRewards: "Yutuqlar",
        childNavSchool: "e-Maktabim",
        childNavExplore: "Qiziqishlar",
        aboutAppTitle: "Dastur Haqida & Asosiy Maqsad",
        aboutAppSub: "Poyloqchilik emas — mehr, xavfsizlik va darslik nazorati",
        aboutAppModalTitle: "Dastur Haqida & Bizning Maqsadimiz",
        aboutManifestTitle: "Poyloqchilik Emas — Mehr, Ishonch va Xavfsizlik!",
        aboutManifestSubtitle: "Zamonaviy raqamli dunyoda farzandingizning eng yaqin himoyachisi",
        aboutText1: "Hurmatli ota-onalar! Qalqon AI tizimining bosh falsafasi hech qachon bolaning orqasidan poyloqchilik qilish yoki uning shaxsiy erkinligini cheklash emas.",
        aboutText2: "Bizning asosiy maqsadimiz — farzandimizni raqamli xavf-xatarlardan asrash, darslarni 100 ballik DTS davlat standarti bo'yicha a'lo o'zlashtirishiga yordam berish va oilada o'zaro ishonch muhitini mustahkamlashdir.",
        aboutPrivacyHead: "100% Shaffoflik va Maxfiylik:",
        aboutPrivacyBody: "Biz shaxsiy chatlarni o'qimaymiz va videolarni tomosha qilmaymiz. Tizim faqat qiziqish vektorlari va darsliklar tahlilini yuritadi.",
        aboutAiHead: "Gemini AI Yordamchi & Repetitor:",
        aboutAiBody: "Qiyin darslik topshiriqlarini rasmga olib yuborish orqali bolaga do'stona va tushunarli yechimlar taqdim etiladi.",
        aboutContactHint: "Loyiha bo'yicha taklif, mulohaza va murojaatlaringiz uchun rasmiy manzil:",
        writeGmailBtn: "Gmail orqali xat yozish",
        appStatsTitle: "Dastur Statistikasi & Dinamika",
        appStatsSub: "14,820+ Ota-onalar, 23,450+ Farzandlar",
        appStatsModalTitle: "Dastur Statistikasi & Dinamika",
        statParentsLabel: "Ulangan Ota-onalar",
        statChildrenLabel: "Ulangan Farzandlar",
        navDashboard: "Asosiy",
        navRadar: "Radar (Bepul)",
        navAi: "AI Murabbiy 💎",
        navSchool: "e-Maktab 💎",
        navSettings: "Sozlamalar",
        backBtn: "← Orqaga",
        nameLabel: "Ism va Familiyasi",
        usernameLabel: "Telegram Usernamesi",
        phoneLabel: "Telefon Raqami",
        emaktabSyncHeader: "e-Maktab (Kundalik) Sinxronizatsiyasi",
        emaktabSyncDesc: "Baholar va davomatni avtomatik olish uchun kiritiladi (Tasdiq kodi shart emas).",
        emaktabLoginLabel: "e-Maktab Login",
        emaktabPassLabel: "e-Maktab Parol",
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
        aboutAppTitle: "О Программе и Главной Цели",
        aboutAppSub: "Не слежка — а забота, безопасность и помощь в учёбе",
        aboutAppModalTitle: "О Программе и Нашей Миссии",
        aboutManifestTitle: "Не Слежка — а Любовь, Доверие и Безопасность!",
        aboutManifestSubtitle: "Главный защитник вашего ребёнка в цифровом мире",
        aboutText1: "Уважаемые родители! Главная философия Qalqon AI — это ни в коем случае не слежка и не ограничение свободы ребёнка.",
        aboutText2: "Наша главная цель — защитить детей от цифровых угроз, помочь учиться на 100 баллов по стандартам DTS и построить атмосферу взаимного доверия в семье.",
        aboutPrivacyHead: "100% Прозрачность и Приватность:",
        aboutPrivacyBody: "Мы не читаем личные чаты и не смотрим видео. Анализируются только векторы интересов и успеваемость.",
        aboutAiHead: "Gemini AI Репетитор и Наставник:",
        aboutAiBody: "Сфотографируйте сложное задание из учебника, и AI объяснит решение простым и понятным языком.",
        aboutContactHint: "Официальный адрес для предложений и связи с создателями:",
        writeGmailBtn: "Написать через Gmail",
        appStatsTitle: "Статистика Программы и Динамика",
        appStatsSub: "14,820+ Родителей, 23,450+ Детей",
        appStatsModalTitle: "Статистика Программы и Динамика",
        statParentsLabel: "Подключённых Родителей",
        statChildrenLabel: "Подключённых Детей",
        demoModeTitle: "Аккаунт Родителя",
        demoModeSub: "Полный доступ активен",
        loginRegisterBtn: "🔑 Вход / Регистрация",
        authSettingsTitle: "Аккаунт Родителя и Вход",
        authSettingsSub: "Статус: Активен (Вход)",
        authModalTitle: "Аккаунт Родителя",
        tabRegister: "📝 Регистрация",
        tabLogin: "🔑 Вход",
        regHeader: "Создание Профиля Родителя",
        regSub: "Выберите логин и пароль для входа в панель.",
        regUsernameLabel: "Telegram Username / Имя",
        regPasswordLabel: "Выберите Пароль",
        regConfirmPasswordLabel: "Повторите Пароль",
        btnSubmitRegister: "📝 Зарегистрироваться",
        loginHeader: "Вход в Систему",
        loginSub: "Введите ваш ранее созданный пароль",
        loginUsernameLabel: "Telegram Username",
        loginPasswordLabel: "Пароль",
        btnSubmitLogin: "🚀 Войти",
        approvalNoticeTitle: "Полный Доступ Активен",
        approvalNoticeHeader: "Добро пожаловать в Qalqon AI!",
        approvalNoticeDesc: "Все разделы (Радар, Gemini AI, e-Maktab 100 баллов) открыты для вас без ограничений.",
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
        childNavHome: "Главная",
        childNavAi: "AI Друг",
        childNavRewards: "Награды",
        childNavSchool: "e-Maktab",
        childNavExplore: "Интересы",
        navDashboard: "Главная",
        navRadar: "Радар (Free)",
        navAi: "AI Наставник 💎",
        navSchool: "e-Maktab 💎",
        navSettings: "Настройки",
        backBtn: "← Назад",
        nameLabel: "Имя и Фамилия",
        usernameLabel: "Telegram Username",
        phoneLabel: "Номер Телефона",
        emaktabSyncHeader: "Синхронизация с e-Maktab (Kundalik)",
        emaktabSyncDesc: "Для автоматического получения оценок и посещаемости (Код подтверждения не требуется).",
        emaktabLoginLabel: "e-Maktab Логин",
        emaktabPassLabel: "e-Maktab Пароль",
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

// 3. DINAMIK KO'P FARZANDLIK VA PROFIL BOSHQARUVI (LOCALSTORAGE & UNIQUE ID)
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
        return \`<option value="\${k}" \${isSelected}>👦 \${c.name} (\${c.grade}-sinf [ID: \${k}])</option>\`;
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
    alert(\`🎉 Yangi farzand profili muvaffaqiyatli yaratildi! (ID: \${newId})\`);
}

function handleDeleteActiveChild() {
    const child = childrenDatabase[currentChildKey];
    if (!child) return;

    const count = Object.keys(childrenDatabase).length;
    if (count <= 1) {
        alert("⚠️ Sizda kamida 1 ta farzand profili bo'lishi kerak. O'chirishdan oldin yangisini qo'shing!");
        return;
    }

    const confirmDelete = confirm(\`Haqiqatan ham «\${child.name} (ID: \${currentChildKey})» profilini ro'yxatdan butunlay olib tashlamoqchimisiz?\`);
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


function checkChildConsentStatus() {
    if (currentAppRole === 'child') {
        const consented = localStorage.getItem('child_consented') === 'true';
        const overlay = document.getElementById('childConsentOverlay');
        const codeInput = document.getElementById('childConsentFamilyCode');
        
        // Farzand og'zaki kodni qo'lda kiritadi
        if (codeInput) codeInput.value = "";

        if (overlay) {
            if (!consented) {
                overlay.classList.remove('hidden');
            } else {
                overlay.classList.add('hidden');
            }
        }
        
        // Farzand panelini majburiy tanlash
        switchChildTab('child-tab-home');
    }
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

const urlParams = new URLSearchParams(window.location.search);
const urlRole = urlParams.get('role');
const urlCode = urlParams.get('code') || urlParams.get('start');

let currentLang = urlParams.get('lang') || localStorage.getItem('app_lang') || 'uz';
let currentTheme = localStorage.getItem('app_theme') || 'default';
let userPlan = localStorage.getItem('user_plan') || 'pro';
let activeSchoolPeriod = 'weekly';
let isRecordingVoice = false;
let uploadedImageBase64 = null;
let familyCode = urlCode || "849-210";

// Agar havola bola uchun bo'lsa
let currentAppRole = urlRole || localStorage.getItem('app_role') || 'parent';
if (urlRole === 'child' || (urlCode && (urlCode.startsWith('child') || urlCode.startsWith('pair')))) {
    currentAppRole = 'child';
    localStorage.setItem('app_role', 'child');
} // 'parent' or 'child'

// Ota-ona autentifikatsiyasi va admin tasdiq holati
let currentAuthUser = JSON.parse(localStorage.getItem('auth_user') || 'null');
let authStatus = localStorage.getItem('auth_status') || (currentAuthUser ? currentAuthUser.status : 'guest_demo'); // 'guest_demo', 'pending', 'approved'

let mapInstance = null;
let childMarker = null;
let parentMarker = null;

let pomodoroSeconds = 25 * 60;
let pomodoroInterval = null;
let isPomodoroRunning = false;

// Telegram WebApp Setup & Auto Role / Admin Detection
const tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
    const rawUsername = (tg.initDataUnsafe?.user?.username || "").toLowerCase();
    
    if (rawUsername === 'ai_loyihachi' || rawUsername === 'mirkamolov13') {
        currentAuthUser = {
            username: \`@\${rawUsername}\`,
            name: \`\${tg.initDataUnsafe.user.first_name || ''} \${tg.initDataUnsafe.user.last_name || ''}\`.trim() || "Administrator",
            status: 'approved',
            isAdmin: true
        };
        authStatus = 'approved';
        localStorage.setItem('auth_user', JSON.stringify(currentAuthUser));
        localStorage.setItem('auth_status', authStatus);
    } else if (rawUsername.includes('aliyor') || rawUsername.includes('madina') || rawUsername.includes('temur')) {
        currentAppRole = 'child';
        localStorage.setItem('app_role', 'child');
    } else if (rawUsername && !currentAuthUser) {
        currentAuthUser = {
            username: \`@\${rawUsername}\`,
            name: \`\${tg.initDataUnsafe.user.first_name || ''} \${tg.initDataUnsafe.user.last_name || ''}\`.trim(),
            status: 'approved'
        };
        authStatus = 'approved';
        localStorage.setItem('auth_user', JSON.stringify(currentAuthUser));
        localStorage.setItem('auth_status', authStatus);
    }
}

// ============================================================================
// 4. ROL TANLASH (OTA / ONA VA FARZAND REJIMLARI)
// ============================================================================
let currentParentRelation = localStorage.getItem('parent_relation') || 'father';

function setParentRelation(relation) {
    currentParentRelation = relation;
    localStorage.setItem('parent_relation', relation);
    const btnFather = document.getElementById('relBtnFather');
    const btnMother = document.getElementById('relBtnMother');
    const isFather = (relation === 'father');

    if (btnFather) {
        btnFather.className = isFather 
            ? "px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40 text-[10px] transition"
            : "px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-400 font-semibold border border-transparent text-[10px] hover:text-white transition";
    }
    if (btnMother) {
        btnMother.className = !isFather 
            ? "px-2.5 py-0.5 rounded-lg bg-pink-500/20 text-pink-400 font-bold border border-pink-500/40 text-[10px] transition"
            : "px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-400 font-semibold border border-transparent text-[10px] hover:text-white transition";
    }

    const titleEl = document.getElementById('roleBtnParent');
    if (titleEl) {
        const text = isFather 
            ? (currentLang === 'ru' ? "👨 Панель Отца" : "👨 Ota Paneli")
            : (currentLang === 'ru' ? "👩 Панель Матери" : "👩 Ona Paneli");
        const span = titleEl.querySelector('span:last-child');
        if (span) span.innerText = text;
    }
}

function switchAppRole(role) {
    currentAppRole = role;
    localStorage.setItem('app_role', role);

    const isParent = (role === 'parent');
    const roleBtnParent = document.getElementById('roleBtnParent');
    const roleBtnChild = document.getElementById('roleBtnChild');
    const parentHeader = document.getElementById('mainParentHeader');
    const authBanner = document.getElementById('authStatusBanner');
    const parentBottomNav = document.getElementById('parentBottomNav');
    const childBottomNav = document.getElementById('childBottomNav');
    const rolePillContainer = document.getElementById('parentRolePillContainer');

    if (roleBtnParent) {
        roleBtnParent.className = isParent
            ? "flex-1 py-2 px-2 rounded-xl text-xs font-bold text-white bg-emerald-500 shadow-md transition flex items-center justify-center gap-1.5"
            : "flex-1 py-2 px-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5";
    }

    if (roleBtnChild) {
        roleBtnChild.className = !isParent
            ? "flex-1 py-2 px-2 rounded-xl text-xs font-bold text-white bg-indigo-500 shadow-md transition flex items-center justify-center gap-1.5"
            : "flex-1 py-2 px-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition flex items-center justify-center gap-1.5";
    }

    if (rolePillContainer) {
        rolePillContainer.style.display = isParent ? 'flex' : 'none';
    }

    // Barcha tablarni yopish
    document.querySelectorAll('.tab-content').forEach(t => {
        t.classList.remove('active');
        t.classList.add('hidden');
    });

    if (isParent) {
        document.body.classList.remove('role-child');
        document.body.classList.add('role-parent');
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
        setParentRelation(currentParentRelation);
        switchTab('tab-dashboard');
    } else {
        document.body.classList.remove('role-parent');
        document.body.classList.add('role-child');
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
        switchChildTab('child-tab-home');
    }
}

function switchChildTab(tabId) {
    const childTabs = ['child-tab-home', 'child-tab-ai', 'child-tab-rewards', 'child-tab-school', 'child-tab-explore'];
    childTabs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('active');
            el.classList.add('hidden');
        }
        const navBtn = document.getElementById(\`nav-\${id}\`);
        if (navBtn) navBtn.classList.remove('active');
    });

    const activeEl = document.getElementById(tabId);
    if (activeEl) {
        activeEl.classList.remove('hidden');
        activeEl.classList.add('active');
    }

    const activeNav = document.getElementById(\`nav-\${tabId}\`);
    if (activeNav) activeNav.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 📍 FARZAND TEZKOR XABARLARI
function sendChildQuickStatus(statusType) {
    const isRu = (currentLang === 'ru');
    const child = childrenDatabase[currentChildKey];
    let statusTextUz = "Maktabga yetib keldi";
    let statusTextRu = "Прибыл в школу";

    if (statusType === 'uy') {
        statusTextUz = "Uyga eson-omon yetib keldi";
        statusTextRu = "Благополучно вернулся домой";
    } else if (statusType === 'olib_keting') {
        statusTextUz = "Darslari tugadi, olib ketishni so'ramoqda";
        statusTextRu = "Уроки закончились, просит забрать";
    } else if (statusType === 'sos') {
        statusTextUz = "🚨 SHOSHILINCH SOS XABAR: Farzandingiz yordam so'ramoqda!";
        statusTextRu = "🚨 СРОЧНОЕ SOS СООБЩЕНИЕ: Ребёнок просит о помощи!";
    }

    try {
        fetch('https://wfrclcwjeeqeqchmdhzw.supabase.co/functions/v1/ota-ona-bot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'child_status_alert',
                statusType: statusType,
                statusText: isRu ? statusTextRu : statusTextUz,
                childName: isRu ? (child.name_ru || child.name) : child.name,
                familyCode: familyCode,
                timestamp: new Date().toISOString()
            })
        }).catch(e => console.log('Status alert sent'));
    } catch(e) {}

    const alertMsg = isRu 
        ? \`✅ Оповещение «\${statusTextRu}» успешно отправлено родителям в Telegram!\`
        : \`✅ «\${statusTextUz}» xabari ota-onangizning Telegramiga muvaffaqiyatli yuborildi!\`;
    alert(alertMsg);
}

// 🧠 FARZAND AI CHAT (MULTI-TURN UZLUKSIZ SUHBAT)
function clearChildChatHistory() {
    const thread = document.getElementById('childAiChatThread');
    if (!thread) return;
    const isRu = (currentLang === 'ru');
    thread.innerHTML = \`
        <div class="flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm flex-shrink-0">🐺</div>
            <div class="p-3 rounded-2xl rounded-tl-sm bg-indigo-950/50 border border-indigo-500/30 text-slate-200 leading-relaxed shadow-sm">
                \${isRu ? "🐺 Чат очищен! Задай любой вопрос из школьной программы 1-11 классов." : "🐺 Suhbat tozalandi! 1-11 sinf darsliklaridan istalgan savolingni yoz."}
            </div>
        </div>
    \`;
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
    msg.innerHTML = \`
        <div class="bg-indigo-600 text-white font-medium rounded-2xl rounded-tr-sm p-3 max-w-[85%] text-xs shadow-md">
            \${text}
        </div>
    \`;
    thread.appendChild(msg);
    thread.scrollTop = thread.scrollHeight;
}

function appendChildAiMessage(htmlContent) {
    const thread = document.getElementById('childAiChatThread');
    if (!thread) return;
    const msg = document.createElement('div');
    msg.className = "flex items-start gap-2.5 max-w-[95%]";
    msg.innerHTML = \`
        <div class="w-7 h-7 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm flex-shrink-0">🐺</div>
        <div class="p-3 rounded-2xl rounded-tl-sm bg-indigo-950/50 border border-indigo-500/30 text-slate-200 leading-relaxed shadow-sm">
            \${htmlContent}
        </div>
    \`;
    thread.appendChild(msg);
    thread.scrollTop = thread.scrollHeight;
}

function handleChildAiSend() {
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
            answer = \`📚 <b>\${ragMatch.grade}-sinf \${ragMatch.subject} (DTS Standarti, \${ragMatch.page}-bet)</b><br>\`
                   + \`📖 <b>Mavzu:</b> \${ragMatch.chapter}<br><br>\`
                   + \`💡 <b>Rasmiy qoida:</b><br>\${ragMatch.rule}<br><br>\`
                   + (ragMatch.formula ? \`📐 <b>Formula:</b> <code>\${ragMatch.formula}</code><br><br>\` : '')
                   + \`<div class="pt-2"><button onclick="openDtsPageViewer(\${ragMatch.grade}, '\${ragMatch.subject}', '\${ragMatch.chapter}', \${ragMatch.page}, '\${ragMatch.rule.replace(/'/g, "\\'")}', '\${ragMatch.formula || ''}', '')" class="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition flex items-center gap-1 shadow-md">📖 Darslikning \${ragMatch.page}-betini ochish (80 KB) ↗</button></div>\`;
        } else if (lower.includes('matem') || lower.includes('+') || lower.includes('-') || lower.includes('*') || lower.includes('/') || lower.includes('kasr')) {
            answer = isRu
                ? \`📐 Отличный математический вопрос! По задаче «\${text}»: давай решим шаг за шагом. Сначала определим формулу, а затем вычислим результат. Ты отлично справляешься! 🚀\`
                : \`📐 Ajoyib matematik savol! «\${text}» masalasini kel, birga bosqichma-bosqich yechamiz: avval qoidani eslaymiz, so'ng amallarni ketma-ket bajaramiz. Senda hammasi oson o'xshaydi! 🚀\`;
        } else {
            answer = isRu
                ? \`💡 Отличный вопрос по теме «\${text}»! Главное понять суть и применить на практике. Если нужно подробнее разобрать примеры, просто напиши! 🐺✨\`
                : \`💡 «\${text}» bo'yicha ajoyib savol! Asosiysi qoidani to'g'ri tushunib, amalda qo'llashdir. Agar qaysi qismi tushunarsiz bo'lsa, bemalol so'ra! 🐺✨\`;
        }
        appendChildAiMessage(answer);
    }, 500);
}

// ⏱️ POMODORO TAYMERI
function updatePomodoroDisplay() {
    const display = document.getElementById('pomodoroTimerDisplay');
    const mins = Math.floor(pomodoroSeconds / 60);
    const secs = pomodoroSeconds % 60;
    if (display) {
        display.innerText = \`\${String(mins).padStart(2, '0')}:\${String(secs).padStart(2, '0')}\`;
    }
}

function togglePomodoroTimer() {
    const btn = document.getElementById('pomodoroBtn');
    const label = document.getElementById('pomodoroStatusLabel');
    const isRu = (currentLang === 'ru');

    if (isPomodoroRunning) {
        clearInterval(pomodoroInterval);
        isPomodoroRunning = false;
        if (btn) btn.innerText = isRu ? "▶️ Продолжить" : "▶️ Davom etish";
        if (label) label.innerText = isRu ? "Таймер приостановлен" : "Taymer to'xtatildi";
    } else {
        isPomodoroRunning = true;
        if (btn) btn.innerText = isRu ? "⏸️ Пауза" : "⏸️ To'xtatish";
        if (label) label.innerText = isRu ? "📚 Идёт урок! Фокусируйся на заданиях." : "📚 Dars vaqti! Diqqatni misollarga qarat.";

        pomodoroInterval = setInterval(() => {
            if (pomodoroSeconds > 0) {
                pomodoroSeconds--;
                updatePomodoroDisplay();
            } else {
                clearInterval(pomodoroInterval);
                isPomodoroRunning = false;
                alert(isRu ? "🎉 25 минут завершены! 5 минут отдыха для глаз 👀" : "🎉 25 daqiqa tugadi! Ko'zlarga 5 daqiqa dam beramiz 👀");
                resetPomodoroTimer();
            }
        }, 1000);
    }
}

function resetPomodoroTimer() {
    clearInterval(pomodoroInterval);
    isPomodoroRunning = false;
    pomodoroSeconds = 25 * 60;
    updatePomodoroDisplay();
    const btn = document.getElementById('pomodoroBtn');
    const label = document.getElementById('pomodoroStatusLabel');
    const isRu = (currentLang === 'ru');
    if (btn) btn.innerText = isRu ? "▶️ Старт" : "▶️ Boshlash";
    if (label) label.innerText = isRu ? "Готов к урокам? Нажми Старт!" : "Dars qilishga tayyormisan? Boshlash tugmasini bos!";
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
        status: 'approved',
        registeredAt: new Date().toISOString()
    };
    authStatus = 'approved';
    localStorage.setItem('auth_user', JSON.stringify(currentAuthUser));
    localStorage.setItem('auth_status', authStatus);

    // Supabase orqali bildirishnoma yuborish
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
        }).catch(err => console.log('Notification sent'));
    } catch(e) {}

    updateAuthUI();
    closeSubpage();
    const successMsg = (currentLang === 'ru') 
        ? "🎉 Регистрация успешно завершена! Доступ ко всем функциям активирован."
        : "🎉 Ro'yxatdan o'tish muvaffaqiyatli yakunlandi! Barcha bo'limlar to'liq faollashtirildi.";
    alert(successMsg);
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

    if (banner) {
        banner.className = "p-2.5 mb-3 rounded-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 flex items-center justify-between";
        if (bannerIcon) bannerIcon.innerText = "🛡️";
        if (bannerTitle) bannerTitle.innerText = isRu ? \`\${currentAuthUser?.username || 'Родитель'} (Активен)\` : \`\${currentAuthUser?.username || 'Ota-ona'} (Faol)\`;
        if (bannerSub) bannerSub.innerText = isRu ? "Все разделы контроля активны" : "Barcha nazorat bo'limlari to'liq faol";
        if (bannerBtn) {
            bannerBtn.className = "px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30";
            bannerBtn.innerText = isRu ? "Профиль" : "Profil";
        }
    }
    if (settingsUsername) settingsUsername.innerText = currentAuthUser?.username || (isRu ? "Аккаунт Родителя" : "Ota-ona Hisobi");
    if (settingsStatus) {
        settingsStatus.className = "text-[10px] text-emerald-400";
        settingsStatus.innerText = isRu ? "Статус: Активен (Вход выполнен)" : "Holat: To'liq Faol";
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
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('app_lang', lang);
    applyLanguageTranslations();
    renderActiveChild();
    renderSchoolCurriculum();
    closeSubpage();
}

// ============================================================================
// 5. TA'LIM VA DTS 100 BALLIK BAHOLAR GRAFIGI
// ============================================================================
function getSubjectScore(subject, grade, period) {
    let hash = 0;
    const key = \`\${subject}_\${grade}_\${period}\`;
    for (let i = 0; i < key.length; i++) {
        hash = (hash << 5) - hash + key.charCodeAt(i);
        hash |= 0;
    }
    const base = 75 + Math.abs(hash % 24); // 75 dan 98 gacha ball
    return Math.min(100, Math.max(60, base));
}

function renderSchoolCurriculum() {
    const child = childrenDatabase[currentChildKey];
    if (!child) return;

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
    if (document.getElementById('profilePhone')) {
        document.getElementById('profilePhone').value = child.phone || "+998 90 123 45 67";
    }
    if (document.getElementById('profileEmaktabLogin')) {
        document.getElementById('profileEmaktabLogin').value = child.emaktabLogin || "login_kundalik";
    }
    if (document.getElementById('profileEmaktabPassword')) {
        document.getElementById('profileEmaktabPassword').value = child.emaktabPassword || "••••••••";
    }
    openSubpage('modal-child-profile');
}

function saveChildProfile() {
    const fullName = document.getElementById('profileFullName').value.trim() || "Farzand";
    const username = document.getElementById('profileUsername').value.trim() || "@farzand";
    const grade = parseInt(document.getElementById('profileClassSelect').value) || 5;
    const phone = document.getElementById('profilePhone')?.value.trim() || "+998 90 123 45 67";
    const emaktabLogin = document.getElementById('profileEmaktabLogin')?.value.trim() || "login_kundalik";
    const emaktabPassword = document.getElementById('profileEmaktabPassword')?.value.trim() || "••••••••";

    childrenDatabase[currentChildKey].name = fullName;
    childrenDatabase[currentChildKey].username = username;
    childrenDatabase[currentChildKey].grade = grade;
    childrenDatabase[currentChildKey].phone = phone;
    childrenDatabase[currentChildKey].emaktabLogin = emaktabLogin;
    childrenDatabase[currentChildKey].emaktabPassword = emaktabPassword;

    localStorage.setItem('children_database', JSON.stringify(childrenDatabase));

    const select = document.getElementById('childSelector');
    if (select.querySelector(\`option[value="\${currentChildKey}"]\`)) {
        select.querySelector(\`option[value="\${currentChildKey}"]\`).innerText = \`\${fullName} (\${grade}-\${currentLang === 'ru' ? 'класс' : 'sinf'})\`;
    }

    renderActiveChild();
    renderSchoolCurriculum();
    closeSubpage();

    const alertMsg = (currentLang === 'ru')
        ? \`✅ Данные ребёнка и синхронизация с e-Maktab сохранены!\\nУчебники \${grade}-го класса и шкала 100 баллов установлены.\`
        : \`✅ Farzand ma'lumotlari va e-Maktab sinxronizatsiyasi saqlandi!\\n\${grade}-sinf Davlat darsliklari va 100 ballik baholar o'rnatildi.\`;
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
    if (!child) return;
    const isRu = (currentLang === 'ru');

    const screenEl = document.getElementById('totalScreenTime');
    if (screenEl) screenEl.innerText = isRu ? child.screenTime_ru : child.screenTime;

    const battEl = document.getElementById('batteryBadge');
    if (battEl) battEl.innerText = \`\${child.battery}%\`;

    const statBattEl = document.getElementById('statBattery');
    if (statBattEl) statBattEl.innerText = \`\${child.battery}%\`;

    const remEl = document.getElementById('remainingTime');
    if (remEl) remEl.innerText = isRu ? child.remaining_ru : child.remaining;

    const selectEl = document.getElementById('childSelector');
    if (selectEl) selectEl.value = currentChildKey;

    // Ilovalar reytingi
    const appList = document.getElementById('appUsageList');
    if (appList && child.apps) {
        appList.innerHTML = child.apps.map(app => \`
            <div class="space-y-1">
                <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2">
                        <span>\${app.icon}</span>
                        <span class="font-bold text-white">\${app.name}</span>
                        <span class="text-[10px] text-slate-400">(\${isRu ? app.category_ru : app.category})</span>
                    </div>
                    <span class="font-bold text-slate-300 font-mono">\${app.time}</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill \${app.color}" style="width: \${app.percent}%;"></div>
                </div>
            </div>
        \`).join('');
    }

    // Qiziqishlar vektorlari
    const interestContainer = document.getElementById('aiInterestVectors');
    if (interestContainer && child.interests) {
        const interests = child.interests[currentLang] || child.interests.uz || [];
        interestContainer.innerHTML = interests.map(item => \`
            <div class="space-y-1">
                <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-300 font-medium">\${item.topic}</span>
                    <span class="font-bold text-emerald-400 font-mono">\${item.percent}%</span>
                </div>
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill \${item.color}" style="width: \${item.percent}%;"></div>
                </div>
            </div>
        \`).join('');
    }

    // Geofences
    const geofenceList = document.getElementById('geofenceList');
    if (geofenceList && child.location && child.location.geofences) {
        geofenceList.innerHTML = child.location.geofences.map(geo => \`
            <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                <span class="text-xs font-semibold text-slate-300">\${geo.name}</span>
                <span class="text-[10px] font-bold \${geo.color}">\${geo.status}</span>
            </div>
        \`).join('');
    }

    // Radar manzil
    const radarAddr = document.getElementById('radarCurrentAddress') || document.getElementById('radarAddress');
    if (radarAddr && child.location) {
        radarAddr.innerText = isRu ? child.location.address_ru : child.location.address;
    }
}

// ============================================================================
// 7. GEMINI AI TIZIMI (CHAT, FOTO, OVOZ VA REELS TAHLILI)
// ============================================================================
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImageBase64 = e.target.result;
        const prevContainer = document.getElementById('imagePreviewContainer');
        const prevThumb = document.getElementById('imagePreviewThumb') || document.getElementById('imagePreview');
        if (prevContainer) prevContainer.classList.remove('hidden');
        if (prevThumb) prevThumb.src = uploadedImageBase64;
    };
    reader.readAsDataURL(file);
}

function clearImagePreview() {
    uploadedImageBase64 = null;
    const prevContainer = document.getElementById('imagePreviewContainer');
    if (prevContainer) prevContainer.classList.add('hidden');
    const fileInput = document.getElementById('aiFileInput') || document.getElementById('aiImageInput');
    if (fileInput) fileInput.value = "";
}

function sendTextMessage() {
    const input = document.getElementById('aiTextInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text && !uploadedImageBase64) return;

    appendUserMessage(text, uploadedImageBase64);
    input.value = "";

    setTimeout(() => {
        generateAIResponse(text, uploadedImageBase64);
        clearImagePreview();
    }, 600);
}

function sendQuickPrompt(promptText) {
    const input = document.getElementById('aiTextInput');
    if (input) input.value = promptText;
    sendTextMessage();
}

function generateAIResponse(query, imageBase64) {
    const child = childrenDatabase[currentChildKey];
    const qLower = (query || "").toLowerCase();
    const isRu = (currentLang === 'ru');
    let responseText = "";

    const ragMatch = searchDtsKnowledge(query, null);

    if (imageBase64) {
        if (isRu) {
            responseText = \`
                <b>📷 Вывод по анализу задания:</b><br>
                Загруженное фото школьного задания проанализировано. Рекомендация для <b>\${child?.name_ru || child?.name || 'ребёнка'} (\${child?.grade || 5}-класс)</b>:<br>
                • <b>Правило:</b> Закрепите теоретическое понятие на практических примерах в течение 10 минут.<br>
                • <b>Закрепление:</b> Решите 2-3 упражнения самостоятельно и проверьте балл в e-Maktab! 🌟
            \`;
        } else {
            responseText = \`
                <b>📷 Vazifa / Rasm Tahlili Xulosasi:</b><br>
                Yuklangan darslik topshirig'i tahlil qilindi. <b>\${child?.name || 'Farzandingiz'} (\${child?.grade || 5}-sinf)</b> uchun ushbu darslik mavzusini o'zlashtirish bo'yicha yo'riqnoma:<br>
                • <b>Asosiy qoida:</b> Mavzuning nazariy tushunchasini 10 daqiqa amaliy misollar orqali ko'rib chiqing.<br>
                • <b>Mustahkamlash:</b> Darslikdagi 2-3 ta topshiriqni mustaqil yechishga yo'naltiring va 100 ballik e-Maktab ko'rsatkichini qayd eting! 🌟
            \`;
        }
    } else if (ragMatch) {
        responseText = \`
            <b>📚 Darslik Tahlili (\${ragMatch.grade}-sinf \${ragMatch.subject}, \${ragMatch.page}-bet):</b><br>
            • <b>Mavzu:</b> \${ragMatch.chapter}<br>
            • <b>DTS Standarti:</b> \${ragMatch.rule}<br>
            \${ragMatch.formula ? \`• <b>Asosiy formula:</b> <code>\${ragMatch.formula}</code><br>\` : ''}
            💡 <i>Farzandingizga ushbu mavzu bo'yicha e-Maktabda 100 ball to'plashida yordam bering!</i>
        \`;
    } else if (qLower.includes("reels") || qLower.includes("short") || qLower.includes("video") || qLower.includes("insta") || qLower.includes("youtube") || qLower.includes("видео")) {
        if (isRu) {
            responseText = \`
                <b>🎬 Анализ просмотренных Reels и видео:</b><br>
                Точные данные по видеоконтенту для <b>\${child?.name_ru || child?.name || 'ребёнка'} (\${child?.grade || 5}-класс)</b>:<br><br>
                📊 <b>Распределение по темам:</b><br>
                • <b>💻 Образование и IT (Python, Робототехника, Языки):</b> 45% (Полезно)<br>
                • <b>🔬 Научные опыты и Логические задачи:</b> 25% (Положительно)<br>
                • <b>🎮 Развлечения и Игры:</b> 30% (В норме)<br><br>
                💡 <b>Рекомендация:</b> Чтобы алгоритм чаще рекомендовал обучающие видео, подпишитесь на полезные каналы по школьным предметам.
            \`;
        } else {
            responseText = \`
                <b>🎬 Ko'rilayotgan Reels va Video Kontent Tahlili:</b><br>
                Farzandingiz <b>\${child?.name || 'Farzandingiz'} (\${child?.grade || 5}-sinf)</b> tomosha qilayotgan Reels / Shorts videolari bo'yicha aniq ma'lumotlar:<br><br>
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
                Методы закрепления школьных предметов госстандарта (DTS) для <b>\${child?.name_ru || child?.name || 'ребёнка'} (\${child?.grade || 5}-класс)</b>:<br>
                • <b>Практический подход:</b> Изучение математики и естественных наук через графические примеры и опыты гораздо эффективнее.<br>
                • <b>Аналитика:</b> Совместно просматривайте показатели 100 баллов в разделе e-Maktab.
            \`;
        } else {
            responseText = \`
                <b>📚 Darslarni O'zlashtirish va Qiziqishni Oshirish:</b><br>
                <b>\${child?.name || 'Farzandingiz'} (\${child?.grade || 5}-sinf)</b> uchun Davlat ta'lim standarti fanlarini mustahkamlash usullari:<br>
                • <b>Amaliy yondashuv:</b> Matematika va tabiiy fanlarni grafik misollar va tajribalar orqali o'rganish samaraliroq.<br>
                • <b>Haftalik tahlil:</b> e-Maktab bo'limidagi 100 ballik ko'rsatkichlarni birgalikda ko'rib, yuqori natijalarni qayd etib boring.
            \`;
        }
    } else {
        if (isRu) {
            responseText = \`
                <b>💡 Информация:</b> Расписание уроков, оценки 100 баллов, онлайн-локация и заряд батареи <b>\${child?.name_ru || child?.name || 'ребёнка'}</b> под постоянным контролем. Вы можете задать любой вопрос по предметам или лимитам.
            \`;
        } else {
            responseText = \`
                <b>💡 Ma'lumot:</b> Farzandingiz <b>\${child?.name || 'Farzandingiz'} (\${child?.grade || 5}-sinf)</b> ning dars jadvali, 100 ballik baholari, jonli joylashuvi va batareya ko'rsatkichlari doimiy nazorat ostida. Har qanday fan, video tahlili yoki limitlar bo'yicha savolingizni yozishingiz mumkin.
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
        if (btn) btn.classList.add('recording');
        if (status) status.classList.remove('hidden');
    } else {
        stopAndSendVoice();
    }
}

function stopAndSendVoice() {
    isRecordingVoice = false;
    const btn = document.getElementById('voiceRecordBtn');
    const status = document.getElementById('voiceRecordingStatus');
    if (btn) btn.classList.remove('recording');
    if (status) status.classList.add('hidden');

    const voiceNoteText = (currentLang === 'ru')
        ? "🎙️ Голосовой вопрос: «Помоги решить задачу по математике на странице 42»"
        : "🎙️ Ovozli savol: «42-betdagi matematika misolini tushuntirib ber»";
    
    appendUserMessage(voiceNoteText, null);
    setTimeout(() => {
        generateAIResponse("fan dars", null);
    }, 800);
}

function appendUserMessage(text, imageBase64) {
    const chat = document.getElementById('aiChatContainer') || document.getElementById('aiChatThread');
    if (!chat) return;
    let imgHtml = imageBase64 ? \`<img src="\${imageBase64}" class="w-32 h-32 object-cover rounded-xl mb-1.5 border border-white/20">\` : "";
    const msg = document.createElement('div');
    msg.className = "flex justify-end";
    msg.innerHTML = \`
        <div class="bg-emerald-500 text-white rounded-2xl rounded-tr-sm p-3 max-w-[85%] text-xs shadow-md">
            \${imgHtml}
            \${text ? \`<div>\${text}</div>\` : ""}
        </div>
    \`;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
}

function appendAIMessage(htmlContent) {
    const chat = document.getElementById('aiChatContainer') || document.getElementById('aiChatThread');
    if (!chat) return;
    const msg = document.createElement('div');
    msg.className = "flex gap-2.5 max-w-[90%]";
    msg.innerHTML = \`
        <div class="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm flex-shrink-0">
            🤖
        </div>
        <div class="glass-card p-3 rounded-2xl rounded-tl-sm text-xs text-slate-200 leading-relaxed shadow-md">
            \${htmlContent}
        </div>
    \`;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
}

// ============================================================================
// 8. SUBPAGE, MAVZU VA LOKATSIYA BOSHQARUVI
// ============================================================================
function setTheme(themeName) {
    currentTheme = themeName || 'default';
    localStorage.setItem('app_theme', currentTheme);
    document.body.setAttribute('data-theme', currentTheme);
    document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
    const activeCard = document.querySelector(\`[data-theme-name="\${currentTheme}"]\`);
    if (activeCard) activeCard.classList.add('active');
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => {
        t.classList.remove('active');
        t.classList.add('hidden');
    });
    document.querySelectorAll('#parentBottomNav .nav-btn').forEach(b => b.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    const targetBtn = document.getElementById(\`nav-\${tabId}\`);

    if (targetTab) {
        targetTab.classList.remove('hidden');
        targetTab.classList.add('active');
    }
    if (targetBtn) targetBtn.classList.add('active');

    if (tabId === 'tab-radar') {
        setTimeout(() => {
            initRadarMap();
            if (mapInstance) mapInstance.invalidateSize();
        }, 150);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (!child || !child.location) return;
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
    if (mapInstance && childMarker && child && child.location) {
        childMarker.setLatLng([child.location.lat, child.location.lng]);
        mapInstance.setView([child.location.lat, child.location.lng], 14);
    }
}

// DOM Init
document.addEventListener('DOMContentLoaded', () => {
    setTheme(currentTheme);
    applyLanguageTranslations();
    updateAuthUI();
    switchAppRole(currentAppRole);
    renderChildSelectDropdown();
    renderActiveChild();
    renderSchoolCurriculum();
    initRadarMap();
    checkParentOnboarding();
    checkChildConsentStatus();
});

function openUsernameGuideModal() {
    closeSubpage();
    openSubpage('modal-username-guide');
}

function toggleQuickMenu() {
    const menu = document.getElementById('quickMenuDropdown');
    if (menu) menu.classList.toggle('hidden');
}

function handleCompleteParentOnboarding() {
    const familyName = document.getElementById('onboardFamilyName')?.value.trim() || "Bizning Oila";
    const parentName = document.getElementById('onboardParentName')?.value.trim() || "Ota";
    const parentPhone = document.getElementById('onboardParentPhone')?.value.trim() || "";
    const parentUsername = document.getElementById('onboardParentUsername')?.value.trim().replace('@', '') || "";
    
    const motherName = document.getElementById('onboardMotherName')?.value.trim() || "";
    const motherPhone = document.getElementById('onboardMotherPhone')?.value.trim() || "";
    const motherUsername = document.getElementById('onboardMotherUsername')?.value.trim().replace('@', '') || "";

    const childName = document.getElementById('onboardChildName')?.value.trim() || "Aliyor";
    const childGrade = document.getElementById('onboardChildGrade')?.value || "5";
    const childUsername = document.getElementById('onboardChildUsername')?.value.trim().replace('@', '') || "";

    const familyData = {
        familyName,
        father: { name: parentName, phone: parentPhone, username: parentUsername },
        mother: { name: motherName, phone: motherPhone, username: motherUsername },
        children: [{ name: childName, grade: childGrade, username: childUsername, consented: false }],
        code: familyCode || "849-210",
        status: "pending"
    };

    localStorage.setItem('qalqon_family_profile', JSON.stringify(familyData));
    localStorage.setItem('parent_onboarded', 'true');
    localStorage.setItem('auth_status', 'pending');

    // Yangi farzandni bazaga qo'shish
    if (childName) {
        const childId = \`CH-\${Math.floor(100 + Math.random() * 900)}\`;
        childrenDatabase[childId] = {
            id: childId,
            name: \`\${childName} (\${childGrade}-sinf)\`,
            grade: parseInt(childGrade),
            username: childUsername,
            avatar: "👦",
            battery: 92,
            streak: 5,
            points: 120,
            consented: false,
            location: { lat: 41.3111, lng: 69.2797, address: "Toshkent shahri (Rozilik kutilmoqda)" },
            schedule: [
                { time: "08:00", subject: "Matematika", room: "204-xona", status: "finished" }
            ],
            apps: [
                { name: "YouTube", time: "45d", percent: 40, category: "Ta'lim / Video", color: "bg-red-500", icon: "▶️" }
            ]
        };
        saveChildrenDatabase();
        currentChildKey = childId;
        renderChildSelectDropdown();
        renderActiveChild();
    }

    closeSubpage();

    // Show pending approval modal
    const pendingOverlay = document.getElementById('pendingApprovalOverlay');
    if (pendingOverlay) pendingOverlay.classList.remove('hidden');

    
    // Adminga (358795989 - @ai_loyihachi) to'g'ridan-to'g'ri Telegram xabar yuborish
    try {
        const botToken = "8992925094:AAE5K1N8VVxiCh9P6H1j7hCrYoTeIBmC8r0";
        const adminChatId = 358795989;
        const alertText = \`👤 <b>YANGI OILA RO'YXATDAN O'TDI (MINI APP):</b>\\n\\n\` +
            \`• <b>Oila:</b> \${familyName}\\n\` +
            \`• <b>Ota:</b> \${parentName} (@\${parentUsername || 'mavjud_emas'}) - Tel: \${parentPhone}\\n\` +
            \`• <b>Ona:</b> \${motherName || 'Kiritilmagan'} (@\${motherUsername || 'yoq'})\\n\` +
            \`• <b>Farzand:</b> \${childName} (\${childGrade}-sinf, @\${childUsername || 'yoq'})\\n\` +
            \`• <b>Oila Kodi:</b> <code>\${familyCode || '849-210'}</code>\\n\\n\` +
            \`<i>Ushbu oilaga tizimdan to'liq foydalanishga ruxsat berasizmi?</i>\`;

        const keyboard = {
            inline_keyboard: [
                [
                    { text: "✅ To'liq Ruxsat Berish", callback_data: \`admin_approve_\${parentUsername || 'user'}_\${Date.now()}\` },
                    { text: "❌ Test Rejimida Qoldirish", callback_data: \`admin_reject_\${parentUsername || 'user'}_\${Date.now()}\` }
                ]
            ]
        };

        fetch(\`https://api.telegram.org/bot\${botToken}/sendMessage\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: adminChatId,
                text: alertText,
                parse_mode: 'HTML',
                reply_markup: keyboard
            })
        }).catch(err => console.log("Notify error:", err));
    } catch(e) {
        console.error("Admin dispatch failed:", e);
    }

    alert("✅ Oila ma'lumotlari saqlandi va Bosh administrator (@ai_loyihachi) tasdig'iga yuborildi!");
}

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
