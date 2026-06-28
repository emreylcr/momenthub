@echo off
setlocal
echo MomentHub - Render Deploy Script
echo.

if "%RENDER_API_KEY%"=="" (
  echo HATA: RENDER_API_KEY tanimli degil.
  echo Render Dashboard -^> Account Settings -^> API Keys -^> Create
  echo Sonra: set RENDER_API_KEY=rin_...
  exit /b 1
)

where render >nul 2>&1
if errorlevel 1 (
  echo Render CLI bulunamadi. Yukleniyor...
  powershell -Command "Invoke-WebRequest -Uri 'https://github.com/render-oss/cli/releases/download/v1.1.0/cli_1.1.0_windows_amd64.zip' -OutFile render-cli.zip; Expand-Archive render-cli.zip -DestinationPath render-cli -Force"
  set PATH=%CD%\render-cli;%PATH%
)

if "%GITHUB_REPO%"=="" (
  echo HATA: GITHUB_REPO tanimli degil.
  echo Ornek: set GITHUB_REPO=https://github.com/kullanici/momenthub
  exit /b 1
)

set CI=true
render blueprint launch render.yaml --repo %GITHUB_REPO% --branch main --confirm

echo.
echo Deploy baslatildi. Render dashboard uzerinden takip et.
endlocal
