@echo off
echo ---------------------------------------------------
echo TikTok Rose Counter Updater
echo ---------------------------------------------------
echo.
echo Downloading the latest version from GitHub...
echo.

:: Try using curl first (faster)
curl -L -o update.zip "https://github.com/cooowabungaaa-hue/tiktok-rose-counter/archive/refs/heads/main.zip"

:: If curl failed (errorlevel not 0), try PowerShell as fallback
if %errorlevel% neq 0 (
    echo curl not found or failed, trying PowerShell...
    powershell -Command "$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://github.com/cooowabungaaa-hue/tiktok-rose-counter/archive/refs/heads/main.zip' -OutFile 'update.zip'"
)

if not exist update.zip (
    echo [ERROR] Download failed. Please check your internet connection.
    pause
    exit /b
)

echo.
echo Extracting files...
powershell -Command "Expand-Archive -Path 'update.zip' -DestinationPath 'temp_update' -Force"

echo Updating application files...
xcopy /E /Y "temp_update\tiktok-rose-counter-main\*" "."

echo Cleaning up...
del update.zip
rmdir /S /Q temp_update

echo.
echo Installing any new dependencies...
call npm install

echo.
echo ---------------------------------------------------
echo Update Complete!
echo You can now run 'setup.bat' or 'start.bat'.
echo ---------------------------------------------------
pause
