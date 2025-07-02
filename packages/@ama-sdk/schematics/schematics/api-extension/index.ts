import {
  apply,
  MergeStrategy,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  NgGenerateApiExtensionSchematicsSchema,
} from './schema';

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
export const ngGenerateApiExtension = (options: NgGenerateApiExtensionSchematicsSchema) => async () => {
  const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics');
  return createSchematicWithMetricsIfInstalled(ngGenerateApiExtensionFn)(options);
};
