import { apply, chain, externalSchematic, MergeStrategy, mergeWith, move, noop, renameTemplateFiles, Rule, SchematicContext, strings, template, Tree, url } from '@angular-devkit/schematics';
import * as path from 'node:path';
import { getPackageManager, getPackagesBaseRootFolder, getWorkspaceConfig, isNxContext, O3rCliError } from '@o3r/schematics';
import { NgGenerateSdkSchema } from './schema';
import type { NgGenerateTypescriptSDKCoreSchematicsSchema, NgGenerateTypescriptSDKShellSchematicsSchema } from '@ama-sdk/schematics';
import type { PackageJson } from 'type-fest';
import { ngRegisterProjectTasks } from './rules/rules.ng';
import { nxRegisterProjectTasks } from './rules/rules.nx';
import { updateTsConfig } from './rules/update-ts-paths.rule';
import { cleanStandaloneFiles } from './rules/clean-standalone.rule';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';

/**
 * Add an Otter compatible SDK to a monorepo
 * @param options Schematic options
 */
export function generateSdk(options: NgGenerateSdkSchema): Rule {
  const cleanName = strings.dasherize(options.name);

  return (tree, context) => {
    const isNx = isNxContext(tree);
    const workspaceConfig = getWorkspaceConfig(tree);
    if (!workspaceConfig) {
      throw new O3rCliError('No workspace configuration file found');
    }
    const defaultRoot = getPackagesBaseRootFolder(tree, context, workspaceConfig, 'library');
    const scope = tree.exists('/package.json') && (tree.readJson('/package.json') as PackageJson).name?.split('/')?.[0]?.replace(/^@/, '') || 'sdk';

    /** Path to the folder where generate the new SDK */
    const targetPath = path.posix.join(options.path || defaultRoot, cleanName);

    const addModuleSpecificFiles = () => mergeWith(apply(url('./templates'), [
      template({
        ...options,
        rootRelativePath: path.relative(targetPath, tree.root.path.replace(/^\//, './'))
      }),
      move(targetPath),
      renameTemplateFiles()
    ]), MergeStrategy.Overwrite);

    return chain([
      externalSchematic<NgGenerateTypescriptSDKShellSchematicsSchema>('@ama-sdk/schematics', 'typescript-shell', {
        ...options,
        package: cleanName,
        name: scope,
        directory: targetPath,
        packageManager: getPackageManager({workspaceConfig}),
        skipInstall: !!options.specPath || options.skipInstall
      }),
      isNx ? nxRegisterProjectTasks(options, targetPath, cleanName) : ngRegisterProjectTasks(options, targetPath, cleanName),
      updateTsConfig(targetPath, cleanName, scope),
      cleanStandaloneFiles(targetPath),
      addModuleSpecificFiles(),
      options.specPath ? (_host: Tree, c: SchematicContext) => {
        const installTaskId = c.addTask(new NodePackageInstallTask());
        c.addTask(new RunSchematicTask<Partial<NgGenerateTypescriptSDKCoreSchematicsSchema>>('@ama-sdk/schematics', 'typescript-core', {
          ...options,
          specPath: options.specPath,
          directory: targetPath,
          packageManager: getPackageManager({workspaceConfig})
        }), [installTaskId]);
      } : noop
    ])(tree, context);
  };
}
