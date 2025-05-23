function generatePDF(data) {
  const lines = Object.entries(data).map(([k, v]) => `${k}: ${v}`);
  let content = ['BT', '/F1 12 Tf'];
  let y = 750;
  for (const line of lines) {
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
