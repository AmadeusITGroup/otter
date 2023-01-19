import { logging } from '@angular-devkit/core';
import { getLibraryCmsMetadata } from '@o3r/extractors';
import type { JSONLocalization, LocalizationMetadata } from '@o3r/localization';
import * as fs from 'node:fs';
import * as glob from 'globby';
import * as path from 'node:path';
import * as ts from 'typescript';

/** List of Angular decorator to look for */
const ANGULAR_ANNOTATION = ['Component', 'Injectable', 'Pipe'];

/** Map of Localization Metadata base on localization key */
export interface LocalizationMetadataAsMap {
  [key: string]: JSONLocalization;
}

/** Localization structure */
export interface LocalizationJsonValue {
  /** Localtion Description */
  description: string;
  /** Determine if the item can have multiple extensions */
  dictionary?: boolean;
  /** Determine if the value has to be overriden */
  referenceData?: boolean;
  /** Localization default value */
  defaultValue?: string;
  /** Tags used for filtering/categorizing */
  tags?: string[];
  /** Reference to other localization */
  $ref?: string;
}

/** Localization file structure */
export interface LocalizationJsonFile {
  [key: string]: LocalizationJsonValue;
}

/** Localization file mapping */
export interface LocalizationFileMap {
  [file: string]: {
    data: LocalizationJsonFile;
    isDependency: boolean;
  };
}

/** Metadata file mapping */
export interface LibraryMetadataMap {
  [libraryMetadataFile: string]: LocalizationMetadata;
}

/**
 * Localization extractor
 */
export class LocalizationExtractor {

  /** TsConfig of the file to base on */
  private tsconfigPath: string;

  private logger: logging.LoggerApi;

  constructor(tsconfigPath: string, logger: logging.LoggerApi) {
    this.tsconfigPath = tsconfigPath;
    this.logger = logger;
  }

  /** Get the list of file from tsconfig.json */
  private getFilesFromTsConfig() {
    const { include, exclude, cwd } = this.getPatternsFromTsConfig();
    return glob(include, {ignore: exclude, cwd});
  }

  /**
   * Return the class node if the class is an angular element
   *
   * @param source Ts file source
   */
  private getAngularClassNode(source: ts.SourceFile): ts.ClassDeclaration[] | undefined {
    const angularItems: ts.ClassDeclaration[] = [];
    source.forEachChild((item) => {
      if (!ts.isClassDeclaration(item)) {
        return;
      }

      let isAngularItem = false;
      item.forEachChild((classItem) => {
        if (isAngularItem || !ts.isDecorator(classItem)) {
          return;
        }
        const text = classItem.getText(source);
        const regexp = new RegExp('^@' + ANGULAR_ANNOTATION.map((e) => `(${e})`).join('|'));
        if (!regexp.test(text)) {
          return;
        }
        isAngularItem = true;
      });

      if (isAngularItem) {
        angularItems.push(item);
      }
    });

    return angularItems.length ? angularItems : undefined;
  }

