import {
  dirname,
  posix,
} from 'node:path';
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
  url,
} from '@angular-devkit/schematics';
import {
  createOtterSchematic,
  getComponentBaseFileName,
  O3rCliError,
} from '@o3r/schematics';
import {
  applyToUpdateRecorder,
  InsertChange,
} from '@schematics/angular/utility/change';
import type {
  NgAddThemingSchematicsSchema,
} from './schema';

const checkTheming = (stylePath: string, tree: Tree, baseFileName: string) => {
  if (!/\.scss$/.test(stylePath)) {
    throw new O3rCliError('Invalid input path: it must target an scss file');
  }
  if (tree.exists(posix.join(dirname(stylePath), `${baseFileName}-theme.scss`))) {
    throw new O3rCliError('This component already have theming.');
  }
};

/**
 * Add theming to an existing component
 * @param options
 */
export function ngAddThemingFn(options: NgAddThemingSchematicsSchema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const stylePath = options.path;
    const baseFileName = getComponentBaseFileName(options.path);
    checkTheming(stylePath, tree, baseFileName);

    const properties = {
      name: baseFileName
    };

    const createThemingFilesRule: Rule = mergeWith(apply(url('./templates'), [
      template(properties),
      renameTemplateFiles(),
      move(dirname(stylePath))
    ]), MergeStrategy.Overwrite);

    const updateStyleRule: Rule = () => {
      const recorder = tree.beginUpdate(stylePath);
      const change = new InsertChange(stylePath, 0, `@import './${properties.name}-theme';\n\n`);
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

/**
 * Add theming to an existing component
 * @param options
 */
export const ngAddTheming = createOtterSchematic(ngAddThemingFn);
