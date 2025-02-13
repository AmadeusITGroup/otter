import {
  readFileSync,
} from 'node:fs';
import * as path from 'node:path';
import {
  chain,
  noop,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  applyEsLintFix,
  createOtterSchematic,
  getDestinationPath,
} from '@o3r/schematics';
import {
  updateOtterEnvironmentAdapter,
} from '../rule-factories/otter-environment';
import {
  NgGenerateUpdateSchematicsSchema,
} from './schema';

/**
 * add a new ngUpdate function
 * @param options
 */
function ngGenerateUpdateFn(options: NgGenerateUpdateSchematicsSchema): Rule {
  const generateFiles: Rule = (tree: Tree, _context: SchematicContext) => {
    const destination = getDestinationPath('@o3r/core:schematics-update', options.path, tree, options.projectName);

    const sanitizedVersion = options.version.replace('.', '_');
    const baseVersion = `${options.version}${options.version.includes('.') ? '' : '.0'}.0-alpha.0`;
    const updateFunction = `updateV${sanitizedVersion}`;

    const barrelPath = path.join(destination, 'schematics', 'ng-update', 'index.ts');
    let migrationFilePath = JSON.parse(readFileSync(path.resolve(destination, '..', 'package.json'), { encoding: 'utf8' }))['ng-update'];
    migrationFilePath = migrationFilePath && migrationFilePath.migrations;
    migrationFilePath = migrationFilePath && path.join(destination, '..', migrationFilePath);

    if (tree.exists(barrelPath)) {
      const currentUpdateIndexBuffer = tree.read(barrelPath);
      let currentUpdateIndex = currentUpdateIndexBuffer ? currentUpdateIndexBuffer.toString() : '';

      if (!(new RegExp(updateFunction).test(currentUpdateIndex))) {
        currentUpdateIndex += `
/**
 * update of Otter library V${options.version}.x
 */
export function ${updateFunction}(): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const updateRules: Rule[] = [
      // TODO: add custom function to run on upgrade to ${options.version}.*
    ];

    return chain(updateRules)(tree, context);
  };
}`;
        tree.overwrite(barrelPath, currentUpdateIndex);
      }
    }

    if (tree.exists(migrationFilePath)) {
      const currentMigrationBuffer = tree.read(migrationFilePath);
      let currentMigration = JSON.parse(currentMigrationBuffer ? currentMigrationBuffer.toString() : '{}');
      if (!currentMigration || !currentMigration.schematics || !currentMigration.schematics[`migration-v${sanitizedVersion}`]) {
        currentMigration = currentMigration || {};
        currentMigration.schematics = currentMigration.schematics || {};
        currentMigration.schematics[`migration-v${sanitizedVersion}`] = {
          version: baseVersion,
          description: `Updates of the Otter Library to v${options.version}.x`,
          factory: `./schematics/ng-update/index#${updateFunction}`
        };

        tree.overwrite(migrationFilePath, JSON.stringify(currentMigration, null, 2));
      }
    }

    return tree;
  };

  return chain([
    updateOtterEnvironmentAdapter(options, __dirname),
    generateFiles,
    options.skipLinter ? noop() : applyEsLintFix()
  ]);
}

/**
 * add a new ngUpdate function
 * @param options
 */
export const ngGenerateUpdate = createOtterSchematic(ngGenerateUpdateFn);
