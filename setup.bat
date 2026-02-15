@echo off
echo ---------------------------------------------------
echo 🌹 TikTok Rose Counter Setter-upper 🌹
echo ---------------------------------------------------
echo.
echo Checking for Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo (See the setup guide in docs/index.html)
    pause
    exit /b
)

echo Node.js found. Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b
)

echo.
echo ---------------------------------------------------
echo Setup Complete! Starting the App...
echo ---------------------------------------------------
echo.
node server.js
pause
