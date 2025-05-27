# Application d'Inspection de Chariot Élévateur

Cette application permet de réaliser des inspections digitales de chariots élévateurs avec génération automatique de rapports PDF.

## 🚀 DÉMARRAGE RAPIDE POUR LES UTILISATEURS

**URL d'accès pour les utilisateurs:** https://10.136.136.137:3443/

### Démarrage de l'application (pour les administrateurs)

1. Ouvrir PowerShell en tant qu'administrateur
2. Naviguer vers le dossier : `cd "c:\Users\SWARM\Documents\GitHub\inspection-Chariot-elevateur\inspection-form"`
3. Exécuter : `.\start-app.ps1`

Cela démarre automatiquement les deux serveurs nécessaires :
- **Serveur API** (port 3000) : Gestion des données et génération PDF
- **Interface React** (port 3443) : Interface utilisateur

## ⚠️ DÉPANNAGE DES ERREURS DE SAUVEGARDE

### Erreur "Proxy error" lors de la sauvegarde

**Cause:** Le serveur API (port 3000) n'est pas démarré ou n'est pas accessible.

**Solutions:**
1. Vérifier que les DEUX serveurs sont démarrés avec `.\start-app.ps1`
2. Si l'erreur persiste, redémarrer manuellement :
   ```powershell
   # Tuer tous les processus Node.js
   taskkill /F /IM node.exe
   
   # Redémarrer l'application
   .\start-app.ps1
   ```

### Architecture des serveurs

- **Port 3000:** Serveur API (api-server.js) - Traitement des données, PDF, emails
- **Port 3443:** Interface React (npm start) - Interface utilisateur HTTPS

**IMPORTANT:** Les deux serveurs DOIVENT être actifs pour que la sauvegarde fonctionne !

## 🔧 MODIFICATION DES DONNÉES D'INSPECTION

Pour ajouter/modifier des éléments d'inspection, il faut modifier **DEUX fichiers** :

1. **Backend (génération PDF):** `constants/inspectionData.js`
2. **Frontend (interface React):** `src/constants/inspectionData.ts`

**⚠️ ATTENTION:** Les modifications doivent être identiques dans les deux fichiers !

### Exemple d'ajout d'un élément d'inspection :

```javascript
// Dans operationalInspection > mat > items
{ name: 'Contrôle de fermeture et d\'ouverture des pinces' }
```

Après modification :
1. Redémarrer l'application avec `.\start-app.ps1`
2. Vider le cache du navigateur (Ctrl + F5)

## 📁 SAUVEGARDE DES FICHIERS

**Dossier principal :** 
`C:\Users\SWARM\Noovelia\SST (SST) - Documents\General\Inspection chariot élévateur\Fiche inspection app`

**Dossier de secours :** 
`%USERPROFILE%\Documents\ForkliftInspections`

## 📧 CONFIGURATION EMAIL

Les alertes automatiques sont configurées dans le fichier `.env`.
Voir `EMAIL_SETUP.md` pour plus de détails.

---

## Scripts de développement (Create React App)

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
