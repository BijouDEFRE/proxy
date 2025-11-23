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
    const cloudflowUrl = CLOUDFLOW_URL;
    // Format 1 : JSON direct
    const tryFormats = [
        {
            body: JSON.stringify({ method: 'auth.login', user_name, user_pass }),
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            description: 'JSON direct'
        },
        {
            body: JSON.stringify({ request: JSON.stringify({ method: 'auth.login', user_name, user_pass }) }),
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            description: 'JSON dans request'
        },
        {
            body: require('querystring').stringify({ action: 'login', username: user_name, password: user_pass }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
            description: 'x-www-form-urlencoded classique'
        }
    ];
    let lastError = null;
    for (const fmt of tryFormats) {
        console.log(`Test format Cloudflow : ${fmt.description}`);
        console.log('Body envoyé :', fmt.body);
        try {
            const response = await fetch(cloudflowUrl, {
                method: 'POST',
                headers: fmt.headers,
                body: fmt.body
            });
            const raw = await response.text();
            console.log('Réponse brute Cloudflow:', raw);
            let data;
            try {
                data = JSON.parse(raw);
            } catch (e) {
                data = { error: 'Réponse non JSON', raw };
            }
            // Si pas d'erreur "Missing method parameter", renvoyer la réponse
            if (!data.error_code || data.error_code !== 'Missing method parameter') {
                if (user_name === 'TEST-STMICHEL' && data && data.user_id) {
                    return res.redirect('https://bag.digitalproof.fr/PP_FILE_STORE/Public/LASERPHOT/Essais-HomePage/search-articles-STMICHEL.html');
                }
                return res.status(response.status).json(data);
            }
            lastError = data;
        } catch (err) {
            lastError = { error: 'Proxy error', details: err.message };
        }
    }
    // Si tous les formats échouent, renvoyer la dernière erreur
    res.status(400).json(lastError || { error: 'Unknown error' });
});

app.listen(PORT, () => {
    console.log(`Proxy Cloudflow lancé sur le port ${PORT}`);
});
