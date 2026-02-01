# Script PowerShell para reiniciar o servidor

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Reiniciando Servidor WhatsApp Pro" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Parar processos na porta 3001
Write-Host "[1/4] Parando processos na porta 3001..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($processes) {
    foreach ($proc in $processes) {
        Write-Host "  Matando processo $proc" -ForegroundColor Red
        Stop-Process -Id $proc -Force -ErrorAction SilentlyContinue
    }
    Write-Host "  Processos finalizados!" -ForegroundColor Green
} else {
    Write-Host "  Nenhum processo encontrado na porta 3001" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[2/4] Aguardando 2 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "[3/4] Verificando arquivos..." -ForegroundColor Yellow
if (!(Test-Path "server\server.js")) {
    Write-Host "  ERRO: Arquivo server\server.js não encontrado!" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}
Write-Host "  Arquivo server.js encontrado!" -ForegroundColor Green

Write-Host ""
Write-Host "[4/4] Iniciando servidor..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Servidor Iniciando..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Iniciar servidor em nova janela
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Servidor iniciado em nova janela!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Aguarde alguns segundos e verifique se aparece:" -ForegroundColor Yellow
Write-Host "  'POST /api/find-numbers ✨'" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione qualquer tecla para fechar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
