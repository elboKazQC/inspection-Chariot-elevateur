// Charger les variables d'environnement
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const os = require('os');
const { generatePDF } = require('./pdfGenerator');
const { sendInspectionAlert } = require('./emailService');
const networkInterfaces = os.networkInterfaces();

const app = express();
const PORT = process.env.PORT || 3000;

// Chemin principal - Dossier réseau
let SAVE_PATH = 'C:\\Users\\SWARM\\Noovelia\\SST (SST) - Documents\\General\\Inspection chariot élévateur\\Fiche inspection app';
// Fallback - Documents locaux
const FALLBACK_PATH = path.join(os.homedir(), 'Documents', 'ForkliftInspections');

// Configuration CORS spécifique pour iOS
app.use(cors({
    origin: true, // Accepter toutes les origines pour les tests
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200 // Support pour les navigateurs plus anciens
}));

app.use(express.json({ limit: '50mb' })); // Augmenter la limite pour les signatures/images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware pour ajouter des en-têtes spécifiques à iOS
app.use((req, res, next) => {
    // Autoriser l'accès depuis les navigateurs iOS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // En-têtes pour améliorer la compatibilité iOS
    res.header('X-Frame-Options', 'SAMEORIGIN');
    res.header('X-Content-Type-Options', 'nosniff');
    
    // Pour gérer les requêtes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(express.static('build'));

app.post('/api/save', async (req, res) => {
    console.log('Requête de sauvegarde reçue');
    try {
        const formData = req.body;
        const fileName = `inspection_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;

        // Essayer d'abord le chemin principal
        try {
            await fs.access(SAVE_PATH);
        } catch (err) {
            console.log('Chemin principal inaccessible, utilisation du chemin alternatif:', FALLBACK_PATH);
            SAVE_PATH = FALLBACK_PATH;
        }

        const fullPath = path.join(SAVE_PATH, fileName);
        console.log('Sauvegarde dans:', fullPath);        // Ensure the destination folder exists before writing
        await fs.mkdir(SAVE_PATH, { recursive: true });
        await fs.writeFile(fullPath, JSON.stringify(formData, null, 2), 'utf8');        // Write a PDF summary alongside the JSON file
        try {
            console.log('Début de la génération du PDF');
            const pdfPath = fullPath.replace(/\.json$/, '.pdf');
            console.log('Chemin du PDF:', pdfPath);
            console.log('Données du formulaire:', JSON.stringify(formData, null, 2));
            const pdfContent = await generatePDF(formData); console.log('PDF généré avec succès, contenu de taille:', pdfContent ? pdfContent.length : 'null');

            if (!pdfContent) {
                throw new Error('Le contenu du PDF est vide ou invalide');
            }

            await fs.writeFile(pdfPath, pdfContent, 'binary');
            console.log('PDF écrit sur disque avec succès:', pdfPath);
        } catch (pdfErr) {
            console.error('Erreur détaillée lors de la création du PDF:', pdfErr);
            console.error('Stack trace:', pdfErr.stack);
        }

        // Vérifier s'il y a des problèmes et envoyer un email d'alerte si nécessaire
        try {
            console.log('Vérification des problèmes dans l\'inspection...');
            const emailResult = await sendInspectionAlert(formData);

            if (emailResult.success && emailResult.issues > 0) {
                console.log(`✅ Email d'alerte envoyé avec succès pour ${emailResult.issues} problème(s)`);
            } else if (emailResult.issues === 0) {
                console.log('✅ Aucun problème détecté - pas d\'email envoyé');
            } else {
                console.warn('⚠️  Échec de l\'envoi de l\'email d\'alerte:', emailResult.message);
            }
        } catch (emailErr) {
            console.error('❌ Erreur lors de l\'envoi de l\'email d\'alerte:', emailErr);
            // Ne pas faire échouer la sauvegarde si l'email échoue
        }

        console.log('Fichier sauvegardé avec succès');
        res.json({ success: true, message: 'Fichier sauvegardé avec succès' });
    } catch (error) {
        console.error('Erreur détaillée lors de la sauvegarde:', error);
        res.status(500).json({ success: false, message: `Erreur: ${error.message}` });
    }
});

