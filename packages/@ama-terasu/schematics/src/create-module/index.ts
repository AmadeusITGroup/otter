import { strings } from '@angular-devkit/core';
import { apply, MergeStrategy, mergeWith, move, renameTemplateFiles, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import * as path from 'node:path';
import { CreateModuleSchematicsSchema } from './schema';

/**
 * Generate a new Amaterasu module
 *
 * @param options
 */
export function generateAmaterasuModule(options: CreateModuleSchematicsSchema): Rule {
  const { version } = require(path.resolve(__dirname, '..', '..', 'package.json'));

  return (tree: Tree, context: SchematicContext) => {
    const templateSource = apply(url('./templates'), [
      template({
        ...strings,
        ...options,
        version
      }),
      renameTemplateFiles(),
      move(path.join(options.basePath, options.name))
    ]);

    const rule = mergeWith(templateSource, MergeStrategy.Overwrite);

    return rule(tree, context);
  };
}
