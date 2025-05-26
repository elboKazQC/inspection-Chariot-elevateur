// Serveur HTTPS pour iOS - résout les problèmes de connexion sur iPhone/iPad
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const https = require('https');
const httpsLocalhost = require('https-localhost');
const cors = require('cors');
const fs = require('fs').promises;
const os = require('os');
const { generatePDF } = require('./pdfGenerator');
const { sendInspectionAlert } = require('./emailService');
const networkInterfaces = os.networkInterfaces();

const app = express();
const PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;

// Chemin principal - essaie d'abord le chemin original
let SAVE_PATH = 'C:\\Users\\vcasaubon.NOOVELIA\\Noovelia\\!SST - General\\Inspection chariot élévateur\\Fiche inspection app';
// Alternative: créer un dossier dans le répertoire utilisateur courant
const FALLBACK_PATH = path.join(os.homedir(), 'ForkliftInspections');

// Configuration CORS spécifique pour iOS avec HTTPS
app.use(cors({
    origin: true, // Accepter toutes les origines pour les tests
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 200 // Support pour les navigateurs plus anciens
}));

app.use(express.json({ limit: '50mb' })); // Augmenter la limite pour les signatures/images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware pour ajouter des en-têtes spécifiques à iOS avec HTTPS
app.use((req, res, next) => {
    // Autoriser l'accès depuis les navigateurs iOS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // En-têtes pour améliorer la compatibilité iOS avec HTTPS
    res.header('X-Frame-Options', 'SAMEORIGIN');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      // Pour gérer les requêtes OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Copier toutes les routes de server.js
app.post('/api/save', async (req, res) => {
    console.log('Requête de sauvegarde reçue via HTTPS');
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
        console.log('Sauvegarde dans:', fullPath);
        
        await fs.mkdir(SAVE_PATH, { recursive: true });
        await fs.writeFile(fullPath, JSON.stringify(formData, null, 2), 'utf8');
        
        // Générer le PDF
        try {
            console.log('Début de la génération du PDF');
            const pdfPath = fullPath.replace(/\.json$/, '.pdf');
            console.log('Chemin du PDF:', pdfPath);
            const pdfContent = await generatePDF(formData);
            console.log('PDF généré avec succès, contenu de taille:', pdfContent ? pdfContent.length : 'null');

            if (!pdfContent) {
                throw new Error('Le contenu du PDF est vide ou invalide');
            }

            await fs.writeFile(pdfPath, pdfContent, 'binary');
            console.log('PDF écrit sur disque avec succès:', pdfPath);
        } catch (pdfErr) {
            console.error('Erreur détaillée lors de la création du PDF:', pdfErr);
        }

        // Envoyer email d'alerte si nécessaire
        try {
            const emailResult = await sendInspectionAlert(formData);
            if (emailResult.success && emailResult.issues > 0) {
                console.log(`✅ Email d'alerte envoyé avec succès pour ${emailResult.issues} problème(s)`);
            }
        } catch (emailErr) {
            console.error('❌ Erreur lors de l\'envoi de l\'email d\'alerte:', emailErr);
        }

        console.log('Fichier sauvegardé avec succès via HTTPS');
        res.json({ success: true, message: 'Fichier sauvegardé avec succès' });
    } catch (error) {
        console.error('Erreur détaillée lors de la sauvegarde:', error);
        res.status(500).json({ success: false, message: `Erreur: ${error.message}` });
    }
});

app.get('/api/network-info', (req, res) => {
    const addresses = [];
    Object.keys(networkInterfaces).forEach(ifname => {
        networkInterfaces[ifname].forEach(iface => {
            if (iface.family === 'IPv4') {
                addresses.push(iface.address);
            }
        });
    });
    res.json({
        addresses,
        port: PORT,
        httpsPort: HTTPS_PORT,
        message: 'Serveur HTTPS pour iOS - Information réseau',
        protocol: 'HTTPS'
    });
});

app.get('/api/test', (req, res) => {
    const userAgent = req.get('User-Agent') || '';
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    
    res.json({ 
        success: true, 
        message: 'Le serveur HTTPS fonctionne correctement pour iOS!',
        deviceInfo: {
            userAgent,
            isIOS,
            isSafari,
            timestamp: new Date().toISOString(),
            protocol: 'HTTPS',
            secure: true
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

// Page de diagnostic mise à jour pour HTTPS
app.get('/connection-info', (req, res) => {
    res.sendFile(path.join(__dirname, 'connection-info-https.html'));
});

// Servir les fichiers statiques React depuis le dossier build
app.use(express.static(path.join(__dirname, 'build')));

// Rediriger toutes les autres routes vers l'application React (utilisation d'un handler plus spécifique)
app.use((req, res, next) => {
    // Si ce n'est pas une route API et que le fichier n'existe pas, servir index.html
    if (!req.url.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    } else {
        next();
    }
});

// Démarrer le serveur HTTPS
async function startServer() {
    try {
        console.log('Génération des certificats HTTPS locaux...');
        
        // Utiliser https-localhost pour créer un serveur avec certificats auto-signés
        const httpsServer = await httpsLocalhost.default(HTTPS_PORT, {
            key: undefined,  // Auto-généré
            cert: undefined  // Auto-généré
        }, app);
        
        console.log('🔒 Serveur HTTPS démarré avec certificats auto-signés...');
        
        const interfaces = Object.keys(networkInterfaces).map(ifname => {
            const validInterfaces = networkInterfaces[ifname].filter(iface =>
                iface.family === 'IPv4' && !iface.internal);
            return validInterfaces.map(iface => iface.address);
        }).flat();

        console.log(`🔒 Serveur HTTPS démarré sur le port ${HTTPS_PORT}`);
        console.log(`📱 Adresses HTTPS pour iOS:`);        interfaces.forEach(ip => {
            console.log(`  https://${ip}:${HTTPS_PORT}`);
        });
        console.log(`🔧 Page de diagnostic: https://localhost:${HTTPS_PORT}/connection-info`);
        console.log(`\n✅ Configuration optimisée pour iOS/iPhone/iPad`);
        console.log(`⚠️  Vous devrez accepter le certificat auto-signé sur iOS`);
        
    } catch (error) {
        console.error('Erreur lors du démarrage du serveur HTTPS:', error);
        console.log('Retour au serveur HTTP normal...');
        
        // Fallback vers HTTP si HTTPS échoue
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`⚠️  Serveur HTTP de fallback sur le port ${PORT}`);
        });
    }
}

startServer();
