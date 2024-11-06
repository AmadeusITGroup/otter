import {
  promises as fs
} from 'node:fs';
import {
  resolve
} from 'node:path';
import type {
  DesignTokenGroup,
  DesignTokenSpecification
} from '../design-token-specification.interface';
import type {
  DesignTokenVariableSet
} from '../parsers';
import * as parser from '../parsers/design-token.parser';
import {
  computeFileToUpdatePath,
  getFileToUpdatePath,
  getTokenSorterByName,
  getTokenSorterByRef,
  getTokenSorterFromRegExpList,
  renderDesignTokens
} from './design-token-style.renderer';

const rootPath = resolve('/');

describe('Design Token Renderer', () => {
  let exampleVariable!: DesignTokenSpecification;
  let designTokens!: DesignTokenVariableSet;

  beforeAll(async () => {
    const file = await fs.readFile(resolve(__dirname, '../../../../testing/mocks/design-token-theme.json'), { encoding: 'utf8' });
    exampleVariable = { document: JSON.parse(file) };
    // Add different target file
    (exampleVariable.document.example as any)['test.var2'].$extensions = { o3rTargetFile: 'file.scss' };
    designTokens = parser.parseDesignToken(exampleVariable);
  });

  describe('computeFileToUpdatePath', () => {
    const DEFAULT_FILE = 'test-result.json';
    const fileToUpdate = computeFileToUpdatePath(rootPath, DEFAULT_FILE);

    test('should return default file if not specified', () => {
      const variable = designTokens.get('example.var1');
      const result = fileToUpdate(variable);

      expect(variable.extensions.o3rTargetFile).not.toBeDefined();
      expect(result).toBe(DEFAULT_FILE);
    });

    test('should return file specified by the token', () => {
      const variable = designTokens.get('example.test.var2');
      const result = fileToUpdate(variable);

      expect(variable.extensions.o3rTargetFile).toBeDefined();
      expect(result).toBe(resolve(rootPath, variable.extensions.o3rTargetFile));
    });
  });

  describe('getFileToUpdatePath', () => {
    const DEFAULT_FILE = 'test-result.json';
    const fileToUpdate = getFileToUpdatePath(rootPath, DEFAULT_FILE);

    test('should return default file if not specified', async () => {
      const variable = designTokens.get('example.var1');
      const result = (await fileToUpdate)(variable);

      expect(variable.extensions.o3rTargetFile).not.toBeDefined();
      expect(result).toBe(DEFAULT_FILE);
    });

    test('should return file specified by the token', async () => {
      const variable = designTokens.get('example.test.var2');
      const result = (await fileToUpdate)(variable);

      expect(variable.extensions.o3rTargetFile).toBeDefined();
      expect(result).toBe(resolve(rootPath, variable.extensions.o3rTargetFile));
    });
  });

  describe('renderDesignTokens', () => {
    test('should call the process for all variables', async () => {
      const writeFile = jest.fn();
      const readFile = jest.fn().mockReturnValue('');
      const existsFile = jest.fn().mockReturnValue(true);
      const determineFileToUpdate = jest.fn().mockReturnValue(await getFileToUpdatePath('.'));
      const tokenDefinitionRenderer = jest.fn().mockReturnValue('--test: #000;');

      await renderDesignTokens(designTokens, {
        writeFile,
        readFile,
        existsFile,
        determineFileToUpdate,
        tokenDefinitionRenderer
      });

      expect(designTokens.size).toBeGreaterThan(0);
      expect(determineFileToUpdate).toHaveBeenCalledTimes(designTokens.size);
      expect(tokenDefinitionRenderer).toHaveBeenCalledTimes(designTokens.size);
      expect(writeFile).toHaveBeenCalledTimes(1);
    });

    test('should update all the files', async () => {
      const writeFile = jest.fn();
      const readFile = jest.fn().mockReturnValue('');
      const existsFile = jest.fn().mockReturnValue(true);
      const determineFileToUpdate = jest.fn().mockImplementation(await getFileToUpdatePath('.'));

      await renderDesignTokens(designTokens, {
        writeFile,
        readFile,
        existsFile,
        determineFileToUpdate
      });

      expect(designTokens.size).toBeGreaterThan(0);
      expect(determineFileToUpdate).toHaveBeenCalledTimes(designTokens.size);
      expect(writeFile).toHaveBeenCalledTimes(2);
    });

    describe('the transformers sorting by name', () => {
      const firstVariable = '--example-color';
      const lastVariable = '--example-wrong-ref';

      test('should sort variable by name per default', async () => {
        const result: any = {};
        const writeFile = jest.fn().mockImplementation((filename, content) => {
          result[filename] = content;
        });
        const readFile = jest.fn().mockReturnValue('');
        const existsFile = jest.fn().mockReturnValue(true);
        const determineFileToUpdate = jest.fn().mockImplementation(await getFileToUpdatePath('.'));

        await renderDesignTokens(designTokens, {
          writeFile,
          readFile,
          existsFile,
          determineFileToUpdate
        });

        const contentToTest = result['styles.scss'];

        expect(contentToTest.indexOf(firstVariable)).toBeLessThan(contentToTest.indexOf(lastVariable));
      });

      test('should sort variable based on option', async () => {
        const result: any = {};
        const writeFile = jest.fn().mockImplementation((filename, content) => {
          result[filename] = content;
        });
        const readFile = jest.fn().mockReturnValue('');
        const existsFile = jest.fn().mockReturnValue(true);
        const determineFileToUpdate = jest.fn().mockImplementation(await getFileToUpdatePath('.'));

        await renderDesignTokens(designTokens, {
          writeFile,
          readFile,
          existsFile,
          determineFileToUpdate,
          tokenListTransforms: [(list) => (vars) => getTokenSorterByName(list)(vars).reverse()]
        });

        const contentToTest = result['styles.scss'];

        expect(contentToTest.indexOf(firstVariable)).toBeGreaterThan(contentToTest.indexOf(lastVariable));
      });

      test('should execute the transform functions in given order', async () => {
        const result: any = {};
        const writeFile = jest.fn().mockImplementation((filename, content) => {
          result[filename] = content;
        });
        const readFile = jest.fn().mockReturnValue('');
        const existsFile = jest.fn().mockReturnValue(true);
        const determineFileToUpdate = jest.fn().mockImplementation(await getFileToUpdatePath('.'));
        const tokenListTransform = jest.fn().mockReturnValue([]);
        await renderDesignTokens(designTokens, {
          writeFile,
          readFile,
          existsFile,
          determineFileToUpdate,
          tokenListTransforms: [() => tokenListTransform, () => tokenListTransform]
        });

        expect(tokenListTransform).toHaveBeenCalledTimes(2 * 2); // twice on 2 files
        expect(tokenListTransform).not.toHaveBeenNthCalledWith(1, []);
        expect(tokenListTransform).toHaveBeenNthCalledWith(2, []);
        expect(tokenListTransform).not.toHaveBeenNthCalledWith(3, []);
        expect(tokenListTransform).toHaveBeenNthCalledWith(4, []);
      });
    });
  });

  describe('getTokenSorterByRef', () => {
    it('should sort properly variables with multiple refs', () => {
      const list = Array.from(designTokens.values());
      const sortedTokens = getTokenSorterByRef(designTokens)(list);

      expect(list.findIndex(({ tokenReferenceName }) => tokenReferenceName === 'example.post-ref'))
        .toBeLessThan(list.findIndex(({ tokenReferenceName }) => tokenReferenceName === 'example.var1'));
      expect(sortedTokens.findIndex(({ tokenReferenceName }) => tokenReferenceName === 'example.post-ref'))
        .toBeGreaterThan(sortedTokens.findIndex(({ tokenReferenceName }) => tokenReferenceName === 'example.var1'));
    });
  });

  describe('getTokenSorterFromRegExpList', () => {
    it('should sort properly based on regExps', () => {
      const regExps = [
        /override$/,
        /shadow/
      ];
      const list = Array.from(designTokens.values());
      const sortedTokens = getTokenSorterFromRegExpList(regExps)(designTokens)(list);

      const listShadowIndex = list.findIndex(({ tokenReferenceName }) => tokenReferenceName === 'example.test.shadow');
      const listVar1Index = list.findIndex(({ tokenReferenceName }) => tokenReferenceName === 'example.var1');
      const sortedTokenVar1Index = sortedTokens.findIndex(({ tokenReferenceName }) => tokenReferenceName === 'example.var1');
      const sortedTokenShadowIndex = sortedTokens.findIndex(({ tokenReferenceName }) => tokenReferenceName === 'example.test.shadow');

      expect(list.findIndex(({ tokenReferenceName }) => tokenReferenceName === 'example.var-expect-override'))
        .toBeGreaterThan(listVar1Index);
      expect(sortedTokens.findIndex(({ tokenReferenceName }) => tokenReferenceName === 'example.var-expect-override'))
        .toBeLessThan(sortedTokenVar1Index);

      expect(listShadowIndex).toBeGreaterThan(listVar1Index);
      expect(sortedTokenShadowIndex).toBeLessThan(sortedTokenVar1Index);

      expect(listShadowIndex)
        .toBeGreaterThan(list.findIndex(({ tokenReferenceName }) => tokenReferenceName === 'example.example.var-expect-override'));
      expect(sortedTokenShadowIndex)
        .toBeGreaterThan(sortedTokens.findIndex(({ tokenReferenceName }) => tokenReferenceName === 'example.example.var-expect-override'));
    });

    it('should not sort unmatched tokens', () => {
      const regExps = [
        /override$/,
        /shadow/
      ];
      const list = Array.from(designTokens.values());
      const sortedTokens = getTokenSorterFromRegExpList(regExps)(designTokens)(list);

      expect(sortedTokens.length).toBe(list.length);
      expect(sortedTokens.findIndex(({ tokenReferenceName }) => tokenReferenceName === 'last-group.last-token'))
        .toBe(sortedTokens.length - 1);
    });

    it('should be correctly applied', () => {
      const regExps = [
        /-shadow/ // matching only the generated key (not the token name)
      ];

      const list = Array.from(designTokens.values());
      const sortedTokensBasedOnKeyPart = getTokenSorterFromRegExpList(regExps, false)(designTokens)(list);
      const sortedTokensBasedOnRenderedKey = getTokenSorterFromRegExpList(regExps, true)(designTokens)(list);
      const flattenListStr = list.map(({ tokenReferenceName }) => tokenReferenceName).join('');

      expect(flattenListStr).toBe(sortedTokensBasedOnKeyPart.map(({ tokenReferenceName }) => tokenReferenceName).join(''));
      expect(flattenListStr).not.toBe(sortedTokensBasedOnRenderedKey.map(({ tokenReferenceName }) => tokenReferenceName).join(''));
    });
  });

  describe('getTokenSorterByName', () => {
    let designTokensToSort!: DesignTokenVariableSet;
    beforeEach(() => {
      designTokensToSort = parser.parseDesignToken({ document: {
        'to-sort': {
          'var-100': {
            '$value': '{example.var1}'
          },
          'var-1': {
            '$value': '{example.var1}'
          },
          'var-10': {
            '$value': '{example.var1}'
          },
          'var-5': {
            '$value': '{example.var1}'
          },
          'first-var': {
            '$value': '{example.var1}'
          }
        }
      } as DesignTokenGroup });
    });

    it('should sort properly variables with grade number', () => {
      const list = Array.from(designTokensToSort.values());
      const sortedTokens = getTokenSorterByName(designTokensToSort)(list);
      const result = sortedTokens
        .map(({ tokenReferenceName }) => tokenReferenceName)
        .join(',');

      expect(result).toBe([
        'to-sort.first-var',
        'to-sort.var-1',
        'to-sort.var-5',
        'to-sort.var-10',
        'to-sort.var-100'
      ].join(','));
    });
  });
});
