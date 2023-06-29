import { BuilderContext, BuilderOutput, createBuilder, Target } from '@angular-devkit/architect';
import { LogEntry } from '@angular-devkit/core/src/logger';
import type { JSONLocalization } from '@o3r/localization';
import * as fs from 'node:fs';
import { sync as globbySync } from 'globby';
import * as path from 'node:path';
import { firstValueFrom, from, merge } from 'rxjs';
import { filter } from 'rxjs/operators';
import type { LocalizationExtractorBuilderSchema } from '../localization-extractor/schema';
import { LocalizationBuilderSchema } from './schema';

/** Maximum number of steps */
const STEP_NUMBER = 5;
/** File System debounce time */
const FS_DEBOUNCE_TIME = 200;


/**
 * Get the list of translation files provided in the current package
 *
 * @param languages List of languages
 * @param assets Folder containing the package override translations bundles
 * @param context Ng Builder context
 */
function getAppTranslationFiles(languages: string[], assets: string | string[], context: BuilderContext): Record<string, string[]> {
  const assetsList = (typeof assets === 'string' ? [assets] : assets);
  const posixWorkspaceRoot = context.workspaceRoot.split(path.sep).join(path.posix.sep);

  const languageFileEntries = globbySync(assetsList.map((asset) => path.posix.join(posixWorkspaceRoot, asset, '*.json')), {
    objectMode: true
  });

  const filesPerLanguage = languageFileEntries.reduce((acc, languageFileEntry) => {
    const language = languageFileEntry.name.slice(0, -5); // Remove .json extension from the name
    acc[language] = acc[language] || [];
    acc[language].push(languageFileEntry.path);
    return acc;
  }, {});

  const languagesToDelete = Object.keys(filesPerLanguage).filter((language) => !languages.includes(language));
  languagesToDelete.forEach((language) => delete filesPerLanguage[language]);
  return filesPerLanguage;
}

/**
 * Check if a translation has been overridden at application level but not defined in the metadata
 *
 * @param language Language
 * @param defaultBundle Default translation bundle
 * @param customTranslations Override of translations provided by assets
 * @param context ng Builder context
 * @param metaData
 * @param failIfMissingMetadata
 */
function checkUnusedTranslation(
  language: string,
  defaultBundle: {[k: string]: string},
  customTranslations: {[k: string]: string},
  context: BuilderContext,
  metaData: JSONLocalization[],
  failIfMissingMetadata: boolean
) {
  const dictionaryKeysPatterns = metaData
    .filter((metadataItem) => metadataItem.dictionary)
    .map((metadataItem) => metadataItem.key)
    .map((key) => `${key}.`);

  const missingMetadata = Object.keys(customTranslations)
    .filter((key) => defaultBundle[key] === undefined)
    .filter((key) => !dictionaryKeysPatterns.some((dictionaryKeyPattern) => key.startsWith(dictionaryKeyPattern)));

  missingMetadata.forEach((key) => context.logger[failIfMissingMetadata ? 'error' : 'warn'](`The key "${key}" from "${language}" is not part of the MetaData`));

  if (missingMetadata.length && failIfMissingMetadata) {
    throw new Error(`There is missing metadata for ${language}`);
  }
}

/**
 * Clean localization json file.
 * Note: it is used to remove $schema potentially added by the customization
 *
 * @param translationBundle Translation bundle
 */
function sanitizeLocalization(translationBundle: {[k: string]: string}) {
  delete translationBundle.$schema;
  return translationBundle;
}

/**
 * Load all the translation files in the given array and created a single Object that associated to each key its localized value.
 *
 * @param files
 */
export function loadTranslations(files: string[]): {[k: string]: string} {
  const translationList = files.map((file) => sanitizeLocalization(JSON.parse(fs.readFileSync(file).toString())));
  return translationList.reduce<{[k: string]: string}>((acc, translation) => Object.assign(acc, translation), {});
}

