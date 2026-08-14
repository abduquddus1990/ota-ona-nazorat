"""
bot.py
------
Aiogram 3 asosidagi Telegram bot (TZ v1.4 asosida). Vazifasi:
  1. Lokal papkani (recorder.py yozgan) kuzatib, yangi audio fayllarni
     tahlil qilib, Supabase'ga saqlaydi.
  2. Rahbar/o'rinbosar/HR/admin'ga rolga mos hisobot va menyu ko'rsatadi.
  3. Operatorlarga (agar telegram_id bog'langan bo'lsa) o'z suhbatlarini
     ko'r (blind) tarzda baholash imkonini beradi (TZ 3.9-band).
  4. Oylik bonusni ikki komponentli KPI (Sifat × Hajm) bo'yicha hisoblaydi
     (TZ 4.1-band, v2).
  5. Kamera oqimini ochish uchun Mini App (WebApp) tugmasi.

Talab qilinadigan kutubxonalar:
    pip install aiogram supabase python-dotenv

Muhit o'zgaruvchilari (.env fayl):
    BOT_TOKEN=...
    SUPABASE_URL=...
    SUPABASE_KEY=...
    GEMINI_API_KEY=...
    CAMERA_WEBAPP_URL=...
    BONUS_MAX_PERCENT=0.10       # TZ 4.1: sozlanuvchi, hardcode qilinmaydi
    MONTHLY_CONVERSATION_NORM=20  # TZ 4.1: hajm koeffitsienti uchun norma (vaqtinchalik yagona qiymat)
"""

import os
import io
import json
import base64
import wave
import asyncio
import logging
from datetime import datetime, date, timedelta, time as dtime
from pathlib import Path

import httpx
from aiogram import Bot, Dispatcher, F, Router
from aiogram.client.default import DefaultBotProperties
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import (
    Message, CallbackQuery, BotCommand, BufferedInputFile,
    InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo,
)
from aiogram.enums import ParseMode
from dotenv import load_dotenv
from supabase import create_client, Client

from transcribe import transcribe_audio
from analyzer import (
    analyze_conversation, AnalysisResult, CRITERIA_CONFIG,
    is_customer_conversation, GEMINI_API_KEY,
)

