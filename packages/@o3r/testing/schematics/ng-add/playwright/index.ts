import { strings } from '@angular-devkit/core';
import { apply, MergeStrategy, mergeWith, move, renameTemplateFiles, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import {
  type DependencyToAdd,
  getWorkspaceConfig,
  NgAddPackageOptions
} from '@o3r/schematics';
import { NodeDependencyType } from '@schematics/angular/utility/dependencies';
import * as path from 'node:path';
import * as fs from 'node:fs';
import type { PackageJson } from 'type-fest';

/**
 * Add Playwright to Otter application
 * @param options @see RuleFactory.options
 * @param dependencies
 */
export function updatePlaywright(options: NgAddPackageOptions, dependencies: Record<string, DependencyToAdd>): Rule {
  const corePackageJsonPath = path.resolve(__dirname, '..', '..', '..', 'package.json');
  const ownPackageJson = JSON.parse(fs.readFileSync(corePackageJsonPath, { encoding: 'utf-8' })) as PackageJson & { generatorDependencies: Record<string, string> };
  dependencies['@playwright/test'] = {
    inManifest: [{
      range: ownPackageJson.devDependencies!['@playwright/test'],
      types: [NodeDependencyType.Dev]
    }]
  };
  dependencies.rimraf = {
    inManifest: [{
      range: ownPackageJson.devDependencies!.rimraf,
      types: [NodeDependencyType.Dev]
    }]
  };

  return (tree: Tree, context: SchematicContext) => {
    const workingDirectory = options?.projectName && getWorkspaceConfig(tree)?.projects[options.projectName]?.root || '.';

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

      return mergeWith(templateSource, MergeStrategy.Overwrite)(tree, context);
    }

    return tree;
  };
}
