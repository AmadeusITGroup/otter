import {
  strings,
} from '@angular-devkit/core';
import {
  apply,
  MergeStrategy,
  mergeWith,
  renameTemplateFiles,
  Rule,
  SchematicContext,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
} from '@o3r/schematics';
import {
  NgGenerateRenovateBotSchematicsSchema,
} from './schema';

/**
 * Create a Renovate Bot basic configuration
 * @param options
 */
function ngGenerateRenovateBotComponentFn(options: NgGenerateRenovateBotSchematicsSchema): Rule {
  const generateFiles = (tree: Tree, context: SchematicContext) => {
    const templateSource = apply(url('./templates'), [
      template({
        dot: '.',
        ...strings,
        ...options
      }),
      renameTemplateFiles()
    ]);

    const rule = mergeWith(templateSource, MergeStrategy.Error);

    return rule(tree, context);
  };

  return generateFiles;
}

/**
 * Create a Renovate Bot basic configuration
 * @param options
 */
export const ngGenerateRenovateBotComponent = createOtterSchematic(ngGenerateRenovateBotComponentFn);
