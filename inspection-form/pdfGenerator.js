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
  });

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
    const col1Width = 200; // Élément à inspecter
    const col2Width = 70;  // État OK
    const col3Width = 70;  // État Non OK
    const col4Width = 172; // Commentaires (512 - 200 - 70 - 70 = 172)

    let y = startY;
    const rowHeight = 20;    // En-tête du tableau
    doc.font('Helvetica-Bold')
      .fontSize(10);
    doc.rect(margin, y, pageWidth, rowHeight).stroke();
    doc.text('Élément à inspecter', margin + 5, y + 5, { width: col1Width - 10 });
    doc.text('État OK', margin + col1Width + 10, y + 5, { width: col2Width - 20, align: 'center' });
    doc.text('État Non OK', margin + col1Width + col2Width + 10, y + 5, { width: col3Width - 20, align: 'center' });
    doc.text('Commentaires', margin + col1Width + col2Width + col3Width + 5, y + 5, { width: col4Width - 10 });
    y += rowHeight;

    // Corps du tableau
    doc.font('Helvetica')
      .fontSize(10);

    // Parcourir les sections et les items définis dans INSPECTION_SECTIONS
    sectionDefinition.items.forEach((itemDef, index) => {
      const item = sectionData.items[index] || {};

      // Vérifier s'il faut passer à une nouvelle page
      if (y + rowHeight > doc.page.height - 50) { // Ajustement pour éviter les pages presque vides
        doc.addPage();
        y = 50;

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

      // Marquer la case OK ou Non OK avec X
      if (item.isOk === 'ok') {
        doc.text('X', margin + col1Width + 20, y + 5, { align: 'center', width: col2Width - 20 });
      } else if (item.isOk === 'notOk') {
        doc.text('X', margin + col1Width + col2Width + 20, y + 5, { align: 'center', width: col3Width - 20 });
      } else {
        doc.text('N/A', margin + col1Width + 20, y + 5, { align: 'center', width: col2Width - 20 });
      }

      // Ajouter un commentaire s'il existe
      if (item.comments) {
        doc.text(cleanValue(item.comments), margin + col1Width + col2Width + col3Width + 5, y + 5, { width: col4Width - 10 });
      }

      y += rowHeight;
    });

    return y;
  }

  // ---------- TABLEAU D'INSPECTION VISUELLE ----------
  doc.font('Helvetica-Bold')
    .fontSize(12)
    .text('INSPECTION VISUELLE', { underline: true, align: 'center' })
    .moveDown(0.5);

  // Dessiner le tableau d'inspection visuelle
  let currentY = doc.y;
  Object.entries(data.visualInspection || {}).forEach(([key, section]) => {
    if (INSPECTION_SECTIONS.visualInspection[key]) {
      const sectionDef = INSPECTION_SECTIONS.visualInspection[key];
      doc.font('Helvetica-Bold')
        .fontSize(11)
        .text(sectionDef.title)
        .moveDown(0.5);
      currentY = drawInspectionTable(section, sectionDef, doc.y);
      doc.moveDown(1);
    }
  });

  // ---------- TABLEAU D'INSPECTION OPÉRATIONNELLE ----------
  // Ajouter une nouvelle page si nécessaire
  if (currentY > 600) {
    doc.addPage();
    currentY = 50;
  } else {
    doc.moveDown(1);
    currentY = doc.y + 20;
  }

  doc.font('Helvetica-Bold')
    .fontSize(12)
    .text('INSPECTION OPÉRATIONNELLE', { underline: true, align: 'center' })
    .moveDown(1);

  // Dessiner le tableau d'inspection opérationnelle
  Object.entries(data.operationalInspection || {}).forEach(([key, section]) => {
    if (INSPECTION_SECTIONS.operationalInspection[key]) {
      const sectionDef = INSPECTION_SECTIONS.operationalInspection[key];
      doc.font('Helvetica-Bold')
        .fontSize(11)
        .text(sectionDef.title)
        .moveDown(0.5);
      currentY = drawInspectionTable(section, sectionDef, doc.y);
      doc.moveDown(1);
    }
  });
  // ---------- PIED DE PAGE ----------
  doc.addPage();

  // Zone de signature - position calculée depuis le haut de la page
  const margin = 50;
  const signatureY = doc.page.height - 150; // Position fixe pour garantir visibilité

  doc.font('Helvetica-Bold')
    .fontSize(12)
    .text('SIGNATURE', margin, signatureY - 40, { align: 'center', width: doc.page.width - 2 * margin });

  doc.font('Helvetica')
    .fontSize(10)
    .text('Je déclare avoir effectué l\'inspection complète du chariot élévateur selon les normes de sécurité en vigueur.', margin, signatureY - 20, { width: doc.page.width - 2 * margin, align: 'justify' });

  // Lignes de signature
  doc.moveTo(margin, signatureY)
    .lineTo(margin + 200, signatureY)
    .stroke();
  doc.text('Signature de l\'opérateur', margin, signatureY + 5, { width: 200 });

  doc.moveTo(doc.page.width - margin - 200, signatureY)
    .lineTo(doc.page.width - margin, signatureY)
    .stroke();
  doc.text('Date: ' + date, doc.page.width - margin - 200, signatureY + 5, { width: 200 });

  doc.moveDown(4);

  doc.font('Helvetica-Bold')
    .fontSize(10)
    .text('Ce document doit être conservé selon les politiques internes de gestion documentaire.', { align: 'center' });

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