  /**
   * Retrieve the localization json file from TS Code
   *
   * @param node TSNode of the angular component class
   * @param source Ts file source
   */
  private getLocalizationFileFromAngularElement(node: ts.ClassDeclaration, source: ts.SourceFile): string[] | undefined {
    const localizationPaths: string[] = [];
    node.forEachChild((item) => {
      if (!ts.isPropertyDeclaration(item)) {
        return;
      }

      item.forEachChild((decorator) => {
        if (!ts.isDecorator(decorator)) {
          return;
        }

        const text = decorator.getText(source);
        const result = /^@Localization *\( *['"](.*)['"] *\)/.exec(text);
        if (!result || !result[1]) {
          return;
        }

        localizationPaths.push(result[1]);
      });
    });

    return localizationPaths.length ? localizationPaths : undefined;
  }

  /**
   * Get the list of referenced translation files
   *
   * @param localizationFileContent JSON content of a location file
   * @param localizationFilePath Path of the localization file
   */
  private getReferencedFiles(localizationFileContent: LocalizationJsonFile, localizationFilePath?: string): string[] | undefined {
    const folder = localizationFilePath ? path.dirname(localizationFilePath) : undefined;
    const referencedFiles = Object.keys(localizationFileContent)
      .filter((key) => !!localizationFileContent[key].$ref)
      .map((key) => ({key, ref: localizationFileContent[key].$ref!.split('#/')[0]}))
      .filter(({key, ref}) => {
        const res = !!ref;
        if (!res) {
          this.logger.error(`The reference (${ref}) of the key ${key} is invalid, it will be ignored`);
        }
        return res;
      })
      .map(({ref}) => {
        if (!ref.startsWith('.')) {
          try {
            return require.resolve(ref);
          } catch {
            // Should be a local file
          }
        }
        return folder ? path.resolve(folder, ref) : ref;
      });

    return referencedFiles.length ? referencedFiles : undefined;
  }

  /**
   * Read a localization file
   *
   * @param locFile Path to the localization file
   */
  private readLocalizationFile(locFile: string) {
    return new Promise<LocalizationJsonFile>((resolve, reject) => fs.readFile(locFile, 'utf8', (err, data) => err ? reject(err) : resolve(JSON.parse(data))));
  }

  /**
   * Read a metadata file
   *
   * @param metadataFile Path to the metadata file
   */
  private readMetadataFile(metadataFile: string) {
    return new Promise<LocalizationMetadata>((resolve, reject) => fs.readFile(metadataFile, 'utf8', (err, data) => err ? reject(err) : resolve(JSON.parse(data))));
  }

  /**
   * Genarate a metadata item from a localization item
   *
   * @param loc Localization item
   * @param key Key of the localization
   */
  private generateMetadataItemFromLocalization(loc: LocalizationJsonValue, key: string): JSONLocalization {
    const res: JSONLocalization = {
      description: loc.description,
      dictionary: !!loc.dictionary,
      referenceData: !!loc.referenceData,
      key
    };

    if (loc.defaultValue || loc.defaultValue === '') {
      res.value = loc.defaultValue;
    }

    if (loc.tags) {
      res.tags = loc.tags;
    }

    if (loc.$ref) {
      res.ref = loc.$ref.split('#/')[1];
    }

    if (typeof loc.defaultValue === 'undefined' && typeof loc.$ref === 'undefined' && !loc.dictionary) {
      this.logger.error(`${key} has no default value or $ref defined`);
      throw new Error(`${key} has no default value or $ref defined`);
    }

    return res;
  }

  /**
   * Compares two JSONLocalization object by their keys and returns the result of the string comparison
   *
   * @param a JSONLocalization
   * @param b JSONLocalization
   */
  private compareKeys(a: JSONLocalization, b: JSONLocalization): number {
    const keyA = a.key.toUpperCase();
    const keyB = b.key.toUpperCase();
    if (keyA < keyB) {
      return -1;
    }
    if (keyA > keyB) {
      return 1;
    }
    return 0;
  }

  /** Get the list of patterns from tsconfig.json */
  public getPatternsFromTsConfig() {
    const tsconfigResult = ts.readConfigFile(this.tsconfigPath, ts.sys.readFile);

    if (tsconfigResult.error) {
      this.logger.error(tsconfigResult.error.messageText.toString());
      throw new Error(tsconfigResult.error.messageText.toString());
    }

    const include: string[] = [...(tsconfigResult.config.files || []), ...(tsconfigResult.config.include || [])];
    const exclude: string[] = tsconfigResult.config.exclude || [];
    const cwd = path.resolve(path.dirname(this.tsconfigPath), tsconfigResult.config.rootDir || '.');
    return {include, exclude, cwd };
  }

  /**
   * Generate the localization mapping for a list of files
   *
   * @param localizationFiles Localization files to load
   * @param alreadyLoadedFiles List of localization files already loadded
   * @param isDependency Determine if the list of files are dependencies of others
   */
  public async getLocalizationMap(localizationFiles: string[], alreadyLoadedFiles: string[] = [], isDependency = false): Promise<LocalizationFileMap> {
    const mapLocalization: LocalizationFileMap = {};
    for (const file of localizationFiles) {
      mapLocalization[file] = {
        data: await this.readLocalizationFile(file),
        isDependency
      };
    }

    const references = localizationFiles
      .map((file) => this.getReferencedFiles(mapLocalization[file].data, file))
      .filter((refs): refs is string[] => !!refs)
      .reduce((acc, refs) => {
        acc.push(...refs.filter((ref) => localizationFiles.indexOf(ref) === -1 && alreadyLoadedFiles.indexOf(ref) === -1));
        return acc;
      }, []);

    if (references.length) {
      return {
        ...mapLocalization,
        ...await this.getLocalizationMap(references, [...localizationFiles, ...alreadyLoadedFiles], true)
      };
    }

    return mapLocalization;
  }

  /**
   * Extract the localization mapping from a tsconfig file
   *
   * @param extraLocalizationFiles Additional translations to add
   */
  public async extractLocalizationFromTsConfig(extraLocalizationFiles: string[] = []): Promise<LocalizationFileMap> {
    const files = await this.getFilesFromTsConfig();
    const tsFiles = files
      .filter((file) => /\.ts$/.test(file))
      .map((file) => path.join(path.dirname(this.tsconfigPath), file));

    const program = ts.createProgram(tsFiles, {});
    const localizationFiles = tsFiles
      .map((file) => ({file, source: program.getSourceFile(file)}))
      .map(({ file, source }) => ({ file, classes: source && this.getAngularClassNode(source), source}))
      .filter(({ classes, source }) => !!classes && !!source)
      .map(({file, classes, source}) => classes!
        .map((classItem) => this.getLocalizationFileFromAngularElement(classItem, source!))
        .filter((locFiles): locFiles is string[] => !!locFiles)
        .reduce((acc: string[], locFiles) => {
          acc.push(...locFiles.filter((f) => acc.indexOf(f) === -1));
          return acc;
        }, [])
        .map((locFile) => path.resolve(path.dirname(file), locFile))
      )
      .reduce((acc: string[], locFiles) => {
        acc.push(...locFiles.filter((f) => acc.indexOf(f) === -1));
        return acc;
      }, []);

    localizationFiles.push(...extraLocalizationFiles.filter((file) => localizationFiles.indexOf(file) === -1));

    return this.getLocalizationMap(localizationFiles);
  }

  /**
   * Retrieve metadata from libraries
   *
   * @param libraries Libraries on which the project depend
   */
  public async getMetadataFromLibraries(libraries: string[]) {
    const metadataFiles = libraries
      .map((lib) => getLibraryCmsMetadata(lib).localizationFilePath)
      .filter((localizationFilePath): localizationFilePath is string => !!localizationFilePath);

    return this.getMetadataFromFiles(metadataFiles);
  }

  /**
   * Retrieve metadata from metadata files
   *
   * @param metadataFiles Metadata files
   */
  public async getMetadataFromFiles(metadataFiles: string[]) {
    const metadataMap: LibraryMetadataMap = {};
    for (const file of metadataFiles) {
      metadataMap[file] = await this.readMetadataFile(file);
    }

    return metadataMap;
  }

  /**
   * Generate metadata from localization and library metadata mappings
   *
   * @param localizationMap Map of localization files
   * @param options Option of generation
   * @param options.ignoreDuplicateKeys
   * @param options.libraryMetadata
   * @param options.outputFile
   * @param options.sortKeys
   */
  public generateMetadata(localizationMap: LocalizationFileMap, options: {
    ignoreDuplicateKeys: boolean;
    libraryMetadata: LibraryMetadataMap;
    outputFile: string;
    sortKeys: boolean;
  }): LocalizationMetadata {
    const metadata: LocalizationMetadataAsMap = {};

    const addMetadata = (data: JSONLocalization, origin?: string) => {
      if (metadata[data.key]) {
        if (options.ignoreDuplicateKeys) {
          this.logger.warn(
            `The key ${data.key} from ${origin!} will override the previous value (${metadata[data.key].value || 'ref ' + metadata[data.key].ref!} -> ${data.value || 'ref ' + data.ref!})`
          );
        } else {
          this.logger.error(
            `The key ${data.key} from ${origin!} try to override the previous value (${metadata[data.key].value || 'ref ' + metadata[data.key].ref!} -> ${data.value || 'ref ' + data.ref!})`
          );
          throw new Error('Duplicate key');
        }
      }

      metadata[data.key] = data;
    };

    Object.keys(options.libraryMetadata)
      .forEach((lib) =>
        options.libraryMetadata[lib].forEach((dataLoc) => addMetadata(dataLoc, lib))
      );

    Object.keys(localizationMap)
      .forEach((locFile) =>
        Object.keys(localizationMap[locFile].data)
          .forEach((locKey) => addMetadata(this.generateMetadataItemFromLocalization(localizationMap[locFile].data[locKey], locKey), locFile))
      );

    const localizationMetadata = Object.keys(metadata).map((k) => metadata[k]);
    return options.sortKeys ? localizationMetadata.sort((a, b) => this.compareKeys(a, b)) : localizationMetadata;
  }
}
