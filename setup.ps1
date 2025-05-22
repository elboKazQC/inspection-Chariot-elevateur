# Script d'installation pour Windows PowerShell

Write-Host "Configuration de l'environnement de développement..." -ForegroundColor Green

# Création du fichier .env
Write-Host "Création du fichier .env..." -ForegroundColor Yellow
$envContent = "OPENAI_API_KEY="
Set-Content -Path ".env" -Value $envContent

# Installation des dépendances
Write-Host "Installation des dépendances..." -ForegroundColor Yellow
Set-Location -Path "inspection-form"
npm install @openai/api dotenv react-markdown @types/react-markdown
npm install

Write-Host "`nInstallation terminée!" -ForegroundColor Green
Write-Host "N'oubliez pas d'ajouter votre clé API OpenAI dans le fichier .env" -ForegroundColor Yellow
Write-Host "OPENAI_API_KEY=votre-clé-api" -ForegroundColor Cyan
