import * as fs from 'node:fs';
import * as path from 'node:path';
import { createRule } from '../utils';

export default createRule({
  name: 'no-folder-import-for-module',
  meta: {
    hasSuggestions: true,
    type: 'problem',
    docs: {
      description: 'Ensures that imports of modules are pointing to the module file or an index.',
      recommended: 'error'
    },
    schema: [],
    messages: {
      error: 'Import of module is not pointing to a `module` or an index file',
      indexFile: 'Import from {{newIndexFilePath}}'
    },
    fixable: 'code'
  },
  defaultOptions: [],
  create: (context) => {
    return {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ImportDeclaration: (node) => {
        const importedModules = node.specifiers.filter((specifier) => specifier.local.name.endsWith('Module'));
        const importPath = node.source.value?.toString();

        if (importedModules.length && importPath && importPath.startsWith('.') && !importPath.endsWith('.module') && !importPath.endsWith('index')) {
          const dirname = path.dirname(context.getFilename());
          const importTarget = path.resolve(dirname, importPath);

          if (!fs.existsSync(importTarget) || !fs.statSync(importTarget).isDirectory()) {
            return;
          }

          const indexPath = path.resolve(importTarget, 'index.ts');
          const indexFileExist = fs.existsSync(indexPath);
          const newIndexFilePath = path.join(importPath, 'index')
            .replace(/[\\/]/g, '/')
            .replace(/^([^.])/, './$1');
          context.report({
            node,
            messageId: 'error',
            fix: !indexFileExist ? undefined : (fixer) => {
              return fixer.replaceText(
                node.source,
                node.source.raw
                  .replace(importPath, newIndexFilePath)
              );
            },
            suggest: !indexFileExist ? undefined : [
              {
                messageId: 'indexFile',
                fix: (fixer) => {
                  return fixer.replaceText(
                    node.source,
                    node.source.raw
                      .replace(importPath, newIndexFilePath)
                  );
                },
                data: {
                  newIndexFilePath
                }
              }
            ]
          });
        }
      }
    };
  }
});
