const PDFDocument = require('pdfkit');
const { INSPECTION_SECTIONS } = require('./constants/inspectionData');

function cleanValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (Array.isArray(value)) return value.join(', ');
  if (value instanceof Date) return value.toLocaleDateString('fr-CA');
  return String(value);
}

/**
 * Génère un PDF professionnel d'inspection de chariot élévateur
 * @param {Object} data Les données d'inspection
 * @returns {Buffer} Le contenu du PDF en format buffer
 */
function generatePDF(data) {
  // Créer un nouveau document PDF
  const doc = new PDFDocument({
    size: 'LETTER',
    margin: 50,
    info: {
      Title: 'Rapport d\'inspection de chariot élévateur',
      Author: 'Système d\'inspection Noovelia',
      Subject: 'Inspection de sécurité',
      Keywords: 'chariot, élévateur, inspection, sécurité'
    }
  });  // Variables pour la pagination
  let pageNumber = 1;
  let isAddingPage = false;  // Flag to prevent recursive calls

  // Fonction pour ajouter un pied de page à la page courante
  function addFooter(currentPage = pageNumber) {
    if (isAddingPage) return;  // Prevent recursive calls

    const footerY = doc.page.height - 30;
    doc.font('Helvetica')
      .fontSize(8)
      .text(`Page ${currentPage}`, 50, footerY, { align: 'center', width: doc.page.width - 100 });
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-CA')} à ${new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}`,
      50, footerY + 10, { align: 'center', width: doc.page.width - 100 });
  }

  // Intercepter l'ajout de page pour gérer la pagination
  const originalAddPage = doc.addPage;
  doc.addPage = function (...args) {
    // Set flag to prevent recursion
    if (isAddingPage) {
      return originalAddPage.apply(this, args);
    }

    isAddingPage = true;

    try {
      // Add footer to current page before moving to next page
      addFooter(pageNumber);

      // Increment page number
      pageNumber++;

      // Add the new page
      return originalAddPage.apply(this, args);
    } finally {
      // Reset flag
      isAddingPage = false;
    }
  };

  // Flux pour capturer le PDF en mémoire
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));

  // Ajouter l'en-tête
  const title = 'FICHE D\'INSPECTION DE CHARIOT ÉLÉVATEUR';
  doc.font('Helvetica-Bold')
    .fontSize(16)
    .text(title, { align: 'center' })
    .moveDown(1);

  // Extraire les valeurs de base
  const date = cleanValue(data.date) || new Date().toLocaleDateString('fr-CA');
  const operator = cleanValue(data.operator) || '';
  const truckNumber = cleanValue(data.truckNumber) || '';
  const registration = cleanValue(data.registration) || '';
  const department = cleanValue(data.department) || '';

  // Informations d'en-tête avec formatage en 2 colonnes
  const infoY = doc.y;
  doc.font('Helvetica')
    .fontSize(10);

  // Colonne gauche
  doc.text('Date: ' + date, 50, infoY)
    .text('Opérateur: ' + operator, 50, infoY + 20)
    .text('Département: ' + department, 50, infoY + 40);

  // Colonne droite
  doc.text('Chariot #: ' + truckNumber, 300, infoY)
    .text('Immatriculation: ' + registration, 300, infoY + 20);

  doc.moveDown(3);

  // Fonction pour générer un tableau en utilisant la structure INSPECTION_SECTIONS
  function drawInspectionTable(sectionData, sectionDefinition, startY) {
    if (!sectionData || !sectionDefinition) return startY + 20;

    const pageWidth = 512; // Largeur totale disponible
    const margin = 50;
    const col1Width = 220; // Élément à inspecter (augmenté)
    const col2Width = 65;  // État OK
    const col3Width = 65;  // État Non OK
    const col4Width = 162; // Commentaires (512 - 220 - 65 - 65 = 162)

    let y = startY;
    const rowHeight = 25; // Augmenté pour plus de lisibilité    // Vérifier s'il y a assez d'espace pour au moins l'en-tête et une ligne
    if (y + (rowHeight * 2) > doc.page.height - 100) {
      doc.addPage();
      y = 80;
    }

    // En-tête du tableau
    doc.font('Helvetica-Bold')
      .fontSize(10);
    doc.rect(margin, y, pageWidth, rowHeight).stroke();
    doc.text('Élément à inspecter', margin + 5, y + 5, { width: col1Width - 10 });
    doc.text('État OK', margin + col1Width + 10, y + 5, { width: col2Width - 20, align: 'center' });
    doc.text('État Non OK', margin + col1Width + col2Width + 10, y + 5, { width: col3Width - 20, align: 'center' });
    doc.text('Commentaires', margin + col1Width + col2Width + col3Width + 5, y + 5, { width: col4Width - 10 });
    y += rowHeight;    // Corps du tableau
    doc.font('Helvetica')
      .fontSize(10);

    // Parcourir les sections et les items définis dans INSPECTION_SECTIONS
    sectionDefinition.items.forEach((itemDef, index) => {
      const item = sectionData.items[index] || {};

      // Vérifier s'il faut passer à une nouvelle page
      if (y + rowHeight > doc.page.height - 100) { // Plus de marge pour éviter les coupures
        doc.addPage();
        y = 80; // Plus d'espace en haut pour le numéro de page

        // Redessiner l'en-tête du tableau sur la nouvelle page
        doc.font('Helvetica-Bold')
          .fontSize(10);
        doc.rect(margin, y, pageWidth, rowHeight).stroke();
        doc.text('Élément à inspecter', margin + 5, y + 5, { width: col1Width - 10 });
        doc.text('État OK', margin + col1Width + 10, y + 5, { width: col2Width - 20, align: 'center' });
        doc.text('État Non OK', margin + col1Width + col2Width + 10, y + 5, { width: col3Width - 20, align: 'center' });
        doc.text('Commentaires', margin + col1Width + col2Width + col3Width + 5, y + 5, { width: col4Width - 10 });
        y += rowHeight;
      }      // Dessiner la ligne de l'item
      doc.rect(margin, y, pageWidth, rowHeight).stroke();
      doc.text(itemDef.name, margin + 5, y + 5, { width: col1Width - 10 });

      // Marquer la case OK ou Non OK avec un symbole plus visuel
      const checkboxSize = 8;
      const checkboxY = y + 6;

      // Case OK
      const okBoxX = margin + col1Width + (col2Width / 2) - (checkboxSize / 2);
      doc.rect(okBoxX, checkboxY, checkboxSize, checkboxSize).stroke();
      if (item.isOk === 'ok') {
        // Dessiner une coche
        doc.moveTo(okBoxX + 2, checkboxY + 4)
          .lineTo(okBoxX + 4, checkboxY + 6)
          .lineTo(okBoxX + 6, checkboxY + 2)
          .stroke();
      }

      // Case Non OK
      const notOkBoxX = margin + col1Width + col2Width + (col3Width / 2) - (checkboxSize / 2);
      doc.rect(notOkBoxX, checkboxY, checkboxSize, checkboxSize).stroke();
      if (item.isOk === 'notOk') {
        // Dessiner un X
        doc.moveTo(notOkBoxX + 2, checkboxY + 2)
          .lineTo(notOkBoxX + 6, checkboxY + 6)
          .moveTo(notOkBoxX + 6, checkboxY + 2)
          .lineTo(notOkBoxX + 2, checkboxY + 6)
          .stroke();
      }
      // Afficher N/A si aucun état n'est défini
      if (!item.isOk || (item.isOk !== 'ok' && item.isOk !== 'notOk')) {
        doc.font('Helvetica')
          .fontSize(8)
          .text('N/A', okBoxX - 5, checkboxY, { width: col2Width, align: 'center' });
      }

      // Ajouter un commentaire s'il existe, avec gestion du texte long
      if (item.comments && item.comments.trim()) {
        const comment = cleanValue(item.comments);
        doc.font('Helvetica')
          .fontSize(9);
        doc.text(comment, margin + col1Width + col2Width + col3Width + 5, y + 3, {
          width: col4Width - 10,
          height: rowHeight - 6,
          ellipsis: true
        });
      }

      y += rowHeight;
    });

    return y;
  }

  // Fonction de validation pour s'assurer que toutes les sections sont traitées
  function validateDataCompleteness(data) {
    const missingFields = [];

    // Vérifier les champs de base
    if (!data.date) missingFields.push('Date');
    if (!data.operator) missingFields.push('Opérateur');
    if (!data.truckNumber) missingFields.push('Numéro de chariot');

    // Vérifier les sections d'inspection
    if (!data.visualInspection) missingFields.push('Inspection visuelle');
    if (!data.operationalInspection) missingFields.push('Inspection opérationnelle');

    if (missingFields.length > 0) {
      console.warn('Champs manquants dans les données:', missingFields.join(', '));
    }

    return missingFields.length === 0;
  }
  // Valider les données avant génération
  validateDataCompleteness(data);

  // ---------- TABLEAU D'INSPECTION VISUELLE ----------
  doc.font('Helvetica-Bold')
    .fontSize(12)
    .text('INSPECTION VISUELLE', { underline: true, align: 'center' })
    .moveDown(0.5);

  // Dessiner le tableau d'inspection visuelle
  let currentY = doc.y;
  Object.entries(data.visualInspection || {}).forEach(([key, section]) => {
    if (INSPECTION_SECTIONS.visualInspection[key]) {
      const sectionDef = INSPECTION_SECTIONS.visualInspection[key];      // Vérifier s'il y a assez d'espace pour la section (titre + au moins 3 lignes)
      const estimatedHeight = 40 + (sectionDef.items.length * 25) + 60; // Titre + lignes + marge
      if (doc.y + estimatedHeight > doc.page.height - 100) {
        doc.addPage();
        currentY = 80;
      }      
      // Position ajustée pour que le titre soit parfaitement aligné à droite du tableau
      doc.font('Helvetica-Bold')
        .fontSize(11)
        .text(sectionDef.title, 50 + 512 - 5, doc.y, { 
          underline: true, 
          align: 'right',
          width: 200 // Largeur fixe pour garantir l'alignement à droite
        });
      
      // Ajouter un petit espace avant le tableau
      doc.moveDown(0.3);
      currentY = drawInspectionTable(section, sectionDef, doc.y);
      doc.y = currentY;
      doc.moveDown(0.8);
    }
  });  // ---------- TABLEAU D'INSPECTION OPÉRATIONNELLE ----------
  // Vérifier s'il faut une nouvelle page pour l'inspection opérationnelle
  if (doc.y > doc.page.height - 200) {
    doc.addPage();
  } else {
    doc.moveDown(1.5);
  }

  // Positionner le titre INSPECTION OPÉRATIONNELLE à droite
  const margin = 50;
  const pageWidth = 512;
  
  doc.font('Helvetica-Bold')
    .fontSize(12)
    .text('INSPECTION', margin + pageWidth - 50, doc.y, { underline: true })
    .text('OPÉRATIONNELLE', margin + pageWidth - 50, doc.y + 20, { underline: true })
    .moveDown(1);

  // Dessiner le tableau d'inspection opérationnelle
  Object.entries(data.operationalInspection || {}).forEach(([key, section]) => {
    if (INSPECTION_SECTIONS.operationalInspection[key]) {
      const sectionDef = INSPECTION_SECTIONS.operationalInspection[key];      // Vérifier s'il y a assez d'espace pour la section
      const estimatedHeight = 40 + (sectionDef.items.length * 25) + 60;
      if (doc.y + estimatedHeight > doc.page.height - 100) {
        doc.addPage();
      }      // Positionnement du titre de section à droite du tableau
      const margin = 50;
      const pageWidth = 512;
        doc.font('Helvetica-Bold')
        .fontSize(11)
        .text(sectionDef.title, margin + pageWidth - 5, doc.y, { 
          underline: true, 
          align: 'right',
          width: 200 // Largeur fixe pour garantir l'alignement à droite
        });
      
      // Ajouter un petit espace avant le tableau
      doc.moveDown(0.3);
      currentY = drawInspectionTable(section, sectionDef, doc.y);
      doc.y = currentY;
      doc.moveDown(0.8);
    }
  });  // ---------- PIED DE PAGE ----------
  // S'assurer qu'on a une nouvelle page pour la signature
  if (doc.y > doc.page.height - 250) {
    doc.addPage();
  } else {
    doc.moveDown(2);
  }

  // Zone de signature - position calculée depuis le haut de la page
  const margin = 50;
  const signatureY = Math.max(doc.y, doc.page.height - 200); // Position flexible mais pas trop bas

  doc.font('Helvetica-Bold')
    .fontSize(12)
    .text('SIGNATURE ET VALIDATION', margin, signatureY - 60, { align: 'center', width: doc.page.width - 2 * margin });

  doc.font('Helvetica')
    .fontSize(10)
    .text('Je déclare avoir effectué l\'inspection complète du chariot élévateur selon les normes de sécurité en vigueur et confirme l\'exactitude des informations rapportées ci-dessus.',
      margin, signatureY - 35, { width: doc.page.width - 2 * margin, align: 'justify' });

  // Ajouter la signature numérique si elle existe
  if (data.signature) {
    try {
      const base64Data = data.signature.split(',')[1] || data.signature;
      const img = Buffer.from(base64Data, 'base64');
      doc.image(img, margin, signatureY - 10, { width: 180, height: 50 });
    } catch (err) {
      console.error('Erreur lors de l\'insertion de la signature:', err);
    }
  }

  // Lignes de signature avec meilleur espacement
  const signatureLineY = signatureY + 50;
  doc.moveTo(margin, signatureLineY)
    .lineTo(margin + 200, signatureLineY)
    .stroke();
  doc.text('Signature de l\'opérateur', margin, signatureLineY + 5, { width: 200 });

  doc.moveTo(doc.page.width - margin - 200, signatureLineY)
    .lineTo(doc.page.width - margin, signatureLineY)
    .stroke();
  doc.text('Date: ' + date, doc.page.width - margin - 200, signatureLineY + 5, { width: 200 });

  doc.moveDown(3);

  doc.font('Helvetica')
    .fontSize(8)
    .text('Ce document doit être conservé selon les politiques internes de gestion documentaire.', { align: 'center' });  // Ajouter le pied de page final pour la dernière page
  isAddingPage = false;  // Make sure flag is reset
  addFooter(pageNumber);

  // Finaliser le document
  doc.end();

  // Fonction pour transformer les buffers en un seul buffer final
  return new Promise((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
  });
}

module.exports = { generatePDF };
