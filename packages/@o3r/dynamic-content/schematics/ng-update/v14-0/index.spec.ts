import {
  readFileSync,
} from 'node:fs';
import {
  join,
} from 'node:path';
import {
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  removeStyleLazyLoaderModule,
} from './index';

describe('Update V14.0', () => {
  let initialTree: Tree;
  let context: SchematicContext;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('angular.json', readFileSync(join(__dirname, '..', '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
    context = {
      logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        fatal: jest.fn()
      }
    } as any;
  });

  it('should remove StyleLazyLoaderModule from NgModule', () => {
    initialTree.create('src/app/example.module.ts', readFileSync(join(__dirname, 'mocks', 'ng-module.ts.mock')));
    const result = removeStyleLazyLoaderModule(initialTree, context);
    const tree = result as Tree;
    const newContent = tree.readText('src/app/example.module.ts');

    expect(newContent).not.toContain('StyleLazyLoaderModule');
    expect(newContent).not.toContain('@o3r/dynamic-content');
    expect(newContent).toContain('CommonModule');
    expect(newContent).toContain('OtherModule');
  });

  it('should remove StyleLazyLoaderModule from standalone component', () => {
    initialTree.create('src/app/example.component.ts', readFileSync(join(__dirname, 'mocks', 'standalone-component.ts.mock')));
    const result = removeStyleLazyLoaderModule(initialTree, context);
    const tree = result as Tree;
    const newContent = tree.readText('src/app/example.component.ts');

    expect(newContent).not.toContain('StyleLazyLoaderModule');
    expect(newContent).not.toContain('@o3r/dynamic-content');
    expect(newContent).toContain('CommonModule');
    expect(newContent).toContain('standalone: true');
  });

  it('should remove StyleLazyLoaderModule from multiple decorators in same file', () => {
    initialTree.create('src/app/multi.ts', readFileSync(join(__dirname, 'mocks', 'multiple-decorators.ts.mock')));
    const result = removeStyleLazyLoaderModule(initialTree, context);
    const tree = result as Tree;
    const newContent = tree.readText('src/app/multi.ts');

    expect(newContent).not.toContain('StyleLazyLoaderModule');
    expect(newContent).not.toContain('@o3r/dynamic-content');
    expect(newContent).toContain('@Component');
    expect(newContent).toContain('@NgModule');
  });

  it('should not modify files without StyleLazyLoaderModule', () => {
    const originalContent = readFileSync(join(__dirname, 'mocks', 'no-style-loader.ts.mock'), 'utf8');
    initialTree.create('src/app/no-style.module.ts', originalContent);
    const result = removeStyleLazyLoaderModule(initialTree, context);
    const tree = result as Tree;
    const newContent = tree.readText('src/app/no-style.module.ts');

    expect(newContent).toBe(originalContent);
    expect(newContent).toContain('CommonModule');
  });
});
