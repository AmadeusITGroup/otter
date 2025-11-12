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
  getPackageManager,
  getWorkspaceConfig,
  NgAddPackageOptions,
} from '@o3r/schematics';
import type {
  PackageJson,
} from 'type-fest';

/**
 * Add Playwright to Otter application
 * @param options @see RuleFactory.options
 */
export function updatePlaywright(options: NgAddPackageOptions): Rule {
  return (tree: Tree, context: SchematicContext) => {
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
      tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

    // generate files
    if (!tree.exists(path.posix.join(workingDirectory, 'e2e-playwright', 'playwright-config.ts'))) {
      const startCommand = `${getPackageManager()} run start`;
      const project = options?.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;
      const serverPort = project?.architect?.serve?.options?.port || '4200';

      const templateSource = apply(url('./playwright/templates'), [
        template({
          ...strings,
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
