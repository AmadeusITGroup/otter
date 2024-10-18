import type {
  SchematicOptionObject
} from '@o3r/schematics';

export interface NgGeneratePlaywrightScenarioSchematicsSchema extends SchematicOptionObject {
  /** Project name */
  projectName?: string | undefined;

  /** Page name */
  name: string;

  /** Directory containing the playwright scenarios */
  path?: string | undefined;
}
