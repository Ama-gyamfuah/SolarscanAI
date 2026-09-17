@echo off
title SolarScan AI - Enterprise System Launcher
cd /d "c:\Users\amagy\Music\SolarScanAI-Complete-Bundle-1"
echo ===================================================
echo     SOLARSCAN AI - ENTERPRISE SYSTEM LAUNCHER
echo     Department of ITDS - UENR Sunyani
echo ===================================================
echo.
echo [1/2] Starting Python FastAPI & Web Server on Port 8000...
start "SolarScan Host" cmd /k "cd /d c:\Users\amagy\Music\SolarScanAI-Complete-Bundle-1\backend && python -m uvicorn server:app --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul
echo.
echo [2/2] Opening SolarScan AI in your default web browser...
start http://localhost:8000/
