import { chain, noop, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { addPackageJsonDependency, NodeDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as commentJson from 'comment-json';
import * as path from 'node:path';
import { NodePackageLinkTask } from '../../tasks/link';
import { getProjectFromTree, readAngularJson, readPackageJson } from '../../utility/loaders';

/**
 * Update Package.json dependencies and add Otter packages
 *
 * @param options @see RuleFactory.options
 * @param rootPath @see RuleFactory.rootPath
 * @param options.projectName
 * @param options.isSymlinksNeeded
 * @param _rootPath
 */
export function updateDependencies(options: { projectName: string | null; isSymlinksNeeded: boolean }, _rootPath: string): Rule {
  const addDependencies: Rule = (tree: Tree, context: SchematicContext) => {
    const myVersion: string = require(path.resolve(__dirname, '..', '..', '..', '..', 'package.json')).version;
    const workspaceProject = getProjectFromTree(tree, options.projectName || undefined);
    const type: NodeDependencyType = workspaceProject.projectType === 'application' ? NodeDependencyType.Default : NodeDependencyType.Peer;

    const otterDependencies: NodeDependency[] = [
      { name: '@otter/common', version: `~${myVersion}`, type, overwrite: true },
      { name: '@otter/core', version: `~${myVersion}`, type, overwrite: true },
      { name: '@otter/devkit', version: `~${myVersion}`, type, overwrite: true },
      { name: '@otter/animations', version: `~${myVersion}`, type, overwrite: true },
      { name: '@otter/services', version: `~${myVersion}`, type, overwrite: true },
      { name: '@otter/store', version: `~${myVersion}`, type, overwrite: true },
      { name: '@o3r/styling', version: `~${myVersion}`, type, overwrite: true },
      { name: '@otter/rules-engine-core', version: `~${myVersion}`, type, overwrite: true }
    ];
    const otterDevDependencies: NodeDependency[] = [
      { name: '@otter/cms-adapters', version: `~${myVersion}`, type: NodeDependencyType.Dev, overwrite: true },
      { name: '@otter/ng-tools', version: `~${myVersion}`, type: NodeDependencyType.Dev, overwrite: true },
      { name: '@otter/testing', version: `~${myVersion}`, type: NodeDependencyType.Dev, overwrite: true }
    ];

    const dependencies: NodeDependency[] = [
      ...otterDependencies,
      ...otterDevDependencies
    ];

    if (options.isSymlinksNeeded) {
      otterDependencies.forEach((dependency) => context.addTask(new NodePackageLinkTask(dependency.name)));
    }
    dependencies.forEach((dep) => addPackageJsonDependency(tree, dep));

    return tree;
  };

  const updateAngularJson: Rule = (tree: Tree, context: SchematicContext) => {
    const workspace = readAngularJson(tree);
    const projectName = options.projectName || workspace.defaultProject || Object.keys(workspace.projects)[0];
    const workspaceProject = getProjectFromTree(tree, projectName);

    if (workspaceProject.architect && workspaceProject.architect.build && workspaceProject.architect.build.options) {
      workspaceProject.architect.build.options.preserveSymlinks = true;
    } else {
      context.logger.warn('No build target found, skipped preserveSymlinks option setup');
      return tree;
    }

    workspace.projects[projectName] = workspaceProject;
    tree.overwrite('/angular.json', commentJson.stringify(workspace, null, 2));
    return tree;
  };

  const updatePackageJson: Rule = (tree: Tree, _context: SchematicContext) => {
    const workspace = readAngularJson(tree);
    const projectName = options.projectName || workspace.defaultProject || Object.keys(workspace.projects)[0];
    const workspaceProject = getProjectFromTree(tree, projectName || undefined);
    const packageJson = readPackageJson(tree, workspaceProject);

    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }

    packageJson.scripts['update:otter'] = 'ng update @otter/ng-tools';

    tree.overwrite(`${workspaceProject.root}/package.json`, JSON.stringify(packageJson, null, 2));
    return tree;
  };

  return chain([
    addDependencies,
    updatePackageJson,
    options.isSymlinksNeeded ? updateAngularJson : noop
  ]);
}
