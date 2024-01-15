import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { chain } from '@angular-devkit/schematics';
import { createSchematicWithMetricsIfInstalled, getPackageInstallConfig } from '@o3r/schematics';
import * as path from 'node:path';
import type { NgAddSchematicsSchema } from './schema';
import { registerDevtools } from './helpers/devtools-registration';
import { generateCmsConfigFile } from './helpers/cms-registration';

/**
 * Add Otter application to an Angular Project
 * @param options The options to pass to ng-add execution
 */
function ngAddFn(options: NgAddSchematicsSchema): Rule {
  /* ng add rules */
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const {
        addImportToModuleFile, getAppModuleFilePath, getModuleIndex, getWorkspaceConfig, insertImportToModuleFile, setupDependencies, getO3rPeerDeps, getProjectNewDependenciesTypes
      } = await import('@o3r/schematics');
      const { isImported } = await import('@schematics/angular/utility/ast-utils');
      const ts = await import('typescript');
      const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
      const depsInfo = getO3rPeerDeps(packageJsonPath);

      const workspaceProject = options.projectName ? getWorkspaceConfig(tree)?.projects[options.projectName] : undefined;

      const addAngularAnimationPreferences: Rule = () => {
        const moduleFilePath = getAppModuleFilePath(tree, context, options.projectName);

        if (!moduleFilePath) {
          return tree;
        }

        const sourceFileContent = tree.readText(moduleFilePath);
        const sourceFile = ts.createSourceFile(
          moduleFilePath,
          sourceFileContent,
          ts.ScriptTarget.ES2015,
          true
        );

        if (isImported(sourceFile, 'prefersReducedMotion', '@o3r/application')) {
          context.logger.info('[LOG]: prefersReducedMotion from @o3r/application is already imported.');
          return tree;
        }

        const recorder = tree.beginUpdate(moduleFilePath);
        const { moduleIndex } = getModuleIndex(sourceFile, sourceFileContent);

        insertImportToModuleFile(
          'prefersReducedMotion',
          '@o3r/application',
          sourceFile,
          recorder,
          moduleFilePath
        );
        addImportToModuleFile(
          'BrowserAnimationsModule',
          '@angular/platform-browser/animations',
          sourceFile,
          sourceFileContent,
          context,
          recorder,
          moduleFilePath,
          moduleIndex,
          '.withConfig({disableAnimations: prefersReducedMotion()})',
          true
        );
        tree.commitUpdate(recorder);
        return tree;
      };
      const dependencies = depsInfo.o3rPeerDeps.reduce((acc, dep) => {
        acc[dep] = {
          inManifest: [{
            range: `^${depsInfo.packageVersion}`,
            types: getProjectNewDependenciesTypes(workspaceProject)
          }]
        };
        return acc;
      }, getPackageInstallConfig(packageJsonPath, tree, options.projectName));

      const registerDevtoolRule = await registerDevtools(options);
      return () => chain([
        setupDependencies({
          projectName: options.projectName,
          dependencies,
          ngAddToRun: depsInfo.o3rPeerDeps
        }),
        addAngularAnimationPreferences,
        registerDevtoolRule,
        generateCmsConfigFile(options)
      ])(tree, context);
    } catch (e) {
      // o3r application needs o3r/core as peer dep. o3r/core will install o3r/schematics
      context.logger.error(`[ERROR]: Adding @o3r/application has failed.
      If the error is related to missing @o3r dependencies you need to install '@o3r/core' to be able to use the o3r application package. Please run 'ng add @o3r/core' .
      Otherwise, use the error message as guidance.`);
      throw (e);
    }
  };
}

/**
 * Add Otter application to an Angular Project
 * @param options The options to pass to ng-add execution
 */
export const ngAdd = createSchematicWithMetricsIfInstalled(ngAddFn);
