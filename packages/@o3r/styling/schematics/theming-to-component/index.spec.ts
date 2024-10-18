import * as path from 'node:path';
import {
  Tree
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner
} from '@angular-devkit/schematics/testing';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');
const stylePath = '/src/components/test/test.style.scss';
describe('Add Theming', () => {
  let initialTree: Tree;
  beforeEach(() => {
    initialTree = Tree.empty();
    initialTree.create(stylePath, `
o3r-test-pres {
  // Your component custom SCSS
}
`);
  });

  it('should create the theming file and update the style file', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('theming-to-component', {
      path: stylePath
    }, initialTree);

    expect(tree.exists(stylePath.replace(/style\.scss$/, 'style.theme.scss'))).toBeTruthy();
    const styleFileContent = tree.readText(stylePath);
    expect(styleFileContent).toContain(initialTree.readText(stylePath));
    expect(styleFileContent).toContain('@import \'./test.style.theme\';');
  });

  it('should throw if we add theming to a component that already has it', async () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('theming-to-component', {
      path: stylePath
    }, initialTree);
    await expect(runner.runSchematic('theming-to-component', {
      path: stylePath
    }, tree)).rejects.toThrow();
  });
});
