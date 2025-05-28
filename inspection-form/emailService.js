const nodemailer = require('nodemailer');
const { INSPECTION_SECTIONS } = require('./constants/inspectionData');

// Configuration du transporteur d'email
// Vous devrez personnaliser ces paramètres selon votre serveur de messagerie
const createTransporter = () => {
    const isGmail = process.env.EMAIL_USER?.includes('gmail.com');

    if (isGmail) {
        // Configuration pour Gmail
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    } else {
        // Configuration pour serveur SMTP personnalisé (Noovelia/Office365)
        return nodemailer.createTransport({
            host: 'smtp.office365.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                ciphers: 'SSLv3'
            }
        });
    }
};

// Fonction pour analyser les données d'inspection et détecter les problèmes
function analyzeInspectionIssues(data) {
    const issues = [];

    // Analyser l'inspection visuelle
    if (data.visualInspection) {
        Object.entries(data.visualInspection).forEach(([sectionKey, section]) => {
            if (section.items) {
                section.items.forEach((item, index) => {
                    if (item.isOk === 'notOk') {
                        // Récupérer le nom réel de l'élément depuis les données de référence
                        const sectionData = INSPECTION_SECTIONS.visualInspection[sectionKey];
                        const elementName = sectionData && sectionData.items[index] 
                            ? sectionData.items[index].name 
                            : `Élément #${index + 1}`;

                        issues.push({
                            type: 'Inspection visuelle',
                            section: sectionKey,
                            itemIndex: index + 1,
                            elementName: elementName,
                            comments: item.comments || 'Aucun commentaire'
                        });
                    }
                });
            }
        });
    }

    // Analyser l'inspection opérationnelle
    if (data.operationalInspection) {
        Object.entries(data.operationalInspection).forEach(([sectionKey, section]) => {
            if (section.items) {
                section.items.forEach((item, index) => {
                    if (item.isOk === 'notOk') {
                        // Récupérer le nom réel de l'élément depuis les données de référence
                        const sectionData = INSPECTION_SECTIONS.operationalInspection[sectionKey];
                        const elementName = sectionData && sectionData.items[index] 
                            ? sectionData.items[index].name 
                            : `Élément #${index + 1}`;

                        issues.push({
                            type: 'Inspection opérationnelle',
                            section: sectionKey,
                            itemIndex: index + 1,
                            elementName: elementName,
                            comments: item.comments || 'Aucun commentaire'
                        });
                    }
                });
            }
        });
    }

    return issues;
}

