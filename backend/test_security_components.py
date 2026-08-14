import sys
import os

# Papkani path'ga qo'shish
sys.path.insert(0, os.path.dirname(__file__))

from security.pii_sanitizer import pii_sanitizer

def test_pii_sanitization():
    print("=== 1. PII SANITIZATION TESTLARI ===")
    
    sample_text = (
        "Mening telefon raqamim +998901234567, kartam esa 8600 1234 5678 9012. "
        "Emailim ali@gmail.com va pasportim AA1234567. PINFL: 12345678901234. IP: 192.168.1.50"
    )
    
    clean_text, stats = pii_sanitizer.sanitize(sample_text)
    print(f"Boshlang'ich matn:\n{sample_text}\n")
    print(f"Tozalangan matn:\n{clean_text}\n")
    print(f"Niqoblash statistikasi: {stats}\n")
    
    assert "[CONFIDENTIAL_PHONE]" in clean_text
    assert "[CONFIDENTIAL_CARD]" in clean_text
    assert "[CONFIDENTIAL_EMAIL]" in clean_text
    assert "[CONFIDENTIAL_ID]" in clean_text
    assert "[CONFIDENTIAL_IP]" in clean_text
    assert "+998901234567" not in clean_text
    assert "8600" not in clean_text
    print(">>> PII Sanitizer testlari 100% muvaffaqiyatli o'tdi! [OK]")

if __name__ == "__main__":
    test_pii_sanitization()