// Routes de diagnostic pour aider à la connexion
app.get('/api/network-info', (req, res) => {
    // Obtenez toutes les adresses IP
    const addresses = [];
    Object.keys(networkInterfaces).forEach(ifname => {
        networkInterfaces[ifname].forEach(iface => {
            // Filtrer les adresses IPv4 et non-internes
            if (iface.family === 'IPv4') {
                addresses.push(iface.address);
            }
        });
    });
    res.json({
        addresses,
        port: PORT,
        message: 'Ceci est votre information réseau'
    });
});

app.get('/api/test', (req, res) => {
    const userAgent = req.get('User-Agent') || '';
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    
    res.json({ 
        success: true, 
        message: 'Le serveur fonctionne correctement!',
        deviceInfo: {
            userAgent,
            isIOS,
            isSafari,
            timestamp: new Date().toISOString()
        }
    });
});

// Endpoint pour tester l'envoi d'emails
app.get('/api/test-email', async (req, res) => {
    try {
        console.log('Test de la configuration email...');

        // Créer des données de test avec des problèmes
        const testData = {
            date: new Date().toISOString().split('T')[0],
            operator: 'Test Operator',
            truckNumber: 'TEST-123',
            registration: 'REG-TEST',
            department: 'Test Department',
            visualInspection: {
                alimentation: {
                    items: [
                        { isOk: 'ok', comments: 'Bon état' },
                        { isOk: 'notOk', comments: 'Problème de connexion détecté lors du test' },
                        { isOk: 'ok', comments: '' }
                    ]
                }
            },
            operationalInspection: {
                freins: {
                    items: [
                        { isOk: 'notOk', comments: 'Freins inefficaces - test d\'alerte email' },
                        { isOk: 'ok', comments: '' }
                    ]
                }
            }
        };

        const emailResult = await sendInspectionAlert(testData);

        res.json({
            success: emailResult.success,
            message: 'Test email terminé',
            details: emailResult,
            emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
        });
    } catch (error) {
        console.error('Erreur test email:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
        });
    }
});

// Endpoint to test PDF generation
app.get('/api/test-pdf', async (req, res) => {
    try {
        console.log('Testing PDF generation...');

        // Create a minimal test data structure
        const testData = {
            date: new Date().toISOString().split('T')[0],
            operator: 'Test Operator',
            truckNumber: 'TEST-123',
            visualInspection: {
                alimentation: {
                    items: [
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' }
                    ]
                },
                fluides: {
                    items: [
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' }
                    ]
                },
                roues: {
                    items: [
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' }
                    ]
                },
                mat: {
                    items: [
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' }
                    ]
                },
                equipementsSecurite: {
                    items: [
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' }
                    ]
                }
            },
            operationalInspection: {
                freins: {
                    items: [
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' }
                    ]
                },
                mat: {
                    items: [
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' }
                    ]
                },
                conduite: {
                    items: [
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' },
                        { isOk: 'ok', comments: 'Test comment' }
                    ]
                },
                fluides: {
                    items: [
                        { isOk: 'ok', comments: 'Test comment' }
                    ]
                }
            }
        };

        // Generate PDF
        const pdfBuffer = await generatePDF(testData);

        console.log(`PDF generated successfully! Size: ${pdfBuffer ? pdfBuffer.length : 'null'} bytes`);

        // Save the PDF to a file
        const testPdfPath = path.join(FALLBACK_PATH, `test_${new Date().getTime()}.pdf`);
        await fs.mkdir(FALLBACK_PATH, { recursive: true });
        await fs.writeFile(testPdfPath, pdfBuffer);

        console.log(`PDF saved to: ${testPdfPath}`);

        res.json({
            success: true,
            message: 'PDF test completed successfully!',
            pdfPath: testPdfPath,
            pdfSize: pdfBuffer ? pdfBuffer.length : 0
        });
    } catch (error) {
        console.error('Error in PDF test:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ success: false, error: error.message, stack: error.stack });
    }
});

// Page de diagnostic
app.get('/connection-info', (req, res) => {
    res.sendFile(path.join(__dirname, 'connection-info.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    const interfaces = Object.keys(networkInterfaces).map(ifname => {
        const validInterfaces = networkInterfaces[ifname].filter(iface =>
            iface.family === 'IPv4' && !iface.internal);
        return validInterfaces.map(iface => iface.address);
    }).flat();

    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`Adresses IP disponibles:`);
    interfaces.forEach(ip => {
        console.log(`  http://${ip}:${PORT}`);
    });
    console.log(`Page de diagnostic: http://localhost:${PORT}/connection-info`);
});
