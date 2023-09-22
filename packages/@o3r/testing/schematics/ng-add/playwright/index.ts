import { strings } from '@angular-devkit/core';
import { apply, chain, MergeStrategy, mergeWith, move, renameTemplateFiles, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { getProjectRootDir, NgAddPackageOptions, ngAddPeerDependencyPackages } from '@o3r/schematics';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as path from 'node:path';
import { PackageJson } from 'type-fest';

/**
 * Add Playwright to Otter application
 *
 * @param options @see RuleFactory.options
 */
export function updatePlaywright(options: NgAddPackageOptions = {}): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const workingDirectory = options.projectName && getProjectRootDir(tree, options.projectName) || '.';

    // update gitignore
    const gitignorePath = '.gitignore';
    if (tree.exists(gitignorePath)) {
      let gitignore = tree.readText(gitignorePath);
      if (!gitignore.includes('dist*') && !gitignore.includes('dist-e2e-playwright') && !gitignore.includes('playwright-reports')) {
        gitignore +=
          `
# Playwright
dist-e2e-playwright
playwright-reports
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
    const corePackageJsonPath = path.resolve(__dirname, '..', '..', '..', 'package.json');
    const ngAddRules = ngAddPeerDependencyPackages(['@playwright/test', 'rimraf'], corePackageJsonPath, NodeDependencyType.Dev, {...options, skipNgAddSchematicRun: true, workingDirectory});

    // generate files
    if (!tree.exists(path.posix.join(workingDirectory, 'e2e-playwright', 'playwright-config.ts'))) {
      const name = 'my-scenario';
      const scenarioName = strings.capitalize(strings.camelize(name));
      const sanity = 'my-sanity';
      const sanityName = strings.capitalize(strings.camelize(sanity));

      const templateSource = apply(url('./playwright/templates'), [
        template({
          ...strings,
          name,
          scenarioName,
          sanity,
          sanityName
        }),
        renameTemplateFiles(),
        move(workingDirectory)
      ]);

      return chain([
        ngAddRules,
        mergeWith(templateSource, MergeStrategy.Overwrite)
      ])(tree, context);
    }

    return ngAddRules(tree, context);
  };
}
