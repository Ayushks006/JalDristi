@echo off
title JalDristi - Backend Server
cd /d "%~dp0backend"
echo ========================================================
echo Starting JalDristi FastAPI Backend Server
echo Endpoint: http://127.0.0.1:8000
echo API Docs: http://127.0.0.1:8000/docs
echo ========================================================
if exist "%~dp0backend\.venv\Scripts\python.exe" (
    "%~dp0backend\.venv\Scripts\python.exe" run_server.py
) else if exist ".venv\Scripts\python.exe" (
    ".venv\Scripts\python.exe" run_server.py
) else (
    python run_server.py
)
pause
