@echo off
title JalDristi - Master Launcher
echo ========================================================
echo Launching JalDristi Full-Stack Application
echo ========================================================
start "JalDristi Backend" cmd /c "%~dp0start_backend.bat"
timeout /t 3 /nobreak >nul
start "JalDristi Frontend" cmd /c "%~dp0start_frontend.bat"
timeout /t 2 /nobreak >nul
start http://localhost:5173
echo JalDristi is now running!
