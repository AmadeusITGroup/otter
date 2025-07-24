import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Tree,
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
} from '@angular-devkit/schematics/testing';

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
      initialTree.create('src/components/example.template.html', '{{ "asset.png" | dynamicContent }}');
      runner = new SchematicTestRunner('schematics', migrationPath);
    });

    it('should replace the pipe with standalone component', async () => {
      initialTree.create('src/components/example.component.ts', `
        import { Component } from '@angular/core';
        import { O3rComponent } from '@o3r/core';
        import { DynamicContentModule } from '@o3r/dynamic-content';

        @O3rComponent({ componentType: 'Component' })
        @Component({
          selector: 'o3r-example',
          imports: [DynamicContentModule],
          templateUrl: './example.template.html'
        })
        export class ExampleComponent {
        }
      `);
      const tree = await runner.runSchematic('migration-v10_0', {}, initialTree);
      expect(tree.readText('src/components/example.component.ts')).toMatch('DynamicContentModule');
      expect(tree.readText('src/components/example.template.html')).toMatch('| o3rDynamicContent');
      expect(tree.readText('src/components/example.template.html')).not.toMatch('| dynamicContent');
    });

    it('should replace the pipe with module based component', async () => {
      initialTree.create('src/components/example.component.ts', `
        import { Component } from '@angular/core';
        import { O3rComponent } from '@o3r/core';

        @O3rComponent({ componentType: 'Component' })
        @Component({
          selector: 'o3r-example',
          standalone: false,
          templateUrl: './example.template.html'
        })
        export class ExampleComponent {
        }
      `);
      initialTree.create('src/components/example.module.ts', `
        import { NgModule } from '@angular/core';
        import { DynamicContentModule } from '@o3r/dynamic-content';
        import { ExampleComponent } from './example.component';

        @NgModule({
          imports: [DynamicContentModule],
          declarations: [ExampleComponent],
          exports: [ExampleComponent]
        })
        export class ExampleModule {}
      `);
      const tree = await runner.runSchematic('migration-v10_0', {}, initialTree);
      expect(tree.readText('src/components/example.module.ts')).toMatch('DynamicContentModule');
      expect(tree.readText('src/components/example.template.html')).toMatch('| o3rDynamicContent');
      expect(tree.readText('src/components/example.template.html')).not.toMatch('| dynamicContent');
    });
  });
});
