import { logging } from '@angular-devkit/core';
import type {
  ComponentClassOutput,
  ComponentConfigOutput,
  ComponentOutput,
  ComponentStructure, ConfigProperty, PlaceholdersMetadata
} from '@o3r/components';
import { CmsMedataData, getLibraryCmsMetadata } from '@o3r/extractors';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ComponentExtractorBuilderSchema } from '../../index';
import { ComponentInformation } from './component-class.extractor';
import { ConfigurationInformation, ConfigurationInformationWrapper } from './component-config.extractor';
import { ParserOutput } from './component.parser';

/**
 * Extracts components metadata
 */
export class ComponentExtractor {

  /** List of libraries to extract component metadata from */
  private libraries: CmsMedataData[];

  /** List of loaded libraries configurations */
  private libConfigurations?: ComponentConfigOutput[][];

  /** List of the loaded libraries component outputs*/
  private libComponentClassOutputs?: ComponentClassOutput[][];

  /**
   * @param libraryName The name of the library/app on which the extractor is run
   * @param libraries List of libraries to extract metadata from
   * @param logger
   * @param workspaceRoot
   * @param strictMode
   */
  constructor(private libraryName: string, libraries: string[], private logger: logging.LoggerApi, private workspaceRoot: string, private strictMode = false) {
    this.libraries = libraries
      .map((lib) => getLibraryCmsMetadata(lib, ''));
  }

  /**
   * Load configuration files from libraries.
   *
   */
  private async loadLibraryConfigurations() {
    const libConfigurations = await Promise.all(this.libraries
      .filter((lib) => !!lib.configurationFilePath)
      .map((lib) => fs.promises.readFile(lib.configurationFilePath!, 'utf8'))
    );
    this.libConfigurations = libConfigurations.map((data) => JSON.parse(data) as ComponentConfigOutput[]);
  }

  /**
   * Load component classes files from libraries.
   *
   */
  private async loadLibraryComponentClassOutputs() {
    const libComponentClassOutputs = await Promise.all(this.libraries
      .filter((lib) => !!lib.componentFilePath)
      .map((lib) => fs.promises.readFile(lib.componentFilePath!, 'utf8'))
    );
    this.libComponentClassOutputs = libComponentClassOutputs.map((data) => JSON.parse(data) as ComponentClassOutput[]);
  }

  /**
   * Indicates if the given component is referencing configuration from a library.
   *
   * @param component
   */
  private isLibConfigRef(component: ComponentInformation) {
    return this.libConfigurations
      && this.libConfigurations.some((lib) => lib.some((c) => c.library === component.configPath && c.name === component.configName));
  }

  /**
   * Returns a ComponentConfigOutput model built using the given ConfigurationInformation, filePath and type as well as the library being processed.
   *
   * @param configuration
   * @param filePath
   * @param type
   */
  private createComponentConfigOutput(configuration: ConfigurationInformation, filePath: string, type: ComponentStructure): ComponentConfigOutput {
    return {
      library: this.libraryName,
      name: configuration.name,
      title: configuration.title,
      description: configuration.description,
      path: path.relative(this.workspaceRoot, filePath),
      runtime: configuration.runtime,
      tags: configuration.tags,
      categories: configuration.categories,
      type,
      properties: configuration.properties
    };
  }

