/* eslint-disable camelcase, @typescript-eslint/naming-convention */
import { chain, noop, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { addImportsRule, createSchematicWithMetricsIfInstalled, findFilesInTree, PipeReplacementInfo, updatePipes } from '@o3r/schematics';

const pipeReplacementInfo: PipeReplacementInfo = {
  capitalize: {
    new: {
      name: 'o3rCapitalize',
      import: 'O3rCapitalizePipe'
    },
    import: 'CapitalizePipeModule'
  },
  duration: {
    new: {
      name: 'o3rDuration',
      import: 'O3rDurationPipe'
    },
    import: 'DurationPipeModule'
  },
  keepWhiteSpace: {
    new: {
      name: 'o3rKeepWhiteSpace',
      import: 'O3rKeepWhiteSpacePipe'
    },
    import: 'KeepWhiteSpacePipeModule'
  },
  replaceWithBold: {
    new: {
      name: 'o3rReplaceWithBold',
      import: 'O3rReplaceWithBoldPipe'
    },
    import: 'ReplaceWithBoldPipeModule'
  }
};

const c11nPresenterDeclarationRegExp = /(presenter\$!?\s*:\s*Observable)<(.*)>/g;

const updateC11nPresenterDeclaration: Rule = (tree) => {
  const files = findFilesInTree(tree.getDir('/'), (filePath) => /\.component.ts$/.test(filePath));
  return chain(
    files.map((file) => c11nPresenterDeclarationRegExp.test(file.content.toString())
      ? chain([
        () => tree.overwrite(file.path, file.content.toString().replace(c11nPresenterDeclarationRegExp, '$1<Type<$2>>')),
        addImportsRule(file.path, [{ from: '@angular/core', importNames: ['Type'] }])
      ])
      : noop()
    )
  );
};

/**
 * Update of Otter library V10.0
 */
function updateV10_0Fn(): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const updateRules: Rule[] = [
      updatePipes(pipeReplacementInfo),
      updateC11nPresenterDeclaration
    ];

    return chain(updateRules)(tree, context);
  };
}

/**
 * Update of Otter library V10.0
 */
export const updateV10_0 = createSchematicWithMetricsIfInstalled(updateV10_0Fn);
