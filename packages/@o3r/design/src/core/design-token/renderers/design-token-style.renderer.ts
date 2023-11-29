import type { DesignTokenVariableSet, DesignTokenVariableStructure } from '../parsers/design-token-parser.interface';
import { getCssTokenDefinitionRenderer } from './css/design-token-definition.renderers';
import { getCssStyleContentUpdater } from './css/design-token-updater.renderers';
import { existsSync, promises as fs } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import type { DesignTokenRendererOptions } from './design-token.renderer.interface';

/**
 * Retrieve the function determining if a given file exists
 * @param root Root path
 * @param defaultFile Default file if not requested by the Token
 */
export const getFileToUpdateDetermination = (root = process.cwd(), defaultFile = 'styles.scss') => (token: DesignTokenVariableStructure) => {
  if (token.extensions.o3rTargetFile) {
    return isAbsolute(token.extensions.o3rTargetFile) ? token.extensions.o3rTargetFile : resolve(root, token.extensions.o3rTargetFile);
  }

  return defaultFile;
};

/**
 * Process the parsed Design Token variables and render then according to the given options and renderers
 * @param variableSet Complete list of the parsed Design Token
 * @param options Parameters of the Design Token Renderer
 */
export const renderDesignTokens = async (variableSet: DesignTokenVariableSet, options?: DesignTokenRendererOptions) => {
  const readFile = options?.readFile || ((filePath: string) => fs.readFile(filePath, {encoding: 'utf-8'}));
  const writeFile = options?.writeFile || fs.writeFile;
  const existsFile = options?.existsFile || existsSync;
  const determineFileToUpdate = options?.determineFileToUpdate || getFileToUpdateDetermination();
  const tokenDefinitionRenderer = options?.tokenDefinitionRenderer || getCssTokenDefinitionRenderer();
  const styleContentUpdater = options?.styleContentUpdater || getCssStyleContentUpdater();
  const updates = Array.from(variableSet.values()).reduce((acc, designToken) => {
    const filePath = determineFileToUpdate(designToken);
    const variable = tokenDefinitionRenderer(designToken, variableSet);
    if (variable) {
      acc[filePath] ||= [];
      acc[filePath].push(variable);
    }
    return acc;
  }, {} as Record<string, string[]>);

  await Promise.all(
    Object.entries(updates).map(async ([file, vars]) => {
      const styleContent = existsFile(file) ? await readFile(file) : '';
      const newStyleContent = styleContentUpdater(vars, file, styleContent);
      await writeFile(file, newStyleContent);
    })
  );
};
