import {
  readFileSync
} from 'node:fs';
import * as path from 'node:path';
import {
  strings
} from '@angular-devkit/core';
import {
  apply,
  MergeStrategy,
  mergeWith,
  move,
  renameTemplateFiles,
  Rule,
  SchematicContext,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import {
  CreateModuleSchematicsSchema
} from './schema';

/**
 * Generate a new Amaterasu module
 * @param options
 */
export function generateAmaterasuModule(options: CreateModuleSchematicsSchema): Rule {
  const { version } = JSON.parse(readFileSync(path.resolve(__dirname, '..', '..', 'package.json'), { encoding: 'utf8' }));

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
