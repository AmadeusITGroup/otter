// Mock for uuid library to avoid ESM import issues in Jest
// This mock can be used via moduleNameMapper in Jest config to bypass ESM-only uuid package
let counter = 0;

module.exports = {
  v4: () => {
    const id = counter++;
    return `00000000-0000-0000-0000-${id.toString().padStart(12, '0')}`;
  }
};
