import * as path from 'node:path';
import {
  Tree,
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';

const collectionPath = path.join(__dirname, '../../collection.json');

describe('Migration from @o3r/localization to @o3r/transloco', () => {
  let runner: SchematicTestRunner;
  let tree: UnitTestTree;

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', collectionPath);
    tree = new UnitTestTree(Tree.empty());

    // Mock the external schematic call to avoid calling ng-add (which doesn't exist yet)
    runner.registerCollection('@o3r/transloco', path.join(__dirname, '../../collection.json'));
  });

  it('should fail if package.json does not exist', async () => {
    await expect(
      runner.runSchematic('migration-localization-to-transloco', {}, tree)
    ).rejects.toThrow('package.json not found');
  });

  it('should fail if @o3r/localization is not installed', async () => {
    const packageJson = { dependencies: {} };
    tree.create('/package.json', JSON.stringify(packageJson, null, 2));

    await expect(
      runner.runSchematic('migration-localization-to-transloco', {}, tree)
    ).rejects.toThrow('@o3r/localization is not installed. Nothing to migrate.');
  });

  it('should remove @o3r/localization from dependencies', async () => {
    const packageJson = {
      dependencies: {
        '@o3r/localization': '^999.0.0',
        '@angular/core': '^999.0.0'
      }
    };
    tree.create('/package.json', JSON.stringify(packageJson, null, 2));

    await runner.runSchematic('migration-localization-to-transloco', { skipInstall: true, skipLinter: true }, tree);

    const updatedPackageJson = tree.readJson('/package.json') as any;
    expect(updatedPackageJson.dependencies['@o3r/localization']).toBeUndefined();
    expect(updatedPackageJson.dependencies['@angular/core']).toBe('^999.0.0');
  });

  it('should remove @o3r/localization from devDependencies', async () => {
    const packageJson = {
      dependencies: {},
      devDependencies: {
        '@o3r/localization': '^999.0.0'
      }
    };
    tree.create('/package.json', JSON.stringify(packageJson, null, 2));

    await runner.runSchematic('migration-localization-to-transloco', { skipInstall: true, skipLinter: true }, tree);

    const updatedPackageJson = tree.readJson('/package.json') as any;
    expect(updatedPackageJson.devDependencies?.['@o3r/localization']).toBeUndefined();
  });

  it('should remove @o3r/localization from peerDependencies', async () => {
    const packageJson = {
      dependencies: {},
      peerDependencies: {
        '@o3r/localization': '^999.0.0'
      }
    };
    tree.create('/package.json', JSON.stringify(packageJson, null, 2));

    await runner.runSchematic('migration-localization-to-transloco', { skipInstall: true, skipLinter: true }, tree);

    const updatedPackageJson = tree.readJson('/package.json') as any;
    expect(updatedPackageJson.peerDependencies?.['@o3r/localization']).toBeUndefined();
  });

  it('should transform @o3r/localization imports to @o3r/transloco', async () => {
    const packageJson = {
      dependencies: {
        '@o3r/localization': '^999.0.0'
      }
    };
    tree.create('/package.json', JSON.stringify(packageJson, null, 2));

    const sourceFile = `
import { LocalizationService } from '@o3r/localization';
import { Component } from '@angular/core';

@Component({})
export class MyComponent {}
`;
    tree.create('/src/app/my-component.ts', sourceFile);

    await runner.runSchematic('migration-localization-to-transloco', { skipInstall: true, skipLinter: true }, tree);

    const transformedFile = tree.readText('/src/app/my-component.ts');
    expect(transformedFile).toContain("from '@o3r/transloco'");
    expect(transformedFile).not.toContain("from '@o3r/localization'");
  });

  it('should transform @o3r/localization sub-path imports', async () => {
    const packageJson = {
      dependencies: {
        '@o3r/localization': '^999.0.0'
      }
    };
    tree.create('/package.json', JSON.stringify(packageJson, null, 2));

    const sourceFile = `
import { LocalizationRulesEngineActionHandler } from '@o3r/localization/rules-engine';
`;
    tree.create('/src/app/rules.ts', sourceFile);

    await runner.runSchematic('migration-localization-to-transloco', { skipInstall: true, skipLinter: true }, tree);

    const transformedFile = tree.readText('/src/app/rules.ts');
    expect(transformedFile).toContain("from '@o3r/transloco/rules-engine'");
    expect(transformedFile).not.toContain("from '@o3r/localization/rules-engine'");
  });

  it('should not modify files without @o3r/localization imports', async () => {
    const packageJson = {
      dependencies: {
        '@o3r/localization': '^999.0.0'
      }
    };
    tree.create('/package.json', JSON.stringify(packageJson, null, 2));

    const sourceFile = `
import { Component } from '@angular/core';

@Component({})
export class MyComponent {}
`;
    tree.create('/src/app/other-component.ts', sourceFile);

    await runner.runSchematic('migration-localization-to-transloco', { skipInstall: true, skipLinter: true }, tree);

    const unchangedFile = tree.readText('/src/app/other-component.ts');
    expect(unchangedFile).toBe(sourceFile);
  });

  it('should transform @o3r/localization executors in angular.json', async () => {
    const packageJson = {
      dependencies: {
        '@o3r/localization': '^999.0.0'
      }
    };
    tree.create('/package.json', JSON.stringify(packageJson, null, 2));

    const angularJson = {
      projects: {
        myApp: {
          architect: {
            build: {
              executor: '@o3r/localization:i18n',
              options: {}
            }
          }
        }
      }
    };
    tree.create('/angular.json', JSON.stringify(angularJson, null, 2));

    await runner.runSchematic('migration-localization-to-transloco', { skipInstall: true, skipLinter: true }, tree);

    const updatedAngularJson = tree.readJson('/angular.json') as any;
    expect(updatedAngularJson.projects.myApp.architect.build.executor).toBe('@o3r/transloco:i18n');
  });

  it('should transform @o3r/localization executors in project.json', async () => {
    const packageJson = {
      dependencies: {
        '@o3r/localization': '^999.0.0'
      }
    };
    tree.create('/package.json', JSON.stringify(packageJson, null, 2));

    const projectJson = {
      targets: {
        build: {
          executor: '@o3r/localization:i18n',
          options: {}
        }
      }
    };
    tree.create('/apps/myapp/project.json', JSON.stringify(projectJson, null, 2));

    await runner.runSchematic('migration-localization-to-transloco', { skipInstall: true, skipLinter: true }, tree);

    const updatedProjectJson = tree.readJson('/apps/myapp/project.json') as any;
    expect(updatedProjectJson.targets.build.executor).toBe('@o3r/transloco:i18n');
  });

  it('should transform @o3r/localization executors in workspace.json', async () => {
    const packageJson = {
      dependencies: {
        '@o3r/localization': '^999.0.0'
      }
    };
    tree.create('/package.json', JSON.stringify(packageJson, null, 2));

    const workspaceJson = {
      projects: {
        myApp: {
          architect: {
            extract: {
              builder: '@o3r/localization:extract',
              options: {}
            }
          }
        }
      }
    };
    tree.create('/workspace.json', JSON.stringify(workspaceJson, null, 2));

    await runner.runSchematic('migration-localization-to-transloco', { skipInstall: true, skipLinter: true }, tree);

    const updatedWorkspaceJson = tree.readJson('/workspace.json') as any;
    expect(updatedWorkspaceJson.projects.myApp.architect.extract.builder).toBe('@o3r/transloco:extract');
  });

  it('should remove MESSAGE_FORMAT_CONFIG imports and provider', async () => {
    const packageJson = { dependencies: { '@o3r/localization': '^999.0.0' } };
    tree.create('/package.json', JSON.stringify(packageJson, null, 2));

    const sourceFile = `
import { MESSAGE_FORMAT_CONFIG } from '@o3r/localization';

@NgModule({
  providers: [{ provide: MESSAGE_FORMAT_CONFIG, useValue: {} }]
})
export class AppModule {}
`;
    tree.create('/src/app/app.module.ts', sourceFile);

    await runner.runSchematic('migration-localization-to-transloco', { skipInstall: true, skipLinter: true }, tree);

    const result = tree.readText('/src/app/app.module.ts');
    expect(result).toContain("from '@o3r/transloco'");
    expect(result).not.toContain('MESSAGE_FORMAT_CONFIG');
    expect(result).not.toContain('{ provide: MESSAGE_FORMAT_CONFIG');
  });

  it('should remove TranslateMessageFormatLazyCompiler and TranslateCompiler imports', async () => {
    const packageJson = { dependencies: { '@o3r/localization': '^999.0.0' } };
    tree.create('/package.json', JSON.stringify(packageJson, null, 2));

    const sourceFile = `
import { TranslateMessageFormatLazyCompiler, TranslateCompiler } from '@o3r/localization';

@NgModule({})
export class AppModule {}
`;
    tree.create('/src/app/app.module.ts', sourceFile);

    await runner.runSchematic('migration-localization-to-transloco', { skipInstall: true, skipLinter: true }, tree);

    const result = tree.readText('/src/app/app.module.ts');
    expect(result).toContain("from '@o3r/transloco'");
    expect(result).not.toContain('TranslateMessageFormatLazyCompiler');
    expect(result).not.toContain('TranslateCompiler');
  });

  it('should remove LocalizationModule imports and usage', async () => {
    const packageJson = { dependencies: { '@o3r/localization': '^999.0.0' } };
    tree.create('/package.json', JSON.stringify(packageJson, null, 2));

    const sourceFile = `
import { LocalizationModule } from '@o3r/localization';
import { Component } from '@angular/core';

@NgModule({
  imports: [LocalizationModule.forRoot()]
})
export class AppModule {}
`;
    tree.create('/src/app/app.module.ts', sourceFile);

    await runner.runSchematic('migration-localization-to-transloco', { skipInstall: true, skipLinter: true }, tree);

    const result = tree.readText('/src/app/app.module.ts');
    expect(result).not.toContain('LocalizationModule.forRoot()');
    expect(result).toContain("from '@angular/core'");
  });
});
