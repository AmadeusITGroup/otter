import type {
  MetadataComparator,
} from '@o3r/extractors';
import type {
  JSONLocalization,
  LocalizationMetadata,
} from '@o3r/transloco';

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

/**
 * Returns the localization key identifier
 * @param localization Localization metadata object
 */
const getLocalizationName = (localization: JSONLocalization) => localization.key;

/**
 * Checks if the content type is relevant for localization metadata
 * @param contentType Content type to check
 */
const isRelevantContentType = (contentType: string) => contentType === 'LOCALIZATION';

/**
 * Checks if a localization matches the migration data
 * @param localization Localization metadata object
 * @param migrationData Migration metadata to match against
 */
const isMigrationLocalizationDataMatch = (localization: JSONLocalization, migrationData: MigrationLocalizationMetadata) =>
  getLocalizationName(localization) === migrationData.key;

/**
 * Comparator used to compare one version of localization metadata with another
 */
export const localizationMetadataComparator: Readonly<MetadataComparator<JSONLocalization, MigrationLocalizationMetadata, LocalizationMetadata>> = {
  getArray: getLocalizationArray,
  getIdentifier: getLocalizationName,
  isRelevantContentType,
  isMigrationDataMatch: isMigrationLocalizationDataMatch
} as const;
