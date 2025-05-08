import * as path from 'node:path';
import {
  apply,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  renameTemplateFiles,
  Rule,
  template,
  url,
} from '@angular-devkit/schematics';
import {
  applyEditorConfig,
  createOtterSchematic,
  getExternalDependenciesVersionRange,
  getO3rPeerDeps,
  getPackageInstallConfig,
  getProjectNewDependenciesTypes,
  getWorkspaceConfig,
  setupDependencies,
} from '@o3r/schematics';
import type {
  PackageJson,
} from 'type-fest';
import type {
  OTTER_NAME_PREFIX,
} from '../../src/constants.mjs';
import type {
  NgAddSchematicsSchema,
} from './schema';

/** Prefix of the expose Design Token items */
const PREFIX: typeof OTTER_NAME_PREFIX = 'ama';

/**
 * Add Otter Style Dictionary process to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  const setup: Rule = async (tree, context) => {
    const devDependenciesToInstall = [
      'style-dictionary'
    ];
    const depsInfo = getO3rPeerDeps(path.resolve(__dirname, '..', '..', 'package.json'), true);
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const { NodeDependencyType } = await import('@schematics/angular/utility/dependencies');
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const dependencies = depsInfo.o3rPeerDeps.reduce((acc, dep) => {
      acc[dep] = {
        inManifest: [{
          range: `${options.exactO3rVersion ? '' : '~'}${depsInfo.packageVersion}`,
          types: getProjectNewDependenciesTypes(workspaceProject)
        }],
        ngAddOptions: { exactO3rVersion: options.exactO3rVersion }
      };
      return acc;
    }, getPackageInstallConfig(packageJsonPath, tree, options.projectName, true, !!options.exactO3rVersion));
    Object.entries(getExternalDependenciesVersionRange(devDependenciesToInstall, packageJsonPath, context.logger))
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
      ngAddToRun: depsInfo.o3rPeerDeps
    });
  };

  const generateConfig: Rule = (tree, context) => {
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const projectType = workspaceProject?.projectType || 'application';
    const projectRoot = workspaceProject?.root;
    if (!projectRoot) {
      context.logger.warn('No workspace detected, the default configuration will not be added.');
      return;
    }
    return mergeWith(apply(url('./templates'), [
      template({
        configExtension: `${options.useJsExt ? '' : 'm'}js`,
        projectType: projectType,
        prefixName: PREFIX
      }),
      move(projectRoot),
      renameTemplateFiles()
    ]), MergeStrategy.Overwrite);
  };

  const updatePackageJson: Rule = (tree, context) => {
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const packageJsonPath = workspaceProject?.root && tree.exists(path.posix.join(workspaceProject.root, 'package.json'))
      ? path.posix.join(workspaceProject.root, 'package.json')
      : 'package.json';
    const packageJson = tree.readJson(packageJsonPath) as PackageJson;

    packageJson.scripts ||= {};
    if (packageJson.scripts['generate:css']) {
      context.logger.warn('The script "generate:css" already exists in the package.json, it will not be added.');
    } else {
      packageJson.scripts['generate:css'] = `style-dictionary build ${options.useJsExt ? '' : '-c config.mjs '}-p css`;
    }
    if (packageJson.scripts['generate:metadata']) {
      context.logger.warn('The script "generate:metadata" already exists in the package.json, it will not be added.');
    } else {
      packageJson.scripts['generate:metadata'] = `style-dictionary build ${options.useJsExt ? '' : '-c config.mjs '}-p cms`;
    }

    tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
  };

  /* ng add rules */
  return chain([
    setup,
    generateConfig,
    updatePackageJson,
    options.skipLinter ? noop() : applyEditorConfig()
  ]);
}

/**
 * Add Otter Style Dictionary to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