/**
 * Computes the translation bundle for a given language, by resolving overrides specified in defaultLanguageMapping
 *
 * @param language
 * @param filesPerLanguage
 * @param defaultLanguageMapping
 * @param memory
 * @param dependencyPath
 */
export function getTranslationsForLanguage(
  language: string,
  filesPerLanguage: Record<string, string[]>,
  defaultLanguageMapping: Record<string, string>,
  memory: Record<string, Record<string, string>>,
  dependencyPath: Set<string> = new Set()): Record<string, string> {

  if (memory[language]) {
    return memory[language];
  }

  dependencyPath.add(language);
  const files = filesPerLanguage[language];

  let translations: Record<string, string> = files ? loadTranslations(files) : {};

  const defaultLanguage = defaultLanguageMapping[language];
  // If a default language has been configured for this language
  if (defaultLanguage) {
    // Throw an error if we find a circular dependency
    if (dependencyPath.has(defaultLanguage)) {
      throw new Error(`Circular dependency found: ${[...Array.from(dependencyPath), defaultLanguage].join('->')}`);
    } else {
      // Else, recursively resolve its bundle and use it as a base for the current language
      const defaultTranslations = getTranslationsForLanguage(defaultLanguage, filesPerLanguage, defaultLanguageMapping, memory, dependencyPath);

      translations = {
        ...defaultTranslations,
        ...translations
      };
    }
  }

  memory[language] = translations;
  return translations;
}

/**
 * Get the translation bundle for each languages
 *
 * @param languages List of languages
 * @param defaultBundle Default translation bundle
 * @param fileMapping Mapping of translations per languages
 * @param mapReferencesDictionary mapReferencesDictionary
 * @param shouldCheckUnusedTranslation Specify if we need to check the translation not in metadata file
 * @param context Ng Builder context
 * @param metadata metadata
 * @param refKeysMapping mapping for referencing towards referenced keys
 * @param defaultLanguageMapping
 * @param useMetadataAsDefault
 * @param ignoreReferenceIfNotDefault
 * @param failIfMissingMetadata
 */
function getBundlesPerLanguages(
  languages: string[],
  defaultBundle: Record<string, string>,
  fileMapping: Record<string, string[]>,
  mapReferencesDictionary: Record<string, string>,
  shouldCheckUnusedTranslation: boolean,
  context: BuilderContext,
  metadata: JSONLocalization[] = [],
  refKeysMapping: Record<string, string>,
  defaultLanguageMapping: Record<string, string>,
  useMetadataAsDefault: boolean,
  ignoreReferenceIfNotDefault: boolean,
  failIfMissingMetadata: boolean
) {

  const bundles: Record<string, Record<string, string>> = {};
  const memory: Record<string, Record<string, string>> = {};
  for (const language of languages) {
    const translations = getTranslationsForLanguage(language, fileMapping, defaultLanguageMapping, memory);

    if (shouldCheckUnusedTranslation) {
      checkUnusedTranslation(language, defaultBundle, translations, context, metadata, failIfMissingMetadata);
    }

    const bundle = useMetadataAsDefault ? {
      ...defaultBundle,
      ...translations
    } : translations;
    bundles[language] = bundle;

    Object.keys(mapReferencesDictionary)
      .forEach((key) =>
        Object.keys(bundles[language])
          .filter((k) => k.startsWith(mapReferencesDictionary[key]))
          .forEach((k) => {
            const newKey = k.replace(mapReferencesDictionary[key], key);
            if (!bundle[newKey]) {
              bundle[newKey] = bundle[k];
            }
          })
      );

    Object.entries(refKeysMapping)
      .forEach(([key, mappedKey]) => {
        if (bundle[mappedKey] && (!ignoreReferenceIfNotDefault || bundle[key] === undefined || bundle[key] === defaultBundle[key])) {
          bundle[key] = bundle[mappedKey];
        }
      });
  }
  return bundles;
}