load_dotenv()
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("bot.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger(__name__)

def _require_env(name: str) -> str:
    """
    Muhim muhit o'zgaruvchisini o'qiydi. Yo'q bo'lsa, botni tushunarli xato
    bilan darhol to'xtatadi — aks holda keyinroq (masalan birinchi
    Supabase so'rovida) tushunarsiz stack-trace bilan yiqilishi mumkin edi.
    """
    value = os.getenv(name)
    if not value:
        raise RuntimeError(
            f"Muhit o'zgaruvchisi '{name}' topilmadi yoki bo'sh. "
            f".env faylini tekshiring (.env.example asosida nusxa oling)."
        )
    return value


BOT_TOKEN = _require_env("BOT_TOKEN")
SUPABASE_URL = _require_env("SUPABASE_URL")
SUPABASE_KEY = _require_env("SUPABASE_KEY")
CAMERA_WEBAPP_URL = os.getenv("CAMERA_WEBAPP_URL", "https://example.com/camera")
# Telegram Mini App — "Bugungi hisobotlar" veb-ekrani (miniapp/ papkasi,
# statik hosting'ga joylashtirilgach shu yerga uning URL'ini kiriting).
DASHBOARD_WEBAPP_URL = os.getenv("DASHBOARD_WEBAPP_URL")
# TZ 19-bo'lim: uch kompyuterli tarmoq arxitekturasi — server va xodim
# kompyuterlari bir xil jismoniy papkaga turlicha manzil (lokal yo'l yoki
# tarmoq/SMB yo'li) bilan murojaat qiladi.
RECORDINGS_DIR = Path(os.getenv("RECORDINGS_DIR", "./recordings"))
WATCH_INTERVAL_SEC = 15

# TZ 4.1: bu ikkalasi hardcode emas — muhit o'zgaruvchisidan o'qiladi,
# shuning uchun kelajakda mijozga qarab (yoki takliflar soniga qarab)
# kodni o'zgartirmasdan sozlash mumkin.
BONUS_MAX_PERCENT = float(os.getenv("BONUS_MAX_PERCENT", "0.10"))
MONTHLY_CONVERSATION_NORM = int(os.getenv("MONTHLY_CONVERSATION_NORM", "20"))

bot = Bot(token=BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher(storage=MemoryStorage())
router = Router()
dp.include_router(router)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Operatorlar bilan bog'liq vaqtinchalik holat: qaysi suhbat operatorga
# yuborilgan-u, hali o'z bahosini bermagan (blind self-review navbati)
_pending_self_review: dict[int, str] = {}   # {telegram_id: conversation_id}


# =========================================================================
# ROL TIZIMI (TZ 2-bo'lim)
# =========================================================================

ROLE_MANAGER = "manager"
ROLE_DEPUTY = "deputy"
ROLE_HR = "hr"
ROLE_ADMIN = "admin"

ROLE_PERMISSIONS = {
    ROLE_MANAGER: {"reports", "employees", "bonuses", "camera", "settings", "attendance"},
    ROLE_DEPUTY: {"reports", "employees", "camera", "attendance"},
    ROLE_HR: {"employees", "attendance"},
    ROLE_ADMIN: {"reports", "employees", "bonuses", "camera", "settings", "attendance"},
}

# XAVFSIZLIK TUZATISHI (TZ 11-bo'lim, C-band): HR "employees" huquqiga ega
# bo'lsa-da, oklad kabi moliyaviy maydonga kira olmasligi kerak edi — bu
# TZ'dagi niyatga zid edi. Endi alohida bayroq bilan ajratilgan:
ROLES_WITH_SALARY_ACCESS = {ROLE_MANAGER, ROLE_ADMIN}


# =========================================================================
# TIL (i18n) — bot menyusi o'zbek va rus tillarida (TZ 24-bo'lim)
# =========================================================================
# Har bir bot_users yozuvi o'z tilini tanlaydi (bazada `language` ustuni,
# standart "uz"). To'liq tarjima emas — asosiy menyu, hisobot sarlavhalari
# va eng ko'p ishlatiladigan xabarlar qamrab olingan; qolgan matnlar
# (FSM shakllari, kamdan-kam xatolik xabarlari) hozircha faqat o'zbekcha
# qoladi — kelajakda kengaytiriladi.

TRANSLATIONS = {
    "uz": {
        "menu_reports": "📊 Bugungi hisobotlar",
        "menu_attendance": "🕒 Davomat",
        "menu_employees": "👥 Xodimlar",
        "menu_bonuses": "💰 Bonuslar",
        "menu_camera": "📹 Kamera",
        "menu_settings": "⚙️ Sozlamalar",
        "greeting": "Salom! Siz <b>{role}</b> sifatida tizimga kirdingiz.\nQuyidagi menyudan kerakli bo'limni tanlang:",
        "no_access": "Kechirasiz, sizda ushbu botdan foydalanish huquqi yo'q. Agar bu xato bo'lsa, tizim administratoriga murojaat qiling.",
        "operator_greeting": "Salom, {name}! Siz operator sifatida o'z suhbatlaringizni ko'rib, baho berishingiz mumkin. Yangi suhbat tahlil qilinganda sizga xabar boradi.",
        "role_manager": "Rahbar", "role_deputy": "O'rinbosar", "role_hr": "HR xodimi", "role_admin": "Admin",
        "report_score": "Umumiy ball", "report_criteria": "Mezonlar bo'yicha",
        "report_errors": "Aniqlangan xatolar", "report_strengths": "Kuchli tomonlar",
        "report_summary": "Xulosa", "report_employee": "Xodim", "report_date": "Sana",
        "no_permission": "Sizda bu bo'limga kirish huquqi yo'q",
        "language_changed": "✅ Til o'zbek tiliga o'zgartirildi.",
    },
    "ru": {
        "menu_reports": "📊 Отчёты за сегодня",
        "menu_attendance": "🕒 Посещаемость",
        "menu_employees": "👥 Сотрудники",
        "menu_bonuses": "💰 Бонусы",
        "menu_camera": "📹 Камера",
        "menu_settings": "⚙️ Настройки",
        "greeting": "Здравствуйте! Вы вошли в систему как <b>{role}</b>.\nВыберите нужный раздел из меню ниже:",
        "no_access": "Извините, у вас нет доступа к этому боту. Если это ошибка, обратитесь к администратору системы.",
        "operator_greeting": "Здравствуйте, {name}! Как оператор, вы можете просматривать свои разговоры и оценивать их. Вы получите уведомление, когда будет проанализирован новый разговор.",
        "role_manager": "Руководитель", "role_deputy": "Заместитель", "role_hr": "HR-специалист", "role_admin": "Админ",
        "report_score": "Общий балл", "report_criteria": "По критериям",
        "report_errors": "Выявленные ошибки", "report_strengths": "Сильные стороны",
        "report_summary": "Итог", "report_employee": "Сотрудник", "report_date": "Дата",
        "no_permission": "У вас нет доступа к этому разделу",
        "language_changed": "✅ Язык изменён на русский.",
    },
}


def t(key: str, lang: str = "uz", **kwargs) -> str:
    """Tarjima yordamchisi. Til yoki kalit topilmasa, o'zbekcha (standart) qaytadi."""
    text = TRANSLATIONS.get(lang, TRANSLATIONS["uz"]).get(key) or TRANSLATIONS["uz"].get(key, key)
    return text.format(**kwargs) if kwargs else text


def get_user_language(telegram_id: int) -> str:
    """Bazadan foydalanuvchining tanlagan tilini oladi (standart: 'uz')."""
    result = supabase.table("bot_users").select("language").eq("telegram_id", telegram_id).execute()
    if result.data and result.data[0].get("language"):
        return result.data[0]["language"]
    return "uz"


PENDING_ACCESS_FILE = Path("./pending_access.json")


def _load_pending_access() -> dict:
    """
    pending_access.json'ni o'qiydi. Bu fayl admin tomonidan to'g'ridan-to'g'ri
    VS Code'da tahrirlanadi: yangi rahbar/xodimga botdan foydalanish huquqini
    berish uchun uning Telegram @username'ini shu faylga yozib qo'yish
    kifoya — bot qayta ishga tushirilishi shart emas, har /start bosilganda
    fayl qaytadan o'qiladi.
    """
    if not PENDING_ACCESS_FILE.exists():
        return {"managers": {}, "employees": {}}
    try:
        with open(PENDING_ACCESS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (json.JSONDecodeError, OSError):
        logger.exception("pending_access.json o'qishda xatolik")
        return {"managers": {}, "employees": {}}

    # Izohda "katta-kichik harf farqi muhim emas" deb yozilgan — shuni
    # ta'minlash uchun fayldan o'qilgan kalitlar (admin qanday yozgan
    # bo'lsa ham) shu yerda kichik harfga normallashtiriladi, aks holda
    # Telegram'dan kelgan (har doim kichik harfli) username bilan
    # solishtirilganda hech qachon mos kelmaydi.
    data["managers"] = {k.lower(): v for k, v in data.get("managers", {}).items()}
    data["employees"] = {k.lower(): v for k, v in data.get("employees", {}).items()}
    return data


def _save_pending_access(data: dict) -> None:
    with open(PENDING_ACCESS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _try_claim_pending_access(telegram_id: int, username: str | None) -> bool:
    """
    Agar pending_access.json'da shu @username uchun yozuv bo'lsa, unga
    kirish huquqini beradi (bot_users yoki employees jadvalida telegram_id
    biriktiradi) va yozuvni faylidan o'chiradi — bir martalik ishlaydi,
    ikkinchi marta shu username bilan /start bossa endi hech narsa
    topilmaydi.
    """
    if not username:
        return False
    username_key = username.lower()
    data = _load_pending_access()

    role = data["managers"].pop(username_key, None)
    if role in ROLE_PERMISSIONS:
        supabase.table("bot_users").upsert({
            "telegram_id": telegram_id,
            "full_name": f"@{username}",
            "role": role,
            "is_active": True,
        }, on_conflict="telegram_id").execute()
        _save_pending_access(data)
        return True
    elif role is not None:
        logger.warning(f"pending_access.json: noto'g'ri rol '{role}' ({username})")
        return False

    full_name = data["employees"].pop(username_key, None)
    if full_name:
        result = supabase.table("employees").update(
            {"telegram_id": telegram_id}
        ).eq("full_name", full_name).eq("is_active", True).execute()
        if result.data:
            _save_pending_access(data)
            return True
        logger.warning(
            f"pending_access.json: '{full_name}' nomli faol xodim topilmadi ({username})"
        )
        return False

    return False


def get_bot_user_role(telegram_id: int) -> str | None:
    """Boshqaruvchi (rahbar/o'rinbosar/HR/admin) rolini bazadan oladi."""
    result = supabase.table("bot_users").select("role, is_active").eq(
        "telegram_id", telegram_id
    ).execute()
    if not result.data or not result.data[0]["is_active"]:
        return None
    return result.data[0]["role"]


def get_operator_employee(telegram_id: int) -> dict | None:
    """Agar bu telegram_id operator (xodim) sifatida bog'langan bo'lsa, uni qaytaradi."""
    result = supabase.table("employees").select("id, full_name").eq(
        "telegram_id", telegram_id
    ).eq("is_active", True).execute()
    return result.data[0] if result.data else None


def has_permission(role: str, permission: str) -> bool:
    return permission in ROLE_PERMISSIONS.get(role, set())


# =========================================================================
# ASOSIY MENYU
# =========================================================================

def build_main_menu(role: str, lang: str = "uz") -> InlineKeyboardMarkup:
    buttons = []
    if has_permission(role, "reports"):
        buttons.append([InlineKeyboardButton(text=t("menu_reports", lang), callback_data="menu_reports")])
        # Mini App hali hostingga joylashtirilmagan bo'lsa tugma yashiriladi
        # (buzilgan havola ko'rsatishdan ko'ra shunday yaxshiroq).
        if DASHBOARD_WEBAPP_URL:
            buttons.append([InlineKeyboardButton(
                text="🌐 Dashboard",
                web_app=WebAppInfo(url=DASHBOARD_WEBAPP_URL),
            )])
    if has_permission(role, "attendance"):
        buttons.append([InlineKeyboardButton(text=t("menu_attendance", lang), callback_data="menu_attendance")])
    if has_permission(role, "employees"):
        buttons.append([InlineKeyboardButton(text=t("menu_employees", lang), callback_data="menu_employees")])
    if has_permission(role, "bonuses"):
        buttons.append([InlineKeyboardButton(text=t("menu_bonuses", lang), callback_data="menu_bonuses")])
    if has_permission(role, "camera"):
        buttons.append([InlineKeyboardButton(
            text=t("menu_camera", lang),
            web_app=WebAppInfo(url=CAMERA_WEBAPP_URL),
        )])
    if has_permission(role, "settings"):
        buttons.append([InlineKeyboardButton(text=t("menu_settings", lang), callback_data="menu_settings")])
    buttons.append([
        InlineKeyboardButton(text="🇺🇿 O'zbekcha", callback_data="lang_uz"),
        InlineKeyboardButton(text="🇷🇺 Русский", callback_data="lang_ru"),
    ])
    return InlineKeyboardMarkup(inline_keyboard=buttons)


@router.callback_query(F.data.startswith("lang_"))
async def switch_language(callback: CallbackQuery):
    """Bot menyusi va hisobotlar tilini o'zbek/rus tiliga almashtiradi (TZ 24-bo'lim)."""
    new_lang = callback.data.split("_", 1)[1]  # "uz" yoki "ru"
    await asyncio.to_thread(
        lambda: supabase.table("bot_users").update({"language": new_lang}).eq(
            "telegram_id", callback.from_user.id
        ).execute()
    )
    role = await asyncio.to_thread(get_bot_user_role, callback.from_user.id)
    role_key = f"role_{role}" if role else "role_manager"
    await callback.message.edit_text(
        t("greeting", new_lang, role=t(role_key, new_lang)),
        reply_markup=build_main_menu(role, new_lang),
    )


@router.callback_query(F.data == "menu_attendance")
async def menu_attendance(callback: CallbackQuery):
    """
    TZ 22-bo'lim: bugungi davomat — har bir xodim uchun mikrofon qachon
    yonganini, faol (online) holatini va necha daqiqa yozuv qilinganini
    ko'rsatadi. Ma'lumot `today_attendance` VIEW'idan olinadi (schema.sql).
    """
    role = await asyncio.to_thread(get_bot_user_role, callback.from_user.id)
    lang = await asyncio.to_thread(get_user_language, callback.from_user.id)
    if not has_permission(role, "attendance"):
        await callback.answer(t("no_permission", lang), show_alert=True)
        return

    result = await asyncio.to_thread(
        lambda: supabase.table("today_attendance").select("*").execute()
    )

    if not result.data:
        await callback.message.answer(
            "Bugun uchun davomat ma'lumoti hali yo'q." if lang == "uz"
            else "Данные о посещаемости за сегодня пока отсутствуют."
        )
        return

    lines = [f"🕒 <b>Bugungi davomat ({date.today().strftime('%d.%m.%Y')}):</b>\n"]
    for row in result.data:
        online_emoji = "🟢" if row.get("is_online") else "🔴"
        mic_status = "faol" if row.get("is_online") else "o'chiq/offline"
        session_start = row.get("session_start")
        start_str = "—"
        if session_start:
            try:
                start_str = datetime.fromisoformat(session_start.replace("Z", "+00:00")).strftime("%H:%M")
            except (ValueError, AttributeError):
                start_str = session_start

        lines.append(
            f"{online_emoji} <b>{row['full_name']}</b> ({row.get('microphone_id', '-')})\n"
            f"   Mikrofon yondi: {start_str} | Holat: {mic_status}\n"
            f"   Faol vaqt: {row.get('active_minutes', 0)} daqiqa | "
            f"Yozilgan: {row.get('recorded_minutes', 0)} daqiqa\n"
        )

    await callback.message.answer("\n".join(lines))


@router.message(Command("start"))
async def cmd_start(message: Message):
    logger.info(
        f"/start: telegram_id={message.from_user.id} "
        f"username={message.from_user.username!r} "
        f"full_name={message.from_user.full_name!r}"
    )
    role = await asyncio.to_thread(get_bot_user_role, message.from_user.id)
    operator = None if role is not None else await asyncio.to_thread(get_operator_employee, message.from_user.id)

    # Agar hali ro'yxatdan o'tmagan bo'lsa — pending_access.json'da shu
    # @username uchun bir martalik ruxsat borligini tekshiramiz (TZ'ga
    # yangi qo'shilgan onboarding usuli: admin VS Code'da faylga
    # foydalanuvchi username'ini yozib qo'yadi, keyin u shu bilan /start
    # bosgach avtomatik ravishda ruxsat oladi).
    if role is None and operator is None:
        try:
            claimed = await asyncio.to_thread(_try_claim_pending_access, message.from_user.id, message.from_user.username)
        except Exception:
            logger.exception("/start: pending_access'ni tekshirishda kutilmagan xatolik")
            claimed = False
        logger.info(f"/start: pending_access urinishi -> {claimed}")
        if claimed:
            role = await asyncio.to_thread(get_bot_user_role, message.from_user.id)
            operator = None if role is not None else await asyncio.to_thread(get_operator_employee, message.from_user.id)

    if role is not None:
        lang = await asyncio.to_thread(get_user_language, message.from_user.id)
        role_key = f"role_{role}"
        await message.answer(
            t("greeting", lang, role=t(role_key, lang)),
            reply_markup=build_main_menu(role, lang),
        )
        return

    if operator is not None:
        # Eslatma: operatorlar uchun til tanlovi hozircha yo'q — ular
        # bot_users'da emas, employees'da, va odatda o'zbek tilida
        # ishlaydi (TZ 24-bo'lim).
        await message.answer(t("operator_greeting", "uz", name=operator["full_name"]))
        return

    if message.from_user.username:
        await message.answer(t("no_access", "uz"))
    else:
        await message.answer(
            "Kechirasiz, sizda ushbu botdan foydalanish huquqi yo'q.\n\n"
            "Sizda Telegram username (@nomi) sozlanmagan — administrator "
            "sizga huquq berishi uchun avval Telegram sozlamalaridan "
            "(Settings → Username) o'ziga bir username tanlang, so'ng "
            "administratorga xabar bering."
        )


# =========================================================================
# XODIMLARNI BOSHQARISH — FSM (TZ 3.7, oklad kirishi endi rolga bog'liq)
# =========================================================================

class AddEmployeeForm(StatesGroup):
    full_name = State()
    position = State()
    department = State()
    workstation_number = State()
    microphone_id = State()
    salary = State()               # faqat ROLES_WITH_SALARY_ACCESS uchun
    employee_number = State()
    hired_at = State()
    photo = State()


@router.callback_query(F.data == "menu_employees")
async def menu_employees(callback: CallbackQuery):
    role = await asyncio.to_thread(get_bot_user_role, callback.from_user.id)
    if not has_permission(role, "employees"):
        await callback.answer("Sizda bu bo'limga kirish huquqi yo'q", show_alert=True)
        return

    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="➕ Yangi xodim qo'shish", callback_data="employee_add_start")],
        [InlineKeyboardButton(text="📋 Xodimlar ro'yxati", callback_data="employee_list")],
    ])
    await callback.message.edit_text("👥 Xodimlar bo'limi:", reply_markup=kb)


