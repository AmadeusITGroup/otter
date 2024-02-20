import type { Rule } from '@angular-devkit/schematics';
import type { PackageJson } from 'type-fest';
import type { SchematicOptionObject } from '../../interfaces/index';
import { getWorkspaceConfig, registerCollectionSchematics, writeAngularJson } from '../../utility';


/**
 * Register the given package in the Angular CLI schematics
 * @param packageJson PackageJson of the project containing the collection to add to the project
 * @param angularJsonFile Path to the Angular.json file. Will use the workspace root's angular.json if not specified
 */
export function registerPackageCollectionSchematics(packageJson: PackageJson, angularJsonFile?: string): Rule {
  return (tree, context) => {
    if (!packageJson.name) {
      return tree;
    }
    const workspace = getWorkspaceConfig(tree, angularJsonFile);
    if (!workspace) {
      context.logger.error('No workspace found');
      return tree;
    }
    return writeAngularJson(tree, registerCollectionSchematics(workspace, packageJson.name), angularJsonFile);
  };
}

/**
 * Setup schematics default params in angular.json
 * @param schematicsDefaultParams default params to setup by schematic
 * @param overrideValue Define if the given value should override the one already defined in the workspace
 * @param angularJsonFile Path to the Angular.json file. Will use the workspace root's angular.json if not specified
 */
export function setupSchematicsDefaultParams(schematicsDefaultParams: Record<string, SchematicOptionObject>, overrideValue = false, angularJsonFile?: string): Rule {
  return (tree, context) => {
    const workspace = getWorkspaceConfig(tree, angularJsonFile);
    if (!workspace) {
      context.logger.error('No workspace found');
      return tree;
    }
    workspace.schematics ||= {};
    Object.entries(schematicsDefaultParams).forEach(([schematicName, defaultParams]) => {
      workspace.schematics![schematicName] = overrideValue ? {
        ...workspace.schematics![schematicName],
        ...defaultParams
      } : {
        ...defaultParams,
        ...workspace.schematics![schematicName]
      };
    });
    Object.values(workspace.projects).forEach((project) => {
      Object.entries(schematicsDefaultParams).forEach(([schematicName, defaultParams]) => {
        if (project.schematics?.[schematicName]) {
          project.schematics[schematicName] = overrideValue ? {
            ...project.schematics[schematicName],
            ...defaultParams
          } : {
            ...defaultParams,
            ...project.schematics[schematicName]
          };
        }
      });
    });
    return writeAngularJson(tree, workspace, angularJsonFile);
  };
}
