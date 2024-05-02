import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as fs from 'node:fs';
import * as path from 'node:path';

const migrationPath = path.join(__dirname, '..', '..', '..', 'migration.json');


describe('Update v10', () => {
  describe('Update pipes', () => {
    let initialTree: Tree;
    let runner: SchematicTestRunner;
    beforeEach(() => {
      initialTree = Tree.empty();
      initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
      initialTree.create('package.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'package.mocks.json')));
      initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
      initialTree.create('src/components/example.template.html', '{{ "localization.key" | translate }}');
      runner = new SchematicTestRunner('schematics', migrationPath);
    });

    it('should replace the pipe with standalone component', async () => {
      initialTree.create('src/components/example.component.ts', `
        import { Component } from '@angular/core';
        import { O3rComponent } from '@o3r/core';
        import { LocalizationModule } from '@o3r/localization';

        @O3rComponent({ componentType: 'Component' })
        @Component({
          selector: 'o3r-example',
          standalone: true,
          imports: [LocalizationModule],
          templateUrl: './example.template.html'
        })
        export class ExampleComponent {
        }
      `);
      const tree = await runner.runSchematic('migration-v10_0', {}, initialTree);
      expect(tree.readText('src/components/example.component.ts')).toMatch('LocalizationModule');
      expect(tree.readText('src/components/example.template.html')).toMatch('| o3rTranslate');
      expect(tree.readText('src/components/example.template.html')).not.toMatch('| translate');
    });

    it('should replace the pipe with module based component', async () => {
      initialTree.create('src/components/example.component.ts', `
        import { Component } from '@angular/core';
        import { O3rComponent } from '@o3r/core';

        @O3rComponent({ componentType: 'Component' })
        @Component({
          selector: 'o3r-example',
          templateUrl: './example.template.html'
        })
        export class ExampleComponent {
        }
      `);
      initialTree.create('src/components/example.module.ts', `
        import { NgModule } from '@angular/core';
        import { LocalizationModule } from '@o3r/localization';
        import { ExampleComponent } from './example.component';

        @NgModule({
          imports: [LocalizationModule],
          declarations: [ExampleComponent],
          exports: [ExampleComponent]
        })
        export class ExampleModule {}
      `);
      const tree = await runner.runSchematic('migration-v10_0', {}, initialTree);
      expect(tree.readText('src/components/example.module.ts')).toMatch('LocalizationModule');
      expect(tree.readText('src/components/example.template.html')).toMatch('| o3rTranslate');
      expect(tree.readText('src/components/example.template.html')).not.toMatch('| translate');
    });
  });
});
