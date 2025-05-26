const { sendInspectionAlert, analyzeInspectionIssues } = require('./emailService');

// Données de test avec plusieurs problèmes
const testDataWithIssues = {
    date: '2025-05-26',
    operator: 'Jean Dupont',
    truckNumber: 'FORK-123',
    registration: 'ABC-456',
    department: 'Entrepôt A',
    visualInspection: {
        alimentation: {
            items: [
                { isOk: 'ok', comments: 'Bon état' },
                { isOk: 'notOk', comments: 'Connexion desserrée sur le câble principal' },
                { isOk: 'ok', comments: '' },
                { isOk: 'notOk', comments: 'Corrosion visible sur les bornes' }
            ]
        },
        fluides: {
            items: [
                { isOk: 'ok', comments: 'Niveau correct' },
                { isOk: 'notOk', comments: 'Fuite d\'huile hydraulique détectée' }
            ]
        }
    },
    operationalInspection: {
        freins: {
            items: [
                { isOk: 'notOk', comments: 'Distance de freinage trop longue' },
                { isOk: 'ok', comments: 'Frein de stationnement OK' }
            ]
        },
        conduite: {
            items: [
                { isOk: 'ok', comments: 'Direction fluide' },
                { isOk: 'ok', comments: 'Accélération normale' }
            ]
        }
    }
};

// Données de test sans problème
const testDataNoIssues = {
    date: '2025-05-26',
    operator: 'Marie Martin',
    truckNumber: 'FORK-456',
    registration: 'XYZ-789',
    department: 'Entrepôt B',
    visualInspection: {
        alimentation: {
            items: [
                { isOk: 'ok', comments: 'Parfait état' },
                { isOk: 'ok', comments: 'Connections solides' }
            ]
        }
    },
    operationalInspection: {
        freins: {
            items: [
                { isOk: 'ok', comments: 'Freinage optimal' },
                { isOk: 'ok', comments: 'Aucun problème' }
            ]
        }
    }
};

async function runTests() {
    console.log('🧪 === Test du système d\'alertes email ===\n');

    // Test 1: Analyser les problèmes
    console.log('📋 Test 1: Analyse des problèmes');
    const issuesWithProblems = analyzeInspectionIssues(testDataWithIssues);
    const issuesNoProblems = analyzeInspectionIssues(testDataNoIssues);

    console.log(`   ⚠️  Inspection avec problèmes: ${issuesWithProblems.length} problème(s) détecté(s)`);
    issuesWithProblems.forEach((issue, index) => {
        console.log(`      ${index + 1}. ${issue.type} - ${issue.section} - Élément #${issue.itemIndex}`);
        console.log(`         💬 "${issue.comments}"`);
    });

    console.log(`   ✅ Inspection sans problème: ${issuesNoProblems.length} problème(s) détecté(s)\n`);

    // Test 2: Vérifier la configuration
    console.log('⚙️  Test 2: Vérification de la configuration');
    const emailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
    console.log(`   📧 Configuration email: ${emailConfigured ? '✅ Configurée' : '❌ Manquante'}`);

    if (!emailConfigured) {
        console.log('   💡 Pour configurer les emails:');
        console.log('      1. Copiez .env.example vers .env');
        console.log('      2. Configurez EMAIL_USER et EMAIL_PASS');
        console.log('      3. Définissez EMAIL_RECIPIENTS\n');
    } else {
        console.log(`   📮 Utilisateur: ${process.env.EMAIL_USER}`);
        console.log(`   📬 Destinataires: ${process.env.EMAIL_RECIPIENTS || 'Défaut (expéditeur)'}\n`);
    }

    // Test 3: Test d'envoi (si configuré)
    if (emailConfigured) {
        console.log('📤 Test 3: Envoi d\'email de test');
        try {
            const result = await sendInspectionAlert(testDataWithIssues);
            if (result.success) {
                console.log(`   ✅ Email envoyé avec succès! (${result.issues} problème(s))`);
                console.log(`   📧 Message ID: ${result.messageId || 'N/A'}`);
            } else {
                console.log(`   ❌ Échec de l'envoi: ${result.message}`);
            }
        } catch (error) {
            console.log(`   ❌ Erreur lors du test: ${error.message}`);
        }

        console.log('\n📭 Test 4: Test sans problème (pas d\'email attendu)');
        try {
            const result = await sendInspectionAlert(testDataNoIssues);
            console.log(`   ✅ ${result.message} (${result.issues || 0} problème(s))`);
        } catch (error) {
            console.log(`   ❌ Erreur lors du test: ${error.message}`);
        }
    } else {
        console.log('⏭️  Test 3 & 4: Ignorés (configuration email manquante)');
    }

    console.log('\n🎯 === Tests terminés ===');
    console.log('💡 Pour tester en live:');
    console.log('   - Démarrez le serveur: npm run server');
    console.log('   - Visitez: http://localhost:3000/api/test-email');
    console.log('   - Ou faites une vraie inspection avec des problèmes');
}

// Exécuter les tests
if (require.main === module) {
    // Charger les variables d'environnement si le script est exécuté directement
    require('dotenv').config();
    runTests().catch(console.error);
}

module.exports = { runTests };
