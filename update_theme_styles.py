with open("styles.css", "r", encoding="utf-8") as f:
    css = f.read()

chat_contrast_rules = """
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
"""

if "/* Child AI Chat High-Contrast Theme Adaptation */" not in css:
    css += "\n" + chat_contrast_rules.strip() + "\n"
    with open("styles.css", "w", encoding="utf-8") as f:
        f.write(css)
    print("Updated styles.css with high-contrast chat rules!")
