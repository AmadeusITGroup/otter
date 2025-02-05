import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  Tree,
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
  type UnitTestTree,
} from '@angular-devkit/schematics/testing';

const migrationPath = path.join(__dirname, '..', '..', '..', 'migration.json');

const notMigrated = `import {
  computeConfigurationName,
} from '@o3r/configuration';
export const CONFIGURATION_PRES_CONFIG_ID = computeConfigurationName('ConfigurationPresConfig', 'showcase');
`;

const migrated = `import {computeItemIdentifier} from '@o3r/core';
export const CONFIGURATION_PRES_CONFIG_ID = computeItemIdentifier('ConfigurationPresConfig', 'showcase');
`;

describe('Update', () => {
  let initialTree: Tree;
  let runner: SchematicTestRunner;
  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
    initialTree.create('package.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', 'package.mocks.json')));
    initialTree.create('.eslintrc.json', fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'testing', 'mocks', '__dot__eslintrc.mocks.json')));
    runner = new SchematicTestRunner('schematics', migrationPath);
  });

  describe('Update v12.0', () => {
    let tree: UnitTestTree;
    const notMigratedPath = 'src/components/not-migrated.config.ts';
    const migratedPath = 'src/components/migrated.config.ts';

    beforeEach(async () => {
      initialTree.create(notMigratedPath, notMigrated);
      initialTree.create(migratedPath, migrated);
      tree = await runner.runSchematic('migration-v12_0', {}, initialTree);
    });

    it('should migrate the not migrated file', () => {
      const newText = tree.readText(notMigratedPath);
      expect(newText).not.toEqual(notMigrated);
      expect(newText).toEqual(migrated);
    });

    it('should not change the file already migrated', () => {
      expect(tree.readText(migratedPath)).toEqual(migrated);
    });
  });
});
