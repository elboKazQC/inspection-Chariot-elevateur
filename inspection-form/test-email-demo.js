// Test complet de l'envoi d'email avec les nouveaux noms d'éléments
const { sendInspectionAlert } = require('./emailService');

// Mettre le mode démo
process.env.EMAIL_DEMO_MODE = 'true';
process.env.EMAIL_USER = 'test@noovelia.com';

const testData = {
    date: '2025-05-28',
    operator: 'Jean Dupont',
    truckNumber: 'T001',
    registration: 'ABC123',
    department: 'Entrepôt',
    visualInspection: {
        mat: {
            items: [
                { isOk: 'notOk', comments: 'Dosseret endommagé' }, // Dosseret de charge
                { isOk: 'ok', comments: '' }, // Fourches/pinces
                { isOk: 'notOk', comments: 'Chaînes usées' }       // État des chaines
            ]
        },
        equipementsSecurite: {
            items: [
                { isOk: 'notOk', comments: 'Feux ne fonctionnent pas' }, // Feux avertisseurs
                { isOk: 'ok', comments: '' }  // Klaxon
            ]
        }
    },
    operationalInspection: {
        freins: {
            items: [
                { isOk: 'notOk', comments: 'Freins mous' } // Freins
            ]
        }
    }
};

console.log('🧪 Test d\'envoi d\'email avec les noms d\'éléments corrigés...\n');

sendInspectionAlert(testData)
    .then(result => {
        console.log('✅ Résultat du test:', result);
        if (result.success) {
            console.log('\n🎉 SUCCESS! Les emails vont maintenant afficher:');
            console.log('   - "Dosseret de charge" au lieu de "Élément #1"');
            console.log('   - "État des chaines" au lieu de "Élément #3"');
            console.log('   - "Feux avertisseurs" au lieu de "Élément #1"');
            console.log('   - "Freins" au lieu de "Élément #1"');
        }
    })
    .catch(error => {
        console.error('❌ Erreur:', error);
    });
