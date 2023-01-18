import {JsonObject} from '@angular-devkit/core';

export interface NgGenerateMockSchematicsSchema extends JsonObject {
  /** Name of the api model to generate */
  apiModel: string;

  /** True if the api model has a property id */
  identified: boolean;

  /** Directory in which the mock-factory will be created */
  path: string;

  /** Package name of the sdk */
  packageName: string;
}
