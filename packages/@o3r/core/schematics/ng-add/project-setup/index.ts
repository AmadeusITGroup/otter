import { chain, noop, type Rule } from '@angular-devkit/schematics';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  o3rBasicUpdates,
  updateAdditionalModules,
  updateCustomizationEnvironment,
  updateOtterEnvironmentAdapter,
  updateStore
} from '../../rule-factories/index';
import {
  applyEsLintFix,
  getO3rPeerDeps,
  getProjectNewDependenciesTypes,
  getWorkspaceConfig,
  removePackages,
  type SetupDependenciesOptions
} from '@o3r/schematics';
import type { NgAddSchematicsSchema } from '../schema';
import { updateBuildersNames } from '../updates-for-v8/cms-adapters/update-builders-names';
import { updateOtterGeneratorsNames } from '../updates-for-v8/generators/update-generators-names';
import { packagesToRemove } from '../updates-for-v8/replaced-packages';
import { shouldOtterLinterBeInstalled } from '../utils/index';

/**
 * Enable all the otter features requested by the user
 * Install all the related dependencies and import the features inside the application
 * @param options installation options to pass to the all the other packages' installation
 * @param dependenciesSetupConfig
 */
export const prepareProject = (options: NgAddSchematicsSchema, dependenciesSetupConfig: SetupDependenciesOptions): Rule => async (tree, context) => {
  const coreSchematicsFolder = path.resolve(__dirname, '..');
  const corePackageJsonPath = path.resolve(coreSchematicsFolder, '..', '..', 'package.json');
  const corePackageJsonContent = JSON.parse(fs.readFileSync(corePackageJsonPath, { encoding: 'utf-8' }));
  if (!corePackageJsonContent) {
    context.logger.error('Could not find @o3r/core package. Are you sure it is installed?');
  }
  const o3rCoreVersion = corePackageJsonContent.version;
  const installOtterLinter = await shouldOtterLinterBeInstalled(context);
  const workspaceConfig = getWorkspaceConfig(tree);
  const workspaceProject = options.projectName && workspaceConfig?.projects?.[options.projectName] || undefined;
  const projectType = workspaceProject?.projectType;
  const depsInfo = getO3rPeerDeps(corePackageJsonPath);
  const internalPackagesToInstallWithNgAdd = Array.from(new Set([
    ...(projectType === 'application' ? ['@o3r/application'] : []),
    ...(installOtterLinter ? ['@o3r/eslint-config-otter'] : []),
    ...depsInfo.o3rPeerDeps
  ]));
  const projectDirectory = workspaceProject?.root;
  const optionsAndWorkingDir = { ...options, workingDirectory: projectDirectory, dependenciesSetupConfig };

  internalPackagesToInstallWithNgAdd
    .forEach((dep) => {
      dependenciesSetupConfig.dependencies[dep] = {
        inManifest: [{
          range: `~${o3rCoreVersion}`,
          types: getProjectNewDependenciesTypes(workspaceProject)
        }]
      };
    });
  (dependenciesSetupConfig.ngAddToRun ||= []).push(...internalPackagesToInstallWithNgAdd);

  const appLibRules: Rule[] = [
    updateBuildersNames(),
    updateOtterGeneratorsNames(),
    updateOtterEnvironmentAdapter(optionsAndWorkingDir, coreSchematicsFolder),
    updateStore(optionsAndWorkingDir, projectType),
    options.enableCustomization && projectType === 'application' ? updateCustomizationEnvironment(coreSchematicsFolder, o3rCoreVersion, optionsAndWorkingDir, false) : noop,
    projectType === 'application' ? updateAdditionalModules(optionsAndWorkingDir, dependenciesSetupConfig) : noop,
    removePackages(packagesToRemove),
    o3rBasicUpdates(options.projectName, o3rCoreVersion, projectType),
    // task that should run after the schematics should be after the ng-add task as they will wait for the package installation before running the other dependencies
    !options.skipLinter && installOtterLinter ? applyEsLintFix() : noop()
  ];

  return chain(appLibRules);
};
