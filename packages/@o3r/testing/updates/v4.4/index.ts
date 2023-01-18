import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { updateKarmaPath } from './karma-path';

/**
 * update of Otter library's testing to V4.4.*
 */
export function update(): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const updateRules: Rule[] = [
      updateKarmaPath()
    ];

    return chain(updateRules)(tree, context);
  };
}
