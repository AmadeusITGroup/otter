import type { Rule } from '@angular-devkit/schematics';
import { getFilesWithExtensionFromTree } from '@o3r/schematics';

export const updateScssImports = (): Rule => {
  const otterThemeFunctions = [
    'meta-theme-to-otter(',
    'generate-theme-variables(',
    'generate-otter-theme(',
    'generate-otter-dark-theme(',
    'revert-palette(',
    'generate-theme(',
    'meta-theme-to-material(',
    'get(',
    'color(',
    'contrast(',
    '$default-meta-theme',
    '$default-theme',
    '$default-mat-theme'
  ];

  const otterSubEntryPrefix = 'otter-theme';

  return (tree) => {
    const files = getFilesWithExtensionFromTree(tree, 'scss');
    files
      .map((file) => {
        const content = tree.readText(file);
        const match = content.match(/@use +['"]@o3r\/styling['"] +as +(.*);/);
        const importName = match?.[1];
        if (!importName) {
          return {
            file,
            importName,
            content,
            toReplace: undefined
          };
        }
        return {
          file,
          importName,
          content,
          toReplace: otterThemeFunctions
            .map((item) => ({ from: `${importName}.${item}`, to: `${otterSubEntryPrefix}.${item}` }))
            .filter(({from}) => content.indexOf(from) >= 0)
        };
      })
      .filter(({ toReplace, importName }) => !!importName && !!toReplace?.length)
      .forEach(({ file, content, toReplace, importName }) => {
        let newContent = `@use '@o3r/styling/otter-theme' as ${otterSubEntryPrefix};\n` +
          toReplace!.reduce((acc, {from, to}) => {
            return acc.replaceAll(from, to);
          }, content);
        if (newContent.indexOf(`${importName!}.`) === -1) {
          newContent = newContent.replace(new RegExp(`@use +['"]@o3r/styling['"] +as +${importName!};\n?`), '');
        }
        tree.overwrite(file, newContent);
      });
    return tree;
  };
};
