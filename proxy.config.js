// Used to redirect the different call using angular to specific URLs
// This serve kind of the role of a nginx or apache in PROD
// Called after the kassette proxy in browser
const PROXY_CONFIG = [
  {
    context: ['/contacts'],
    target: 'http://localhost:3000',
    secure: false
  }
];

module.exports = PROXY_CONFIG;
