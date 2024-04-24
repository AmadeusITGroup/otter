import type { Rule } from '@angular-devkit/schematics';
import { type DependencyToAdd, getExternalDependenciesVersionRange, setupDependencies } from '@o3r/schematics';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as path from 'node:path';
import { createSchematicWithMetricsIfInstalled } from '@o3r/schematics';
import type { NgAddSchematicsSchema } from './schema';

/**
 * Add Otter schematics to an Angular Project
 * @param options schematics options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  const schematicsDependencies = ['@angular-devkit/architect', '@angular-devkit/schematics', '@angular-devkit/core', '@schematics/angular', 'globby'];
  return () => async (): Promise<Rule> => {
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

    const dependencies = Object.entries(getExternalDependenciesVersionRange(schematicsDependencies, packageJsonPath)).reduce((acc, [dep, range]) => {
      acc[dep] = {
        inManifest: [{
          range,
          types: [NodeDependencyType.Dev]
        }]
      };
      return acc;
    }, {} as Record<string, DependencyToAdd>);
    Object.entries(getExternalDependenciesVersionRange(schematicsDependencies, packageJsonPath))
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
 */
export const ngAdd = createSchematicWithMetricsIfInstalled(ngAddFn);
