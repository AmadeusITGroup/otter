# Tests setup

With the focus on simplicity, we chose to use [Jest](https://jestjs.io) as the Testing Framework for our unit and integration tests, which aims to work with a minimum set of configurations, on most js projects.

You can follow the [official documentation](https://jestjs.io/docs/getting-started) to set up the testing for your project.

To facilitate the integration of the testing structure in your project, we present in the next section the testing configuration implemented for our otter-demo-app.

## Showcase (otter-demo-app)

### Integrate jest packages

First thing is to add jest dependencies in your `package.json`. Add the following `devDependencies` (the version of packages is subject to evolve).

```json5
"@types/jest": "^27.0.2",
"jest": "^27.0.6",
"jest-junit": "^12.2.0",
"jest-preset-angular": "^9.0.5",
```

### Jest config file

Add the `jest.config.js` file at the root of your project.

```javascript
/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  preset: 'jest-preset-angular',
  rootDir: '.',
  setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.ts'],
  transformIgnorePatterns: ['\\.js$'],
  moduleNameMapper: {
    '@o3r/testing/core(/?.*)': ['<rootDir>/node_modules/@o3r/testing/core/angular$1'] // otter testing core redirection to Angular implementation
  },
  testMatch: [ '**/?(*.)+(int-spec|spec).ts' ],
  reporters: [
    'default',
    'github-actions'
  ],
  globalSetup: 'jest-preset-angular/global-setup',
  transform: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '^.+\\.tsx?$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$'
      }
    ]
  }
};
```

As you can see, there are references to the files `setup-jest.ts` and `tsconfig.spec.json`, which we chose to put under a `testing` folder at the root.

### Typescript config and Jest setup for Angular

`setup-jest.ts` contains the setup for Jest to be used in an Angular context.

```typescript
import 'isomorphic-fetch';
import 'jest-preset-angular/setup-jest';
import '@angular/localize/init';
```

`tsconfig.json` contains a simple setup for transpiling Typescript, including the `paths` property of `compilerOptions` where we redirect all imports of the helpers from `@o3r/testing/core` to the Angular implementation of these helpers.
It is similar with the configuration made in `jest.config.js` for module mappers.

```json5
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "declaration": false,
    "downlevelIteration": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "strictPropertyInitialization": false,
    "strictNullChecks": false,
    "esModuleInterop": true,
    "baseUrl": "..",
    "rootDir": "..",
    "types": [
      "jest",
      "node"
    ],
    "paths": {
      "@o3r/testing/core": ["node_modules/@o3r/testing/core/angular"],
      "@o3r/testing/core*": ["node_modules/@o3r/testing/core/angular*"]
    }
  },
  "exclude": [
    "node_modules/**"
  ],
  "include": [
    "../src/**/*.spec.ts",
    "../src/**/*.int-spec.ts"
  ]
}
```

As you may notice, we consider all files ending in `.spec.ts` and `.int-spec.ts` to be test files.

Once configuration is complete, it is the time to run the tests.

### Running the tests

Add the following section to your `package.json`:

```json5
{
  "scripts": {
    "test": "jest"
  }
}
```

To run the tests in the CI you can use `--ci` option. You can find more about Jest options in the [official documentation](https://jestjs.io/docs/cli).
