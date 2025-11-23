# BACK-END Cloudflow Proxy

Ce dossier contient le proxy Node.js pour l'authentification Cloudflow.

## Structure
- `backend-proxy.js` : Script principal du proxy
- `modules/` : Modules Node.js personnalisés
- `config/` : Fichiers de configuration
- `logs/` : Fichiers de logs

## Installation
1. Installer Node.js
2. Installer les dépendances : `npm install express body-parser node-fetch`
3. Lancer le serveur : `node backend-proxy.js`

## Utilisation
Envoyer une requête POST à `/login` avec `user_name` et `user_pass`.# proxy
