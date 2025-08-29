import * as path from 'node:path';
import {
  apply,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule,
  template,
  url,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  getWorkspaceConfig,
  ngAddDependenciesRule,
} from '@o3r/schematics';
import type {
  PackageJson,
} from 'type-fest';
import type {
  NgAddSchematicsSchema,
} from './schema';
/**
 * List of external dependencies to be added to the project as peer dependencies
 */
const dependenciesToInstall: string[] = [
];

/**
 * List of external dependencies to be added to the project as dev dependencies
 */
const devDependenciesToInstall = [
  'style-dictionary'
];

const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');

/**
 * Add Otter Style Dictionary process to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
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
        projectType: projectType
      }),
      move(projectRoot),
      renameTemplateFiles()
    ]), MergeStrategy.Overwrite);
  };

  const updatePackageJson: Rule = (tree, context) => {
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const workspacePackageJsonPath = workspaceProject?.root && tree.exists(path.posix.join(workspaceProject.root, 'package.json'))
      ? path.posix.join(workspaceProject.root, 'package.json')
      : 'package.json';
    const packageJson = tree.readJson(workspacePackageJsonPath) as PackageJson;

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

    tree.overwrite(workspacePackageJsonPath, JSON.stringify(packageJson, null, 2));
  };

  /* ng add rules */
  return chain([
    generateConfig,
    updatePackageJson,
    ngAddDependenciesRule(options, packageJsonPath, { dependenciesToInstall, devDependenciesToInstall })
  ]);
}

/**
 * Add Otter Style Dictionary to an Angular Project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema) => createOtterSchematic(ngAddFn)(options);
