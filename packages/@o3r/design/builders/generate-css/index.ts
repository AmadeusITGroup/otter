import type { GenerateCssSchematicsSchema } from './schema';
import { BuilderOutput, createBuilder } from '@angular-devkit/architect';
import {
  getCssTokenDefinitionRenderer,
  getCssTokenValueRenderer,
  getMetadataStyleContentUpdater,
  getMetadataTokenDefinitionRenderer,
  getSassTokenDefinitionRenderer,
  parseDesignTokenFile,
  renderDesignTokens,
  tokenVariableNameSassRenderer
} from '../../src/public_api';
import type { DesignTokenRendererOptions, DesignTokenVariableSet, DesignTokenVariableStructure, TokenKeyRenderer } from '../../src/public_api';
import { resolve } from 'node:path';
import * as globby from 'globby';
import { EOL } from 'node:os';

/**
 * Generate CSS from Design Token files
 * @param options
 */
export default createBuilder<GenerateCssSchematicsSchema>(async (options, context): Promise<BuilderOutput> => {
  const designTokenFilePatterns = Array.isArray(options.designTokenFilePatterns) ? options.designTokenFilePatterns : [options.designTokenFilePatterns];
  const determineCssFileToUpdate = options.output ? () => resolve(context.workspaceRoot, options.output!) :
    (token: DesignTokenVariableStructure) => {
      if (token.extensions.o3rTargetFile) {
        return token.context?.basePath && !options.rootPath ?
          resolve(token.context.basePath, token.extensions.o3rTargetFile) :
          resolve(context.workspaceRoot, options.rootPath || '', token.extensions.o3rTargetFile);
      }

      return resolve(context.workspaceRoot, options.defaultStyleFile);
    };
  const tokenVariableNameRenderer: TokenKeyRenderer | undefined = options.prefix ? (variable) => options.prefix! + variable.getKey() : undefined;
  const logger = context.logger;
  const sassRenderer = getSassTokenDefinitionRenderer({
    tokenVariableNameRenderer: (v) => (options?.prefixPrivate || '') + tokenVariableNameSassRenderer(v),
    logger
  });
  const renderDesignTokenOptionsCss: DesignTokenRendererOptions = {
    determineFileToUpdate: determineCssFileToUpdate,
    tokenDefinitionRenderer: getCssTokenDefinitionRenderer({
      tokenVariableNameRenderer,
      privateDefinitionRenderer: options.renderPrivateVariableTo === 'sass' ? sassRenderer : undefined,
      tokenValueRenderer: getCssTokenValueRenderer({
        tokenVariableNameRenderer,
        unregisteredReferenceRenderer: options.failOnMissingReference ? (refName) => { throw new Error(`The Design Token ${refName} is not registered`); } : undefined
      }),
      logger
    }),
    logger
  };

  const renderDesignTokenOptionsMetadata: DesignTokenRendererOptions = {
    determineFileToUpdate: () => resolve(context.workspaceRoot, options.metadataOutput!),
    styleContentUpdater: getMetadataStyleContentUpdater(),
    tokenDefinitionRenderer: getMetadataTokenDefinitionRenderer({ tokenVariableNameRenderer }),
    logger
  };

  const execute = async (renderDesignTokenOptions: DesignTokenRendererOptions): Promise<BuilderOutput> => {
    const files = (await globby(designTokenFilePatterns, { cwd: context.workspaceRoot, absolute: true }));

    const inDependencies = designTokenFilePatterns
      .filter((pathName) => !pathName.startsWith('.') && !pathName.startsWith('*') && !pathName.startsWith('/'))
      .map((pathName) => {
        try {
          return require.resolve(pathName);
        } catch {
          return undefined;
        }
      })
      .filter((pathName): pathName is string => !!pathName);
    files.push(...inDependencies);

    try {
      const duplicatedToken: DesignTokenVariableStructure[] = [];
      const tokens = (await Promise.all(files.map(async (file) => ({file, parsed: await parseDesignTokenFile(file)}))))
        .reduce<DesignTokenVariableSet>((acc, {file, parsed}) => {
          parsed.forEach((variable, key) => {
            if (acc.has(key)) {
              context.logger[options.failOnDuplicate ? 'error' : 'warn'](`A duplication of the variable ${key} is found in ${file}`);
              duplicatedToken.push(variable);
            }
            acc.set(key, variable);
          });
          return acc;
        }, new Map());
      if (options.failOnDuplicate && duplicatedToken.length > 0) {
        throw new Error(`Found ${duplicatedToken.length} duplicated Design Token keys`);
      }
      await renderDesignTokens(tokens, renderDesignTokenOptions);
      return { success: true };
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return { success: false, error: `${err as any}` };
    }
  };

  const executeMultiRenderer = async (): Promise<BuilderOutput> => {
    return (await Promise.allSettled<Promise<BuilderOutput>[]>([
      execute(renderDesignTokenOptionsCss),
      ...(options.metadataOutput ? [execute(renderDesignTokenOptionsMetadata)] : [])
    ])).reduce((acc, res) => {
      if (res.status === 'fulfilled') {
        acc.success &&= res.value.success;
        if (res.value.error) {
          acc.error ||= '';
          acc.error += EOL + res.value.error;
        }
      } else {
        acc.success = false;
        if (res.reason) {
          acc.error ||= '';
          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          acc.error += EOL + res.reason;
        }
      }
      return acc;
    }, { success: true } as BuilderOutput);
  };

  if (!options.watch) {
    return await executeMultiRenderer();
  } else {
    try {
      await import('chokidar')
        .then((chokidar) => chokidar.watch(designTokenFilePatterns.map((p) => resolve(context.workspaceRoot, p))))
        .then((watcher) => watcher.on('all', async () => {
          const res = await executeMultiRenderer();

          if (res.error) {
            context.logger.error(res.error);
          }
        }));
      return { success: true };
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return { success: false, error: `${err as any}` };
    }
  }
});