/**
 * Extract localization referred in metadata
 *
 * @param metaData Localization metadata
 * @param key Translation key
 */
function getExtractReferredTranslationValue(metaData: JSONLocalization[], key: string): string {
  const translationObj = metaData.find((data) => data.key === key);
  if (translationObj) {
    return translationObj.ref ? getExtractReferredTranslationValue(metaData, translationObj.ref) : translationObj.value || key;
  } else {
    return key;
  }
}

/**
 * Extract localization key referred in metadata
 *
 * @param metaData Localization metadata
 * @param key Translation key
 */
function getExtractReferredTranslationKey(metaData: JSONLocalization[], key: string): string {
  const translationObj = metaData.find((data) => data.key === key);
  return (translationObj && !!translationObj.ref) ? getExtractReferredTranslationKey(metaData, translationObj.ref) : key;
}

/**
 * Extract some data from the provided localization metadata:
 *  - The bundle containing default translations
 *  - The map that associates to every key containing a reference, the key it resolves to
 *  - The map that associated to every key being a dictionary reference, the key it resolves to
 *
 * @param metadata
 */
function processMetadata(metadata: JSONLocalization[]) {
  const defaultTranslations: Record<string, string> = {};
  const keyReferences: Record<string, string> = {};
  const dictionaryReferences: Record<string, string> = {};

  metadata.forEach((localization) => {
    if (localization.value === undefined && localization.ref === undefined) {
      return;
    }
    if (localization.ref) {
      const extractedReference = getExtractReferredTranslationKey(metadata, localization.ref);
      if (localization.dictionary) {
        dictionaryReferences[localization.key] = extractedReference;
      }
      keyReferences[localization.key] = extractedReference;
      defaultTranslations[localization.key] = getExtractReferredTranslationValue(metadata, localization.ref);
    } else {
      defaultTranslations[localization.key] = localization.value!;
    }
  });

  return {defaultTranslations, keyReferences, dictionaryReferences};
}

/**
 * Start the metadata generator in watch mode
 *
 * @param localizationExtractorTarget Target of the localization extractor builder
 * @param context Builder context
 */
function startMetadataGenerator(localizationExtractorTarget: Target, context: BuilderContext) {
  const logger = context.logger.createChild('Metadata Logger');
  const extractorBuild = context.scheduleTarget(localizationExtractorTarget, {watch: true}, {logger});
  return firstValueFrom(
    merge(
      logger.pipe(),
      from(extractorBuild.then((build) => build.result))
    ).pipe(
      filter((entry) => !(entry as LogEntry).message || /Localization metadata bundle extracted/.test((entry as LogEntry).message))
    )
  );
}

/**
 *  Regenerate the metadata if missing
 *
 * @param localizationMetaDataFile Path to the localization metadata file
 * @param localizationExtractorTarget Localization Extractor target configured in the angular.json
 * @param context Ng Builder context
 */
async function checkMetadata(localizationMetaDataFile: string, localizationExtractorTarget: Target, context: BuilderContext): Promise<BuilderOutput | undefined> {
  let metaDataExists = await new Promise<boolean>((resolve) => fs.exists(localizationMetaDataFile, resolve));
  if (!metaDataExists) {
    context.logger.warn(`The file ${localizationMetaDataFile} does not exist, the extractor will be run`);
    context.reportProgress(2, STEP_NUMBER, 'Generating Localization metadata file');
    const extractorBuild = await context.scheduleTarget(localizationExtractorTarget, {watch: false});
    const extractorBuildResult = await extractorBuild.result;
    if (!extractorBuildResult.success) {
      return extractorBuildResult;
    } else {
      metaDataExists = await new Promise<boolean>((resolve) => fs.exists(localizationMetaDataFile, resolve));
      if (!metaDataExists) {
        return {
          success: false,
          error: `The file ${localizationMetaDataFile} has not been generated`
        };
      }
    }
  }
}


