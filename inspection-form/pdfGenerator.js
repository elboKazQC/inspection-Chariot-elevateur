const PDFDocument = require('pdfkit');
const { INSPECTION_SECTIONS } = require('./constants/inspectionData');

function cleanValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (Array.isArray(value)) return value.join(', ');
  if (value instanceof Date) return value.toLocaleDateString('fr-CA');
  return String(value);
}

function generatePDF(data) {
  const doc = new PDFDocument({
    size: 'LETTER',
    margin: 50,
    info: {
      Title: 'Rapport d\'inspection de chariot \u00e9l\u00e9vateur',
      Author: 'Syst\u00e8me d\'inspection Noovelia',
      Subject: 'Inspection de s\u00e9curit\u00e9',
      Keywords: 'chariot, \u00e9l\u00e9vateur, inspection, s\u00e9curit\u00e9'
    }
  });

  let pageNumber = 1;
  let isAddingPage = false;

  function addFooter(currentPage = pageNumber) {
    if (isAddingPage) return;
    const footerY = doc.page.height - 30;
    doc.font('Helvetica')
      .fontSize(8)
      .text(`Page ${currentPage}`, 50, footerY, { align: 'center', width: doc.page.width - 100 });
    doc.text(`G\u00e9n\u00e9r\u00e9 le ${new Date().toLocaleDateString('fr-CA')} \u00e0 ${new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}`,
      50, footerY + 10, { align: 'center', width: doc.page.width - 100 });
  }

  const originalAddPage = doc.addPage;
  doc.addPage = function (...args) {
    if (isAddingPage) {
      return originalAddPage.apply(this, args);
    }
    isAddingPage = true;
    try {
      addFooter(pageNumber);
      pageNumber++;
      return originalAddPage.apply(this, args);
    } finally {
      isAddingPage = false;
    }
  };

  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));

  const mainTitle = 'FICHE D\'INSPECTION DE CHARIOT \u00c9L\u00c9VATEUR';
  const mainTitleWidth = doc.widthOfString(mainTitle);
  const mainTitleX = (doc.page.width - mainTitleWidth) / 2;
  doc.font('Helvetica-Bold')
    .fontSize(16)
    .text(mainTitle, mainTitleX, doc.y)
    .moveDown(1);

  const date = cleanValue(data.date) || new Date().toLocaleDateString('fr-CA');
  const operator = cleanValue(data.operator) || '';
  const truckNumber = cleanValue(data.truckNumber) || '';
  const registration = cleanValue(data.registration) || '';
  const department = cleanValue(data.department) || '';

  const infoY = doc.y;
  doc.font('Helvetica').fontSize(10);
  doc.text('Date: ' + date, 50, infoY)
    .text('Op\u00e9rateur: ' + operator, 50, infoY + 20)
    .text('D\u00e9partement: ' + department, 50, infoY + 40);
  doc.text('Chariot #: ' + truckNumber, 300, infoY)
    .text('Immatriculation: ' + registration, 300, infoY + 20);
  doc.moveDown(3);
  function drawCenteredTitle(title, fontSize = 12, underline = true) {
    doc.font('Helvetica-Bold').fontSize(fontSize);
    const titleWidth = doc.widthOfString(title);
    const x = (doc.page.width - titleWidth) / 2;
    doc.text(title, x, doc.y, { underline });
  }
  function drawInspectionTable(sectionData, sectionDefinition, startY) {
    if (!sectionData || !sectionDefinition) return startY + 20;

    const pageWidth = 512;
    const margin = 50;
    const col1Width = 220;
    const col2Width = 65;
    const col3Width = 65;
    const col4Width = 162;
    let y = startY;
    const rowHeight = 25;

    if (y + (rowHeight * 2) > doc.page.height - 100) {
      doc.addPage();
      y = 80;
    }

    doc.font('Helvetica-Bold').fontSize(10);
    doc.rect(margin, y, pageWidth, rowHeight).stroke();
    doc.text('Élément à inspecter', margin + 5, y + 5, { width: col1Width - 10 });
    doc.text('État OK', margin + col1Width + 10, y + 5, { width: col2Width - 20, align: 'center' });
    doc.text('État Non OK', margin + col1Width + col2Width + 10, y + 5, { width: col3Width - 20, align: 'center' });
    doc.text('Commentaires', margin + col1Width + col2Width + col3Width + 5, y + 5, { width: col4Width - 10 });
    y += rowHeight;

    doc.font('Helvetica').fontSize(10);

    sectionDefinition.items.forEach((itemDef, index) => {
      const item = sectionData.items[index] || {};
      if (y + rowHeight > doc.page.height - 100) {
        doc.addPage();
        y = 80;
        doc.font('Helvetica-Bold').fontSize(10);
        doc.rect(margin, y, pageWidth, rowHeight).stroke();
        doc.text('Élément à inspecter', margin + 5, y + 5, { width: col1Width - 10 });
        doc.text('État OK', margin + col1Width + 10, y + 5, { width: col2Width - 20, align: 'center' });
        doc.text('État Non OK', margin + col1Width + col2Width + 10, y + 5, { width: col3Width - 20, align: 'center' });
        doc.text('Commentaires', margin + col1Width + col2Width + col3Width + 5, y + 5, { width: col4Width - 10 });
        y += rowHeight;
      }

      doc.rect(margin, y, pageWidth, rowHeight).stroke();
      doc.text(itemDef.name, margin + 5, y + 5, { width: col1Width - 10 });
      const checkboxSize = 8;
      const checkboxY = y + 6;
      const okBoxX = margin + col1Width + (col2Width / 2) - (checkboxSize / 2);
      doc.rect(okBoxX, checkboxY, checkboxSize, checkboxSize).stroke();
      if (item.isOk === 'ok') {
        doc.moveTo(okBoxX + 2, checkboxY + 4).lineTo(okBoxX + 4, checkboxY + 6).lineTo(okBoxX + 6, checkboxY + 2).stroke();
      }
      const notOkBoxX = margin + col1Width + col2Width + (col3Width / 2) - (checkboxSize / 2);
      doc.rect(notOkBoxX, checkboxY, checkboxSize, checkboxSize).stroke();
      if (item.isOk === 'notOk') {
        doc.moveTo(notOkBoxX + 2, checkboxY + 2).lineTo(notOkBoxX + 6, checkboxY + 6)
          .moveTo(notOkBoxX + 6, checkboxY + 2).lineTo(notOkBoxX + 2, checkboxY + 6).stroke();
      }
      if (!item.isOk || (item.isOk !== 'ok' && item.isOk !== 'notOk')) {
        doc.font('Helvetica').fontSize(8).text('N/A', okBoxX - 5, checkboxY, { width: col2Width, align: 'center' });
      }
      if (item.comments && item.comments.trim()) {
        const comment = cleanValue(item.comments);
        doc.font('Helvetica').fontSize(9);
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

  function validateDataCompleteness(data) {
    const missingFields = [];
    if (!data.date) missingFields.push('Date');
    if (!data.operator) missingFields.push('Op\u00e9rateur');
    if (!data.truckNumber) missingFields.push('Num\u00e9ro de chariot');
    if (!data.visualInspection) missingFields.push('Inspection visuelle');
    if (!data.operationalInspection) missingFields.push('Inspection op\u00e9rationnelle');
    if (missingFields.length > 0) {
      console.warn('Champs manquants dans les donn\u00e9es:', missingFields.join(', '));
    }
    return missingFields.length === 0;
  }

  validateDataCompleteness(data);

  drawCenteredTitle('INSPECTION VISUELLE', 12);
  doc.moveDown(0.5);

  let currentY = doc.y;
  Object.entries(data.visualInspection || {}).forEach(([key, section]) => {
    if (INSPECTION_SECTIONS.visualInspection[key]) {
      const sectionDef = INSPECTION_SECTIONS.visualInspection[key];
      const estimatedHeight = 40 + (sectionDef.items.length * 25) + 60;
      if (doc.y + estimatedHeight > doc.page.height - 100) {
        doc.addPage();
        currentY = 80;
      }
      doc.font('Helvetica-Bold').fontSize(11).text(sectionDef.title, 50, doc.y, { underline: true });
      currentY = drawInspectionTable(section, sectionDef, doc.y);
      doc.y = currentY;
      doc.moveDown(0.8);
    }
  });

  if (doc.y > doc.page.height - 200) {
    doc.addPage();
  } else {
    doc.moveDown(1.5);
  }

  drawCenteredTitle('INSPECTION OPÉRATIONNELLE', 12);
  doc.moveDown(1);

  Object.entries(data.operationalInspection || {}).forEach(([key, section]) => {
    if (INSPECTION_SECTIONS.operationalInspection[key]) {
      const sectionDef = INSPECTION_SECTIONS.operationalInspection[key];
      const estimatedHeight = 40 + (sectionDef.items.length * 25) + 60;
      if (doc.y + estimatedHeight > doc.page.height - 100) {
        doc.addPage();
      }
      doc.font('Helvetica-Bold').fontSize(11).text(sectionDef.title, 50, doc.y, { underline: true });
      currentY = drawInspectionTable(section, sectionDef, doc.y);
      doc.y = currentY;
      doc.moveDown(0.8);
    }
  });

  if (doc.y > doc.page.height - 250) {
    doc.addPage();
  } else {
    doc.moveDown(2);
  }

  drawCenteredTitle('SIGNATURE ET VALIDATION', 12);
  doc.moveDown(1);

  // Section signature et date
  const signatureWidth = 200;
  const dateWidth = 150;
  const lineY = doc.y + 60;

  // Signature de l'opérateur
  if (data.signature) {
    const signatureImg = Buffer.from(data.signature.split(',')[1], 'base64');
    doc.image(signatureImg, 50, doc.y + 20, { width: signatureWidth });
  }
  doc.fontSize(10).font('Helvetica');
  doc.moveTo(50, lineY).lineTo(50 + signatureWidth, lineY).stroke();
  doc.text('Signature de l\'opérateur', 50, lineY + 5, { width: signatureWidth, align: 'center' });

  // Date de l'inspection
  doc.moveTo(350, lineY).lineTo(350 + dateWidth, lineY).stroke();
  doc.text('Date', 350, lineY + 5, { width: dateWidth, align: 'center' });
  doc.font('Helvetica').fontSize(10)
    .text(date, 350, lineY - 25, { width: dateWidth, align: 'center' });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
  });
}

module.exports = { generatePDF };
