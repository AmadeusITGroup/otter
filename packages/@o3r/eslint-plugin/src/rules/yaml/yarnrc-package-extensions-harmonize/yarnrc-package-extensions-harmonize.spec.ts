import { cleanVirtualFileSystem, useVirtualFileSystem } from '@o3r/test-helpers';
import { TSESLint } from '@typescript-eslint/experimental-utils';
import * as path from 'node:path';

const virtualFileSystem = useVirtualFileSystem();
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


const fakeFolder = path.resolve('/fake-folder');
const packageToLint = path.join(fakeFolder, 'local', '.yarnrc.yml');

beforeAll(async () => {
  await virtualFileSystem.promises.mkdir(path.join(fakeFolder, 'local'), {recursive: true});
  await virtualFileSystem.promises.writeFile(path.join(fakeFolder, 'local', 'package.json'), JSON.stringify(packageJsonWorkspace));

  await virtualFileSystem.promises.mkdir(path.join(fakeFolder, 'local', 'packages', 'my-package'), {recursive: true});
  await virtualFileSystem.promises.mkdir(path.join(fakeFolder, 'local', 'packages', 'my-package-2'), {recursive: true});
  await virtualFileSystem.promises.writeFile(path.join(fakeFolder, 'local', 'packages', 'my-package-2', 'package.json'), JSON.stringify(packageJson2));
});

afterAll(() => {
  cleanVirtualFileSystem();
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
            packageJsonFile: path.join(fakeFolder, 'local', 'package.json'),
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
            packageJsonFile: path.join(fakeFolder, 'local', 'package.json'),
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
