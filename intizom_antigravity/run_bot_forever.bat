@echo off
cd /d "%~dp0"
:loop
echo [%date% %time%] Bot ishga tushmoqda...
".venv\Scripts\python.exe" bot.py
echo [%date% %time%] Bot to'xtadi (chiqish kodi: %errorlevel%). 5 soniyadan keyin qayta tiklanadi...
timeout /t 5 /nobreak > nul
goto loop
