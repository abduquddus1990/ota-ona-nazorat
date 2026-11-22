"""Material Symbols ikonka shriftidan faqat ilovada ishlatiladigan belgilarni ajratib oladi.

Ilgari ikonkalar fonts.googleapis.com'dan (icon_names=...) yuklanardi. Google
sekin yoki bloklangan tarmoqda ular "home", "settings" degan SO'Z bo'lib
ko'rinardi. Endi shrift repoda: vendor/fonts/material-symbols.woff2.

Yangi ikonka qo'shsangiz:
  1) NOMLAR ro'yxatiga qo'shing (alifbo tartibida);
  2) npm pack material-symbols && tar xzf material-symbols-*.tgz
  3) python tools/fonts/subset_icons.py package/material-symbols-outlined.woff2
"""
import sys
from fontTools.ttLib import TTFont
from fontTools import subset

NOMLAR = sorted("""
apps arrow_back auto_awesome battery_charging_full chat child_care distance
family_restroom home location_on map menu_book military_tech notifications
person psychology school settings shield shield_person smart_toy
stadia_controller timer verified_user
""".split())

src = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else "vendor/fonts/material-symbols.woff2"
font = TTFont(src)
cmap = font.getBestCmap()
glyph_of = {chr(c): g for c, g in cmap.items()}
names = set(NOMLAR)

def spell(first, comps):
    rev = {g: ch for ch, g in glyph_of.items()}
    try:
        return rev[first] + "".join(rev[c] for c in comps)
    except KeyError:
        return None

kept = set()
for lookup in font["GSUB"].table.LookupList.Lookup:
    for st in lookup.SubTable:
        if st.LookupType == 7:
            st = st.ExtSubTable
        if getattr(st, "LookupType", None) != 4 and type(st).__name__ != "LigatureSubst":
            continue
        for first, ligs in list(st.ligatures.items()):
            keep = [l for l in ligs if spell(first, l.Component) in names]
            for l in keep:
                kept.add(spell(first, l.Component))
            if keep:
                st.ligatures[first] = keep
            else:
                del st.ligatures[first]

missing = names - kept
if missing:
    sys.exit("Shriftda topilmadi: " + ", ".join(sorted(missing)))

opts = subset.Options()
opts.layout_features = ["*"]
opts.flavor = "woff2"
opts.notdef_outline = True
sub = subset.Subsetter(opts)
sub.populate(text="abcdefghijklmnopqrstuvwxyz0123456789_ ")
sub.subset(font)
font.flavor = "woff2"
font.save(out)
print(out, len(NOMLAR), "ta ikonka")
