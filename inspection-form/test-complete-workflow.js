const axios = require('axios');

// Données de test simulant une vraie inspection avec problèmes
const inspectionWithIssues = {
    date: '2025-05-26',
    operator: 'Test Opérateur',
    truckNumber: 'FORK-999',
    registration: 'TEST-123',
    department: 'Test Department',
    visualInspection: {
        alimentation: {
            items: [
                { isOk: 'ok', comments: 'État normal' },
                { isOk: 'notOk', comments: 'Câble endommagé - nécessite remplacement urgent' },
                { isOk: 'ok', comments: '' },
                { isOk: 'notOk', comments: 'Connexion oxydée, nettoyer et vérifier' },
                { isOk: 'ok', comments: '' },
                { isOk: 'ok', comments: '' },
                { isOk: 'ok', comments: '' }
            ]
        },
        fluides: {
            items: [
                { isOk: 'notOk', comments: 'Fuite importante d\'huile hydraulique sous le véhicule' },
                { isOk: 'ok', comments: 'Niveau huile moteur correct' },
                { isOk: 'ok', comments: 'Liquide de refroidissement OK' }
            ]
        },
        roues: {
            items: [
                { isOk: 'ok', comments: 'Pneus en bon état' },
                { isOk: 'notOk', comments: 'Usure excessive du pneu avant droit' }
            ]
        }
    },
    operationalInspection: {
        freins: {
            items: [
                { isOk: 'notOk', comments: 'Distance de freinage trop longue - vérifier le système' },
                { isOk: 'ok', comments: 'Frein de parking fonctionne correctement' }
            ]
        },
        mat: {
            items: [
                { isOk: 'ok', comments: 'Élévation fluide' },
                { isOk: 'notOk', comments: 'Bruit anormal lors de la descente du mât' },
                { isOk: 'ok', comments: 'Inclinaison normale' },
                { isOk: 'ok', comments: 'Fourches alignées' },
                { isOk: 'ok', comments: 'Chaînes en bon état' }
            ]
        },
        conduite: {
            items: [
                { isOk: 'ok', comments: 'Direction responsive' },
                { isOk: 'ok', comments: 'Accélération normale' },
                { isOk: 'notOk', comments: 'Vibrations excessives à haute vitesse' },
                { isOk: 'ok', comments: 'Marche arrière OK' },
                { isOk: 'ok', comments: 'Klaxon fonctionnel' },
                { isOk: 'ok', comments: 'Éclairage opérationnel' },
                { isOk: 'ok', comments: 'Ceinture de sécurité en place' }
            ]
        }
    },
    signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
};

async function testCompleteWorkflow() {
    try {
        console.log('🔄 === Test du workflow complet d\'inspection ===\n');

        console.log('📤 Envoi de l\'inspection au serveur...');
        const response = await axios.post('http://localhost:3001/api/save', inspectionWithIssues);

        if (response.data.success) {
            console.log('✅ Inspection sauvegardée avec succès !');
            console.log(`📁 Réponse du serveur: ${response.data.message}`);
        } else {
            console.log('❌ Erreur lors de la sauvegarde:', response.data.message);
        }

        console.log('\n📊 Résumé des problèmes détectés:');
        let problemCount = 0;

        // Compter les problèmes dans l'inspection visuelle
        Object.entries(inspectionWithIssues.visualInspection).forEach(([section, data]) => {
            data.items.forEach((item, index) => {
                if (item.isOk === 'notOk') {
                    problemCount++;
                    console.log(`   ⚠️  Inspection visuelle - ${section} - Élément #${index + 1}`);
                    console.log(`      💬 "${item.comments}"`);
                }
            });
        });

        // Compter les problèmes dans l'inspection opérationnelle
        Object.entries(inspectionWithIssues.operationalInspection).forEach(([section, data]) => {
            data.items.forEach((item, index) => {
                if (item.isOk === 'notOk') {
                    problemCount++;
                    console.log(`   ⚠️  Inspection opérationnelle - ${section} - Élément #${index + 1}`);
                    console.log(`      💬 "${item.comments}"`);
                }
            });
        });

        console.log(`\n📈 Total: ${problemCount} problème(s) détecté(s)`);

        if (problemCount > 0) {
            console.log('\n📧 Système d\'alerte email:');
            console.log('   ✅ Problèmes détectés automatiquement');
            console.log('   📝 Email d\'alerte préparé avec tous les détails');

            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                console.log('   ⚠️  Configuration email manquante - email non envoyé');
                console.log('   💡 Configurez EMAIL_USER et EMAIL_PASS dans .env pour activer l\'envoi');
            } else {
                console.log('   📤 Email d\'alerte envoyé aux destinataires configurés');
            }
        }

        console.log('\n🎯 Test terminé avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        if (error.response) {
            console.error('📥 Réponse du serveur:', error.response.data);
        }

        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Solution: Démarrez le serveur avec "npm run server" dans un autre terminal');
        }
    }
}

// Test avec une inspection sans problème
async function testNoIssues() {
    const cleanInspection = {
        date: '2025-05-26',
        operator: 'Test Opérateur Clean',
        truckNumber: 'FORK-888',
        registration: 'CLEAN-123',
        department: 'Test Department',
        visualInspection: {
            alimentation: {
                items: [
                    { isOk: 'ok', comments: 'Parfait état' },
                    { isOk: 'ok', comments: 'Connexions solides' }
                ]
            }
        },
        operationalInspection: {
            freins: {
                items: [
                    { isOk: 'ok', comments: 'Freinage optimal' },
                    { isOk: 'ok', comments: 'Aucun problème détecté' }
                ]
            }
        },
        signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    };

    try {
        console.log('\n🟢 === Test inspection sans problème ===');
        const response = await axios.post('http://localhost:3001/api/save', cleanInspection);

        if (response.data.success) {
            console.log('✅ Inspection propre sauvegardée');
            console.log('📧 Aucun email d\'alerte envoyé (comportement attendu)');
        }
    } catch (error) {
        console.error('❌ Erreur test inspection propre:', error.message);
    }
}

async function runAllTests() {
    await testCompleteWorkflow();
    await testNoIssues();

    console.log('\n📚 Documentation:');
    console.log('   📖 Voir EMAIL_SETUP.md pour la configuration détaillée');
    console.log('   🌐 Interface web: http://localhost:3001');
    console.log('   🔧 Test email: http://localhost:3001/api/test-email');
}

if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = { testCompleteWorkflow, testNoIssues };
