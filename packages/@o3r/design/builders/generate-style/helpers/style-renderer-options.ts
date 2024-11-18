import type { BuilderContext } from '@angular-devkit/architect';
import {
  type CssStyleContentUpdaterOptions,
  type CssTokenDefinitionRendererOptions,
  type CssTokenValueRendererOptions,
  type DesignTokenListTransform,
  type DesignTokenRendererOptions,
  type DesignTokenVariableStructure,
  getCssStyleContentUpdater,
  getCssTokenDefinitionRenderer,
  getCssTokenValueRenderer,
  getSassStyleContentUpdater,
  getSassTokenDefinitionRenderer,
  getSassTokenValueRenderer,
  getTokenSorterByName,
  getTokenSorterByRef,
  getTokenSorterFromRegExpList,
  type SassStyleContentUpdaterOptions,
  type SassTokenDefinitionRendererOptions,
  type SassTokenValueRendererOptions,
  type TokenKeyRenderer,
  tokenVariableNameSassRenderer
} from '../../../src/public_api';
import type { GenerateStyleSchematicsSchema } from '../schema';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

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

  /** Render for the private variables if specified */
  const privateDefinitionRenderer = options.renderPrivateVariableTo === 'sass' ? getSassTokenDefinitionRenderer({
    tokenVariableNameRenderer: (v) => (options?.prefixPrivate || '') + tokenVariableNameSassRenderer(v),
    logger
  }) : undefined;

  /** Update of file content based on selected language */
  const styleContentUpdater = ((language) => {
    const updaterOptions = options.codeEditTags &&
      { startTag: options.codeEditTags.start, endTag: options.codeEditTags.end } as const satisfies CssStyleContentUpdaterOptions & SassStyleContentUpdaterOptions;
    switch (language) {
      case 'css': {
        return getCssStyleContentUpdater(updaterOptions);
      }
      case 'scss':
      case 'sass': {
        return getSassStyleContentUpdater(updaterOptions);
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

  /** Sorting strategy of variables based on selected language */
  const tokenListTransforms = ((language) => {
    const customSorter: DesignTokenListTransform[] = [];
    if (options.sortOrderPatternsFilePath) {
      try {
        const regExps = (JSON.parse(readFileSync(resolve(context.workspaceRoot, options.sortOrderPatternsFilePath), {encoding: 'utf8'})) as string[])
          .map((item) => new RegExp(item.replace(/^\/(.*)\/$/, '$1')));
        customSorter.push(getTokenSorterFromRegExpList(regExps));
      } catch (err: any) {
        if (err?.code === 'ENOENT') {
          context.logger.warn(`The specified RegExp file ${options.sortOrderPatternsFilePath} is not found in ${context.workspaceRoot}`);
        } else {
          context.logger.warn(`Error during the parsing of ${options.sortOrderPatternsFilePath}.`);
          if (err instanceof Error) {
            context.logger.warn(err.message);
            context.logger.debug(err.stack || 'no stack');
          } else {
            context.logger.debug(JSON.stringify(err, null, 2));
          }
        }
        context.logger.warn(`The ordered list will be ignored.`);
      }
    }
    switch (language) {
      case 'scss':
      case 'sass': {
        return [getTokenSorterByName, ...customSorter, getTokenSorterByRef];
      }
      case 'css':
      default: {
        return [getTokenSorterByName, ...customSorter];
      }
    }
  })(options.variableType || options.language);

  /** Option to be used by the style renderer */
  return {
    tokenListTransforms,
    styleContentUpdater,
    determineFileToUpdate,
    tokenDefinitionRenderer,
    logger
  };
};
