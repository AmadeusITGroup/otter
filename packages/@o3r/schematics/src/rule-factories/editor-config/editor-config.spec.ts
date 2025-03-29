import {
  Tree,
} from '@angular-devkit/schematics';
import {
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import {
  applyEditorConfig,
} from './editor-config';

const mockEditorconfig = `
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
`;

describe('applyEditorConfig', () => {
  beforeEach(() => jest.clearAllMocks());

  test('should insert final new line', async () => {
    jest.mock('tiny-editorconfig', () => ({
      parse: jest.fn().mockReturnValue({}),
      resolve: jest.fn().mockReturnValue({
        endOfLine: 'lf',
        indentStyle: 'space',
        insertFinalNewline: true,
        trimTrailingWhitespace: true
      })
    }));
    const tree = new UnitTestTree(Tree.empty());
    const context: any = { logger: { warn: jest.fn(), debug: jest.fn() } };
    tree.create('/.editorconfig', mockEditorconfig);
    tree.create('/test.json', JSON.stringify({ test: true }, null, 2));
    tree.create('/test2.ts', 'my content');
    await applyEditorConfig()(tree, context);

    expect(tree.readText('/test.json').endsWith('\n')).toBe(true);
    expect(tree.readText('/test2.ts').endsWith('\n')).toBe(true);
  });

  test('should trim lines', async () => {
    jest.mock('tiny-editorconfig', () => ({
      parse: jest.fn().mockReturnValue({}),
      resolve: jest.fn().mockReturnValue({
        endOfLine: 'lf',
        indentStyle: 'space',
        insertFinalNewline: true,
        trimTrailingWhitespace: true
      })
    }));
    const tree = new UnitTestTree(Tree.empty());
    const context: any = { logger: { warn: jest.fn(), debug: jest.fn() } };
    tree.create('/.editorconfig', mockEditorconfig);
    tree.create('/test.ts', 'first line  \n second line');
    await applyEditorConfig()(tree, context);

    expect(context.logger.debug).toHaveBeenCalled();
    expect(tree.readText('/test.ts')).toBe('first line\n second line\n');
  });

  test('should convert crlf to lf', async () => {
    jest.mock('tiny-editorconfig', () => ({
      parse: jest.fn().mockReturnValue({}),
      resolve: jest.fn().mockReturnValue({
        endOfLine: 'lf',
        indentStyle: 'space',
        insertFinalNewline: true,
        trimTrailingWhitespace: true
      })
    }));
    const tree = new UnitTestTree(Tree.empty());
    const context: any = { logger: { warn: jest.fn(), debug: jest.fn() } };
    tree.create('/.editorconfig', mockEditorconfig);
    tree.create('/test.ts', 'first line  \r\n second line');
    await applyEditorConfig()(tree, context);

    expect(context.logger.debug).toHaveBeenCalled();
    expect(tree.readText('/test.ts')).toBe('first line\n second line\n');
  });

  test('should not update if not change', async () => {
    jest.mock('tiny-editorconfig', () => ({
      parse: jest.fn().mockReturnValue({}),
      resolve: jest.fn().mockReturnValue({
        endOfLine: 'lf',
        indentStyle: 'space',
        insertFinalNewline: true,
        trimTrailingWhitespace: true
      })
    }));
    const tree = new UnitTestTree(Tree.empty());
    const context: any = { logger: { warn: jest.fn(), debug: jest.fn() } };
    tree.create('/.editorconfig', 'root: true\n');
    tree.create('/test.ts', 'first line\nsecond line\n');
    await applyEditorConfig(['ts'])(tree, context);

    expect(context.logger.debug).not.toHaveBeenCalled();
  });

  test('should not update if not part of extensions list', async () => {
    jest.mock('tiny-editorconfig', () => ({
      parse: jest.fn().mockReturnValue({}),
      resolve: jest.fn().mockReturnValue({
        endOfLine: 'lf',
        indentStyle: 'space',
        insertFinalNewline: true,
        trimTrailingWhitespace: true
      })
    }));
    const tree = new UnitTestTree(Tree.empty());
    const context: any = { logger: { warn: jest.fn(), debug: jest.fn() } };
    tree.create('/.editorconfig', mockEditorconfig);
    tree.create('/test.ts', 'first line \n second line');
    await applyEditorConfig(['json'])(tree, context);

    expect(tree.readText('/test.ts')).toBe('first line \n second line');
  });

  test('should exit if no configuration', async () => {
    const resolve = jest.fn().mockReturnValue({});
    jest.mock('tiny-editorconfig', () => ({
      parse: jest.fn().mockReturnValue({}),
      resolve
    }));
    const tree = new UnitTestTree(Tree.empty());
    const context: any = { logger: { warn: jest.fn() } };
    tree.create('/test.json', JSON.stringify({ test: true }, null, 2));
    await applyEditorConfig()(tree, context);

    expect(context.logger.warn).toHaveBeenCalled();
    expect(resolve).not.toHaveBeenCalled();
  });
});
