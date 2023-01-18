import { callRule, Tree } from '@angular-devkit/schematics';
import { readFileSync } from 'fs';
import { join } from 'path';
import { firstValueFrom } from 'rxjs';
import { updateComponentDecorators } from './index';

describe('Update component decorators', () => {
  it('should update component decorators', async () => {
    const initialTree = Tree.empty();
    initialTree.create('angular.json', readFileSync(join(__dirname, '..', '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
    initialTree.create('src/components/example.component.ts', readFileSync(join(__dirname, 'mocks', 'example.component.ts.mock')));
    const tree = await firstValueFrom(callRule(updateComponentDecorators, initialTree, undefined));
    const newContent = tree.readText('src/components/example.component.ts');
    expect(newContent).not.toContain('InputMerge');
    expect(newContent).toContain('@O3rComponent');
    expect(newContent).toContain('componentType: \'Block\'');
    expect(newContent).toContain('@ConfigObserver');
  });
});
