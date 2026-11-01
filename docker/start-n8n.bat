@echo off
REM start-n8n.bat
REM Starts a Cloudflare tunnel, then recreates the n8n container with the new tunnel link.
REM Requirements: Docker Desktop running, cloudflared installed.
REM Change the timezone below to your own.

set TZNAME=Asia/Kolkata
set LOGFILE=%TEMP%\cf.log

REM 1. Check that Docker is running
docker info >nul 2>&1
if errorlevel 1 (
  echo Docker is not running. Open Docker Desktop, wait until it says running, then try again.
  pause
  exit /b 1
)

REM 2. Start the tunnel in a minimized window
echo Starting tunnel...
del "%LOGFILE%" >nul 2>&1
start "cloudflared tunnel" /min cmd /c cloudflared tunnel --url http://localhost:5678 --logfile "%LOGFILE%"

REM 3. Wait until the tunnel link appears in the log
echo Waiting for the tunnel link...
set URL=
:wait
timeout /t 2 /nobreak >nul
for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "Select-String -Path $env:TEMP\cf.log -Pattern 'https://[a-z0-9-]+\.trycloudflare\.com' -AllMatches -ErrorAction SilentlyContinue | ForEach-Object { $_.Matches.Value } | Where-Object { $_ -ne 'https://api.trycloudflare.com' } | Select-Object -First 1"`) do set URL=%%i
if "%URL%"=="" goto wait

echo Tunnel link: %URL%

REM 4. Recreate n8n with the new link (your data stays in the n8n_data volume)
docker stop n8n >nul 2>&1
docker rm n8n >nul 2>&1
docker run -d --restart unless-stopped --name n8n -p 5678:5678 -e WEBHOOK_URL="%URL%/" -e GENERIC_TIMEZONE="%TZNAME%" -e TZ="%TZNAME%" -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n

REM 5. Open n8n after it has had time to start
echo Waiting 30 seconds for n8n to start...
timeout /t 30 /nobreak >nul
start http://localhost:5678

echo.
echo Done. Last step: in n8n, click Unpublish, then Publish on your workflow.
echo Keep the minimized "cloudflared tunnel" window open.
pause