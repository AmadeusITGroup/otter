# Tests setup

With the focus on simplicity we chosed to use [JEST](https://jestjs.io) as Testing Framework for our unit and integration tests, which aims to work with a minimum set of configurations, on most js projects.  

You can follow the [official documentation](https://jestjs.io/docs/getting-started) to setup the testing for your project.  
  
To be easier to integrate the testing structure in your project, in the next section we showcase the testing configuration done for our otter-demo-app.

## Showcase (otter-demo-app)

### Integrate jest packages

First thing is to add jest dependencies in your _package.json_. Add the following _dev dependencies_ (the version of packages is subject to evolve).

```
  "@types/jest": "^27.0.2",
  "jest": "^27.0.6",
  "jest-junit": "^12.2.0",
  "jest-preset-angular": "^9.0.5",
```

### Jest config file

Add _jest.config.js_ file at the root of your project.

```javascript
/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
module.exports = {
  preset: 'jest-preset-angular',
  rootDir: '.',
  setupFilesAfterEnv: ['<rootDir>/testing/setup-jest.ts'],
  transformIgnorePatterns: ['\\.js$'],
  moduleNameMapper: {
    '@o3r/testing/core(/?.*)': ['<rootDir>/node_modules/@o3r/testing/core/angular$1'] // otter testing core redirection to angular implementation
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

As you can see there are references to a _setup-jest.ts_ and _tsconfig.spec.json_ files which we chose to put under a _testing_ folder at the root.

### Ts config and setup jest for angular

_setup-jest.ts_ files contains the setup done for jest to be used in angular context

```typescript
import 'isomorphic-fetch';
import 'jest-preset-angular/setup-jest';
import '@angular/localize/init';
```

_tsconfig.json_ contains a simple setup for typescript transpilation with one mention related to _compilerOptions paths_ where we redirect all imports of the helpers from _@o3r/testing/core_, to the angular implementation of this helpers. It's similar with the configuration done in _jest.config.js_ for module mappers.

```json
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

As you may notice, we consider as test files all files ending in _.spec.ts_ and _.int-spec.ts_ .

Once done with the configuration it is the time to run your tests.

### Running the tests

Add the following section to your package.json:

```
{
  "scripts": {
    "test": "jest"
  }
}
```

To run the tests in the CI you can use _--ci_ option. More about jest option in the [official documentation](https://jestjs.io/docs/cli)
