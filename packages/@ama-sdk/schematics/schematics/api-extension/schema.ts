import { JsonObject } from '@angular-devkit/core';

export interface NgGenerateApiExtensionSchematicsSchema extends JsonObject {
  /** Extension Name */
  name: string;
  /** Type of the core API to extend */
  coreType: 'private' | 'public';
  /** Version of the core API to extend */
  coreVersion: string;
}
