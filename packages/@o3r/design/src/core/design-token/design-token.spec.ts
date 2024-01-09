import {
  computeFileToUpdatePath,
  DesignTokenRendererOptions,
  getCssStyleContentUpdater,
  getCssTokenDefinitionRenderer,
  getMetadataStyleContentUpdater,
  getMetadataTokenDefinitionRenderer,
  getSassTokenDefinitionRenderer,
  renderDesignTokens
} from './renderers/index';
import { parseDesignToken, TokenKeyRenderer } from './parsers/index';
import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import type { DesignTokenSpecification } from './design-token-specification.interface';
import { validate } from 'jsonschema';

describe('Design Token generator', () => {
  const AUTO_GENERATED_START = '/* --- BEGIN THEME Test --- */';
  const AUTO_GENERATED_END = '/* --- END THEME Test --- */';
  let exampleVariable!: DesignTokenSpecification;

  beforeAll(async () => {
    exampleVariable = {document: JSON.parse(await fs.readFile(resolve(__dirname, '../../../testing/mocks/design-token-theme.json'), {encoding: 'utf-8'}))};
  });

  describe('CSS renderer', () => {

    const renderDesignTokensOptions = {
      styleContentUpdater: getCssStyleContentUpdater({startTag: AUTO_GENERATED_START, endTag: AUTO_GENERATED_END})
    };

    test('should render variable in CSS', async () => {
      let result: string | undefined;
      const writeFile = jest.fn().mockImplementation((_, content) => result = content);
      const readFile = jest.fn().mockReturnValue('');
      const existsFile = jest.fn().mockReturnValue(true);
      const determineFileToUpdate = computeFileToUpdatePath('.');
      const designToken = parseDesignToken(exampleVariable);

      // eslint-disable-next-line @typescript-eslint/await-thenable
      await renderDesignTokens(designToken, {
        ...renderDesignTokensOptions,
        determineFileToUpdate,
        existsFile,
        writeFile,
        readFile
      });

      expect(writeFile).toHaveBeenCalledTimes(1);
      expect(result).toContain('--example-var1: #000;');
      expect(result).toContain('--example-color: var(--example-var1);');
      expect(result).not.toContain('--example-test-height: 2.3;');
      expect(result).toContain('--example-test-width: var(--example-test-height, 2.3);');
    });

    test('should render variable with important flag', async () => {
      let result: string | undefined;
      const writeFile = jest.fn().mockImplementation((_, content) => result = content);
      const readFile = jest.fn().mockReturnValue('');
      const existsFile = jest.fn().mockReturnValue(true);
      const determineFileToUpdate = computeFileToUpdatePath('.');
      const designToken = parseDesignToken(exampleVariable);

      // eslint-disable-next-line @typescript-eslint/await-thenable
      await renderDesignTokens(designToken, {
        ...renderDesignTokensOptions,
        determineFileToUpdate,
        existsFile,
        writeFile,
        readFile
      });

      expect(result).toContain('--example-var-important: #000 !important;');
    });

    test('should render variable with prefix', async () => {
      let result: string | undefined;
      const prefix = 'prefix-';
      const writeFile = jest.fn().mockImplementation((_, content) => result = content);
      const readFile = jest.fn().mockReturnValue('');
      const existsFile = jest.fn().mockReturnValue(true);
      const determineFileToUpdate = computeFileToUpdatePath('.');
      const designToken = parseDesignToken(exampleVariable);
      const tokenVariableNameRenderer: TokenKeyRenderer = (variable) => prefix + variable.tokenReferenceName.replace(/\./g, '-');
      const tokenDefinitionRenderer = getCssTokenDefinitionRenderer({tokenVariableNameRenderer});

      // eslint-disable-next-line @typescript-eslint/await-thenable
      await renderDesignTokens(designToken, {
        ...renderDesignTokensOptions,
        tokenDefinitionRenderer,
        determineFileToUpdate,
        existsFile,
        writeFile,
        readFile
      });

      expect(result).not.toContain('--example-var1');
      expect(result).toContain('--prefix-example-var1');
    });

    test('should render variable in existing CSS', async () => {
      let result: string | undefined;
      const writeFile = jest.fn().mockImplementation((_, content) => result = content);
      const existsFile = jest.fn().mockReturnValue(true);
      const readFile = jest.fn().mockReturnValue(`
        // CSS
        :root {
          ${AUTO_GENERATED_START}
          --some-var: #fff;
          ${AUTO_GENERATED_END}
        }
      `);
      const determineFileToUpdate = computeFileToUpdatePath('.');
      const designToken = parseDesignToken(exampleVariable);

      // eslint-disable-next-line @typescript-eslint/await-thenable
      await renderDesignTokens(designToken, {
        ...renderDesignTokensOptions,
        determineFileToUpdate,
        existsFile,
        writeFile,
        readFile
      });

      expect(writeFile).toHaveBeenCalledTimes(1);
      expect(result).not.toContain('--some-var: #fff;');
      expect(result).toContain('--example-var1: #000;');
    });

    test('should render private variable to sass if requested', async () => {
      let result: string | undefined;
      const expectedSassVar = '$_exampleTestHeight: 2.3;';
      const writeFile = jest.fn().mockImplementation((_, content) => result = content);
      const readFile = jest.fn().mockReturnValue('');
      const existsFile = jest.fn().mockReturnValue(true);
      const determineFileToUpdate = computeFileToUpdatePath('.');
      const designToken = parseDesignToken(exampleVariable);

      const tokenDefinitionRendererWithoutSass = getCssTokenDefinitionRenderer({
        privateDefinitionRenderer: getSassTokenDefinitionRenderer()
      });

      // eslint-disable-next-line @typescript-eslint/await-thenable
      await renderDesignTokens(designToken, {
        ...renderDesignTokensOptions,
        determineFileToUpdate,
        writeFile,
        existsFile,
        readFile
      });

      expect(result).not.toContain(expectedSassVar);

      // eslint-disable-next-line @typescript-eslint/await-thenable
      await renderDesignTokens(designToken, {
        ...renderDesignTokensOptions,
        determineFileToUpdate,
        tokenDefinitionRenderer: tokenDefinitionRendererWithoutSass,
        writeFile,
        existsFile,
        readFile
      });

      expect(writeFile).toHaveBeenCalledTimes(2);
      expect(result).toContain(expectedSassVar);
    });
  });

  describe('Metadata Renderer', () => {
    let metadataSchema: any;
    const renderDesignTokensOptions: DesignTokenRendererOptions = {
      styleContentUpdater: getMetadataStyleContentUpdater(),
      tokenDefinitionRenderer: getMetadataTokenDefinitionRenderer()
    };

    beforeAll(async () => {
      metadataSchema = JSON.parse(await fs.readFile(resolve(__dirname, '../../../../styling/schemas/style.metadata.schema.json'), { encoding: 'utf-8' }));
    });

    test('should render valid metadata', async () => {
      let result: string | undefined;
      const writeFile = jest.fn().mockImplementation((_, content) => result = content);
      const readFile = jest.fn().mockReturnValue('');
      const existsFile = jest.fn().mockReturnValue(true);
      const determineFileToUpdate = computeFileToUpdatePath('.');
      const designToken = parseDesignToken(exampleVariable);

      // eslint-disable-next-line @typescript-eslint/await-thenable
      await renderDesignTokens(designToken, {
        ...renderDesignTokensOptions,
        determineFileToUpdate,
        existsFile,
        writeFile,
        readFile
      });

      expect(writeFile).toHaveBeenCalledTimes(1);
      expect(() => JSON.parse(result)).not.toThrow();
      expect(metadataSchema).toBeDefined();
      expect(validate).toBeDefined();
      expect(validate(JSON.parse(result), metadataSchema).errors).toHaveLength(0);
    });
  });
});
