import os

styles_css = """/* ==========================================================================
   OGOH AI (GUARDIAN INTELLIGENCE) — STITCH DESIGN SYSTEM
   Modern Corporate Glassmorphic Theme with High-Precision Dark Aesthetic
   ========================================================================== */

:root {
    --bg-primary: #13131b;
    --bg-surface: #1b1b23;
    --bg-surface-high: #292932;
    --bg-card: rgba(30, 41, 59, 0.65);
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

body[data-theme="aurora"] {
    --bg-primary: #0a192f;
    --bg-surface: #112240;
    --bg-card: rgba(17, 34, 64, 0.75);
    --border-subtle: #233554;
    --border-active: #64ffda;
    --accent-cyan: #64ffda;
}

body[data-theme="nebula"] {
    --bg-primary: #120d24;
    --bg-surface: #1d163a;
    --bg-card: rgba(29, 22, 58, 0.75);
    --border-subtle: #362a66;
    --border-active: #a855f7;
    --accent-cyan: #c084fc;
}

body[data-theme="sunset"] {
    --bg-primary: #1c1018;
    --bg-surface: #2d1825;
    --bg-card: rgba(45, 24, 37, 0.75);
    --border-subtle: #522741;
    --border-active: #fb923c;
    --accent-cyan: #f97316;
}

body[data-theme="emerald"] {
    --bg-primary: #061a14;
    --bg-surface: #0c2b22;
    --bg-card: rgba(12, 43, 34, 0.75);
    --border-subtle: #194a3b;
    --border-active: #10b981;
    --accent-cyan: #34d399;
}

body[data-theme="gold"] {
    --bg-primary: #1a1608;
    --bg-surface: #2b240f;
    --bg-card: rgba(43, 36, 15, 0.75);
    --border-subtle: #4a3e1a;
    --border-active: #fbbf24;
    --accent-cyan: #f59e0b;
}

body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    min-height: 100vh;
    padding-bottom: 95px;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    overflow-x: hidden;
}

.glass-panel {
    background: var(--bg-card);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    box-shadow: 0 4px 24px -1px rgba(0, 0, 0, 0.4);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-panel:hover {
    border-color: rgba(34, 211, 238, 0.45);
}

.ambient-glow-bg {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: -1;
    background: radial-gradient(circle at 50% 15%, rgba(34, 211, 238, 0.08) 0%, transparent 65%);
    animation: ambientPulse 6s ease-in-out infinite alternate;
}

@keyframes ambientPulse {
    0% { opacity: 0.5; transform: scale(1); }
    100% { opacity: 0.9; transform: scale(1.06); }
}

.status-glow-safe {
    background: radial-gradient(circle at top right, rgba(0, 165, 114, 0.16) 0%, transparent 70%);
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
    background: rgba(19, 19, 27, 0.92) !important;
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
    background: rgba(34, 211, 238, 0.12);
}

.nav-btn.active .material-symbols-outlined {
    font-variation-settings: 'FILL' 1;
    transform: translateY(-1px) scale(1.08);
}

#childBottomNav .nav-btn.active {
    color: var(--accent-indigo) !important;
    background: rgba(129, 140, 248, 0.15);
}

.subpage-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-primary);
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
    background-color: rgba(255, 255, 255, 0.08);
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
    height: 64px;
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
    border-color: var(--accent-cyan);
    box-shadow: 0 0 14px rgba(34, 211, 238, 0.35);
}

::-webkit-scrollbar {
    display: none;
}
* {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
"""

with open("styles.css", "w", encoding="utf-8") as f:
    f.write(styles_css)

print("styles.css successfully written!")
