import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as yamlParser from 'yaml-eslint-parser';
import yamlDependencyVersionsHarmonize from './yarnrc-package-extensions-harmonize';
const {
  RuleTester
} = require('@typescript-eslint/rule-tester');

const ruleTester = new RuleTester({
  languageOptions: {
    parser: yamlParser,
    parserOptions: {
      defaultYAMLVersion: '1.2'
    }
  }
} as any);

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
`.trim();

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
`.trim();

const fakeFolder = path.resolve('/fake-folder');
const relativeFakeFolder = path.relative(process.cwd(), fakeFolder);
const packageToLint = path.join(relativeFakeFolder, 'local', '.yarnrc.yml');

beforeAll(async () => {
  await fs.mkdir(path.join(fakeFolder, 'local'), { recursive: true });
  await fs.writeFile(path.join(fakeFolder, 'local', 'package.json'), JSON.stringify(packageJsonWorkspace));

  await fs.mkdir(path.join(fakeFolder, 'local', 'packages', 'my-package'), { recursive: true });
  await fs.mkdir(path.join(fakeFolder, 'local', 'packages', 'my-package-2'), { recursive: true });
  await fs.writeFile(path.join(fakeFolder, 'local', 'packages', 'my-package-2', 'package.json'), JSON.stringify(packageJson2));
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
`.trim(),
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
`.trim(),
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
