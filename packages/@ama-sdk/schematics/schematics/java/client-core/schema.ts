import type {
  SchematicOptionObject
} from '@o3r/schematics';

export interface NgGenerateJavaClientCoreSchematicsSchema extends SchematicOptionObject {
  /** Path to the swagger specification used to generate the SDK */
  specPath: string;

  /** Swagger config file */
  specConfigPath?: string | undefined;
}
