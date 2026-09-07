"""Gemini tutor: rasm + matn. JWT/initData + rate limit."""
from dotenv import load_dotenv

load_dotenv()

import os
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from google import genai
from google.genai import types

from security.telegram_auth import require_tutor_auth
from tzutil import TASHKENT

router = APIRouter(prefix="/api/v1/tutor", tags=["tutor"])

PROMPT_FILE = Path(__file__).resolve().parent.parent / "prompts" / "repetitor_pro.txt"

DEFAULT_PROMPT = (
    "Sen Qalqon Pro repetitorisan. Tinch, ustozdek gapir. "
    "Faqat berilgan sinf/fan va (bo'lsa) rasm bo'yicha yordam ber. "
    "Darslik sahifasini o'ylab topma. Javob o'zbek tilida."
)


def _system_prompt() -> str:
    if PROMPT_FILE.is_file():
        return PROMPT_FILE.read_text(encoding="utf-8")
    return DEFAULT_PROMPT


def _client_and_model():
    api_key = (os.getenv("GEMINI_API_KEY") or "").strip()
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY topilmadi")
    model = (os.getenv("GEMINI_MODEL") or "gemini-2.5-flash").strip()
    return genai.Client(api_key=api_key), model


def _generate(client, model: str, contents, system: str) -> str:
    import time

    max_retries = 3
    last_exc = None
    for attempt in range(1, max_retries + 1):
        try:
            resp = client.models.generate_content(
                model=model,
                contents=contents,
                config=types.GenerateContentConfig(system_instruction=system),
            )
            answer = (resp.text or "").strip()
            if not answer:
                raise HTTPException(status_code=502, detail="Gemini bo'sh javob qaytardi")
            return answer
        except HTTPException:
            raise
        except Exception as inner_exc:
            last_exc = inner_exc
            msg_inner = str(inner_exc)
            print(f"TUTOR urinish {attempt}/{max_retries} xato: {msg_inner}", flush=True)
            retryable = (
                "503" in msg_inner
                or "UNAVAILABLE" in msg_inner
                or "high demand" in msg_inner.lower()
            )
            if retryable and attempt < max_retries:
                time.sleep(4)
                continue
            break
    msg = str(last_exc or "")
    print(f"TUTOR XATO: {msg}", flush=True)
    if "API_KEY_INVALID" in msg or "API key not valid" in msg:
        raise HTTPException(
            status_code=401,
            detail="Gemini kalit yaroqsiz. AI Studio dan yangi kalit qo'y.",
        )
    raise HTTPException(status_code=502, detail=f"Gemini javob bermadi: {msg[:200]}")


@router.post("/vision")
async def tutor_vision(
    child_id: str = Form(...),
    grade: str = Form(...),
    subject: str = Form(...),
    image: UploadFile = File(...),
    child_name: str = Form(None),
    query: str = Form(None),
    _auth: dict = Depends(require_tutor_auth),
):
    client, model = _client_and_model()
    data = await image.read()
    if not data:
        raise HTTPException(status_code=400, detail="rasm bosh")
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="rasm juda katta (max 8MB)")

    mime = image.content_type or "image/jpeg"
    if not mime.startswith("image/"):
        raise HTTPException(status_code=400, detail="faqat rasm qabul qilinadi")

    name_part = f"O'quvchi ismi: {child_name}. " if child_name else ""
    extra = f" O'quvchi savoli: {query}." if query else ""
    user_text = (
        f"O'quvchi id: {child_id}. {name_part}Sinf: {grade}. Fan: {subject}.{extra} "
        "Rasmni tahlil qil. Nima berilganini ayt, xato bo'lsa ko'rsat, "
        "keyin qisqa yechim yo'lini tushuntir."
        + (
            " Javobda kamida bir marta ism bilan murojaat qil."
            if child_name
            else ""
        )
    )

    answer = _generate(
        client,
        model,
        [types.Part.from_bytes(data=data, mime_type=mime), user_text],
        _system_prompt(),
    )
    return {
        "ok": True,
        "child_id": child_id,
        "grade": grade,
        "subject": subject,
        "model": model,
        "at": datetime.now(TASHKENT).isoformat(),
        "answer": answer,
    }


@router.post("/chat")
async def tutor_chat(
    child_id: str = Form(...),
    grade: str = Form(...),
    subject: str = Form(...),
    message: str = Form(...),
    child_name: str = Form(None),
    _auth: dict = Depends(require_tutor_auth),
):
    text = (message or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="xabar bosh")
    if len(text) > 4000:
        raise HTTPException(status_code=400, detail="xabar juda uzun")

    client, model = _client_and_model()
    name_part = f"O'quvchi ismi: {child_name}. " if child_name else ""
    user_text = (
        f"O'quvchi id: {child_id}. {name_part}Sinf: {grade}. Fan: {subject}. "
        f"Savol: {text}\n"
        "Darslik sahifasini o'ylab topma. Aniq bilmasang, shuni ayt va umumiy "
        "qoida bilan qisqa yordam ber. Voyaga yetmaganga zararli maslahat berma."
    )
    answer = _generate(client, model, [user_text], _system_prompt())
    return {
        "ok": True,
        "child_id": child_id,
        "grade": grade,
        "subject": subject,
        "model": model,
        "at": datetime.now(TASHKENT).isoformat(),
        "answer": answer,
    }