@router.callback_query(F.data == "employee_add_start")
async def employee_add_start(callback: CallbackQuery, state: FSMContext):
    # XAVFSIZLIK (TZ 7.1): callback_data'ni qo'lda yuborish orqali menyuni
    # aylanib o'tishning oldini olish uchun har bir callback'da huquq
    # qayta tekshiriladi, faqat menyu darajasida emas.
    role = await asyncio.to_thread(get_bot_user_role, callback.from_user.id)
    if not has_permission(role, "employees"):
        await callback.answer("Sizda bu bo'limga kirish huquqi yo'q", show_alert=True)
        return
    await state.set_state(AddEmployeeForm.full_name)
    await callback.message.answer("Xodimning to'liq F.I.Sh ni kiriting:")


@router.message(AddEmployeeForm.full_name)
async def form_full_name(message: Message, state: FSMContext):
    await state.update_data(full_name=message.text)
    await state.set_state(AddEmployeeForm.position)
    await message.answer("Lavozimini kiriting:")


@router.message(AddEmployeeForm.position)
async def form_position(message: Message, state: FSMContext):
    await state.update_data(position=message.text)
    await state.set_state(AddEmployeeForm.department)
    await message.answer("Bo'limini kiriting:")


@router.message(AddEmployeeForm.department)
async def form_department(message: Message, state: FSMContext):
    await state.update_data(department=message.text)
    await state.set_state(AddEmployeeForm.workstation_number)
    await message.answer("Darcha raqamini kiriting:")


@router.message(AddEmployeeForm.workstation_number)
async def form_workstation(message: Message, state: FSMContext):
    await state.update_data(workstation_number=message.text)
    await state.set_state(AddEmployeeForm.microphone_id)
    await message.answer("Mikrofon ID sini kiriting (masalan: mic-1):")


@router.message(AddEmployeeForm.microphone_id)
async def form_microphone(message: Message, state: FSMContext):
    await state.update_data(microphone_id=message.text)

    # XAVFSIZLIK TUZATISHI: faqat oklad ko'rish huquqi bor rol so'raladi,
    # aks holda (masalan HR) bu qadam butunlay o'tkazib yuboriladi.
    role = await asyncio.to_thread(get_bot_user_role, message.from_user.id)
    if role in ROLES_WITH_SALARY_ACCESS:
        await state.set_state(AddEmployeeForm.salary)
        await message.answer("Oylik okladini kiriting (faqat raqam, so'mda):")
    else:
        await state.update_data(salary=None)
        await state.set_state(AddEmployeeForm.employee_number)
        await message.answer(
            "Tabel raqami (ixtiyoriy — o'tkazib yuborish uchun \"-\" yozing):"
        )


@router.message(AddEmployeeForm.salary)
async def form_salary(message: Message, state: FSMContext):
    try:
        salary = float(message.text.replace(" ", "").replace(",", ""))
    except ValueError:
        await message.answer("Iltimos, faqat raqam kiriting (masalan: 4500000):")
        return
    await state.update_data(salary=salary)
    await state.set_state(AddEmployeeForm.employee_number)
    await message.answer("Tabel raqami (ixtiyoriy — o'tkazib yuborish uchun \"-\" yozing):")


@router.message(AddEmployeeForm.employee_number)
async def form_employee_number(message: Message, state: FSMContext):
    value = None if message.text.strip() == "-" else message.text.strip()
    await state.update_data(employee_number=value)
    await state.set_state(AddEmployeeForm.hired_at)
    await message.answer(
        "Ishga qabul qilingan sana (ixtiyoriy, YYYY-MM-DD — "
        "o'tkazib yuborish uchun \"-\" yozing):"
    )


@router.message(AddEmployeeForm.hired_at)
async def form_hired_at(message: Message, state: FSMContext):
    value = None if message.text.strip() == "-" else message.text.strip()
    await state.update_data(hired_at=value)
    await state.set_state(AddEmployeeForm.photo)
    await message.answer(
        "Xodim surati (ixtiyoriy — rasm yuboring, yoki \"-\" yozing):"
    )


