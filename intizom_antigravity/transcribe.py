"""
transcribe.py
-------------
Audio faylni (mikrofon yozuvi) faster-whisper (mahalliy, bepul, ochiq kodli)
yordamida matnga o'giradi. O'zbek va rus tillarida so'zlashuvlarni tanib
olish uchun ishlatiladi.

YANGILIK:
  - Sohaviy kontekst lug'ati (`initial_prompt`) qo'shildi — Whisper o'zbek tilidagi
    davlat xizmatlari atamalarini (kadastr, YaIDXP, elektron imzo, JSHSHIR) aniqroq taniydi.
  - CPU yadrolari soni avtomatik aniqlanadi (`os.cpu_count()`).
"""

import os
import logging
from functools import lru_cache
from faster_whisper import WhisperModel

logger = logging.getLogger(__name__)

MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "base")
BEAM_SIZE = int(os.getenv("WHISPER_BEAM_SIZE", "1"))
DEVICE = os.getenv("WHISPER_DEVICE", "cpu")
COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "int8")

# Mavjud protsessor yadrolariga moslashish
_detected_cores = os.cpu_count() or 4
CPU_THREADS = min(8, max(2, _detected_cores))

# O'zbek va rus tillarida soha atamalarini aniq eshitish uchun kontekst
INITIAL_PROMPT_UZ_RU = (
    "Kadastr, passport, F.I.Sh, PINFL, JSHSHIR, elektron raqamli imzo, "
    "davlat xizmatlari, YaIDXP, to'lov kvitansiyasi, notarius, litsenziya, "
    "ruxsatnoma, ma'lumotnoma, propiska, guvohnoma, dublikat, oyna, darcha, "
    "паспорт, кадастр, госпошлина, электронная подпись, справка."
)


@lru_cache(maxsize=1)
def _get_model() -> WhisperModel:
    logger.info(
        f"faster-whisper modeli yuklanmoqda ({MODEL_SIZE}, {DEVICE}/{COMPUTE_TYPE}, "
        f"{CPU_THREADS} thread)..."
    )
    return WhisperModel(MODEL_SIZE, device=DEVICE, compute_type=COMPUTE_TYPE, cpu_threads=CPU_THREADS)


def transcribe_audio(file_path: str, language_hint: str | None = None) -> tuple[str, str]:
    """
    Audio faylni matnga o'giradi.
    """
    logger.info(f"Transkripsiya boshlandi: {file_path}")

    model = _get_model()
    segments, info = model.transcribe(
        file_path,
        language=language_hint,
        vad_filter=True,
        beam_size=BEAM_SIZE,
        initial_prompt=INITIAL_PROMPT_UZ_RU,
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
