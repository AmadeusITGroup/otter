import { apply, chain, MergeStrategy, mergeWith, move, Rule, template, url } from '@angular-devkit/schematics';
import type { NgAddSchematicsSchema } from './schema';
import {dump, load} from 'js-yaml';

/**
 * Add a Otter CI pipeline to an Angular Project
 * @param options
 * @param nonOtterProject boolean indicating if the project is not Otter based.
 */
function ngAddFn(options: NgAddSchematicsSchema, nonOtterProject?: boolean): Rule {

  return async (tree, context) => {
    // default on NPM
    let packageManager = 'npm';
    if (nonOtterProject) {
      if (tree.exists('/yarn.lock')) {
        packageManager = 'yarn';
      }
    } else {
      const {
        getPackageManager,
        getWorkspaceConfig
      } = await import('@o3r/schematics');
      packageManager = getPackageManager({ workspaceConfig: getWorkspaceConfig(tree) });
    }
    context.logger.info(`Setting up pipeline for package manager: "${packageManager}" `);
    const setupCommand = packageManager === 'yarn' ? 'yarn install --immutable' : 'npm ci';
    const baseTemplateSource = apply(url(`./templates/${options.toolchain}`), [
      template({
        ...options,
        packageManager,
        setupCommand,
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
 * Add a Otter CI pipeline to an Angular project
 * @param options
 */
export const ngAdd = (options: NgAddSchematicsSchema): Rule => async (_, { logger }) => {
  const missingSchematicDependencyMessage = 'Missing @o3r/schematics';
  try {
    const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics').catch(() => {throw new Error(missingSchematicDependencyMessage); });
    return createSchematicWithMetricsIfInstalled(ngAddFn)(options);
  } catch (err) {
    if (err instanceof Error && err.message === missingSchematicDependencyMessage) {
      logger.warn(`[WARNING]: You are trying to add '@o3r/pipeline' on a project that does not have '@o3r/schematics' as a dependency.
        Please run 'ng add @o3r/schematics' before for a more robust setup. Trying to guess the package manager.`);
      return ngAddFn(options, true);
    } else {
      throw err;
    }
  }
};
