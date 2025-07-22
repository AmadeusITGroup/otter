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

const notMigrated = `import type {
  Translation,
} from '@o3r/core';

export interface LocalizationPresTranslation extends Translation {
  /**
   * Key for the message in the speech bubble until a destination is selected
   */
  welcome: string;
  /**
   * Key for the message in the speech bubble when a destination is selected, you can use \`{ cityName }\` to display the name of the city selected
   */
  welcomeWithCityName: string;
  /**
   * Key for the question at the top of the form
   */
  question: string;
  /**
   * Key for the label for the destination input
   */
  destinationLabel: string;
  /**
   * Key for the label for the departure date input
   */
  departureLabel: string;
  /**
   * Key for the placeholder for the destination input
   */
  destinationPlaceholder: string;
  /**
   * Key for the city names' dictionary
   */
  cityName: string;
}

export const translations: LocalizationPresTranslation = {
  welcome: 'o3r-localization-pres.welcome',
  welcomeWithCityName: 'o3r-localization-pres.welcomeWithCityName',
  question: 'o3r-localization-pres.question',
  destinationLabel: 'o3r-localization-pres.destinationLabel',
  departureLabel: 'o3r-localization-pres.departureLabel',
  cityName: 'o3r-localization-pres.cityName',
  destinationPlaceholder: 'o3r-localization-pres.destinationPlaceholder'
};
`;

const migrated = `import type {
  Translation,
} from '@o3r/core';

export interface LocalizationPresTranslation extends Translation {
  /**
   * Key for the message in the speech bubble until a destination is selected
   */
  welcome: string;
  /**
   * Key for the message in the speech bubble when a destination is selected, you can use \`{ cityName }\` to display the name of the city selected
   */
  welcomeWithCityName: string;
  /**
   * Key for the question at the top of the form
   */
  question: string;
  /**
   * Key for the label for the destination input
   */
  destinationLabel: string;
  /**
   * Key for the label for the departure date input
   */
  departureLabel: string;
  /**
   * Key for the placeholder for the destination input
   */
  destinationPlaceholder: string;
  /**
   * Key for the city names' dictionary
   */
  cityName: string;
}

export const translations: Readonly<LocalizationPresTranslation> = {
  welcome: 'o3r-localization-pres.welcome',
  welcomeWithCityName: 'o3r-localization-pres.welcomeWithCityName',
  question: 'o3r-localization-pres.question',
  destinationLabel: 'o3r-localization-pres.destinationLabel',
  departureLabel: 'o3r-localization-pres.departureLabel',
  cityName: 'o3r-localization-pres.cityName',
  destinationPlaceholder: 'o3r-localization-pres.destinationPlaceholder'
} as const;
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
    const notMigratedPath = 'src/components/not-migrated.translation.ts';
    const migratedPath = 'src/components/migrated.translation.ts';

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
