import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  ngAddDependenciesRule,
  registerPackageCollectionSchematics,
  setupSchematicsParamsForProject,
  updateSassImports,
} from '@o3r/schematics';
import {
  updateCmsAdapter,
} from '../cms-adapter';
import type {
  NgAddSchematicsSchema,
} from './schema';
import {
  updateThemeFiles,
} from './theme-files';

/**
 * List of external dependencies to be added to the project as peer dependencies
 */
const dependenciesToInstall = [
  '@angular/common',
  '@angular/core',
  '@angular/cdk',
  '@angular/material'
];

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall = [
  '@angular-devkit/schematics',
  '@schematics/angular',
  'chokidar',
  'sass-loader'
];

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

/**
 * Add Otter styling to an Angular Project
 * Update the styling if the app/lib used otter v7
 * @param options for the dependency installations
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  const schematicsDefaultOptions = {
    useOtterTheming: undefined
  };
  return chain([
    updateSassImports('o3r'),
    updateThemeFiles(__dirname, options),
    registerPackageCollectionSchematics(JSON.parse(fs.readFileSync(packageJsonPath).toString())),
    setupSchematicsParamsForProject({
      '@o3r/core:component': schematicsDefaultOptions,
      '@o3r/core:component-presenter': schematicsDefaultOptions
    }, options.projectName),
    ...(options.enableMetadataExtract ? [updateCmsAdapter(options)] : []),
    ngAddDependenciesRule(options, packageJsonPath, {
      dependenciesToInstall,
      devDependenciesToInstall,
      additionalNgAddToRun: options.enableMetadataExtract ? ['@o3r/extractors'] : undefined
    })
  ]);
}

/**
 * Add Otter styling to an Angular Project
 * Update the styling if the app/lib used otter v7
 * @param options for the dependency installations
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
