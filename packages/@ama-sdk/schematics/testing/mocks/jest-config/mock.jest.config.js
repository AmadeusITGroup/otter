/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  displayName: require('./package.json').name,
  preset: 'ts-jest',
  rootDir: '.',
  roots: ['<rootDir>/src/'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: '<rootDir>/dist-test', suiteName: '<% if (projectName) { %>@<%=projectName%>/<% } %><%=projectPackageName%> unit tests' }]
  ]
};