@router.message(AddEmployeeForm.photo)
async def form_photo(message: Message, state: FSMContext):
    photo_url = None
    if message.photo:
        photo_url = message.photo[-1].file_id
    elif message.text and message.text.strip() != "-":
        photo_url = message.text.strip()

    data = await state.get_data()
    data["photo_url"] = photo_url
    await state.clear()

    await asyncio.to_thread(
        lambda: supabase.table("employees").insert({
            "full_name": data["full_name"],
            "position": data["position"],
            "department": data["department"],
            "workstation_number": data["workstation_number"],
            "microphone_id": data["microphone_id"],
            "salary": data.get("salary"),   # HR uchun None qoladi
            "employee_number": data.get("employee_number"),
            "hired_at": data.get("hired_at"),
            "photo_url": data.get("photo_url"),
        }).execute()
    )

    await message.answer(f"✅ Xodim <b>{data['full_name']}</b> muvaffaqiyatli qo'shildi.")


@router.callback_query(F.data == "employee_list")
async def employee_list(callback: CallbackQuery):
    role = await asyncio.to_thread(get_bot_user_role, callback.from_user.id)
    if not has_permission(role, "employees"):
        await callback.answer("Sizda bu bo'limga kirish huquqi yo'q", show_alert=True)
        return

    result = await asyncio.to_thread(
        lambda: supabase.table("employees").select(
            "id, full_name, position, workstation_number, microphone_id, is_active"
        ).eq("is_active", True).order("full_name").execute()
    )

    if not result.data:
        await callback.message.answer("Hozircha xodimlar ro'yxati bo'sh.")
        return

    await callback.message.answer(f"👥 <b>Faol xodimlar</b> ({len(result.data)} ta):")
    for emp in result.data:
        text = (
            f"• <b>{emp['full_name']}</b> — {emp['position'] or '-'}\n"
            f"  darcha {emp['workstation_number'] or '-'}, {emp['microphone_id'] or '-'}"
        )
        kb = InlineKeyboardMarkup(inline_keyboard=[[
            InlineKeyboardButton(text="✏️ Tahrirlash", callback_data=f"eeS:{emp['id']}"),
            InlineKeyboardButton(text="🚫 Faolsizlantirish", callback_data=f"eeD:{emp['id']}"),
        ]])
        await callback.message.answer(text, reply_markup=kb)


# =========================================================================
# XODIMNI TAHRIRLASH / FAOLSIZLANTIRISH — TZ 3.7 (CRUD to'liqligi uchun)
# =========================================================================
# ESLATMA: callback_data'da UUID va maydon nomi ":" bilan ajratiladi
# ("_" emas), chunki "workstation_number" kabi maydon nomlarining o'zida
# "_" bor va Telegram callback_data 64 baytdan oshmasligi kerak — qisqa,
# aniq ajratuvchi belgi tanlandi.

EDITABLE_FIELDS = {
    "full_name": "F.I.Sh",
    "position": "Lavozim",
    "department": "Bo'lim",
    "workstation_number": "Darcha raqami",
    "microphone_id": "Mikrofon ID",
    "employee_number": "Tabel raqami",
}


class EditEmployeeForm(StatesGroup):
    waiting_value = State()


@router.callback_query(F.data.startswith("eeS:"))
async def employee_edit_start(callback: CallbackQuery):
    role = await asyncio.to_thread(get_bot_user_role, callback.from_user.id)
    if not has_permission(role, "employees"):
        await callback.answer("Sizda bu bo'limga kirish huquqi yo'q", show_alert=True)
        return

    employee_id = callback.data.split(":", 1)[1]
    buttons = [
        [InlineKeyboardButton(text=label, callback_data=f"eeF:{employee_id}:{field}")]
        for field, label in EDITABLE_FIELDS.items()
    ]
    # Oklad — faqat moliyaviy ma'lumotga ruxsati bor rollarga ko'rsatiladi (TZ 2-bo'lim)
    if role in ROLES_WITH_SALARY_ACCESS:
        buttons.append([InlineKeyboardButton(text="Oylik oklad", callback_data=f"eeF:{employee_id}:salary")])

    await callback.message.answer("Qaysi maydonni tahrirlaysiz?", reply_markup=InlineKeyboardMarkup(inline_keyboard=buttons))


@router.callback_query(F.data.startswith("eeF:"))
async def employee_editfield_start(callback: CallbackQuery, state: FSMContext):
    _, employee_id, field = callback.data.split(":", 2)
    role = await asyncio.to_thread(get_bot_user_role, callback.from_user.id)
    if not has_permission(role, "employees"):
        await callback.answer("Sizda bu bo'limga kirish huquqi yo'q", show_alert=True)
        return
    if field == "salary" and role not in ROLES_WITH_SALARY_ACCESS:
        # Himoya ikkinchi qatlami: hatto kimdir tugmani boshqa yo'l bilan
        # (masalan eski xabar orqali) bossa ham, oklad HR'ga ochilmaydi.
        await callback.answer("Sizda bu maydonni tahrirlash huquqi yo'q", show_alert=True)
        return

    await state.update_data(edit_employee_id=employee_id, edit_field=field)
    await state.set_state(EditEmployeeForm.waiting_value)
    label = "Oylik oklad" if field == "salary" else EDITABLE_FIELDS.get(field, field)
    await callback.message.answer(f"{label} uchun yangi qiymatni kiriting:")


@router.message(EditEmployeeForm.waiting_value)
async def employee_editfield_save(message: Message, state: FSMContext):
    data = await state.get_data()
    employee_id = data.get("edit_employee_id")
    field = data.get("edit_field")
    if employee_id is None or field is None:
        await message.answer(
            "Kechirasiz, jarayon uzilib qoldi. Iltimos, tahrirlashni qaytadan boshlang."
        )
        await state.clear()
        return
    raw_value = message.text.strip()

    update_value: str | float = raw_value
    if field == "salary":
        try:
            update_value = float(raw_value.replace(" ", "").replace(",", ""))
        except ValueError:
            await message.answer("Iltimos, faqat raqam kiriting (masalan: 4500000):")
            return

    try:
        await asyncio.to_thread(
            lambda: supabase.table("employees").update({field: update_value}).eq("id", employee_id).execute()
        )
    except Exception:
        logger.exception(f"Xodim {employee_id} ning '{field}' maydonini yangilashda xatolik")
        await message.answer(
            "❌ Yangilashda xatolik yuz berdi (masalan, mikrofon ID band bo'lishi mumkin). "
            "Qaytadan urinib ko'ring."
        )
        await state.clear()
        return

    await state.clear()
    await message.answer("✅ Ma'lumot muvaffaqiyatli yangilandi.")


@router.callback_query(F.data.startswith("eeD:"))
async def employee_deactivate(callback: CallbackQuery):
    role = await asyncio.to_thread(get_bot_user_role, callback.from_user.id)
    if not has_permission(role, "employees"):
        await callback.answer("Sizda bu bo'limga kirish huquqi yo'q", show_alert=True)
        return

    employee_id = callback.data.split(":", 1)[1]
    await asyncio.to_thread(
        lambda: supabase.table("employees").update({"is_active": False}).eq("id", employee_id).execute()
    )
    await callback.message.answer("🚫 Xodim faolsizlantirildi.")


# =========================================================================
# BONUS HISOB-KITOBI — TZ 4.1 (v2): Sifat × Hajm
# =========================================================================

def calculate_monthly_bonuses(period_month: date) -> list[dict]:
    """
    bonus = oklad × BONUS_MAX_PERCENT × sifat_koef × hajm_koef

    sifat_koef = o'rtacha_ball / 100
    hajm_koef  = min(suhbatlar_soni / MONTHLY_CONVERSATION_NORM, 1.0)
    """
    month_start = period_month.replace(day=1).isoformat()

    employees = supabase.table("employees").select("id, full_name, salary").eq(
        "is_active", True
    ).execute().data

    results = []
    for emp in employees:
        convs = supabase.table("conversations").select("id").eq(
            "employee_id", emp["id"]
        ).gte("created_at", month_start).execute().data

        if not convs:
            continue

        conv_count = len(convs)
        conv_ids = [c["id"] for c in convs]
        analytics = supabase.table("analytics").select("total_score").in_(
            "conversation_id", conv_ids
        ).execute().data

        if not analytics:
            continue

        avg_score = sum(a["total_score"] for a in analytics) / len(analytics)
        salary = float(emp["salary"] or 0)

        quality_coef = avg_score / 100
        volume_coef = min(conv_count / MONTHLY_CONVERSATION_NORM, 1.0)
        bonus_amount = round(
            salary * BONUS_MAX_PERCENT * quality_coef * volume_coef, 2
        )

        supabase.table("bonuses").upsert({
            "employee_id": emp["id"],
            "period_month": month_start,
            "conversations_count": conv_count,
            "monthly_norm": MONTHLY_CONVERSATION_NORM,
            "quality_coef": round(quality_coef, 4),
            "volume_coef": round(volume_coef, 4),
            "bonus_max_percent": BONUS_MAX_PERCENT,
            "salary_at_calc": salary,
            "bonus_amount": bonus_amount,
        }, on_conflict="employee_id,period_month").execute()

        results.append({
            "full_name": emp["full_name"],
            "avg_score": round(avg_score, 1),
            "conv_count": conv_count,
            "volume_coef": round(volume_coef, 2),
            "bonus_amount": bonus_amount,
        })

    return results


