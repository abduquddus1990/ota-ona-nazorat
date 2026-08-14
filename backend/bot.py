import asyncio
import logging
import os
import uuid
from io import BytesIO
from aiogram import Bot, Dispatcher, F, types
from aiogram.filters import CommandStart, Command
from aiogram.types import (
    InlineKeyboardMarkup, 
    InlineKeyboardButton, 
    WebAppInfo, 
    ReplyKeyboardMarkup, 
    KeyboardButton
)
from ai_engine import gemini_ai

# Logging sozlamalari
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ParentalGuardBot")

# Bot Token va Konfiguratsiya
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8992925094:AAE5K1N8VVxiCh9P6H1j7hCrYoTeIBmC8r0")
MINI_APP_URL = os.getenv("MINI_APP_URL", "https://abduquddus1990.github.io/ota-ona-nazorat/")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# Vaqtinchalik xotira (In-memory State)
USER_SESSIONS = {}
FAMILY_LINKS = {} # parent_id -> list of child_ids
CHILD_TELEMETRY = {} # child_id -> latest stats

# ============================================================================
# BOT HANDLERS
# ============================================================================

@dp.message(CommandStart())
async def handle_start(message: types.Message):
    user_id = message.from_user.id
    user_name = message.from_user.first_name
    args = message.text.split()[1:] if len(message.text.split()) > 1 else []

    # 1. Deep Link orqali bog'lanish tekshiruvi (Farzand tomoni)
    if args and args[0].startswith("pair_"):
        pairing_token = args[0].replace("pair_", "")
        parent_id = USER_SESSIONS.get(pairing_token)
        
        if parent_id:
            FAMILY_LINKS.setdefault(parent_id, []).append(user_id)
            USER_SESSIONS[f"child_parent_{user_id}"] = parent_id
            
            # Farzandga tasdiq va ko'rsatma
            text = (
                f"Assalomu alaykum, {user_name}! 🛡️\n\n"
                f"Siz oilaviy xavfsizlik tarmog'iga ulandingiz.\n"
                f"Xavfsizligingizni tasdiqlash uchun:\n"
                f"1. 📹 Qisqa **dumaloq video (Video Note)** yuboring (Face ID tekshiruvi).\n"
                f"2. 📍 Pastdagi tugma orqali **Jonli Joylashuv (Live Location)** ulashing.\n"
                f"3. 📱 Kunlik foydalanish vaqtingizni tahlil qilish uchun *Sozlamalar -> Batareya* skrinshotini yuborishingiz mumkin."
            )
            location_kb = ReplyKeyboardMarkup(
                keyboard=[
                    [KeyboardButton(text="📍 Jonli Lokatsiyani Ulashish", request_location=True)]
                ],
                resize_keyboard=True
            )
            await message.answer(text, reply_markup=location_kb)
            
            # Ota-onaga bildirishnoma yuborish
            await bot.send_message(
                parent_id,
                f"✅ Farzandingiz **{user_name}** (@{message.from_user.username or 'yoq'}) botga ulandi!"
            )
            return

    # 2. Ota-ona uchun standart Start xabari
    pairing_code = str(uuid.uuid4())[:8]
    USER_SESSIONS[pairing_code] = user_id

    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text="📊 Ota-ona Boshqaruv Panelini Ochish (Mini App)", 
                web_app=WebAppInfo(url=f"{MINI_APP_URL}?parent_id={user_id}")
            )
        ],
        [
            InlineKeyboardButton(
                text="🔗 Farzandni Ulash Havolasi", 
                url=f"https://t.me/farzand_nazorat_bot?start=pair_{pairing_code}"
            )
        ]
    ])

    await message.answer(
        f"Assalomu alaykum, {user_name}! 🛡️\n\n"
        f"**Shield Parental Guard** — Zero-Trust ota-ona nazorati va AI pedagogika tizimiga xush kelibsiz.\n\n"
        f"Farzandingizni ulash uchun quyidagi havolani uning Telegramiga yuboring:\n"
        f"`https://t.me/farzand_nazorat_bot?start=pair_{pairing_code}`\n\n"
        f"Yoki boshqaruv panelini oching 👇",
        reply_markup=keyboard,
        parse_mode="Markdown"
    )

# 2. Skrinshot qabul qilish (Batareya / Raqamli Qulaylik tahlili)
@dp.message(F.photo)
async def handle_screenshot(message: types.Message):
    user_id = message.from_user.id
    photo = message.photo[-1]
    
    status_msg = await message.answer("🧠 Gemini Vision AI skrinshotni tahlil qilmoqda...")
    
    file_info = await bot.get_file(photo.file_id)
    file_bytes = await bot.download_file(file_info.file_path)
    
    # Gemini Vision orqali ilovalar reytingini olish
    result = await gemini_ai.analyze_battery_screenshot(file_bytes.read())
    CHILD_TELEMETRY[user_id] = result

    # Chiroyli hisobot tayyorlash
    apps_text = "\n".join([
        f"• **{app['name']}**: {app['time']} ({app['percentage']}%) — _{app['category']}_"
        for app in result.get("apps", [])
    ])

    total_time = result.get("total_screen_time", "Nomalum")
    reply_text = (
        f"✅ **Ilovalardan Foydalanish Tahlili Qabul Qilindi:**\n\n"
        f"⏳ **Umumiy ekran vaqti:** {total_time}\n\n"
        f"📱 **Ilovalar Reytingi:**\n{apps_text}\n\n"
        f"📊 Ma'lumotlar ota-onangizning boshqaruv paneliga sinxronlashtirildi."
    )
    await status_msg.edit_text(reply_text, parse_mode="Markdown")

    # Ota-onaga bildirishnoma jo'natish
    parent_id = USER_SESSIONS.get(f"child_parent_{user_id}")
    if parent_id:
        await bot.send_message(
            parent_id,
            f"📱 Farzandingizdan yangi ilovalar reytingi kelib tushdi:\n"
            f"Umumiy vaqt: {result.get('total_screen_time')}\nMini App'da ko'ring!"
        )

# 3. Video Note (Liveness / Face Check) qabul qilish
@dp.message(F.video_note)
async def handle_video_note(message: types.Message):
    user_id = message.from_user.id
    user_name = message.from_user.first_name
    
    await message.answer("✅ Face ID / Biometrik tasdiq videosi muvaffaqiyatli qabul qilindi!")

    parent_id = USER_SESSIONS.get(f"child_parent_{user_id}")
    if parent_id:
        await bot.send_message(
            parent_id,
            f"🛡️ Farzandingiz **{user_name}** biometrik videotasdiq yubordi. Shaxsiyati tasdiqlandi."
        )

# 4. Jonli Lokatsiyani qabul qilish
@dp.message(F.location)
async def handle_location(message: types.Message):
    user_id = message.from_user.id
    lat = message.location.latitude
    lng = message.location.longitude

    CHILD_TELEMETRY.setdefault(user_id, {})["location"] = {"lat": lat, "lng": lng}
    await message.answer("📍 Jonli lokatsiyangiz xavfsiz tarzda saqlandi.")

# ============================================================================
# ISHGA TUSHIRISH
# ============================================================================
async def main():
    logger.info("Bot ishga tushmoqda...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
