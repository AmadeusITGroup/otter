import { callRule, Tree } from '@angular-devkit/schematics';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { firstValueFrom } from 'rxjs';
import { ngAdd } from './index';

describe('Ng add @ama-sdk/core', () => {
  it('should update imports', async () => {
    const initialTree = Tree.empty();
    initialTree.create('angular.json', readFileSync(join(__dirname, 'mocks', 'angular.mocks.json')));
    initialTree.create('src/example.ts', readFileSync(join(__dirname, 'mocks', 'example.ts.mock')));
    const context: any = { addTask: jest.fn(), logger: { debug: jest.fn() }, schematic: { description: { name: 'schematic', collection: { name: '@scope/test' }}}};
    const tree = await firstValueFrom(callRule(ngAdd, initialTree, context));
    const newContent = tree.readText('src/example.ts');
    expect(newContent).not.toContain('@dapi/sdk-core');
    expect(newContent).toContain('from \'@ama-sdk/core\'');
    expect(newContent).toContain('@whatever/package');
    expect(context.addTask).toHaveBeenCalled();
  });
});
