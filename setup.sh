#!/bin/bash

# Création du fichier .env pour stocker la clé API OpenAI
echo "Création du fichier .env..."
echo "OPENAI_API_KEY=" > .env

# Installation des dépendances nécessaires
echo "Installation des dépendances..."
cd inspection-form
npm install @openai/api dotenv react-markdown @types/react-markdown

# Configuration de l'environnement
echo "Configuration de l'environnement..."
npm install

# Message de fin
echo "Installation terminée!"
echo "N'oubliez pas d'ajouter votre clé API OpenAI dans le fichier .env"
echo "OPENAI_API_KEY=votre-clé-api"
