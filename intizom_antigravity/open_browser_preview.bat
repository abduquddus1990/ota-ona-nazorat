@echo off
chcp 65001 > nul
echo =======================================================
echo   INTIZOM AI — Brauzer Preview Dashboardini Ochish
echo =======================================================
echo.
echo 1. Mahalliy HTTP server ishga tushirilmoqda (port 8085)...
start "" "http://localhost:8085"
"C:\Users\Surface\Desktop\Yangi muomala-bot\.venv\Scripts\python.exe" -m http.server 8085 --directory "D:\intizom_antigravity\miniapp"
pause
