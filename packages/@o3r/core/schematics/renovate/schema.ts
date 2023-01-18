import type { JsonObject } from '@angular-devkit/core';

export interface NgGenerateRenovateBotSchematicsSchema extends JsonObject {
  /** The name of the Azure Organization to create the bot in. */
  organizationName: string;
}
