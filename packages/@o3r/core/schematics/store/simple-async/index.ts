import { strings } from '@angular-devkit/core';
import { apply, chain, MergeStrategy, mergeWith, move, noop, renameTemplateFiles, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { applyEsLintFix, createSchematicWithMetricsIfInstalled, getDestinationPath, moduleHasSubEntryPoints, writeSubEntryPointPackageJson } from '@o3r/schematics';
import * as path from 'node:path';
import { ExtraFormattedProperties } from '../common/helpers';
import { NgGenerateSimpleAsyncStoreSchematicsSchema } from './schema';

/**
 * Create an Otter friendly simple async store
 * @param options
 */
function ngGenerateSimpleAsyncStoreFn(options: NgGenerateSimpleAsyncStoreSchematicsSchema): Rule {

  const generateFiles: Rule = (tree: Tree, context: SchematicContext) => {
    const destination = getDestinationPath('@o3r/core:store', options.path, tree, options.projectName);

    const commonTemplates = url('../common/templates');
    const syncEntityTemplates = url('./templates');
    options.storeName = options.storeName?.trim();
    options.modelName = options.modelName?.trim();

    // Add extra formatted properties
    const formattedProperties = {
      isAsync: true,
      isEntity: false,
      storeName: strings.classify(options.storeName),
      cStoreName: strings.camelize(options.storeName),
      scuStoreName: strings.underscore(options.storeName).toUpperCase(),
      hasSDK: !!options.sdkPackage,
      storeModelName: `${strings.classify(options.modelName)}Model`,
      payloadModelName: options.sdkPackage ? options.modelName : strings.classify(options.storeName),
      reviverModelName: `revive${options.modelName}`,
      fileName: strings.dasherize(options.storeName)
    } as const satisfies Partial<ExtraFormattedProperties>;
    let currentStoreIndex = '';
    const barrelPath = path.join(destination, options.storeName, 'index.ts');
    if (tree.exists(barrelPath)) {
      const currentStoreIndexBuffer = tree.read(barrelPath);
      currentStoreIndex = currentStoreIndexBuffer ? currentStoreIndexBuffer.toString() : '';
      tree.delete(barrelPath);
    }
    const rules: Rule[] = [];
    rules.push(mergeWith(apply(commonTemplates, [
      template({
        ...strings,
        ...options,
        ...formattedProperties,
        currentStoreIndex
      }),
      renameTemplateFiles(),
      move(`${destination}/${strings.dasherize(options.storeName)}`)]), MergeStrategy.Overwrite));

    rules.push(mergeWith(apply(syncEntityTemplates, [
      template({
        ...strings,
        ...options,
        ...formattedProperties,
        currentStoreIndex
      }),
      renameTemplateFiles(),
      move(`${destination}/${strings.dasherize(options.storeName)}`)]), MergeStrategy.Overwrite));

    if (moduleHasSubEntryPoints(tree, destination)) {
      writeSubEntryPointPackageJson(tree, destination, strings.dasherize(options.storeName));
    }
    return chain(rules)(tree, context);
  };

  return chain([
    generateFiles,
    options.skipLinter ? noop() : applyEsLintFix()
  ]);
}

/**
 * Create an Otter friendly simple async store
 * @param options
 */
export const ngGenerateSimpleAsyncStore = createSchematicWithMetricsIfInstalled(ngGenerateSimpleAsyncStoreFn);
