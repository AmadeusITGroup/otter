import { JsonObject } from '@angular-devkit/core';

export interface NgGenerateJavaClientCoreSchematicsSchema extends JsonObject {
  /** Path to the swagger specification used to generate the SDK */
  swaggerSpecPath: string;

  /** Swagger config file */
  swaggerConfigPath: string | null;
}
