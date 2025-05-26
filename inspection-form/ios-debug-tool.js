// Outil de diagnostic pour les problèmes de "string mismatch" sur iOS
// Ce script analyse les données envoyées par iOS et identifie les problèmes potentiels

const express = require('express');
const fs = require('fs').promises;
const path = require('path');

// Middleware pour capturer et analyser les requêtes iOS
function createIOSDebugMiddleware() {
    return (req, res, next) => {
        const isIOS = /iPad|iPhone|iPod/.test(req.get('User-Agent') || '');
        
        if (isIOS && req.method === 'POST' && req.url === '/api/save') {
            console.log('\n🔍 === DIAGNOSTIC iOS STRING MISMATCH ===');
            console.log('📱 Device:', req.get('User-Agent'));
            console.log('🕐 Timestamp:', new Date().toISOString());
            console.log('📡 Protocol:', req.protocol);
            console.log('🔐 Secure:', req.secure);
            
            // Capturer les données brutes
            let rawBody = '';
            req.on('data', chunk => {
                rawBody += chunk.toString();
            });
            
            req.on('end', () => {
                console.log('\n📊 === ANALYSE DES DONNÉES REÇUES ===');
                console.log('📏 Taille raw body:', rawBody.length, 'caractères');
                console.log('🔤 Premiers 200 caractères:', rawBody.substring(0, 200));
                
                try {
                    const parsed = JSON.parse(rawBody);
                    console.log('✅ JSON valide parsé');
                    
                    // Analyse détaillée des champs problématiques
                    analyzeIOSDataIssues(parsed);
                    
                } catch (parseError) {
                    console.error('❌ ERREUR DE PARSING JSON (iOS String Mismatch détectée!)');
                    console.error('💥 Erreur:', parseError.message);
                    console.error('📄 Position erreur:', parseError.toString());
                    
                    // Analyse des caractères problématiques
                    analyzeStringMismatch(rawBody);
                }
                
                console.log('\n🔍 === FIN DIAGNOSTIC ===\n');
            });
        }
        
        next();
    };
}

function analyzeIOSDataIssues(data) {
    console.log('\n🔍 === ANALYSE DÉTAILLÉE DES CHAMPS ===');
    
    // Vérifier les champs texte
    const textFields = ['date', 'operator', 'truckNumber', 'registration', 'department'];
    textFields.forEach(field => {
        if (data[field]) {
            const value = data[field];
            const hasSpecialChars = /[^\x20-\x7E]/.test(value);
            const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(value);
            
            console.log(`📝 ${field}:`, {
                value: value,
                length: value.length,
                hasSpecialChars,
                hasEmojis,
                encoding: Buffer.from(value).toString('hex').substring(0, 20) + '...'
            });
        }
    });
    
    // Vérifier la signature
    if (data.signature) {
        const sig = data.signature;
        const isBase64 = /^data:image\/[a-zA-Z]+;base64,/.test(sig);
        console.log('✍️ Signature:', {
            isBase64,
            length: sig.length,
            prefix: sig.substring(0, 50) + '...'
        });
    }
    
    // Vérifier les sections d'inspection
    analyzeInspectionSections(data.visualInspection, 'Visual');
    analyzeInspectionSections(data.operationalInspection, 'Operational');
}

function analyzeInspectionSections(sections, type) {
    if (!sections) return;
    
    console.log(`🔍 ${type} Inspection Sections:`);
    Object.keys(sections).forEach(sectionKey => {
        const section = sections[sectionKey];
        if (section && section.items) {
            let invalidItems = 0;
            section.items.forEach((item, index) => {
                // Vérifier les valeurs invalides
                if (item.isOk && !['ok', 'notOk', null].includes(item.isOk)) {
                    invalidItems++;
                    console.log(`❌ Item ${index} invalide dans ${sectionKey}:`, item.isOk);
                }
                
                // Vérifier les commentaires avec caractères spéciaux
                if (item.comments && /[^\x20-\x7E]/.test(item.comments)) {
                    console.log(`⚠️ Commentaire avec caractères spéciaux dans ${sectionKey}[${index}]:`, item.comments);
                }
            });
            
            console.log(`  ${sectionKey}: ${section.items.length} items, ${invalidItems} invalides`);
        }
    });
}

function analyzeStringMismatch(rawBody) {
    console.log('\n🔍 === ANALYSE STRING MISMATCH ===');
    
    // Chercher des patterns problématiques
    const problematicPatterns = [
        { name: 'Guillemets doubles non échappés', pattern: /(?<!\\)"/g },
        { name: 'Retours à la ligne', pattern: /\r|\n/g },
        { name: 'Caractères de contrôle', pattern: /[\x00-\x1F\x7F]/g },
        { name: 'Caractères UTF-8 problématiques', pattern: /[^\x00-\x7F]/g },
        { name: 'Apostrophes courbes', pattern: /['']/g },
        { name: 'Guillemets courbes', pattern: /[""]/g }
    ];
    
    problematicPatterns.forEach(({ name, pattern }) => {
        const matches = rawBody.match(pattern);
        if (matches) {
            console.log(`⚠️ ${name}: ${matches.length} occurrences`);
            console.log(`   Exemples: ${matches.slice(0, 3).map(m => `"${m}" (0x${Buffer.from(m).toString('hex')})`).join(', ')}`);
        }
    });
    
    // Analyser la structure JSON
    const braceCount = (rawBody.match(/\{/g) || []).length;
    const closeBraceCount = (rawBody.match(/\}/g) || []).length;
    const bracketCount = (rawBody.match(/\[/g) || []).length;
    const closeBracketCount = (rawBody.match(/\]/g) || []).length;
    
    console.log('📐 Structure JSON:');
    console.log(`  Accolades: ${braceCount} ouvertes, ${closeBraceCount} fermées`);
    console.log(`  Crochets: ${bracketCount} ouvertes, ${closeBracketCount} fermées`);
    
    if (braceCount !== closeBraceCount || bracketCount !== closeBracketCount) {
        console.error('❌ STRUCTURE JSON DÉSÉQUILIBRÉE - Source probable du string mismatch!');
    }
}

// Fonction pour créer un endpoint de test spécialisé
function createIOSTestEndpoint(app) {
    app.post('/api/debug-ios', (req, res) => {
        console.log('\n🧪 === TEST ENDPOINT iOS ===');
        
        try {
            const data = req.body;
            console.log('✅ Données reçues et parsées correctement');
            
            // Test de re-sérialisation
            const reserialized = JSON.stringify(data);
            console.log('✅ Re-sérialisation réussie, taille:', reserialized.length);
            
            res.json({
                success: true,
                message: 'Test iOS réussi - aucun string mismatch détecté',
                dataSize: JSON.stringify(data).length,
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('❌ Erreur dans test endpoint:', error);
            res.status(500).json({
                success: false,
                error: error.message,
                type: 'iOS String Mismatch'
            });
        }
    });
}

// Export pour utilisation dans le serveur principal
module.exports = {
    createIOSDebugMiddleware,
    createIOSTestEndpoint,
    analyzeIOSDataIssues
};

// Si exécuté directement, créer un serveur de test
if (require.main === module) {
    const app = express();
    app.use(express.json({ limit: '50mb' }));
    app.use(createIOSDebugMiddleware());
    createIOSTestEndpoint(app);
    
    app.listen(3999, () => {
        console.log('🔍 Serveur de diagnostic iOS démarré sur le port 3999');
        console.log('📱 Testez avec: POST http://localhost:3999/api/debug-ios');
    });
}
