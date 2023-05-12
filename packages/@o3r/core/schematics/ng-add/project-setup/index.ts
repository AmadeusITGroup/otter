import { chain, noop, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { PackageJson } from 'type-fest';
import {
  createAzurePipeline,
  generateRenovateConfig,
  o3rBasicUpdates,
  updateAdditionalModules,
  updateCmsAdapter,
  updateCustomizationEnvironment,
  updateFixtureConfig,
  updateLinter,
  updateOtterEnvironmentAdapter,
  updatePlaywright,
  updateStore
} from '../../rule-factories/index';
import { NgAddSchematicsSchema } from '../schema';
import { updateBuildersNames } from '../updates-for-v8/cms-adapters/update-builders-names';
import { updateOtterGeneratorsNames } from '../updates-for-v8/generators/update-generators-names';
import { packagesToRemove } from '../updates-for-v8/replaced-packages';

const simplifiedSemVerRegexp = new RegExp(/^[~^]?(0|(?:[1-9]+[0-9]*))\.(?:0|[1-9]+[0-9]*)\.(?:0|[1-9]+[0-9]*)(?:-[a-zA-Z]+\.(?:0|[1-9]+[0-9]*))?$/);

/**
 * Enable all the otter features requested by the user
 * Install all the related dependencies and import the features inside the application
 *
 * @param options installation options to pass to the all the other packages' installation
 */
export const prepareProject = (options: NgAddSchematicsSchema) => async (tree: Tree, context: SchematicContext) => {
  const coreSchematicsFolder = path.resolve(__dirname, '..');
  const corePackageJsonContent = JSON.parse(fs.readFileSync(path.resolve(coreSchematicsFolder, '..', '..', 'package.json'), {encoding: 'utf-8'}));
  if (!corePackageJsonContent) {
    context.logger.error('Could not find @o3r/core package. Are you sure it is installed?');
  }
  const o3rCoreVersion = corePackageJsonContent.version;
  const {
    addVsCodeRecommendations, applyEsLintFix, getProjectFromTree, install, mapImportV7toV8, ngAddPackages,
    readPackageJson, removePackages, renamedPackagesV7toV8, updateImports
  } = await import('@o3r/schematics');
  const workspaceProject = tree.exists('angular.json') ? getProjectFromTree(tree) : undefined;
  const projectType = workspaceProject?.projectType || 'application';
  const internalPackagesToInstallWithNgAdd = Array.from(new Set([
    ...(projectType === 'application' ? ['@o3r/application'] : []),
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
  const projectPackageJson = workspaceProject ? readPackageJson(tree, workspaceProject) : tree.readJson('package.json') as PackageJson;
  // Ngx-prefetch version is aligned with angular
  const angularVersion = projectPackageJson.dependencies?.['@angular/core'] || projectPackageJson.peerDependencies?.['@angular/core'];
  const angularMajorVersion = angularVersion?.match(simplifiedSemVerRegexp)?.[1];
  const ngxPrefetchVersion = angularMajorVersion ? `^${angularMajorVersion}.0.0` : undefined;
  const type = projectType === 'application' ? NodeDependencyType.Default : NodeDependencyType.Peer;
  const externalPackagesToInstallWithNgAdd = Array.from(new Set([
    ...(options.enablePrefetchBuilder ? ['@o3r/ngx-prefetch'] : [])
  ]));
  return () => chain([
    o3rBasicUpdates(options.projectName, o3rCoreVersion, projectType),
    updateImports(mapImportV7toV8, renamedPackagesV7toV8) as any,
    updateBuildersNames(),
    updateOtterGeneratorsNames(),
    updateLinter(options, coreSchematicsFolder, o3rCoreVersion),
    options.enableCms ? updateCmsAdapter(options, coreSchematicsFolder) : noop,
    updateOtterEnvironmentAdapter(options, coreSchematicsFolder),
    updateStore(options, coreSchematicsFolder),
    updateFixtureConfig(options, coreSchematicsFolder),
    options.enableCustomization ? updateCustomizationEnvironment(coreSchematicsFolder, o3rCoreVersion, options, projectType === 'library') : noop,
    options.generateAzurePipeline ? createAzurePipeline(options, coreSchematicsFolder) : noop,
    options.enablePlaywright ? updatePlaywright(coreSchematicsFolder, options) : noop,
    updateAdditionalModules(options, coreSchematicsFolder),
    generateRenovateConfig(coreSchematicsFolder),
    removePackages(packagesToRemove),
    addVsCodeRecommendations(['AmadeusITGroup.otter-devtools', 'EditorConfig.EditorConfig', 'angular.ng-template', '']),
    ngAddPackages(internalPackagesToInstallWithNgAdd,
      {skipConfirmation: true, version: o3rCoreVersion, parentPackageInfo: '@o3r/core - setup', projectName: options.projectName, dependencyType: type}),
    ngAddPackages(externalPackagesToInstallWithNgAdd,
      {skipConfirmation: true, version: ngxPrefetchVersion, parentPackageInfo: '@o3r/core - setup', projectName: options.projectName, dependencyType: type}),
    // task that should run after the schematics should be after the ng-add task as they will wait for the package installation before running the other dependencies
    options.skipLinter ? noop() : applyEsLintFix(),
    // dependencies for store (mainly ngrx, store dev tools, storage sync), playwright, linter are installed by hand if the option is active
    options.skipInstall ? noop() : install
  ])(tree, context);
};
