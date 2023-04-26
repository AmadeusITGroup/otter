import {chain, noop, SchematicContext, Tree} from '@angular-devkit/schematics';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {NgAddSchematicsSchema} from '../schema';

/**
 * Enable all the otter features requested by the user
 * Install all the related dependencies and import the features inside the application
 *
 * @param options
 */
export const prepareProject = (options: NgAddSchematicsSchema, rootFolder: string) => async (tree: Tree, context: SchematicContext) => {
  const {
    createAzurePipeline, generateRenovateConfig, o3rBasicUpdates, updateAdditionalModules, updateCmsAdapter,
    updateCustomizationEnvironment, updateFixtureConfig, updateLinter,
    updateOtterEnvironmentAdapter, updatePlaywright, updateStore
  } = await import('../../rule-factories/index');

  const corePackageJsonContent = JSON.parse(fs.readFileSync(path.resolve(rootFolder, '..', '..', 'package.json'), {encoding: 'utf-8'}));
  const o3rCoreVersion = corePackageJsonContent.version;
  const {addVsCodeRecommendations, applyEsLintFix, getProjectFromTree, install, mapImportV7toV8, ngAddPackages,
    removePackages, renamedPackagesV7toV8, updateImports} = await import('@o3r/schematics');
  const {updateBuildersNames} = await import('../updates-for-v8/cms-adapters/update-builders-names');
  const {updateOtterGeneratorsNames} = await import('../updates-for-v8/generators/update-generators-names');
  const {packagesToRemove} = await import('../updates-for-v8/replaced-packages');
  const workspaceProject = getProjectFromTree(tree);
  const internalPackagesToInstallWithNgAdd = Array.from(new Set([
    ...(workspaceProject.projectType === 'application' ? ['@o3r/application'] : []),
    ...(options.enableCms ? ['@o3r/localization', '@o3r/styling', '@o3r/components', '@o3r/configuration'] : []),
    ...(options.enableStyling ? ['@o3r/styling'] : []),
    ...(options.enableConfiguration ? ['@o3r/configuration'] : []),
    ...(options.enableLocalization ? ['@o3r/localization'] : []),
    ...(options.enableCustomization ? ['@o3r/components', '@o3r/configuration'] : []),
    ...(options.enableAnalytics ? ['@o3r/analytics'] : []),
    ...(options.enableApisManager ? ['@o3r/apis-manager'] : []),
    ...(options.enableStorybook ? ['@o3r/storybook'] : []),
    ...(options.enablePlaywright ? ['@o3r/testing'] : []),
    ...(options.enableRulesEngine ? ['@o3r/rules-engine'] : [])
  ]));
  const externalPackagesToInstallWithNgAdd = Array.from(new Set([
    ...(options.enablePrefetchBuilder ? ['@o3r/ngx-prefetch'] : [])
  ]));
  return () => chain([
    o3rBasicUpdates(options.projectName, o3rCoreVersion),
    updateImports(mapImportV7toV8, renamedPackagesV7toV8) as any,
    updateBuildersNames(),
    updateOtterGeneratorsNames(),
    updateLinter(options, rootFolder, o3rCoreVersion),
    options.enableCms ? updateCmsAdapter(options, rootFolder) : noop,
    updateOtterEnvironmentAdapter(options, rootFolder),
    updateStore(options, rootFolder),
    updateFixtureConfig(options, rootFolder),
    options.enableCustomization ? updateCustomizationEnvironment(rootFolder, o3rCoreVersion, options) : noop,
    options.generateAzurePipeline ? createAzurePipeline(options, rootFolder) : noop,
    options.enablePlaywright ? updatePlaywright(rootFolder) : noop,
    updateAdditionalModules(options, rootFolder),
    generateRenovateConfig(rootFolder),
    removePackages(packagesToRemove),
    addVsCodeRecommendations(['AmadeusITGroup.otter-devtools', 'EditorConfig.EditorConfig', 'angular.ng-template', '']),
    ngAddPackages(internalPackagesToInstallWithNgAdd, {skipConfirmation: true, version: o3rCoreVersion, parentPackageInfo: '@o3r/core - setup', projectName: options.projectName}),
    ngAddPackages(externalPackagesToInstallWithNgAdd, {skipConfirmation: true, parentPackageInfo: '@o3r/core - setup', projectName: options.projectName}),
    // task that should run after the schematics should be after the ng-add task as they will wait for the package installation before running the other dependencies
    options.skipLinter ? noop() : applyEsLintFix(),
    // dependencies for store (mainly ngrx, store dev tools, storage sync), playwright, linter are installed by hand if the option is active
    options.skipInstall ? noop() : install
  ])(tree, context);
};
