/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  displayName: require('./package.json').name,
  preset: 'ts-jest',
  setupFiles: ['<rootDir>/testing/jest.setup.ts'],
  testEnvironment: 'node',
  rootDir: '.',
  globals: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html$',
    }
  },
  reporters: [
    'default',
    'github-actions'
  ]
};
