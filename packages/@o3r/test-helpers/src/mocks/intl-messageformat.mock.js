// Mock for intl-messageformat library to avoid ESM import issues in Jest
// This mock can be used via moduleNameMapper in Jest config to bypass ESM-only @inquirer/confirm package
module.exports = {
  __esModule: true,
  default: () => Promise.resolve(true)
};
