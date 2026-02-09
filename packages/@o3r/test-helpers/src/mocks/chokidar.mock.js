// Mock for chokidar library to avoid ESM import issues in Jest
// This mock can be used via moduleNameMapper in Jest config to bypass ESM-only chokidar package
module.exports = {
  __esModule: true,
  default: () => Promise.resolve(true)
};
