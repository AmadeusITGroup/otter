import * as path from 'node:path';
import {
  Tree
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  UnitTestTree
} from '@angular-devkit/schematics/testing';
import {
  lastValueFrom
} from 'rxjs';
import {
  updateO3rMetricsConfig
} from './index';

describe('Update v11.3', () => {
  const collectionPath = path.join(__dirname, '../../../migration.json');
  let initialTree: UnitTestTree;

  beforeEach(() => {
    initialTree = new UnitTestTree(Tree.empty());
  });

  describe('Update o3r metrics config', () => {
    it('should update only package.json files with o3rMetrics', async () => {
      initialTree.create('/source.ts', 'code');
      const rootPackageJson = { name: 'root', config: { o3rMetrics: true } };
      const lib1PackageJson = { name: 'lib1', config: { o3rMetrics: false } };
      const lib2PackageJson = { name: 'lib2', config: { port: 4200, o3rMetrics: true } };
      const lib3PackageJson = { name: 'lib3' };
      const lib4PackageJson = { name: 'lib4', config: { port: 4200 } };
      initialTree.create('/package.json', JSON.stringify(rootPackageJson, null, 2));
      initialTree.create('/lib1/package.json', JSON.stringify(lib1PackageJson, null, 2));
      initialTree.create('/lib1/source.ts', 'code');
      initialTree.create('/lib2/package.json', JSON.stringify(lib2PackageJson, null, 2));
      initialTree.create('/lib2/source.ts', 'code');
      initialTree.create('/lib3/package.json', JSON.stringify(lib3PackageJson, null, 2));
      initialTree.create('/lib3/source.ts', 'code');
      initialTree.create('/lib4/package.json', JSON.stringify(lib4PackageJson, null, 2));
      initialTree.create('/lib4/source.ts', 'code');

      const runner = new SchematicTestRunner('migrations', collectionPath);
      const tree = await lastValueFrom(runner.callRule(updateO3rMetricsConfig, initialTree));

      ['', 'lib1', 'lib2', 'lib3', 'lib4'].forEach((lib) => {
        expect(tree.readText(`${lib}/source.ts`)).toBe('code');
      });

      const updatedRootPackageJson = tree.readJson('/package.json');
      expect(updatedRootPackageJson).toEqual(expect.objectContaining({ config: { o3r: { telemetry: true } } }));

      const updatedLib1PackageJson = tree.readJson('/lib1/package.json');
      expect(updatedLib1PackageJson).toEqual(expect.objectContaining({ config: { o3r: { telemetry: false } } }));

      const updatedLib2PackageJson = tree.readJson('/lib2/package.json');
      expect(updatedLib2PackageJson).toEqual(expect.objectContaining({ config: { port: 4200, o3r: { telemetry: true } } }));

      const updatedLib3PackageJson = tree.readJson('/lib3/package.json');
      expect(updatedLib3PackageJson).toEqual(lib3PackageJson);

      const updatedLib4PackageJson = tree.readJson('/lib4/package.json');
      expect(updatedLib4PackageJson).toEqual(lib4PackageJson);

      [updatedRootPackageJson, updatedLib1PackageJson, updatedLib2PackageJson, updatedLib3PackageJson].forEach((packageJson) => {
        expect(packageJson).toEqual(expect.not.objectContaining({ config: expect.objectContaining({ o3rMetrics: expect.anything() }) }));
      });
    });
  });
});
