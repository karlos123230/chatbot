@echo off
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║          🔄 REINICIANDO SERVIDOR - AGUARDE...                  ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo [1/3] Parando servidor atual...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do (
    echo       Matando processo %%a
    taskkill /F /PID %%a >nul 2>&1
)
echo       ✓ Servidor parado!

echo.
echo [2/3] Aguardando 3 segundos...
timeout /t 3 /nobreak >nul
echo       ✓ Pronto!

echo.
echo [3/3] Iniciando novo servidor...
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  Uma nova janela vai abrir com o servidor                     ║
echo ║  Aguarde ver a mensagem: "POST /api/find-numbers ✨"           ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

cd server
start "WhatsApp Server" cmd /k "npm run dev"

echo.
echo ✓ Servidor iniciado!
echo.
echo Agora:
echo   1. Aguarde 5-10 segundos
echo   2. Verifique a nova janela que abriu
echo   3. Procure por "POST /api/find-numbers ✨"
echo   4. Volte ao navegador e teste
echo.
pause
