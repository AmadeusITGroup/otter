import * as fs from 'node:fs';
import {
  EOL
} from 'node:os';
import * as path from 'node:path';
import {
  BuilderOutput,
  createBuilder
} from '@angular-devkit/architect';
import {
  CmsMetadataData,
  createBuilderWithMetricsIfInstalled,
  getLibraryCmsMetadata,
  validateJson
} from '@o3r/extractors';
import {
  isO3rClassComponent
} from '@o3r/schematics';
import type {
  CssMetadata
} from '@o3r/styling';
import * as chokidar from 'chokidar';
import {
  sync as globbySync
} from 'globby';
import type {
  Logger
} from 'sass';
import * as ts from 'typescript';
import {
  CssVariableExtractor
} from './helpers/index';
import {
  StyleExtractorBuilderSchema
} from './schema';

export * from './schema';

/**
 * Get the library name from package.json
 * @param currentDir
 */
const defaultLibraryName = (currentDir: string = process.cwd()) => {
  const packageJsonPath = path.resolve(currentDir, 'package.json');
  return JSON.parse(fs.readFileSync(packageJsonPath, { encoding: 'utf8' })).name as string;
};

export default createBuilder(createBuilderWithMetricsIfInstalled<StyleExtractorBuilderSchema>(async (options, context): Promise<BuilderOutput> => {
  context.logger.warn('The extraction of style metadata is deprecated, we encourage to generate it from Design Token via the "generate-css" builder');
  context.logger.warn('Use the following command to install the builder: "ng add @o3r/design"');
  context.logger.warn('Get more information on https://www.npmjs.com/package/@o3r/design');
  context.reportRunning();
  const libraryName = options.name || defaultLibraryName(context.currentDirectory);

  const sassLogger: Logger = {
    debug: (message, { span }) => context.logger.debug(`${span ? `${span.url?.toString() || ''}:${span.start.line}:${span.start.column}: ` : ''}${message}`),
    warn: (message, { deprecation, span, stack }) => {
      let log: string = deprecation ? `Deprecated function used${EOL}` : '';
      if (stack) {
        log += `${stack}${EOL}`;
      }
      log += `${span ? `${span.url?.toString() || ''}:${span.start.line}:${span.start.column}: ` : ''}${message}`;
      context.logger.warn(log);
    }
  };

  const cssVariableExtractor = new CssVariableExtractor({ logger: sassLogger }, options);

  const execute = async (files: string[], previousMetadata: CssMetadata = {
    variables: {}
  }): Promise<BuilderOutput> => {
    /** Maximum number of steps */
    const STEP_NUMBER = files.length + 1;
    /** List of SCSS files for which the extraction failed */
    const hasFailedFiles: { file: string; error: Error }[] = [];
    /** Copy of previous metadata file generated */
    const initialPreviousMetadata = { ...previousMetadata };
    /** CSS Metadata file to write */
    let cssMetadata = (
      // extract metadata for each file
      await Promise.all(files.map((file, idx) => {
        try {
          context.reportProgress(idx, STEP_NUMBER, `Extracting ${file}`);
          const variables = cssVariableExtractor.extractFile(file);
          const themeFileSuffix = '.style.theme.scss';
          if (file.endsWith(themeFileSuffix)) {
            const componentPath = path.join(path.dirname(file), `${path.basename(file, themeFileSuffix)}.component.ts`);
            const componentSourceFile = ts.createSourceFile(
              componentPath,
              fs.readFileSync(componentPath).toString(),
              ts.ScriptTarget.ES2020,
              true
            );
            const componentDeclaration = componentSourceFile.statements.find((s): s is ts.ClassDeclaration => ts.isClassDeclaration(s) && isO3rClassComponent(s));
            const componentName: string | undefined = componentDeclaration?.name?.escapedText.toString();
            if (componentName) {
              return variables.map((variable) => ({ ...variable, component: { library: libraryName, name: componentName } }));
            }
          }
          return variables;
        } catch (error: any) {
          hasFailedFiles.push({ file, error });
          return [];
        }
      }))
    ).reduce<CssMetadata>((acc, cssVarList) => {
      // Check duplicate CSS variable
      cssVarList
        .filter((cssVar) => !!acc.variables[cssVar.name])
        .filter((cssVar) => !initialPreviousMetadata.variables[cssVar.name] && acc.variables[cssVar.name].defaultValue !== cssVar.defaultValue)
        .forEach((cssVar) =>
          context.logger[options.ignoreDuplicateWarning ? 'debug' : 'warn'](`Duplicate "${cssVar.name}" (${acc.variables[cssVar.name].defaultValue} will be replaced by ${cssVar.defaultValue})`)
        );

      // merge all variables form all the files
      cssVarList
        .forEach((item) => {
          acc.variables[item.name] = item;
        });
      return acc;
    }, previousMetadata);

    // exit on failure
    if (hasFailedFiles.length > 0) {
      return {
        success: false,
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        error: hasFailedFiles.reduce((acc, errorCss) => acc + '\n' + errorCss.file + '\n' + errorCss.error, '')
      };
    } else {
      context.reportProgress(STEP_NUMBER - 1, STEP_NUMBER, 'Read libraries Metadata');
      // extract library metadata if a library has been specified
      if (options.libraries.length > 0) {
        cssMetadata = cssVariableExtractor.extract(options.libraries, cssMetadata);
      }

      context.reportProgress(STEP_NUMBER, STEP_NUMBER, 'Generating metadata');
      try {
        validateJson(
          cssMetadata,
          JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'schemas', 'style.metadata.schema.json'), { encoding: 'utf8' })),
          'The output of style metadata is not valid regarding the json schema, please check the details below : \n'
        );

        try {
          await fs.promises.mkdir(path.dirname(path.resolve(context.workspaceRoot, options.outputFile)), { recursive: true });
        } catch {}
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

  if (options.watch) {
    /** Cache */
    const cacheMetadata: CssMetadata = {
      variables: {}
    };
    /** List of library metadata files */
    const metadataFiles: CmsMetadataData[] = options.libraries.map((library) => getLibraryCmsMetadata(library, context.currentDirectory));
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
        if (currentProcess) {
          context.logger.debug(`Ignored action ${eventName} on ${filePath}`);
        } else {
          context.logger.debug(`Refreshed for action ${eventName} on ${filePath}`);
          currentProcess = generateWithReport(null, cacheMetadata);
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
          currentProcess = generateWithReport(filePath, cacheMetadata);
          await currentProcess;
          currentProcess = undefined;
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
  } else {
    return execute(getAllFiles());
  }
}));
