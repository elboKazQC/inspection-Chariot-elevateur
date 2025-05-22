# Script pour démarrer l'application React en mode développement avec le serveur API
# Ce script lance à la fois le serveur Express (API) et le serveur de développement React (UI)

$env:PORT = "3001"
$env:HOST = "0.0.0.0"

# Démarrer le serveur Express pour l'API en arrière-plan
Start-Process -FilePath "node" -ArgumentList "server.js" -NoNewWindow

Write-Host "Serveur API démarré sur le port 3000..."
Write-Host "Démarrage du serveur de développement React..."

# Afficher l'adresse IP
$networkIPs = (Get-NetIPAddress | Where-Object { $_.AddressFamily -eq 'IPv4' -and $_.PrefixOrigin -ne 'WellKnown' }).IPAddress
Write-Host "`nPour accéder à l'application depuis votre iPhone, utilisez une de ces adresses:"
foreach ($ip in $networkIPs) {
    Write-Host "  http://${ip}:3001"
}

Write-Host "`nLe proxy est configuré pour rediriger les requêtes API vers le port 3000"

# Démarrer le serveur de développement React
npm start
