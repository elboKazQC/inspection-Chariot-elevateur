#!/bin/bash

echo "➡️  Déplacement dans le dossier du projet..."
cd inspection-form || exit 1

echo "📦 Installation des dépendances OpenAI et Markdown..."
npm install @openai/api dotenv react-markdown @types/react-markdown

echo "🔧 Installation des dépendances générales..."
npm install

echo "✅ Installation terminée !"
echo "⚠️  N'oubliez pas d'ajouter votre clé API OpenAI dans le fichier .env"
echo "➡️  Exemple :"
echo "OPENAI_API_KEY=votre-clé-api"
