import jwt
from fastapi import Header, HTTPException, status
from config import settings

def get_current_user(authorization: str = Header(...)) -> dict:
    """
    Supabase JWT tokenini dekodlash va autentifikatsiya qilish.
    Zero-Trust tekshiruvi: faqat yaroqli va muddati o'tmagan tokenlar qabul qilinadi.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header taqdim etilmadi."
        )

    try:
        parts = authorization.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token formati noto'g'ri (Bearer <token> kutiladi)."
            )

        token = parts[1]

        # JWT Secret yoki Asymmetric Key orqali tekshirish
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False}
        )

        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tokenning amal qilish muddati tugagan."
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token haqiqiy emas: {str(e)}"
        )
