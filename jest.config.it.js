const getJestConfig = require('./jest.config.ut').getJestConfig;


/**
 * @param rootDir {string}
 * @returns {import('ts-jest/dist/types').JestConfigWithTsJest}
 */
module.exports.getJestConfig = (rootDir) => ({
  ...getJestConfig(rootDir, false),
  rootDir: '..',
  setupFilesAfterEnv: null,
  testPathIgnorePatterns: [
    '<rootDir>/.*/templates/.*'
  ],
  testMatch: [
    '<rootDir>/**/*.it.spec.ts'
  ],
  reporters: [
    'default',
    ['jest-junit', {outputDirectory: '<rootDir>/dist-test', outputName: 'it-report.xml'}],
    'github-actions'
  ],
  testTimeout: 30 * 60 * 1000
});
