import {
  logging
} from '@angular-devkit/core';
import {
  Tree
} from '@angular-devkit/schematics';
import * as ts from 'typescript';
import {
  updateImportsInFile
} from '@o3r/schematics';

describe('updateImportsInFile', () => {
  const logger = {
    debug: jest.fn(),
    info: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  } as any as logging.Logger;

  it('should replace imports in a file', () => {
    const fileName = 'test.ts';
    const originalFileContent = `
      import {DontTouchThis} from 'leave-me-alone';
      import {MyAwesomeService, MyVeryOldService} from 'my-decent-package';
      const myVeryOldService = new MyVeryOldService();
    `;
    const tree = Tree.empty();
    tree.create(fileName, originalFileContent);
    const sourceFile = ts.createSourceFile(fileName, originalFileContent, ts.ScriptTarget.ES2015, true);
    const importsRegexp = /^MyVeryOldService$/;
    const renamePackagesRegexp = /^my-decent-package$/;

    const mapImports = {
      'my-decent-package': {
        MyVeryOldService: {
          newPackage: 'my-brand-new-package',
          newValue: 'MyVeryNewService'
        }
      }
    };
    const renamedPackages = {};

    const unresolvedImports = updateImportsInFile(logger, tree, sourceFile, importsRegexp, renamePackagesRegexp, mapImports, renamedPackages);
    const finalFileContent = tree.readText(fileName);

    expect(unresolvedImports).toBe(1);
    expect(finalFileContent).toContain('import {DontTouchThis} from \'leave-me-alone\';');
    expect(finalFileContent).toContain('import {MyAwesomeService} from \'my-decent-package\';');
    expect(finalFileContent).toContain('import {MyVeryNewService} from \'my-brand-new-package\';');
    expect(finalFileContent).toContain('const myVeryOldService = new MyVeryNewService();');
  });

  it('should rename packages', () => {
    const fileName = 'test.ts';
    const originalFileContent = `
      import {DontTouchThis} from 'leave-me-alone';
      import {MyAwesomeService, MyVeryOldService} from 'my-decent-package';
      const myVeryOldService = new MyVeryOldService();
    `;
    const tree = Tree.empty();
    tree.create(fileName, originalFileContent);
    const sourceFile = ts.createSourceFile(fileName, originalFileContent, ts.ScriptTarget.ES2015, true);
    const importsRegexp = /^MyVeryOldService$/;
    const renamePackagesRegexp = /^my-decent-package$/;
    const mapImports = {
      'my-decent-package': {
        MyVeryOldService: {
          newPackage: 'my-brand-new-package',
          newValue: 'MyVeryNewService'
        }
      }
    };
    const renamedPackages = {
      'my-decent-package': 'my-slightly-better-package'
    };

    const unresolvedImports = updateImportsInFile(logger, tree, sourceFile, importsRegexp, renamePackagesRegexp, mapImports, renamedPackages);
    const finalFileContent = tree.readText(fileName);

    expect(unresolvedImports).toBe(0);
    expect(finalFileContent).toContain('import {DontTouchThis} from \'leave-me-alone\';');
    expect(finalFileContent).toContain('import {MyAwesomeService, MyVeryNewService} from \'my-slightly-better-package\';');
    expect(finalFileContent).toContain('const myVeryOldService = new MyVeryNewService();');
    expect(finalFileContent).not.toContain('my-decent-package');
  });

  it('should not remove existing imports', () => {
    const fileName = 'test.ts';
    const originalFileContent = `
      import type {DontTouchThis} from 'leave-me-alone';
      import {type DontTouchThat} from 'leave-me-alone';
    `;
    const tree = Tree.empty();
    tree.create(fileName, originalFileContent);
    const sourceFile = ts.createSourceFile(fileName, originalFileContent, ts.ScriptTarget.ES2015, true);
    const importsRegexp = /^SomethingElse$/;
    const renamePackagesRegexp = /^leave-me-alone/;
    const mapImports = {
      'leave-me-alone': {
        SomethingElse: {
          newPackage: 'somewhere-else'
        }
      }
    };
    const renamedPackages = {};

    const unresolvedImports = updateImportsInFile(logger, tree, sourceFile, importsRegexp, renamePackagesRegexp, mapImports, renamedPackages);
    const finalFileContent = tree.readText(fileName);

    expect(unresolvedImports).toBe(2);
    expect(finalFileContent).toContain('import {type DontTouchThis, type DontTouchThat} from \'leave-me-alone\';');
  });
});
