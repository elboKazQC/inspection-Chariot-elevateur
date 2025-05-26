const fs = require('fs');
const path = require('path');
const { generatePDF } = require('./pdfGenerator');

// Sample inspection data matching the expected structure
const testData = {
    date: new Date().toISOString().split('T')[0],
    operator: 'Test Operator',
    truckNumber: 'TRUCK-123',
    registration: 'REG-456',
    department: 'Warehouse',
    // Visual inspection sections matching actual structure from inspectionData.js
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

    // Operational inspection sections
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
    },

    // Signature (optional)
    signature: null
};

async function testPdfGeneration() {
    try {
        console.log('Starting PDF generation test...');
        const pdfBuffer = await generatePDF(testData);
        console.log(`PDF generated successfully! Size: ${pdfBuffer.length} bytes`);

        // Save the PDF to a file
        const outputPath = path.join(__dirname, 'test-output.pdf');
        fs.writeFileSync(outputPath, pdfBuffer);
        console.log(`PDF saved to: ${outputPath}`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        console.error(error.stack);
    }
}

testPdfGeneration();
