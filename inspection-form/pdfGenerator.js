function flattenObject(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !(obj[key] instanceof Date) && !Array.isArray(obj[key])) {
      Object.assign(acc, flattenObject(obj[key], newKey));
    } else {
      acc[newKey] = obj[key];
    }
    return acc;
  }, {});
}

function cleanValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (Array.isArray(value)) return value.join(', ');
  if (value instanceof Date) return value.toLocaleDateString();
  return String(value);
}

function generatePDF(data) {
  // Aplatir l'objet et préparer les lignes de texte
  const flatData = flattenObject(data);
  const lines = Object.entries(flatData)
    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}: ${cleanValue(v)}`);

  // Définir le contenu PDF
  let content = ['BT', '/F1 12 Tf'];
  let y = 750;

  // En-tête
  content.push('50 780 Td (Rapport d\'inspection de chariot élévateur) Tj');
  y -= 30; // Espace après le titre

  // Contenu principal
  for (const line of lines) {
    if (y < 50) {
      // Nouvelle page si on arrive en bas
      content.push('ET', 'BT', '/F1 12 Tf', '50 750 Td');
      y = 750;
    }

    const esc = String(line).replace(/([()\\])/g, '\\$1');
    content.push(`50 ${y} Td (${esc}) Tj`);
    y -= 14;
  }

  content.push('ET');
  const contentStream = content.join('\n');

  const header = '%PDF-1.7\n';
  const objs = []; const offs = []; let offset = header.length;
  const add = txt => { objs.push(txt); offs.push(offset); offset += Buffer.byteLength(txt); };

  add('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  add('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  add('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n');
  add(`4 0 obj\n<< /Length ${Buffer.byteLength(contentStream)} >>\nstream\n${contentStream}\nendstream\nendobj\n`);
  add('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

  let xref = 'xref\n0 6\n0000000000 65535 f \n';
  for (const o of offs) {
    xref += String(o).padStart(10, '0') + ' 00000 n \n';
  }
  const trailer = `trailer\n<< /Root 1 0 R /Size 6 >>\nstartxref\n${offset}\n%%EOF`;

  return header + objs.join('') + xref + trailer;
}

module.exports = { generatePDF };
