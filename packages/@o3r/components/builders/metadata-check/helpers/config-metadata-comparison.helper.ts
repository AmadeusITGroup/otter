import type {
  ComponentConfigOutput,
} from '@o3r/components';
import type {
  MetadataComparator,
} from '@o3r/extractors';

/**
 * Interface describing a config migration element
 */
export interface MigrationConfigData {
  /** Library name */
  libraryName: string;
  /**
   * Configuration name
   */
  configName?: string;
  /**
   * Configuration property name
   */
  propertyName?: string;
}

/**
 * Returns an array of config metadata from a metadata file.
 * To be easily parseable, the properties will be split in separate items of the array.
 * @param content Content of a migration metadata files
 * @example Array conversion
 * ```javascript
 * [{ library: '@o3r/demo', properties: [{name : 'property1', type: 'string'}, {name : 'property2', type: 'number'}] }]
 * ```
 * will become :
 * ```javascript
 * [{ library: '@o3r/demo', properties: [{name : 'property1', type: 'string'}] }, { library: '@o3r/demo', properties: [{name : 'property2', type: 'number'}] }]
 * ```
 */
const getConfigurationArray = (content: ComponentConfigOutput[]): ComponentConfigOutput[] => content.flatMap((config) =>
  config.properties.length > 1
    ? config.properties.map((prop) => ({ ...config, properties: [prop] }))
    : [config]
);

const getConfigurationPropertyName = (config: ComponentConfigOutput) => `${config.library}#${config.name}` + (config.properties.length > 0 ? ` ${config.properties[0].name}` : '');

const isRelevantContentType = (contentType: string) => contentType === 'CONFIG';

const isMigrationConfigurationDataMatch = (config: ComponentConfigOutput, migrationData: MigrationConfigData) =>
  migrationData.libraryName === config.library
  && (!migrationData.configName || migrationData.configName === config.name)
  && (!migrationData.propertyName || config.properties[0]?.name === migrationData.propertyName);

/**
 * Comparator used to compare one version of config metadata with another
 */
export const configMetadataComparator: MetadataComparator<ComponentConfigOutput, MigrationConfigData, ComponentConfigOutput[]> = {
  getArray: getConfigurationArray,
  getIdentifier: getConfigurationPropertyName,
  isRelevantContentType,
  isMigrationDataMatch: isMigrationConfigurationDataMatch
};
