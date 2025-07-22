/**
 * Unique identifier of an item in the extracted metadata
 */
export interface ItemIdentifier {
  /**
   * Name of the library where the item is originally from
   */
  library: string;
  /**
   * Name of the item
   */
  name: string;
}
