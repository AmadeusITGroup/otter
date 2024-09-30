import { apply, chain, MergeStrategy, mergeWith, move, Rule, template, url } from '@angular-devkit/schematics';
import type { NgAddSchematicsSchema } from './schema';
import {dump, load} from 'js-yaml';
import * as path from 'node:path';
import * as fs from 'node:fs';
import type { PackageJson } from 'type-fest';

/**
 * Add an Otter CI pipeline to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {

  return async (tree, context) => {
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const ownPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' })) as PackageJson & { o3rConfig?: { commitHash?: string } };
    const commitHash = ownPackageJson.o3rConfig?.commitHash;
    const ownVersion = ownPackageJson.version;
    const actionVersionString = commitHash ? `${commitHash} # v${ownVersion}` : ownVersion;
    let packageManager = 'npm';
    try {
      const schematics = await import('@o3r/schematics');
      packageManager = schematics.getPackageManager({ workspaceConfig: schematics.getWorkspaceConfig(tree) });
    } catch {
      packageManager = tree.exists('/yarn.lock') ? 'yarn' : 'npm';
    }
    context.logger.info(`Setting up pipeline for package manager: "${packageManager}" `);
    const setupCommand = packageManager === 'yarn' ? 'yarn install --immutable' : 'npm ci';
    const baseTemplateSource = apply(url(`./templates/${options.toolchain}`), [
      template({
        ...options,
        packageManager,
        setupCommand,
        actionVersionString,
        dot: '.'
      }),
      move(tree.root.path)
    ]);

    const npmRegistryRule: Rule = () => {
      if (!options.npmRegistry) {
        return tree;
      }
      if (packageManager === 'yarn') {
        const yarnrcPath = '/.yarnrc.yml';
        if (!tree.exists(yarnrcPath)) {
          tree.create(yarnrcPath, dump({'npmRegistryServer': options.npmRegistry}, {indent: 2}));
        } else {
          const yarnrcContent = load(tree.readText(yarnrcPath)) as any;
          yarnrcContent.npmRegistryServer = options.npmRegistry;
          tree.overwrite(yarnrcPath, dump(yarnrcContent, {indent: 2}));
        }
      } else if (packageManager === 'npm') {
        const npmrcPath = '/.npmrc';
        const npmRegistry = `registry=${options.npmRegistry}`;
        if (!tree.exists(npmrcPath)) {
          tree.create(npmrcPath, npmRegistry);
        } else {
          const npmrcContent = tree.readText(npmrcPath);
          tree.overwrite(npmrcPath, npmrcContent.concat(`\n${npmRegistry}`));
        }
      }
      return tree;
    };

    const rules = [
      mergeWith(baseTemplateSource, MergeStrategy.Overwrite),
      npmRegistryRule
    ];
    return () => chain(rules)(tree, context);

  };
}

/**
 * Add an Otter CI pipeline to an Angular project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema): Rule => async (_, { logger }) => {
  return await import('@o3r/schematics')
    .catch(() => {
      logger.warn(`You are trying to add '@o3r/pipeline' on a project that does not have '@o3r/schematics' as a dependency.
        Please run 'ng add @o3r/schematics' before for a more robust setup. Trying to guess the package manager.`);
    }).then((schematics) =>
      schematics ? schematics.createSchematicWithMetricsIfInstalled(ngAddFn)(options) : ngAddFn(options)
    );
};
