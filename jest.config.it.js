const getJestProjectConfig = require('./jest.config.ut').getJestProjectConfig;


/**
 * @param rootDir {string}
 * @returns {import('ts-jest/dist/types').JestConfigWithTsJest}
 */
module.exports.getJestConfig = (rootDir) => ({
  ...getJestProjectConfig(rootDir, false),
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
