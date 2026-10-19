import {
  callRule,
  HostTree,
  Tree,
} from '@angular-devkit/schematics';
import {
  lastValueFrom,
} from 'rxjs';
import {
  addVitePeerDependency,
} from './vite-peer';

describe('addVitePeerDependency', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = new HostTree();
  });

  const logger = { warn: jest.fn() };
  const run = (paths: string[]) => lastValueFrom(callRule(addVitePeerDependency(paths, '~8.0.0'), tree, { logger } as any));

  it('should add vite when vitest is declared without vite', async () => {
    tree.create('/package.json', JSON.stringify({ devDependencies: { vitest: '^5.0.0' } }));
    tree.create('/apps/app/package.json', JSON.stringify({ dependencies: { vitest: '^5.0.0' } }));

    await run(['/package.json', '/apps/app/package.json']);

    expect(tree.readJson('/package.json')).toEqual({ devDependencies: { vitest: '^5.0.0', vite: '~8.0.0' } });
    expect(tree.readJson('/apps/app/package.json')).toEqual({ dependencies: { vitest: '^5.0.0' }, devDependencies: { vite: '~8.0.0' } });
  });

  it('should not override an existing vite dependency', async () => {
    tree.create('/package.json', JSON.stringify({ devDependencies: { vitest: '^5.0.0', vite: '^7.0.0' } }));

    await run(['/package.json']);

    expect(tree.readJson('/package.json')).toEqual({ devDependencies: { vitest: '^5.0.0', vite: '^7.0.0' } });
  });

  it('should not add vite when vitest is not declared', async () => {
    tree.create('/package.json', JSON.stringify({ devDependencies: { jest: '~30.0.0' } }));

    await run(['/package.json', '/missing/package.json']);

    expect(tree.readJson('/package.json')).toEqual({ devDependencies: { jest: '~30.0.0' } });
    expect(tree.exists('/missing/package.json')).toBe(false);
  });

  it('should skip invalid package.json files', async () => {
    tree.create('/package.json', '{ "devDependencies": { "vitest": <%= version %> } }');

    await expect(run(['/package.json'])).resolves.toBeDefined();

    expect(logger.warn).toHaveBeenCalled();
    expect(tree.readText('/package.json')).toBe('{ "devDependencies": { "vitest": <%= version %> } }');
  });
});
