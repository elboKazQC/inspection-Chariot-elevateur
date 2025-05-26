# Test HTTPS Server pour iOS - Compatible PowerShell 5.x
Write-Host "Test du serveur HTTPS iOS..." -ForegroundColor Cyan

# Desactiver la validation des certificats pour les tests
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

Write-Host ""
Write-Host "Test de connectivite reseau..." -ForegroundColor Yellow
$portTest = Test-NetConnection -ComputerName localhost -Port 3443 -WarningAction SilentlyContinue
if ($portTest.TcpTestSucceeded) {
    Write-Host "Port 3443 accessible" -ForegroundColor Green
} else {
    Write-Host "Port 3443 non accessible - Verifiez que le serveur est demarre" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Test API endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://localhost:3443/api/test" -TimeoutSec 10
    Write-Host "API Test: SUCCESS" -ForegroundColor Green
    Write-Host "Message: $($response.message)" -ForegroundColor Gray
    if ($response.deviceInfo) {
        Write-Host "Protocol: $($response.deviceInfo.protocol)" -ForegroundColor Gray
        Write-Host "Secure: $($response.deviceInfo.secure)" -ForegroundColor Gray
    }
} catch {
    Write-Host "API Test: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test Network Info..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://localhost:3443/api/network-info" -TimeoutSec 10
    Write-Host "Network Info: SUCCESS" -ForegroundColor Green
    if ($response.addresses) {
        Write-Host "Adresses IP disponibles:" -ForegroundColor Gray
        foreach ($addr in $response.addresses) {
            Write-Host "  https://$($addr):3443" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "Network Info: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test page de diagnostic..." -ForegroundColor Yellow
try {
    $webResponse = Invoke-WebRequest -Uri "https://localhost:3443/connection-info" -TimeoutSec 10
    if ($webResponse.StatusCode -eq 200) {
        Write-Host "Page de diagnostic: SUCCESS" -ForegroundColor Green
        Write-Host "URL: https://localhost:3443/connection-info" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Page de diagnostic: FAILED - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Instructions pour iPhone/iPad:" -ForegroundColor Magenta
Write-Host "1. Connectez iPhone au meme WiFi que ce PC" -ForegroundColor White
Write-Host "2. Ouvrez Safari" -ForegroundColor White
Write-Host "3. Allez a une de ces adresses:" -ForegroundColor White

# Recuperer les adresses IP du reseau
$networkAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -ne "127.0.0.1" -and
    $_.AddressState -eq "Preferred" -and
    $_.InterfaceAlias -notlike "*Loopback*"
} | Select-Object -ExpandProperty IPAddress

foreach ($addr in $networkAddresses) {
    Write-Host "   https://$($addr):3443" -ForegroundColor Cyan
}

Write-Host "4. Acceptez le certificat auto-signe" -ForegroundColor White
Write-Host ""
Write-Host "Tests termines!" -ForegroundColor Green
