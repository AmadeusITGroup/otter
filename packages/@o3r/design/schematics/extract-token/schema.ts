import type { SchematicOptionObject } from '@o3r/schematics';

export interface ExtractTokenSchematicsSchema extends SchematicOptionObject {
  /**
   * Include the tags in the original Sass file
   * @default true
   */
  includeTags?: boolean | { startTag: string; endTag: string };

  /** List of file pattern of component theme files */
  componentFilePatterns: string[];

  /** Level from which to flatten the token nodes */
  flattenLevel?: number;
}
