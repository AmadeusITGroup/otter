import {
  existsSync,
  readFileSync,
} from 'node:fs';
import * as path from 'node:path';
import {
  apply,
  chain,
  externalSchematic,
  MergeStrategy,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule,
  strings,
  type TaskId,
  template,
  url,
} from '@angular-devkit/schematics';
import {
  NodePackageInstallTask,
  RunSchematicTask,
} from '@angular-devkit/schematics/tasks';
import {
  createSchematicWithMetricsIfInstalled,
  createSchematicWithOptionsFromWorkspace,
  type DependencyToAdd,
  getPackageManager,
  getPackagesBaseRootFolder,
  getWorkspaceConfig,
  isNxContext,
  isPackageInstalled,
  NpmExecTask,
  O3rCliError,
  setupDependencies,
} from '@o3r/schematics';
import {
  NodeDependencyType,
} from '@schematics/angular/utility/dependencies';
import type {
  PackageJson,
} from 'type-fest';
import {
  cleanStandaloneFiles,
} from './rules/clean-standalone.rule';
import {
  ngRegisterProjectTasks,
} from './rules/rules.ng';
import {
  nxRegisterProjectTasks,
} from './rules/rules.nx';
import {
  updateTsConfig,
} from './rules/update-ts-paths.rule';
import {
  NgGenerateSdkSchema,
} from './schema';

/**
 * Add an Otter compatible SDK to a monorepo
 * @param options Schematic options
 */
function generateSdkFn(options: NgGenerateSdkSchema): Rule {
  const splitName = options.name?.split('/');
  const scope = strings.dasherize(splitName.length > 1 ? splitName[0].replace(/^@/, '') : options.name);
  const projectName = splitName?.length === 2 ? strings.dasherize(splitName[1]) : 'sdk';
  const cleanName = strings.dasherize(options.name).replace(/^@/, '').replaceAll(/\//g, '-');
  const ownPackageJsonContent = JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), { encoding: 'utf8' })) as PackageJson;

  const o3rDevPackageToInstall: string[] = [];
  if (isPackageInstalled('@o3r/eslint-config')) {
    o3rDevPackageToInstall.push('@o3r/eslint-config');
  }
  const dependencies = {
    ...o3rDevPackageToInstall.reduce((acc, dep) => {
      acc[dep] = {
        inManifest: [
          {
            range: `${options.exactO3rVersion ? '' : '~'}${ownPackageJsonContent.version!}`,
            types: [NodeDependencyType.Dev]
          }
        ],
        ngAddOptions: { exactO3rVersion: options.exactO3rVersion }
      };
      return acc;
    }, {} as Record<string, DependencyToAdd>)
  };

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
    const specPath = options.specPackageName ? `openapi${specExtension}` : options.specPath;
    const specUpgradeTask: TaskId[] = [];
    const sdkGenerationTasks: TaskId[] = [];
    if (specPath) {
      const installTask = context.addTask(new NodePackageInstallTask());
      if (options.specPackageName) {
        specUpgradeTask.push(
          context.addTask(new NpmExecTask('amasdk-update-spec-from-npm', [
            options.specPackageName,
            ...options.specPackagePath ? ['--package-path', options.specPackagePath] : [],
            '--output', path.join(process.cwd(), targetPath, `openapi${specExtension}`)
          ], targetPath), [installTask])
        );
      }
      const generationTask = context.addTask(new RunSchematicTask('@ama-sdk/schematics', 'typescript-core', {
        ...options,
        specPath,
        directory: targetPath,
        packageManager
      }), [
        installTask,
        ...specUpgradeTask
      ]);
      sdkGenerationTasks.push(installTask, ...specUpgradeTask, generationTask);
    }
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
      setupDependencies({
        dependencies,
        skipInstall: options.skipInstall,
        ngAddToRun: Object.keys(dependencies),
        projectName: cleanName,
        runAfterTasks: sdkGenerationTasks
      })
    ])(tree, context);
  };
}

/**
 * Add an Otter compatible SDK to a monorepo
 * @param options Schematic options
 */
export const generateSdk = createSchematicWithOptionsFromWorkspace(createSchematicWithMetricsIfInstalled(generateSdkFn));
