import {
  apply,
  chain,
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
import { applyToUpdateRecorder, InsertChange } from '@schematics/angular/utility/change';
import { basename, dirname } from 'node:path';
import type { NgAddThemingSchematicsSchema } from './schema';


const checkTheming = (stylePath: string, tree: Tree) => {
  if (tree.exists(
    stylePath.replace(/\.scss$/, '.theme.scss')
  )) {
    throw new Error('This component already have theming.');
  }
};


/**
 * Add theming to an existing component
 *
 * @param options
 */
export function ngAddTheming(options: NgAddThemingSchematicsSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const stylePath = options.path;

    checkTheming(stylePath, tree);

    const properties = {
      name: basename(stylePath, '.style.scss')
    };

    const createThemingFilesRule: Rule = mergeWith(apply(url('./templates'), [
      template(properties),
      renameTemplateFiles(),
      move(dirname(stylePath))
    ]), MergeStrategy.Overwrite);

    const updateStyleRule: Rule = () => {
      const recorder = tree.beginUpdate(stylePath);
      const change = new InsertChange(stylePath, 0, `@import './${properties.name}.style.theme';\n\n`);
      applyToUpdateRecorder(recorder, [change]);
      tree.commitUpdate(recorder);
      return tree;
    };

    return chain([
      createThemingFilesRule,
      updateStyleRule
    ])(tree, context);
  };
}
