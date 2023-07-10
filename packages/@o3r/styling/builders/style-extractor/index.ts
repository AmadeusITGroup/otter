import { BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { CmsMedataData, getLibraryCmsMetadata, validateJson } from '@o3r/extractors';
import type { CssMetadata, CssVariable } from '@o3r/styling';
import * as chokidar from 'chokidar';
import * as fs from 'node:fs';
import { sync as globbySync } from 'globby';
import * as path from 'node:path';
import { CssVariableExtractor } from './helpers/index';
import { StyleExtractorBuilderSchema } from './schema';

export * from './schema';

export default createBuilder<StyleExtractorBuilderSchema>(async (options, context): Promise<BuilderOutput> => {
  context.reportRunning();

  const cssVariableExtractor = new CssVariableExtractor();

  const execute = async (files: string[], previousMetadata: CssMetadata = {
    variables: {}
  }): Promise<BuilderOutput> => {
    /** Maximum number of steps */
    const STEP_NUMBER = files.length + 1;
    /** List of SCSS files for which the extraction failed */
    const hasFailedFiles: {file: string; error: Error}[] = [];
    /** Copy of previous metadata file generated */
    const initialPreviousMetadata = { ...previousMetadata };
    /** CSS Metadata file to write */
    let cssMetadata = (
      // extract metadata for each file
      await Promise.all(files.map((file, idx) => {
        try {
          context.reportProgress(idx, STEP_NUMBER, `Extracting ${file}`);
          return cssVariableExtractor.extractFile(file);
        } catch (error: any) {
          hasFailedFiles.push({file, error});
          return [];
        }
      }))
    ).reduce<CssMetadata>((acc, cssVarList) => {
      // Check duplicate CSS variable
      cssVarList
        .filter((cssVar) => !!acc.variables[cssVar.name])
        .filter((cssVar) => !initialPreviousMetadata.variables[cssVar.name] && (acc.variables[cssVar.name] as CssVariable).defaultValue !== cssVar.defaultValue)
        .forEach((cssVar) =>
          context.logger.warn(`Duplicate "${cssVar.name}" (${(acc.variables[cssVar.name] as CssVariable).defaultValue} will be replaced by ${cssVar.defaultValue})`)
        );

      // merge all variables form all the files
      cssVarList
        .forEach((item) => {
          acc.variables[item.name] = item;
          delete (acc.variables[item.name] as any).name;
        });
      return acc;
    }, previousMetadata);

    // exit on failure
    if (hasFailedFiles.length) {
      return {
        success: false,
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        error: hasFailedFiles.reduce((acc, errorCss) => acc + '\n' + errorCss.file + '\n' + errorCss.error, '')
      };

    } else {
      context.reportProgress(STEP_NUMBER - 1, STEP_NUMBER, 'Read libraries Metadata');
      // extract library metadata if a library has been specified
      if (options.libraries.length) {
        cssMetadata = cssVariableExtractor.extract(options.libraries, cssMetadata);
      }

      context.reportProgress(STEP_NUMBER, STEP_NUMBER, 'Generating metadata');
      try {
        validateJson(
          cssMetadata,
          require(path.resolve(__dirname, '..', '..', 'schemas', 'style.metadata.schema.json')),
          'The output of style metadata is not valid regarding the json schema, please check the details below : \n'
        );

        try {
          await fs.promises.mkdir(path.dirname(path.resolve(context.workspaceRoot, options.outputFile)), { recursive: true });
        } catch { }
        // Write metadata file
        await new Promise<void>((resolve, reject) =>
          fs.writeFile(
            path.resolve(context.workspaceRoot, options.outputFile),
            options.inline ? JSON.stringify(cssMetadata) : JSON.stringify(cssMetadata, null, 2),
            (err) => err ? reject(err) : resolve()
          )
        );
      } catch (e: any) {
        return {
          success: false,
          error: e.message || e.toString()
        };
      }

      context.logger.info(`CSS metadata bundle extracted in ${options.outputFile}.`);
    }

    return {
      success: true
    };
  };

  /** Retrieve the list of files based on glob pattern */
  const getAllFiles = () => {
    const posixCurrentDirectory = context.currentDirectory.split(path.sep).join(path.posix.sep);
    return globbySync(options.filePatterns.map((pattern) => path.posix.normalize(pattern)), {
      cwd: posixCurrentDirectory,
      absolute: true
    });
  };

  /**
   * Run a translation generation and report the result
   *
   * @param filePath File that has changed and requires a regeneration
   * @param cacheMetadata Previous metadata file generated
   */
  const generateWithReport = async (filePath: string | null, cacheMetadata: CssMetadata) => {
    const result = await execute(filePath ? [filePath] : [], cacheMetadata);

    if (result.success) {
      context.logger.info('Style metadata updated');
    } else if (result.error) {
      context.logger.error(result.error);
    }
    context.reportStatus('Waiting for changes...');
    return result;
  };

  if (!options.watch) {
    return execute(getAllFiles());

  } else {
    /** Cache */
    const cacheMetadata: CssMetadata = {
      variables: {}
    };
    /** List of library metadata files */
    const metadataFiles: CmsMedataData[] = options.libraries.map((library) => getLibraryCmsMetadata(library, context.currentDirectory));
    const libMetadataFiles = metadataFiles
      .filter(({ styleFilePath }) => !!styleFilePath)
      .map(({ styleFilePath }) => styleFilePath!.replace(/[\\/]/g, '/'));
    /** List of scss file pattern */
    const scssFiles = options.filePatterns
      .map((pattern) => path.resolve(context.currentDirectory, pattern).replace(/[\\/]/g, '/'));
    /** SCSS file watcher */
    const watcher = chokidar.watch(scssFiles);
    /** Libraries Metadata files watcher */
    const metadataWatcher = chokidar.watch(libMetadataFiles);
    let currentProcess: Promise<unknown> | undefined = execute(getAllFiles(), cacheMetadata)
      .then(() => currentProcess = undefined);

    metadataWatcher
      .on('all', async (eventName, filePath) => {
        if (!currentProcess) {
          context.logger.debug(`Refreshed for action ${eventName} on ${filePath}`);
          currentProcess = generateWithReport(null, cacheMetadata);
          await currentProcess;
          currentProcess = undefined;
        } else {
          context.logger.debug(`Ignored action ${eventName} on ${filePath}`);
        }
      });
    watcher
      .on('all', async (eventName, filePath) => {
        if (!currentProcess) {
          context.logger.debug(`Refreshed for action ${eventName} on ${filePath}`);
          currentProcess = generateWithReport(filePath, cacheMetadata);
          await currentProcess;
          currentProcess = undefined;
        } else {
          context.logger.debug(`Ignored action ${eventName} on ${filePath}`);
        }
      });

    context.addTeardown(async () => {
      await watcher.close();
      await metadataWatcher.close();
    });

    // Exit on watcher failure
    return new Promise<BuilderOutput>((_resolve, reject) =>
      watcher
        .on('error', (err) => reject(err))
    );
  }
});
