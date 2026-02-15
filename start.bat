@echo off
setlocal
cd /d %~dp0

:: 1. Node.js の存在チェック
SET NODE_EXE=node
SET NPM_CMD=npm

:: ポータブル版があればそれを使用
if exist "%~dp0node-bin\node.exe" (
    SET PATH=%~dp0node-bin;%PATH%
    SET NODE_EXE=node
    SET NPM_CMD=node-bin\npm.cmd
) else (
    :: システムに Node.js があるか確認
    where node >nul 2>nul
    if %errorlevel% neq 0 (
        echo [SETUP] Node.js が見つかりません。ポータブル版を自動ダウンロードします...
        powershell -Command "$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.1/node-v20.11.1-win-x64.zip' -OutFile 'node.zip'"
        if not exist "node.zip" (
            echo [ERROR] ダウンロードに失敗しました。インターネット接続を確認してください。
            pause
            exit /b 1
        )
        echo [SETUP] 解凍しています...
        powershell -Command "Expand-Archive -Path 'node.zip' -DestinationPath 'temp_node' -Force"
        move temp_node\node-v20.11.1-win-x64 node-bin
        del node.zip
        rmdir /S /Q temp_node
        SET PATH=%~dp0node-bin;%PATH%
        SET NPM_CMD=node-bin\npm.cmd
        echo [SUCCESS] Node.js の準備が完了しました。
    )
)

:: 2. ライブラリ (node_modules) のチェック
if not exist "node_modules" (
    echo [SETUP] ライブラリをインストールしています...
    call %NPM_CMD% install express socket.io tiktok-live-connector
)

:: 3. アプリ起動
echo [INFO] TikTok Rose Counter を起動しています...
node server.js
if %errorlevel% neq 0 (
    echo [ERROR] 起動に失敗しました。
    pause
)
endlocal
