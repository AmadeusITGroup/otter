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
  enforceTildeRange,
  setupDependencies,
} from './dependencies';

describe('enforceTildeRange', () => {
  test('should change caret range', () => {
    expect(enforceTildeRange('^1.2.3')).toBe('~1.2.3');
  });

  test('should change caret handle undefined', () => {
    expect(enforceTildeRange()).not.toBeDefined();
  });

  test('should not change pint range', () => {
    expect(enforceTildeRange('1.2.3')).toBe('1.2.3');
  });

  test('should change multi caret range', () => {
    expect(enforceTildeRange('^1.2.3 | 1.0.0 | ^1.1.0')).toBe('~1.2.3 | 1.0.0 | ~1.1.0');
  });
});

describe('setupDependencies', () => {
  let initialTree: UnitTestTree;

  beforeEach(() => {
    initialTree = new UnitTestTree(new EmptyTree());
    initialTree.create('package.json', JSON.stringify({ name: 'test-package', version: '0.0.0-test' }));
  });

  test('should apply enforceTildeRange when requested as option', async () => {
    const logger = { debug: jest.fn(), warn: jest.fn() };
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
    const logger = { debug: jest.fn(), warn: jest.fn() };
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
    const logger = { debug: jest.fn(), warn: jest.fn() };
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
    const logger = { debug: jest.fn(), warn: jest.fn() };
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
