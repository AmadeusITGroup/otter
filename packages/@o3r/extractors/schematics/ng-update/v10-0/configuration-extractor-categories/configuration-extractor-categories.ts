import { Rule } from '@angular-devkit/schematics';
import { getFilesInFolderFromWorkspaceProjectsInTree } from '@o3r/schematics';

/**
 * Replace the XML format to specify categories in the configuration extractor (<o3rCategories>) to JSDoc annotations (@o3rCategories)
 */
export function updateConfigurationExtractorCategories(): Rule {
  const update: Rule = (tree) => {
    const configFiles = getFilesInFolderFromWorkspaceProjectsInTree(tree, '/', 'config.ts');
    configFiles.forEach((configFile) => {
      const content = tree.readText(configFile);
      const categoriesString = content.match(/ \* <o3rCategories>\n(.+)\* <\/o3rCategories>\n /s);
      if (categoriesString) {
        let newCategoriesString = categoriesString[1].replace(/\* +/g, '* ');
        const categoriesArray = categoriesString[1].match(/<(\w+)>([^\n]+)/gs);
        if (categoriesArray) {
          for (const catStringWithDesc of categoriesArray) {
            const catWithDesc = catStringWithDesc.match(/<(\w+)>([^<]+)/s);
            if (catWithDesc && catWithDesc[1] && catWithDesc[2]) {
              const category = catWithDesc[1];
              const description = catWithDesc[2].replace(/\r?\n \*/g, '').trim();
              newCategoriesString = newCategoriesString.replace(catStringWithDesc, `@o3rCategories ${category} ${description}`);
            }
          }
        }
        tree.overwrite(configFile, content.replace(categoriesString[0], newCategoriesString));
      }
    });
    return tree;
  };

  return update;
}
