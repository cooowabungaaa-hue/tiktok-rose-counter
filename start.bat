@echo off
echo ========================================
echo   TikTok Rose Counter - Startup
echo ========================================

setlocal
cd /d %~dp0

:: 0. Clean up existing processes to avoid Port In Use errors
taskkill /F /IM node.exe >nul 2>&1

:: 1. Environment Setup
if exist "%~dp0node-bin\node.exe" (
    set "PATH=%~dp0node-bin;%PATH%"
)

:: 2. Check Node.js and Repair if needed
node -v >nul 2>&1
if %errorlevel% neq 0 (
    goto :DoDownload
)
if exist "node-bin" if not exist "node-bin\npm.cmd" (
    echo [WARN] Environment incomplete. Repairing...
    rmdir /S /Q node-bin
    goto :DoDownload
)
goto :CheckDeps

:DoDownload
echo [INFO] Node.js not found or broken. Downloading portable version...
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

:CheckDeps
:: 3. Install dependencies
if not exist "node_modules" (
    echo [INFO] Installing libraries...
    
    if exist "node-bin\npm.cmd" (
        call node-bin\npm.cmd install express socket.io tiktok-live-connector
    ) else (
        call npm install express socket.io tiktok-live-connector
    )

    if %errorlevel% neq 0 (
        echo [ERROR] Installation failed.
        pause
        exit /b 1
    )
)

:: 4. Start Server
echo [INFO] Starting application...
echo [INFO] The black screen will close in a moment. 
echo [INFO] The app will continue running in the background.

powershell -Command "Start-Process node -ArgumentList 'server.js' -WindowStyle Hidden -WorkingDirectory '%~dp0'"

if %errorlevel% neq 0 (
    echo [ERROR] Server failed to start.
    pause
    exit /b 1
)

echo [INFO] App started! Closing this window...
timeout /t 2 >nul
endlocal
exit
