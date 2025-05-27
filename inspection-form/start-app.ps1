# Script pour démarrer l'application d'inspection complète
# Ce script démarre le serveur API (port 3000) et le serveur React (port 3443)

Write-Host "=== DÉMARRAGE DE L'APPLICATION D'INSPECTION CHARIOT ÉLÉVATEUR ===" -ForegroundColor Green
Write-Host ""

# Vérifier si nous sommes dans le bon dossier
$expectedPath = "inspection-form"
if (-not (Test-Path "package.json")) {
    Write-Host "Erreur: Ce script doit être exécuté depuis le dossier inspection-form" -ForegroundColor Red
    Write-Host "Naviguez vers le dossier inspection-form et relancez le script" -ForegroundColor Yellow
    exit 1
}

Write-Host "1. Démarrage du serveur API (port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; node api-server.js"

Write-Host "2. Attente de 3 secondes..." -ForegroundColor Yellow
Start-Sleep 3

Write-Host "3. Démarrage du serveur React (port 3443)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm start"

Write-Host ""
Write-Host "=== SERVEURS EN COURS DE DÉMARRAGE ===" -ForegroundColor Green
Write-Host "Serveur API:   http://localhost:3000" -ForegroundColor Cyan
Write-Host "Application:   https://10.136.136.137:3443/" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Les utilisateurs doivent se connecter à:" -ForegroundColor Yellow
Write-Host "https://10.136.136.137:3443/" -ForegroundColor White -BackgroundColor Blue
Write-Host ""
Write-Host "Attendez que les deux serveurs soient complètement démarrés avant d'utiliser l'application." -ForegroundColor Yellow
Write-Host "Appuyez sur une touche pour fermer cette fenêtre..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
