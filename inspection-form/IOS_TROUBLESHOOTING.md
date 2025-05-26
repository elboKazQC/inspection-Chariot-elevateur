# 📱 Guide de résolution des problèmes iOS

## 🚨 Problème : "iPhone n'arrive pas à se connecter sur cette version"

### ✅ Solutions mises en place

#### 1. **Serveur HTTPS optimisé pour iOS**
- Nouveau fichier `server-https.js` avec certificats SSL
- Configuration CORS spécifique pour iOS
- En-têtes de sécurité adaptés pour Safari/iOS

#### 2. **Scripts de démarrage simplifiés**
```powershell
# Option 1: Script PowerShell
.\start-https-ios.ps1

# Option 2: NPM
npm run ios
```

#### 3. **Diagnostic automatique**
```powershell
node diagnostic-ios.js
```

---

## 🔧 Instructions étape par étape

### **Étape 1: Démarrer le serveur HTTPS**
1. Ouvrir PowerShell dans le dossier `inspection-form`
2. Exécuter: `.\start-https-ios.ps1`
3. Noter les adresses HTTPS affichées (ex: `https://10.136.136.143:8443`)

### **Étape 2: Connexion depuis l'iPhone**
1. **Assurer le même WiFi** : iPhone et PC sur le même réseau
2. **Ouvrir Safari** (pas Chrome - meilleure compatibilité)
3. **Saisir l'adresse HTTPS** : `https://[adresse-ip]:8443`
4. **Accepter le certificat** :
   - iOS affichera "Connexion non privée"
   - Cliquer "Avancé" → "Continuer vers le site"

### **Étape 3: Validation**
- L'application devrait se charger correctement
- Les signatures tactiles fonctionnent
- La sauvegarde fonctionne

---

## 🐛 Dépannage spécifique

### **Problème: Page blanche sur iPhone**
- ✅ Désactiver le mode privé dans Safari
- ✅ Fermer/rouvrir Safari
- ✅ Vider le cache Safari

### **Problème: "Impossible de se connecter au serveur"**
- ✅ Vérifier que PC et iPhone sont sur le même WiFi
- ✅ Vérifier que le serveur est démarré (voir console)
- ✅ Essayer l'autre adresse IP proposée

### **Problème: Certificat refusé**
- ✅ Aller dans Réglages iOS > Général > À propos > Réglages de certificat
- ✅ Faire confiance au certificat manuellement

### **Problème: Signatures ne fonctionnent pas**
- ✅ Utiliser Safari (pas Chrome/Firefox)
- ✅ Rafraîchir la page
- ✅ Vérifier que le mode tactile est activé

---

## 📊 Pages de test

### **Test de connectivité**
- `https://[ip]:8443/api/test` - Test de base
- `https://[ip]:8443/connection-info` - Page de diagnostic complète

### **Test des fonctionnalités**
- `https://[ip]:8443/api/network-info` - Infos réseau
- `https://[ip]:8443/` - Application complète

---

## ⚡ Commandes rapides

```powershell
# Diagnostic complet
node diagnostic-ios.js

# Démarrage serveur HTTPS
npm run ios

# Test rapide
npm run server:https
```

---

## 🔍 Logs de débogage

Le serveur HTTPS affiche des informations détaillées :
- Détection automatique d'iOS dans User-Agent
- Logs spécifiques pour les requêtes iOS
- Informations sur les certificats SSL

---

## 💡 Optimisations iOS appliquées

1. **HTTPS obligatoire** - iOS préfère les connexions sécurisées
2. **CORS étendu** - Configuration permissive pour les tests
3. **En-têtes de sécurité** - Compatibilité Safari/WebKit
4. **Limite augmentée** - Support des signatures/images lourdes
5. **Gestion OPTIONS** - Requêtes preflight correctement gérées

---

## 📞 Support

Si les problèmes persistent :
1. Exécuter `node diagnostic-ios.js` et partager les résultats
2. Vérifier les logs du serveur dans la console
3. Tester depuis un autre appareil iOS pour isoler le problème
