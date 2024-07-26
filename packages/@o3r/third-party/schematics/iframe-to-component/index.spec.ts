import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { firstValueFrom } from 'rxjs';
import { ngAddIframeFn } from './index';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');
const o3rComponentPath = '/src/components/test/test.component.ts';
const templatePath = '/src/components/test/test.template.html';
const ngComponentPath = '/src/components/ng/ng.component.ts';

describe('Add Iframe', () => {
  let initialTree: Tree;

  describe('Otter standalone component', () => {
    beforeEach(() => {
      initialTree = Tree.empty();
      initialTree.create(o3rComponentPath, `
        import {CommonModule} from '@angular/common';
        import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
        import {O3rComponent} from '@o3r/core';

        @O3rComponent({
          componentType: 'Component'
        })
        @Component({
          selector: 'o3r-test-pres',
          standalone: true,
          imports: [CommonModule],
          styleUrls: ['./test.style.scss'],
          templateUrl: './test.template.html',
          changeDetection: ChangeDetectionStrategy.OnPush,
          encapsulation: ViewEncapsulation.None
        })
        export class TestComponent {}
      `);
      initialTree.create(templatePath, '<div>My HTML content</div>');
      initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
    });

    it('should update the component and the template', async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const tree = await runner.runSchematic('iframe-to-component', {
        projectName: 'test-project',
        path: o3rComponentPath
      }, initialTree);

      expect(tree.exists(templatePath)).toBeTruthy();
      expect(tree.readText(templatePath)).toContain('<iframe #frame src="about:blank" style="display: none"></iframe>');

      const componentFileContent = tree.readText(o3rComponentPath);
      expect(componentFileContent).toContain('AfterViewInit');
      expect(componentFileContent).toContain('OnDestroy');
      expect(componentFileContent).toContain('private bridge?: IframeBridge;');
      expect(componentFileContent).toContain('private frame = viewChild.required<ElementRef<HTMLIFrameElement>>(\'frame\');');
      expect(componentFileContent).toContain('this.bridge = new IframeBridge(window, nativeElem);');
    });

    it('should throw if we add iframe to a component that already has it', async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);
      const tree = await runner.runSchematic('iframe-to-component', {
        projectName: 'test-project',
        path: o3rComponentPath
      }, initialTree);
      await expect(runner.runSchematic('iframe-to-component', {
        projectName: 'test-project',
        path: o3rComponentPath
      }, tree)).rejects.toThrow();
    });
  });

  describe('Angular component', () => {
    beforeEach(() => {
      initialTree = Tree.empty();
      initialTree.create(ngComponentPath, `
        import {CommonModule} from '@angular/common';
        import {Component} from '@angular/core';

        @Component({
          selector: 'ng-test',
          standalone: true,
          imports: [CommonModule],
          template: ''
        })
        export class NgComponent {}
      `);
      initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
    });

    it('should throw if inexisting path', async () => {
      const runner = new SchematicTestRunner('schematics', collectionPath);

      await expect(runner.runSchematic('iframe-to-component', {
        projectName: 'test-project',
        path: 'inexisting-path.component.ts'
      }, initialTree)).rejects.toThrow();
    });

    describe('Angular component', () => {
      it('should throw if no Otter component', async () => {
        const runner = new SchematicTestRunner('schematics', collectionPath);

        await expect(firstValueFrom(runner.callRule(ngAddIframeFn({
          path: ngComponentPath,
          skipLinter: false
        }), initialTree, { interactive: false }))).rejects.toThrow();
      });

      it('should call convert-component if no Otter component', async () => {
        const runner = new SchematicTestRunner('schematics', collectionPath);
        const o3rCorePackageJson = require.resolve('@o3r/core/package.json');
        runner.registerCollection('@o3r/core', path.resolve(path.dirname(o3rCorePackageJson), require(o3rCorePackageJson).schematics));
        const spy = jest.spyOn(runner.engine, 'createSchematic');

        const tree = await runner.runSchematic('iframe-to-component', {
          path: ngComponentPath,
          skipLinter: false
        }, initialTree);
        const componentFileContent = tree.readText(ngComponentPath);

        expect(spy).toHaveBeenCalledWith('convert-component', expect.anything(), expect.anything());
        expect(componentFileContent).toContain('viewChild.required<ElementRef<HTMLIFrameElement>>(\'frame\')');
      });
    });
  });
});
