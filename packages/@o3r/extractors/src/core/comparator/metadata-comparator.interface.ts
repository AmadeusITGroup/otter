import type { JsonObject } from '@angular-devkit/core';
import type { SupportedPackageManagers } from '@o3r/schematics';
import type { CmsMetadataData } from '../../interfaces';

/**
 * Interface of the comparator used to compare 2 different versions of the same metadata file.
 */
export interface MetadataComparator<MetadataItem, MigrationMetadataItem, MetadataFile> {
  /**
   * Get an array of metadata items to parse a metadata file content.
   * @param content Content of a metadata file
   */
  getArray: (content: MetadataFile) => MetadataItem[];

  /**
   * Get the identifier of a metadata item.
   * @param item Metadata item
   */
  getIdentifier: (item: MetadataItem) => string;

  /**
   * Compares 2 metadata items.
   * @param item1 Metadata item
   * @param item2 Metadata item to compare with
   */
  isSame?: (item1: MetadataItem, item2: MetadataItem) => boolean;

  /**
   * Returns true if a migration item matches a metadata item.
   * @param metadataItem Metadata item
   * @param migrationItem Migration item
   * @param metadataType Type of the metadata
   */
  isMigrationDataMatch: (metadataItem: MetadataItem, migrationItem: MigrationMetadataItem, metadataType: string) => boolean;
}

/**
 * Migration item used to document a migration
 */
export interface MigrationData<MigrationMetadataItem> {
  /** Metadata type */
  contentType: string;

  /** Previous metadata value */
  before: MigrationMetadataItem;

  /** New metadata value */
  after?: MigrationMetadataItem;
}

/**
 * Migration file data structure.
 */
export interface MigrationFile<MigrationMetadataItem> {
  /** Version of the documented migration */
  version: string;

  /** Map of dependencies for which the migration scripts should be checked with their associated version */
  libraries?: Record<string, string>;

  /** List of all the changes contained in this version */
  changes: MigrationData<MigrationMetadataItem>[];
}

export type MigrationCheckGranularity = 'major' | 'minor';

/**
 * Generic metadata builder options
 */
export interface MigrationMetadataCheckBuilderOptions extends JsonObject {
  /** Path to the folder containing the migration metadata. */
  migrationDataPath: string | string[];

  /** Granularity of the migration check. */
  granularity: MigrationCheckGranularity;

  /** Whether breaking changes are allowed.*/
  allowBreakingChanges: boolean;

  /** Override of the package manager, otherwise it will be determined from the project. */
  packageManager: SupportedPackageManagers;

  /** Path of the metadata file to check */
  metadataPath: string;

  /** Entry to check for previous metadata in the `package.json` file under `cmsMetadata`. */
  packageJsonEntry: keyof Omit<CmsMetadataData, 'libraryName'>;
}
