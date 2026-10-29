"""Qalqon bazasining zaxira nusxasi — egasining kompyuteriga.

Bepul Supabase bazani avtomatik zaxiralamaydi: baza buzilsa yoki xato
o'chirilsa, oilalar, joylashuv tarixi, chat — hammasi yo'qoladi. Bu skript
pg_dump bilan to'liq nusxa olib, qalqon-maxfiy\\zaxira papkasiga qo'yadi va
oxirgi 8 tasini saqlaydi. Parol repoda EMAS (repo ochiq) — u
qalqon-maxfiy\\frankfurt-db.txt dan o'qiladi.

Ishga tushirish:   python tools\\zaxira.py
Har hafta o'zi:    Windows "Task Scheduler"da "Qalqon zaxira" vazifasi
                   (yakshanba 12:00; kompyuter o'chiq bo'lsa — yoqilganda).
Tiklash:           pg_restore --clean --no-owner -d "<ulanish>" <fayl>.dump

Eslatma: chat suratlari (Supabase Storage, "chat-photos") bu nusxaga
kirmaydi — ular bazada emas, fayl omborida.
"""
import datetime
import os
import pathlib
import shutil
import subprocess
import sys

MAXFIY = pathlib.Path(os.environ.get("QALQON_MAXFIY", r"C:\Users\Surface\qalqon-maxfiy"))
PAPKA = MAXFIY / "zaxira"
SAQLANADI = 8
ULANISH = ("host=aws-1-eu-central-1.pooler.supabase.com port=5432 dbname=postgres "
           "user=postgres.ytjvmmcpmpnaivtzymtq sslmode=require")


def parol() -> str:
    for qator in (MAXFIY / "frankfurt-db.txt").read_text(encoding="utf-8").splitlines():
        if qator.startswith("Baza paroli (postgres):"):
            return qator.split(":", 1)[1].strip()
    sys.exit("frankfurt-db.txt da baza paroli topilmadi")


def main() -> None:
    pg_dump = shutil.which("pg_dump")
    if not pg_dump:
        sys.exit("pg_dump topilmadi (PostgreSQL bin papkasi PATH'da bo'lishi kerak)")
    PAPKA.mkdir(parents=True, exist_ok=True)
    fayl = PAPKA / f"qalqon-{datetime.datetime.now():%Y-%m-%d_%H%M}.dump"
    env = dict(os.environ, PGPASSWORD=parol(), PGCONNECT_TIMEOUT="30")
    # Faqat bizning ma'lumot: public sxema (+ cron ishlari ro'yxati).
    r = subprocess.run(
        [pg_dump, "--format=custom", "--no-owner", "--no-privileges",
         "--schema=public", "--file", str(fayl), ULANISH],
        env=env, capture_output=True, text=True,
    )
    if r.returncode != 0:
        fayl.unlink(missing_ok=True)
        sys.exit("pg_dump xatosi: " + r.stderr.strip()[-500:])
    print(f"Zaxira tayyor: {fayl} ({fayl.stat().st_size // 1024} KB)")

    eskilar = sorted(PAPKA.glob("qalqon-*.dump"))[:-SAQLANADI]
    for f in eskilar:
        f.unlink()
        print("Eski nusxa o'chirildi:", f.name)


if __name__ == "__main__":
    main()
