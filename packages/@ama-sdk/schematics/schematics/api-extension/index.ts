import {
  apply,
  MergeStrategy,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule,
  template, Tree,
  url
} from '@angular-devkit/schematics';
import { NgGenerateApiExtensionSchematicsSchema } from './schema';
import {
  createSchematicWithMetricsIfInstalled
} from '@o3r/schematics';

/**
 * Generate a Extension of a API core definition
 * @param options
 */
function ngGenerateApiExtensionFn(options: NgGenerateApiExtensionSchematicsSchema): Rule {

  return (tree: Tree) => mergeWith(apply(url('./templates'), [
    template({
      ...options,
      empty: ''
    }),
    move(tree.root.path),
    renameTemplateFiles()
  ]), MergeStrategy.Overwrite);

}

/**
 * Generate a Extension of a API core definition
 * @param options
 */
export const ngGenerateApiExtension = (options: NgGenerateApiExtensionSchematicsSchema) => createSchematicWithMetricsIfInstalled(ngGenerateApiExtensionFn)(options);
