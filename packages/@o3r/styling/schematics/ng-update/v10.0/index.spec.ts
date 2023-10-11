import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { updateScssImports } from './update-scss-imports';
import * as path from 'node:path';
import { lastValueFrom } from 'rxjs';

describe('Update v10', () => {
  const collectionPath = path.join(__dirname, '../../../migration.json');
  let initialTree: UnitTestTree;

  beforeEach(() => {
    initialTree = new UnitTestTree(Tree.empty());
  });

  describe('Update SCSS Import', () => {

    it('should not update a TS file', async () => {
      const content = '@use "@o3r/styling" as o3r;\n';
      initialTree.create('/source.ts', content);
      const runner = new SchematicTestRunner('migrations', collectionPath);
      const tree = await lastValueFrom(runner.callRule(updateScssImports(), initialTree));

      expect(tree.readText('/source.ts')).toEqual(content);
    });

    it('should not update a file without Otter dependency', async () => {
      const content = '@use "@angular/component" as o3r;\n';
      initialTree.create('/style.scss', content);
      const runner = new SchematicTestRunner('migrations', collectionPath);
      const tree = await lastValueFrom(runner.callRule(updateScssImports(), initialTree));

      expect(tree.readText('/style.scss')).toEqual(content);
    });

    it('should not update a file with Otter import with theme function only', async () => {
      const content = `@use "@o3r/styling" as o3r;
        @include o3r.var(#fff);`;
      initialTree.create('/style.scss', content);
      const runner = new SchematicTestRunner('migrations', collectionPath);
      const tree = await lastValueFrom(runner.callRule(updateScssImports(), initialTree));

      expect(tree.readText('/style.scss')).toEqual(content);
    });

    it('should update a file with Otter theme usage', async () => {
      const content = `
        @use "@o3r/styling" as o3r;
        @include o3r.var(#fff);
        $var: o3r.meta-theme-to-otter();`;
      const expected = `@use '@o3r/styling/otter-theme' as otter-theme;
        @use "@o3r/styling" as o3r;
        @include o3r.var(#fff);
        $var: otter-theme.meta-theme-to-otter();`.replace(/^ +/gm, '');
      initialTree.create('/style.scss', content);
      const runner = new SchematicTestRunner('migrations', collectionPath);
      const tree = await lastValueFrom(runner.callRule(updateScssImports(), initialTree));
      const res = tree.readText('/style.scss').replace(/^ +/gm, '').replace(/\n\n/g, '\n');

      expect(res).toEqual(expected);
    });

    it('should update a file with Otter theme usage with non-standard alias', async () => {
      const content = `@use '@o3r/styling' as test-name;
        $var: test-name.meta-theme-to-otter();
        $var2: test-name.var(#000);`;
      const expected = `@use '@o3r/styling/otter-theme' as otter-theme;
        @use '@o3r/styling' as test-name;
        $var: otter-theme.meta-theme-to-otter();
        $var2: test-name.var(#000);`.replace(/^ +/gm, '');
      initialTree.create('/style.scss', content);
      const runner = new SchematicTestRunner('migrations', collectionPath);
      const tree = await lastValueFrom(runner.callRule(updateScssImports(), initialTree));
      const res = tree.readText('/style.scss').replace(/^ +/gm, '').replace(/\n\n/g, '\n');

      expect(res).toEqual(expected);
    });

    it('should update a file with Otter theme usage and clean previous dep', async () => {
      const content = `@use "@o3r/styling" as test-name;
        $var: test-name.meta-theme-to-otter();`;
      const expected = `@use '@o3r/styling/otter-theme' as otter-theme;
        $var: otter-theme.meta-theme-to-otter();`.replace(/^ +/gm, '');
      initialTree.create('/style.scss', content);
      const runner = new SchematicTestRunner('migrations', collectionPath);
      const tree = await lastValueFrom(runner.callRule(updateScssImports(), initialTree));
      const res = tree.readText('/style.scss').replace(/^ +/gm, '').replace(/\n\n/g, '\n');

      expect(res).toEqual(expected);
    });

  });
});
