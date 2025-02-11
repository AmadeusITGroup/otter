import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import {
  createBuilderWithMetricsIfInstalled,
  validateJson,
} from '@o3r/extractors';
import {
  O3rCliError,
} from '@o3r/schematics';
import * as chokidar from 'chokidar';
import {
  sync as globbySync,
} from 'globby';
import {
  LibraryMetadataMap,
  LocalizationExtractor,
  LocalizationFileMap,
} from '../helpers/localization.generator';
import type {
  LocalizationExtractorBuilderSchema,
} from './schema';
import {
  validators,
} from './validations';

export type * from './schema';

export default createBuilder(createBuilderWithMetricsIfInstalled<LocalizationExtractorBuilderSchema>(async (options, context): Promise<BuilderOutput> => {
  context.reportRunning();

  const localizationExtractor = new LocalizationExtractor(path.resolve(context.workspaceRoot, options.tsConfig), context.logger, options);
  const cache: { libs: LibraryMetadataMap; locs: LocalizationFileMap } = { libs: {}, locs: {} };

  const execute = async (isFirstLoad = true, files?: { libs?: string[]; locs?: string[]; extraFiles?: string[] }): Promise<BuilderOutput> => {
    /** Maximum number of steps */
    const STEP_NUMBER = !isFirstLoad && files ? (files.libs && files.libs.length > 0 ? 1 : 0) + (files.locs && files.locs.length > 0 ? 1 : 0) + 2 : 4;
    let stepValue = 0;

    try {
      // load everything from TSConfig
      if (isFirstLoad) {
        context.reportProgress(STEP_NUMBER, stepValue++, 'Load localization');
        cache.locs = await localizationExtractor.extractLocalizationFromTsConfig(files && files.extraFiles);

        context.reportProgress(STEP_NUMBER, stepValue++, 'Load metadata');
        cache.libs = files && files.libs ? await localizationExtractor.getMetadataFromLibraries(files.libs) : {};

      // Load specific files that have changed
      } else {
        if (files && files.locs) {
          context.reportProgress(STEP_NUMBER, stepValue++, 'reload localization');
          const newLocs = await localizationExtractor.getLocalizationMap([...files.locs, ...(files.extraFiles || [])], Object.keys(cache.locs));
          Object.keys(newLocs)
            .forEach((key) => {
              if (cache.locs[key]) {
                newLocs[key].isDependency = cache.locs[key].isDependency;
              }
            });
          cache.locs = {
            ...cache.locs,
            ...newLocs
          };
        }
        if (files && files.libs) {
          context.reportProgress(STEP_NUMBER, stepValue++, 'reload library metadata');
          const newLibs = await localizationExtractor.getMetadataFromFiles(files.libs);
          cache.libs = {
            ...cache.libs,
            ...newLibs
          };
        }
      }

      const metadata = localizationExtractor.generateMetadata(cache.locs, {
        ignoreDuplicateKeys: options.ignoreDuplicateKeys,
        libraryMetadata: cache.libs,
        outputFile: options.outputFile,
        sortKeys: options.sortKeys
      });

      context.reportProgress(STEP_NUMBER, stepValue++, 'Check translations string validation');
      const translationsWithIssue = metadata
        .filter((metadataItem) =>
          !!metadataItem.value
          && validators.reduce<boolean>((isInvalid, validator) => isInvalid || !validator(metadataItem.value!), false)
        );
      if (translationsWithIssue.length > 0) {
        throw new O3rCliError(`The following translations are invalid: ${translationsWithIssue.map((translation) => translation.key).join(', ')}`);
      }

      validateJson(
        metadata,
        JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../schemas/localization.metadata.schema.json'), { encoding: 'utf8' })),
        'The output of localization metadata is not valid regarding the json schema, please check the details below : \n',
        options.strictMode
      );

      context.reportProgress(STEP_NUMBER, STEP_NUMBER, 'Generating metadata');

      // Create output folder if does not exist
      const localizationMetadataFolder = path.dirname(path.resolve(context.workspaceRoot, options.outputFile));
      if (!fs.existsSync(localizationMetadataFolder)) {
        fs.mkdirSync(localizationMetadataFolder, {
          recursive: true
        });
      }
      // Write metadata file
      try {
        await fs.promises.mkdir(path.dirname(path.resolve(context.workspaceRoot, options.outputFile)), { recursive: true });
      } catch {}
      await new Promise<void>((resolve, reject) =>
        fs.writeFile(
          path.resolve(context.workspaceRoot, options.outputFile),
          options.inline ? JSON.stringify(metadata) : JSON.stringify(metadata, null, 2),
          (err) => err ? reject(err) : resolve()
        )
      );
    } catch (e: any) {
      if (e.stack) {
        context.logger.error(e.stack);
      }

      return {
        success: false,
        error: e.message || e.toString()

      };
    }

    context.logger.info(`Localization metadata bundle extracted in ${options.outputFile}.`);

    return {
      success: true
    };
  };

  /**
   * Run a translation generation and report the result
   * @param execution Execution process
   */
  const generateWithReport = async (execution: Promise<BuilderOutput>) => {
    const result = await execution;

    if (result.success) {
      context.logger.info('Localization metadata updated');
    } else if (result.error) {
      context.logger.error(result.error);
    }
    context.reportStatus('Waiting for changes...');
    return result;
  };

  const initialExtraLocs = options.extraFilePatterns.length > 0 ? globbySync(options.extraFilePatterns, { cwd: context.currentDirectory }) : [];

  if (options.watch) {
    let currentProcess: Promise<unknown> | undefined = generateWithReport(execute(true, { extraFiles: initialExtraLocs, libs: options.libraries }))
      .then(() => {
        currentProcess = undefined;
      });

    await currentProcess;

    /** SCSS file watcher */
    const watcher = chokidar.watch([...Object.keys(cache.locs), ...(options.extraFilePatterns || [])], { ignoreInitial: true });
    const metadataWatcher = chokidar.watch(Object.keys(cache.libs), { ignoreInitial: true });
    const { include, exclude, cwd } = localizationExtractor.getPatternsFromTsConfig();
    const tsWatcher = chokidar.watch(include, { ignoreInitial: true, ignored: exclude, cwd });

    tsWatcher
      .on('add', async (filePath, fileStat) => {
        if (!fileStat || !fileStat.isFile || !/\.ts$/.test(filePath)) {
          return;
        }
        if (currentProcess) {
          await currentProcess;
        }
        context.logger.info('Refreshed full metadata');
        currentProcess = generateWithReport(execute(true, { extraFiles: initialExtraLocs, libs: options.libraries }));
        await currentProcess;
        currentProcess = undefined;
        watcher.add(Object.keys(cache.locs));
      });

    metadataWatcher
      .on('all', async (eventName, filePath) => {
        if (currentProcess) {
          context.logger.debug(`Ignored action ${eventName} on ${filePath}`);
        } else {
          context.logger.debug(`Refreshed for action ${eventName} on ${filePath}`);
          currentProcess = generateWithReport(execute(false, { libs: [filePath] }));
          await currentProcess;
          currentProcess = undefined;
        }
      });

    watcher
      .on('all', async (eventName, filePath) => {
        if (currentProcess) {
          context.logger.debug(`Ignored action ${eventName} on ${filePath}`);
        } else {
          context.logger.debug(`Refreshed for action ${eventName} on ${filePath}`);
          currentProcess = generateWithReport(execute(false, { locs: [filePath] }));
          await currentProcess;
          currentProcess = undefined;
        }
      });

    context.addTeardown(async () => {
      await watcher.close();
      await metadataWatcher.close();
      await tsWatcher.close();
    });

    // Exit on watcher failure
    return new Promise<BuilderOutput>((_resolve, reject) => {
      // TODO remove cast after https://github.com/paulmillr/chokidar/issues/1392
      watcher.on('error', (err) => reject(err as Error));
      metadataWatcher.on('error', (err) => reject(err as Error));
      tsWatcher.on('error', (err) => reject(err as Error));
    });
  } else {
    return execute(true, { extraFiles: initialExtraLocs, libs: options.libraries });
  }
}));
