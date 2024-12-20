import { apply, chain, externalSchematic, MergeStrategy, mergeWith, move, noop, renameTemplateFiles, Rule, SchematicContext, strings, template, Tree, url } from '@angular-devkit/schematics';
import * as path from 'node:path';
import {
  createSchematicWithMetricsIfInstalled,
  getPackageManager,
  getPackagesBaseRootFolder,
  getWorkspaceConfig,
  isNxContext,
  NpmExecTask,
  O3rCliError
} from '@o3r/schematics';
import { NgGenerateSdkSchema } from './schema';
import { ngRegisterProjectTasks } from './rules/rules.ng';
import { nxRegisterProjectTasks } from './rules/rules.nx';
import { updateTsConfig } from './rules/update-ts-paths.rule';
import { cleanStandaloneFiles } from './rules/clean-standalone.rule';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';
import {existsSync} from 'node:fs';

/**
 * Add an Otter compatible SDK to a monorepo
 * @param options Schematic options
 */
function generateSdkFn(options: NgGenerateSdkSchema): Rule {
  const splitName = options.name?.split('/');
  const scope = strings.dasherize(splitName.length > 1 ? splitName[0].replace(/^@/, '') : options.name);
  const projectName = splitName?.length === 2 ? strings.dasherize(splitName[1]) : 'sdk';
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
    const specExtension = options.specPackagePath ? path.extname(options.specPackagePath) : '.yaml';
    // If spec path is relative to process.cwd, we need to make it relative to the project root
    if (options.specPath && !path.isAbsolute(options.specPath)) {
      const resolvedPath = path.resolve(process.cwd(), options.specPath);
      if (existsSync(resolvedPath)) {
        options.specPath = path.relative(path.resolve(targetPath), resolvedPath);
      }
    }
    // TODO: Change `swagger-spec` to `openapi` in v11 (ref: #1745)
    const specPath = options.specPackageName ? `swagger-spec${specExtension}` : options.specPath;
    return chain([
      externalSchematic('@ama-sdk/schematics', 'typescript-shell', {
        ...options,
        package: projectName,
        name: scope,
        directory: targetPath,
        packageManager,
        skipInstall: !!options.specPath || options.skipInstall
      }),
      isNx ? nxRegisterProjectTasks(options, targetPath, cleanName) : ngRegisterProjectTasks(options, targetPath, cleanName),
      updateTsConfig(targetPath, projectName, scope),
      cleanStandaloneFiles(targetPath),
      addModuleSpecificFiles(),
      specPath ? (_host: Tree, c: SchematicContext) => {
        const installTask = c.addTask(new NodePackageInstallTask());
        const specUpgradeTask = options.specPackageName ? [
          c.addTask(new NpmExecTask('amasdk-update-spec-from-npm', [
            options.specPackageName,
            ...options.specPackagePath ? ['--package-path', options.specPackagePath] : [],
            // TODO: Change `swagger-spec` to `openapi` in v11 (ref: #1745)
            '--output', path.join(process.cwd(), targetPath, `swagger-spec${specExtension}`)
          ], targetPath), [installTask])
        ] : [];
        c.addTask(new RunSchematicTask('@ama-sdk/schematics', 'typescript-core', {
          ...options,
          specPath,
          directory: targetPath,
          packageManager
        }), [
          installTask,
          ...specUpgradeTask
        ]);
      } : noop
    ])(tree, context);
  };
}

/**
 * Add an Otter compatible SDK to a monorepo
 * @param options Schematic options
 */
export const generateSdk = createSchematicWithMetricsIfInstalled(generateSdkFn);
