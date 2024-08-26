import type { GenerateCssSchematicsSchema } from './schema';
import { BuilderOutput, createBuilder } from '@angular-devkit/architect';
import {
  getCssTokenDefinitionRenderer,
  getCssTokenValueRenderer,
  getMetadataStyleContentUpdater,
  getMetadataTokenDefinitionRenderer,
  getSassTokenDefinitionRenderer,
  mergeDesignTokenTemplates,
  parseDesignTokenFile,
  renderDesignTokens,
  tokenVariableNameSassRenderer
} from '../../src/public_api';
import type { DesignTokenGroupTemplate, DesignTokenRendererOptions, DesignTokenVariableSet, DesignTokenVariableStructure, TokenKeyRenderer } from '../../src/public_api';
import { resolve } from 'node:path';
import { sync } from 'globby';
import { EOL } from 'node:os';
import { readFile } from 'node:fs/promises';

/**
 * Generate CSS from Design Token files
 * @param options
 */
export default createBuilder<GenerateCssSchematicsSchema>(async (options, context): Promise<BuilderOutput> => {
  const templateFilePaths = options.templateFile
    && (typeof options.templateFile === 'string' ? [options.templateFile] : options.templateFile).map((templateFile) => resolve(context.workspaceRoot, templateFile))
    || undefined;
  const designTokenFilePatterns = Array.isArray(options.designTokenFilePatterns) ? options.designTokenFilePatterns : [options.designTokenFilePatterns];
  const determineFileToUpdate = options.output ? () => resolve(context.workspaceRoot, options.output!) :
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
    determineFileToUpdate,
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

  const renderDesignTokenOptionsSass: DesignTokenRendererOptions = {
    determineFileToUpdate,
    tokenDefinitionRenderer: getSassTokenDefinitionRenderer({
      tokenVariableNameRenderer: (v) => (options?.prefix || '') + tokenVariableNameSassRenderer(v),
      logger
    }),
    logger
  };

  const renderDesignTokenOptionsMetadata: DesignTokenRendererOptions = {
    determineFileToUpdate: () => resolve(context.workspaceRoot, options.metadataOutput!),
    styleContentUpdater: getMetadataStyleContentUpdater(),
    tokenDefinitionRenderer: getMetadataTokenDefinitionRenderer({ tokenVariableNameRenderer, ignorePrivateVariable: options.metadataIgnorePrivate }),
    logger
  };

  const execute = async (renderDesignTokenOptions: DesignTokenRendererOptions): Promise<BuilderOutput> => {
    let template: DesignTokenGroupTemplate | undefined;
    if (templateFilePaths) {
      const templateFiles = await Promise.all(
        templateFilePaths
          .map(async (templateFile) => JSON.parse(await readFile(templateFile, { encoding: 'utf-8' })) as DesignTokenGroupTemplate)
      );
      template = templateFiles.reduce((acc, cur) => mergeDesignTokenTemplates(acc, cur), {});
    }
    const files = sync(designTokenFilePatterns, { cwd: context.workspaceRoot, absolute: true });

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
      const tokens = (await Promise.all(files.map(async (file) => ({file, parsed: await parseDesignTokenFile(file, { specificationContext: { template } })}))))
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
      return { success: false, error: String(err) };
    }
  };

  const executeMultiRenderer = async (): Promise<BuilderOutput> => {
    return (await Promise.allSettled<Promise<BuilderOutput>[]>([
      execute(options.variableType === 'sass' ? renderDesignTokenOptionsSass : renderDesignTokenOptionsCss),
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
        .then((chokidar) => chokidar.watch([
          ...designTokenFilePatterns.map((p) => resolve(context.workspaceRoot, p)),
          ...(templateFilePaths || [])
        ]))
        .then((watcher) => watcher.on('all', async () => {
          const res = await executeMultiRenderer();

          if (res.error) {
            context.logger.error(res.error);
          }
        }));
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }
});
