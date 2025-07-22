import {
  Tree,
} from '@angular-devkit/schematics';
import {
  updateEslintRecommended,
} from './update-configs';

let findFilesInTreeFn: () => any[] = () => [];

jest.mock('@o3r/schematics', () => ({
  findFilesInTree: jest.fn().mockImplementation(() => findFilesInTreeFn())
}));

describe('updateEslintRecommended', () => {
  beforeEach(() => jest.restoreAllMocks());

  it('should update configs', async () => {
    const initialTree = Tree.empty();
    initialTree.create('random.file', 'a file containing json-recommended');
    initialTree.create('/test/.eslintrc.json', '{ "extends": ["@o3r/json-recommended", "@other/json-recommended"] }');
    findFilesInTreeFn = () => [
      initialTree.get('random.file'),
      initialTree.get('/test/.eslintrc.json')
    ];
    await updateEslintRecommended()(initialTree, null as any);

    expect(initialTree.readText('random.file')).toContain('json-recommended');
    expect(initialTree.readText('/test/.eslintrc.json')).toBe('{ "extends": ["@o3r/monorepo-recommended", "@other/json-recommended"] }');
  });

  it('should update configs on findFilesInTree failure', async () => {
    findFilesInTreeFn = () => {
      throw new Error('test');
    };
    const initialTree = Tree.empty();
    initialTree.create('random.file', 'a file containing json-recommended');
    initialTree.create('/test/.eslintrc.json', '{ "extends": ["@o3r/json-recommended", "@other/json-recommended"] }');
    await updateEslintRecommended()(initialTree, null as any);

    expect(initialTree.readText('random.file')).toContain('json-recommended');
    expect(initialTree.readText('/test/.eslintrc.json')).toBe('{ "extends": ["@o3r/monorepo-recommended", "@other/json-recommended"] }');
  });
});
