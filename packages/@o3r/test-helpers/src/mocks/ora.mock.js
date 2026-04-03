// Mock for ora spinner library to avoid ESM import issues in Jest
// This mock can be used via moduleNameMapper in Jest config to bypass ESM-only ora package
module.exports = function ora() {
  return {
    start: function () {
      return this;
    },
    stop: function () {
      return this;
    },
    succeed: function () {
      return this;
    },
    fail: function () {
      return this;
    },
    warn: function () {
      return this;
    },
    info: function () {
      return this;
    },
    text: '',
    isSpinning: false
  };
};
