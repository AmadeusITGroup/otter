import { JsonObject } from '@angular-devkit/core';

export interface NgGenerateJavaClientCoreSchematicsSchema extends JsonObject {
  /** Path to the swagger specification used to generate the SDK */
  specPath: string;

  /** Swagger config file */
  specConfigPath: string;
}
