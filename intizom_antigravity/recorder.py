"""
recorder.py
-----------
Mikrofondan uzluksiz tinglab, xodim/mijoz gapira boshlaganda avtomatik
yozishni boshlaydi, jim bo'lib qolganda to'xtatib, alohida audio fayl
sifatida saqlaydi (VAD — Voice Activity Detection asosida).

YANGILIK:
  - Atomik fayl saqlash (.recording.tmp -> .wav): bot.py va recorder.py o'rtasida
    fayl bloklanishi (Windows WinError 32) va chala audio o'qilishining oldi olindi.
  - Atomik Heartbeat: _status.json.tmp orqali JSONDecodeError xatolari bartaraf etildi.
  - Avtomatik qayta ulanish va xatoliklarga chidamlilik.
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
_VAD_SUPPORTED_RATES = (8000, 16000, 32000, 48000)
FRAME_MS = 30                # webrtcvad uchun freym uzunligi: 10, 20 yoki 30 ms
FRAME_SIZE = int(SAMPLE_RATE * FRAME_MS / 1000)
VAD_AGGRESSIVENESS = 2       # 0 (yumshoq) — 3 (qattiq)
SILENCE_TIMEOUT_SEC = 10.0   # suhbat tugaganini aniqlash chegarasi
MIN_RECORDING_SEC = 1.5      # bundan qisqa yozuvlar tashlab yuboriladi

OUTPUT_DIR = Path(os.getenv("RECORDINGS_DIR", "./recordings"))
HEARTBEAT_INTERVAL_SEC = 180  # 3 daqiqa
WORK_HOURS_START = os.getenv("WORK_HOURS_START", "")
WORK_HOURS_END = os.getenv("WORK_HOURS_END", "")


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
    if WORK_START_T is None or WORK_END_T is None:
        return True
    now = datetime.now().time()
    if WORK_START_T <= WORK_END_T:
        return WORK_START_T <= now <= WORK_END_T
    return now >= WORK_START_T or now <= WORK_END_T


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

        self.sample_rate = self._resolve_sample_rate()
        self.frame_size = int(self.sample_rate * FRAME_MS / 1000)

        atexit.register(self._write_graceful_shutdown)
        signal.signal(signal.SIGINT, self._handle_signal)
        signal.signal(signal.SIGTERM, self._handle_signal)

    def _resolve_sample_rate(self) -> int:
        try:
            sd.check_input_settings(device=self.device_index, samplerate=SAMPLE_RATE, channels=1)
            return SAMPLE_RATE
        except Exception:
            logger.warning(
                f"[{self.microphone_id}] Qurilma {SAMPLE_RATE} Hz'ni qo'llab-quvvatlamaydi — avtomatik moslashtirilmoqda..."
            )

        try:
            device_info = sd.query_devices(self.device_index, "input")
            native_rate = int(device_info["default_samplerate"])
        except Exception:
            logger.exception(f"[{self.microphone_id}] Qurilma ma'lumotini olishda xatolik, 48000 Hz ishlatiladi")
            return 48000

        for rate in _VAD_SUPPORTED_RATES:
            if rate >= native_rate:
                logger.info(f"[{self.microphone_id}] Tanlangan chastota: {rate} Hz (qurilma: {native_rate} Hz)")
                return rate
        return 48000

    def _write_heartbeat(self, force: bool = False):
        """Atomik tarzda heartbeat holat faylini yangilaydi."""
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
            tmp_path = self.status_path.with_suffix(".json.tmp")
            tmp_path.write_text(json.dumps(status, ensure_ascii=False), encoding="utf-8")
            tmp_path.replace(self.status_path)
        except OSError:
            logger.exception("Holat faylini yozishda xatolik")

    def _write_graceful_shutdown(self):
        status = {
            "microphone_id": self.microphone_id,
            "session_start": self.session_start.isoformat(),
            "last_heartbeat": datetime.now().isoformat(),
            "session_end": datetime.now().isoformat(),
            "ended_gracefully": True,
        }
        try:
            tmp_path = self.status_path.with_suffix(".json.tmp")
            tmp_path.write_text(json.dumps(status, ensure_ascii=False), encoding="utf-8")
            tmp_path.replace(self.status_path)
            logger.info(f"[{self.microphone_id}] Sessiya to'g'ri yakunlandi")
        except OSError:
            pass

    def _handle_signal(self, signum, frame):
        self._write_graceful_shutdown()
        raise SystemExit(0)

    def _save_wav(self, frames: list[bytes]) -> str | None:
        """
        Yig'ilgan freymlarni WAV faylga atomik tarzda yozadi.
        Fayl avval .recording.tmp ko'rinishida yoziladi, to'liq yopilgach
        .wav ga aylantiriladi — shunda bot.py uni chala o'qish xavfi yo'qoladi.
        """
        frame_ms_actual = self.frame_size / self.sample_rate * 1000
        duration_sec = len(frames) * frame_ms_actual / 1000
        if duration_sec < MIN_RECORDING_SEC:
            logger.debug(f"Juda qisqa yozuv ({duration_sec:.1f}s) — o'tkazib yuborildi")
            return None

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        final_filepath = self.output_dir / f"{timestamp}.wav"
        temp_filepath = self.output_dir / f"{timestamp}.recording.tmp"

        try:
            with wave.open(str(temp_filepath), "wb") as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)  # 16-bit
                wf.setframerate(self.sample_rate)
                wf.writeframes(b"".join(frames))

            temp_filepath.replace(final_filepath)
            logger.info(f"[{self.microphone_id}] Yozuv saqlandi: {final_filepath} ({duration_sec:.1f}s)")
            return str(final_filepath)
        except Exception:
            logger.exception(f"[{self.microphone_id}] WAV yozishda xatolik: {temp_filepath}")
            if temp_filepath.exists():
                temp_filepath.unlink(missing_ok=True)
            return None

    def run(self, on_new_recording=None):
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
                if is_recording:
                    filepath = self._save_wav(current_frames)
                    if filepath and on_new_recording:
                        on_new_recording(filepath, self.microphone_id)
                    is_recording = False
                    current_frames = []
                return

            if len(indata) != self.frame_size:
                return

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
                current_frames.append(frame_bytes)
                if silence_start is None:
                    silence_start = time.time()
                elif time.time() - silence_start >= SILENCE_TIMEOUT_SEC:
                    filepath = self._save_wav(current_frames)
                    if filepath and on_new_recording:
                        on_new_recording(filepath, self.microphone_id)
                    is_recording = False
                    current_frames = []
                    silence_start = None

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
                        self._write_heartbeat()
            except KeyboardInterrupt:
                logger.info(f"[{self.microphone_id}] To'xtatildi")
                break
            except Exception:
                logger.exception(
                    f"[{self.microphone_id}] Audio oqimida uzilish — 5 soniyadan keyin qayta ulanishga urinilmoqda..."
                )
                is_recording = False
                current_frames = []
                time.sleep(5.0)


def default_on_new_recording(filepath: str, microphone_id: str):
    logger.info(f"Yangi yozuv tayyor: {filepath} (mikrofon: {microphone_id})")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

    parser = argparse.ArgumentParser(description="Darcha mikrofonidan avtomatik yozib olish")
    parser.add_argument("--microphone-id", required=True, help="Masalan: mic-1, mic-5")
    parser.add_argument("--device-index", type=int, default=None, help="sounddevice qurilma raqami (ixtiyoriy)")
    args = parser.parse_args()

    recorder = MicRecorder(microphone_id=args.microphone_id, device_index=args.device_index)
    recorder.run(on_new_recording=default_on_new_recording)