@router.callback_query(F.data == "menu_bonuses")
async def menu_bonuses(callback: CallbackQuery):
    role = await asyncio.to_thread(get_bot_user_role, callback.from_user.id)
    if not has_permission(role, "bonuses"):
        await callback.answer("Sizda bu bo'limga kirish huquqi yo'q", show_alert=True)
        return

    today = date.today()
    results = await asyncio.to_thread(calculate_monthly_bonuses, today)

    if not results:
        await callback.message.answer("Bu oy uchun hali hisoblanadigan bonus ma'lumotlari yo'q.")
        return

    lines = [f"💰 <b>{today.strftime('%Y-%m')} oyi uchun bonuslar</b> "
             f"(norma: {MONTHLY_CONVERSATION_NORM} suhbat/oy):\n"]
    for r in results:
        lines.append(
            f"• {r['full_name']} — {r['conv_count']} suhbat "
            f"(hajm: {r['volume_coef']*100:.0f}%), o'rtacha ball: {r['avg_score']}, "
            f"bonus: <b>{r['bonus_amount']:,.0f} so'm</b>"
        )
    await callback.message.answer("\n".join(lines))


@router.callback_query(F.data == "menu_settings")
async def menu_settings(callback: CallbackQuery):
    role = await asyncio.to_thread(get_bot_user_role, callback.from_user.id)
    if not has_permission(role, "settings"):
        await callback.answer("Sizda bu bo'limga kirish huquqi yo'q", show_alert=True)
        return

    await callback.message.answer(
        "⚙️ <b>Joriy tizim sozlamalari:</b>\n"
        f"• Bonus maksimal foizi: {BONUS_MAX_PERCENT * 100:.0f}%\n"
        f"• Oylik suhbat normasi: {MONTHLY_CONVERSATION_NORM} ta\n\n"
        "Bu qiymatlarni o'zgartirish uchun <code>.env</code> faylidagi "
        "<code>BONUS_MAX_PERCENT</code> va <code>MONTHLY_CONVERSATION_NORM</code> "
        "o'zgaruvchilarini tahrirlab, botni qayta ishga tushiring."
    )


# =========================================================================
# HISOBOTLAR — TZ 3.8 ("📊 Bugungi hisobotlar")
# =========================================================================

@router.callback_query(F.data == "menu_reports")
async def menu_reports(callback: CallbackQuery):
    role = await asyncio.to_thread(get_bot_user_role, callback.from_user.id)
    if not has_permission(role, "reports"):
        await callback.answer("Sizda bu bo'limga kirish huquqi yo'q", show_alert=True)
        return

    today_start = datetime.combine(date.today(), datetime.min.time()).isoformat()
    convs = (await asyncio.to_thread(
        lambda: supabase.table("conversations").select(
            "id, created_at, employees(full_name)"
        ).gte("created_at", today_start).order("created_at", desc=True).execute()
    )).data

    if not convs:
        await callback.message.answer("Bugun hali suhbatlar tahlil qilinmagan.")
        return

    conv_ids = [c["id"] for c in convs]
    analytics = (await asyncio.to_thread(
        lambda: supabase.table("analytics").select("conversation_id, total_score").in_(
            "conversation_id", conv_ids
        ).execute()
    )).data
    score_by_conv = {a["conversation_id"]: a["total_score"] for a in analytics}

    lines = [f"📊 <b>Bugungi hisobotlar</b> ({len(convs)} ta suhbat):\n"]
    for c in convs:
        score = score_by_conv.get(c["id"])
        emoji = _score_emoji(score) if score is not None else "⏳"
        employees_data = c.get("employees")
        name = employees_data["full_name"] if employees_data else "Noma'lum"
        time_str = datetime.fromisoformat(c["created_at"]).strftime("%H:%M")
        score_str = f" — {score}/100" if score is not None else " — tahlil kutilmoqda"
        lines.append(f"{emoji} {time_str} — {name}{score_str}")

    await callback.message.answer("\n".join(lines))


# =========================================================================
# SUHBAT TAHLIL PIPELINE
# =========================================================================

def _score_emoji(score: int) -> str:
    if score >= 85:
        return "🟢"
    elif score >= 60:
        return "🟡"
    return "🔴"


def _format_report(employee_name: str, result: AnalysisResult, include_score: bool = True, lang: str = "uz") -> str:
    """
    include_score=False — operatorga BLIND (ko'r) rejimda yuborish uchun:
    faqat matnni ko'rsatadi, ballni yashiradi (TZ 3.9-band).

    YANGILIK (TZ 24-bo'lim): `lang` — hisobot SARLAVHALARI (Umumiy ball,
    Xatolar va h.k.) qaysi tilda chiqishini belgilaydi. AI tomonidan
    yozilgan MATN (xato tavsifi, xulosa) har doim o'zbek tilida bo'ladi
    (analyzer.py'dagi til qoidasi) — faqat interfeys elementlari tarjima
    qilinadi.
    """
    employee_label = t("report_employee", lang)
    date_label = t("report_date", lang)
    lines = [f"👤 {employee_label}: <b>{employee_name}</b>",
             f"📅 {date_label}: {datetime.now().strftime('%d.%m.%Y %H:%M')}"]

    if not include_score:
        return "\n".join(lines)

    emoji = _score_emoji(result.umumiy_ball)
    m = result.mezonlar
    # YANGILIK (TZ 15-bo'lim): mezonlar endi qattiq yozilmagan — CRITERIA_CONFIG
    # orqali joriy mijozning (soha) criteria.json faylidan dinamik olinadi.
    mezon_lines = [
        f"  • {c.get('label', c['key'])}: {m.get(c['key'], '-')}/{c['max_score']}"
        for c in CRITERIA_CONFIG["criteria"]
    ]
    lines = [f"{emoji} <b>{'Yangi suhbat tahlili' if lang == 'uz' else 'Новый анализ разговора'}</b>"] + lines + [
        "",
        f"⭐ <b>{t('report_score', lang)}: {result.umumiy_ball}/100</b>",
        "",
        f"<b>{t('report_criteria', lang)}:</b>",
        *mezon_lines,
    ]

    if result.xatolar:
        lines.append("")
        lines.append(f"⚠️ <b>{t('report_errors', lang)}:</b>")
        for i, xato in enumerate(result.xatolar, 1):
            lines.append(f"{i}. {xato.get('xodim_aytgani', '')}")
            lines.append(f"   ❌ {xato.get('sabab', '')}")
            lines.append(f"   ✅ {xato.get('togri_variant', '')}")

    if result.kuchli_tomonlar:
        lines.append("")
        lines.append(f"💪 <b>{t('report_strengths', lang)}:</b>")
        for kt in result.kuchli_tomonlar:
            lines.append(f"  • {kt}")

    if result.qisqa_xulosa:
        lines.append("")
        lines.append(f"📝 <b>{t('report_summary', lang)}:</b> {result.qisqa_xulosa}")

    if result.ogohlantirish:
        lines.append("")
        lines.append(f"⚠️ <i>{result.ogohlantirish}</i>")

    return "\n".join(lines)


def _get_audio_duration_sec(audio_path: str) -> int | None:
    """
    Audio faylning davomiyligini soniyalarda hisoblaydi (davomat moduli,
    TZ 22-bo'lim uchun — `today_attendance` VIEW shu ustunga tayanadi).
    Faqat WAV formatini o'qiy oladi (`wave` moduli boshqasini
    qo'llab-quvvatlamaydi) — m4a/ogg/mp3 fayllar uchun xatolik xavfsiz
    tutiladi, natija shunchaki None qaytadi (davomat statistikasi shu
    fayl uchun kamroq aniq bo'ladi, lekin dastur yiqilmaydi).
    """
    try:
        with wave.open(audio_path, "rb") as wf:
            frames = wf.getnframes()
            rate = wf.getframerate()
            return int(frames / rate) if rate else None
    except (OSError, wave.Error):
        return None


