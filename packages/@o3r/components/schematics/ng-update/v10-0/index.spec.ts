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
  let initialTree: Tree;
  let runner: SchematicTestRunner;
  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
    initialTree.create('package.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'package.mocks.json')));
    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
    runner = new SchematicTestRunner('schematics', migrationPath);
  });

  describe('Update pipes', () => {
    beforeEach(() => {
      initialTree.create('src/components/example.template.html', '{{ 120 | duration }}');
    });

    it('should replace the pipe with standalone component', async () => {
      initialTree.create('src/components/example.component.ts', `
        import { Component } from '@angular/core';
        import { O3rComponent } from '@o3r/core';
        import { DurationPipeModule } from '@o3r/components';

        @O3rComponent({ componentType: 'Component' })
        @Component({
          selector: 'o3r-example',
          standalone: true,
          imports: [DurationPipeModule],
          templateUrl: './example.template.html'
        })
        export class ExampleComponent {
        }
      `);
      const tree = await runner.runSchematic('migration-v10_0', {}, initialTree);
      expect(tree.readText('src/components/example.component.ts')).toMatch('O3rDurationPipe');
      expect(tree.readText('src/components/example.component.ts')).not.toMatch('DurationPipeModule');
      expect(tree.readText('src/components/example.template.html')).toMatch('| o3rDuration');
      expect(tree.readText('src/components/example.template.html')).not.toMatch('| duration');
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
        import { DurationPipeModule } from '@o3r/components';
        import { ExampleComponent } from './example.component';

        @NgModule({
          imports: [DurationPipeModule],
          declarations: [ExampleComponent],
          exports: [ExampleComponent]
        })
        export class ExampleModule {}
      `);
      const tree = await runner.runSchematic('migration-v10_0', {}, initialTree);
      expect(tree.readText('src/components/example.module.ts')).toMatch('O3rDurationPipe');
      expect(tree.readText('src/components/example.module.ts')).not.toMatch('DurationPipeModule');
      expect(tree.readText('src/components/example.template.html')).toMatch('| o3rDuration');
      expect(tree.readText('src/components/example.template.html')).not.toMatch('| duration');
    });
  });

  describe('Update c11n presenter$ declaration', () => {
    it('shoud update the c11n presenter$ declaration', async () => {
      const componentPath = 'src/components/example.component.ts';
      initialTree.create(componentPath, `
        import { Component } from '@angular/core';
        import { O3rComponent } from '@o3r/core';
        import { Observable } from 'rxjs';

        @O3rComponent({ componentType: 'Component' })
        @Component({
          selector: 'o3r-example',
          standalone: true,
          templateUrl: './example.template.html'
        })
        export class ExampleComponent {
          public presenter$!: Observable<MyComp>;
        }
      `);
      const tree = await runner.runSchematic('migration-v10_0', {}, initialTree);
      const newContent = tree.readText(componentPath);
      expect(newContent).toContain('public presenter$!: Observable<Type<MyComp>>;');
      expect(newContent).toMatch(/import.*Type.*from '@angular\/core';/);
    });
  });
});
