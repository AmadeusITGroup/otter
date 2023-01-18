import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { addPackageJsonDependency, getPackageJsonDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as commentJson from 'comment-json';
import * as semver from 'semver';
import { getDefaultProjectName, getProjectFromTree, readAngularJson, readPackageJson } from '../../utility/loaders';

/**
 * Update configuration for the prefetch script
 *
 * @param rootPath @see RuleFactory.rootPath
 * @param options
 * @param options.projectName
 */
export function updatePrefetchBuilder(options: { projectName: string | null }): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const workspaceProject = getProjectFromTree(tree, options.projectName);
    const workspace = readAngularJson(tree);
    const packageJson = readPackageJson(tree, workspaceProject);

    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    const projectName = options.projectName || getDefaultProjectName(tree);
    packageJson.scripts['generate:prefetch'] = `ng run ${projectName}:generate-prefetch`;
    tree.overwrite(`${workspaceProject.root}/package.json`, JSON.stringify(packageJson, null, 2));

    if (!workspaceProject.architect) {
      workspaceProject.architect = {};
    }

    workspaceProject.architect['generate-prefetch'] = {
      builder: '@o3r/ngx-prefetch:run',
      targetBuild: `${projectName}:build:production`
    };

    if (!tree.exists('/ngsw-config.json')) {
      context.logger.warn('Run `yarn ng add @angular/pwa` to setup Service Worker prefetch. This is a mandatory step for prefetch capability.');
    }

    workspace.projects[projectName] = workspaceProject;
    tree.overwrite('/angular.json', commentJson.stringify(workspace, null, 2));

    const angularCoreDep = getPackageJsonDependency(tree, '@angular/core');
    if (angularCoreDep) {
      const majorAngularVersion: number = semver.minVersion(angularCoreDep?.version)?.major || 13;
      addPackageJsonDependency(tree, {name: '@o3r/ngx-prefetch', version: `^${majorAngularVersion.toString()}.0.0`, type: NodeDependencyType.Dev, overwrite: false});
    } else {
      context.logger.warn('Could not find "@angular/core" dependency. Unable to add corresponding "@o3r/ngx-prefetch" package.');
    }
    return tree;
  };
}
