import type {
  SchematicOptionObject,
} from '@o3r/schematics';

export interface NgGenerateRenovateBotSchematicsSchema extends SchematicOptionObject {
  /** The name of the Azure Organization to create the bot in. */
  organizationName: string;
}
