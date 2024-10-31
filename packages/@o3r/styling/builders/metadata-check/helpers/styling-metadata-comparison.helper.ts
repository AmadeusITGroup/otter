import type {
  MetadataComparator
} from '@o3r/extractors';
import type {
  CssMetadata,
  CssVariable
} from '@o3r/styling';

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
const getCssVariablesArray = (content: CssMetadata): CssVariable[] => Object.keys(content.variables).map((name) => ({ ...content.variables[name], name }));

const getCssVariableName = (cssVariable: CssVariable) => cssVariable.name;

const isMigrationCssVariableDataMatch = (cssVariable: CssVariable, migrationData: MigrationStylingData, metadataType: string) =>
  metadataType === 'STYLE' && getCssVariableName(cssVariable) === migrationData.name;

/**
 * Comparator used to compare one version of styling metadata with another
 */
export const stylingMetadataComparator: MetadataComparator<CssVariable, MigrationStylingData, CssMetadata> = {
  getArray: getCssVariablesArray,
  getIdentifier: getCssVariableName,
  isMigrationDataMatch: isMigrationCssVariableDataMatch
};
