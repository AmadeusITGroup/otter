import { apply, chain, MergeStrategy, mergeWith, move, Rule, template, type Tree, url } from '@angular-devkit/schematics';
import { dump, load } from 'js-yaml';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { PackageJson } from 'type-fest';
import type { NgAddSchematicsSchema } from './schema';

/**
 * Determines if the Yarn version is 2 or higher based on the contents of the .yarnrc.yml file.
 * @param tree tree
 */
function isYarn2(tree: Tree) {
  const yarnrcPath = '/.yarnrc.yml';
  if (tree.exists(yarnrcPath)) {
    const { yarnPath } = (load(tree.readText(yarnrcPath)) || {}) as { yarnPath?: string };
    return !yarnPath || !/yarn-1\./.test(yarnPath);
  }
  return false;
}

/**
 * Add an Otter CI pipeline to an Angular Project
 * @param options
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {

  return async (tree, context) => {
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const ownPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' })) as PackageJson & { config?: { o3r?: { commitHash?: string } } };
    const commitHash = ownPackageJson.config?.o3r?.commitHash;
    const ownVersion = ownPackageJson.version;
    const actionVersionString = commitHash ? `${commitHash} # v${ownVersion}` : `v${ownVersion}`;
    let packageManager = 'npm';
    try {
      const schematics = await import('@o3r/schematics');
      packageManager = schematics.getPackageManager({ workspaceConfig: schematics.getWorkspaceConfig(tree) });
    } catch {
      packageManager = tree.exists('/yarn.lock') ? 'yarn' : 'npm';
    }
    context.logger.info(`Setting up pipeline for package manager: "${packageManager}" `);
    const setupCommand = packageManager === 'yarn' ? 'yarn install --immutable' : 'npm ci';
    const yarn2 = packageManager === 'yarn' && isYarn2(tree);
    const baseTemplateSource = apply(url(`./templates/${options.toolchain}`), [
      template({
        ...options,
        packageManager,
        setupCommand,
        actionVersionString,
        yarn2,
        dot: '.'
      }),
      move(tree.root.path)
    ]);

    const npmRegistryRule: Rule = () => {
      if (!options.npmRegistry) {
        return tree;
      }
      if (yarn2) {
        const yarnrcPath = '/.yarnrc.yml';
        const yarnrcContent = load(tree.readText(yarnrcPath)) as { npmRegistryServer?: string };
        yarnrcContent.npmRegistryServer = options.npmRegistry;
        tree.overwrite(yarnrcPath, dump(yarnrcContent, {indent: 2}));
      } else {
        // both npm and yarn 1 use .npmrc for the registry
        const npmrcPath = '/.npmrc';
        if (!tree.exists(npmrcPath)) {
          tree.create(npmrcPath, `registry=${options.npmRegistry}`);
        } else {
          const npmrcContent = tree.readText(npmrcPath);
          const registryPattern = /^registry=.*$/m;
          const newRegistryLine = `registry=${options.npmRegistry}`;
          const newContent = registryPattern.test(npmrcContent)
            ? npmrcContent.replace(registryPattern, newRegistryLine)
            : `${npmrcContent}\n${newRegistryLine}`;
          tree.overwrite(npmrcPath, newContent);
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
