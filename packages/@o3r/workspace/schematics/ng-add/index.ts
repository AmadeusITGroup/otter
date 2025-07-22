import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  chain,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  RepositoryInitializerTask,
} from '@angular-devkit/schematics/tasks';
import {
  createSchematicWithMetricsIfInstalled,
  createSchematicWithOptionsFromWorkspace,
  getPackageManagerExecutor,
  getWorkspaceConfig,
  registerPackageCollectionSchematics,
} from '@o3r/schematics';
import type {
  PackageJson,
} from 'type-fest';
import {
  prepareProject,
} from './project-setup';
import type {
  NgAddSchematicsSchema,
} from './schema';

/**
 * Add Otter library to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const ownPackageJsonContent = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), { encoding: 'utf8' })) as PackageJson;

    return () => chain([
      // Register the module in angular.json
      registerPackageCollectionSchematics(ownPackageJsonContent),

      // Prepare mono repo for Otter
      prepareProject(options),

      // Commit Otter setup
      (_, c) => {
        if (!options.projectName && !options.skipGit && options.commit) {
          const commit: { name?: string; email?: string; message?: string } = typeof options.commit == 'object' ? options.commit : {};
          commit.message = 'Setup of Otter Framework';
          c.addTask(new RepositoryInitializerTask(undefined, commit));
        }
      },

      // Schematics advertising
      (t, c) => {
        const workspaceConfig = getWorkspaceConfig(t);
        const executor = getPackageManagerExecutor(workspaceConfig);
        c.logger.info('Your project is now ready, you can start to generate your first packages with one of the following commands:');
        c.logger.info(`  ${executor} ng g application`);
        c.logger.info(`  ${executor} ng g sdk`);
        c.logger.info(`  ${executor} ng g library`);
        c.logger.info(`... or discover the full list of commands with "${executor} ng g ${executor.startsWith('npm') ? '-- ' : ''}--help".`);
      }
    ])(tree, context);
  };
}

/**
 * Add Otter library to an Angular Project
 * @param options
 */
export const ngAdd = createSchematicWithOptionsFromWorkspace(createSchematicWithMetricsIfInstalled(ngAddFn));
