@echo off
 for /f "delims=" %%a in ('REG QUERY "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\Samurai.exe" /v "UserDataPath" ') do (set name=%%a)
echo %name%
