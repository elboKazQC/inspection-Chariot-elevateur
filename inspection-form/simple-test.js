// Test simple pour vérifier que les noms d'éléments sont correctement extraits
const fs = require('fs');

try {
    // Test d'import
    const { analyzeInspectionIssues } = require('./emailService');
    fs.writeFileSync('test-log.txt', 'Import réussi\n');
    
    // Données de test
    const testData = {
        visualInspection: {
            mat: {
                items: [
                    { isOk: 'notOk', comments: 'Problème avec dosseret' }
                ]
            }
        }
    };
    
    const issues = analyzeInspectionIssues(testData);
    
    fs.appendFileSync('test-log.txt', `Nombre de problèmes: ${issues.length}\n`);
    
    if (issues.length > 0) {
        const issue = issues[0];
        fs.appendFileSync('test-log.txt', `Nom de l'élément: "${issue.elementName}"\n`);
        fs.appendFileSync('test-log.txt', `Attendu: "Dosseret de charge"\n`);
        fs.appendFileSync('test-log.txt', `Test réussi: ${issue.elementName === 'Dosseret de charge'}\n`);
    }
    
    fs.appendFileSync('test-log.txt', 'Test terminé avec succès\n');
    
} catch (error) {
    fs.writeFileSync('test-log.txt', `Erreur: ${error.message}\n`);
    fs.appendFileSync('test-log.txt', `Stack: ${error.stack}\n`);
}
