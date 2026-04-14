import * as path from 'node:path';
import {
  Tree,
} from '@angular-devkit/schematics';
import {
  SchematicTestRunner,
} from '@angular-devkit/schematics/testing';

const collectionPath = path.join(__dirname, '..', '..', 'collection.json');
const stylePath = '/src/components/test/test.scss';
const oldStylePath = '/src/components/test/test.style.scss';
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

    expect(tree.exists(stylePath.replace(/\.scss$/, '-theme.scss'))).toBeTruthy();
    const styleFileContent = tree.readText(stylePath);
    expect(styleFileContent).toContain(initialTree.readText(stylePath));
    expect(styleFileContent).toContain('@import \'./test-theme\';');
  });

  it('should create the theming file and update the typed style file', async () => {
    const stylePathWithType = '/src/components/other-test/other-test.test-type.scss';
    const runner = new SchematicTestRunner('schematics', collectionPath);
    initialTree.create(stylePathWithType, `
      o3r-other-test-pres {
        // Your component custom SCSS
      }
    `);
    const tree = await runner.runSchematic('theming-to-component', {
      path: stylePathWithType
    }, initialTree);

    expect(tree.exists(stylePath.replace(/\.test-type\.scss$/, '-theme.scss'))).toBeTruthy();
    const styleFileContent = tree.readText(stylePathWithType);
    expect(styleFileContent).toContain(initialTree.readText(stylePathWithType));
    expect(styleFileContent).toContain('@import \'./other-test-theme\';');
  });

  it('should create the theming file and update the style file using the previous naming convention', async () => {
    initialTree.create(oldStylePath, `
      o3r-test-pres {
        // Your component custom SCSS
      }
    `);
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = await runner.runSchematic('theming-to-component', {
      path: oldStylePath
    }, initialTree);

    expect(tree.exists(oldStylePath.replace(/\.style\.scss$/, '-theme.scss'))).toBeTruthy();
    const styleFileContent = tree.readText(oldStylePath);
    expect(styleFileContent).toContain(initialTree.readText(oldStylePath));
    expect(styleFileContent).toContain('@import \'./test-theme\';');
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