def _save_to_supabase(
    employee_id: str, transcript: str, result: AnalysisResult, audio_path: str,
    duration_sec: int | None, detected_language: str = "uz",
) -> str:
    conv = supabase.table("conversations").insert({
        "employee_id": employee_id,
        "transcript": transcript,
        "audio_file_path": audio_path,
        "audio_duration_sec": duration_sec,
        "language": detected_language,
        "created_at": datetime.now().isoformat(),
    }).execute()

    conversation_id = conv.data[0]["id"]

    supabase.table("analytics").insert({
        "conversation_id": conversation_id,
        "total_score": result.umumiy_ball,
        "criteria_scores": result.mezonlar,
        "errors": result.xatolar,
        "strengths": result.kuchli_tomonlar,
        "summary": result.qisqa_xulosa,
        "warning": result.ogohlantirish,
    }).execute()

    return conversation_id


_AUDIO_CONTENT_TYPES = {
    ".wav": "audio/wav",
    ".mp3": "audio/mpeg",
    ".m4a": "audio/mp4",
    ".ogg": "audio/ogg",
}


def _upload_audio_to_storage(conversation_id: str, audio_path: str) -> None:
    """
    Audio faylni Supabase Storage'ga (yopiq/private "conversation-audio"
    bucket) yuklaydi va conversations.audio_storage_path'ni yangilaydi —
    rahbar Dashboard'dan suhbatni eshitishi uchun (TZ 4.5 yangilanishi:
    endi audio nafaqat mahalliy kompyuterda, balki Storage'da ham
    saqlanadi). Mahalliy fayl (audio_file_path) o'zgarishsiz qoladi.
    """
    ext = Path(audio_path).suffix.lower() or ".wav"
    storage_path = f"{conversation_id}{ext}"
    content_type = _AUDIO_CONTENT_TYPES.get(ext, "application/octet-stream")

    with open(audio_path, "rb") as f:
        supabase.storage.from_("conversation-audio").upload(
            storage_path, f.read(), file_options={"content-type": content_type}
        )

    supabase.table("conversations").update(
        {"audio_storage_path": storage_path}
    ).eq("id", conversation_id).execute()


# =========================================================================
# KUNLIK/OYLIK HISOBOT INSTANTANESI + AUDIO SAQLASH MUDDATI
# =========================================================================
# Foydalanuvchi bilan kelishilgan siyosat: xarajatni bepul saqlash uchun
# audio fayllar (Storage + lokal disk) 1 OYDAN keyin avtomatik o'chiriladi,
# lekin transkript va tahlil (analytics) qatorlari — demak, kunlik/oylik
# hisobotlar ham — ABADIY saqlanadi (hajmi juda kichik).

AUDIO_RETENTION_DAYS = 30


def _next_month(d: date) -> date:
    if d.month == 12:
        return d.replace(year=d.year + 1, month=1)
    return d.replace(month=d.month + 1)


def _generate_daily_report(report_date: date) -> None:
    """Berilgan kun uchun har bir xodimning kunlik statistikasini daily_reports'ga yozadi."""
    start = datetime.combine(report_date, datetime.min.time()).isoformat()
    end = datetime.combine(report_date, datetime.max.time()).isoformat()

    convs = supabase.table("conversations").select("id, employee_id").gte(
        "created_at", start
    ).lte("created_at", end).execute().data

    if not convs:
        return

    conv_ids = [c["id"] for c in convs]
    analytics = supabase.table("analytics").select("conversation_id, total_score").in_(
        "conversation_id", conv_ids
    ).execute().data
    score_by_conv = {a["conversation_id"]: a["total_score"] for a in analytics}

    counts: dict[str, int] = {}
    scores_by_employee: dict[str, list[int]] = {}
    for c in convs:
        emp_id = c["employee_id"]
        counts[emp_id] = counts.get(emp_id, 0) + 1
        score = score_by_conv.get(c["id"])
        if score is not None:
            scores_by_employee.setdefault(emp_id, []).append(score)

    for emp_id, count in counts.items():
        emp_scores = scores_by_employee.get(emp_id, [])
        supabase.table("daily_reports").upsert({
            "employee_id": emp_id,
            "report_date": report_date.isoformat(),
            "conversations_count": count,
            "avg_score": round(sum(emp_scores) / len(emp_scores), 2) if emp_scores else None,
            "min_score": min(emp_scores) if emp_scores else None,
            "max_score": max(emp_scores) if emp_scores else None,
            "updated_at": datetime.now().isoformat(),
        }, on_conflict="employee_id,report_date").execute()

    logger.info(f"Kunlik hisobot yozildi: {report_date} ({len(counts)} xodim)")


def _generate_monthly_report(any_day_in_month: date) -> None:
    """Joriy oy uchun oylik hisobotni kunlik hisobotlar asosida (og'irlik bilan) qayta hisoblaydi."""
    month_start = any_day_in_month.replace(day=1)
    month_end = _next_month(month_start)

    rows = supabase.table("daily_reports").select(
        "employee_id, conversations_count, avg_score, min_score, max_score"
    ).gte("report_date", month_start.isoformat()).lt(
        "report_date", month_end.isoformat()
    ).execute().data

    if not rows:
        return

    by_employee: dict[str, dict] = {}
    for r in rows:
        agg = by_employee.setdefault(r["employee_id"], {
            "count": 0, "score_weighted_sum": 0.0, "score_weight": 0, "min": None, "max": None,
        })
        agg["count"] += r["conversations_count"]
        if r["avg_score"] is not None:
            agg["score_weighted_sum"] += float(r["avg_score"]) * r["conversations_count"]
            agg["score_weight"] += r["conversations_count"]
        if r["min_score"] is not None:
            agg["min"] = r["min_score"] if agg["min"] is None else min(agg["min"], r["min_score"])
        if r["max_score"] is not None:
            agg["max"] = r["max_score"] if agg["max"] is None else max(agg["max"], r["max_score"])

    for emp_id, agg in by_employee.items():
        avg = round(agg["score_weighted_sum"] / agg["score_weight"], 2) if agg["score_weight"] else None
        supabase.table("monthly_reports").upsert({
            "employee_id": emp_id,
            "period_month": month_start.isoformat(),
            "conversations_count": agg["count"],
            "avg_score": avg,
            "min_score": agg["min"],
            "max_score": agg["max"],
            "updated_at": datetime.now().isoformat(),
        }, on_conflict="employee_id,period_month").execute()

    logger.info(f"Oylik hisobot yangilandi: {month_start.strftime('%Y-%m')} ({len(by_employee)} xodim)")


def _cleanup_old_audio() -> None:
    """1 oydan eski suhbatlarning audio faylini Storage'dan va lokal diskdan o'chiradi (transkript/tahlil qoladi)."""
    cutoff = (datetime.now() - timedelta(days=AUDIO_RETENTION_DAYS)).isoformat()
    old_convs = supabase.table("conversations").select(
        "id, audio_file_path, audio_storage_path"
    ).lt("created_at", cutoff).not_.is_("audio_storage_path", "null").execute().data

    cleaned = 0
    for conv in old_convs:
        try:
            supabase.storage.from_("conversation-audio").remove([conv["audio_storage_path"]])
        except Exception:
            logger.exception(f"Storage'dan audio o'chirishda xatolik: {conv['id']}")
            continue

        local_path = conv.get("audio_file_path")
        if local_path:
            try:
                Path(local_path).unlink(missing_ok=True)
            except Exception:
                logger.exception(f"Lokal audio faylni o'chirishda xatolik: {local_path}")

        supabase.table("conversations").update({
            "audio_storage_path": None,
            "audio_file_path": None,
        }).eq("id", conv["id"]).execute()
        cleaned += 1

    if cleaned:
        logger.info(f"{cleaned} ta eski audio fayl tozalandi (>{AUDIO_RETENTION_DAYS} kun)")


async def daily_maintenance_loop():
    """
    Har kuni taxminan 00:15da (mahalliy vaqt) ishga tushadi: kechagi kun
    uchun kunlik hisobotni yozadi, joriy oy uchun oylik hisobotni
    yangilaydi va 1 oydan eski audio fayllarni tozalaydi.
    """
    while True:
        now = datetime.now()
        target = datetime.combine(now.date(), dtime(0, 15))
        if now >= target:
            target += timedelta(days=1)
        await asyncio.sleep((target - now).total_seconds())

        try:
            yesterday = (datetime.now() - timedelta(days=1)).date()
            await asyncio.to_thread(_generate_daily_report, yesterday)
            await asyncio.to_thread(_generate_monthly_report, yesterday)
            await asyncio.to_thread(_cleanup_old_audio)
        except Exception:
            logger.exception("Kunlik xizmat vazifasida (daily_maintenance_loop) xatolik")


