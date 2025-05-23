# Exécution des tests dans l'environnement Codex

Ce document fournit des instructions pour exécuter les tests dans l'environnement Codex qui peut avoir des restrictions d'accès réseau et des problèmes de permissions.

## Problèmes connus

1. **React-scripts non exécutable** : Dans certains environnements comme Codex, `react-scripts` peut ne pas être exécutable, ce qui bloque `npm test`.

2. **Accès réseau limité** : Après la configuration initiale, l'environnement peut ne pas avoir accès au réseau, empêchant l'installation de nouvelles dépendances.

## Solutions

### 1. Script de configuration pour Codex

Exécutez le script de configuration Codex avant de lancer les tests :

```powershell
cd inspection-form
./setup-codex.ps1
```

Ce script :
- Installe les dépendances
- Corrige les permissions sur react-scripts
- Crée un script alternatif pour exécuter les tests

### 2. Exécution des tests

Deux méthodes pour exécuter les tests :

1. **Méthode standard** :
   ```powershell
   npm test
   ```

2. **Méthode alternative** (si la standard échoue) :
   ```powershell
   npm run test:node
   ```
   ou
   ```powershell
   node test-runner.js
   ```

## Configuration préalable

Assurez-vous que tous les modules nécessaires sont installés dans votre environment.json pour Codex :

```json
{
  "dependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "react-scripts": "5.0.1"
  }
}
```

## Dépannage

Si les tests échouent, vérifiez les points suivants :

1. **Vérifiez que react-scripts est correctement installé** :
   ```powershell
   Test-Path -Path "node_modules\react-scripts\bin\react-scripts.js"
   ```

2. **Vérifiez les permissions** :
   ```powershell
   Get-Acl "node_modules\.bin\react-scripts.cmd" | Format-List
   ```

3. **Exécutez manuellement react-scripts** :
   ```powershell
   node node_modules\react-scripts\bin\react-scripts.js test --watchAll=false
   ```
