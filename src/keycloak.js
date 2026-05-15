// src/keycloak.js
import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
    url: 'https://keycloak-production-b496.up.railway.app',
    realm: 'shopzone-realm',
    clientId: 'shopzone-frontend'
});

console.log('Keycloak instance created:', keycloak);

export default keycloak;