/**
 * Represents a mode with an ID and a name.
 */
interface Mode {
  /** The unique identifier for the mode. */
  modeId: string;
  /** The name of the mode. */
  name: string;
}

/**
 * Represents the data for a palette.
 */
export interface PaletteData {
  /** The name of the palette. */
  paletteName: string;
  /** The input for shades. */
  shadesInput: string;
  /** The values that will be filtered out, comma separated. */
  filter: string;
  /** The ID of the collection. */
  collectionId: string;
  /** The ID of the mode. */
  modeId: string;
}

/**
 * Represents a collection with an ID, name, modes, and palettes.
 */
export interface Collection {
  /** The unique identifier for the collection. */
  id: string;
  /** The name of the collection. */
  name: string;
  /** The modes available in the collection. */
  modes: Mode[];
  /** The palettes available in the collection. */
  palettes: string[];
}
