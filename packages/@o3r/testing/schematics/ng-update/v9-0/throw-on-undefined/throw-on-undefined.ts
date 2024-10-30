import {
  chain,
  Rule
} from '@angular-devkit/schematics';
import {
  getFilesInFolderFromWorkspaceProjectsInTree
} from '@o3r/schematics';

const update: Rule = (tree) => {
  const fixtureFiles = getFilesInFolderFromWorkspaceProjectsInTree(tree, '/', 'fixture.ts');
  fixtureFiles
    .forEach((fixtureFile) => {
      const content = tree.readText(fixtureFile);
      tree.overwrite(fixtureFile, content.replace(/\b(?<!await )this\.throwOnUndefined\b/g, 'await this.throwOnUndefinedElement'));
    });
  return tree;
};

const notice: Rule = (_, ctx) => {
  ctx.logger.warn('Please notice that the "throwOnUndefined" update has change the `sync` function to `async` one.');
  ctx.logger.warn('It may require to update manually some synchronous fixtures to asynchronous functions');
};

/**
 * Replace the call of {@link O3rComponentFixture.ThrowOnUndefined} to {@link O3rComponentFixture.ThrowOnUndefinedElement}
 */
export function updateThrowOnUndefinedCalls(): Rule {
  return chain([update, notice]);
}