// Fonction pour créer le contenu HTML de l'email
function createEmailContent(data, issues) {
    const date = data.date || new Date().toLocaleDateString('fr-CA');
    const operator = data.operator || 'Non spécifié';
    const truckNumber = data.truckNumber || 'Non spécifié';
    const registration = data.registration || 'Non spécifié';
    const department = data.department || 'Non spécifié';

    let html = `
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 10px;">
                🚨 ALERTE - Problèmes détectés lors de l'inspection
            </h2>

            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1976d2;">Informations de l'inspection</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 5px 0; font-weight: bold;">Date:</td>
                        <td style="padding: 5px 0;">${date}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; font-weight: bold;">Opérateur:</td>
                        <td style="padding: 5px 0;">${operator}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; font-weight: bold;">Chariot #:</td>
                        <td style="padding: 5px 0;">${truckNumber}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; font-weight: bold;">Immatriculation:</td>
                        <td style="padding: 5px 0;">${registration}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 0; font-weight: bold;">Département:</td>
                        <td style="padding: 5px 0;">${department}</td>
                    </tr>
                </table>
            </div>

            <h3 style="color: #d32f2f;">⚠️ Problèmes détectés (${issues.length})</h3>

            <div style="background-color: #ffebee; border-left: 4px solid #d32f2f; padding: 15px; margin: 15px 0;">
    `;    issues.forEach((issue, index) => {
        html += `
            <div style="margin-bottom: 15px; padding: 10px; background-color: white; border-radius: 3px;">
                <h4 style="margin: 0 0 5px 0; color: #d32f2f;">Problème ${index + 1}</h4>
                <p style="margin: 5px 0;"><strong>Type:</strong> ${issue.type}</p>
                <p style="margin: 5px 0;"><strong>Section:</strong> ${issue.section}</p>
                <p style="margin: 5px 0;"><strong>Élément:</strong> ${issue.elementName}</p>
                <p style="margin: 5px 0;"><strong>Commentaires:</strong> ${issue.comments}</p>
            </div>
        `;
    });

    html += `
            </div>

            <div style="margin-top: 30px; padding: 15px; background-color: #fff3e0; border-radius: 5px;">
                <p style="margin: 0; font-weight: bold; color: #f57c00;">
                    📋 Action requise: Veuillez examiner ces problèmes et prendre les mesures correctives nécessaires.
                </p>
            </div>

            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
                <p>Cet email a été généré automatiquement par le système d'inspection des chariots élévateurs Noovelia.</p>
                <p>Généré le ${new Date().toLocaleDateString('fr-CA')} à ${new Date().toLocaleTimeString('fr-CA')}</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return html;
}

// Fonction principale pour envoyer l'email d'alerte
async function sendInspectionAlert(data) {
    try {
        // Analyser les problèmes
        const issues = analyzeInspectionIssues(data);

        // Si aucun problème détecté, pas besoin d'envoyer d'email
        if (issues.length === 0) {
            console.log('✅ Aucun problème détecté dans l\'inspection - pas d\'email envoyé');
            return { success: true, message: 'Aucun problème détecté' };
        }

        console.log(`⚠️  ${issues.length} problème(s) détecté(s) - préparation de l'email d'alerte`);
        // Vérifier que les variables d'environnement sont configurées
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('⚠️  Variables d\'environnement EMAIL_USER et EMAIL_PASS non configurées');
            return {
                success: false,
                message: 'Configuration email manquante',
                issues: issues.length
            };
        }

        // Mode démo : simuler l'envoi sans vraiment envoyer
        if (process.env.EMAIL_DEMO_MODE === 'true') {
            console.log('🎭 MODE DÉMO : Simulation d\'envoi d\'email');
            console.log(`📧 De : ${process.env.EMAIL_USER}`);
            console.log(`📧 Vers : ${process.env.EMAIL_RECIPIENTS || process.env.EMAIL_USER}`);
            if (process.env.EMAIL_CC) {
                console.log(`📧 CC : ${process.env.EMAIL_CC}`);
            }
            console.log(`📋 Sujet : 🚨 ALERTE INSPECTION - ${issues.length} problème(s) détecté(s) - Chariot ${data.truckNumber || 'N/A'}`);
            console.log(`📝 Contenu : Email HTML généré avec ${issues.length} problème(s) détaillé(s)`);            // Afficher les détails des problèmes en mode démo
            console.log('📋 Problèmes détectés :');
            issues.forEach((issue, index) => {
                console.log(`   ${index + 1}. ${issue.type} - ${issue.section} - ${issue.elementName}`);
                console.log(`      💬 "${issue.comments}"`);
            });

            return {
                success: true,
                message: 'Email simulé en mode démo',
                issues: issues.length,
                demo: true,
                messageId: 'demo-' + Date.now()
            };
        }

        // Créer le transporteur
        const transporter = createTransporter();

        // Préparer le contenu de l'email
        const htmlContent = createEmailContent(data, issues);
        const subject = `🚨 ALERTE INSPECTION - ${issues.length} problème(s) détecté(s) - Chariot ${data.truckNumber || 'N/A'}`;

        // Configuration de l'email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_RECIPIENTS || process.env.EMAIL_USER, // Par défaut, s'envoie à soi-même
            cc: process.env.EMAIL_CC, // Optionnel
            subject: subject,
            html: htmlContent
        };

        // Envoyer l'email
        const result = await transporter.sendMail(mailOptions);

        console.log('✅ Email d\'alerte envoyé avec succès:', result.messageId);
        return {
            success: true,
            message: 'Email d\'alerte envoyé',
            issues: issues.length,
            messageId: result.messageId
        };

    } catch (error) {
        console.error('❌ Erreur lors de l\'envoi de l\'email d\'alerte:', error);
        return {
            success: false,
            message: `Erreur envoi email: ${error.message}`,
            error: error.message
        };
    }
}

module.exports = {
    sendInspectionAlert,
    analyzeInspectionIssues
};
