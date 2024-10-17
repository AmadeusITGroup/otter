import type { Rule } from '@angular-devkit/schematics';

/**
 * Create a default git attributes file (if it does not already exist)
 * @param tree
 */
export const createGitAttributesFile: Rule = (tree) => {
  const gitAttributesFilePath = '.gitattributes';
  if (!tree.exists(gitAttributesFilePath)) {
    tree.create(gitAttributesFilePath, `# Generated files
src/api/** linguist-generated
src/spec/api-mocks.ts linguist-generated
src/spec/operation-adapter.ts linguist-generated

# uncomment the following line if there is no core model:
# src/models/base/** linguist-generated

# in case of core models, the \`index.ts\` file should be ignored as follows:
# !src/models/base/<model>/index.ts
`);
  }

  return tree;
};
