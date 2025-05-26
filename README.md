# Application d'Inspection de Chariot Élévateur

Cette application web permet de remplir des formulaires d'inspection de chariot élévateur et sauvegarde les résultats dans un dossier réseau partagé.

## Fonctionnalités
- Interface utilisateur adaptée aux tablettes
- Capture de signature numérique
- Sauvegarde des données en JSON avec génération automatique de PDF
- Support optimisé pour les appareils iOS

## Configuration requise
1. Node.js (version LTS recommandée)
2. Un navigateur web moderne (Chrome, Firefox, Safari)
3. Pour les appareils iOS : Safari

## Installation

1. Ouvrir PowerShell en tant qu'administrateur
2. Exécuter la commande suivante pour autoriser l'exécution des scripts :
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Naviguer vers le dossier du projet :
   ```powershell
   cd "c:\Users\SWARM\Documents\GitHub\inspection-Chariot-elevateur\inspection-form"
   ```
4. Installer les dépendances :
   ```powershell
   npm install
   ```

If you're setting up the project in a Codex environment, use the following setup script:

```bash
cd inspection-form
bash ./setup-codex.sh
```

This script handles permission issues that may occur in the Codex environment and provides alternative ways to run tests.

## Démarrage de l'application

### Pour les appareils iOS (iPhone, iPad)
1. Ouvrir PowerShell en tant qu'administrateur
2. Exécuter les commandes suivantes :
   ```powershell
   cd "c:\Users\SWARM\Documents\GitHub\inspection-Chariot-elevateur\inspection-form"
   Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
   Start-Sleep 2
   node server-https-ios.js
   ```
3. L'application sera accessible aux adresses suivantes :
   - Localement : https://localhost:3443
   - Sur le réseau : https://[VOTRE-IP]:3443
4. Sur iOS, lors de la première connexion :
   - Accepter le certificat auto-signé
   - Autoriser l'accès à la caméra pour la signature

### Pour les autres appareils (Android, PC)
1. Ouvrir PowerShell en tant qu'administrateur
2. Exécuter les commandes suivantes :
   ```powershell
   cd "c:\Users\SWARM\Documents\GitHub\inspection-Chariot-elevateur\inspection-form"
   Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
   Start-Sleep 2
   node server.js
   ```
3. L'application sera accessible aux adresses suivantes :
   - Localement : http://localhost:3000
   - Sur le réseau : http://[VOTRE-IP]:3000

### Running tests
After installing dependencies with `setup.sh` or `setup.ps1`, you can execute the unit tests:
```bash
cd inspection-form
npm test
```

This runs `react-scripts` in non-interactive mode and reports the results in the console.

### Access from mobile devices

If your PC and phone are on the same Wi‑Fi network you can simply browse to the computer's local address. Determine the IP with `ipconfig` (Windows) or `hostname -I` (Linux/Mac) and open `http://YOUR_IP:3000` on the phone.

For convenience, a helper script prints the URL and starts the server:

```bash
./start-local.sh
```

Alternatively, you can expose the server on the internet using `ngrok`:

```bash
./start-tunnel.sh
```

The ngrok URL will work from anywhere but changes each time with the free plan. Using the local network avoids this issue and costs nothing. You may assign a static IP to your computer for a truly constant address.

## Emplacement des fichiers

Les inspections sont sauvegardées dans le dossier :
```
C:\Users\SWARM\Noovelia\SST (SST) - Documents\General\Inspection chariot élévateur\Fiche inspection app
```

Pour chaque inspection, deux fichiers sont générés :
- Un fichier JSON (données brutes)
- Un fichier PDF (rapport formaté)

## Diagnostic

### Tests rapides
- Test de connexion : https://localhost:3443/api/test
- Test PDF : https://localhost:3443/api/test-pdf
- Test Email : https://localhost:3443/api/test-email
- Page de diagnostic : https://localhost:3443/connection-info

## Dépannage

1. Si l'application ne démarre pas :
   - Vérifier que Node.js est installé
   - Vérifier que toutes les dépendances sont installées (npm install)
   - S'assurer qu'aucun autre serveur n'utilise les ports 3000 ou 3443

2. Si les fichiers ne sont pas sauvegardés au bon endroit :
   - Vérifier que le dossier de destination existe
   - Vérifier les permissions du dossier
   - Le système utilisera automatiquement un dossier de secours si le dossier principal n'est pas accessible

3. Pour les appareils iOS :
   - Utiliser Safari
   - Accepter le certificat de sécurité
   - Autoriser l'accès à la caméra pour la signature
