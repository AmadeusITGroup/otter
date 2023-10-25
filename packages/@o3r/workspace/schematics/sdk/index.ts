import { apply, chain, externalSchematic, MergeStrategy, mergeWith, move, noop, renameTemplateFiles, Rule, SchematicContext, strings, template, Tree, url } from '@angular-devkit/schematics';
import * as path from 'node:path';
import { getPackageManager, getPackagesBaseRootFolder, getWorkspaceConfig, isNxContext, O3rCliError } from '@o3r/schematics';
import { NgGenerateSdkSchema } from './schema';
import type { NgGenerateTypescriptSDKCoreSchematicsSchema, NgGenerateTypescriptSDKShellSchematicsSchema } from '@ama-sdk/schematics';
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
  const splitName = options.name?.split('/');
  const scope = splitName.length > 1 ? splitName[0].replace(/^@/, '') : '';
  const projectName = strings.dasherize(splitName?.length === 2 ? splitName[1] : options.name);
  const cleanName = strings.dasherize(options.name).replace(/^@/, '').replaceAll(/\//g, '-');

  return (tree, context) => {
    const isNx = isNxContext(tree);
    const workspaceConfig = getWorkspaceConfig(tree);
    if (!workspaceConfig) {
      throw new O3rCliError('No workspace configuration file found');
    }
    const defaultRoot = getPackagesBaseRootFolder(tree, context, workspaceConfig, 'library');

    /** Path to the folder where generate the new SDK */
    const targetPath = path.posix.join(options.path || defaultRoot, cleanName);

    const addModuleSpecificFiles = () => mergeWith(apply(url('./templates'), [
      template({
        ...options,
        rootRelativePath: path.posix.relative(targetPath, tree.root.path.replace(/^\//, './'))
      }),
      move(targetPath),
      renameTemplateFiles()
    ]), MergeStrategy.Overwrite);

    const packageManager = getPackageManager({ workspaceConfig });
    const yarnrcPath = '.yarnrc.yml';
    const yarnrcBeforeSdkGeneration = tree.exists(yarnrcPath) ? tree.readText(yarnrcPath) : '';

    return chain([
      externalSchematic<NgGenerateTypescriptSDKShellSchematicsSchema>('@ama-sdk/schematics', 'typescript-shell', {
        ...options,
        package: projectName,
        name: scope,
        directory: targetPath,
        packageManager,
        skipInstall: !!options.specPath || options.skipInstall
      }),
      packageManager === 'yarn' ? (t) => {
        if (yarnrcBeforeSdkGeneration) {
          // discard changes done by sdk shell generator standalone on yarnrc
          t.overwrite(yarnrcPath, yarnrcBeforeSdkGeneration);
        } else {
          // delete yarnrc created by sdk shell generator standalone
          t.delete(yarnrcPath);
        }
        return t;
      } : noop,
      isNx ? nxRegisterProjectTasks(options, targetPath, cleanName) : ngRegisterProjectTasks(options, targetPath, cleanName),
      updateTsConfig(targetPath, projectName, scope),
      cleanStandaloneFiles(targetPath),
      addModuleSpecificFiles(),
      options.specPath ? (_host: Tree, c: SchematicContext) => {
        const installTaskId = c.addTask(new NodePackageInstallTask());
        c.addTask(new RunSchematicTask<Partial<NgGenerateTypescriptSDKCoreSchematicsSchema>>('@ama-sdk/schematics', 'typescript-core', {
          ...options,
          specPath: options.specPath,
          directory: targetPath,
          packageManager
        }), [installTaskId]);
      } : noop
    ])(tree, context);
  };
}
