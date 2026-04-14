import {
  readFileSync,
} from 'node:fs';
import {
  join,
} from 'node:path';
import {
  callRule,
  Tree,
} from '@angular-devkit/schematics';
import {
  firstValueFrom,
} from 'rxjs';
import {
  updateComponentDecorators,
} from './index';

describe('Update component decorators', () => {
  it('should update component decorators', async () => {
    const initialTree = Tree.empty();
    initialTree.create('angular.json', readFileSync(join(__dirname, '..', '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
    initialTree.create('src/components/example.ts', readFileSync(join(__dirname, 'mocks', 'example.ts.mock')));
    const tree = await firstValueFrom(callRule(updateComponentDecorators, initialTree, undefined));
    const newContent = tree.readText('src/components/example.ts');
    expect(newContent).not.toContain('InputMerge');
    expect(newContent).toContain('@O3rComponent');
    expect(newContent).toContain('componentType: \'Block\'');
    expect(newContent).toContain('@ConfigObserver');
  });
});
