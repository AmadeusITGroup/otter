import type { Rule } from '@angular-devkit/schematics';
import type { DependencyToAdd } from '@o3r/schematics';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as path from 'node:path';
import type { NgAddSchematicsSchema } from './schema';

/**
 * Add Otter schematics to an Angular Project
 * @param options schematics options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  const schematicsDependencies = ['@angular-devkit/architect', '@angular-devkit/schematics', '@angular-devkit/core', '@schematics/angular', 'globby'];
  return async (_, context) => {
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const { getExternalDependenciesVersionRange, setupDependencies } = await import('@o3r/schematics');
    const dependencies = Object.entries(getExternalDependenciesVersionRange(schematicsDependencies, packageJsonPath, context.logger)).reduce((acc, [dep, range]) => {
      acc[dep] = {
        inManifest: [{
          range,
          types: [NodeDependencyType.Dev]
        }]
      };
      return acc;
    }, {} as Record<string, DependencyToAdd>);
    Object.entries(getExternalDependenciesVersionRange(schematicsDependencies, packageJsonPath, context.logger))
      .forEach(([dep, range]) => {
        dependencies[dep] = {
          inManifest: [{
            range,
            types: [NodeDependencyType.Dev]
          }]
        };
      });
    return setupDependencies({
      projectName: options.projectName,
      dependencies,
      skipInstall: false
    });
  };
}

/**
 * Add Otter schematics to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema): Rule => async () => {
  const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics');
  return createSchematicWithMetricsIfInstalled(ngAddFn)(options);
};

