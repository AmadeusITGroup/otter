import type { JSONLocalization, LocalizationMetadata } from '@o3r/localization';
import type { MetadataComparator } from '@o3r/extractors';

/**
 * Interface describing a localization migration element
 */
export interface MigrationLocalizationMetadata {
  /** Localization key */
  key: string;
}

/**
 * Returns an array of localization metadata from a metadata file.
 * @param content Content of a migration metadata file
 */
const getLocalizationArray = (content: LocalizationMetadata) => content;

const getLocalizationName = (localization: JSONLocalization) => localization.key;

const isMigrationLocalizationDataMatch = (localization: JSONLocalization, migrationData: MigrationLocalizationMetadata, metadataType: string) =>
  metadataType === 'LOCALIZATION' && getLocalizationName(localization) === migrationData.key;


/**
 * Comparator used to compare one version of localization metadata with another
 */
export const localizationMetadataComparator: MetadataComparator<JSONLocalization, MigrationLocalizationMetadata, LocalizationMetadata> = {
  getArray: getLocalizationArray,
  getIdentifier: getLocalizationName,
  isMigrationDataMatch: isMigrationLocalizationDataMatch
};