async def _get_recipients_for_reports() -> list[tuple[int, str]]:
    """Har bir qabul qiluvchi uchun (chat_id, til) juftligini qaytaradi (TZ 24-bo'lim)."""
    result = await asyncio.to_thread(
        lambda: supabase.table("bot_users").select("telegram_id, role, language").eq(
            "is_active", True
        ).execute()
    )
    return [
        (u["telegram_id"], u.get("language") or "uz")
        for u in result.data if has_permission(u["role"], "reports")
    ]


# =========================================================================
# PAST BALL UCHUN OVOZLI OGOHLANTIRISH (Gemini TTS)
# =========================================================================
# Bir suhbat uchun ball juda past bo'lsa, matnli hisobotdan tashqari
# rahbarlarga OVOZLI xabar ham yuboriladi — Dashboard'dagi "Intizom AI"
# TTS'i bilan bir xil ovoz/uslub (index.ts'dagi synthesizeSpeech()),
# faqat bu yerda to'g'ridan-to'g'ri Python'dan Gemini REST API'siga
# so'rov yuborilib, natija Telegram ovozli fayl sifatida uzatiladi.

LOW_SCORE_ALERT_THRESHOLD = 25
GEMINI_TTS_MODEL = "gemini-2.5-flash-preview-tts"
TTS_VOICE_NAME = "Puck"
TTS_STYLE_INSTRUCTION = (
    "Quyidagi matnni tabiiy, biroz tezroq sur'atda, erkak ovozida, "
    "o'zbek tilida aksentsiz, sof talaffuz bilan o'qi:\n\n"
)


def _pcm_to_wav_bytes(pcm_bytes: bytes, sample_rate: int = 24000, channels: int = 1, sample_width: int = 2) -> bytes:
    """Gemini TTS xom PCM (24kHz, mono, 16-bit) qaytaradi — Telegram/pleyerlar
    o'qiy oladigan to'liq WAV konteyneriga o'raydi."""
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(sample_rate)
        wf.writeframes(pcm_bytes)
    return buf.getvalue()