  /**
   * Return a hash of the config output without the path
   *
   * @param config
   */
  private hashConfiguration(config: ComponentConfigOutput) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { path: configFilePath, ...rest } = config;
    return Buffer.from(JSON.stringify(rest)).toString('base64');
  }

  /**
   * Add NestedConfiguration to map
   *
   * @param nestedConfigurations Map
   * @param configurationInformationWrapper configurations to be added
   * @param filePath
   */
  private addNestedConfigToMap(nestedConfigurations: Map<string, ComponentConfigOutput>, configurationInformationWrapper: ConfigurationInformationWrapper, filePath: string) {
    configurationInformationWrapper.nestedConfiguration.forEach(
      (nestedConfiguration) => {
        const value = this.createComponentConfigOutput(nestedConfiguration, filePath, 'NESTED_ELEMENT');
        nestedConfigurations.set(this.hashConfiguration(value), value);
      }
    );
    return nestedConfigurations;
  }

  /**
   * Consolidate the configuration data to the final format.
   *
   * @param parsedData Data extracted from the source code
   */
  private consolidateConfig(parsedData: ParserOutput): ComponentConfigOutput[] {
    const nestedConfigurations = new Map<string, ComponentConfigOutput>();
    const configMap: Map<string, ComponentConfigOutput> = new Map();

    // extract Application type configs that are not supposed to be bound to a component
    Object.entries(parsedData.configurations).forEach(([filePath, configuration]) => {
      const configurationInformation = configuration.configuration.configurationInformation;
      if (configurationInformation && configurationInformation.isApplicationConfig) {
        this.logger.info(`Processing standalone APPLICATION config: ${configurationInformation.name}.`);
        configMap.set(filePath, this.createComponentConfigOutput(configurationInformation, filePath, 'APPLICATION'));
      }
      this.addNestedConfigToMap(nestedConfigurations, configuration.configuration, filePath);
    });

    Object.keys(parsedData.components)
      .map((componentUrl): ComponentConfigOutput | undefined => {
        const parsedItemRef = parsedData.components[componentUrl];
        const configRef = parsedItemRef.component.configPath ? parsedData.configurations[parsedItemRef.component.configPath] : undefined;
        if (!configRef) {
          if (this.isLibConfigRef(parsedItemRef.component)) {
            this.logger.info(`${parsedItemRef.component.name} is referencing a configuration in ${parsedItemRef.component.configPath!}`);
            return;
          } else {
            this.logger.warn(`No Configuration for ${parsedItemRef.component.name}, the component will be skipped`);
            return;
          }
        }
        // We add all nested config in a dedicated map here
        this.addNestedConfigToMap(nestedConfigurations, configRef.configuration, configRef.file);
        if (!configRef.configuration.configurationInformation) {
          return;
        }
        return this.createComponentConfigOutput(configRef.configuration.configurationInformation, configRef.file, parsedItemRef.component.type);
      }).filter((config): config is ComponentConfigOutput => !!config)
      .forEach((config) =>
        // Here we filter any duplicates using the path, it's possible to reuse a config for 2 components, but we don't it 2 times in the output
        configMap.set(config.path, config)
      );
    return [...Array.from(configMap.values()), ...Array.from(nestedConfigurations.values())];
  }

  /**
   * Consolidate the components data to the final format
   *
   * @param parsedData Data extracted from the source code
   * @param placeholdersMetadataFile
   */
  private consolidateComponents(parsedData: ParserOutput, placeholdersMetadataFile?: PlaceholdersMetadata[]): ComponentClassOutput[] {
    const library = this.libraryName;

    const res: ComponentClassOutput[] = Object.keys(parsedData.components)
      .map((componentUrl): ComponentClassOutput => {
        const parsedItemRef = parsedData.components[componentUrl];
        const context = parsedItemRef.component.contextName ? {
          library,
          name: parsedItemRef.component.contextName
        } : undefined;
        const config = parsedItemRef.component.configName ? {
          library: this.isLibConfigRef(parsedItemRef.component) ? parsedItemRef.component.configPath! : library,
          name: parsedItemRef.component.configName
        } : undefined;
        return {
          library,
          name: parsedItemRef.component.name,
          path: path.relative(this.workspaceRoot, parsedItemRef.file),
          selector: parsedItemRef.component.selector || '',
          type: parsedItemRef.component.type,
          context,
          config,
          linkableToRuleset: parsedItemRef.component.linkableToRuleset
        };

      });
    return placeholdersMetadataFile ? this.addPlaceholdersToComponent(res, placeholdersMetadataFile) : res;
  }

  /**
   * Merge placeholders metadata information into the components metadata
   *
   * @param componentClassOutputs
   * @param placeholdersMetadata
   * @private
   */
  private addPlaceholdersToComponent(componentClassOutputs: ComponentClassOutput[], placeholdersMetadata: PlaceholdersMetadata[]): ComponentClassOutput[] {
    return componentClassOutputs.map((componentClassOutput) => {
      const placeholdersToBeAdded: PlaceholdersMetadata | undefined = placeholdersMetadata.find(placeholderMetadata =>
        placeholderMetadata.name === componentClassOutput.name && placeholderMetadata.library === placeholderMetadata.library
      );
      return placeholdersToBeAdded ? {...componentClassOutput, placeholders: placeholdersToBeAdded.placeholders} : componentClassOutput;
    });
  }

  /**
   * Filters out config not supported by CMS
   *
   * @param configs
   * @param options
   * @private
   */
  private filterIncompatibleConfig(configs: ComponentConfigOutput[], options: ComponentExtractorBuilderSchema): ComponentConfigOutput[] {
    // Safe guard since on CMS side the type is an enum
    const supportedTypes = new Set<ComponentStructure>(['PAGE', 'BLOCK', 'COMPONENT', 'APPLICATION', 'NESTED_ELEMENT', 'EXPOSED_COMPONENT']);
    if (!options.exposedComponentSupport) {
      supportedTypes.delete('EXPOSED_COMPONENT');
    }
    return configs.reduce((acc: ComponentConfigOutput[], config) => {
      if (!supportedTypes.has(config.type)) {
        this.logger.warn(`Config type "${config.type}" is not supported for ${config.library}#${config.name}. Excluding it`);
        return acc;
      }

      const { propertiesWithDefaultValue, propertiesWithoutDefaultValue } = config.properties.reduce((properties: {
        propertiesWithDefaultValue: ConfigProperty[];
        propertiesWithoutDefaultValue: ConfigProperty[];
      }, property) => {
        if (property.values === undefined && property.value === undefined) {
          properties.propertiesWithoutDefaultValue = properties.propertiesWithoutDefaultValue.concat(property);
        } else {
          properties.propertiesWithDefaultValue = properties.propertiesWithDefaultValue.concat(property);
        }
        return properties;
      }, {
        propertiesWithDefaultValue: [],
        propertiesWithoutDefaultValue: []
      });
      if (propertiesWithoutDefaultValue.length) {
        const message = `"${config.library}#${config.name}" has no default value for ${
          propertiesWithoutDefaultValue.map((prop) => prop.name).join(', ')
        }. Excluding ${propertiesWithoutDefaultValue.length > 1 ? 'them' : 'it'}`;
        if (!this.strictMode) {
          this.logger.warn(message);
        } else {
          throw new Error(message);
        }
        const configWithoutIncompatibleProperties: ComponentConfigOutput = {
          ...config,
          properties: propertiesWithDefaultValue
        };
        return acc.concat(configWithoutIncompatibleProperties);
      }

      return acc.concat(config);
    }, []);

  }

  /**
   * Extract components metadata from a parser output
   *
   * @param parserOutput Data extracted from the source code
   * @param options
   */
  public async extract(parserOutput: ParserOutput, options: ComponentExtractorBuilderSchema): Promise<ComponentOutput> {
    await this.loadLibraryConfigurations();
    let configurations = this.consolidateConfig(parserOutput);
    (this.libConfigurations || [])
      .forEach((configs) => configurations.push(...configs));
    configurations = this.filterIncompatibleConfig(configurations, options);
    configurations = Array.from((new Map(configurations.map((c) => {
      return [this.hashConfiguration(c), c];
    }))).values());

    let placeholderMetadataFile;
    if (options.placeholdersMetadataFilePath) {
      placeholderMetadataFile = JSON.parse(await new Promise<string>((resolve, reject) =>
        fs.readFile(options.placeholdersMetadataFilePath!, 'utf8', (err, content) => err ? reject(err) : resolve(content)))) as PlaceholdersMetadata[];
    }

    await this.loadLibraryComponentClassOutputs();
    const components = this.consolidateComponents(parserOutput, placeholderMetadataFile);
    (this.libComponentClassOutputs || []).forEach((componentClassOutputs)=> components.push(...componentClassOutputs));

    return {configurations, components};
  }
}
