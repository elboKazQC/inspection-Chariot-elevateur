const fs = require('fs');
const { generatePDF } = require('./pdfGenerator');
const path = require('path');

// Sample inspection data
const testData = {
  date: new Date().toISOString().split('T')[0],
  operator: 'Test Operator',
  truckNumber: 'TRUCK-123',
  registration: 'REG-456',
  department: 'Warehouse',
  
  visualInspection: {
    alimentation: {
      items: [
        { isOk: 'ok', comments: 'Looks good' },
        { isOk: 'notOk', comments: 'Needs repair' },
        { isOk: 'ok', comments: '' },
        { isOk: 'ok', comments: '' },
        { isOk: 'ok', comments: '' },
        { isOk: 'ok', comments: '' },
        { isOk: 'ok', comments: '' }
      ]
    },
    fluides: {
      items: [
        { isOk: 'ok', comments: 'Good level' },
        { isOk: 'ok', comments: 'Good level' },
        { isOk: 'ok', comments: 'Good level' }
      ]
    },
    roues: {
      items: [
        { isOk: 'ok', comments: 'Good condition' },
        { isOk: 'ok', comments: 'Properly tightened' }
      ]
    },
    mat: {
      items: [
        { isOk: 'ok', comments: '' },
        { isOk: 'ok', comments: '' },
        { isOk: 'ok', comments: '' },
        { isOk: 'ok', comments: '' },
        { isOk: 'ok', comments: '' }
      ]
    },
    equipementsSecurite: {
      items: [
        { isOk: 'ok', comments: 'Working properly' },
        { isOk: 'ok', comments: 'Working properly' },
        { isOk: 'ok', comments: 'Working properly' },
        { isOk: 'ok', comments: 'Working properly' },
        { isOk: 'ok', comments: 'In good condition' }
      ]
    }
  },
  
  operationalInspection: {
    freins: {
      items: [
        { isOk: 'ok', comments: 'Working properly' },
        { isOk: 'ok', comments: 'Working properly' }
      ]
    },
    mat: {
      items: [
        { isOk: 'ok', comments: '' },
        { isOk: 'ok', comments: '' },
        { isOk: 'ok', comments: '' },
        { isOk: 'ok', comments: '' },
        { isOk: 'ok', comments: '' }
      ]
    },
    conduite: {
      items: [
        { isOk: 'ok', comments: '' },
        { isOk: 'ok', comments: '' },
        { isOk: 'ok', comments: '' },
        { isOk: 'ok', comments: '' },
        { isOk: 'ok', comments: '' },
        { isOk: 'ok', comments: '' },
        { isOk: 'ok', comments: '' }
      ]
    },
    fluides: {
      items: [
        { isOk: 'ok', comments: 'No leaks detected' }
      ]
    }
  }
};

// Write JSON data first
const jsonPath = path.join(__dirname, 'sample_inspection.json');
fs.writeFileSync(jsonPath, JSON.stringify(testData, null, 2));
console.log(`JSON data written to ${jsonPath}`);

// Generate PDF from inspection data
(async () => {
  try {
    console.log('Generating PDF...');
    const pdfContent = await generatePDF(testData);
    
    if (!pdfContent) {
      console.error('PDF content is empty!');
      return;
    }
    
    console.log(`PDF generated successfully! Size: ${pdfContent.length} bytes`);
    
    // Save the PDF to a file
    const pdfPath = path.join(__dirname, 'sample_inspection.pdf');
    fs.writeFileSync(pdfPath, pdfContent);
    console.log(`PDF saved to ${pdfPath}`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    console.error(error.stack);
  }
})();
