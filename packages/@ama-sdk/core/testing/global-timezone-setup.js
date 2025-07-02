const process = require('node:process');
// Used to test edge case around daylight saving changes
const globalTimezoneSetup = async () => {
  process.env.TZ = 'Europe/Rome';
};
module.exports = globalTimezoneSetup;
