import {
  callRule,
  EmptyTree,
} from '@angular-devkit/schematics';
import {
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import {
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import {
  lastValueFrom,
} from 'rxjs';
import {
  setupDependencies,
} from './dependencies';

describe('setupDependencies', () => {
  let initialTree: UnitTestTree;

  beforeEach(() => {
    initialTree = new UnitTestTree(new EmptyTree());
    initialTree.create('package.json', JSON.stringify({ name: 'test-package', version: '0.0.0-test' }));
  });

  test('should apply enforceTildeRange when requested as option', async () => {
    const logger = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };
    const setup = setupDependencies({
      enforceTildeRange: true,
      skipInstall: true,
      dependencies: {
        testDep: {
          inManifest: [
            {
              range: '^1.2.3',
              types: [NodeDependencyType.Dev]
            }
          ]
        }
      }
    });
    const tree = await lastValueFrom(callRule(setup, initialTree, { logger } as any));
    const pck = JSON.parse(tree.readText('package.json'));
    expect(pck.devDependencies.testDep).toBe('~1.2.3');
  });

  test('should apply enforceTildeRange per default', async () => {
    const logger = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };
    const setup = setupDependencies({
      skipInstall: true,
      dependencies: {
        testDep: {
          inManifest: [
            {
              range: '^1.2.3',
              types: [NodeDependencyType.Dev]
            }
          ]
        }
      }
    });
    const tree = await lastValueFrom(callRule(setup, initialTree, { logger } as any));
    const pck = JSON.parse(tree.readText('package.json'));
    expect(pck.devDependencies.testDep).toBe('~1.2.3');
  });

  test('should apply enforceTildeRange when requested specifically', async () => {
    const logger = { debug: jest.fn(), warn: jest.fn(), logger: jest.fn() };
    const setup = setupDependencies({
      enforceTildeRange: false,
      skipInstall: true,
      dependencies: {
        testDep: {
          enforceTildeRange: true,
          inManifest: [
            {
              range: '^1.2.3',
              types: [NodeDependencyType.Dev]
            }
          ]
        }
      }
    });
    const tree = await lastValueFrom(callRule(setup, initialTree, { logger } as any));
    const pck = JSON.parse(tree.readText('package.json'));
    expect(pck.devDependencies.testDep).toBe('~1.2.3');
  });

  test('should not apply enforceTildeRange when set to false', async () => {
    const logger = { debug: jest.fn(), warn: jest.fn(), error: jest.fn() };
    const setup = setupDependencies({
      enforceTildeRange: false,
      skipInstall: true,
      dependencies: {
        testDep: {
          inManifest: [
            {
              range: '^1.2.3',
              types: [NodeDependencyType.Dev]
            }
          ]
        }
      }
    });
    const tree = await lastValueFrom(callRule(setup, initialTree, { logger } as any));
    const pck = JSON.parse(tree.readText('package.json'));
    expect(pck.devDependencies.testDep).toBe('^1.2.3');
  });
});
