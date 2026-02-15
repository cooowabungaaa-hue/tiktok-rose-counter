@echo off
if "%1" == "min" goto run
start "" /min "%~nx0" min
exit

:run
cd /d %~dp0
node server.js
