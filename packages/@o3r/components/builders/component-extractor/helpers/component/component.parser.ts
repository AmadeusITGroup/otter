import {logging} from '@angular-devkit/core';
import * as glob from 'globby';
import * as path from 'node:path';
import * as ts from 'typescript';
import {ComponentClassExtractor, ComponentInformation} from './component-class.extractor';
import {ComponentConfigExtractor, ConfigurationInformationWrapper} from './component-config.extractor';
import {ComponentModuleExtractor, ModuleInformation} from './component-module.extractor';

/** Output of a file parsing */
export interface FileParserOutput {
  /** Path to the file parsed */
  file: string;

  /** Component extracted for the file */
  component?: ComponentInformation;

  /** Configuration extracted for the file */
  configuration?: ConfigurationInformationWrapper;

  /** Module extracted for the file */
  module?: ModuleInformation;
}

/** @inheritdoc */
export interface FileParserOutputComponent extends FileParserOutput {
  /** @inheritdoc */
  component: ComponentInformation;
}

/** @inheritdoc */
export interface FileParserOutputConfiguration extends FileParserOutput {
  /** @inheritdoc */
  configuration: ConfigurationInformationWrapper;
}

/** @inheritdoc */
export interface FileParserOutputModule extends FileParserOutput {
  /** @inheritdoc */
  module: ModuleInformation;
}

/** Output of the parser */
export interface ParserOutput {
  /** List of components parsed */
  components: { [file: string]: FileParserOutputComponent };

  /** List of configuration parsed */
  configurations: { [file: string]: FileParserOutputConfiguration };

  /** List of modules parsed */
  modules: { [file: string]: FileParserOutputModule };
}

/**
 * Component extractor parser.
 */
export class ComponentParser {

  /**
   * @param libraryName
   * @param tsconfigPath Path to the tsconfig defining the list of path to parse
   * @param logger Logger
   * @param strictMode
   * @param libraries
   */
  constructor(private libraryName: string, private tsconfigPath: string, private logger: logging.LoggerApi, private strictMode: boolean = false, private libraries: string[] = []) {

  }

  /** Get the list of patterns from tsconfig.json */
  private getPatternsFromTsConfig() {
    const tsconfigResult = ts.readConfigFile(this.tsconfigPath, ts.sys.readFile);

    if (tsconfigResult.error) {
      this.logger.error(tsconfigResult.error.messageText.toString());
      throw new Error(tsconfigResult.error.messageText.toString());
    }

    const include: string[] = [...(tsconfigResult.config.files || []), ...(tsconfigResult.config.include || [])];
    const exclude: string[] = tsconfigResult.config.exclude || [];
    const cwd = path.resolve(path.dirname(this.tsconfigPath), tsconfigResult.config.rootDir || '.');
    return {include, exclude, cwd};
  }

  /** Get the list of file from tsconfig.json */
  private getFilesFromTsConfig() {
    const {include, exclude, cwd} = this.getPatternsFromTsConfig();
    return glob(include, {ignore: exclude, cwd, absolute: true});
  }

  /**
   * Extract a component of a given file
   *
   * @param file Path to the file to extract the component from
   * @param source Typescript SourceFile node of the file
   */
  private getComponent(file: string, source: ts.SourceFile) {
    const componentExtractor = new ComponentClassExtractor(source, this.logger, file);
    return componentExtractor.extract();
  }

  /**
   * Extract a configuration of a given file
   *
   * @param file Path to the file to extract the configuration from
   * @param source Typescript SourceFile node of the file
   * @param checker Typescript TypeChecker of the program
   */
  private getConfiguration(file: string, source: ts.SourceFile, checker: ts.TypeChecker) {
    const configurationFileExtractor = new ComponentConfigExtractor(this.libraryName, this.strictMode, source, this.logger, file, checker, this.libraries);
    const configuration = configurationFileExtractor.extract();
    if (configuration.configurationInformation && this.strictMode) {
      configuration.configurationInformation.properties = configuration.configurationInformation.properties
        .filter((prop) => {
          const res = !(new RegExp(`^${configurationFileExtractor.DEFAULT_UNKNOWN_TYPE}`).test(prop.type));
          if (!res) {
            this.logger.warn(`The Property ${prop.name} from ${configuration.configurationInformation!.name} has unknown type, it will be filtered from metadata.`);
          }
          return res;
        });
    }
    return configuration;
  }

  /**
   * Extract a module of a given file
   *
   * @param file Path to the file to extract the component from
   * @param source Typescript SourceFile node of the file
   */
  private getModule(file: string, source: ts.SourceFile) {
    const moduleExtractor = new ComponentModuleExtractor(source, this.logger, file);
    return moduleExtractor.extract();
  }

  /**
   * Extract the Components and Configurations and modules implemented in each files from tsconfig
   *
   */
  public async parse(): Promise<ParserOutput> {
    const filePaths = await this.getFilesFromTsConfig();
    const program = ts.createProgram(filePaths, {});
    const checker = program.getTypeChecker();

    const components: { [file: string]: FileParserOutputComponent } = {};
    const configurations: { [file: string]: FileParserOutputConfiguration } = {};
    const modules: { [file: string]: FileParserOutputModule } = {};

    // Here for each file we will go through all the extractors because we can't rely on file pattern only
    // We need to perform some logic before figuring out if we are dealing with a config, component or module
    // This approach allow to support the configuration in the same file that the component (not recommended)
    filePaths.forEach((filePath) => {
      this.logger.debug(`Parsing ${filePath}`);
      const source = program.getSourceFile(filePath);
      if (source) {
        const configurationFromSource = this.getConfiguration(filePath, source, checker);
        if (configurationFromSource.configurationInformation || configurationFromSource.nestedConfiguration) {
          configurations[filePath] = {configuration: configurationFromSource, file: filePath};
        }
        const componentFromSource = this.getComponent(filePath, source);
        if (componentFromSource) {
          components[filePath] = {component: componentFromSource, file: filePath};
        }
        const moduleFromSource = this.getModule(filePath, source);
        if (moduleFromSource) {
          modules[filePath] = {module: moduleFromSource, file: filePath};
        }
      }
    });

    return {components, configurations, modules};
  }
}
