import type { GenerateCssSchematicsSchema } from './schema';
import { BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { getMetadataStyleContentUpdater, getMetadataTokenDefinitionRenderer, parseDesignTokenFile, renderDesignTokens } from '@o3r/design';
import type { DesignTokenRendererOptions, DesignTokenVariableSet, DesignTokenVariableStructure } from '@o3r/design';
import { resolve } from 'node:path';
import * as globby from 'globby';

/**
 * Generate CSS from Design Token files
 * @param options
 */
export default createBuilder<GenerateCssSchematicsSchema>(async (options, context): Promise<BuilderOutput> => {
  const designTokenFilePatterns = Array.isArray(options.designTokenFilePatterns) ? options.designTokenFilePatterns : [options.designTokenFilePatterns];
  const determineCssFileToUpdate = options.output ? () => resolve(context.workspaceRoot, options.output!) :
    (token: DesignTokenVariableStructure) => {
      if (token.extensions.o3rTargetFile) {
        return resolve(context.workspaceRoot, options.rootPath || '', token.extensions.o3rTargetFile);
      }

      return resolve(context.workspaceRoot, options.defaultStyleFile);
    };
  const renderDesignTokenOptionsCss: DesignTokenRendererOptions = {
    determineFileToUpdate: determineCssFileToUpdate,
    logger: context.logger
  };
  const renderDesignTokenOptionsMetadata: DesignTokenRendererOptions = {
    determineFileToUpdate: () => resolve(context.workspaceRoot, options.metadataOutput!),
    styleContentUpdater: getMetadataStyleContentUpdater(),
    tokenDefinitionRenderer: getMetadataTokenDefinitionRenderer(),
    logger: context.logger
  };

  const execute = async (renderDesignTokenOptions: DesignTokenRendererOptions): Promise<BuilderOutput> => {
    const files = (await globby(designTokenFilePatterns, { cwd: context.workspaceRoot }))
      .map((file) => resolve(context.workspaceRoot, file));

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
      return { success: false, error: `${err as any}` };
    }
  };

  if (!options.watch) {
    const res = (await Promise.all([
      execute(renderDesignTokenOptionsCss),
      ...(options.metadataOutput ? [execute(renderDesignTokenOptionsMetadata)] : [])
    ])).find(({ success }) => !success);

    return res || { success: true };
  } else {
    try {
      await import('chokidar')
        .then((chokidar) => chokidar.watch(designTokenFilePatterns.map((p) => resolve(context.workspaceRoot, p))))
        .then((watcher) => watcher.on('all', async () => {
          const res = (await Promise.all([
            execute(renderDesignTokenOptionsCss),
            ...(options.metadataOutput ? [execute(renderDesignTokenOptionsMetadata)] : [])
          ])).find(({success}) => !success);

          if (res && res.error) {
            context.logger.error(res.error);
          }
        }));
      return { success: true };
    } catch (err) {
      return { success: false, error: `${err as any}` };
    }
  }
});
