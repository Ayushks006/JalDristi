@echo off
title JalDristi - Frontend Web Application
cd /d "%~dp0frontend"
echo ========================================================
echo Starting JalDristi React + Vite Frontend
echo Local URL: http://localhost:5173
echo ========================================================
cmd.exe /c "npm run dev"
pause
