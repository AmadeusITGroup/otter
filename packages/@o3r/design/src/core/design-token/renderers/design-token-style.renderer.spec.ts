import * as parser from '../parsers/design-token.parser';
import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import type { DesignTokenSpecification } from '../design-token-specification.interface';
import type { DesignTokenVariableSet } from '../parsers';
import { getFileToUpdateDetermination, renderDesignTokens } from './design-token-style.renderer';

describe('Design Token Renderer', () => {
  let exampleVariable!: DesignTokenSpecification;
  let designTokens!: DesignTokenVariableSet;

  beforeAll(async () => {
    const file = await fs.readFile(resolve(__dirname, '../../../../testing/mocks/design-token-theme.json'), { encoding: 'utf-8' });
    exampleVariable = JSON.parse(file);
    // Add different target file
    (exampleVariable.example as any)['test.var2'].$extensions = { o3rTargetFile: 'file.scss'};
    designTokens = parser.parseDesignToken(exampleVariable);
  });

  describe('getFileToUpdateDetermination', () => {
    const DEFAULT_FILE = 'test-result.json';
    const fileToUpdate = getFileToUpdateDetermination('/', DEFAULT_FILE);

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
      const determineFileToUpdate = jest.fn().mockReturnValue(getFileToUpdateDetermination('.'));
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
      const determineFileToUpdate = jest.fn().mockImplementation(getFileToUpdateDetermination('.'));

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
  });
});
