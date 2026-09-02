"""Lokal Gemini Vision: uy vazifasi rasmini tahlil qiladi. JWT yoq."""
from dotenv import load_dotenv

load_dotenv()

import os
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from google import genai
from google.genai import types

from tzutil import TASHKENT
from datetime import datetime

router = APIRouter(prefix="/api/v1/tutor", tags=["tutor"])

PROMPT_FILE = Path(__file__).resolve().parent.parent / "prompts" / "repetitor_pro.txt"

DEFAULT_PROMPT = (
    "Sen Qalqon Pro repetitorisan. Tinch, ustozdek gapir. "
    "Faqat rasm va berilgan sinf/fan bo'yicha yordam ber. "
    "Darslik PDF o'qima. Javob o'zbek tilida."
)


def _system_prompt() -> str:
    if PROMPT_FILE.is_file():
        return PROMPT_FILE.read_text(encoding="utf-8")
    return DEFAULT_PROMPT


@router.post("/vision")
async def tutor_vision(
    child_id: str = Form(...),
    grade: str = Form(...),
    subject: str = Form(...),
    image: UploadFile = File(...),
):
    api_key = (os.getenv("GEMINI_API_KEY") or "").strip()
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY topilmadi")

    model = (os.getenv("GEMINI_MODEL") or "gemini-2.5-flash").strip()
    data = await image.read()
    if not data:
        raise HTTPException(status_code=400, detail="rasm bosh")

    mime = image.content_type or "image/jpeg"
    if not mime.startswith("image/"):
        raise HTTPException(status_code=400, detail="faqat rasm qabul qilinadi")

    user_text = (
        f"O'quvchi id: {child_id}. Sinf: {grade}. Fan: {subject}. "
        "Rasmni tahlil qil. Nima berilganini ayt, xato bo'lsa ko'rsat, "
        "keyin qisqa yechim yo'lini tushuntir."
    )

    try:
        client = genai.Client(api_key=api_key)
        resp = client.models.generate_content(
            model=model,
            contents=[
                types.Part.from_bytes(data=data, mime_type=mime),
                user_text,
            ],
            config=types.GenerateContentConfig(
                system_instruction=_system_prompt(),
            ),
        )
        answer = (resp.text or "").strip()
    except Exception as exc:
        msg = str(exc)
        print(f"VISION_TUTOR XATO: {type(exc).__name__}: {msg}", flush=True)
        import traceback
        traceback.print_exc()
        if "API_KEY_INVALID" in msg or "API key not valid" in msg or "INVALID_ARGUMENT" in msg and "key" in msg.lower():
            raise HTTPException(
                status_code=401,
                detail="Gemini kalit yaroqsiz. AI Studio dan yangi kalit qo'y.",
            ) from exc
        raise HTTPException(status_code=502, detail=f"Gemini javob bermadi: {msg[:200]}") from exc

    if not answer:
        raise HTTPException(status_code=502, detail="Gemini bo'sh javob qaytardi")

    return {
        "ok": True,
        "child_id": child_id,
        "grade": grade,
        "subject": subject,
        "model": model,
        "at": datetime.now(TASHKENT).isoformat(),
        "answer": answer,
    }
