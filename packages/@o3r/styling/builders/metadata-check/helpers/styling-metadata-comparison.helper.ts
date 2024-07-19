import type { CssMetadata, CssVariable } from '@o3r/styling';
import type { MetadataComparator } from '@o3r/extractors';

/**
 * Interface describing a style migration element
 */
export interface MigrationStylingData {
  /** CSS variable name */
  name: string;
}
/**
 * Returns an array of styling metadata from a metadata file.
 * @param content Content of a migration metadata file
 */
const getCssVariablesArray = (content: CssMetadata): CssVariable[] => Object.values(content.variables);

const getCssVariableName = (cssVariable: CssVariable) => cssVariable.name;

const isMigrationCssVariableDataMatch = (cssVariable: CssVariable, migrationData: MigrationStylingData) => getCssVariableName(cssVariable) === migrationData.name;

/**
 * Comparator used to compare one version of styling metadata with another
 */
export const stylingMetadataComparator: MetadataComparator<CssVariable, MigrationStylingData, CssMetadata> = {
  getArray: getCssVariablesArray,
  getIdentifier: getCssVariableName,
  isMigrationDataMatch: isMigrationCssVariableDataMatch
};
