// Used to test edge case around daylight saving changes
const process = require('node:process');
module.exports = async () => {
  process.env.TZ = 'Europe/Rome';
}
