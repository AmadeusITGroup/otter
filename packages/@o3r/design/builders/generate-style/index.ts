import {
  EOL,
} from 'node:os';
import {
  resolve,
} from 'node:path';
import {
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import type {
  BuilderWrapper,
} from '@o3r/telemetry';
import {
  sync,
} from 'globby';
import type {
  DesignTokenRendererOptions,
  DesignTokenVariableSet,
  DesignTokenVariableStructure,
  TokenKeyRenderer,
} from '../../src/public_api';
import {
  parseDesignTokenFile,
  renderDesignTokens,
} from '../../src/public_api';
import {
  getMetadataRenderDesignTokenOptions,
} from './helpers/metadata-renderer-options';
import {
  getStyleRendererOptions,
} from './helpers/style-renderer-options';
import {
  generateTemplate,
} from './helpers/token-template';
import type {
  GenerateStyleSchematicsSchema,
} from './schema';

const noop: BuilderWrapper = (fn) => fn;

const createBuilderWithMetricsIfInstalled: BuilderWrapper = (builderFn) => async (opts, ctx) => {
  let wrapper: BuilderWrapper = noop;
  try {
    const { createBuilderWithMetrics } = await import('@o3r/telemetry');
    wrapper = createBuilderWithMetrics;
  } catch {}
  return wrapper(builderFn)(opts, ctx);
};

/**
 * Generate CSS from Design Token files
 * @param options
 */
export default createBuilder<GenerateStyleSchematicsSchema>(createBuilderWithMetricsIfInstalled(async (options, context): Promise<BuilderOutput> => {
  /** List of template files */
  const templateFilePaths = (
    options.templateFile
    && (typeof options.templateFile === 'string' ? [options.templateFile] : options.templateFile)
  ) || undefined;

  /** Template object */
  const template = templateFilePaths && await generateTemplate(templateFilePaths, context);

  /** List of input Design Token file patterns */
  const designTokenFilePatterns = Array.isArray(options.designTokenFilePatterns) ? options.designTokenFilePatterns : [options.designTokenFilePatterns];

  /**
   * Render the variable name if the option `prefix` is defined
   * @param variable
   */
  const tokenVariableNameRenderer: TokenKeyRenderer | undefined = options.prefix ? (variable) => options.prefix! + variable.getKey() : undefined;

  /** Option to be used by the style renderer */
  const renderStyleDesignTokenOptions = getStyleRendererOptions(tokenVariableNameRenderer, options, context);

  /** Option to be used by the metadata renderer */
  const renderMetadataDesignTokenOptions = getMetadataRenderDesignTokenOptions(tokenVariableNameRenderer, options, context);

  /**
   * Runner for a single renderer
   * @param renderDesignTokenOptions
   */
  const execute = async (renderDesignTokenOptions: DesignTokenRendererOptions): Promise<BuilderOutput> => {
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
      const tokens = (await Promise.all(files.map(async (file) => ({ file, parsed: await parseDesignTokenFile(file, { specificationContext: { template } }) }))))
        .reduce<DesignTokenVariableSet>((acc, { file, parsed }) => {
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

  /** Runner for all the renderers based on options */
  const executeMultiRenderer = async (): Promise<BuilderOutput> => {
    return (await Promise.allSettled<Promise<BuilderOutput>[]>([
      execute(renderStyleDesignTokenOptions),
      ...(options.metadataOutput ? [execute(renderMetadataDesignTokenOptions)] : [])
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

          acc.error += EOL + res.reason;
        }
      }
      return acc;
    }, { success: true } as BuilderOutput);
  };

  if (options.watch) {
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
  } else {
    return await executeMultiRenderer();
  }
}));
