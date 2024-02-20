import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import path from 'node:path';
import { firstValueFrom } from 'rxjs';
import { alignVersions } from './index';

const collectionPath = path.join(__dirname, '..', '..', '..', 'collection.json');

describe('align version', () => {
  let tree: Tree;
  let runner: SchematicTestRunner;

  beforeEach(() => {
    runner = new SchematicTestRunner('schematics', collectionPath);
    tree = Tree.empty();
    tree.create('package.json', `{
      "devDependencies": {
        "a": "1",
        "@b/a": "^10.0.0",
        "@b/b": "^10.0.0",
        "@b/c": "^10.0.0",
        "@a/b": "^10.0.0"
      }
    }`);
  });

  it('does nothing on standalone repo', async () => {
    const originalContent = tree.readText('package.json');
    await firstValueFrom(runner.callRule(alignVersions([/@b\/.*/]), tree));
    expect(tree.readText('package.json')).toBe(originalContent);
  });

  it('should update the version everywhere', async () => {
    tree.create('a/package.json', `{
      "dependencies": {
        "a": "2",
        "@b/a": "^9.0.0"
      }
    }`);
    tree.create('b/package.json', `{
      "devDependencies": {
        "@b/c": "^9.0.0"
        "@b/d": "^9.0.0"
      }
    }`);
    await firstValueFrom(runner.callRule(alignVersions([/@b\/.*/]), tree));
    expect(tree.readText('a/package.json')).toBe(`{
      "dependencies": {
        "a": "2",
        "@b/a": "^10.0.0"
      }
    }`);
    expect(tree.readText('b/package.json')).toBe(`{
      "devDependencies": {
        "@b/c": "^10.0.0"
        "@b/d": "^9.0.0"
      }
    }`);
  });
});
