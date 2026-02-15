@echo off
echo ---------------------------------------------------
echo TikTok Rose Counter Setup
echo ---------------------------------------------------
echo.
echo Checking for Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js LTS from: https://nodejs.org/
    echo After installing, restart your computer and try again.
    pause
    exit /b
)

echo Node.js found. Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies.
    echo Check your internet connection.
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
