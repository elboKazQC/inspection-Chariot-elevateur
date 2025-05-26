// Test spécialisé pour reproduire les erreurs de "string mismatch" sur iOS
const axios = require('axios');

// Simuler des données problématiques typiques d'iOS
const createIOSProblematicData = () => {
    return {
        date: "2025-05-26",
        operator: "Test iPhone",
        truckNumber: "iOS-TEST-123",
        registration: "REG-2025",
        department: "Test iOS",
        signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        visualInspection: {
            alimentation: {
                items: [
                    { isOk: "ok", comments: "" },
                    { isOk: "notOk", comments: "Problème d'alimentation détecté" }, // Accents français
                    { isOk: null, comments: "" },
                    { isOk: "ok", comments: "Câble OK" },
                    { isOk: "notOk", comments: "Problème avec apostrophe's" }, // Apostrophe
                    { isOk: "ok", comments: "" },
                    { isOk: "ok", comments: "" }
                ]
            },
            fluides: {
                items: [
                    { isOk: "ok", comments: "Niveau d'huile OK" }, // Apostrophe
                    { isOk: "notOk", comments: "Fuite détectée près du réservoir" },
                    { isOk: "ok", comments: "" }
                ]
            },
            roues: {
                items: [
                    { isOk: "ok", comments: "" },
                    { isOk: "ok", comments: "" }
                ]
            },
            mat: {
                items: [
                    { isOk: "ok", comments: "" },
                    { isOk: "ok", comments: "" },
                    { isOk: "ok", comments: "" },
                    { isOk: "ok", comments: "" },
                    { isOk: "ok", comments: "" }
                ]
            },
            equipementsSecurite: {
                items: [
                    { isOk: "ok", comments: "" },
                    { isOk: "ok", comments: "" },
                    { isOk: "ok", comments: "" },
                    { isOk: "ok", comments: "" },
                    { isOk: "ok", comments: "" }
                ]
            }
        },
        operationalInspection: {
            freins: {
                items: [
                    { isOk: "ok", comments: "" },
                    { isOk: "ok", comments: "" }
                ]
            },
            mat: {
                items: [
                    { isOk: "ok", comments: "" },
                    { isOk: "ok", comments: "" },
                    { isOk: "ok", comments: "" },
                    { isOk: "ok", comments: "" },
                    { isOk: "ok", comments: "" }
                ]
            },
            conduite: {
                items: [
                    { isOk: "ok", comments: "" },
                    { isOk: "ok", comments: "" },
                    { isOk: "ok", comments: "" },
                    { isOk: "ok", comments: "" },
                    { isOk: "ok", comments: "" },
                    { isOk: "ok", comments: "" },
                    { isOk: "ok", comments: "" }
                ]
            },
            fluides: {
                items: [
                    { isOk: "ok", comments: "" }
                ]
            }
        }
    };
};

// Créer des variations avec des caractères problématiques
const createProblematicVariations = () => {
    const base = createIOSProblematicData();
    
    return [
        {
            name: "Test Normal",
            data: base
        },
        {
            name: "Test Apostrophes Courbes",
            data: {
                ...base,
                operator: "Test avec apostrophe's courbe",
                visualInspection: {
                    ...base.visualInspection,
                    alimentation: {
                        items: [
                            { isOk: "notOk", comments: "Problème avec l'apostrophe courbe" },
                            ...base.visualInspection.alimentation.items.slice(1)
                        ]
                    }
                }
            }
        },
        {
            name: "Test Guillemets Courbes",
            data: {                ...base,
                operator: "Test \"guillemets courbes\"",
                visualInspection: {
                    ...base.visualInspection,
                    fluides: {
                        items: [
                            { isOk: "notOk", comments: "Commentaire avec \"guillemets\" courbes" },
                            ...base.visualInspection.fluides.items.slice(1)
                        ]
                    }
                }
            }
        },
        {
            name: "Test Caractères Spéciaux",
            data: {
                ...base,
                operator: "Test émojis 🔧⚠️",
                department: "Département spécial €ñ",
                visualInspection: {
                    ...base.visualInspection,
                    alimentation: {
                        items: [
                            { isOk: "notOk", comments: "Problème détecté ⚠️" },
                            ...base.visualInspection.alimentation.items.slice(1)
                        ]
                    }
                }
            }
        },
        {
            name: "Test Retours à la Ligne",
            data: {
                ...base,
                visualInspection: {
                    ...base.visualInspection,
                    alimentation: {
                        items: [
                            { isOk: "notOk", comments: "Problème\nsur plusieurs\nlignes" },
                            ...base.visualInspection.alimentation.items.slice(1)
                        ]
                    }
                }
            }
        },
        {
            name: "Test Valeurs Invalides",
            data: {
                ...base,
                visualInspection: {
                    ...base.visualInspection,
                    alimentation: {
                        items: [
                            { isOk: "invalid_value", comments: "Valeur isOk invalide" },
                            { isOk: true, comments: "Boolean au lieu de string" },
                            { isOk: 1, comments: "Nombre au lieu de string" },
                            ...base.visualInspection.alimentation.items.slice(3)
                        ]
                    }
                }
            }
        }
    ];
};

// Fonction de test
async function testIOSStringMismatch() {
    const baseUrl = 'https://localhost:3443';
    const variations = createProblematicVariations();
    
    console.log('🧪 === TEST iOS STRING MISMATCH ===\n');
    
    // Configuration pour accepter les certificats auto-signés
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    
    for (const variation of variations) {
        console.log(`\n🔍 Test: ${variation.name}`);
        console.log('─'.repeat(50));
        
        try {
            // Test avec endpoint de diagnostic
            console.log('📡 Test endpoint diagnostic...');
            const debugResponse = await axios.post(`${baseUrl}/api/debug-ios`, variation.data, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
                },
                timeout: 10000
            });
            
            console.log('✅ Diagnostic réussi:', debugResponse.data.message);
            
            // Test avec endpoint de sauvegarde réel
            console.log('💾 Test sauvegarde réelle...');
            const saveResponse = await axios.post(`${baseUrl}/api/save`, variation.data, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
                },
                timeout: 10000
            });
            
            console.log('✅ Sauvegarde réussie:', saveResponse.data.message);
            
        } catch (error) {
            console.error('❌ ERREUR DÉTECTÉE:');
            
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Message:', error.response.data?.message || 'Pas de message');
                console.error('Debug:', error.response.data?.debug || 'Pas de debug');
            } else if (error.request) {
                console.error('Erreur réseau:', error.message);
            } else {
                console.error('Erreur de configuration:', error.message);
            }
            
            // Si c'est une erreur de string mismatch, la capturer
            if (error.message.includes('JSON') || error.message.includes('parse') || error.message.includes('string')) {
                console.error('🚨 STRING MISMATCH DÉTECTÉ!');
            }
        }
        
        // Pause entre les tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🏁 === FIN DES TESTS ===');
}

// Exécuter si appelé directement
if (require.main === module) {
    testIOSStringMismatch().catch(console.error);
}

module.exports = {
    createIOSProblematicData,
    createProblematicVariations,
    testIOSStringMismatch
};
