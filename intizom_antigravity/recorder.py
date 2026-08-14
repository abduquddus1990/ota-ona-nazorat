"""
recorder.py
-----------
Mikrofondan uzluksiz tinglab, xodim/mijoz gapira boshlaganda avtomatik
yozishni boshlaydi, jim bo'lib qolganda to'xtatib, alohida audio fayl
sifatida saqlaydi (VAD — Voice Activity Detection asosida).

YANGILIK (TZ 22-bo'lim): davomat/holat kuzatuvi uchun HEARTBEAT mexanizmi
qo'shildi — dastur muntazam ravishda "men hali ishlayapman" degan holat
faylini yangilab turadi, server esa shu asosida ish vaqtini hisoblaydi.

YANGILIK (TZ 22.2-band): ISH SOATLARI OYNASI — sozlanuvchi vaqt oralig'idan
tashqarida mikrofon tinglamaydi (maxfiylik va resurs tejash uchun).

YANGILIK (TZ 23-bo'lim): AVTOMATIK CHASTOTA MOSLASHUVI — har xil
mikrofon modellari 16000 Hz'ni to'g'ridan-to'g'ri qo'llab-quvvatlamasligi
mumkin; qurilma qo'llab-quvvatlamasa, o'z standart chastotasi webrtcvad
qo'llab-quvvatlaydigan eng yaqin qiymatga moslashtiriladi. Bluetooth
mikrofon uzilib qolsa ham dastur yiqilmaydi — avtomatik qayta ulanadi
(shaxsiy sozlash uchun `setup_wizard.py`ga qarang).

Bu skript har bir "darcha" kompyuterida mustaqil ishlaydi (ish soatlari
belgilangan bo'lsa shu oraliqda, aks holda 24/7). Audio fayllar
`RECORDINGS_DIR`ga (TZ 19-bo'lim: mahalliy yoki tarmoq/SMB papka) yoziladi
— audio hech qachon tashqi AI provayderiga to'g'ridan-to'g'ri yuborilmaydi.

Talab qilinadigan kutubxonalar:
    pip install sounddevice webrtcvad numpy scipy
"""

import os
import time
import json
import wave
import signal
import logging
import argparse
import atexit
from datetime import datetime, time as dtime
from pathlib import Path

import numpy as np
import sounddevice as sd
import webrtcvad

logger = logging.getLogger(__name__)

# ---- Sozlamalar -----------------------------------------------------------
SAMPLE_RATE = 16000          # avval shu chastota sinaladi (eng samarali)
# webrtcvad FAQAT shu 4 ta chastotani qo'llab-quvvatlaydi:
_VAD_SUPPORTED_RATES = (8000, 16000, 32000, 48000)
FRAME_MS = 30                # webrtcvad uchun freym uzunligi: 10, 20 yoki 30 ms
FRAME_SIZE = int(SAMPLE_RATE * FRAME_MS / 1000)
VAD_AGGRESSIVENESS = 2       # 0 (yumshoq) — 3 (qattiq, faqat aniq nutqni ushlaydi)
SILENCE_TIMEOUT_SEC = 10.0   # shuncha vaqt jim bo'lsa, yozuvni tugatadi (xodim
                              # hujjat tekshirishi/tovar olib berishi kabi
                              # qisqa pauzalar suhbatni bo'lib yubormasligi uchun)
MIN_RECORDING_SEC = 1.5      # bundan qisqa yozuvlar chiqindi sifatida tashlab yuboriladi

# TZ 19-bo'lim: server va xodim kompyuterlari bir xil jismoniy papkaga
# turlicha manzil (lokal yo'l yoki tarmoq/SMB yo'li) bilan murojaat qiladi.
OUTPUT_DIR = Path(os.getenv("RECORDINGS_DIR", "./recordings"))

# TZ 22-bo'lim: heartbeat — har necha soniyada holat fayli yangilanadi
HEARTBEAT_INTERVAL_SEC = 180  # 3 daqiqa

# TZ 22.2-band: ish soatlari oynasi (bo'sh qoldirilsa — cheklovsiz, 24/7)
WORK_HOURS_START = os.getenv("WORK_HOURS_START", "")  # masalan "09:00"
WORK_HOURS_END = os.getenv("WORK_HOURS_END", "")       # masalan "18:00"


