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

const notMigrated = `
import {
  computeItemIdentifier,
} from '@o3r/core';
import type {
  Configuration,
  NestedConfiguration,
} from '@o3r/core';

/** Configuration of a destination */
export interface DestinationConfiguration extends NestedConfiguration {
  /**
   * Name of the destination's city
   * @o3rRequired
   */
  cityName: string;
  /**
   * Is the destination available
   */
  available: boolean;
}

/**
 * Component configuration example
 * @o3rCategories localCategory Local category
 */
export interface ConfigurationPresConfig extends Configuration {
  /**
   * Default date selected compare to today
   * @o3rCategory localCategory
   */
  inXDays: number;
  /**
   * Proposed destinations
   * @o3rWidget DESTINATION_ARRAY
   * @o3rWidgetParam minItems 1
   * @o3rWidgetParam allDestinationsDifferent true
   * @o3rWidgetParam atLeastOneDestinationAvailable true
   * @o3rWidgetParam destinationPattern "[A-Z][a-zA-Z-' ]+"
   */
  destinations: DestinationConfiguration[];
  /**
   * Propose round trip
   * @o3rCategory localCategory
   */
  shouldProposeRoundTrip: boolean;
}

export const CONFIGURATION_PRES_DEFAULT_CONFIG: ConfigurationPresConfig = {
  inXDays: 7,
  destinations: [
    { cityName: 'London', available: true },
    { cityName: 'Paris', available: true },
    { cityName: 'New-York', available: false }
  ],
  shouldProposeRoundTrip: false
};

export const CONFIGURATION_PRES_CONFIG_ID = computeItemIdentifier('ConfigurationPresConfig', 'showcase');
`;

const migrated = `
import {
  computeItemIdentifier,
} from '@o3r/core';
import type {
  Configuration,
  NestedConfiguration,
} from '@o3r/core';

/** Configuration of a destination */
export interface DestinationConfiguration extends NestedConfiguration {
  /**
   * Name of the destination's city
   * @o3rRequired
   */
  cityName: string;
  /**
   * Is the destination available
   */
  available: boolean;
}

/**
 * Component configuration example
 * @o3rCategories localCategory Local category
 */
export interface ConfigurationPresConfig extends Configuration {
  /**
   * Default date selected compare to today
   * @o3rCategory localCategory
   */
  inXDays: number;
  /**
   * Proposed destinations
   * @o3rWidget DESTINATION_ARRAY
   * @o3rWidgetParam minItems 1
   * @o3rWidgetParam allDestinationsDifferent true
   * @o3rWidgetParam atLeastOneDestinationAvailable true
   * @o3rWidgetParam destinationPattern "[A-Z][a-zA-Z-' ]+"
   */
  destinations: DestinationConfiguration[];
  /**
   * Propose round trip
   * @o3rCategory localCategory
   */
  shouldProposeRoundTrip: boolean;
}

export const CONFIGURATION_PRES_DEFAULT_CONFIG: Readonly<ConfigurationPresConfig> = {
  inXDays: 7,
  destinations: [
    { cityName: 'London', available: true },
    { cityName: 'Paris', available: true },
    { cityName: 'New-York', available: false }
  ],
  shouldProposeRoundTrip: false
} as const;

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

  describe('Update v11.6', () => {
    let tree: UnitTestTree;
    const notMigratedPath = 'src/components/not-migrated.config.ts';
    const migratedPath = 'src/components/migrated.config.ts';

    beforeEach(async () => {
      initialTree.create(notMigratedPath, notMigrated);
      initialTree.create(migratedPath, migrated);
      tree = await runner.runSchematic('migration-v11_6', {}, initialTree);
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
