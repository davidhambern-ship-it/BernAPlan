@echo off
setlocal
title BernAPlan Setup Studio
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -STA -File "%~dp0Setup-Studio.ps1"
if errorlevel 1 (
  echo.
  echo Setup Studio closed with an error. If you need help, read README-Setup-Studio.txt.
  pause
)
endlocal
