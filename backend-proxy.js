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
        // Log du corps reçu
        console.log('==== POST /login reçu ====');
        console.log('Headers:', req.headers);
        console.log('Body brut:', req.body);
        if (!user_name || !user_pass) {
            console.log('Erreur : credentials manquants');
            return res.status(400).json({ error: 'Missing credentials' });
        }

        // Format 1 : JSON direct
        const bodyJson = JSON.stringify({
            method: 'auth.login',
            user_name,
            user_pass
        });
        console.log('Test Format 1 (JSON direct)');
        try {
            const response1 = await fetch(CLOUDFLOW_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: bodyJson
            });
            const raw1 = await response1.text();
            console.log('Réponse Format 1:', raw1);
            let data1;
            try { data1 = JSON.parse(raw1); } catch (e) { data1 = { error: 'Réponse non JSON', raw: raw1 }; }
            if (!data1.error && data1.user_id) {
                if (user_name === 'TEST-STMICHEL') {
                    return res.redirect('https://bag.digitalproof.fr/PP_FILE_STORE/Public/LASERPHOT/Essais-HomePage/search-articles-STMICHEL.html');
                }
                return res.status(response1.status).json(data1);
            }
            // Format 2 : request=JSON
            const bodyRequest = require('querystring').stringify({
                request: JSON.stringify({ method: 'auth.login', user_name, user_pass })
            });
            console.log('Test Format 2 (request=JSON)');
            const response2 = await fetch(CLOUDFLOW_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: bodyRequest
            });
            const raw2 = await response2.text();
            console.log('Réponse Format 2:', raw2);
            let data2;
            try { data2 = JSON.parse(raw2); } catch (e) { data2 = { error: 'Réponse non JSON', raw: raw2 }; }
            if (!data2.error && data2.user_id) {
                if (user_name === 'TEST-STMICHEL') {
                    return res.redirect('https://bag.digitalproof.fr/PP_FILE_STORE/Public/LASERPHOT/Essais-HomePage/search-articles-STMICHEL.html');
                }
                return res.status(response2.status).json(data2);
            }
            // Format 3 : classique
            const bodyClassic = require('querystring').stringify({
                action: 'login',
                username: user_name,
                password: user_pass
            });
            console.log('Test Format 3 (classique)');
            const response3 = await fetch(CLOUDFLOW_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: bodyClassic
            });
            const raw3 = await response3.text();
            console.log('Réponse Format 3:', raw3);
            let data3;
            try { data3 = JSON.parse(raw3); } catch (e) { data3 = { error: 'Réponse non JSON', raw: raw3 }; }
            if (!data3.error && data3.user_id) {
                if (user_name === 'TEST-STMICHEL') {
                    return res.redirect('https://bag.digitalproof.fr/PP_FILE_STORE/Public/LASERPHOT/Essais-HomePage/search-articles-STMICHEL.html');
                }
                return res.status(response3.status).json(data3);
            }
            // Si aucun format ne fonctionne, renvoyer la dernière réponse
            return res.status(400).json({
                error: 'Aucun format accepté par Cloudflow',
                format1: data1,
                format2: data2,
                format3: data3
            });
        } catch (err) {
            console.log('Erreur proxy:', err);
            res.status(500).json({ error: 'Proxy error', details: err.message });
        }
});

app.listen(PORT, () => {
    console.log(`Proxy Cloudflow lancé sur le port ${PORT}`);
});
