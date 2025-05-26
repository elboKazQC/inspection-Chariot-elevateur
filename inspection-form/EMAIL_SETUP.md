# Configuration des alertes email pour les inspections

## Vue d'ensemble

Le système d'inspection des chariots élévateurs peut maintenant envoyer automatiquement des emails d'alerte lorsque des problèmes sont détectés (éléments marqués comme "Non OK") lors d'une inspection.

## Configuration requise

### 1. Variables d'environnement

Créez un fichier `.env` dans le dossier `inspection-form/` en vous basant sur `.env.example` :

```bash
# Configuration email
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-application
EMAIL_RECIPIENTS=manager@noovelia.com,securite@noovelia.com
EMAIL_CC=responsable.maintenance@noovelia.com
```

### 2. Configuration Gmail (recommandée)

Si vous utilisez Gmail :

1. **Activez l'authentification à 2 facteurs** sur votre compte Google
2. **Générez un mot de passe d'application** :
   - Allez dans votre compte Google > Sécurité
   - Dans "Se connecter à Google", sélectionnez "Mots de passe des applications"
   - Générez un nouveau mot de passe pour "Mail"
   - Utilisez ce mot de passe dans `EMAIL_PASS`

### 3. Configuration SMTP personnalisée

Pour utiliser un autre serveur de messagerie, modifiez `emailService.js` :

```javascript
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: 'smtp.votre-serveur.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};
```

## Fonctionnement

### Détection automatique

Le système analyse automatiquement chaque inspection sauvegardée et :

1. **Scan tous les éléments** des inspections visuelles et opérationnelles
2. **Identifie les problèmes** (items avec `isOk: 'notOk'`)
3. **Envoie un email d'alerte** si des problèmes sont trouvés
4. **Inclut les détails** : section, élément, commentaires

### Contenu de l'email d'alerte

L'email contient :
- 📋 **Informations de l'inspection** (date, opérateur, chariot, etc.)
- ⚠️ **Liste détaillée des problèmes** détectés
- 💬 **Commentaires** associés à chaque problème
- 🕒 **Horodatage** de l'alerte

### Exemple d'email

```
Sujet: 🚨 ALERTE INSPECTION - 2 problème(s) détecté(s) - Chariot FORK-123

Informations de l'inspection:
- Date: 2025-05-26
- Opérateur: Jean Dupont
- Chariot #: FORK-123

Problèmes détectés:
1. Inspection visuelle - alimentation - Élément #2
   Commentaires: Connexion desserrée

2. Inspection opérationnelle - freins - Élément #1
   Commentaires: Freinage insuffisant
```

## Test et validation

### Test de la configuration

Accédez à `http://localhost:3000/api/test-email` pour :
- ✅ Vérifier la configuration email
- 📧 Envoyer un email de test avec des problèmes fictifs
- 🔍 Diagnostiquer les erreurs de configuration

### Test en conditions réelles

1. Remplissez une inspection de test
2. Marquez quelques éléments comme "Non OK"
3. Ajoutez des commentaires explicatifs
4. Sauvegardez l'inspection
5. Vérifiez la réception de l'email d'alerte

## Gestion des erreurs

Le système est conçu pour être robuste :

- ❌ **Si l'email échoue** : l'inspection est quand même sauvegardée
- 📝 **Logs détaillés** : tous les événements sont enregistrés dans la console
- 🔧 **Configuration manquante** : avertissement mais pas d'erreur fatale
- 🔄 **Retry automatique** : le système réessaiera lors de la prochaine inspection

## Sécurité et bonnes pratiques

### Protection des credentials

- ✅ Utilisez **des mots de passe d'application** (pas votre mot de passe principal)
- ✅ **Ne partagez jamais** le fichier `.env`
- ✅ Ajoutez `.env` au `.gitignore`
- ✅ **Rotation régulière** des mots de passe

### Gestion des destinataires

- 👥 **Multiples destinataires** : séparez par des virgules
- 📧 **Copie carbone** : utilisez `EMAIL_CC` pour les responsables
- 🎯 **Ciblage approprié** : envoyez seulement aux personnes concernées

## Dépannage

### Problèmes courants

**"Variables d'environnement manquantes"**
- Vérifiez que le fichier `.env` existe
- Confirmez que `EMAIL_USER` et `EMAIL_PASS` sont définis

**"Authentification échouée"**
- Vérifiez le mot de passe d'application Gmail
- Assurez-vous que l'authentification 2FA est activée

**"Connexion refusée"**
- Vérifiez les paramètres SMTP
- Contrôlez les pare-feux et proxies

### Logs de débogage

Consultez la console du serveur pour :
```
✅ Aucun problème détecté dans l'inspection
⚠️  2 problème(s) détecté(s) - préparation de l'email
✅ Email d'alerte envoyé avec succès
❌ Erreur lors de l'envoi de l'email d'alerte
```

## Personnalisation

### Modification du template

Éditez `emailService.js` fonction `createEmailContent()` pour :
- 🎨 **Changer le style** CSS de l'email
- 📝 **Modifier le contenu** des messages
- 🏷️ **Ajouter des informations** supplémentaires

### Critères d'alerte

Modifiez `analyzeInspectionIssues()` pour :
- 🔍 **Filtrer certains types** de problèmes
- ⚡ **Ajouter des seuils** de criticité
- 📊 **Analyser des patterns** spécifiques

## Support

Pour toute question ou problème :
1. Consultez les logs du serveur
2. Testez avec `/api/test-email`
3. Vérifiez la configuration `.env`
4. Contactez l'équipe technique Noovelia
