"""
transcribe.py
-------------
Audio faylni (mikrofon yozuvi) faster-whisper (mahalliy, bepul, ochiq kodli)
yordamida matnga o'giradi. O'zbek va rus tillarida so'zlashuvlarni tanib
olish uchun ishlatiladi. Audio fayl hech qayerga (bulutga) yuborilmaydi —
butunlay lokal kompyuterda qayta ishlanadi (TZ 4.5).

Talab qilinadigan kutubxona:
    pip install faster-whisper

Birinchi ishga tushirishda model avtomatik yuklab olinadi (~1-3 GB, model
o'lchamiga qarab) va keyingi safar internetga muhtoj bo'lmay ishlaydi.
"""

import logging
from functools import lru_cache
from faster_whisper import WhisperModel

logger = logging.getLogger(__name__)

# TEZLIK BO'YICHA TUZATISH (real testda kuzatildi): sinov kompyuteri
# (Intel i5-1035G1, GPU'siz kuchsiz noutbuk protsessori) "small" modelda
# 1-2 daqiqalik audio uchun ~30+ daqiqa protsessor vaqti sarfladi — bu
# amaliy ishlatish uchun juda sekin. Shuning uchun:
#   1) "base" modelga tushirildi ("small"dan ~2-3x tezroq, aniqlik biroz
#      pasayadi — o'zbek tili uchun "small"ning o'zi ham katta aniqlik
#      bermagani sababli, bu almashinuv oqlanadi);
#   2) beam_size 5 dan 1 ga tushirildi (greedy qidiruv — sezilarli tezroq,
#      aniqlik farqi odatda kichik);
#   3) cpu_threads aniq ko'rsatildi — barcha mavjud yadrolardan foydalanish
#      uchun (standart holatda ctranslate2 har doim ham to'liq
#      foydalanmasligi mumkin edi).
# Agar aniqlik ko'proq muhim bo'lsa (tezlikdan ko'ra), MODEL_SIZE="small"
# yoki "medium"ga qaytarish, BEAM_SIZE'ni oshirish mumkin — lekin GPU'siz
# kompyuterda bu sezilarli sekinlashuvga olib keladi.
MODEL_SIZE = "base"
BEAM_SIZE = 1

# "cpu" — GPU bo'lmagan kompyuterlar uchun (masalan, oddiy ish stantsiyasi).
# GPU mavjud bo'lsa, "cuda" ga o'zgartirish tezlikni SEZILARLI (10x+)
# oshiradi — agar loyiha kattalashsa (bir nechta darcha, ko'proq audio),
# NVIDIA GPU'li kompyuterga o'tish eng samarali tezlashtirish usuli bo'ladi.
DEVICE = "cpu"
COMPUTE_TYPE = "int8"  # CPU'da tezroq ishlashi uchun kvantlangan model
CPU_THREADS = 8  # sinov kompyuteridagi mantiqiy yadrolar soni — o'z kompyuteringizga moslang


@lru_cache(maxsize=1)
def _get_model() -> WhisperModel:
    """
    Modelni faqat bir marta xotiraga yuklaydi (keyingi chaqiruvlarda qayta
    ishlatiladi) — har bir transkripsiya uchun qayta yuklash vaqtni behuda
    sarflaydi.
    """
    logger.info(
        f"faster-whisper modeli yuklanmoqda ({MODEL_SIZE}, {DEVICE}/{COMPUTE_TYPE}, "
        f"{CPU_THREADS} thread)..."
    )
    return WhisperModel(MODEL_SIZE, device=DEVICE, compute_type=COMPUTE_TYPE, cpu_threads=CPU_THREADS)


def transcribe_audio(file_path: str, language_hint: str | None = None) -> tuple[str, str]:
    """
    Asosiy funksiya: audio faylni matnga o'giradi.

    YANGILIK (TZ 24-bo'lim, rus tili qo'llab-quvvatlash): standart holatda
    `language_hint=None` — model tilni AVTOMATIK aniqlaydi (o'zbek yoki
    rus, xodim/mijoz qaysi tilda gaplashishidan qat'iy nazar). Agar aniq
    bitta tilni majburlash kerak bo'lsa (masalan sifat pastroq chiqsa),
    "uz" yoki "ru" belgilang.

    Parametrlar:
        file_path (str): Audio faylning to'liq (lokal) yo'li.
        language_hint (str, ixtiyoriy): "uz", "ru" yoki None (avtomatik).

    Qaytaradi:
        tuple[str, str]: (to'liq transkripsiya matni, aniqlangan til kodi).
    """
    logger.info(f"Transkripsiya boshlandi: {file_path}")

    model = _get_model()
    segments, info = model.transcribe(
        file_path,
        language=language_hint,
        vad_filter=True,       # jimlik/shovqin qismlarini avtomatik o'tkazib yuboradi
        beam_size=BEAM_SIZE,
    )

    full_text = " ".join(segment.text.strip() for segment in segments).strip()
    detected_language = info.language

    logger.info(
        f"Transkripsiya tugadi: {len(full_text)} belgi, "
        f"aniqlangan til: {detected_language} (ishonch: {info.language_probability:.2f})"
    )
    return full_text, detected_language


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    text, lang = transcribe_audio("test_audio.wav")
    print(f"[{lang}] {text}")

# ---------------------------------------------------------------------------
# ESLATMA: agar kelajakda sifatni solishtirish uchun OpenAI Whisper API
# (pullik) bilan qiyoslash kerak bo'lsa, shu faylning ichki logikasi
# almashtiriladi — `analyzer.py` dagi kabi, tashqi modullar faqat
# `transcribe_audio()` funksiyasini chaqiradi va ichki implementatsiyadan
# bexabar ishlaydi.
# ---------------------------------------------------------------------------
