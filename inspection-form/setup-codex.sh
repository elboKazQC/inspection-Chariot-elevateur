#!/bin/bash
# Script de configuration pour l'environnement Codex (version Bash)
# Ce script résout les problèmes de permissions sur react-scripts

echo -e "\e[33mConfiguration de l'environnement Codex pour les tests...\e[0m"

# Aller dans le répertoire du projet
cd inspection-form || exit 1

# Installation des dépendances
echo -e "\e[36mInstallation des dépendances npm...\e[0m"
npm install

# Installation spécifique pour jest-dom
echo -e "\e[36mInstallation de jest-dom...\e[0m"
npm install @testing-library/jest-dom --save-dev

# Réparer les permissions de react-scripts
if [ -f "node_modules/.bin/react-scripts" ]; then
    echo -e "\e[36mCorrection des permissions sur react-scripts...\e[0m"
    chmod +x node_modules/.bin/react-scripts
fi

# Vérifier que les node_modules sont bien installés
if [ -f "node_modules/react-scripts/bin/react-scripts.js" ]; then
    echo -e "\e[32mreact-scripts est correctement installé.\e[0m"
else
    echo -e "\e[31mERREUR: react-scripts n'a pas été trouvé!\e[0m"
    echo -e "\e[33mTentative de réparation avec une installation ciblée...\e[0m"
    npm install react-scripts --save-dev
fi

# Créer un script de test alternatif qui utilise Node directement au lieu de react-scripts
cat > test-runner.js << 'EOL'
// test-runner.js
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
EOL

# Rendre le script de test exécutable aussi
chmod +x test-runner.js

echo -e "\n\e[32mConfiguration terminée!\e[0m"
echo -e "\e[36mPour exécuter les tests, utilisez l'une des commandes suivantes:\e[0m"
echo -e "  npm test                - Utilise react-scripts standard"
echo -e "  node test-runner.js     - Utilise le script alternatif"

exit 0
