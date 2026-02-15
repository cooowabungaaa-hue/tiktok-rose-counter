@echo off
setlocal enabledelayedexpansion
cd /d %~dp0

echo ===================================================
echo   TikTok Rose Counter - Startup Script
echo ===================================================

:: 1. Check for Node.js
SET NODE_EXE=node
SET NPM_CMD=npm

where node >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] System Node.js found.
) else if exist "%~dp0node-bin\node.exe" (
    echo [OK] Portable Node.js found.
    set "PATH=%~dp0node-bin;%PATH%"
    set "NPM_CMD=node-bin\npm.cmd"
) else (
    echo [INFO] Node.js not found. Starting automatic setup...
    echo [INFO] Downloading portable Node.js (this may take a few minutes)...
    
    powershell -Command "$ProgressPreference = 'SilentlyContinue'; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.1/node-v20.11.1-win-x64.zip' -OutFile 'node.zip'"
    
    if not exist "node.zip" (
        echo [ERROR] Download failed. Please check your internet connection.
        pause
        exit /b 1
    )
    
    echo [INFO] Extracting files...
    powershell -Command "Expand-Archive -Path 'node.zip' -DestinationPath 'temp_node' -Force"
    
    if exist "node-bin" rmdir /S /Q node-bin
    move temp_node\node-v20.11.1-win-x64 node-bin
    del node.zip
    rmdir /S /Q temp_node
    
    set "PATH=%~dp0node-bin;%PATH%"
    set "NPM_CMD=node-bin\npm.cmd"
    echo [SUCCESS] Node.js is ready.
)

:: 2. Check for dependencies
if not exist "node_modules" (
    echo [INFO] Installing required libraries. Please wait...
    call !NPM_CMD! install express socket.io tiktok-live-connector
    if !errorlevel! neq 0 (
        echo [ERROR] Installation failed.
        pause
        exit /b !errorlevel!
    )
    echo [SUCCESS] Libraries installed.
)

:: 3. Start Application
echo.
echo [INFO] Starting TikTok Rose Counter...
node server.js
if %errorlevel% neq 0 (
    echo [ERROR] Application failed to start.
    pause
)
endlocal
pause
