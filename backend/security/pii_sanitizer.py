import re
from typing import Tuple, Dict

class ZeroTrustPIISanitizer:
    """
    Shaxsiy identifikatsiya qilinadigan ma'lumotlarni (PII) 
    matndan tozalovchi kiberxavfsizlik drayveri.
    AI'ga uzatilishdan oldin barcha nozik ma'lumotlar niqoblanadi.
    """
    def __init__(self):
        # 1. Telefon raqamlari (+998 va xalqaro)
        self.phone_pattern = re.compile(
            r'(\+?998[-.\s]?\d{2}[-.\s]?\d{3}[-.\s]?\d{2}[-.\s]?\d{2}|\b\d{9,13}\b)'
        )
        # 2. Email manzillar
        self.email_pattern = re.compile(
            r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
        )
        # 3. Bank karta raqamlari (Uzcard 8600, Humo 9860, Visa 4, Mastercard 5)
        self.card_pattern = re.compile(
            r'\b(?:\d[ -]*?){13,16}\b'
        )
        # 4. Pasport seriya va PINFL (JShShIR - 14 ta raqam)
        self.pinfl_passport_pattern = re.compile(
            r'\b([A-Z]{2}\s?\d{7}|\b\d{14}\b)\b'
        )
        # 5. IP manzillar (IPv4)
        self.ip_pattern = re.compile(
            r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b'
        )

    def sanitize(self, text: str) -> Tuple[str, Dict[str, int]]:
        """
        Matndagi barcha PII elementlarni maxfiy tokenlar bilan almashtiradi.
        """
        if not text or not isinstance(text, str):
            return "", {}

        stats = {
            "cards_masked": 0,
            "phones_masked": 0,
            "emails_masked": 0,
            "ids_masked": 0,
            "ips_masked": 0
        }

        # 1. Karta raqamlarini tozalash
        text, stats["cards_masked"] = self.card_pattern.subn("[CONFIDENTIAL_CARD]", text)

        # 2. Pasport va PINFL tozalash
        text, stats["ids_masked"] = self.pinfl_passport_pattern.subn("[CONFIDENTIAL_ID]", text)

        # 3. Telefon raqamlarini tozalash
        text, stats["phones_masked"] = self.phone_pattern.subn("[CONFIDENTIAL_PHONE]", text)

        # 4. Emaillarni tozalash
        text, stats["emails_masked"] = self.email_pattern.subn("[CONFIDENTIAL_EMAIL]", text)

        # 5. IP manzillarni tozalash
        text, stats["ips_masked"] = self.ip_pattern.subn("[CONFIDENTIAL_IP]", text)

        return text, stats

pii_sanitizer = ZeroTrustPIISanitizer()