export default createBuilder<LocalizationBuilderSchema>(async (options, context): Promise<BuilderOutput> => {
  context.reportRunning();

  // Load Targets to get build options
  context.reportProgress(0, STEP_NUMBER, 'Checking required options');
  let [project, target, configuration] = options.browserTarget.split(':');
  const browserTarget = {project, target, configuration};

  [project, target, configuration] = options.localizationExtracterTarget.split(':');
  const localizationExtractorTarget = {project, target, configuration};

  const [browserTargetRawOptions, localizationExtracterTargetRawOptions, browserTargetBuilder, localizationExtracterTargetBuilder] = await Promise.all([
    context.getTargetOptions(browserTarget),
    context.getTargetOptions(localizationExtractorTarget),
    context.getBuilderNameForTarget(browserTarget),
    context.getBuilderNameForTarget(localizationExtractorTarget)
  ]);
  const [browserTargetOptions, localizationExtracterTargetOptions] = await Promise.all([
    context.validateOptions<{outputPath: string}>(browserTargetRawOptions, browserTargetBuilder),
    context.validateOptions<LocalizationExtractorBuilderSchema>(localizationExtracterTargetRawOptions, localizationExtracterTargetBuilder)
  ]);

  // Check the minimum of mandatory options to the builders
  if (typeof browserTargetOptions.outputPath !== 'string') {
    return {
      success: false,
      error: `The targetBrowser ${options.browserTarget} does not provide 'outputPath' option`
    };
  }
  if (typeof localizationExtracterTargetOptions.outputFile !== 'string') {
    return {
      success: false,
      error: `The targetLocalizationExtracter ${options.localizationExtracterTarget} does not provide 'outputFile' option`
    };
  }

  /** Path to the build output folder */
  const outputPath = path.resolve(context.workspaceRoot, browserTargetOptions.outputPath);
  /** Path to the metadata file */
  const localizationMetaDataFile = path.resolve(context.workspaceRoot, localizationExtracterTargetOptions.outputFile);

  /**
   * Generate translation bundles
   *
   * @param languageToRegenerate language to focus on
   */
  const execute = (languageToRegenerate?: string): BuilderOutput => {
    /** Localization metadata */
    context.reportProgress(1, STEP_NUMBER, 'Checking Metadata');
    const metaData = JSON.parse(fs.readFileSync(localizationMetaDataFile, {encoding: 'utf8'})) as JSONLocalization[];

    context.reportProgress(3, STEP_NUMBER, 'Loading translation files');
    /** List of translation files provided in the current package */
    const appTranslationFiles = options.assets?.length ? getAppTranslationFiles(options.locales, options.assets, context) : {};

    /** Mapping between the language and the custom translation of the package */
    const fileMapping = languageToRegenerate ? {[languageToRegenerate]: appTranslationFiles[languageToRegenerate]} : appTranslationFiles;

    const {defaultTranslations, keyReferences, dictionaryReferences} = processMetadata(metaData);

    context.reportProgress(4, STEP_NUMBER, 'Merging translations');
    try {
      /** List of final translation bundles */
      const bundles = getBundlesPerLanguages(
        languageToRegenerate ? [languageToRegenerate] : options.locales,
        defaultTranslations,
        fileMapping,
        dictionaryReferences,
        options.checkUnusedTranslation,
        context,
        metaData,
        keyReferences,
        options.defaultLanguageMapping,
        options.useMetadataAsDefault,
        options.ignoreReferencesIfNotDefault,
        options.failIfMissingMetadata
      );

      context.reportProgress(5, STEP_NUMBER, 'Writing translations');

      // Write translation files
      const writingFolder = options.outputPath || outputPath;
      if (!fs.existsSync(writingFolder)) {
        fs.mkdirSync(writingFolder, {recursive: true});
      }

      Object.entries(bundles).forEach(([language, bundle]) => {
        const filePath = path.resolve(writingFolder, `${language}.json`);
        context.logger.info(`Writing file to disk ${filePath}`);
        fs.writeFileSync(filePath, JSON.stringify(bundle, Object.keys(bundle).sort(), 2));
      });

      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: typeof error === 'string' ? error : error.message
      };
    }
  };

  /** Timeout to handle nodejs issue (#1970) */
  // eslint-disable-next-line no-undef
  const fsTimeout: {[file: string]: NodeJS.Timeout | number | null} = {};

  /**
   * Run a translation generation and report the result
   *
   * @param language Language that has changed and requires a regeneration
   */
  const generateWithReport = (language?: string) => {
    const result = execute(language);

    if (result.success && language) {
      context.logger.info(`Translations updated based on changes in ${language}`);
    } else if (result.error) {
      context.logger.error(result.error);
    }
    context.reportStatus('Waiting for changes');
    return result;
  };

  /**
   * Run a translation generation for metadata change
   */
  const generateForMetadataChange = () => {
    const METADATA_LABEL = 'metadata';
    if (fsTimeout[METADATA_LABEL]) {
      return;
    }

    fsTimeout[METADATA_LABEL] = setTimeout(() => {
      fsTimeout[METADATA_LABEL] = null;
      const result = generateWithReport();
      if (result.success) {
        context.logger.info('Translations updated based on metadata');
      }
    }, FS_DEBOUNCE_TIME);
  };

  /**
   * Run a translation generation for asset change
   *
   * @param filename File that has changed and requires a regeneration
   * @param fullFilePath
   */
  const generateForAssetsChange = (filename: string, fullFilePath: string) => {
    if (fsTimeout[filename]) {
      return;
    }

    fsTimeout[filename] = setTimeout(() => {
      fsTimeout[filename] = null;
      context.logger.info(`Change triggered in ${fullFilePath}`);
      generateWithReport(path.parse(filename).name);
    }, FS_DEBOUNCE_TIME);
  };

  if (!options.watch) {
    // Execute the generation only once if not watch mode
    const metaDataGeneration = await checkMetadata(localizationMetaDataFile, localizationExtractorTarget, context);
    if (metaDataGeneration && !metaDataGeneration.success) {
      return metaDataGeneration;
    }
    return execute();

  } else {
    const metaDataGeneration = await startMetadataGenerator(localizationExtractorTarget, context);
    const metaDataGenerationResult = metaDataGeneration && metaDataGeneration.output && metaDataGeneration.result;
    if (metaDataGenerationResult && !(metaDataGenerationResult as BuilderOutput).success) {
      return metaDataGenerationResult as BuilderOutput;
    }
    // Execute the generation a first time
    generateWithReport();

    // Create file watchers
    let assetsWatchers: fs.FSWatcher[] = [];
    if (options.assets) {
      const assetsList = (typeof options.assets === 'string' ? [options.assets] : options.assets);
      const posixWorkspaceRoot = context.workspaceRoot.split(path.sep).join(path.posix.sep);
      const filenamesToInclude = `(${options.locales.join('|')}).json`;
      const assets = globbySync(assetsList.map((asset) => path.posix.join(posixWorkspaceRoot, asset, filenamesToInclude)));
      assetsWatchers = assetsWatchers.concat(
        assets.map((asset) => fs.watch(asset, (_eventType, filename) => generateForAssetsChange(filename as string, asset)))
      );
    }

    const metadataWatcher = fs.watch(localizationMetaDataFile, () => generateForMetadataChange());

    context.addTeardown(() => {
      assetsWatchers.forEach((assetsWatcher) => assetsWatcher.close());
      metadataWatcher.close();
    });

    // Exit on watcher failure
    return new Promise<BuilderOutput>((_resolve, reject) => {
      assetsWatchers.forEach((assetsWatcher) => assetsWatcher.once('error', (err) => reject(err)));
      metadataWatcher.once('error', (err) => reject(err));
    });
  }
});
