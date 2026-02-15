@echo off
setlocal
cd /d %~dp0

:: ポータブル版Node.jsへのパスを通す (node-binフォルダがある場合)
if exist "%~dp0node-bin" (
    SET PATH=%~dp0node-bin;%PATH%
)

:: 依存ライブラリのチェック
if not exist "node_modules" (
    echo [SETUP] 必要なライブラリが見つかりません。初回セットアップを開始します...
    echo [SETUP] 数分かかる場合があります。このままお待ちください。
    
    :: システムのnpmか、node-bin内のnpmを使用する
    where npm >nul 2>nul
    if %errorlevel% equ 0 (
        call npm install express socket.io tiktok-live-connector
    ) else if exist "node-bin\npm.cmd" (
        call node-bin\npm.cmd install express socket.io tiktok-live-connector
    ) else (
        echo [ERROR] npm が見つかりません。Node.js をインストールするか、node-bin フォルダを確認してください。
        pause
        exit /b 1
    )

    if %errorlevel% neq 0 (
        echo [ERROR] セットアップに失敗しました。インターネット接続を確認してください。
        pause
        exit /b %errorlevel%
    )
    echo [SUCCESS] セットアップが完了しました。
)

echo [INFO] TikTok Rose Counter を起動しています...
node server.js
if %errorlevel% neq 0 (
    echo [ERROR] アプリの起動に失敗しました。
    pause
)
endlocal
