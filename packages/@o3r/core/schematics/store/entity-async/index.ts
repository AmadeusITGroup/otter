import * as path from 'node:path';
import {
  strings
} from '@angular-devkit/core';
import {
  apply,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  renameTemplateFiles,
  Rule,
  SchematicContext,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import {
  applyEsLintFix,
  createSchematicWithMetricsIfInstalled,
  getDestinationPath,
  moduleHasSubEntryPoints,
  writeSubEntryPointPackageJson
} from '@o3r/schematics';
import {
  ExtraFormattedProperties
} from '../common/helpers';
import {
  NgGenerateEntityAsyncStoreSchematicsSchema
} from './schema';

/**
 * Create an Otter friendly entity async store
 * @param options
 */
function ngGenerateEntityAsyncStoreFn(options: NgGenerateEntityAsyncStoreSchematicsSchema): Rule {
  const generateFiles: Rule = (tree: Tree, context: SchematicContext) => {
    const destination = getDestinationPath('@o3r/core:store', options.path, tree, options.projectName);

    const commonTemplates = url('../common/templates');
    const asyncEntityTemplates = url('./templates');
    options.storeName = options.storeName?.trim();
    options.modelName = options.modelName?.trim();
    options.sdkPackage = options.sdkPackage?.trim();
    options.modelIdPropName = options.modelIdPropName?.trim();

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
      modelIdPropName: options.modelIdPropName || 'id',
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
    rules.push(
      mergeWith(apply(commonTemplates, [
        template({
          ...strings,
          ...options,
          ...formattedProperties,
          currentStoreIndex
        }),
        renameTemplateFiles(),
        move(`${destination}/${strings.dasherize(options.storeName)}`)
      ]), MergeStrategy.Overwrite),
      mergeWith(apply(asyncEntityTemplates, [
        template({
          ...strings,
          ...options,
          ...formattedProperties,
          currentStoreIndex
        }),
        renameTemplateFiles(),
        move(`${destination}/${strings.dasherize(options.storeName)}`)
      ]), MergeStrategy.Overwrite)
    );
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
 * Create an Otter friendly entity async store
 * @param options
 */
export const ngGenerateEntityAsyncStore = createSchematicWithMetricsIfInstalled(ngGenerateEntityAsyncStoreFn);
