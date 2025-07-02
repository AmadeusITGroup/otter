import {
  callRule,
  type SchematicContext,
  Tree,
} from '@angular-devkit/schematics';
import {
  firstValueFrom,
} from 'rxjs';
import {
  addImportsRule,
} from './index';

describe('addImportsRule', () => {
  let tree: Tree;
  const warn = jest.fn();
  const fileName = 'index.ts';
  const context = { logger: { warn } } as any as SchematicContext;

  beforeEach(() => {
    tree = Tree.empty();
    warn.mockReset();
    tree.create(fileName, 'content');
  });

  it('should add several imports', async () => {
    const rule = addImportsRule(fileName, [{ from: 'somewhere', importNames: ['something', 'whatever'] }, { from: 'elsewhere', importNames: ['somethingElse'] }]);
    await firstValueFrom(callRule(rule, tree, context));
    const result = tree.readText(fileName);

    expect(result).toContain('import { something, whatever } from \'somewhere\'');
    expect(result).toContain('import { somethingElse } from \'elsewhere\'');
    expect(result).toContain('content');
    expect(warn).not.toHaveBeenCalled();
  });

  it('should log a warning as the file does not exist', async () => {
    const wrongPath = 'wrong-file.ts';
    const rule = addImportsRule(wrongPath, [{ from: 'somewhere', importNames: ['something', 'whatever'] }, { from: 'elsewhere', importNames: ['somethingElse'] }]);
    await firstValueFrom(callRule(rule, tree, context));
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining(wrongPath));
  });
});
