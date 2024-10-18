import type { GenerateJsonSchemaSchematicsSchema } from './schema';
import { BuilderOutput, createBuilder } from '@angular-devkit/architect';
import type { BuilderWrapper } from '@o3r/telemetry';
import {
  getJsonSchemaStyleContentUpdater,
  getJsonSchemaTokenDefinitionRenderer,
  parseDesignTokenFile,
  renderDesignTokens
} from '../../src/public_api';
import type { DesignTokenVariableSet, DesignTokenVariableStructure } from '../../src/public_api';
import { resolve } from 'node:path';
import * as globby from 'globby';


const createBuilderWithMetricsIfInstalled: BuilderWrapper = (builderFn) => async (opts, ctx) => {
  let wrapper: BuilderWrapper = (fn) => fn;
  try {
    const { createBuilderWithMetrics } = await import('@o3r/telemetry');
    wrapper = createBuilderWithMetrics;
  } catch {}
  return wrapper(builderFn)(opts, ctx);
};

/**
 * Generate Json Schema from Design Token files
 * @param options
 */
export default createBuilder<GenerateJsonSchemaSchematicsSchema>(createBuilderWithMetricsIfInstalled(async (options, context): Promise<BuilderOutput> => {
  const designTokenFilePatterns = Array.isArray(options.designTokenFilePatterns) ? options.designTokenFilePatterns : [options.designTokenFilePatterns];

  const execute = async (): Promise<BuilderOutput> => {
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
      await renderDesignTokens(tokens, {
        determineFileToUpdate: () => resolve(context.workspaceRoot, options.output),
        tokenDefinitionRenderer: getJsonSchemaTokenDefinitionRenderer(),
        styleContentUpdater: getJsonSchemaStyleContentUpdater({
          id: options.schemaId,
          description: options.schemaDescription
        })
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  };

  if (options.watch) {
    try {
      await import('chokidar')
        .then((chokidar) => chokidar.watch(designTokenFilePatterns.map((p) => resolve(context.workspaceRoot, p))))
        .then((watcher) => watcher.on('all', async () => {
          const res = await execute();

          if (res.error) {
            context.logger.error(res.error);
          }
        }));
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  } else {
    return await execute();
  }
}));
