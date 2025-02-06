import * as parser from '../parsers/design-token.parser';
import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import type { DesignTokenGroup, DesignTokenSpecification } from '../design-token-specification.interface';
import type { DesignTokenVariableSet } from '../parsers';
import { computeFileToUpdatePath, getTokenSorterByName, getTokenSorterByRef, renderDesignTokens } from './design-token-style.renderer';

describe('Design Token Renderer', () => {
  let exampleVariable!: DesignTokenSpecification;
  let designTokens!: DesignTokenVariableSet;

  beforeAll(async () => {
    const file = await fs.readFile(resolve(__dirname, '../../../../testing/mocks/design-token-theme.json'), { encoding: 'utf8' });
    exampleVariable = { document: JSON.parse(file) };
    // Add different target file
    (exampleVariable.document.example as any)['test.var2'].$extensions = { o3rTargetFile: 'file.scss'};
    designTokens = parser.parseDesignToken(exampleVariable);
  });

  describe('computeFileToUpdatePath', () => {
    const DEFAULT_FILE = 'test-result.json';
    const fileToUpdate = computeFileToUpdatePath('/', DEFAULT_FILE);

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
      expect(result).toBe(resolve('/', variable.extensions.o3rTargetFile));
    });
  });

  describe('renderDesignTokens', () => {
    test('should call the process for all variables', async () => {
      const writeFile = jest.fn();
      const readFile = jest.fn().mockReturnValue('');
      const existsFile = jest.fn().mockReturnValue(true);
      const determineFileToUpdate = jest.fn().mockReturnValue(computeFileToUpdatePath('.'));
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
      const determineFileToUpdate = jest.fn().mockImplementation(computeFileToUpdatePath('.'));

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
        const writeFile = jest.fn().mockImplementation((filename, content) => { result[filename] = content; });
        const readFile = jest.fn().mockReturnValue('');
        const existsFile = jest.fn().mockReturnValue(true);
        const determineFileToUpdate = jest.fn().mockImplementation(computeFileToUpdatePath('.'));

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
        const writeFile = jest.fn().mockImplementation((filename, content) => { result[filename] = content; });
        const readFile = jest.fn().mockReturnValue('');
        const existsFile = jest.fn().mockReturnValue(true);
        const determineFileToUpdate = jest.fn().mockImplementation(computeFileToUpdatePath('.'));

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
        const writeFile = jest.fn().mockImplementation((filename, content) => { result[filename] = content; });
        const readFile = jest.fn().mockReturnValue('');
        const existsFile = jest.fn().mockReturnValue(true);
        const determineFileToUpdate = jest.fn().mockImplementation(computeFileToUpdatePath('.'));
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

  describe('getTokenSorterByName', () => {
    let designTokensToSort!: DesignTokenVariableSet;
    beforeEach(() => {
      /* eslint-disable @typescript-eslint/naming-convention -- Mock purpose */
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
      /* eslint-enable @typescript-eslint/naming-convention */
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
