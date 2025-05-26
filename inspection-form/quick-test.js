const axios = require('axios');

async function quickTest() {
    try {
        console.log('🧪 Test rapide de l\'API...');
        // Test de base
        const testResponse = await axios.get('http://localhost:3000/api/test');
        console.log('✅ Serveur répond:', testResponse.data.message);

        // Test de l'email (sans configuration)
        const emailResponse = await axios.get('http://localhost:3000/api/test-email');
        console.log('📧 Test email:', emailResponse.data);

    } catch (error) {
        console.error('❌ Erreur:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Le serveur n\'est pas démarré. Lancez "npm run server"');
        }
    }
}

quickTest();
