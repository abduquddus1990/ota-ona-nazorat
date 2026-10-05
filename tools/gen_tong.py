"""theme-tong.css generatori.

Mini App Tailwind'ning qorong'i rang klasslari bilan yozilgan (index.html va
JS fayllari yaratadigan HTML). Bu skript ishlatilgan har bir rang klassini
topadi va body[data-theme="tong"] ichida uning yorug' muqobilini yozadi.
"""
import re, sys, pathlib

ROOT = pathlib.Path(sys.argv[1])
FILES = ["index.html", "app.js", "games.js", "arcade.js", "online.js", "chat.js", "advice.js", "sim.js", "i18n_ru.js"]
src = "\n".join((ROOT / f).read_text(encoding="utf-8") for f in FILES)

S = 'body[data-theme="tong"]'
NAVY = "#0f2a4a"

# Qorong'i dizaynda slate shkalasi: 950/900/800 — fon, 700/800 — chegara,
# 500..200 — xira→yorqin matn. Yorug' mavzuda teskari.
SLATE_BG = {"950": "#f6f9fc", "900": "#ffffff", "800": "#eef3f8", "700": "#e2e8f0", "600": "#cbd5e1",
            "500": "#94a3b8", "400": "#64748b", "300": "#475569", "200": "#334155", "100": "#1e293b", "50": "#0f172a"}
SLATE_TEXT = {"950": "#0b1f3b", "900": "#0f2a4a", "800": "#1b3354", "700": "#3d5675", "600": "#5b6b80",
              "500": "#6b7c93", "400": "#5b6b80", "300": "#3d5675", "200": "#2a4263", "100": "#1b3354", "50": NAVY}
SLATE_BORDER = {"950": "#eef3f8", "900": "#e8eef5", "800": "#e2e8f0", "700": "#d5dfea", "600": "#c3d0de",
                "500": "#a9b8ca", "400": "#94a3b8", "300": "#7d8ea6", "200": "#64748b", "100": "#475569", "50": "#334155"}

PAL = {  # Tailwind v3: 50,100,200,600,700
    "cyan": ("#ecfeff", "#cffafe", "#a5f3fc", "#0891b2", "#0e7490"),
    "emerald": ("#ecfdf5", "#d1fae5", "#a7f3d0", "#059669", "#047857"),
    "amber": ("#fffbeb", "#fef3c7", "#fde68a", "#d97706", "#b45309"),
    "sky": ("#f0f9ff", "#e0f2fe", "#bae6fd", "#0284c7", "#0369a1"),
    "rose": ("#fff1f2", "#ffe4e6", "#fecdd3", "#e11d48", "#be123c"),
    "indigo": ("#eef2ff", "#e0e7ff", "#c7d2fe", "#4f46e5", "#4338ca"),
    "purple": ("#faf5ff", "#f3e8ff", "#e9d5ff", "#9333ea", "#7e22ce"),
    "violet": ("#f5f3ff", "#ede9fe", "#ddd6fe", "#7c3aed", "#6d28d9"),
    "teal": ("#f0fdfa", "#ccfbf1", "#99f6e4", "#0d9488", "#0f766e"),
    "blue": ("#eff6ff", "#dbeafe", "#bfdbfe", "#2563eb", "#1d4ed8"),
    "pink": ("#fdf2f8", "#fce7f3", "#fbcfe8", "#db2777", "#be185d"),
    "orange": ("#fff7ed", "#ffedd5", "#fed7aa", "#ea580c", "#c2410c"),
    "yellow": ("#fefce8", "#fef9c3", "#fef08a", "#ca8a04", "#a16207"),
    "green": ("#f0fdf4", "#dcfce7", "#bbf7d0", "#16a34a", "#15803d"),
    "red": ("#fef2f2", "#fee2e2", "#fecaca", "#dc2626", "#b91c1c"),
    "fuchsia": ("#fdf4ff", "#fae8ff", "#f5d0fe", "#c026d3", "#a21caf"),
    "lime": ("#f7fee7", "#ecfccb", "#d9f99d", "#65a30d", "#4d7c0f"),
}
GRAYS = {"slate", "gray", "zinc", "neutral", "stone"}

def rgba(hexc, a):
    h = hexc.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return f"rgba({r},{g},{b},{a})"

def accent(color, shade, kind):
    p50, p100, p200, p600, p700 = PAL[color]
    s = int(shade)
    if kind == "text":
        if s <= 300: return p700
        if s == 400: return p600
        if s >= 800: return p100  # qorong'i matn — kam uchraydi
        return None
    if kind in ("bg", "from", "via", "to"):
        if s >= 950: return p50
        if s == 900: return p100
        if s == 800: return p200
        return None
    if kind == "border":
        if s >= 800: return p200
        if s == 700: return p200
        if s <= 300: return p200
        return None
    return None

def gray(shade, kind):
    if kind == "text": return SLATE_TEXT[shade]
    if kind == "border": return SLATE_BORDER[shade]
    return SLATE_BG[shade]