def _parse_time(value: str) -> dtime | None:
    if not value:
        return None
    try:
        h, m = map(int, value.split(":"))
        return dtime(hour=h, minute=m)
    except ValueError:
        logger.warning(f"Noto'g'ri vaqt formati: '{value}' (kutilgan: HH:MM) — e'tiborsiz qoldirildi")
        return None


WORK_START_T = _parse_time(WORK_HOURS_START)
WORK_END_T = _parse_time(WORK_HOURS_END)


def _is_within_work_hours() -> bool:
    """Agar ish soatlari belgilanmagan bo'lsa, doim True (cheklovsiz)."""
    if WORK_START_T is None or WORK_END_T is None:
        return True
    now = datetime.now().time()
    if WORK_START_T <= WORK_END_T:
        return WORK_START_T <= now <= WORK_END_T
    return now >= WORK_START_T or now <= WORK_END_T  # tungi smena holati


class MicRecorder:
    """
    Bitta mikrofon uchun uzluksiz tinglash, VAD asosida yozib olish,
    va davomat uchun heartbeat holat faylini yuritish.
    """

    def __init__(self, microphone_id: str, device_index: int | None = None):
        self.microphone_id = microphone_id
        self.device_index = device_index
        self.vad = webrtcvad.Vad(VAD_AGGRESSIVENESS)
        self.output_dir = OUTPUT_DIR / microphone_id
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.status_path = self.output_dir / "_status.json"
        self.session_start = datetime.now()
        self._last_heartbeat_write = 0.0

        # TZ 23-bo'lim: har bir qurilma o'zining "mahalliy" chastotasini
        # talab qilishi mumkin (44100/48000 Hz — 16000 Hz'ni to'g'ridan-
        # to'g'ri qo'llab-quvvatlamaydigan arzon mikrofonlar ko'p). Shu
        # sababli qat'iy 16000 o'rniga, mos keladigan chastotani avtomatik
        # aniqlaymiz.
        self.sample_rate = self._resolve_sample_rate()
        self.frame_size = int(self.sample_rate * FRAME_MS / 1000)

        # Dastur qanday to'xtasa ham (Ctrl+C, Windows to'xtatishi),
        # session_end yozilishi uchun:
        atexit.register(self._write_graceful_shutdown)
        signal.signal(signal.SIGINT, self._handle_signal)
        signal.signal(signal.SIGTERM, self._handle_signal)

    def _resolve_sample_rate(self) -> int:
        """
        Avval 16000 Hz'ni sinaydi (eng samarali — qo'shimcha qayta
        hisoblash shart emas). Qurilma buni qo'llab-quvvatlamasa,
        qurilmaning o'z standart chastotasini olib, webrtcvad qo'llab-
        quvvatlaydigan eng yaqin qiymatga (8000/16000/32000/48000)
        yaxlitlaydi.
        """
        try:
            sd.check_input_settings(device=self.device_index, samplerate=SAMPLE_RATE, channels=1)
            return SAMPLE_RATE
        except Exception:
            logger.warning(
                f"[{self.microphone_id}] Qurilma {SAMPLE_RATE} Hz'ni qo'llab-quvvatlamaydi — "
                f"avtomatik moslashtirilmoqda..."
            )

        try:
            device_info = sd.query_devices(self.device_index, "input")
            native_rate = int(device_info["default_samplerate"])
        except Exception:
            logger.exception(f"[{self.microphone_id}] Qurilma ma'lumotini olishda xatolik, 48000 Hz ishlatiladi")
            return 48000

        # webrtcvad qo'llab-quvvatlaydigan eng yaqin (kamida teng) chastotani tanlaymiz
        for rate in _VAD_SUPPORTED_RATES:
            if rate >= native_rate:
                logger.info(f"[{self.microphone_id}] Tanlangan chastota: {rate} Hz (qurilma: {native_rate} Hz)")
                return rate
        return 48000  # eng yuqori qo'llab-quvvatlanadigan qiymat

    def _write_heartbeat(self, force: bool = False):
        """TZ 22-bo'lim: har HEARTBEAT_INTERVAL_SEC da holat faylini yangilaydi."""
        now = time.time()
        if not force and (now - self._last_heartbeat_write) < HEARTBEAT_INTERVAL_SEC:
            return
        self._last_heartbeat_write = now
        status = {
            "microphone_id": self.microphone_id,
            "session_start": self.session_start.isoformat(),
            "last_heartbeat": datetime.now().isoformat(),
            "ended_gracefully": False,
        }
        try:
            self.status_path.write_text(json.dumps(status, ensure_ascii=False), encoding="utf-8")
        except OSError:
            logger.exception("Holat faylini yozishda xatolik (tarmoq uzilgan bo'lishi mumkin)")

    def _write_graceful_shutdown(self):
        """Dastur to'g'ri (kutilgan tarzda) to'xtaganda chaqiriladi."""
        status = {
            "microphone_id": self.microphone_id,
            "session_start": self.session_start.isoformat(),
            "last_heartbeat": datetime.now().isoformat(),
            "session_end": datetime.now().isoformat(),
            "ended_gracefully": True,
        }
        try:
            self.status_path.write_text(json.dumps(status, ensure_ascii=False), encoding="utf-8")
            logger.info(f"[{self.microphone_id}] Sessiya to'g'ri yakunlandi")
        except OSError:
            pass

    def _handle_signal(self, signum, frame):
        self._write_graceful_shutdown()
        raise SystemExit(0)

    def _save_wav(self, frames: list[bytes]) -> str | None:
        """Yig'ilgan freymlarni WAV faylga yozadi. Juda qisqa yozuvlarni tashlab yuboradi."""
        frame_ms_actual = self.frame_size / self.sample_rate * 1000
        duration_sec = len(frames) * frame_ms_actual / 1000
        if duration_sec < MIN_RECORDING_SEC:
            logger.debug(f"Juda qisqa yozuv ({duration_sec:.1f}s) — o'tkazib yuborildi")
            return None

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filepath = self.output_dir / f"{timestamp}.wav"

        with wave.open(str(filepath), "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)  # 16-bit
            wf.setframerate(self.sample_rate)
            wf.writeframes(b"".join(frames))

        logger.info(f"[{self.microphone_id}] Yozuv saqlandi: {filepath} ({duration_sec:.1f}s)")
        return str(filepath)

    def run(self, on_new_recording=None):
        """
        Asosiy tsikl: mikrofonni uzluksiz tinglaydi, nutq boshlanganda yozadi,
        jim bo'lganda faylga saqlaydi. `on_new_recording(filepath, microphone_id)`
        callback funksiyasi — yangi fayl tayyor bo'lganda chaqiriladi (masalan,
        uni transkripsiya navbatiga qo'yish uchun).
        """
        logger.info(
            f"[{self.microphone_id}] Tinglash boshlandi (qurilma: {self.device_index or 'default'}, "
            f"chastota: {self.sample_rate} Hz"
            f"{f', ish soatlari: {WORK_HOURS_START}-{WORK_HOURS_END}' if WORK_START_T else ''})"
        )
        self._write_heartbeat(force=True)

        is_recording = False
        current_frames: list[bytes] = []
        silence_start: float | None = None

        def callback(indata, frame_count, time_info, status):
            nonlocal is_recording, current_frames, silence_start
            if status:
                logger.warning(f"[{self.microphone_id}] Audio status: {status}")

            if not _is_within_work_hours():
                # Ish soatlaridan tashqarida — VAD ishlatilmaydi, hech narsa yozilmaydi
                if is_recording:
                    # Ish vaqti tugaganda tugallanmagan yozuvni yakunlaymiz
                    filepath = self._save_wav(current_frames)
                    if filepath and on_new_recording:
                        on_new_recording(filepath, self.microphone_id)
                    is_recording = False
                    current_frames = []
                return

            # BUG TUZATISH 1: webrtcvad FAQAT aniq uzunlikdagi freymni qabul
            # qiladi. Agar sounddevice oqim boshida/oxirida to'liqsiz freym
            # bersa, is_speech() xatolik bilan yiqiladi — shuning uchun
            # bunday freymlarni o'tkazib yuboramiz.
            if len(indata) != self.frame_size:
                return

            # BUG TUZATISH 2: float32 audio [-1.0, 1.0] oralig'ida bo'lishi
            # kerak, lekin mikrofon kuchaytirgichi ba'zan buni oshirib yuborishi
            # mumkin — bu int16'ga o'tkazishda "clipping" (buzilish) yoki hatto
            # butun son to'lib ketishi (overflow) xatosiga olib kelishi mumkin.
            # np.clip bilan xavfsiz chegaralaymiz.
            clipped = np.clip(indata[:, 0], -1.0, 1.0)
            frame_bytes = (clipped * 32767).astype(np.int16).tobytes()
            is_speech = self.vad.is_speech(frame_bytes, self.sample_rate)

            if is_speech:
                if not is_recording:
                    logger.debug(f"[{self.microphone_id}] Nutq aniqlandi — yozib boshlandi")
                    is_recording = True
                    current_frames = []
                current_frames.append(frame_bytes)
                silence_start = None
            elif is_recording:
                current_frames.append(frame_bytes)  # qisqa pauzalarni ham saqlab qolamiz
                if silence_start is None:
                    silence_start = time.time()
                elif time.time() - silence_start >= SILENCE_TIMEOUT_SEC:
                    # Jimlik chegarasidan o'tdi — yozuvni yakunlaymiz
                    filepath = self._save_wav(current_frames)
                    if filepath and on_new_recording:
                        on_new_recording(filepath, self.microphone_id)
                    is_recording = False
                    current_frames = []
                    silence_start = None

        # TZ 23.4-band: BLUETOOTH UCHUN CHIDAMLILIK — BT mikrofonlar radius
        # tashqarisiga chiqib ketish yoki quvvat tejash tufayli uzilib
        # qolishi mumkin. Har qanday uzilishda dastur to'xtamaydi — qayta
        # ulanishga urinaveradi (5 soniyalik oraliqda).
        while True:
            try:
                with sd.InputStream(
                    samplerate=self.sample_rate,
                    channels=1,
                    dtype="float32",
                    blocksize=self.frame_size,
                    device=self.device_index,
                    callback=callback,
                ):
                    while True:
                        time.sleep(1.0)
                        self._write_heartbeat()  # TZ 22-bo'lim
            except KeyboardInterrupt:
                logger.info(f"[{self.microphone_id}] To'xtatildi")
                break
            except Exception:
                logger.exception(
                    f"[{self.microphone_id}] Audio oqimida uzilish (Bluetooth radius/quvvat "
                    f"tejash bo'lishi mumkin) — 5 soniyadan keyin qayta ulanishga urinilmoqda..."
                )
                is_recording = False
                current_frames = []
                time.sleep(5.0)


def default_on_new_recording(filepath: str, microphone_id: str):
    """
    Standart callback: hozircha faqat log yozadi. Real loyihada bu yerga
    transkripsiya navbatiga qo'yish (masalan, `bot.py`dagi
    `process_and_report()` ga uzatish) logikasi ulanadi — masalan, fayl
    yo'lini bir queue.Queue()ga yoki mahalliy bazadagi "pending" jadvaliga
    yozish orqali.
    """
    logger.info(f"Yangi yozuv tayyor: {filepath} (mikrofon: {microphone_id})")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

    parser = argparse.ArgumentParser(description="Darcha mikrofonidan avtomatik yozib olish")
    parser.add_argument("--microphone-id", required=True, help="Masalan: mic-1, mic-5")
    parser.add_argument("--device-index", type=int, default=None, help="sounddevice qurilma raqami (ixtiyoriy)")
    args = parser.parse_args()

    recorder = MicRecorder(microphone_id=args.microphone_id, device_index=args.device_index)
    recorder.run(on_new_recording=default_on_new_recording)

# ---------------------------------------------------------------------------
# Bir nechta mikrofonni parallel ishga tushirish uchun, har bir mikrofon
# uchun alohida jarayon (process) sifatida shu skriptni ishga tushiring:
#
#   python recorder.py --microphone-id mic-1 --device-index 1
#
# Kompyuter yoqilganda AVTOMATIK ishga tushishi uchun Windows Task
# Scheduler'da "At log on" trigger bilan sozlang (TZ 19/22-bo'lim). Yangi
# mikrofonni birinchi marta ulaganda avval `setup_wizard.py`ni ishga
# tushirib, mos qurilma raqamini va sifatini tekshiring (TZ 23-bo'lim).
# ---------------------------------------------------------------------------
