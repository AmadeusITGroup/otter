import * as path from 'node:path';
import * as fs from 'node:fs';
import { TSESLint } from '@typescript-eslint/experimental-utils';
import jsonDependencyVersionsHarmonize from './json-dependency-versions-harmonize';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('jsonc-eslint-parser'),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
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

const packageToLint = path.resolve(__dirname, 'local', 'packages', 'my-package', 'package.json');

beforeAll(() => {
  fs.mkdirSync(path.resolve(__dirname, 'local'));
  fs.writeFileSync(path.resolve(__dirname, 'local', 'package.json'), JSON.stringify(packageJsonWorkspace));

  fs.mkdirSync(path.resolve(__dirname, 'local', 'packages'));
  fs.mkdirSync(path.resolve(__dirname, 'local', 'packages', 'my-package'));
  fs.mkdirSync(path.resolve(__dirname, 'local', 'packages', 'my-package-2'));
  fs.writeFileSync(path.resolve(__dirname, 'local', 'packages', 'my-package-2', 'package.json'), JSON.stringify(packageJson2));

  fs.writeFileSync(packageToLint, '{}');
});

afterAll(() => {
  fs.rmSync(path.resolve(__dirname, 'local'), {recursive: true, force: true});
});

ruleTester.run('json-dependency-versions-harmonize', jsonDependencyVersionsHarmonize, {
  valid: [
    { code: JSON.stringify({ dependencies: { myDep: '^2.0.0' } }), filename: packageToLint },
    { code: JSON.stringify({ dependencies: { myDep: '~2.0.0' } }), filename: packageToLint },
    { code: JSON.stringify({ dependencies: { myOtherDep: '~2.0.0' } }), filename: packageToLint },
    { code: JSON.stringify({ dependencies: { myOtherDep: '~3.0.0' } }), filename: packageToLint },
    { code: JSON.stringify({ dependencies: { myUniqueDep: 'https://invalid-range.com' } }), filename: packageToLint },
    { code: JSON.stringify({ dependencies: { myDep: '1.0.0' } }), filename: packageToLint, options: [{ ignoredDependencies: ['myDep'] }] },
    { code: JSON.stringify({ dependencies: { myDep: '1.0.0' } }), filename: packageToLint, options: [{ ignoredDependencies: ['my*'] }] },
    { code: JSON.stringify({ dependencies: { myOtherDep: '1.0.0' } }), filename: packageToLint, options: [{ ignoredPackages: ['testPackage'] }] },
    { code: JSON.stringify({ peerDependencies: { myOtherDep: '^2.0.0' } }), filename: packageToLint, options: [{ alignPeerDependencies: false }] }
  ],
  invalid: [
    {
      filename: packageToLint,
      output: JSON.stringify({ dependencies: { myDep: '^2.0.0' } }),
      code: JSON.stringify({ dependencies: { myDep: '1.0.0' } }),
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
              output: JSON.stringify({ dependencies: { myDep: '^2.0.0' } }),
              data: {
                version: '^2.0.0'
              }
            }
          ]
        }
      ]
    },
    {
      filename: packageToLint,
      output: JSON.stringify({ dependencies: { myDep: '^2.0.0' } }),
      code: JSON.stringify({ dependencies: { myDep: 'https://invalid-range.com' } }),
      errors: [
        {
          messageId: 'error',
          data: {
            depName: 'myDep',
            packageJsonFile: path.resolve(__dirname, 'local', 'package.json'),
            version: '^2.0.0'
          }
        }
      ]
    },
    {
      filename: packageToLint,
      output: JSON.stringify({ peerDependencies: { myOtherDep: '~2.0.0' } }),
      code: JSON.stringify({ peerDependencies: { myOtherDep: '^2.0.0' } }),
      options: [{ alignPeerDependencies: true }],
      errors: [
        {
          messageId: 'error',
          data: {
            depName: 'myOtherDep',
            packageJsonFile: path.resolve(__dirname, 'local', 'packages', 'my-package-2', 'package.json'),
            version: '~2.0.0'
          }
        }
      ]
    },
    {
      filename: packageToLint,
      output: JSON.stringify({ peerDependencies: { myOtherDep: '~2.0.0' } }),
      code: JSON.stringify({ peerDependencies: { myOtherDep: '^1.0.0' } }),
      options: [{ alignPeerDependencies: false }],
      errors: [
        {
          messageId: 'error',
          data: {
            depName: 'myOtherDep',
            packageJsonFile: path.resolve(__dirname, 'local', 'packages', 'my-package-2', 'package.json'),
            version: '~2.0.0'
          }
        }
      ]
    }
  ]
});
