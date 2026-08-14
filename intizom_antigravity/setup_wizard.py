"""
setup_wizard.py
----------------
Har bir mijoz/xodim kompyuterida mikrofon TURLICHA bo'lishi mumkin —
bu skript shu farqni "shaxsiy sozlash" (personal nastroyka) jarayonini
avtomatlashtiradi: mavjud mikrofonlarni ro'yxatlab, tanlashga yordam
beradi, sinov yozuvi orqali ishlashini tekshiradi, va natijani
`recorder.py` ishlatadigan buyruqqa aylantirib beradi.

ISHLATISH:
    python setup_wizard.py

Bu — bir martalik jarayon, har bir yangi kompyuter/mikrofon uchun
bitta marta ishga tushiriladi.
"""

import sys
import time
import wave
import tempfile
from pathlib import Path

import numpy as np
import sounddevice as sd


def list_input_devices() -> list[dict]:
    devices = sd.query_devices()
    return [
        {"index": i, "name": d["name"], "default_samplerate": int(d["default_samplerate"])}
        for i, d in enumerate(devices)
        if d["max_input_channels"] > 0
    ]


def test_recording(device_index: int, samplerate: int, seconds: int = 4) -> float:
    """Qisqa sinov yozuvi qiladi va o'rtacha ovoz balandligini (0-100) qaytaradi."""
    print(f"\n🎙️  {seconds} soniya davomida GAPIRING (yoki gaplashib turing)...")
    for i in range(3, 0, -1):
        print(f"   {i}...")
        time.sleep(1)

    recording = sd.rec(
        int(seconds * samplerate), samplerate=samplerate, channels=1,
        dtype="float32", device=device_index,
    )
    sd.wait()
    print("✅ Sinov yozuvi tugadi.")

    volume = float(np.abs(recording).mean() * 100)
    return volume, recording


def save_test_wav(recording: np.ndarray, samplerate: int) -> str:
    path = Path(tempfile.gettempdir()) / "darcha_bot_test.wav"
    clipped = np.clip(recording[:, 0], -1.0, 1.0)
    int_data = (clipped * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(samplerate)
        wf.writeframes(int_data.tobytes())
    return str(path)


def main():
    print("=" * 60)
    print("DARCHA BOT — Mikrofonni shaxsiy sozlash (setup wizard)")
    print("=" * 60)

    devices = list_input_devices()
    if not devices:
        print("❌ Hech qanday mikrofon (audio kirish qurilmasi) topilmadi.")
        print("   Mikrofon ulanganini va tizim tomonidan aniqlanganini tekshiring.")
        sys.exit(1)

    print("\nTopilgan mikrofonlar:\n")
    for d in devices:
        print(f"  [{d['index']}] {d['name']}  (standart chastota: {d['default_samplerate']} Hz)")

    while True:
        try:
            choice = int(input("\nQaysi mikrofonni ishlatmoqchisiz? Raqamini kiriting: "))
            selected = next((d for d in devices if d["index"] == choice), None)
            if selected:
                break
            print("Noto'g'ri raqam, qaytadan urinib ko'ring.")
        except ValueError:
            print("Iltimos, raqam kiriting.")

    print(f"\nTanlandi: [{selected['index']}] {selected['name']}")

    # Sinov yozuvi — 16000 Hz'ni sinaymiz, bo'lmasa qurilmaning o'zinikini
    test_rate = 16000
    try:
        sd.check_input_settings(device=selected["index"], samplerate=test_rate, channels=1)
    except Exception:
        test_rate = selected["default_samplerate"]
        print(f"⚠️  Bu qurilma 16000 Hz'ni qo'llab-quvvatlamaydi — {test_rate} Hz bilan sinaymiz "
              f"(recorder.py buni avtomatik hal qiladi, xavotir olmang).")

    volume, recording = test_recording(selected["index"], test_rate)

    print(f"\n📊 O'rtacha ovoz balandligi: {volume:.1f} / 100")
    if volume < 1:
        print("⚠️  OGOHLANTIRISH: ovoz juda past yoki umuman yo'q. Tekshiring:")
        print("   - Mikrofon jismonan to'g'ri ulanganmi?")
        print("   - Windows sozlamalarida shu mikrofon 'standart qurilma' qilib belgilanganmi?")
        print("   - Mikrofon jismoniy 'mute' tugmasi bosilmaganmi?")
    elif volume > 40:
        print("⚠️  Ovoz juda baland/clipping bo'lishi mumkin — mikrofonni gapiruvchidan")
        print("   biroz uzoqroqqa qo'ying yoki tizim sozlamalarida sezgirlikni pasaytiring.")
    else:
        print("✅ Ovoz darajasi normal ko'rinadi.")

    test_wav_path = save_test_wav(recording, test_rate)
    print(f"\n🔊 Sinov yozuvi saqlandi: {test_wav_path}")
    print("   (xohlasangiz shu faylni ochib, ovoz sifatini o'zingiz tekshirib ko'rishingiz mumkin)")

    mic_id = input("\nUshbu mikrofonga nom bering (masalan mic-1, mic-ali): ").strip() or "mic-1"

    print("\n" + "=" * 60)
    print("✅ SOZLASH TUGADI. Endi quyidagi buyruq bilan ishga tushiring:\n")
    print(f"   python recorder.py --microphone-id {mic_id} --device-index {selected['index']}\n")
    print("Bu buyruqni Windows Task Scheduler'ga ham xuddi shu ko'rinishda kiritishingiz mumkin")
    print("(TZ 19-bo'lim, avtomatik ishga tushirish).")
    print("=" * 60)


if __name__ == "__main__":
    main()
