import * as path from 'node:path';
import * as fs from 'node:fs';
import { TSESLint } from '@typescript-eslint/experimental-utils';
import yamlDependencyVersionsHarmonize from './yarnrc-package-extensions-harmonize';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('yaml-eslint-parser'),
  parserOptions: {
    defaultYAMLVersion: '1.2'
  }
});

const packageJsonWorkspace = {
  workspaces: [
    './packages/*'
  ],
  dependencies: {
    myDep: '^2.0.0'
  }
};

const packageJson2 = {
  name: 'testPackage',
  dependencies: {
    myDep: '^1.0.0',
    myOtherDep: '~2.0.0'
  }
};


const yamlToUpdate = `
nodeLinker: pnp

packageExtensions:
  "myOtherDep@~1.0.0":
    peerDependencies:
      "myDep": ~1.0.0
  "@nx/angular@^17.1.1":
    dependencies:
      "myDep": ^1.0.0
  "@nx/core@^17.1.1":
    toIgnore:
      "myDep": ~1.0.0
`;

const bestVersionYaml = `
nodeLinker: pnp

packageExtensions:
  "myOtherDep@~1.0.0":
    peerDependencies:
      "myDep": ^2.0.0
  "@nx/angular@^17.1.1":
    dependencies:
      "myDep": ^2.0.0
  "@nx/core@^17.1.1":
    toIgnore:
      "myDep": ~1.0.0
`;


const packageToLint = path.resolve(__dirname, 'local', '.yarnrc.yml');

beforeAll(() => {
  fs.mkdirSync(path.resolve(__dirname, 'local'));
  fs.writeFileSync(path.resolve(__dirname, 'local', 'package.json'), JSON.stringify(packageJsonWorkspace));

  fs.mkdirSync(path.resolve(__dirname, 'local', 'packages'));
  fs.mkdirSync(path.resolve(__dirname, 'local', 'packages', 'my-package'));
  fs.mkdirSync(path.resolve(__dirname, 'local', 'packages', 'my-package-2'));
  fs.writeFileSync(path.resolve(__dirname, 'local', 'packages', 'my-package-2', 'package.json'), JSON.stringify(packageJson2));
});

afterAll(() => {
  fs.rmSync(path.resolve(__dirname, 'local'), {recursive: true, force: true});
});

ruleTester.run('json-dependency-versions-harmonize', yamlDependencyVersionsHarmonize, {
  valid: [
    { code: bestVersionYaml, filename: packageToLint }
  ],
  invalid: [
    {
      filename: packageToLint,
      output: bestVersionYaml,
      code: yamlToUpdate,
      errors: [
        {
          messageId: 'error',
          data: {
            depName: 'myDep',
            packageJsonFile: path.resolve(__dirname, 'local', 'package.json'),
            version: '^2.0.0'
          },
          suggestions: [
            {
              messageId: 'versionUpdate',
              output: `
nodeLinker: pnp

packageExtensions:
  "myOtherDep@~1.0.0":
    peerDependencies:
      "myDep": ^2.0.0
  "@nx/angular@^17.1.1":
    dependencies:
      "myDep": ^1.0.0
  "@nx/core@^17.1.1":
    toIgnore:
      "myDep": ~1.0.0
`,
              data: {
                version: '^2.0.0'
              }
            }
          ]
        },
        {
          messageId: 'error',
          data: {
            depName: 'myDep',
            packageJsonFile: path.resolve(__dirname, 'local', 'package.json'),
            version: '^2.0.0'
          },
          suggestions: [
            {
              messageId: 'versionUpdate',
              output: `
nodeLinker: pnp

packageExtensions:
  "myOtherDep@~1.0.0":
    peerDependencies:
      "myDep": ~1.0.0
  "@nx/angular@^17.1.1":
    dependencies:
      "myDep": ^2.0.0
  "@nx/core@^17.1.1":
    toIgnore:
      "myDep": ~1.0.0
`,
              data: {
                version: '^2.0.0'
              }
            }
          ]
        }
      ]
    }
  ]
});
