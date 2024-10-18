import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'node:path';
import * as fs from 'node:fs';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');

describe('ng-add', () => {

  let initialTree: Tree;

  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create('angular.json', fs.readFileSync(path.resolve(__dirname, '..', '..', 'testing', 'mocks', 'angular.mocks.json')));
  });

  it('should generate the template files', async () => {
    const runner = new SchematicTestRunner('@o3r/design', collectionPath);
    const tree = await runner.runSchematic('ng-add', {
      projectName: 'test-project'
    }, initialTree);

    expect(tree.exists('src/style/design-token.custom.theme.json')).toBe(true);
    expect(tree.exists('design-token.template.json')).toBe(true);
    expect(tree.exists('src/style/theme.scss')).toBe(true);
  });

  it('should import theming file in styles.scss', async () => {
    initialTree.create('src/styles.scss', '/* test */');
    const runner = new SchematicTestRunner('@o3r/design', collectionPath);
    const tree = await runner.runSchematic('ng-add', {
      projectName: 'test-project'
    }, initialTree);

    expect(tree.readText('src/styles.scss')).toContain('@import "./style/theme.scss";');
  });
});
