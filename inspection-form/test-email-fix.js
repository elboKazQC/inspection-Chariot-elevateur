// Test pour vérifier que les noms d'éléments apparaissent correctement dans les emails
const { analyzeInspectionIssues } = require('./emailService');

// Données de test simulant une inspection avec des problèmes
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

console.log('🧪 Test de l\'analyse des problèmes d\'inspection...\n');

const issues = analyzeInspectionIssues(testData);

console.log(`✅ ${issues.length} problème(s) détecté(s):\n`);

issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.type}`);
    console.log(`   Section: ${issue.section}`);
    console.log(`   Élément: ${issue.elementName} (index ${issue.itemIndex})`);
    console.log(`   Commentaires: ${issue.comments}\n`);
});

// Vérifier que les noms sont corrects
const expectedNames = [
    'Dosseret de charge',
    'État des chaines', 
    'Feux avertisseurs',
    'Freins'
];

console.log('🔍 Vérification des noms d\'éléments:');
issues.forEach((issue, index) => {
    const expected = expectedNames[index];
    const actual = issue.elementName;
    const isCorrect = actual === expected;
    
    console.log(`   ${isCorrect ? '✅' : '❌'} Attendu: "${expected}" | Trouvé: "${actual}"`);
});
