/**
 * Interface for the CmsMetadataData
 * The CMS metadata is the contract between the application and the CMS
 * The application exposes its metadata in order to be used by the CMS
 * This interface defines where to find the metadata files extracted from an application
 */
export interface CmsMetadataData {
  /** Name of the library/application */
  libraryName: string;

  /** Path of the localization file */
  localizationFilePath?: string;

  /** Path of the component file */
  componentFilePath?: string;

  /** Path of the configuration file */
  configurationFilePath?: string;

  /** Path of the style file */
  styleFilePath?: string;

  /** Path of the rules engine file */
  rulesEngineFactsFilePath?: string;

  /** Path of the rules engine file */
  rulesEngineOperatorsFilePath?: string;

  /** Path of the placeholders metadata file */
  placeholdersFilePath?: string;
}
