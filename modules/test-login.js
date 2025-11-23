// Exemple de requête Node.js pour tester le proxy
// modules/test-login.js

const fetch = require('node-fetch');

async function testLogin() {
    const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_name: 'UTILISATEUR', // Remplace par le nom d'utilisateur réel
            user_pass: 'MOTDEPASSE'  // Remplace par le mot de passe réel
        })
    });
    const data = await response.json();
    console.log('Réponse Cloudflow :', data);
}

testLogin();
