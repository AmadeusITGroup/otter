/**
 * Model for API configurations
 */
export interface ApiConfiguration {
  /**
   * The path to a swagger file that already contains all the informative fields. (or directly the content as json)
   * The script will only add tags, parameters, paths and definitions.
   * Every properties that are redefined at API configuration level will
   * override the ones from the global file.
   */
  swaggerTemplate: object | string | string[];

  /**
   * List of API products to bundle with this API.
   */
  products: string[];

  /**
   * List of additional specifications paths
   */
  additionalSpecs?: string[];

  /** List of product folders */
  productFolders?: string[];
}
