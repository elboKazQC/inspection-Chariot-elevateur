const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { generatePDF } = require('./pdfGenerator');
const networkInterfaces = os.networkInterfaces();

const app = express();
const PORT = process.env.PORT || 3000;
// Chemin principal - essaie d'abord le chemin original
let SAVE_PATH = 'C:\\Users\\vcasaubon.NOOVELIA\\Noovelia\\!SST - General\\Inspection chariot élévateur\\Fiche inspection app';
// Alternative: créer un dossier dans le répertoire utilisateur courant
const FALLBACK_PATH = path.join(os.homedir(), 'ForkliftInspections');

app.use(cors());
app.use(express.json());
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
        console.log('Sauvegarde dans:', fullPath);

        // Ensure the destination folder exists before writing
        await fs.mkdir(SAVE_PATH, { recursive: true });
        await fs.writeFile(fullPath, JSON.stringify(formData, null, 2), 'utf8');

        // Write a PDF summary alongside the JSON file
        try {
            const pdfPath = fullPath.replace(/\.json$/, '.pdf');
            const pdfContent = generatePDF(formData);
            await fs.writeFile(pdfPath, pdfContent, 'binary');
            console.log('PDF créé avec succès');
        } catch (pdfErr) {
            console.error('Erreur lors de la création du PDF:', pdfErr);
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
    res.json({ success: true, message: 'Le serveur fonctionne correctement!' });
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
