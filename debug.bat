@echo off
SET PATH=%~dp0node-bin;%PATH%
echo ---------------------------------------------------
echo 🐛 Debug Mode - TikTok Rose Counter
echo ---------------------------------------------------
echo.
echo Starting server...
node server.js
echo.
echo ---------------------------------------------------
echo Server stopped or crashed. See error message above.
echo ---------------------------------------------------
pause
