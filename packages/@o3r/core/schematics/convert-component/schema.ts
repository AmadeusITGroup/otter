import type {JsonObject} from '@angular-devkit/core';
import type {ComponentType} from '@o3r/core';

export interface ConvertToO3rComponentSchematicsSchema extends JsonObject {
  /** Path to the component to convert */
  path: string;

  /** Skip the linter process */
  skipLinter: boolean;

  /** Type of the component */
  componentType: ComponentType;
}
