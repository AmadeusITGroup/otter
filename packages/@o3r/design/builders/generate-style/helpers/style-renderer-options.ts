import type { BuilderContext } from '@angular-devkit/architect';
import {
  type CssTokenDefinitionRendererOptions,
  type CssTokenValueRendererOptions,
  type DesignTokenRendererOptions,
  type DesignTokenVariableStructure,
  getCssStyleContentUpdater,
  getCssTokenDefinitionRenderer,
  getCssTokenValueRenderer,
  getSassStyleContentUpdater,
  getSassTokenDefinitionRenderer,
  getSassTokenValueRenderer,
  type SassTokenDefinitionRendererOptions,
  type SassTokenValueRendererOptions,
  type TokenKeyRenderer,
  tokenVariableNameSassRenderer
} from '../../../src/public_api';
import type { GenerateStyleSchematicsSchema } from '../schema';
import { resolve } from 'node:path';
import { writeFile } from 'node:fs/promises';

export const getStyleRendererOptions = (tokenVariableNameRenderer: TokenKeyRenderer | undefined , options: GenerateStyleSchematicsSchema, context: BuilderContext): DesignTokenRendererOptions => {

  /**
   * Function to determine files to update based on the Design Token
   * @param token
   */
  const determineFileToUpdate = options.output ? () => resolve(context.workspaceRoot, options.output!) :
    (token: DesignTokenVariableStructure) => {
      if (token.extensions.o3rTargetFile) {
        return token.context?.basePath && !options.rootPath
          ? resolve(token.context.basePath, token.extensions.o3rTargetFile)
          : resolve(context.workspaceRoot, options.rootPath || '', token.extensions.o3rTargetFile);
      }

      return resolve(context.workspaceRoot, options.defaultStyleFile);
    };

  /** Builder logger */
  const logger = context.logger;

  /**
   * File writer with logging when writing file
   * @param file
   * @param {...any} args
   */
  const writeFileWithLogger: typeof writeFile = async (file, ...args) => {
    const res = await writeFile(file, ...args);
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    logger.info(`Updated ${file.toString()} with Design Token content.`);
    return res;
  };

  /** Render for the private variables if specified */
  const privateDefinitionRenderer = options.renderPrivateVariableTo === 'sass' ? getSassTokenDefinitionRenderer({
    tokenVariableNameRenderer: (v) => (options?.prefixPrivate || '') + tokenVariableNameSassRenderer(v),
    logger
  }) : undefined;

  /** Update of file content based on selected language */
  const styleContentUpdater = ((language) => {
    switch (language) {
      case 'css': {
        return getCssStyleContentUpdater();
      }
      case 'scss':
      case 'sass': {
        return getSassStyleContentUpdater();
      }
      default: {
        throw new Error(`No available updater for "${language as string}"`);
      }
    }
  })(options.language);

  /** Style token value renderer based on selected language */
  const tokenValueRenderer = ((language) => {
    const tokenValueRendererOptions: SassTokenValueRendererOptions | CssTokenValueRendererOptions = {
      tokenVariableNameRenderer,
      logger,
      unregisteredReferenceRenderer: options.failOnMissingReference ? (refName) => { throw new Error(`The Design Token ${refName} is not registered`); } : undefined
    };
    switch (language) {
      case 'css': {
        return getCssTokenValueRenderer(tokenValueRendererOptions);
      }
      case 'scss':
      case 'sass': {
        return getSassTokenValueRenderer(tokenValueRendererOptions);
      }
      default: {
        throw new Error(`No available value renderer for "${language as string}"`);
      }
    }
  })(options.variableReferenceType || options.language);

  /** Style token variable set renderer based on selected language */
  const tokenDefinitionRenderer = ((language) => {
    const tokenDefinitionRendererOptions: SassTokenDefinitionRendererOptions | CssTokenDefinitionRendererOptions = {
      privateDefinitionRenderer,
      tokenVariableNameRenderer,
      tokenValueRenderer,
      logger
    };
    switch (language) {
      case 'css': {
        const variableReferenceType = options.variableReferenceType || options.language;
        return getCssTokenDefinitionRenderer({
          ...tokenDefinitionRendererOptions,
          tokenValueRenderer: ['sass', 'scss'].includes(variableReferenceType)
            ? (...arg) => `#{${tokenValueRenderer(...arg)}}`
            : tokenValueRenderer
        });
      }
      case 'scss':
      case 'sass': {
        return getSassTokenDefinitionRenderer(tokenDefinitionRendererOptions);
      }
      default: {
        throw new Error(`No available value renderer for "${language as string}"`);
      }
    }
  })(options.variableType || options.language);

  /** Option to be used by the style renderer */
  return {
    writeFile: writeFileWithLogger,
    styleContentUpdater,
    determineFileToUpdate,
    tokenDefinitionRenderer,
    logger
  };
};