tok_re = re.compile(r'(?<![\w-])((?:hover:|focus:|active:|group-hover:|placeholder:)?)(bg|text|border|from|via|to|ring|divide|placeholder|border-t|border-b|border-l|border-r)-([a-z]+)-(\d{2,3})(?:/(\d{1,3}))?(?![\w-])')
white_re = re.compile(r'(?<![\w-])((?:hover:|focus:)?)(text|bg|border|from|via|to)-white(?:/(\d{1,3}))?(?![\w-])')

def esc(cls):
    return re.sub(r'([:/.\[\]#%])', r'\\\1', cls)

rules = {}
def add(selector, decl):
    rules.setdefault(decl, set()).add(selector)

# Mavzu tanlash kartalari o'z mavzusining HAQIQIY ranglarini ko'rsatishi kerak.
NOT_PREVIEW = ":not(.theme-card):not(.theme-card *)"

def sel(prefix, cls):
    s = f"{S} .{esc(cls)}{NOT_PREVIEW}"
    if prefix.startswith("hover"): s += ":hover"
    elif prefix.startswith("focus"): s += ":focus"
    elif prefix.startswith("active"): s += ":active"
    elif prefix.startswith("group-hover"): s = f"{S} .group:hover .{esc(cls)}"
    elif prefix.startswith("placeholder"): s += "::placeholder"
    return s

for m in set(tok_re.findall(src)):
    prefix, kind, color, shade, op = m
    cls = f"{prefix}{kind}-{color}-{shade}" + (f"/{op}" if op else "")
    a = (int(op) / 100) if op else None
    if color in GRAYS:
        if shade not in SLATE_BG: continue
        val = gray(shade, "border" if kind.startswith("border") or kind in ("divide", "ring") else ("text" if kind in ("text", "placeholder") else "bg"))
    elif color in PAL:
        k = "border" if kind.startswith("border") or kind in ("divide", "ring") else kind
        if k == "placeholder": k = "text"
        val = accent(color, shade, k)
        if val is None: continue
    else:
        continue
    if kind == "text" or kind == "placeholder":
        decl = f"color:{val}"
    elif kind.startswith("border") or kind == "divide":
        decl = f"border-color:{rgba(val, max(a, .6)) if a is not None else val}"
    elif kind == "ring":
        decl = f"--tw-ring-color:{val}"
    elif kind == "bg":
        decl = f"background-color:{rgba(val, max(a, .75)) if a is not None else val}"
    elif kind == "from":
        decl = f"--tw-gradient-from:{val} var(--tw-gradient-from-position);--tw-gradient-to:{rgba(val,0)} var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to)"
    elif kind == "via":
        decl = f"--tw-gradient-to:{rgba(val,0)} var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from),{val} var(--tw-gradient-via-position),var(--tw-gradient-to)"
    elif kind == "to":
        decl = f"--tw-gradient-to:{val} var(--tw-gradient-to-position)"
    else:
        continue
    if kind == "divide":
        add(sel(prefix, cls) + " > :not([hidden]) ~ :not([hidden])", decl)
    else:
        add(sel(prefix, cls), decl)

# text-white (sarlavhalar) -> to'q ko'k; bg-white/x (qorong'ida yengil yorug'lik) -> yengil soya.
for m in set(white_re.findall(src)):
    prefix, kind, op = m
    cls = f"{prefix}{kind}-white" + (f"/{op}" if op else "")
    a = int(op) / 100 if op else None
    if kind == "text":
        add(sel(prefix, cls), f"color:{NAVY}")
    elif kind == "bg" and a is not None and a <= 0.3:
        add(sel(prefix, cls), f"background-color:rgba(15,42,74,{round(a*0.5,3)})")
    elif kind == "border" and a is not None and a <= 0.3:
        add(sel(prefix, cls), f"border-color:rgba(15,42,74,{max(round(a*0.8,3),0.06)})")

# Rangli to'liq tugmalar ustidagi oq matn oq qoladi (yuqoridagi qoidadan keyin
# yoziladi va aniqligi yuqoriroq).
solid = set()
for m in re.finditer(r'(?<![\w-])(?:bg|from)-(cyan|emerald|amber|sky|rose|indigo|purple|violet|teal|blue|pink|orange|yellow|green|red|fuchsia|lime)-(400|500|600|700)(?![\w/-])', src):
    solid.add(m.group(0))
keep_white = []
for c in sorted(solid):
    e = esc(c)
    keep_white += [f"{S} .{e}.text-white", f"{S} .{e} .text-white"]

out = ["/* AVTOMATIK YARATILGAN — tahrir qilmang. Manba: gen_tong.py (qarang CLAUDE.md).",
       "   \"Tinch tong\" mavzusi: Mini App'dagi qorong'i Tailwind rang klasslarining",
       "   yorug' muqobillari. Faqat body[data-theme=\"tong\"] ichida ishlaydi. */"]
for decl, sels in sorted(rules.items(), key=lambda kv: sorted(kv[1])[0]):
    out.append(",\n".join(sorted(sels)) + " {" + decl + "}")
out.append(",\n".join(keep_white) + " {color:#ffffff}")
pathlib.Path(sys.argv[2]).write_text("\n".join(out) + "\n", encoding="utf-8")
print("qoidalar:", sum(len(v) for v in rules.values()), "selector,", len(rules), "blok; oq qoladigan tugma klasslari:", len(solid))
