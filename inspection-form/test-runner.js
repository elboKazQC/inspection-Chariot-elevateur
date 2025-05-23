// Script alternatif pour exécuter les tests quand react-scripts n'est pas exécutable
const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Exécution des tests via Node.js...');
  const reactScriptsPath = path.join(__dirname, 'node_modules', 'react-scripts', 'bin', 'react-scripts.js');
  execSync(`node "${reactScriptsPath}" test --watchAll=false`, { stdio: 'inherit' });
} catch (error) {
  console.error('Erreur lors de l\'exécution des tests:', error);
  process.exit(1);
}
