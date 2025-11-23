// backend-proxy.js
// Proxy Node.js Express pour Cloudflow

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const querystring = require('querystring');
const os = require('os');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const CLOUDFLOW_URL = process.env.CLOUDFLOW_URL || 'https://bag.digitalproof.fr/portal.cgi';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Accept'],
}));

// Log global pour toutes les requêtes
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Suppression du support HTTPS local pour Render

// Route de login
app.post('/login', async (req, res) => {
    // Log du corps reçu
    console.log('Corps reçu du front:', req.body);
    const { user_name, user_pass } = req.body;
    if (!user_name || !user_pass) {
        return res.status(400).json({ error: 'Missing credentials' });
    }
    // Envoi des paramètres uniquement dans le body (x-www-form-urlencoded)
    const cloudflowBody = require('querystring').stringify({
        method: 'auth.login',
        user_name,
        user_pass
    });
    const cloudflowUrl = CLOUDFLOW_URL;
    console.log('Body envoyé à Cloudflow:', cloudflowBody);
    console.log('URL envoyée à Cloudflow:', cloudflowUrl);
    console.log('Headers envoyés à Cloudflow:', {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
    });
    try {
        const response = await fetch(cloudflowUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: cloudflowBody
        });
        const raw = await response.text();
        console.log('Réponse brute Cloudflow:', raw);
        let data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            data = { error: 'Réponse non JSON', raw };
        }
        // Si l'utilisateur est TEST-STMICHEL, rediriger vers la page dédiée
        if (user_name === 'TEST-STMICHEL' && data && data.user_id) {
            return res.redirect('https://bag.digitalproof.fr/PP_FILE_STORE/Public/LASERPHOT/Essais-HomePage/search-articles-STMICHEL.html');
        }
        // Sinon, renvoyer la réponse Cloudflow
        res.status(response.status).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Proxy error', details: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy Cloudflow lancé sur le port ${PORT}`);
});
