const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

// Sample inspection data matching the required structure
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
  },

  signature: null
};

async function testApiEndpoint() {
  try {
    console.log('Sending inspection data to API...');
    const response = await axios.post('http://localhost:3000/api/save', testData);
    console.log('API Response:', response.data);
    console.log('Test complete!');
  } catch (error) {
    console.error('Error calling API:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testApiEndpoint();
