import { strings } from '@angular-devkit/core';
import { apply, chain, MergeStrategy, mergeWith, move, noop, renameTemplateFiles, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';

import { applyEsLintFix, getDestinationPath, moduleHasSubEntryPoints, writeSubEntryPointPackageJson } from '@o3r/schematics';
import * as path from 'node:path';
import { ExtraFormattedProperties } from '../common/helpers';
import { NgGenerateEntityAsyncStoreSchematicsSchema } from './schema';

/**
 * Create an Otter friendly entity async store
 *
 * @param options
 */
export function ngGenerateEntityAsyncStore(options: NgGenerateEntityAsyncStoreSchematicsSchema): Rule {

  const generateFiles: Rule = (tree: Tree, context: SchematicContext) => {
    const destination = getDestinationPath('@o3r/core:store', options.path, tree);

    const commonTemplates = url('../common/templates');
    const asyncEntityTemplates = url('./templates');

    // Add extra formatted properties
    const formattedProperties: ExtraFormattedProperties = {
      isAsync: true,
      isEntity: true,
      storeName: strings.classify(options.storeName),
      cStoreName: strings.camelize(options.storeName),
      scuStoreName: strings.underscore(options.storeName).toUpperCase(),
      hasSDK: !!options.sdkPackage && !!options.modelName,
      hasCustomId: !!options.modelIdPropName && options.modelIdPropName !== 'id',
      storeModelName: options.sdkPackage ? `${strings.classify(options.modelName)}Model` : `${strings.classify(options.storeName)}Model`,
      payloadModelName: options.sdkPackage ? options.modelName : `${strings.classify(options.storeName)}Model`,
      modelIdPropName: options.modelIdPropName ? options.modelIdPropName : 'id',
      reviverModelName: `revive${options.modelName}`,
      fileName: strings.dasherize(options.storeName)
    };
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

    rules.push(mergeWith(apply(asyncEntityTemplates, [
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
