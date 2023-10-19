import { apply, chain, externalSchematic, MergeStrategy, mergeWith, move, renameTemplateFiles, Rule, strings, template, url } from '@angular-devkit/schematics';
import * as path from 'node:path';
import { getPackageManager, getPackagesBaseRootFolder, getWorkspaceConfig, isNxContext } from '@o3r/schematics';
import { NgGenerateSdkSchema } from './schema';
import type { NgGenerateTypescriptSDKShellSchematicsSchema } from '@ama-sdk/schematics';
import type { PackageJson } from 'type-fest';
import { ngRegisterProjectTasks } from './rules/rules.ng';
import { nxRegisterProjectTasks } from './rules/rules.nx';
import { updateTsConfig } from './rules/update-ts-paths.rule';
import { cleanStandaloneFiles } from './rules/clean-standalone.rule';

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
      throw new Error('No workspace configuration file found');
    }
    const defaultRoot = getPackagesBaseRootFolder(tree, context, workspaceConfig, 'library');
    const scope = tree.exists('/package.json') && (tree.readJson('/package.json') as PackageJson).name?.split('/')?.[0]?.replace(/^@/, '') || 'sdk';

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

    return chain([
      externalSchematic<NgGenerateTypescriptSDKShellSchematicsSchema>('@ama-sdk/schematics', 'typescript-shell', {
        ...options,
        package: cleanName,
        name: scope,
        directory: targetPath,
        packageManager: getPackageManager({workspaceConfig})
      }),
      isNx ? nxRegisterProjectTasks(options, targetPath, cleanName) : ngRegisterProjectTasks(options, targetPath, cleanName),
      updateTsConfig(targetPath, cleanName, scope),
      cleanStandaloneFiles(targetPath),
      addModuleSpecificFiles()
    ])(tree, context);
  };
}
