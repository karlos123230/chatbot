@echo off
echo ========================================
echo    Reiniciando Servidor WhatsApp Pro
echo ========================================
echo.

echo [1/4] Parando processos Node.js na porta 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    echo Matando processo %%a
    taskkill /F /PID %%a 2>nul
)

echo.
echo [2/4] Aguardando 2 segundos...
timeout /t 2 /nobreak >nul

echo.
echo [3/4] Verificando arquivos...
if not exist "server\server.js" (
    echo ERRO: Arquivo server\server.js nao encontrado!
    pause
    exit /b 1
)

echo Arquivo server.js encontrado!
echo.

echo [4/4] Iniciando servidor...
echo.
echo ========================================
echo    Servidor Iniciando...
echo ========================================
echo.

cd server
start cmd /k "npm run dev"

echo.
echo ========================================
echo    Servidor iniciado em nova janela!
echo ========================================
echo.
echo Aguarde alguns segundos e verifique se aparece:
echo   "POST /api/find-numbers"
echo.
echo Pressione qualquer tecla para fechar...
pause >nul
