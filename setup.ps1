# Script d'installation pour Windows PowerShell

Write-Host "Installation des dépendances..." -ForegroundColor Yellow
Set-Location -Path "inspection-form"
npm install

Write-Host "`nInstallation terminée!" -ForegroundColor Green
