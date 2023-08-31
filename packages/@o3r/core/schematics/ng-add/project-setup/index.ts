import { chain, noop, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { PackageJson } from 'type-fest';
import {
  addWorkspacesToProject,
  createAzurePipeline,
  generateRenovateConfig,
  o3rBasicUpdates,
  updateAdditionalModules,
  updateCustomizationEnvironment,
  updateOtterEnvironmentAdapter,
  updateStore
} from '../../rule-factories/index';
import { NgAddSchematicsSchema } from '../schema';
import { updateBuildersNames } from '../updates-for-v8/cms-adapters/update-builders-names';
import { updateOtterGeneratorsNames } from '../updates-for-v8/generators/update-generators-names';
import { packagesToRemove } from '../updates-for-v8/replaced-packages';
import { shouldOtterLinterBeInstalled } from '../utils/index';
import { askConfirmation } from '@angular/cli/src/utilities/prompt';

const simplifiedSemVerRegexp = new RegExp(/^[~^]?(0|(?:[1-9]+[0-9]*))\.(?:0|[1-9]+[0-9]*)\.(?:0|[1-9]+[0-9]*)(?:-[a-zA-Z]+\.(?:0|[1-9]+[0-9]*))?$/);

/**
 * Enable all the otter features requested by the user
 * Install all the related dependencies and import the features inside the application
 *
 * @param options installation options to pass to the all the other packages' installation
 */
export const prepareProject = (options: NgAddSchematicsSchema) => async (tree: Tree, context: SchematicContext) => {
  const coreSchematicsFolder = path.resolve(__dirname, '..');
  const corePackageJsonPath = path.resolve(coreSchematicsFolder, '..', '..', 'package.json');
  const corePackageJsonContent = JSON.parse(fs.readFileSync(corePackageJsonPath, { encoding: 'utf-8' }));
  if (!corePackageJsonContent) {
    context.logger.error('Could not find @o3r/core package. Are you sure it is installed?');
  }
  const o3rCoreVersion = corePackageJsonContent.version;
  const {
    addVsCodeRecommendations, applyEsLintFix, getProjectFromTree, install, mapImportV7toV8, ngAddPackages,
    readPackageJson, removePackages, renamedPackagesV7toV8, updateImports, isMultipackagesContext, getO3rPeerDeps
  } = await import('@o3r/schematics');
  const installOtterLinter = await shouldOtterLinterBeInstalled(context);
  const workspaceProject = tree.exists('angular.json') ? getProjectFromTree(tree, options.projectName) : undefined;
  const projectType = workspaceProject?.projectType;
  const depsInfo = getO3rPeerDeps(corePackageJsonPath);
  const internalPackagesToInstallWithNgAdd = Array.from(new Set([
    ...(projectType === 'application' ? ['@o3r/application'] : []),
    ...(options.enableApisManager && !!projectType ? ['@o3r/apis-manager'] : []),
    ...(options.enableRulesEngine && !!projectType ? ['@o3r/rules-engine'] : []),
    ...(options.enableStyling && !!projectType ? ['@o3r/styling'] : []),
    ...(options.enableAnalytics && !!projectType ? ['@o3r/analytics'] : []),
    ...(options.enableConfiguration ? ['@o3r/configuration'] : []),
    ...(options.enableLocalization ? ['@o3r/localization'] : []),
    ...(options.enableCustomization ? ['@o3r/components', '@o3r/configuration'] : []),
    ...(options.enableStorybook ? ['@o3r/storybook'] : []),
    ...(installOtterLinter ? ['@o3r/eslint-config-otter'] : []),
    ...depsInfo.o3rPeerDeps
  ]));
  const projectPackageJson = workspaceProject ? readPackageJson(tree, workspaceProject) : tree.readJson('package.json') as PackageJson;
  const externalPackagesToInstallWithNgAdd: Record<string, string | undefined> = {};
  // Ngx-prefetch version is aligned with angular
  if (projectType === 'application' && context.interactive) {

    const installPrefetch = await askConfirmation('Activate prefetch builder to generate prefetcher JavaScript file (see https://github.com/AmadeusITGroup/ngx-prefetch)?', false);
    if (installPrefetch) {
      const angularVersion = projectPackageJson.dependencies?.['@angular/core'] || projectPackageJson.peerDependencies?.['@angular/core'];
      const angularMajorVersion = angularVersion?.match(simplifiedSemVerRegexp)?.[1];
      const ngxPrefetchVersion = angularMajorVersion ? `^${angularMajorVersion}.0.0` : undefined;
      externalPackagesToInstallWithNgAdd['@o3r/ngx-prefetch'] = ngxPrefetchVersion;
    }
  }
  const type = projectType === 'library' ? NodeDependencyType.Peer : NodeDependencyType.Default;
  let appLibRules: Rule[] = [];
  let monorepoRules: Rule[] = [];
  const projectRootRules = [
    generateRenovateConfig(coreSchematicsFolder),
    options.generateAzurePipeline ? createAzurePipeline(options, coreSchematicsFolder) : noop,
    addVsCodeRecommendations(['AmadeusITGroup.otter-devtools', 'EditorConfig.EditorConfig', 'angular.ng-template'])
  ];

  const projectDirectory = workspaceProject?.root;
  const optionsAndWorkingDir = { ...options, workingDirectory: projectDirectory };

  if (projectType) {// this means we run the ng add in a lib/app inside the workspace
    appLibRules = [
      updateImports(mapImportV7toV8, renamedPackagesV7toV8) as any,
      updateBuildersNames(),
      updateOtterGeneratorsNames(),
      updateOtterEnvironmentAdapter(optionsAndWorkingDir, coreSchematicsFolder),
      updateStore(optionsAndWorkingDir, projectType),
      options.enableCustomization && projectType === 'application' ? updateCustomizationEnvironment(coreSchematicsFolder, o3rCoreVersion, optionsAndWorkingDir, false) : noop,
      projectType === 'application' ? updateAdditionalModules(optionsAndWorkingDir, coreSchematicsFolder) : noop,
      removePackages(packagesToRemove),
      ...(!isMultipackagesContext(tree) ? projectRootRules : [])
    ];
  } else {
    monorepoRules = [
      ...projectRootRules,
      addWorkspacesToProject()
    ];
  }
  const commonRules = [
    o3rBasicUpdates(options.projectName, o3rCoreVersion, projectType),
    ngAddPackages(internalPackagesToInstallWithNgAdd,
      { skipConfirmation: true, version: o3rCoreVersion, parentPackageInfo: '@o3r/core - setup', projectName: options.projectName, dependencyType: type, workingDirectory: projectDirectory }
    ),

    ...(Object.entries(externalPackagesToInstallWithNgAdd).map(([packageName, packageVersion]) =>
      ngAddPackages(
        [packageName],
        { skipConfirmation: true, version: packageVersion, parentPackageInfo: '@o3r/core - setup', projectName: options.projectName, dependencyType: type, workingDirectory: projectDirectory }
      )
    )),
    // task that should run after the schematics should be after the ng-add task as they will wait for the package installation before running the other dependencies
    !options.skipLinter && installOtterLinter ? applyEsLintFix() : noop(),
    // dependencies for store (mainly ngrx, store dev tools, storage sync), playwright, linter are installed by hand if the option is active
    options.skipInstall ? noop() : install
  ];

  return () => chain([
    ...monorepoRules, ...commonRules, ...appLibRules
  ])(tree, context);
};
