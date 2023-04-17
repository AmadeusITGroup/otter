import { BuilderOutput, createBuilder } from '@angular-devkit/architect';
import type { ComponentConfigOutput } from '@o3r/components';
import { CmsMedataData, getLibraryCmsMetadata, validateJson } from '@o3r/extractors';
import * as chokidar from 'chokidar';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ComponentExtractor, ComponentParser } from './helpers/component/index';
import { ComponentExtractorBuilderSchema } from './schema';



export * from './schema';

/**
 * Get the library name from package.json
 *
 * @param currentDir
 */
export const defaultLibraryName = (currentDir: string = process.cwd()): string => {
  const packageJsonPath = path.resolve(currentDir, 'package.json');
  return JSON.parse(fs.readFileSync(packageJsonPath).toString()).name as string;
};

/** Maximum number of steps */
const STEP_NUMBER = 5;

/**
 * Ensure that all tuple (library,name) are unique
 *
 * @param configurations
 * @param strictMode
 */
function checkUniquenessLibraryAndName(configurations: ComponentConfigOutput[], strictMode = false) {
  const setOfLibraryAndName: Set<string> = new Set();
  let errors = '';
  configurations.forEach((configuration) => {
    if (setOfLibraryAndName.has(configuration.library + configuration.name)) {
      errors += `Duplicate tuple found in the metadata file for library and name : (${configuration.library}, ${configuration.name})\n`;
    } else {
      setOfLibraryAndName.add(configuration.library + configuration.name);
    }
  });
  if (errors.length) {
    if (strictMode) {
      throw new Error(`Duplicate (library, name) tuples are not allowed :\n ${errors}`);
    }
    console.warn(`Duplicate (library, name) tuples found. Please fix it as it would throw an error in strict mode :\n ${errors}`);
  }
}

export default createBuilder<ComponentExtractorBuilderSchema>(async (options, context): Promise<BuilderOutput> => {
  context.reportRunning();

  const execute = async (): Promise<BuilderOutput> => {
    context.reportProgress(0, STEP_NUMBER, 'Checking required options');
    const tsConfig = path.resolve(context.workspaceRoot, options.tsConfig);
    const tsconfigExists = await new Promise<boolean>((resolve) => fs.exists(tsConfig, resolve));
    if (!tsconfigExists) {
      context.logger.error(`${tsConfig} not found`);

      return {
        error: `${tsConfig} not found`,
        success: false
      };
    }

    context.reportProgress(1, STEP_NUMBER, 'Generating component parser');
    const libraryName = options.name || defaultLibraryName(context.currentDirectory);
    const parser = new ComponentParser(libraryName, tsConfig, context.logger, options.strictMode, options.libraries);

    context.reportProgress(2, STEP_NUMBER, 'Gathering project data');
    const parserOutput = await parser.parse();

    if (!parserOutput) {
      return {
        success: false,
        error: 'Parsing failed'
      };
    } else {
      const componentExtractor = new ComponentExtractor(libraryName, options.libraries, context.logger, context.workspaceRoot);
      try {
        context.reportProgress(3, STEP_NUMBER, 'Extracting component metadata');
        const componentMetadata = await componentExtractor.extract(parserOutput, options);

        // Validate configuration part of components metadata
        validateJson(componentMetadata.configurations, require(require.resolve('@o3r/configuration/schemas/configuration.metadata.schema.json')),
          'The output of configuration metadata is not valid regarding the json schema, please check the details below : \n',
          options.strictMode);

        // Validate components part of components metadata
        validateJson(componentMetadata.components, require(path.resolve(__dirname, '..', '..', 'schemas', 'component.metadata.schema.json')),
          'The output of components metadata is not valid regarding the json schema, please check the details below : \n',
          options.strictMode);

        // Ensure that each tuple (library,name) is unique
        checkUniquenessLibraryAndName(componentMetadata.configurations);

        context.reportProgress(4, STEP_NUMBER, `Writing components in ${options.configOutputFile}`);
        try {
          await fs.promises.mkdir(path.dirname(path.resolve(context.workspaceRoot, options.componentOutputFile)), {recursive: true});
        } catch {}
        await new Promise<void>((resolve, reject) =>
          fs.writeFile(
            path.resolve(context.workspaceRoot, options.componentOutputFile),
            options.inline ? JSON.stringify(componentMetadata.components) : JSON.stringify(componentMetadata.components, null, 2),
            (err) => err ? reject(err) : resolve()
          )
        );

        context.reportProgress(5, STEP_NUMBER, `Writing configurations in ${options.configOutputFile}`);
        await new Promise<void>((resolve, reject) =>
          fs.writeFile(
            path.resolve(context.workspaceRoot, options.configOutputFile),
            options.inline ? JSON.stringify(componentMetadata.configurations) : JSON.stringify(componentMetadata.configurations, null, 2),
            (err) => err ? reject(err) : resolve()
          )
        );
      } catch (e: any) {
        return {
          success: false,
          error: e.message || e.toString()
        };
      }
      context.logger.info(
        `Component metadata extracted in ${options.componentOutputFile} and ${options.configOutputFile} ${options.libraries.length > 0 ? ` (imported from ${options.libraries.join(', ')})` : ''}.`
      );
    }

    return {
      success: true
    };
  };

  /**
   * Run a component metadata generation and report the result
   *
   * @param filename File that has changed and requires a regeneration
   */
  const generateWithReport = async () => {
    const result = await execute();

    if (result.success) {
      context.logger.info('Component metadata updated');
    } else if (result.error) {
      context.logger.error(result.error);
    }
    context.reportStatus('Waiting for changes...');
    return result;
  };

  /**
   * Watch file change in current code and libraries metadata
   *
   * @param libraries Libraries to watch
   */
  const watchFiles = (libraries: string[]): chokidar.FSWatcher => {
    // TODO find a better way to watch files
    const simpleGlobConfigurationFiles = path.resolve(context.currentDirectory, options.filePattern).replace(/[\\/]/g, '/');
    // Get metadata file for each library
    const metadataFiles: CmsMedataData[] = libraries.map((library) => getLibraryCmsMetadata(library, context.currentDirectory));
    const componentMetadataFiles = metadataFiles
      .filter(({ componentFilePath }) => !!componentFilePath)
      .map(({ componentFilePath }) => componentFilePath!.replace(/[\\/]/g, '/'));
    const configurationMetadataFiles = metadataFiles
      .filter(({ configurationFilePath }) => !!configurationFilePath)
      .map(({ configurationFilePath }) => configurationFilePath!.replace(/[\\/]/g, '/'));

    return chokidar.watch([...componentMetadataFiles, ...configurationMetadataFiles, simpleGlobConfigurationFiles]);
  };

  if (!options.watch) {
    return execute();

  } else {
    const watcher = watchFiles(options.libraries);
    let currentProcess: Promise<unknown> | undefined;
    watcher
      .on('all', async (eventName, filePath) => {
        if (!currentProcess) {
          context.logger.debug(`Refreshed for action ${eventName} on ${filePath}`);
          currentProcess = generateWithReport();
          await currentProcess;
          currentProcess = undefined;
        } else {
          context.logger.debug(`Ignored action ${eventName} on ${filePath}`);
        }
      });

    context.addTeardown(() => watcher.close());

    // Exit on watcher failure
    return new Promise<BuilderOutput>((_resolve, reject) =>
      watcher
        .on('error', (err) => reject(err))
    );
  }
});
