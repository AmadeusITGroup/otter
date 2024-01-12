import * as parser from '../parsers/design-token.parser';
import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import type { DesignTokenSpecification } from '../design-token-specification.interface';
import { isO3rPrivateVariable } from './design-token.renderer.helpers';
import type { DesignTokenVariableSet } from '../parsers';

describe('isO3rPrivateVariable' , () => {
  let exampleVariable!: DesignTokenSpecification;
  let designTokens!: DesignTokenVariableSet;

  beforeAll(async () => {
    const file = await fs.readFile(resolve(__dirname, '../../../../testing/mocks/design-token-theme.json'), { encoding: 'utf-8' });
    exampleVariable = { document: JSON.parse(file) };
    designTokens = parser.parseDesignToken(exampleVariable);
  });

  test('should determine the variable as ignored', () => {
    const token = designTokens.get('example.var3');
    expect(isO3rPrivateVariable(token)).toBe(true);
  });

  test('should determine the variable as not ignored', () => {
    const token = designTokens.get('example.var1');
    expect(isO3rPrivateVariable(token)).toBe(false);
  });

  test('should determine the alias variable as not ignored', () => {
    const token = designTokens.get('example.color');
    expect(isO3rPrivateVariable(token)).toBe(false);
  });
});
