import os, re

files_to_update = [
    "index.html",
    "telegram_miniapp/index.html",
    "app.js",
    "telegram_miniapp/app.js",
    "bot_engine.py",
    "supabase/functions/ota-ona-bot/index.ts",
    "build_supabase_app.py"
]

def replace_in_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Replacements
    content = content.replace("OGOH AI", "QALQON AI")
    content = content.replace("Ogoh AI", "Qalqon AI")
    content = content.replace("ogoh_ai", "qalqon_ai")
    content = content.replace("Shield Parental Guard", "Qalqon AI")
    content = content.replace("Shield Guard", "Qalqon AI")

    # Update mascot image in HTML files
    if filepath.endswith(".html"):
        # Replace mascot div with actual wolf image
        old_mascot = '<div class="w-8 h-8 rounded-full border border-[#22D3EE]/60 bg-[#22D3EE]/10 flex items-center justify-center text-base shadow-[0_0_10px_rgba(34,211,238,0.25)]">\n                🐺\n            </div>'
        new_mascot = '<div class="w-8 h-8 rounded-full border-2 border-[#22D3EE]/80 bg-[#22D3EE]/20 flex items-center justify-center overflow-hidden relative shadow-[0_0_10px_rgba(34,211,238,0.35)]">\n                <img src="assets/wolf_mascot.png" onerror="this.src=\'https://lh3.googleusercontent.com/aida-public/AB6AXuD4KD1uqMogxlSUh4XTwFZ6O8CcikpLzeXyE_AoKP5Bb7hfxrK_rDplyKX2s0KI3Kf-D2TRnanZtUX21nyuflU3WUny5Q3xGqSOAFplw0NaQNtSmIFXg_tVGW1h8CU70IPksptF26DN2hbF2nFN9sZOKWou2ZiNFaEl1s9UvWP8vjflsQwQWMt_BttzLNQBBJHpzrSqvqz-wwxaNui-4J52Xz6TfF8kqKuSIoBQubAXZiw9_QUtaSOjOw\'" alt="Kumush Bo\'ri" class="w-full h-full object-cover">\n            </div>'
        content = content.replace(old_mascot, new_mascot)
        
        # In case of slightly different spacing
        content = re.sub(
            r'<div class="w-8 h-8 rounded-full border border-\[#22D3EE\]/60 bg-\[#22D3EE\]/10 flex items-center justify-center text-base shadow-\[0_0_10px_rgba\(34,211,238,0\.25\)\]">\s*🐺\s*</div>',
            new_mascot,
            content
        )

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated {filepath}")

for fp in files_to_update:
    replace_in_file(fp)

print("Brand rename to Qalqon AI completed across all files!")
