@echo off
echo ========================================
echo   TikTok Rose Counter - Startup
echo ========================================

setlocal
cd /d %~dp0

:: 1. Add node-bin to path if it exists
if exist "%~dp0node-bin\node.exe" (
    set "PATH=%~dp0node-bin;%PATH%"
)

:: 2. Check Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Node.js not found. Downloading...
    powershell -Command "$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.1/node-v20.11.1-win-x64.zip' -OutFile 'node.zip'"
    if not exist "node.zip" (
        echo [ERROR] Download failed. Check internet.
        pause
        exit /b 1
    )
    echo [INFO] Extracting...
    powershell -Command "Expand-Archive -Path 'node.zip' -DestinationPath 'temp_node' -Force"
    if exist "node-bin" rmdir /S /Q node-bin
    move temp_node\node-v20.11.1-win-x64 node-bin
    del node.zip
    rmdir /S /Q temp_node
    set "PATH=%~dp0node-bin;%PATH%"
)

:: 3. Install dependencies
if not exist "node_modules" (
    echo [INFO] Installing libraries...
    call npm install express socket.io tiktok-live-connector
)

:: 4. Start Server
echo [INFO] Starting...
node server.js
if %errorlevel% neq 0 (
    echo [ERROR] Server failed.
    pause
)
endlocal
pause
