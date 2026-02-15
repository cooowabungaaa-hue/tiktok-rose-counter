@echo off
echo Starting TikTok Rose Counter...
echo.
cd /d %~dp0
node server.js
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] The server stopped unexpectedly.
    echo If you see "EADDRINUSE", run stop.bat first.
    pause
)
