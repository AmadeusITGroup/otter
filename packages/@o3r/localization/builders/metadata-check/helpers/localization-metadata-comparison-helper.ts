import type {
  MetadataComparator,
} from '@o3r/extractors';
import type {
  JSONLocalization,
  LocalizationMetadata,
} from '@o3r/localization';

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

const isRelevantContentType = (contentType: string) => contentType === 'LOCALIZATION';

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
