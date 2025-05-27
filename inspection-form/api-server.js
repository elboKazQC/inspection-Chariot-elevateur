// Serveur API - Port 3000
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
const PORT = 3000; // Port fixe pour l'API

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

// Route de test de l'API
app.get('/api/test', (req, res) => {
    res.json({ message: 'API Server is running on port 3000', timestamp: new Date().toISOString() });
});

// Route pour sauvegarder les données d'inspection
app.post('/api/save', async (req, res) => {
    try {
        const inspectionData = req.body;
        console.log('Données reçues:', JSON.stringify(inspectionData, null, 2));

        // Validation des données
        if (!inspectionData || typeof inspectionData !== 'object') {
            return res.status(400).json({ 
                success: false, 
                error: 'Données d\'inspection invalides' 
            });
        }

        // Générer le PDF
        const pdfBuffer = await generatePDF(inspectionData);
        
        // Créer le nom de fichier
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0];
        const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
        const truckNumber = inspectionData.truckNumber || 'Unknown';
        const operator = inspectionData.operator || 'Unknown';
        
        const fileName = `Inspection_${truckNumber}_${operator}_${dateStr}_${timeStr}.pdf`;
        
        // Vérifier et créer les dossiers si nécessaire
        await ensureDirectoryExists(SAVE_PATH);
        await ensureDirectoryExists(FALLBACK_PATH);
        
        const primaryPath = path.join(SAVE_PATH, fileName);
        const fallbackPath = path.join(FALLBACK_PATH, fileName);
        
        // Sauvegarder dans le dossier principal
        try {
            await fs.writeFile(primaryPath, pdfBuffer);
            console.log(`PDF sauvegardé dans: ${primaryPath}`);
        } catch (primaryError) {
            console.warn('Erreur sauvegarde principale:', primaryError.message);
            // Sauvegarder dans le dossier de fallback
            await fs.writeFile(fallbackPath, pdfBuffer);
            console.log(`PDF sauvegardé dans le dossier de secours: ${fallbackPath}`);
        }
        
        // Sauvegarder aussi dans le fallback pour sécurité
        try {
            await fs.writeFile(fallbackPath, pdfBuffer);
            console.log(`Copie de sécurité sauvegardée: ${fallbackPath}`);
        } catch (fallbackError) {
            console.warn('Erreur sauvegarde de sécurité:', fallbackError.message);
        }

        // Vérifier s'il y a des problèmes critiques et envoyer une alerte email
        const hasProblems = checkForCriticalIssues(inspectionData);
        if (hasProblems) {
            try {
                await sendInspectionAlert(inspectionData, fileName);
                console.log('Email d\'alerte envoyé avec succès');
            } catch (emailError) {
                console.error('Erreur envoi email:', emailError.message);
                // Ne pas faire échouer la sauvegarde si l'email échoue
            }
        }
        
        res.json({ 
            success: true, 
            message: 'Inspection sauvegardée avec succès',
            fileName: fileName,
            hasAlerts: hasProblems
        });
        
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur interne du serveur',
            details: error.message 
        });
    }
});

// Fonction pour vérifier les problèmes critiques
function checkForCriticalIssues(data) {
    const criticalSections = ['visualInspection', 'operationalInspection'];
    
    for (const sectionName of criticalSections) {
        const section = data[sectionName];
        if (section && typeof section === 'object') {
            for (const [subsectionKey, subsection] of Object.entries(section)) {
                if (subsection && subsection.items && Array.isArray(subsection.items)) {
                    for (const item of subsection.items) {
                        if (item.isOk === 'notOk') {
                            return true;
                        }
                    }
                }
            }
        }
    }
    return false;
}

// Fonction pour s'assurer que le dossier existe
async function ensureDirectoryExists(dirPath) {
    try {
        await fs.access(dirPath);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.mkdir(dirPath, { recursive: true });
            console.log(`Dossier créé: ${dirPath}`);
        } else {
            throw error;
        }
    }
}

// Route de diagnostic
app.get('/diagnostic', (req, res) => {
    const networkInfo = {};
    Object.keys(networkInterfaces).forEach(interfaceName => {
        const networkInterface = networkInterfaces[interfaceName];
        networkInterface.forEach(network => {
            if (network.family === 'IPv4' && !network.internal) {
                networkInfo[interfaceName] = network.address;
            }
        });
    });
    
    res.json({
        port: PORT,
        networkInterfaces: networkInfo,
        savePath: SAVE_PATH,
        fallbackPath: FALLBACK_PATH,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur API démarré sur le port ${PORT}`);
    console.log('Adresses IP disponibles:');
    
    Object.keys(networkInterfaces).forEach(interfaceName => {
        const networkInterface = networkInterfaces[interfaceName];
        networkInterface.forEach(network => {
            if (network.family === 'IPv4' && !network.internal) {
                console.log(`  http://${network.address}:${PORT}`);
            }
        });
    });
    
    console.log(`API disponible sur: http://localhost:${PORT}/api/test`);
});
