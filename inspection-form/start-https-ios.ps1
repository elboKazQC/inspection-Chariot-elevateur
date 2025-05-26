#!/usr/bin/env pwsh

# Script pour démarrer le serveur HTTPS optimisé pour iOS
# Résout les problèmes de connexion iPhone/iPad

Write-Host "🔒 Démarrage du serveur HTTPS pour iOS..." -ForegroundColor Green
Write-Host ""

# Vérifier si nous sommes dans le bon répertoire
if (!(Test-Path "package.json")) {
    Write-Host "❌ Erreur: package.json non trouvé. Assurez-vous d'être dans le répertoire inspection-form" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour continuer..."
    exit 1
}

# Vérifier si les modules Node.js sont installés
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances Node.js..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
        Read-Host "Appuyez sur Entrée pour continuer..."
        exit 1
    }
}

# Vérifier si l'application React est buildée
if (!(Test-Path "build")) {
    Write-Host "🏗️ Build de l'application React..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors du build de l'application React" -ForegroundColor Red
        Read-Host "Appuyez sur Entrée pour continuer..."
        exit 1
    }
}

Write-Host ""
Write-Host "🚀 Lancement du serveur HTTPS..." -ForegroundColor Green
Write-Host ""
Write-Host "📱 INSTRUCTIONS POUR iOS:" -ForegroundColor Cyan
Write-Host "1. Assurez-vous que votre iPhone/iPad est sur le même WiFi" -ForegroundColor White
Write-Host "2. Notez les adresses HTTPS qui vont s'afficher" -ForegroundColor White
Write-Host "3. Ouvrez Safari sur votre iPhone et saisissez l'adresse HTTPS" -ForegroundColor White
Write-Host "4. Acceptez le certificat de sécurité quand iOS vous le demande" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Page de diagnostic: https://localhost:8443/connection-info" -ForegroundColor Yellow
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arrêter le serveur" -ForegroundColor Gray
Write-Host "================================================" -ForegroundColor Cyan

# Démarrer le serveur HTTPS
node server-https.js
