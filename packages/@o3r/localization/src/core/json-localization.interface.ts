/** Object mapping of a localized string */
export interface JSONLocalization {
  /** The key of the localized string. */
  key: string;
  /** The description of the key used to give some context to the translators. */
  description: string;
  /** True means that the key will be mapped to a dictionary in the CMS. */
  dictionary: boolean;
  /** Tags used to filter/categorize localization strings */
  tags?: string[];
  /** The default value for EN language. It is mandatory if dictionary is set to false. */
  value?: string;
  /** Reference to another key. */
  ref?: string;
}

/** Localization Metadata file structure */
export type LocalizationMetadata = JSONLocalization[];