def _synthesize_speech_wav(text: str) -> bytes | None:
    """Matnni Gemini TTS orqali ovozga aylantiradi. Xatolik bo'lsa None
    qaytaradi (chaqiruvchi tomon buni xavfsiz e'tiborsiz qoldiradi —
    ogohlantirish yuborilmasa ham, matnli hisobot baribir yetib boradi)."""
    try:
        resp = httpx.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_TTS_MODEL}:generateContent",
            params={"key": GEMINI_API_KEY},
            json={
                "contents": [{"parts": [{"text": TTS_STYLE_INSTRUCTION + text[:2000]}]}],
                "generationConfig": {
                    "responseModalities": ["AUDIO"],
                    "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": TTS_VOICE_NAME}}},
                },
            },
            timeout=30.0,
        )
        resp.raise_for_status()
        data = resp.json()
        pcm_b64 = data["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
        return _pcm_to_wav_bytes(base64.b64decode(pcm_b64))
    except Exception:
        logger.exception("TTS ovoz yaratishda xatolik (past ball ogohlantirishi)")
        return None


async def _send_low_score_voice_alert(employee_name: str, result: AnalysisResult) -> None:
    """Ball LOW_SCORE_ALERT_THRESHOLD'dan past bo'lsa, "reports" huquqiga
    ega har bir foydalanuvchiga ovozli ogohlantirish yuboradi."""
    alert_text = (
        f"Diqqat! {employee_name} bugungi suhbatda juda past ball oldi — "
        f"{result.umumiy_ball} balldan 100. Xulosa: {result.qisqa_xulosa or 'xulosa yoq'}."
    )
    wav_bytes = await asyncio.to_thread(_synthesize_speech_wav, alert_text)
    if not wav_bytes:
        return

    for chat_id, _recipient_lang in await _get_recipients_for_reports():
        try:
            await bot.send_audio(
                chat_id=chat_id,
                audio=BufferedInputFile(wav_bytes, filename="past_ball_ogohlantirish.wav"),
                caption=f"⚠️ {employee_name} — {result.umumiy_ball}/100 ball",
            )
        except Exception:
            logger.exception(f"Ovozli ogohlantirishni {chat_id} ga yuborishda xatolik")


async def process_and_report(audio_path: str, microphone_id: str):
    """To'liq pipeline: transkripsiya → tahlil → saqlash → hisobot → operator self-review taklifi."""
    logger.info(f"Pipeline boshlandi: {audio_path} (mikrofon: {microphone_id})")

    employee = await asyncio.to_thread(
        lambda: supabase.table("employees").select("id, full_name, telegram_id").eq(
            "microphone_id", microphone_id
        ).eq("is_active", True).execute()
    )

    if not employee.data:
        logger.warning(f"'{microphone_id}' ga biriktirilgan faol xodim topilmadi — o'tkazib yuborildi")
        return

    employee_id = employee.data[0]["id"]
    employee_name = employee.data[0]["full_name"]
    employee_telegram_id = employee.data[0].get("telegram_id")

    # YANGILIK (TZ 24-bo'lim): language_hint=None — til avtomatik aniqlanadi
    # (o'zbek yoki rus, xodim/mijoz qaysi tilda gaplashishidan qat'iy nazar).
    transcript, detected_language = await asyncio.to_thread(transcribe_audio, audio_path, None)
    duration_sec = await asyncio.to_thread(_get_audio_duration_sec, audio_path)

    # TZ 21-bo'lim: ICHKI SUHBAT FILTRI — AI chaqirilishidan OLDIN tekshiriladi.
    # Xodimlar bir-biri bilan (mijozsiz) gaplashgan bo'lsa, AI umuman
    # chaqirilmaydi (kvota tejaladi) va transkripsiya matni SAQLANMAYDI
    # (maxfiylik — faqat yengil statistik yozuv qoladi).
    if not await asyncio.to_thread(is_customer_conversation, transcript):
        logger.info(f"Ichki suhbat aniqlandi (mijoz emas) — AI chaqirilmadi: {audio_path}")
        await asyncio.to_thread(
            lambda: supabase.table("internal_chats_log").insert({
                "employee_id": employee_id,
                "duration_sec": duration_sec,
            }).execute()
        )
        return

    result = await asyncio.to_thread(analyze_conversation, transcript)
    conversation_id = await asyncio.to_thread(
        _save_to_supabase, employee_id, transcript, result, audio_path, duration_sec, detected_language
    )

    try:
        await asyncio.to_thread(_upload_audio_to_storage, conversation_id, audio_path)
    except Exception:
        # Yuklash muvaffaqiyatsiz bo'lsa ham, hisobot baribir yuboriladi —
        # faqat Dashboard'da "eshitish" tugmasi ishlamay qoladi.
        logger.exception(f"Audio faylni Storage'ga yuklashda xatolik: {audio_path}")

    # 1) Rahbarlarga to'liq hisobot — har biriga O'Z TANLAGAN TILIDA (TZ 24-bo'lim)
    for chat_id, recipient_lang in await _get_recipients_for_reports():
        try:
            report_text = _format_report(employee_name, result, lang=recipient_lang)
            await bot.send_message(chat_id=chat_id, text=report_text)
        except Exception:
            logger.exception(f"Hisobotni {chat_id} ga yuborishda xatolik")

    # 1.1) Ball juda past bo'lsa — qo'shimcha ovozli ogohlantirish
    if result.umumiy_ball < LOW_SCORE_ALERT_THRESHOLD:
        try:
            await _send_low_score_voice_alert(employee_name, result)
        except Exception:
            logger.exception("Ovozli ogohlantirish yuborishda kutilmagan xatolik")

    # 2) Agar operator botga bog'langan bo'lsa — BLIND self-review taklifi (TZ 3.9)
    if employee_telegram_id:
        try:
            blind_text = _format_report(employee_name, result, include_score=False)
            kb = InlineKeyboardMarkup(inline_keyboard=[[
                InlineKeyboardButton(text="Baho berish", callback_data=f"selfreview_{conversation_id}")
            ]])
            _pending_self_review[employee_telegram_id] = conversation_id
            await bot.send_message(
                chat_id=employee_telegram_id,
                text=f"{blind_text}\n\nUshbu suhbatga o'zingiz qanday baho berardingiz?",
                reply_markup=kb,
            )
        except Exception:
            logger.exception(f"Operator {employee_telegram_id}ga self-review yuborishda xatolik")


# =========================================================================
# OPERATOR SELF-REVIEW — TZ 3.9
# =========================================================================

class SelfReviewForm(StatesGroup):
    waiting_score = State()
    waiting_comment = State()


@router.callback_query(F.data.startswith("selfreview_"))
async def selfreview_start(callback: CallbackQuery, state: FSMContext):
    conversation_id = callback.data.split("_", 1)[1]

    # XAVFSIZLIK (TZ 7.1): callback_data'ni qo'lda o'zgartirib, boshqa
    # xodimning suhbatiga (masalan, conversation_id'ni almashtirib) baho
    # berishning oldini olish — faqat aynan shu suhbat shu foydalanuvchiga
    # navbatda turgan bo'lsagina davom etadi.
    if _pending_self_review.get(callback.from_user.id) != conversation_id:
        await callback.answer(
            "Bu so'rov eskirgan yoki sizga tegishli emas.", show_alert=True
        )
        return
    if await asyncio.to_thread(get_operator_employee, callback.from_user.id) is None:
        await callback.answer("Sizda bu amalni bajarish huquqi yo'q", show_alert=True)
        return

    await state.update_data(conversation_id=conversation_id)
    await state.set_state(SelfReviewForm.waiting_score)
    await callback.message.answer("0 dan 100 gacha baho kiriting:")


@router.message(SelfReviewForm.waiting_score)
async def selfreview_score(message: Message, state: FSMContext):
    try:
        score = int(message.text.strip())
        assert 0 <= score <= 100
    except (ValueError, AssertionError):
        await message.answer("Iltimos, 0 dan 100 gacha bo'lgan butun son kiriting:")
        return
    await state.update_data(self_score=score)
    await state.set_state(SelfReviewForm.waiting_comment)
    await message.answer("Izoh qoldirmoqchimisiz? (ixtiyoriy, \"-\" yozib o'tkazib yuborishingiz mumkin)")


@router.message(SelfReviewForm.waiting_comment)
async def selfreview_comment(message: Message, state: FSMContext):
    data = await state.get_data()
    # BUG TUZATISH: agar holat (state) kutilmagan tarzda yo'qolgan bo'lsa
    # (masalan bot qayta ishga tushgan bo'lsa), KeyError o'rniga tushunarli
    # xabar bilan chiqib ketamiz.
    conversation_id = data.get("conversation_id")
    self_score = data.get("self_score")
    if conversation_id is None or self_score is None:
        await message.answer(
            "Kechirasiz, jarayon uzilib qoldi. Iltimos, qaytadan \"Baho berish\" tugmasini bosing."
        )
        await state.clear()
        return
    comment = None if message.text.strip() == "-" else message.text.strip()
    await state.clear()

    # AI bahosini olib, farqni hisoblaymiz — faqat ENDI, javob berilgach ochiladi
    analytics = await asyncio.to_thread(
        lambda: supabase.table("analytics").select("total_score").eq(
            "conversation_id", conversation_id
        ).execute()
    )
    ai_score = analytics.data[0]["total_score"] if analytics.data else None
    score_diff = abs(self_score - ai_score) if ai_score is not None else None

    await asyncio.to_thread(
        lambda: supabase.table("self_reviews").insert({
            "conversation_id": conversation_id,
            "self_score": self_score,
            "self_comment": comment,
            "ai_score": ai_score,
            "score_diff": score_diff,
        }).execute()
    )

    _pending_self_review.pop(message.from_user.id, None)

    if ai_score is not None:
        await message.answer(
            f"Rahmat! Sizning bahoyingiz: {self_score}. "
            f"AI bahosi: {ai_score}. Farq: {score_diff} ball."
        )
    else:
        await message.answer("Rahmat! Bahoyingiz saqlandi.")


# =========================================================================
# LOKAL PAPKA KUZATUVCHISI
# =========================================================================

PROCESSED_SUBDIR_NAME = "processed"


async def _sync_work_sessions():
    """
    TZ 22-bo'lim: recorder.py yozgan `_status.json` (heartbeat) fayllarni
    o'qib, `work_sessions` jadvalini yangilaydi — dashboard/bot'dagi
    "Davomat" bo'limi shu ma'lumotdan foydalanadi.
    """
    if not RECORDINGS_DIR.exists():
        return

    for mic_dir in RECORDINGS_DIR.iterdir():
        if not mic_dir.is_dir() or mic_dir.name == PROCESSED_SUBDIR_NAME:
            continue
        status_path = mic_dir / "_status.json"
        if not status_path.exists():
            continue

        try:
            status = json.loads(status_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue

        microphone_id = status.get("microphone_id", mic_dir.name)
        employee = await asyncio.to_thread(
            lambda mic=microphone_id: supabase.table("employees").select("id").eq(
                "microphone_id", mic
            ).eq("is_active", True).execute()
        )
        if not employee.data:
            continue
        employee_id = employee.data[0]["id"]

        try:
            await asyncio.to_thread(
                lambda emp_id=employee_id, mic=microphone_id, st=status: supabase.table("work_sessions").upsert({
                    "employee_id": emp_id,
                    "microphone_id": mic,
                    "session_start": st["session_start"],
                    "last_heartbeat": st["last_heartbeat"],
                    "session_end": st.get("session_end"),
                    "ended_gracefully": st.get("ended_gracefully", False),
                }, on_conflict="employee_id,session_start").execute()
            )
        except Exception:
            logger.exception(f"work_sessions yangilashda xatolik: {microphone_id}")


async def watch_recordings_folder():
    """
    TZ 11-bo'lim, B-band tuzatildi: qayta ishlangan fayllar ro'yxati endi
    operativ xotirada (bot qayta ishga tushganda yo'qolib, eski audiolarni
    qaytadan yuborishga sabab bo'lardi) emas, balki fayl tizimida
    saqlanadi — muvaffaqiyatli qayta ishlangan har bir fayl darhol
    `<mikrofon>/processed/` papkasiga ko'chiriladi. Shu bilan bir vaqtda,
    xatolik yuz bergan fayl asl joyida qoladi va keyingi tsiklda avtomatik
    qayta urinib ko'riladi — bu ilgari mavjud bo'lmagan qayta urinish
    imkoniyatini ham qo'shadi.
    """
    logger.info(f"Fayl kuzatuvchi ishga tushdi: {RECORDINGS_DIR}")
    RECORDINGS_DIR.mkdir(exist_ok=True)

    while True:
        await _sync_work_sessions()  # TZ 22-bo'lim: davomat holatini yangilash

        for mic_dir in RECORDINGS_DIR.iterdir():
            if not mic_dir.is_dir() or mic_dir.name == PROCESSED_SUBDIR_NAME:
                continue
            microphone_id = mic_dir.name
            processed_dir = mic_dir / PROCESSED_SUBDIR_NAME
            processed_dir.mkdir(exist_ok=True)

            # TZ 3.1: wav, m4a, ogg, mp3 formatlari qo'llab-quvvatlanishi
            # kerak (avval faqat *.wav ko'rilardi — telefon orqali yozilgan
            # ovozli xabarlar odatda .ogg yoki .m4a bo'ladi).
            audio_files = [
                f for ext in ("*.wav", "*.m4a", "*.ogg", "*.mp3")
                for f in mic_dir.glob(ext)
                if not f.name.endswith(".tmp") and not f.name.endswith(".recording.tmp")
            ]
            for audio_file in audio_files:
                try:
                    await process_and_report(str(audio_file), microphone_id)
                    dest_file = processed_dir / audio_file.name
                    if dest_file.exists():
                        dest_file.unlink(missing_ok=True)
                    audio_file.replace(dest_file)
                except PermissionError:
                    logger.warning(f"Fayl hozirda band, keyingi tsiklda uriniladi: {audio_file}")
                except Exception:
                    logger.exception(f"Faylni qayta ishlashda xatolik: {audio_file}")

        await asyncio.sleep(WATCH_INTERVAL_SEC)


async def main():
    logger.info("Bot ishga tushdi...")
    # "/start" buyrug'ini ro'yxatdan o'tkazamiz — shunda Telegram uni
    # matn maydoni yonida bosiladigan buyruq sifatida ko'rsatadi, foydalanuvchi
    # "start" so'zini qo'lda yozishi shart bo'lmaydi.
    await bot.set_my_commands([
        BotCommand(command="start", description="Botni ishga tushirish"),
    ])
    asyncio.create_task(watch_recordings_folder())
    asyncio.create_task(daily_maintenance_loop())
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
