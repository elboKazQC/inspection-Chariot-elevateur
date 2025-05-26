// Serveur HTTPS simple pour iOS - résout les problèmes de connexion sur iPhone/iPad
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const https = require('https');
const selfsigned = require('selfsigned');
const cors = require('cors');
const fs = require('fs').promises;
const os = require('os');
const { generatePDF } = require('./pdfGenerator');
const { sendInspectionAlert } = require('./emailService');

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

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware pour ajouter des en-têtes spécifiques à iOS avec HTTPS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('X-Frame-Options', 'SAMEORIGIN');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'build')));

// Routes API
app.post('/api/save', async (req, res) => {
    console.log('Requête de sauvegarde reçue via HTTPS');
    try {
        const formData = req.body;
        const fileName = `inspection_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;

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
            const pdfPath = fullPath.replace(/\.json$/, '.pdf');
            const pdfContent = await generatePDF(formData);
            if (pdfContent) {
                await fs.writeFile(pdfPath, pdfContent, 'binary');
                console.log('PDF écrit sur disque avec succès');
            }
        } catch (pdfErr) {
            console.error('Erreur lors de la création du PDF:', pdfErr);
        }

        // Envoyer email d'alerte si nécessaire
        try {
            const emailResult = await sendInspectionAlert(formData);
            if (emailResult.success && emailResult.issues > 0) {
                console.log(`Email d'alerte envoyé pour ${emailResult.issues} problème(s)`);
            }
        } catch (emailErr) {
            console.error('Erreur lors de l\'envoi de l\'email:', emailErr);
        }

        res.json({ success: true, message: 'Fichier sauvegardé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        res.status(500).json({ success: false, message: `Erreur: ${error.message}` });
    }
});

app.get('/api/network-info', (req, res) => {
    const networkInterfaces = os.networkInterfaces();
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

app.get('/connection-info', (req, res) => {
    res.sendFile(path.join(__dirname, 'connection-info-https.html'));
});

// Route catch-all pour l'application React
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Créer et démarrer le serveur HTTPS
async function startServer() {
    try {
        console.log('🔒 Génération des certificats SSL auto-signés...');
        
        // Générer un certificat auto-signé
        const attrs = [{ name: 'commonName', value: 'localhost' }];
        const pems = selfsigned.generate(attrs, { 
            keySize: 2048,
            days: 365,
            algorithm: 'sha256'
        });

        const options = {
            key: pems.private,
            cert: pems.cert
        };

        const httpsServer = https.createServer(options, app);
        
        httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
            const networkInterfaces = os.networkInterfaces();
            const interfaces = Object.keys(networkInterfaces).map(ifname => {
                const validInterfaces = networkInterfaces[ifname].filter(iface =>
                    iface.family === 'IPv4' && !iface.internal);
                return validInterfaces.map(iface => iface.address);
            }).flat();

            console.log(`🔒 Serveur HTTPS démarré sur le port ${HTTPS_PORT}`);
            console.log(`📱 Adresses HTTPS pour iOS:`);
            interfaces.forEach(ip => {
                console.log(`  https://${ip}:${HTTPS_PORT}`);
            });
            console.log(`🔧 Page de diagnostic: https://localhost:${HTTPS_PORT}/connection-info`);
            console.log(`\n✅ Configuration optimisée pour iOS/iPhone/iPad`);
            console.log(`⚠️  Vous devrez accepter le certificat auto-signé sur iOS`);
        });
        
        httpsServer.on('error', (error) => {
            console.error('Erreur du serveur HTTPS:', error);
            throw error;
        });
        
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
