import * as path from 'node:path';
import {
  strings,
} from '@angular-devkit/core';
import {
  apply,
  MergeStrategy,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  type DependencyToAdd,
  getExternalDependenciesInfo,
  getPackageManager,
  getWorkspaceConfig,
  NgAddPackageOptions,
} from '@o3r/schematics';
import type {
  PackageJson,
} from 'type-fest';

const devDependenciesToInstall = [
  '@playwright/test',
  'rimraf'
];
const dependenciesToInstall: string[] = [];

/**
 * Add Playwright to Otter application
 * @param options @see RuleFactory.options
 * @param dependencies
 */
export function updatePlaywright(options: NgAddPackageOptions, dependencies: Record<string, DependencyToAdd>): Rule {
  const corePackageJsonPath = path.resolve(__dirname, '..', '..', '..', 'package.json');

  return (tree: Tree, context: SchematicContext) => {
    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
    const projectPackageJson = tree.readJson(path.posix.join(workspaceProject?.root || '.', 'package.json')) as PackageJson;

    const externalDependencies = getExternalDependenciesInfo(
      {
        devDependenciesToInstall,
        dependenciesToInstall,
        o3rPackageJsonPath: corePackageJsonPath,
        projectPackageJson,
        projectType: workspaceProject?.projectType
      },
      context.logger
    );
    Object.entries(externalDependencies).forEach(([key, value]) => {
      dependencies[key] = value;
    });
    const workingDirectory = (options?.projectName && getWorkspaceConfig(tree)?.projects[options.projectName]?.root) || '.';

    // update gitignore
    const gitignorePath = '.gitignore';
    if (tree.exists(gitignorePath)) {
      let gitignore = tree.readText(gitignorePath);
      if (!gitignore.includes('dist*') && !gitignore.includes('dist-e2e-playwright') && !gitignore.includes('playwright-reports')) {
        gitignore
          += `
# Playwright
dist-e2e-playwright
playwright-reports
test-results
`;
        tree.overwrite(gitignorePath, gitignore);
      }
    }

    // register scripts
    const packageJsonPath = path.posix.join(workingDirectory, 'package.json');
    if (tree.exists(packageJsonPath)) {
      const packageJson = tree.readJson(packageJsonPath) as PackageJson;
      packageJson.scripts ||= {};
      packageJson.scripts['test:playwright'] ||= 'playwright test --config=e2e-playwright/playwright-config.ts';
      packageJson.scripts['test:playwright:sanity'] ||= 'playwright test --config=e2e-playwright/playwright-config.sanity.ts';
      tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

    // generate files
    if (!tree.exists(path.posix.join(workingDirectory, 'e2e-playwright', 'playwright-config.ts'))) {
      const name = 'my-scenario';
      const scenarioName = strings.capitalize(strings.camelize(name));
      const sanity = 'my-sanity';
      const sanityName = strings.capitalize(strings.camelize(sanity));
      const startCommand = `${getPackageManager()} run start`;
      const project = options?.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
      const serverPort = project?.architect?.serve?.options?.port || '4200';

      const templateSource = apply(url('./playwright/templates'), [
        template({
          ...strings,
          name,
          scenarioName,
          sanity,
          sanityName,
          serverPort,
          startCommand
        }),
        renameTemplateFiles(),
        move(workingDirectory)
      ]);

      return mergeWith(templateSource, MergeStrategy.Overwrite)(tree, context);
    }

    return tree;
  };
}
