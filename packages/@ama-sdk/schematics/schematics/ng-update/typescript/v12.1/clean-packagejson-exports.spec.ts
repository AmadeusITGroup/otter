import {
  readFileSync,
} from 'node:fs';
import {
  resolve,
} from 'node:path';
import {
  Tree,
} from '@angular-devkit/schematics';
import {
  clearPackageJsonExports,
} from './clean-packagejson-exports';

const mockPath = resolve(__dirname, '..', '..', '..', '..', 'testing', 'mocks', 'updates', 'v12');

describe('clearPackageJsonExports', () => {
  test('should edit correctly previously generated SDK', async () => {
    const tree = Tree.empty();
    tree.create('package.json', readFileSync(resolve(mockPath, 'shell-package.json'), { encoding: 'utf8' }));
    await clearPackageJsonExports(tree, {} as any);

    const content = tree.readText('package.json');
    expect(content)
      .toEqual(readFileSync(resolve(mockPath, 'shell-package.results.json'), { encoding: 'utf8' }));
  });
});
