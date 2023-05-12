import { strings } from '@angular-devkit/core';
import { apply, chain, MergeStrategy, mergeWith, renameTemplateFiles, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { getTemplateFolder, NgAddPackageOptions, ngAddPeerDependencyPackages } from '@o3r/schematics';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as path from 'node:path';

/**
 * Add Playwright to Otter application
 *
 * @param options @see RuleFactory.options
 * @param options.projectName
 * @param rootPath @see RuleFactory.rootPath
 */
export function updatePlaywright(rootPath: string, options: NgAddPackageOptions = {}): Rule {
  return (tree: Tree, context: SchematicContext) => {

    // update gitignore
    if (tree.exists('/.gitignore')) {
      let gitignore = tree.read('/.gitignore')!.toString();
      if (!gitignore.includes('dist*') && !gitignore.includes('/dist-e2e-playwright') && !gitignore.includes('/playwright-reports')) {
        gitignore +=
          `
# Playwright
/dist-e2e-playwright
/playwright-reports
`;
        tree.overwrite('/.gitignore', gitignore);
      }
    }

    // register scripts
    if (tree.exists('/package.json')) {
      const packageJson = JSON.parse(tree.read('/package.json')!.toString());
      packageJson.scripts ||= {};
      packageJson.scripts['test:playwright'] ||= 'playwright test --config=e2e-playwright/playwright-config.ts';
      packageJson.scripts['test:playwright:sanity'] ||= 'playwright test --config=e2e-playwright/playwright-config.sanity.ts';
      tree.overwrite('/package.json', JSON.stringify(packageJson, null, 2));
    }
    const corePackageJsonPath = path.resolve(__dirname, '..', '..', '..', 'package.json');
    const ngAddRules = ngAddPeerDependencyPackages(['playwright', '@playwright/test', 'rimraf'], corePackageJsonPath, NodeDependencyType.Dev, options);

    // generate files
    if (!tree.exists('/e2e-playwright/playwright-config.ts')) {
      const name = 'my-scenario';
      const scenarioName = strings.capitalize(strings.camelize(name));
      const sanity = 'my-sanity';
      const sanityName = strings.capitalize(strings.camelize(sanity));

      const templateSource = apply(url(getTemplateFolder(rootPath, __dirname)), [
        template({
          ...strings,
          name,
          scenarioName,
          sanity,
          sanityName
        }),
        renameTemplateFiles()
      ]);

      return chain([
        ngAddRules,
        mergeWith(templateSource, MergeStrategy.Overwrite)
      ])(tree, context);
    }

    return ngAddRules(tree, context);
  };
}
