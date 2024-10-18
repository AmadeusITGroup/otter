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
  Rule,
  SchematicContext,
  template,
  Tree,
  url
} from '@angular-devkit/schematics';
import {
  NgGenerateMockSchematicsSchema
} from './schema';

/**
 * @param singular
 * @param matches
 * @param excludes
 */
function endsWith(singular: string, matches: string[], excludes: string[] = []): boolean {
  return matches.some((match) =>
    singular.endsWith(match)
    && excludes.every((exclude) => !singular.endsWith(exclude))
  );
}

/**
 * @param singular
 */
function plurialize(singular: string): string {
  // If the singular form is already pluralized do nothing
  if (endsWith(singular, ['data', 'ies', 'es', 's'], ['us', 'ss'])) {
    return singular;
  } else if (endsWith(singular, ['y'], ['ay', 'ey'])) {
    return `${singular.substring(0, singular.length - 1)}ies`;
  } else if (endsWith(singular, ['us', 'ss', 'ch', 'sh'])) {
    return `${singular}es`;
  } else {
    return `${singular}s`;
  }
}

/**
 * returns the folder name
 * @param modelName
 */
export function getDasherizeModelName(modelName: string): string {
  return strings.dasherize(modelName).replace(/\s/g, '');
}

/**
 * Add mock
 * @param options
 */
function ngGenerateMockFn(options: NgGenerateMockSchematicsSchema): Rule {
  const dasherizeModelName = getDasherizeModelName(options.apiModel);

  const generateRootBarrel: Rule = (tree: Tree) => {
    let currentComponentIndex = '';
    const barrelPath = path.join(options.path, 'index.ts');
    if (tree.exists(barrelPath)) {
      const currentServiceIndexBuffer = tree.read(barrelPath);
      currentComponentIndex = currentServiceIndexBuffer ? currentServiceIndexBuffer.toString() : '';
      if (!(new RegExp(`./${dasherizeModelName}/index`).test(currentComponentIndex))) {
        currentComponentIndex = `export * from './${dasherizeModelName}/index';\n` + currentComponentIndex;
      }
      currentComponentIndex = `${currentComponentIndex.split('\n').filter((e) => !!e).sort().join('\n')}\n`;
      tree.overwrite(barrelPath, currentComponentIndex);
    }
    return tree;
  };

  const generateFiles: Rule = (tree: Tree, context: SchematicContext) => {
    const mockDestination = path.join(options.path, dasherizeModelName);

    return mergeWith(apply(url('./templates'), [
      template({
        ...options,
        identified: !!options.identified,
        apiModels: plurialize(options.apiModel),
        dasherizeModelName,
        dasherizeAndCapitalizeModelName: dasherizeModelName.toUpperCase()
      }),
      move(mockDestination)
    ]), MergeStrategy.Overwrite)(tree, context);
  };

  const rules = [
    generateRootBarrel,
    generateFiles
  ];

  return chain(rules);
}

/**
 * Add mock
 * @param options
 */
export const ngGenerateMock = (options: NgGenerateMockSchematicsSchema) => async () => {
  const { createSchematicWithMetricsIfInstalled } = await import('@o3r/schematics');
  return createSchematicWithMetricsIfInstalled(ngGenerateMockFn)(options);
};
