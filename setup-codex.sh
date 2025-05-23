#!/bin/bash
# Script de configuration pour Codex à la racine du projet
# Ce script appelle simplement le script dans le répertoire inspection-form

echo "Redirection vers le script dans inspection-form..."
cd inspection-form || exit 1

# Si le script existe, exécutez-le
if [ -f "setup-codex.sh" ]; then
    echo "Exécution de setup-codex.sh..."
    bash ./setup-codex.sh
else
    echo "Création du script setup-codex.sh..."

    # Créer le script si nécessaire
    cat > setup-codex.sh << 'EOL'
#!/bin/bash
# Script de configuration pour l'environnement Codex (version Bash)
# Ce script résout les problèmes de permissions sur react-scripts

echo -e "\033[33mConfiguration de l'environnement Codex pour les tests...\033[0m"

# Installation des dépendances
echo -e "\033[36mInstallation des dépendances npm...\033[0m"
npm install

# Installation spécifique pour jest-dom
echo -e "\033[36mInstallation de jest-dom...\033[0m"
npm install @testing-library/jest-dom --save-dev

# Réparer les permissions de react-scripts
if [ -f "node_modules/.bin/react-scripts" ]; then
    echo -e "\033[36mCorrection des permissions sur react-scripts...\033[0m"
    chmod +x node_modules/.bin/react-scripts
fi

# Vérifier que les node_modules sont bien installés
if [ -f "node_modules/react-scripts/bin/react-scripts.js" ]; then
    echo -e "\033[32mreact-scripts est correctement installé.\033[0m"
else
    echo -e "\033[31mERREUR: react-scripts n'a pas été trouvé!\033[0m"
    echo -e "\033[33mTentative de réparation avec une installation ciblée...\033[0m"
    npm install react-scripts --save-dev
fi

# Créer un script de test alternatif qui utilise Node directement au lieu de react-scripts
cat > test-runner.js << 'EOF'
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
EOF

# Rendre le script de test exécutable aussi
chmod +x test-runner.js

echo -e "\n\033[32mConfiguration terminée!\033[0m"
echo -e "\033[36mPour exécuter les tests, utilisez l'une des commandes suivantes:\033[0m"
echo -e "  npm test                - Utilise react-scripts standard"
echo -e "  node test-runner.js     - Utilise le script alternatif"
EOL

    # Rendre le script exécutable
    chmod +x setup-codex.sh

    # Exécuter le script
    bash ./setup-codex.sh
fi

exit 0
