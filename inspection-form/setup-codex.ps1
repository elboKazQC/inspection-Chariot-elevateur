# Script de configuration pour l'environnement Codex
# Ce script résout les problèmes de permissions sur react-scripts

Write-Host "Configuration de l'environnement Codex pour les tests..." -ForegroundColor Yellow

# Installation des dépendances
npm install

# Réparer les permissions de react-scripts (différentes approches selon l'environnement)
if (Test-Path -Path "node_modules\.bin\react-scripts.cmd") {
    Write-Host "Correction des permissions sur react-scripts.cmd..." -ForegroundColor Cyan
    # Assurer que react-scripts.cmd est exécutable
    $acl = Get-Acl "node_modules\.bin\react-scripts.cmd"
    $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("Everyone", "FullControl", "Allow")
    $acl.SetAccessRule($accessRule)
    $acl | Set-Acl "node_modules\.bin\react-scripts.cmd"
}

if (Test-Path -Path "node_modules\.bin\react-scripts") {
    Write-Host "Correction des permissions sur react-scripts..." -ForegroundColor Cyan
    # Assurer que react-scripts est exécutable
    $acl = Get-Acl "node_modules\.bin\react-scripts"
    $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("Everyone", "FullControl", "Allow")
    $acl.SetAccessRule($accessRule)
    $acl | Set-Acl "node_modules\.bin\react-scripts"
}

# Vérifier que les node_modules sont bien installés
if (Test-Path -Path "node_modules\react-scripts\bin\react-scripts.js") {
    Write-Host "react-scripts est correctement installé." -ForegroundColor Green
}
else {
    Write-Host "ERREUR: react-scripts n'a pas été trouvé!" -ForegroundColor Red
    Write-Host "Tentative de réparation avec une installation ciblée..." -ForegroundColor Yellow
    npm install react-scripts --save-dev
}

# Créer un script de test alternatif qui utilise Node directement au lieu de react-scripts
@"
// test-runner.js
// Script alternatif pour exécuter les tests quand react-scripts n'est pas exécutable
const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Exécution des tests via Node.js...');
  const reactScriptsPath = path.join(__dirname, 'node_modules', 'react-scripts', 'bin', 'react-scripts.js');
  execSync(`node "${reactScriptsPath}" test --watchAll=false`, { stdio: 'inherit' });
} catch (error) {
  console.error('Erreur lors de l\'exécution des tests:', error);
  process.exit(1);
}
"@ | Out-File -FilePath "test-runner.js" -Encoding utf8

Write-Host "`nConfiguration terminée!" -ForegroundColor Green
Write-Host "Pour exécuter les tests, utilisez l'une des commandes suivantes:" -ForegroundColor Cyan
Write-Host "  npm test                - Utilise react-scripts standard" -ForegroundColor White
Write-Host "  node test-runner.js     - Utilise le script alternatif" -ForegroundColor White
