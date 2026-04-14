import type {
  MetadataComparator,
} from '@o3r/extractors';
import type {
  MetadataFact,
} from '../../rules-engine-extractor/helpers';

/**
 * Interface describing a ruleFact migration element
 */
export interface MigrationRuleFactMetadata {
  /** Name of the fact */
  name: string;
}

/**
 * Returns an array of ruleFact metadata from a metadata file.
 * @param content Content of a migration metadata file
 */
const getRuleFactArray = (content: MetadataFact[]) => content;

const getRuleFactName = (ruleFact: MetadataFact) => ruleFact.name;

const isRelevantContentType = (contentType: string) => contentType === 'RULE_FACT';

const isMigrationRuleFactDataMatch = (ruleFact: MetadataFact, migrationData: MigrationRuleFactMetadata) =>
  getRuleFactName(ruleFact) === migrationData.name;

/**
 * Comparator used to compare one version of ruleFact metadata with another
 */
export const ruleFactMetadataComparator: Readonly<MetadataComparator<MetadataFact, MigrationRuleFactMetadata, MetadataFact[]>> = {
  getArray: getRuleFactArray,
  getIdentifier: getRuleFactName,
  isRelevantContentType,
  isMigrationDataMatch: isMigrationRuleFactDataMatch
} as const;
