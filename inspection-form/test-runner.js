// test-runner.js
// Script alternatif pour exÃ©cuter les tests quand react-scripts n'est pas exÃ©cutable
const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('ExÃ©cution des tests via Node.js...');
  const reactScriptsPath = path.join(__dirname, 'node_modules', 'react-scripts', 'bin', 'react-scripts.js');
  execSync(
ode "" test --watchAll=false, { stdio: 'inherit' });
} catch (error) {
  console.error('Erreur lors de l\'exÃ©cution des tests:', error);
  process.exit(1);
}
