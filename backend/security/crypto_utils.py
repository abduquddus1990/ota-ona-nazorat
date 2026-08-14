import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

class CryptoUtils:
    """
    AES-256-GCM shifrlash va deshifrlash yordamchi vositasi.
    """
    @staticmethod
    def decrypt_payload(encrypted_b64: str, iv_b64: str, key_bytes: bytes) -> str:
        try:
            ciphertext = base64.b64decode(encrypted_b64)
            iv = base64.b64decode(iv_b64)
            aesgcm = AESGCM(key_bytes)
            decrypted_data = aesgcm.decrypt(iv, ciphertext, None)
            return decrypted_data.decode("utf-8")
        except Exception as e:
            return f"[DECRYPTION_ERROR: {str(e)}]"

    @staticmethod
    def encrypt_payload(plain_text: str, key_bytes: bytes) -> tuple:
        import os
        iv = os.urandom(12)
        aesgcm = AESGCM(key_bytes)
        ciphertext = aesgcm.encrypt(iv, plain_text.encode("utf-8"), None)
        return (
            base64.b64encode(ciphertext).decode("utf-8"),
            base64.b64encode(iv).decode("utf-8")
        )
