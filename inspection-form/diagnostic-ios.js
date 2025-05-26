// Script de diagnostic pour les problèmes de connexion iOS
const os = require('os');

async function diagnosticIOS() {
    console.log('🔍 DIAGNOSTIC DE CONNEXION iOS');
    console.log('================================\n');

    // 1. Vérifier les interfaces réseau
    console.log('📡 Interfaces réseau disponibles:');
    const networkInterfaces = os.networkInterfaces();
    const addresses = [];
    
    Object.keys(networkInterfaces).forEach(ifname => {
        networkInterfaces[ifname].forEach(iface => {
            if (iface.family === 'IPv4' && !iface.internal) {
                addresses.push({
                    interface: ifname,
                    address: iface.address,
                    mac: iface.mac
                });
                console.log(`  ✓ ${ifname}: ${iface.address}`);
            }
        });
    });

    if (addresses.length === 0) {
        console.log('  ❌ Aucune interface réseau active trouvée');
        return;
    }

    console.log('\n🔗 URLs à tester sur iOS:');
    addresses.forEach(addr => {
        console.log(`  HTTPS: https://${addr.address}:8443`);
        console.log(`  HTTP:  http://${addr.address}:3000`);
    });

    // 2. Tester les certificats HTTPS
    console.log('\n🔒 Test des certificats HTTPS:');
    try {
        const { getCerts } = require('https-localhost');
        const certs = await getCerts();
        console.log('  ✓ Certificats HTTPS générés avec succès');
        console.log(`  ✓ Certificat valide pour localhost`);
    } catch (error) {
        console.log('  ❌ Erreur avec les certificats HTTPS:', error.message);
        console.log('  💡 Installez https-localhost: npm install https-localhost');
    }

    // 3. Conseils spécifiques iOS
    console.log('\n📱 CONSEILS SPÉCIFIQUES POUR iOS:');
    console.log('  1. Utilisez Safari (meilleure compatibilité que Chrome)');
    console.log('  2. Désactivez le mode privé dans Safari');
    console.log('  3. Acceptez le certificat auto-signé quand iOS vous le demande');
    console.log('  4. Vérifiez que l\'iPhone/iPad est sur le même WiFi');
    console.log('  5. Si les signatures ne marchent pas, rafraîchissez la page');

    // 4. Test de connectivité
    console.log('\n🧪 TESTS RECOMMANDÉS:');
    addresses.forEach(addr => {
        console.log(`  • Test HTTPS: https://${addr.address}:8443/api/test`);
        console.log(`  • Page diagnostic: https://${addr.address}:8443/connection-info`);
    });

    console.log('\n✅ Diagnostic terminé.');
    console.log('💡 Utilisez: npm run ios pour démarrer le serveur optimisé iOS.');
}

// Exécuter le diagnostic
if (require.main === module) {
    diagnosticIOS().catch(console.error);
}

module.exports = { diagnosticIOS };
