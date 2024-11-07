import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  RuleTester,
} from '@typescript-eslint/rule-tester';
import * as jsonParser from 'jsonc-eslint-parser';
import jsonDependencyVersionsHarmonize, {
  VersionsHarmonizeOptions,
} from './json-dependency-versions-harmonize';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: jsonParser
  }
} as any);

const packageJsonWorkspace = {
  workspaces: [
    './packages/*'
  ],
  dependencies: {
    myDep: '^2.0.0'
  },
  engines: {
    node: '^21.0.0'
  }
};
const packageJson2 = {
  name: 'testPackage',
  dependencies: {
    myDep: '^1.0.0',
    myOtherDep: '~2.0.0'
  }
};
const fakeFolder = path.resolve('/fake-folder');
const packageToLint = path.join(fakeFolder, 'local', 'packages', 'my-package', 'package.json');
beforeAll(async () => {
  await fs.mkdir(path.join(fakeFolder, 'local'), { recursive: true });
  await fs.writeFile(path.join(fakeFolder, 'local', 'package.json'), JSON.stringify(packageJsonWorkspace));
  await fs.mkdir(path.join(fakeFolder, 'local', 'packages', 'my-package'), { recursive: true });
  await fs.mkdir(path.join(fakeFolder, 'local', 'packages', 'my-package-2'), { recursive: true });
  await fs.writeFile(path.join(fakeFolder, 'local', 'packages', 'my-package-2', 'package.json'), JSON.stringify(packageJson2));
  await fs.writeFile(packageToLint, '{}');
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
    { code: JSON.stringify({ peerDependencies: { myOtherDep: '^2.0.0' } }), filename: packageToLint, options: [{ alignPeerDependencies: false }] },
    { code: JSON.stringify({ resolutions: { 'test/sub/myDep': '1.0.0' } }), filename: packageToLint, options: [{ alignResolutions: false }] },
    { code: JSON.stringify({ overrides: { test: { myDep: '1.0.0' } } }), filename: packageToLint, options: [{ alignResolutions: false }] },
    { code: JSON.stringify({ overrides: { myDep: '1.0.0' } }), filename: packageToLint, options: [{ alignResolutions: false }] },
    { code: JSON.stringify({ engines: { node: '<20' } }), filename: packageToLint, options: [{ alignEngines: false }] },
    { code: JSON.stringify({ engines: { node: '>21.1' } }), filename: packageToLint, options: [{ alignEngines: true }] }
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
            packageJsonFile: path.join(fakeFolder, 'local', 'package.json'),
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
            packageJsonFile: path.join(fakeFolder, 'local', 'package.json'),
            version: '^2.0.0'
          },
          suggestions: [
            {
              messageId: 'versionUpdate',
              data: {
                version: '^2.0.0'
              },
              output: JSON.stringify({ dependencies: { myDep: '^2.0.0' } })
            }
          ]
        }
      ]
    },
    {
      filename: packageToLint,
      output: JSON.stringify({ peerDependencies: { myOtherDep: '~2.0.0' } }),
      code: JSON.stringify({ peerDependencies: { myOtherDep: '^2.0.0' } }),
      options: [{ alignPeerDependencies: true } as VersionsHarmonizeOptions],
      errors: [
        {
          messageId: 'error',
          data: {
            depName: 'myOtherDep',
            packageJsonFile: path.join(fakeFolder, 'local', 'packages', 'my-package-2', 'package.json'),
            version: '~2.0.0'
          },
          suggestions: [
            {
              messageId: 'versionUpdate',
              data: {
                version: '~2.0.0'
              },
              output: JSON.stringify({ peerDependencies: { myOtherDep: '~2.0.0' } })
            }
          ]
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
            packageJsonFile: path.join(fakeFolder, 'local', 'packages', 'my-package-2', 'package.json'),
            version: '~2.0.0'
          },
          suggestions: [
            {
              messageId: 'versionUpdate',
              data: {
                version: '~2.0.0'
              },
              output: JSON.stringify({ peerDependencies: { myOtherDep: '~2.0.0' } })
            }
          ]
        }
      ]
    },
    {
      filename: packageToLint,
      output: JSON.stringify({ resolutions: { 'test/sub/myDep': '^2.0.0' } }),
      code: JSON.stringify({ resolutions: { 'test/sub/myDep': '1.0.0' } }),
      options: [{ alignResolutions: true }],
      errors: [
        {
          messageId: 'error',
          data: {
            depName: 'test/sub/myDep',
            packageJsonFile: path.join(fakeFolder, 'local', 'package.json'),
            version: '^2.0.0'
          },
          suggestions: [
            {
              messageId: 'versionUpdate',
              data: {
                version: '^2.0.0'
              },
              output: JSON.stringify({ resolutions: { 'test/sub/myDep': '^2.0.0' } })
            }
          ]
        }
      ]
    },
    {
      filename: packageToLint,
      output: JSON.stringify({ overrides: { test: { myDep: '^2.0.0' } } }),
      code: JSON.stringify({ overrides: { test: { myDep: '1.0.0' } } }),
      options: [{ alignResolutions: true }],
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
              data: {
                version: '^2.0.0'
              },
              output: JSON.stringify({ overrides: { test: { myDep: '^2.0.0' } } })
            }
          ]
        }
      ]
    },
    {
      filename: packageToLint,
      output: JSON.stringify({ overrides: { myDep: '^2.0.0' } }),
      code: JSON.stringify({ overrides: { myDep: '1.0.0' } }),
      options: [{ alignResolutions: true }],
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
              data: {
                version: '^2.0.0'
              },
              output: JSON.stringify({ overrides: { myDep: '^2.0.0' } })
            }
          ]
        }
      ]
    },
    {
      filename: packageToLint,
      output: JSON.stringify({ engines: { node: '^21.0.0' } }),
      code: JSON.stringify({ engines: { node: '<20' } }),
      options: [{ alignEngines: true }],
      errors: [
        {
          messageId: 'error',
          data: {
            depName: 'node',
            packageJsonFile: path.join(fakeFolder, 'local', 'package.json'),
            version: '^21.0.0'
          },
          suggestions: [
            {
              messageId: 'versionUpdate',
              data: {
                version: '^21.0.0'
              },
              output: JSON.stringify({ engines: { node: '^21.0.0' } })
            }
          ]
        }
      ]
    }
  ]
});
