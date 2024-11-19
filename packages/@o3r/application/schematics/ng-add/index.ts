import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { chain } from '@angular-devkit/schematics';
import { addRootImport } from '@schematics/angular/utility';
import * as path from 'node:path';
import { registerDevtools } from './helpers/devtools-registration';
import type { NgAddSchematicsSchema } from './schema';
import {
  createSchematicWithMetricsIfInstalled,
  getAppModuleFilePath,
  getO3rPeerDeps,
  getPackageInstallConfig,
  getProjectNewDependenciesTypes,
  getWorkspaceConfig,
  insertImportToModuleFile,
  setupDependencies
} from '@o3r/schematics';

/**
 * Add Otter application to an Angular Project
 * @param options The options to pass to ng-add execution
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return async (tree: Tree, context: SchematicContext) => {
    const { isImported } = await import('@schematics/angular/utility/ast-utils').catch(() => ({ isImported: undefined}));
    const ts = await import('typescript').catch(() => undefined);
    const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
    const depsInfo = getO3rPeerDeps(packageJsonPath);

    const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;

    const addAngularAnimationPreferences: Rule = () => {
      const additionalRules: Rule[] = [];
      const moduleFilePath = getAppModuleFilePath(tree, context, options.projectName);

      if (!moduleFilePath || !options.projectName) {
        return tree;
      }

      const sourceFileContent = tree.readText(moduleFilePath);
      const sourceFile = ts?.createSourceFile(
        moduleFilePath,
        sourceFileContent,
        ts.ScriptTarget.ES2015,
        true
      );

      if (!sourceFile) {
        context.logger.warn('No Typescript executor detected, the ng-add process will be skipped.');
        return tree;
      }

      if (isImported?.(sourceFile, 'prefersReducedMotion', '@o3r/application')) {
        context.logger.info('prefersReducedMotion from @o3r/application is already imported.');
        return tree;
      }

      const importInRootModule = (name: string, file: string, moduleFunction?: string) => additionalRules.push(
        addRootImport(options.projectName!, ({code, external}) => code`\n${external(name, file)}${moduleFunction}`)
      );

      const recorder = tree.beginUpdate(moduleFilePath);

      insertImportToModuleFile(
        'prefersReducedMotion',
        '@o3r/application',
        sourceFile,
        recorder,
        moduleFilePath
      );

      importInRootModule(
        'BrowserAnimationsModule',
        '@angular/platform-browser/animations',
        '.withConfig({disableAnimations: prefersReducedMotion()})'
      );
      tree.commitUpdate(recorder);
      return chain(additionalRules)(tree, context);
    };
    const dependencies = depsInfo.o3rPeerDeps.reduce((acc, dep) => {
      acc[dep] = {
        inManifest: [{
          range: `${options.exactO3rVersion ? '' : '~'}${depsInfo.packageVersion}`,
          types: getProjectNewDependenciesTypes(workspaceProject)
        }],
        ngAddOptions: { exactO3rVersion: options.exactO3rVersion }
      };
      return acc;
    }, getPackageInstallConfig(packageJsonPath, tree, options.projectName, false, !!options.exactO3rVersion));

    const registerDevtoolRule = registerDevtools(options);
    return () => chain([
      setupDependencies({
        projectName: options.projectName,
        dependencies,
        ngAddToRun: depsInfo.o3rPeerDeps
      }),
      addAngularAnimationPreferences,
      registerDevtoolRule
    ])(tree, context);
  };
}

/**
 * Add Otter application to an Angular Project
 * @param options The options to pass to ng-add execution
 */
export const ngAdd = (options: NgAddSchematicsSchema): Rule => createSchematicWithMetricsIfInstalled(ngAddFn)(options);
