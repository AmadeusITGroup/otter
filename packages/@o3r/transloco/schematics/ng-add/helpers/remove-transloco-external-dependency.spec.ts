import {
  callRule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  firstValueFrom,
} from 'rxjs';
import {
  removeTranslocoExternalDependency,
} from './remove-transloco-external-dependency';

const context = { logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() } } as unknown as SchematicContext;

// angular.json with `@o3r/transloco` previously added to externalDependencies by the `@o3r/components` migration
const angularJsonMock = (build: Record<string, unknown>) => JSON.stringify({
  version: 1,
  projects: {
    'test-app': {
      projectType: 'application',
      root: '.',
      architect: { build }
    }
  }
}, null, 2);

describe('removeTranslocoExternalDependency', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = Tree.empty();
    jest.clearAllMocks();
  });

  it('should remove @o3r/transloco from externalDependencies while keeping other entries', async () => {
    tree.create('angular.json', angularJsonMock({
      builder: '@angular/build:application',
      options: { externalDependencies: ['some-other-pkg', '@o3r/transloco'] }
    }));

    await firstValueFrom(callRule(removeTranslocoExternalDependency, tree, context));

    const externals = JSON.parse(tree.readText('angular.json')).projects['test-app'].architect.build.options.externalDependencies;
    expect(externals).toEqual(['some-other-pkg']);
  });

  it('should drop the externalDependencies option entirely when @o3r/transloco was the only entry', async () => {
    tree.create('angular.json', angularJsonMock({
      builder: '@angular/build:application',
      options: { externalDependencies: ['@o3r/transloco'], tsConfig: 'tsconfig.json' }
    }));

    await firstValueFrom(callRule(removeTranslocoExternalDependency, tree, context));

    const options = JSON.parse(tree.readText('angular.json')).projects['test-app'].architect.build.options;
    expect(options.externalDependencies).toBeUndefined();
    expect(options.tsConfig).toBe('tsconfig.json');
  });

  it('should warn to remove the IgnorePlugin for custom-webpack builders without touching angular.json', async () => {
    const original = angularJsonMock({
      builder: '@angular-builders/custom-webpack:browser',
      options: { customWebpackConfig: { path: './webpack.config.js' } }
    });
    tree.create('angular.json', original);

    await firstValueFrom(callRule(removeTranslocoExternalDependency, tree, context));

    expect(tree.readText('angular.json')).toEqual(original);
    const warnMock = context.logger.warn as jest.Mock;
    expect(warnMock).toHaveBeenCalledWith(expect.stringContaining('./webpack.config.js'));
    expect(warnMock).toHaveBeenCalledWith(expect.stringContaining('IgnorePlugin'));
    expect(warnMock).toHaveBeenCalledWith(expect.stringContaining('@o3r/transloco'));
  });

  it('should leave angular.json untouched when @o3r/transloco is not in externalDependencies', async () => {
    const original = angularJsonMock({
      builder: '@angular/build:application',
      options: { externalDependencies: ['some-other-pkg'] }
    });
    tree.create('angular.json', original);

    await firstValueFrom(callRule(removeTranslocoExternalDependency, tree, context));

    expect(tree.readText('angular.json')).toEqual(original);
  });
});
