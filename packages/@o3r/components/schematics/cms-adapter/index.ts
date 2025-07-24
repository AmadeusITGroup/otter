import * as path from 'node:path';
import {
  chain,
  noop,
  Rule,
  SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  getPackageManagerRunner,
  getWorkspaceConfig,
  readPackageJson,
} from '@o3r/schematics';

/**
 * Update CMS adapter tools
 * @param options @see RuleFactory.options
 * @param options.projectName
 */
function updateCmsAdapterFn(options: { projectName?: string | undefined }): Rule {
  if (!options.projectName) {
    return noop;
  }

  /**
   * Add cms extractors builder into the angular.json
   * @param tree
   * @param context
   */
  const editAngularJson = (tree: Tree, context: SchematicContext) => {
    const workspace = getWorkspaceConfig(tree);
    const workspaceProject = options.projectName ? workspace?.projects[options.projectName] : undefined;

    if (!workspace || !workspaceProject) {
      context.logger.error('No project detected, the extractors will not be added');
      return tree;
    }

    if (!workspaceProject.architect) {
      workspaceProject.architect = {};
    }

    workspaceProject.architect['extract-components'] ||= {
      builder: '@o3r/components:extractor',
      options: {
        tsConfig: path.join(workspaceProject?.root || '', 'tsconfig.cms.json'),
        libraries: []
      }
    };

    workspaceProject.architect['check-config-migration-metadata'] ||= {
      builder: '@o3r/components:check-config-migration-metadata',
      options: {
        migrationDataPath: 'migration-scripts/dist/MIGRATION-*.json'
      }
    };

    workspace.projects[options.projectName!] = workspaceProject;
    tree.overwrite('/angular.json', JSON.stringify(workspace, null, 2));
    return tree;
  };

  /**
   * Add cms extractors scripts into the package.json
   * @param tree
   * @param context
   */
  const addExtractorsScripts = (tree: Tree, context: SchematicContext) => {
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;

    if (!workspaceProject) {
      context.logger.error('No package detected, the extractor scripts will not be added');
      return tree;
    }

    const packageJson = readPackageJson(tree, workspaceProject);
    const packageManagerRunner = getPackageManagerRunner(getWorkspaceConfig(tree));
    packageJson.scripts ||= {};
    packageJson.scripts['cms-adapters:components'] ||= `ng run ${options.projectName!}:extract-components`;
    packageJson.scripts['cms-adapters:metadata'] = Object.keys(packageJson.scripts)
      .filter((s) => /^cms-adapters:(?!metadata$)/.test(s))
      .map((s) => `${packageManagerRunner} ${s}`)
      .join(' && ');

    tree.overwrite(`${workspaceProject.root}/package.json`, JSON.stringify(packageJson, null, 2));
    return tree;
  };

  return chain([
    addExtractorsScripts,
    editAngularJson
  ]);
}

/**
 * Update CMS adapter tools
 * @param options @see RuleFactory.options
 * @param options.projectName
 */
export const updateCmsAdapter = createOtterSchematic(updateCmsAdapterFn);
