# Test HTTPS Server pour iOS - Compatible PowerShell 5.x
# Ce script teste les endpoints HTTPS avec gestion des certificats auto-signés

Write-Host "🔧 Test du serveur HTTPS iOS..." -ForegroundColor Cyan

# Désactiver la validation des certificats pour les tests
Add-Type @"
using System.Net;
using System.Security.Cryptography.X509Certificates;
public class TrustAllCertsPolicy : ICertificatePolicy {
    public bool CheckValidationResult(
        ServicePoint srvPoint, X509Certificate certificate,
        WebRequest request, int certificateProblem) {
        return true;
    }
}
"@

[System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

# Test de connectivité réseau
Write-Host "`n📡 Test de connectivité réseau..." -ForegroundColor Yellow
$portTest = Test-NetConnection -ComputerName localhost -Port 3443 -WarningAction SilentlyContinue
if ($portTest.TcpTestSucceeded) {
    Write-Host "✅ Port 3443 accessible" -ForegroundColor Green
} else {
    Write-Host "❌ Port 3443 non accessible - Vérifiez que le serveur est démarré" -ForegroundColor Red
    exit 1
}

# Test des endpoints
$endpoints = @(
    @{ Name = "API Test"; Url = "https://localhost:3443/api/test" },
    @{ Name = "Network Info"; Url = "https://localhost:3443/api/network-info" }
)

foreach ($endpoint in $endpoints) {
    Write-Host "`n🧪 Test: $($endpoint.Name)" -ForegroundColor Yellow
    Write-Host "URL: $($endpoint.Url)" -ForegroundColor Gray

    try {
        $response = Invoke-RestMethod -Uri $endpoint.Url -TimeoutSec 10
        Write-Host "✅ Succès!" -ForegroundColor Green

        if ($response.success) {
            Write-Host "   ✓ API répond correctement" -ForegroundColor Green
        }

        if ($response.deviceInfo) {
            Write-Host "   ✓ Détection d'appareil fonctionnelle" -ForegroundColor Green
            Write-Host "   Protocol: $($response.deviceInfo.protocol)" -ForegroundColor Gray
            Write-Host "   Secure: $($response.deviceInfo.secure)" -ForegroundColor Gray
        }

        if ($response.addresses) {
            Write-Host "   ✓ Adresses réseau détectées:" -ForegroundColor Green
            foreach ($addr in $response.addresses) {
                Write-Host "     📱 https://$($addr):3443" -ForegroundColor Cyan
            }
        }

    } catch {
        Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test des pages HTML
Write-Host "`n🌐 Test des pages HTML..." -ForegroundColor Yellow
try {
    $webResponse = Invoke-WebRequest -Uri "https://localhost:3443/connection-info" -TimeoutSec 10
    if ($webResponse.StatusCode -eq 200) {
        Write-Host "✅ Page de diagnostic accessible" -ForegroundColor Green
        Write-Host "   URL: https://localhost:3443/connection-info" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Page de diagnostic non accessible" -ForegroundColor Red
}

# Affichage des instructions pour iOS
Write-Host "`n📱 Instructions pour tester depuis iPhone/iPad:" -ForegroundColor Magenta
Write-Host "1. Connectez votre iPhone au même WiFi que ce PC" -ForegroundColor White
Write-Host "2. Ouvrez Safari (recommandé)" -ForegroundColor White
Write-Host "3. Utilisez une de ces adresses:" -ForegroundColor White

# Récupérer les adresses IP du réseau
$networkAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -ne "127.0.0.1" -and
    $_.AddressState -eq "Preferred" -and
    $_.InterfaceAlias -notlike "*Loopback*"
} | Select-Object -ExpandProperty IPAddress

foreach ($addr in $networkAddresses) {
    Write-Host "   📱 https://$($addr):3443" -ForegroundColor Cyan
}

Write-Host "4. Acceptez le certificat auto-signé" -ForegroundColor White
Write-Host "5. Testez l'API: https://[IP]:3443/api/test" -ForegroundColor White

Write-Host "`n🎯 Commandes PowerShell pour tester manuellement:" -ForegroundColor Magenta
Write-Host "   # Activer les certificats auto-signés" -ForegroundColor Gray
Write-Host '   [System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy' -ForegroundColor Gray
Write-Host "   # Tester l'API" -ForegroundColor Gray
Write-Host '   Invoke-RestMethod -Uri "https://localhost:3443/api/test"' -ForegroundColor Gray

Write-Host "`n✅ Tests terminés!" -ForegroundColor Green
