import { strings } from '@angular-devkit/core';
import { apply, MergeStrategy, mergeWith, renameTemplateFiles, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { addPackageJsonDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';
import { getTemplateFolder } from '@o3r/schematics';

/**
 * Add Playwright to Otter application
 *
 * @param options @see RuleFactory.options
 * @param options.projectName
 * @param rootPath @see RuleFactory.rootPath
 */
export function updatePlaywright(rootPath: string): Rule {
  return (tree: Tree, context: SchematicContext) => {

    // update gitignore
    if (tree.exists('/.gitignore')) {
      let gitignore = tree.read('/.gitignore')!.toString();
      if (!gitignore.includes('dist*')) {
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

    // add dependencies
    addPackageJsonDependency(tree, {name: 'playwright', version: '~1.21.1', type: NodeDependencyType.Dev, overwrite: false});
    addPackageJsonDependency(tree, {name: '@playwright/test', version: '~1.21.1', type: NodeDependencyType.Dev, overwrite: false});
    addPackageJsonDependency(tree, {name: 'rimraf', version: '~3.0.2', type: NodeDependencyType.Dev, overwrite: false});

    // generate files

    if (!tree.exists('/e2e-playwright')) {
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

      const rule = mergeWith(templateSource, MergeStrategy.Overwrite);
      return rule(tree, context);
    }

    return tree;
  };
}
