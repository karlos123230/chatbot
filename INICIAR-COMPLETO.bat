@echo off
echo ========================================
echo   INICIANDO PAINEL WHATSAPP COMPLETO
echo   Com Sistema de Agendamento
echo ========================================
echo.

echo [1/4] Parando processos anteriores...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Instalando dependencias do servidor...
cd server
call npm install
cd ..

echo [3/4] Instalando dependencias do cliente...
cd client
call npm install
cd ..

echo [4/4] Iniciando servidores...
echo.
echo ========================================
echo   SERVIDORES INICIADOS!
echo ========================================
echo.
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:3000
echo.
echo   Aba de Agendamento: Disponivel!
echo.
echo   Pressione Ctrl+C para parar
echo ========================================
echo.

start cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak >nul
start cmd /k "cd client && npm run dev"

echo.
echo Aguarde alguns segundos...
echo O navegador abrira automaticamente.
echo.
pause
