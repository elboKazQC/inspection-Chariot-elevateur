const PDFDocument = require('pdfkit');

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
  // ---------- TABLEAU D'INSPECTION VISUELLE ----------
  doc.font('Helvetica-Bold')
    .fontSize(12)
    .text('INSPECTION VISUELLE', { underline: true, align: 'center' })
    .moveDown(0.5);

  // Fonction pour générer un tableau
  function drawInspectionTable(sectionData, startY) {
    if (!sectionData) return startY + 20;

    const pageWidth = 512; // Largeur disponible
    const margin = 50;    // Largeur des colonnes - plus d'espacement
    const col1Width = 190;
    const col2Width = 85;
    const col3Width = 85;
    const col4Width = pageWidth - col1Width - col2Width - col3Width;

    // Position Y pour commencer le tableau
    let y = startY;
    const rowHeight = 20;

    // En-tête du tableau
    doc.font('Helvetica-Bold')
      .fontSize(10);    // Lignes d'en-tête
    doc.rect(margin, y, pageWidth, rowHeight).stroke();
    doc.text('Élément', margin + 5, y + 5, { width: col1Width });
    doc.text('OK', margin + col1Width + 35, y + 5, { width: col2Width, align: 'center' });
    doc.text('Non OK', margin + col1Width + col2Width + 25, y + 5, { width: col3Width, align: 'center' });
    doc.text('Commentaires', margin + col1Width + col2Width + col3Width + 15, y + 5, { width: col4Width - 15 });
    y += rowHeight;

    // Corps du tableau
    doc.font('Helvetica')
      .fontSize(10);

    // Parcourir les sections et les items
    Object.keys(sectionData || {}).forEach(key => {
      const section = sectionData[key];

      // En-tête de section
      doc.rect(margin, y, pageWidth, rowHeight).stroke();
      doc.font('Helvetica-Bold')
        .text(section.title || key, margin + 5, y + 5, { width: col1Width });
      doc.font('Helvetica');
      y += rowHeight;

      // Items de la section
      (section.items || []).forEach(item => {        // Vérifier s'il faut passer à une nouvelle page
        if (y > 700) {
          doc.addPage();
          y = 50;

          // Redessiner l'en-tête du tableau sur la nouvelle page
          doc.font('Helvetica-Bold')
            .fontSize(10); doc.rect(margin, y, pageWidth, rowHeight).stroke();
          doc.text('Élément', margin + 5, y + 5, { width: col1Width });
          doc.text('OK', margin + col1Width + 35, y + 5, { width: col2Width, align: 'center' });
          doc.text('Non OK', margin + col1Width + col2Width + 25, y + 5, { width: col3Width, align: 'center' });
          doc.text('Commentaires', margin + col1Width + col2Width + col3Width + 15, y + 5, { width: col4Width - 15 });
          y += rowHeight;
          doc.font('Helvetica')
            .fontSize(10);
        }

        // Dessiner la ligne de l'item
        doc.rect(margin, y, pageWidth, rowHeight).stroke();
        doc.text(item.name, margin + 15, y + 5, { width: col1Width - 15 });        // Marquer la case OK ou Non OK avec X au lieu de crochets - centré dans les colonnes
        if (item.isOk === 'ok') {
          doc.text('X', margin + col1Width + 40, y + 5, { align: 'center', width: col2Width - 20 });
        } else if (item.isOk === 'notOk') {
          doc.text('X', margin + col1Width + col2Width + 35, y + 5, { align: 'center', width: col3Width - 20 });
        } else {
          // Ajouter un N/A visible
          doc.text('N/A', margin + col1Width + 40, y + 5, { align: 'center', width: col2Width - 20 });
        }

        // Ajouter un commentaire s'il existe
        if (item.comments) {
          doc.text(cleanValue(item.comments), margin + col1Width + col2Width + col3Width + 5, y + 5, { width: col4Width - 10 });
        }

        y += rowHeight;
      });
    });

    return y;
  }

  // Dessiner le tableau d'inspection visuelle
  let currentY = doc.y;
  currentY = drawInspectionTable(data.visualInspection, currentY);
  doc.moveDown(1);  // ---------- TABLEAU D'INSPECTION OPÉRATIONNELLE ----------
  // Ajouter une nouvelle page si nécessaire
  if (currentY > 600) {
    doc.addPage();
    currentY = 50;
  } else {
    // Ajouter plus d'espace entre les tableaux
    doc.moveDown(1);
    currentY = doc.y + 20;
  }

  doc.font('Helvetica-Bold')
    .fontSize(12)
    .text('INSPECTION OPÉRATIONNELLE', { underline: true, align: 'center' })
    .moveDown(1);

  // Dessiner le tableau d'inspection opérationnelle
  currentY = doc.y;
  currentY = drawInspectionTable(data.operationalInspection, currentY);  // ---------- PIED DE PAGE ----------
  doc.addPage();
  // Zone de signature - utiliser une position fixe depuis le haut pour plus de cohérence
  const pageCenter = doc.page.width / 2;

  doc.font('Helvetica-Bold')
    .fontSize(12)
    .text('SIGNATURE', pageCenter - 40, 100, { underline: true, align: 'center', width: 80 });

  doc.font('Helvetica')
    .fontSize(10)
    .text('Je déclare avoir effectué l\'inspection complète du chariot élévateur selon les normes de sécurité en vigueur.', 50, 140, { width: 512 });

  // Position fixe pour les lignes de signature
  const signatureY = 200;

  // Zone de signature - simplifiée avec juste une ligne
  doc.moveTo(50, signatureY)
    .lineTo(250, signatureY)
    .stroke();
  doc.text('Signature de l\'opérateur', 50, signatureY + 5);

  // Zone de date - simplifiée avec juste une ligne
  doc.moveTo(350, signatureY)
    .lineTo(550, signatureY)
    .stroke();
  doc.text('Date', 350, signatureY + 5);

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
