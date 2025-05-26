// Serveur HTTPS minimal pour iOS - Compatible Express 5
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const https = require('https');
const selfsigned = require('selfsigned');
const os = require('os');
const fs = require('fs').promises;
const { sendInspectionAlert } = require('./emailService');

const app = express();
const PORT = process.env.PORT || 3001;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// Configuration CORS optimisée pour iOS
const corsOptions = {
    origin: function (origin, callback) {
        // Autoriser toutes les origines pour les tests iOS
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 24 heures
};

app.use(cors(corsOptions));

// Middleware pour iOS
app.use((req, res, next) => {
    // Headers de sécurité compatibles iOS
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Headers HTTPS
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    
    next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware de diagnostic iOS intégré
app.use((req, res, next) => {
    const isIOS = /iPad|iPhone|iPod/.test(req.get('User-Agent') || '');
    
    if (isIOS && req.method === 'POST' && req.url === '/api/save') {
        console.log('\n🔍 === DIAGNOSTIC iOS STRING MISMATCH ===');
        console.log('📱 Device:', req.get('User-Agent'));
        console.log('🕐 Timestamp:', new Date().toISOString());
        console.log('📡 Protocol:', req.protocol, '| Secure:', req.secure);
        console.log('📏 Content-Length:', req.get('Content-Length'));
        console.log('🔤 Content-Type:', req.get('Content-Type'));
    }
    
    next();
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'build')));

// Routes API
app.get('/api/test', (req, res) => {
    const userAgent = req.get('User-Agent') || '';
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    
    res.json({ 
        success: true, 
        message: 'Serveur HTTPS iOS fonctionnel!',
        deviceInfo: {
            userAgent,
            isIOS,
            isSafari,
            timestamp: new Date().toISOString(),
            protocol: req.protocol,
            secure: req.secure
        }
    });
});

app.get('/api/network-info', (req, res) => {
    const networkInterfaces = os.networkInterfaces();
    const addresses = [];
    Object.keys(networkInterfaces).forEach(ifname => {
        networkInterfaces[ifname].forEach(iface => {
            if (iface.family === 'IPv4' && !iface.internal) {
                addresses.push(iface.address);
            }
        });
    });
    res.json({
        addresses,
        port: PORT,
        httpsPort: HTTPS_PORT,
        message: 'Serveur HTTPS iOS - Information réseau',
        protocol: 'HTTPS'
    });
});

app.get('/connection-info', (req, res) => {
    res.sendFile(path.join(__dirname, 'connection-info-https.html'));
});

// Endpoint de test pour iOS
app.post('/api/debug-ios', (req, res) => {
    console.log('\n🧪 === TEST ENDPOINT iOS ===');
    
    try {
        const data = req.body;
        console.log('✅ Données reçues et parsées correctement');
        console.log('📊 Taille des données:', JSON.stringify(data).length, 'caractères');
        
        // Validation basique
        const requiredFields = ['date', 'operator'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
            console.log('⚠️ Champs manquants:', missingFields.join(', '));
        }
        
        // Test de re-sérialisation
        const reserialized = JSON.stringify(data);
        console.log('✅ Re-sérialisation réussie');
        
        res.json({
            success: true,
            message: 'Test iOS réussi - aucun string mismatch détecté',
            dataSize: reserialized.length,
            missingFields,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Erreur dans test endpoint:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            type: 'iOS String Mismatch Test Error'
        });
    }
});

// Routes d'API existantes
app.post('/api/save', async (req, res) => {
    console.log('🔥 Requête de sauvegarde reçue depuis iOS (HTTPS)');
    console.log('📱 User-Agent:', req.get('User-Agent'));
    console.log('🔍 Content-Type:', req.get('Content-Type'));
    console.log('📊 Body Size:', JSON.stringify(req.body).length, 'caractères');
    
    try {
        const formData = req.body;
        
        // Validation détaillée pour iOS
        if (!formData || typeof formData !== 'object') {
            console.error('❌ iOS Erreur: Données invalides reçues');
            return res.status(400).json({ 
                success: false, 
                message: 'Données invalides reçues',
                debug: { bodyType: typeof formData, hasBody: !!formData }
            });
        }
        
        // Logging détaillé pour debug iOS
        console.log('📋 Données reçues:');
        console.log('  - Date:', formData.date);
        console.log('  - Opérateur:', formData.operator);
        console.log('  - Numéro chariot:', formData.truckNumber);
        console.log('  - Signature présente:', !!formData.signature);
        console.log('  - Visual inspection:', !!formData.visualInspection);
        console.log('  - Operational inspection:', !!formData.operationalInspection);
        
        const fileName = `inspection_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;

        // Utiliser le chemin de sauvegarde
        let SAVE_PATH = 'C:\\Users\\vcasaubon.NOOVELIA\\Noovelia\\!SST - General\\Inspection chariot élévateur\\Fiche inspection app';
        const FALLBACK_PATH = path.join(os.homedir(), 'ForkliftInspections');
        
        try {
            await fs.access(SAVE_PATH);
            console.log('✅ Chemin principal accessible');
        } catch (err) {
            console.log('📁 Utilisation du chemin alternatif:', FALLBACK_PATH);
            SAVE_PATH = FALLBACK_PATH;
        }

        const fullPath = path.join(SAVE_PATH, fileName);
        console.log('💾 Sauvegarde dans:', fullPath);
        
        // Créer le dossier si nécessaire
        await fs.mkdir(SAVE_PATH, { recursive: true });
        
        // Validation de string mismatch spécifique iOS
        try {
            const jsonString = JSON.stringify(formData, null, 2);
            console.log('✅ Sérialisation JSON réussie, taille:', jsonString.length);
            
            await fs.writeFile(fullPath, jsonString, 'utf8');
            console.log('✅ Fichier JSON sauvegardé avec succès');
        } catch (serializationError) {
            console.error('❌ Erreur de sérialisation JSON (iOS string mismatch):', serializationError);
            throw new Error(`Erreur de format de données: ${serializationError.message}`);
        }        // Génération PDF
        try {
            console.log('📄 Début de la génération du PDF...');
            const { generatePDF } = require('./pdfGenerator');
            const pdfPath = fullPath.replace(/\.json$/, '.pdf');
            
            const pdfContent = await generatePDF(formData);
            if (!pdfContent) {
                throw new Error('Le contenu du PDF est vide');
            }
            
            await fs.writeFile(pdfPath, pdfContent, 'binary');
            console.log('✅ PDF généré et sauvegardé:', pdfPath);
        } catch (pdfErr) {
            console.error('⚠️ Erreur PDF (non critique):', pdfErr.message);
            // Ne pas faire échouer la sauvegarde pour le PDF
        }

        // Vérification et envoi d'email d'alerte
        try {
            console.log('📧 Vérification des problèmes pour envoi d\'email...');
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

        console.log('🎉 Sauvegarde iOS HTTPS réussie!');
        res.json({ 
            success: true, 
            message: 'Inspection sauvegardée avec succès (HTTPS)',
            filePath: fullPath,
            debug: {
                protocol: 'HTTPS',
                userAgent: req.get('User-Agent'),
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('💥 Erreur détaillée lors de la sauvegarde iOS:', error);
        console.error('🔍 Stack trace:', error.stack);
        
        res.status(500).json({ 
            success: false, 
            message: `Erreur de sauvegarde: ${error.message}`,
            debug: {
                errorType: error.name,
                protocol: 'HTTPS',
                userAgent: req.get('User-Agent'),
                timestamp: new Date().toISOString()
            }
        });
    }
});

// Endpoint pour tester l'envoi d'emails
app.get('/api/test-email', async (req, res) => {
    try {
        console.log('📧 Test de la configuration email (HTTPS)...');

        // Créer des données de test avec des problèmes
        const testData = {
            date: new Date().toISOString().split('T')[0],
            operator: 'Test Operator iOS',
            truckNumber: 'HTTPS-TEST-123',
            registration: 'REG-HTTPS',
            department: 'Test Department HTTPS',
            visualInspection: {
                alimentation: {
                    items: [
                        { isOk: 'ok', comments: 'Bon état' },
                        { isOk: 'notOk', comments: 'Problème de connexion détecté lors du test HTTPS' },
                        { isOk: 'ok', comments: '' }
                    ]
                }
            },
            operationalInspection: {
                freins: {
                    items: [
                        { isOk: 'notOk', comments: 'Freins inefficaces - test d\'alerte email HTTPS' },
                        { isOk: 'ok', comments: '' }
                    ]
                }
            }
        };

        const emailResult = await sendInspectionAlert(testData);

        res.json({
            success: emailResult.success,
            message: 'Test email HTTPS terminé',
            details: emailResult,
            emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
            protocol: 'HTTPS'
        });
    } catch (error) {
        console.error('❌ Erreur test email HTTPS:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
            protocol: 'HTTPS'
        });
    }
});

// Route par défaut pour React - DOIT ÊTRE EN DERNIER
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Démarrage du serveur HTTPS
async function startHTTPSServer() {
    try {
        console.log('🔒 Génération du certificat SSL pour iOS...');
        
        const attrs = [{ name: 'commonName', value: 'localhost' }];
        const pems = selfsigned.generate(attrs, { 
            keySize: 2048,
            days: 365,
            algorithm: 'sha256'
        });

        const httpsOptions = {
            key: pems.private,
            cert: pems.cert
        };

        const httpsServer = https.createServer(httpsOptions, app);
        
        httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
            console.log('\n🚀 Serveur HTTPS pour iOS démarré!');
            console.log(`🔒 HTTPS: https://localhost:${HTTPS_PORT}`);
            
            // Afficher toutes les adresses IP disponibles
            const networkInterfaces = os.networkInterfaces();
            console.log('\n📱 Accès depuis iOS:');
            Object.keys(networkInterfaces).forEach(ifname => {
                networkInterfaces[ifname].forEach(iface => {
                    if (iface.family === 'IPv4' && !iface.internal) {
                        console.log(`  📱 https://${iface.address}:${HTTPS_PORT}`);
                    }
                });
            });
            
            console.log('\n🔧 Pages de diagnostic:');
            console.log(`  💻 https://localhost:${HTTPS_PORT}/connection-info`);
            console.log(`  🧪 https://localhost:${HTTPS_PORT}/api/test`);
            console.log('\n✅ Optimisé pour iPhone/iPad/iOS');
            console.log('⚠️  Acceptez le certificat auto-signé sur votre appareil iOS');
        });

        httpsServer.on('error', (error) => {
            console.error('❌ Erreur serveur HTTPS:', error);
            throw error;
        });

    } catch (error) {
        console.error('❌ Échec du démarrage HTTPS:', error);
        console.log('🔄 Tentative de démarrage HTTP de secours...');
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`⚠️ Serveur HTTP de secours sur le port ${PORT}`);
        });
    }
}

startHTTPSServer();
