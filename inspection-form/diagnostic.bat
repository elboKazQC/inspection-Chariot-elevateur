Launching diagnostic tool for forklift inspection app...
Write-Host '===== NETWORK INFORMATION =====' -ForegroundColor Green
Write-Host 'Your IP Addresses:' -ForegroundColor Yellow
ipconfig | Select-String IPv4
Write-Host
You can access the app from another device using:
http://YOUR-IP-ADDRESS:3000

Write-Host 'Press any key to launch the app server...'
 = System.Management.Automation.Internal.Host.InternalHost.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')

Write-Host 'Starting the server...'
node server.js
