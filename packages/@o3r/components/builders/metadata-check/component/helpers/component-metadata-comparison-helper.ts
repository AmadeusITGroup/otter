import type {
  MetadataComparator,
} from '@o3r/extractors';
import type {
  ComponentClassOutput,
} from '@o3r/components';

/**
 * Interface describing a component migration element
 */
export interface MigrationComponentData {
  /**
   *  Library name
   */
  libraryName: string;
  /**
   * Component name
   */
  componentName?: string;
  /**
   * Placeholder id
   */
  placeholderId?: string;
}

/**
 * Returns an array of component metadata from a metadata file.
 * To be easily parseable, the properties will be split in separate items of the array.
 * @param content Content of a migration metadata files
 * @example Array conversion
 * ```javascript
 * [{ library: '@o3r/demo', placeholders: [{id : 'id1', description: 'string'}, {id : 'id2', description: 'number'}] }]
 * ```
 * will become :
 * ```javascript
 * [{ library: '@o3r/demo', placeholders: [{id : 'id1', description: 'string'}] }, { library: '@o3r/demo', placeholders: [{id : 'id2', description: 'number'}] }]
 * ```
 */
const getComponentArray = (content: ComponentClassOutput[]): ComponentClassOutput[] => content.flatMap((component) =>
  component.placeholders?.map((prop) => ({ ...component, placeholders: [prop] })) || []
);

const getIdentifier = (component: ComponentClassOutput) => `${component.library}#${component.name}` + (component.placeholders?.length ? ` ${component.placeholders[0].id}` : '');

const isRelevantContentType = (contentType: string) => contentType === 'COMPONENT';

const isMigrationComponentDataMatch = (component: ComponentClassOutput, migrationData: MigrationComponentData) =>
  migrationData.libraryName === component.library
  && (!migrationData.componentName || migrationData.componentName === component.name)
  && (!migrationData.placeholderId || component.placeholders?.[0].id === migrationData.placeholderId);

/**
 * Comparator used to compare one version of component metadata with another
 */
export const componentMetadataComparator: Readonly<MetadataComparator<ComponentClassOutput, MigrationComponentData, ComponentClassOutput[]>> = {
  getArray: getComponentArray,
  getIdentifier,
  isRelevantContentType,
  isMigrationDataMatch: isMigrationComponentDataMatch
} as const;
