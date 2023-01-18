const { resolve } = require('path');

/** @type {import("renovate/dist/config/types").AllConfig} */
module.exports = {
  allowPostUpgradeCommandTemplating: true,
  cacheDir: resolve(__dirname, '..','.cache', 'renovate'),
  platform: 'azure',
  endpoint: 'https://dev.azure.com/<%= organizationName %>',
  token: process.env.TOKEN,
  hostRules: [
    {
      hostType: 'npm',
      matchHost: 'pkgs.dev.azure.com',
      username: '<%= organizationName %>',
      password: process.env.TOKEN,
    },
    {
      matchHost: 'github.com',
      token: process.env.GITHUB_COM_TOKEN,
    }
  ],
  allowedPostUpgradeCommands: [
    '^yarn install',
    '^yarn ng update',
    '^yarn run',
    '^npm install',
    '^npm run',
    '^npx'
  ],
  repositories: [
    // Include packages here
    // example: "AmadeusDigitalAirline/ng-airline-core"
  ]
};
