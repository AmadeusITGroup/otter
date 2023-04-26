import {chain} from '@angular-devkit/schematics';
import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import * as path from 'node:path';


/**
 * Add Otter application to an Angular Project
 *
 * @param options
 */
export function ngAdd(): Rule {
  /* ng add rules */
  return async (tree: Tree, context: SchematicContext) => {
    try {
      const { addImportToModuleFile, getAppModuleFilePath, insertImportToModuleFile, ngAddPackages, getO3rPeerDeps } = await import('@o3r/schematics');
      const { getDecoratorMetadata, isImported } = await import('@schematics/angular/utility/ast-utils');
      const ts = await import('@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript');
      const depsInfo = getO3rPeerDeps(path.resolve(__dirname, '..', '..', 'package.json'));

      const addAngularAnimationPreferences : Rule = () => {
        const moduleFilePath = getAppModuleFilePath(tree, context);

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
        const ngModulesMetadata = getDecoratorMetadata(sourceFile, 'NgModule', '@angular/core');
        const moduleIndex = ngModulesMetadata[0] ? ngModulesMetadata[0].pos - ('NgModule'.length + 1) : sourceFileContent.indexOf('@NgModule');

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

      return () => chain([
        ngAddPackages(depsInfo.o3rPeerDeps, { skipConfirmation: true, version: depsInfo.packageVersion, parentPackageInfo: depsInfo.packageName }),
        addAngularAnimationPreferences
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
