import { chain, noop, Rule } from '@angular-devkit/schematics';
import { applyEsLintFix, getPackageVersion, install, ngAddPackages } from '@o3r/schematics';
import { createAzurePipeline, generateRenovateConfig, o3rBasicUpdates, updateAdditionalModules, updateCmsAdapter,
  updateCustomizationEnvironment, updateDifferentialLoading, updateFixtureConfig, updateLinter,
  updateOtterEnvironmentAdapter, updatePlaywright, updateStore } from '../rule-factories/index';
import { NgAddSchematicsSchema } from './schema';
import { updateBuildersNames as updateBuildersNamesFromV7 } from './updates-for-v8/cms-adapters/update-builders-names';
import { updateOtterGeneratorsNames as updateOtterGeneratorsNamesFromV7 } from './updates-for-v8/generators/update-generators-names';
import { updateImports as updateImportsFromV7 } from './updates-for-v8/imports/update-imports-from-v7-to-v8';
import * as path from 'node:path';
/**
 * Add Otter library to an Angular Project
 *
 * @param options
 */
export function ngAdd(options: NgAddSchematicsSchema): Rule {

  const o3rCoreVersion = getPackageVersion(path.resolve(__dirname, '..', '..', 'package.json'));

  const internalPackagesToInstallWithNgAdd = Array.from(new Set([
    ...(options.enableCms ? ['@o3r/localization', '@o3r/styling', '@o3r/components', '@o3r/configuration'] : []),
    ...(!options.enableCms && options.enableStyling ? ['@o3r/styling'] : []),
    ...(!options.enableCms && options.enableConfiguration ? ['@o3r/configuration'] : []),
    ...(!options.enableCms && options.enableLocalization ? ['@o3r/localization'] : []),
    ...(!options.enableCms && options.enableCustomization ? ['@o3r/components', '@o3r/configuration'] : []),
    ...(options.enableAnalytics ? ['@o3r/analytics'] : []),
    ...(options.enableApisManager ? ['@o3r/apis-manager'] : []),
    ...(options.enableStorybook ? ['@o3r/storybook'] : []),
    ...(options.enablePlaywright ? ['@o3r/testing'] : [])
  ]));
  const externalPackagesToInstallWithNgAdd = Array.from(new Set([
    ...(options.enablePrefetchBuilder ? ['@o3r/ngx-prefetch'] : [])
  ]));
  return chain([
    o3rBasicUpdates(options.projectName, o3rCoreVersion),
    updateImportsFromV7(),
    updateBuildersNamesFromV7(),
    updateOtterGeneratorsNamesFromV7(),
    options.enableCms ? updateCmsAdapter(options, __dirname) : noop,
    updateOtterEnvironmentAdapter(options, __dirname),
    updateStore(options, __dirname),
    updateFixtureConfig(options, __dirname),
    options.enableCustomization ? updateCustomizationEnvironment(__dirname, o3rCoreVersion, options) : noop,
    options.generateAzurePipeline ? createAzurePipeline(options, __dirname) : noop,
    options.enablePlaywright ? updatePlaywright(__dirname) : noop,
    updateLinter(options, __dirname, o3rCoreVersion),
    updateDifferentialLoading(options),
    updateAdditionalModules(options, __dirname),
    generateRenovateConfig(__dirname),
    options.skipLinter ? noop() : applyEsLintFix(),
    // dependencies for store (mainly ngrx, store dev tools, storage sync), playwright, linter are installed by hand if the option is active
    options.skipInstall ? noop() : install,
    ngAddPackages(internalPackagesToInstallWithNgAdd, {skipConfirmation: true, version: o3rCoreVersion, parentPackageInfo: '@o3r/core - setup', projectName: options.projectName}),
    ngAddPackages(externalPackagesToInstallWithNgAdd, {skipConfirmation: true, parentPackageInfo: '@o3r/core - setup', projectName: options.projectName})
  ]);
}
