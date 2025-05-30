import * as path from 'node:path';
import type {
  Rule,
} from '@angular-devkit/schematics';
import {
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import {
  createOtterSchematic,
  type DependencyToAdd,
  getExternalDependenciesVersionRange,
  setupDependencies,
} from '../../src/public_api';
import type {
  NgAddSchematicsSchema,
} from './schema';

/**
 * Add Otter schematics to an Angular Project
 * @param options schematics options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  const schematicsDependencies = ['@angular-devkit/architect', '@angular-devkit/schematics', '@angular-devkit/core', '@schematics/angular', 'globby'];
  return (_, context) => {
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
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
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
