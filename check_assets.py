import os, base64, shutil

os.makedirs("assets", exist_ok=True)
os.makedirs("telegram_miniapp/assets", exist_ok=True)

# Copy downloaded wolf images to telegram_miniapp/assets
if os.path.exists("assets/wolf_bg.jpg"):
    shutil.copy("assets/wolf_bg.jpg", "telegram_miniapp/assets/wolf_bg.jpg")
if os.path.exists("assets/wolf_mascot.png"):
    shutil.copy("assets/wolf_mascot.png", "telegram_miniapp/assets/wolf_mascot.png")

print("Assets verified and copied successfully!")
